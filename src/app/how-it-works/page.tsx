import type { Metadata } from 'next';
import Link from 'next/link';
import { HonestNote, Section, SectionHead, Statement } from '@/components/site/Section';
import { LoopStepper } from '@/components/home/LoopStepper';
import { Atmosphere } from '@/components/site/Atmosphere';
import { MathText } from '@/components/math/Math';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'Destination, check, route, Khan Academy, proof, recalculate. Six moves, and only one of them is teaching.',
};

const HONESTY = [
  {
    said: 'Correct, and confident',
    does: 'Accelerate.',
    note: 'The knowledge is preserved and the related review comes off the route entirely.',
  },
  {
    said: 'Correct, but unsure',
    does: 'Keep one check in reserve.',
    note: 'Still correct. But BACKTRACK verifies later rather than dropping review on the strength of a guess.',
  },
  {
    said: 'Wrong, and “I forgot”',
    does: 'A refresher, not a re-teach.',
    note: 'The material was there once. The route checks one step earlier before adding anything.',
  },
  {
    said: 'Wrong, but confident',
    does: 'Test a contrasting case.',
    note: 'That pattern usually means the rule in your head is different, which is not the same as a careless slip.',
  },
  {
    said: 'Wrong, and “never learned this”',
    does: 'Go straight to the foundation.',
    note: 'Nobody should have to prove, over ten questions, a thing they have just told you they were never taught.',
  },
];

