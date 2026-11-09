# Editing notes: first-pass interactive edition

Working document for Cas. It lists everything I found that needs a decision, a fix, or a fact-check before students see this version. Part II gets the most detail, as requested.

**How to read it.** Each item has a priority and a type.

- **P1** = fix before students see it (wrong, contradictory, or visibly unfinished).
- **P2** = should fix this round (inconsistent, thin, or unverified).
- **P3** = polish.
- **[error]** I am confident something is wrong on the page. **[verify]** something may be wrong or stale and needs a source check; I have not asserted the right answer. **[decide]** only you can choose.

Tick the boxes as you go. Items marked ⚑ also show as yellow flags on the draft pages (use the "Hide flags" button on any page to turn them off).

## What I did and did not review

I read in full: the front matter, Part I and Part II intros, Chapter 1, Chapters 10 through 17 (body and exercises), and the Research Log, question-type, and closure sections of Chapter 3. I read the three Part I source chapters' headings and openings but not line by line (Chapters 2 to 9). I did not read Appendices E, F, G, H, or the Chapter 3 full demonstration line by line. For everything, I ran automated scans: placeholders, cross-references, exercise numbers, vocabulary, Research Log field names, template completeness, reflection-point pairing, and doubled words. **A real read-through of Chapters 4 to 9 and Appendices E to H is still owed.** Legal claims below are flagged for verification, not corrected from memory. Today's date in this session is 2026-11-09, and several items are the kind that move (deference doctrine, AI rules, product names).

---

## 1. What changed in this version

| Change | Where | Why |
|---|---|---|
| Part II chapters **reordered** to 10 Ethics, 11 Dockets, 12 Legislative History, 13 Advanced Administrative, 14 Practice-Specific, 15 GenAI, 16 NextGen, 17 Scholarship | `book.json`, `ch-N/` | The Pressbooks export lists them in a different order (Ethics, Dockets, Practice-Specific, NextGen, Scholarship, Legislative History, Advanced Admin, GenAI). Every exercise number, cross-reference, the Part II intro, Appendices H and I, and the interactive site already use the new numbering. See G1. |
| Every chapter's **Reviewing Through Practice** replaced by the new docx exercise sets, moved to after Key Takeaways | each `ch-N.md` | You asked me to use them if they were not in the draft. The chapter bodies had an older version (roughly 85 to 92% identical to the new set in Chapters 2, 3, 5 to 7, 9 to 13, and 15 to 17; Chapters 1, 4, 8, and 14 differ substantially). The old text is archived. |
| **22 interactives embedded** in chapters, plus 4 in Appendices A to D and the glossary flashcards | `book.json` | One or two per chapter, placed where the text teaches the skill. List of what I left out is in §9. |
| **Cut or condensed**: Chapter 1 hierarchy subsections (condensed to a summary plus the Hierarchy interactive), Chapter 3's reverse-engineering demonstration (the interactive walks the same paragraph), the Figure 2.1 screenshot and caption | `content/_archive/removed-text.md` | Interactive teaches the same mechanics. Original text is archived and restorable. |
| **Downloads page** with your tip sheet, Research Log template, worked example (each with a PDF preview where useful), plus two generated files: Key Takeaways and Pitfalls by Chapter, and the Scholarship Research Checklist | `downloads/` | You asked for downloadable items like the tip sheet. |
| **Part II structural repair**: section titles, Learning Objectives, Key Takeaways, Example boxes, and Reflection Points in Chapters 10 to 17 were plain paragraphs in the export; promoted to real headings and boxes | import log | See G4. |
| Obvious placeholder fixes: "Appendix X" to H (sample answers) or I (Reflection Point answers); four Pressbooks `#chapter-…` links rewired | import log | Everything else is flagged, not changed. |

Nothing else in the prose was edited. Typos and awkward sentences below are still in the text as you wrote them.

---

## 2. Decisions only you can make

- [ ] **[decide] P1 Which Research Log is the Research Log?** There are at least five versions. See §3.
- [ ] **[decide] P1 Keep the reordered Part II?** I recommend yes (see G1). If you agree, the Pressbooks source needs the same reorder, or the two editions will disagree.
- [ ] **[decide] P2 Which interactives stay?** I embedded 26 of the 49 module pages. §9 lists the rest and what each would replace. To add or drop one, edit `book.json`, run the sync, run the build.
- [ ] **[decide] P2 How much text should the interactives replace?** I cut only where I could check that the module covers the same ground. §9 lists "overlap candidates" where text and interactive both teach the same thing and I left both in.
- [ ] **[decide] P2 Show or hide draft flags at launch?** Set `"draft": false` in `book.json` to strip them from the built pages.
- [ ] **[decide] P3 Do you want the interactive edition to carry a "How to use the interactives" paragraph in the Introduction?** The Introduction's "How to Use This Textbook" is silent on both the online modules and Part II.

---

## 3. The Research Log: five versions in circulation (P1)

| Source | Fields |
|---|---|
| **Chapter 3 text** ("eight fields") | Research Question · Question Type · Method · What I Found · How This Answers My Question · **Source Consulted** · Next Question · Notes. (The sample-entry table labels the sixth row just "Source".) |
| **Appendix F** (full Chapter 3 log) | Research Question (numbered) · Question Type · **Source Consulted** · What I Found · How This Answers My Question · **Citation** · Next Question · Notes. **No Method field; Source Consulted and Citation are split.** |
| **Interactive `research-log.js`** | Question · Type · Source · What I Found · How This Answers My Question · Citation · Next Question · Notes. Matches Appendix F, not Chapter 3. |
| **Your spreadsheet template** | Research Question · Method · Answer · Source · Next Question · Notes. **Six columns, no Question Type, no How This Answers.** Row 2 holds instruction text inside the data area. |
| **Worked example docx** | Research Question · Method · Answer (once "The answer") · Source / Pinpoint · Next question · Notes. Same six-field shape as the spreadsheet, with inconsistent labels inside the document itself. |

Knock-on references that depend on the answer:

- [ ] Chapter 3 says "eight fields is more than most working researchers keep forever" and that Method "matters most" when you return to a project. If Method goes, that paragraph goes.
- [ ] Chapter 13 says to add an **Authority Level** field or use Notes. Appendix H's Chapter 13 answers use "Authority Level" as a field. The interactive log has no such field.
- [ ] Chapter 15 refers to the "Source Consulted field" and the "How This Answers My Question field." Chapter 15 also says verification cost belongs "in your Notes field."
- [ ] Chapter 9 introduces a separate **Search Log** (5 mentions). It is never defined as fields anywhere I could find. [decide] whether it needs a template too.
- [ ] The tip sheet's Step 3 ("log the source, what it said in your own words, and whether it fully answers, partially answers, or redirects") assumes the book's fields; it does not name them.

My suggestion: pick one schema, update the book, the interactive, and the spreadsheet together, and put the macro question in its own cell above the table (the book says to write it "once at the top"). I can generate the spreadsheet once you choose.

---

## 4. Structural and global issues

- [ ] **G1 (P1) Part II order.** Export order versus the numbering used everywhere else:

  | Export position | Chapter | Number the exercises, Appendix H, and cross-references use |
  |---|---|---|
  | 10th | Ethics | 10 |
  | 11th | Dockets | 11 |
  | 12th | Practice-Specific | **14** |
  | 13th | NextGen | **16** |
  | 14th | Scholarship | **17** |
  | 15th | Legislative History | **12** |
  | 16th | Advanced Administrative | **13** |
  | 17th | GenAI | **15** |

  Evidence the new order is the intended one: the Part II intro describes "Chapters 11 through 13" as dockets, legislative history, and administrative materials, and "Chapters 14 through 17" as contexts; chapters cite each other by the new numbers (Chapter 11 cites "Chapter 15" for Mata; the AI disclosure cites "Chapter 15"); figure labels use 12.1 for legislative history. The export order therefore teaches the reader to expect a different Chapter 12 than the one the text means.
- [ ] **G2 (P1) Two sample-answer appendices.** The export contains an unlettered "Sample Answers for the Reviewing Through Practice Exercises" and Appendix H with the same title. The unlettered one has the old Exercise 1.3 ("Which Version Governs?"); H has the new one ("Who Gets the Last Word?"). I built H only; the other is archived at `content/_archive/superseded-unlettered-sample-answers-appendix.md`. Delete it from Pressbooks.
- [ ] **G3 (P1) Appendix and exercise numbers after the swap.** Exercise titles in H match the new docx exactly except Chapter 4 to 7 drills (H: "The Chapter 4 Drill"; chapters: "The Chapter 4 Drill (Secondary Sources Only): Where Do I Even Start?"). Fine, but make them match. **Appendix H and E have not been checked against the new exercise text beyond titles.** The new Exercise 1.3 no longer tests the statute-as-enacted versus statute-as-codified point (the old Midland Power exercise); if you still want that taught, it needs a home, probably in Chapter 6's session-laws section.
- [ ] **G4 (P1) Part II exported headings as plain paragraphs.** In Chapters 10, 11, 12 (export order 15), 13 (16), 14 (12), 15 (17), 16 (13), 17 (14), nearly every section title, plus Learning Objectives, Key Takeaways, Example, and Reflection Point, are ordinary paragraphs. In Pressbooks that means no table-of-contents entries, no anchor links, and no heading navigation for screen-reader users. Only the "Beyond the Basics" subsections are real headings (and they are level 3 directly under nothing). I repaired this in the import; the Pressbooks source needs the same repair if it stays the master copy.
- [ ] **G5 (P2) Heading levels.** Pressbooks exported sections as H1. In Chapter 3, "Q2: Read the Foundation" is a top-level section while Q1 and Q3 to Q9 are subsections. In Chapter 5, "Chapter Recap" and "Reviewing Through Practice" sit one level too deep. In Chapters 11, 12, 13, and 17, the "Beyond the Basics" subsections jump a level. Normalized in the import; fix at the source.
- [ ] **G6 (P2) Appendix lettering.** The interactive registry labels the glossary flashcards "G"; the book's Appendix G is "The Worked Examples in Full." The book has no glossary appendix. [decide] what the glossary is called and where it sits. Also: the interactive repo covers A to D only; Appendices E to I have no interactive counterpart (fine, but the registry's "Appendices" list looks incomplete next to the book's).
- [ ] **G7 (P2) "Learning Objectives" versus "Chapter Objectives."** The Introduction says "Start each chapter with its Chapter Objectives"; every chapter's box says Learning Objectives.
- [ ] **G8 (P2) Capitalization of the three tools.** Counts across the book: "Research Log" 50 / "research log" 21; "Research Map" 2 / "research map" 18; "Annotated Outline" 2 / "annotated outline" 40; "Closing-Out Protocol" 2 / "closing-out protocol" 14. Chapter 3's tools paragraph itself flips between "The Research Map," "the research log," and "The Annotated Outline." Pick one style (the exercise text and the tip sheet capitalize Research Log) and apply it.
- [ ] **G9 (P2) Reflection Points.** Present once each in Chapters 1 to 9 and 11 to 13; **absent in 10, 14, 15, 16, and 17.** Appendix I has answers for Chapters 1 to 9 and 12 only, so **Chapters 11 and 13 have Reflection Points with no sample answer.** Chapter 3's Reflection Point in the text asks about reading *Hazelwood* before *Tinker* and *Fraser*; Appendix I's Chapter 3 answer is about the tomato and the Tariff Act ("after The Types in Motion"). They do not match.
- [ ] **G10 (P2) Template completeness** (the "familiar template" the Part II intro promises for Chapters 11 to 13):

  | Chapter | Questions This Source Answers | Beyond the Basics | Reflection Point |
  |---|---|---|---|
  | 4, 5, 6, 7 | yes | yes | yes |
  | 8, 9 | no (fine, cross-source) | no | yes |
  | 10 | no | no | **no** |
  | 11, 12, 13 | yes | yes | yes (no answer in App. I for 11, 13) |
  | 14, 16 | no | no | **no** |
  | 15 | no | yes (one paragraph that repeats an earlier one) | **no** |
  | 17 | no (stated on purpose) | yes (two thin subsections) | **no** |

