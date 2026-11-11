# The Question Method of Legal Research: Interactive Edition

A static, GitHub Pages–ready edition of the textbook in which the interactives are part of the text: a clickable diagram, a quick sort, an annotated passage, or a working search lab sits in the paragraph that teaches the idea. Nothing is embedded from another site. 

**Start with [`EDITING-NOTES.md`](EDITING-NOTES.md).** It lists everything that needs a decision, a fix, or a fact-check, with Part II in the most detail.

## Editing without touching the code

```bash
python3 editing.py
```

opens a local page (http://127.0.0.1:8765, this computer only) where you can edit every chapter, appendix and front-matter page with a live preview, insert interactives and the book's boxes from a toolbar, clear draft flags, change titles and draft mode, manage the Downloads page, build the site, preview it, and commit. It edits the same files listed below, so everything it does shows up in `git status`. Needs Python 3.8+ and pandoc, nothing else.

## What is here

| Path | What it is |
|---|---|
| `index.html`, `ch-N/`, `appendices/`, `front/`, `glossary/`, `downloads/` | The built site. The committed output is the site; no build step runs at deploy time. |
| `content/` | The editable book: one Markdown file per chapter, appendix, and front-matter piece, plus `glossary.md` (pandoc dialect). The interactives are written here too. **Edit here.** |
| `content/_archive/` | Text cut or replaced during import, the import log, and the superseded duplicate sample-answers appendix. Nothing is deleted. |
| `book.json` | Structure, chapter order, titles, and the downloads list. |
| `assets/` | `book.css`, `book.js` (page behaviour and the interactive engine), and the self-hosted fonts. |
| `downloads/` | Quick Tips sheet, Research Log template, worked example, and two generated study aids. |
| `source/` | The Pressbooks XHTML export and the Reviewing Through Practice docx the importer read. |
| `scripts/` | `import_pressbooks.py`, the one-time importer. Retired: it would overwrite `content/` and every interactive in it, and refuses to run without an explicit flag. |
| `build.py` | Builds the site from `content/` and checks it. Also writes `search/index.json` (the in-browser search), the whole-book DOCX and two study aids into `downloads/`. |
| `editing.py` | The local editing interface (see above). |
| `.github/workflows/build.yml` | CI: builds on a fresh machine, then runs `build.py --check`. |
| `build-manifest.json` | Written by every build: a hash of each input (content, book.json, assets, hand-made downloads). `--check` fails if any input changed after the last build, which is how CI tells the committed site is current without needing byte-identical output. Commit it with the build. |

## Chapter numbering

Part II runs 10 Legislative History, 11 Advanced Administrative Research, 12 Ethics, 13 Dockets, 14 Practice-Specific, 15 GenAI, 16 NextGen, 17 Scholarship. The Pressbooks export uses an older order for 10 to 13 (`old_n` in `book.json`).

## Build

Needs Python 3.8+ and [pandoc](https://pandoc.org) 2.14 or newer.

```bash
python3 build.py            # build, then check links, anchors, duplicate ids, external requests
python3 build.py --check    # checks only
python3 -m http.server      # preview at http://localhost:8000
```

## Interactives

An interactive is a fenced block in the chapter's Markdown. Its content is ordinary text (a list, a passage), which `assets/book.js` turns into the working interactive in the reader's browser. With scripts off, in print, and in the whole-book DOCX, the same content reads as text. The editor's **Insert interactive** button drops in a template for each kind.

```markdown
::: {.try kind="sort" title="The law itself, or writing about the law?" bins="Primary | Secondary"}
- A regulation in the Code of Federal Regulations **Primary**
    - A properly adopted regulation carries the force of law.
- A law review article **Secondary**
    - One scholar's analysis is commentary on the law.
:::
```

| `kind` | What the reader does | How to write it |
|---|---|---|
| `choice` | Answers one question; every option has feedback | A task list. `- [x]` marks the right answer; the indented bullet under each option is its feedback. |
| `sort` | Places items in categories | `bins="A \| B"`. End each item with its category in bold; indented bullet = explanation. |
| `order` | Arranges rows, then checks | A numbered list in the correct order. The page shuffles it. |
| `explore` | Selects parts of a diagram | A list of `**Name \| tag.** text` items. `layout=` `tabs`, `flow`, `stack`, `list`, `ring` (add `edges="a \| b"` and `arrows="both"`), `plot` (`**Name \| x, y.**`, 0 to 100, with `xlabel` and `ylabel`), or `database` (the Database Interface Explorer: five header tools, the search box, the filter, advanced search, then the browse tabs, each with a nested list of its collections, then the support link). For `ring`, write an edge as `forward ~ backward` to draw an arrow each way. |
| `annotate` | Selects marked parts of a passage; the explanation opens beside it (under it on a phone) | `[phrase]{.m label="..." note="..."}`. `layout="cite"` shows a citation part by part; `verdict="ok"`, `"warn"` or `"bad"` colours a phrase once opened; `hint="..."` sets the instruction. |
| `search` | Runs real terms-and-connectors searches | Each bullet is a document: `**Title \| on point.** text`. The reader builds a search with connector buttons; `queries="..."` lists the examples behind the *Show example searches* button, separated by `\|` (write `&quot;` for a quotation mark); `natural="..."` adds a natural-language mode. Supports AND, OR, NOT, phrases, `!`, `*`, `/n`, `+n`, and `/s` and `/p` as stand-in word distances (15 and 50), since the real numbers are not published. |
| `checklist` | Ticks boxes that persist in the browser | A task list of `- [ ]` items; a bold lead becomes the label. |
| `reveal` | Writes an answer, then compares | Prompt, a `---` line, then the model answer. |
| `tokens` | Watches a sentence predicted piece by piece | `start="..."`; each bullet lists candidates as `word 70%; word 20%`, most likely first. |
| `switch` | Changes a setting (the courtroom, the practice context) and watches every row change | A table. First column: the rows. Each further column: one setting. A cell may open with a bold status such as `**Binding.**`. `label="..."` is the question above the buttons. |
| `flashcards` | Flips through a definition list | Used by `content/glossary.md`. |

Two rules keep them useful. Keep each one to a single screen: about six rows in a sorter. And do not let an interactive repeat the paragraph above it; give it new examples, or turn the paragraph's own list into the interactive.

## Draft flags

Placeholders, missing pincites, and pending figures render as yellow chips. Hide them per reader with the button at the top of any page, or for everyone with `"draft": false` in `book.json`. In the Markdown they are `[text]{.flag}` spans.

## Privacy and accessibility

The site makes no external requests (fonts are self-hosted; `build.py` fails if a third-party URL appears). Anything a reader types or ticks stays in their own browser. Pages carry a skip link, landmark regions, visible focus, and a reduced-motion override. Every interactive is built from buttons and form controls, works from the keyboard, and announces its feedback to screen readers; in print it appears as its own text.

## Re-running the importer

`scripts/import_pressbooks.py` **overwrites `content/`**, including every interactive written since the import. It is retired and will not run without `--i-know-this-overwrites-content`.

## Look and fonts

The pages follow the textbook: Lato for text, Zilla Slab for titles, navy and orange from the cover, teal section heads, crimson for defined terms and for the previous/next bar that stays at the bottom of the screen. Lato, Zilla Slab and IBM Plex Mono are in `assets/fonts/` under the SIL Open Font License; nothing is fetched from a font service. `"draft": false` in `book.json` keeps the yellow editorial flags off the published pages; set it to `true` to see them while editing.
