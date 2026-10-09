# Khan Academy start on Home — 9 October 2026

Owner scope: fetch current `main`, suggest a Khan Academy video from the learner's preferences on Home, and return Home after the guide. The owner reviewed the local preview and approved a main commit after the copy, capitalization and border refinements.

## Behavior

- Home shows **Let’s get you started** after the profile header. The heatmap and momentum follow it, above shortcuts and the other study cards, as requested in preview feedback.
- The starting topic follows the saved class topic, the foundations for the selected college field, or the next topic for the selected entrance exam. Named exams use their own reviewed lesson mapping.
- Browsing learners can choose a topic on Home without creating a routine. The selector also allows learners with a routine to preview another topic without replacing their goal.
- One paused full Khan video appears immediately for a reviewed match, with its actual title, source link and full lesson action. The existing catalog supplies the URLs and player IDs; no new resources were guessed or added.
- Owner copy feedback: removed the duplicate “Suggested for” label, video heading and explanation beside the player. The player still identifies the video and source, and the full lesson action remains.
- CET names retain their canonical uppercase spelling in the starting-topic sentence, including UPCAT, DCAT and the other supported exams.
- Removed the green top border from the starting card after the owner's preview feedback.
- Removed the repeated “Your Study Companion for Khan Academy” line from Home and the planning-target countdown/date from the profile header. The study schedule and saved planning target remain available in their own flows.
- Unmatched topics offer the original written explanation. Filipino preferences never receive an unrelated English video.
- Showing a recommendation, switching its topic, opening a lesson and finishing the guide award no answer evidence. Saved routines, checks, BACKTRACK and pending practice returns retain their own records.
- Every guide step uses **Next**, including the calendar explanation. The guide stays open and does not interrupt the learner by navigating to the calendar. **Finish guide** returns to `/`, even when the guide was opened from Calendar or Exam dates under Plan. Closing the guide early keeps the current page.

The initial preview incorporated `66b4941` (Show Read Next article titles without source notes). The approved commit is based on the newer `6bd1521`, preserving its school-access updates. Earlier paused audit corrections remain uncommitted in the working tree and are excluded from this release. The commit retains main's flat navigation, optional profile names, caption-reviewed lesson quizzes and gated Read Next articles. A lesson with its own quiz uses that quiz's practice workflow; supplementary Khan practice remains available on lessons without one.

## Preview validation

- TypeScript passed.
- Unit suite: 259 passed, 0 failed; one existing explicit skip for the incomplete 107-lesson caption/content pilot.
- Production export: 690 static pages.
- Initial Home checks: 12 browser journeys passed at 390 and 1280 px, including preference matching, paused player parameters, unmatched topics, saved data preservation, full lesson entry, and guide completion.
- Broad integrated browser regression: 122 of 124 journeys passed before the final layout/guide feedback. The two failures were stale Khan control text and a first-entry test racing the setup dialog; both passed after updating those interactions.
- Final affected flows: all 32 browser journeys passed across the final run and its three-case layout rerun. These cover Khan recommendations, guide setup/replay/completion, profile entry, Home ordering and heatmap keyboard behavior. The older layout assertion was updated for the owner's requested activity placement.
- Refreshed the local Home preview on port 3065 and opened it for owner review. No commit, push or deployment was made.

## Approved commit validation

The exact staged tree was exported into a separate local checkout, excluding the paused audit changes. Its 228 unit tests passed with no failures and one existing pilot skip; TypeScript and the 690-page production build passed. All 32 affected Home and guide browser journeys passed on that export, including recommendation matching, saved data preservation, the requested activity order, guide completion from Home and Plan pages, and phone/desktop interaction. The shortened copy, uppercase CET names and removed green top border are included.

External players and practice navigation use deterministic fixtures in UI tests. These checks establish application behavior and player parameters, not full external playback, caption quality or learning outcomes. No new dependency, paid service, account requirement or backend was added.