const NOT_CLAIMED = [
  'That BACKTRACK invented adaptive learning, prerequisite graphs, knowledge tracing, personalised courses or AI tutoring. All of those already exist, and some of them are very good.',
  'That any route is a mathematically guaranteed globally shortest learning path. The honest formulation is the smallest evidence-supported recovery route relevant to the learner’s current destination.',
  'That BACKTRACK can reliably detect whether a learner had help from another person or an AI. It cannot.',
  'That a real-time public Khan Academy API exists, or that this prototype integrates with one.',
  'That completing the demo demonstrates retained learning, or mastery of algebra.',
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="material-map relative overflow-hidden">
        <Atmosphere variant="cover" />
        <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28">
          <p className="t-label text-route">How it works</p>
          <h1 className="t-display mt-5 max-w-[16ch] text-[2.6rem] leading-[0.98] sm:text-[4rem] lg:text-[4.8rem]">
            Six moves, and only one of them is teaching.
          </h1>
          <p className="mt-7 max-w-[58ch] text-[1.1rem] leading-relaxed text-chalk-muted">
            BACKTRACK is a navigator, not a tutor. It works out where you are trying to get, what is
            actually in the way, and the smallest useful repair, then hands the teaching to Khan
            Academy and waits for proof.
          </p>
        </div>
      </section>

      <Section tone="field">
        <LoopStepper />
      </Section>

      <Section>
        <SectionHead
          label="Honesty-first"
          title="Honesty gives you a better route."
          lead="At some checkpoints BACKTRACK asks how an answer felt. This never changes whether the answer was right. It changes what gets checked next, so cheating only buys you a route that assumes you know things you don’t."
        />

        <div className="mt-14 border-t border-hairline">
          {HONESTY.map((h) => (
            <div
              key={h.said}
              className="grid gap-2 border-b border-hairline py-6 md:grid-cols-[minmax(0,0.65fr)_minmax(0,0.7fr)_minmax(0,1.2fr)] md:items-baseline md:gap-10"
            >
              <p className="text-[1rem] font-medium text-chalk">{h.said}</p>
              <p className="text-[1rem] text-now">{h.does}</p>
              <p className="max-w-[62ch] text-[0.95rem] leading-relaxed text-chalk-muted">{h.note}</p>
            </div>
          ))}
        </div>

        <HonestNote>
          <strong className="font-semibold text-chalk-muted">One limit, stated plainly.</strong>{' '}
          Self-report is never treated as mastery, and BACKTRACK cannot reliably detect whether someone
          had help. That is why every decision that matters rests on fresh work, and why formal pilot
          checks would need appropriate supervision to mean anything.
        </HonestNote>
      </Section>

      <Section tone="field">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
          <div>
            <p className="t-label text-route">The specific objective</p>
            <h2 className="t-display mt-4 text-[2.1rem] leading-[1.03] sm:text-[2.9rem]">
              Generic adaptive learning asks what to do next. BACKTRACK asks what is in the way.
            </h2>
          </div>
          <div className="space-y-6 self-center">
            <p className="text-[1.05rem] leading-relaxed text-chalk">
              The destination is the difference. A learner arrives because there is something they need
              to be able to do <em>now</em>: today’s lesson, a topic next week, a question a video
              caught them out on. Everything the product does is measured against that.
            </p>
            <div className="border-l-2 border-now pl-5">
              <p className="text-[1.02rem] leading-relaxed text-chalk-muted">
                What is preventing this learner from understanding what they need now, and what is the
                smallest evidence-supported repair that reconnects them to it?
              </p>
            </div>
            <p className="text-[1rem] leading-relaxed text-chalk-muted">
              Mathematics is where that is being proved first, because a narrow example that genuinely
              works is worth more than a broad one that is only described.{' '}
              <strong className="font-semibold text-chalk">
                It is the proof domain, not the ceiling of the idea.
              </strong>
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <p className="t-label text-route">A fair question</p>
            <h2 className="t-display mt-4 text-[2.1rem] leading-[1.03] sm:text-[2.9rem]">
              Why not just ask an AI tutor?
            </h2>
            <p className="mt-6 max-w-[54ch] text-[1.05rem] leading-relaxed text-chalk-muted">
              You should, when you know what to ask. AI tutors are genuinely good at explaining a topic
              you can name. A tutor helps when you know what to ask.{' '}
              <strong className="font-semibold text-chalk">
                BACKTRACK exists for the student who doesn’t even know why they stopped understanding.
              </strong>
            </p>
            <p className="mt-6 max-w-[54ch] text-[1rem] leading-relaxed text-chalk-muted">
              Inside a checkpoint, AI can help: explaining a step a different way, drafting questions a
              human then reviews, or answering a follow-up. It is a tool the navigator can call. It is
              not the interface, and a chat box is not a route.
            </p>
          </div>
          <div className="self-center">
            <Statement
              sub={
                <>
                  Learn however you want: Khan Academy, a teacher, your notes, an AI tutor. Prove what
                  you know. BACKTRACK routes from what you can demonstrate afterwards, not from whether
                  an explanation sounded convincing at the time.
                </>
              }
            >
              Gemini is a tutor.
              <br />
              BACKTRACK is the GPS.
            </Statement>
          </div>
        </div>
      </Section>

      <Section tone="field">
        <SectionHead
          label="Not claimed"
          title="What we are careful not to say."
          lead="A competition site is exactly the kind of place where these get quietly implied, so they are listed explicitly instead."
        />
        <ul className="mt-12 border-t border-hairline">
          {NOT_CLAIMED.map((t) => (
            <li
              key={t}
              className="flex gap-5 border-b border-hairline py-5 text-[1rem] leading-relaxed text-chalk-muted"
            >
              <span className="t-label shrink-0 pt-1 text-recalc" aria-hidden="true">
                ✗
              </span>
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <section className="material-map relative overflow-hidden border-t border-hairline">
        <Atmosphere variant="quiet" />
        <div className="relative mx-auto max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
          <p className="t-display max-w-[18ch] text-[2.3rem] leading-[1.0] sm:text-[3.4rem]">
            Ninety seconds is enough to see it.
          </p>
          <p className="mt-5 max-w-[52ch] text-[1.05rem] leading-relaxed text-chalk-muted">
            No sign-in. The route responds to what you actually answer, starting from{' '}
            <MathText size="xs" className="text-chalk">
              x² + 7x + 12 = 0
            </MathText>
            .
          </p>
          <Link href="/demo" className="btn btn-primary mt-8">
            Try the demo
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
