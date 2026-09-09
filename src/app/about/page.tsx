import type { Metadata } from 'next';
import Link from 'next/link';
import { HonestNote, Section, SectionHead } from '@/components/site/Section';
import { Atmosphere } from '@/components/site/Atmosphere';

export const metadata: Metadata = {
  title: 'About & AI disclosure',
  description:
    'Project stage, the vision beyond one algebra example, how AI was used, and the things this project does not claim.',
};

const FACTS = [
  ['Stage', 'Concept and prototype. The website and its interactive demo are the deliverable — there is no production system behind them.'],
  [
    'Purpose',
    'Prepared for the Khan Academy Education Impact Challenge at the Enactus Philippines 2026 National Competition. This site is supplementary to the competition deck, which stands on its own.',
  ],
  ['Project owner', 'Matthew Labrador.'],
  [
    'Other team members',
    'Not listed, because they are not yet confirmed. A KEIC delegation is one faculty adviser and three students; no adviser or additional members are named here until that is settled.',
  ],
  [
    'Institutional affiliation',
    'None claimed. This is not presented as an official project of any university, and no institutional branding is used.',
  ],
  ['Partners', 'None. No school partnership, endorsement or agreement exists.'],
  [
    'Users & results',
    'None. No pilot has run, no learner has used this, and no learning outcome has been measured.',
  ],
];

const DISCLOSURE = [
  'The demo runs a fixed, human-readable question bank and an explicit state machine. There is no model call anywhere in it.',
  'Nothing a visitor types is executed or evaluated. The one free-text answer is normalised and compared against expected values, not parsed as an expression.',
  'No account, no login, and no identifiable data. Demo progress is stored only in your own browser, and “Clear progress” erases it.',
  'Every Khan Academy link on this site was opened by hand and its page title checked, so no judge is sent to a dead URL. There is still no API relationship and no partnership.',
];

const NOT_CLAIMED = [
  'That BACKTRACK invented adaptive learning, prerequisite graphs, knowledge tracing, personalised courses or AI tutoring.',
  'That any route is a mathematically guaranteed globally shortest learning path.',
  'That BACKTRACK can reliably detect whether a learner had help from another person or an AI.',
  'That a real-time public Khan Academy API exists, or that this prototype integrates with one.',
  'That completing the demo demonstrates retained learning, or mastery of algebra.',
  'That any organisation linked from this site endorses BACKTRACK.',
];

export default function AboutPage() {
  return (
    <>
      <section className="material-map relative overflow-hidden">
        <Atmosphere variant="cover" />
        <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28">
          <p className="t-label text-route">About</p>
          <h1 className="t-display mt-5 max-w-[14ch] text-[2.6rem] leading-[0.98] sm:text-[4rem] lg:text-[4.6rem]">
            A concept, honestly labelled.
          </h1>
          <p className="mt-7 max-w-[58ch] text-[1.1rem] leading-relaxed text-chalk-muted">
            BACKTRACK is at concept and prototype stage. This page exists so that nothing on the rest of
            the site has to be guessed at.
          </p>
        </div>
      </section>

      <Section tone="field">
        <dl className="border-t border-hairline">
          {FACTS.map(([k, v]) => (
            <div
              key={k}
              className="grid gap-2 border-b border-hairline py-6 md:grid-cols-[minmax(0,0.5fr)_minmax(0,1.5fr)] md:gap-10"
            >
              <dt className="t-label pt-1 text-chalk-faint">{k}</dt>
              <dd className="max-w-[70ch] text-[1rem] leading-relaxed text-chalk-muted">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="t-label text-route">The vision</p>
            <h2 className="t-display mt-4 text-[2rem] leading-[1.03] sm:text-[2.7rem]">
              Broader than one algebra example.
            </h2>
            <p className="mt-6 max-w-[54ch] text-[1.02rem] leading-relaxed text-chalk-muted">
              BACKTRACK is designed as a learning-recovery navigator: a learner names where they need to
              be, and it works out what is actually blocking that, keeps what they already know, and
              continually recalculates the smallest useful route forward.
            </p>
            <p className="mt-4 max-w-[54ch] text-[1.02rem] leading-relaxed text-chalk-muted">
              In time that could cover multiple math courses and grade levels, self-study and classroom
              use, teacher-set and student-set goals, and eventually other subjects with real
              prerequisite structure.{' '}
              <em className="text-chalk">None of that exists today.</em>
            </p>
          </div>
          <div>
            <p className="t-label text-route">The proof domain</p>
            <h2 className="t-display mt-4 text-[2rem] leading-[1.03] sm:text-[2.7rem]">
              Math first, and narrow on purpose.
            </h2>
            <p className="mt-6 max-w-[54ch] text-[1.02rem] leading-relaxed text-chalk-muted">
              The demo goes deep on one thing — solving a quadratic by factoring, and the chain of steps
              underneath it — because a narrow example that genuinely works is worth more than a broad
              one that is only described. Algebra 1 is a reference scenario, not the brand.
            </p>
            <p className="mt-4 max-w-[54ch] text-[1.02rem] leading-relaxed text-chalk-muted">
              A pilot needs to be small enough to actually evaluate between November 2026 and March
              2027. That is a deliberate constraint, not the ceiling of the idea.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="field">
        <SectionHead
          label="Disclosure"
          title="How AI was used."
          lead="Generative AI supported concept development, research discovery, drafting and prototype planning. The team is responsible for reviewing and validating everything submitted. The public demo does not use learner-facing generative AI and does not collect identifiable learner records."
        />
        <ul className="mt-12 border-t border-hairline">
          {DISCLOSURE.map((t) => (
            <li
              key={t}
              className="flex gap-5 border-b border-hairline py-5 text-[1rem] leading-relaxed text-chalk-muted"
            >
              <span className="t-label shrink-0 pt-1 text-route" aria-hidden="true">
                ·
              </span>
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHead
          label="Not claimed"
          title="Things this project does not assert."
          lead="Listed explicitly, because a competition site is exactly the kind of place where these get quietly implied."
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

        <HonestNote>
          If something on this site reads as a claim we have not earned, it is a mistake and we would
          rather fix it than defend it.
        </HonestNote>
      </Section>

      <section className="material-map relative overflow-hidden border-t border-hairline">
        <Atmosphere variant="quiet" />
        <div className="relative mx-auto max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
          <p className="t-display max-w-[20ch] text-[2.3rem] leading-[1.0] sm:text-[3.4rem]">
            The product is easier to judge than to describe.
          </p>
          <Link href="/demo" className="btn btn-primary mt-8">
            Open the demo
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
