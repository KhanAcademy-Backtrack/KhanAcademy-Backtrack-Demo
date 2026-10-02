# Quizlet interface study and the calm study shell

Research note, 3 October 2026. Internal only: competitor research stays out of the learner-facing
site, the deck and the application. Nothing here is copied code, artwork, wording or branding. We
studied interaction and layout patterns, then rebuilt them in Khanpanion's own palette, type and copy.

## What was examined

Pages were viewed logged-out in the in-app browser, with non-essential cookies rejected:

- `quizlet.com` home (marketing header and hero)
- a public set page (`/9992386/algebra-1-flashcards`): title block, inline flashcard, study-mode tiles,
  the inline multiple-choice "Learn" preview, and the term list
- full-screen Flashcards mode (`/9992386/flashcards`)

Learn mode and Test mode require an account and were not opened. A bot check had to be passed by
the owner; it was not bypassed. Measurements below were read from computed styles on the live page.

## Measured tokens

| Element | Quizlet value |
| --- | --- |
| Page canvas | `#F6F7FB` (a cool off-white), text `#282E3E`, 16 px / 26 px |
| Page title | 24 px, 700, normal tracking |
| Study card | white, 16 px radius, `0 0 32px rgba(40,46,62,.1)`, no border |
| Answer tile | 2 px solid `#EDEFF4` border, 8 px radius, 16 px padding, 16 px regular text, ~60 px tall |
| Small label ("Choose an answer") | 14 px, 600, secondary grey `#586380` |
| "Don't know?" | 14 px, 600, text link, centred below the tiles |
| Prompt text | 20 px regular in a card; 32 px regular on a full-screen flashcard |
| Full-screen card | ~884 × 584 px at 1280 px wide; controls in one row underneath |

## Patterns that make it calm

1. **One quiet canvas.** Everything sits on a near-white cool grey. White cards are the only surfaces.
   Cards use a soft diffuse shadow and no border.
2. **Small, ordinary headings.** The page title is 24 px. Hierarchy comes from spacing, not size or colour.
3. **Study mode removes the site.** Flashcards mode has no site navigation at all. A thin top bar shows
   the mode on the left, `1 / 60` in the centre and a close ✕ on the right. Below are one card and
   one row of controls.
4. **The question is the page.** In a large white card the prompt is regular weight, and the choices
   are plain bordered tiles with no decoration.
5. **Feedback replaces the label in place.** After answering, the small "Choose an answer" label
   becomes the feedback sentence. The correct tile gets a check, the chosen wrong tile gets a ✕, the
   others fade, and one full-width Continue button appears. The layout does not jump and there is no modal.
6. **The escape hatch is always there and quiet.** "Don't know?" is a small text action under the
   choices. It is never hidden.
7. **One primary action per view.** Secondary actions are icon buttons or text links.
8. **Keyboard first.** Arrow keys and space drive the cards, and the choices take number keys.

## Distractions noted and not adopted

Their logged-out pages carry advertising, sign-up interstitials, a yellow sign-up button, and promo
carousels for games. These are exactly the "overwhelming" parts and have no place in Khanpanion.

## How Khanpanion applies it (the calm study shell)

Within the existing constraints (green `#14BF96`, white, navy `#0A2A66` plus tints, Plus Jakarta Sans
and STIX Two Text only, rectangular controls, no oval UI chrome):

- **Canvas** `#F6F8FC` (navy tint), white cards with 16 px radius and `0 0 32px rgba(10,42,102,.08)`.
- **Header** is white with a hairline rule. The current tab is marked by navy text and a green bar
  under it instead of a filled green block. Guide and Me become quiet, borderless actions. The phone
  bottom bar is white too.
- **Page headers** lose the navy band. They now have a 26–30 px navy title and a short secondary
  line on the canvas.
- **Exam hall and practice are a focus mode.** The canvas is light, a slim top bar shows the title
  with a close ✕ on the left, `n / total` with a progress bar in the centre, and the timer and
  Pause on the right. There is one centred white question card, a quiet question map, and Back and
  Next in a white bottom bar.
- **Questions** use plain 2 px tiles and a small "Choose an answer" label that becomes the feedback
  line after Check. The key gets a green check and a wrong pick gets a navy ✕ (the palette has no
  orange). Number keys 1–4 or letters A–D choose an answer in the exam hall and Daily 3. "I don't
  know yet" and all four confidence choices stay visible.
- **Daily 3** loses its three-statistic dashboard in favour of `Question n of 3 · Subject` and a
  segmented progress bar.
- **Home** leads with one thing to do (Daily 3 for exam goals, the next topic otherwise). The week,
  the reviewer and topic changes are quieter, secondary cards.

Learning-evidence rules, saved data, route URLs, accessible names and test hooks are unchanged.
