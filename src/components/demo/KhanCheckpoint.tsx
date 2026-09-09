'use client';

/* ==========================================================================
   The Khan Academy checkpoint.

   This is the handover, and the whole product depends on the learner
   understanding it as three separate jobs rather than as one page with some
   links on it:

     BACKTRACK found the gap  →  Khan Academy teaches it  →  BACKTRACK checks

   So the loop is drawn at the top, with the middle step lit, instead of being
   described in a paragraph underneath. A learner who opens a link and comes
   back should find the third step waiting for them and know immediately that
   it is the thing that counts.

   The resource rows borrow Khan Academy's own conventions, because a learner
   who uses Khan should recognise the shape of what they are being handed: the
   course / unit / lesson breadcrumb they navigate by, a resource type on
   every row, and Phosphor-style icons, which is the set Khan's own design
   system draws from.

   Every link here was opened and checked by hand. There is no API between
   these two products, BACKTRACK cannot see what happens on the other side of
   the link, and the interface says so, which is exactly why the stop is only
   marked repaired by the fresh question that comes after it.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Icon, type IconName } from '@/components/ui/Icon';
import type { KhanResource, Skill } from '@/lib/curriculum';

const KIND: Record<KhanResource['kind'], { label: string; icon: IconName; cta: string }> = {
  video: { label: 'Video', icon: 'video', cta: 'Watch' },
  article: { label: 'Article', icon: 'article', cta: 'Read' },
  exercise: { label: 'Practice', icon: 'practice', cta: 'Practise' },
};

export function KhanCheckpoint({ skill, onReturn }: { skill: Skill; onReturn?: () => void }) {
  const { khan } = skill;
  const [left, setLeft] = useState(false);
  const [back, setBack] = useState(false);
  const openedAt = useRef(0);
  const reduced = useReducedMotion();

  /* If they opened a resource and came back to this tab, say so. This is the
     one thing BACKTRACK can honestly observe about the handover: that a link
     was opened, and that the learner returned. Not that anything was learned,
     which is what the fresh question is for. */
  useEffect(() => {
    if (!left) return;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - openedAt.current < 1200) return;
      setLeft(false);
      setBack(true);
      onReturn?.();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [left, onReturn]);

  return (
    <div className="material-paper relative px-5 py-8 sm:px-9 sm:py-10" data-ruled="grid">
      {/* --- the division of labour, drawn ---------------------------- */}
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em]">
        <li className="text-ink-muted/70">1 &middot; BACKTRACK found the gap</li>
        <li aria-hidden="true" className="text-ink-muted/50">
          &rarr;
        </li>
        <li className="border border-route-deep bg-route-deep px-2 py-1 text-paper">
          2 &middot; Khan Academy teaches it
        </li>
        <li aria-hidden="true" className="text-ink-muted/50">
          &rarr;
        </li>
        <li className="text-ink-muted/70">3 &middot; BACKTRACK checks again</li>
      </ol>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-paper-line pt-6">
        <div>
          <p className="t-label text-ink-muted">Learn it on</p>
          <p className="mt-1 font-display text-[2rem] leading-none text-ink">Khan Academy</p>
        </div>
        <p className="max-w-[32ch] text-[0.8rem] leading-relaxed text-ink-muted">
          Free, already trusted, and better at teaching this than we would be.
        </p>
      </div>

      {/* Khan's own breadcrumb, because that is how a learner navigates
          there and it tells them exactly where they are being sent. */}
      <nav
        className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.82rem] text-ink-muted"
        aria-label="Where this sits on Khan Academy"
      >
        <span>{khan.course}</span>
        <span aria-hidden="true">&rsaquo;</span>
        <span>{khan.unit}</span>
        <span aria-hidden="true">&rsaquo;</span>
        <span className="font-semibold text-ink">{khan.lesson}</span>
      </nav>

      <ul className="mt-4 border-t border-paper-line">
        {khan.resources.map((r) => {
          const k = KIND[r.kind];
          return (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  openedAt.current = Date.now();
                  setLeft(true);
                }}
                className="group flex min-h-[68px] items-center gap-4 border-b border-paper-line py-3 transition-colors hover:bg-ink/[0.045]"
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center border ${
                    r.kind === 'exercise'
                      ? 'border-route-deep bg-route-deep text-paper'
                      : 'border-paper-line bg-paper text-ink-muted group-hover:border-ink group-hover:text-ink'
                  }`}
                >
                  <Icon name={k.icon} size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[1.02rem] font-medium leading-snug text-ink">
                    {r.title}
                  </span>
                  <span className="t-label mt-1 block text-ink-muted">
                    {k.label}
                    {r.kind === 'exercise' ? ' · Khan asks for 3 of 4 to level up' : ''}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-[0.85rem] font-semibold text-ink-muted transition-colors group-hover:text-ink">
                  <span className="hidden sm:inline">{k.cta}</span>
                  <Icon name="external" size={17} />
                </span>
                <span className="sr-only">opens khanacademy.org in a new tab</span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* --- coming back ---------------------------------------------- */}
      <AnimatePresence initial={false}>
        {back && (
          <motion.div
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 border-l-2 border-route-deep pl-4">
              <p className="t-label text-route-deep">Welcome back</p>
              <p className="mt-1.5 max-w-[62ch] text-[0.95rem] leading-relaxed text-ink">
                Khan Academy handled the teaching. BACKTRACK needs fresh evidence before it moves
                this stop off your route, so the next question uses different numbers.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-5 max-w-[70ch] text-[0.82rem] leading-relaxed text-ink-muted">
        <strong className="font-semibold text-ink">Opening a link is not learning.</strong> BACKTRACK
        cannot see anything that happens on khanacademy.org. There is no integration and no
        partnership. Come back when you are ready and answer one fresh question here; that is the
        only thing that marks this stop repaired.
      </p>
    </div>
  );
}
