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
npm test          # node --test, currently 138 tests
npm run typecheck # tsc --noEmit
npm run build     # static export, currently 104 generated pages (including 404)
npm run test:browser  # Playwright acceptance, needs the Chrome channel
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

## Where things live

- src/lib/mock: deterministic forms, item families, original banks, scoring and analysis. blueprint.ts is the practice configuration.
- src/lib/program: device-local program state, planner, calendar, bridge maps, concepts, recall and verified resource facts.
- src/content: original mock text, reviewer chapters and handbooks; question content remains draft pending review.
- src/components/k: college program routes, shared navy/paper/oval UI, exam hall, results, reviewer and bridge.
- scripts/test-program-browser.mjs: new program journeys invoked by the existing browser suite.
- src/components/k/ProgramTourProvider.tsx and ProgramTour.tsx: optional lazy walkthrough, focus/inert management and current-navigation highlights.
- scripts/test-program-tour.mjs: tour keyboard, replay, context and small-screen checks.

- `src/lib/program/exam-coverage.ts` — each CET's own sections in its own words, the reviewer material serving each (none for sections like Mental Ability), and whether the list is official, team-supplied or reported. Sources in `docs/research/2026-10-04/CET_COVERAGE.md`. Never relabel another exam with the UPCAT subtests. `EXAM_IDS` in `admissions.ts` is the only exam list (saves validate against it); append new exams. The reviewer library is a numbered list of the chosen exam's sections, closed until one is opened (`<details name="reviewer-section">`, one open at a time). Each opens to its topics: the exam outline's sub-subjects where `EXAM_OUTLINES` has one, else that section's summary rows. Full chapters are not listed; they open from each topic page (`LearnConcept`). Sections without material show "No material yet" and saved items gather in a final Saved section. A search replaces the list with flat summary results from the whole exam; the reviewer browser test relies on that. There are no Save buttons: the circle beside each topic is the save toggle (`aria-pressed`, named `Save <title>`, filled when saved). Outline topics save under their own `topicKey` (`outline:<exam>:<slug>`), never the summary id, because several topics share one summary; saving by summary id made one click fill several circles. The "Reviewing for" picker has no All CETs option; it opens on the learner's first named exam, else the first of `EXAM_IDS`. `examTopics` gives the plan's and home's topic list (`ReviewTopics`) the same sections for the learner's first named exam (`firstExam`).
- `src/lib/program/exam-outline.ts` — per-exam sub-subjects and topics (UPCAT only so far), following what established review books and sites agree the exam covers, in our own words; providers' names stay off the site. Each topic lists the summaries that teach it; one without stays greyed as "Not written yet". Section names must match `EXAM_COVERAGE`, and every summary in the exam's coverage must appear (`tests/exam-outline.test.mjs`). Sources in `docs/research/2026-10-05/UPCAT_TOPIC_OUTLINE.md`. Do not rebuild it from the DepEd curriculum guides; the owner found them too broad.
- `src/lib/recovery.ts` — routing policy, item generation, answer checking. The whole product keys on `Topic`.
- `src/lib/science.ts` — reviewed chemistry and physics constants, item families, rounding policy.
- `src/lib/notation.ts` — notation tokeniser and spoken form (JSX-free so tests can assert it).
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

Entry behavior: the intent picker appears automatically on the first normal page in a browser-tab session. I’m just browsing continues a guide and subject browser without requiring a routine or questions. It is a session-only choice; saved preferences and learning records stay intact. A saved goal can be continued with one click. Refresh and normal navigation do not repeatedly interrupt the same visit. Timed/print and explicitly requested legacy-tour entries remain focused. Guide stays visible in the header and /?guide=1 opens it directly.

Quality-of-life follow-up: keep one current Guide action in the header. Browsing home has Choose my goal; Me has a direct Change goal or routine menu action. The picker uses compact intent icons, a white header and one dismiss control. College degree groups are explained with examples and a general/unsure option. CETPreferences is optional under the existing save, supports general review and up to 12 named/custom targets with separate optional dates; the schedule runs through the last target. No exam-specific bank is implied. PersonalPlan guards the legacy #pledge link for browsing and configured paths. Browsing a college map does not replace a different chosen goal or its stored field. Saved CET preferences survive switching to college/topic. Keep phone grid sheets min-w-0 so their locally scrolling week controls cannot widen the page.

October 1 refinement: the owner's latest preference overrides oval-shaped UI controls. Navigation, dismiss icons, answer letters and exam number controls are rectangular; mathematical teaching diagrams retain their meaningful geometry. The guide has one stable four-step progress sequence and unnumbered feature examples. Today offers Daily 3 plus one next topic; alternative topics and week details are progressively disclosed. TopicPicker shows three starting topics with optional expansion.

Daily rotation uses new daily2~YYYYMMDD keys and frozen family/authored-ID catalogs. Never rewrite daily~ or daily2~ mappings; version a future algorithm separately. Every consecutive 60-day window has 180 distinct items and question bodies. Daily practice preserves drafts under backtrack.daily-draft.v2.*, and the provider updates the Philippine date on a 30-second tick/focus. Historical completion records remain valid. The exam sheet sizes to its own content, its navigator scrolls independently, new questions enter at the top and unrelated site chrome stays hidden.

