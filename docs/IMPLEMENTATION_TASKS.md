# Complete study-companion implementation checklist

Status: planning pause requested by the user, 10 September 2026. The full specification is in PRODUCT_IMPLEMENTATION_PLAN.md. Latest source addendum: Study_Companion_Expansion_Addendum_for_Codex (1).md. It matches the later study-companion addendum, which supersedes narrow remedial-only positioning.

This checklist covers the full intended experience. Build in dependency order and keep all areas visible during review.

## Completed preparation and partial work

- [x] Read the independent review, revised answers, and both expansion addenda; confirm the user's final chosen file.
- [x] Preserve the previous deployed project and all existing code work.
- [x] Write the complete product/implementation plan, problem framing, and expanded 15-slide narrative.
- [x] Add durable project entry instructions and this checklist for compaction recovery.
- [x] Implement the initial external-review pass in the working tree: error replay, first-check emphasis, sign variation, input validation, learner summary, teacher-sheet prototype, and shared-device clearing.
- [x] Run 31 tests and a production build for that initial review pass, before the larger companion scaffold.
- [x] Add early shared-study model/provider, Today/Study/Review/Packs views, session wrapper, and recovery integration scaffolding; run a type check after those additions.
- [ ] Complete and validate the current combined tree. The earlier 31-test result is not a claim that the later expanded scaffold passed full verification.
- [ ] Finish expanded branding and all connected screens; no expanded changes have been published yet.

## A. Shared learning state and migration

- [ ] Validate every nested stored structure, recovery snapshot, session task, setting, and imported record.
- [ ] Preserve old question meaning with per-attempt generator versions through migration.
- [ ] Make the global used/exposed-item ledger prevent answer leakage across packs, learning, replays, legacy routes, and later sessions.
- [ ] Test serial reservations, targeted first checks, assistance flags, and reload behavior together.
- [ ] Deduplicate skill review across overlapping packs without inventing a universal ability score.
- [ ] Make ingestion/rewards/session completion idempotent under replay, refresh, and retry.
- [ ] Preserve recoverable backups for unreadable data and provide a usable export/restore path.
- [ ] Clear all intended activity in the current tab and other tabs, including the study provider and old routes; preserve unrelated site/app data.
- [ ] Put local persistence behind a clean adapter for synchronized accounts.

## B. Packs, preparation, and authoring

- [ ] Finish curated packs using all five supported sample areas.
- [ ] Finish custom topic combinations, editable names, optional test dates, and changing priorities.
- [ ] Keep curated pack overrides, shared-pack identity, and imported titles stable and safe.
- [ ] Implement Learn, Review, and mixed Challenge from the same pack/history.
- [ ] Add quiz rehearsal with fresh item families and a useful next-session plan.
- [ ] Finish functional shared pack links with a clear preview and no private progress in URLs.
- [ ] Build source-linked manual card/pack authoring and explicit review/provenance status.
- [ ] Implement permitted document/notes extraction and editable suggestions; keep unreviewed content distinct.
- [ ] Add optional AI-assisted drafting only through an authorized provider/budget; manual authoring remains usable.

## C. Teaching and recovery

- [ ] Finish factor replay at actual desktop/mobile sizes: product, sum, target, adjustment, and explanation.
- [ ] Finish zero-product replay and mixed-sign transfer; ensure it responds to the correct earlier attempt.
- [ ] Add equally meaningful fraction, ratio, graph, and bracket representations.
- [ ] Add “That didn't click” choices: visual, another example, and slower steps.
- [ ] Add structured prediction, error-spotting, explain-the-step, and teach-back tasks.
- [ ] Keep learning available before failure and support available after difficulty.
- [ ] Keep the primary clue action as a fresh investigation; explanation remains learner-accessible.
- [ ] Preserve all original BACKTRACK branches, goal return, confidence handling, equivalent answers, and human-support escalation.
- [ ] Expand mathematical structure within supported families and verify each variant.
- [ ] Replace the long-page vertically centered route with a compact sticky desktop context and usable mobile expansion.
- [ ] Remove duplicate headings and unnecessary copy; keep the mathematical action visually dominant.

## D. Today, rounds, reviewer, and return

- [ ] Build Today from real pack/history/dates rather than sample counts.
- [ ] Make available time, chosen mode, due review, and current goal affect the session queue.
- [ ] Make smaller/rebuild/deeper-support actions actually change workload and retain deferred work.
- [ ] Resume the same active session after navigation/reload and an interruption.
- [ ] Complete finite rounds with varied tasks, independent or supported outcomes, and a clear stop.
- [ ] Finish automatic reviewer creation, maintenance review, manual saves, and due dates.
- [ ] Add understandable scheduling controls, early review, pausing, and rescheduling.
- [ ] Make Rematch use fresh items, original goal context, and honest before/after evidence.
- [ ] Never treat absence alone as forgetting or manufacture delayed outcomes from a clock preview.
- [ ] Add the factual end-of-session note to future you, with an optional personal note.

