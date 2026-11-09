#!/usr/bin/env python3
"""One-time (re-runnable) importer: Pressbooks XHTML export + the "Reviewing Through Practice"
docx  ->  editable Markdown in content/.

    python3 scripts/import_pressbooks.py \
        --xhtml source/The-Question-Method-of-Legal-Research.html \
        --rtp   source/Reviewing_Through_Practice_FULL_Ch1-17.docx

After the first import the Markdown in content/ is the source of truth. Re-running this
script OVERWRITES content/ -- only do it if you want to start over from the export.

What it does (every change is logged to content/_archive/IMPORT-LOG.md)
  * splits the export into front matter, 17 chapters and appendices
  * REORDERS Part II so the chapters sit in the order the exercise numbers, the Appendix H
    sample answers, the cross-references and the interactive site already use
    (10 Ethics, 11 Dockets, 12 Legislative History, 13 Advanced Administrative, 14 Practice-
    Specific, 15 GenAI, 16 NextGen, 17 Scholarship). The Pressbooks export lists them in a
    different physical order.
  * normalises heading levels (Pressbooks exports sections as <h1>)
  * swaps each chapter's "Reviewing Through Practice" for the new exercise set (docx) and
    moves it to the template position, after Key Takeaways
  * turns bracketed production notes / figure placeholders / missing pincites into visible
    draft flags (rendered as yellow chips; set "draft": false in book.json to hide them)
  * applies the embed plan in book.json (insert an interactive, or replace a section)
  * archives every piece of removed text in content/_archive/removed-text.md
"""
import argparse, html, json, os, re, subprocess, sys
import lxml.html

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CONTENT = os.path.join(ROOT, "content")

RENUM = {}        # old (registry) chapter number -> new number, from book.json "renumber"


def renumber(t):
    """Translate chapter/exercise/figure numbers from the export's (registry) numbering to the
    book's current order. One pass, so 10->12 and 12->10 cannot chain."""
    if not RENUM or not t:
        return t
    def f_ch(m):
        n = int(m.group(2))
        return m.group(1) + str(RENUM.get(n, n))
    t = re.sub(r"(\b(?:Chapters?|Ch\.)(?:\s|&nbsp;|\u00a0)+)(\d{1,2})\b", f_ch, t)
    def f_ex(m):
        n = int(m.group(2))
        return m.group(1) + str(RENUM.get(n, n)) + m.group(3)
    t = re.sub(r"(\b(?:Exercises?|Figure) )(\d{1,2})(\.\d)", f_ex, t)
    t = re.sub(r"(#ex-)(\d{1,2})(-\d)", lambda m: m.group(1) + str(RENUM.get(int(m.group(2)), int(m.group(2)))) + m.group(3), t)
    return t


def renumber_blocks(blocks):
    for b in blocks:
        b.md = renumber(b.md)
        b.title = renumber(b.title)
    return blocks


ID_MAP = {}       # pressbooks div id -> relative url from a depth-1 page (ch-N/, appendices/, front/)
LOG = []          # (kind, where, what)
ARCHIVE = []      # (where, title, reason, text)


def log(kind, where, what):
    LOG.append((kind, where, what))


# --------------------------------------------------------------------------------------
# Markdown helpers
# --------------------------------------------------------------------------------------
FLAG_RE = re.compile(
    r"(\[(?:Production note|Figure [A-Z0-9.]+|pincite|pin|pull the[^\]]*|_{2,} [^\]]*)[^\]]*\])", re.I)
ESC = {"\\": "\\\\", "*": "\\*", "_": "\\_", "[": "\\[", "]": "\\]", "<": "\\<", ">": "\\>",
       "`": "\\`", "$": "\\$", "^": "\\^", "~": "\\~", "|": "\\|", "@": "\\@"}


def esc(t):
    return "".join(ESC.get(c, c) for c in t)


def flagify(raw):
    """Escape text, wrapping editorial placeholders in {.flag} spans."""
    out = []
    for part in FLAG_RE.split(raw):
        if not part:
            continue
        if FLAG_RE.fullmatch(part):
            out.append("[%s]{.flag}" % esc(part))
        else:
            out.append(esc(part))
    return "".join(out)


