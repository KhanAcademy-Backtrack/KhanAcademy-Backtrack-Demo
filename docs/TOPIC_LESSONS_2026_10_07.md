# Dedicated Topic Lessons, 7 October 2026

Owner request: replace video-preview buttons and the broad opening summary with immediately visible,
paused Khan Academy material; give each topic a dedicated lesson; improve navigation and title styling.

## Materials and Coverage

- 503 static topic pages: 173 UPCAT, 67 DCAT and 263 college subject topics. This includes all 43 owner-approved
  additions to the outline during the pass. Each has a stable URL,
  dedicated material and previous/next navigation. Reviewer and header search include these pages.
- DCAT has 65 video mappings and two explicit unmatched topics (synonyms/antonyms and finding an error
  in a sentence). Shared topics reuse previously verified resources. Filipino never receives an English fallback.
- All 64 lesson instances without a fitting Khan video have an original focused guide: idea, worked
  example, self-explanation, revealed explanation and common trap. Guides also support selected loose-fit
  topics. There are 98 lesson instances with focused guides in total. These are draft instructional notes,
  pending independent subject/language review.
- Replaced the derivative-only overview with antiderivatives plus the power rule; oscillation/damping
  now starts with resonance and damping, with characteristic roots as a mathematical companion.
  Data bias/privacy has separate bias and personally identifiable information videos.
- Removed the commas-in-dialogue match for direct/reported speech. The remaining chronology and
  cause/effect picks were retained after reading the text-structure transcript; each has a focused guide.
- Seven newly verified videos, plus two existing-resource rechecks, were found through rendered Khan
  search/unit pages in the in-app browser. Each new page had a `(video)` document title and a player ID
  read from its youtube-nocookie iframe. Research used one player at a time and saved nine receipts to
  localStorage through a private local notebook. The expanded-outline pass adds ten personally checked pages,
  bringing that notebook to 19 receipts. Shared catalog additions keep their recorded dates and source evidence;
  their reuse is not claimed as a fresh personal verification. URLs, IDs and check dates are in THIRD_PARTY_MATERIALS.md.

## Learner Experience

- Selected topic videos mount immediately, paused. No extra Video button is needed. Only one topic's
  material is mounted; a compound topic has at most three players. Phones use a compact topic selector.
- Existing broad reminders remain available below the focused lesson as optional Key Reminders;
  original reviewer sections, practice, Khan units and college foundations are preserved.
- Back links preserve the selected exam or college program. Bookmarks retain their existing storage keys.
- Returning learners with a saved routine resume it in a new tab. Direct lesson links open their material
  without forcing setup. Home states why a topic was recommended without asserting a diagnosed gap.
- The tour highlights the actual navigation button with a tint, without its former outline/edge or heavy
  surrounding mask. Headings and controls use headline-style title casing: short connecting words
  such as “and”, “of” and “to” (and Filipino “at”, “ng” and “sa”) stay lowercase inside the title.
  First/last words still capitalize. Authored labels, accessible names, prose and mathematical source
  are preserved; native phone-selector labels use the same headline rule.
- Navigation tabs, Home shortcuts, college field/subject cards and topic-check buttons share that
  headline styling. The recovery topic chooser sizes its columns to the available content width,
  uses smaller equation previews and contains long notation inside each card instead of overlapping
  the next subject.

## Evidence Boundaries

Reading, watching, saving and revealing an explanation do not create results, XP, recall evidence,
review streaks or exposure-ledger entries. A self-explanation with an exposed answer is study support.
Broader practice links say explicitly that their checks include related skills. Existing question-video
answer-check gates and exam-result gates remain in place. No saved route, problem version, generator or
mathematical fingerprint was changed.

## Verification and Limits

Final validation on 7 October 2026: `npm test` passed all 180 tests; `npm run typecheck` passed;
`npm run build` generated 691 static pages; `npm run test:browser` passed all 53 scenarios in Edge.
New browser cases verify immediate paused players on desktop/phone, compound resources, written-only
topics, selector replacement, exam-context return and no evidence awarded for activity. Headline labels
and the recovery chooser were checked at 320, 915 and 1536 pixels, including complete equation previews
inside their cards. Every dedicated route is checked in the static export. Source hashes stayed unchanged
during the final suite, and `git diff --check` passed.

The local preview was reopened at `http://127.0.0.1:3052/` and Home was visibly confirmed in the in-app
browser after restarting its server outside the sandbox. It serves the verified export. A real paused
vocabulary player was also manually checked earlier; this does not establish complete playback quality.

Khan titles, player IDs and the relevant loose-fit transcripts were checked. Full playback/caption quality
throughout every resource, independent subject/language review and real learner/retention outcomes were
not verified. Browser acceptance uses deterministic external-player fixtures for the new lesson cases;
it does not certify third-party playback availability. Automated acceptance isolates external players throughout
to test the application's UI and parameters; rendered Khan research and manual in-app review are separate.
The material is an introduction to each topic,
not a claim of exhaustive exam coverage or grade-level certification. The owner authorized pushing
the verified changes from Codex-Reworks to main under Harry Gomez's GitHub identity. This record
accompanies that push; the checks above do not verify the resulting live deployment.
