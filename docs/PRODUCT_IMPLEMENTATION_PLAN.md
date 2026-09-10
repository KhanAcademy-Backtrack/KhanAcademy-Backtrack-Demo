# Study companion: complete product and implementation plan

Planning revision: 10 September 2026. Authoritative brief: `Study_Companion_Expansion_Addendum_for_Codex (1).md`. The user explicitly requested a thorough plan before further implementation. Existing work is preserved; this document does not claim the expanded product is already finished or deployed.

## 1. Product decision

Build an everyday study companion that prepares a useful next session, helps a difficult idea click, and remembers what deserves another look. BACKTRACK remains its recovery engine: the current task stays visible while the learner investigates an obstacle, receives appropriate support, and returns with fresh evidence.

The whole product must welcome three starting conditions: learning something new, keeping up or preparing ahead, and getting unstuck. Failure is one useful signal, not the entrance requirement.

The working public-name direction is **Dunlo**, with a bookmark companion and a predominantly white, readable interface. The name is a coined working direction inspired by learning and returning to useful work. Basic searches have not surfaced an obvious study app using it in the inspected results; this is not proof of domain, social-handle, or trademark availability. Tandio has clear existing app collisions. Finish focused name/domain/social checks before applying the identity everywhere. Keep the existing repository, hosting account, URLs, and storage compatibility.

### What makes the product coherent

The unit of value is not a video, flashcard, streak, or route animation. It is **a useful study session that improves the next one**.

A pack supplies the intended scope. A session turns that scope and the learner's history into a manageable set of actions. An explanation helps with a specific idea. Fresh checks show what can be done without that support. The reviewer carries useful steps forward. The companion makes the routine inviting. Friends share scope and encouragement while each learner keeps their own support.

## 2. The problem we will present

Do not lead with a shortage of content, a supposedly universal short attention span, or the claim that Khan only hosts videos. The stronger problem is the gap between spending time studying and knowing what to do next.

Use three everyday questions:

1. **What should I work on today?** The learner has topics, notes, and perhaps a quiz date, but must prepare the study session themselves.
2. **Why does this step still not make sense?** A correct-looking approach can hide a specific misunderstanding. Another broad explanation may miss it.
3. **What should I come back to?** A finished session does not automatically become a useful reviewer or a manageable plan after an interruption.

Proposed opening headline: **“Studying should leave you with a clearer next step.”**

Problem sentence: **“Students can spend time studying and still not know what to work on, why a step fails, or what to revisit tomorrow.”**

Product sentence: **“Dunlo turns your current topics into a useful session, helps the difficult step click, and brings the right ideas back when you return.”**

The specific quadratic example is the proof of this promise, not a detour from it. Two wrong answers to the same task lead to different questions and explanations. The next session then remembers the relevant skill rather than restarting the entire process.

These are problem hypotheses to make concrete through learner and teacher walkthroughs. Do not invent interviews or prevalence figures. Explain the proposed benefit clearly without treating the whole pitch as an apology for being at the proposal stage.

## 3. The reference learner journey

Design and test one connected story before polishing isolated screens.

- A learner receives a “Friday algebra quiz” pack containing brackets, factors, and quadratic solutions. They can correct its scope and date.
- On Monday they choose ten minutes. Today suggests a small session with a reason for each round. Learning mode is available immediately.
- They make a factor-pair error. BACKTRACK asks a fresh follow-up question. An interactive replay then shows why a matching product can still produce the wrong middle term.
- They choose a visual explanation, another example, or the relevant Khan explanation. They open the matched Khan exercise and return to the same place.
- Fresh independent problems include a contrasting sign pattern. A checked step can leave this route; other useful topics stay visible.
- The session ends with what was checked, what still needs support, and a next-session suggestion. Participation rewards are separate from learning evidence.
- The reviewer stores the skill and the context. It schedules a future look using an understandable initial rule. It does not merely save the exact answer.
- On Tuesday the learner starts a Rematch from that reviewer. An actual earlier hint or error can be compared with the new attempt.
- If Wednesday is missed, Thursday offers “Is this still your next goal?”, resume, and rebuild. It reduces today's workload without erasing history or declaring the learner has forgotten.
- The learner can share the pack or invite classmates into a circle. The scope and cooperative goal are shared; their private errors and explanations are not.

