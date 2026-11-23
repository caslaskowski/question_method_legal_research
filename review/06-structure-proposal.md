# Structure proposal: how to read a source, and what else the textbook's shape could do

Working note for Cas, written from the Pressbooks screenshots and the card-sort video you sent on 2026-11-23, read against the current engine (`assets/book.js`), the 43 interactives now in `content/`, and the Round 5 decision to have fewer and better interactives. Each proposal says what it is, what it would replace or reuse, what it costs to build, and where it could go wrong. Nothing here is built yet except the Chapter 7 section noted at the end.

## What the screenshots show, in engine terms

| What you sent | What it does for the reader | Nearest thing the book has | Gap |
|---|---|---|---|
| Chisum treatise page with plus markers; explanation opens beside the page | Teaches a *document type* by pointing at one real one, part by part, in your words | `annotate` (Appendices A to D, Chapter 6) | The book marks phrases in a passage. The screenshot marks a whole *screen*: citation line, heading rail, section title, footnote numbers, the footnotes panel, the copy-citation button. |
| Restatement accordions: Purpose / When to consult / How to use; Black letter / Comments / Illustrations / Reporter's notes | Explains a source type in the abstract, one heading at a time, without lengthening the page | Nothing. Callout boxes and the glossary flashcards are the closest | A collapsible headed list. Small to build. |
| Numbered step strips (1 Define agency powers, 2 Establish procedures, 3 Provide for judicial review) | Shows a procedure as a sequence, each step a heading | `explore layout="stack"` (Appendix D, now Chapter 7) | The stack already does this, vertically, with a note beside it. No gap worth a new kind. |
| Match terms to definitions; card-sort video (one card at a time, two bins, score, retry) | Commits the reader to an answer before showing it | `sort` | The video's one-at-a-time dealing is a *mode* of sort, not a new kind. It is better on a phone than bins full of chips. |
| "Select one" question with four options | Same as `choice` | `choice` | None. |

So the screenshots ask for two new things and one new mode, not a new engine: a page facsimile layout for `annotate`, an accordion kind, and a dealt mode for `sort`.

---

## Proposal A. "How to read it": one facsimile per source type

**What.** A new `annotate` layout, call it `layout="page"`, that draws a stylised database view instead of a bare passage: a title bar with the citation and a copy-citation button, a heading rail (publication, part, chapter), the section title, body text with footnote superscripts, and a footnotes panel underneath. Markers sit on the parts worth knowing. Selecting one opens the note beside the page at desktop width and under it on a phone, exactly as `annotate` does now. The markdown would stay the book's own: a block with named regions (`**Title.**`, `**Rail.**`, `**Body.**`, `**Footnotes.**`), and `[phrase]{.m label="..." note="..."}` marks inside them, so the editor's insert button, the print fallback and the DOCX need no new work.

**Where.** One per source type, in the appendix that already carries the How to Read a passage for it, and linked from the chapter: a treatise page (Chapter 4, Appendix A), a Restatement section (Chapter 4), an annotated code section with its Notes of Decisions (Chapter 6, Appendix C), a CFR section with its authority and source notes (Chapter 7, Appendix D), a reported opinion with its headnotes and citator flag (Chapter 5, Appendix B), a docket sheet (Chapter 13). The treatise and the Restatement are the two the book has no facsimile for at all, so they go first.

**The copyright line.** Your screenshot is the right model: enough of the real page to be recognisable, nothing like the whole section, and every word of teaching yours. Two safer options for the body text, in order of preference. (1) Use a real public-domain or government page where one exists: a CFR section, a U.S.C. section, a federal opinion, a PACER docket. (2) For the treatise and the Restatement, where the text is copyrighted, write a short *original* passage in the house style of the source, as the book already does for its fictional cases and the deposit statute, and label it as a teaching facsimile. The parts you are teaching (the citation line, the heading rail, footnote numbering, "Comment a.", "Illustration 1", "Reporter's Note") are structure, not expression, and a facsimile shows them as well as the original. Real excerpts of Chisum or the Restatement should be a few sentences at most, with the publisher named, which is a fair-use judgment that the open-access review (review/01) should sign off on before it ships.

**Cost.** Medium. The engine work is one new layout in `annotate` (perhaps 150 lines of JS and 80 of CSS), reusing the mark-and-note code. The content work is six blocks, each a day of your time to write well.

**Risk.** The facsimile has to look like *a* database, not Westlaw or Lexis. The Database Interface Explorer solved this already with a generic screen, and the page layout should borrow its look.

## Proposal B. A source card at the head of every source chapter