- [ ] **G11 (P2) Draft figures still pending: 14 placeholders.** Each is a design spec in italics. Some are now answered by an embedded interactive:

  | Figure | Spec | Resolved by |
  |---|---|---|
  | 1.1 | Authority-interplay flowchart | *How Law Is Made* (not embedded) or draw it |
  | 2.2 | Citation anatomy with arrows | The three anatomy boxes already in the text. Placeholder is stale; delete. (Numbering also skips 2.3.) |
  | 2.4 | Natural language versus Boolean, with result counts | *Using Databases* (not embedded) |
  | 6.1 | A statute's journey to the code | *Life of a Statute* (not embedded) |
  | 7.1 | Regulation Currency Checklist (five steps) | Draw, or fold into the closing-out checklist |
  | 8.1 | Statute, regulation, case triangle | *Tracing the Law Across Sources* (not embedded) |
  | 9.1 | AND versus proximity | *Building a Precision Search* (not embedded) |
  | 9.2 | Diagnostic flowchart by symptom | Probably *Diagnose the Broken Search* (embedded); confirm |
  | 12.1 | Legislative-history timeline | *Trace the Bill* (embedded) |
  | B.1, C.1, D.1 | Annotated opinion, statute, CFR section | *How to Read a …* modules (embedded in Appendices B to D) |
  | C.2 | Canons quick-reference card | Not covered; a good download |
  | D.2 | Authority hierarchy for regulations | Draw it |

- [ ] **G12 (P3) Typos and mechanical errors found** (in the text as written):
  - Chapter 1: "judicial opinions.When" (missing space). A stray "Type your learning objectives here" (removed in the import). Exercise 1.2's list collapsed items (d) and (e) in the export (fixed by the new exercise text).
  - Chapter 3: "builds the those pauses" (intro). "Practical closures are intentional, not a result of poor planning. Running out of time before a deadline is not a practical closure; it is potential malpractice" has no final period, and "potential malpractice" is stronger than the tip sheet's "is not practical closure." The sample log entry's Method cell ends mid-phrase: "Found in Annotated United States Code (Westlaw) under general".
  - Chapter 7: an italic run swallows its period in the Guidance Documents preview ("…enforce their regulations*. Chapter 13 covers… depth.*").
  - Chapter 5 and Chapter 10: the ST Engineering cite appears with two different placeholder wordings (see Chapter 10, item 1).
  - Appendix G cites a California case in California style ("(2002) 95 Cal.App.4th 1005") while the rest of the book uses Bluebook.
  - Chapter 15's opening pull quote runs the case name into the quote ("Period.In re Martin").

---

## 5. Part II, chapter by chapter

Chapter numbers below are the **new** numbers. The export position is noted so you can find each in Pressbooks.

### Chapter 10: Ethics and Professional Responsibility in Legal Research (export position 10)

