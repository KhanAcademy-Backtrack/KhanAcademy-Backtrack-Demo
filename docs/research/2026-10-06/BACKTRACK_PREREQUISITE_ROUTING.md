# How other products backtrack to missing prerequisites

Research note, 6 October 2026. Internal only: product names stay out of learner-facing copy.

## What we looked at

| Product | How it finds the gap | What the learner sees |
|---|---|---|
| ALEKS (knowledge space theory) | An adaptive initial assessment places the learner in a *knowledge state*. The *outer fringe* is the set of items they are ready to learn: every prerequisite is already known. | A list of "ready to learn" topics, never ones whose prerequisites are missing. An item joins the state after enough correct instances, and the fringe is recomputed. |
| Math Academy | An adaptive diagnostic finds the *knowledge frontier* on a prerequisite graph. Failing a lesson halts it and switches to unrelated work. Failing again triggers *remedial reviews* of prerequisites, "even if those topics lie several steps back". | Tasks only from the frontier. Remediation targets the specific prerequisite, and reviews are spaced. |
| Squirrel AI | Very fine-grained knowledge points. A wrong answer starts "tracing the source" back through earlier nodes to the root gap. | A path that repairs only the bottleneck nodes and skips what is already known. |
| IXL Real-Time Diagnostic | Diagnostic levels per strand produce *recommended skills*. Teachers also get a "Trouble spots" report ranking where students struggle most. | A personal action plan: two learners at the same level can get different skills. |
| Khan Academy | Mastery levels per skill. *Get ready for* courses bundle prerequisites, and a short quiz per skill shows readiness. | Course and unit structure. Prerequisite courses are separate, not generated per learner. |
| Cognitive tutors (Bayesian knowledge tracing) | Per-skill probability of mastery, updated by each answer. Mastery is a threshold (often 0.95). Prerequisite graphs extend this to skills underneath. | Skill bars. Problems continue until the threshold is reached. |

## What we took

1. **List only skills with evidence.** No product shows a learner every topic as a starting point once it knows something. The page lists a skill only when this learner's own answers point to it.
2. **Deepest missing prerequisite first** (fringe / frontier / root cause). A skill whose prerequisite is also missing waits behind it under *After that*, however far back that prerequisite sits.
3. **Clear on independent evidence.** A skill leaves the list after its last two checks were fresh, unassisted and correct: the reviewer's streak, which is our existing mastery rule. A later miss reopens it. Opening resources, hints, self-reports and "I don't know yet" can *raise* a skill but never clear one.
4. **Diagnose when there is nothing to go on.** With no evidence, the page offers a short mixed check (the Sprint) instead of a topic menu. The topic chooser stays available, but folded away once there is a list.
5. **Say why.** Every listed skill shows its reasons and dates ("Missed 2 questions in Sprint: …", "Your route pointed back to this step").

## What we did not take

- No probabilistic model. With 16 skills and evidence that already separates assisted from independent answers, a transparent rule is easier to explain to a learner and a teacher. BKT-style estimates could come later, if data justify them.
- No forced order. The *After that* skills are shown rather than locked, and the BACKTRACK route itself still checks prerequisites at the start of every repair.

## Where it lives

- `src/lib/gaps.ts`: `findGaps(study, attempts, now)`, which is pure and read-only. Tested in `tests/gaps.test.mjs`.
- `src/components/k/MissingSkills.tsx`: the `/start` page.

## Sources

- [ALEKS and knowledge space theory (Matayoshi et al.)](https://jmatayoshi.github.io/publications/JMP2021_KST_ALEKS_preprint.pdf)
- [Math Academy: how our AI works](https://www.mathacademy.com/how-our-ai-works)
- [Frank Hecker, Math Academy part 5: product features](https://frankhecker.com/2025/02/12/math-academy-part-5/)
- [Squirrel AI overview](https://en.wikipedia.org/wiki/Squirrel_AI)
- [IXL Diagnostic action plan guide](https://www.ixl.com/materials/diagnostic/IXL_Diagnostic_Action_Plan_Guide.pdf)
- [Khan Academy: Get ready for courses](https://blog.khanacademy.org/get-ready-for-sat-prep-math-your-foundation-for-progress/)
- [Knowledge tracing: a survey (ACM)](https://dl.acm.org/doi/10.1145/3569576)