**What.** A small accordion kind, `kind="accordion"`, built on the browser's own `<details>` and `<summary>` elements so it needs almost no script, works from the keyboard for free, and opens fully in print and in the DOCX. Each chapter about a source type (4 to 7, 10, 11, 13, 17) would open with the same four headings: *What it is. When to reach for it. How it is built. How to read one* (linking to the facsimile in Proposal A). The Restatement screenshot is exactly this card.

**Why it is structural and not decorative.** The chapters already share a skeleton (the research cycle, questions this source answers, how it is made, searching, answering, pitfalls, beyond the basics, recap), but a reader cannot see that skeleton from the top of the page. A card in the same place, with the same four headings, in every chapter, teaches the reader that every source is approached the same way, which is the book's argument. It also gives a student in week ten a thirty-second refresher without rereading the chapter.

**Cost.** Low. Perhaps 60 lines of JS, mostly to style and to honour the reduced-motion setting, and eight short cards to write. The cards should be new text, not copies of the first paragraphs, or they will fail the Round 5 test of restating what is beside them.

**Risk.** Accordions hide content, and readers do not open what they cannot see. Keep them to four headings, keep *What it is* open by default, and never put anything in a card that the chapter does not also teach in full.

## Proposal C. Steps: reuse the stack, add nothing

The numbered strips in your screenshots are a stack. The new Chapter 7 section uses `explore layout="stack"` for the six questions in a challenge, and it reads well: numbered, in order, with the where-to-look source as the tag and the note beside it. The only addition worth considering is a `numbered="yes"` switch that draws the number in a chip, as in the screenshot, instead of leaving it to the item's text. Not a new kind.

## Proposal D. Deal the cards: a mode for `sort`

The video shows one card at a time, dragged to one of two bins, with "1/4 cards correct" and a retry at the end. The book's `sort` shows every item at once with the bins as buttons beside each. Two things in the video are worth taking.

1. **One at a time.** On a phone, a sort with six items and three bins is a wall of chips. Dealing one card at a time fits any screen and asks for a decision before the next card arrives. Add `mode="deal"` to `sort`. Same markdown, same feedback, no new content.
2. **Score and retry.** The sort kinds already check each item; a tally and a *Try again* button at the end, which the engine's `order` kind already has, would finish the loop.

Drag-and-drop itself is not worth adding. The accessibility pass (review/05) built every interactive on buttons so it works from the keyboard and a screen reader. Tapping a bin does the same job as dragging, and the engine already does it.

## Proposal E. Beyond the widgets: three changes to the book's shape

The screenshots are about blocks on a page. The larger opportunity is the shape of the book around them.

1. **A question-first way in.** The method is question-driven. The table of contents is source-driven. A second contents page, *Start from your question*, would route the reader by question type (no-clue exploratory, survey, focusing, definitional, the two application types) to the sections that answer it: a no-clue question to Chapter 4 and the encyclopedia passage in Appendix A, a definitional question to Chapter 6's definitions section and Chapter 7's definitions section, and so on. It is one static page built from `book.json` and a short map in the Markdown. It makes the method the navigation, which is the strongest structural argument the edition could make.
2. **Make the threads visible.** The organic-labeling thread and the roofer thread run across five chapters each, and a reader who meets the roofer in Chapter 7 does not know they will meet them again in Appendix E. A *Follow the thread* line under each thread's heading (where this thread has been, where it goes next) is a small build and a large gain in coherence. The build script can generate it from a `thread="organic"` attribute on the block.
3. **Collapse Beyond the Basics by default.** Every chapter ends with a section that is, by its own name, optional. Using the accordion from Proposal B on those sections lets a first-year read the chapter in one sitting and a returning reader open the advanced material. It also answers the open note about Appendix B being taller than one screen: the same mechanism folds its lenses.

## Recommended order

| Order | Proposal | Build | Content | Why first |
|---|---|---|---|---|
| 1 | B, the source card and accordion | Low | Eight short cards | Cheapest, and it carries E3 for free |
| 2 | A, the facsimiles, treatise and Restatement first | Medium | Six blocks | The gap you named; the two sources with no facsimile today |
| 3 | E1, the question-first contents page | Low | One map | The method becomes the navigation |
| 4 | D, dealt mode for sort | Low | None | Better on phones; no new content |
| 5 | E2, visible threads | Low | Attributes only | Coherence |

Proposal C needs no work. The Chapter 7 section *Challenging an Agency Action in Court*, added in this pass, is the first use of the stack-as-steps pattern that C describes and can serve as the model for the others.

## What is already done in this pass

- Chapter 7, Beyond the Basics, new subsection *Challenging an Agency Action in Court*: two framing paragraphs, a six-step stack (reviewability, standing, exhaustion, forum and deadline, standard of review, the record), a five-item sort on which standard of review the court applies, a closing paragraph, and a new Key Takeaway. The legal claims it makes are listed for verification in EDITING-NOTES.md, Round 6.
