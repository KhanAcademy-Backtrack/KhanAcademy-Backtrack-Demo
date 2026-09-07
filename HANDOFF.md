# BACKTRACK — developer handoff

**Repository:** https://github.com/KhanAcademy-Backtrack/KhanAcademy-Backtrack-Demo (private)
**Branch:** `main` · **Last commit at handoff:** `a8e26b8`
**Written:** 7 September 2026

This document is for whoever picks the project up next. It covers what exists,
what is deliberately *not* claimed, what is still open, and the two or three
things that are easy to break by accident.

---

## 1. What this is

A public website plus a working, no-sign-in interactive demo of BACKTRACK — an
adaptive learning-recovery navigator — built for the Khan Academy Education
Impact Challenge (KEIC) 2026.

**Project status: concept / prototype.** No pilot has run, no school has
committed, no learner has used it, and no learning outcome has been measured.
The site says so in several places on purpose. Do not quietly upgrade any of
that language.

### Deadline

Applications close **18 September 2026**. Nationals are 9–10 October 2026 at
De La Salle University, Manila.

---

## 2. Running it

**There is no build step and no dependencies.** Plain HTML, CSS and JavaScript.

```bash
python -m http.server 8123
```

Then open <http://localhost:8123>. Any static server works.

This was a deliberate choice: the machine it was built on had no Node, no npm
and no `gh`, so a framework build could not have been verified locally. The
side benefit is that Vercel needs no toolchain and the site cannot break from a
dependency update.

---

## 3. Deployment status

| Step | State |
|---|---|
| GitHub repository | **Done** — pushed to `main`, verified remote matches local |
| Collaborator **M4tyu633** added | **Not done** — needs an org owner |
| Connected to Vercel | **Not done** |
| Production URL | **Not done** |
| Auto-deploy on push | **Not done** |

### To deploy

Import at <https://vercel.com/new>. Framework preset **Other**, build command
empty, output directory `.` (repository root). `vercel.json` already sets
`cleanUrls` and baseline security headers.

**Known snag:** Vercel's Hobby tier has historically restricted deploying
repositories owned by a GitHub *organisation*, and this repo is both org-owned
and private. This has not been tested. If it blocks you, the options are to
deploy from a personal fork, or to move the project to a paid plan.

### To grant access