This story supplies the product demonstration, the slide narrative, the acceptance tests, and the campaign destination.

## 4. Navigation and screen responsibilities

### Today

Today answers one question: **“What is the next useful thing I can do?”**

Show one primary session, its reason, selected pack, optional test date, and the available-time control. The main actions are Start my session, Make it smaller, and Choose something else. Put a saved session near this action when one exists. Show a concise weekly commitment and reviewer summary below, using actual activity.

For a new learner, provide pack selection and a one-question entry. Do not require account creation or a lengthy profile first. For a returning learner, open their workspace rather than repeat a marketing pitch.

### Study

Study is the place to deliberately choose **Learn**, **Review**, or **Challenge** from a pack. All three use the same skill history and return to the same session. Learning opens an explanation before requiring a wrong answer. Challenge mixes appropriate applications without showing the skill label as an answer hint.

### Review

Review contains automatically collected difficult steps, maintenance review from successful learning, and manually saved material. Each item explains why it is present, when another look is suggested, and which original goal it supports. Rematch now, change the date, pause, and remove a manual save are understandable controls.

### My packs

Packs hold topics, a purpose, an optional assessment date, mapped Khan resources, and progress. Support curated packs, user-assembled scope, teacher links, and shared classmate packs. Make joining or saving a shared pack clear. Sharing must show exactly what travels with the link.

Circles and shared challenges belong beside their packs. Settings, cosmetics, sound, quiet mode, exports, and shared-device controls belong in the personal study-space menu. The teacher workspace is a separate facilitator surface reached from a clear link, rather than a competing learner dashboard.

## 5. Packs and preparation

### Pack contents

Each pack contains a stable identifier, title and purpose, topics/current goals, skill relationships, concept cards, question families, accepted answer rules, official Khan resources, and authorship/review provenance. Personal progress is stored separately from the shareable pack definition.

Offer curated packs for the five supported sample areas, and allow combinations such as the Friday quiz pack. Test dates are optional and editable. The UI shows coverage and next actions rather than an invented exam-readiness percentage.

### Preparation modes

- **Learn:** concept card, useful manipulation or example, relevant Khan resource, and a fresh attempt.
- **Review:** scheduled or chosen skills, with support when evidence warrants it.
- **Challenge:** mixed, comparable applications and occasional explain-the-step or spot-the-error items.
- **Quiz rehearsal:** an additional useful feature. Build a finite rehearsal from the selected quiz scope, hide hints during its independent part, then turn its results into a next-session plan. Its result is practice within the selected material, not a prediction of the school exam grade.

### Notes and creator tools

Include a real authoring path in the full implementation plan: users can create/edit cards and a teacher can prepare a reusable pack. Permitted notes, slides, or a syllabus can suggest a scope or source-linked cards. Show page/section provenance and an editable preview before saving generated or imported content. Unreviewed material must not inherit the status of curated content.

Manual authoring and matching to known topics should work without paid inference. Optional AI drafting requires a configured, authorized service and spending approval when applicable. The product should not silently send private notes to an unspecified model or present generated questions as official Khan material.

## 6. A session planner that changes the workload

Inputs are explicit: active pack, corrected topic priorities, optional test date, chosen time and mode, actual evidence, scheduled review, and an unfinished session. Do not infer unseen school grades or deadlines.

The planner builds a finite queue. Prefer a relevant due step, progress toward the current goal, and an application that connects them. Avoid duplicate review of the same skill across overlapping packs. Explain why each selected round is present.

Make it smaller reduces the queue while keeping deferred work in the pack/reviewer. Difficulty that introduces a deeper repair reallocates room within the current session and defers a lower-priority later round. Demonstrated knowledge removes unnecessary review and can replace it with a relevant application. A changed test date or goal rebuilds priorities.

Time is an estimate. Ending the time allowance does not claim the learner has finished learning. Save a specific next action and make stopping easy.

For returns after an interruption, ask whether the goal is still relevant. Preserve past evidence and use a new check where appropriate. Absence influences scheduling, not the truth value of past knowledge.