def inline(node, in_table=False):
    """Convert an lxml node's content to pandoc-markdown inline text."""
    parts = []
    if node.text:
        parts.append(flagify(node.text))
    for ch in node:
        tag = ch.tag if isinstance(ch.tag, str) else ""
        cls = ch.get("class", "") or ""
        inner = inline(ch, in_table)
        if tag in ("em", "i"):
            parts.append("*%s*" % inner.strip() if inner.strip() else inner)
            if inner != inner.strip():
                parts[-1] = (" " if inner.startswith(" ") else "") + parts[-1] + (" " if inner.endswith(" ") else "")
        elif tag in ("strong", "b"):
            s = inner.strip()
            parts.append(("**%s**" % s if s else inner))
            if inner != s:
                parts[-1] = (" " if inner.startswith(" ") else "") + parts[-1] + (" " if inner.endswith(" ") else "")
        elif tag == "span" and "glossary-term" in cls:
            parts.append("[%s]{.gloss}" % inner.strip())
        elif tag == "a":
            href = ch.get("href", "")
            if href.startswith("#") and href[1:] in ID_MAP:
                log("fixed", "links", "Pressbooks internal link %s -> %s" % (href, ID_MAP[href[1:]]))
                href = ID_MAP[href[1:]]
            parts.append("[%s](%s)" % (inner, href) if href else inner)
        elif tag == "br":
            parts.append(" " if in_table else "\\\n")
        elif tag in ("sup",):
            parts.append("^%s^" % inner)
        elif tag in ("sub",):
            parts.append("~%s~" % inner)
        else:
            parts.append(inner)
        if ch.tail:
            parts.append(flagify(ch.tail))
    s = "".join(parts)
    return re.sub(r"[ \t\r\n ]+", " ", s) if in_table or True else s


def text_of(node):
    return re.sub(r"\s+", " ", "".join(node.itertext())).strip()


def clean_line_start(s):
    """Prevent accidental markdown block syntax at the start of a paragraph."""
    s = s.strip()
    if re.match(r"^(\d+)([.)])\s", s):
        s = re.sub(r"^(\d+)([.)])", r"\1\\\2", s, count=1)
    if re.match(r"^[-+]\s", s):
        s = "\\" + s
    if s.startswith("#"):
        s = "\\" + s
    if s.startswith(":::"):
        s = "\\" + s
    return s


class Block:
    """A converted block of markdown, with a kind used for section logic."""
    def __init__(self, kind, md, level=0, title=""):
        self.kind, self.md, self.level, self.title = kind, md, level, title


def list_md(node, depth=0):
    lines = []
    ordered = node.tag == "ol"
    n = 1
    for li in node.findall("li"):
        marker = ("%d. " % n) if ordered else "- "
        n += 1
        pad = "    " * depth
        subs = []
        for nested in list(li):
            if nested.tag in ("ul", "ol"):
                subs.append(list_md(nested, depth + 1))
                tail = nested.tail
                li.remove(nested)
                if tail:
                    li.text = (li.text or "") + tail
        text = inline(li).strip()
        lines.append("%s%s%s" % (pad, marker, text))
        lines.extend(subs)
    return "\n".join(lines)


def inline_single(ch):
    wrapper = lxml.html.Element("span")
    wrapper.append(ch)
    return inline(wrapper)


def table_md(tbl):
    rows = []
    for tr in tbl.iter("tr"):
        cells = [inline(c, in_table=True).strip().replace("|", "\\|") for c in tr if c.tag in ("td", "th")]
        is_head = all(c.tag == "th" for c in tr if c.tag in ("td", "th"))
        rows.append((cells, is_head))
    if not rows:
        return ""
    width = max(len(r[0]) for r in rows)
    rows = [(r + [""] * (width - len(r)), h) for r, h in rows]
    if rows[0][1]:
        header, body = rows[0][0], rows[1:]
    else:
        header, body = [""] * width, rows
    out = ["| " + " | ".join(header) + " |", "|" + "|".join(["---"] * width) + "|"]
    for cells, _h in body:
        out.append("| " + " | ".join(cells) + " |")
    return "\n".join(out)


def cite_anatomy_html(div):
    """The three citation-anatomy boxes are structured; keep them as raw HTML."""
    parts = ['<div class="cite-anatomy" role="group" aria-label="%s">' % html.escape(text_of(div.find(".//p[@class='cite-heading']")))]
    parts.append('<p class="cite-heading">%s</p><div class="cite-row">' % html.escape(text_of(div.find(".//p[@class='cite-heading']"))))
    for cp in div.iter("div"):
        if "cite-part" in (cp.get("class") or ""):
            tok = cp.find("span[@class='cite-token']")
            lab = cp.find("span[@class='cite-label']")
            parts.append('<div class="cite-part"><span class="cite-token">%s</span><span class="cite-label">%s</span></div>'
                         % (html.escape(text_of(tok)), html.escape(text_of(lab))))
    parts.append("</div></div>")
    return "```{=html}\n" + "".join(parts) + "\n```"


