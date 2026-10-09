# Study tool removal — 9 October 2026

The owner requested complete removal of **Khan Academy activities** and **Daily recall** from the site, followed by a push to `main`. Work was isolated from the other agent's checkout on `codex/remove-study-tools`.

- Removed both Study navigation items and their search entries, the Home recall shortcut and due badge, activity-picker links in setup/Home/Explore/study, and obsolete guide steps and copy.
- Deleted the standalone Khan activity picker, its URL-entry interface and styles, and the Daily Recall component and queue scheduler. Removed the chapter action that added cards to that queue and the queue writes after practice exams and sprints.
- Older `/khan` bookmarks open `/reviewer` with a client redirect and a plain link fallback. `/review` retains only BACKTRACK's independent review/Rematch workspace; it no longer renders Daily Recall.
- The older Home mission now has its remaining learning and fresh-check steps. Group mission completion no longer requires the retired recall step. Selecting “Still hard” after Khan practice opens the corresponding topic explanation.
- Existing learner records retain their historical recall data for import/export compatibility. No saved learning records are cleared or migrated destructively.
- Khan videos and matched practice inside lessons and packs, chapter flashcards, personal note cards, Daily 3 practice, and BACKTRACK remain available. The Study landing cards now point to Practice Exams and Study Packs.

Browser coverage exercises the remaining pack → Khan explanation/practice → saved return flow, chapter study, phone/desktop navigation and search, old entry URLs, and unchanged saved records. External player/navigation checks use the existing deterministic fixtures; they do not claim live playback verification.

## Verification

- `npm test`: 226 passed, one existing content skip.
- `npm run typecheck`: passed.
- `npm run build`: all 690 static pages exported.
- Browser regression: all 96 journeys verified across the full run and targeted reruns. The initial run exposed a stale Home countdown assertion (updated to the current exam display) and rejected the isolated preview port for live groups (rerun successfully on the existing allowed port, 3050). No backend changes were needed.
- Two additional checks passed for the shortened welcome tour and saved-session resume.
- Scanned all 1,480 exported HTML, JavaScript, CSS and route-text files: no removed feature labels, picker styles or activity-picker links remained. Visually checked Study at 390 and 1280 px.

This record accompanies the owner's authorized main-branch publication. The original shared checkout, its index and the other agent's untracked assets were left untouched.