## 7. Teaching interactions

The content pattern is **one idea → useful action → explanation of what changed → fresh application**. Do not add an unrelated animation as a substitute for the mathematical interaction.

### Quadratic factor replay

Keep the target `x² + 7x + 12` visible. A proposed pair of 2 and 6 produces `x² + 8x + 12`. Display the constant and middle coefficient separately, with text showing what matches and what does not. Let the learner adjust the pair. Connect the live result to `x² + (a+b)x + ab` in an optional deeper explanation.

### Factors to solutions

Let a learner test x in `(x+3)(x+4)=0`. Show each factor's value and the product. Then use `(x−2)(x+5)=0`, so the explanation cannot become “always make both answers negative.”

### Other supported representations

- Fractions: equal-sized partition bars, showing why changing the denominator changes the size of the parts and why equivalent fractions preserve value.
- Ratios: linked quantities and a ratio table; change the quantity while the unit rate remains visible. Include inverse questions where appropriate.
- Graphs: a labelled coordinate plane, a movable point or input, and the connection between a rule and the plotted value. Support keyboard controls and readable scales.
- Brackets: a distributive area or term model showing where every product comes from, including signs where supported.

“That didn’t click” offers Show it visually, Another example, and Work through it slowly. Those controls select support, not a fixed learning-style category. Include short prediction, error-spotting, and explain-the-step choices. Open-ended personal notes may be saved, but an unvalidated AI opinion must not become authoritative scoring.

## 8. BACKTRACK inside ordinary study

Preserve the full loop in both explicit Catch up and ordinary rounds:

**Current task → answer-sensitive clue → fresh investigation → focused help/Khan practice → fresh return.**

For the current sample, 3 and 4 suggest checking how factors become solutions; 2 and 6 suggest a product-and-sum check. They are possible starting points, not mutually exclusive diagnoses.

One response can choose the next investigation. Two distinct fresh unassisted successes support clearing a checked step. Confidence is optional support metadata. Guided examples, hints, replayed answers, video views, and promotional examples stay separate from independent evidence.

Keep the goal visible but let the current mathematical action dominate the screen. Use a compact, sticky route on desktop and an expandable route on mobile. Persistent difficulty leads to human support with a useful summary.

## 9. Personal reviewer and Rematch

Store the concept and question family, its original goal, matched help, evidence provenance, and timestamps. Deduplicate overlapping material across packs. Also allow successful work and manual saves to enter the reviewer.

Initial scheduling uses a transparent, adjustable rhythm such as 1, 3, and 7 days. A new independent result can lengthen the interval; difficulty can bring relevant support back. These are product rules to test, not a claimed perfect forgetting model.

Do not create an intimidating overdue wall. Today chooses a manageable set and explains what remains available. Pausing or deferring review must not silently delete its history.

Rematch recalls a real earlier event and offers a fresh version. Show “Earlier: used a hint. Now: solved this fresh problem without one” only when those events exist. Early review remains labelled early; a simulated future date is not evidence of delayed retention.

Add an **end-of-session note to future you**: what was checked, what still needs work, and the next useful action. Generate the factual part automatically and allow a short personal note. This makes restarting easier and complements the reviewer without adding another destination in navigation.

## 10. Engagement, companion, and cosmetics

Make rounds finite and satisfying through responsive inputs, clear progress, varied meaningful tasks, and a visible finish. The companion should point to a useful action, welcome a return, and react to actual session progress.

Use predictable cosmetic unlocks and customizable study-space accents. Reward meaningful effort, including supported work, while keeping those rewards separate from skill evidence. Prevent repeated empty clicks, resource opens, and the same easy item from generating endless rewards. Keep achievements specific to recorded behavior.

Support flexible weekly commitments and an optional daily streak. Missing a day does not erase learning history, remove practice access, or make the companion distressed. Sound is optional and off by default. Quiet mode and reduced motion work across the product.

The visual direction is a friendly original bookmark companion, strong mathematics typography, mostly white surfaces, and restrained green-led accents. The recovery map stays meaningful within recovery; it does not have to occupy every screen.

