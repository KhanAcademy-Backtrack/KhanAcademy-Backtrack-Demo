# Lesson quiz authoring

Pilot: the 107 UPCAT Mathematics and Science lessons in `PILOT_LESSONS`.
The registry is currently empty: captions have not been watched for this pass.
It is infrastructure, not completed pilot content. Existing lesson material stays available.

Before adding a lesson-keyed entry to `index.ts`:

1. Open the lesson's actual Khan page in a browser, read its rendered title and player id, and watch its video with captions. Record the date and concrete observations in `docs/THIRD_PARTY_MATERIALS.md`.
2. Write an original one-sentence key idea and two or three ordered timestamp cues. Cues guide attention without revealing the quiz answers.
3. Write four original `MockItem` questions in recall, explain-why, application with new numbers, and common-trap order. Include four distinct choices, one key, one misconception id per distractor, rationales for all choices, and worked solution steps. Use all four key positions within each quiz. Do not copy or adapt Khan exercises. Every item remains `status:'draft'` pending subject review.
4. Optionally add an original prediction. No correctness or explanation appears until the post-quiz reflection.
5. Hand-open a relevant Khan exercise page, check its title, and log its exact URL and date before adding `practice`. Never derive the URL from its video page.
6. A segment is optional. Add it only after watching the captions in that range and logging its id, start, end, label and date. Add it to `VERIFIED_CLIPS`; the quiz must match that entry exactly.
7. Put every equation, variable and chemical formula inside `$…$`, using commands supported by the house typesetter. UI content renders through `Rich`.
8. Run the content tests and all four repository checks. The browser journey needs a published quiz with a verified segment; until one exists, it explicitly reports the blocked journey.

“Accuracy, precision and experimental uncertainty” and “Depositional landforms and bodies of water” have no matched videos. The other 105 pilot lessons reference 119 distinct videos, including compound lessons. Find and hand-check suitable sources for the two gaps before authoring their video-based quizzes; no URL or fallback is inferred.

Lesson checks and Khan self-reports are device-local authored practice. They never pass a BACKTRACK step, update the study exposure ledger, clear a gap, or enter the 80-attempt list. Retaking the same items never makes them fresh evidence. No IFrame API script or additional runtime dependency is needed.
