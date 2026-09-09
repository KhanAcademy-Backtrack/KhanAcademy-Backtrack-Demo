'use client';

/* ==========================================================================
   The route, as a rail.

   What the anchor shows while the learner is working. The old collapsed view
   was the full route with every stop named, which meant the orientation
   device itself needed navigating: on a phone it scrolled sideways, and a
   thing you have to scroll in order to find out where you are is not helping
   you find out where you are.

   So the rail carries shape and position only, and no reading: covered route
   behind you, the leg you are on, the road ahead, and a mark on the stop you
   are at. The names live one tap away in the full drawing, which is where
   they were always most legible.
   ========================================================================== */

import type { RouteModel } from '@/lib/route-model';

function covered(status: string) {
  return status === 'origin' || status === 'checked' || status === 'repaired' || status === 'reached';
}

export function RouteRail({ model, recalculating }: { model: RouteModel; recalculating: boolean }) {
  const nodes = model.nodes;
  if (nodes.length < 2) return null;

  const lastDone = nodes.reduce((acc, n, i) => (covered(n.status) ? i : acc), 0);
  const activeIdx = nodes.findIndex((n) => n.active);
  const hereIdx = activeIdx > lastDone ? activeIdx : Math.min(lastDone + 1, nodes.length - 1);

  return (
    <div className="relative h-[18px] w-full" aria-hidden="true">
      {/* the whole route, faint */}
      <span className="absolute inset-x-0 top-[8px] h-[2px] bg-hairline" />
      {/* the part that is theirs */}
      <span
        className="absolute top-[8px] h-[2px] bg-route transition-[width] duration-700 ease-out"
        style={{ width: `${(lastDone / (nodes.length - 1)) * 100}%` }}
      />
      {/* the leg they are on, in that leg's own colour */}
      {hereIdx > lastDone && (
        <span
          className={`absolute top-[8px] h-[2px] transition-all duration-700 ease-out ${
            recalculating ? 'bg-recalc' : 'bg-route/45'
          }`}
          style={{
            left: `${(lastDone / (nodes.length - 1)) * 100}%`,
            width: `${((hereIdx - lastDone) / (nodes.length - 1)) * 100}%`,
          }}
        />
      )}

      {nodes.map((n, i) => {
        const isDone = covered(n.status);
        const isHere = i === hereIdx;
        const isDest = n.kind === 'destination';
        const left = (i / (nodes.length - 1)) * 100;
        return (
          <span
            key={n.id}
            className="absolute top-[8px] -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%` }}
          >
            <span
              className={`block transition-colors duration-500 ${
                isDest ? 'h-[9px] w-[9px]' : 'h-[7px] w-[7px] rounded-full'
              } ${
                isDone
                  ? 'border-2 border-route bg-route'
                  : isHere
                    ? recalculating
                      ? 'border-2 border-recalc bg-recalc'
                      : 'border-2 border-now bg-now'
                    : 'border-2 border-chalk-faint bg-base'
              }`}
            />
            {isHere && (
              <span
                className={`absolute left-1/2 top-1/2 -z-10 h-[19px] w-[19px] -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  recalculating ? 'bg-recalc/25' : 'bg-now/25'
                }`}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
