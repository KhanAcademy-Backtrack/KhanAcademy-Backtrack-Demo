'use client';

/* ==========================================================================
   The Khan Academy checkpoint.

   This is the handover. BACKTRACK has worked out which stop is in the way;
   the teaching itself belongs to Khan Academy, and the interface should make
   that division obvious rather than hiding it behind a generic "resources"
   box.

   Every link here was opened and checked by hand. There is no API between
   these two products, BACKTRACK cannot see what happens on the other side of
   the link, and the interface says so — which is exactly why the stop is only
   marked repaired by the fresh question that comes after it.
   ========================================================================== */

import type { KhanResource, Skill } from '@/lib/curriculum';

const KIND: Record<KhanResource['kind'], { label: string; glyph: string }> = {
  video: { label: 'Video', glyph: '▶' },
  article: { label: 'Article', glyph: '❧' },
  exercise: { label: 'Practice', glyph: '✎' },
};

export function KhanCheckpoint({ skill }: { skill: Skill }) {
  const { khan } = skill;
  return (
    <div className="material-paper relative px-5 py-8 sm:px-10 sm:py-10" data-ruled="grid">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="t-label text-ink-muted">Learn it on</p>
          <p className="mt-1.5 font-display text-[2rem] leading-none text-ink">Khan Academy</p>
        </div>
        <p className="max-w-[30ch] text-right text-[0.78rem] leading-relaxed text-ink-muted">
          Free, already trusted, and better at teaching this than we would be.
        </p>
      </div>

      <nav
        className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-paper-line pt-4 text-[0.82rem] text-ink-muted"
        aria-label="Khan Academy location"
      >
        <span>{khan.course}</span>
        <span aria-hidden="true">›</span>
        <span>{khan.unit}</span>
        <span aria-hidden="true">›</span>
        <span className="font-semibold text-ink">{khan.lesson}</span>
      </nav>

      <ul className="mt-5">
        {khan.resources.map((r) => (
          <li key={r.url}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-[64px] items-center gap-4 border-b border-paper-line py-3 transition-colors hover:bg-ink/[0.04]"
            >
              <span
                aria-hidden="true"
                className={`grid h-9 w-9 shrink-0 place-items-center border text-[0.9rem] ${
                  r.kind === 'exercise'
                    ? 'border-route-deep bg-route-deep text-paper'
                    : 'border-paper-line text-ink-muted'
                }`}
              >
                {KIND[r.kind].glyph}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.02rem] font-medium leading-snug text-ink">
                  {r.title}
                </span>
                <span className="t-label mt-1 block text-ink-muted">
                  {KIND[r.kind].label}
                  {r.kind === 'exercise' ? ' · Khan asks for 3 of 4 to level up' : ''}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"
              >
                ↗
              </span>
              <span className="sr-only">opens khanacademy.org in a new tab</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-5 max-w-[70ch] text-[0.82rem] leading-relaxed text-ink-muted">
        <strong className="font-semibold text-ink">Opening a link is not learning.</strong> BACKTRACK
        cannot see anything that happens on khanacademy.org — there is no integration and no
        partnership. Come back when you are ready and answer one fresh question here; that is the only
        thing that marks this stop repaired.
      </p>
    </div>
  );
}
