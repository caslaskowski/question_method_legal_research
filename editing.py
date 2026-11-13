#!/usr/bin/env python3
"""A local editing interface for the book. No installs beyond Python 3.8+ and pandoc.

    python3 editing.py            # opens http://127.0.0.1:8765 in your browser
    python3 editing.py --port 9000 --no-browser

What you can do from the browser
  * Edit any page's text (chapters, appendices, front matter, part intros, the Chapter 17
    checklist, EDITING-NOTES.md) with a live preview rendered exactly as the site renders it.
  * Insert an in-text interactive (a quick check, a sorter, a clickable diagram, a search lab...),
    a Reflection Point, an Example, an Exercise, or a draft flag from the toolbar; remove an
    interactive from a page with one click.
  * Work through the yellow draft flags: keep the text and clear the flag, or delete the
    flagged text, page by page.
  * Change the book's title, subtitle, author, draft mode, chapter and appendix titles.
  * Manage the Downloads page: titles, descriptions, add or replace files, remove entries.
  * Build the site, preview it, and commit.

Everything runs on your machine; the server listens on 127.0.0.1 only and makes no external
requests. It edits the same files you would edit by hand (content/*.md, book.json,
downloads/), so nothing here is hidden from git.
"""
import argparse, base64, glob, html, importlib, json, os, re, subprocess, sys, threading, webbrowser
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs, unquote

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
sys.path.insert(0, ROOT)
import build as B                                   # the site builder; used for identical previews

SETTINGS_FILE = os.path.join(ROOT, ".editing-settings.json")
LOCK = threading.Lock()


# --------------------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------------------
def load_book():
    with open(os.path.join(ROOT, "book.json"), encoding="utf-8") as f:
        return json.load(f)


def save_book(book):
    with open(os.path.join(ROOT, "book.json"), "w", encoding="utf-8") as f:
        json.dump(book, f, indent=1, ensure_ascii=False)
        f.write("\n")


