# Open-access and OER review: The Question Method of Legal Research, Interactive Edition

Reviewer axis: licensing and attribution, reuse and adaptation, accessibility as an open-access value, discoverability and citation, open access to the law itself, and reproducibility of the cited law. Read-only review of `/home/user/question_method_legal_research` (branch team-review, HEAD 6f3bbc6).

Each item gives: file, location (quote or heading), problem, proposed fix (exact wording where it is text), priority (P1 fix now / P2 should / P3 polish), and whether it is **safe to apply** or **needs the author**. Quoted existing text is exact so the applier can place it.

What is already right, so nobody re-does it: the site makes no external requests and the build fails if one appears; fonts are self-hosted; every page has `lang="en"`, a skip link, landmark `nav` labels, visible focus and a reduced-motion override; interactives are buttons and form controls that degrade to plain text in print and in the DOCX; headings get `#` anchors so a section can be cited by URL; there are no screenshots of Westlaw, Lexis or Bloomberg anywhere in `content/` (the only image, the fictitious Figure 2.1 database mock-up, was retired to `content/_archive/removed-text.md` and replaced by the Database Interface Explorer); the only quoted third-party texts are a public Arizona opinion (*Markowitz*, Appendix B), a federal regulation (Appendix D) and an Arizona statute (Appendix C), none of which is encumbered; the Restatement is named but never quoted; all search-lab "cases" are fictional and both labs say so; Chapters 7, 10, 11 and 13 already treat eCFR, GovInfo, Congress.gov, Regulations.gov, agency websites, PACER and CourtListener as ordinary parts of the research cycle, and all three Chapter 13 exercises run in free sources.

---

## 1. Licensing and attribution

