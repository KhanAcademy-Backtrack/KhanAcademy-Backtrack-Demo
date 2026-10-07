# Home refinement — 7 October 2026

Owner request: add a study heatmap and refine Home using the supplied spacious profile/activity reference, within Khanpanion's identity. Work started on `codex/home-study-heatmap`. The owner subsequently approved combining main's updates with the Home refinements, including removal of the My plan page. A final push requires a separate approval.

## What changed

- A friendly bookmark companion, a clearer goal header and three counters drawn from saved activity.
- The heatmap and momentum cards come first, followed by balanced desktop rows with equal-width columns and aligned next-step column bottoms. Exam Home pairs the next topic with Daily 3 and routine controls, then the compact weekly plan with BACKTRACK support. The topic picker expands across both columns, with search focus, a close button and Escape return. This removes the tall empty column in both collapsed and expanded states. Phones keep a single readable column.
- A Sunday-first activity heatmap for January through December of the current calendar year, a recorded-day detail and a calendar link for the selected date. All seven rows show S M T W T F S and dates align with those labels. Future dates remain empty and muted; padding outside the year is blank. Fixed square cells and four-pixel gaps prevent uneven or merged-looking cells. The owner requested a single view, so the range switch is removed.
- Hovering or focusing a square shows its full date, exact recorded activity count and a breakdown. Counts remain exact beyond the darkest colour level. Future dates show zero and “Upcoming day.”
- Weekly participation, a current optional streak, a personal best and milestones at 1, 5, 10, 25 and 50 recorded study days. Missing a day leaves those milestones intact.
- The same activity card is available on browsing Home and the legacy Today surface. Existing goal changes, routine controls, topic selection, practice, calendar and BACKTRACK actions remain connected.
- Results preserve the lowercase connecting word in scores such as “4 of 6.” Numeric scores use their authored case rather than headline title casing.
- The header reads “Khanpanion Profile” without a date, with an optional learner name and a pencil button for editing it. The compact study-week illustration and heatmap use the owner's requested Sunday-first order: S M T W T F S. The detailed calendar and weekly participation calculation keep their existing Monday-first week boundaries.
- The goal picker's three starting-point choice titles and its browsing action use the same headline style, including lowercase connecting words. Descriptions keep their sentence case and accessible button names keep their authored labels.

## Integration with main

Navigation follows main: Home, Study, Plan, Group, with section labels visible when the sidebar is narrow. The My plan page and its unused components are removed. Calendar and Exam dates remain under Plan; exam editing opens the existing goal picker from Home and the menu. Search and guided-tour destinations no longer point to the removed page.

Main's header/sidebar overscroll fix and course illustration corrections are retained. Home keeps the complete layout, heatmap, momentum, Sunday-first labels and responsive card refinements described here. The integration has been published on main.

The owner then requested flat global navigation. The sidebar and menu drawer now contain direct Home, Study, Plan and Group links plus personal goal shortcuts, without nested lists or dropdowns. Section destinations remain in the horizontal page-level tabs at every screen width; topic and course hierarchies remain on their destination pages. The hamburger opens the full drawer on desktop as well as phones, with keyboard focus kept inside it until it closes. This follow-up was verified on a review branch and approved for publication by the owner.

Direct inspection of the production Home page confirms that the profile header, current-calendar-year heatmap and momentum cards are already deployed. The menu follow-up preserves those Home changes and main's subsequent route-map work.

## Plan navigation follow-up

The owner reported that selecting Plan opened Courses. The remaining goal-dependent destination sent college learners to their program map and class-topic learners to their lesson; those pages correctly belong to Study, so the active section immediately changed. The owner selected Exam dates as Plan's landing page and requested removal of College map from its row. Plan now consistently opens Exam dates, with only Calendar and Exam dates in its horizontal row. Personal course and topic shortcuts remain available and stay in Study. A regression check reproduces the earlier goal-dependent failure at phone and desktop widths, then verifies direct and drawer navigation for exam, college and class-topic goals, Calendar access and preservation of the saved goal and routine. This fix was approved and published to main at 683d1e4, with the production Plan destination and two-link row verified directly.

## Profile name follow-up

The owner requested that Home's main heading show the learner's name instead of their study goal. A new learner sees an optional name step after choosing their goal, focus and study routine. Skip or a blank name uses “Khanpanion.” Existing learners also get that default, with no forced setup or changes to their saved goal. The study goal stays visible as smaller context beneath the name.

