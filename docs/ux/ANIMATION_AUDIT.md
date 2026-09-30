# Animation audit, October 2026

Owner verdict: every current animation is bad. This audit judges each one against one rule:
motion must **teach** (show the invariant changing), give **feedback** (right, wrong, progress,
mastery) or **orient** (where you came from, where you are going). Anything else is cut.

Problems found everywhere:

- **No shared tokens.** Durations range from 0.2 s to 4.6 s, with at least six easing curves and three
  spring settings, so nothing feels like one product.
- **Loops while reading.** The companion breathes forever, the filling scene's dashed stream loops every
  0.65 s, and Explore's wave redraws every frame, all beside text the learner is reading.
- **Layout properties animated.** `width`, `height`, `cx`, `cy` and SVG `d` are tweened, which forces
  layout or paint each frame and stutters under a 4x CPU throttle at phone size.
- **Timing the learner cannot control.** Teaching scenes play on a timer with a Replay button, so a
  learner who looks away misses the moment the invariant changes.
- **A console error stream.** Explore's wave path writes numbers in exponent form (`e-16`), which SVG
  rejects many times per second.

## The new system

- Tokens in `src/lib/motion-tokens.ts`: durations 150, 240 and 400 ms, one ease-out curve and one spring.
  Transform and opacity only.
- One focal motion at a time. Nothing loops while the learner reads or types. The companion's blink is
  the one loop kept, because the owner likes it; it is now occasional and stops while typing and in the
  exam hall.
- Reduced motion and the quiet setting give a complete static version. No information exists only in motion.
- Tooling: Motion (already installed) covers every signature moment. GSAP and Rive were considered and
  not added: the companion's expressions are drawn with matching path commands, so Motion's value
  interpolation morphs them cleanly without MorphSVG, and nothing here needs a state machine file.

## Element by element

| Element | Intended meaning | What is wrong | Decision |
| --- | --- | --- | --- |
| `Companion.tsx` | Friendly presence that reacts | Breath loop forever; arm wave keyframes; tilt, squash and gaze all move at once | **Rebuilt.** One expression change at a time with a 240 ms morph, occasional blink kept, friendly smile, no line under the mouth, no breath loop, no squash. |
| `LessonCompanion.tsx` | Cue text beside a scene | Pose changes on every step pull the eye from the maths | **Rebuilt** on the new companion; the pose holds while cues change. |
| `WelcomeTour.tsx` | First-visit orientation | Modal blocks the first screen; spotlight jumps | **Cut** from first visit; still reachable from Me. |
| `PackArtwork.tsx` | Pack identity | Static; fine | **Keep.** |
| `ExploreFeed.tsx` | Feed of ideas | Hand-rolled animation-frame loops; wave path console errors | **Fixed** the number formatting so the path is valid. Stays in the public feed only. |
| `ExploreScene.tsx` | Tank fills, groups regroup | Timer-driven, animates height | **Keep** in the public feed; rebuild in P1. |
| `MixtureScene.tsx` | Mixture ratio stays the same | Pours on a timer | **Keep** in the public feed; rebuild in P1. |
| `HomeExperience.tsx` | Old home hero | Not rendered, still tested | **Keep** the file, not rendered. |
| `RouteCanvas.tsx` | Route map redraw | Tweens SVG `d`, 650 ms | **Rebuild** with opacity and path length. P1. |
| `AtomCountScene.tsx` | Atoms counted per element | Pop-in, no step control | **Rebuild** with step controls. P1. |
| `BasicSkillScene.tsx` | Dots join into tens | Colour animation, many moves at once | **Rebuild**, one move per step. P1. |
| `CoordinateScene.tsx` | Point walks across then up | Animates `cx`, `cy` | **Rebuild** with transform and a scrubber. P1. |
| `DistributionScene.tsx` | Each row is one group | Staggered cascade of 40 moves | **Rebuild**, one row per step. P1. |
| `FactorScene.tsx` | Area model splits and joins | Six tweens at once | **Rebuild**, equation term and rectangle lit together. P1. |
| `FillingScene.tsx` | Rate of fill | Infinite dashed-stream loop beside text | **Loop cut now**; full rebuild P1. |
| `FractionScene.tsx` | Same whole, smaller pieces | Animates `width` | **Rebuild** with `scaleX`. P1. |
| `MathsLab.tsx` | Point follows a function | Animates `cx`, `cy` | **Rebuild** with transform. P1. |
| `RatioScene.tsx` | Share stays constant | Animates `width`, `x` | **Rebuild** with `scaleX`. P1. |
| `ScienceLab.tsx` | Mass, force, distance bars | Animates `width`, `height` | **Rebuild** with `scaleX`, `scaleY`. P1. |
| `maths-labs.css` `buddy-arrive`, `buddy-popup`, `buddy-wave` | Companion entrance | Duplicates the library animation with three more curves | **Cut** with the companion rebuild. |
| `study.css` `buddy-blink` | Blink | Duplicates the library blink | **Cut.** |

