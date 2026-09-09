import type { Metadata } from 'next';
import Link from 'next/link';
import { HonestNote, Section, SectionHead } from '@/components/site/Section';
import { ClassSpread } from '@/components/home/ClassSpread';
import { Atmosphere } from '@/components/site/Atmosphere';

export const metadata: Metadata = {
  title: 'Classrooms',
  description:
    'One destination for the class, a route for each learner. What a teacher would actually open, and what a pilot would need, written as a proposal, because nothing has been agreed.',
};

const STEPS = [
  {
    n: '01',
    title: 'The teacher confirms today’s goal',
    body: 'Once, for the class. Usually the lesson they are already teaching this week, not a separate intervention curriculum to plan and maintain.',
  },
  {
    n: '02',
    title: 'Every learner gets their own route',
    body: 'Same destination, different prerequisites. A learner who already has them goes almost straight there; a learner missing one step repairs that one step.',
  },
  {
    n: '03',
    title: 'The learning happens on Khan Academy',
    body: 'Existing free content, in whatever accounts the school already uses. BACKTRACK’s job is deciding what is worth a learner’s time this period.',
  },
  {
    n: '04',
    title: 'The teacher gets a summary, not a dashboard',
    body: 'Common blockers across the class, which learners a route repair will not be enough for, and whether the class is converging on today’s lesson. That is the whole teacher surface.',
  },
  {
    n: '05',
    title: 'Humans handle what routing can’t',
    body: 'Some learners are not stuck on a prerequisite. They are stuck on attendance, eyesight, language, hunger, or something happening at home. BACKTRACK’s job there is to say so quickly, not to keep serving exercises.',
  },
];

const DELIVERY = [
  'A remediation period',
  'Advisory or homeroom',
  'A computer-lab slot',
  'Supervised after-class study',
  'One or two short weekly blocks',
  'Structured homework with supervised verification',
];

