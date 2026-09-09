import type { Metadata } from 'next';
import Link from 'next/link';
import { HonestNote, Section, SectionHead } from '@/components/site/Section';
import { Atmosphere } from '@/components/site/Atmosphere';

export const metadata: Metadata = {
  title: 'Evidence',
  description:
    'What external research supports, what is only a hypothesis, and how we would try to be wrong. No pilot results, because no pilot has run.',
};

const ESTABLISHED = [
  {
    n: '01',
    title: 'Teaching at the right level',
    body: 'Grouping and targeting instruction by a learner’s actual level, rather than by their grade, is one of the better-evidenced interventions in education. J-PAL reports the approach has reached tens of millions of children across India and Africa. BACKTRACK is an attempt to do that targeting per learner and per destination, rather than by reorganising a class.',
    href: 'https://www.povertyactionlab.org/case-study/teaching-right-level-improve-learning',
    source: 'povertyactionlab.org',
  },
  {
    n: '02',
    title: 'Retrieval and spacing',
    body: 'The IES practice guide Organizing Instruction and Study to Improve Student Learning collects recommendations on spacing study over time and using retrieval practice. This is why BACKTRACK verifies with a fresh question rather than a repeat, and why the comeback check exists at all.',
    href: 'https://ies.ed.gov/ncee/wwc/PracticeGuide/1',
    source: 'ies.ed.gov',
  },
  {
    n: '03',
    title: 'Autonomy and competence',
    body: 'Self-Determination Theory’s work on education argues motivation is better supported by autonomy, competence and relatedness than by pressure. This is the reason the Next Turn is optional, the stop button is real, and there is no streak to destroy.',
    href: 'https://selfdeterminationtheory.org/topics/application-education/',
    source: 'selfdeterminationtheory.org',
  },
];

const TESTING = [
  ['Review selection', 'Whether the work a learner is given is actually relevant to the destination they are stuck on.'],
  ['Voluntary continuation', 'Whether learners take an optional next turn when it is genuinely optional.'],
  ['Return behaviour', 'Whether learners come back after a gap, given that nothing was destroyed while they were away.'],
  ['Purposeful Khan use', 'Whether Khan Academy time is spent on things connected to the current lesson.'],
  ['Current-destination recovery', 'Whether learners can afterwards do the thing that originally stopped them.'],
  ['Teacher diagnosis burden', 'Whether a teacher spends less time working out who is missing what.'],
];

const MEASURE = [
  {
    group: 'Learning',
    items: [
      'Baseline destination score',
      'Fresh post-route destination score',
      'A delayed check after 7–14 days where feasible',
      'Prerequisite gaps repaired',
      'Reconnection to the destination',
    ],
  },
  {
    group: 'Khan engagement',
    items: [
      'Documented relevant Khan Academy practice',
      'Repeated weeks of use',
      'Return behaviour',
    ],
  },
  {
    group: 'Retention mechanics',
    items: [
      'Next Turn acceptance rate',
      'Route-compression events',
      'Voluntary continuation',
      'Comeback after inactivity',
      'Learner reports of pressure or frustration',
    ],
  },
  {
    group: 'Teacher & school',
    items: [
      'Setup time',
      'Weekly admin burden',
      'Destination reuse across classes',
      'Support hours needed to replicate',
    ],
  },
];

const BUDGET = [
  ['Learning design + math review', '₱20,000'],
  ['Product, hosting and tooling', '₱15,000'],
  ['School deployment + logistics', '₱20,000'],
  ['Access, connectivity, device support', '₱15,000'],
  ['Evaluation and data handling', '₱15,000'],
  ['Content and acquisition', '₱5,000'],
  ['Contingency', '₱10,000'],
];

