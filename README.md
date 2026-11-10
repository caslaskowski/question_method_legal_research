# The Question Method of Legal Research: Interactive Edition

A static, GitHub Pages–ready edition of the textbook with interactive exercises embedded in the chapters where the book teaches the skill. First-pass draft.

**Start with [`EDITING-NOTES.md`](EDITING-NOTES.md).** It lists everything that needs a decision, a fix, or a fact-check, with Part II in the most detail.

## Editing without touching the code

```bash
python3 editing.py
```

opens a local page (http://127.0.0.1:8765, this computer only) where you can edit every chapter, appendix and front-matter page with a live preview, insert interactives and the book's boxes from a toolbar, clear draft flags, change titles and draft mode, manage the Downloads page, build the site, preview it, sync the interactives from the companion repo, and commit. It edits the same files listed below, so everything it does shows up in `git status`. Needs Python 3.8+ and pandoc, nothing else.

## What is here

| Path | What it is |
|---|---|
| `index.html`, `ch-N/`, `appendices/`, `front/`, `glossary/`, `downloads/` | The built site. The committed output is the site; no build step runs at deploy time. |
| `content/` | The editable book: one Markdown file per chapter, appendix, and front-matter piece (pandoc dialect). **Edit here.** |
| `content/_archive/` | Text cut or replaced during import, the import log, and the superseded duplicate sample-answers appendix. Nothing is deleted. |
| `book.json` | Structure, chapter order, which interactives are embedded and where, and the downloads list. |
| `interactives/` | Vendored copy of the modules the book embeds, from [`legal_research_interactive`](https://github.com/caslaskowski/legal_research_interactive). Do not hand-edit. |
| `downloads/` | Quick Tips sheet, Research Log template, worked example, and two generated study aids. |
| `source/` | The Pressbooks XHTML export and the Reviewing Through Practice docx the importer read. |
| `scripts/` | `import_pressbooks.py` (one-time import), `sync_interactives.py` (vendor the modules). |
| `build.py` | Builds the site from `content/` and checks it. Also writes `search/index.json` (the in-browser search), the whole-book DOCX and two study aids into `downloads/`. |
| `editing.py` | The local editing interface (see above). |
| `.github/workflows/build.yml` | CI: builds, runs the checks, fails if the committed output is stale. |

## Chapter numbering

Part II runs 10 Legislative History, 11 Advanced Administrative Research, 12 Ethics, 13 Dockets, 14 Practice-Specific, 15 GenAI, 16 NextGen, 17 Scholarship. The Pressbooks export and the interactive repo use an older order for 10 to 13 (`old_n` in `book.json`). The importer and the sync script translate the numbers readers see; module directories under `interactives/` keep their original names.

## Build

Needs Python 3.8+ and [pandoc](https://pandoc.org) 2.14 or newer.

```bash
python3 build.py            # build, then check links, anchors, duplicate ids, external requests
python3 build.py --check    # checks only
python3 -m http.server      # preview at http://localhost:8000
```

## Change which interactives are embedded

The build reads interactives from the `::: {.interactive ...}` blocks in the page Markdown, so add or remove them there (the editor's toolbar does this). The `embeds` lists in `book.json` are the import plan that first placed them; they matter only if you re-run the importer. After adding a module the site does not have yet:

```bash
python3 scripts/sync_interactives.py --src ../legal_research_interactive
python3 build.py
```

Embeds are ordinary iframes onto the vendored modules, which also open in a new tab. A shared `localStorage` key keeps one Research Log across modules, as in the standalone site.

## Draft flags

Placeholders, missing pincites, and pending figures render as yellow chips. Hide them per reader with the button at the top of any page, or for everyone with `"draft": false` in `book.json`. In the Markdown they are `[text]{.flag}` spans.

## Privacy and accessibility

The site makes no external requests (fonts are self-hosted; `build.py` fails if a third-party URL appears). Student work lives in the browser only, as in the interactive repo. Pages carry a skip link, landmark regions, visible focus, and a reduced-motion override; print styles replace each embed with a one-line pointer.

## Re-running the importer

`scripts/import_pressbooks.py` **overwrites `content/`**. Run it only to start over from the Pressbooks export.