export default function ClassroomsPage() {
  return (
    <>
      <section className="material-map relative overflow-hidden">
        <Atmosphere variant="cover" />
        <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28">
          <p className="t-label text-route">Classrooms</p>
          <h1 className="t-display mt-5 max-w-[17ch] text-[2.6rem] leading-[0.98] sm:text-[4rem] lg:text-[4.6rem]">
            One destination for the class. A route for each learner.
          </h1>
          <p className="mt-7 max-w-[60ch] text-[1.1rem] leading-relaxed text-chalk-muted">
            A teacher already knows some of the class is missing something. What they do not have is
            thirty-two diagnoses, thirty-two repair plans, and the hours to build them.
          </p>
        </div>
      </section>

      <Section tone="field">
        <SectionHead
          label="Teacher view"
          title="What a teacher would actually open."
          lead="Deliberately small. If a teacher has to study it, it has failed. This is the shape of the class, not a file on each child."
        />
        <div className="mt-14">
          <ClassSpread />
        </div>

        <div className="mt-12 grid gap-px border border-hairline bg-hairline md:grid-cols-3">
          <div className="bg-field p-6">
            <p className="t-label text-route">Reteach to the room</p>
            <p className="mt-2 text-[0.98rem] leading-relaxed text-chalk-muted">
              Eleven of thirty-two bending at the same stop is not thirty-two problems. It is one
              fifteen-minute reteach.
            </p>
          </div>
          <div className="bg-field p-6">
            <p className="t-label text-route">Already ready</p>
            <p className="mt-2 text-[0.98rem] leading-relaxed text-chalk-muted">
              Ten go straight through. They should not be sitting through review they have already
              demonstrated they do not need.
            </p>
          </div>
          <div className="bg-field p-6">
            <p className="t-label text-recalc">Needs a person</p>
            <p className="mt-2 text-[0.98rem] leading-relaxed text-chalk-muted">
              When repeated route repairs do not move a learner, the honest signal is “this is not a
              prerequisite problem”, not another exercise.
            </p>
          </div>
        </div>

        <HonestNote>
          <strong className="font-semibold text-chalk-muted">Not a surveillance dashboard.</strong> The
          teacher surface is aggregate by design. It does not show minute-by-minute behaviour, it does
          not rank learners against each other, and it does not exist to prove anybody was working.
        </HonestNote>
      </Section>

      <Section>
        <SectionHead label="How it lands" title="Five moves, and the school keeps its own routine." />
        <ol className="mt-14 border-t border-hairline">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="grid gap-3 border-b border-hairline py-7 md:grid-cols-[auto_minmax(0,0.9fr)_minmax(0,1.3fr)] md:gap-10"
            >
              <span className="t-label pt-1.5 text-now">{s.n}</span>
              <h3 className="text-[1.2rem] font-medium leading-snug text-chalk">{s.title}</h3>
              <p className="max-w-[66ch] text-[1rem] leading-relaxed text-chalk-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="field">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <p className="t-label text-route">Delivery</p>
            <h2 className="t-display mt-4 text-[2rem] leading-[1.03] sm:text-[2.7rem]">
              The routine is co-designed, not imposed.
            </h2>
            <p className="mt-6 max-w-[54ch] text-[1.02rem] leading-relaxed text-chalk-muted">
              We are not going to hard-code “two twenty-minute sessions a week” into a product and then
              hand it to a school whose timetable does not work that way. Recurring access could be any
              of these, agreed with the partner school:
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {DELIVERY.map((d) => (
                <li key={d} className="flex gap-3 text-[0.98rem] text-chalk-muted">
                  <span className="text-route" aria-hidden="true">
                    ·
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <dl className="self-start border-t border-hairline">
            {[
              [
                'Devices & connectivity',
                'Shared devices and scheduled connectivity windows where that is the honest situation. We do not claim fully offline Khan Academy functionality, because we have not verified it.',
              ],
              [
                'Paper activities',
                'Useful for waiting periods when devices are shared, but they are not counted as Khan Academy usage and will not be reported as such.',
              ],
              [
                'Scheduling',
                'Exact dates are agreed with each partner. We are not publishing a January timetable for schools that have not been asked yet.',
              ],
              [
                'Learner data',
                'The public demo collects no identifiable learner records. A formal pilot would need school agreement and appropriate data handling before any learner-level records exist.',
              ],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-hairline py-5">
                <dt className="t-label text-chalk-faint">{k}</dt>
                <dd className="mt-2 max-w-[62ch] text-[0.98rem] leading-relaxed text-chalk-muted">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section>
        <SectionHead
          label="Two ways in"
          title="School mode is not the only way BACKTRACK works."
          lead="A learner who has no teacher running this, and no permission to ask for one, still needs a way back to their class. That is the same product, entered differently."
        />
        <div className="mt-14 grid gap-px border border-hairline bg-hairline md:grid-cols-2">
          <div className="bg-field p-7 sm:p-10">
            <p className="t-label text-now">School mode</p>
            <h3 className="t-display mt-3 text-[1.7rem] leading-tight">
              The teacher sets the destination.
            </h3>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-chalk-muted">
              One goal for the class, thirty-two routes to it, and a summary the teacher can read in a
              minute between lessons.
            </p>
          </div>
          <div className="bg-field p-7 sm:p-10">
            <p className="t-label text-now">Self-study mode</p>
            <h3 className="t-display mt-3 text-[1.7rem] leading-tight">Or the learner sets it.</h3>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-chalk-muted">
              Through a topic selector, a shared link, a QR code on a classroom wall, or a short video
              that caught them out. Same logic, no permission needed.
            </p>
            <p className="mt-6">
              <Link href="/start/quadratics" className="btn-quiet text-route">
                See a topic entry point →
              </Link>
            </p>
          </div>
        </div>

        <HonestNote>
          <strong className="font-semibold text-chalk-muted">Proposed, not committed.</strong>{' '}
          Approximately 80–120 formally evaluated learners across 2–3 partner-school cohorts, subject to
          school agreements and curriculum fit. No school has agreed to anything, no pilot has run, and
          the grade level and lesson destinations would be matched with partner schools rather than
          fixed in advance.{' '}
          <Link href="/evidence" className="btn-quiet text-route">
            The full evidence plan
          </Link>
          .
        </HonestNote>
      </Section>
    </>
  );
}
