# Dunlo: what to learn from Brilliant and what to improve

Planning research checked 10 September 2026. The user explicitly authorized publication of the full research in this public repository. Keep competitor names, reviews, pricing and comparisons out of Dunlo’s learner-facing website, deck and application. Repository publication does not change that product/presentation boundary. The separate implementation prompt is intentionally excluded from Git.

## Plain-language TLDR

Dunlo does not need to invent a new category. Borrow Brilliant’s useful interaction patterns freely: linked diagrams and equations, small challenges, immediate feedback, guided progression, adaptive practice, a companion that helps at the right moment, and motivating returns. Build original Dunlo lessons and graphics around those patterns.

The strongest opportunity is to make those mechanics work together around a Filipino learner’s actual learning goal: **“Help me understand this topic, prepare for my quiz, and remember it when I need it.”** That includes curious students learning ahead, students refreshing old material, and students who get stuck.

Brilliant is good at making abstract ideas approachable and making people want to continue. The evidence does **not** support saying it cannot teach. Its weak spots are uneven explanations and difficulty, learners mistaking guided success for independent ability, interruptions from gamification or tutoring, and practical access or curriculum mismatches. Several old complaints have been partly addressed. Dunlo must compete with the current product.

My honest verdict: Dunlo is a promising working companion, but there is not enough learner evidence to call it a top-three contender yet. The live factoring exploration has a useful mathematical mechanism; the brackets explanation is much closer to an answer reveal. The next improvement should make that depth consistent, connect it to quiz planning and review, and test whether learners can solve unfamiliar problems afterward. More features alone will not establish impact. Keep the features; improve the connections and teaching.

Recommended combination: **interactive explanations with gradually removed support + quiz-scope planning + useful return sessions**, delivered through accessible phone controls, optional language support and a small teacher/peer routine. This is one connected experience, not six unrelated new product tabs.

The next implementation session should put **original instructional graphics/animations and a stronger BACKTRACK engine first**. Free learner access is a product commitment. Reaching all Filipinos is the ambition; current subject, language and connection coverage must still be stated accurately. Khan belongs wherever a reviewed resource helps; a missing match must not prevent an otherwise useful original Dunlo lesson.

## What was actually inspected

- Current public Brilliant homepage animation sequences, onboarding entry, regional subscription page, current feature/help pages, curriculum and educator documentation.
- Dunlo’s live Today, Study, study-session and recovery demo. Created a disposable local study session through the UI and tested the factoring replay. No project code, deck, deployment or accounts were changed. Existing documentation and slides were excluded as requested. The stated release commit `4d49755` was supplied by the user, not independently matched to the deployment.
- Original Reddit discussions from 2022–2026, Philippine App Store reviews, Google Play reviews, Trustpilot customer accounts, commercial editorial reviews and educator commentary. This is purposive qualitative research, not a representative survey. Repeated comments or cross-posts are not independent corroboration.
- Philippine government statistics and curriculum resources, local language/peer-learning studies and broader learning research.
- The official competition page, as a secondary constraint check. Its public text was readable through the browser. No application was submitted.

Brilliant’s homepage demonstrations are promotional recordings, not hands-on trials of all paid lessons. They establish visible design patterns, not measured teaching effectiveness. Main-course onboarding was inspected only up to its initial preferences. No subscription or paid trial was started, and Koji’s correctness was not independently stress-tested.

## Brilliant’s current capabilities: the baseline Dunlo should learn from

