'use client';

/* ==========================================================================
   Miss a turn, and watch what a navigator does about it.

   Two states, one control. The destination is the same object in both, which
   is the entire argument: the route changed, the destination did not.
   ========================================================================== */

import { useEffect, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';
import { RouteMap } from '@/components/route/RouteMap';
import type { RouteModel } from '@/lib/route-model';

const ORIGIN = {
  id: 'origin',
  kind: 'origin' as const,
  label: 'You are here',
  status: 'origin' as const,
  depth: 0,
};

const DEST = {
  id: 'dest',
  kind: 'destination' as const,
  label: 'Today’s lesson',
  status: 'unknown' as const,
  depth: 0,
  minutes: 3,
};

const STRAIGHT: RouteModel = {
  nodes: [
    ORIGIN,
    { id: 'check', label: 'Today’s check', status: 'checking', depth: 0, minutes: 2, active: true },
    DEST,
  ],
  flag: null,
};

const REROUTED: RouteModel = {
  nodes: [
    ORIGIN,
    { id: 'check', label: 'Today’s check', status: 'checked', depth: 0 },
    {
      id: 'repair',
      label: 'The turn you missed',
      status: 'repair',
      depth: 1,
      minutes: 6,
      note: 'inserted',
      active: true,
    },
    DEST,
  ],
  flag: { nodeId: 'repair', text: 'Recalculating', tone: 'recalc' },
};

export function MissedTurn() {
  const [rerouted, setRerouted] = useState(false);
  const [auto, setAuto] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!auto || !inView || reduced) return;
    const t = setTimeout(() => setRerouted((v) => !v), rerouted ? 4200 : 2600);
    return () => clearTimeout(t);
  }, [rerouted, auto, inView, reduced]);

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-hairline pb-3">
        <p className="t-label text-chalk-faint">The same destination, two routes</p>
        <button
          type="button"
          onClick={() => {
            setAuto(false);
            setRerouted((v) => !v);
          }}
          className="t-label text-route underline underline-offset-4 hover:text-now"
        >
          {rerouted ? 'Undo the missed turn' : 'Miss a turn'}
        </button>
      </div>
      <RouteMap
        model={rerouted ? REROUTED : STRAIGHT}
        variant="inline"
        compactAt={560}
        sweepKey={rerouted ? 'b' : 'a'}
        className="mt-2"
      />
      <p className="mt-1 text-[0.85rem] leading-relaxed text-chalk-faint">
        {rerouted
          ? 'One stop inserted. The destination marker has not moved a pixel.'
          : 'A clear run at today’s lesson, with one check on the way.'}
      </p>
    </div>
  );
}
