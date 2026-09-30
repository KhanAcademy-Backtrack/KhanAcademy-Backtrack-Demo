# Khanpanion

Khanpanion is a free college study program with two sides: entrance exam review and a freshman bridge. It is a static Next.js export with device-local progress, no accounts, no backend and no runtime generative-model calls.

Live: https://khanpanion.vercel.app/ . The Vercel project remains dunlo; main is the production branch and the older dunlo.vercel.app alias is retained.

## College program

A fresh device opens a three-question sprint. A study pledge sets a personal target date, study days and minutes. Returning learners see a countdown and a daily mission, then their weekly rhythm, next mock and Daily 3. The plan connects concept summaries, checked Khan Academy Philippine curriculum units and optional independent skill repair.

The mock hub offers sprints, sections, full simulations, topic and placement checks, and printable booklets. Answers save immediately, elapsed time saves every eight seconds and on pagehide, and reload resumes the same section and question. Pauses and section breaks are excluded from active time. Going overtime keeps the questions available and is reported on results. The answer key can be hidden; Fix this opens a seeded skill session that still requires two fresh unassisted answers.

The reviewer includes original chapters, concept summaries and handbooks. Save chapters or recall cards, search the library, practise and print. Daily recall reads saved chapter cards, concepts marked Still hard and mock misses; recall self-reports affect spacing only. Offline caching is reserved for Phase B and is not advertised as delivered.

The bridge maps first-year prerequisites for seven program groups, with placement checks, Khan unit paths, a summer schedule and topic rescue. These maps await faculty review. Group check-ins are shared manually through local cards or links; no synchronized roster or results are claimed.

Official calendar dates are checked against primary pages. UPCAT 2027 refers to the test held August 1 and 2, 2026 for AY 2027-2028. Unconfirmed future UPCAT, DCAT and PUPCET dates are not prefilled. A learner may enter a planning target in the pledge. DOST-SEI qualifying dates November 14 and 15, 2026 are linked to its official scholarship portal. See docs/THIRD_PARTY_MATERIALS.md.

Every earlier route remains available, including /demo, /study, /study/session, /packs, /review, /explore, /khan and all recovery entry routes. Existing deterministic question mappings and saved study evidence retain their meaning.

## Verification

Run npm test, npm run typecheck, npm run build and npm run test:browser before release. Browser acceptance covers both 375 and 1280 px, calendar at 320 px, resume and pause timing, result-key visibility and repair, placement, calendar editing and .ics export, reviewer practice/print/recall, every concept/chapter/bridge page, and Messenger user-agent emulation. Screenshots and test receipts stay in the ignored .refs directory.

The navy frame, paper sheets and answer-sheet ovals use Tailwind utilities. Plus Jakarta Sans and STIX Two Text are the two font families. Motion uses src/lib/motion-tokens.ts, with static quiet and reduced-motion paths. No runtime dependencies were added for the college program routing release.

## Run locally

Use Node 24 or later for the built-in TypeScript test runner.

- npm install
- npm run dev (development)
- npm test (mathematics and routing checks)
- npm run typecheck
- npm run build (static export into out)
- npm start (production preview at http://127.0.0.1:3047)

## Where things live

- src/lib/recovery.ts: deterministic routing and fresh question generation.
- src/lib/science.ts: the reviewed chemistry and physics constants, item families, and the single rounding policy.
- src/lib/notation.ts: the notation tokeniser and spoken form, including chemical subscripts and units.
- src/components/study/ScienceLab.tsx: the original chemistry and physics interactive explanations.
- src/lib/khan-materials.ts and curriculum.ts: matched Khan resources.
- src/lib/route-geometry.ts: preserved route interpolation utilities.
- src/components/product: focused learning interface, route, Khan player, and topic entry.
- src/app: public routes and optional supporting pages.
- tests: generated mathematics, animation geometry, focused video segments, guided-question exposure across reloads, and routing checks including generated mathematics, evidence boundaries, deeper checks, session blocks, comeback, and local-storage validation. tests/science.test.mjs independently recomputes every chemistry and physics answer, checks that each generated equation balances, and asserts that an earlier saved study space still loads unchanged.
- docs/SUBMISSION_CHECKLIST.md: the submission package entry point.
- output/submission: final submission PDF, editable Canva export, copy-paste project answers and short instructions.
- output/pdf: seven individual answer PDFs and finished supporting documents.
- output/submission/Khanpanion_KEIC_2026_Editable.pptx: current editable Canva backup.
Earlier standalone backups are historical; use output/submission for the current deck.

## Evidence boundaries

The interactive build demonstrates software behavior. The public launch, evaluation, budget and continuation plan describe future implementation. Resource opens, self-reported practice, and BACKTRACK answers are separate records. The optional evidence pages and documents explain the evaluation design.

The public interface stores device-local progress, not a school record. Initial page loading and Khan material require connectivity. Shared-device controls clear a destination's saved route. The video player includes an original-Khan fallback for networks or embedded browsers that block playback.

## Deployment

The existing Vercel project is now named dunlo. Its GitHub integration is connected to this repository. The public address is https://khanpanion.vercel.app/. The earlier https://dunlo.vercel.app/ address stays attached as a legacy alias.

Production follows main.

## Artifact rebuilding

The native Canva deck is authoritative. Its collaboration link is in the private Drive package. Edit there and export the current PDF and PPTX; do not replace it with an earlier import. Run scripts/sanitize-exports.py on the exported PDF and PPTX to remove Canva origin identifiers from distributable metadata while preserving page and slide content.

scripts/build-submission.mjs validates the seven word counts and writes the combined copy. After a Canva export, scripts/sync-deck-copy.py refreshes the slide script from the current PDF. scripts/build-pdfs.py rebuilds the answer and supporting PDFs while preserving the Canva deck; use --only followed by document stems to rebuild selected support files. scripts/embed-fonts.py accepts the source PPTX, output PPTX, and optional family name (DM Sans for the current export). Font preparation and licenses accompany the source package.

The older local deck builder remains available through scripts/build-deck.mjs --build-backup. It creates a versioned backup and cannot overwrite the current Canva exports. The slide-script builder similarly requires --from-backup. These commands are separate from the website build.

Khan materials and logo attribution: docs/THIRD_PARTY_MATERIALS.md.
