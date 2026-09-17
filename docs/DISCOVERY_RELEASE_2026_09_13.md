# Khanpanion discovery release

## Delivered site changes

Explore adds a ten-item collection: six original playable mathematics experiences and four reviewed Khan Academy segments. Learners can use topic filters, save an idea, share its direct link, return after Khan practice and enter a fresh study question. The existing study, review, packs, science and co-op features remain available.

Discovery position, controls, predictions and saves are included in the current local study export. Older histories remain valid. Discovery activity grants neither independent evidence nor points; exposed examples are reserved before subsequent assessment. Khan opens, self-reports and independent answers remain distinct.

The navigation includes Explore on desktop and mobile. The optional Today tutorial covers five steps; Explore has a six-step Quick tour covering navigation, controls, saving/sharing, Khan clips, practice/return and Review. Closing Explore’s tutorial restores the prior topic. Original Khanpanion and Khan content are clearly labelled, and Khan video loads only after learner choice. Moving to another item removes the playing iframe.

## Animation correction

The homepage filling model now stops after its five-minute illustration. Pause removes the stream; Play continues from the paused time; Replay starts a new bounded cycle; moving offscreen stops the stream and pauses motion. Quiet and reduced-motion paths retain the controls. The equation, graph, tank and readout share the same changing state.

## Validation

Type checking, 92 unit tests and a production build passed. Dedicated discovery checks cover entry/navigation, saving and reload, video opt-in and teardown, exact Khan return, fresh assessment, phone layout, keyboard/reduced motion, and invalid/shared-link exits. Existing study, mathematics release and lesson-scene suites passed. Filling-model tests include end-of-cycle stopping and pause/resume. Detailed local reports remain in .refs and are not included in the submission package.

## Submission materials

The seven narratives are updated around public access and the connected Khan journey. Each is below 300 words; the executive fallback is below 300 characters. The owner confirmed that team fields are already completed in the portal. The same 15-slide Canva source is updated, with the opening hook “You watched it. Can you use it?”. The main button, printed URL, QR pixels and QR image hyperlink all open https://dunlo.vercel.app/. The PDF has 15 page bookmarks and verified source links. Existing Drive files are replaced in their original folders; no new Drive folder is created.

The PHP 100,000 budget is an implementation plan. Public launch, future localization and voluntary evaluation are described in future tense. No recruited cohort, partner access, secured funding or learning outcomes are asserted.

Final completed checks: 92 unit tests and 61 browser cases across the study, mathematics, lesson, living-scene and discovery suites. The production build passes.
