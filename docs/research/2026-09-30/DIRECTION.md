# Khanpanion college program direction

30 September 2026. Phase A connects the prepared engine and content to public static routes. The deadline is October 7, ahead of the October 9 and 10 national finals. Phones and desktop screens have equal priority.

## Product direction

Two doors serve different jobs: prepare for college entrance exams and start college with the prerequisites your program assumes. A fresh learner tries three questions before making a pledge. The pledge supplies an editable target date and routine. Today puts the countdown and mission first on phones. The plan, calendar, mocks, reviewer and group retain one answer-sheet identity, while the exam hall uses a focused deep navy frame.

The mistake finder remains the original deterministic recovery engine. Mock answers seed support, never pass a recovery step. Only two fresh unassisted never-exposed answers pass a step. Khan opens, self-reports and independent Khanpanion answers remain separate. Recall and check-ins schedule or encourage activity without changing that evidence boundary.

## Connected experience

Static routes expose the existing program components and all concept, chapter, handbook and bridge pages. The old study rooms, packs, reviewer, public Explore feed and recovery entries remain reachable. The old Today space remains at /demo for QR compatibility. Confidence has four visible choices and I do not know remains available; pack cards keep exactly eight direct children.

Program initialization gates date-dependent UI until the real local day and save are loaded. Mock answers write immediately, active elapsed time writes every eight seconds and on pagehide, and reload restores the saved section and position. Pauses and section breaks do not inflate active per-item seconds. Overtime is displayed and questions stay usable. The result key hides and shows, with a direct route to missed-skill repair. Daily recall supports concept, chapter-card and missed-item keys.

The design uses navy page frames, readable paper sheets, green filled ovals/actions and mint highlights. Only Plus Jakarta Sans and STIX Two Text are used. Shared motion tokens drive feedback, exam entry, result reveal, tabs and progress; quiet and reduced motion have complete static versions. The owner subsequently requested a thorough motion pass, and the existing teaching scenes were refined with controlled steps, shared motion policy and transform-based models. Removed legacy declarations are replaced by utilities only where screens were touched.

## Verified source corrections