def convert_children(parent, ctx):
    """Yield Blocks for the children of an lxml element."""
    blocks = []
    if parent.text and parent.text.strip():
        blocks.append(Block("p", clean_line_start(flagify(parent.text.strip()))))
    for ch in parent:
        tag = ch.tag if isinstance(ch.tag, str) else ""
        cls = ch.get("class", "") or ""
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            lvl = int(tag[1])
            title = html.unescape(text_of(ch))
            blocks.append(Block("h", "", lvl, title))
        elif tag == "p":
            md = inline(ch).strip()
            if md:
                blocks.append(Block("p", clean_line_start(md)))
        elif tag in ("ul", "ol"):
            blocks.append(Block("list", list_md(ch)))
        elif tag == "table":
            blocks.append(Block("table", table_md(ch)))
        elif tag == "img":
            blocks.append(Block("img", "", title=ch.get("alt", "")))
        elif tag == "div":
            blocks.extend(convert_div(ch, ctx))
        elif tag in ("blockquote",):
            inner = convert_children(ch, ctx)
            blocks.append(Block("quote", "\n".join("> " + l for b in inner for l in b.md.splitlines())))
        if ch.tail and ch.tail.strip():
            blocks.append(Block("p", clean_line_start(flagify(ch.tail.strip()))))
    return blocks


def convert_div(div, ctx):
    cls = div.get("class", "") or ""
    if "textbox" in cls:
        if div.find(".//p[@class='cite-heading']") is not None and "cite-row" in lxml.html.tostring(div, encoding="unicode"):
            return [Block("citebox", cite_anatomy_html(div))]
        if "learning-objectives" in cls:
            kind = "objectives"
        elif "key-takeaways" in cls:
            kind = "takeaways"
        elif "shaded" in cls:
            kind = "quote"
        else:
            kind = "callout"
        title = ""
        tt = div.find(".//p[@class='textbox__title']")
        if tt is not None:
            title = text_of(tt)
        content = div.find(".//div[@class='textbox__content']")
        src = content if content is not None else div
        inner = convert_children(src, ctx)
        # drop placeholder junk in objectives
        inner = [b for b in inner if not (b.kind == "p" and b.md.strip().lower().startswith("type your learning objectives"))]
        if kind == "callout" and not title:
            # Reflection Point / Example / In practice boxes: lift a leading label to a title
            pass
        body = "\n\n".join(render_block(b) for b in inner)
        return [Block(kind, wrap_div(kind, title, body))]
    # generic wrapper div (e.g. chapter content wrappers): flatten
    return convert_children(div, ctx)


def wrap_div(kind, title, body):
    attrs = {"objectives": ".objectives", "takeaways": ".takeaways", "quote": ".pullquote", "callout": ".callout"}[kind]
    head = ""
    if title and kind in ("objectives", "takeaways"):
        head = "[%s]{.box-title}\n\n" % esc(title)
    return "::: {%s}\n%s%s\n:::" % (attrs, head, body)


def render_block(b):
    return b.md


# --------------------------------------------------------------------------------------
# Section tree
# --------------------------------------------------------------------------------------
FORCE_TOP = {"chapter recap", "key takeaways", "reviewing through practice", "common pitfalls", "beyond the basics"}


class Section:
    def __init__(self, title, level):
        self.title, self.level, self.blocks = title, level, []

    def md(self):
        out = []
        if self.title:
            out.append("%s %s" % ("#" * self.level, esc_heading(self.title)))
        out.extend(b.md for b in self.blocks if b.md)
        return "\n\n".join(out)


def esc_heading(t):
    return flagify(t) if FLAG_RE.search(t) else esc(t).replace("\\&", "&")


SUBSECTION_TITLES = {"understanding a docket": 3, "finding a docket": 3}


