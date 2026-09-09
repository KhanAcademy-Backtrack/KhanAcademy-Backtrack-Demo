# BACKTRACK

A new route to the lesson you need now.

Live product: https://backtrack-learning.vercel.app/

Earlier comparison site: https://backtrack-five.vercel.app/

## The product

A learner chooses a destination and a manageable study block. Their answers determine which earlier step to check, what can leave the route, and when to use a matched Khan resource. Two fresh unassisted checks support each route decision. Progress stays in the browser.

Two destination families are available: equations with brackets and quadratics by factoring. The route can insert a deeper prerequisite, remove demonstrated review, pause, and recheck after a return. Official Khan videos are embedded, with links to the original lessons and exercises. No live Khan-results API, learner account server, or generative-model call is assumed.

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
- tests/recovery.test.mjs: fourteen tests including generated mathematics, evidence boundaries, deeper checks, session blocks, comeback, and local-storage validation.
- docs/SUBMISSION_CHECKLIST.md: the submission package entry point.
- output/pdf: the 15-page deck, seven individual answer PDFs, and supporting documents.
- output/BACKTRACK_KEIC_2026.pptx: editable deck.

## Evidence boundaries

The interactive build demonstrates software behavior. The school implementation, learning outcomes, costs, and continuation model are proposals to test. Resource opens, self-reported practice, and BACKTRACK answers are separate records. The optional evidence pages and documents explain the evaluation design.

The public interface stores device-local progress, not a school record. Initial page loading and Khan material require connectivity. Shared-device controls clear a destination's saved route. The video player includes an original-Khan fallback for networks or embedded browsers that block playback.

## Deployment

The separate Vercel project is backtrack-learning. Its GitHub integration is connected to this repository. The original backtrack project was verified to have no Git connection and remains a comparison deployment.

The overhaul was developed on HarryDaks. Matthew later explicitly authorized pushing it to main as well. No force push or paid upgrade is required.

## Artifact rebuilding

scripts/build-submission.mjs validates the seven word counts and writes the combined copy. The presentation and PDF builders use the bundled Codex artifact runtime, with fonts prepared from the website build. Final deck links come from docs/deployment.json. They are not intended to run as part of the website build.

Khan materials and logo attribution: docs/THIRD_PARTY_MATERIALS.md.
