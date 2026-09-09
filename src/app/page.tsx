import Link from 'next/link';
import { HeroCover } from '@/components/home/HeroCover';
import { CompoundingGap } from '@/components/home/CompoundingGap';
import { LoopStepper } from '@/components/home/LoopStepper';
import { ClassSpread } from '@/components/home/ClassSpread';
import { MissedTurn } from '@/components/home/MissedTurn';
import { HonestNote, Section, SectionHead, Statement } from '@/components/site/Section';
import { MathText } from '@/components/math/Math';

export default function HomePage() {
  return (
    <>
      <HeroCover />

      {/* ================================================================
          The problem
          ================================================================ */}
      <Section tone="field">
        <SectionHead
          label="The problem"
          title={
            <>
              One missed lesson doesn’t
              <br />
              stay one missed lesson.
            </>
          }
          lead={
            <>
              A learner is absent, or ill, or behind, or something is happening at home. The class keeps
              moving. A later topic depends on the missed one, and then another depends on that. Nobody
              decides this. It just compounds.
            </>
          }
        />

        <div className="mt-14">
          <CompoundingGap />
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
          <p className="t-display text-[1.7rem] leading-tight sm:text-[2.2rem]">
            Eventually the learner decides:{' '}
            <em className="italic text-recalc">“I’m just bad at math.”</em>
          </p>
          <p className="self-end text-[1.05rem] leading-relaxed text-chalk-muted">
            The usual advice is <strong className="font-semibold text-chalk">“review.”</strong> Review{' '}
            <em>what</em>, exactly? Nobody has told them which turn they missed, only that they are
            behind. So the options on offer are: restart the whole unit, watch a generic explainer, or
            keep going and hope.
          </p>
        </div>
      </Section>

      {/* ================================================================
          Recalculating
          ================================================================ */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <p className="t-label text-chalk-faint">The idea</p>
            <p className="t-display mt-4 text-[2.2rem] leading-[1.02] sm:text-[3rem] lg:text-[3.5rem]">
              Google Maps doesn’t punish you for missing a turn. It recalculates.
            </p>
            <p className="t-display mt-4 text-[2.2rem] leading-[1.02] text-route sm:text-[3rem] lg:text-[3.5rem]">
              Why doesn’t school?
            </p>
          </div>
          <div className="space-y-8 self-center">
            <p className="text-[1.1rem] leading-relaxed text-chalk">
              When you miss a turn, the destination does not change. The route does. You are not asked
              to drive home and start the journey again, and you are not told you are bad at driving.
            </p>
            <p className="text-[1.05rem] leading-relaxed text-chalk-muted">
              BACKTRACK asks one question, and it is not “what should this learner study next?” It is:{' '}
              <strong className="font-semibold text-chalk">
                what is stopping this learner from understanding what they need right now, and what is
                the smallest repair that reconnects them to it?
              </strong>
            </p>
            <div className="border-t border-hairline pt-6">
              <MissedTurn />
            </div>
            <dl className="grid gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-2">
              <div className="bg-field p-5">
                <dt className="t-label text-chalk-faint">Generic adaptive learning asks</dt>
                <dd className="mt-2 text-[1.05rem] leading-snug text-chalk-muted">
                  What should this learner do next?
                </dd>
              </div>
              <div className="bg-field p-5">
                <dt className="t-label text-now">BACKTRACK asks</dt>
                <dd className="mt-2 text-[1.05rem] leading-snug text-chalk">
                  What is in the way of the thing they need today?
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      {/* ================================================================
          The loop
          ================================================================ */}
      <Section tone="field">
        <SectionHead
          label="What BACKTRACK does"
          title={
            <>
              Six moves, and only one
              <br />
              of them is teaching.
            </>
          }
          lead="BACKTRACK is a navigator, not a tutor. It works out where you are trying to get, what is actually in the way, and the smallest useful repair, then hands the teaching to Khan Academy and waits for proof."
        />
        <div className="mt-16">
          <LoopStepper />
        </div>
      </Section>

      {/* ================================================================
          Try it
          ================================================================ */}
      <section className="material-map relative border-t border-hairline">
        <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:gap-20">
            <div>
              <p className="t-label text-now">The demo</p>
              <h2 className="t-display mt-4 text-[2.4rem] leading-[1.0] sm:text-[3.4rem] lg:text-[4rem]">
                Ninety seconds, no sign-in, and the route answers to you.
              </h2>
              <p className="mt-6 max-w-[52ch] text-[1.05rem] leading-relaxed text-chalk-muted">
                It is the product logic, not a video of it. Say how much time you have, answer one
                question about today’s lesson, and watch the route either compress because you already
                knew something or bend because it found the turn you missed.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/demo" className="btn btn-primary">
                  Try the demo
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/start/quadratics" className="btn btn-ghost">
                  Or arrive the way a learner would
                </Link>
              </div>
            </div>

            <ul className="space-y-px border border-hairline bg-hairline">
              {[
                ['Session budget', 'Five minutes is a real answer. The route is built to finish, not to be abandoned.'],
                ['Honesty-first check', '“I never learned this” is routing information, not a failure state.'],
                ['Shortcut found', 'Proving something takes review off the route. That is the reward.'],
                ['Recalculating', 'Struggle inserts a stop underneath, in front of you.'],
                ['Back on track', 'It ends on a fresh version of the task that stopped you.'],
              ].map(([k, v]) => (
                <li key={k} className="bg-field p-5">
                  <p className="t-label text-route">{k}</p>
                  <p className="mt-1.5 text-[0.95rem] leading-relaxed text-chalk-muted">{v}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ================================================================
          Tutor vs navigator
          ================================================================ */}
      <Section>
        <SectionHead
          label="A fair question"
          title="Why not just ask an AI tutor?"
          lead="You should, when you know what to ask. AI tutors are genuinely good at explaining a topic you can name. That is not the situation BACKTRACK is built for."
        />

        <div className="mt-16 grid gap-px border border-hairline bg-hairline md:grid-cols-2">
          <div className="bg-field p-7 sm:p-10">
            <p className="t-label text-chalk-faint">A tutor answers</p>
            <p className="t-display mt-4 text-[1.6rem] leading-tight sm:text-[2rem]">
              “Explain this topic to me.”
            </p>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-chalk-muted">
              Excellent when the learner can already name the topic, the confusion and the question.
              The learner is doing the diagnosis.
            </p>
          </div>
          <div className="bg-field p-7 sm:p-10">
            <p className="t-label text-now">BACKTRACK answers</p>
            <p className="t-display mt-4 text-[1.6rem] leading-tight sm:text-[2rem]">
              “Work out why this stopped making sense.”
            </p>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-chalk-muted">
              Built for the learner who says <em>“I don’t even know why I stopped understanding.”</em>{' '}
              The diagnosis is the product.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <Statement
            sub={
              <>
                And during the learning itself, use whatever helps: Khan Academy, a teacher, your
                notes, an AI tutor.{' '}
                <strong className="font-semibold text-chalk">
                  Learn however you want. Prove what you know.
                </strong>{' '}
                BACKTRACK routes from what you can demonstrate afterwards, not from whether an
                explanation sounded convincing at the time.
              </>
            }
          >
            Gemini is a tutor.
            <br />
            BACKTRACK is the GPS.
          </Statement>
        </div>
      </Section>

      {/* ================================================================
          Retention
          ================================================================ */}
      <Section tone="field">
        <SectionHead
          label="The mechanic"
          title="Keep me studying. Save me studying."
          lead="Most study apps keep you by threatening to take something away. BACKTRACK tries to keep you by visibly removing work you have proven you don’t need, and by making the thing you gained legible."
        />

        <div className="mt-16 grid gap-px border border-hairline bg-hairline lg:grid-cols-3">
          <div className="bg-field p-7 sm:p-9">
            <p className="t-label text-route">Shortcut found</p>
            <p className="t-display mt-4 text-[1.7rem] leading-tight">You already know this.</p>
            <div className="mt-6 space-y-2 font-medium">
              <p className="flex items-center gap-3 text-[0.95rem] text-chalk">
                <span className="text-route" aria-hidden="true">
                  ✓
                </span>
                Factoring · kept
              </p>
              <p className="flex items-center gap-3 text-[0.95rem] text-chalk-faint line-through">
                <span aria-hidden="true">−</span>
                Review: multiplying out brackets
              </p>
              <p className="flex items-center gap-3 text-[0.95rem] text-chalk-faint line-through">
                <span aria-hidden="true">−</span>
                Review: combining like terms
              </p>
              <p className="t-label pt-2 text-route">2 reviews removed</p>
            </div>
            <p className="mt-6 text-[0.95rem] leading-relaxed text-chalk-muted">
              Not points, not a badge. Actual removed work, and only because of something you did. No
              review is invented so it can be taken away again.
            </p>
          </div>

          <div className="bg-field p-7 sm:p-9">
            <p className="t-label text-now">New capability</p>
            <p className="t-display mt-4 text-[1.7rem] leading-tight">
              You can now factor <MathText size="sm">x² + bx + c</MathText>.
            </p>
            <p className="mt-5 flex items-start gap-3 text-[0.95rem] text-chalk">
              <span className="text-now" aria-hidden="true">
                ✓
              </span>
              That unlocks today’s equation.
            </p>
            <p className="mt-6 text-[0.95rem] leading-relaxed text-chalk-muted">
              A learner with a real gap deserves a reward as good as the one a learner who already knew
              everything gets. Not XP. Something concrete:{' '}
              <strong className="font-semibold text-chalk">
                I can do something now that I couldn’t do before
              </strong>
              , and here is the thing it just unlocked.
            </p>
          </div>

          <div className="bg-field p-7 sm:p-9">
            <p className="t-label text-chalk-faint">Next turn · 3 min</p>
            <p className="t-display mt-4 text-[1.7rem] leading-tight">
              One quick check could remove the last review step.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="btn btn-primary pointer-events-none !min-h-[42px] !text-[0.85rem]">
                Take the next turn
              </span>
              <span className="btn btn-ghost pointer-events-none !min-h-[42px] !text-[0.85rem]">
                Stop here, save my route
              </span>
            </div>
            <p className="mt-6 text-[0.95rem] leading-relaxed text-chalk-muted">
              <strong className="font-semibold text-chalk">The stop button is real.</strong> No mystery
              boxes, no reward wheels, no countdowns, no autoplay, no destroyed streaks, no guilt for
              leaving. The continuation has to earn itself.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
          <div>
            <p className="t-label text-chalk-faint">If life interrupts again</p>
            <p className="t-display mt-4 text-[1.9rem] leading-tight sm:text-[2.4rem]">
              Welcome back. Recalculating…
            </p>
            <p className="mt-5 text-[1rem] leading-relaxed text-chalk-muted">
              Nothing is destroyed while you are away. One short retrieval check decides whether to
              resume where you stopped or re-open a stop, and forgetting is treated as a routing
              problem rather than a character flaw.
            </p>
          </div>
          <p className="t-display self-center text-[1.5rem] leading-tight text-route sm:text-[2rem]">
            Streaks reward never falling off. BACKTRACK rewards getting back on.
          </p>
        </div>
      </Section>

      {/* ================================================================
          Khan Academy
          ================================================================ */}
      <Section>
        <SectionHead
          label="Division of labour"
          title={
            <>
              BACKTRACK finds the route.
              <br />
              Khan Academy does the teaching.
            </>
          }
          lead="These are two different jobs, and BACKTRACK is deliberately not trying to do the second one. Khan Academy is already free, already trusted, and already better at it."
        />

        <div className="mt-14 grid gap-px border border-hairline bg-hairline md:grid-cols-2">
          <div className="bg-field p-7 sm:p-10">
            <p className="t-label text-now">BACKTRACK · navigation</p>
            <h3 className="mt-3 text-[1.35rem] font-medium">Where to go, and why</h3>
            <ul className="mt-6 space-y-3">
              {[
                'The destination, and keeping it visible',
                'Checks and prerequisite reasoning',
                'Route selection and route compression',
                'Evidence of what actually changed',
                'Comeback logic and next-step selection',
              ].map((t) => (
                <li key={t} className="flex gap-3 text-[0.98rem] text-chalk-muted">
                  <span className="text-now" aria-hidden="true">
                    ·
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-field p-7 sm:p-10">
            <p className="t-label text-route">Khan Academy · learning</p>
            <h3 className="mt-3 text-[1.35rem] font-medium">The teaching itself</h3>
            <ul className="mt-6 space-y-3">
              {[
                'Explanations, articles and videos',
                'Worked examples',
                'Exercises and practice',
                'Mastery opportunities',
                'Free, at scale, already trusted',
              ].map((t) => (
                <li key={t} className="flex gap-3 text-[0.98rem] text-chalk-muted">
                  <span className="text-route" aria-hidden="true">
                    ·
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ol className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3 text-[0.85rem] font-medium">
          {[
            'Current difficulty',
            'BACKTRACK checks',
            'Khan teaches and practises',
            'Fresh check',
            'Back to the destination',
            'Recalculate',
          ].map((s, i, arr) => (
            <li key={s} className="flex items-center gap-3">
              <span className="border border-hairline px-3 py-2 text-chalk-muted">{s}</span>
              {i < arr.length - 1 && (
                <span className="text-chalk-faint" aria-hidden="true">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>

        <HonestNote>
          <strong className="font-semibold text-chalk-muted">A link click is not learning.</strong>{' '}
          BACKTRACK never marks a step repaired because someone opened a resource. It marks it repaired
          when the learner answers a fresh question they previously could not. This prototype does not
          assume a real-time Khan Academy API exists, does not claim one, and is not affiliated with or
          endorsed by Khan Academy. Links go to Khan Academy’s own search for the idea rather than to a
          specific lesson URL, because a deep link that 404s in front of a judge would be worse than an
          honest one.
        </HonestNote>
      </Section>

      {/* ================================================================
          Two ways in
          ================================================================ */}
      <Section tone="field">
        <SectionHead
          label="Two ways in"
          title="One destination for the class. A route for each learner."
          lead="BACKTRACK has to work for a teacher with thirty-two learners and for one person catching up alone at eleven at night. Neither is an afterthought."
        />

        <div className="mt-14">
          <ClassSpread />
        </div>

        <div className="mt-16 grid gap-px border border-hairline bg-hairline md:grid-cols-2">
          <div className="bg-field p-7 sm:p-10">
            <p className="t-label text-now">School mode</p>
            <h3 className="t-display mt-3 text-[1.7rem] leading-tight">
              The teacher confirms today’s goal. Once.
            </h3>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-chalk-muted">
              Usually the lesson they are already teaching this week, not a separate intervention
              curriculum to plan and maintain. Thirty-two learners get thirty-two routes to it without
              the teacher building thirty-two rescue plans.
            </p>
            <ul className="mt-6 space-y-2.5 text-[0.95rem] text-chalk-muted">
              <li>· A summary, not a dashboard to babysit</li>
              <li>· Common blockers across the class</li>
              <li>· Which learners need a person, not another exercise</li>
            </ul>
            <p className="mt-6">
              <Link href="/classrooms" className="btn-quiet text-route">
                How this works in a school →
              </Link>
            </p>
          </div>
          <div className="bg-field p-7 sm:p-10">
            <p className="t-label text-now">Self-study mode</p>
            <h3 className="t-display mt-3 text-[1.7rem] leading-tight">Or you arrive on your own.</h3>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-chalk-muted">
              Through a topic selector, a shared link, a QR code on a classroom wall, or a short video
              that caught you out. You pick the goal and BACKTRACK starts building a route. No teacher,
              no class, no permission needed.
            </p>
            <ul className="mt-6 space-y-2.5 text-[0.95rem] text-chalk-muted">
              <li>· A real chance to catch up alone</li>
              <li>· The same logic as the classroom version</li>
              <li>· Every topic gets its own front door</li>
            </ul>
            <p className="mt-6">
              <Link href="/start/quadratics" className="btn-quiet text-route">
                See a topic entry point →
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-10 max-w-[70ch] text-[1rem] leading-relaxed text-chalk-muted">
          <strong className="font-semibold text-chalk">
            Content gets learners in. Schools keep BACKTRACK in the routine.
          </strong>{' '}
          Short-form video is not decoration on this project. It is how a self-study learner ever finds
          out that their problem has a name and a fix. Every clip lands on the topic it asked about,
          never on a homepage.
        </p>
      </Section>

      {/* ================================================================
          Status
          ================================================================ */}
      <Section>
        <SectionHead
          label="Status"
          title="Math first. Honest about the rest."
          lead="BACKTRACK is at concept and prototype stage. There is no pilot data yet and this site will not invent any."
        />

        <dl className="mt-14 border-t border-hairline">
          {[
            [
              'Stage',
              'Concept and prototype, built for KEIC 2026. No users, no partner schools, no results.',
            ],
            [
              'Proof domain, not scope',
              'Mathematics first, because a narrow example that genuinely works is worth more than a broad one that is only described. The product is a learning-recovery navigator; algebra is where it is being proved.',
            ],
            [
              'Proposed pilot',
              'Approximately 80–120 formally evaluated learners across 2–3 partner-school cohorts, subject to school agreements and curriculum fit. Planning target, not committed reach.',
            ],
            [
              'Open public layer',
              'Anyone arriving through a link, a QR code or a video can use the public experience. Those visits are reported separately and are never counted as documented learning recoveries.',
            ],
            [
              'The claim we want to test',
              'A learner could not do something relevant to their current lesson, received a targeted route, and afterwards solved a fresh version of that task.',
            ],
            [
              'Pricing',
              'None published, because none has been validated. Core learner access stays free. What a pilot would measure is cost per active learner and cost per documented recovery.',
            ],
          ].map(([k, v]) => (
            <div
              key={k}
              className="grid gap-2 border-b border-hairline py-6 md:grid-cols-[minmax(0,0.5fr)_minmax(0,1.5fr)] md:gap-10"
            >
              <dt className="t-label pt-1 text-chalk-faint">{k}</dt>
              <dd className="max-w-[70ch] text-[1rem] leading-relaxed text-chalk-muted">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-[0.95rem] text-chalk-muted">
          Everything above is a proposal.{' '}
          <Link href="/evidence" className="btn-quiet text-route">
            See the full evidence plan
          </Link>{' '}
          : what external research supports, what is only a hypothesis, and how we would try to be
          wrong.
        </p>
      </Section>

      {/* ================================================================
          Closing
          ================================================================ */}
      <section className="material-map border-t border-hairline">
        <div className="mx-auto max-w-[1400px] px-5 py-28 sm:px-8 sm:py-36">
          <p className="t-display max-w-[18ch] text-[2.6rem] leading-[0.98] sm:text-[4rem] lg:text-[5rem]">
            You never go back to the beginning.
          </p>
          <p className="t-display mt-3 max-w-[18ch] text-[2.6rem] leading-[0.98] text-route sm:text-[4rem] lg:text-[5rem]">
            You get a new route forward.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link href="/demo" className="btn btn-primary">
              Try the demo
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/evidence" className="btn btn-ghost">
              Read the evidence plan
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
