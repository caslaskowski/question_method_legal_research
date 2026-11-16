# Instructional design review: The Question Method of Legal Research, Interactive Edition

Reviewer role: instructional designer (higher education, legal education, interactive textbooks). Read-only review of branch team-review.

**What I read.** README.md, EDITING-NOTES.md (skimmed), the author's quickref.md and checklist.md, content/front/introduction.md and both part intros, all seventeen chapters (Chapter 3 in full, twice), Appendices E, H and I in full, A to D in full, F and G in part, assets/book.js in full, the built pages ch-1/index.html, ch-3/index.html and ch-15/index.html, and I drove the sort, order and annotate interactives in headless Chromium against a local server to confirm what the engine actually does on a wrong pick, on a partial order, and on a verdict mark.

**Format.** Each item gives file, location (exact anchor text to grep), problem, proposed fix, priority (P1 fix now, P2 should, P3 polish) and whether it is **safe to apply** without the author or **needs the author's decision**. Proposed text is drafted in the author's voice. Interactives are drafted in the exact README syntax, ready to paste. Where I quote existing text it is verbatim so an applier can place it.

**Scale.** 44 interactives: 13 explore, 10 annotate, 8 sort, 6 choice, 2 search, 2 switch, 1 order, 1 checklist, 1 reveal, 1 tokens, 1 flashcards. The two most common kinds, explore and annotate (23 of 44), are read-only: the reader selects a part and reads a note. The kinds that require the reader to commit before seeing an answer (choice, sort, order, reveal, search) number 18, and only one of them, the single reveal in Chapter 3, asks the reader to *write* anything. For a book whose method is "write the question, write what you found, write the next question," that balance is the main instructional finding, and most of the proposals below move it.

---

## Part A. Method violations and broken scaffolding (P1)

### 1. The Quick Check is missing from the book

- **File:** content/chapters/ch-03.md
- **Location:** `## The Five Steps and Intermittent Checkpoints`, the paragraphs beginning `**Step 4: Identify your next question.**` and `**Checkpoint, Reflect and Evaluate:**`; the ring interactive `title="The cycle, and the question each step asks of you"`; `## Chapter Recap`.
- **Problem:** The author's checklist makes the Quick Check (am I in a headspace to keep researching; if not, write next steps for future-you and pivot) a step in every cycle, between mapping and choosing the next question. The phrase "Quick Check" appears nowhere in content/. Chapter 3 teaches only the Checkpoint (sources current, authoritative, right jurisdiction). Principle 3 of the brief requires the pauses to be taught and practised; this one is not even named. Chapter 14 then says "The five steps and intermittent checkpoints stay the same," and Chapter 15 says "Step 5, repeat. Unchanged, and so is the checkpoint," so the omission propagates.
- **Fix (three insertions).**
  1. After the paragraph `**Step 4: Identify your next question.** Based on what you found, what do you still need to know? Write it down.` insert:

     > **Quick Check.** Before you pick up the next question, ask one about yourself: am I in a headspace to keep researching? Tired, rushed, or distracted research is where a false hit gets logged as an answer. If the answer is no, write two lines for future you, where you stopped and what you were about to ask, and pivot to writing or another task. If yes, carry on. The Checkpoint below asks whether the research is working. The Quick Check asks whether you are.

  2. In the ring interactive, after the `- **4. Identify the next question **` item and before `- **Checkpoint **`, add a node (the ring has no `edges=`, so the engine draws curved arrows for five nodes and keeps the Checkpoint in the centre):

     ```markdown
     - **Quick Check ** *Am I in a headspace to keep going?* A short, honest look at yourself rather than at the research. If the answer is no, write the next step down for future you and pivot. The cycle will still be here when you come back.
     ```
     And change the opening line `Four steps turn. The checkpoint sits in the middle because you can stop and take it at any point. Select each one.` to `Five moves turn, the last of them a check on yourself. The Checkpoint sits in the middle because you can stop and take it at any point. Select each one.`
  3. In `## Chapter Recap`, change `pausing to reflect in every cycle and once more, formally, before you close out.` to `with a Quick Check on yourself before each new question, a Checkpoint on the research whenever it feels off, and both run formally before you close out.` Add a Key Takeaway: `- Two pauses, two objects. The Quick Check asks whether you can keep going well; the Checkpoint asks whether the research is working. Write the next step down before you pivot.`
- **Priority:** P1. **Safe to apply** (wording is drawn from the author's own checklist).

### 2. A "Name the type" sort item frames an Application question as a liability prediction

- **File:** content/chapters/ch-03.md
- **Location:** sort `title="Name the type"`, the item `- Is a dog owner liable when the dog bites a guest who was teasing it? **Application**` and its feedback `Specific facts in the question (a bite, a guest, teasing) are the tell. It asks how a rule has operated on facts like these.`
- **Problem:** "Is the owner liable when..." asks for an outcome on a fact pattern. That is the shape of the forbidden "how does the rule apply to our facts" question, and the feedback blesses it as Application. Two paragraphs earlier the chapter has just said an Application question "asks how the rule works once you apply it to specific facts," and the Research Pause section later corrects that to "how courts have applied a rule to facts." The sort item teaches the uncorrected version.
- **Fix:** replace the item and its feedback with:

  ```markdown
  - How have courts applied the dog-bite rule when the bitten guest was teasing the dog? **Application**
      - It asks how the rule has operated on facts in decided cases (a bite, a guest, teasing). Notice what it does not ask: whether this owner is liable. That answer is written into your outline, not researched.
  ```
  Also tighten the definition that precedes it: `[**Application questions**]{.gloss}ask how the rule works once you apply it to specific facts.` to `[**Application questions**]{.gloss} ask how courts have applied the rule to facts in decided cases.` (This also fixes the missing space after the span.)
- **Priority:** P1. **Safe to apply.**

### 3. Exercise 3.1 and its sample answer teach the client-facts question as Application

- **Files:** content/chapters/ch-03.md and content/appendices/h.md
- **Location:** ch-03 `### Exercise 3.1 — Name the Type`, item `(e) How do my client's facts compare to the facts of the leading cases in this jurisdiction?` and the sentence `One of the eight is not a research question at all. Find it and say what kind of question it is instead.`; h.md `### Exercise 3.1 — Name the Type`, `(e) Application: it asks how a rule operates on specific facts by comparison to decided cases.`
- **Problem:** Item (e) is, word for word, the writing-step question the chapter's Research Pause section says "is not a research question. No database can answer it." The sample answer labels it Application anyway. This is the single most consequential violation in the book, because it sits in the chapter that defines the type and in the appendix students check themselves against.
- **Fix (recommended):** make (e) a second intruder, which turns the error into the lesson. In ch-03 replace `One of the eight is not a research question at all. Find it and say what kind of question it is instead.` with `Two of the eight are not research questions at all. Find both and say what kind of question each is instead.`; replace `**Deliverable:** the eight labels with justifications, plus the intruder identified.` with `**Deliverable:** the labels with justifications, plus the two intruders identified and rewritten as the question the method would ask instead.`; replace the self-check sentence `the intruder is a factual, investigative question; the law will never answer it, only evidence will. If you labeled all eight with a question type, revisit the distinction between what you research and what you investigate.` with `one intruder is a factual, investigative question; the law will never answer it, only evidence will. The other is a writing question: it measures the rule against your own client’s facts, which happens in the bracketed notes on your outline during a research pause, never in a database. If you labeled it Application, reread A Research Pause: Write the Application into the Outline, and then rewrite it as the research question that sits behind it.` In h.md replace `(e) Application: it asks how a rule operates on specific facts by comparison to decided cases.` with `(e) The second intruder: not a research question. It asks how the rule applies to your client’s facts, which is the writing step, done in brackets on the outline. The research question behind it is “how have the leading cases in this jurisdiction applied the rule to facts like these?”, and that one is Application.` and change `If all eight received a question type` to `If all eight received a question type, or if (e) received one`.
- **Priority:** P1. **Needs the author's decision** (it changes the exercise's structure), but the text above is complete.