## 11. Friends and study circles

The full social product has invited membership, shared packs, asynchronous challenges, cooperative weekly goals, preset encouragement, and optional comparable duels. It is not a fabricated friend list.

### Group behavior

Members share a goal such as completing useful rounds within a common pack. Each learner receives private explanations and review priorities. Aggregate participation can support the cooperative goal; individual misconceptions remain private. Learners can leave a circle and control what they share.

Duels use comparable reviewed item families. Speed is optional rather than the default measure of success. Distinguish assisted practice from the independent challenge component. Do not use a public weakest-learner ranking.

### Infrastructure

Build the social layer on authenticated membership, persistent records, scoped permissions, expiring invitations, and server-checked challenge/reward events. A shared backend is necessary for real cross-device membership and group progress. Keep first-question entry available without an account, and offer account linking when the learner chooses saving across devices or joining a circle.

A practical implementation is an auth-and-database service with row-level access controls plus small server functions for invitations, comparable challenge assignment, grading, and reward idempotency. Provider choice should follow available accounts and service capabilities. Inspect existing access and pricing before provisioning; paid services still require the user's spending authorization. This is a build dependency, not a reason to remove circles from the product plan.

Device-local sharing can be useful immediately, but the product must not label local data as live shared progress. Keep implementation status honest while completing the connected social layer.

## 12. Khan's role throughout the experience

Every supported pack should expose why its mapped Khan material is relevant. Learning, quiz preparation, review, and recovery should all lead naturally to the appropriate official explanations and exercises.

Preserve official video embedding, replay, longer viewing, and original-source fallback. Preserve the learner's location when opening an exercise. The class routine assigns matched exercises in the teacher's existing Khan class, then returns to separate fresh checks.

Keep these evidence sources distinct in both storage and UI: resource opened, video opened/viewing activity where actually observable, learner-reported practice, teacher-checked Khan report, and independent local checks. No automatic Khan score synchronization is currently claimed.

Khan's official Assignments report supports performance/completion review and CSV export. Source checked in this work: https://support.khanacademy.org/hc/en-us/articles/360031122951-How-do-I-use-the-Assignments-report . Confirm current fields and permissions when integrating an actual classroom.

The facilitator surface prepares a weekly pack/assignment plan and an action sheet: who can move on, who needs a particular step, and who needs a person. Learner return tickets help students explain what they tried. This adds a practical bridge between personal study and the next lesson.

## 13. Reels and distribution

Treat acquisition as part of the product flow:

**Useful hook → matching challenge → explanation/practice → Khan activity → saved pack/reviewer → another session or classmate share.**

Prepare twelve creative variants: three supported skills, two audience framings each, and two hooks per framing. Good starting areas are factor pairs, fractions, and ratios. Use quiz preparation, curious puzzles, parents helping at home, gaming quantities, and everyday costs where the mathematics fits.

Produce at least three complete scripts/storyboards with timing, original on-screen mathematics, a pause for an answer, a useful explanation, and a clear call to action. Adapt each for YouTube Shorts, TikTok, and Facebook Reels. Verify current account/platform link affordances; use stable deep links and a short challenge-code fallback.

Each campaign code opens the correct concept or pack. Ask for the answer in the app; do not assume what a video viewer answered. If the reel reveals the answer, the original item is guided material and the independent check uses a fresh related item.

Measure the steps separately. A view is not a learner, a resource open is not Khan completion, and a device return is not automatically person-level retention. Separate public acquisition from the evaluated school cohort. Campaign scripts and assets can be produced here; publishing, contacting people, or buying ads is not part of existing authorization.

## 14. Shared technical foundation

Keep the existing Next/React project. Build modules around common data rather than separate state for each screen.

Core records:

- Pack definitions and personal goal settings.
- Stable skill/question-family identifiers and source/review status.
- Versioned attempts with assistance and exposure provenance.
- A global used/exposed-item ledger and generator version.
- Review items and their next suggested dates.
- A resumable session queue, deferred work, and completion records.
- Participation rewards and cosmetic choices, separate from learning evidence.
- Khan resource events and teacher-entered confirmation.
- Optional accounts, circle membership, invitations, and shared challenge records.