export default function EvidencePage() {
  return (
    <>
      <section className="material-map relative overflow-hidden">
        <Atmosphere variant="cover" />
        <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28">
          <p className="t-label text-route">Evidence</p>
          <h1 className="t-display mt-5 max-w-[15ch] text-[2.6rem] leading-[0.98] sm:text-[4rem] lg:text-[4.6rem]">
            What we know. What we are testing.
          </h1>
          <p className="mt-7 max-w-[62ch] text-[1.1rem] leading-relaxed text-chalk-muted">
            These are different things, and this page keeps them apart. The research below supports the
            design decisions. It does not say anything about whether BACKTRACK works, because nobody has
            tried it yet.
          </p>
          <p className="mt-8 inline-block border border-recalc/60 px-4 py-2.5 text-[0.9rem] text-recalc">
            No pilot results exist. There are no improvement graphs, percentage gains or learner
            testimonials on this site, because there is no data to make them from.
          </p>
        </div>
      </section>

      <Section tone="field">
        <SectionHead
          label="Established externally"
          title="What the research already supports."
          lead="Three findings we did not discover and are not claiming credit for. They are why BACKTRACK is shaped the way it is."
        />
        <div className="mt-14 grid gap-px border border-hairline bg-hairline lg:grid-cols-3">
          {ESTABLISHED.map((e) => (
            <article key={e.n} className="bg-field p-7 sm:p-9">
              <p className="t-label text-now">{e.n}</p>
              <h3 className="t-display mt-3 text-[1.55rem] leading-tight">{e.title}</h3>
              <p className="mt-5 text-[0.96rem] leading-relaxed text-chalk-muted">{e.body}</p>
              <p className="mt-6">
                <a
                  href={e.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-quiet text-[0.9rem] text-route"
                >
                  {e.source} ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </p>
            </article>
          ))}
        </div>
        <HonestNote>
          Linking to these does not imply that any of these organisations knows about, supports or
          endorses BACKTRACK. They do not.
        </HonestNote>
      </Section>

      <Section>
        <SectionHead
          label="Unproven"
          title="What is only a hypothesis."
          lead="The specific claim BACKTRACK makes has not been tested by anyone, including us."
        />

        <div className="mt-12 border-l-2 border-recalc pl-6 sm:pl-10">
          <p className="t-label text-recalc">The product hypothesis</p>
          <p className="t-display mt-4 max-w-[24ch] text-[1.8rem] leading-[1.06] sm:text-[2.5rem]">
            Visible route compression and capability unlocks can do the work that streaks and XP
            usually do, honestly.
          </p>
          <p className="mt-5 max-w-[62ch] text-[1rem] leading-relaxed text-chalk-muted">
            That is the retention thesis, and it is the thing being tested. If it is wrong, adding dark
            patterns would produce better numbers and a worse product, so the numbers would stop meaning
            anything. Treat this as something to test, not as a proven effect.
          </p>
        </div>

        <div className="mt-14">
          <p className="t-label text-chalk-faint">We would be testing whether BACKTRACK improves</p>
          <dl className="mt-6 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
            {TESTING.map(([k, v]) => (
              <div key={k} className="bg-base p-6">
                <dt className="text-[1.02rem] font-medium text-chalk">{k}</dt>
                <dd className="mt-2 text-[0.93rem] leading-relaxed text-chalk-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section tone="field">
        <SectionHead
          label="Proposed measurement"
          title="How we would try to be wrong."
          lead="The central impact story is narrow and checkable: the learner could not do something relevant to their current lesson, received a targeted route, and afterwards solved a fresh version of that task."
        />
        <div className="mt-14 grid gap-px border border-hairline bg-hairline md:grid-cols-2 lg:grid-cols-4">
          {MEASURE.map((m) => (
            <div key={m.group} className="bg-field p-6">
              <p className="t-label text-route">{m.group}</p>
              <ul className="mt-4 space-y-2.5">
                {m.items.map((i) => (
                  <li key={i} className="text-[0.93rem] leading-relaxed text-chalk-muted">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="t-label text-chalk-faint">Reported separately</p>
            <p className="mt-3 max-w-[58ch] text-[1rem] leading-relaxed text-chalk-muted">
              Public reach is reported apart from learning: view to click, click to diagnostic,
              diagnostic to route, route to Khan practice, return visit. Anyone can use the open public
              layer.{' '}
              <strong className="font-semibold text-chalk">
                A website visitor is not a documented learning recovery
              </strong>{' '}
              and will never be counted as one.
            </p>
          </div>
          <div>
            <p className="t-label text-chalk-faint">Two limits we would state up front</p>
            <p className="mt-3 max-w-[58ch] text-[1rem] leading-relaxed text-chalk-muted">
              Baseline, return and delayed checks need fresh work under appropriate supervision to mean
              anything. And we cannot reliably detect remote assistance, whether from a person or from an AI.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHead
          label="Financials"
          title="No invented price tag."
          lead="KEIC asks for business principles and financials. It does not ask us to pretend a school has agreed to pay a number we made up, so there is no institutional price on this site."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <p className="t-label text-chalk-faint">
              Planning allocation · ₱100,000 implementation-grant scenario
            </p>
            <dl className="mt-5 border-t border-hairline">
              {BUDGET.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-6 border-b border-hairline py-3.5"
                >
                  <dt className="text-[0.98rem] text-chalk-muted">{k}</dt>
                  <dd className="t-mono-num shrink-0 text-[0.98rem] font-medium text-chalk">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.85rem] leading-relaxed text-chalk-faint">
              Planning allocations, not approved quotations. Core learner access stays free.
            </p>
          </div>

          <div className="space-y-10">
            <div>
              <p className="t-label text-chalk-faint">What the pilot would measure about cost</p>
              <ul className="mt-4 space-y-2.5">
                {[
                  'Cost per active learner',
                  'Cost per learner with a documented recovery',
                  'Support hours per school',
                  'Teacher burden',
                  'Hosting and maintenance',
                  'Cost of adding a new validated destination',
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
            <div>
              <p className="t-label text-chalk-faint">Continuation paths to test</p>
              <p className="mt-4 text-[0.98rem] leading-relaxed text-chalk-muted">
                Schools and school networks, universities, local government units, CSR education
                programmes, nonprofits, and partnership opportunities in the Khan Academy Philippines
                ecosystem.{' '}
                <strong className="font-semibold text-chalk">
                  All untested. None of these organisations has been approached with a commitment, and
                  we are not inventing a payer.
                </strong>
              </p>
            </div>
          </div>
        </div>
      </Section>

      <section className="material-map relative overflow-hidden border-t border-hairline">
        <Atmosphere variant="quiet" />
        <div className="relative mx-auto max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
          <p className="t-display max-w-[20ch] text-[2.3rem] leading-[1.0] sm:text-[3.4rem]">
            The demo is the honest part.
          </p>
          <p className="mt-5 max-w-[54ch] text-[1.05rem] leading-relaxed text-chalk-muted">
            It is product logic you can test in ninety seconds, not a result we are asking you to
            believe.
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
