#!/usr/bin/env python3
"""Build the static site from content/*.md.

    python3 build.py            # build everything, then run the checks
    python3 build.py --check    # checks only

Needs: Python 3.8+, pandoc 2.14+ on PATH. No other dependencies.
The committed output (HTML in the repo root) is the site; GitHub Pages serves it as is.

Pipeline
  content/**/*.md --pandoc--> HTML fragment --postprocess--> page shell --> site
  postprocess: in-text interactives (::: {.try kind=...} blocks) get an id and a heading strip and
  are enhanced in the browser by assets/book.js; "Chapter N" / "Appendix X" auto-links;
  draft-flag handling.  Downloads (incl. the generated Key Takeaways study guide)
  are assembled into downloads/.
"""
import html, json, os, re, shutil, subprocess, sys, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
BOOK = json.load(open(os.path.join(ROOT, "book.json"), encoding="utf-8"))
DRAFT = bool(BOOK.get("draft", True))
TITLE = BOOK["title"]
PANDOC_FROM = "markdown+fenced_divs+bracketed_spans+pipe_tables+smart-citations+auto_identifiers+gfm_auto_identifiers"

CH = {c["n"]: c for c in BOOK["chapters"]}
APP = {a["letter"]: a for a in BOOK["appendices"]}
PARTS = {p["id"]: p for p in BOOK["parts"]}


def esc(s):
    return html.escape(s or "", quote=True)


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return f.read()


def write(path, text):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(text)


def pandoc_html(md_text):
    p = subprocess.run(["pandoc", "-f", PANDOC_FROM, "-t", "html5", "--wrap=none"],
                       input=md_text, capture_output=True, text=True, encoding="utf-8")
    if p.returncode:
        sys.exit("pandoc failed: " + p.stderr)
    return normalize_pandoc(p.stdout)


def normalize_pandoc(frag):
    """Make pandoc 3.1 and 3.13 write the same HTML, so the committed pages do not change with the
    version on whoever's machine runs the build. Newer pandoc writes data-label where older wrote label,
    and no longer puts header/odd/even classes on table rows (nothing here styles them)."""
    frag = re.sub(r'(<span\b[^>]*?) label="', r'\1 data-label="', frag)
    frag = re.sub(r'<tr class="(?:header|odd|even)">', "<tr>", frag)
    return frag


# --------------------------------------------------------------------------------------
# URL scheme
# --------------------------------------------------------------------------------------
def url_chapter(n):  return "ch-%d/index.html" % n
def url_app(letter): return "appendices/%s.html" % letter.lower()
def url_front(slug): return "front/%s.html" % slug
def url_part(pid):   return "part-%s.html" % pid.lower()
URL_HOME, URL_DOWNLOADS, URL_GLOSSARY, URL_SEARCH = "index.html", "downloads/index.html", "glossary/index.html", "search/index.html"


def rel(depth, url):
    return "../" * depth + url


# --------------------------------------------------------------------------------------
# Post-processing of a pandoc fragment
# --------------------------------------------------------------------------------------
TRY_RE = re.compile(r'<div class="try"([^>]*)>')
TRY_LABEL = {"choice": "Quick check", "sort": "Quick check", "order": "Put it in order", "explore": "Explore",
             "switch": "Change the setting", "annotate": "Read closely", "search": "Search lab", "checklist": "Checklist",
             "reveal": "Your turn", "tokens": "Watch it work", "flashcards": "Flashcards"}


def render_try(frag):
    """In-text interactives. The Markdown block
           ::: {.try kind="sort" title="..." bins="A | B"}
       is ordinary content (a list, a passage); here it gets an id and a heading strip, and
       assets/book.js turns it into the working interactive in the reader's browser. Nothing
       is framed in from elsewhere, and with scripts off the content still reads as text."""
    n = [0]

    def sub(m):
        attrs = m.group(1)
        kind = re.search(r'\bkind="([^"]*)"', attrs)
        title = re.search(r'\btitle="([^"]*)"', attrs)
        kind = kind.group(1) if kind else ""
        if kind not in TRY_LABEL:
            sys.exit("unknown interactive kind %r (known: %s)" % (kind, ", ".join(sorted(TRY_LABEL))))
        title = title.group(1) if title else ""
        rest = re.sub(r'\s*\b(kind|title)="[^"]*"', "", attrs)
        n[0] += 1
        return ('<div class="try" id="try-%d" data-kind="%s" data-title="%s"%s>'
                '<p class="try-head"><strong>%s</strong></p>'
                % (n[0], kind, title, rest, title))

    frag = TRY_RE.sub(sub, frag)
    return frag, n[0]


