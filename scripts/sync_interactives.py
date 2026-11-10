#!/usr/bin/env python3
"""Vendor the interactive modules this book embeds, from the legal_research_interactive repo.

    python3 scripts/sync_interactives.py --src ../legal_research_interactive

What it does
  1. Reads book.json and collects every module the book embeds (and the glossary / toolkit
     pages it links to).
  2. Copies each module directory into interactives/ch-N/<slug>/ -- the same relative layout
     the modules already use (../../assets, ../../js), so no module code changes.
  3. Copies the shared assets/ and js/ folders once.
  4. Post-processes the copied HTML ONLY (the source repo is never touched):
       * links the stylesheet interactives/assets/embed.css, which hides the standalone site's
         masthead, footer and prev/next nav (the book supplies its own)
       * rewrites links that leave the module (chapter overviews, other modules, home) to the
         book's own pages, opening in the top window

Re-run after any change in the interactive repo. The vendored copy is committed so the book is
fully static and makes zero external requests (same FERPA stance as the interactive site).
"""
import argparse, json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "interactives")

SKIP_NAMES = {"build.py", "gen_courts.py", "README.md", "__pycache__", ".DS_Store"}

EMBED_CSS = """/* Embed mode: the book supplies its own masthead, footer and navigation. */
.skip, footer.foot, .modnav, .modmenu, #browse-menu-src, .masthead .brand { display: none !important; }
body.shell > header.masthead { display: none !important; }
.masthead .navlink[href$="index.html"][href^="../../index"], .masthead .navlink[href^="../../ch-"] { display: none !important; }
body { background: transparent; }
body.shell main, body.shell #main { padding-top: 8px; }
"""


RENUM = {}


def renumber_text(t):
    """The standalone site uses the original (registry) chapter numbers; the book has moved
    Legislative History and Advanced Administrative to the front of Part II. Translate the
    chapter labels that readers see inside the embedded modules."""
    if not RENUM:
        return t
    return re.sub(r"(\b(?:Chapters?|Ch\.)(?:\s|&nbsp;|\\u00a0|\u00a0)*)(\d{1,2})\b",
                  lambda m: m.group(1) + str(RENUM.get(int(m.group(2)), int(m.group(2)))), t)


def module_dirs(book):
    """Every distinct vendored directory the book's embeds point at."""
    dirs = {}
    for ch in book["chapters"] + book.get("appendices", []):
        for e in ch.get("embeds", []):
            dirs[os.path.dirname(e["module"])] = True
        for rs in ch.get("replace_sections", []):
            if rs.get("embed"):
                dirs[os.path.dirname(rs["embed"]["module"])] = True
    for item in book.get("extra_interactives", []):
        dirs[os.path.dirname(item["module"])] = True
    # the build reads embeds from the Markdown itself, so vendor whatever the pages reference
    content = os.path.join(ROOT, "content")
    for dp, _dn, fns in os.walk(content):
        if "_archive" in dp:
            continue
        for fn in fns:
            if fn.endswith(".md"):
                with open(os.path.join(dp, fn), encoding="utf-8") as f:
                    for m in re.finditer(r'\{\.interactive module="([^"]+)"', f.read()):
                        dirs[os.path.dirname(m.group(1))] = True
    return sorted(dirs)


def copytree(src, dst):
    if os.path.exists(dst):
        shutil.rmtree(dst)
    def ignore(_d, names):
        return [n for n in names if n in SKIP_NAMES]
    shutil.copytree(src, dst, ignore=ignore)


def rel_to_book(depth_from_book_root, path):
    return "../" * depth_from_book_root + path


