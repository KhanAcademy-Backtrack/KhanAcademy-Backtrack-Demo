import type { Metadata } from 'next';
import Link from 'next/link';
import { Atmosphere } from '@/components/site/Atmosphere';
import { HonestNote, Section, SectionHead } from '@/components/site/Section';
import { MathText } from '@/components/math/Math';
import { SKILLS } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Find my missing step · Quadratics',
  description:
    'Where a short video lands. One question about quadratics, and a route back to it — not a homepage.',
};

const ENTRIES = [
  { path: '/start/quadratics', label: 'Quadratics', state: 'Built' },
  { path: '/start/brackets', label: 'Brackets', state: 'Planned' },
  { path: '/start/fractions', label: 'Fractions', state: 'Planned' },
  { path: '/start/ratios', label: 'Ratios', state: 'Planned' },
];

export default function StartQuadraticsPage() {
  return (
    <>
      <section className="material-map relative overflow-hidden">
        <Atmosphere variant="cover" />
        <div className="relative mx-auto grid max-w-[1400px] gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-20">
          <div>
            <p className="t-label text-recalc">Topic entry point</p>
            <h1 className="t-display mt-5 max-w-[16ch] text-[2.5rem] leading-[0.98] sm:text-[3.6rem] lg:text-[4.2rem]">
              Couldn’t answer it? You are probably not bad at math.
            </h1>
            <p className="mt-6 max-w-[48ch] text-[1.1rem] leading-relaxed text-chalk-muted">
              You are probably missing one step. This page exists so that a short video about quadratics
              lands on the thing it asked about, ready to check exactly that — instead of dumping you on
              a homepage to go and find it yourself.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/demo" className="btn btn-primary">
                Find my missing step
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/how-it-works" className="btn btn-ghost">
                What this actually does
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-[0.8rem] text-chalk-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-recalc" aria-hidden="true" />
              Illustrative prototype entry. No sign-in, and nothing is recorded about you.
            </p>
          </div>

          <div className="material-paper settle px-6 py-10 sm:px-10 sm:py-14">
            <p className="t-label text-ink-muted">The question that caught you out</p>
            <MathText size="xl" as="div" className="mt-5 block text-ink">
              x² + 7x + 12 = 0
            </MathText>
            <p className="mt-6 max-w-[40ch] text-[1rem] leading-relaxed text-ink-muted">
              Most people who miss this do not have a “quadratics problem”. They have one specific step
              underneath it that never got repaired — and it is usually not the one they would have
              guessed.
            </p>
            <div className="mt-7 border-t border-paper-line pt-5">
              <p className="t-label text-ink-muted">What might be underneath</p>
              <ul className="mt-3 space-y-1.5">
                {['factor', 'distribute', 'like_terms'].map((id) => (
                  <li key={id} className="flex items-baseline gap-3 text-[0.98rem] text-ink">
                    <span className="text-route-deep" aria-hidden="true">
                      ↑
                    </span>
                    {SKILLS[id as 'factor'].label}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[0.85rem] leading-relaxed text-ink-muted">
                BACKTRACK checks which one, and routes only that. It does not make you restart the
                chapter.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Section tone="field">
        <SectionHead
          label="Where this goes"
          title="Every topic gets its own front door."
          lead="A short video about quadratics should never dump the viewer on a homepage and make them navigate. It should land on the problem they just failed, ready to check that exact thing. This page is the working prototype of that pattern."
        />

        <ul className="mt-12 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {ENTRIES.map((e) => (
            <li key={e.path} className="bg-field p-6">
              <p className="font-mono text-[0.95rem] text-chalk">{e.path}</p>
              <p className="mt-2 text-[1.02rem] text-chalk-muted">{e.label}</p>
              <p
                className={`t-label mt-4 ${e.state === 'Built' ? 'text-route' : 'text-chalk-faint'}`}
              >
                {e.state === 'Built' ? '✓ Built' : 'Planned'}
              </p>
            </li>
          ))}
        </ul>

        <HonestNote>
          Only the quadratics entry is implemented in this prototype. The others are labelled planned
          because they are planned, not built.{' '}
          <strong className="font-semibold text-chalk-muted">Views are not impact.</strong> Reach and
          learning are reported separately: qualified click, diagnostic start, route start, Khan practice
          initiation, return visit. A view count is not a learning outcome and will not be presented as
          one.
        </HonestNote>
      </Section>
    </>
  );
}