Add **M4tyu633** at
[Settings → Collaborators and teams](https://github.com/KhanAcademy-Backtrack/KhanAcademy-Backtrack-Demo/settings/access).
The repo being private means public access comes from the Vercel URL, not from
GitHub — that is fine, and the handoff brief only requires the *deployed* URL
to be publicly reachable without judge credentials.

---

## 4. Layout of the code

```
index.html              Landing page
demo/                   The interactive judge demo
how-it-works/           Destination -> check -> route -> Khan -> prove -> recalculate
schools/                Institutional implementation + teacher summary
evidence/               External research, hypotheses, measurement, financials
about/                  Project stage, team, AI disclosure
start/brackets/         Topic deep link (where a short-form video lands)
404.html
vercel.json
assets/
  base.css              Tokens, typography, page chrome
  route.css             The route visual system
  site.css              Landing + content page compositions
  demo.css              The demo's "learning instrument" UI
  route.js              Route renderer (SVG, path morphing, selectable nodes)
  site.js               Nav, hero interaction, scroll-linked route
  demo.js               Demo state machine + question bank
```

Every route is a real directory with a real `index.html`. There is no
client-side router, which is why direct navigation, refresh on a nested route,
and browser Back/Forward all work without any special handling.

---

## 5. The route renderer — `assets/route.js`

The route is BACKTRACK's identity, so it is a real renderer rather than a
picture. It takes a model:

```js
{ nodes: [ { id, label, note?, status, kind?, branch?, active? } ],
  annotation: { nodeId, text, tone } }
```

and draws **one continuous stroke** through the nodes. Nodes with
`branch: true` sit below the spine, so prerequisite work reads as a detour that
rejoins rather than as a separate object.

**Shape changes are morphed, not swapped.** Both the old and new paths are
resampled to a fixed number of points and interpolated, so the viewer watches
the route recalculate. `collapse(ids)` fades steps out before re-laying out —
that is what a shortcut looks like.

Two variants:

- `variant: 'ribbon'` — the full-width route across the top of the demo. Bigger
  marks, readable labels, nodes that are focusable buttons. Selecting one
  explains why that step is on the route.
- `variant: 'rail'` (default) — the small inline illustration used inside
  marketing sections.

Below `compactAt` px it switches to a vertical composition. When the nodes are
*not* interactive it emits a text equivalent (`.routeview-summary`) carrying
the same state, so the route survives screen readers and disabled motion.

### Status vocabulary

`unknown` · `checked` · `uncertain` · `practice_suggested` ·
`capability_unlocked` · `reached` · `ready_to_try`

Each carries a glyph, a short word (Next / Kept / Checking / Practice / Ready /
Reached / Open) and a plain reason. **Never introduce grading language** —
no "mastered", "failed", "weak", or "Grade 6 gap".

---

## 6. The demo state machine — `assets/demo.js`

An explicit screen machine over a data-driven question bank (`BANK`), with an
undo timeline indexed by browser history depth so the in-page Back button,
browser Back and browser Forward all agree.

### Two invariants — do not break these

**1. Correctness is decided by mathematics alone.**
Both valid first steps for `3(x − 2) = 15` are accepted: distributing to
`3x − 6 = 15` *and* dividing through by 3 to `x − 2 = 5`. Marking the second
one wrong because the lesson "expected" distribution would be false
mathematics, and the whole product is about not doing that to learners.

**2. Self-reported confidence changes what gets checked next — never whether an
answer was right.**

| Answer + report | What the route does |
|---|---|
| Correct + confident | Removes two review steps |
| Correct + "kind of remember" | Removes one, keeps one to verify |
| Correct + "don't know" | Removes nothing; verifies later |
| Wrong + confident | Contrasting case, to separate a misconception from a slip |
| Wrong + "forgot" / "don't know" | Probes one step earlier before adding review |
| Wrong + "never learned this" | Straight to the foundation — no interrogation |

**Nothing a visitor types is ever evaluated.** The single free-text answer on
the destination task is normalised and string-compared. There is no `eval`, no
`new Function`, and no expression parser anywhere in the codebase.

### Persistence

`localStorage` under `backtrack.demo.v1`, wrapped in try/catch. "Clear
progress" removes it. No login, no server, no learner record, no generative AI
call anywhere in the demo.

---

## 7. Design system

The demo was rebuilt in September 2026 around one rule: **the mathematics is
the interface.** Three layers on every screen — the anchor (destination +
route, quiet), the work (the current learning moment, loud), and detail (why a
step is on the route, only when asked for).

### Principles borrowed

| Reference | Principle |
|---|---|
| Brilliant | The active problem *is* the page; chrome shrinks around it |
| Nicky Case | One object at a time, centred; you act on it before anything advances |
| Linear | Obsessive consistency — one focal point, predictable control positions |
| Desmos | The mathematical surface takes the width; chrome is a thin strip |
| Khan Academy | Familiar, learner-safe progress language |

*Caveat for whoever continues:* Linear and Khan Academy never rendered in the
build environment's browser (blank / bot-gated), so those two principles came
from prior knowledge rather than a fresh look. Worth doing properly.

### Tokens (`assets/base.css`)

```css
--page:#F7F6F2;  --surface:#FFFFFF;  --ink:#182B32;   --muted:#526168;
--line:#D9DFDA;  --route:#087E8B;    --success:#277A56; --caution:#A56616;
```

`--route` (4.46:1) and `--caution` (4.31:1) on `--page` fall just under AA for
small text, so they are used for strokes, marks and large type only.
`--route-text` (6.20:1) and `--caution-text` (5.79:1) carry small text. If you
add a colour, check it in the actual combination.

Two fonts only: **Source Sans 3** (interface, and all mathematics) and
**Fraunces** (editorial statements, sparingly). Never put a decorative serif
inside an equation or a control.

### The reward moment

When a fresh prerequisite check passes, the destination equation at the top of
the screen goes from dimmed + `Blocked` to full ink + `In reach`, over roughly
800ms of sequenced beats. **The reward is the route opening** — there is no
confetti, no XP, no badge, no streak, and there must not be.

---

## 8. Honesty constraints encoded in the build

These are the easiest things to break by accident, and the most damaging if a
judge notices. Each one is deliberate.

- **Khan Academy deep links are labelled "Resource mapping preview."** Specific
  lesson URLs could not be verified from the build environment — Khan serves an
  identical ~3KB JavaScript shell for *every* path, including deliberately
  invalid ones, and its pages are bot-gated. So the demo links to Khan's own
  search rather than asserting a deep link that might 404 in front of a judge.
  **If you verify a real lesson URL by hand, swap it into `SCREENS.learn` in
  `assets/demo.js` and remove the preview tag.**
- **Opening a Khan resource never counts as learning.** A step is only marked
  repaired when a fresh question is answered. Do not add "visited" tracking
  that implies otherwise.
- **Pilot reach is written as proposed:** approximately 80–120 evaluated
  learners across 2–3 cohorts, subject to agreements. Any 120/3 figure carries
  "Planning target — not committed reach".
- **No institutional price is published**, because none has been validated. The
  ₱100,000 grant allocation on `/evidence` is labelled a planning allocation,
  not a quotation.
- **The illustrative classroom on `/schools` is labelled synthetic on its face**,
  not only in a footnote.
- **Guided mode is visibly fictional** via a persistent banner.
- **No fabricated team.** `/about` lists Matthew Labrador as project owner and
  explicitly says other members and the faculty adviser are not yet confirmed.
  No university branding is used.

### KEIC judging weights — a real discrepancy

The internal brief this project was built from recorded **Meaningful Khan
Academy Integration at 25%**. The official challenge page, checked at build
time, says **15%**, with **Pitch & Q&A at 10%**:

| Criterion | Weight |
|---|---|
| Needs assessment | 15% |
| Business principles & financials | 15% |
| Innovation | 15% |
| Meaningful Khan Academy integration | 15% |
| Potential to scale | 15% |
| Potential positive impact | 15% |
| Pitch & Q&A | 10% |

`/evidence` uses the verified figures. **If the pitch deck was built around
25%, it needs revisiting** — that is a competition-strategy decision, not a
website one.

---

## 9. Accessibility

Keyboard-completable throughout. Visible focus is never removed. Every equation
carries a spoken `aria-label`. Status is announced through a live region.
Colour is never the only signal — every state carries a glyph and a word. No
drag-only interaction. Reduced motion is respected and preserves the same
meaning. Targets are at least 44px.

The direct-manipulation widget on the learning screen uses real `<button>`
elements, so it works with a keyboard without any custom key handling.

---

## 10. How to re-verify after changing anything

There is no test runner. Verification was done by driving the real page. The
fastest equivalent is to open `/demo` and check:

1. **Both valid first steps are accepted** — `3x − 6 = 15` *and* `x − 2 = 5`
   both lead to "Shortcut found", not to a gap.
2. **A correct-first visitor never gets an invented gap** — the route should
   contain no `rev_*` nodes after answering correctly with confidence.
3. **Wrong answers stay wrong** — a wrong fresh-check answer keeps you on the
   question with a specific hint; it never advances.
4. **Confidence changes the route, not correctness** — walk the table in §6.
5. **The learning screen gates continuation** until *both* terms are selected.
6. **Browser Back, Forward and the in-page Back button agree.**
7. **Mobile at 375px** — route collapses to a control, no horizontal overflow,
   equations do not clip.
8. **Console is clean** on all 8 pages.

A link/asset audit script pattern lives in the project history; the quick
version is to grep every `href`/`src` in the HTML and confirm each site-
absolute path resolves to a real file. All links must be site-absolute — a
relative link breaks on nested routes like `/start/brackets`.

---

## 11. What is not done

Ranked by how much it matters.

1. **Deployment.** Vercel, the public URL, auto-deploy, and adding M4tyu633.
   See §3.
2. **The content pages have not been redesigned.** The demo and the landing
   hero were rebuilt around the new "learning instrument" visual system in
   September 2026. `/how-it-works`, `/schools`, `/evidence`, `/about` and
   `/start/brackets` still use the earlier editorial system. It is coherent and
   readable, but it does not share the new language. This is the largest
   remaining design job.
3. **A real Khan Academy lesson URL has never been verified.** See §8.
4. **The rail-vs-ribbon layout comparison was not built as two live
   prototypes.** The ribbon was chosen because the previous build was
   effectively the rail and was rejected. Defensible, but not a controlled
   comparison.
5. **Linear and Khan Academy were never actually inspected** for the visual
   study. See §7.
6. **No content beyond brackets.** `/start/fractions`, `/start/ratios` and
   `/start/graphs` are listed as planned and are not built. Only the brackets
   entry exists, which is what the brief asked for.

---

## 12. Things not to do

Collected from the original brief, because they are the failure modes this
project is most likely to drift into:

- Do not turn BACKTRACK into "a Grade 8 algebra intervention". Math-first pilot,
  broader learning-recovery vision.
- Do not claim BACKTRACK invented adaptive learning, prerequisite graphs,
  knowledge tracing or AI tutoring. It did not.
- Do not claim a mathematically guaranteed shortest learning path. The safe
  formulation is *the smallest evidence-supported recovery route relevant to
  the learner's current destination*.
- Do not claim BACKTRACK can detect AI assistance remotely. It cannot.
- Do not assume a public real-time Khan Academy API exists.
- Do not add streaks, XP, badges, confetti, loot boxes, countdowns, autoplay or
  shame notifications. The retention hypothesis is that visible route
  compression and capability unlocks can do this work honestly — that is the
  thing being tested, and adding dark patterns would destroy the claim.
- Do not fabricate pilot results, partner schools, testimonials or user counts.

---

## 13. Open questions for the team

1. Does the pitch deck need revisiting for the 15% vs 25% Khan-integration
   weighting? (§8)
2. Who is the faculty adviser and who are the other two students? `/about`
   deliberately leaves them blank until confirmed.
3. Which grade level and which lesson destinations will partner schools
   actually want? The demo uses Grade 8 brackets as a reference scenario, and
   the site is written so this can change without rework.
4. Is a Vercel paid plan available if the org-repo restriction bites? (§3)