## E. Engagement and public identity

- [ ] Complete a short name shortlist and basic app/domain/social collision checks; choose a working identity without blocking feature work.
- [ ] Finish the original companion, mark, metadata, and consistent public naming; preserve old URLs and saves.
- [ ] Style all main screens coherently with readable maths, predominantly white surfaces, restrained accents, and at most two families.
- [ ] Implement participation points with duplicate/farming safeguards and clear separation from learning evidence.
- [ ] Finish predictable cosmetic unlocks and functional study-space customization.
- [ ] Add flexible weekly commitments and optional streaks, without loss of learning history or guilt for absence.
- [ ] Finish optional sound, quiet mode, reduced motion, and useful feedback/completion moments.

## F. Sharing, accounts, and circles

- [ ] Finish shared scopes and asynchronous challenge links that work before mandatory signup.
- [ ] Inspect available backend/auth access and actual service requirements; do not provision paid services without authorization.
- [ ] Implement account linking and cross-device persistence without losing local work.
- [ ] Implement real invited circle membership, leaving/removal, and expiring invitation handling.
- [ ] Implement cooperative goals from actual contributions and keep individual misconceptions private.
- [ ] Implement preset encouragement/reactions with appropriate access control.
- [ ] Implement optional comparable challenges/duels and server-checked reward events; speed is optional.
- [ ] Test owner/member/nonmember/removed-member access and concurrent/replayed submissions.
- [ ] Keep illustrative data isolated; do not call local or hard-coded activity live group progress.

## G. Khan and teacher/creator routine

- [ ] Verify mapped Khan resources and prominent relevance labels across packs and study modes.
- [ ] Verify the 2:22–3:56 factor segment, replay/continuation, and official-source fallback.
- [ ] Preserve the learner's place after opening official exercises.
- [ ] Keep opens, self-reports, teacher-checked reports, and local independent answers distinct.
- [ ] Finish weekly class pack/assignment instructions and teacher action sheets.
- [ ] Preserve separate sheets across class-goal and week changes; prevent sample-class loading from overwriting real rows.
- [ ] Complete learner return tickets, imports, CSV export, and safe field validation.
- [ ] Verify current Khan reporting/content-use requirements; do not imply automatic synchronization or endorsement.

## H. Campaign and product entry

- [ ] Define twelve variants: three skills × two audience framings × two hooks.
- [ ] Write at least three complete scripts/storyboards with original mathematics and clear audience differences.
- [ ] Adapt the concepts for YouTube Shorts, TikTok, and Facebook Reels.
- [ ] Verify platform/account link capabilities and provide a short challenge-code fallback.
- [ ] Implement each exact challenge/pack link and graceful handling of unknown codes.
- [ ] Preserve promotional context but use a fresh related item for independent evidence after revealed answers.
- [ ] Connect challenge → explanation/practice → Khan → pack/reviewer → next session/share.
- [ ] Record acquisition stages separately and keep public activity separate from the school evaluation.
- [ ] Produce assets and instructions; do not post, contact people, or buy ads without authorization.

## I. Pitch, documents, final delivery

- [ ] Reverify challenge-specific rules and executive-summary limits; do not substitute another Enactus track.
- [ ] Rewrite all seven <=300-word narratives around the expanded companion and preserved recovery core.
- [ ] Update product, pilot, business, evaluation, source/claims, brand, campaign, architecture, and status documents.
- [ ] Keep the school pilot's defined recovery outcome and fair comparison; add distinct repeat-use and sharing measures.
- [ ] Edit the same Canva design to the exact expanded 15-slide sequence in the plan.
- [ ] Put the full clickable demo invitation on slide 8, preserving/test-adjusting the working QR and links.
- [ ] Preserve the official UP Manila logo and apply the chosen product identity on every slide.
- [ ] Visually inspect every slide and every changed document; check hierarchy, content, wording, links, and metadata.
- [ ] Export the PDF and editable embedded-font PPTX; verify 15 pages/slides and real editability.
- [ ] Replace the existing Drive files, refresh the source package/link index, and keep handoff text in the chat.
- [ ] Run the current tests, type check, build, and connected browser journeys across mobile/desktop/keyboard/accessibility states.
- [ ] Conduct a judge pass followed by actual improvements to the entry.
- [ ] Commit/push verified project work, verify Vercel deployment, and check the live entry points.
- [ ] Report actual completed/remaining work. Do not submit the application or invent external commitments/results.

## Resume point

Planning is the latest active user request. Deliver the full connected plan in the chat with a link to the detailed document. Preserve uncommitted work. On subsequent implementation, begin with the shared-state/migration contract and test harness, then follow the complete sequence; do not finish one feature and lose the remaining product areas.