def promote_plain_headings(blocks, where):
    """Part II chapters (and a few spots in Part I) export section titles as plain paragraphs.
    Promote short, unpunctuated paragraphs to headings; turn the plain 'Learning Objectives' /
    'Key Takeaways' / 'Example' / 'Reflection Point' runs back into boxes."""
    out, i = [], 0
    promoted = []
    while i < len(blocks):
        b = blocks[i]
        if b.kind == "p":
            t = b.md.strip()
            plain = re.sub(r"[*\\]", "", t)
            low = plain.strip().lower()
            if low in ("learning objectives", "key takeaways") and i + 1 < len(blocks) and blocks[i + 1].kind == "list":
                kind = "objectives" if low.startswith("learning") else "takeaways"
                out.append(Block(kind, wrap_div(kind, plain.strip(), blocks[i + 1].md)))
                promoted.append(plain.strip() + " (box)")
                i += 2
                continue
            if low == "example" and i + 1 < len(blocks) and blocks[i + 1].kind == "p":
                out.append(Block("callout", "::: {.callout}\n[Example]{.box-title}\n\n%s\n:::" % blocks[i + 1].md))
                promoted.append("Example (box)")
                i += 2
                continue
            if t.startswith("Reflection Point."):
                out.append(Block("callout", "::: {.callout}\n%s\n:::" % t))
                promoted.append("Reflection Point (box)")
                i += 1
                continue
            if (len(plain) < 95 and not re.search(r"[.?!:)\u201d\"]$", plain.strip()) and not t.startswith("*")
                    and not t.startswith("[") and i + 1 < len(blocks)):
                lvl = SUBSECTION_TITLES.get(low, 2) - 1      # html-style level; +1 later
                out.append(Block("h", "", lvl, plain.strip()))
                promoted.append(plain.strip())
                i += 1
                continue
        out.append(b)
        i += 1
    if promoted:
        log("normalised", where, "plain-paragraph headings/boxes promoted to real headings/boxes: " + "; ".join(promoted))
    return out


def build_sections(blocks, where):
    """Group blocks into a flat list of Sections with normalised levels (h2=section, h3=sub)."""
    secs = [Section("", 0)]
    blocks = promote_plain_headings(blocks, where)
    prev = 2
    levelmap = {}
    for b in blocks:
        if b.kind == "h":
            lvl = levelmap.get(b.level) or min(b.level + 1, prev + 1, 5)    # pressbooks h1 -> md ##; no skipped levels
            if lvl != min(b.level + 1, 5) and b.title.lower() not in FORCE_TOP and b.level not in levelmap:
                levelmap[b.level] = lvl
                log("normalised", where, "heading \u201c%s\u201d jumped a level (h%d under h%d); clamped" % (b.title, b.level, prev - 1))
            base = re.sub(r"[:—].*$", "", b.title).strip().lower()
            if base in FORCE_TOP and lvl != 2:
                log("normalised", where, "heading “%s” was level %d in the export; moved to section level" % (b.title, b.level))
                lvl = 2
            secs.append(Section(b.title, lvl))
            prev = lvl
        else:
            secs[-1].blocks.append(b)
    return secs


# --------------------------------------------------------------------------------------
# Text fixes (each logged)
# --------------------------------------------------------------------------------------
def fix_text(md, where):
    orig = md
    md = re.sub(r"(Sample answers for this chapter.s exercises appear in Appendix )X", r"\1H", md)
    md = re.sub(r"(Reflection Point\.[^\n]*?appears in Appendix )X", r"\1I", md)
    if md != orig:
        log("fixed", where, "placeholder “Appendix X” -> H (sample answers) / I (Reflection Point answers)")
    return md


def section_text(sec):
    return "\n\n".join(b.md for b in sec.blocks if b.md)


# --------------------------------------------------------------------------------------
# Reviewing Through Practice (docx)
# --------------------------------------------------------------------------------------
def load_rtp(docx):
    md = subprocess.check_output(["pandoc", docx, "-t", "markdown", "--wrap=none"], text=True)
    paras = [p.strip() for p in re.split(r"\n\s*\n", md) if p.strip()]
    chapters, cur, notes = {}, None, []
    for p in paras:
        m = re.match(r"^Chapter (\d+): (.+)$", p)
        if m:
            cur = int(m.group(1))
            chapters[cur] = {"docx_title": m.group(2), "paras": []}
            continue
        if cur is None:
            notes.append(p)
            continue
        chapters[cur]["paras"].append(p)   # renumbered later, once RENUM is known
    return chapters, notes


