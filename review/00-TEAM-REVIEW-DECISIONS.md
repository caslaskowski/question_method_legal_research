# Team review: what was applied, what waits for you

Three reviewers read the Interactive Edition on branch `team-review`: an open-access reviewer (`review/01-open-access-review.md`), an instructional designer (`review/02-instructional-design-review.md`), and a line editor (`review/03-line-edit-review.md`). This log records what the gatekeeper pass applied, why, and what it left for you. Item numbers point into the reports (LE = line editor, ID = instructional designer, OA = open access).

## 1. How to read this branch

Three commits sit on top of `6f3bbc6`, one per stage, each built with `python3 build.py` ending in "checks passed":

1. `65c405e` Line edit, stage 1: typos, markup, casing, cross-references, Reflection Points into boxes, Appendix H headings. Also adds the three reports under `review/`.
2. `372500e` Method fixes, stage 2: application questions, the Quick Check, the closing-out protocol, the glossary, the Chapter 3 repair, the new interactives, the engine accessibility fixes.
3. The third commit: open access (free and open sources, README adaptation note, font license text, metadata, print footer, `book.json` placeholders) and this log.

Every edit is in `content/`, `book.json`, `build.py`, `assets/` or `README.md`; the built pages, `downloads/` and `search/` were regenerated. Nothing was deleted, no draft flag was cleared, and no legal substance was added or changed beyond reordering citation elements the book already had. Appendix B, the Database Interface Explorer in Chapter 2 and the Downloads page code were left alone for the separate rework. A voice pass follows, so P3 style items were taken only where one-line and safe. `git diff 6f3bbc6 -- content/chapters/ch-03.md` is the diff to read first.

## 2. The method test and how it was applied

Every change was held against the three non-negotiables: no single right path; application questions in research ask how courts (or other authorities) have applied the rule to facts in decided cases, while "how does the rule apply to my client's facts" is a writing step taken in a research pause; and the process pauses (Checkpoint, Quick Check, Reflection Points, research pause, the six-item checking-out protocol).

**One path.** The Chapter 3 demonstration's "a secondary source appears exactly once" now says a second secondary source or a return pass would also have been legitimate (LE 60); the Q4 reveal no longer calls a different first question "the wrong order" (ID 12); Chapter 14's "litigation starts in case law" now reads "once a secondary source or the file has oriented you" (ID 21). The free official sources are named as routes beside Westlaw, Lexis+ and Bloomberg Law in Chapters 1, 2, 5, 6 and 14. The Chapter 6 sort, which taught "statute answers it or cases needed" as a fork, was replaced at your direction with one that practises the sequence: the statute and its definitions section first, the annotations and cases only after the text is confirmed silent.

