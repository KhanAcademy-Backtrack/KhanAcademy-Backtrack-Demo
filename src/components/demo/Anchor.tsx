'use client';

/* ==========================================================================
   The anchor.

   The destination equation and the route sit above every screen and never
   move. That is the whole difference between recovery and remediation: while
   the learner works backwards they can still see the thing they were going
   to, and they can see it change state from blocked, to in reach, to solved.

   The state change *is* the reward. There is no badge underneath it.
   ========================================================================== */

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RouteMap } from '@/components/route/RouteMap';
import { MathText } from '@/components/math/Math';
import { DESTINATION } from '@/lib/curriculum';
import type { RouteModel, RouteNode } from '@/lib/route-model';
import { routeDone, routeStops } from '@/lib/route-model';

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
  const [openOnMobile, setOpenOnMobile] = useState(false);
  const reduced = useReducedMotion();

  const stops = routeStops(model);
  const done = routeDone(model) - 1; /* the origin is not a stop */

  return (
    <div className="sticky top-16 z-30 border-b border-hairline bg-base/94 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* --- the destination ----------------------------------------- */}
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <div className="hidden shrink-0 sm:block">
              <p className="t-label text-chalk-faint">Today’s goal</p>
              <p className="mt-0.5 text-[0.8rem] text-chalk-faint">
                {DESTINATION.course} · {DESTINATION.unit}
              </p>
            </div>
            <motion.div
              animate={
                reduced
                  ? {}
                  : destState === 'blocked'
                    ? { opacity: 0.45, filter: 'blur(0.6px)' }
                    : { opacity: 1, filter: 'blur(0px)' }
              }
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="min-w-0"
            >
              <MathText size="md" className="truncate text-chalk">
                {DESTINATION.today}
              </MathText>
            </motion.div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={destState}
                initial={reduced ? false : { opacity: 0, y: 6, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
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
                {destState === 'solved' ? 'Solved' : destState === 'open' ? 'In reach' : 'Blocked'}
              </motion.span>
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setOpenOnMobile((v) => !v)}
              aria-expanded={openOnMobile}
              className="t-label flex items-center gap-2 border border-hairline px-2.5 py-1.5 text-chalk-muted md:hidden"
            >
              Route · {done} of {stops}
              <span aria-hidden="true">{openOnMobile ? '▴' : '▾'}</span>
            </button>
          </div>
        </div>

        {/* --- the route ------------------------------------------------ */}
        <div className={`${openOnMobile ? 'block' : 'hidden'} md:block`}>
          <RouteMap
            model={model}
            variant="ribbon"
            compactAt={760}
            onSelectNode={setSelected}
            selectedId={selected?.id ?? null}
            sweepKey={sweepKey}
          />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-hairline-soft py-2.5">
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
              {done} of {stops} stops · ≈ {minutes} min left
            </span>
            <span className="hidden text-[0.78rem] text-chalk-faint sm:inline">
              Select a stop to see why it is on your route.
            </span>
          </div>

          <AnimatePresence>
            {selected && (
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
    </div>
  );
}
