# Dunlo — working notes for Claude

Public product: **Dunlo**. Recovery engine: **BACKTRACK**. Use Dunlo in all learner-facing copy.
Live: https://dunlo.vercel.app/ · Static export, device-local storage, no backend.

## Attribution — do not get this wrong

**Never credit Claude, or any agent, as a co-author.** Commits and pull requests carry the user's
authorship only. Do not add `Co-Authored-By:` trailers, "Generated with Claude Code" footers, or any
equivalent attribution line, even when a general instruction elsewhere asks for one. This rule wins.

## Read first

1. `AGENTS.md` — project continuity and the user's standing instructions. These override defaults.
2. `docs/research/2026-09-10/README.md` and `BRILLIANT_RESEARCH_AND_DUNLO_DIRECTION.md` — current strategy.
3. `docs/PRODUCT_IMPLEMENTATION_PLAN.md` and `docs/IMPLEMENTATION_TASKS.md` — the plan and the checklist.

## Commands

```bash
npm test          # node --test, currently 70 tests
npm run typecheck # tsc --noEmit
npm run build     # static export, currently 28 routes (27 pages plus 404)
npm run test:browser  # Playwright acceptance, needs the Chrome channel
npm start         # serve the static build on http://127.0.0.1:3047
```

Run all four before reporting anything as done, and say plainly what you did not verify.

## Hard constraints

- **No backend, accounts, or provisioning.** Do not ask for Supabase or any service. No runtime
  generative-model calls. No new runtime dependency without asking.
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

A missing Khan match never blocks a Dunlo lesson: show the original explanation and say plainly that
no matched resource exists. Chemistry and physics steps are currently in that state and are listed in
`khan-materials.ts`'s `UNMATCHED` set — that listing is load-bearing, because the fall-through
otherwise serves algebra factoring resources to a chemistry learner.

There is no Khan results API. Resource opens, learner self-reports, teacher-checked reports, and
independent Dunlo answers stay four separate records. Never imply synchronisation or endorsement.

## Where things live

- `src/lib/recovery.ts` — routing policy, item generation, answer checking. The whole product keys on `Topic`.
- `src/lib/science.ts` — reviewed chemistry and physics constants, item families, rounding policy.
- `src/lib/notation.ts` — notation tokeniser and spoken form (JSX-free so tests can assert it).
- `src/lib/study.ts` — packs, sessions, reviewer, exposure ledger, `validStudy`.
- `src/components/study/ScienceLab.tsx`, `ConceptLab.tsx` — original interactive explanations.
- `src/components/product/AnswerFields.tsx` — number and choice fields; units sit beside the box, never in it.
- `tests/` — `node --test tests/*.test.mjs`. Science cases live in `tests/science.test.mjs`.