### 4. Chapter 14 states the forbidden framing four times, and Appendix H repeats it

- **Files:** content/chapters/ch-14.md, content/appendices/h.md
- **Locations and fixes (all verbatim):**
  - ch-14, `Three parameters shift.` paragraph: `litigation runs heavily on application questions (how do these facts compare to the controlling cases?)` → `litigation runs heavily on application questions (how have the controlling cases applied the rule to facts like these?)`
  - ch-14, `## Litigation Research`, `**Characteristic questions.**`: `“How do the facts of my case compare to the leading cases?” “Does the statute of limitations bar my client’s claim given these specific dates?”` → `“How have the leading cases applied this rule to facts like my client’s?” “When have courts held that the limitations clock started running in situations like this one?”`
  - ch-14, `## Regulatory and Compliance Research`, `**Characteristic questions.**`: `“Does my client’s waste management process comply with RCRA Subtitle C?”` → `“What has the EPA treated as a violation of RCRA Subtitle C in waste-management processes like my client’s?”`
  - ch-14, switch table `title="Three practices, three settings"`, first row: `Application. *How do these facts compare to the controlling cases?*` → `Application. *How have the controlling cases applied the rule to facts like these?*`
  - h.md, `### Exercise 14.1 — Three Postures, One File`: `Q3, how do our client’s flight facts, altitude, frequency, camera use, compare to the decided cases? (application)` → `Q3, how have courts applied [that claim] to drone flights with facts like ours, altitude, frequency, camera use? (application). Comparing our facts to those decisions is the bracketed note on the outline, not a log entry.`
- **Problem:** Every example of a litigation application question in the chapter is the client-facts version, and the switch interactive broadcasts it as the headline. Students who reach Chapter 14 will overwrite the Chapter 3 correction with these.
- **Priority:** P1. **Safe to apply.**

### 5. Chapter 16 lists "how do these facts compare" among the research questions

- **File:** content/chapters/ch-16.md
- **Location:** the Example box `**Excerpt triage, run once.**`, the clause `its research questions (what is the rule; what makes crime foreseeable under it; how do these facts compare to the applied case); each answered from the source triage identified for it`.
- **Fix:** `its research questions (what is the rule; what makes crime foreseeable under it; how did the applied case run the rule on its own facts), each answered from the source triage identified for it; then the writing step, comparing the client’s facts to those decisions;`
- **Priority:** P1. **Safe to apply.**

### 6. Appendix E, Chapter 5 drill: Q3 applies the test to the client's store as a research question

- **File:** content/appendices/e.md
- **Location:** `**Q3. Under that test, were there enough similar prior crimes at this location to make the assault foreseeable?** *(Application, fact-finding)*` and its answer `The student finds state decisions applying the test to comparable facts and compares them to the client’s facts, identifying which facts the courts treated as dispositive: the number, proximity, recency, and similarity of any prior incidents.`
- **Fix:** question → `**Q3. Under that test, how many prior crimes, how similar and how recent, have courts required before holding an assault foreseeable?** *(Application, fact-finding)*`. Answer → `The student finds state decisions applying the test and pins down which facts the courts treated as dispositive: the number, proximity, recency, and similarity of prior incidents. Then a research pause: the comparison to this store’s own history goes into the outline in brackets, under the foreseeability element.` In `**Closure.**`, `and how analogous cases apply it to the client’s facts` → `and how analogous cases have applied it; the client’s facts sit beside those cases in the outline’s brackets`.
- **Priority:** P1. **Safe to apply.**

### 7. Appendix E, drone capstone: Q4 asks whether the client's operation complies

- **File:** content/appendices/e.md
- **Location:** `**Q4. Does the client’s planned operation fall within Part 107’s limits, or does it need a waiver or authorization?** *(Application: regulation and agency guidance)*` and the bracket `\[Apply the limits to the client’s facts and confirm currency.\]`
- **Fix:** question → `**Q4. Which operations does Part 107 permit without a waiver, and when does the FAA require an authorization or a waiver?** *(Focusing: regulation and agency guidance)*`. Bracket → `\[Confirm currency, then take a research pause and bracket the application to this client’s planned flights in the outline.\]`
- **Priority:** P1. **Safe to apply.**

### 8. Appendix G, foster mother: Q4 is the client's own question

- **File:** content/appendices/g.md
- **Location:** `**Question 4 (Application, fact-finding by analogy).** Given how California courts have drawn the “closely related” line, is a long-term foster parent “closely related” to her foster child?` and the answer's opening `No California case decides this, so the answer cannot be looked up; it must be argued by analogy`.
- **Problem:** The question is Dana's question, and the answer is an argument, which the chain itself says "cannot be looked up." That is the writing step. The research step that precedes it is real and worth keeping as the question.
- **Fix:** question → `**Question 4 (Application, fact-finding by analogy).** How have California courts treated relationships outside blood or marriage that claimed to be “closely related,” and what reasons did they give for drawing the line where they did?` Then introduce the existing argument with a one-line heading in the author's convention: `**Research pause.** The argument for Dana, written into the outline in brackets under the “closely related” element:` and leave the argument as written.
- **Priority:** P1. **Needs the author's decision** (the appendix is built around the argument; the fix relabels rather than removes it).

### 9. A Learning Objective is cut off mid-sentence

- **File:** content/chapters/ch-03.md
- **Location:** `- Recognize analytical closure and practical closure, and use the research`
- **Fix:** `- Recognize analytical closure and practical closure, and document which one you reached and what remains`
- **Priority:** P1. **Safe to apply.**

