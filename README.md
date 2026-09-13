# Dunlo

Explore playable ideas and focused Khan Academy lessons, continue into relevant practice, and return for a fresh question. Dunlo is a free independent learning project. The broader study companion and recovery engine remain available.

Live product: https://dunlo.vercel.app/

The expanded site includes Today planning, finite sessions, quiz rehearsal, scheduled review, curated/custom packs, note cards with PDF/TXT/Markdown import, shared scope links, same-screen co-op, a bookmark companion and teacher activity sheets. Supported Khan entry, focused video segments, saved returns and independent checks connect the experience. Progress, restore and recovery backups work locally.

Explore: https://dunlo.vercel.app/explore

The September 13 discovery release adds six original interactive ideas and four reviewed Khan segments, with saved interests, direct item links and a preserved Khan return. The same native Canva design now has the final 15-slide submission story, opening with “You watched it. Can you use it?”. The main QR and call to action open the homepage. See docs/DISCOVERY_EXECUTION_PLAN_2026_09_13.md for the release scope.

## The product

A learner chooses a destination and a manageable study block. Their answers determine which earlier step to check, what can leave the route, and when to use a matched Khan resource. Common wrong-turn clues can choose a more useful starting check. For example, a matching factor pair entered as positive roots leads to a signs-and-solutions check. Two fresh unassisted checks support each route decision. Progress stays in the browser.

Nine destinations are available across three subjects. Mathematics: quadratics, equations with brackets, fractions, ratios, and linear graphs. Chemistry: moles and mass, and balancing equations. Physics: motion and speed, and forces and acceleration. Science routes descend into the mathematics already supported here — a failed `F = ma` question can reach the substitution and multiplication skills and their matched Khan practice.

The route can insert a deeper prerequisite, remove demonstrated review, pause, and recheck after a return. Short guided repairs, original interactive explanations, and practice stay inside Dunlo. Official Khan videos are embedded, with four caption-verified focused segments and controls to continue watching. Original Khan exercises are optional links. The chemistry and physics steps have no hand-verified Khan match yet, and the interface says so plainly rather than substituting an unrelated resource. No live Khan-results API, learner account server, or generative-model call is assumed.

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
- output/submission/Dunlo_KEIC_2026_Editable.pptx: current editable Canva backup.
Earlier standalone backups are historical; use output/submission for the current deck.

## Evidence boundaries

The interactive build demonstrates software behavior. The public launch, evaluation, budget and continuation plan describe future implementation. Resource opens, self-reported practice, and BACKTRACK answers are separate records. The optional evidence pages and documents explain the evaluation design.

The public interface stores device-local progress, not a school record. Initial page loading and Khan material require connectivity. Shared-device controls clear a destination's saved route. The video player includes an original-Khan fallback for networks or embedded browsers that block playback.

## Deployment

The existing Vercel project is now named dunlo. Its GitHub integration is connected to this repository. The public address is https://dunlo.vercel.app/.

Production follows main.

## Artifact rebuilding

The native Canva deck is authoritative. Its collaboration link is in the private Drive package. Edit there and export the current PDF and PPTX; do not replace it with an earlier import. Run scripts/sanitize-exports.py on the exported PDF and PPTX to remove Canva origin identifiers from distributable metadata while preserving page and slide content.

scripts/build-submission.mjs validates the seven word counts and writes the combined copy. After a Canva export, scripts/sync-deck-copy.py refreshes the slide script from the current PDF. scripts/build-pdfs.py rebuilds the answer and supporting PDFs while preserving the Canva deck; use --only followed by document stems to rebuild selected support files. scripts/embed-fonts.py accepts the source PPTX, output PPTX, and optional family name (DM Sans for the current export). Font preparation and licenses accompany the source package.

The older local deck builder remains available through scripts/build-deck.mjs --build-backup. It creates a versioned backup and cannot overwrite the current Canva exports. The slide-script builder similarly requires --from-backup. These commands are separate from the website build.

Khan materials and logo attribution: docs/THIRD_PARTY_MATERIALS.md.