TOKEN = re.compile(r"(<[^>]+>)")
REF = re.compile(r"\b(Chapters?) (\d{1,2})\b|\bAppendix ([A-I])\b")


def autolink(frag, depth, page_url):
    """Link 'Chapter N' / 'Appendix X' in running text (not inside links, headings, boxes' titles)."""
    out, skip = [], 0
    skip_tags = {"a", "h1", "h2", "h3", "h4", "h5", "h6", "script", "style", "code", "iframe", "figcaption"}
    for tok in TOKEN.split(frag):
        if tok.startswith("<"):
            m = re.match(r"<(/?)([a-zA-Z0-9]+)", tok)
            if m and m.group(2).lower() in skip_tags and not tok.endswith("/>"):
                skip += -1 if m.group(1) else 1
                skip = max(skip, 0)
            out.append(tok)
            continue
        if skip:
            out.append(tok)
            continue

        def sub(m):
            if m.group(1):
                n = int(m.group(2))
                if n in CH and url_chapter(n) != page_url:
                    return '<a class="xref" href="%s">%s %d</a>' % (rel(depth, url_chapter(n)), m.group(1), n)
            else:
                L = m.group(3)
                if L in APP and url_app(L) != page_url:
                    return '<a class="xref" href="%s">Appendix %s</a>' % (rel(depth, url_app(L)), L)
            return m.group(0)
        out.append(REF.sub(sub, tok))
    return "".join(out)


GLOSS = None
GLOSS_MISS = set()


def gloss_key(t):
    t = html.unescape(re.sub(r"<[^>]+>", "", t)).lower()
    t = re.sub(r"\([^)]*\)", "", t)
    return re.sub(r"[^a-z0-9 ]+", " ", t.replace("\u2019", "").replace("'", "")).strip()


def load_gloss():
    """term -> definition, from content/glossary.md (a definition list)."""
    global GLOSS
    GLOSS = {}
    for m in re.finditer(r"(?m)^(\S[^\n]*)\n:   (.*)$", read("content/glossary.md")):
        d = re.sub(r"\s*\(Chapter \d+\)\s*$", "", m.group(2).strip())
        GLOSS[gloss_key(m.group(1))] = d


def add_definitions(frag):
    """Give each defined term (a .gloss span) its glossary definition, shown on hover, focus or tap."""
    if GLOSS is None:
        load_gloss()

    def find(k):
        c = [k, k.rstrip("s"), k + "s", re.sub(r"ies$", "y", k), re.sub(r"s$", "", k.split(" ")[0]) + " " + " ".join(k.split(" ")[1:])]
        for x in c:
            if x.strip() in GLOSS:
                return GLOSS[x.strip()]
        for g in GLOSS:                      # "citators" -> "citator"; "session laws" -> "session law"
            if g.startswith(k) or k.startswith(g):
                if abs(len(g) - len(k)) <= 4:
                    return GLOSS[g]
        return None

    def sub(m):
        d = find(gloss_key(m.group(1)))
        if not d:
            # No glossary entry: fall back to the book's own defining sentence, the one the term sits in.
            GLOSS_MISS.add(gloss_key(m.group(1)))
            src = m.string
            a = max(src.rfind("<p>", 0, m.start()), src.rfind("<li>", 0, m.start()))
            b = min([x for x in (src.find("</p>", m.end()), src.find("</li>", m.end())) if x >= 0] or [-1])
            if a < 0 or b < 0:
                return m.group(0)
            before = html.unescape(re.sub(r"<[^>]+>", "", src[a:m.start()]))
            after = html.unescape(re.sub(r"<[^>]+>", "", src[m.end():b]))
            term = html.unescape(re.sub(r"<[^>]+>", "", m.group(1)))
            head = re.split(r"(?<=[.?!])\s+(?=[A-Z\u201c*])", before)[-1]
            tail = re.split(r"(?<=[.?!])\s+(?=[A-Z\u201c])", after)[0]
            d = re.sub(r"\s+", " ", head + term + tail).strip()
            if len(d) < 40:
                return m.group(0)
        return '<span class="gloss" data-def="%s">%s</span>' % (esc(d), m.group(1))
    return re.sub(r'<span class="gloss">(.*?)</span>', sub, frag, flags=re.S)


def strip_flags(frag):
    return re.sub(r'<span class="flag">(.*?)</span>', "", frag, flags=re.S)


def fix_tables(frag):
    # pandoc emits an empty <thead> for tables whose header row was blank
    frag = re.sub(r"<thead>\s*<tr>(?:\s*<th[^>]*>\s*</th>)+\s*</tr>\s*</thead>", "", frag)
    frag = frag.replace("<table>", '<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table>').replace("</table>", "</table></div>")
    return frag