### 10. The closing-out protocol omits two of the author's six checking-out steps

- **File:** content/chapters/ch-09.md
- **Location:** `## The Closing-Out Protocol`, the four bullets `**Run a final sweep.**`, `**Update every case and statute.**`, `**Evaluate the outline for gaps.**`, `**Document the closure decision.**`; and `### Exercise 9.3 — The Closing-Out Run`.
- **Problem:** The author's checking-out list has six steps. The chapter has four. "Review your research map. Make sure no questions remain." is missing entirely, and "Name & document type of closure" is implied but not stated in the documentation bullet. Exercise 9.3, the one place the protocol is practised, inherits both gaps.
- **Fix:** after the `**Evaluate the outline for gaps.**` bullet insert `- **Review the research map.** Every question on it should be marked answered, or parked on purpose with the parked ones named in your closure note. An open question you forgot is not closure. It is a gap you have not seen yet.` In `**Document the closure decision.**` change `Record that you completed the protocol.` to `Record that you completed the protocol, and name the kind of closure: analytical, or practical with what remains.` In Exercise 9.3 change `the final sweep with alternative terms, the citator updates, the check against the original question, and your explicit finding` to `the final sweep with alternative terms, the citator updates, the research map with every question marked, the check against the original question, and your explicit finding`.
- **Priority:** P1. **Safe to apply.**

### 11. Chapter 3's demonstration has visibly broken sentences at the point students most need clarity

- **File:** content/chapters/ch-03.md, `### Q1: Explore the Legal Landscape` and `## Q2: Read the Foundation`
- **Anchors and fixes:**
  - `Mapping adding the rest to your research map logging the rest as later questions, with their citations noted as leads, before you can answer any of them. Reading *Tinker* is clearly next. Hazelwood goes on the map too, but it is not next, because at least one question sits between the first question and the research question Hazelwood will puportedly answer. At least one does: the entry’s description suggests` → `Add the rest to your research map as later questions, with their citations noted as leads, before you answer any of them. Reading *Tinker* is clearly next. *Hazelwood* goes on the map too, but it is not next, because at least one question sits between your first question and the one *Hazelwood* will answer: the entry’s description suggests`
  - `You complete entry 2, , move its answer into your outline` → `You complete entry 2, move its answer into your outline`
  - `## Q2: Read the Foundation` → `### Q2: Read the Foundation` (every other Q is an H3; the H2 breaks the On-this-page list and the chunking).
  - The two consecutive paragraphs beginning `Those later questions go on your research map, which you keep as a separate document from the log.` and `Note that the future questions are jotted down simply so they can be revisited later.` say the same thing twice, including the identical sentence `The exploratory answer does not make it into the outline because the answer came from a secondary source, not a primary one.` Keep the first paragraph; replace the second with: `Where you keep the map is up to you: a separate document, or a questions section at the foot of your annotated outline that you replace with answers as you go. Here is the map at this stage, with the leads the entry gave you.` (and delete `Here is the map at this stage, with the leads the entry gave you.` from the first paragraph so it is said once).
  - Research Log example table, `| Method | Found in Annotated United States Code (Westlaw) under general |` is truncated. Suggested: `| Method | Annotated United States Code (Westlaw), reached through the general index under “organic” |`
- **Priority:** P1 for the first three (visibly broken), P2 for the merge and the table cell. The first three are **safe to apply**; the merge and the Method cell **need the author** (the cell states a fact about her route).

---

## Part B. The interactives: what they ask of the reader, and what is missing

### 12. The one reveal in the book hints at a single right order

- **File:** content/chapters/ch-03.md
- **Location:** reveal `title="Draft the next question before you read it"`, model answer sentence `If you chose “legitimate pedagogical concern,” you chose a real question in the wrong order: the rule's own structure tells you which term is the gate.`
- **Problem:** Principle 1. The method asks for a visible, defensible choice, not a prescribed one. "Wrong order" tells a student who reasoned well that she failed.
- **Fix:** `If you chose “legitimate pedagogical concern,” you chose a real question, and a defensible one. The demonstration takes the threshold term first because the rule’s own structure makes it the gate, and following the rule’s structure is one good way to order sub-questions, not the only one. What matters is that you can say why your question came next.`
- **Priority:** P2. **Safe to apply.**

### 13. New sort for Chapter 3: research question, writing step, or fact to gather

- **File:** content/chapters/ch-03.md
- **Location:** after the paragraph beginning `Then resume. The map holds the questions still open. The log holds your questions and answers about the law. The outline is where the law meets your file.` (end of `### A Research Pause: Write the Application into the Outline`).
- **Problem:** The chapter teaches the book's most important distinction (research question versus writing step versus fact to gather) in prose and demonstration only. Nothing asks the student to make the call. The sort below uses a different file so it does not repeat the paragraph above, and it seeds the heat scenario that Chapters 15 and 16 reuse, which gives it a spaced return later.
- **Fix (paste):**

  ```markdown
  ::: {.try kind="sort" title="Research question, writing step, or fact to gather?" bins="Research question | Writing step | Fact to gather"}
  A different file: a tenant whose heat has been off for three weeks, under a statute that requires repair within a “reasonable time” after “written notice.” Sort what the researcher is tempted to ask next.

  - How long have courts treated as a “reasonable time” to restore heat in winter? **Research question**
      - Application, in its research form: how courts have applied the standard to facts in decided cases.
  - Was three weeks a reasonable time in our client’s case? **Writing step**
      - The rule measured against your own file. No database holds your file. It goes in brackets on the outline during a research pause.
  - Did our client ever put the complaint in writing? **Fact to gather**
      - A question for the client, not for a source of law. It goes on the fact-gathering list and ends in a phone call.
  - Does a text message count as “written notice” under the statute? **Research question**
      - Definitional. The statute’s definitions section first, then the cases that have construed the term.
  - Given that she texted the landlord, did our client give written notice? **Writing step**
      - Once the definitional answer is in the outline, this is the bracketed note beneath it.
  - Has the landlord tried to repair anything since the first complaint? **Fact to gather**
      - Evidence, not law. Log it where the method keeps the facts you still need.
  :::
  ```
- **Priority:** P2. **Safe to apply.**

### 14. Faded practice inside the demonstration: a second reveal before Q7

