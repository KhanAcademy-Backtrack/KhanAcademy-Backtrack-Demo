# The BACKTRACK route as a map, not a queue

Internal research note, 7 October 2026. Competitor and product names here stay out of learner-facing copy.

## Why it changed

The route was drawn as a numbered column of circles joined by one curve. The engine underneath is a
prerequisite graph (`skillDependencies` in `src/lib/recovery.ts`): a goal rests on two skills at
once (brackets: expand brackets and undo multiplication), and one foundation can hold up two skills
(motion: multiply numbers under both unit conversion and use a value in a rule). The column showed
parallel skills as a sequence, hid checked steps, and counted "possible review steps" that grew on
every miss.

## What we looked at

- **Obsidian graph and local graph.** Node-link graph with a force layout; hovering a node lights its
  links and fades the rest; the local graph shows only a few hops from the current note, and users find
  that view far more useful than the global one. Taken: focus lights neighbours and dims everything
  else, only today's route is shown, links stretch as nodes move, nodes can be tugged. Not taken:
  physics jitter, zoom and pan (they fight page scroll on phones), labels that fade with zoom.
- **Layered (Sugiyama) layout, as in dagre and ELK.** Ranks, barycentre ordering, crossing reduction.
  Edge crossings hurt comprehension more than any other layout aesthetic.
- **Game skill trees and tech trees.** Items sit as early as their prerequisites allow (longest-path
  ranks); optional prerequisites are drawn differently; a path to a target is highlighted.
- **Khan Academy's retired knowledge map and the move to single learning paths.** Most learners did better
  with one obvious next step, so the map gives context and the next step stays singular.
- **Concept-map research.** The most inclusive idea goes at the top. Studying a map helps modestly, more
  for novices; large maps overload. Signalling what matters helps. Visible progress keeps people going;
  remedial framing hurts motivation.
- **Accessibility guidance (W3C complex images, tree-view reports).** A diagram needs a text
  equivalent; a diamond cannot be a `role="tree"`.

## Decisions

1. Goal anchored at the top; rows are top-anchored so a new prerequisite grows underneath and the goal
   never moves.
2. Longest-path ranks; every order of a rank is tried and the fewest crossings wins, ties in curriculum
   (`ORDER`) order so siblings never swap sides as the current step moves.
3. Labels beside small circles (not tiles) so rows stay compact at the 292 px panel and 236 px phones;
   two columns down to 200 px; a tripwire test proves no reachable route needs three side by side.
4. Checked steps stay on the map; no step numbers; "You're here" and, during feedback, "Up next" mark the
   one next step. The heading reports progress only.
5. A link no dependency explains (wrong-turn clue, routing check) is dashed and attached to the skill
   whose answer raised it.
6. Shape and text carry every state; every line meets 3:1; orange is kept for "Needs practice".
7. Text equivalent: each step's button names its label and status; `aria-describedby` gives
   "Builds on … Needed for …"; focus order follows reading order.
8. Dynamic: each step sits on a spring and every line is redrawn from where the steps are each frame.
   The map unfolds from the goal on first paint, a new prerequisite springs out of the step that needed
   it, and a mouse can tug a step (its neighbours lean after it, the goal stays put) before it springs
   home. Quiet, reduced motion, typing and hidden tabs place everything at once.

## Review

Two critique rounds against this research. Fixed from them: sibling flips, step numbers that read as a
queue and a count that grew on misses, stale inferred links after the plan re-sorted, checked detours
vanishing, faint lines, long accessible names, edge redraws on resize, mid-word label breaks, an old
round's routing check labelling a new detour, and the motion window reopening on every keystroke.

## Sources

- Obsidian help, Graph view: https://obsidian.md/help/plugins/graph
- Obsidian forum, local graph neighbour links: https://forum.obsidian.md/t/local-graph-what-are-neighbor-links/6954
- Holten and van Wijk, directed edge representations (CHI 2009): https://hal.archives-ouvertes.fr/hal-00696823
- Layered graph drawing lecture (KIT): https://i11www.iti.kit.edu/_media/teaching/winter2019/graphvis/graphvis-ws19-v11.pdf
- Purchase, which aesthetic has the greatest effect on human understanding: https://research.monash.edu/en/publications/which-aesthetic-has-the-greatest-effect-on-human-understanding/
- Duolingo home screen redesign: https://blog.duolingo.com/new-duolingo-home-screen-design
- Novak and Cañas, theory underlying concept maps: https://users.cs.northwestern.edu/~paritosh/papers/sketch-to-models/Novak-Canas-TheoryUnderlyingConceptMapsHQ.pdf
- W3C, complex images: https://www.w3.org/WAI/EO/Drafts/tutorials/images/complex
- GitHub, accessible tree views: https://github.blog/engineering/user-experience/considerations-for-making-a-tree-view-component-accessible/
- Signalling principle meta-analysis: https://rex.libraries.wsu.edu/esploro/outputs/journalArticle/A-meta-analysis-of-signaling-principle-in/99900601052901842
- Yeager et al., wise feedback: https://sparq.stanford.edu/sites/g/files/sbiybj19021/files/media/file/yeager_et_al._2014_-_breaking_the_cycle_of_mistrust.pdf