def toc_from(frag):
    items = []
    for m in re.finditer(r'<h([23]) id="([^"]+)"[^>]*>(.*?)</h\1>', frag, re.S):
        text = re.sub(r'<a class="anchor".*?</a>', "", m.group(3), flags=re.S)      # not the '#' permalink
        text = re.sub(r"<[^>]+>", "", text).strip()
        items.append((int(m.group(1)), m.group(2), html.unescape(text)))
    return items


SEARCH = []   # (url, page title, section id, section title, text) collected while building


def add_anchors(frag):
    """A small '#' link on every section heading, so a section can be cited by URL."""
    return re.sub(r'<h([23]) id="([^"]+)"([^>]*)>(.*?)</h\1>',
                  lambda m: '<h%s id="%s"%s>%s <a class="anchor" href="#%s" aria-label="Link to this section">#</a></h%s>'
                  % (m.group(1), m.group(2), m.group(3), m.group(4), m.group(2), m.group(1)), frag, flags=re.S)


def index_for_search(frag, page_url, page_title):
    """Split the fragment at h2/h3 and store plain text per section."""
    parts = re.split(r'(<h[23] id="[^"]+"[^>]*>.*?</h[23]>)', frag, flags=re.S)
    cur_id, cur_title = "", page_title
    for part in parts:
        m = re.match(r'<h[23] id="([^"]+)"[^>]*>(.*?)</h[23]>', part, re.S)
        if m:
            cur_id = m.group(1)
            cur_title = html.unescape(re.sub(r"<[^>]+>", "", m.group(2))).replace(" #", "").strip()
            continue
        text = re.sub(r"<(script|style|iframe)[^>]*>.*?</\1>", " ", part, flags=re.S)
        text = re.sub(r'<span class="flag">.*?</span>', " ", text, flags=re.S)
        text = html.unescape(re.sub(r"<[^>]+>", " ", text))
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            SEARCH.append({"u": page_url + ("#" + cur_id if cur_id else ""), "p": page_title, "s": cur_title, "t": text[:4000]})


def process(md_text, depth, page_url, page_title=""):
    frag = pandoc_html(md_text)
    frag = fix_tables(frag)
    frag, n_embeds = render_try(frag)
    frag = autolink(frag, depth, page_url)
    if not DRAFT:
        frag = strip_flags(frag)
    frag = add_anchors(frag)
    if page_url != URL_GLOSSARY:
        frag = add_definitions(frag)
    if page_title:
        index_for_search(frag, page_url, page_title)
    return frag, n_embeds


# --------------------------------------------------------------------------------------
# Page shell
# --------------------------------------------------------------------------------------
def nav_menu(depth):
    parts = []
    for pid in ("I", "II"):
        p = PARTS[pid]
        lis = []
        for n in p["chapters"]:
            lis.append('<li><a href="%s"><span class="cn">%d</span> %s</a></li>' % (rel(depth, url_chapter(n)), n, esc(CH[n]["title"])))
        parts.append('<section><p class="mh"><a href="%s">%s</a></p><ul>%s</ul></section>' % (rel(depth, url_part(pid)), esc(p["title"]), "".join(lis)))
    app = "".join('<li><a href="%s"><span class="cn">%s</span> %s</a></li>' % (rel(depth, url_app(a["letter"])), a["letter"], esc(a["title"].split(":")[0])) for a in BOOK["appendices"])
    parts.append('<section><p class="mh">Appendices</p><ul>%s</ul></section>' % app)
    return "".join(parts)


def describe(body):
    """First real paragraph of a page, for the meta description."""
    m = re.search(r"<p>(?!<strong>In practice)(.*?)</p>", body, re.S)
    if not m:
        return ""
    t = html.unescape(re.sub(r"<[^>]+>", "", m.group(1)))
    t = re.sub(r"\s+", " ", t).strip()
    return (t[:157] + "\u2026") if len(t) > 160 else t


