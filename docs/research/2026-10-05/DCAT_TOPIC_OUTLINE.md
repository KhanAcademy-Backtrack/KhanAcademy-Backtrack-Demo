# DCAT topic outline, checked 5 October 2026

The reviewer now shows sub-subjects and topics for the DCAT's Mathematics, Science and English
sections, using the same method as the UPCAT outline (`UPCAT_TOPIC_OUTLINE.md`). The outline
lives in `src/lib/program/exam-outline.ts`. `tests/exam-outline.test.mjs` checks it against
`EXAM_COVERAGE.dcat` and the reviewer's summaries.

## What DLSU publishes

DLSU's admissions pages (https://www.dlsu.edu.ph/admission/undergraduate-admissions/) give
dates and procedures but no section list and no topic list. The four sections (Mathematics,
Science, English, Mental Ability) were supplied by the Khanpanion team; see
`docs/research/2026-10-04/CET_COVERAGE.md`. Everything below the section level is reported,
not official.

## Sources

The owner asked for the outline to follow established DCAT reviewers rather than the DepEd
curriculum. Fewer providers publish DCAT topic lists than UPCAT ones. The best-known review
providers name DCAT subjects but no topics. The topic-level lists come from newer preparation
sites and one past taker's account. Only publicly visible coverage pages were used. No
questions, explanations or wording were copied.

| Source | Where | What it shows publicly | Basis it states |
|---|---|---|---|
| UPCAT Champion (CET 2-in-1 reviewer and DCAT self-paced program) | https://upcatchampion.com/post/master-dcat-free-self-paced-review-with-upcat-champion, https://upcatchampion.com/updates/b/comprehensive-tips-for-acing-the-dlsu-college-admission-test-dcat-with-the-upcat-champion--cet-2-in-1-reviewer | Subjects: Math, Science, English, Reading Comprehension, Mental Ability (and abstract reasoning). Topic hints only: statistics, square roots, algebra, business math; reading comprehension and vocabulary. | Says the program mirrors the DCAT's structure; cites nothing. |
| Review Masters (CET review) | https://www.upcatreview.com/cet-review/ | Names the DCAT among the tests it prepares for; levels in Math, Science, Language and Reading Comprehension. No DCAT topic list. | Course developed with former UP professors. |
| MSA Academy | https://www.schoolfinderph.com/blog/msa-review-center-guide | Confirms MSA prepares for the DCAT. No public topic list. | Not applicable. |
| OpenExamPrep, DCAT study guide | https://open-exam-prep.com/study-guides/ph-dcat | Topic lists for every part. Mathematics: algebra and factoring, linear and quadratic equations, word problems (age, work, mixture, rate-distance-time), geometry, trigonometry, percentages, business math, statistics and probability. Science: chemistry (symbols, formulas, naming, atomic structure, acids and bases, changes of matter), physics (Newton's laws, energy, SI units, light), biology (cells, genetics, respiration, body systems) and earth science. English: vocabulary, synonyms and antonyms, grammar and usage, punctuation, sentence construction, idioms, word roots, reading passages, graphs and data. | Says plainly it is not published by DLSU. |
| EdgePrep, DCAT guide | https://edgeprep.ph/dcat-exam-guide | English: vocabulary, grammar, sentence construction; main idea, inference, author's purpose; sentence-correction items. Mathematics: algebra and general math, statistics and probability, word problems. Science: biology, chemistry and physics fundamentals, applied rather than recall. | Cites DLSU's admissions office, but DLSU publishes no such list. Treated as a reviewer's report. |
| 3D Academy, entrance exams guide | https://3d-universal.com/en/blogs/admission-exams-upcat-acet-dcat-etc-explained.html | Mathematics (algebra, geometry, word problems), English and reading comprehension, abstract reasoning, science. | Cites nothing. |
| Past taker's account (DLSUCET, 2013) | http://pleasantlychic.blogspot.com/2013/09/cet-survival-guide-dlsucet.html | Mathematics focused on trigonometry, algebra and geometry; science mostly chemistry formulas; separate reading, language and abstract parts. | One person's experience. |

The School Finder PH DCAT guide (https://www.schoolfinderph.com/blog/dlsu-entrance-exam-guide)
deliberately gives no subject list and warns that third-party breakdowns are estimates. That
warning is why the site keeps saying the topics are what reviewers report.

## Method

1. Sub-subjects are the groups the sources agree on. Mathematics: arithmetic and number sense,
   algebra, word problems, geometry and trigonometry, statistics and probability. Science:
   biology, chemistry and physics, which every source names. English: vocabulary, grammar and
   usage, sentence construction and correction, and reading comprehension.
2. Earth and space science appears in only one topic list. One past taker found few earth
   science questions. It is one sub-subject marked `less`, and the reviewer says only some
   reviewers report it.
3. The DCAT English section is in English only. No source reports a Filipino part, so no
   Filipino summary is attached. This matches `lang:'en'` in `EXAM_COVERAGE.dcat`.
4. Topic titles are written in Khanpanion's own words. Titles may repeat a UPCAT title (for
   example "Circles"); each exam's topics save under their own key.
5. Each topic names only the summaries that teach it, checked against each summary's
   key points. "Age and mixture problems", "Counting outcomes" and "Square roots and radicals"
   have no summary because the existing summaries do not teach them, even where a blurb
   mentions the word.
6. The test requires every DCAT summary to appear in the outline. Three summaries cover topics
   no DCAT source names one by one: gas laws, electricity and circuits, and radioactivity.
   They sit under chemistry and physics because the sources report those subjects as
   "fundamentals" without a full list, and they are standard topics in both. If a fuller DCAT
   source leaves them out, move them or ask whether the rule should allow an unlisted summary.
7. Mental Ability has no reviewer material, so it has no outline. The reviewer shows it as
   "No material yet".

## Limits

- No DCAT topic list is official, and the established providers publish no topic-level DCAT
  contents. The topic level rests mainly on two newer preparation sites, checked against the
  subject-level lists of the established ones.
- Review providers' names stay out of the learner-facing site. The site says only that the
  topics "follow what established DCAT reviewers cover".
- Pages were read with an automated fetch on 5 October 2026. They are ordinary server-rendered
  pages, but the owner may want to open them by hand before relying on the outline.