### 1.1 The book has no license anywhere, and the Pressbooks edition says "All Rights Reserved"
- **File:** `content/front/ai-use.md` (first paragraph and "Why Did I Use GenAI?"); `source/The-Question-Method-of-Legal-Research.html` line 26; `build.py` footer (line 339-342); `README.md`; repository root.
- **Location:** ai-use.md: "That's the beauty of a live, open-access textbook: I can fix it." and "the value of a free, open textbook on a new method". Pressbooks export line 26: `<div class="license-attribution"><p><a href="https://opentextbooks.library.arizona.edu/legalresearch" property="dc:title">The Question Method of Legal Research</a> Copyright &copy; by claskowski. All Rights Reserved.</p></div>`.
- **Problem:** A grep for license, Creative Commons, CC BY, copyright and © across `content/`, `book.json`, `build.py`, `index.html`, `assets/` and `README.md` finds no license statement at all. The book describes itself twice as open and free, the Downloads page says "Everything here is free to use and to share in class", and the Pressbooks master carries an all-rights-reserved notice. "Open" without a license is not open: an adopter has no legal basis to copy a chapter into a course site, translate the Arizona examples to another state, or redistribute the DOCX. This single gap blocks every other reuse goal in this report.
- **Fix (needs the author's decision on which license):** Pick one Creative Commons license for the text and interactives. CC BY 4.0 is the standard for open textbooks and lets other law schools adapt without asking; CC BY-NC-SA 4.0 is the common alternative if the author wants to keep commercial publishers out and keep adaptations open. Then state it in five places, all driven from one field (see 2.3):
  1. New front-matter page `content/front/about.md`, registered in `book.json` `front` after `ai-use` with title "About This Edition: License, Citation, Changes". Draft, in the author's voice:
     > This book is free to read, copy, share, and adapt. The text, the exercises, the sample answers, the glossary, and the interactives are licensed under a Creative Commons Attribution 4.0 International license (CC BY 4.0). You may reuse any of it, in whole or in part, in any medium, for any purpose, so long as you credit the source and note what you changed. The short way to credit it is the citation below. The code that builds the site and runs the interactives (`build.py`, `assets/book.js`, `assets/book.css`) is released separately under the MIT license, so a school can reuse the engine for a different book without carrying this book's text with it.
     >
     > Two limits. First, the law quoted in this book (opinions, statutes, regulations) is public and carries no license of mine; quote it from the official source, not from me. Second, the names Westlaw, Lexis+, Bloomberg Law, KeyCite, Shepard's, HeinOnline and the others are their owners' trademarks, used here only to describe the tools.
  2. `build.py` footer: replace `<span>%(book)s. By %(author)s.</span>` with `<span>%(book)s. By %(author)s. <a rel="license" href="%(license_url)s">%(license)s</a>. %(edition)s.</span>` reading the new `book.json` fields.
  3. `README.md`: a "License" section with the same two sentences (content CC BY 4.0, code MIT).
  4. A root `LICENSE.md` with the CC BY 4.0 notice for `content/`, `downloads/` and the built pages, and a `LICENSE-CODE` (MIT) for `build.py`, `editing.py`, `assets/book.js`, `assets/book.css`.
  5. The Pressbooks site's license setting, so the two editions do not contradict each other (the Pressbooks footer is generated from its Book Info license field).
- **Priority:** P1. **Needs the author** (license choice); the wiring is safe to apply once chosen.

### 1.2 The Downloads lede makes an informal grant that the license should replace
- **File:** `build.py` line 454.
- **Location:** `'<p class="lede">Print these. Fill them in. Keep them beside you every time you research. Everything here is free to use and to share in class.</p>'`
- **Problem:** "Free to use and to share in class" is narrower than an open license and is the only permission statement a reader will find. Once 1.1 lands it will be inconsistent.
- **Fix (safe to apply after 1.1):** `Print these. Fill them in. Keep them beside you every time you research. Like the rest of the book, they are CC BY 4.0: copy them, hand them out, and change them for your own course.`
- **Priority:** P1 with 1.1.

### 1.3 Font license texts are missing from the redistributed font files
- **File:** `assets/fonts/` (seven `.woff2` files, no license file); `README.md` "Look and fonts".
- **Location:** README: "Lato, Zilla Slab and IBM Plex Mono are in `assets/fonts/` under the SIL Open Font License".
- **Problem:** The SIL OFL (section 1 and 2) requires that the copyright notice and the license text accompany the font software when it is redistributed, which the built site does on every page load and the repository does on every clone. The README's sentence is correct but is not the license text.
- **Fix (safe to apply):** add `assets/fonts/OFL.txt` containing the OFL 1.1 text with the three reserved-font-name notices (Lato, copyright Łukasz Dziedzic; Zilla Slab, copyright Typotheque, commissioned by Mozilla; IBM Plex Mono, copyright IBM Corp.), and add one sentence to the About page: "The typefaces Lato, Zilla Slab and IBM Plex Mono are used under the SIL Open Font License; their license is in `assets/fonts/OFL.txt`."
- **Priority:** P2.

### 1.4 Record where quoted law was copied from, which doubles as the cite-check the editing notes already ask for
- **File:** `EDITING-NOTES.md` line 105; `content/appendices/b.md` (Markowitz excerpts), `content/appendices/c.md` (A.R.S. § 23-901), `content/appendices/d.md` (28 C.F.R. § 36.304).
- **Location:** EDITING-NOTES: "The *Markowitz* excerpts (Appendix B), 28 C.F.R. § 36.304(a) and its authority and source notes (Appendix D), and A.R.S. § 23-901(13)(c) (Appendix C) were taken from the text in the companion modules, not re-pulled from the sources."
- **Problem:** For reproducibility an adopter should be able to see where a quoted text came from and as of what date, and a reader should see the book practicing the currency habit it teaches. None of the three appendices says.
- **Fix (needs the author to run the check; wording safe):** after the interactive in each appendix add one line in the author's voice, for example Appendix D: `Text of 28 C.F.R. § 36.304 as published in the eCFR, current through [date checked]. Regulations move; run the Chapter 7 currency check before you rely on this one.` Appendix B: `Opinion text from the Arizona Supreme Court's published decision, available free through the Arizona courts' website and CourtListener; bracketed ellipses mark omitted text.` Appendix C: `Statutory text from the Arizona Legislature's site (azleg.gov) as of [date checked].`
- **Priority:** P2.

### 1.5 The archived import still points at a Pressbooks-hosted image
- **File:** `content/_archive/removed-text.md` line 77.
- **Location:** `![Fictitious database to demostrate the common facets ...](remote image from the Pressbooks site)`
- **Problem:** Not published, so no privacy or licensing issue today, but an adopter who restores the figure would reintroduce an external request (which `build.py` would catch) and a dependency on the Arizona Pressbooks server. Also note "demostrate" in the alt text if it is ever restored.
- **Fix (safe to apply):** add to the archive entry: `If restored, download the PNG into assets/ and fix the alt text; the build refuses remote images.`
- **Priority:** P3.

---

## 2. Reuse and adaptation

### 2.1 No adopter-facing "how to adapt this book" note
- **File:** `README.md`.
- **Location:** after "## Interactives" and before "## Draft flags".
- **Problem:** The README explains editing, building and the interactive kinds well, but nothing tells another instructor what to change to teach the book in Illinois with their own hypotheticals, or what they owe under the license. The Arizona footprint is small and knowable: 8 mentions in `ch-01.md`, 2 in `appendices/c.md`, 1 each in `ch-02`, `ch-05`, `ch-10`, `ch-15`, `appendices/a.md`, `b.md`, `h.md`, plus the Notice of Claim worked example in Downloads and Chapter 3's sandbox. The Chapter 3 demonstration (*Tinker*, *Bethel*, *Hazelwood*) and the organic-labeling thread are federal and travel anywhere.
- **Fix (safe to apply):** add a section:
  > ## Adapting this book for your course
  >
  > The book is CC BY 4.0, so you can fork it, change it and publish your version; keep the attribution line from the About page and say what you changed. Everything you would change is in `content/` and `book.json`; nothing in `build.py`, `assets/` or the built folders needs to be touched.
  >
  > - **Title, author, subtitle:** `book.json` (`title`, `subtitle`, `author`, and the `license`, `url`, `edition` fields the footer and metadata read).
  > - **Jurisdiction:** the Arizona material is confined to Chapter 1 (hierarchy examples), Appendix A (the premises-liability secondary source), Appendix B (*Markowitz*), Appendix C (A.R.S. § 23-901), the Chapter 3 Notice of Claim sandbox and the Worked Example in `downloads/`. `grep -n "Arizona\|A\.R\.S\.\|Ariz\." content/` lists every line. The Chapter 3 demonstration, the organic-labeling thread and all of Part II are federal.
  > - **Hypotheticals and the fictional universe:** every search lab (`kind="search"`) and sorter holds its own fictional cases; rewrite the bullets and keep the `**Title | on point.**` form. The eight fictional employment cases in Chapter 2 and the four in Chapter 9 are the only "universe"; nothing else depends on them.
  > - **Hiding answers:** Appendices E, H and I are student-visible. Remove them from `book.json` `appendices` for a student build and keep a second `book.json` for the instructor build.
  > - **Downloads:** replace the files in `downloads/` and their entries in `book.json` `downloads`; the Research Log template, the whole-book DOCX and the two study aids regenerate on every build.
  > - **Rebuild:** `python3 build.py`, then commit the output; CI checks that the committed site matches the sources.
- **Priority:** P2.

### 2.2 Built pages carry no machine-readable metadata
- **File:** `build.py` `shell()` template, lines 311-320; `index.html` head.
- **Location:** between `<title>%(title)s &mdash; %(book)s</title>` and the font preloads.
- **Problem:** The head has only `description`. There is no `author`, no `rel="license"`, no Dublin Core, no schema.org. OER Commons, the Pressbooks Directory, Google Dataset/Book rich results and library discovery layers all read these, and a law student citing the book gets nothing to copy from the page source.
- **Fix (safe to apply once `book.json` has `url`, `license`, `edition` from 2.3):** add to the template head:
  ```html
  <meta name="author" content="%(author)s">
  <link rel="license" href="%(license_url)s">
  <link rel="canonical" href="%(canonical)s">
  <meta name="dcterms.title" content="%(title)s">
  <meta name="dcterms.creator" content="%(author)s">
  <meta name="dcterms.rights" content="%(license)s">
  <meta name="dcterms.date" content="%(edition_date)s">
  <meta name="dcterms.isPartOf" content="%(book)s">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Chapter","name":"%(title)s","author":{"@type":"Person","name":"%(author)s"},"isPartOf":{"@type":"Book","name":"%(book)s","url":"%(site)s","license":"%(license_url)s","isAccessibleForFree":true,"inLanguage":"en","educationalLevel":"Graduate (JD)","learningResourceType":"textbook","dateModified":"%(edition_date)s"},"url":"%(canonical)s","license":"%(license_url)s"}</script>
  ```
  On the home page use `@type: Book` directly. Note that `canonical` needs the published base URL, which is the one value only the author knows (GitHub Pages or a custom domain).
- **Priority:** P2 (safe once the URL is known).

### 2.3 `book.json` has nowhere to hold license, URL, edition or date, so every output invents its own
- **File:** `book.json` lines 1-5; `build.py` lines 339-342 (footer), 527 and 552 (DOCX YAML).
- **Location:** `"title": "The Question Method of Legal Research", "subtitle": "Interactive Edition", "author": "Cas Laskowski", "draft": false,`
- **Problem:** The footer, the DOCX title page, the Downloads page and the proposed metadata each need the same four facts, and today none of them exists in the source of truth.
- **Fix (safe to apply):** add after `"author"`:
  ```json
  "license": "CC BY 4.0",
  "license_url": "https://creativecommons.org/licenses/by/4.0/",
  "url": "https://[published site]/",
  "edition": "Interactive Edition, first release",
  "edition_date": "2026-11"
  ```
  and have `build.py` read them in `shell()`, in `build_whole_book()` (`date: "%(edition_date)s"`, `rights: "%(license)s"`, `keywords: [legal research, open textbook, Question Method]`) and in `build_takeaways()`. Bump `edition_date` when content changes; the manifest already detects when that happens.
- **Priority:** P2.

### 2.4 The whole-book DOCX has no date, license or URL, and there is no PDF of the book
- **File:** `build.py` `build_whole_book()` lines 550-577; `downloads/The_Question_Method_of_Legal_Research.docx` (`docProps/core.xml` has title and creator only; keywords empty).
- **Location:** `parts = ['---\ntitle: "%s"\nsubtitle: "%s"\nauthor: "%s"\n---\n' % (TITLE, BOOK["subtitle"], BOOK["author"])]`
- **Problem:** The DOCX is the offline and print path and the file most likely to be emailed around. Once it leaves the site it says nothing about where it came from, when, or what the reader may do with it. There is also no PDF of the whole book, and PDF is the format most reliably readable without Office and most often requested for accessibility review.
- **Fix:** (a) **safe:** the new About page from 1.1 flows into the DOCX automatically because front matter is included, so the license and citation land on page two; also add `date:` and `rights:` to the YAML from 2.3. (b) **P3, needs the author:** a whole-book PDF. Pandoc alone cannot make one without a PDF engine; the cheapest route that respects the "no dependencies" build is to print each page from a browser, but a committed PDF built with `soffice --headless --convert-to pdf` from the DOCX in CI (one extra step in `build.yml`) would give readers a stable, paginated, citable copy. Say on the Downloads page which it is.
- **Priority:** P2 for (a), P3 for (b).

### 2.5 The Research Log template is the only download with no open-format alternative
- **File:** `book.json` downloads entry `Research_Log_Template.xlsx`; `downloads/`.
- **Location:** `"title": "Research Log Template (spreadsheet)"`.
- **Problem:** Every other download is DOCX with a PDF preview or a built-in text path (the in-browser log exports as text). XLSX opens in LibreOffice and Google Sheets, so this is minor, but a CSV of the seven headers costs nothing and works everywhere, including a plain text editor, which also fits the book's "no single right format" stance on logs.
- **Fix (safe to apply):** add `downloads/Research_Log_Template.csv` with the header row `Research Question,Question Type,Method,Findings,Source Consulted,Next Question,Notes` and list it as a second file on the same card ("CSV, for Google Sheets, Numbers, or a text editor"). The dropdown is lost; say so.
- **Priority:** P3.

### 2.6 Two masters: decide which edition is canonical and cross-link them
- **File:** `EDITING-NOTES.md` line 168; `source/The-Question-Method-of-Legal-Research.html` line 26 (Pressbooks URL `https://opentextbooks.library.arizona.edu/legalresearch`).
- **Location:** "This repo is now a second master copy. Either declare it the master (and stop editing in Pressbooks), or ask me for an exporter..."
- **Problem:** OER directories (Pressbooks Directory, OER Commons, the Open Textbook Library) will index the Pressbooks URL, not GitHub Pages. If the two drift, adopters will find the older text. Also neither edition links to the other today.
- **Fix (needs the author):** whichever is canonical, add to the other a one-line banner on the home page: `This is the [interactive / Pressbooks] edition. The text is the same; the interactive edition at [URL] adds the in-text exercises, and the Pressbooks edition at [URL] is the one indexed by open textbook directories.` Put the canonical URL in `book.json` `url` and use it in the recommended citation.
- **Priority:** P2.

---

## 3. Accessibility as an open-access value (brief; pedagogy reviewer covers the rest)

### 3.1 Every table announces itself as "Table"
- **File:** `build.py` line 210.
- **Location:** `frag.replace("<table>", '<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table>')`
- **Problem:** A screen-reader user tabbing through Chapter 1's hierarchy table, Chapter 4's source-type table and Chapter 12's rules table hears "Table, region" for each with no distinguishing name. The wrapper is good practice (horizontal scroll on a phone), but the label should name the table.
- **Fix (safe to apply):** in `process()`, when the table is preceded by a paragraph beginning with a bold lead (the book's convention) or a heading, use that text: `aria-label="Table: %s"`; otherwise omit `aria-label` and let the `role="region"` fall back to the nearest heading via `aria-labelledby` on the heading's id. Low effort: `aria-labelledby` pointing at the previous `h2`/`h3` id, which every heading already has.
- **Priority:** P3.

### 3.2 Print rendering has no page identity
- **File:** `assets/book.css` lines 122-125 (`@media print`).
- **Location:** `.masthead,.toc,.pager,.draftbar,.foot,.try-actions,...{display:none!important;}`
- **Problem:** Hiding the masthead and footer in print is right for screen clutter, but a printed chapter then carries no book title, author, URL or license on any page, so a photocopied handout is unattributed, which is the one thing an open license asks for.
- **Fix (safe to apply):** keep `.foot` visible in print as a one-line block at the end (`.foot{display:block;font-size:.8rem;border-top:1px solid #000;padding-top:6px}`) once the footer carries the license and edition from 1.1, and add `@page{margin:2cm}` and `a[href^="http"]::after{content:" (" attr(href) ")"}` so external citations print with their URLs.
- **Priority:** P3.

---

## 4. Discoverability and citation

### 4.1 No recommended citation, no version date, no stable-URL note, no visible change history
- **File:** new `content/front/about.md` (from 1.1); `build.py` footer; `book.json`.
- **Location:** footer today: `<span>%(book)s. By %(author)s.</span>`.
- **Problem:** The audience is law students who are being taught to cite precisely and to check currency, and the book gives them nothing to cite and no way to know which version they read. The AI-use page promises "I can fix it" but a reader cannot see what was fixed or when. There is no DOI and no mention of whether the Pressbooks edition carries an ISBN.
- **Fix (wording safe; URL, DOI and dates need the author):** on the About page, after the license paragraphs:
  > **Citing this book.** Bluebook form: Cas Laskowski, *The Question Method of Legal Research* (Interactive ed. 2026), [URL]. In APA: Laskowski, C. (2026). *The Question Method of Legal Research* (Interactive ed.). [URL]. CC BY 4.0. To cite a section, use the `#` link beside its heading; those anchors are stable across builds.
  >
  > **Which version you are reading.** This is the [edition] build of [edition_date]. The footer of every page repeats it. Open textbooks change; when the text that matters to you is the law itself, check the current source, not this book.
  >
  > **What has changed.** A list of substantive changes, by date, is kept at [changes page]. Typos and link fixes are not listed. If you find an error, open an issue at [repository URL] or write to [address].
  Implement the changes page as `content/front/changes.md` (or `CHANGELOG.md` rendered into `front/changes.html` by `build.py`), one dated bullet per content change, newest first. For a DOI, the author's library (the University of Arizona campus repository) can mint one for the PDF or the release; Zenodo's GitHub integration mints one per tagged release for free, which fits a repository-built book.
- **Priority:** P1 for the citation and version line, P2 for the change log and DOI.

### 4.2 "If you find one, tell me" has no address
- **File:** `content/front/ai-use.md` line 1.
- **Location:** "Any errors that remain are mine. If you find one, tell me. That's the beauty of a live, open-access textbook: I can fix it."
- **Problem:** The sentence invites correction but gives no channel. For an open book, the correction path is part of the openness.
- **Fix (needs the author to choose the channel; wording safe):** `Any errors that remain are mine. If you find one, tell me: open an issue at [repository URL], or email [address]. That's the beauty of a live, open-access textbook: I can fix it, and the About page records what changed.`
- **Priority:** P2.

---

## 5. Open access to the law itself

The book's own principle is that there is no one good research path. The free, official sources are a path, with real limits, and the book is strongest where it says exactly that (Chapters 7, 10, 11, 13). The gaps are concentrated in Chapters 1, 2, 5, 6 and 14, where the only named route is commercial, and in the citator steps everywhere, where no free route is acknowledged at all.

### 5.1 Chapter 1: say once that the law itself is public
- **File:** `content/chapters/ch-01.md` line 59.
- **Location:** after the paragraph beginning "**Primary versus secondary.** *Primary authority* is the law itself: constitutions, statutes, regulations, case law, and treaties."
- **Problem:** The book never states the fact that makes the free sources legitimate: primary law is public, and the commercial platforms sell the layer on top. Students arrive assuming the law lives inside Westlaw.
- **Fix (safe to apply):** insert a new paragraph:
  > **Where the law itself lives.** The law is public. Federal statutes, regulations and judicial opinions are not copyrightable, and courts, legislatures and agencies publish them online at no charge: the United States Code at uscode.house.gov, the Code of Federal Regulations at ecfr.gov, Supreme Court opinions at supremecourt.gov, state codes on each legislature's site. What Westlaw, Lexis+ and Bloomberg Law sell is everything built on top of that text: the annotations, the headnotes, the citator signals, the treatises, and a search engine tuned for lawyers. That layer is worth a great deal, and much of this book teaches you to use it. But the text underneath is yours already, and when you leave school and the passwords stop working, it still will be. Chapter 2 names the free sources; each source chapter says what they can and cannot do.
- **Priority:** P2.

### 5.2 Chapter 2: the free sources are introduced only as a deficit
- **File:** `content/chapters/ch-02.md` line 1 and line 165.
- **Location:** line 1: "Free alternatives, including Google Scholar, CourtListener, eCFR.gov, GovInfo.gov, and Congress.gov, provide access to many primary sources, though with fewer research tools than the commercial platforms and, often, less complete coverage of older or unreported material." Line 165 (Key Takeaways): "- Westlaw, Lexis+, and Bloomberg Law are the major commercial platforms; free alternatives provide access to many primary sources but with fewer tools and less complete coverage."
- **Problem:** Both sentences are accurate but one-sided: they say what the free sources lack and not what they do. A student reads "alternatives" as "fallbacks". The limitation is right; it needs its paired promise.
- **Fix (safe to apply):** line 1, replace the quoted sentence with: `Free sources publish most of the primary law directly: Congress.gov and GovInfo.gov for statutes and legislative materials, the eCFR and the Federal Register for regulations, CourtListener, Google Scholar and the courts' own sites for opinions. For retrieving a known citation, reading the official text, or checking currency they are often the fastest route, and they are the ones you will still have after graduation. What they lack is the editorial layer: annotations, headnotes, treatises, and citator signals, and their coverage of older and unreported material is uneven. Both kinds of platform are tools for answering the question in front of you; which one you reach for depends on the question.` Line 165, replace the bullet with: `- Westlaw, Lexis+, and Bloomberg Law sell the editorial layer: annotations, headnotes, citators, treatises. The free official sources publish the law itself, and are usually enough to retrieve, read, and update a known authority. Choose by the question, not by habit.`
- **Priority:** P2.

### 5.3 Chapter 2: a sorter that places each need in a free source, or names the gap
- **File:** `content/chapters/ch-02.md`.
- **Location:** at the end of "### Finding the Cited Source", after "The location portions are what the database indexes; the names and year are descriptive and can actually interfere with a clean retrieval."
- **Problem:** Retrieval by citation is exactly what the free sources do best, and this section is where a student first types a citation. Nothing here shows where the free copies live or where the free route stops. A sorter adds new examples rather than restating the paragraph, and keeps to six rows.
- **Fix (safe to apply):**
  ```markdown
  Every one of these addresses also resolves outside the commercial platforms. The trick is knowing which free source holds which kind of document, and where the free route runs out.

  ::: {.try kind="sort" title="Where does it live for free?" bins="Congress.gov or GovInfo | eCFR or Federal Register | CourtListener or the court's site | Only in a commercial platform"}
  - The current text of 42 U.S.C. § 12182 **Congress.gov or GovInfo**
      - The United States Code is also published by the House Office of the Law Revision Counsel at uscode.house.gov. Same text, no login.
  - A rule the Department of Justice proposed last Tuesday **eCFR or Federal Register**
      - Proposed rules appear in the Federal Register the day they are published, at federalregister.gov and govinfo.gov. The eCFR holds only final, codified text.
  - A 2019 Ninth Circuit opinion you have the citation for **CourtListener or the court's site**
      - Federal appellate courts post their opinions; CourtListener collects them with a citation lookup. Coverage of older and unpublished opinions is thinner than Westlaw's.
  - The headnotes and key numbers on that opinion **Only in a commercial platform**
      - Headnotes are West's editorial summaries. The opinion is public; the summary of it is a product.
  - The committee report behind the Americans with Disabilities Act **Congress.gov or GovInfo**
      - GovInfo holds the GPO's official PDFs of committee reports. Chapter 10 shows how to find the report number.
  - Whether that opinion has since been overruled **Only in a commercial platform**
      - Mostly. CourtListener and Google Scholar list the later cases that cite an opinion, and you can read them yourself. No free source yet gives you the red and yellow signals; Chapter 5 says what that costs you.
  :::
  ```
- **Priority:** P2.

### 5.4 Chapter 2, Exercise 2.3 and its Appendix H answer: run one retrieval in a free source
- **File:** `content/chapters/ch-02.md` Exercise 2.3; `content/appendices/h.md` line 45.
- **Location:** ch-02: "For each, first label the citation's anatomy, every location part and what it tells you, and then pull the document using only those location parts. No words in any search bar." Appendix H: "The retrieval paths: the case through the platform's citation-lookup box, entered as the citation; the statute through the code's title-and-section lookup or by browsing Title 42 to the section; the regulation through the eCFR, browsing Title 29 to Part 1605."
- **Problem:** The exercise is the ideal place to show that an address resolves anywhere, and the answer already uses the eCFR for the regulation. The case and statute paths assume a commercial platform without saying so.
- **Fix (safe to apply):** ch-02, add after "No words in any search bar.": `Pull at least one of the three from a free source (the Supreme Court's own site or CourtListener for the case, uscode.house.gov for the statute, the eCFR for the regulation) and note whether the path differed.` Appendix H, replace the quoted sentence with: `The retrieval paths, any of which passes: the case through a platform's citation-lookup box, or by volume and page on CourtListener, or from the Supreme Court's bound-volume PDFs; the statute through the code's title-and-section lookup in an annotated code or at uscode.house.gov, or by browsing Title 42 to the section; the regulation through the eCFR, browsing Title 29 to Part 1605.`
- **Priority:** P2.

### 5.5 Chapter 5: the citator section implies there is no other way to update a case
- **File:** `content/chapters/ch-05.md` lines 91-93; also `content/glossary.md` line 37-38.
- **Location:** after "A case with a yellow signal may have been distinguished on facts nothing like yours, in which case it remains perfectly good authority for your situation. You will only know by reading the citing opinion." Glossary: "A tool (KeyCite or Shepard's) that tracks an authority's subsequent history and treatment, showing whether it remains good law. (Chapter 5)"
- **Problem:** KeyCite and Shepard's are the right tools when you have them, and the book is right to require them. But a student without a subscription, or a graduate in a small office, is left with no stated route at all, when the chapter's own rule ("you will only know by reading the citing opinion") already describes the free one. This is the one place a free alternative is genuinely weaker, and saying so honestly is better than silence.
- **Fix (safe to apply):** add a paragraph after line 93:
  > **Without a citator.** If you have no subscription, the free sources give you the raw material and none of the signals. CourtListener's "Cited by" list and Google Scholar's "How cited" tab show the later opinions that cite your case; you then read each one for what it did to the point you care about, which is the step the signal was only ever a shortcut to. It is slower, it is not ranked by treatment, and it can miss very recent decisions, so for anything you will file, use a real citator if you can reach one, including the ones most public law libraries and state bar member benefits provide. Log what you used either way. The verification step does not change; the tool does.
  Glossary, replace with: `A tool, such as KeyCite or Shepard's, that tracks an authority's subsequent history and treatment, showing whether it remains good law. Free sources list citing cases without the treatment signals. (Chapter 5)`
- **Priority:** P2.

### 5.6 Chapter 5: name where free opinions live, next to the commercial routes
- **File:** `content/chapters/ch-05.md` line 53.
- **Location:** "Without one, browse by subject using key numbers (Westlaw) or topics (Lexis), or keyword search in Westlaw, Lexis, Bloomberg Law, or Google Scholar;"
- **Problem:** Google Scholar is named, which is good; CourtListener, the Caselaw Access Project and the courts' own sites are not, and Chapter 2 pointed to them.
- **Fix (safe to apply):** `...or keyword search in Westlaw, Lexis, Bloomberg Law, or in the free collections (Google Scholar, CourtListener, and Harvard's Caselaw Access Project for the full run of published state and federal reporters through 2018);`
- **Priority:** P3.

### 5.7 Chapter 6: no free source for statutes is named anywhere in the chapter
- **File:** `content/chapters/ch-06.md` line 56 and line 70.
- **Location:** line 56 ends "...turning bare text into a hub that connects to the rest of the legal landscape." Line 70 begins "Start from a citation, drawn from a secondary source or a case, and look it up directly in an annotated code."
- **Problem:** This is the one source chapter with no free route at all (grep finds none). The annotated code is correctly presented as the richest tool, but "the annotated code, not the bare statutory text, is where statutory research happens" (line 74) reads as "the only place". The official code is free, current, and what Chapter 12 tells students to verify against ("verify the current text against the eCFR or the official code"). The annotation layer is the honest limit.
- **Fix (safe to apply):** after line 56 insert:
  > The bare text is free and official. Federal statutes are published by the House Office of the Law Revision Counsel at uscode.house.gov, with session laws and the Statutes at Large at govinfo.gov and bill texts at congress.gov; every state legislature publishes its own code (Arizona's at azleg.gov), and Cornell's Legal Information Institute mirrors the U.S. Code with light cross-references. For retrieving a known section, reading it in context, and confirming the current text, these are as good as any platform and sometimes more current. What they do not have is the apparatus below: the Notes of Decisions, the cross-references, the citator links. When your question is "what does this section say," the free code answers it. When your question is "how have courts read this section," you need the annotations, or you build them yourself by searching the section number as a phrase in a free case database, which is slower and unranked but works.
  And in Exercise 6.2 ("In an annotated code, take any substantive statute...") append: `If you have no annotated code, search the section number in quotation marks in CourtListener or Google Scholar and pick two citing cases from the results; log that you built the pathway by hand.`
- **Priority:** P2.

### 5.8 Chapter 7 is the model; one address is missing
- **File:** `content/chapters/ch-07.md` line 45.
- **Location:** "- **Federal Register (FR).** The daily publication of proposed rules, final rules, notices, and executive orders. Best for tracing recent or proposed regulatory action."
- **Problem:** The chapter names the eCFR by address and GovInfo and Regulations.gov by name, but never says where the Federal Register itself is read for free.
- **Fix (safe to apply):** append `Free at federalregister.gov (searchable, with links to the docket on regulations.gov) and govinfo.gov (the official PDF).`
- **Priority:** P3.

### 5.9 Chapter 10: compiled histories are listed as commercial only, and Arizona's free archive goes unnamed
- **File:** `content/chapters/ch-10.md` line 71 and line 90.
- **Location:** line 71: "The Union List of Legislative Histories, Nancy Johnson's *Sources of Compiled Legislative Histories*, ProQuest Legislative Insight, and HeinOnline's compiled histories catalog thousands of them." Line 90: "Others, like Arizona, provide limited access, often only to session laws and committee minutes."
- **Problem:** The database list that follows is admirably explicit about free versus paid. The compiled-history sentence is not, and a student without ProQuest or Hein has no stated route to a compiled history. The Arizona sentence is right but could hand students the free door it describes.
- **Fix (safe to apply):** line 71, append: `Two free guides do the same pointing work: the Law Librarians' Society of Washington, D.C.'s Legislative Source Book, and the Library of Congress's legislative history research guides, both of which list where each public law's documents were collected.` Line 90, append after "committee minutes": `(in Arizona, the Legislature's site at azleg.gov holds bill histories and committee minutes back to the late 1990s, and the State Library's Arizona Memory Project holds older session laws).`
- **Priority:** P3.

### 5.10 Chapter 13: two free doors worth one line each
- **File:** `content/chapters/ch-13.md` lines 59-66.
- **Location:** after "- **Justia and Google Scholar.** Partial free coverage, especially of published opinions."
- **Problem:** The list is already the best in the book. It omits that written opinions are free on PACER itself, that GovInfo collects them, and that the RECAP extension turns every paid download into a public one, which is the one place a student can contribute to open access rather than only consume it.
- **Fix (safe to apply):** add two bullets:
  `- **Opinions without a PACER bill.** PACER does not charge for written opinions, and GovInfo's United States Courts Opinions collection republishes them for many districts and circuits.`
  `- **Give back what you buy.** The free RECAP browser extension, from the same project as CourtListener, copies any PACER document you pay for into the public archive, so the next researcher does not pay twice. Install it before Exercise 13.1 if your court allows it.`
- **Priority:** P3.

### 5.11 Chapter 14: brief banks are commercial only, and one example question frames application as the client's facts
- **File:** `content/chapters/ch-14.md` lines 34 and 38.
- **Location:** line 38: "Brief banks: Westlaw, Lexis, Bloomberg Law." Line 34: "**Characteristic questions.** Application questions dominate: "How do the facts of my case compare to the leading cases?""
- **Problem:** (a) Briefs are court records and the free archives hold millions of them; naming only the paid banks implies the free route does not exist. (b) The first characteristic question is phrased as applying the rule to the client's facts, which the brief marks as an error: application questions ask how courts have applied the rule to facts in decided cases; the comparison to the client's facts is a writing step on the annotated outline. The pedagogy reviewer owns this, but it is flagged here because it sits in the same sentence as the fix in (a).
- **Fix (safe to apply for (a); (b) needs the author's wording):** line 38: `Brief banks: Westlaw, Lexis, Bloomberg Law; free, the RECAP archive on CourtListener, the Supreme Court's own site (merits and amicus briefs since 2017), and many federal and state appellate courts' sites.` Line 34, replace the first quoted question with: `"How have courts applied the rule to facts like my client's?"`
- **Priority:** P2.

### 5.12 Chapter 17: the preemption check should name the free route students keep after graduation
- **File:** `content/chapters/ch-17.md` line 46 and line 118.
- **Location:** line 46: "SSRN is free and carries cutting-edge working papers, often months or years ahead of publication. Google Scholar is free and useful for citation counts and finding key articles."
- **Problem:** Already good. Two free, scholarly, full-text sources are missing: law school institutional repositories (most law reviews now post final PDFs there) and the Law Review Commons / Digital Commons Network that searches across them. Also worth saying that HeinOnline and Westlaw access ends with the student ID.
- **Fix (safe to apply):** append to line 46: `Most law reviews also post their final articles in their school's open repository, and the Law Review Commons searches hundreds of those repositories at once; after graduation, when HeinOnline and Westlaw stop answering your password, those and SSRN are the preemption check that remains.`
- **Priority:** P3.

### 5.13 Chapter 3: "what resources do you have" should include which databases
- **File:** `content/chapters/ch-03.md` line 199.
- **Location:** "What is the scope? What will count as doing the job well? What are the deadlines, and what resources do you have?"
- **Problem:** "Resources" is the one word in the planning step that covers database access, and students do not hear it that way. A solo practitioner's and a large firm's answers differ, and the method already says the route depends on the parameters.
- **Fix (safe to apply):** `What are the deadlines, and what resources do you have, including which databases you can actually reach? A clinic with Westlaw and a solo office with a state bar's Fastcase subscription and the free official sources will run the same cycle down different routes, and the Research Log should say which.`
- **Priority:** P3.

---

## 6. Reproducibility of the cited law

### 6.1 Appendix G cites two California cases in California style with no parallel reporter
- **File:** `content/appendices/g.md` lines 17 and 23 (also noted in `EDITING-NOTES.md` line 313).
- **Location:** "*Thing v. La Chusa* (1989) 48 Cal" and "*Elden v. Sheldon* (1988) 46 Cal".
- **Problem:** Every other case in the book is in Bluebook form with a reporter a free source can resolve. "(1989) 48 Cal.3d 644" is the California Style Manual form; students outside California will not recognize it, and the free sources index both the official and the Pacific Reporter cites, so the parallel helps retrieval.
- **Fix (safe to apply, verify the parallels):** `*Thing v. La Chusa*, 48 Cal. 3d 644, 771 P.2d 814 (1989)` and `*Elden v. Sheldon*, 46 Cal. 3d 267, 758 P.2d 582 (1988)`.
- **Priority:** P2.

### 6.2 The real cases are retrievable; keep it that way with one convention
- **Files:** all chapters and appendices.
- **Location:** the twenty-odd real citations found by grep (*Hazelwood*, *Tinker*, *Bethel*, *Dean v. Utica*, *Loper Bright*, *Kisor*, *Auer*, *Skidmore*, *Mata v. Avianca*, *Markowitz*, *Oakland Police & Fire*, *Pelham*, *McLane*, *Plessy*, *Brown*, *Texas v. Johnson*, *Rowan*, *Kennedy v. Bremerton*, *Nix v. Hedden*).
- **Problem:** None. Every real case checked carries a full reporter citation on first use, and each is in a reporter CourtListener, Google Scholar or the Caselaw Access Project resolves. Later short forms (*Kennedy v. Bremerton*, *Mata v. Avianca*) follow full cites, as they should. This is recorded so an adopter knows the baseline.
- **Fix (safe to apply, README):** add to the "Adapting this book" section: `Every real case is cited in full on first use in each chapter, in a reporter a free database resolves; keep that rule when you substitute your own cases, and label invented cases as fictional in the sentence before the interactive, as Chapters 2 and 9 do.`
- **Priority:** P3.

---

## Summary

1. The book calls itself open and free but carries no license anywhere (site, Markdown, book.json, DOCX, repository), and the Pressbooks master says "All Rights Reserved"; choosing a CC license and wiring it through one `book.json` field into the footer, a new About page, the DOCX and a root LICENSE is the single P1 that unblocks all reuse.
2. There is no recommended citation, edition date, canonical URL, change log or error-report channel, and the built pages carry no author, license or schema.org metadata; the same About page and a few template lines in `build.py` fix all of it.
3. The repository is well separated (content versus build) and the interactives are well documented, but there is no adopter-facing "how to adapt" note; the Arizona footprint is small and listed above, so the note is short.
4. On open access to the law, Chapters 7, 10, 11 and 13 are models; Chapters 1, 2, 5 and 6 name only commercial routes or frame free sources as deficits, and the citator step nowhere acknowledges the free (slower, signal-less) alternative; the drafted paragraphs and one sorter fill those gaps without repeating the text above them.
5. Third-party material is clean (public opinions, statutes and regulations only; no vendor screenshots; fictional cases labeled), font license texts are missing from `assets/fonts/`, and the real cases are all retrievable from free sources except two California-style cites in Appendix G that need parallel reporters.