def shell(title, body, depth, page_url, toc=None, pager=None, wide=False, kicker="", head="", body_class=""):
    base = "../" * depth
    desc = describe(body)
    toc_html = ""
    if toc:
        lis = "".join('<li class="l%d"><a href="#%s">%s</a></li>' % (lvl, i, esc(t)) for lvl, i, t in toc)
        toc_html = ('<nav class="toc" aria-label="On this page"><details class="tocbox" open><summary><span class="th">On this page</span></summary>'
                    '<ol>%s</ol></details></nav>' % lis)
    pager_html = ""
    if pager:
        prev, nxt = pager
        pl = '<a class="prev" href="%s"><span aria-hidden="true">&larr;</span> <span class="dir">Previous:</span> <span class="ttl">%s</span></a>' % (rel(depth, prev[0]), esc(prev[1])) if prev else "<span></span>"
        nl = '<a class="next" href="%s"><span class="dir">Next:</span> <span class="ttl">%s</span> <span aria-hidden="true">&rarr;</span></a>' % (rel(depth, nxt[0]), esc(nxt[1])) if nxt else "<span></span>"
        pager_html = '<nav class="pager" aria-label="Previous and next page">%s%s</nav>' % (pl, nl)
    banner = ""
    if DRAFT:
        banner = ('<div class="draftbar" role="note"><strong>Draft.</strong> Yellow <span class="flag">flags</span> mark open items. '
                  '<button type="button" id="flagtoggle" aria-pressed="false">Hide flags</button></div>')
    return """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%(title)s &mdash; %(book)s</title>
%(head)s%(desc)s<link rel="preload" href="%(base)sassets/fonts/lato-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="%(base)sassets/fonts/zilla-slab-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="%(base)sassets/book.css">
</head>
<body%(bc)s>
<a class="skip" href="#main">Skip to content</a>
<header class="masthead"><div class="wrap">
  <a class="brand" href="%(base)sindex.html"><span class="mark">%(book)s</span><span class="sub">%(sub)s</span></a>
  <nav class="topnav" aria-label="Primary">
    <details class="menu"><summary>Contents</summary><div class="menu-panel">%(menu)s</div></details>
    <a href="%(dl)s">Downloads</a>
    <a href="%(gl)s">Glossary</a>
    <a href="%(se)s">Search</a>
  </nav>
</div></header>
%(banner)s
<main id="main" class="wrap %(wide)s">
%(toc)s
<article class="page">
%(kicker)s
%(body)s
</article>
</main>
<footer class="foot"><div class="wrap">
  <span>%(book)s. By %(author)s.</span>
  <span>Nothing you type on these pages leaves your device.</span>
</div></footer>
%(pager)s
<script src="%(base)sassets/book.js"></script>
</body>
</html>
""" % {"title": esc(title), "book": esc(TITLE), "sub": esc(BOOK["subtitle"]), "base": base, "menu": nav_menu(depth),
       "dl": base + URL_DOWNLOADS, "gl": base + URL_GLOSSARY, "se": base + URL_SEARCH, "banner": banner,
       "desc": ('<meta name="description" content="%s">\n' % esc(desc)) if desc else "", "toc": toc_html, "pager": pager_html,
       "body": body, "head": head, "bc": (' class="%s"' % body_class) if body_class else "", "wide": "wide" if wide else "", "author": esc(BOOK["author"]), "kicker": kicker}


# --------------------------------------------------------------------------------------
# Sequence for prev/next
# --------------------------------------------------------------------------------------
def sequence():
    seq = [(URL_HOME, "Contents")]
    for f in BOOK["front"]:
        seq.append((url_front(f["slug"]), f["title"]))
    for pid in ("I", "II"):
        seq.append((url_part(pid), PARTS[pid]["title"]))
        for n in PARTS[pid]["chapters"]:
            seq.append((url_chapter(n), "Chapter %d: %s" % (n, CH[n]["title"])))
    for a in BOOK["appendices"]:
        seq.append((url_app(a["letter"]), "Appendix %s: %s" % (a["letter"], a["title"].split(":")[0])))
    seq.append((URL_GLOSSARY, "Glossary"))
    seq.append((URL_DOWNLOADS, "Downloads"))
    seq.append((URL_SEARCH, "Search"))
    return seq


SEQ = sequence()


def pager_for(url):
    idx = [i for i, (u, _t) in enumerate(SEQ) if u == url]
    if not idx:
        return None
    i = idx[0]
    return (SEQ[i - 1] if i > 0 else None, SEQ[i + 1] if i + 1 < len(SEQ) else None)


# --------------------------------------------------------------------------------------
# Page builders
# --------------------------------------------------------------------------------------
STATS = {"embeds": {}, "pages": 0}


def build_chapter(n):
    c = CH[n]
    url = url_chapter(n)
    md = read("content/chapters/ch-%02d.md" % n)
    frag, ne = process(md, 1, url, "Chapter %d: %s" % (n, c["title"]))
    STATS["embeds"][n] = ne
    pid = c["part"]
    kicker = ('<header class="chead"><p class="num">Chapter %d</p><h1>%s</h1></header>' % (n, esc(c["title"])))
    write(url, shell("Chapter %d: %s" % (n, c["title"]), frag, 1, url, toc=toc_from(frag), pager=pager_for(url), kicker=kicker))