- **File:** content/chapters/ch-03.md
- **Location:** after the paragraph `A short pause at the outline. Nothing in the file’s account of the removal ... If the school’s stated reasons may fall outside the recognized concerns, you need the outer edge of the standard: the cases schools lost.` and before `### Q7: Find the Outer Limits`.
- **Problem:** The demonstration is a 2,500-word worked example with exactly one fade (the reveal at Q4). Worked examples teach best when the learner completes an increasing share of the steps. Q7 is the ideal second fade: the note at the outline has just told the reader where the gap is, and Q7 is the chapter's only fact-finding Application question, so writing it is the chance to practise the research form of that type.
- **Fix (paste):**

  ```markdown
  ::: {.try kind="reveal" title="Write Q7 yourself" placeholder="The stated reasons fit none of the recognized categories. What do you need to know next, what type of question is it, and where would you take it?"}
  The pause at the outline just told you where the gap is. Before you read on, draft the question that gap produces, name its type, and say which source you would take it to.

  ---

  The demonstration asks: **In what circumstances have courts found that a school’s removal of a student newspaper article was not reasonably related to legitimate pedagogical concerns?** (Application, fact-finding; case law, reached through searches and a citator trace of *Hazelwood*.) Your wording will differ, and it should. Two checks matter more than the wording. Does your question ask how courts have applied the standard, rather than whether this principal’s reasons pass it? And does it follow from the note you just wrote at the outline, rather than from thin air?
  :::
  ```
- **Priority:** P2. **Safe to apply.**

### 15. The Checkpoint and the research pause are described, never practised: extend Exercise 3.3

- **File:** content/chapters/ch-03.md
- **Location:** `### Exercise 3.3 — One Full Cycle`, `**Deliverable:** one complete seven-field Research Log entry.`
- **Problem:** The Checkpoint appears in the demonstration as a callout the student reads (`**Checkpoint, the false hit.**`) and the research pause as a section the student reads. Exercise 9.3 practises the full checking-out at the end of a project, but nothing before Chapter 9 asks a student to run a Checkpoint or write a bracketed note in the middle of a chain, which is where the method says they belong.
- **Fix:** replace the deliverable with: `**Deliverable:** one complete seven-field Research Log entry; a one-line Checkpoint written after it (is the source current, authoritative, and from the right jurisdiction for the macro question?); and, if the answer touched an element your facts speak to, the bracketed application note you would place under it in the outline, kept visibly apart from the paraphrase of the law.` Add to the self-check: `A fourth test: can a reader tell your authority from your analysis at a glance? If the brackets are missing, they cannot.`
- **Priority:** P2. **Needs the author's decision** (changes a graded deliverable).

### 16. End-of-chapter self-assessment tied to the objectives

- **File:** content/chapters/ch-03.md (template; then every chapter)
- **Location:** after the `::: {.takeaways}` block and before `## Reviewing Through Practice`.
- **Problem:** The Introduction tells students to "Start each chapter with its Chapter Objectives. They tell you what you should be able to do by the end." No chapter returns to them. A persistent checklist (the `checklist` kind already stores ticks per reader) turns the objectives into the Quick Check's academic cousin: a short, honest look at what you can do before you move on. It also gives the Reviewing Through Practice exercises a reason to be done.
- **Fix (paste; Chapter 3 version as the template, written as observable "I can" statements):**

  ```markdown
  ::: {.try kind="checklist" title="Before you move on: can you do these?"}
  Tick only what you could do right now, on a new file, without reopening the chapter. Whatever stays unticked is where your next ten minutes go.

  - [ ] **Write one micro question** that asks a single thing and that I would know I had answered.
  - [ ] **Name its type** and say which source that type sends me to first.
  - [ ] **Fill all seven log fields** for one cycle, with Findings opening “fully,” “partially,” or “only redirects.”
  - [ ] **Tell the three tools apart:** what goes on the map, in the log, and in the outline.
  - [ ] **Spot a writing-step question** dressed as a research question, and move it to a bracketed note instead.
  - [ ] **Run a Quick Check and a Checkpoint,** and say what each one asks.
  - [ ] **Name the kind of closure** I reached and document what remains.
  :::
  ```
- **Priority:** P2. **Needs the author's decision** (a structural addition to every chapter). If adopted book-wide, each chapter's list should restate its own Learning Objectives as "I can" lines; the objectives already exist, so the drafting is mechanical.

### 17. Spaced, interleaved retrieval of the four types: "Name the type, round two" in Chapter 8

- **File:** content/chapters/ch-08.md
- **Location:** after the paragraph ending `Each handoff is a question type changing: exploratory to focusing, focusing to definitional, definitional to application. Being explicit in your method lets you flag when you have gotten all you can out of a source and need to move forward.`
- **Problem:** The book spaces its examples well (organic in 3, 6, 7, 8; Hazelwood in 2, 3, 5; the drone in 8 and 14; the store in 5 and 16). What it does not do is make the student retrieve the taxonomy after Chapter 3; every later interactive assumes it. Chapter 8 is where the types change hands between sources, so a harder round, with the two intruders from item 3 built in, fits the paragraph and reinforces Principle 2.
- **Fix (paste):**

  ```markdown
  ::: {.try kind="sort" title="Name the type, round two" bins="Definitional | Exploratory | Focusing | Application | Not a research question"}
  Chapter 3’s drill, five chapters later, on harder material. Two of these do not belong in a log at all.

  - What does the Clean Water Act mean by “point source”? **Definitional**
      - A term the statute defines and the agency and the courts have construed. Start in the definitions section.
  - How is workplace drug testing regulated in this state? **Exploratory**
      - No rule is named. A landscape question, for a state encyclopedia or a practice guide.
  - What must an employer show to claim the overtime exemption for administrative employees? **Focusing**
      - The elements of a specific rule. The regulation states them; the annotated code and the cases fill them in.
  - How have courts applied the “primary duty” test to office managers at small firms? **Application**
      - The rule run on facts in decided cases. Jurisdiction filter and a proximity search will matter here.
  - Does our client’s office manager meet the “primary duty” test? **Not a research question**
      - Your facts against the rule: a writing step, bracketed in the outline during a research pause.
  - How many hours a week does our client’s office manager actually spend on administrative work? **Not a research question**
      - A fact to gather from the client. No source of law will answer it.
  :::
  ```
- **Priority:** P2. **Safe to apply.**

### 18. Chapter 9's "What symptom are you seeing?" is a list to read; make it a diagnosis to perform

