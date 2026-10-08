# Direct Lesson Navigation — 8 October 2026

Owner request: remove overlapping lesson pages throughout the Khan integration. A reviewer
video lesson such as “Word meaning from context clues” should open “Vocabulary in Context”
directly. Publish on a new branch, with separate commits attributed to `polandreei`.

## Behavior

- One destination resolver covers all 503 catalog lessons, including reviewer lists, saved
  topics and header search. The 119 outline lessons with an existing concept open that concept
  page; the 263 college lessons open their subject page. A `lesson` query parameter selects
  the exact clicked material. The 121 outline lessons without a concept keep their own page
  rather than being mapped to an unrelated topic.
- All 503 original `/learn/topic/...` addresses remain in the static export. Where a broader
  study page exists, the old address replaces itself in browser history with the direct
  destination. Existing college program context and lesson anchors are preserved.
- The selected lesson survives reload, sharing and browser Back/Forward. DCAT entry retains
  DCAT material and its reviewer return link. Invalid selections fall back to a real lesson
  in the current topic rather than displaying unrelated material.
- Lesson saves retain their original outline keys. Lesson quizzes, readings, Khan resources,
  topic checks and chapters remain available in their existing study page. Navigation and
  saving do not award practice results or BACKTRACK evidence. The combined business-math
  lesson retains access to both of its mapped practice topics.
- Removed the selector's redundant “Open This Lesson” link and repeated introductory heading.
  College pages no longer repeat topic videos in a second “Watch first” section. Unique
  subject introductions remain optional and load their players only when opened.
- The selector responds to the lesson card's available width. College pages use a compact
  dropdown when their foundations sidebar leaves too little space for another sidebar.

## Verification

- `npm test`: 230 passed, one explicit skip, no failures.
- `npm run typecheck`: passed.
- `npm run build`: final clean-cache export passed, generating all 690 pages. Every original
  lesson URL and every new destination is checked against the export.
- `npm run test:browser`: all 85 scenarios passed on the direct-routing build. After the final
  selector-width and combined-practice adjustments, the eight affected lesson/material/quiz
  scenarios were rerun against the rebuilt export and all passed.
- Catalog-wide checks cover all 503 destinations, all eligible college fields and global
  search. Browser cases cover vocabulary, written lessons, science, college subjects, saves,
  legacy links, DCAT return, reload, Back/Forward, keyboard selection, same-page search,
  both practice destinations for combined lessons, and quiz continuation at 375/1280 px.
  The final desktop and phone layouts were also inspected from browser screenshots.

The local incremental Webpack cache encountered a hashing error. Its generated files were
preserved outside the active cache, and a clean-cache production build succeeded with the
unchanged build configuration and dependencies.

External players use deterministic fixtures in the browser suite. This work does not claim
new external playback, content-review or learner-outcome verification.

## Delivery

Branch: `codex/direct-lesson-navigation`. Product routing, duplicate removal, responsive
layout, combined-topic practice, regression checks and this record are separate commits,
all attributed to `polandreei`. This record accompanies the requested branch push.
