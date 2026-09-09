# BACKTRACK

**The shortest path back to where your class is now.**

An adaptive learning-recovery navigator, built as a public website with a
working, no-sign-in interactive demo. Prepared for the Khan Academy Education
Impact Challenge (KEIC) 2026.

**Live:** https://backtrack-five.vercel.app

> **Status: concept / prototype.** No pilot has run, no school has committed,
> no learner has used it, and no learning outcome has been measured. Nothing on
> the site claims otherwise, and several pages say so explicitly.

---

## Running it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static export into `out/` |
| `npm run typecheck` | `tsc --noEmit` |

## Stack

Next.js 15 (App Router, `output: 'export'`), React 19, TypeScript, Tailwind 4,
Motion. No server, no database, no API, no model call. First load is roughly
103–176 kB depending on the page.

Static export is deliberate. The product is meant to make sense in schools with
shared devices and scheduled connectivity, so the whole site can be served from
a CDN or a local cache.

## Layout

```
src/
  app/                     one directory per route, all statically exported
    page.tsx               the cover and the argument
    demo/                  the interactive demo
    how-it-works/  classrooms/  evidence/  about/  start/quadratics/
  components/
    route/RouteMap.tsx     the signature object: a morphing SVG route
    math/                  math typesetting, and the two hands-on repairs
    demo/                  demo shell, anchor, screens, Khan checkpoint
    home/                  cover, compounding gap, loop, class spread
    site/                  header, footer, section primitives, atmosphere
  lib/
    curriculum.ts          destination, skills, question bank, Khan resources
    demo-machine.ts        pure reducer, plus the route derived from state
    route-model.ts         route types and the status vocabulary
    route-geometry.ts      layout, cubics, arc-length resampling
```

## The two rules the demo exists to protect

**1. Correctness is decided by mathematics alone.** Both valid first steps for
`x² + 7x + 12 = 0` are accepted: factoring to `(x + 3)(x + 4) = 0` *and* the
quadratic formula. Marking the second wrong because the lesson expected the
first would be false mathematics, and not doing that to learners is the whole
product.

**2. Self-reported confidence changes what gets checked next, never whether an
answer was right.** The full mapping is in `applyConfidence` in
`src/lib/demo-machine.ts`.

Nothing a visitor types is evaluated. The one free-text answer is normalised
and compared against expected values. There is no `eval`, no `new Function`,
and no expression parser anywhere in the codebase.

## What the route stroke means

Three states, and they are not interchangeable:

- **covered** — solid mint, up to the last stop actually demonstrated
- **the leg you are on** — solid, in that stop's own colour
- **ahead** — faint and dashed, because it is not the learner's yet

A stop marked *Repair* is never painted in the colour of completed route.

## Honesty constraints encoded in the build

These are easy to break by accident and damaging if a judge notices.

- **Khan Academy links are real.** Every URL in `curriculum.ts` was opened on
  khanacademy.org and its page title checked. There is still no API
  relationship, no partnership and no endorsement, and the checkpoint says so.
- **Opening a Khan resource never counts as learning.** A stop is only marked
  repaired when a fresh question is answered inside BACKTRACK.
- **Pilot reach is written as proposed:** approximately 80–120 evaluated
  learners across 2–3 cohorts, subject to agreements.
- **No institutional price is published**, because none has been validated. The
  ₱100,000 allocation on `/evidence` is labelled a planning allocation.
- **The illustrative classroom is labelled synthetic on its face.**
- **Guided mode is visibly fictional** via a persistent banner.
- **No fabricated team.** `/about` says which members are unconfirmed.
- No streaks, no XP, no badges, no confetti, no countdowns, no autoplay. The
  retention hypothesis is that visible route compression can do that work
  honestly, and that hypothesis is the thing being tested.

## Deploying

The Vercel project is linked and deploys with:

```bash
npx vercel deploy --prod --yes
```

Auto-deploy from GitHub is **not** connected: Vercel's Hobby plan does not
support linking a private repository owned by an organisation. The options are
to make the repository public, mirror it to a personal account, or upgrade.
