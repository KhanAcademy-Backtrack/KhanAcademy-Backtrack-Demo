# Original interactive teaching scenes

This pass replaces the earlier, insufficiently visible animation treatment with a visible homepage model and different interactions across the learning routes. The user’s quality reference is clean explanatory motion with an expressive character. Dunlo keeps its own folded-bookmark character, navy/green palette, graphics and lesson scripts. No reference video or competitor artwork is included in the site.

## What is implemented

The homepage presents a continuously linked water/container and graph model. The water, plotted point, guide lines and readout come from one mathematical state. Play/pause, a draggable point, keyboard slider, rate changes and static/quiet alternatives work. Manual pause survives scrolling away and back.

The bookmark has curious, thinking, pointing, encouraging, waving and aha poses, with gaze, blink and small body/arm movements, and its face is morphed between poses rather than switched. Quiet presentation, reduced motion and a scene's own static view each suppress nonessential motion. An existing study session remains the primary Resume action.

The lessons use topic-specific mechanisms:

- Brackets: the same x tiles and unit tiles travel out of three groups and collect into 3x and 12.
- Factoring and binomial multiplication: four persistent areas assemble; the middle terms visibly combine. Signed cases use symbols rather than negative lengths.
- Roots: a number-line value and moving graph point connect factor values to zero. Repeated roots have one distinct solution.
- Fractions: new partition boundaries appear while the shaded amount and whole length stay fixed. Amounts beyond one use a second whole.
- Ratios: repeated parts, a share strip and linked number lines demonstrate scaling.
- Coordinates: a separate cursor traces across first, then up.
- Multiplication, like terms, linear equations and substitution: grouped dots, regrouped x tiles, equal shares and an operation chain support the relevant step.
- Unit conversion: equal reference intervals describe the same quantity using different units. A unit-conversion detour no longer opens an acceleration lesson.
- Atom counting: a coefficient repeats whole formula units. The drawings are explicitly counting models, not molecular structures.
- Moles/formula mass: linked amount/mass views and the atomic-mass contributions distinguish multiplication from division.
- Balancing: each element has a separate left/right count comparison. Equal total atom counts cannot misleadingly appear as a balanced equation.
- Motion/forces: fixed chart scales, an unclipped cart-position range, force-arrow changes and a genuine zero-net-force state.

Scenes remain guided exploration, not independent mastery evidence. Existing original questions, supported Khan routes, source notes, packs, reviews and science destinations are retained. A future content or skill addition still requires an appropriate visual and reviewed explanation.

## Second pass, 11 September

Five things changed after the first pass was reviewed against real movement rather than screenshots.

A scene's own static view now stills the companion as well as the mathematics. It previously stopped only the drawing, leaving the bookmark blinking beside a deliberately frozen picture. Two defects surfaced with it: the breath loop kept an infinitely repeating transition even when motion was off, so it rewrote its transform every frame in quiet mode and under reduced motion; and nonessential movement paused whenever any form control held focus, which included the checkboxes, steppers and range sliders the scenes are driven by. Pausing is now limited to real text entry, so the companion keeps reacting while a learner works the controls.

The companion's face is morphed rather than snapped. Its mouth and arms were handed to the motion library as animated path data, which it cannot tween: every expression change wrote an undefined path for a frame and then jumped. Each pose shares the same path commands and differs only in its numbers, so those numbers are now interpolated directly. The force arrows and the route stroke had the same first-render gap and now carry their shape before any animation starts.

The four science labs, the atom-count scene and the coordinate trace keep their state. Their controls lived in local component state, so reopening a guide discarded the coefficients, masses, forces, unit counts and trace the learner had built, and re-asked the prediction that gates the scene. They now ride in the same per-lab save the maths labs use, clamped on the way in and range-checked by the validator. Older saves carry none of the new keys and restore the worked example exactly as before.

Saved work also survives an unload that lands mid-keystroke. A typed answer and a guide's controls each reached storage through two effects, so a reload or a closed tab could drop the most recent change. The newest draft and the newest lab save are now held directly and written on `pagehide`, revalidated first. The release suite had been failing its draft-restore assertion on the deployed commit; it passes now.

The written rule travels with the drawing. Changing the rate moved the water, line, point and readout together over about half a second while `V = 6 + 2t` became `V = 6 + 4t` instantly, so the equation contradicted its own readout for the whole change. The coefficient and starting value are read from the same animating values, shown to one decimal while they move and settling on the whole number. The spoken label keeps the committed numbers.

## Validation

The production build exports 30 routes, and the type check and 86 unit tests pass. The added unit checks verify that every current destination and declared prerequisite has a visual route, that foundation checks select the correct concept, and that a saved trace phase is restored while an impossible one is rejected.

Browser validation is 50 cases: 10 existing journeys, 9 release journeys, 28 lesson/skill visual cases and 4 living-scene cases. The tests include typing negative values naturally, touch/narrow screens, model actions and ensuring exploration adds no graded attempt. The lesson-scene suite now fails a scene on any console error, not only an uncaught exception, which is what caught the undefined path data. New cases sample the companion's blink and breath across frames to confirm a static scene stops them and a cleared one revives them; drive a science stepper, reload and require the same arrangement back with the prediction not re-asked; trace a coordinate point and reload; and sample the written coefficient against the drawn slope on the same frames through a rate change.

Local captures, genuine screen recordings and results are in .refs/living-scenes/, .refs/lesson-scenes/, .refs/maths-release/ and .refs/browser-review/. These are development artifacts, not learner outcomes. The reference videos stay private and are not shipped.

## Continuing work

The user has not yet signed off on the final aesthetic quality. Continue visual critique against the supplied motion references without copying their identity. Further polish should preserve the mathematical relationship and avoid excess motion or layered control panels.

The guided repair used for the foundation skills still starts at its first step after a reload: its step and the worked answers a learner typed into it are not yet part of the saved guide, although the surrounding route is. The science labs have no static view of their own; global quiet presentation and reduced motion cover them, and the companion is stilled by both, but there is no per-scene control there as there is in the maths labs.

Scaffolding depth, unfamiliar application and delayed retrieval remain open lines of work rather than finished ones.

Offline mini-packs, reviewed Filipino localization and a real consented usability/retention pilot remain outstanding. A working interface and passing software tests do not establish better learning outcomes.
