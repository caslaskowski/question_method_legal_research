# Accessibility review

Scope: every built page (home, both Parts, 17 chapters, 9 appendices, three front-matter pages, glossary, search, downloads, 404) at 1280 px and 390 px, audited with axe-core 4 (WCAG 2.1 A/AA plus best practice) in headless Chromium, in the default state and again after operating every interactive; a scripted keyboard pass over each kind of control; a scripts-off load; print media; and pandoc's reading of the generated DOCX. Fixes are in `assets/book.js`, `assets/book.css` and `build.py` (commit 292322d). Nothing under `content/` was touched; those fixes are listed at the end.

## Audit result

| | Before | After |
|---|---|---|
| axe violations, default state (72 page/width pairs) | 60 nodes, 5 rules | 0 |
| axe violations after operating the interactives | 98 nodes | 0 |
| hand checks: one h1, heading order, landmarks, skip link, table names, nested live regions, unnamed controls | 0 | 0 |
| keyboard and behaviour script, 27 cases | 7 failed | 0 failed |

## What the audit found, by page group

**Chapters.** Every chapter failed contrast on the Key Takeaways strip: the palette change left spruce text on the red strip at 1.01:1, and the same leftover sat on the pager's hover and focus state. Chapter 2's citation "pull" view faded the non-address parts to 45% opacity (2.7:1), and its red outline overrode the focus ring. The Database Interface Explorer's screen tabs had `role=tab` with no tablist behaviour (no arrow keys, no tabpanels, every tab a tab stop), the selected tab differed by background only, and the find-it challenge advanced on a 1.4 s timer. In the sort interactive the pressed bin became disabled, so focus fell to the top of the document after every answer, and the row's feedback was not announced. The glossary tooltip was appended to `body`, outside every landmark (flagged on every page with a defined term). Chapters 6, 12 and 15 colour annotate marks by verdict with no word for it.

**Appendices.** Appendix F has nine tables under one heading, and `build.py` named all nine regions after it (landmark-unique). Appendix B's lens switch had no arrow keys.

**Home, Parts, front matter.** Clean apart from the tooltip landmark.

**Glossary.** The flashcard face is a button; definitions that cite a chapter contain an autolink, so the button held a focusable descendant. The position counter was not a status.

**Search.** Clean: labelled input, status region for the count.

**Downloads.** All seven buttons used an `aria-label` that did not contain the visible words ("Download DOCX 20 KB" vs. "Download The Research Checklist, Word document, 20 KB"), failing WCAG 2.5.3. Previews already open in the same tab.

**404.** The page shares the home body class, and a rule for an older home page made its panel transparent: cream text on cream paper, five failures; its red kicker and spruce-on-red buttons would fail on the restored panel too.

**DOCX.** The content has no level-1 headings, so shifting every heading down a level put sections at Heading 3 under the chapter's Heading 1; Heading 2 never appeared and the TOC held only chapter titles.

**Print and scripts off.** With scripts off every interactive reads as its written text. In print with scripts on, the controls were hidden but the rebuilt lists showed no answers.

## What was fixed

- `assets/book.js`: screen tabs are a real tablist (ids, `aria-controls`, `role=tabpanel`, roving tabindex, Left/Right/Home/End).
- `assets/book.js`: an `arrows()` helper gives the lens, setting and search-mode switches arrow keys; Up/Down on a row's move buttons moves the row.
- `assets/book.js`: the find-it challenge shows a "Next one" button that takes focus; no timer.
- `assets/book.js`: sort feedback is `role=status`; after an answer focus moves to the next bin, the next row, or the tally.
- `assets/book.js`: the Contents menu closes on Escape (focus returns to its button) and on a click elsewhere.
- `assets/book.js`: the tooltip is appended inside `main`; a term inside a button, link or mark gets no tabindex of its own.
- `assets/book.js`: flashcard face strips links and its counter is a status; a verdict adds "sound", "caution" or "problem" beside the label; the tokens status names the predicted piece; the reveal textarea is named after its title.
- `assets/book.js`: each interactive keeps a hidden copy of its written text (`.try-print`) for print.
- `assets/book.css`: white text on the red strip, pager hover/focus and 404 buttons; pale-red kickers on spruce; the 404 panel rule removed; `--rule-ui` (3:1) for field borders; the pull view dims to `--ink-faint` and outlines with a box-shadow; the selected screen tab gets weight and a red edge; print shows `.try-print` and hides the controls; `main:focus` draws no ring.
- `build.py`: each interactive is a `role=group` named by its strip (kind added, visually hidden); tables under one heading are named "heading, table N"; download and preview links keep their visible words and add the rest in a hidden span; `main` has `tabindex=-1`; the DOCX keeps the content's heading levels.

## What remains, and why

- `.gloss` terms are focusable spans with a tooltip and no role; a screen reader announces the term and its description, which is the intended reading. `role=button` would promise a toggle mouse users never see.
- The Explorer's decoy second result is decorative and `aria-hidden`; raised to 70% opacity, it is readable but not held to 4.5:1.
- With scripts off the annotate passages read as plain text: labels and notes live in attributes. Rendering them would double the passage; the author's call.
- The search page's `autofocus` skips the skip link; kept because the page is the search box.
- Hairline `--rule-strong` borders stay on buttons and cards (1.9:1); text and background identify those components, so 1.4.11 does not require 3:1 there.

## Content-level fixes for the author or the next agent

1. `content/appendices/f.md`, "The Complete Research Log": nine tables under one heading, now named "…, table 2" to "…, table 9". Give each its own `###` subheading.
2. `content/chapters/ch-14.md` line 65 and `content/chapters/ch-06.md` line 80: blank corner header cell. Name the row-header column ("Task", "Question type").
3. `content/chapters/ch-04.md` line 106, "Breadth against depth": the axis labels end in "→". Say the direction in words.
4. `content/glossary.md`: no entry for "pocket part" (the build reports it). Add one.
5. `content/chapters/ch-06.md` line 28, the verdict annotate block: the notes should open with the judgement in words, as Chapters 12 and 15 do ("Fabricated", "Supports the sentence").
6. Interactives that open with the list and no instruction sentence: `ch-10.md` line 47, `ch-11.md` line 77, `ch-12.md` line 36, `ch-07.md` line 52, `ch-03.md` line 200, `ch-17.md` line 28, `ch-09.md` line 97, `appendices/c.md` lines 36 and 59, `appendices/d.md` line 56. Add one lead sentence saying what to do.
7. `content/chapters/ch-01.md` line 39, "**Examples of complex areas of U.S. law:**": a bold paragraph as a list heading. Fold it into the sentence before the list or make it a `###`.