The [UPCAT official bulletin](https://upcat.up.edu.ph/htmls/aboutupcat.html) calls August 1 and 2, 2026 the UPCAT 2027 testing dates, for AY 2027-2028. The inherited August 2027 test window and March 2027 application window were not confirmed and were removed from the official calendar. A personal planning target is allowed, with that distinction visible when making a pledge.

The [DOST-SEI scholarship portal](https://ugs.science-scholarships.ph/pages/home.html), linked from its official helpdesk, gives November 14 and 15, 2026. The DLSU page returned HTTP 403 and did not substantiate inherited future DCAT dates. PUP supplies campus-specific schedules without confirming the inherited January to March 2027 window. Those schedules must be obtained from their official pages before they are added.

Unchanged Khan units retain the title checks recorded by the previous September 30 release. This pass introduces no new Khan deep links. The complete unit catalog, dates and official exam pages are logged in docs/THIRD_PARTY_MATERIALS.md. UP_ENDORSED stays false pending the owner's signed-letter confirmation.

## Review still required

All original mock content is draft. Language, reading passages and conceptual science need subject and Filipino-language review; generated family distractors and solutions also need review. The reviewer chapters and handbooks need subject review. The seven bridge maps and rescue priorities need faculty review. The exam blueprint is a practice configuration, not an asserted official section specification.

Confirm the blueprint: Language 40 items/45 minutes; Reading 30/50; Mathematics 50/70; Science 50/60; ten-minute section breaks. This is 225 active minutes plus 30 minutes of breaks. Scoring is +1 correct, zero wrong, zero blank; bands start at 0, 40, 60 and 80 percent. Sprint is 12 items/15 minutes; topic checks 8/12; Daily 3 has three items. All are configured in src/lib/mock/blueprint.ts.

Offline reviewer caching and its acceptance test are Phase B. No backend, accounts, runtime model calls or new runtime dependencies are introduced. Messenger checks use the browser user agent; a physical phone walkthrough in Messenger remains an owner/device check.

## Release validation

The production export generates 104 pages. The landing route first-load JavaScript is 233 kB in the Next.js build report; the exam hall is 256 kB and results are 257 kB. Today is loaded when a saved side requires it; share-card generation is loaded when sharing is requested. The lightweight reviewer catalog keeps chapter prose out of answer-link lookup. The deterministic question banks still contribute to the landing bundle. No runtime dependencies were added.

The legacy base colour alias collided with Tailwind text-base and caused white labels on paper at desktop sizes. That unused alias was removed; paper controls have explicit navy labels. The browser suite asserts inactive subject-label colour to prevent this regression. The plan now places phase/readiness information beside the subject list at desktop width.

Verification: 115 domain tests, explicit TypeScript checking and a static production build. The browser acceptance runner includes 28 journeys and checks every new concept, chapter, handbook and bridge route at both 375 and 1280 px; calendar is also checked at 320 px. It covers answer autosave, the eight-second elapsed save, pagehide/reload, pause exclusion, overtime, same-section resume, answer-key visibility, missed-skill seeding, placement, calendar edits/export, reviewer search/bookmarks/practice/print/recall, visible confidence choices and eight-child pack cards. Screenshots and machine receipts are private in .refs; the built-in browser pane was also used to capture both sizes. Quiet/reduced-motion screenshot checks and ordinary-motion Messenger user-agent checks are distinct from a physical Messenger phone test.

The animation refinement was checked with 96 passing browser journeys across four suites, including 51 lesson cases at phone and desktop widths. The linked model is checked during movement, not only at the endpoints. The original recovery evidence and generated-question tests remain green.

The completion audit added the missing 150 ms content fade on navigation, with no first-load fade and complete static quiet/reduced views. The exam hall keeps its own focused entry. It also cleaned reachable legacy punctuation and export labels without changing stored identifiers or generated answers.

## Learner entry and content curation

The homepage now leads with the learner’s goal and a browsing option. Detailed help is placed with the task it supports. The tuition slogan, team credential columns and bank-size promotion were removed from the landing page. About retains concise attribution; the bridge starts with program selection and class-topic help. The progress page explains actual activity and independent-answer records instead of a research proposal. Storage keys, original question generation and evidence rules remain unchanged.

A lazy four-step guide follows the selected goal or browsing intent and highlights the real navigation. Learners can replay it from the visible header action, homepage or Me. Background content is inert and hidden from assistive navigation while the dialog is open; focus stays inside and returns on close. Closing or finishing writes no learning evidence. The calendar step opens the actual interactive page with a continuation card. The earlier study-space tour remains available.

## Personalization and hands-on guidance

The next refinement starts with the learner’s goal before explaining the interface. Exam preparation, first-year foundations and class-topic help produce different primary topics, actions and routines. Topic selection starts with a subject and a short relevant list, with search available across subjects. The college help panel no longer displays an unrelated sixteen-topic cloud.

The chosen routine generates real calendar sessions. The home page includes an interactive week view and direct calendar actions. Guide stays visible in the header, and its calendar step opens the real calendar with a non-modal continuation card. Calendar supports editing, moving between months, removal/Undo, reload restoration and file export. Unknown exam dates are optional; the calendar remains useful without inventing dates.

Save compatibility uses an optional setup field under the existing v1 key. No question generator, exposure contract, backend, account system or dependency was changed. Six independent domain tests cover preferences, selected-program/topic scheduling, moving/removal after reload and calendar export. [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html) grounds the export’s UTC timestamp and UTF-8 line folding; session times remain local floating times. Physical calendar-app import has not been claimed as verified.

Entry behavior: the intent picker appears automatically on the first normal page in a browser-tab session. I’m just browsing continues a guide and subject browser without requiring a routine or questions. It is a session-only choice; saved preferences and learning records stay intact. A saved goal can be continued with one click. Refresh and normal navigation do not repeatedly interrupt the same visit. Timed/print and explicitly requested legacy-tour entries remain focused. Guide stays visible in the header and /?guide=1 opens it directly.

Final refinement validation: 121 domain tests, explicit typecheck, 104-page production export and 41 passing browser journeys. The landing first-load JavaScript remains 233 kB; the hall and results are 258 kB. New journeys cover all three personalized paths, browsing, one-click returning goals, preservation of existing preferences, native clock-value capture, keyboard focus, quiet motion, subject/search selection, calendar edit/move/Undo/export and widths from 320 to 1280 px. The built-in browser also verified the phone picker, browsing guide, real calendar continuation and categorized Physics list. Export bytes were checked; physical calendar-app import was not tested.