def load_settings():
    try:
        with open(SETTINGS_FILE, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def save_settings(s):
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(s, f, indent=1)


def pages():
    """Every editable page: id -> (kind, title, path relative to ROOT)."""
    book = load_book()
    out = []
    for fm in book["front"]:
        out.append(("front:" + fm["slug"], "front", fm["title"], "content/front/%s.md" % fm["slug"]))
    for pt in book["parts"]:
        out.append(("part:" + pt["id"], "part", pt["title"], "content/front/part-%s.md" % pt["id"].lower()))
    for ch in sorted(book["chapters"], key=lambda c: c["n"]):
        out.append(("ch:%d" % ch["n"], "chapter", "Chapter %d: %s" % (ch["n"], ch["title"]), "content/chapters/ch-%02d.md" % ch["n"]))
    for ap in book["appendices"]:
        out.append(("app:" + ap["slug"], "appendix", "Appendix %s: %s" % (ap["letter"], ap["title"]), "content/appendices/%s.md" % ap["slug"]))
    for fn in sorted(glob.glob(os.path.join(ROOT, "content", "extras", "*.md"))):
        slug = os.path.basename(fn)[:-3]
        out.append(("extra:" + slug, "extra", "Extra: " + slug, "content/extras/%s.md" % slug))
    out.append(("extra:glossary", "extra", "Glossary", "content/glossary.md"))
    out.append(("notes", "notes", "EDITING-NOTES.md", "EDITING-NOTES.md"))
    out.append(("readme", "notes", "README.md", "README.md"))
    return out


def page_path(pid):
    for i, _k, _t, path in pages():
        if i == pid:
            full = os.path.abspath(os.path.join(ROOT, path))
            if full.startswith(ROOT + os.sep):
                return full
    return None


def read_text(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def write_text(path, text):
    with open(path, "w", encoding="utf-8") as f:
        f.write(text if text.endswith("\n") else text + "\n")


FLAG_RE = re.compile(r"\[((?:[^\[\]]|\\\[|\\\])*)\]\{\.flag\}")


def flags_in(text):
    return [{"index": i, "text": m.group(1), "pos": m.start(), "line": text.count("\n", 0, m.start()) + 1,
             "context": text[max(0, m.start() - 80):m.start()].replace("\n", " ")}
            for i, m in enumerate(FLAG_RE.finditer(text))]


EMBED_RE = re.compile(r'::: \{\.try kind="([^"]+)"(?: title="([^"]*)")?[^}]*\}\n(.*?)\n?:::\n?', re.S)


def embeds_in(text):
    return [{"module": m.group(1), "title": m.group(2) or "", "pos": m.start()} for m in EMBED_RE.finditer(text)]


# The in-text interactives. Each is ordinary Markdown inside a ::: {.try kind="..."} block; assets/book.js
# turns it into the working interactive. The templates below are what the toolbar inserts.
TEMPLATES = [
    ("choice", "Quick check (one question)", "One question, with feedback on every option. Mark the right answer with [x].",
     '::: {.try kind="choice" title="TITLE"}\nThe question.\n\n- [x] The right answer\n    - Why it is right.\n- [ ] A tempting wrong answer\n    - Why it is wrong.\n- [ ] Another wrong answer\n    - Why it is wrong.\n:::'),
    ("sort", "Quick check (classify several items)", "Items the reader places in categories. End each item with its category in bold; the indented line is the explanation.",
     '::: {.try kind="sort" title="TITLE" bins="First | Second"}\n- An item **First**\n    - Why.\n- Another item **Second**\n    - Why.\n:::'),
    ("order", "Put it in order", "A numbered list written in the correct order. The page shuffles it.",
     '::: {.try kind="order" title="TITLE"}\nWhat to arrange, and from what to what.\n\n1. First\n    - Why it comes first.\n2. Second\n    - Why.\n3. Third\n    - Why.\n:::'),
    ("explore", "Explore (diagram)", 'Parts the reader selects to read about. layout = tabs, flow (left to right), stack (top to bottom), list, ring (a cycle; add edges="a | b | c" to label the arrows), or plot (give each part "Name | x, y" from 0 to 100).',
     '::: {.try kind="explore" layout="flow" title="TITLE"}\nOne line telling the reader what to do.\n\n- **First part | short tag.** What it is.\n- **Second part | short tag.** What it is.\n- **Third part | short tag.** What it is.\n:::'),
    ("annotate", "Read closely (annotated passage)", 'A passage with marked phrases. Wrap each phrase as [phrase]{.m label="..." note="..."}. Add layout="cite" for a citation shown part by part, and verdict="ok", "warn" or "bad" to colour a phrase once opened.',
     '::: {.try kind="annotate" title="TITLE" hint="What the reader should look for."}\nOrdinary text with [a marked phrase]{.m label="Label" note="What a researcher does with it."} and [another]{.m label="Label" note="Its note."}.\n:::'),
    ("search", "Search lab", 'A small practice database and a working terms-and-connectors search. Each bullet is a document; add "| on point" or "| off point" to its title. queries = preset searches separated by |. Add natural="..." for a natural-language mode.',
     '::: {.try kind="search" title="TITLE" queries="first AND second | first /s second"}\n- **Case One | on point.** The text of the summary. A second sentence.\n- **Case Two | off point.** The text of the summary.\n\nA closing line telling the reader what to notice.\n:::'),
    ("checklist", "Checklist", "Tick boxes that remember the reader's progress in their browser. A bold lead becomes the label.",
     '::: {.try kind="checklist" title="TITLE"}\n- [ ] **First step.** The detail.\n- [ ] **Second step.** The detail.\n:::'),
    ("reveal", "Your turn (write, then compare)", "The reader writes an answer, then opens a model answer. Everything after the --- line is the model answer.",
     '::: {.try kind="reveal" title="TITLE"}\nThe prompt.\n\n---\n\nThe model answer.\n:::'),
    ("tokens", "Watch it work (prediction)", 'A sentence completed one piece at a time. Each bullet lists candidates with percentages, most likely first; the indented line is the comment shown after that step.',
     '::: {.try kind="tokens" title="TITLE" start="The opening words"}\n- likely 70%; possible 20%; unlikely 5%\n    - What to notice.\n:::'),
    ("switch", "Change the setting", "A table the reader reads under different conditions. First column: the rows. Each further column: one setting. A cell may open with a bold status, such as **Binding.**",
     '::: {.try kind="switch" title="TITLE" label="Which court are you standing in?"}\nOne line telling the reader what to change.\n\n| Authority | First setting | Second setting |\n|---|---|---|\n| An item | **Binding.** Why. | **Persuasive.** Why. |\n:::'),
    ("resolve", "Bring it into focus (ambiguity resolver)", 'A quoted statute or regulation whose unclear phrases start out of focus and sharpen one research step at a time, writing a Research Log as the reader goes. Mark each phrase [phrase]{.m label="key"}; then one list item per key, "**key.** the research question", with nested steps "**Source | Kind.** finding". Kinds: Statute, Regulation, Case, Preamble, Secondary, Guidance, History, Gap (a Gap step last means the phrase stays open).',
     '::: {.try kind="resolve" title="TITLE" source="Where the quoted text comes from" hint="What the reader should do."}\nThe quoted text with [an unclear phrase]{.m label="phrase"} in it.\n\n- **phrase.** What does the text mean by this?\n    - **Definitions section, § 2 | Statute.** What the definition says, and the new question it raises.\n    - **Leading case, 123 U.S. 456 (2001) | Case.** How the court read it.\n:::'),
    ("cycle", "Watch the documents fill (research replay)", 'Replays a research demonstration while the research map, log, and annotated outline fill. One list item per cycle, "**Q1 | Exploratory, no-clue.** question", with nested lines led by Source, Found, Adds (map questions separated by |), Closes (map numbers answered), Outline (an entry), Note (a bracketed application note), Aside. macro="..." shows the macro question first.',
     '::: {.try kind="cycle" title="TITLE" macro="The big question the document must answer."}\n- **Q1 | Exploratory, no-clue.** The first question.\n    - **Source.** Where it was answered.\n    - **Found.** What it said.\n    - **Adds.** A new map question | Another\n- **Q2 | Focusing.** The second question.\n    - **Source.** The case.\n    - **Found.** The rule.\n    - **Closes.** 1\n    - **Outline.** The rule, paraphrased, with its citation.\n:::'),
    ("funnel", "Narrow the field (filters)", 'A results count that collapses as the reader applies filters. start= the opening count, goal= the readable count. Each item is "**Filter | ÷ 40.** why it helps".',
     '::: {.try kind="funnel" title="TITLE" start="48000" goal="300" unit="results"}\nOne line telling the reader what to do.\n\n- **First filter | ÷ 10.** Why it helps.\n- **Second filter | ÷ 4.** Why it helps.\n:::'),
    ("timeline", "Scrub the timeline", 'A slider over years with milestones that light up as the reader passes them. Each item is "**1975 | Place.** what happened". from=, to=, start= set the range and the opening year; count= names what is being counted.',
     '::: {.try kind="timeline" title="TITLE" from="1900" to="2000" start="1950" count="states"}\nOne line telling the reader what to watch.\n\n- **1931 | Wisconsin.** What happened.\n- **1975 | California.** What happened.\n:::'),
    ("path", "Choose the route (branching path)", 'A branching route with a running cost. Each item is a node, "**id | $0.30.** what happens here", with nested choices "**target-id.** the choice". start= names the first node. A node with no choices ends the route.',
     '::: {.try kind="path" title="TITLE" start="begin"}\n- **begin | $0.00.** Where you are and what you need.\n    - **a.** The first choice\n    - **b.** The second choice\n- **a | $0.50.** What that choice got you.\n- **b | $3.00.** What that one got you.\n:::'),
]


def available_modules():
    """What the 'Insert interactive' picker offers: one template per kind of in-text interactive."""
    return {"source": "the book's own in-text interactives",
            "modules": [{"module": k, "title": t, "desc": d, "template": tpl} for k, t, d, tpl in TEMPLATES]}


def run(cmd, timeout=600):
    try:
        p = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=timeout)
        return {"ok": p.returncode == 0, "output": (p.stdout + p.stderr).strip()}
    except subprocess.TimeoutExpired:
        return {"ok": False, "output": "timed out"}
    except OSError as e:
        return {"ok": False, "output": str(e)}


def preview_html(pid, md):
    """Render a page's Markdown the way build.py does, for the editor's preview pane."""
    importlib.reload(B)            # pick up book.json changes (draft flag, titles)
    depth = 0 if pid.startswith("part:") else 1
    url = {"part:I": "part-i.html", "part:II": "part-ii.html"}.get(pid, "x/index.html")
    if pid in ("notes", "readme"):
        frag = B.pandoc_html(md)
        base = "/site/"
    else:
        frag, _n = B.process(md, depth, url)
        base = "/site/" if depth == 0 else "/site/preview/"
    return ("<!doctype html><html lang='en'><head><meta charset='utf-8'><base href='%s'>"
            "<link rel='stylesheet' href='/site/assets/book.css'><style>body{padding:12px 18px;background:#fff}"
            ".page{border:0;box-shadow:none;padding:0}</style></head><body><main class='wrap'><article class='page'>%s"
            "</article></main><script src='/site/assets/book.js'></script></body></html>" % (base, frag))


def state():
    book = load_book()
    ps = []
    for pid, kind, title, path in pages():
        full = os.path.join(ROOT, path)
        text = read_text(full) if os.path.exists(full) else ""
        ps.append({"id": pid, "kind": kind, "title": title, "path": path, "flags": len(flags_in(text)),
                   "words": len(text.split()), "embeds": len(embeds_in(text))})
    git = run(["git", "rev-parse", "--abbrev-ref", "HEAD"], 20)
    return {"book": {k: book.get(k) for k in ("title", "subtitle", "author", "draft")},
            "chapters": [{"n": c["n"], "title": c["title"], "part": c["part"]} for c in sorted(book["chapters"], key=lambda c: c["n"])],
            "appendices": [{"slug": a["slug"], "letter": a["letter"], "title": a["title"]} for a in book["appendices"]],
            "parts": [{"id": p["id"], "title": p["title"]} for p in book["parts"]],
            "downloads": book.get("downloads", []),
            "pages": ps, "settings": load_settings(), "branch": git["output"] if git["ok"] else "?"}


# --------------------------------------------------------------------------------------
# HTTP
# --------------------------------------------------------------------------------------
class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _json(self, obj, code=200):
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _html(self, text, code=200):
        data = text.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        return json.loads(self.rfile.read(n).decode("utf-8")) if n else {}

    # ---- GET
    def do_GET(self):
        u = urlparse(self.path)
        q = parse_qs(u.query)
        if u.path == "/":
            return self._html(APP_HTML)
        if u.path == "/api/state":
            return self._json(state())
        if u.path == "/api/page":
            path = page_path(q.get("id", [""])[0])
            if not path or not os.path.exists(path):
                return self._json({"error": "unknown page"}, 404)
            text = read_text(path)
            return self._json({"md": text, "flags": flags_in(text), "embeds": embeds_in(text)})
        if u.path == "/api/flags":
            out = []
            for pid, _k, title, path in pages():
                full = os.path.join(ROOT, path)
                if os.path.exists(full) and pid not in ("notes", "readme"):
                    for fl in flags_in(read_text(full)):
                        fl.update({"page": pid, "page_title": title})
                        out.append(fl)
            return self._json(out)
        if u.path == "/api/modules":
            return self._json(available_modules())
        if u.path.startswith("/site/"):
            # the built site, served from the repo root so relative links and embeds work
            rel = unquote(u.path[len("/site/"):])
            if rel.startswith("preview/"):
                rel = rel[len("preview/"):]
            full = os.path.abspath(os.path.join(ROOT, rel))
            if not full.startswith(ROOT + os.sep) and full != ROOT:
                return self._json({"error": "forbidden"}, 403)
            if os.path.isdir(full):
                full = os.path.join(full, "index.html")
            if not os.path.exists(full):
                return self._html("<p>Not built yet. Use <b>Build</b> first.</p>", 404)
            self.path = "/" + os.path.relpath(full, ROOT).replace(os.sep, "/")
            return SimpleHTTPRequestHandler.do_GET(self)
        return self._json({"error": "not found"}, 404)

    # ---- POST
    def do_POST(self):
        u = urlparse(self.path)
        try:
            body = self._body()
        except ValueError:
            return self._json({"error": "bad json"}, 400)
        with LOCK:
            try:
                return self._json(self.handle_post(u.path, body))
            except Exception as e:      # surface the error in the UI rather than a dead request
                return self._json({"error": "%s: %s" % (type(e).__name__, e)}, 500)

    def handle_post(self, path, body):
        if path == "/api/page":
            full = page_path(body.get("id", ""))
            if not full:
                return {"error": "unknown page"}
            write_text(full, body.get("md", ""))
            return {"ok": True, "flags": flags_in(body.get("md", ""))}
        if path == "/api/preview":
            return {"html": preview_html(body.get("id", ""), body.get("md", ""))}
        if path == "/api/flag":
            full = page_path(body.get("page", ""))
            text = read_text(full)
            ms = list(FLAG_RE.finditer(text))
            i = int(body.get("index", -1))
            if not (0 <= i < len(ms)):
                return {"error": "flag not found; the page changed"}
            m = ms[i]
            action = body.get("action")
            if action == "keep":
                inner = m.group(1).replace("\\[", "[").replace("\\]", "]")
                text = text[:m.start()] + inner + text[m.end():]
            elif action == "delete":
                before, after = text[:m.start()], text[m.end():]
                # drop a now-empty italic/bold wrapper or a dangling leading space
                text = re.sub(r"[ \t]*$", "", before, count=1) + after
                text = re.sub(r"\n\*\*\n|\n\*\*\*\*\n|\n\*\n", "\n", text)
                text = re.sub(r"\n{3,}", "\n\n", text)
            else:
                return {"error": "unknown action"}
            write_text(full, text)
            return {"ok": True}
        if path == "/api/book":
            book = load_book()
            for k in ("title", "subtitle", "author"):
                if k in body and isinstance(body[k], str):
                    book[k] = body[k].strip()
            if "draft" in body:
                book["draft"] = bool(body["draft"])
            for ch in body.get("chapters", []):
                for c in book["chapters"]:
                    if c["n"] == int(ch["n"]) and ch.get("title", "").strip():
                        c["title"] = ch["title"].strip()
            for ap in body.get("appendices", []):
                for a in book["appendices"]:
                    if a["slug"] == ap["slug"] and ap.get("title", "").strip():
                        a["title"] = ap["title"].strip()
            for pt in body.get("parts", []):
                for p in book["parts"]:
                    if p["id"] == pt["id"] and pt.get("title", "").strip():
                        p["title"] = pt["title"].strip()
            if "downloads" in body:
                clean = []
                for d in body["downloads"]:
                    if d.get("file") and os.path.exists(os.path.join(ROOT, "downloads", os.path.basename(d["file"]))):
                        e = {"file": os.path.basename(d["file"]), "title": d.get("title", "").strip() or d["file"],
                             "desc": d.get("desc", "").strip(), "use": d.get("use", "").strip()}
                        if d.get("preview"):
                            e["preview"] = os.path.basename(d["preview"])
                        clean.append(e)
                book["downloads"] = clean
            save_book(book)
            return {"ok": True}
        if path == "/api/upload":
            name = os.path.basename(body.get("name", "")).replace(" ", "_")
            if not name or not re.match(r"^[\w.\-]+$", name) or name.startswith("."):
                return {"error": "file name must be letters, digits, dots, dashes, underscores"}
            data = base64.b64decode(body.get("b64", ""))
            if len(data) > 25 * 1024 * 1024:
                return {"error": "file is over 25 MB"}
            with open(os.path.join(ROOT, "downloads", name), "wb") as f:
                f.write(data)
            return {"ok": True, "file": name, "size": len(data)}
        if path == "/api/settings":
            s = load_settings()
            if "interactive_repo" in body:
                s["interactive_repo"] = body["interactive_repo"].strip()
            save_settings(s)
            return {"ok": True, "settings": s}
        if path == "/api/build":
            return run([sys.executable, "build.py"])
        if path == "/api/git":
            action = body.get("action")
            if action == "status":
                return run(["git", "status", "--short", "--branch"], 30)
            if action == "diff":
                return run(["git", "diff", "--stat"], 30)
            if action == "commit":
                msg = body.get("message", "").strip()
                if not msg:
                    return {"ok": False, "output": "Write a commit message first."}
                r = run(["git", "add", "-A"], 60)
                if not r["ok"]:
                    return r
                return run(["git", "commit", "-m", msg], 60)
            if action == "push":
                br = run(["git", "rev-parse", "--abbrev-ref", "HEAD"], 20)["output"]
                return run(["git", "push", "-u", "origin", br], 300)
            return {"error": "unknown git action"}
        return {"error": "not found"}


# --------------------------------------------------------------------------------------
# The single-page app
# --------------------------------------------------------------------------------------
APP_HTML = r"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Book editor</title>
<style>
:root{--teal:#135169;--teal-deep:#0d3d50;--teal-tint:#dcebf2;--ink:#262622;--ink-soft:#54534d;--rule:#cfcfcf;--paper:#eeeeee;--flag:#fff3a8;--spark:#8a4512;--bad:#8a1c00;--good:#2e6b34;}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;background:var(--paper);color:var(--ink);font-size:15px;line-height:1.45}
header{background:#fff;border-bottom:3px solid var(--teal);display:flex;align-items:center;gap:18px;padding:8px 18px;position:sticky;top:0;z-index:5}
header b{color:var(--teal-deep)}header nav a{margin-right:14px;color:var(--teal);text-decoration:none;font-weight:600}header nav a.on{text-decoration:underline}
header .right{margin-left:auto;font-size:.85em;color:var(--ink-soft)}
main{padding:16px 18px;max-width:1500px;margin:0 auto}
h1{font-size:1.4em;margin:.2em 0 .6em;color:var(--teal-deep)}h2{font-size:1.05em;margin:1.2em 0 .4em}
.card{background:#fff;border:1px solid var(--rule);border-radius:8px;padding:14px 18px;margin:0 0 14px}
table{border-collapse:collapse;width:100%}td,th{padding:6px 8px;border-bottom:1px solid var(--rule);text-align:left;vertical-align:top;font-size:.93em}th{font-size:.8em;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-soft)}
a{color:var(--teal)}button,.btn{font:inherit;font-size:.9em;padding:6px 12px;border-radius:5px;border:1.5px solid var(--teal);background:var(--teal);color:#fff;cursor:pointer;text-decoration:none;display:inline-block}
button.ghost{background:#fff;color:var(--teal)}button.warn{background:#fff;border-color:var(--bad);color:var(--bad)}button:disabled{opacity:.5;cursor:default}
input[type=text],input[type=search],input[type=number],textarea,select{font:inherit;padding:6px 8px;border:1px solid var(--rule);border-radius:5px;width:100%;background:#fff}
textarea.md{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;line-height:1.5;min-height:70vh;resize:vertical;white-space:pre;overflow-wrap:normal;overflow-x:auto;tab-size:4}
.editor{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:1000px){.editor{grid-template-columns:1fr}}
.toolbar{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px;align-items:center}.toolbar .sp{flex:1}
.pill{display:inline-block;font-size:.75em;padding:1px 8px;border-radius:99px;background:var(--teal-tint);color:var(--teal-deep);margin-left:6px}.pill.flag{background:var(--flag);color:#5a4700}
.status{font-size:.85em;color:var(--ink-soft);min-width:120px}.status.dirty{color:var(--spark);font-weight:600}.status.err{color:var(--bad)}
iframe.preview{width:100%;height:76vh;border:1px solid var(--rule);border-radius:6px;background:#fff}
pre.out{background:#1e1e1e;color:#eee;padding:12px;border-radius:6px;font-size:12.5px;max-height:50vh;overflow:auto;white-space:pre-wrap}
.flagrow .ctx{color:var(--ink-soft);font-size:.85em}.flagrow .txt{background:var(--flag);padding:1px 4px;border-radius:3px}
.modal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9}.modal .box{background:#fff;border-radius:8px;width:min(900px,94vw);max-height:88vh;overflow:auto;padding:18px}
.mod{display:flex;gap:12px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--rule)}.mod .d{flex:1;font-size:.9em}.mod small{color:var(--ink-soft)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px 18px}@media(max-width:800px){.grid2{grid-template-columns:1fr}}
label.f{display:block;font-size:.8em;color:var(--ink-soft);margin:8px 0 2px}
.dl{border:1px solid var(--rule);border-radius:6px;padding:10px 12px;margin:0 0 10px;background:#fafaf8}
.help{font-size:.85em;color:var(--ink-soft)}
</style></head><body>
<header><b>Book editor</b><nav><a href="#/">Pages</a><a href="#/flags">Flags</a><a href="#/book">Book &amp; titles</a><a href="#/downloads">Downloads</a><a href="#/build">Build &amp; publish</a><a href="/site/" target="_blank">Open the built site ↗</a></nav><span class="right" id="branch"></span></header>
<main id="main"></main>
<script>
const $ = (s, r=document) => r.querySelector(s);
const esc = s => String(s==null?"":s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const unesc = s => String(s).replace(/\\([\[\]])/g, "$1");
const api = (p, body) => fetch(p, body ? {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body)} : {}).then(r => r.json());
let S = null, dirty = false;
window.addEventListener("beforeunload", e => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

async function refresh() { S = await api("/api/state"); $("#branch").textContent = "branch " + S.branch + (S.book.draft ? " · draft mode on" : " · draft mode off"); }
function nav(on) { document.querySelectorAll("header nav a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === on)); }
async function route() {
  if (dirty && !confirm("You have unsaved changes. Leave the page anyway?")) { return; }
  dirty = false;
  if (!S) await refresh();
  const h = location.hash || "#/";
  const m = h.match(/^#\/page\/(.+)$/);
  if (m) return editor(decodeURIComponent(m[1]));
  nav(h);
  if (h === "#/flags") return flagsView();
  if (h === "#/book") return bookView();
  if (h === "#/downloads") return downloadsView();
  if (h === "#/build") return buildView();
  return pagesView();
}
window.addEventListener("hashchange", route);

/* ---------- pages ---------- */
function pagesView() {
  const kinds = [["front","Front matter"],["part","Part introductions"],["chapter","Chapters"],["appendix","Appendices"],["extra","Extras"],["notes","Working documents"]];
  let h = `<h1>Pages</h1><p class="help">Click a page to edit its text. Counts: words · interactives in the text · draft flags still open.</p>`;
  for (const [k, label] of kinds) {
    const ps = S.pages.filter(p => p.kind === k);
    if (!ps.length) continue;
    h += `<div class="card"><h2>${label}</h2><table>${ps.map(p => `<tr><td><a href="#/page/${encodeURIComponent(p.id)}">${esc(p.title)}</a></td><td>${p.words.toLocaleString()} words</td><td>${p.embeds ? p.embeds + " interactive" + (p.embeds>1?"s":"") : ""}</td><td>${p.flags ? `<span class="pill flag">${p.flags} flag${p.flags>1?"s":""}</span>` : ""}</td><td class="help">${esc(p.path)}</td></tr>`).join("")}</table></div>`;
  }
  $("#main").innerHTML = h;
}

/* ---------- editor ---------- */
const SNIPPETS = {
  reflection: `\n::: {.callout}\n**Reflection Point.** QUESTION *(A short answer appears in Appendix I.)*\n:::\n`,
  example: `\n::: {.callout}\n[Example]{.box-title}\n\nTEXT\n:::\n`,
  exercise: `\n::: {.exercise #ex-N-N}\n### Exercise N.N — TITLE\n\nTASK\n\n**Deliverable:** WHAT TO HAND IN.\n\n**Self-check:** HOW TO KNOW IT PASSES.\n:::\n`,
  takeaways: `\n::: {.takeaways}\n[Key Takeaways]{.box-title}\n\n- POINT\n- POINT\n:::\n`,
  h2: `\n## HEADING\n\n`, h3: `\n### HEADING\n\n`,
};
async function editor(pid) {
  nav("#/");
  const info = S.pages.find(p => p.id === pid);
  if (!info) { $("#main").innerHTML = "<p>Unknown page.</p>"; return; }
  const data = await api("/api/page?id=" + encodeURIComponent(pid));
  if (data.error) { $("#main").innerHTML = "<p>" + esc(data.error) + "</p>"; return; }
  const plain = pid === "notes" || pid === "readme";
  $("#main").innerHTML = `
  <h1>${esc(info.title)} <span class="pill">${esc(info.path)}</span></h1>
  <div class="toolbar">
    ${plain ? "" : `<button class="ghost" data-ins="h2">Section ##</button><button class="ghost" data-ins="h3">Subsection ###</button>
    <button class="ghost" data-ins="reflection">Reflection Point</button><button class="ghost" data-ins="example">Example box</button>
    <button class="ghost" data-ins="exercise">Exercise</button><button class="ghost" data-ins="takeaways">Key Takeaways</button>
    <button class="ghost" id="ins-interactive">Insert interactive…</button><button class="ghost" id="wrap-flag">Flag selection</button>`}
    <span class="sp"></span><span class="status" id="st">Saved</span><button id="save">Save (Ctrl+S)</button>
  </div>
  <div class="editor">
    <div><textarea class="md" id="md" spellcheck="true"></textarea>
      <div id="side"></div></div>
    <div><div class="help" style="margin:0 0 6px">Preview, rendered the way the site renders it. Interactives work in the preview just as they do on the site.</div><iframe class="preview" id="pv" title="Preview"></iframe></div>
  </div>`;
  const ta = $("#md"); ta.value = data.md;
  const st = $("#st");
  function setDirty(v) { dirty = v; st.textContent = v ? "Unsaved changes" : "Saved"; st.className = "status" + (v ? " dirty" : ""); }
  let pvTimer;
  async function preview() {
    const r = await api("/api/preview", {id: pid, md: ta.value});
    const pv = $("#pv");
    if (r.error) { st.textContent = r.error; st.className = "status err"; return; }
    const scroll = pv.contentWindow ? pv.contentWindow.scrollY : 0;
    pv.srcdoc = r.html;
    pv.onload = () => { try { pv.contentWindow.scrollTo(0, scroll); } catch (e) {} };
  }
  function side() {
    const fl = flagsOf(ta.value), em = embedsOf(ta.value);
    let h = "";
    if (em.length) h += `<div class="card"><h2>Interactives on this page</h2><table>${em.map((e, i) => `<tr><td><b>${esc(e.title)}</b><br><small>${esc(e.module)}</small></td><td><button class="warn" data-rm="${i}">Remove</button></td></tr>`).join("")}</table></div>`;
    if (fl.length) h += `<div class="card"><h2>Draft flags on this page</h2><table>${fl.map((f, i) => `<tr class="flagrow"><td>line ${f.line}<br><span class="ctx">…${esc(f.context.slice(-60))}</span> <span class="txt">${esc(unesc(f.text))}</span></td><td><button class="ghost" data-fl="keep:${i}">Keep text, clear flag</button> <button class="warn" data-fl="delete:${i}">Delete text</button></td></tr>`).join("")}</table><p class="help">These act on the editor text; save afterwards.</p></div>`;
    $("#side").innerHTML = h;
    $("#side").querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { const e = embedsOf(ta.value)[+b.dataset.rm]; ta.value = ta.value.slice(0, e.pos) + ta.value.slice(e.end); changed(); });
    $("#side").querySelectorAll("[data-fl]").forEach(b => b.onclick = () => { const [act, i] = b.dataset.fl.split(":"); const f = flagsOf(ta.value)[+i]; ta.value = ta.value.slice(0, f.pos) + (act === "keep" ? f.text.replace(/\\\[/g,"[").replace(/\\\]/g,"]") : "") + ta.value.slice(f.end); changed(); });
  }
  function changed() { setDirty(true); clearTimeout(pvTimer); pvTimer = setTimeout(() => { preview(); side(); }, 500); }
  ta.addEventListener("input", changed);
  async function save() {
    const r = await api("/api/page", {id: pid, md: ta.value});
    if (r.error) { st.textContent = r.error; st.className = "status err"; return; }
    setDirty(false); const p = S.pages.find(p => p.id === pid); if (p) { p.flags = r.flags.length; p.words = ta.value.split(/\s+/).length; }
  }
  $("#save").onclick = save;
  document.onkeydown = e => { if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save(); } };
  function insertAtCursor(text) { const s = ta.selectionStart, e = ta.selectionEnd; ta.value = ta.value.slice(0, s) + text + ta.value.slice(e); ta.selectionStart = ta.selectionEnd = s + text.length; ta.focus(); changed(); }
  document.querySelectorAll("[data-ins]").forEach(b => b.onclick = () => insertAtCursor(SNIPPETS[b.dataset.ins]));
  const wf = $("#wrap-flag"); if (wf) wf.onclick = () => { const s = ta.selectionStart, e = ta.selectionEnd; const sel = ta.value.slice(s, e) || "NOTE"; ta.value = ta.value.slice(0, s) + "[" + sel + "]{.flag}" + ta.value.slice(e); changed(); ta.focus(); };
  const ii = $("#ins-interactive"); if (ii) ii.onclick = () => pickModule(m => insertAtCursor("\n" + m.template + "\n"));
  preview(); side(); setDirty(false);
}
function flagsOf(t) { const re = /\[((?:[^\[\]]|\\\[|\\\])*)\]\{\.flag\}/g, out = []; let m; while ((m = re.exec(t))) { const pos = m.index; out.push({text: m[1], pos, end: pos + m[0].length, line: t.slice(0, pos).split("\n").length, context: t.slice(Math.max(0, pos - 80), pos).replace(/\n/g, " ")}); } return out; }
function embedsOf(t) { const re = /::: \{\.try kind="([^"]+)"(?: title="([^"]*)")?[^}]*\}\n[\s\S]*?\n?:::\n?/g, out = []; let m; while ((m = re.exec(t))) out.push({module: m[1], title: m[2] || "(untitled)", pos: m.index, end: m.index + m[0].length}); return out; }

async function pickModule(cb) {
  const r = await api("/api/modules");
  const box = document.createElement("div"); box.className = "modal";
  box.innerHTML = `<div class="box"><h2>Insert an interactive</h2><p class="help">Each kind is ordinary text inside a <code>::: {.try ...}</code> block, so you edit it like the rest of the chapter. Insert a template, then replace its placeholder text. Keep each one short enough to fit on a single screen.</p>
  <input type="search" id="mq" placeholder="filter"><div id="ml"></div><p><button class="ghost" id="mclose">Cancel</button></p></div>`;
  document.body.appendChild(box);
  function list() {
    const q = $("#mq").value.toLowerCase();
    const mods = r.modules.map((m, i) => [m, i]).filter(([m]) => !q || (m.title + " " + m.module + " " + m.desc).toLowerCase().includes(q));
    $("#ml").innerHTML = mods.map(([m, i]) => `<div class="mod"><div class="d"><b>${esc(m.title)}</b> <span class="pill">${esc(m.module)}</span><br><small>${esc(m.desc)}</small></div><div><button data-i="${i}">Insert</button></div></div>`).join("") || "<p>No matches.</p>";
    $("#ml").querySelectorAll("[data-i]").forEach(b => b.onclick = () => { const m = r.modules[+b.dataset.i]; box.remove(); cb(m); });
  }
  $("#mq").oninput = list; $("#mclose").onclick = () => box.remove(); list();
}

/* ---------- flags ---------- */
async function flagsView() {
  const fl = await api("/api/flags");
  let h = `<h1>Draft flags <span class="pill flag">${fl.length} open</span></h1><p class="help">Yellow flags are placeholders, missing pincites, production notes, and draft passages. <b>Keep text</b> removes only the yellow marking; <b>Delete</b> removes the flagged text itself. Both save immediately. For anything more than that, open the page.</p>`;
  if (!fl.length) h += "<div class='card'>No flags left.</div>";
  let cur = "";
  for (const f of fl) {
    if (f.page !== cur) { if (cur) h += "</table></div>"; cur = f.page; h += `<div class="card"><h2>${esc(f.page_title)} <a class="help" href="#/page/${encodeURIComponent(f.page)}">open page</a></h2><table>`; }
    h += `<tr class="flagrow"><td>line ${f.line}<br><span class="ctx">…${esc(f.context.slice(-70))}</span> <span class="txt">${esc(unesc(f.text))}</span></td><td style="white-space:nowrap"><button class="ghost" data-a="keep" data-p="${esc(f.page)}" data-i="${f.index}">Keep text</button> <button class="warn" data-a="delete" data-p="${esc(f.page)}" data-i="${f.index}">Delete</button></td></tr>`;
  }
  if (cur) h += "</table></div>";
  $("#main").innerHTML = h;
  document.querySelectorAll("[data-a]").forEach(b => b.onclick = async () => { const r = await api("/api/flag", {page: b.dataset.p, index: +b.dataset.i, action: b.dataset.a}); if (r.error) alert(r.error); await refresh(); flagsView(); });
}

/* ---------- book & titles ---------- */
function bookView() {
  const b = S.book;
  $("#main").innerHTML = `<h1>Book &amp; titles</h1>
  <div class="card"><div class="grid2">
    <div><label class="f">Title</label><input type="text" id="b-title" value="${esc(b.title)}"></div>
    <div><label class="f">Subtitle</label><input type="text" id="b-subtitle" value="${esc(b.subtitle)}"></div>
    <div><label class="f">Author</label><input type="text" id="b-author" value="${esc(b.author)}"></div>
    <div><label class="f">Draft mode</label><label><input type="checkbox" id="b-draft" ${b.draft ? "checked" : ""}> Show the yellow draft bar and flags on the built site</label></div>
  </div></div>
  <div class="card"><h2>Part titles</h2>${S.parts.map(p => `<label class="f">Part ${p.id}</label><input type="text" data-part="${p.id}" value="${esc(p.title)}">`).join("")}</div>
  <div class="card"><h2>Chapter titles</h2><p class="help">Numbers and order are fixed here; renumbering touches every cross-reference and is done in <code>book.json</code> plus the import script (see README).</p><table>${S.chapters.map(c => `<tr><td style="width:90px">Chapter ${c.n}<br><small>Part ${c.part}</small></td><td><input type="text" data-ch="${c.n}" value="${esc(c.title)}"></td></tr>`).join("")}</table></div>
  <div class="card"><h2>Appendix titles</h2><table>${S.appendices.map(a => `<tr><td style="width:90px">Appendix ${a.letter}</td><td><input type="text" data-app="${a.slug}" value="${esc(a.title)}"></td></tr>`).join("")}</table></div>
  <p><button id="b-save">Save</button> <span class="status" id="b-st"></span></p>`;
  $("#b-save").onclick = async () => {
    const body = {title: $("#b-title").value, subtitle: $("#b-subtitle").value, author: $("#b-author").value, draft: $("#b-draft").checked,
      parts: [...document.querySelectorAll("[data-part]")].map(i => ({id: i.dataset.part, title: i.value})),
      chapters: [...document.querySelectorAll("[data-ch]")].map(i => ({n: +i.dataset.ch, title: i.value})),
      appendices: [...document.querySelectorAll("[data-app]")].map(i => ({slug: i.dataset.app, title: i.value}))};
    const r = await api("/api/book", body); $("#b-st").textContent = r.error || "Saved. Build to apply."; await refresh();
  };
}

/* ---------- downloads ---------- */
function downloadsView() {
  const d = S.downloads;
  const row = (x, i) => `<div class="dl" data-i="${i}"><div class="grid2">
    <div><label class="f">File (in downloads/)</label><input type="text" data-k="file" value="${esc(x.file)}"></div>
    <div><label class="f">Preview file (optional, e.g. a PDF)</label><input type="text" data-k="preview" value="${esc(x.preview || "")}"></div>
    <div><label class="f">Title</label><input type="text" data-k="title" value="${esc(x.title)}"></div>
    <div><label class="f">Use it:</label><input type="text" data-k="use" value="${esc(x.use || "")}"></div>
    <div style="grid-column:1/-1"><label class="f">Description</label><textarea rows="2" data-k="desc">${esc(x.desc || "")}</textarea></div></div>
    <p><button class="warn" data-del="${i}">Remove from the page</button> <button class="ghost" data-up="${i}">Move up</button></p></div>`;
  $("#main").innerHTML = `<h1>Downloads</h1><p class="help">Two of these files are regenerated on every build (Key Takeaways and the Scholarship checklist); their titles and descriptions are still yours to edit. Removing an entry hides it from the page; it does not delete the file.</p>
  <div id="dls">${d.map(row).join("")}</div>
  <div class="card"><h2>Add a file</h2><input type="file" id="up"> <button class="ghost" id="upbtn">Upload to downloads/</button> <span id="upst" class="status"></span><p class="help">After uploading, a new entry appears below for its title and description. Uploading a file with the same name replaces it (this is how you update the tip sheet).</p></div>
  <p><button id="d-save">Save downloads page</button> <span class="status" id="d-st"></span></p>`;
  function collect() { return [...document.querySelectorAll("#dls .dl")].map(div => { const o = {}; div.querySelectorAll("[data-k]").forEach(i => o[i.dataset.k] = i.value); return o; }); }
  function rebind() {
    document.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { S.downloads = collect(); S.downloads.splice(+b.dataset.del, 1); downloadsView(); });
    document.querySelectorAll("[data-up]").forEach(b => b.onclick = () => { S.downloads = collect(); const i = +b.dataset.up; if (i > 0) { [S.downloads[i-1], S.downloads[i]] = [S.downloads[i], S.downloads[i-1]]; } downloadsView(); });
  }
  rebind();
  $("#upbtn").onclick = () => {
    const f = $("#up").files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = async () => { const r = await api("/api/upload", {name: f.name, b64: rd.result.split(",")[1]}); $("#upst").textContent = r.error || ("Uploaded " + r.file + " (" + Math.round(r.size/1024) + " KB)"); if (!r.error) { S.downloads = collect(); if (!S.downloads.some(x => x.file === r.file)) S.downloads.push({file: r.file, title: r.file, desc: "", use: ""}); downloadsView(); } };
    rd.readAsDataURL(f);
  };
  $("#d-save").onclick = async () => { const r = await api("/api/book", {downloads: collect()}); $("#d-st").textContent = r.error || "Saved. Build to apply."; await refresh(); };
}

/* ---------- build & publish ---------- */
function buildView() {
  $("#main").innerHTML = `<h1>Build &amp; publish</h1>
  <div class="card"><p><button id="build">Build the site</button> <a class="btn" href="/site/" target="_blank">Open the built site ↗</a></p>
  <p class="help">Build turns content/ into the HTML pages and runs the checks (links, anchors, no external requests).</p><pre class="out" id="out">Ready.</pre></div>
  <div class="card"><h2>Git</h2><p><button class="ghost" id="g-status">Status</button> <button class="ghost" id="g-diff">What changed</button></p>
  <label class="f">Commit message</label><input type="text" id="g-msg" placeholder="e.g. Chapter 11: verify Kisor note; resolve figure flags"><p><button id="g-commit">Commit everything</button> <button class="ghost" id="g-push">Push</button></p><pre class="out" id="gout">—</pre></div>`;
  const out = $("#out"), gout = $("#gout");
  const go = async (btn, p, body, target) => { btn.disabled = true; target.textContent = "Running…"; const r = await api(p, body); target.textContent = (r.ok ? "OK\n" : "FAILED\n") + (r.output || r.error || ""); btn.disabled = false; await refresh(); };
  $("#build").onclick = e => go(e.target, "/api/build", {}, out);
  $("#g-status").onclick = e => go(e.target, "/api/git", {action: "status"}, gout);
  $("#g-diff").onclick = e => go(e.target, "/api/git", {action: "diff"}, gout);
  $("#g-commit").onclick = e => go(e.target, "/api/git", {action: "commit", message: $("#g-msg").value}, gout);
  $("#g-push").onclick = e => go(e.target, "/api/git", {action: "push"}, gout);
}
route();
</script></body></html>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--no-browser", action="store_true")
    args = ap.parse_args()
    if subprocess.run(["pandoc", "--version"], capture_output=True).returncode != 0:
        sys.exit("pandoc is required (it renders the preview and the site). Install it from https://pandoc.org.")
    srv = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    url = "http://127.0.0.1:%d/" % args.port
    print("Book editor at %s  (Ctrl+C to stop)" % url)
    if not args.no_browser:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")


if __name__ == "__main__":
    main()
