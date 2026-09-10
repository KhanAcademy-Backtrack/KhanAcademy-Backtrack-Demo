# BACKTRACK

Stuck on today’s lesson, but unsure what to review? BACKTRACK finds a useful earlier step, connects it to Khan material, and checks the return.

Live product: https://backtrack-learning.vercel.app/

Earlier comparison site: https://backtrack-five.vercel.app/

## The product

A learner chooses a destination and a manageable study block. Their answers determine which earlier step to check, what can leave the route, and when to use a matched Khan resource. Common wrong-turn clues can choose a more useful starting check. For example, a matching factor pair entered as positive roots leads to a signs-and-solutions check. Two fresh unassisted checks support each route decision. Progress stays in the browser.

Five sample destinations are available: quadratics, equations with brackets, fractions, ratios, and linear graphs. The route can insert a deeper prerequisite, remove demonstrated review, pause, and recheck after a return. Short guided repairs and practice stay inside BACKTRACK. Official Khan videos are embedded, with four caption-verified focused segments and controls to continue watching. Original Khan exercises are optional links. No live Khan-results API, learner account server, or generative-model call is assumed.

The `/demo` page opens a fresh interactive sample with two example mistakes and a Replay control. It does not overwrite the learner’s saved routes.

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
- src/lib/khan-materials.ts and curriculum.ts: matched Khan resources.
- src/lib/route-geometry.ts: preserved route interpolation utilities.
- src/components/product: focused learning interface, route, Khan player, and topic entry.
- src/app: public routes and optional supporting pages.
- tests: generated mathematics, animation geometry, focused video segments, guided-question exposure across reloads, and routing checks including generated mathematics, evidence boundaries, deeper checks, session blocks, comeback, and local-storage validation.
- docs/SUBMISSION_CHECKLIST.md: the submission package entry point.
- output/pdf: the 15-page deck, seven individual answer PDFs, and supporting documents.
- output/BACKTRACK_KEIC_2026.pptx: current Canva export as an editable backup.
- output/BACKTRACK_KEIC_2026_Embedded.pptx: the same backup with embedded DM Sans regular and bold.

## Evidence boundaries

The interactive build demonstrates software behavior. The school implementation, learning outcomes, costs, and continuation model are proposals to test. Resource opens, self-reported practice, and BACKTRACK answers are separate records. The optional evidence pages and documents explain the evaluation design.

The public interface stores device-local progress, not a school record. Initial page loading and Khan material require connectivity. Shared-device controls clear a destination's saved route. The video player includes an original-Khan fallback for networks or embedded browsers that block playback.

## Deployment

The separate Vercel project is backtrack-learning. Its GitHub integration is connected to this repository. The original backtrack project was verified to have no Git connection and remains a comparison deployment.

Production follows main.

## Artifact rebuilding

The native Canva deck is authoritative. Its collaboration link is in the private Drive package. Edit there and export the current PDF and PPTX; do not replace it with an earlier import. Run scripts/sanitize-exports.py on the exported PDF and PPTX to remove Canva origin identifiers from distributable metadata while preserving page and slide content.

scripts/build-submission.mjs validates the seven word counts and writes the combined copy. After a Canva export, scripts/sync-deck-copy.py refreshes the slide script from the current PDF. scripts/build-pdfs.py rebuilds the answer and supporting PDFs while preserving the Canva deck; use --only followed by document stems to rebuild selected support files. scripts/embed-fonts.py accepts the source PPTX, output PPTX, and optional family name (DM Sans for the current export). Font preparation and licenses accompany the source package.

The older local deck builder remains available through scripts/build-deck.mjs --build-backup. It creates a versioned backup and cannot overwrite the current Canva exports. The slide-script builder similarly requires --from-backup. These commands are separate from the website build.

Khan materials and logo attribution: docs/THIRD_PARTY_MATERIALS.md.
