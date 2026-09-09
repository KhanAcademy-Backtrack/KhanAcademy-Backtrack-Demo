'use client';

/* ==========================================================================
   The route, in one line.

   What the anchor shows when the full drawing is collapsed. Same model, same
   colours, same status vocabulary — just the shape of the route rather than
   the map of it, so the learner never loses sight of where they are while
   still getting their screen back for the mathematics.
   ========================================================================== */

import type { RouteModel } from '@/lib/route-model';
import { STATUS_META } from '@/lib/route-model';

function tone(t: string) {
  return t === 'route'
    ? 'var(--color-route)'
    : t === 'recalc'
      ? 'var(--color-recalc)'
      : t === 'now'
        ? 'var(--color-now)'
        : 'var(--color-chalk-faint)';
}

export function RouteStrip({ model, onExpand }: { model: RouteModel; onExpand: () => void }) {
  const nodes = model.nodes;
  const lastDone = nodes.reduce(
    (acc, n, i) =>
      n.status === 'origin' || n.status === 'checked' || n.status === 'repaired' || n.status === 'reached'
        ? i
        : acc,
    0,
  );

  return (
    <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
      {nodes.map((n, i) => {
        const meta = STATUS_META[n.status];
        const c = tone(meta.tone);
        const covered = i <= lastDone;
        const isDest = n.kind === 'destination';
        return (
          <span key={n.id} className="flex shrink-0 items-center gap-1.5">
            {i > 0 && (
              <span
                aria-hidden="true"
                className="h-[2px] w-6 sm:w-9"
                style={{
                  background: covered ? 'var(--color-route)' : 'transparent',
                  borderTop: covered ? 'none' : '2px dashed var(--color-chalk-faint)',
                  opacity: covered ? 1 : 0.7,
                }}
              />
            )}
            <button
              type="button"
              onClick={onExpand}
              title={`${n.label} — ${meta.word}`}
              className="grid h-6 w-6 place-items-center"
            >
              <span
                aria-hidden="true"
                className={isDest ? 'block h-2.5 w-2.5' : 'block h-2.5 w-2.5 rounded-full'}
                style={{
                  background: covered || n.status === 'repair' ? c : 'transparent',
                  border: `2px solid ${c}`,
                  opacity: n.status === 'unknown' ? 0.6 : 1,
                }}
              />
              <span className="sr-only">
                {n.label} — {meta.word}. Open the full route.
              </span>
            </button>
          </span>
        );
      })}
    </div>
  );
}
