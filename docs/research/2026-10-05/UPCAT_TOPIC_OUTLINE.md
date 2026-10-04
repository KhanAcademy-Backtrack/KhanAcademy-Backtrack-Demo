# UPCAT topic outline, checked 5 October 2026

The reviewer now shows, for each UPCAT section, the sub-subjects and topics the exam is known to
draw on, and marks which of them have a Khanpanion summary. The outline lives in
`src/lib/program/exam-outline.ts`; `tests/exam-outline.test.mjs` checks it against the exam's
sections and the reviewer's summaries.

## What UP publishes

https://upcat.up.edu.ph/htmls/aboutupcat.html lists four subtests: Language Proficiency (in
English and Filipino), Science, Mathematics and Reading Comprehension (in English and
Filipino). UP publishes no topic list. Everything below the subtest level is therefore
reported, not official, and the site says so beside the outline.

## Sources

The owner asked for the outline to follow established, well-known UPCAT reviewers rather than
the DepEd curriculum guides, which are too broad for this purpose. Only publicly visible
contents pages and coverage pages were used. No questions, explanations or wording were copied.

| Reviewer | Where | What it shows publicly | Basis it states |
|---|---|---|---|
| The Maroon Bluebook (UPCAT reviewer book and its online masterclass) | https://themaroonbluebook.com/products/tmb, https://themaroonbluebook.com/pages/upcat-masterclass-2026 | Module groups only. Mathematics: arithmetic and pre-algebra; algebra and functions; pre-calculus and trigonometry; statistics; geometry. Science: biology, chemistry, physics, earth and general science. Language Proficiency: grammar and vocabulary, sentence structure. | Simulated UPCAT questions; no topic-level contents page is public. |
| FilipiKnow, "UPCAT Coverage" | https://filipiknow.net/upcat-coverage/ | Sub-subjects with topic lists for every subtest, including calculus and logic in Mathematics and a separate astronomy group in Science. | "Experiences of recent UPCAT takers"; says the exam changes every year. |
| Review Masters, UPCAT reviewer | https://www.upcatreview.com/upcat-reviewer/ | Subject level: arithmetic, algebra, geometry, trigonometry, statistics; earth science, biology, chemistry, physics; vocabulary, grammar, sentence composition; reading passages including poems, speeches and diagrams. | Questions "based on student feedback on previous UPCAT exams", compiled over at least ten years; disclaims being actual UPCAT items. |
| Shared checklists (Scribd uploads titled UPCAT subtopics and UPCAT topics checklist) | https://www.scribd.com/document/501987363/UPCAT-Subtopics, https://www.scribd.com/document/520025515/UPCAT-Topics-Checklist | Subject level only in the public preview; both list astronomy separately and one lists calculus. | Not stated. Used only to confirm the grouping. |

## Method

1. Sub-subjects are the groups the reviewers agree on. Mathematics: arithmetic and number sense,
   algebra and functions, geometry, trigonometry, statistics and probability. Science: biology,
   chemistry, physics, earth science and astronomy (astronomy is separate in three of the four
   sources and folded into earth and general science in the fourth).
2. Logic and calculus appear in only some reviewers, so they form one sub-subject marked `less`,
   and the reviewer says only some reviewers report it.
3. Language Proficiency keeps English vocabulary, English grammar and usage, and sentence
   structure from the reviewers, and adds Filipino grammar and vocabulary because UP's own page
   says the subtest is in English and Filipino. Reading Comprehension groups the skills the
   reviewers name (main idea and title, details, inference and conclusions, context clues,
   point of view, fact and opinion, figurative language) and the passage types they name
   (essays, stories, poems, speeches, diagrams), in English and Filipino.
4. Topic titles are written in Khanpanion's own words. Overly fine items from a single source
   (for example a separate "introduction" topic in every science) are left out.
5. Each topic names the reviewer summaries that teach it. Every UPCAT summary appears at least
   once, and a summary is only attached inside the section that covers it; the test enforces
   both. Topics without a summary show as "Not written yet". They are the writing backlog.

## Limits

- Reviewer lists describe what past takers report, not an official specification. The exam
  changes from year to year.
- Review providers' names stay out of the learner-facing site, as with the CET coverage list.
  The site says only that the topics "follow what established UPCAT reviewers cover".
- Only the UPCAT has an outline. Other CETs keep the section-level reviewer until their own
  outlines are researched.
