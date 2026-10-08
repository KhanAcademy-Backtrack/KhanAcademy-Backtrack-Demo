# Lesson quiz pilot — 8 October 2026

**Status: infrastructure implemented; content pilot blocked, 0 of 107 lesson quizzes published.** The registry in `src/content/lesson-quizzes/index.ts` is empty. No teaching questions, timestamp cues, practice pages or new clip ranges were fabricated to fill the gap. Existing lessons remain available.

## Implemented

- A lesson-keyed authoring contract: optional prediction, four original draft `MockItem` questions in recall / explain-why / application / common-trap order, four distinct choices, all four answer positions, selected-choice rationales and misconception identifiers per distractor.
- Conditional lesson integration: timestamped Watch for this cues and key idea, practice questions below the video, targeted support after a miss, post-check prediction reflection, separately recorded optional Khan practice self-report and Next lesson. An exact `VERIFIED_CLIPS` match is required for rewatch; a worked example and an engine-backed repair are offered only when present.
- Optional, validated, bounded `lessonChecks` in the device-local program save. It retains one latest run per lesson (at most 503), authored version and item identities, answer/check state, prediction choices and separate practice activity/report timestamps. Old saves without the field still load. Unknown evidence fields, malformed choices, non-string self-reports and impossible chronology are rejected.
- Lesson actions never enter the 80-slot attempts list, update the study exposure ledger, feed `findGaps`, clear a gap or pass a BACKTRACK step. Retakes retain the same authored identities and remain practice. Unit tests preserve a seeded existing gap; browser checks compare the study, route and program evidence records.
- Node contract tests and a shared phone/desktop browser journey for miss feedback, paused verified rewatch parameters, completion, optional practice report, reload and retake. When reviewed content is absent, the real quiz journeys explicitly skip and the available lesson/reload path still checks that no evidence is written.

No new dependency, runtime AI call, account requirement, IFrame API script or third-party frame was added. The existing paused YouTube player is reused. Palette, font families and rectangular controls are preserved. Go deeper links remain deferred until the pilot passes.

## Sources and content work still required

The owner-requested research sub-agent inspected TED-Ed, H5P, Edpuzzle, CK-12 and one OpenStax section. The report separates directly observed behavior from documented capabilities and proposed design decisions: `docs/research/2026-10-08/VIDEO_LESSON_INTEGRATION.md`. Dated receipts are in `docs/THIRD_PARTY_MATERIALS.md`; competitor comparisons stay out of learner-facing content.

Khan browser access was initially declined. After chat approval, the owner supplied a settings screenshot showing both default browsing and the Khan exception set to Always allow. A fresh browser session still returned a saved-permission denial for `https://www.khanacademy.org`. The displayed setting and tool result disagree; the cause is not confirmed. The available tools cannot repair that permission state. No alternate access method was used to bypass it.

Catalog inspection found 105 lessons referencing 119 distinct videos, including compound lessons. Two pilot lessons have no matched video: **Accuracy, precision and experimental uncertainty**, and **Depositional landforms and bodies of water**. These need hand-checked matches before their video-derived questions can be written.

For every pilot lesson, watch the actual chosen Khan video with captions, write four original questions without copying/adapting exercise items, hand-check the practice page, log the review date and observations, and verify any optional clip range. Keep every new item `status:'draft'` pending subject review. The authoring procedure is `src/content/lesson-quizzes/README.md`.

## Validation and limits

- `npm test`: 224 passed, 0 failed, 1 explicitly skipped test for the incomplete 107-lesson caption/content pilot.
- `npm run typecheck`: passed in the repository.
- `npm run build`: the unmodified repository now exports 690 static pages successfully after the filesystem permission change. This rerun used no private validation copy, compiler patch or filesystem shim. Earlier private-copy validation needed Windows sandbox workarounds; none are shipped.
- `npm run test:browser`: rerun against that repository export with Chrome on the default port 3050: 82 passed, 0 failed; two real lesson-quiz journeys explicitly skipped for unavailable content. Both live-group journeys passed. The earlier run on port 3064 failed those journeys because that origin was disallowed; read-only OPTIONS checks and the connected project status identified the cause. The existing group test also now follows Plan → Exam dates → Calendar, matching current navigation.
- Additional isolated synthetic UI journeys passed at 375 px and 1280 px through the actual `LessonMaterial` integration, including cues, miss feedback, rewatch, reflection, reports and retakes. The synthetic labels and temporary registry/route were removed before the production export and were never committed or published. External player and practice-navigation fixtures test UI contracts, not playback or source accuracy.

**Not verified:** any pilot Khan captions, new practice pages, new clip ranges, meaningful video-derived quiz content, subject accuracy, complete external playback or learner/retention outcomes. The two real quiz browser journeys remain explicitly skipped until suitable reviewed content exists. This is not a completed 107-lesson pilot.

## Publication confirmed — 8 October 2026

The seventeen implementation, research and validation commits are on main through 5451f73d069b7fcaa629ca3275c390e4a2ff0d46, authored as the repository's configured author, polandreei, without AI attribution trailers. After the shell permission change, git push reported Everything up-to-date; a fresh fetch confirmed identical local and remote main heads. This documentation correction is committed separately.

The earlier Windows credential sandbox failure no longer blocks publication. Caption/content review remains unfinished at 0/107; publishing the infrastructure does not complete the pilot. Live deployment is not verified.