def rewrite_html(path, kept_dirs):
    """path is inside interactives/. Add embed.css, rewrite outward links."""
    rel = os.path.relpath(path, OUT).replace(os.sep, "/")
    depth_in = rel.count("/")               # directories below interactives/
    to_assets = "../" * depth_in + "assets/embed.css"
    to_book = "../" * (depth_in + 1)        # up to the book root

    with open(path, encoding="utf-8") as f:
        s = f.read()
    if "assets/embed.css" not in s:
        s = s.replace("</head>", '<link rel="stylesheet" href="%s">\n</head>' % to_assets, 1)

    here_dir = os.path.dirname(rel)

    def fix(m):
        attr, q, url = m.group(1), m.group(2), m.group(3)
        if re.match(r"^(https?:|mailto:|#|javascript:|data:)", url) or url.endswith(".css") or url.endswith(".js"):
            return m.group(0)
        norm = os.path.normpath(os.path.join(here_dir, url.split("#")[0].split("?")[0])).replace(os.sep, "/")
        if norm.startswith(".."):
            # leaves interactives/ -> already a book path; leave alone
            return m.group(0)
        target = norm
        if os.path.isdir(os.path.join(OUT, target)) and not target.endswith("/"):
            target = target + "/"
        # Inside the vendored set? keep as is.
        top = target.split("/")[0]
        in_set = any(target.rstrip("/").startswith(d) for d in kept_dirs)
        shared = top in ("assets", "js")
        if in_set or shared:
            return m.group(0)
        # chapter overview -> book chapter page
        mch = re.match(r"^ch-(\d+)(/|$)", target)
        if mch:
            newn = RENUM.get(int(mch.group(1)), int(mch.group(1)))
            return '%s=%s%sch-%d/index.html%s target="_top"' % (attr, q, to_book, newn, q)
        if top in ("toolkit",):
            return '%s=%s%sdownloads/index.html%s target="_top"' % (attr, q, to_book, q)
        if top in ("appendices",):
            return '%s=%s%sindex.html%s target="_top"' % (attr, q, to_book, q)
        return '%s=%s%sindex.html%s target="_top"' % (attr, q, to_book, q)

    s = re.sub(r'(href)=(["\'])([^"\']+)\2', fix, s)
    with open(path, "w", encoding="utf-8") as f:
        f.write(s)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True, help="path to a checkout of legal_research_interactive")
    args = ap.parse_args()
    src = os.path.abspath(args.src)
    with open(os.path.join(ROOT, "book.json"), encoding="utf-8") as f:
        book = json.load(f)

    RENUM.update({int(k): v for k, v in book.get("renumber", {}).items()})
    os.makedirs(OUT, exist_ok=True)
    dirs = module_dirs(book)
    print("vendoring %d module directories" % len(dirs))
    for d in dirs:
        s_dir = os.path.join(src, d)
        if not os.path.isdir(s_dir):
            sys.exit("missing in source repo: " + d)
        copytree(s_dir, os.path.join(OUT, d))
    for shared in ("assets", "js"):
        copytree(os.path.join(src, shared), os.path.join(OUT, shared))
    with open(os.path.join(OUT, "assets", "embed.css"), "w", encoding="utf-8") as f:
        f.write(EMBED_CSS)

    n = 0
    for dp, _dn, fns in os.walk(OUT):
        if os.path.relpath(dp, OUT).split(os.sep)[0] in ("assets", "js"):
            continue
        for fn in fns:
            if fn.endswith(".html"):
                rewrite_html(os.path.join(dp, fn), dirs)
                n += 1
    # chapter labels inside the modules follow the book's numbering
    nrenum = 0
    for d in dirs:
        for dp, _dn, fns in os.walk(os.path.join(OUT, d)):
            for fn in fns:
                if fn.endswith((".html", ".js", ".json")):
                    fp = os.path.join(dp, fn)
                    t = open(fp, encoding="utf-8").read()
                    t2 = renumber_text(t)
                    if t2 != t:
                        open(fp, "w", encoding="utf-8").write(t2)
                        nrenum += 1
    print("renumbered chapter labels in %d module files" % nrenum)
    # provenance stamp
    try:
        import subprocess
        sha = subprocess.check_output(["git", "-C", src, "rev-parse", "HEAD"], text=True).strip()
    except Exception:
        sha = "unknown"
    with open(os.path.join(OUT, "SOURCE.txt"), "w", encoding="utf-8") as f:
        f.write("Vendored from caslaskowski/legal_research_interactive @ %s\n"
                "Do not hand-edit: re-run scripts/sync_interactives.py.\n" % sha)
    print("rewrote %d html pages; source commit %s" % (n, sha[:10]))


if __name__ == "__main__":
    main()