def rtp_section(n, data):
    """Return markdown for the new RTP section of chapter n."""
    paras = data["paras"]
    out, editor_notes = [], []
    title = "Reviewing Through Practice"
    i = 0
    if paras and paras[0].startswith("*\\[This section currently sits"):
        editor_notes.append(paras.pop(0))
    if paras and paras[0].startswith("Reviewing Through Practice"):
        title = paras.pop(0).replace("\n", " ")
    out.append("## " + title)
    open_group = False
    for p in paras:
        m = re.match(r"^\*\*(Exercise (\d+\.\d+)) --- (.+?)\*\* (.*)$", p, re.S)
        m2 = re.match(r"^Exercise (\d+\.\d+) --- (.+)$", p)
        if m:
            label, num, name, body = m.groups()
            name = name.rstrip(".")
            body = body.replace(" *Deliverable:*", "\n\n*Deliverable:*").replace(" *Self-check:*", "\n\n*Self-check:*")
            body = re.sub(r"\\\[(Cite-check note:.*?)\\\]", lambda mm: "[\\[%s\\]]{.flag}" % mm.group(1), body, flags=re.S)
            body = re.sub(r"^\*Deliverable:\*", "**Deliverable:**", body, flags=re.M)
            body = re.sub(r"^\*Self-check:\*", "**Self-check:**", body, flags=re.M)
            out.append('::: {.exercise #ex-%s}\n### %s — %s\n\n%s\n:::' % (num.replace(".", "-"), label, name, body))
        elif m2:
            num, name = m2.groups()
            if open_group:
                out.append(":::")
            out.append('::: {.exercise #ex-%s}\n### Exercise %s — %s' % (num.replace(".", "-"), num, name))
            open_group = True
        else:
            out.append(p)
    if open_group:
        out.append(":::")
    out.append("Sample answers for this chapter’s exercises appear in [Appendix H](../appendices/h.html#chapter-%d)." % n)
    return "\n\n".join(out), editor_notes


# --------------------------------------------------------------------------------------
# Plan application
# --------------------------------------------------------------------------------------
def embed_md(e):
    attrs = 'module="%s" title="%s" height="%s"' % (e["module"], e["title"].replace('"', "'"), e.get("height", 760))
    blurb = renumber(e.get("blurb", ""))
    return "::: {.interactive %s}\n%s\n:::" % (attrs, blurb)


def find_idx(secs, title, start=0):
    t = title.strip().lower()
    for i in range(start, len(secs)):
        if secs[i].title.strip().lower() == t:
            return i
    return -1


def section_span(secs, i):
    """index range [i, j) covering section i and all deeper subsections."""
    lvl = secs[i].level
    j = i + 1
    while j < len(secs) and secs[j].level > lvl:
        j += 1
    return i, j


def archive_secs(secs, i, j, where, reason):
    text = "\n\n".join(s.md() for s in secs[i:j])
    ARCHIVE.append((where, secs[i].title, reason, text))
    log("removed", where, "section “%s” (%s); original kept in content/_archive/removed-text.md" % (secs[i].title, reason))


def apply_plan(n, secs, plan, where):
    """plan: dict from book.json chapter entry. Returns secs."""
    # 1. generic removals (e.g. image paragraphs)
    for sec in secs:
        keep = []
        for b in sec.blocks:
            if b.kind == "img":
                ARCHIVE.append((where, "image", "replaced by interactive", "![%s](remote image from the Pressbooks site)" % b.title))
                log("removed", where, "remote figure image (alt text: %s)" % b.title[:80])
                continue
            keep.append(b)
        sec.blocks = keep
    # 2. paragraph removals listed in the plan
    for rp in plan.get("remove_paragraphs", []):
        for sec in secs:
            kept = []
            for b in sec.blocks:
                if b.kind == "p" and rp["startswith"].lower() in b.md.lower()[:len(rp["startswith"]) + 40]:
                    ARCHIVE.append((where, sec.title, rp["reason"], b.md))
                    log("removed", where, "paragraph “%s…” (%s)" % (b.md[:60], rp["reason"]))
                else:
                    kept.append(b)
            sec.blocks = kept
    # 3. section replacements
    for rs in plan.get("replace_sections", []):
        i = find_idx(secs, rs["title"])
        if i < 0:
            sys.exit("plan error: ch%d has no section %r" % (n, rs["title"]))
        i, j = section_span(secs, i)
        archive_secs(secs, i, j, where, rs["reason"])
        keep_md = rs.get("keep_md", "")
        if keep_md.startswith("@"):
            keep_md = globals()[keep_md.strip("@")]
        new = Section(rs.get("new_title", secs[i].title), secs[i].level)
        if rs.get("lead_md"):
            new.blocks.append(Block("p", rs["lead_md"]))
        if rs.get("embed"):
            new.blocks.append(Block("embed", embed_md(rs["embed"])))
        if keep_md:
            new.blocks.append(Block("p", keep_md))
        secs[i:j] = [new]
    # 4. inline embeds
    for e in plan.get("embeds", []):
        if e.get("place") == "practice" or e.get("replaces"):
            continue
        i = find_idx(secs, e["after"])
        if i < 0:
            sys.exit("plan error: ch%d has no section %r for embed %s" % (n, e["after"], e["module"]))
        _, j = section_span(secs, i)
        sec = Section(e.get("heading", ""), 3) if False else None
        secs[j - 1].blocks.append(Block("embed", embed_md(e)))
    return secs