def build_front(f):
    url = url_front(f["slug"])
    frag, _ = process(read("content/front/%s.md" % f["slug"]), 1, url, f["title"])
    kicker = '<header class="chead"><h1>%s</h1></header>' % esc(f["title"])
    write(url, shell(f["title"], frag, 1, url, toc=toc_from(frag), pager=pager_for(url), kicker=kicker))


def build_part(pid):
    p = PARTS[pid]
    url = url_part(pid)
    frag, _ = process(read("content/front/part-%s.md" % pid.lower()), 0, url, p["title"])
    cards = "".join(
        '<li><a href="%s"><span class="cn">%d</span><span class="ct">%s</span></a></li>' % (url_chapter(n), n, esc(CH[n]["title"]))
        for n in p["chapters"])
    body = '<header class="chead"><h1>%s</h1></header>%s<h2>Chapters</h2><ol class="cardlist">%s</ol>' % (esc(p["title"]), frag, cards)
    write(url, shell(p["title"], body, 0, url, pager=pager_for(url)))


def build_appendix(a):
    url = url_app(a["letter"])
    frag, ne = process(read("content/appendices/%s.md" % a["slug"]), 1, url, "Appendix %s: %s" % (a["letter"], a["title"]))
    kicker = '<header class="chead"><p class="num">Appendix %s</p><h1>%s</h1></header>' % (a["letter"], esc(a["title"]))
    write(url, shell("Appendix %s: %s" % (a["letter"], a["title"]), frag, 1, url, toc=toc_from(frag), pager=pager_for(url), kicker=kicker, wide=False))


def build_glossary():
    url = URL_GLOSSARY
    frag, _ = process(read("content/glossary.md"), 1, url, "Glossary")
    write(url, shell("Glossary", '<header class="chead"><h1>Glossary</h1></header>' + frag, 1, url, pager=pager_for(url)))


def file_size(path):
    s = os.path.getsize(os.path.join(ROOT, path))
    return "%d KB" % max(1, round(s / 1024))


def build_downloads():
    url = URL_DOWNLOADS
    items = BOOK["downloads"]
    cards = []
    for d in items:
        path = "downloads/" + d["file"]
        if not os.path.exists(os.path.join(ROOT, path)):
            print("  warning: missing download", path)
            continue
        ext = d["file"].rsplit(".", 1)[-1].upper()
        extra = ""
        if d.get("preview"):
            extra = ' <a class="btn ghost" href="%s">Preview (PDF)</a>' % esc(d["preview"])
        cards.append(
            '<li class="dl"><div><h2>%s</h2><p>%s</p><p class="dl-use"><strong>Use it:</strong> %s</p></div>'
            '<div class="dl-actions"><a class="btn" href="%s" download>Download %s <small>%s</small></a>%s</div></li>'
            % (esc(d["title"]), esc(d["desc"]), esc(d["use"]), esc(d["file"]), ext, file_size(path), extra))
    body = ('<header class="chead"><h1>Downloads</h1></header>'
            '<p class="lede">Print these. Fill them in. Keep them beside you every time you research. Everything here is free to use and to share in class.</p>'
            '<ul class="dllist">%s</ul>'
            % "".join(cards))
    write(url, shell("Downloads", body, 1, url, pager=pager_for(url)))


def build_search():
    url = URL_SEARCH
    write("search/index.json", json.dumps(SEARCH, ensure_ascii=False))
    body = ('<header class="chead"><h1>Search the book</h1></header>'
            '<p class="lede">Every chapter, appendix, and front-matter page, searched in your browser. Nothing you type leaves this page.</p>'
            '<form class="searchform" role="search" onsubmit="return false"><label for="q" class="visually-hidden">Search terms</label>'
            '<input id="q" type="search" placeholder="e.g. adverse authority, Skidmore, research map" autocomplete="off" autofocus>'
            '</form><p id="search-status" class="search-status" role="status" aria-live="polite"></p><ol id="results" class="results"></ol>')
    write(url, shell("Search", body, 1, url, pager=pager_for(url)))


