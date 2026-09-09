'use client';

/* ==========================================================================
   The route, in one line.

   What the anchor shows when the full drawing is collapsed. Same model, same
   colours, same status vocabulary, just the shape of the route rather than
   the map of it. It carries the stop names, because a row of unlabelled dots
   and dashes is decoration, not information.
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
    <button
      type="button"
      onClick={onExpand}
      className="group flex w-full min-w-0 items-center gap-2 overflow-x-auto py-2 text-left no-scrollbar"
    >
      <span className="sr-only">Open the full route drawing</span>
      {nodes.map((n, i) => {
        const meta = STATUS_META[n.status];
        const c = tone(meta.tone);
        const covered = i <= lastDone;
        const isDest = n.kind === 'destination';
        const label = n.short ?? n.label;
        return (
          <span key={n.id} className="flex shrink-0 items-center gap-2">
            {i > 0 && (
              <span
                aria-hidden="true"
                className="h-0 w-5 sm:w-8"
                style={{
                  borderTop: covered
                    ? '2px solid var(--color-route)'
                    : '2px dashed var(--color-chalk-faint)',
                  opacity: covered ? 1 : 0.65,
                }}
              />
            )}
            <span className="flex shrink-0 items-center gap-1.5">
              <span
                aria-hidden="true"
                className={isDest ? 'block h-2.5 w-2.5' : 'block h-2.5 w-2.5 rounded-full'}
                style={{
                  background: covered || n.status === 'repair' ? c : 'transparent',
                  border: `2px solid ${c}`,
                  opacity: n.status === 'unknown' ? 0.65 : 1,
                }}
              />
              <span
                className="whitespace-nowrap text-[0.78rem] font-medium"
                style={{ color: n.status === 'unknown' ? 'var(--color-chalk-faint)' : c }}
              >
                {label}
              </span>
            </span>
          </span>
        );
      })}
      <span
        aria-hidden="true"
        className="t-label ml-2 shrink-0 text-chalk-faint transition-colors group-hover:text-route"
      >
        expand
      </span>
    </button>
  );
}
