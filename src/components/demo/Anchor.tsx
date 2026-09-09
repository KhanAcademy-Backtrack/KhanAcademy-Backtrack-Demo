'use client';

/* ==========================================================================
   The anchor: where am I, and where am I going.

   It answers exactly four questions, in the order a learner asks them:

     1. What am I doing right now?   the current stop
     2. Why?                          the goal it leads back to
     3. Can I do the goal yet?        the destination's state
     4. What is left?                 the rail, and the full drawing on demand

   The route itself has three modes, because a map that is permanently open is
   furniture and a map that is never open is a secret:

     QUIET        a rail. Shape and position, nothing to read.
     EXPLANATORY  the learner opened it. Full drawing, legend, reasons.
     EVENT        the route just changed. It opens itself, draws the change,
                  and closes again if the learner had it closed.

   That last mode is the point. The full map arriving because something
   happened is a great deal more legible than the full map always being there.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RouteMap } from '@/components/route/RouteMap';
import { RouteRail } from './RouteRail';
import { Icon } from '@/components/ui/Icon';
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
  currentStop,
}: {
  model: RouteModel;
  minutes: number;
  recalculating: boolean;
  destState: 'blocked' | 'open' | 'solved';
  sweepKey: number;
  currentStop: string | null;
}) {
  const [selected, setSelected] = useState<RouteNode | null>(null);
  /* What the learner chose. The route may be open on top of this for an
     event, but it always returns to what they asked for. */
  const [pinned, setPinned] = useState(false);
  const [event, setEvent] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    try {
      setPinned(localStorage.getItem(OPEN_KEY) === '1');
    } catch {
      /* a browser that refuses storage still gets a working route */
    }
  }, []);

  /* --- the event mode ------------------------------------------------- */
  const firstSweep = useRef(true);
  useEffect(() => {
    if (firstSweep.current) {
      firstSweep.current = false;
      return;
    }
    setEvent(true);
    /* Long enough to read the new shape, and longer when the morph is not
       animating, because there is no drawing to watch it happen. */
    const t = setTimeout(() => setEvent(false), reduced ? 6000 : 4200);
    return () => clearTimeout(t);
  }, [sweepKey, reduced]);

  const open = pinned || event;

  function toggle() {
    const next = !open;
    try {
      localStorage.setItem(OPEN_KEY, next ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (!next) setSelected(null);
    setEvent(false);
    setPinned(next);
  }

  const stops = routeStops(model);
  const done = Math.max(routeDone(model) - 1, 0); /* the origin is not a stop */

  return (
    /* When the full drawing is open it is content, not chrome: half a phone
       screen of map pinned to the top of the viewport helps nobody. The rail
       keeps its pin, because staying in view is the whole of its job. */
    <div
      className={`z-30 border-b border-hairline bg-base/95 backdrop-blur-sm ${
        open ? 'relative' : 'sticky top-16'
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* --- one orientation row ------------------------------------- */}
        <div className="flex items-center justify-between gap-3 py-2.5 sm:gap-6">
          <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
            {/* 1. what am I doing right now */}
            <div className="min-w-0 shrink">
              <p className="t-label text-chalk-faint">
                {currentStop ? 'Current stop' : 'Getting started'}
              </p>
              <p className="mt-0.5 truncate text-[0.95rem] font-medium text-chalk">
                {currentStop ?? 'Setting your route'}
              </p>
            </div>

            {/* 2. and why: the goal it leads back to */}
            <div className="hidden min-w-0 shrink border-l border-hairline-soft pl-4 sm:block sm:pl-8">
              <p className="t-label flex items-center gap-1.5 text-chalk-faint">
                <Icon name="goal" size={12} strokeWidth={2} />
                Today&rsquo;s goal
              </p>
              <MathText size="sm" className="mt-0.5 block truncate text-chalk">
                {DESTINATION.today}
              </MathText>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* 3. can I do the goal yet */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={destState}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`t-label hidden items-center gap-1.5 border px-2.5 py-1.5 sm:inline-flex ${
                  destState === 'solved'
                    ? 'border-now bg-now text-base'
                    : destState === 'open'
                      ? 'border-route text-route'
                      : 'border-hairline text-chalk-faint'
                }`}
              >
                {destState === 'solved' && <Icon name="check" size={12} strokeWidth={2.5} />}
                {destState === 'solved'
                  ? 'Solved'
                  : destState === 'open'
                    ? 'Goal unlocked'
                    : 'Goal blocked'}
              </motion.span>
            </AnimatePresence>

            {/* 4. what is left */}
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls="route-region"
              className={`t-label flex min-h-[38px] items-center gap-2 border px-2.5 transition-colors ${
                recalculating
                  ? 'border-recalc text-recalc'
                  : 'border-hairline text-chalk-muted hover:border-route hover:text-route'
              }`}
            >
              <Icon name={recalculating ? 'recalculate' : 'route'} size={14} strokeWidth={2} />
              <span className="hidden sm:inline">
                {recalculating ? 'Recalculating' : 'Route'}
              </span>
              <span className="t-mono-num">
                {done}/{stops}
              </span>
              <Icon
                name="chevron-down"
                size={13}
                strokeWidth={2.5}
                className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
              />
              <span className="sr-only">
                {open ? 'Hide the full route drawing' : 'Show the full route drawing'}
              </span>
            </button>
          </div>
        </div>

        {/* On a phone there is no room for the goal beside the current stop,
            so it goes underneath it: the equation, and whether it is reachable
            yet. Losing the destination state on small screens would have
            removed the one thing the whole route is pointed at. */}
        <p className="flex items-center gap-2 pb-2 text-[0.78rem] sm:hidden">
          <Icon name="goal" size={12} strokeWidth={2} className="text-chalk-faint" />
          <MathText size="xs" className="truncate text-chalk-muted">
            {DESTINATION.today}
          </MathText>
          <span aria-hidden="true" className="text-chalk-faint">
            &middot;
          </span>
          <span
            className={`t-label shrink-0 ${
              destState === 'solved'
                ? 'text-now'
                : destState === 'open'
                  ? 'text-route'
                  : 'text-chalk-faint'
            }`}
          >
            {destState === 'solved' ? 'Solved' : destState === 'open' ? 'Unlocked' : 'Blocked'}
          </span>
        </p>

        {/* --- QUIET: shape and position, nothing to read --------------- */}
        {!open && (
          <button
            type="button"
            onClick={toggle}
            className="group block w-full cursor-pointer pb-2.5 pt-0.5 text-left"
          >
            <span className="sr-only">Open the full route drawing</span>
            <RouteRail model={model} recalculating={recalculating} />
            <span className="mt-1 flex items-center justify-between text-[0.72rem] text-chalk-faint">
              <span className="t-mono-num flex items-center gap-1.5">
                <Icon name="timer" size={11} strokeWidth={2} />&asymp; {minutes} min left
              </span>
              <span className="transition-colors group-hover:text-route">See the whole route</span>
            </span>
          </button>
        )}

        {/* --- EXPLANATORY / EVENT: the full drawing -------------------- */}
        <div id="route-region" hidden={!open}>
          {open && (
            <>
              {event && !pinned && (
                <p className="t-label flex items-center gap-2 pt-1 text-recalc">
                  <Icon name="recalculate" size={13} strokeWidth={2} />
                  Your route just changed
                </p>
              )}
              <RouteMap
                model={model}
                variant="ribbon"
                compactAt={760}
                onSelectNode={setSelected}
                selectedId={selected?.id ?? null}
                sweepKey={sweepKey}
              />
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-hairline-soft py-2 text-[0.78rem]">
                <span className="t-mono-num flex items-center gap-1.5 text-chalk-muted">
                  <Icon name="timer" size={12} strokeWidth={2} />&asymp; {minutes} min of work left
                </span>
                <span className="hidden items-center gap-4 text-chalk-faint lg:flex">
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
              </div>
            </>
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