- [ ] **P1 ⚑ Two unfinished citations.** *ST Engineering Marine v. Thompson, MacColl & Bass*: "[pull the bound F.4th cite at the check]" in this chapter, and a different "[__ F.4th __]" wording in Chapter 5. *Royal Oak Ent. v. City of Royal Oak*, 486 F. Supp. 2d 675: "[pincite]" missing.
- [ ] **P1 [verify] Is *ST Engineering* a sanctions case?** The exercise is titled "The Sanctions Autopsy" (the instructor companion uses the same name), but as I understand the case, it is a legal malpractice decision about whether a lawyer's research fell below the standard of care, not a sanctions order. The chapter itself uses it under Rule 1.1 and in the competence discussion. If I am right, either rename the exercise or add a true sanctions decision (*Royal Oak* is a fee-shifting example already in the chapter; *Mata* is in Chapter 15). The exercise also asks students to map each failure to "the rule it violates"; a malpractice opinion may not tie failures to the Model Rules at all. The self-check partly covers that ("attributed to the opinion something it does not say"), but the task should say so.
- [ ] **P1 [error] "Verify the current text against the eCFR or the official code" for a *statute* citation.** The eCFR is the Code of Federal Regulations. For statutes, say the official or an annotated code (or Cornell/Congress.gov for the U.S. Code).
- [ ] **P1 [verify] Rule 3.3 knowledge standard.** The chapter says the rule reaches authority "known to the lawyer, which includes authority you should have found through competent research," and that "I didn't find it" is no answer. Rule 3.3(a)(2) turns on what the lawyer *knows* (and Rule 1.0's definition of "knows" is actual knowledge, though it can be inferred from circumstances). The duty to find the authority sits in Rule 1.1 and in Rule 11-type obligations; 3.3 is the duty to disclose what you know. As written, the chapter blends them and overstates 3.3. The sentence "The duty of candor therefore reaches back into the quality of your research" needs either a source or a reframing around Rule 1.1.
- [ ] **P1 [verify] Which rules students will actually meet.** The chapter uses ABA Model Rule numbers. The book is Arizona-based; confirm how your state numbers and words its equivalents (Arizona's are labeled as ethical rules, "ER"; verify) and add a line telling students to check their jurisdiction's version.
- [ ] **P2 [verify] Add or check ABA Formal Opinion 512** (generative AI, 2024) and your state bar's guidance. The chapter says "emerging court rules and bar guidance increasingly require disclosure"; name two or three real examples or soften.
- [ ] **P2 [verify] Quotations and pincites:** *Shields v. Town of Perrysville*, 136 N.E.3d 309, 312 n.2 (Ind. Ct. App. 2019) (the waiver quote and the footnote); *In re Martin*, 670 B.R. 636, 649 (Bankr. N.D. Ill. 2025) (the "Period." quote; the page); *ST Engineering*, 633 F. Supp. 3d 354, 361 (D. Me. 2022), and the First Circuit affirmance date and docket (No. 22-1844, Dec. 6, 2023). Chapter 10 says "Recall the following excerpt from Chapter 5"; the excerpt is there, but the two copies of the citation differ.
- [ ] **P2 Reflection Point missing** (G9). The chapter is a good place for one on Rule 3.3 and what a log proves.
- [ ] **P2 Section on supervision and AI:** Rule 5.3 covers nonlawyer assistance. Whether an AI tool counts as "assistance" under 5.3 is a question to settle against ABA Formal Op. 512 and your state's guidance [verify]; the chapter should say so rather than imply it.
- [ ] **P3** The three-column closing table is helpful. Add a row for Rule 1.1's technology comment and AI? The chapter's text has it; the table does not.
- **Interactive:** *Catch the Fabricated Citation* is embedded. *Duties Behind the Research* and *The Duty Calls* are not (§9). Check that the module's eight citations do not contradict the chapter's examples.

### Chapter 11: Dockets and Court Document Research (export position 11)

- [ ] **P1 ⚑ Production note in the body:** the PACER fee threshold and the automatic-waiver mechanics. **[verify]** the dollar figure and how the waiver works, and whether "separate research exemptions … granted court by court" is still accurate. The note itself says these go stale between editions; leave a dated "verified" line in the text once checked.
- [ ] **P1 [error] Question-type vocabulary.** "Questions This Source Answers" lists Application, **procedural**, and **strategic** questions. The book has four types (definitional, exploratory, focusing, application). Either map these to the four (procedural questions about what was filed are probably fact-finding application questions) or say that they are not types.
- [ ] **P1 Contradiction with Chapter 5.** Pitfalls and Key Takeaways say unpublished orders and briefs are "research tools and nothing more." Chapter 5 says unpublished opinions are usually non-binding, that citing rules vary by jurisdiction, and some allow citation. Distinguish *unpublished opinions* (may be citable and persuasive under local rules) from *filings* (briefs, complaints), which are never authority.
- [ ] **P1 [decide] Reverse chronology.** Your build note says the interactive must surface that dockets list newest entries first on some interfaces. The chapter says the docket shows "the filing sequence from complaint to judgment," which reads as oldest first. Say which platforms order which way (verify PACER, CourtListener, and the commercial services) so the chapter and *Read the Docket* agree. The chapter also never mentions multi-part entries (one motion with several attachments), the other unintuitive feature the module teaches.
- [ ] **P2 [verify] The *Mata v. Avianca* example:** "dozens of entries," the order to show cause, the affidavit attaching the fabricated opinions, the June 8 hearing transcript, and "the letters the court later required." Check each against the docket.
- [ ] **P2 [verify] Free-source claims:** CourtListener and RECAP availability; Justia and Google Scholar "partial free coverage"; Westlaw and Bloomberg docket coverage; "most state appellate courts offer more comprehensive online access than trial courts."
- [ ] **P2 Reflection Point has no answer in Appendix I** (G9).
- [ ] **P3** "Court Rules Research" says the Federal Rules are available at uscourts.gov. True, but students also meet them through Cornell's LII; fine either way.
- **Interactive:** *Read the Docket* embedded; *Pull the Right Paper* not.

### Chapter 12: Legislative History Research (export position 15)

- [ ] **P1 ⚑ Figure 12.1** (timeline). *Trace the Bill* is embedded and teaches the same pipeline. Decide whether to drop the figure.
- [ ] **P1 [error] Vocabulary:** committee reports answer "foundational questions about purpose; hearings answer background questions." "Foundational" is an exploratory subtype; "background" is not a type. Chapter 4 also says "background question."
- [ ] **P2 [verify] Database names and coverage:** "ProQuest Congressional" and "Legislative Insight" (product names have changed hands), HeinOnline's U.S. Federal Legislative History Library, Westlaw and Lexis coverage, USCCAN, the Union List of Legislative Histories, Nancy Johnson's *Sources of Compiled Legislative Histories*. Add Congress.gov's coverage start dates so students know when to go elsewhere.
- [ ] **P2 [verify] ADA identifiers** (Pub. L. No. 101-336, 104 Stat. 327 (1990); S. 933; 101st Congress) and the sample cite "H.R. Rep. No. 101-485, pt. 2, at 67 (1990)." If the pincite is illustrative, say so; Exercise 12.3 has students build the same kind of cite.
- [ ] **P2 [verify] "Arizona … often only session laws and committee minutes."** The legislature's site offers more than that today; check, and consider an Arizona-specific tip box.
- [ ] **P2 Textualism:** the chapter treats the textualist-versus-purposivist question as the key check on how much weight a court gives history. That is a good instruction; consider naming current Supreme Court practice and the Arizona courts' approach, and tell students where to confirm.
- [ ] **P2** Weight vocabulary is consistent between the chapter's list and the module ("high, moderate, low"), but "floor debates: variable" and "presidential statements: low to moderate" are not mirrored in Exercise 12.3's self-check ("if your ranking matches this chapter's weight hierarchy…"). A student can rank a floor statement at any level and be right. Tighten.
- [ ] **P3** Pitfalls section is a single dense paragraph; consider the list form used in other chapters.
- **Interactive:** *Trace the Bill* embedded; *Weigh the History* not (§9).

### Chapter 13: Advanced Administrative Research (export position 16)

- [ ] **P1 [error] "SEC EDGAR for no-action letters."** EDGAR hosts company filings; the SEC posts no-action letters on sec.gov. Fix the example (or name the right page).
- [ ] **P1 [verify] Deference after *Loper Bright Enterprises v. Raimondo*, 603 U.S. 369 (2024).** The chapter covers *Chevron* and *Skidmore*. It does not mention (a) that earlier decisions that relied on *Chevron* keep their precedential force, or (b) *Kisor v. Wilkie* and *Auer* deference, which governs an agency's reading of its own ambiguous *regulation*. Exercise 13.2 ("pick the vaguest operative term in the regulation and ask how the agency defines it in practice") sits squarely in *Auer/Kisor* territory. Run a citator on *Loper Bright* and *Kisor* and update to today's law before this is published; I cannot see what the courts have done since my knowledge ends.
- [ ] **P1 Duplicate section.** "Guidance Documents: Influential but Not Binding" appears in both Chapter 7 (a short preview) and here (the full treatment). The overlap is intended; make sure they agree and point to each other. Chapter 7's version already previews *Loper Bright*; see G12 for its italics glitch.
- [ ] **P1 Research Log field.** This chapter tells students to add an Authority Level field or use Notes (see §3).
- [ ] **P2 [verify] Exercise 13.3** asks for "a search or a citator pass" on a guidance document. KeyCite and Shepard's may not cover agency guidance as cited documents. Say what tool does.
- [ ] **P2 [verify] EEOC materials:** 29 C.F.R. Part 1605, the Compliance Manual's religious-discrimination section, and the "adjudication decisions" the exercise sends students to (federal-sector decisions). Chapter text and exercise both depend on what is posted today.
- [ ] **P2** FOIA delay ("months or years") appears in three places (search bullets, pitfalls, Beyond the Basics). Keep one and cross-reference.
- [ ] **P2 Reflection Point has no answer in Appendix I** (G9).
- [ ] **P2** The Part II intro says the chapter covers "where agency interpretations stand after *Loper Bright*." A reader should see a dated statement of the law in the chapter itself ("as of November 2026").
- **Interactive:** *Weigh the Agency Materials* embedded; *Beyond the Rule* not.

### Chapter 14: Practice-Specific Research Strategies (export position 12)

- [ ] **P1 ⚑ "Kiss Pharm LLC v. Becker Prof'l Dev. Corp." pincite** is "at *[pin]". **[verify]** the case, docket number, WL cite, and the quote.
- [ ] **P1 [error] Stale cross-reference in the old body text.** The chapter body's exercise referred to "Exercise 8.5." Chapter 8 ends at 8.3. The new docx version fixes this by pointing to "the drone scenario printed in Chapter 8"; that is what is in this build.
- [ ] **P1 [decide] Closure language.** Your note on this chapter: practice-specific research closes *practically* more often than appellate work. The chapter's "closure criteria" never use the book's analytical and practical closure terms (Chapters 3 and 9). Add two or three sentences tying each practice context to the closure type it tends to reach, and where the Research Log changes function, say how the closure note changes with it.
- [ ] **P2 [verify] NextGen statement:** "The NextGen Bar Exam recognizes this; it is built to balance … litigation and transactional practice." Verify against NCBE's published content description (see Chapter 16).
- [ ] **P2 [verify] Product names:** Practical Law (Westlaw), Lexis Practice Advisor, Bloomberg Law "transactional intelligence tools, deal analytics," "judicial analytics: tools tracking individual judges' rulings." Add two named examples or none; remove claims you cannot confirm. SEC EDGAR is fine as named.
- [ ] **P2 Template:** no Reflection Point, no "Questions This Source Answers" (fine, it is a context chapter, but say so in the opening as Chapter 17 does).
- [ ] **P3** The three context sections repeat the same four headings by design; the "Adapting the Question Method" section is two sentences and could carry a comparison table (question type, first source, closure) that the interactive already uses.
- **Interactive:** *Pick the Parameters* embedded; *Same Cycle, Different Parameters* not.

### Chapter 15: GenAI and Legal Research (export position 17)

- [ ] **P1 [verify] Date-stamp the demonstration.** "AI in Practice" reports three prompts and what the tool returned (Mahanoy, Papish, *Kennedy v. Bremerton*). These outputs will not replicate. Say which tool and version, and the date you ran them. Also, "all citations verified in Westlaw" needs the same date.
- [ ] **P1 [verify] *Mata v. Avianca, Inc.*, 678 F. Supp. 3d 443 (S.D.N.Y. 2023):** the Montreal Convention issue, "six decisions that did not exist," the exchange in which the tool said the cases were real and available on Westlaw and Lexis, and the "$5,000 sanction under Rule 11." Check whether the court also relied on its inherent authority or 28 U.S.C. § 1927.
- [ ] **P1 [verify] Product names:** "AI research features built into Westlaw, Lexis+, and Bloomberg Law." Names and tiers have changed and will again. Use the generic description and name products once, with a date.
- [ ] **P1 [verify] Evidence for "more reliable … risk profile is lower."** The chapter asserts that database-integrated tools hallucinate less. Cite a study (I recall 2024 evaluations of commercial legal AI tools from Stanford researchers; verify the title and findings before citing) or soften the claim.
- [ ] **P1 [verify] "Many courts now require disclosure of AI use in filings."** Name how many or give two examples.
- [ ] **P1 Duplicated material.** The *In re Martin* quote opens both this chapter and Chapter 10. The paragraph about database-integrated AI appears in "How Generative AI Works" and again under Beyond the Basics (nearly word for word). The claim that application questions are where AI fails is made in the opening, the cycle section, the demonstration, the pitfalls, the recap, and the takeaways.
- [ ] **P2 Research Log fields** referred to as "Source Consulted" and "How This Answers My Question" (§3).
- [ ] **P2 Learning objective not delivered.** "Apply professional responsibility obligations governing AI use" is deferred to Chapter 10 in the text. Either soften the objective or add the Rule 1.1, 3.3, and 5.3 application here.
- [ ] **P2 Template:** no Reflection Point.
- [ ] **P3** The chapter is placed last in the export and first among the "tools" in the intro; the intro's phrase "Generative AI tools demand the cycle's verification discipline more than any source before them" could use "than any source before them" checked (it is a rhetorical claim).
- **Interactive:** *How the Machine Guesses* and *Verify the AI's Work* embedded; *Right Tool, Right Question* not.

### Chapter 16: The NextGen Bar Exam and Legal Research (export position 13)

- [ ] **P1 [verify] NCBE descriptions.** "Foundational Skills Group C," the four activities named in the opening ("preliminary issue-spotting, working with provided resources, developing and refining a theory of the case, reaching closure"), and "balanced between litigation and transactional practice." Check against NCBE's current published content scope. Also confirm which jurisdictions administer the exam and when (Arizona included), since a student in Fall 2026 needs to know whether this applies to them.
- [ ] **P1 [decide] Whose five skills?** The chapter says "The NCBE competencies consolidate into five skills, which this textbook names as follows." Make it unmistakable that the five names are yours, and keep NCBE's wording out of the text (your build note: never reproduce NCBE content; format only).
- [ ] **P1 [error] Recap vocabulary.** The recap lists "issue-spotting, source evaluation, analogical reasoning, and research closure." The key takeaways list the five named skills (ambiguity spotting, source ranking, dispositive fact identification, research gap identification, sufficiency). Use one list.
- [ ] **P2 [verify] "Forty-five minutes of exam time is this whole cycle."** Is 45 minutes an exam figure or your classroom figure? Exercise 16.1 uses 45 minutes as an instruction. Reword if it is yours.
- [ ] **P2** The skills mapping ("Developed in Chapter 6 (Statutes) and Appendix C; applied in Chapters 5, 7, and 8") should match *Five Skills, Mapped* (not embedded). Check the two agree.
- [ ] **P2** The convenience-store *Example* is a good worked triage; confirm it does not track the released NCBE sample's facts.
- [ ] **P2 Template:** no Reflection Point.
- **Interactive:** *The Closed Universe* embedded; *Five Skills, Mapped* not.

### Chapter 17: Research for Legal Scholarship (export position 14)

- [ ] **P1 [decide] "Preemption" collides with Chapter 1 and Chapter 6.** Federal preemption is a doctrine students learned in Part I; here preemption means checking whether your argument has been made. Add a sentence: "This is a different use of the word."
- [ ] **P1 Vocabulary.** The chapter says "the question taxonomy travels with you, and scholarship stacks one more level": doctrinal, scholarly, and normative questions. These are not research-question types. They describe the macro questions of a paper. Say so, and do not use the word "types."
- [ ] **P2 [verify] Claims to source or cut:** "the Congressional Research Service publishes a regular roundup of new splits"; "several blogs track them weekly" (name them or drop the sentence); the Westlaw-style connector "circuit /s split" (say which platform); bepress Digital Commons network; Sociological Abstracts and PsycINFO availability; HeinOnline as "most comprehensive."
- [ ] **P2** The SSRN working-paper caution appears three times (search paragraph, pitfalls, Beyond the Basics). Keep one.
- [ ] **P2** The two Beyond the Basics subsections ("Citing Secondary Sources in Scholarly Writing," "SSRN and Working Papers") are two to three sentences each and mostly repeat earlier text. Either develop or fold in.
- [ ] **P2** The preemption protocol is introduced with "formatted like the book's others" and then lists three steps in prose. The other chapters' checklists are bulleted.
- [ ] **P2 Template:** no Reflection Point.
- **Added:** the **Scholarship Research Checklist** (ten steps) from the interactive site's Chapter 17 page now sits at the end of the chapter, and it is also a download. Edit `content/extras/ch17-scholarship-checklist.md` to change both.
- **Interactive:** none, per your standing decision.

---

## 6. Part I notes (lighter; full read still owed)

- [ ] **Ch. 1 (P1) ⚑** Figure 1.1 pending. The old Exercise 1.1 to 1.3 text is gone (replaced). The placeholder "Appendix X" references are fixed. The *Midland Power* exercise is no longer taught anywhere (G3). Primary-versus-secondary and binding-versus-persuasive mechanics are now a condensed summary plus the Hierarchy interactive; the *Li v. Yellow Cab* passage and the Reflection Point are kept. [verify] *Rowan Cos. v. United States*, 452 U.S. 247 (1981) and the Social Security Amendments of 1983 account; *Texas v. Johnson*, 491 U.S. 397 (1989); *Li v. Yellow Cab Co.*, 13 Cal. 3d 804 (1975).
- [ ] **Ch. 2** ⚑ Figures 2.2 (stale) and 2.4, and no Figure 2.3. The cite-check note on Exercise 2.3's three retrieval targets (*Hazelwood*, 484 U.S. 260; 42 U.S.C. § 12101; 29 C.F.R. § 1605.1) is flagged in the text; confirm them or substitute. "Chapter 9 covers the full precision toolkit" and "Chapter 15" are correct under the new numbering.
- [ ] **Ch. 3 (P1)** Research Log schema (§3). The Reflection Point and its Appendix I answer do not match (G9). Section-heading level for Q2 (G5). The closure paragraph's missing period and the "potential malpractice" phrasing (G12). The reverse-engineering section is now the interactive plus the three "what to notice" paragraphs; [verify] the interactive spells the case "*Oakland Police & Fire Ret. Sys. v. Brown*" while the book gives "*Mayer Brown, LLP*" (861 F.3d 644).
- [ ] **Ch. 4** The source-types table lists "CRS report" under Survey; the tip sheet's survey list (ALR, Restatements, 50-state surveys) omits it. Align.
- [ ] **Ch. 5** The ST Engineering placeholder (Ch. 10, item 1). Unpublished-opinion paragraph (Chapter 11 contradiction).
- [ ] **Ch. 7** The Chapter title in the new docx is "Basic Regulations and Administrative Research"; the book calls it "Regulations and Administrative Research." Choose one (the "Basic" helps distinguish Chapter 13). Figure 7.1 pending. Italics glitch (G12).
- [ ] **Ch. 8, 9** Figures 8.1, 9.1, 9.2 pending. **Chapter 9's closing-out protocol has four steps; the tip sheet's Checklist 3 has eight.** Chapter 10 refers to "the closing-out protocol's second step" (updating through a citator) and "the final sweep." Align the numbering so the book, the tip sheet, and Chapter 10 describe the same sequence.
- [ ] **Introduction (P2)** "How to Use This Textbook" covers first-year courses and Part I only. Add Part II and the interactive edition.

---

## 7. Appendices and front matter

- [ ] **A to D** ⚑ Figures B.1, C.1, C.2, D.1, D.2 pending (G11). Each now opens with its *How to Read…* module; the written "Components" and "How to Engage" sections remain beneath it. **Overlap candidate (P3):** the module may now make some of that text redundant.
- [ ] **E** (drill walkthroughs) uses brackets to mean "verify against current law." That convention is explained at the top; keep it, but make sure the built site does not read the brackets as draft flags (it does not).
- [ ] **F** (Chapter 3 full log) uses a different field set from Chapter 3 (§3). Numbered "1. Research Question."
- [ ] **G** (worked examples) cites California cases in California style (G12). [verify] the ADA website-accessibility example's law as of the stated 2026 date.
- [ ] **H** (sample answers) matches the new exercise numbers and titles. I did not read the answers. The Chapter 14 to 17 answers should be re-read against the new text, especially 14.1 (changed most).
- [ ] **I** (Reflection Point answers) is missing Chapters 11 and 13; Chapter 3 mismatch (G9).
- [ ] **Front matter (P1/P2).** The AI-use statement says "Nothing about reading, hosting, or updating this book will utilize another large language model" and then says the interactive site might. Reconcile. [verify] the environmental figures (12 kWh, 12 kg CO2, 100 L water; 400 L for a print textbook; hosting 3 to 7 kWh per GB per year) against sources, and cite them. "At least 40 students this year" and "Fall 2026" will date the book; consider moving them to the Pressbooks edition notes.

---

## 8. Reviewing Through Practice: integration notes

- Replaced wholesale in all 17 chapters, per the docx. For Chapters 1, 2, 3, and 9 the descriptive shells are replaced too.
- Moved to after Key Takeaways everywhere. Chapter 8's section had sat before Common Pitfalls; the docx said either position worked.
- The docx's drill exercises (4.3, 5.3, 6.3, 7.3, 8.3) keep their Appendix E cross-references.
- **Two cite-check flags came from the docx itself:** Exercise 2.3's three retrieval targets (above). Everything else in the docx reuses citations already in the manuscript.
- The docx says the Beans Exercise stays instructor-side, "as the Chapter 3 text promises." I did not check that promise in Chapter 3.
- I appended a one-line pointer to Appendix H at the end of each chapter's exercises.
- **Interactive overlap to settle:** several exercises have a practice module that drills the same skill (Exercise 3.1 and *Type the Question*; Exercise 2.3 and *Database Practice*; Exercise 9.2 and *Diagnose the Broken Search*). The chapter shows the module under "Practice Online" before the written exercises. [decide] whether the modules are practice for the exercises or substitutes for some of them.

---

## 9. Interactives: what is embedded, what is not

**Embedded (22 in chapters, 4 in appendices, plus flashcards and toolkit):**

| Chapter | Embedded | Placement |
|---|---|---|
| 1 | Hierarchy of Authorities; Applying the Hierarchy | replaces the hierarchy mechanics; practice at end |
| 2 | Database Interface Explorer | replaces Figure 2.1 |
| 3 | Reverse-Engineering the Question; Type the Question; Notice of Claim sandbox | replaces the demonstration; after Types of Questions; practice |
| 4 | Types of Secondary Sources; Secondary Sources Practice | after the source-types section; practice |
| 5 | Case Law Practice | practice |
| 6 | Statutes Practice | practice |
| 7 | Regulations Practice | practice |
| 8 | Across Sources Practice | practice |
| 9 | Knowing When to Stop; Diagnose the Broken Search | after closing-out protocol; practice |
| 10 | Catch the Fabricated Citation | practice |
| 11 | Read the Docket | after Understanding a Docket |
| 12 | Trace the Bill | after the source-weights list |
| 13 | Weigh the Agency Materials | practice |
| 14 | Pick the Parameters | practice |
| 15 | How the Machine Guesses; Verify the AI's Work | after how LLMs work; practice |
| 16 | The Closed Universe | practice |
| 17 | none | per your decision |
| App. A to D | How to Read a Secondary Source / Case / Statute / Regulation | top of each appendix |

**Not embedded (23 pages), and what each would replace or add:**

| Module | Chapter | Overlap with the text | Add it if… |
|---|---|---|---|
| How Law Is Made | 1 | Sources of U.S. Law, Interplay, Figure 1.1 | you want the authority-interplay flowchart answered |
| Using Databases | 2 | Reading a citation; Finding the cited source; connectors | Exercise 2.1 to 2.3 need a rehearsal |
| Database Practice | 2 | Practical Search Strategy | |
| The Research Subway Map | 3 | Three Tools, One Process; the full demonstration | you want a second look at chains |
| Working the Chain | 3 | Exercise 3.2 | |
| How to Use a Secondary Source | 4 | Appendix A "How to Engage" | |
| Cases as a Web of Answers; Run the Citator | 5 | Citators subsection | the citator section is too thin |
| The Life of a Statute; How to Find a Statute | 6 | Session Laws vs. Codes; Figure 6.1 | |
| How to Find a Regulation | 7 | Organization of federal publications | |
| Tracing the Law Across Sources; Following the Question Trail | 8 | The Triangle; Figure 8.1 | |
| Building a Precision Search; Mixed Review | 9 | Connector set; Figure 9.1 | |
| Duties Behind the Research; The Duty Calls | 10 | duties sections | |
| Pull the Right Paper | 11 | Answering Questions with Court Documents | |
| Weigh the History | 12 | weights list | |
| Beyond the Rule | 13 | Evaluating Administrative Authority | |
| Same Cycle, Different Parameters | 14 | the three parameters | |
| Right Tool, Right Question | 15 | What GenAI Can and Cannot Do | |
| Five Skills, Mapped | 16 | Five Core Research Skills | |

To change the set: edit the embed lists in `book.json`, then

```bash
python3 scripts/sync_interactives.py --src ../legal_research_interactive
python3 scripts/import_pressbooks.py --xhtml source/The-Question-Method-of-Legal-Research.html --rtp source/Reviewing_Through_Practice_FULL_Ch1-17.docx   # only if you have NOT edited the chapter files
python3 build.py
```

**Issues I noticed in the interactive repo (for its own notes):**

- The Research Log field set differs from Chapter 3 (§3).
- The registry's glossary label "G" collides with Appendix G (G6).
- The interactive's Chapter 17 page carries the scholarship checklist; no module.
- The interactive spells *Oakland Police & Fire Retirement System v. Mayer Brown* as "Brown" (§6).

---

## 10. Downloads

- [ ] **Quick Tips sheet** (docx, with a PDF preview). Content matches the book in tone and in the four question types. Differences: Checklist 3 has eight steps and the book's protocol has four (§6); the tip sheet does not name the Research Log fields (§3). "Hands at 10 and 2" matches the Chapter 4 exercise-set language.
- [ ] **Research Log template** (xlsx): six columns versus the book's eight (§3). The header "Source " has a trailing space. Instruction text sits in row 2 of the data area, so a student has to overwrite it. No cell for the macro question. No dropdown for question type.
- [ ] **Worked example** (docx, with a PDF preview). Needs a pass before students see it:
  - Leftover author notes: "Please note, I've numbered some"; "The bracketed source and question type are notes from me, not part of the map"; "Yahweh would surface later when looking for an answer."
  - An incomplete sentence: "Since you learn new questions as you research" (ends there).
  - Typo: "asses" (assess).
  - Highlight formatting on citations has no explanation.
  - The log uses "Answer" and "The answer," "Source" and "Pinpoint," "Next Question" and "Next question."
  - The statute cite uses a Unicode hyphen ("12‐821.01"), which breaks copy-and-paste into a database.
  - [verify] every Arizona citation: *UMB Bank v. Parkview*, *Backus v. State*, *Deer Valley v. Houser*, *Yollin v. City of Glendale*, *Falcon ex rel. Sandoval v. Maricopa County*, *Donovan v. Yavapai County Community College*, *Yahweh v. City of Phoenix*, *City of Mesa v. Ryan*, and the 180-day rule in A.R.S. § 12-821.01.
  - I did not compare it with the Notice of Claim sandbox module; they should tell the same story.
- **Generated:** *Key Takeaways and Common Pitfalls by Chapter* (rebuilt from the chapters on every build) and the *Scholarship Research Checklist*.
- **Ideas I did not build:** a C.2-style canons quick-reference card (Figure C.2 is already specified), a one-page "Currency Checklist" (Figure 7.1), and a Search Log template for Chapter 9. Say the word.

---

## 11. Verification list (everything with a date or a citation in Part II)

Check each against the primary source and note the date you checked it.

| Chapter | Item |
|---|---|
| 10 | Shields v. Town of Perrysville, 136 N.E.3d 309, 312 n.2 (Ind. Ct. App. 2019) |
| 10 | In re Martin, 670 B.R. 636, 649 (Bankr. N.D. Ill. 2025) |
| 10 | ST Engineering Marine v. Thompson, MacColl & Bass, 633 F. Supp. 3d 354, 361 (D. Me. 2022), aff'd, No. 22-1844 (1st Cir. Dec. 6, 2023); F.4th cite |
| 10 | Royal Oak Ent. v. City of Royal Oak, 486 F. Supp. 2d 675 (E.D. Mich. 2007); pincite and quote |
| 10 | Model Rules 1.1 (and cmt. 8), 3.3, 5.1, 5.3; state versions; ABA Formal Op. 512 |
| 11 | PACER fee threshold and waiver; research exemptions |
| 11 | Mata docket details (hearing date, filings, count) |
| 11 | CourtListener/RECAP, Justia, Bloomberg, Westlaw docket coverage |
| 12 | Pub. L. No. 101-336, 104 Stat. 327 (1990); S. 933; H.R. Rep. No. 101-485, pt. 2, at 67 |
| 12 | ProQuest Congressional / Legislative Insight, HeinOnline, USCCAN, compiled-history sources |
| 12 | Arizona legislative-history availability |
| 13 | Loper Bright Enterprises v. Raimondo, 603 U.S. 369 (2024); Skidmore v. Swift & Co., 323 U.S. 134 (1944); Kisor/Auer; later developments |
| 13 | 5 U.S.C. § 552 (FOIA); 29 C.F.R. Part 1605; EEOC Compliance Manual section; SEC no-action letter location |
| 14 | Kiss Pharm LLC v. Becker Prof'l Dev. Corp., No. 18 C 7848, 2021 WL 3207822 (N.D. Ill. July 29, 2021); pin |
| 14 | Product names and claims (Practical Law, Lexis Practice Advisor, Bloomberg, judicial analytics) |
| 15 | Mata v. Avianca, Inc., 678 F. Supp. 3d 443 (S.D.N.Y. 2023); facts and sanction basis |
| 15 | Papish v. Bd. of Curators of Univ. of Mo., 410 U.S. 667 (1973); Mahanoy; Kennedy v. Bremerton Sch. Dist., 597 U.S. 507 (2022) |
| 15 | AI product names; evidence for "more reliable"; court disclosure rules |
| 16 | NCBE content scope ("Foundational Skills Group C"); jurisdictions and dates; the 45-minute figure |
| 17 | CRS circuit-split roundup; named databases; the connector syntax |
| Intro | Environmental estimates; "40 students"; "Fall 2026" |
| Ch. 1 to 3 | Rowan, Texas v. Johnson, Li v. Yellow Cab, Nix v. Hedden, Hazelwood, 42 U.S.C. § 12101, 29 C.F.R. § 1605.1 |

---

## 12. Repository notes

- `content/` holds the editable Markdown (pandoc dialect). After you start editing it, **do not re-run the importer**; it overwrites `content/`. It exists so the import can be audited (`content/_archive/IMPORT-LOG.md`) and repeated from the Pressbooks export if you want to start over.
- `source/` keeps the two originals the importer reads.
- `interactives/` is a vendored copy of the modules the book embeds. Never edit it; re-sync from the interactive repo.
- The site makes no external requests (checked by `build.py`), and every embedded module opens in a new tab as well.
- The yellow draft flags are Markdown spans (`[text]{.flag}`) in `content/`; remove the markup when you resolve one.
