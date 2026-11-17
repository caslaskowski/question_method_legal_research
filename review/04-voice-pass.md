# Voice pass: what changed and what did not

I read the four writing samples first, then the Pressbooks export and the exercises file in `source/`, then every Markdown file in `content/` in book order. The test for each passage was simple. Would Cas say this to a student across a desk? Where the answer was no, I rewrote the passage in place, keeping its meaning, its length and its markup. Where the answer was yes, I left it alone.

## What changed most

The drafted prose, not the author's. The interactive feedback lines took the most work: many of the 43 interactives had at least one option whose feedback opened with a clipped verdict ("Not quite." "Tempting." "Guidance.") or a sentence fragment doing the job of an explanation. Those now explain in full sentences. The Chapter 3 demonstration lost its narrator's asides ("Look at the shape of that question"). The Chapter 6 bright-line passage was rewritten end to end. Appendices E through I kept their structure and lost their jargon.

Twenty-six files were touched and 222 passages rewritten. No legal substance, citation, holding, exercise number, interactive attribute, glossary span or flag was changed. The three method guardrails held: no passage now names a single right path, every application question still asks how courts have applied the rule in decided cases, and the pauses keep their names and places.

## The tics I removed, with one example each

**Apparatus.** "The complete working apparatus of this demonstration" became "The full record of this demonstration." Also gone from Chapters 5 and 6 and Appendix F.

**Information that "lives" or "sits" somewhere.** "Defined terms live in the statute's own definitions section" became "Defined terms are in the statute's own definitions section." I kept one "lives" per chapter at most, and "sits" only where a court sits.

**"Surfaces" as a verb.** "A plain-language search surfaces the governing default" became "A plain-language search turns up the governing default." More than a dozen of these, most of them in the appendices.

**The compressed, clause-stacked sentence.** "The Act named its categories and defined neither, so the statute could not close anything, and the answer had to come from a court" became "The Tariff Act used both words and defined neither. The statute could not answer the question, so a court had to."

**"Not X, it is Y."** "The reasoning is not a second copy of the answer. It is the answer to a different question" became "The reasoning does not repeat the answer. It answers a different question."

**Epigrams.** "Reading for an answer is the Question Method applied to a single document" became "When you read for an answer, you are running the Question Method on a single document. You hold one question at a time."

**"That is..." and "Notice..." openers.** "Notice the terms that just arrived" became "Three terms just arrived."

**"Which is why" and "the tell."** "The word 'test' is the tell" became "The word 'test' gives it away."

**Feedback fragments.** "Evidence, not law. Log it where the method keeps the facts you still need" became "This is evidence, not law. Put it on the list of facts you still need."

**"Failure mode" and "turns on."** "Application, and a failure mode" became "Application, and where the tool fails." "The whole duty turns on this phrase" became "The whole duty depends on this phrase."

## What I left alone

Everything that appears in the Pressbooks export or the exercises file, with three exceptions: the Chapter 3 demonstration, the Chapter 6 bright-line passage and the "What the Demonstration Shows" section, which the brief named, and the single word "apparatus" wherever it appeared. So the front matter, the chapter openings, the source descriptions, the Common Pitfalls, the Recaps, the exercises and their self-checks, and the How to Engage sections of Appendices A to D are untouched. The Pressbooks text has a few of the same habits ("which is why" appears several times), but that text is yours, and the line between editing your prose and editing mine needed to stay visible.

I also left the glossary definitions, which are plain already, and the Scholarship Research Checklist in Chapter 17.

## Three things to check yourself

1. Chapter 1's "Where the law itself is published" paragraph and the free-source paragraphs in Chapters 2, 5 and 6 were drafted in the team review. I made them plainer but they are still a reviewer's voice, not yours. Read them once.
2. The Q8 heading in Chapter 3 now reads "Take Up the Question *Dean* Raised." Nothing links to the old anchor.
3. Appendix H's sample answers keep their long single-paragraph form on purpose, because that is the form the exercises ask for. I broke only the worst clause stacks.

Build: `python3 build.py` ends with "checks passed" on every commit.
