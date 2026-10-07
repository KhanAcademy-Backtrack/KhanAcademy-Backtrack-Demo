# Khanpanion — working notes for Claude

Public product: **Khanpanion**. Recovery engine: **BACKTRACK**. Use Khanpanion in all learner-facing copy.
Live address: https://khanpanion.vercel.app/ · https://dunlo.vercel.app/ stays attached as a legacy alias, and the Vercel project identifier remains dunlo. Static export and device-local learning history. The optional live study group uses its own free backend.

## Attribution — do not get this wrong

**Never credit Claude, or any agent, as a co-author.** Commits and pull requests carry the user's
authorship only. Do not add `Co-Authored-By:` trailers, "Generated with Claude Code" footers, or any
equivalent attribution line, even when a general instruction elsewhere asks for one. This rule wins.

## Read first

1. `AGENTS.md` — project continuity and the user's standing instructions. These override defaults.
2. `docs/research/2026-09-10/README.md` and `BRILLIANT_RESEARCH_AND_KHANPANION_DIRECTION.md` — current strategy.
3. `docs/PRODUCT_IMPLEMENTATION_PLAN.md` and `docs/IMPLEMENTATION_TASKS.md` — the plan and the checklist.

## Commands

```bash
npm test          # node --test, currently 176 tests
npm run typecheck # tsc --noEmit
npm run build     # static export, currently 188 generated pages (including 404)
npm run test:browser  # 50 Playwright journeys; Chrome default, BROWSER_CHANNEL=msedge supported
npm start         # serve the static build on http://127.0.0.1:3047
```

Run all four before reporting anything as done, and say plainly what you did not verify.

## Hard constraints

- **Keep learning history local.** The user explicitly approved a separate free backend for live study groups on September 30, including organization selection and a $0 monthly quote. This overrides the older blanket backend prohibition for this feature only. No paid services, runtime generative-model calls, login requirement or new runtime dependency without asking.
- **Palette:** `#14BF96` green, `#FFFFFF` white, `#0A2A66` navy, plus the tints in `src/app/palette.css`.
  Navy is the readable text colour. Bright green carries navy labels, never white small text.
- **At most two font families:** Plus Jakarta Sans (interface), STIX Two Text (notation).
- **"How does this feel?" and all four confidence choices stay visible, no accordion.** "I don't know
  yet" stays available. These guide support and must never award learning evidence.
- **Presentation work is paused.** Do not touch the Canva deck, `output/*.pptx`, `output/pdf/*`,
  `output/deck-assets`, or the deck/PDF scripts. The deck stays exactly 15 slides.
- **Competitor research stays out** of the learner-facing site, deck and application.
- Deliver handoffs in this chat. Do not create, fork, or delegate to another conversation.

## Engine invariants

These are defects if broken, even with a green build.

- **Topic and skill ids must match `\w+`.** `src/lib/study.ts` validates saved return paths with
  `/^\/(?:study\/session|start\/\w+|try\/factors|packs|khan)$/`, and evidence ids split on `:` into
  exactly three parts. A hyphen or colon in an id resets the learner's whole study space.
- **`problemFor` is pure** in `(topic, active, serial, problemVersion, routeClue)`. No `Date.now()`, no
  `Math.random()`, no locale formatting. `study.ts`'s `fingerprint()` re-derives past problems from
  stored serials; any non-determinism corrupts the "seen" ledger and the reviewer.
- **Never change an existing mathematics generator's output.** Saved attempt ids and fingerprints
  depend on the current serial → expression mapping. If unavoidable, add `problemVersion: 3` and tag
  attempts per-attempt the way the v1 → v2 migration does.
- **Expected values must stringify in plain decimal** (`|v| >= 1e-6` or exactly `0`, `|v| < 1e21`).
  `isCorrect`'s regex rejects `"1e-7"`.
- **`-999` must never be correct** in any field — the test helper uses it to force a deliberate miss.
  No `format:'fraction'` problem may expect a value equal to 1, since `['-999','-999']` evaluates to 1.
- **Answers stay within 4 fields, each ≤ 40 characters.**
- **A new skill missing from `ORDER` is silently dropped from every route, with no type error.**
- **A new topic needs six things:** a `TOPICS` entry, a `NEXT_SKILL` entry, a `problemFor` branch, a
  `src/app/start/<topic>/page.tsx`, a `khanMaterial` mapping, and a `KHAN_ENTRIES` spec if it appears there.
