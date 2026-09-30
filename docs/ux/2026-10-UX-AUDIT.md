# UX audit, October 2026

Walked every route of the September build at 375 px and 1280 px (static export, fresh device,
welcome tour dismissed). Screenshots were kept in the private `.refs/ux-audit/` folder.
The product has changed: Khanpanion is now a free college program with two sides,
"Get into college" (entrance exam review) and "Start college strong" (freshman bridge).
Each route is judged against that job, not against the old study-companion job.

## What confuses across the whole site

1. **No reason to come back.** Nothing on the first screen names a date, an exam or a goal.
   The home page asks "What are we learning?" and offers four equal buttons and five packs.
   A senior high school student preparing for the UPCAT has no door that says so.
2. **Two navigations on phones.** A "Menu" button in the header and a five-tab bottom bar list
   the same five links. The bottom bar also covers content at the foot of long pages.
3. **Everything is a card on white.** Packs, Today, Study and Review share one card grid,
   one type scale and one white surface. Screens are hard to tell apart in a screenshot.
4. **Jargon.** "Pack", "route", "recovery", "evidence", "Rematch", "return ticket" and
   "destination" are internal words. Students think in exams, subjects and mistakes.
5. **Explore is a separate world.** It is a long scroll of thirteen full scenes with its own
   tour, its own tabs and a console error stream (an SVG wave path emits numbers in exponent
   form many times per second).
6. **The first question is four taps and a time picker away.** Landing to first answer took
   about 40 seconds on desktop and longer on a phone because of the tour dialog.
7. **The welcome tour blocks the first visit.** A modal opens before the learner sees anything.
8. **Desktop is a stretched phone.** At 1280 px the same single column of cards sits in a wide
   frame; nothing uses the width for a second pane (plan beside today, navigator beside the item).

## Route by route

| Route | Job in the new product | What confuses | Decision |
| --- | --- | --- | --- |
| `/` | Landing for new visitors; Today for returning ones | Four equal CTAs, packs grid, no exam | **Rebuild.** First visit shows the two doors, a live 3-question sprint and the credibility strip. With a saved pledge it becomes Today. |
| `/study` | Choosing a practice session by topic | Duplicates `/` almost pixel for pixel | **Keep, fold** under Plan as "Practise a topic". |
| `/study/session` | Running a session | Fine once started; "round", "rehearsal" jargon | **Keep.** Mission step 2 lands here. |
| `/packs` | Topic groups and quiz dates | "Pack" is an internal idea; the exam date now belongs to the pledge | **Keep** working; out of the nav. Linked from Plan. |
| `/review` | Spaced review | Good job, weak entry point | **Keep.** Mission step 1 ("quick recall") opens it. Mock misses feed it. |
| `/explore` | Public short-video style feed | Long, noisy, console errors | **Keep** as a public feed for social traffic, out of the nav. Its job for learners moves to the Daily 3 on Today. |
| `/khan` | Bring a Khan activity | Header button competes with nav | **Keep.** Linked from Plan units, not the header. |
| `/start`, `/start/*` | Mistake diagnosis for one topic | Opens with "How much time today?" | **Keep** every route. Mock "Fix this" and bridge placement open them. |
| `/try/factors` | One-question try | Fine | **Keep.** |
| `/demo` | Old entry | Duplicate of `/` | **Keep** unchanged so printed QR codes work. |
| `/challenge` | Public challenge | Useful mechanic, unclear audience | **Keep.** Group links it. |
| `/together` | Play together on one phone | Overlaps the new Group | **Keep**, linked from Group. |
| `/classrooms`, `/schools` | Teacher routine | Replaced by the coach kit | **Keep**, both link to `/coach`. |
| `/how-it-works`, `/evidence` | Explaining the engine | Written for judges, not students | **Keep**, linked from About. |
| `/about` | Team and coach | Thin, no coach bio | **Rebuild** with the coach bio, the team and Harry's story. |
| `/route` | Legacy redirect | None | **Keep.** |
| `/create` | Making a pack from notes | Power tool, niche | **Keep**, linked from Packs. |

## Information architecture as built

- Phones: a bottom nav with Today, Plan, Mocks, Reviewer, Group. The header "Menu" button is removed.
- Desktop: the same five in the top nav, plus the side switch and the "Me" menu. Today, Plan and the
  exam hall use two panes at 1024 px and wider.
- New routes: `/plan`, `/mock`, `/mock/take`, `/mock/result`, `/reviewer`, `/reviewer/[chapter]`,
  `/bridge`, `/bridge/[program]`, `/admissions`, `/group`, `/coach`, `/me`.
- Where the audit changed the starting proposal:
  - **Explore is not a tab.** The Daily 3 on Today carries its learner job (a quick warm-up)
    without the thirteen-scene scroll.
  - **The side switch appears only once both sides are active.** A learner who picked one door
    sees one set of labels.
  - **Mocks and Reviewer stay in the nav for bridge learners too**, because the placement check and
    the reviewer chapters serve them.
  - **The welcome tour no longer opens by itself.** The landing is the tour; the old tour stays
    reachable from Me.