- **File:** content/chapters/ch-09.md
- **Location:** explore `layout="list" title="What symptom are you seeing?"` under `## When Research Goes Wrong: Diagnosing Common Problems`.
- **Problem:** The objective is "Diagnose and respond to common research problems." The interactive hands the reader six labelled symptoms with their fixes; it is a reference card, and nothing in the exercises practises diagnosis. The sort below gives six log moments and asks for the correction. Keep the explore list as the reference if you like; place the sort after it.
- **Fix (paste):**

  ```markdown
  ::: {.try kind="sort" title="Diagnose the research, then pick the fix" bins="Broaden the search | Narrow the search | Step back a question | Widen the jurisdiction | Report the split"}
  Six moments from real logs. Which correction does each one call for?

  - “reasonable accommodation” /3 telecommut! /3 anxiety returned nothing in the Ninth Circuit. **Broaden the search**
      - Three terms welded within three words of each other is too tight. Loosen the proximity and add synonyms before you conclude the law is silent.
  - accommodation AND remote returned 4,100 cases. **Narrow the search**
      - Add a proximity connector, a third concept, and the jurisdiction and date filters you skipped.
  - You have read the lead case twice and still cannot tell what the “interactive process” is or why it matters. **Step back a question**
      - The source assumes a definitional or exploratory answer you skipped. Take that question to a secondary source and come back.
  - Your state has no decision on whether telework can be a required accommodation. Two searches with different terms confirm the silence. **Widen the jurisdiction**
      - Confirmed silence at home sends you deliberately to persuasive authority, and your report says so.
  - The Sixth Circuit says physical presence is presumptively essential; the Ninth says it depends on the job. **Report the split**
      - A genuine conflict is a finding. Apply the hierarchy, say which court binds yours, and address the other honestly.
  - Every result for “undue hardship” is a one-line mention in cases about something else. **Narrow the search**
      - ATLEAST, or a proximity connector tying the phrase to your other concepts, finds the cases that treat it substantively.
  :::
  ```
- **Priority:** P2. **Safe to apply.**

### 19. Chapter 16's closed universe practises Skills 1, 2 and 4 but not 5 (closure)

- **File:** content/chapters/ch-16.md
- **Location:** after the choice `title="Skill 4: is the answer in the universe at all?"`.
- **Problem:** Skill 5, research sufficiency, is the method's closure judgment and the chapter's own Common Pitfalls says examinees "forget the closure step." The universe is already built; one reveal finishes the set, and it is a writing act, which the exam also demands.
- **Fix (paste):**

  ```markdown
  ::: {.try kind="reveal" title="Skill 5: make the sufficiency call" placeholder="Do § 12 and the three decisions answer the client’s withholding question? Commit: yes, or name the gap and what would fill it."}
  The client asks whether she may withhold rent now. Using only § 12 and the three decisions, write the sufficiency call you would commit to on the exam.

  ---

  A committed call: **the universe answers it.** Section 12(c) sends remedies to “law,” *Okafor* supplies that law, and it conditions withholding on written notice and a reasonable opportunity to cure. She gave no notice, so she may not withhold yet. The one gap worth naming is how long a “reasonable opportunity to cure” runs during a January outage, which no source here addresses. “Probably enough” is not a call. Name what is answered and what is not.
  :::
  ```
- **Priority:** P2. **Safe to apply.**

### 20. Chapter 1's switch is read-only; add a prediction before it

- **File:** content/chapters/ch-01.md
- **Location:** immediately before `::: {.try kind="switch" title="Same authorities, different courtroom" label="Which court are you standing in?"}`.
- **Problem:** The switch is a good display, and the reader can click through it without forming a single expectation. A thirty-second prediction turns it into a test of the chapter's rule ("an authority binds your court only when it comes from home") and makes the two rows that never move visible as a pattern.
- **Fix (paste):**

  ```markdown
  ::: {.try kind="reveal" title="Predict before you switch" placeholder="Which of the six will change weight when you move from the Arizona Court of Appeals to a California court? Which will not, and why?"}
  The table below lists six authorities and three courtrooms. Before you touch it, predict which rows change when the courtroom changes, and which stay put wherever you stand.

  ---

  Two rows never move: the U.S. Supreme Court decision on a federal constitutional point binds every court, and the Restatement section binds none. The other four all change, because each is binding only at home. If you predicted that the Arizona statute would stay binding in California, you have found the habit this table exists to break: authority is binding in a courtroom, never in the abstract.
  :::
  ```
- **Priority:** P3. **Safe to apply.**

### 21. Chapter 14's switch repeats the three sections above it and prescribes a single first source

- **File:** content/chapters/ch-14.md
- **Location:** switch `title="Three practices, three settings"`; and the row `| Where you look first | Case law. | Statutes and standardized forms. | The CFR and agency guidance. |`; also `litigation starts in case law, transactional work starts in statutes and standardized forms, regulatory work starts in the CFR and agency guidance` in the `Three parameters shift.` paragraph.
- **Problem:** (a) README's rule: an interactive should not repeat the paragraph above it. Every cell of the switch restates the `**Characteristic questions.**` and `**Research closure**` paragraphs of the three sections. (b) "Where you look first: Case law" sits uneasily with Chapter 4's teaching that most projects begin in a secondary source, and with Principle 1. It reads as a route.
- **Fix:** change the row label to `Where you look first, once a secondary source or the file has oriented you` (or add that clause to the `Three parameters shift.` sentence: `once you are oriented, litigation moves first to case law, ...`). On the repetition, either trim the three `**Characteristic questions.**` and `**Research closure**` paragraphs to one sentence each and let the switch carry the detail, or drop the switch and keep the prose. Either preserves the content once.
- **Priority:** P2. **Needs the author's decision.**

### 22. Sort engine: a wrong pick gets no explanation, and two-bin sorts are coin flips

- **File:** assets/book.js, `KINDS.sort`, the branch `note.innerHTML = '<p class="bad">Not ' + b.toLowerCase() + ". " + (misses > 1 ? "Look at what the item <em>is</em> before what it is about. " : "") + "Try again.</p>";`
- **Problem:** Verified in the browser. The explanation (the indented bullet) appears only on the correct pick. On a miss the reader sees "Not X. Try again." With two bins (Holding/Dictum, Statute answers it/Cases needed, Force of law/Persuasive only, Disclose/No duty, Subject area/Research question: five of the eight sorts), a miss hands over the answer by elimination, so the student gets the right answer and the explanation without having reasoned. Feedback should say *why* the wrong bin is wrong.
- **Fix (engine, small):** let a second indented bullet under an item be the miss explanation. In `KINDS.sort`, split `fb(li)` into the first `<li>` (shown on success) and the second (shown on a miss, before "Try again."), falling back to the current generic line when there is only one. Then the README table row for `sort` gains: `a second indented bullet, if present, is shown when the reader picks the wrong category`. Content can follow at leisure; the Chapter 5 Holding/Dictum sort is the first to benefit (`“Had the plaintiff been a trespasser, a different analysis might apply.”` deserves a miss line such as `A trespasser was not before the court, so nothing about trespassers was decided.`).
- **Priority:** P2. **Needs the author/developer.**

### 23. Annotate is the second most common kind and asks nothing of the reader