def assemble_chapter(n, secs, plan, rtp):
    """Return the final markdown for chapter n."""
    where = "ch%02d" % n
    old_n = plan["old_n"]
    # pull RTP section out
    rtp_i = None
    for i, s in enumerate(secs):
        if s.title.strip().lower().startswith("reviewing through practice"):
            rtp_i = i
            break
    if rtp_i is not None:
        a, b = section_span(secs, rtp_i)
        old_text = "\n\n".join(s.md() for s in secs[a:b])
        ARCHIVE.append((where, secs[rtp_i].title, "superseded by the new Reviewing Through Practice set (docx)", old_text))
        log("replaced", where, "“%s” replaced wholesale with the docx exercise set (old text archived)" % secs[rtp_i].title)
        del secs[a:b]
    # Move Key Takeaways / Recap order: leave as authored
    practice = [e for e in plan.get("embeds", []) if e.get("place") == "practice"]
    tail = []
    if plan.get("append_md_file"):
        tail.append(open(os.path.join(ROOT, plan["append_md_file"]), encoding="utf-8").read().strip())
    if practice:
        blurbs = "\n\n".join(embed_md(e) for e in practice)
        tail.append("## Practice Online\n\n" + blurbs)
    rtp_md, _notes = rtp_section(n, rtp[old_n])
    tail.append(rtp_md)
    body = "\n\n".join(s.md() for s in secs if s.md().strip())
    # the first Section (no title) holds the intro; level 0 -> no heading
    return fix_text(body, where) + "\n\n" + "\n\n".join(tail) + "\n"


# --------------------------------------------------------------------------------------
# Custom handlers
# --------------------------------------------------------------------------------------
CH1_HIERARCHY_LEAD = """Not all primary authority carries the same weight, and two distinctions decide most of it. The interactive below lets you work them out with a map, then test yourself; the short version follows.

**Primary versus secondary.** *Primary authority* is the law itself: constitutions, statutes, regulations, case law, and treaties. Secondary sources explain, interpret, or analyze the law, but they hold no authority to bind government or citizen action. For research, secondary sources are usually where you start and primary authorities are usually where you end.

**Binding versus persuasive.** *Binding* (also called mandatory or controlling) authority is authority a court must follow; *persuasive* authority is authority a court may be influenced by but need not follow. An authority binds your court only when it comes from home: your jurisdiction's own constitution, statutes, and regulations, the decisions of courts above yours in the same system, and the federal law that applies there. Everything else, including other jurisdictions' primary authority, decisions of courts at the same level or below, and all secondary sources, is persuasive.

**Preemption.** Under the Supremacy Clause (Article VI), federal law overrides conflicting state law in areas where Congress has constitutional power to act. Preemption can be express or implied; where federal law sets only a floor, states may be stricter. Whenever you research a state-law question in a federally regulated area, ask whether federal law preempts the state rule first."""

CH3_DEMO_KEEP = """Notice that for several of these questions the answer comes from a single source, *Pelham v. Griesheimer*. That is common for settled points of law: elements, familiar principles, conclusions nobody is fighting about. The last sentence is different. It carries multiple citations because the answer requires a survey of different scenarios. When you see one point of law supported by a string of citations, that usually signals a survey question answered by looking across many cases.

Making the questions explicit shows you why some propositions might only need a single citation while others need several. Here we worked backward from a finished paragraph. When you research, you work forward toward one. The paragraph as a whole serves the macro question of the appeal. Each sentence answers a single research question. Assembled, the small answers resolve the big one, and every piece of legal writing you produce has this structure under its skin.

Finally, those four questions, in order, are a research map. The paragraph is the annotated outline written out in full sentences, each question replaced by its answer and its citation."""


