# Home refinement — 7 October 2026

Owner request: add a study heatmap and refine Home using the supplied spacious profile/activity reference, within Khanpanion's identity. Work belongs on `codex/home-study-heatmap`, with no merge to main in this pass.

## What changed

- A friendly bookmark companion, a clearer goal header and three counters drawn from saved activity.
- The heatmap and momentum cards come first, followed by balanced desktop rows with equal-width columns and aligned next-step column bottoms. Exam Home pairs the next topic with Daily 3 and routine controls, then the compact weekly plan with BACKTRACK support. The topic picker expands across both columns, with search focus, a close button and Escape return. This removes the tall empty column in both collapsed and expanded states. Phones keep a single readable column.
- A Monday-first activity heatmap for January through December of the current calendar year, a recorded-day detail and a calendar link for the selected date. Future dates remain empty and muted; padding outside the year is blank. Fixed square cells and four-pixel gaps prevent uneven or merged-looking cells. The owner requested a single view, so the range switch is removed.
- Hovering or focusing a square shows its full date, exact recorded activity count and a breakdown. Counts remain exact beyond the darkest colour level. Future dates show zero and “Upcoming day.”
- Weekly participation, a current optional streak, a personal best and milestones at 1, 5, 10, 25 and 50 recorded study days. Missing a day leaves those milestones intact.
- The same activity card is available on browsing Home and the legacy Today surface. Existing goal changes, routine controls, topic selection, practice, calendar and BACKTRACK actions remain connected.
- Results preserve the lowercase connecting word in scores such as “4 of 6.” Numeric scores use their authored case rather than headline title casing.
- The header reads “Khanpanion Profile:” with the current date. The compact study-week illustration fits all seven day labels inside its frame, in the owner's requested Sunday-first order: S M T W T F S. The activity heatmap and detailed calendar keep their Monday-first date mapping.
- Plan's three starting-point choice titles and its browsing action use the same headline style, including lowercase connecting words. Descriptions keep their sentence case and accessible button names keep their authored labels.

## Activity contract

This is participation, not mastery or predicted exam performance. The calculations use retained program and study records without changing either save schema. Calendar dates and timestamp conversion use Manila days.

Submitted practice sets count once by attempt identity. A Daily 3 record and its saved attempt count as the same set, including older daily keys. Existing recorded study days and recall completions contribute participation. Nonempty BACKTRACK answers include supported work; empty unknown responses do not add an answer. Meaningful completed sessions retain their recorded date after a topic starts another route, without doubling answer counts.

Unfinished sets, future dates, invalid dates, resource opens and planned sessions do not fill the heatmap. Scores, confidence and learning evidence keep their existing rules. Counters describe the history still present in the save; they cannot reconstruct records that an earlier retention limit discarded.

The heatmap has a single keyboard entry point. Arrow keys move between recorded or elapsed dates in the current year; Home and End reach January 1 and today. Each cell has a full date and activity description. Touch selection shows the same detail. The annual chart scrolls within its own card on a phone, initially showing today. Existing quiet mode and reduced-motion handling cover the companion.

## Validation

- 188 domain tests pass, including eight activity/date/deduplication cases, full calendar-year coverage and a leap year needing 54 week columns.
- Type checking and the production build pass; 691 static pages export.
- The full Edge browser regression passed all 59 cases. After the owner's order/score feedback, 23 relevant guide, Home and result cases passed. After the latest visual comments, eight focused cases passed, including the 1100-pixel viewport, fixed-square geometry and real four-pixel gaps, complete week labels, removed range controls, the profile label and lowercase score wording.
- The final eight focused cases also pass after the owner's spacing, calendar-year, tooltip and Plan feedback. They verify both empty and completed Home states at 390/1100/1440 pixels, equal column widths and aligned bottom edges, the full-width picker and its focus/close controls, Sunday-first week labels, hover counts for elapsed/future dates and Plan headline styling.
- Desktop and phone screenshots were inspected. Test screenshots use disposable QA activity; no sample history is installed in the application.

Local captures are under `.refs/home-review/`. Private working files and reference images are not part of this release.