Keep persistence behind an adapter so local storage and a synchronized account use the same domain rules. Migrate old BACKTRACK saves without changing what an earlier question meant. When generators change, preserve per-attempt version/provenance. Merge exposure history across packs, learning, recovery, replays, and later sessions. A new route or a new public name must not turn an exposed answer into fresh evidence.

Use idempotent event handling: reloads and retries do not duplicate review items, rewards, completion counts, or group contributions. Cross-device reconciliation must preserve newer evidence and distinguish concurrent attempts. Corrupted data should produce a recoverable state with a retained backup, not a silent wipe.

Build content types so additional reviewed subjects can join the product. Deterministic maths checkers remain authoritative for the supported mathematics; other structured content uses reviewed or explicitly user-authored answer keys with clear provenance.

## 15. Build sequence

This sequence covers the complete experience. It describes dependencies, not a feature-cutting exercise.

1. **Lock the product contract and question provenance.** Finalize identifiers, migrations, exposure rules, and evidence/reward separation. Preserve current recovery behavior with regression tests.
2. **Connect packs, history, and the reviewer.** Curated and custom scope, shared links, actual review creation, due dates, manual saves, and editable priorities must agree across screens.
3. **Complete the teaching and round runner.** Finish the two quadratic replays, meaningful representations for the other supported concepts, alternative explanations, mixed practice, and fresh transfers. Connect recovery back to the original session.
4. **Make Today genuinely adaptive.** Prepare the queue, account for time and test scope, shrink/rebuild it, preserve deferred items, and resume after breaks. Complete quiz rehearsal and the note to future you.
5. **Add the companion and engagement system.** Actual earned progress, predictable cosmetics, optional commitments/sound, clear stopping, and no reward farming. Test the experience after correct, incorrect, assisted, and interrupted rounds.
6. **Complete distribution and sharing.** Exact challenge codes, guided-versus-independent entry, pack sharing, twelve variants, three full storyboards, and separate acquisition events.
7. **Connect accounts and circles.** Real membership, private progress, cooperative goals, preset reactions, and optional comparable challenges. Finish permission and synchronization tests before describing the feature as live.
8. **Finish teacher/creator tools and imports.** Weekly pack assignments, useful action sheets, safe source-linked authoring/import previews, and explicit content-review status. Avoid destructive switching between class goals or weeks.
9. **Rebuild the pitch and supporting package from the working product.** Update the same Canva design, all narratives and plans, links, QR, PDF exports, editable backup, source archive, and final judge walkthrough. Deploy only the verified integrated result.

## 16. The 15-slide story

1. **Studying should leave a clearer next step.** Three everyday decisions and the companion promise, using one real task as an anchor.
2. **Same task. Different obstacles.** The two wrong answers and distinct follow-up questions.
3. **One session makes the next one easier.** A labelled learner journey through Learn, Practice, Review, and recovery when needed.
4. **See why the step breaks.** Real states from the factor/solution interaction and a fresh application.
5. **Your study becomes your reviewer.** Actual activity creates a review item; Rematch offers a fresh version. Label a later-session illustration accurately.
6. **Same quiz. A personal next session.** Shared pack scope, Today planning, and one practical teacher action.
7. **A useful reel becomes useful study.** Distinct audience hooks leading to exact challenges, Khan practice, and saved review.
8. **Try the companion and its recovery engine.** A full-slide invitation with clickable button, readable URL, tested QR, and the requested sample/development note.
9. **A reason to use Khan every teaching week.** Learning, assigned practice, return, and separate records.
10. **Start with learners we can actually serve.** Initial school/public audiences, mobile/text-first/shared-device access, and adoption routine.
11. **Does it help learners return—and keep returning?** November–March pilot, retained current-task performance, relevant repeat use, and the similar-time Khan comparison.
12. **Scale the reviewed pack and the routine.** Educator/creator distribution, review capacity, support, and maintenance ownership.
13. **Free core learning. Accountable implementation.** PHP 100,000 planning allocation and the institutional/philanthropic continuation hypothesis.
14. **The team and the next delivery.** Confirmed UP Manila endorsement, adviser and members, working capabilities, and concrete next commitments.
15. **Sources and the closing promise.** Distinguish learning guidance, implementation context, and product precedents. End on a useful next study session.