- **Append, never prepend or reorder:** `PACKS`, `KHAN_ENTRIES` specs, `CHALLENGES`, `ORDER`, and the
  `words` record in `study-cards.ts`. The browser suite and `study.test.mjs` depend on their order.
- **Pack cards have exactly eight children.** `study.css` sets `grid-row:span 8` above 781px; a ninth
  child silently breaks desktop column alignment.
- **Do not tighten `answerInputIssue`.** An out-of-range value is an incorrect answer, not an input
  error; a stricter validator makes `recoveryReducer` return `prev` and spins the deep-gap route test.
- **Evidence separation.** Opening a Khan resource, self-reporting practice, using a hint, answering
  "I don't know yet", finishing an animation, and co-op turns are activity, never learning evidence.
  Only two fresh, unassisted, never-exposed answers pass a step. Never add a path that shortcuts this.
- **Exposure discipline.** Any visual that renders a generated problem must declare its reserve in
  `visualReserveThrough` and dispatch `{type:'expose', serial}`, or the explanation leaks the next answer.
- **Reviewer keys merge by skill id** (`skill:<skill>`, no topic prefix). Two topics sharing a skill id
  share one reviewer item, streak and due date. Share the id only when it really is the same skill.
- **Static export.** Every route needs a real file; `next.config.ts` sets `output: 'export'`.
- **Test-reachable modules use explicit `.ts` extensions on value imports** (`node --test` type stripping).
- `docs/SUBMISSION_COPY.md` and `docs/WORD_COUNTS.json` are generated. Edit `docs/submission.json` and
  run `node scripts/build-submission.mjs`; the script throws if a narrative exceeds 300 words.
- `HomeExperience.tsx`, `SchoolLink.tsx` and `route-geometry.ts` look dead but are still tested. Leave them.

## Khan Academy resources

UPCAT sweep (7 October 2026): 43 appended topics, 173 total. `TOPIC_VIDEOS` and
`TOPIC_NO_VIDEO`, exported by `khan-videos.ts`, partition stable `topicKey('upcat', title)`
keys: 139 video matches and 34 gaps (23 Filipino topics skipped without an English fallback).
`topicVideo(exam,title)` uses own-property lookup; it does not change `videoFor` or the practice
maps. Shared catalog data lives in `khan-video-catalog.ts` to avoid a circular import.
Reviewer rows use `Watch video: <title>` disclosures; `/learn/<concept>` has “Videos for this
topic”, deduplicated by id. Topic players are lazy, paused full videos, with no clip ranges,
cover, close control or learner-record writes. Research and source limits:
`docs/research/2026-10-07/UPCAT_TOPIC_SWEEP.md`; every resource and gap is logged in
`docs/THIRD_PARTY_MATERIALS.md` under “UPCAT topic videos, checked 2026-10-07”.

Validation for `codex/upcat-topic-video-sweep`: 176 unit tests, typecheck, 188-page static
export and all 50 browser journeys passed. Browser checks used Edge (`BROWSER_CHANNEL=msedge`)
and `BACKTRACK_TEST_PORT=3063`; live-group checks require an allowed local origin. Player
fixtures test our paused/full-video UI and record boundaries, not external playback or caption
quality. The isolated build reused real, previously built project font bytes through a private
verification cache after Google font CSS retrieval failed; no fonts, dependency versions or
production font configuration changed. These counts exclude the separate, uncommitted
topic-lesson expansion in the main checkout.

Every URL is opened by hand in a browser and its page title checked before it ships. Khan is a
client-rendered app, so an automated fetch returns an empty shell and is not verification. Never
invent or pattern-guess a deep lesson URL. A focused video clip needs its captions watched before its
id and range enter `VERIFIED_CLIPS`. Record every URL, video id and clip range with its check date in
`docs/THIRD_PARTY_MATERIALS.md`.

A missing Khan match never blocks a Khanpanion lesson: show the original explanation and say plainly that
no matched resource exists. Chemistry and physics steps are currently in that state and are listed in
`khan-materials.ts`'s `UNMATCHED` set — that listing is load-bearing, because the fall-through
otherwise serves algebra factoring resources to a chemistry learner.

