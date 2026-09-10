# Learning design decisions for Dunlo

This implementation note connects research checked on 11 September 2026 to concrete engineering decisions. It does not claim that Dunlo has demonstrated learning gains. The relevant test is successful independent application and later retrieval, with assistance, participation and self-report kept separate.

## Retrieval with corrective support

Yang, Luo, Vadillo, Yu and Shanks (2021) synthesized 222 independent classroom studies involving 48,478 students. Their reported average effect favoured quizzing, with substantial variation related to feedback, repetitions, format, comparison condition and study design. This supports including retrieval in instruction, not replacing teaching with repeated failure or assigning Dunlo the pooled effect size. [Original meta-analysis abstract and publication record](https://pubmed.ncbi.nlm.nih.gov/33683913/).

Implementation: fresh production questions after a lesson, an editable reviewer, and a recall invitation before revealing a future-self note. Corrections and analogous explanations remain available. Imported notes are sources; a learner's reflection is not automatically scored. Opening a resource remains a separate event.

## Work an example, then remove the support

Atkinson, Renkl and Merrill (2003) report that fading worked steps alone was more reliable for near than far transfer. Their two experiments combined fading with prompts about the underlying principle and reported improvements in both transfer outcomes. These studies support pairing incomplete examples with reasoning, not assuming any blank field creates deep understanding. [Authors' university publication record](https://asu.elsevierpure.com/en/publications/transitioning-from-studying-examples-to-solving-problems-effects-/).

Implementation: an example-first entrance, original visual and written examples, partially started answers in guided practice, optional explanation prompts, and a separate uncued check. Experienced learners can attempt the check directly. New families change signs, unknown positions or representation; they are not simply repeated number substitutions. These changes still require learner testing for difficulty jumps.

## Mixing methods is different from random difficulty

The What Works Clearinghouse review of Rohrer et al. (2020) describes a cluster randomized study of grade 7 mathematics in Florida. Interleaved and blocked conditions used the same problems in different orders; instruction included opportunities for support and corrections. The review rated the study as meeting its standards without reservations. The population and teacher-supported setting constrain transfer to an independent Philippine web app. [Study review, setting and implementation](https://ies.ed.gov/ncee/wwc/Study/88770).

Decision: use mixed rehearsal after an introduction so the learner has to choose an approach. Keep learn-first routes and small prerequisite bridges. Do not treat unprepared random switching as a desirable difficulty, and do not describe a sequence of two same-topic questions as fully interleaved practice.

## Space the return; do not manufacture retention

Dunlosky and colleagues' review rates practice testing and distributed practice as broadly useful while describing conditions and limitations across learners, materials and outcomes. [Original review publication](https://www.psychologicalscience.org/journals/pspi/1529100612453266/).

Implementation: editable initial intervals of one day, one week and two weeks for new settings. Existing preferences remain intact. The schedule advances after successful work separated by time; repeated practice in one sitting cannot repeatedly advance it. A delayed independent answer is recorded separately from immediate practice. These exact intervals and the one-day eligibility threshold are transparent product heuristics, not experimentally optimized values. Quiz preparation can justify additional practice today without implying durable mastery tomorrow.

## Animation must make the relationship inspectable

Tversky, Morrison and Bétrancourt (2002) caution that animation is not automatically superior to equivalent static graphics. Important information can pass too quickly or become too complex to perceive; meaningful interaction and comprehensible states matter. [Original paper abstract](https://www.sciencedirect.com/science/article/pii/S1071581902910177).

Implementation: stable tile identities, equal-length fraction wholes, labelled factor contributions, linked quantities and graph values, discrete steps, replay and reduced-motion/static equivalents. Motion expresses a mathematical change. No audio is required and videos load only after choice. Direct manipulation is exploration, not evidence of mastery.

## Interaction should elicit thinking

Chi and Wylie's ICAP framework distinguishes manipulating supplied material from generating additional understanding and jointly constructing explanations. It provides hypotheses and design guidance, not a rule that every interface labelled interactive produces superior learning. [Original paper](https://csi.asu.edu/wp-content/uploads/2018/01/ChiWylie2014ICAP.pdf).

Implementation: ask for a prediction, then let the learner test it; invite a principle-based explanation; include a counterfactual reconstruction; and follow shared Predictor/Explainer work with different individual exit questions. The bookmark offers a specific pointer and example on request. Its presence is not a claimed learning intervention.

## What the release must prove, and what a pilot must prove

Engineering checks can establish correct mathematics, preserved history, bounded routes, safe import handling, responsive controls and truthful evidence classifications. They cannot establish learning efficacy, motivation or population-level access.

A consented usability pilot should include first-time learners, refreshers and confident learners. Observe whether they understand the chosen next step, can request a bridge, can return after interruption and can use the controls on available phones. After equal content and study time, collect unfamiliar application items and later retrieval rather than reusing demonstrated answers. Preserve denominators, assistance, attrition and access failures. Record teacher preparation time. A small uncontrolled pre/post change does not establish causality.

Established methods are welcome. New mechanisms, including counterfactual reconstruction and contextual bookmark guidance, are hypotheses to evaluate by usefulness, independence and retention rather than novelty.