- **Files:** ten annotates: ch-02 (three citations), ch-03 `Four sentences, four questions`, ch-12, ch-15, ch-16, appendices a.md, b.md, c.md, d.md.
- **Problem:** Each is a well-written guided reading. None requires a commitment before the note opens. The Chapter 3 one has the right instinct in its hint (`Before you select a sentence, ask yourself what question a researcher had to answer in order to write it.`) but no way to hold the reader to it. The citation and how-to annotates (Chapter 2, Appendices A to D) are reference material and are fine as they are. The three that teach a judgment (ch-03 reverse-engineering, ch-16 Skill 1, ch-15 verify) would gain from a one-line reveal in front of them, or from the engine offering an optional `prompt=` textarea above the passage that must be used before marks open.
- **Fix (content, lowest cost):** before the Chapter 3 annotate insert
  ```markdown
  ::: {.try kind="reveal" title="Four sentences: write the four questions first" placeholder="Read the paragraph below once, then write the question each sentence answers, in order."}
  Read the paragraph in the next box once, without selecting anything. Write the four questions here. Then open the sentences and compare.

  ---

  Compare your four to the labels in the box. The test is not matching words. It is whether your four questions chain, each one askable because of the answer before it.
  :::
  ```
  **Fix (engine, optional):** an `ask="..."` attribute on `annotate` that renders a textarea and keeps marks inert until it holds text.
- **Priority:** P2 for the content fix (**safe to apply**); P3 for the engine option (**needs the developer**).

### 24. Interactives that work well and should be left alone

Noted so the applier does not "improve" them: Chapter 2 and Chapter 9 search labs (real reasoning, honest about /s and /p stand-ins, the first example search in Chapter 2 genuinely finds none of the five on-point cases and the text asks why); Chapter 5 `Read the flag, then read the case` (a judgment under uncertainty with three plausible options and explanatory feedback on each); Chapter 8 `Audit this log` (transfer of the single-source trap to a new fact pattern); Chapter 6 `Does the statute apply itself` (transfer with a trap item on accrual); Chapter 15 `Prediction without retrieval` (the best explanation of hallucination I have seen in a textbook); Chapter 16's closed universe; Chapter 13's docket; Chapter 17's shelf-or-question sort. Appendix A's `One encyclopedia paragraph, read for one question` closes the loop the Introduction opens ("which one do I read first?") and should be cross-referenced from Chapter 4's `### Identifying Relevant Materials` paragraph with one sentence: `Appendix A shows this on a single encyclopedia paragraph, footnote by footnote.`

---

## Part C. Alignment: objectives, body, interactives, exercises

### 25. Objectives with no practice anywhere in their chapter

Each objective below is observable and worth keeping; the gap is in Reviewing Through Practice. Fixes are the smallest change that closes it.

- **ch-01.md** `- Use the structure of the U.S. legal system to plan your research` — Exercise 1.1 asks for predictions, not a plan. Add a fourth column to 1.1's deliverable: `and where you would look first for that layer: the code, the cases, or a secondary source, per the Research Implications section.` **Needs the author.** P2.
- **ch-02.md** `- Select when to use a broad search and when to use a narrow one` — no exercise. Add to Exercise 2.2's three sentences a fourth: `and which of the two you would run first on a brand-new project, and why.` **Needs the author.** P2.
- **ch-04.md** `- Critically evaluate the authority, reliability, and currency of a secondary source` — Exercise 4.2 harvests vocabulary from an entry without evaluating the entry. Add to the deliverable: `plus the entry’s author or publisher, its current-through date, and one sentence on how far you would trust it before verifying.` **Needs the author.** P2.
- **ch-05.md** `- Update case law using citator tools to confirm the points of law you rely on remain valid` — the choice interactive teaches reading a flag; no exercise runs a citator until 12.3. Add to Exercise 5.1: `Then run *Hazelwood* through a citator and record, in one line, which point of law any negative or distinguishing treatment attaches to.` **Needs the author.** P2.
- **ch-06.md** `- Apply basic canons of statutory construction to resolve ambiguous language` — the only practice is Appendix C's canon sort, which the chapter mentions as "where the skill gets its reps" without pointing at the interactive. Add after `Appendix C’s How to Read a Statute carries the full working list with examples;` the clause `and a short sort, Which canon is doing the work?, to test yourself on;`. **Safe to apply.** P3.
- **ch-07.md** `- Locate basic state administrative materials`, **ch-10.md** `- Locate basic state legislative history materials`, **ch-13.md** `- Locate state court documents using state-specific resources` — none is practised. Either add one line to an exercise in each (`Then find the same thing for your state and note where it lives.` fits 7.1, 10.2 and 13.3) or soften each verb to `Describe where to find`. **Needs the author.** P2.
- **ch-15.md** `- Distinguish general-purpose generative AI tools from the generative features integrated into verified legal databases` — not practised. Add to Exercise 15.1: `Run the focusing prompt twice, once in a general-purpose tool and once in a database-integrated one, and add a sentence on what the second did that the first could not.` **Needs the author.** P2.
- **ch-03.md** `- Synthesize research findings into an annotated outline` — Exercise 3.3 ends at the log entry. Item 15's deliverable change covers it.

### 26. Practice with no objective

- **ch-09.md** Exercise 9.2 `The Bad Translation` and the Chapter 9 search lab both teach contrast between a bad and a good translation; the objectives say "Construct precise Boolean searches." Fine, but add `, and recognize a badly translated one` to the first objective so the exercise maps. **Safe to apply.** P3.
- **ch-16.md** Exercise 16.1 asks for `dispositive fact identification` marks; Skill 3 has no interactive in the chapter's closed universe (Skills 1, 2, 4 do; item 19 adds 5). A one-item reveal on *Okafor* ("which fact, if changed, changes the withholding answer?") would complete the set. **Needs the author.** P3.

### 27. Appendix H's labels on the reverse-engineered Hazelwood paragraph

- **File:** content/appendices/h.md
- **Location:** `### Exercise 3.2 — Reverse-Engineer the Paragraph`, the labels `Question it answers: is this newspaper school-sponsored? (Application).` and `Question: do the stated reasons fit a legitimate pedagogical concern? (Application).`
- **Problem:** The appendix itself notes, correctly, that `the application questions in this chain are the ones the court answered *in writing*`. The bare label `(Application)` on a client-facts question undercuts that note on first read.
- **Fix:** label both `(Application, as the court’s own writing step; see the note below)`.
- **Priority:** P2. **Safe to apply.**

### 28. Chapter 4's table borrows the word "application" for practice guides

- **File:** content/chapters/ch-04.md
- **Location:** `practice guides when you need to **apply** the law` and the table row `| Practical application | Practice guide | Rutter Group; Federal Civil Rules Handbook |`
- **Problem:** The left column is headed `**Question type**`, and "Practical application" is not one of the four. A first-year reading the table will file "application question" under "practice guide."
- **Fix:** `practice guides when you need the procedure for doing the work` and `| Procedural how-to (not one of the four types) | Practice guide | ... |`.
- **Priority:** P2. **Safe to apply.**

### 29. Two more sentences that let the client's facts into the research question