**Visual instruction and feedback.** Brilliant combines manipulable representations with questions, expression entry and feedback. Its current help explicitly covers a math keyboard and negative-number tiles. The article acknowledges that some gestures and cursor behavior confuse users. This is an especially useful lesson: powerful interactions still need obvious controls. [Official interactive controls guide, updated 10 August 2026](https://brilliant.org/help/features/how-do-i-use-interactives-on-brilliant/).

**Personalized practice and paths.** Brilliant advertises practice selected from prior performance. Its current Learning Paths organize related courses, with checkpoints and recommended order; Premium supports freer navigation. It is inaccurate to say Brilliant has no adaptation or coherent paths. Exact recommendation behavior was not audited. [Practice overview](https://brilliant.org/math/practice/), [Learning Paths, updated 3 August 2026](https://brilliant.org/help/features/what-are-learning-paths/).

**Contextual tutoring.** Koji can respond to the current lesson and manipulate its interactive environment. Most foundational math/coding courses are covered, with a limited free preview and full Premium access. Muting suppresses speech bubbles apart from brief correctness feedback. These are vendor-described capabilities; the claimed accuracy is not an independent evaluation. [Koji help, updated 1 September 2026](https://brilliant.org/help/features/how-does-koji-work/).

**Question-to-lesson routing.** Web users can describe a mathematics need from Home and receive a relevant lesson or practice recommendation. Dunlo should learn from this low-friction entry even if its current version implements a transparent, reviewed topic matcher. [Ask Koji, updated 11 August 2026](https://brilliant.org/help/features/ask-koji-a-math-question-and-find-the-right-lesson/).

**Motivation and progress.** XP, weekly leagues, streaks, streak protection, parent progress reporting and lesson/level redos exist. These should be evaluated separately: activity rewards encourage returns; they do not by themselves establish understanding. Older “cannot redo” complaints are partly superseded by September’s documented level-reset option. [Features index](https://brilliant.org/help/features/), [current redo/reset instructions](https://brilliant.org/help/features/can-i-reset-course-progress/).

**Broad educational coverage.** Current course documentation includes foundations through calculus and describes both standards mappings and gaps. It explicitly distinguishes concept coverage from reproducing every school syllabus or assessment. Avoid repeating older claims that all advanced material is gone or that no curriculum mapping exists. [Current math coverage, updated 4 September 2026](https://brilliant.org/help/courses-and-curriculum/what-math-does-brilliant-cover/).

## Individual affordability and educator access are different questions

The Philippine web subscription page displayed **₱900/month** and **₱575/month equivalent for the annual plan** on 10 September. Annual billing means **₱6,900 paid together**, calculated as 575 × 12. It also displayed a six-seat Family option at ₱1,150/month equivalent. These are observed regional offers, not a promise of the price every account/platform will receive. No checkout was completed. [Brilliant’s regional pricing page](https://brilliant.org/subscribe/).

The Philippine App Store lists several purchase prices, including ₱690, ₱4,290 and ₱6,990, without clearly pairing every entry to billing periods and eligibility. Those entries should not be mixed into a single authoritative price. The listing specifies English and iOS 17+, and does not declare its supported accessibility features. Absence of that declaration does not prove absence of accessibility support. [Philippine App Store listing](https://apps.apple.com/ph/app/brilliant-learn-math-coding/id913335252).

Individual free users can access courses under daily limits: two keys, sequential course progress, occasional ads and a limited Koji preview. There is also a distinct free K–5 library without an account. Thus the access problem is not “Brilliant is paid-only”; it is whether free limits and navigation suit a particular school deadline. [Current FAQ](https://brilliant.org/faq/).

The free educator programme prioritizes eligible K–12 classroom teachers in underserved communities, with application review. Approved teachers can assign lessons and track progress; participating students get Premium classroom access. Google Classroom roster integration is documented. The page does not establish automatic approval for every Philippine teacher; colleges and universities are generally outside this programme. UP Manila affiliation alone is not an eligibility guarantee for it. [Educator programme, updated 21 August 2026](https://brilliant.org/help/for-educators/what-is-brilliant-for-educators/).

Current Brilliant lessons require internet access; its help says they cannot be downloaded for offline study. This contradicts some recently retitled third-party reviews. [Official offline policy, updated 29 October 2025](https://brilliant.org/help/using-brilliant/can-i-download-brilliant-lessons-or-use-them-offline/).

For Dunlo, affordability means keeping the present no-account core useful without a subscription, making data use controllable, and reducing preparation work. It does not justify promising permanent free hosting, universal device access or free human tutoring.

## What the strongest visual patterns do well

These are representative examples observed on the current homepage or documented in current help, not a ranking of every Brilliant lesson. [Observed Brilliant demonstrations](https://brilliant.org/).

1. **One event, two representations.** In a homepage sequence, marbles enter a vessel while points track volume against marble count. The concrete event explains the graph; the graph quantifies the event. Dunlo should similarly couple a changing situation, a table and an equation.
2. **Corresponding motion.** Another sequence links circular motion with a trigonometric curve. Its transferable idea is maintaining correspondence while representations change. Dunlo can use this for linear slope and intercept before adding new subject areas.
3. **Local mathematical attention.** The algebra demonstration links selected terms of a product to the expression being assembled. Attention follows the operation, instead of a mascot bouncing independently of the maths.
4. **Visible cancellation.** Official negative-tile help describes positive/negative pairs summing to zero. This reveals an invariant rather than merely decorating arithmetic.
5. **Progressive explanation.** The useful design pattern is a sequence of manageable decisions with responsive support. The full derivation should remain available for learners who need it.

The typography and polish matter because they make the representation easy to read, but the deeper value is **semantic continuity**: the learner can follow what changed and why. Dunlo should produce its own lesson scripts, visual assets and code using these general principles.

An animation earns its place only if it helps the learner answer a mathematical question. A slider is worthwhile when students first predict its effect, compare outcomes, explain an invariant and later work without it. A slider moved until an indicator turns green is weak evidence of understanding.

## Review evidence: positive, mixed, negative and outdated

Dates below belong to the cited posts or named comments. Where only a relative comment date was available, that limitation is retained. Storefront location does not establish a reviewer’s nationality.

**Philippine App Store, 27 December 2025 — Charles-kun, paying non-STEM college learner.** Enthusiastic about game-like review and recovering forgotten fundamentals, but requests more challenging review and a course exam. This is unusually relevant to Dunlo: enjoyment and demand for stronger assessment coexist in the same review. **21 January 2025 — `<ID>`, paying user:** praises courses while criticizing zoom/font controls. Current device-level reproducibility was not tested. [Original PH App Store feedback](https://apps.apple.com/ph/app/brilliant-learn-math-coding/id913335252?platform=iphone&see-all=reviews).

**Google Play, 7 May 2025 — Dakota Leitow, returning algebra learner.** Reports renewed enjoyment and easier conceptual understanding. **12 April 2026 — Zachey Mczachface, casual learner:** likes the pace and thinking required, dislikes the small free daily allowance. **7 August 2025 — RJ P, seven-month user:** strongly values points and streak rewards. All are self-reports; none measures independent retention. [Original Google Play reviews](https://play.google.com/store/apps/details?id=org.brilliant.android).

**Reddit, 6 November 2024 — aflowofcode, software engineer, roughly a year of mathematics use.** Appreciated design and familiar-topic review, but found advanced/new material under-explained. The same thread contains a **23 February 2026 company response** acknowledging the earlier gap and describing algebra expansion and planned calculus improvements. The criticism is informative, but cannot stand in for a September 2026 audit. [Original year-long review and response](https://www.reddit.com/r/learnmath/comments/1gkot3t/review_one_year_of_learning_math_on_brilliant/).

**Reddit, thread opened 4 January 2024 — multiple learner contexts.** A high-volume returning user values puzzles and routine; an engineering learner says visual problems improved understanding; a retired mathematics teacher reports renewed interest but occasional ambiguous questions. Other commenters prefer derivations and find the visuals confusing. The retired-teacher comment was displayed with a relative age, so its exact posting date is unverified. This is heterogeneity, not proof of fixed “visual learner” types. [Original mixed discussion](https://www.reddit.com/r/learnmath/comments/18yei5q/honest_thoughts_on_brilliantorg/).

**The slider complaint — original commenter Mysterious-Degree-63 in a July 2022 thread.** The visible comment was labelled approximately three years old at retrieval; its exact date and courses are unverified. It describes theorem statements, one-dimensional plots and quizzes. Other participants report that small chunks and instant feedback help them focus. This matches the substance of the user’s hypothesis; it is not enough to confirm the identity of their earlier screenshot or generalize to the present library. [Original discussion](https://www.reddit.com/r/learnmath/comments/vvb3s9/is_brilliantorg_worth_it/).

**Reddit, 25 April 2024 — r/math discussion.** Multiple commenters criticize abrupt jumps and limited reinforcement. The post’s author explicitly had not used Brilliant; that author’s skepticism is not first-hand evidence. Actual-use comments are useful hypotheses, especially for advanced self-study, but were posted before the current Koji experience. [Original discussion](https://www.reddit.com/r/math/comments/1ccphrg/how_effective_is_brilliantorg_really/).

**Reddit, 27 May 2026 — Koji update discussion.** A paying learner preparing for an academic class complains about distracting movement, noises and repeated text. Brilliant’s engineer replies that muting now hides the bubbles except correctness feedback; current help corroborates that change. The recurring opportunity is user control over help, not a claim that Koji is still impossible to mute. Some criticism is ideological opposition to AI, which is different from an observed teaching failure. [Original thread and engineer response](https://www.reddit.com/r/learnmath/comments/1tp4l2q/this_place_seems_to_have_some_brilliant_users/).

**Reddit, 11 March 2026 — new-course praise.** A user welcomes polar coordinates and Python recursion; another reports enjoying the free version during an 80-day streak. Small positive sample, useful counterweight to “everything got worse” claims. [Original thread](https://www.reddit.com/r/learnmath/comments/1rralrl/brilliantorg_new_courses/).

**Reddit, November 2025 thread with 2026 follow-ups.** A **24 August 2026** commenter describes being 37, preparing for a GED after leaving school early, and finding Brilliant useful as a primer alongside other resources. A **27 July 2026** parent reports good use for an advanced eight-year-old. A **1 September 2026** commenter reports being unable to jump ahead due to level checks. That last behavior conflicts with general Premium navigation copy; plan/account conditions were not established. Do not elevate it into a universal policy. [Original discussion](https://www.reddit.com/r/learnmath/comments/1p3jlyn/anyone_use_brilliantorg_can_it_really_improve/).

**Reddit, Python thread, 21 April and 19 July 2026 comments.** One learner likes Brilliant but deliberately builds small programs outside it after lessons; another finds its simplified sequence confusing. This supports testing transfer outside the guided interface. It is coding feedback, not direct evidence about Filipino school mathematics. [Original learning-Python discussion](https://www.reddit.com/r/learnpython/comments/1it2luz/should_i_start_learning_python_through_brilliant/).

**Trustpilot, September 2026.** Recent named reviews include praise for interactive learning and successful refunds, alongside complaints about cancellation and renewal. Dylan Maki’s 9 September account describes a helpful refund after family commitments interrupted use; Jack Hibberd’s page entry dated 9 September reports cancellation trouble. These are conflicting individual service experiences. Billing complaints recur across platforms but do not prove mathematical ineffectiveness or deliberate misconduct. [Original customer reviews](https://www.trustpilot.com/review/brilliant.org).

**Educator accounts need provenance.** The 7 February 2023 BOLD interview discusses warm-ups, extension and student discourse, but interviewee Nate Madick is Brilliant’s Educators Outreach Lead. It has practitioner value and a clear commercial affiliation. Brilliant’s educator-page testimonials are selected marketing, not an independent classroom study. [BOLD interview](https://boldscience.org/teachers-voices/interactive-math-learning-for-students/), [educator testimonials](https://educator.brilliant.org/).

**Independent publishing is not the same as independent evidence.** Sander Tamm’s e-student review, updated 10 June 2026, praises the interface and notes pricing/billing disadvantages, with an affiliate disclosure. Its offline/free-tier/community descriptions contain claims inconsistent with current official help, so they were excluded from current feature conclusions. Its linked Common Sense review now redirects to a general list; the original educator review was not verifiable there. [e-student review](https://e-student.org/brilliant-org-review/).

Daniel | Tech & Data’s review is titled 2026 but was published **1 May 2025** and explicitly says it is sponsored by Brilliant and contains affiliate links. It is a demonstration/promotional source, not independent validation. TeachThought says “not sponsored” but labels its article contributed by Brilliant.org. The Learning Standard says it has not fully evaluated the product. None should be counted as an independent efficacy trial. [Daniel’s video disclosure](https://www.youtube.com/watch?v=DIHbcH6LAgQ), [TeachThought provenance](https://www.teachthought.com/education-posts/new-tool-for-stem/), [Learning Standard evaluation status](https://thelearningstandard.org/apps/brilliant-for-educators).

### What recurs, and what remains uncertain

Recurring positive themes: enjoyable engagement, visual intuition, approachable foundations, useful refreshers and habit formation. Recurring mixed/negative themes: difficult transitions into unfamiliar material, insufficient depth for some goals, wanting more independent practice, interruptions, disrupted continuity after course changes, and price/renewal frustration.

These themes recur within the reviewed material; their population frequency is unknown. Many negative examples involve calculus, advanced STEM or adult preferences, while Dunlo currently supports five foundational mathematics areas. Older “no questions,” “no adaptation,” “no teacher tools,” “no free access” and “no redos” descriptions cannot be carried forward as current facts.

## Does Brilliant fail to teach? The evidence supports a narrower conclusion

Learning satisfaction, time on task, a streak and success on a guided item answer different questions. None alone establishes lasting independent understanding. Conversely, complaints about price or a disliked mascot do not establish poor learning.

Brilliant reports July 2026 behavioral data for secondary learners who requested Koji help: 94% retried, 66% answered that problem correctly, and 87% of those continuing answered the next problem correctly. These are company-reported, selected denominators with no independent control comparison or delayed test shown on the page. They are promising engagement signals, not proof of general effectiveness. [Vendor report and qualification](https://brilliant.org/resources/choosing-brilliant/is-brilliant-worth-it/).

A published 2023 study examined 60 Grade 10 learners from four public schools in Barranquilla, Colombia, studying linear algebra/matrices. It reports higher grades for the Brilliant group. However, the full paper contains internal inconsistencies: page 93’s ANOVA paragraph reports F(1,58)=5.04, p=.029, while Table 4 reports F(3,56)=2.91, p=.038; page 96 then describes no significant ANOVA difference. It also involves teacher-supported activity and an older product. This is weak support for broad causal claims, not evidence that no research exists. A related 2025 record should not be counted as a second independent experiment without establishing its relationship. [2023 full paper, pp. 82–103](https://files.eric.ed.gov/fulltext/EJ1394390.pdf), [related 2025 ERIC record](https://eric.ed.gov/?id=EJ1473924).

General learning research offers stronger design guidance, although it does not prove either product works:

- ICAP distinguishes manipulating information from generating explanations and jointly developing understanding. Clicking an “interactive” screen does not automatically produce the deepest engagement. [Chi and Wylie, 2014](https://csi.asu.edu/wp-content/uploads/2018/01/ChiWylie2014ICAP.pdf).
- A meta-analysis of 164 studies favors explicit instruction over unassisted discovery, while supported discovery benefits from feedback, scaffolds, worked examples and explanations. Therefore, Dunlo should offer help before failure and gradually remove it. [Alfieri et al., 2011](https://openresearch.surrey.ac.uk/esploro/outputs/journalArticle/Does-Discovery-Based-Instruction-Enhance-Learning/99515521902346).
- Practice testing and distributed practice received high utility ratings in a broad review. This supports fresh independent checks and scheduled returns, not one universal interval or mastery threshold. [Dunlosky et al., 2013, publisher summary](https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html).
- Animation research emphasizes representing the right concept at a perceivable pace. Motion can obscure relationships when it is too fast or complex. Pause, step and static alternatives matter. [Tversky, Morrison and Bétrancourt, 2002](https://doi.org/10.1006/ijhc.2002.1017).

## Philippine usefulness: supported opportunities and limits

**Curriculum and quiz scope.** The live DepEd Grade 9 MATATAG budget of work begins with geometry and then functions/linear graphs, whereas the older Grade 9 portal lists quadratics. The transition makes school-year and curriculum version important. A generic “Grade 9 = quadratics” pack could mislead. Let the actual teacher’s scope drive the plan, attach specific reviewed competency references, and leave unsupported topics visibly unmatched. [Current Grade 9 budget of work](https://www.deped.gov.ph/wp-content/uploads/BOW-Math-9.pdf), [older Grade 9 guide](https://lrmds.deped.gov.ph/detail/15900), [MATATAG implementation FAQ](https://www.deped.gov.ph/wp-content/uploads/FAQs-ON-THE-MATATAG-CURRICULUM.pdf).

**Need without overclaiming.** In PISA 2022, 16% of assessed Philippine students reached at least Level 2 in mathematics. That establishes a national challenge among the assessed population; it does not identify Dunlo users’ gaps or prove that poor study planning caused the result. [OECD country note](https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/philippines_a0882a2d-en.html).

**Devices and connectivity.** PSA’s 2024 survey reports home internet access for 48.8% of households. Its individual infographic reports cellphone use among 98.8% of internet users aged 10+. These are different denominators. They support phone-first, data-conscious design; they do not say half of students have no internet or that every learner owns a smartphone. [PSA household release, 21 July 2025](https://psa.gov.ph/content/percentage-households-internet-connection-increased-488-percent-2024-two-every-three?vcode=50), [national individual-use infographic](https://psa.gov.ph/sites/default/files/infographics/2024_NICTHS%20INFOGRAPHICS_Individual.pdf).

**Language.** A 2026 study of 60 Grade 8 learners at a laboratory high school found no statistically significant achievement difference between code-mixed and English-only word problems. Earlier small studies describe communication benefits from code-switching, but are not nationwide preference surveys. Offer optional plain-language Filipino support while retaining English mathematical vocabulary and original notation; do not force Tagalog nationally or promise gains from translation. [Cañaveral, Necesito and Pineda, 2026](https://neustgijem.com/index.php/pub/article/view/36), [2020 classroom code-switching research record](https://eric.ed.gov/?id=EJ1245827).

**Teacher workload.** EDCOM II/IDinsight’s March 2025 brief reports approximately 52 self-reported working hours weekly, with 45% spent teaching. A new reporting system is a real cost. Dunlo should reuse scope links and printable sheets, with a brief optional evidence hand-in rather than daily manual dashboards. [Workload brief](https://edcom2.gov.ph/media/2025/03/EDCOM2_Policy-Brief_Ancillary-Workload.pdf).

**Peer study.** Project Math BUDDIES, published 27 October 2023, studied 22 Grade 7/8 learners in Lipa and reported promising peer-teaching outcomes alongside confidence/dependency difficulties. It supports testing structured explanation roles, not assuming all Philippine peer study is effective or common. Same-screen co-op should alternate who predicts, explains and solves, then give each learner a different independent exit item. [Original study](https://journal.whioce.com/index.php/eir/article/view/251).

**Affordability and interruptions.** Prepaid-data use, shared devices, short study windows and transport interruptions are plausible design scenarios, not facts established for a Dunlo cohort. Validate them directly before turning them into audience-wide claims. Offer predictable low-data behavior, resume, paper alternatives and optional portable saves. Khan video/practice still needs a working connection.

## Honest critique of Dunlo, then the improved direction

**Usefulness:** the live product already answers “what today?” through packs, time choices and a resumable plan. Its value depends on whether the recommended round is appropriate. Generic copy such as “work toward the topics in this pack” should state the actual reason for a recommendation.

**Teaching mechanics:** the factoring replay is mathematically responsive: 2 and 6 produce the correct constant but wrong middle coefficient; 3 and 4 satisfy both. The brackets visual immediately displays the expanded result, and “Break it into steps” adds text. That is a valid worked example, but it is not yet a strong interactive lesson. Preserve it as an explanation option while adding meaningful learner decisions.

**Creativity:** the best creative work is the interaction itself—showing why the same wrong answer can come from different reasoning, linking a prediction to a model, or carrying a student’s earlier prediction into a later check. A GPS illustration alone is not innovation. Use the route only to clarify current step, destination and next action.

**Return value:** review, Rematch, notes and quizzes should share the same skill evidence and topic scope. A reminder to return is weaker than a return that immediately knows what is useful. A friendly weekly rhythm is already better suited to interruptions than punitive lost-streak messaging.

**Philippine fit:** school-scope matching, readable touch controls, optional language support, data choice and low-workload hand-ins are credible improvements. Peso examples alone do little.

**Competition potential:** the missing evidence is whether this produces repeat, meaningful Khan engagement and independent learning at manageable cost. There is no basis to forecast an award. A demonstrable learning loop and a modest, honest validation plan will strengthen the entry more than a feature-count comparison.

The initial temptation is to add a visual playground and a tutor everywhere. Critique: that could add distraction, data use, superficial success and more navigation. The improved plan embeds each visual inside an existing learning goal, makes support optional and contextual, saves its useful output as a note/review cue, and finishes with independent application. All existing features remain available.

## Recommended creative improvements

### 1. An explanation the learner can test

Situation: a student sees an expansion or graph but cannot explain why it works. Interaction: predict a change, manipulate an original visual, connect it to symbols, explain the invariant, then solve without the visual. Teaching benefit: links representations and exposes fragile understanding. Return: the saved misconception or question becomes a new challenge in Review. Verify: correct mathematical invariants, unfamiliar no-hint transfer items, delayed retest, touch/keyboard/static parity. Extend this across all five current domains.

### 2. A quiz plan built from the actual scope

Situation: a quiz is coming but notes, teacher topics and Khan resources feel disconnected. Interaction: enter date and scope, confirm supported matches, choose time, see one useful session and the remaining scope. Teaching benefit: preparation includes learning new content, prerequisite support and mixed rehearsal. Return: “today” changes as the quiz approaches and evidence improves. Verify: dates work locally, missing topics remain visible, unknown scope is not silently dropped, shrinking a plan does not erase work, and learners understand why each step is suggested.

### 3. A return that remembers the learning question

Situation: the learner understood yesterday but is unsure today. Interaction: attempt a fresh problem before revealing a future-self note; compare current reasoning with the earlier difficulty afterward. Teaching benefit: retrieval and reflection replace passive rereading. Return: a specific unresolved or due idea, without streak punishment. Verify: due dates respond to independent evidence; missed days preserve history; help on an item cannot be counted as independent success.

### 4. A quiet companion with specific help

Situation: a learner needs one explanation without leaving the maths. Interaction: the bookmark points to the relevant term and offers “Why this step?”, “Show another example”, “Explain the words” or “Open Khan explanation”. Teaching benefit: support refers to the actual mathematical state. Return: remembers the chosen amount of help and offers the next useful challenge. Verify: all guidance has a reviewed rationale, mute/reduced-motion work, no generic praise interrupts input. A deterministic reviewed version suits the present no-backend constraint; open-ended AI remains a separately costed future option.

### 5. One phone, two thinkers

Situation: two classmates have one available screen. Interaction: predict separately, compare reasoning, switch explanation roles, then solve different solo exit questions. Teaching benefit: reasoning must be articulated, and one stronger student cannot stand in for both. Return: shared topic links make another session easy; private progress stays separate. Verify: one learner’s answer never certifies another, both have turns, and sharing scope does not expose notes or scores.

### 6. A lesson that survives an interrupted connection

Situation: a learner can briefly connect but cannot stream throughout a session. Interaction: save supported original explanation/check content and resume locally; choose Khan media deliberately; use a printable equivalent when needed. Teaching benefit: interruption does not erase momentum. Return: the next action is still waiting. Verify: explicitly test what works after reload without a connection, label uncached resources honestly, preserve saves through updates, and measure transferred bytes instead of merely saying “low data”.

The strongest immediate combination is 1 + 2 + 3. Improvements 4 and 6 shape their delivery, and 5 uses the existing co-op feature. This sequencing preserves breadth while concentrating the first round of effort on learning quality.

## Strengthening BACKTRACK itself

### Design tests from the specific r/math thread

The user-selected [25 April 2024 discussion](https://www.reddit.com/r/math/comments/1ccphrg/how_effective_is_brilliantorg_really/) is useful beyond its age. Old-Pianist-599 describes abrupt jumps; Fickle_Industry5219 says explanations repeat answers; Air_Awear describes over-condensed text; other replies question depth and practice. Positive replies value conceptual anchors and getting started. Tutor tomtomtomo reports benefits with human help. These are self-reports, not controlled comparisons. Whether Brilliant subsequently fixed a behavior does not remove the requirement to prevent it in Dunlo.

The following are original product responses to those failure modes:

1. **Prevent sudden difficulty cliffs.** Each skill gets a ladder: orientation, worked example, partially completed example, independent same-structure problem, changed representation, mixed application. Track what varies between adjacent items. Introduce a new idea without simultaneously adding unfamiliar vocabulary, negative values and multi-step arithmetic. BACKTRACK should select the missing bridge, not restart the whole subject. This strengthens the challenge’s learning-impact pathway and makes Khan remediation more relevant.
2. **Explain a reason, not just an answer.** Every help state includes the applicable principle, the step where it matters, why the attempted move changes the problem, and an analogous worked example. A correct answer plus “try again” is insufficient. The learner should be able to ask for more detail without failing another item. This improves educational value and credible innovation.
3. **Require production after recognition.** Follow a visual with an uncued expression or diagram the learner must produce. A multiple-choice explanation can support learning but should not be labelled an independently generated explanation. This protects impact reporting from inflated success.
4. **Build enough practice by structure.** Create reviewed item families across signs, positions, unknowns, representations and boundary cases. Randomly changing numbers is not enough. Offer additional practice when useful, allow confident learners to move on, and let deliberate mixed rehearsal demand strategy selection. This supports repeated meaningful engagement without wasting time.
5. **Bridge the diagram to the formal method.** Show how each visual operation becomes an equation step; progressively remove visual support. Keep complete derivations, prose and optional Khan explanation available. Animation and rigorous mathematics should reinforce each other.
6. **Permit sustained thinking.** Short entry sessions should lead to optional longer problem solving. Include one multi-step challenge and a scratch-work-friendly layout; the app should not force a “Continue” after every tiny calculation. Save state without penalizing a pause. This keeps the broader companion and learner agency intact.
7. **Give the course an exit into further learning.** Show the next supported Khan learning/practice resource, or clearly identify the remaining teacher-provided topic when no match exists. Save the return question before leaving. This directly serves meaningful Khan integration rather than counting clicks.
8. **Preserve useful struggle without abandonment.** Learners can request a hint, a complete analogous example, a simpler prerequisite, a language explanation, or a human-help card. The engine distinguishes “not enough evidence” from “you do not know this.” This addresses access and supports learners without a nearby tutor.
9. **Make history useful.** Notes, attempts, solved variants and remaining questions stay findable. A shared challenge can ask classmates to explain a different approach, without adding a public forum or exposing private scores. This improves return value using existing features.
10. **Prove useful learning instead of attractive activity.** Measure independent unfamiliar-item performance, delayed retention, return from an appropriately matched Khan resource and teacher effort. Keep animation completion, assisted answers and weekly session counts as separate activity signals. This connects the product work to the tournament’s needs, impact, integration and sustainability criteria.

Do not implement a literal “100 times more lessons” demand from a comment. Solve its underlying concern through a complete, reviewed progression and enough varied practice. Do not accept the thread’s unsupported claims about company motives, all animations being marketing, or difficult learning needing to feel unpleasant. Dunlo should be enjoyable and intellectually demanding.

BACKTRACK should be more than a wrong-answer redirect. Its output should be the smallest justified, useful next learning step, followed by a return to the learner’s goal. A wrong answer is a clue, not a diagnosis.

For the existing quadratic example, choosing 2 and 6 could mean remembering only the product condition, misadding, confusing factors with solutions, or guessing. A targeted check should distinguish those possibilities. Choosing 3 and 4 could indicate a sign/zero-product gap even though factoring is understood. Do not assign both students the same prerequisite chain.

The engine should preserve the goal and original attempt, maintain several possible explanations, ask one discriminating check at a time, and offer a short reviewed explanation when the evidence is inconclusive. Do not produce a fake precision score for a learner’s misconception. Language confusion and interface trouble should have their own exits.

Recovery should use an analogous problem for instruction, then offer the original problem as a return and a different independent problem as transfer. Re-solving an answer already revealed is weaker evidence and must be labelled accordingly. Learning ahead can use the same engine as an optional prerequisite check or a direct guided lesson, without failure.

The implementation prompt specifies separate evidence for prediction, assisted work, independent answers, self-reported Khan activity and later retention. A successful animation is not automatic mastery. A return should become longer or shorter based on fresh answers, with learner override and no forced loops.

## Additional opportunities beyond the current verified Brilliant surface

The following are useful additions, not claims that nobody else has built them. Features not found in this research are marked as such rather than asserted absent.

**Verified access gap: downloadable original mini-lessons.** Brilliant’s current help explicitly excludes offline lessons. Dunlo can offer an offline-capable pack of its own graphics, text, checks and saved state, with optional Khan resources queued for the next connection. This is a concrete access improvement if tested after a disconnected reload; caching claims alone are insufficient.

**Not verified in Brilliant: a teacher-scope coverage receipt.** A learner imports quiz topics and sees which are supported, which map to reviewed Khan lessons, and which still require classroom material. The receipt prevents a polished plan from silently giving false confidence about full quiz coverage. It extends Dunlo’s existing packs and imports rather than replacing them.

**Not verified in Brilliant: a portable, account-free learning passport.** A small user-controlled file carries local progress and future-self notes between a shared phone and school computer. Import previews show exactly what will transfer. Scope sharing remains separate and excludes private answers. No automatic cloud sync or account backend is required.

**Not verified in Brilliant: “What would make this answer true?”** Instead of only correcting a wrong response, the learner changes the problem so their answer becomes valid, then explains the difference. For factors 2 and 6, the corresponding polynomial is x² + 8x + 12, not x² + 7x + 12. The return question then reverses the direction again. This tests structural understanding instead of chasing a green tick.

**Not verified in Brilliant: a question ready for a human helper.** A learner can produce a compact, local help card: goal, attempted step, chosen explanation, remaining question, and relevant resource. They decide whether to show it to a classmate or teacher. This turns unresolved confusion into a useful question without launching a moderated community platform.

**Not verified in Brilliant: paired reasoning with separate exit evidence.** Extend existing co-op so both learners commit to a prediction, exchange explanations and finish different questions independently. A friendly shared session can coexist with truthful individual learning records.

Prioritize the coverage receipt and counterfactual explanation alongside BACKTRACK. Add portable saves and offline packs after content and migration behavior are solid. All of these should improve learning or access; novelty by itself is not an acceptance criterion.

## A learner journey to test, not a fabricated case study

Mika is an illustrative learner preparing for a teacher-set quiz on linear graphs. She has a shared scope link and ten minutes. She chooses “Learn something” because slope is new; Dunlo does not require her to fail first.

The session asks what will happen to a graph when the rate changes. Mika makes a prediction, changes the rate in a labelled model, and sees the table, graph and equation respond together. She asks for a plain-language explanation of “starting value”, then chooses the matched Khan explanation. Her return point is saved.

Back in Dunlo, a fresh graph question has no model or answer-color cues. If it is still difficult, the app offers a smaller step. If she demonstrates understanding, it lets her move on. The next day she gets one short retrieval item; before the quiz, a mixed rehearsal includes topics from the confirmed scope. A classmate can join co-op, but each student’s independent check stays separate.

The consequences addressed are wasted planning time, brittle guided understanding and forgotten material. Whether the journey improves those outcomes is a pilot question, not a current result.

## Secondary competition constraint check

The official page confirms an application deadline of **18 September 2026**, a **25% Khan integration weight at application**, and a later pitch rubric with Khan integration at **15%** plus Pitch & Q&A at 10%. The stage distinction matters. It gives a five-minute presentation inside a ten-minute total slot and an implementation period of 1 November 2026–31 March 2027. It expects a viable, scalable initiative and truthful evidence. [Official KEIC requirements](https://enactus.ph/2026-national-competition/khan-academy-challenge).

The 15-slide maximum was not visible in the public page inspected. Preserve the user’s **exactly 15 slides** instruction regardless, and confirm the portal/issued technical brief before submission. The same-deck plan in the separate implementation prompt is a future proposal; the stale deck was neither used as research evidence nor edited.

## What evidence to collect next

Use a small, consented usability pilot first, clearly separated from an efficacy study. Test new learners, refreshers and confident learners; include actual phone and connection constraints. Ask learners to choose a useful next step, complete a supported route, return from Khan, solve a different item and come back later. Record task completion, explanation quality, independent answers, delayed answers, actual access failures and teacher preparation time.

Do not infer Khan scores from an opened link or browser focus. Record resource opens, self-reports, teacher confirmation and independent answers separately. Any pre/post improvement without a suitable comparison is preliminary, not proof of Dunlo’s causal effect. Keep dropout denominators, baseline ability, assisted attempts and device constraints visible in the private evaluation.

This research does not implement product or deck changes or refresh presentation exports. The separate implementation prompt translates it into concrete future work and is supplied directly in chat, outside this repository.