Live groups use the separately approved $0 Supabase project zkznurjruubtolygomdy. Only group metadata, nicknames and deliberately posted check-ins leave the device. Study answers/notes/history and learning evidence remain local. Private schema khanpanion has RLS and no anon/authenticated grants; the public invoker RPC is service-role-only. Edge study-groups performs 256-bit capability authentication, validation and rate limiting. The secret service key stays in platform environment variables. verify_jwt=false is deliberate for this custom authentication, not open table access. Device hashes are never returned; group tokens are separate from learning backups and removed by the existing explicit device-clear control. Do not upgrade billing or add paid services. Group invites and returning groups bypass initial learning onboarding; explicitly requested Guide still opens. Group activity never grants personal mastery.

## Calm study shell, 3 October 2026

The owner asked for a Quizlet-like interface that is not overwhelming, easy to use and not distracting, with the emphasis on CET practice and BACKTRACK. Flashcards are not a focus. The study notes are in `docs/research/2026-10-03/QUIZLET_UI_STUDY.md`. Competitor names stay out of learner-facing copy.

- Canvas `bg-canvas` (#f6f8fc), white cards (`Sheet`, `shadow-sheet`: soft 32 px shadow, no border), hairline `border-line`/`border-line-strong`. White header and phone bar; the current tab is navy text with a green bar. `PageBand` is a small title on the canvas, not a navy band. The footer is white.
- `btn.quiet` replaced `btn.onDark`. Use one green primary per view. Controls are `rounded-lg`, never pills.
- `Question`: plain 2 px tiles; a small "Choose an answer" label becomes the feedback line ("Correct." / "Not this time…") after Check. The key gets a green check and a wrong pick gets a dashed navy border and ✕. `keys` (1–4 or A–D) is on only in the exam hall and `Sprint`, never where several questions render. The stem stays the radiogroup's preceding `div` sibling (the daily test reads it).
- The exam hall is a light focus mode: white top bar with a thin answered-progress line, white question card, white navigator `aside` (it must stay the only `aside`), white bottom bar.
- BACKTRACK: the goal bar is a white card, sticky below the 64 px header on desktop and static on phones. The session toolbar is static. Stage scrolling measures every sticky bar. Overrides of the legacy route and study CSS live in `src/app/calm.css` (`@layer components`).
- Layout (owner request: Quizlet-style shell, light theme). `AppShell` in `AppNav.tsx` renders the top bar, a fixed left sidebar at 1024 px and wider, and offsets `main` and the footer. The sidebar is icons-only from 1024 to 1279 px and full width from 1280 px; the hamburger narrows it, remembered under `backtrack.sidebar.v1`. Below 1280 px the hamburger opens a drawer. The sidebar's `nav[aria-label=Main]` and the phone bottom bar hold four sections (see below) with their `data-program-tour` hooks. Under them is the learner's exams or goal.

## Four sections, 4 October 2026

Team request (Matthew): fewer sidebar items, one Study tab holding every study feature, and calendar merged into plan. `tabs()` in `AppNav.tsx` defines them, each with its pages (`subs`):

- **Home** (`/`, tour key `today`, label key `nav.today` = "Home"). Its former Start here tools are a `HomeShortcuts` button row (`StudyTools.tsx`) on both homes. There is no Start here list any more.
- **Plan** (tour key `plan`): the goal page (college map or chosen topic, when set), My plan `/plan`, Calendar `/calendar` and Exam dates `/admissions`. The tab's link is the first of these, so its label is always "Plan". The guide's calendar step highlights this tab.
- **Study** (tour key `study`, replaces Reviewer): `/reviewer` is now the Study page, with two `StudyTools` cards (practice exams and daily recall; the owner removed the other four on 4 October) above the reviewer library (which keeps its "The reviewer" heading and its `searchbox`). Its listed pages are the reviewer (and `/learn/*`), practice exams, daily recall and study packs (also `/create`); `HomeShortcuts` shows the same three plus Exam dates. On 4 October the owner took Fix a gap (`/start`, `/route`, `/try/*`, `/study*`), the mistake notebook and explore ideas off both menus. Their routes still work, search still finds them, and `OFF_MENU_STUDY` keeps them inside the Study section.
- **Group**: unchanged.

The active section's pages show nested under it in the full-width sidebar, and as a `nav[aria-label="<Section> pages"]` tab row at the top of `main` whenever the sidebar is not full width (phones, tablets, 1024 to 1279 px, or narrowed). The two never show at once, so their link names do not collide. The section tab gets `aria-current="true"` and the page `aria-current="page"`.
- Name collisions matter to the tests. The sidebar's no-goal action is "Set a study goal", not "Choose my goal". The home keeps exactly one "Change goal or routine" button, in its Personalize card.
- Header search (`SiteSearch.tsx`) is a `role=combobox` (never `searchbox`, which the reviewer test owns). It lazy-loads `src/lib/site-search.ts`, whose routes are tested in `tests/site-search.test.mjs`.
- Homes (`PersonalHome`, `BrowseHome`) are one column of `Section` labels over `FeatureCard`s (`HomeCards.tsx`). Keep `data-program-tour-content` on the topic and week cards, in that order.