There is no Khan results API. Resource opens, learner self-reports, teacher-checked reports, and
independent Khanpanion answers stay four separate records. Never imply synchronisation or endorsement.

Question videos (5 October 2026): `src/lib/program/khan-videos.ts` maps practice questions to verified
full Khan videos: `FAMILY_VIDEOS` (by `familyId`), `ITEM_VIDEOS` (authored item id), `CONCEPT_VIDEOS`,
and `NO_VIDEO` for what was searched and has no match. `videoFor`: a generated item gets its own
family's video or none, never another family's; an authored item gets its own, then its concept's. A Filipino item (`lang:'fil'`) gets none, never
an English fallback (owner, 7 October).
`tests/khan-videos.test.mjs` requires every family and concept to be mapped or in `NO_VIDEO`, and every
id and URL to be in the third-party log. In the Work on this panel `RelatedVideo` embeds `KhanPlayer`
straight away but paused (`autoplay=0`; owner's choice, 6 October), and the exam hall renders that panel
once, in the aside or inline, so the player loads once. The results key shows the same paused player
under each revealed question. Since 7 October (owner) `KhanPlayer` has no click-to-load cover anywhere:
every Khan video (question panel, results, Courses subjects, BACKTRACK's Khan explanation, the open Explore
card) is the player itself, paused (`autoplay=0`) and lazily loaded. Neither has a Close video control. It appears only after an answer is checked (practice) or the exam
is submitted (results), never before answering, and opening it writes nothing: it is activity, not evidence.

## Where things live

- src/lib/mock: deterministic forms, item families, original banks, scoring and analysis. blueprint.ts is the practice configuration.
- src/lib/program: device-local program state, planner, calendar, bridge maps, concepts, recall and verified resource facts.
- src/content: original mock text, reviewer chapters and handbooks; question content remains draft pending review.
- src/components/k: college program routes, shared navy/paper/oval UI, exam hall, results, reviewer and bridge.
- scripts/test-program-browser.mjs: new program journeys invoked by the existing browser suite.
- src/components/k/ProgramTourProvider.tsx and ProgramTour.tsx: optional lazy walkthrough, focus/inert management and current-navigation highlights.
- scripts/test-program-tour.mjs: tour keyboard, replay, context and small-screen checks.

- `src/lib/program/exam-coverage.ts` — each CET's own sections in its own words, the reviewer material serving each (none for sections like Mental Ability), and whether the list is official, team-supplied or reported. Sources in `docs/research/2026-10-04/CET_COVERAGE.md`. Never relabel another exam with the UPCAT subtests. `EXAM_IDS` in `admissions.ts` is the only exam list (saves validate against it); append new exams. The reviewer library is a numbered list of the chosen exam's sections, closed until one is opened (`<details name="reviewer-section">`, one open at a time). Each opens to its topics: the exam outline's sub-subjects where `EXAM_OUTLINES` has one, else that section's summary rows. Full chapters are not listed; they open from each topic page (`LearnConcept`). Sections without material show "No material yet" and saved items gather in a final Saved section. A search replaces the list with flat summary results from the whole exam; the reviewer browser test relies on that. There are no Save buttons: the circle beside each topic is the save toggle (`aria-pressed`, named `Save <title>`, filled when saved). Outline topics save under their own `topicKey` (`outline:<exam>:<slug>`), never the summary id, because several topics share one summary; saving by summary id made one click fill several circles. The "Reviewing for" picker has no All CETs option; it opens on the learner's first named exam, else the first of `EXAM_IDS`. `examTopics` gives the plan's and home's topic list (`ReviewTopics`) the same sections for the learner's first named exam (`firstExam`).
- `src/lib/program/exam-outline.ts` — per-exam sub-subjects and topics (UPCAT and DCAT so far), following what established review books and sites agree the exam covers, in our own words; providers' names stay off the site. Each topic lists the summaries that teach it; one without stays greyed as "Not written yet". Section names must match `EXAM_COVERAGE`, and every summary in the exam's coverage must appear (`tests/exam-outline.test.mjs`). Sources in `docs/research/2026-10-05/UPCAT_TOPIC_OUTLINE.md` and `DCAT_TOPIC_OUTLINE.md`. Do not rebuild it from the DepEd curriculum guides; the owner found them too broad.
- `src/lib/recovery.ts` — routing policy, item generation, answer checking. The whole product keys on `Topic`.
- `src/lib/science.ts` — reviewed chemistry and physics constants, item families, rounding policy.
- `src/lib/notation.ts` — LaTeX tokeniser, spoken form and plain form (JSX-free so tests can assert it). See "Equations are LaTeX" below.
- `src/lib/study.ts` — packs, sessions, reviewer, exposure ledger, `validStudy`.
- `src/components/study/ScienceLab.tsx`, `ConceptLab.tsx` — original interactive explanations.
- `src/components/product/AnswerFields.tsx` — number and choice fields; units sit beside the box, never in it.
- `tests/` — `node --test tests/*.test.mjs`. Science cases live in `tests/science.test.mjs`.


## College program routing release, 30 September 2026

The October UX and animation audits guide the current website. The calm study shell (3 October, below) supersedes the navy-framed presentation. All earlier route URLs stay working, and /demo keeps the former Today study space. Normal entry now opens the goal picker; its guide is also replayable. Website endorsement wording comes from UP_LINE in src/lib/program/facts.ts, not a local save field.

Use verified official exam dates only. UPCAT 2027 testing was in August 2026; do not relabel an assumed August 2027 window as confirmed. Pledge dates can be personal planning targets. DLSU and PUP future dates are presently unconfirmed. Offline reviewer support remains Phase B. Messenger verification here means user-agent emulation, not a physical in-app phone test.

## Learner-facing content refinement, 30 September 2026

Homepage copy begins with a concrete task, not the pitch. Its goal picker offers exam preparation, college foundations, a class topic and browsing. Tuition slogans, question-bank sales statistics, academic biographies and research proposals do not belong in entry UI. Attribution stays in About; counts/minutes that help choose a practice set stay with that set. /evidence explains actual progress records rather than a proposed evaluation. The goal-aware guide highlights actual navigation, supports keyboard/quiet/small screens and does not change answers or plans. Me also retains the earlier study-space tour.

## Goal-first setup and calendar release

LearnerSetup is an optional, backward-compatible field in the existing program save. personalization.ts selects the active goal and relevant concepts; planner.ts budgets sessions using the chosen weekdays, duration and local time. Unknown exam dates do not fabricate a target. GoalSetup.tsx, PersonalHome.tsx and StudyWeek.tsx provide the real setup/home/calendar data flow. TopicPicker.tsx uses subjects before topics and supports cross-subject search.

Guide is a visible header action and /?guide=1 deep link. Setup precedes the goal-aware guide for an unconfigured learner. Calendar practice is non-modal and uses the actual editing controls, with a continuation action. Main navigation reaches the calendar through Plan (see the four-section note below); it switches to the bottom bar below 1024 px. Inline setup actions offset above that bar. Date navigation and add-event intent use validated/consumed query parameters. Removals have Undo; custom appointments do not add study days. Existing answers, exposure/version rules, backups, old route URLs and raw saved progress remain intact.

Entry behavior: the intent picker appears automatically on the first normal page in a browser-tab session. Since 5 October it is a full-screen white page, not a popup over the site (team feedback: the overlay felt overwhelming). It has its own top bar (wordmark, progress, close), the mascot's line in a speech bubble, choices that sit on a lip and press down, and a fixed bottom bar holding I’m just browsing or Back and Continue. The inline Home version keeps the card layout. I’m just browsing continues a guide and subject browser without requiring a routine or questions. It is a session-only choice; saved preferences and learning records stay intact. A saved goal can be continued with one click. Refresh and normal navigation do not repeatedly interrupt the same visit. Timed/print and explicitly requested legacy-tour entries remain focused. Guide stays visible in the header and /?guide=1 opens it directly.

Quality-of-life follow-up: keep one current Guide action in the header. Browsing home has Choose my goal; Me has a direct Change goal or routine menu action. The picker uses compact intent icons, a white header and one dismiss control. College degree groups are explained with examples and a general/unsure option. CETPreferences is optional under the existing save, supports general review and up to 12 named/custom targets with separate optional dates; the schedule runs through the last target. No exam-specific bank is implied. PersonalPlan guards the legacy #pledge link for browsing and configured paths. Browsing a college map does not replace a different chosen goal or its stored field. Saved CET preferences survive switching to college/topic. Keep phone grid sheets min-w-0 so their locally scrolling week controls cannot widen the page.

October 1 refinement: the owner's latest preference overrides oval-shaped UI controls. Navigation, dismiss icons, answer letters and exam number controls are rectangular; mathematical teaching diagrams retain their meaningful geometry. The guide has one stable four-step progress sequence and unnumbered feature examples. Today offers Daily 3 plus one next topic; alternative topics and week details are progressively disclosed. TopicPicker shows three starting topics with optional expansion.

Daily rotation uses new daily2~YYYYMMDD keys and frozen family/authored-ID catalogs. Never rewrite daily~ or daily2~ mappings; version a future algorithm separately. Every consecutive 60-day window has 180 distinct items and question bodies. Daily practice preserves drafts under backtrack.daily-draft.v2.*, and the provider updates the Philippine date on a 30-second tick/focus. Historical completion records remain valid. The exam sheet sizes to its own content, its navigator scrolls independently, new questions enter at the top and unrelated site chrome stays hidden.

Live groups use the separately approved $0 Supabase project zkznurjruubtolygomdy. Only group metadata, nicknames and deliberately posted check-ins leave the device. Study answers/notes/history and learning evidence remain local. Private schema khanpanion has RLS and no anon/authenticated grants; the public invoker RPC is service-role-only. Edge study-groups performs 256-bit capability authentication, validation and rate limiting. The secret service key stays in platform environment variables. verify_jwt=false is deliberate for this custom authentication, not open table access. Device hashes are never returned; group tokens are separate from learning backups and removed by the existing explicit device-clear control. Do not upgrade billing or add paid services. Group invites and returning groups bypass initial learning onboarding; explicitly requested Guide still opens. Group activity never grants personal mastery.

## Calm study shell, 3 October 2026

The owner asked for a Quizlet-like interface that is not overwhelming, easy to use and not distracting, with the emphasis on CET practice and BACKTRACK. Flashcards are not a focus. The study notes are in `docs/research/2026-10-03/QUIZLET_UI_STUDY.md`. Competitor names stay out of learner-facing copy.

- Canvas `bg-canvas` (#f6f8fc), white cards (`Sheet`, `shadow-sheet`: soft 32 px shadow, no border), hairline `border-line`/`border-line-strong`. White header and phone bar; the current tab is navy text with a green bar. `PageBand` is a small title on the canvas, not a navy band. The footer is white.
- `btn.quiet` replaced `btn.onDark`. Use one green primary per view. Controls are `rounded-lg`, never pills.
- `Question`: plain 2 px tiles; a small "Choose an answer" label becomes the feedback line ("Correct." / "Not this time…") after Check. The key gets a green check and a wrong pick gets a dashed navy border and ✕. `keys` (1–4 or A–D) is on only in the exam hall and `Sprint`, never where several questions render. The stem stays the radiogroup's preceding `div` sibling (the daily test reads it).
- The exam hall is a light focus mode: white top bar with a thin answered-progress line, white question card, white navigator `aside` (it must stay the only `aside`), white bottom bar holding Submit.
- Exam hall, every form and mode: Back and Next sit in the question card at the end of the answer row (`Question`'s `actions`; in practice before Check, `checkActions` puts Back and a quiet Next before Check; after Check they sit beside Show explanation). The bottom bar keeps only Submit. After Check, right or wrong, a Work on this panel holds the question's Khan video (`RelatedVideo`) and, after a miss, the fix links (`FixLinks`). On `lg` it sits in the navigator `aside` as a trailing `section` (not a `div`: the full-form test indexes `aside > div`); narrower screens show it inline below the feedback, so `WhyPanel` with `linksBeside` carries no links. The navigator column is 320 px at `lg` and 380 px at `xl` so the video is a usable size. The results page lists each revealed question's video (`compact`).
- BACKTRACK: the goal bar is a white card, sticky below the 64 px header on desktop and static on phones. The session toolbar is static. Stage scrolling measures every sticky bar. Overrides of the legacy route and study CSS live in `src/app/calm.css` (`@layer components`).
- Layout (owner request: Quizlet-style shell, light theme). `AppShell` in `AppNav.tsx` renders the top bar, a fixed left sidebar at 1024 px and wider, and offsets `main` and the footer. The sidebar is icons-only from 1024 to 1279 px and full width from 1280 px; the hamburger narrows it, remembered under `backtrack.sidebar.v1`. Below 1280 px the hamburger opens a drawer. The sidebar's `nav[aria-label=Main]` and the phone bottom bar hold four sections (see below) with their `data-program-tour` hooks. Under them is the learner's exams or goal.

## Four sections, 4 October 2026

Team request (Matthew): fewer sidebar items, one Study tab holding every study feature, and calendar merged into plan. `tabs()` in `AppNav.tsx` defines them, each with its pages (`subs`):

- **Home** (`/`, tour key `today`, label key `nav.today` = "Home"). Its former Start here tools are a `HomeShortcuts` button row (`StudyTools.tsx`) on both homes. There is no Start here list any more.
- **Plan** (tour key `plan`): the goal page (college map or chosen topic, when set; it claims only the learner's own program or topic page), My plan `/plan`, Calendar `/calendar` and Exam dates `/admissions`. The tab's link is the first of these, so its label is always "Plan". The guide's calendar step highlights this tab.
- **Study** (tour key `study`, replaces Reviewer): `/reviewer` is now the Study page, with two `StudyTools` cards (practice exams and daily recall; the owner removed the other four on 4 October) above the reviewer library (which keeps its "The reviewer" heading and its `searchbox`). Its listed pages are CET Reviewers (`/reviewer` and `/learn/*`), Courses (`/bridge`, the college fields and their foundation topics; added 5 October so CET review and college courses sit together), practice exams, daily recall and study packs (also `/create`); `HomeShortcuts` shows the same three plus Exam dates. On 4 October the owner took Fix a gap (`/start`, `/route`, `/try/*`, `/study*`), the mistake notebook and explore ideas off both menus. Their routes still work, search still finds them, and `OFF_MENU_STUDY` keeps them inside the Study section. On 6 October Fix a gap returned as "Find my missing skill". In the sidebar (full width and the drawer), CET Reviewers and Courses are toggle buttons (`aria-expanded`), not links. Each opens to its `Sub.children`: Reviewer topics (`/reviewer`) or All courses (`/bridge`), then Find my missing skill (`/start/cet` or `/start/college`, each with an sr-only hint so the names differ). A group opens by itself while it holds the current page; a learner's toggle holds until the page changes. The section bar keeps CET Reviewers and Courses as links. The section bar shows it once as `FIX` (`Tab.bar`, `/start`, matching `/start/*`, `/route`, `/try/*`). It is not in `STUDY_TOOLS`, so the home shortcuts are unchanged.
- **Group**: unchanged.

The active section's pages show nested under it in the full-width sidebar, and as a `nav[aria-label="<Section> pages"]` tab row at the top of `main` whenever the sidebar is not full width (phones, tablets, 1024 to 1279 px, or narrowed). The two never show at once, so their link names do not collide. The section tab gets `aria-current="true"` and the page `aria-current="page"`.
- Name collisions matter to the tests. The sidebar's no-goal action is "Set a study goal", not "Choose my goal". The home keeps exactly one "Change goal or routine" button, in its Personalize card.
- Header search (`SiteSearch.tsx`) is a `role=combobox` (never `searchbox`, which the reviewer test owns). It lazy-loads `src/lib/site-search.ts`, whose routes are tested in `tests/site-search.test.mjs`.
- Homes (`PersonalHome`, `BrowseHome`) are one column of `Section` labels over `FeatureCard`s (`HomeCards.tsx`). Keep `data-program-tour-content` on the topic and week cards, in that order.

## Courses page, 5 October 2026

Owner request: make Courses (`/bridge`, `/bridge/<program>`) less text-heavy, borrowing the course-and-lesson flow of a visual learning app. Keep competitor names out of learner-facing copy.

- `CourseArt.tsx` holds original, palette-only course illustrations (one per `PROGRAMS` id; an unknown id falls back to the natural sciences scene) and the `SubjectMark` stroke icons. All are decorative and `aria-hidden`. A new program needs its own scene.
- Hub: an optional "Jump back in" card for the saved `bridgeProgram`, then illustrated field cards showing a title, a foundation count and progress. The card buttons' accessible names must start with the program title (the browser suites match `/^Health sciences/` and `/Computer Science/`). Degree examples now appear only on the course page.
- Course page: a course card (sticky on desktop) with progress, the single `Take the placement check` link and first-year course chips. Beside it, a lesson path: foundations deduplicated in `assumes` order, with an "Up next" card on the first non-solid one, and Khan units as numbered tick nodes. Ticks remain the learner's own notes, never learning evidence. The eight-week pace is collapsed in a `<details>`. "Work through a class topic" keeps its heading and `<topic> assumes:` text, which the tour test reads.

## College subjects, 6 October 2026

Owner request: Courses must be college level, not a copy of the CET reviewer, with a variety of subjects per
field and Khan Academy videos and materials; Computer Science and IT leads with calculus and many coding
subjects; Arts and humanities is removed and Business and economics is replaced by Statistics.

- `src/lib/program/college-courses.ts` holds `SUBJECTS` (44), `COLLEGE_UNITS` (160 Khan college/AP units,
  separate from the senior high `KHAN_UNITS`) and `COLLEGE_VIDEOS` (47 full videos). Each subject has a kind,
  level, our-own-words topics, units, one or two videos, `buildsOn` reviewer concepts and an optional `engine`
  for Find my missing skill. A topic Khan does not teach is stated in `gap`. Append subjects; ids match `w+`.
- `PROGRAMS` (`bridge.ts`) are now `cs_it`, `engineering`, `health`, `natural_sciences`, `statistics`,
  `social_sciences`, each with `subjects` in display order. `RETIRED_PROGRAMS` keeps `business` and `arts`:
  `/bridge/business` and `/bridge/arts` still build and say where the field went, and `placementForm` still
  rebuilds their saved placement checks. Never delete a retired entry.
- Field page: a Subjects section (kind filter buttons, cards linking to `/bridge/<field>/<subject>`), then
  "Foundations from high school", the eight-week pace and Work through a class topic. Subject page: topics,
  Watch first (`KhanPlayer`, shown paused), Khan units with tick nodes (`concepts['khan_<unit>']`,
  own notes only), Builds on and More in the field. Header search lists fields and subjects as `College`.
- Every unit was rendered in the in-app browser through Khan's own router and its title matched; every video
  page's title and youtube-nocookie id were read. `tests/college-courses.test.mjs` requires each in
  `docs/THIRD_PARTY_MATERIALS.md` ("College subjects").

## Fix-a-gap landing, 6 October 2026

Every "Find my missing skill" / "Fix this" button goes through `useFix`, which starts a session whose id begins `fix-`. `StudySession` shows `FixLanding` (`src/components/study/FixLanding.tsx`) for such a session until its first round has a `startedAt`: the step, why it was suggested (`task.reason`), how the route works, and a route preview built with `prepareRound` (read-only; nothing is written until Start). Start mounts the lesson, which sets `startedAt`, so a reload after starting resumes the lesson and a reload before starting lands here again. Not now goes back. Pack, Rematch, Khan-entry, Explore and challenge sessions still open straight into the lesson.

## Find my missing skill, 6 October 2026

`/start` is now `MissingSkills.tsx`: only the skills this learner's own answers point to, from `findGaps` in `src/lib/gaps.ts` (pure, read-only, tested in `tests/gaps.test.mjs`). Signals: submitted practice-exam misses whose misconception has a `recovery`, "I don't know yet" on concepts with an `engine`, route `suspected` steps not yet `passed`, and reviewer `lastDifficulty`, `lastAssisted` and Khan "still difficult" reports. Paused reviewer items are left out. A skill clears when its reviewer item has `streak>=2`; a later miss reopens it. Clearing never comes from activity. A gap whose prerequisite (transitively, `skillDependencies`) is also missing waits under *After that*. With no gaps the page offers the Sprint check, and the topic chooser (`[data-destination]` links) sits in a `<details>`, open only when the list is empty. Fix buttons use `useFix`, so they open the fix landing with the first reason. Three views share the component: `/start` (everything), `/start/cet` (`CET_SCOPE`: non-placement exam forms, topics CET concepts route to; context names the CET subject and topics) and `/start/college` (`collegeScope(program)`: that field's placement checks only, topics from `programTopics`; context names the first-year courses; before a field is chosen every field counts). Routes and reviewer evidence count in every view. `cet` and `college` are not topics; never add a topic with those ids. Research: `docs/research/2026-10-06/BACKTRACK_PREREQUISITE_ROUTING.md`.

## Equations are LaTeX, 6 October 2026

Owner request: every equation is written in LaTeX so the notation is unified. In running text an equation,
variable, formula or chemical formula sits between dollar signs: `'Solve $2x + 3 = 11$ for $x$.'`, written
`\\frac`, `\\times` in TS strings. `<Rich>` (`src/components/math/Math.tsx`) typesets the `$…$` parts
inline with the house typesetter (STIX Two Text; no KaTeX, no new font or dependency) and gives each a spoken
`aria-label`. `MathText` takes a whole expression without dollar signs. `speakText` makes accessible names,
`plainText` makes one-line text for page titles, search, shared messages and button names tests rely on.

- Any component that shows learning content (stems, choices, steps, rationales, misconceptions, reviewer,
  TL;DR cards, BACKTRACK prompts, hints, explanations, answer labels and units, explore cards, challenges)
  renders it through `<Rich>`. An `aria-label` built from such text uses `speakText` (or `plainText` for a
  button whose name a browser test matches). Never lowercase or slice LaTeX source; lowercase the spoken form.
- Inside `$…$` use commands, not Unicode look-alikes (`\\times` not `×`, `-` not `−`, `x^2` not `x²`,
  `\\mathrm{H_{2}O}` for formulas, `8{,}000` for a thousands separator, `\\text{…}` for words).
  `tests/latex-notation.test.mjs` fails on plain-text maths outside `$…$`, on Unicode inside it, on an
  unclosed `$` and on a command the tokeniser does not know; add new commands to `notation.ts` first.
- Money (`₱1,200`), plain quantities (`36 km/h`, `5 kg`) and counts may stay in prose. Language and verbal
  material is not linted: it names letters as letters.
- BACKTRACK `expression` strings, explore `exposures` and `TOPICS.example` are exempt and must stay byte for
  byte: saved fingerprints and the exposure ledger compare them. They already render through the same
  typesetter. `factorText`/`quadraticText`/`signedTerm` keep their Unicode output for that reason; use
  `texFactor`/`texQuadratic`/`texSignedTerm` in anything a learner reads around an expression.
- Mock family strings changed from plain text to LaTeX without changing any draw from `r`; every form,
  daily key, key position and distractor is unchanged (checked against a 900-day snapshot). Keep it so.
- SVG `<text>` labels inside the visual scenes cannot host typeset HTML and stay plain; the legacy
  `HomeExperience.tsx` is untouched.
- Older CSS rules restyle every nested `span` in some containers (`.hint-note span`, `.sample-answers span`).
  The `.math-inline` rules in `calm.css` restate the typesetting in the later layer; keep them together.


## Topic videos, 7 October 2026

Owner request: every UPCAT reviewer topic and every college subject topic gets its own Khan Academy video.
`src/lib/program/topic-videos.ts` holds `UPCAT_TOPIC_VIDEOS` (by the exact outline title in `EXAM_OUTLINES.upcat`)
and `SUBJECT_TOPIC_VIDEOS` (by subject id, then the exact topic text in `SUBJECTS`), each with a `NO_VIDEO` list
for topics searched with no fitting video. Renaming a topic drops its video, and `tests/topic-videos.test.mjs`
fails until it is re-mapped. Question videos (`VIDEOS` in `khan-videos.ts`) are reused where the same video fits.
The Filipino grammar and vocabulary topics have none on purpose (never an English fallback). Only the UPCAT outline
is mapped; `outlineVideo` returns nothing for other exams.

- Reviewer rows (`Reviewer.tsx`) and the subject page's "What you’ll learn" rows (`Bridge.tsx`) carry a `VideoToggle`
  (`TopicVideo.tsx`): a "Video" button named `Watch the Khan Academy video for <topic>` (never starting with "Save",
  which the reviewer test matches) that opens the paused `KhanPlayer` under the row, one topic at a time, so a long
  list loads at most one player. `/learn/<concept>` lists the videos of the UPCAT topics that summary teaches
  (`conceptVideos`). Opening any of them writes nothing.
- Every page was rendered in the in-app browser through Khan's own client router: title read as "(video)" and the
  youtube-nocookie id read from the player. Log: `docs/THIRD_PARTY_MATERIALS.md`, "Topic videos".