def ch1_custom(secs, plan, where):
    """Replace the three mechanical hierarchy subsections with a condensed summary + interactive,
    keeping the Li v. Yellow Cab 'In practice' box and the Reflection Point (neither is in the module)."""
    i = find_idx(secs, "The Hierarchy of Legal Authority")
    a, b = section_span(secs, i)
    # find the pieces to keep
    keep = []
    for s in secs[a:b]:
        for blk in s.blocks:
            low = blk.md.lower()
            if "in practice" in low[:120] or "li v. yellow cab" in low[:400] or "reflection point" in low[:80] or "persuasion can also travel" in low[:60]:
                keep.append(blk)
    archive_secs(secs, a, b, where, "mechanics now taught by the Hierarchy of Authorities interactive; condensed to a summary")
    new = Section("The Hierarchy of Legal Authority", 2)
    new.blocks.append(Block("p", CH1_HIERARCHY_LEAD))
    emb = [e for e in plan["embeds"] if e.get("replaces")][0]
    new.blocks.append(Block("embed", embed_md(emb)))
    sub = Section("When Persuasive Becomes Binding", 3)
    sub.blocks.extend(keep)
    secs[a:b] = [new, sub]
    log("kept", where, "Li v. Yellow Cab ‘In practice’ passage and the Reflection Point retained (not covered by the interactive)")
    return secs


def sort_h(md):
    """Appendix H: keep the preamble, order the '## Chapter N' sections by the (renumbered) N."""
    parts = re.split(r"(?m)^(?=## Chapter \d+\s*$)", md)
    head, secs = parts[0], parts[1:]
    secs.sort(key=lambda x: int(re.match(r"## Chapter (\d+)", x).group(1)))
    log("renumbered", "appendix-h", "sections re-sorted into the new chapter order")
    return head + "".join(s if s.endswith("\n\n") else s.rstrip("\n") + "\n\n" for s in secs)


def sort_i(md):
    """Appendix I: paragraphs that start '**Chapter N \u2014 after ...' sorted by N."""
    paras = re.split(r"\n\s*\n", md.strip())
    head = [p for p in paras if not re.match(r"\*\*Chapter \d+", p)]
    ents = [p for p in paras if re.match(r"\*\*Chapter \d+", p)]
    ents.sort(key=lambda p: int(re.match(r"\*\*Chapter (\d+)", p).group(1)))
    log("renumbered", "appendix-i", "entries re-sorted into the new chapter order")
    return "\n\n".join(head + ents) + "\n"