## Signature moments (P0)

| Moment | Meaning | Design |
| --- | --- | --- |
| Correct answer | Feedback | The chosen option's check mark draws in (path length, 240 ms) and the card settles with the shared spring. |
| Wrong answer | Feedback that points to the fix | No shake. The chosen option dims, the right one outlines, and the "why this tempts people" note rises 8 px with its Fix link. |
| Entering the exam hall | Orientation | The page turns deep navy in one 400 ms fade while the item card rises 12 px; the timer appears last. |
| Score reveal | Feedback | Subtests reveal one at a time, 150 ms apart; each band bar grows with `scaleX` from zero. The static view shows everything at once. |
| Tab change | Orientation | The active marker slides between tabs as a shared element; content fades in over 150 ms. |
| Companion | Presence | See the Companion row. |


## Refinement implemented, 30 September 2026

The owner requested a thorough motion pass before publication. The changes now cover the program interface and the existing teaching scenes. No animation package or runtime dependency was added.

- MotionProvider shares one typing and visibility listener. Quiet, reduced motion, text entry and background tabs stop nonessential motion. SceneMotionToggle provides a saved still view in the science, atom and coordinate guides and the existing maths guide.
- The companion uses shoulder-pivot transforms, a single fixed friendly smile and occasional blinks. There are no breathing or squashing loops, SVG path morphs or extra mouth lines. A requested greeting is one bounded gesture; still mode gives an immediate static response.
- Filling starts only after an action. Next minute and finite Play steps make the lesson inspectable. Water, point, guide lines and the rule share MotionValues. Text values bind directly to those values, so React render load cannot make the written rule lag behind the drawing. Fills use anchored scale transforms; water grows from its base.
- Mixture never starts pouring while the learner reads. Both ingredients share one scale, preserving their two-fifths share through every frame. Replay is one bounded pour.
- Coordinates advance across, then up through separate actions. The trace and selected coordinates still restore after reload. Multiplication and distribution move one whole group at a time. Substitution reveals multiplication before addition.
- Factor products highlight one area and its matching edge product at a time. Middle-term combination is a separate stage; negative factors retain the signed symbolic explanation instead of inventing negative physical areas.
- Fractions, ratio strips and science quantity bars use scale transforms rather than tweening dimensions. Force and route paths redraw through a short fade/draw instead of morphing path data. CSS motion declarations and obsolete keyframes were removed from touched legacy styles.
- Correct answers settle once and draw their check. Wrong answers dim the pick and raise the fix note without a shake. Exam entry is distinct from a short question change, and the reading passage stays mounted between related questions. Score bars fill in sequence; group, week, skill and bridge progress have bounded feedback.

All motion still communicates support or activity. It never contributes independent learning evidence. Existing question generation, reserved examples and the two fresh unassisted checks remain unchanged. Offline caching is still Phase B.

Validation for this pass: all 115 domain tests passed; the main browser suite passed 28 journeys; the lesson suite passed 51 cases; controlled linked-model and recipe checks passed 8 cases; Explore passed 9 journeys. Lesson scenes were checked at 375 and 1280 px. The model checks sample intermediate frames and verify fixed fill anchors, point/water agreement, proportional recipe layers, synchronized rule text, bounded playback and static controls. Screenshots, WebM recordings and a short GIF preview are kept in ignored .refs folders.