def build_404():
    # A missing address can sit at any depth, so the page finds the site's root itself: on a GitHub
    # Pages project site that is the first path segment, anywhere else it is "/".
    head = ('<script>(function(){var p=location.pathname.split("/"),b=document.createElement("base");'
            'b.setAttribute("href",/\\.github\\.io$/.test(location.hostname)&&p[1]?"/"+p[1]+"/":"/");document.head.appendChild(b);})();</script>\n')
    body = ('<div class="lost"><div class="qmarks" aria-hidden="true"><span>?</span><span>?</span><span>?</span></div>'
            '<p class="lost-kick">404 F. Supp. Nowhere</p>'
            '<h1>Authority not found.</h1>'
            '<p class="lost-lede">We checked every reporter in every jurisdiction. Nothing binding, nothing persuasive, '
            'not even a headnote. This page cannot be cited for anything.</p>'
            '<p class="lost-actions"><a class="btn" href="index.html">Return to binding authority</a> '
            '<a class="btn ghost" href="search/index.html">Motion to search</a></p>'
            '<p class="lost-foot">Objection sustained. The address you entered is stricken from the record.</p></div>')
    write("404.html", shell("Authority not found", body, 0, "404.html", head=head, body_class="home"))


def build_home():
    url = URL_HOME

    def chapter_li(n):
        c = CH[n]
        ne = STATS["embeds"].get(n, 0)
        chip = ""
        return '<li><a href="%s"><span class="cn">%d</span><span class="ct">%s</span></a>%s</li>' % (url_chapter(n), n, esc(c["title"]), chip)

    front = "".join('<li><a href="%s"><span class="ct">%s</span></a></li>' % (url_front(f["slug"]), esc(f["title"])) for f in BOOK["front"])
    apps = "".join('<li><a href="%s"><span class="cn">%s</span><span class="ct">%s</span></a></li>' % (url_app(a["letter"]), a["letter"], esc(a["title"].split(":")[0])) for a in BOOK["appendices"])
    body = """
<header class="cover">
<div class="qmarks" aria-hidden="true"><span>?</span><span>?</span><span>?</span></div>
<p class="cover-kick">Ask. Answer. Repeat.</p>
<h1>%(title)s</h1>
<p class="cover-sub">Making the hidden curriculum of the research process visible</p>
<p class="cover-by">By %(author)s</p>
</header>
<div class="cover-intro">
<p class="lede">Ask one question. Find the answer. Write it down, and let that answer tell you what to ask next. Repeat until no substantive question remains. The <em>question</em> drives the research, whatever database happens to be open.</p>
<p>This edition asks you to do things as you read. Change the courtroom and watch the same authority gain or lose its force. Run a search two ways and count what each one misses. Take a paragraph apart into the questions that built it. Read with your hands on the page.</p>
<p class="cover-go"><a class="btn" href="%(first)s">Start reading</a></p>
</div>
<h2>Start here</h2><ul class="cardlist plain">%(front)s</ul>
<h2><a href="%(p1)s">%(p1t)s</a></h2><ol class="cardlist">%(c1)s</ol>
<h2><a href="%(p2)s">%(p2t)s</a></h2><ol class="cardlist">%(c2)s</ol>
<h2>Appendices and resources</h2><ul class="cardlist">%(apps)s
<li><a href="%(gl)s"><span class="cn">&#9733;</span><span class="ct">Glossary</span></a></li>
<li><a href="%(dl)s"><span class="cn">&darr;</span><span class="ct">Downloads: tip sheet, log template, worked example</span></a></li></ul>
""" % {"title": esc(TITLE), "author": esc(BOOK["author"]), "first": url_front(BOOK["front"][0]["slug"]), "dl": URL_DOWNLOADS, "gl": URL_GLOSSARY, "front": front, "p1": url_part("I"), "p1t": esc(PARTS["I"]["title"]),
       "p2": url_part("II"), "p2t": esc(PARTS["II"]["title"]), "apps": apps,
       "c1": "".join(chapter_li(n) for n in PARTS["I"]["chapters"]), "c2": "".join(chapter_li(n) for n in PARTS["II"]["chapters"])}
    write(url, shell("Contents", body, 0, url, pager=pager_for(url), body_class="home"))