# --------------------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------------------
def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--xhtml", required=True)
    ap.add_argument("--rtp", required=True)
    args = ap.parse_args()
    book = json.load(open(os.path.join(ROOT, "book.json"), encoding="utf-8"))
    root = lxml.html.parse(args.xhtml).getroot()
    rtp, rtp_top_notes = load_rtp(args.rtp)
    RENUM.update({int(k): v for k, v in book.get("renumber", {}).items()})
    for _k in rtp:
        rtp[_k]["paras"] = [renumber(x) for x in rtp[_k]["paras"]]
    for c_ in book["chapters"]:
        ID_MAP[c_["source_id"]] = "../ch-%d/index.html" % c_["n"]
    for a_ in book["appendices"]:
        ID_MAP[a_["source_id"]] = "../appendices/%s.html" % a_["slug"]

    # index source divs by their pressbooks id
    divs = {d.get("id"): d for d in root.iter("div") if d.get("id") and re.match(r"^(chapter|front-matter|back-matter|part)-", d.get("id"))}

    def ugc(d):
        for c in d.iter("div"):
            if "ugc" in (c.get("class") or ""):
                return c
        return d

    # ---- front matter
    for fm in book["front"]:
        d = divs[fm["source_id"]]
        blocks = renumber_blocks(convert_children(ugc(d), {}))
        secs = build_sections(blocks, fm["slug"])
        md = "\n\n".join(s.md() for s in secs if s.md().strip())
        write(os.path.join(CONTENT, "front", fm["slug"] + ".md"), fix_text(md, fm["slug"]) + "\n")

    # ---- part openers
    for pt in book["parts"]:
        d = divs.get(pt["source_id"])
        if d is None:
            d = next(x for x in root.iter("div") if x.get("id") == pt["source_id"])
        blocks = renumber_blocks(convert_children(ugc(d), {}))
        secs = build_sections(blocks, "part-" + pt["id"])
        md = "\n\n".join(s.md() for s in secs if s.md().strip())
        write(os.path.join(CONTENT, "front", "part-%s.md" % pt["id"].lower()), fix_text(md, "part-" + pt["id"]) + "\n")

    # ---- chapters
    for ch in book["chapters"]:
        n = ch["n"]
        where = "ch%02d" % n
        d = divs[ch["source_id"]]
        blocks = renumber_blocks(convert_children(ugc(d), {}))
        # drop the stray figure-label placeholder paragraph bookkeeping happens in apply_plan
        secs = build_sections(blocks, where)
        # flatten the first untitled section: the chapter intro
        secs[0].level = 0
        if n == 1:
            secs = ch1_custom(secs, ch, where)
        for rs in ch.get("replace_sections", []):
            pass
        secs = apply_plan(n, secs, {k: v for k, v in ch.items() if k != "embeds" or True}, where)
        md = assemble_chapter(n, secs, ch, rtp)
        write(os.path.join(CONTENT, "chapters", "ch-%02d.md" % n), md)

    # ---- appendices
    for ap_ in book["appendices"]:
        if ap_.get("skip_import"):
            continue
        d = divs[ap_["source_id"]]
        blocks = renumber_blocks(convert_children(ugc(d), {}))
        secs = build_sections(blocks, ap_["slug"])
        md = "\n\n".join(s.md() for s in secs if s.md().strip())
        md = fix_text(md, ap_["slug"])
        if ap_["slug"] == "h":
            md = sort_h(md)
        if ap_["slug"] == "i":
            md = sort_i(md)
        emb = [e for e in ap_.get("embeds", [])]
        if emb:
            # put the interactive right after the opening paragraph(s) before the first heading
            first_h = md.find("\n## ")
            ins = "\n\n".join(embed_md(e) for e in emb)
            md = md[:first_h] + "\n\n" + ins + "\n" + md[first_h:] if first_h > 0 else ins + "\n\n" + md
        write(os.path.join(CONTENT, "appendices", ap_["slug"] + ".md"), md + "\n")

    # superseded duplicate sample-answers appendix: archive, do not build
    dup = divs["back-matter-sample-answers-for-the-reviewing-through-practice-exercises"]
    blocks = renumber_blocks(convert_children(ugc(dup), {}))
    secs = build_sections(blocks, "dup-sample-answers")
    write(os.path.join(CONTENT, "_archive", "superseded-unlettered-sample-answers-appendix.md"),
          "<!-- The Pressbooks export contains TWO sample-answer appendices: this unlettered one and Appendix H. "
          "Appendix H matches the new exercise set; this copy is kept for comparison only and is not built. -->\n\n"
          + "\n\n".join(s.md() for s in secs if s.md().strip()) + "\n")

    # ---- archive + log
    arch = ["# Text removed or replaced during import\n",
            "Everything here was cut from the live chapter text because an interactive now teaches it, "
            "because it was superseded, or because it was a leftover placeholder. Nothing is deleted: copy any "
            "passage back into the chapter file if you want it restored.\n"]
    for where, title, reason, text in ARCHIVE:
        arch.append("\n---\n\n## %s · %s\n\n*Reason: %s*\n\n%s\n" % (where, title, reason, text))
    write(os.path.join(CONTENT, "_archive", "removed-text.md"), "\n".join(arch))
    lg = ["# Import log\n", "Generated by `scripts/import_pressbooks.py`. One line per automated change.\n"]
    for kind, where, what in LOG:
        lg.append("- **%s** · %s · %s" % (kind, where, what))
    lg.append("\n## Notes embedded in the docx (not imported as content)\n")
    for p in rtp_top_notes:
        lg.append("> " + p.replace("\n", " "))
    write(os.path.join(CONTENT, "_archive", "IMPORT-LOG.md"), "\n".join(lg) + "\n")
    print("imported: %d chapters, %d appendices; %d logged changes" % (len(book["chapters"]), len(book["appendices"]), len(LOG)))


if __name__ == "__main__":
    main()
