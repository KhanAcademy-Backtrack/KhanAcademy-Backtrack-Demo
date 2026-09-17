# Khanpanion discovery release: execution plan

Status: planned before implementation. Owner request: plan thoroughly, then update the site and the existing 15-slide Canva deck. No recruited audience, school access, or partner commitment is assumed.

## Product promise

Explore an idea. Try it yourself. Keep learning with Khan Academy.

Khanpanion is a free independent learning project. Short interactive experiences make a useful first step; reviewed Khan explanations and practice provide depth; the existing recovery and review tools preserve continuity. The feed is an additional entrance, not a replacement for deliberate study.

## Sequence and acceptance gates

1. **Establish the current baseline.** Start from origin/main 437a1ad, preserving the nine post-handoff fixes. Inspect the same Canva design and preserve its 15 pages and unchanged UP Manila logos. Keep the existing Next/Vercel workflow. No new services, paid generation, accounts, or classroom backend.
2. **Build the discovery experience.** Add /explore with a short, curated vertical feed. Alternate original playable moments with visibly attributed, already-reviewed Khan segments. Introduce one idea at a time. Support normal scrolling, explicit previous/next controls, keyboard and touch; never intercept gestures used by a mathematical control. Show progress through the finite collection and an intentional ending. Topic filters and saved items must work with direct item links.
3. **Connect useful next actions.** Every reviewed mathematics item offers the exact Khan lesson/practice and an internal path to fresh study. A learner can save an interest, return to the same item after an external activity, continue an existing session, and find deeper study. Preserve the existing four confidence choices and unknown answer choice in assessment. Feed predictions are exploratory and never confer mastery, XP, or independent evidence.
4. **Persist safely.** Save feed position, bookmarks and interaction choices within the existing study backup. Older saves remain valid. Guard imported values and unknown item IDs. Clear and restore include discovery state. Record Khan opens and self-reports distinctly; never imply automatic completion or score synchronization. Preserve all generator versions and reserve any shown assessment examples.
5. **Make the identity and navigation clear.** Add Explore to navigation and make it prominent on Today without overwriting saved sessions. Keep Study, Review, My packs and From Khan. Use an expressive navy/green discovery surface with readable mathematical stages and the original bookmark. At most two font families. Clear Khan source labels appear within the feed and resource actions; official video stays uncropped in its original player, loads only after choice, and stops when its item is inactive.
6. **Update the proposal around delivered behavior.** Rewrite the seven responses below 300 words each, with a <=300-character executive fallback. Replace the assumed recruited school cohort with a phased public-launch and opt-in evaluation proposal. Do not claim reach, outcomes, access or funding. Keep the PHP 100,000 budget explicitly illustrative and aligned to actual delivery costs. Refresh the current strategy and implementation/evaluation records so the old school-access assumption is not presented as a requirement.
7. **Rebuild the story in the same Canva deck.** One idea per page, short plain titles, varied compositions, real product captures and labelled static states. Explain the complete mechanism without animation, notes or a live demonstration. Preserve exactly 15 pages, UP Manila marks, visible clickable sources, and a clear product link. The primary deck call to action and QR open the main site at https://dunlo.vercel.app/. The /demo route remains a separate recovery example.
8. **Verify and publish.** Typecheck, domain tests, production build, relevant existing journeys and dedicated discovery journeys. Inspect desktop and narrow-phone layouts, keyboard/touch controls, quiet/reduced motion, saved-return behavior, a blocked player fallback, no premature video requests, and no learning credit from scrolling. Export and inspect every PDF page, inspect links and scan QR pixels. Push only the intended source/docs/assets and verify the actual Vercel commit. Close task-owned tabs and stop task-owned helpers.

## First content collection

Use a coherent, finite collection spanning the existing reviewed mathematics mappings: proportions/unit rates, fraction equivalence/addition, distribution, factor pairs, and graphs. Include the four existing reviewed Khan segments (distribution, binomial products, like terms, factoring) where their exact skill is relevant. Offer original interaction, an optional prediction/explanation, and a useful Khan continuation. Preserve existing chemistry and physics tools; do not invent science resource matches to populate the feed.

## Slide story (15 pages, PDF first)

1. Khanpanion: explore an idea, keep learning with Khan Academy.
2. The proposed problem: finding a useful start and keeping going.
3. One clear journey: discover, understand, practise, return.
4. Explore: an actual interactive feed view.
5. An idea you can change: labelled before/after mathematical states.
6. Khan in the feed: authentic focused segments, clear source and deeper lesson.
7. Help when a step is difficult: a simple contrasting route example.
8. Try Khanpanion: clickable demo, correct QR and readable fallback URL.
9. Meaningful Khan use: discovery connects to specific learning and exercises.
10. Return and remember: fresh questions and later review, with evidence types separated.
11. A public launch: direct access and shareable items, no partner dependency.
12. Growth: reusable reviewed content, access choices and future localization.
13. Sustainability: transparent illustrative budget and proposed support model.
14. November to March: staged implementation and evaluation, no invented cohort.
15. What success would mean: repeat Khan practice, independent application and later recall, plus compact source navigation.

## Evidence and limitations

The competition accepts concepts at application. The proposal describes intended users broadly; interviews, recruited learners and school agreements are not entry prerequisites. Software checks establish behavior, not learning gains. Initial discovery history is local to the browser and is not a population analytics system. Optional evaluation requires appropriate consent when introduced; public visitors are not automatically study participants.

Sources verified September 13, 2026:
- KEIC rules: https://enactus.ph/2026-national-competition/khan-academy-challenge
- Application: https://form.typeform.com/to/bJw9THj3
- Khan reuse and attribution: https://support.khanacademy.org/hc/en-us/articles/202262954-Can-I-use-Khan-Academy-s-videos-name-materials-links-in-my-project

Khan attribution must distinguish original Khanpanion material from official Khan material and must not imply endorsement. Include the required notice that all Khan Academy content is freely available at khanacademy.org. No downloading, recutting, rehosting or obscuring the original video player is planned.