# --------------------------------------------------------------------------------------
# Generated download: Key Takeaways by Chapter
# --------------------------------------------------------------------------------------
def build_study_guide():
    out = ["---\ntitle: \"The Question Method of Legal Research: Key Takeaways and Common Pitfalls by Chapter\"\nauthor: \"%s\"\n---\n" % BOOK["author"],
           "A study aid assembled automatically from the chapters. Use it to review before an exam or to check that you can say, in your own words, what each chapter was for.\n"]
    for n in sorted(CH):
        md = read("content/chapters/ch-%02d.md" % n)
        out.append("\n# Chapter %d: %s\n" % (n, CH[n]["title"]))
        m = re.search(r"::: \{\.takeaways\}\n(.*?)\n:::", md, re.S)
        if m:
            body = re.sub(r"^\[[^\]]*\]\{\.box-title\}\s*", "", m.group(1)).strip()
            out.append("## Key takeaways\n\n" + body + "\n")
        m = re.search(r"^## Common Pitfalls\n\n(.*?)(?=\n## )", md, re.S | re.M)
        if m:
            out.append("## Common pitfalls\n\n" + m.group(1).strip() + "\n")
    text = re.sub(r"\[([^\]]*)\]\{\.[a-z-]+\}", r"\1", "\n".join(out))
    tmp = os.path.join(ROOT, "downloads", "_study_guide.md")
    write("downloads/_study_guide.md", text)
    subprocess.run(["pandoc", "-f", "markdown+smart", tmp, "-o", os.path.join(ROOT, "downloads", "Key_Takeaways_and_Pitfalls_by_Chapter.docx")], check=True)
    os.remove(tmp)
    ck = open(os.path.join(ROOT, "content/extras/ch17-scholarship-checklist.md"), encoding="utf-8").read().replace("## The Scholarship", "# The Scholarship", 1)
    write("downloads/_checklist.md", ck)
    subprocess.run(["pandoc", "-f", "markdown+smart", os.path.join(ROOT, "downloads", "_checklist.md"), "-o", os.path.join(ROOT, "downloads", "Scholarship_Research_Checklist.docx")], check=True)
    os.remove(os.path.join(ROOT, "downloads", "_checklist.md"))


def build_whole_book():
    """One DOCX of the whole book, for reading offline or printing. Interactives become a one-line pointer."""
    parts = ['---\ntitle: "%s"\nsubtitle: "%s"\nauthor: "%s"\n---\n' % (TITLE, BOOK["subtitle"], BOOK["author"])]
    def clean(md):
        # in-text interactives print as their own content (the list or passage), under a one-line label
        md = re.sub(r'(?m)^::: \{\.try kind="(\w+)"(?: title="([^"]*)")?[^}]*\}\s*$',
                    lambda m: ("**%s**\n" % m.group(2)) if m.group(2) else "", md)
        md = re.sub(r"\[((?:[^\[\]]|\[[^\]]*\])*)\]\{\.m\b[^}]*\}", r"\1", md)
        md = re.sub(r"\[((?:[^\[\]]|\\\[|\\\])*)\]\{\.flag\}", "", md)        # draft flags never go in the file
        md = re.sub(r"\[([^\]]*)\]\{\.box-title\}", r"**\1**", md)
        md = re.sub(r"\[([^\]]*)\]\{\.gloss\}", r"\1", md)
        md = re.sub(r"(?m)^::: \{[^}]*\}\s*$", "", md)
        md = re.sub(r"(?m)^:::\s*$", "", md)
        md = re.sub(r"```\{=html\}.*?```", "", md, flags=re.S)
        return re.sub(r"(?m)^(#+) ", lambda m: "#" * (len(m.group(1)) + 1) + " ", md)   # chapter title is the H1
    for f in BOOK["front"]:
        parts.append("\n# %s\n\n%s" % (f["title"], clean(read("content/front/%s.md" % f["slug"]))))
    for pid in ("I", "II"):
        parts.append("\n# %s\n\n%s" % (PARTS[pid]["title"], clean(read("content/front/part-%s.md" % pid.lower()))))
        for n in PARTS[pid]["chapters"]:
            parts.append("\n# Chapter %d: %s\n\n%s" % (n, CH[n]["title"], clean(read("content/chapters/ch-%02d.md" % n))))
    for a in BOOK["appendices"]:
        parts.append("\n# Appendix %s: %s\n\n%s" % (a["letter"], a["title"], clean(read("content/appendices/%s.md" % a["slug"]))))
    tmp = os.path.join(ROOT, "downloads", "_book.md")
    write("downloads/_book.md", "\n".join(parts))
    subprocess.run(["pandoc", "-f", "markdown+fenced_divs+bracketed_spans+pipe_tables+smart", "--toc", "--toc-depth=2", tmp,
                    "-o", os.path.join(ROOT, "downloads", "The_Question_Method_of_Legal_Research.docx")], check=True)
    os.remove(tmp)