**Pauses.** The Quick Check now exists: in Chapter 3's Five Steps as the first of two pauses beside the Checkpoint (both glossed), in the ring diagram as a fifth turning node with the Checkpoint still at the centre, in the Chapter Recap and Key Takeaways, in Chapter 15's "Step 5, repeat", in the glossary's Question Method entry and in the Introduction's cycle. "Map what else the source raised" is part of Step 3; Step 4 carries "down the chain before sideways". The closing-out protocol is your six items everywhere it is stated (ch-03 closure paragraph; ch-09 protocol, Key Takeaway and Exercise 9.3; Appendix H's 9.3 answer; glossary). "Checkpoint" is reserved for the self-evaluation pause ("A false hit"; "each cycle is recorded"). The pauses are practised: the research-pause sort, the Q7 reveal and the self-assessment checklist in Chapter 3, the diagnosis sort in Chapter 9, the sufficiency call in Chapter 16, and "Name the type, round two" in Chapter 8 with two intruders.

**Application questions.** Every passage the reports found, corrected:

| File | Before | After |
|---|---|---|
| ch-03, Application Questions | "ask how the rule works once you apply it to specific facts" | "ask how courts (or other authorities) have applied the rule to facts in decided cases" |
| ch-03, same list | "gather the closest decided applications and argue the analogy" | "gather the closest decided applications. Arguing the analogy is the writing step." |
| ch-03, Name the type sort | "Is a dog owner liable when the dog bites a guest who was teasing it?" | "How have courts applied the dog-bite rule when the bitten guest was teasing the dog?"; feedback says whether this owner is liable is written, not researched |
| ch-03, Exercise 3.1 | (e) labelled Application; "One of the eight is not a research question" | (e) kept as a second intruder; "Two of the eight are not research questions"; deliverable and self-check rewritten |
| Appendix H, 3.1 | "(e) Application: it asks how a rule operates on specific facts by comparison to decided cases." | "(e) The second intruder: not a research question ... The research question behind it is 'how have the leading cases in this jurisdiction applied the rule to facts like these?', and that one is Application." |
| Appendix H, 3.2 | "(Application)" on two client-facts labels | "(Application, as the court's own writing step; see the note below)" |
| ch-07 | "You will also use regulations for Application questions when a client's conduct is governed by specific regulatory requirements." | "Application questions about how an agency has applied its rule to specific conduct are answered by agency adjudications and guidance, which Chapter 11 covers." |
| ch-08 | "comparing your client's facts against a line of decisions" | "reading how a line of decisions has applied the rule to facts like your client's" |
| ch-09, opening | "Does the rule apply in this specific factual context?" | "Have courts applied the rule in this specific factual context?" |
| ch-10 | "Application questions about congressional expectations" | "scope questions about congressional expectations" |
| ch-13 | "answers Application questions about how lawyers have argued" | "answers questions about how lawyers have argued" |
| ch-14, Three parameters | "(how do these facts compare to the controlling cases?)" | "(how have the controlling cases applied the rule to facts like these?)" |
| ch-14, Litigation | "How do the facts of my case compare to the leading cases?" / "Does the statute of limitations bar my client's claim given these specific dates?" | "How have the leading cases applied this rule to facts like my client's?" / "How have courts treated limitations claims with a timeline like this one?" |
| ch-14, Regulatory | "Does my client's waste management process comply with RCRA Subtitle C?" | "How has the EPA applied RCRA Subtitle C to waste management processes like my client's?" |
| ch-14, switch | "How do these facts compare to the controlling cases?" | "How have the controlling cases applied the rule to facts like these?" |
| ch-16, Excerpt triage | "how do these facts compare to the applied case" among the research questions | "how did the applied case treat facts like these", then "the writing step, comparing the client's facts to those decisions" |
| Appendix D | "Factors are sibling questions about your client's facts." | "Each factor is a sibling question: how have courts and the agency weighed it?" |
| Appendix E, Q3 (store) | "were there enough similar prior crimes at this location to make the assault foreseeable?" | "how many prior crimes, how similar and how recent, have courts required before holding an assault foreseeable?"; answer ends in a research pause; closure line adjusted |
| Appendix E, Q4 (drone) | "Does the client's planned operation fall within Part 107's limits, or does it need a waiver or authorization?" | "How has the FAA applied Part 107's operational limits, including when it requires a waiver or authorization, to flights like the client's planned one?"; bracket now "Confirm currency, then take a research pause ..." |
| Appendix G, Q4 (foster) | "is a long-term foster parent 'closely related' to her foster child?" | "How have California courts treated relationships outside blood or marriage that claimed to be 'closely related,' and what reasons did they give ...?"; the Dana argument follows a **Research pause** heading, unchanged |
| Appendix G, Q5 (anti-SLAPP) | "how would a Nevada court likely resolve this application?" | "what rule would a Nevada court likely adopt for a forum like this one?" |
| Appendix G, ADA | "**Research Question:** Must a business ..." | "**Macro question:** Must a business ..." |
| Appendix H, 14.1 | "how do our client's flight facts ... compare to the decided cases? (application)" | "how have the decided cases treated drone flights with facts like ours ...? (application; comparing our facts to those decisions is the bracketed note on the outline, not a log entry)" |
| Appendix H, 16.2 | "How do her facts compare to the decided applications?" | "How did the two decisions apply the standard to facts like hers?" |
| Glossary | "how a rule operates on specific facts" | "how courts or other authorities have applied a rule to facts in decided matters ... Applying the rule to the client's own facts is a writing step, not a research question." |

Chapter 6's self-applying rules keep your idea with the reconciling clause (LE 101): a bright line leaves no application question to research. Chapter 15's "which specific cases match these specific facts" and Exercise 15.1's "list authorities matching these specific facts" were left: both describe finding decided cases.

## 3. Applied, by report

**Line editor: 176 of 226 numbered items, plus cross-cutting 0.1, 0.2, 0.3, 0.5, 0.6 (italics and Bluebook order), 0.7, 0.9, 0.10.**

| Items | Files | Change |
|---|---|---|
| 1, 5, 16, 30, 34, 57, 62, 66, 70, 86, 98, 103, 120, 123 | front, ch-01 to ch-09 | glued paragraph, missing spaces and periods, doubled words, typos, fragment |
| 42, 49, 95, 109, 141, 158 | ch-03, ch-05, ch-07, ch-12, ch-15 | broken bold and italic markup; unflagged pincite now a draft flag |
| 65, 67 (and ID 43) | ch-03 | Cycle 1 log entry one field per line, case names italic, scope clause first |
| 69, 129, 134, 145 | ch-03, ch-10, ch-11, ch-13 | H2 among H3s; three Reflection Points into callouts |
| 0.3, 37, 43, 77, 123 | book-wide | Research Log, research map, annotated outline, Search Log casing |
| 0.6, 18, 52, 85, 91, 94, 99, 139, 199 | ch-01, ch-03, ch-04, ch-05, ch-12, g.md | case-name italics; Bluebook order for the three California cites (the book's own elements, reordered) |
| 0.7, 59, 73, 135, 140, 143, 156, 226 | ch-03, ch-11, ch-12, ch-14, glossary | em dashes out |
| 0.9, 203, 207, 211, 213, 214 | h.md, i.md | exercise headings match the chapters; empty table header; Reflection Point locations |
| 177, 221, 222 | c.md, glossary | Chapters 7 and 11; annotated code (6), treatise (4), terms-and-connectors searching (2) |
| 36, 46, 61, 63, 68 | ch-03 | truncated objective and Method cell; "Mapping adding" sentence; duplicated paragraph (ID 11 wording) |
| 3, 35, 38, 39, 41, 58, 74, 76, 124, 127, 128, 208, 219, 224 | intro, ch-03, ch-09, h.md, glossary | cycle and closing-out protocol made consistent |
| 79, 117, 125, 192, 200, 218, 220, 225 | ch-03, ch-08, ch-09, f.md, g.md, glossary | later questions go on the map; research pause glossed; single-source trap as a coverage failure; Research Log's seven fields; outline references 2, 2.1, 2.2, 3; twenty-one glossary entries lifted from the chapters' defining sentences |
| 110 | ch-07 | names *Loper Bright* in the body |
| the rest | all files | the remaining safe wording items (24 to 29, 33, 44, 45, 47, 48, 51, 54 to 56, 64, 71, 72, 75, 80, 81, 87, 89, 90, 92, 93, 96, 97, 100, 102, 105, 112 to 116, 118, 121, 122, 126, 131 to 133, 136 to 138, 148, 149, 157, 160, 166, 169, 172, 176, 189, 191, 197, 201, 223) |

**Instructional designer: 34 of 44 items, several in part.**

| Items | Files | Change |
|---|---|---|
| 1, 33, 44 | ch-03, ch-15 | Quick Check; "Four steps turn, and Step 5 is the turning" |
| 2 to 8, 27, 29 | ch-03, h.md, ch-14, ch-16, e.md, g.md, ch-09, ch-07 | application-question corrections (section 2) |
| 9, 10, 11 | ch-03, ch-09 | objective; six-item protocol; demonstration repair |
| 12, 13, 14, 16, 23 | ch-03 | reveal no longer prescribes one order; research-pause sort; Write Q7 yourself; Before you move on checklist; write-the-four-questions reveal before the annotate |
| 17, 18, 19, 20 | ch-08, ch-09, ch-16, ch-01 | Name the type round two; Diagnose the research; Skill 5 sufficiency call; Predict before you switch |
| 21 (part), 24, 25, 26, 28, 31, 32, 34 | ch-14, ch-04, ch-01, ch-02, ch-05, ch-06, ch-07, ch-10, ch-13, ch-15, ch-09, ch-16, ch-03 | "once a secondary source or the file has oriented you"; Appendix A pointer; the drafted practice lines; "Procedural how-to (not one of the four types)"; "(the Chapter 5 drill, now as an exam item)"; pointers to Three Tools and Appendix F |
| 22, 38, 40, 39 (content), 41 | book.js, book.css, ch-12, ch-15, README | sort: a second indented bullet explains a wrong pick, and sorts with more than three bins stack them under the item; order: "in place" / "move" marks and a message that names them; annotate counter is a live region; verdict labels say supports / holds the opposite / fabricated; README notes that print and DOCX show the answers |

On item 22: the assignment summarised it as "names the right bin on a wrong pick". The reviewer's proposal was an explanation of why the wrong bin is wrong, and that is what was built; naming the right bin on a miss would make "Try again" meaningless and, in two-bin sorts, hand over the answer. No second bullets were written beyond the engine support.

**Open access: 19 of 31 items, several in part.**

| Items | Files | Change |
|---|---|---|
| 1.3 | assets/fonts/OFL.txt, README | OFL 1.1 text with the three copyright notices |
| 2.1, 6.2 | README | "Adapting this book for your course", written without naming a license |
| 2.2, 2.3, 2.4(a) | build.py, book.json | `<meta name="author">` on every page; `license`, `license_url`, `url`, `edition`, `edition_date` added as null; when set, the footer, `rel="license"` and canonical links, Dublin Core rights and date, and the DOCX YAML render them (tested both ways; the link checks exempt those two `rel` values) |
| 3.1, 3.2 | build.py, book.css | table regions labelled by the heading above them; printed pages keep the footer (title, author, and license and URL once set), 2 cm margins, external links print their address |
| 5.1 to 5.8, 5.11(a), 5.13 | ch-01, ch-02, h.md, ch-05, glossary, ch-06, ch-07, ch-14, ch-03 | "Where the law itself lives"; free sources paired with their limits in Chapter 2's opening and Key Takeaway; "Where does it live for free?" sorter; one free retrieval in Exercise 2.3; "Without a citator"; free case collections; free codes and a hand-built pathway in Chapter 6; Federal Register address; free brief archives; "which databases you can actually reach" |
| 6.1 (part) | g.md, ch-05 | Bluebook order; parallel reporters left to you |

## 4. Deferred to you

**License and publication facts.** OA 1.1 (license, About page, LICENSE files, Pressbooks setting), 1.2 (Downloads lede), 2.4(b) (PDF), 2.5 (CSV template; Downloads is being reworked), 2.6 (canonical edition), 4.1 (citation, version line, change log, DOI), 4.2 (error-report address), 1.4 (where the quoted law was copied from). The `book.json` fields are in place and empty.

**[verify] law and facts.** LE 31, 84, 91/155 (F.4th cite), 108, 122 (BUT NOT syntax), 139, 147, 162, 174, 178, 186, 198 (*Kosor* citation), 199 (*Rosenbrook*), 212; OA 6.1 parallel P.2d cites; OA 5.9, 5.10, 5.12 (free legislative-history guides, PACER opinions and RECAP, law-review repositories: each asserts a fact about a third-party service to confirm before it goes in your voice). LE 190: Appendix F still promises a case chart it does not contain; add it or drop the promise in the title, the first paragraph and ch-03 "What the Demonstration Shows". The OFL notices need checking against the font files.

**Draft flags and structure.** The fifteen draft Reflection Point and draft answer flags (LE 0.5, 142, 161, 164, 170, 215), the Part II flag (13), the Chapter 2 cite-check flag (31), the PACER note. LE 22/204 (Exercise 1.2 asks for a list Chapter 1 never states), 82, 88, 104, 106, 119, 144, 167/168/171 (Chapter 17 checklist in two files), 180, 181, 187, 193, 0.4. ID 15 (Exercise 3.3 deliverable), 16 book-wide (the checklist is in Chapter 3 only), 21 (trimming Chapter 14's prose), 26 for ch-16, 30(b), 35, 36, and the engine options in 23 and 39.

**Appendix B.** Reserved for your rework; LE 174 and 175 (a concision rewrite, not a typo, undone after stage 1) are left there.

**Rejected or narrowed for the method.** OA 2.1's draft asserted "The book is CC BY 4.0"; written without a license. LE 53 (the *Nix* "closing application question") left: the Court is the one applying the rule. ID 22 as paraphrased (reveal the right bin): not built, see above. "pocket part" has no glossary entry because no chapter sentence defines it; the hover shows Chapter 4's sentence. Not applied although "safe": LE 165 and 185 (voice pass), 173 (harmless blank lines), 175 (Appendix B).

## 5. What to check in the browser

Serve the site (`python3 -m http.server`); fonts are blocked under `file://`.

- **Chapter 3**: the ring (five turning nodes, Checkpoint at the centre); the reveals before the annotate, at Q4 and before Q7; the research-pause sort; the "Before you move on" checklist after the Key Takeaways; the Cycle 1 entry one field per line.
- **Chapter 1**: "Predict before you switch"; the order interactive's "in place" / "move" marks after Check. **Chapter 2**: "Where does it live for free?" at the end of Finding the Cited Source. **Chapter 6**: the replaced sort. **Chapter 8**: "Name the type, round two". **Chapter 9**: "Diagnose the research, then pick the fix". **Chapter 16**: "Skill 5: make the sufficiency call". **Chapters 12 and 15**: verdict labels in words.
- **Glossary**: the new entries in the flashcards. **Downloads**: untouched except the rebuilt DOCX files; once the `book.json` fields are set, check the footer and page two of the whole-book DOCX. **Print preview**: the footer line at the end, masthead and pager hidden.

The headless check after each stage (every page over HTTP; the sorts, order, checklist and annotate exercised) reported no console errors.