- **ch-09.md**, opening: `Your remaining questions are targeted: Does the rule apply in this specific factual context?` → `Your remaining questions are targeted: Have courts applied the rule in this specific factual context?` **Safe.** P2.
- **ch-07.md**, `## Questions This Source Answers`: `You will also use regulations for **Application** questions when a client’s conduct is governed by specific regulatory requirements.` → `You will also use regulations for **Application** questions when the regulation itself draws a bright line (a threshold, a schedule, a deeming provision) that has already applied the rule to conduct like your client’s, the self-applying rules Chapter 6 described.` **Safe.** P2.

---

## Part D. Retrieval, spacing, metacognition

### 30. Reflection Points: three are not in callouts, and none asks about the reader's own work

- **Files:** content/chapters/ch-10.md (`**Reflection Point.** Why is legislative history a poor first stop`), ch-11.md (`**Reflection Point.** If guidance documents are not binding`), ch-13.md (`**Reflection Point.** A well-researched brief seems like a shortcut`).
- **Problem (a):** these three are bare paragraphs; every other chapter wraps the Reflection Point in `::: {.callout}`, so they render as body text and lose the pause the box signals.
- **Fix (a):** wrap each in `::: {.callout}` ... `:::`. **Safe to apply.** P2.
- **Problem (b):** all seventeen Reflection Points ask a conceptual "why" with an answer in Appendix I. The method's metacognition is about one's own research, and no prompt turns the reader toward her own log.
- **Fix (b):** add one self-directed Reflection Point in ch-09.md after `## Building a Search Log`: 
  ```markdown
  ::: {.callout}
  **Reflection Point, on your own work.** Open the Research Log from your last drill. Find one entry where the Next Question does not follow from the Findings above it. What did you actually do between the two? There is no answer in Appendix I for this one; the answer is in your log.
  :::
  ```
  **Needs the author.** P2.

### 31. Spacing works; make it visible

- **Files:** content/chapters/ch-06.md, ch-07.md, ch-08.md (organic thread); ch-14.md (drone); ch-16.md (store).
- **Observation:** the recurring threads (organic 3→6→7→8; Hazelwood 2→3→5; the dog bite 2→9; the store 5→16; the drone 8→14) are good spaced practice and are mostly signposted. One is not: Exercise 16.1's sample in Appendix H is "modeled on the store-duty drill's closed universe," but Chapter 16's own closed universe is the heat case and never says the store example in its text is the Chapter 5 drill. Add to the Example box `**Excerpt triage, run once.**` the clause `(the Chapter 5 drill, now as an exam item)`. **Safe to apply.** P3.

---

## Part E. Cognitive load and sequencing

### 32. Terms used before they are defined in Chapter 3

- **File:** content/chapters/ch-03.md
- **Location:** `**Step 1: Write your [research question]{.gloss}.**` paragraph, `Your research map, or the answer you just found, will usually supply the question.`; `**Step 3**` paragraph, `Add the synthesized answer to your annotated outline.`
- **Problem:** Research map and annotated outline are defined two sections later (`## Three Tools, One Process`). A first-year hits both cold.
- **Fix:** append to the Step 1 sentence `(the map, the log, and the outline are introduced below, in Three Tools, One Process)`.
- **Priority:** P3. **Safe to apply.**

### 33. "Five steps" in the text, "Four steps turn" in the diagram

- **File:** content/chapters/ch-03.md
- **Location:** `## The Five Steps and Intermittent Checkpoints`; ring intro `Four steps turn.`; Recap `The cycle is five steps with intermittent checkpoints`.
- **Problem:** The count changes between prose and diagram without explanation. Item 1's wording (`Five moves turn, the last of them a check on yourself.`) resolves it if the Quick Check is added; if not, change the ring intro to `Four steps turn, and Step 5 is the turning.`
- **Priority:** P3. **Safe to apply.**

### 34. The full demonstration is digestible, with two aids

- **File:** content/chapters/ch-03.md, `## The Question Method in Action: A Full Demonstration`
- **Observation:** nine cycles, clearly headed, one pause, one false hit, one fact-gathering detour, one drafting gap: the shape is right and the length (about 2,500 words) is justified. Two things would lower the load without cutting: the second fade at Q7 (item 14) and a one-line pointer at the top of the section: `If you want to see the three tools whole at any point, Appendix F holds the full log, map and outline for this demonstration.` (the pointer currently appears only at the end, after `What the Demonstration Shows`). **Safe to apply.** P3.

### 35. Worked example to independent chain with nothing in between

- **Files:** content/chapters/ch-04.md `### Exercise 4.3`, content/appendices/e.md `## The Chapter 4 Drill`.
- **Problem:** Chapter 3 gives a fully worked chain. Exercise 4.3 asks for a fully independent one. The usual bridge is a completion problem: give the first two cycles and ask the student to continue. Appendix E already contains Q1 and Q2 for the Chapter 4 drill.
- **Fix:** add to Exercise 4.3 after `Stay entirely in secondary sources. Do not yet read the statutes or the cases.`: `If you stall at the first question, read only Q1 and Q2 of the Appendix E walkthrough, close it, and take the chain from there yourself. Reading further than Q2 before you have your own Q3 is the one thing that wastes this drill.`
- **Priority:** P2. **Needs the author's decision.**

---

## Part F. Engagement and motivation

### 36. Openings