# --------------------------------------------------------------------------------------
# Checks
# --------------------------------------------------------------------------------------
def check():
    problems = []
    pages = []
    for dp, dn, fns in os.walk(ROOT):
        rp = os.path.relpath(dp, ROOT)
        if rp.split(os.sep)[0] in (".git", "content", "source", "scripts", "node_modules", ".github"):
            dn[:] = []
            continue
        for fn in fns:
            if fn.endswith(".html"):
                pages.append(os.path.join(dp, fn))
    for pg in pages:
        s = open(pg, encoding="utf-8").read()
        for m in re.finditer(r'(?:src|href)="(https?:)?//[^"]+"', s):
            problems.append("%s: external reference %s" % (os.path.relpath(pg, ROOT), m.group(0)))
        ids = re.findall(r' id="([^"]+)"', s)
        dup = {i for i in ids if ids.count(i) > 1}
        if dup:
            problems.append("%s: duplicate ids %s" % (os.path.relpath(pg, ROOT), sorted(dup)[:5]))
        for m in re.finditer(r'(?:href|src)="([^"#?]+)(#[^"]*)?"', s):
            u = m.group(1)
            if re.match(r"^(mailto:|data:|javascript:)", u) or u.startswith("/"):
                continue
            target = os.path.normpath(os.path.join(os.path.dirname(pg), u))
            if not os.path.exists(target):
                problems.append("%s: broken link %s" % (os.path.relpath(pg, ROOT), u))
            elif m.group(2) and target.endswith(".html"):
                t = open(target, encoding="utf-8").read()
                if ('id="%s"' % m.group(2)[1:]) not in t:
                    problems.append("%s: missing anchor %s%s" % (os.path.relpath(pg, ROOT), u, m.group(2)))
    return problems, len(pages)


# --------------------------------------------------------------------------------------
# Build manifest: a hash of every input, so CI can tell whether the committed site was
# rebuilt after the last edit without needing byte-identical output (pandoc versions and
# DOCX timestamps differ from machine to machine).
# --------------------------------------------------------------------------------------
MANIFEST = "build-manifest.json"
TEXT_EXTS = {".md", ".py", ".json", ".css", ".js", ".html", ".txt", ".svg", ".yml", ".csv"}


def source_hashes():
    import hashlib
    files = ["book.json", "build.py"]
    for sub in ("content", "assets", "downloads"):
        for dp, dn, fns in os.walk(os.path.join(ROOT, sub)):
            if "_archive" in dp:
                continue
            for fn in sorted(fns):
                rp = os.path.relpath(os.path.join(dp, fn), ROOT).replace(os.sep, "/")
                if sub == "downloads" and (fn == "index.html" or fn in GENERATED_DOWNLOADS):
                    continue
                files.append(rp)
    out = {}
    for rp in sorted(set(files)):
        with open(os.path.join(ROOT, rp), "rb") as f:
            data = f.read()
        if os.path.splitext(rp)[1].lower() in TEXT_EXTS:
            data = data.replace(b"\r\n", b"\n")   # Windows checkouts use CRLF; the hash must not care
        out[rp] = hashlib.sha256(data).hexdigest()
    return out


GENERATED_DOWNLOADS = {"Key_Takeaways_and_Pitfalls_by_Chapter.docx", "Scholarship_Research_Checklist.docx",
                       "The_Question_Method_of_Legal_Research.docx"}


def write_manifest():
    write(MANIFEST, json.dumps({"inputs": source_hashes()}, indent=1, sort_keys=True) + "\n")


def check_manifest():
    try:
        saved = json.load(open(os.path.join(ROOT, MANIFEST), encoding="utf-8"))["inputs"]
    except (OSError, ValueError, KeyError):
        return ["no %s: run python3 build.py and commit" % MANIFEST]
    now = source_hashes()
    changed = sorted(set(k for k in set(saved) | set(now) if saved.get(k) != now.get(k)))
    return ["%s changed since the last build: run python3 build.py and commit the output" % k for k in changed]


def main():
    if "--check" not in sys.argv:
        STATS["embeds"] = {}
        for n in sorted(CH):
            build_chapter(n)
        for f in BOOK["front"]:
            build_front(f)
        for pid in PARTS:
            build_part(pid)
        for a in BOOK["appendices"]:
            build_appendix(a)
        build_glossary()
        build_study_guide()
        build_whole_book()
        build_downloads()
        build_home()
        build_search()
        build_404()
        total = sum(STATS["embeds"].values())
        print("built: %d chapters, %d appendices, %d in-text interactives in chapters" % (len(CH), len(APP), total))
        if GLOSS_MISS:
            print("defined terms with no glossary entry (hover shows the defining sentence instead): " + "; ".join(sorted(GLOSS_MISS)))
        write_manifest()
    problems, npages = check()
    if "--check" in sys.argv:
        problems += check_manifest()
    print("checked %d pages" % npages)
    if problems:
        print("\n".join(" - " + p for p in problems[:60]))
        print("%d problem(s)" % len(problems))
        sys.exit(1)
    print("checks passed")


if __name__ == "__main__":
    main()