The pencil button at the top right of the Home header opens a keyboard-accessible name editor. Save updates the heading immediately; Cancel and Escape leave the saved name intact. Names retain their authored spelling and case. The short profile label has no colon or date, and the counters read Study Days, Practice Sets and BACKTRACK Answers. The earlier selected-field badge refinement (“Field”) remains in the review branch.

The name is optional device-local data in `backtrack.profile.v1`, separate from learning records, shared study scopes and the existing program save. Missing, blank or unreadable name data falls back to Khanpanion. Name writes are immediate, sync between tabs and do not change the learning save. No account or backend is added. This follow-up is verified on `codex/home-profile-name`, pending owner approval to publish.

## Activity contract

This is participation, not mastery or predicted exam performance. The calculations use retained program and study records without changing either save schema. Calendar dates and timestamp conversion use Manila days.

Submitted practice sets count once by attempt identity. A Daily 3 record and its saved attempt count as the same set, including older daily keys. Existing recorded study days and recall completions contribute participation. Nonempty BACKTRACK answers include supported work; empty unknown responses do not add an answer. Meaningful completed sessions retain their recorded date after a topic starts another route, without doubling answer counts.

Unfinished sets, future dates, invalid dates, resource opens and planned sessions do not fill the heatmap. Scores, confidence and learning evidence keep their existing rules. Counters describe the history still present in the save; they cannot reconstruct records that an earlier retention limit discarded.

The heatmap has a single keyboard entry point. Arrow keys move between recorded or elapsed dates in the current year; Home and End reach January 1 and today. Each cell has a full date and activity description. Touch selection shows the same detail. The annual chart scrolls within its own card on a phone, initially showing today. Existing quiet mode and reduced-motion handling cover the companion.

## Validation

- 188 domain tests pass, including eight activity/date/deduplication cases, full calendar-year coverage and a leap year needing 54 week columns.
- Type checking and the production build pass. The integrated build exports 690 static pages after removal of My plan; the original Home branch exported 691.
- The full Edge browser regression passed all 59 cases. After the owner's order/score feedback, 23 relevant guide, Home and result cases passed. After the latest visual comments, eight focused cases passed, including the 1100-pixel viewport, fixed-square geometry and real four-pixel gaps, complete week labels, removed range controls, the profile label and lowercase score wording.
- The final eight focused cases also pass after the owner's spacing, calendar-year, tooltip and Plan feedback. They verify both empty and completed Home states at 390/1100/1440 pixels, equal column widths and aligned bottom edges, the full-width picker and its focus/close controls, Sunday-first week labels, hover counts for elapsed/future dates and Plan headline styling.
- The Sunday-first heatmap follow-up passes all eight activity domain tests and eight Home browser cases. Every rendered date matches its weekday row, including leap years and blank padding outside the calendar year.
- The integrated main/Home version passes all 61 Edge browser cases and 188 domain tests. The browser checks confirm My plan returns 404, goal editing remains available from Home, saved work survives setup changes, and the Home heatmap, tooltips, keyboard controls and card geometry still work across phone and desktop widths.
- Desktop and phone screenshots were inspected. Test screenshots use disposable QA activity; no sample history is installed in the application.
- The flat-menu follow-up retains main's newer route-map work and passes 209 domain tests, 27 relevant Edge browser cases, type checking and the 690-page production export. Direct browser checks cover the desktop and phone drawer, focus wrapping, Escape return, scroll lock, drawer links and horizontal Courses navigation. Production Home was also inspected directly.
- The Plan landing-page correction passes 16 targeted Edge cases, type checking and the 690-page production export. The checks cover all three study goals at phone/desktop widths, both direct and drawer Plan links, the two-link planning row, Calendar access, retained goals/routines, setup changes and Home behavior. The preview's Plan link and row were also inspected directly.

Local captures are under `.refs/home-review/`. Private working files and reference images are not part of this release.

The profile follow-up passes 35 targeted Edge cases across Home, onboarding, optional names for all three study goals, routine preservation, the short-phone first-entry step, name editing at 320/390/1100/1440 pixels, cancellation/Escape/focus containment, reloads, cross-tab updates, long names and the blank-name default. All 213 domain tests, type checking and the 690-page production build pass. Direct visual review confirms the optional final name step, date-free profile label, learner-name heading, top-right pencil and counter casing. Profile review captures are private under `.refs/profile-review/`.