Retain exactly 15 slides, the same Canva design, the unaltered UP Manila logo, and at most two font families. Use the chosen public mark consistently. Give each slide one clear entry point and visual reading order. Keep the Canva editor URL private. All exported visible links must be clickable.

## 17. Application, evidence, and business consistency

Rewrite all seven <=300-word narratives around the companion: daily preparation, useful learning, repeated practice, personal review, and recovery. Preserve the concrete two-answer mechanism early in innovation. Explain Khan's recurring role and the reviewed pack as the scale unit.

Keep the November 2026–March 2027 pilot, 80–120 learners, 2–3 cohorts, and PHP 100,000 planning allocation. These describe one evaluated rollout, not the limit of the product's ambition.

Primary recovery outcome remains fresh current-level success after practice and again 7–14 days later among eligible initially blocked learners, with missing follow-up visible. The comparison tests the supported product package. Add voluntary useful return, repeated relevant Khan assignments, pack reuse/sharing, and teacher effort as distinct outcomes. Already comfortable learners are not counted as recovered.

Khan already has substantial Philippine implementation. DepEd's January 26, 2026 report describes more than 711,000 learners and over 2,700 public schools. Position this product as making relevant use and continued study easier for its intended audiences. Source: https://www.deped.gov.ph/2026/01/26/deped-kinilala-ang-papel-ng-khan-academy-ph-sa-suporta-sa-2700-paaralan-para-sa-learning-recovery-digital-innovation/ .

The continuation hypothesis is institutional or philanthropic support for reviewed packs, access, onboarding, and implementation. Separate setup from recurring content review, support, and infrastructure. Confirm ownership and actual willingness to support the routine instead of presenting a list of hypothetical sponsors as a business model.

## 18. Acceptance and quality review

The result is ready only when the connected journeys work, not merely when every navigation item exists.

- Start learning without a failure or compulsory signup.
- Give two learners the same pack and show different useful support from their actual answers.
- Preserve the original wrong-turn branches and fresh investigations.
- Move from explanation to a genuinely fresh independent item, including across reloads and different modes.
- Update the reviewer once from actual evidence, deduplicate overlap, and preserve real due dates.
- Rebuild a smaller session after interruption without erasing previous work or declaring forgetting.
- Open the correct Khan resource and return to the same learning context.
- Resolve every campaign code to the intended challenge and distinguish promotional examples from independent checks.
- Award effort without manufacturing mastery or allowing repeated clicks to farm progress.
- Share a pack without leaking private progress. Test circle permissions with owner, member, nonmember, expired invite, and removed-member accounts.
- Preserve old URLs and saved question interpretation through a rebrand and data migration.
- Verify 360/390px phones, tablet widths, desktop, keyboard focus, readable math, non-color-only feedback, reduced motion, quiet mode, and failed playback/storage/import states.
- Check PDFs, all 15 slides, QR and URL targets, editable text, font embedding, source/claim consistency, and the final live deployment.

Use a final judge pass to make further improvements: first-three-slide comprehension, tangible usefulness, creative teaching payoff, repeated Khan use, adoption, and sustainability. Do not assign a guaranteed rank or invent proof to make the entry sound stronger.

## 19. Current workspace status at the planning pause

The original deployed version remains the last published version. The external-review implementation pass has uncommitted work on replay teaching, tentative clue wording, sign variation, input validation, shared-device clearing, learner summaries, and a local teacher action sheet. Thirty-one tests and a build passed for that earlier stage of this turn.

The broader companion has early uncommitted model/provider, pack, Today/reviewer, and session integration code. A type check passed after those additions, but they have not had their full browser, migration, or end-to-end review. The visual design, complete sharing/challenges, social backend, creator/import tools, campaign package, new branding, and expanded 15-slide story remain implementation work.

The Canva inspection-only transaction was cancelled without applying edits when the brief expanded. The saved design is intact. No new expansion has been deployed or submitted. Planning documents are not evidence that the planned features work.