- **Strong:** Introduction (the student's question), Chapter 5 (the sanctions excerpt), Chapter 12, Chapter 15 (the *In re Martin* line), Chapter 17.
- **Flat:** Chapter 6 (`Case law often explains how judges interpret the law, but statutes are where many legal rules begin.`) and Chapter 7 (`Statutes create broad rules, but much of the law that affects people day to day comes from administrative agencies.`). Each chapter already owns a client (the podcaster; the roofer). Open with them.
- **Fix, ch-07.md, first sentence:** `A roofer with a new hire twenty feet up does not need to know what Congress said about workplace safety. He needs the number: at what height the rule kicks in and what counts as protection. That number lives in a regulation, and this chapter is about finding it, reading it, and knowing it is still current.` then continue with the existing paragraph.
- **Fix, ch-06.md, first sentence:** `A podcaster wants to record a phone call with a source in California. Whether she may is answered, almost entirely, by one statute, read carefully. Statutes are where many legal rules begin, and reading one is its own skill, different from reading cases, because a statute states a rule without explaining itself.`
- **Priority:** P3. **Needs the author** (voice).

### 37. Variety, voice, inclusion

- **Observation:** exercise formats are varied (tables, log entries, timed cycles, autopsies, inventories); the author's voice is present and warm (`I call these single-source drills`, `Be kind to your future self`); fictional parties in the search labs and universes are varied in name (Alvarez, Chen, Delgado, Osei, Tran, Okafor, Marsh). The one monotony is the interactives themselves (item 23): 23 of 44 are select-and-read. Items 13, 14, 16, 17, 18, 19, 20 and 23 add seven commit-first interactives, bringing the balance to 25 commit-first against 23 read-only without removing anything.

---

## Part G. Accessibility and UDL of the interactives

### 38. Order: correctness is conveyed by colour alone

- **File:** assets/book.js, `KINDS.order`, `draw(checked)`: `var li = h("li", { "class": checked ? (good ? "ok" : "no") : "" }, [` and the message `The highlighted rows are right where they are.`
- **Problem:** Verified in the browser: after Check, rows get class `ok` or `no` and nothing else. A colour-blind or screen-reader user cannot tell which rows are placed. The message depends on the highlight.
- **Fix:** add a visually labelled marker to each row when `checked`: `h("span", { "class": "try-mark", text: good ? "✓ in place" : "✗ move" })` with a `.visually-hidden` fallback text, and change the message to `The rows marked “in place” are right where they are.` Also set `aria-live="polite"` on the list or re-announce the count.
- **Priority:** P2. **Needs the developer.**

### 39. Annotate verdicts: warn and ok have the same label shape, so the difference is colour

- **Files:** content/chapters/ch-15.md annotate `title="Verify before you record"`; content/chapters/ch-12.md annotate `title="Pull every citation before you sign"`.
- **Location:** ch-15 labels `label="Retrieved and read: Tinsley" verdict="ok"` and `label="Retrieved and read: Delgado" verdict="warn"`; ch-12 `label="Retrieved: Marsh v. Golden Rentals (state supreme court)" verdict="ok"` and `label="Retrieved: Prewitt v. Stonegate LLC (older decision)" verdict="warn"`.
- **Problem:** The engine adds `v-ok` / `v-warn` / `v-bad` classes (green, amber, red) and nothing textual; the label is what a screen reader hears, and for ok and warn it is the same phrase. The note explains, but the at-a-glance verdict, which is the point of the colours, is colour-only.
- **Fix (content):** ch-15: `label="Retrieved and read: Tinsley. Supports the sentence"`, `label="Retrieved and read: Delgado. Holds the opposite"`, `label="Not found: Trammel. Fabricated"`. ch-12: `label="Retrieved: Marsh (state supreme court). Supports the sentence"`, `label="Retrieved: Prewitt (older decision). Disapproved"`, `label="Not found: Hollis. Fabricated"`. **Safe to apply.** P2.
- **Fix (engine):** add `aria-label` text to the verdict (`m.setAttribute("aria-description", {ok:"verified", warn:"caution", bad:"not found"}[verdict])`) and a glyph in `.m.v-*::after`. **Needs the developer.** P3.

### 40. Annotate's read counter is not a live region

- **File:** assets/book.js, `KINDS.annotate`, `var count = h("p", { "class": "try-score" })`.
- **Problem:** Verified: `<p class="try-score">0 of 4 read</p>` with no `role`. Sort, checklist and search give their counters `role="status" aria-live="polite"`; annotate and the explore `database` counter (`role="status"` only, which is acceptable) are the odd ones out.
- **Fix:** `h("p", { "class": "try-score", role: "status", "aria-live": "polite" })`.
- **Priority:** P3. **Needs the developer.**

### 41. Keyboard and screen-reader operation: what works

For the record, so nobody re-audits what is fine: every control is a `<button>` or form control; annotate marks carry `role="button" tabindex="0" aria-pressed` and respond to Enter and Space; explanation panels are `role="region" aria-live="polite"`; choice and sort announce their result text ("Yes." / "Not this one." / "Not X. Try again.") rather than colour alone; the order's move buttons return focus sensibly after a swap; the reveal's textarea has an `aria-label`; the search lab's connector chips carry `aria-label` with a plain-language gloss; `:focus-visible` is styled site-wide. The non-interactive fallback (scripts off, print, DOCX) reads as text by design, which means a sort's bold category and a choice's `[x]` show the answers in print. That is a reasonable trade for a textbook; note it in the README's Interactives section with one sentence so a future editor is not surprised: `In print and in the DOCX the answers are visible beside the items; the interactives are for the screen, the text is for the record.` **Safe to apply.** P3.

### 42. Reading level

Sentences in the interactives' feedback are short and plain. The chapter prose runs long in places (several 60-plus-word sentences in Chapters 3, 8 and 9), but the audience is law students and the voice is consistent. No change recommended beyond the garbled sentences in item 11.

---

## Part H. Small things noticed on the way (P3, safe unless marked)

### 43. Chapter 3 Research Log example: the Findings field should model its own advice

- **File:** content/chapters/ch-03.md, Research Log table, `| Findings | Partially answers the question. The statute hands definitional authority ...`
- **Observation:** this is right, and good. The Appendix F entries also open with "Answers the question fully" or "partially." The Chapter 3 demonstration's Cycle 1 entry buries the clause at the end (`Fully answers the question, for orientation.` after four sentences). Move it to the front of that Findings field so every modelled entry does what the text says to do: `**Findings:** Fully answers the question, for orientation. Tinker starts the student free speech case law ...`
- **Safe to apply.**

### 44. The ring interactive's Checkpoint and item 1 together

If item 1 is adopted, the Chapter 15 line `**Step 5, repeat.** Unchanged, and so is the checkpoint.` should become `Unchanged, and so are the Quick Check and the Checkpoint. The Quick Check matters more here, because a fluent answer tempts a tired researcher to log it unread.` **Safe to apply.** P3.

---

## Summary

1. The book violates its own rule on application questions in nine places, three of them in teaching positions (the Chapter 3 "Name the type" sort, Exercise 3.1(e) with its Appendix H answer, and all four of Chapter 14's litigation and compliance examples); each has an exact replacement above.
2. The Quick Check does not exist in the book; the Checkpoint and research pause are demonstrated but never practised before Chapter 9; the closing-out protocol lacks the map review and the naming of closure type. Items 1, 10 and 15 fix all three with the author's own checklist wording.
3. 23 of 44 interactives are select-and-read, and only one asks the reader to write; items 13 to 20 and 23 add seven commit-first interactives (two sorts, five reveals, one checklist) in paste-ready syntax, including a research-question-or-writing-step sort for Chapter 3 and a spaced "Name the type, round two" for Chapter 8.
4. Alignment is good overall but eight objectives have no practice (notably Chapter 4's "evaluate a secondary source," Chapter 5's citator update, Chapter 9's diagnosis, and every "locate state materials" objective); one Chapter 3 objective is cut off mid-sentence; a per-chapter "Before you move on" self-assessment checklist is drafted as a template.
5. Accessibility is strong except that the order interactive signals correctness by colour alone and two annotate verdicts differ only by colour; a one-line engine fix and relabelled marks (items 38 to 40) close both.
