# Lesson quiz pilot — 8 October 2026

**Status (end of 8 October): 99 of 107 lesson quizzes published as draft content; the pilot is not complete.** Eight lessons have no quiz, and the 107-lesson completion test stays explicitly skipped until they do. Every published item is `status:'draft'` pending subject review.

## Content progress, later on 8 October

The in-app browser in the desktop app loaded Khan normally (the earlier denial was in a different browser tool). For each lesson, Khan’s own **Transcript** tab (its timestamped caption track) was read in full on the video page, with an emulated 1280 by 900 viewport, because Khan hides that tab when the viewport has no size. The page title and youtube-nocookie player id were also read. Video frames were not watched and playback was not run, so on-screen drawings and labels are unreviewed. Practice pages came from Khan’s lesson navigation or rendered Khan search, and each title was read. Receipts, observations and subject-review flags are in `docs/THIRD_PARTY_MATERIALS.md`, “Lesson quiz caption reviews, 2026-10-08”.

| Group | Lessons | Published | Without a quiz |
|---|---|---|---|
| Arithmetic and number sense | 6 | 5 | Factors, multiples and divisibility (no Transcript tab) |
| Algebra and functions | 14 | 13 | Sets and Venn diagrams (no Transcript tab) |
| Geometry | 9 | 9 | |
| Trigonometry | 5 | 5 | |
| Statistics and probability | 6 | 6 | Lesson 40 uses its second matched video because the first has no Transcript tab |
| Logic and calculus basics | 3 | 3 | |
| Biology | 14 | 12 | Biomolecules; Ecosystems and energy flow (no Transcript tab) |
| Chemistry | 18 | 16 | Chemical reactions and balancing equations (no Transcript tab); Accuracy, precision and experimental uncertainty (no matched video) |
| Physics | 17 | 17 | |
| Earth science | 8 | 7 | Depositional landforms and bodies of water (no matched video) |
| Astronomy | 7 | 6 | Stars and constellations (no Transcript tab) |

- Only one new clip was added: `ClYdw4d4OmA` 458 to 542 s, “Same-level operations go left to right”, for the order-of-operations lesson. Both real lesson-quiz browser journeys now run on it at 375 px and 1280 px.
- The two gap lessons were searched again. No Khan video covers depositional landforms. “Reporting measurements” (`UEe81kJtY8A`) covers precision and uncertainty but not accuracy, so it stays unmapped, as decided on 7 October. Mapping a partial match is an owner decision.
- The six blocked lessons need either Khan to publish captions for their videos or an owner decision to map a different, transcript-bearing video. Remapping changes the lesson’s learner-facing video and needs its own hand check and receipts.
- A research sub-agent audited all 99 quizzes and found no wrong key. Fixes, committed separately: a math distractor whose choice, misconception id and rationale disagreed; stems that relied on the video's numbers; a physics worked step that named a choice by its old position (a test now rejects positional references); a key rationale giving Venus a thin atmosphere; and items built on contested caption claims (Ordovician jaws, friction-made magma, why sound is faster in water), now rewritten and flagged. Style questions left to the owner: “deka” or “deca”, “counterclockwise” or “anticlockwise”, “hemoglobin” or “haemoglobin”, and “Paleozoic” or “Palaeozoic”.
- The audit also found a shipped display bug. Seventeen lesson misconception ids repeat ids in the shared misconception registry, so “Show explanation” listed unrelated registry text (circle-area choices read “Did not square the speed”). The explanation now uses the quiz's own rationales, and the browser journey checks every choice line.
- Optional **Read Next** Khan articles: 140 title-checked links for 92 pilot lessons, with 15 lessons searched and none fitting (`src/lib/program/lesson-readings.ts`, receipts under “Lesson readings” in the third-party log). On quiz lessons they appear only after the lesson check is finished, so a worked article cannot prime the quiz. Opening one writes nothing. Article bodies are not reviewed. An OpenStax section for accuracy and precision is not used, because Go deeper links stay deferred.
- Replacement candidates with Transcript tabs, for the owner to approve before any remapping: “Finding factors and multiples” (`5xe-6GPR_qQ`) or “Divisibility tests” (`Df9h5t64NlQ`) for factors; “Universal set and absolute complement” (`GVZUpOm3XUg`) for sets; and “Balancing more complex chemical equations” (`xqpYeiefZl8`) for balancing equations. Each needs its own title check and full caption review before use.
- Subject-review flags record caption slips that the items avoid. Examples: “DNA has uracil”, a carbon-14 half-life of 5,740 years, “23.4%” for degrees, a 28-day lunar cycle, and the galaxy called the “universe”.

**Not verified:** subject accuracy of the draft items (no specialist review yet), anything shown only on screen, full playback, caption quality beyond the text read, and learner or retention outcomes.

## Earlier status, morning of 8 October

**Status then: infrastructure implemented; content pilot blocked, 0 of 107 lesson quizzes published.** The registry in `src/content/lesson-quizzes/index.ts` was empty. No teaching questions, timestamp cues, practice pages or new clip ranges were fabricated to fill the gap. Existing lessons remained available.

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
