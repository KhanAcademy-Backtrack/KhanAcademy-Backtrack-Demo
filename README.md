# BACKTRACK — website + interactive judge demo

An adaptive learning-recovery navigator, built as a public website with a working
no-sign-in interactive demo. Prepared for the Khan Academy Education Impact
Challenge (KEIC) 2026.

**Status: concept / prototype.** No pilot has run, no school has committed, no
learner has used it, and no learning outcome has been measured. Nothing on the
site claims otherwise.

---

## Running it

There is **no build step and no dependencies**. It is plain HTML, CSS and
JavaScript, so any static server works:

```bash
python -m http.server 8123
```

Then open <http://localhost:8123>.

## Deploying

The repository is a zero-config static site. On Vercel:

1. Import the repository.
2. Framework preset: **Other**.
3. Build command: none. Output directory: repository root.

`vercel.json` sets `cleanUrls` so `/demo/index.html` is served at `/demo`, and
adds a few baseline security headers. Direct navigation to and refresh of nested
routes works because every route is a real directory with a real `index.html` —
there is no client-side router to fall out of sync.

---

## Structure

```
index.html              Landing page (10 sections)
demo/                   The interactive judge demo
how-it-works/           Destination → check → route → Khan → prove → recalculate
schools/                Institutional implementation + teacher summary
evidence/               External research, hypotheses, measurement, financials
about/                  Project stage, team, AI disclosure
start/brackets/         Topic deep-link entry (where a reel lands)
404.html
vercel.json
assets/
  base.css              Tokens, typography, page chrome
  route.css             The route visual system
  site.css              Landing + content page compositions
  demo.css              Demo tool UI
  route.js              Route renderer (SVG, path morphing)
  site.js               Nav, hero interaction, scroll-linked route
  demo.js               Demo state machine + question bank
```

## The route renderer (`assets/route.js`)

The route is the product's central visual language, so it is a real renderer
rather than a picture. It takes a model:

```js
{ nodes: [ { id, label, note?, status, kind?, branch?, active? } ],
  annotation: { nodeId, text, tone } }
```

and draws one continuous stroke through the nodes. Nodes marked `branch: true`
sit below the spine, so prerequisite work reads as a detour that rejoins.

Shape changes are **morphed**, not swapped: both the old and new paths are
resampled to a fixed number of points and interpolated, so the visitor watches
the route change. `collapse(ids)` fades steps out before re-laying out — that is
what a shortcut looks like.

It switches to a vertical composition below `compactAt` px, and always emits a
text equivalent (`.routeview-summary`) carrying the same state, so the route is
available to screen readers and when motion is disabled.

Statuses: `unknown`, `checked`, `uncertain`, `practice_suggested`,
`capability_unlocked`, `reached`, `ready_to_try`. Every one carries a glyph and a
word as well as a colour.

## The demo state machine (`assets/demo.js`)

An explicit screen machine over a data-driven question bank, with an undo stack
wired to both the in-page Back button and browser Back.

Two invariants the file exists to protect:

1. **Correctness is decided by mathematics alone.** Both valid first steps for
   `3(x − 2) = 15` are accepted — distributing *and* dividing through by 3.
   Wrong answers never become success.
2. **Self-reported confidence changes what gets checked next, never whether an
   answer was right.** Correct + confident removes two review steps; correct but
   unsure removes one and keeps one to verify; wrong + confident triggers a
   contrasting case to separate a misconception from a slip; wrong + "never
   learned this" skips the interrogation and goes to the foundation.

Nothing typed by a visitor is ever evaluated. The single free-text answer is
normalised and compared, never parsed as an expression.

State is kept in `localStorage` under `backtrack.demo.v1` (wrapped in
try/catch), and "Clear progress" removes it. There is no login, no server, no
learner record and no generative AI call anywhere in the demo.

---

## Honesty constraints deliberately encoded

- **Khan Academy deep links are labelled "Resource mapping preview."** Specific
  lesson URLs could not be verified from the build environment — Khan serves an
  identical JavaScript shell for every path, including deliberately invalid ones
  — so the demo links to Khan's own search rather than asserting a deep link
  that might be wrong. If a URL is later verified by hand, replace the link in
  `demo.js` (`SCREENS.learn`) and drop the preview tag.
- **Opening a Khan resource never counts as learning.** A step is only marked
  repaired when a fresh question is answered.
- Pilot reach is written as *proposed*: approximately 80–120 evaluated learners
  across 2–3 cohorts, subject to agreements. Any 120/3 figure is tagged
  "Planning target — not committed reach."
- No institutional price is published, because none has been validated.
- The illustrative classroom on `/schools` is labelled synthetic on the surface
  itself, not only in a footnote.
- Guided mode is visibly fictional throughout via a persistent banner.
- KEIC judging weights on `/evidence` are the ones published on the official
  challenge page as checked at build time (Meaningful Khan Academy Integration
  **15%**, Pitch & Q&A **10%**) — these differ from an earlier internal brief
  that recorded Khan integration at 25%.

## Accessibility

Keyboard-completable throughout; visible focus is never removed; every equation
carries a spoken `aria-label`; status is announced through a live region; colour
is never the only signal; no drag-only interaction; reduced motion is respected
and preserves the same meaning. Targets are at least 44px.

---

## Licence / attribution

Independent project. Not affiliated with, endorsed by, or partnered with Khan
Academy, Khan Academy Philippines, Enactus Philippines, or any school.
