'use client';

/* ==========================================================================
   The anchor.

   The destination equation sits above every screen and never moves. That is
   the whole difference between recovery and remediation: while the learner
   works backwards they can still see the thing they were going to, and they
   can watch it change from blocked, to in reach, to solved. That state change
   is the reward; there is no badge underneath it.

   The route drawing beneath it collapses at every screen size, and the choice
   is remembered. It is the most important object in the product and it is also
   the tallest, and a learner who has already understood it should not have to
   keep giving it a third of their screen.
   ========================================================================== */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RouteMap } from '@/components/route/RouteMap';
import { RouteStrip } from './RouteStrip';
import { MathText } from '@/components/math/Math';
import { DESTINATION } from '@/lib/curriculum';
import type { RouteModel, RouteNode } from '@/lib/route-model';
import { routeDone, routeStops } from '@/lib/route-model';

const OPEN_KEY = 'backtrack.demo.route-open';

export function Anchor({
  model,
  minutes,
  recalculating,
  destState,
  sweepKey,
}: {
  model: RouteModel;
  minutes: number;
  recalculating: boolean;
  destState: 'blocked' | 'open' | 'solved';
  sweepKey: number;
}) {
  const [selected, setSelected] = useState<RouteNode | null>(null);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(OPEN_KEY);
      if (saved !== null) setOpen(saved === '1');
    } catch {
      /* a browser that refuses storage still gets a working route */
    }
  }, []);

  function toggle() {
    setOpen((wasOpen) => {
      try {
        localStorage.setItem(OPEN_KEY, wasOpen ? '0' : '1');
      } catch {
        /* ignore */
      }
      if (wasOpen) setSelected(null);
      return !wasOpen;
    });
  }

  const stops = routeStops(model);
  const done = Math.max(routeDone(model) - 1, 0); /* the origin is not a stop */

  return (
    <div className="sticky top-16 z-30 border-b border-hairline bg-base">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* --- the destination ----------------------------------------- */}
        <div className="flex items-center justify-between gap-4 py-2.5">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <div className="hidden shrink-0 sm:block">
              <p className="t-label text-chalk-faint">Today’s goal</p>
              <p className="mt-0.5 text-[0.78rem] text-chalk-faint">
                {DESTINATION.course} · {DESTINATION.unit}
              </p>
            </div>
            <motion.div
              animate={reduced ? {} : { opacity: destState === 'blocked' ? 0.5 : 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="min-w-0"
            >
              <MathText size="sm" className="truncate text-chalk">
                {DESTINATION.today}
              </MathText>
            </motion.div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={destState}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`t-label border px-2.5 py-1.5 ${
                  destState === 'solved'
                    ? 'border-now bg-now text-base'
                    : destState === 'open'
                      ? 'border-route text-route'
                      : 'border-hairline text-chalk-faint'
                }`}
              >
                <span className="hidden sm:inline">
                  {destState === 'solved'
                    ? 'You solved this'
                    : destState === 'open'
                      ? 'You can try this now'
                      : 'You can’t do this yet'}
                </span>
                <span className="sm:hidden">
                  {destState === 'solved' ? 'Solved' : destState === 'open' ? 'Ready' : 'Not yet'}
                </span>
              </motion.span>
            </AnimatePresence>

            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls="route-region"
              className="t-label flex min-h-[36px] items-center gap-2 border border-hairline px-2.5 text-chalk-muted transition-colors hover:border-route hover:text-route"
            >
              <span className={recalculating ? 'text-recalc' : 'text-route'} aria-hidden="true">
                ●
              </span>
              Route · {done} of {stops}
              <span aria-hidden="true">{open ? '▴' : '▾'}</span>
              <span className="sr-only">
                {open ? 'Hide the route drawing' : 'Show the route drawing'}
              </span>
            </button>
          </div>
        </div>

        {/* --- the route ------------------------------------------------ */}
        {!open && (
          <div className="border-t border-hairline-soft">
            <RouteStrip model={model} onExpand={toggle} />
          </div>
        )}

        <div id="route-region" hidden={!open}>
          <RouteMap
            model={model}
            variant="ribbon"
            compactAt={760}
            onSelectNode={setSelected}
            selectedId={selected?.id ?? null}
            sweepKey={sweepKey}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-hairline-soft py-2">
          <span className="flex items-center gap-2 text-[0.78rem] font-semibold">
            <span
              className={`h-1.5 w-1.5 rounded-full ${recalculating ? 'bg-recalc' : 'bg-route'}`}
              aria-hidden="true"
            />
            <span className={recalculating ? 'text-recalc' : 'text-route'}>
              {recalculating ? 'Recalculating…' : 'Route live'}
            </span>
          </span>
          <span className="t-mono-num text-[0.78rem] text-chalk-muted">
            ≈ {minutes} min of work left
          </span>
          {open && (
            <span className="hidden items-center gap-4 text-[0.78rem] text-chalk-faint lg:flex">
              <span className="flex items-center gap-1.5">
                <span className="h-[3px] w-5 bg-route" aria-hidden="true" />
                covered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-[3px] w-5 bg-recalc" aria-hidden="true" />
                the leg you are on
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-px w-5 border-t border-dashed border-chalk-muted"
                  aria-hidden="true"
                />
                ahead
              </span>
              <span>Select a stop for why it is on your route.</span>
            </span>
          )}
        </div>

        <AnimatePresence>
          {selected && open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="max-w-[76ch] pb-3 text-[0.88rem] leading-relaxed text-chalk-muted">
                <strong className="font-semibold text-chalk">{selected.label}.</strong>{' '}
                {selected.why}{' '}
                <button
                  type="button"
                  className="btn-quiet text-chalk-faint"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
