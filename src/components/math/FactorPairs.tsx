'use client';

/* ==========================================================================
   The pair machine — the repair for factoring x² + bx + c.

   Factoring is usually taught as a search, and learners usually search on one
   condition only: they find a pair that multiplies to c and stop. So this
   makes both conditions permanently visible and live. Every number you place
   updates both of them at once, and the brackets refuse to lock until both
   are satisfied.

   Wrong placements are not punished. They are the point — you can see exactly
   which condition your guess broke.
   ========================================================================== */

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { MathText } from './Math';

const TRAY = [1, 2, 3, 4, 6, 12];
const TARGET_PRODUCT = 12;
const TARGET_SUM = 7;

export function FactorPairs({ onComplete }: { onComplete: (done: boolean) => void }) {
  const [slots, setSlots] = useState<(number | null)[]>([null, null]);
  const reduced = useReducedMotion();

  const [a, b] = slots;
  const filled = a !== null && b !== null;
  const product = filled ? a! * b! : null;
  const sum = filled ? a! + b! : null;
  const productOk = product === TARGET_PRODUCT;
  const sumOk = sum === TARGET_SUM;
  const solved = filled && productOk && sumOk;

  function place(n: number) {
    setSlots((prev) => {
      const next: (number | null)[] = [...prev];
      const i = next[0] === null ? 0 : next[1] === null ? 1 : 1;
      next[i] = n;
      const done = next[0] !== null && next[1] !== null && next[0]! * next[1]! === TARGET_PRODUCT && next[0]! + next[1]! === TARGET_SUM;
      onComplete(done);
      return next;
    });
  }

  function clear(i: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[i] = null;
      onComplete(false);
      return next;
    });
  }

  return (
    <div className="material-paper relative px-5 py-7 sm:px-10 sm:py-9">
      <p className="t-label text-ink-muted">Find the pair</p>
      <p className="mt-2 max-w-[54ch] text-[0.98rem] leading-relaxed text-ink-muted">
        Two numbers have to do two jobs at the same time. Place them and watch both conditions.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-1 gap-y-3">
        <MathText size="lg" className="text-ink">
          x² + 7x + 12
        </MathText>
        <span className="px-3 text-ink-muted" aria-hidden="true">
          =
        </span>
        <span className="sr-only">equals</span>
        <span className="math flex items-center text-[1.9rem] sm:text-[2.2rem]">
          <span aria-hidden="true">(</span>
          <i className="v" aria-hidden="true">
            x
          </i>
          <span className="op" aria-hidden="true">
            +
          </span>
          <Slot value={a} onClear={() => clear(0)} index={1} />
          <span aria-hidden="true">)(</span>
          <i className="v" aria-hidden="true">
            x
          </i>
          <span className="op" aria-hidden="true">
            +
          </span>
          <Slot value={b} onClear={() => clear(1)} index={2} />
          <span aria-hidden="true">)</span>
        </span>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div>
          <p className="t-label text-ink-muted">Numbers to try</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TRAY.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => place(n)}
                disabled={solved}
                className="math h-[52px] min-w-[52px] border border-paper-line px-3 text-2xl text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:opacity-40"
              >
                {n}
                <span className="sr-only">place the number {n}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[0.85rem] text-ink-muted">
            These are the whole numbers that divide 12. Tap a placed number to take it back.
          </p>
        </div>

        <div className="space-y-3">
          <Condition
            label="multiply to"
            expression={filled ? `${a} × ${b}` : '▢ × ▢'}
            value={product}
            target={TARGET_PRODUCT}
            ok={filled && productOk}
            active={filled}
          />
          <Condition
            label="add to"
            expression={filled ? `${a} + ${b}` : '▢ + ▢'}
            value={sum}
            target={TARGET_SUM}
            ok={filled && sumOk}
            active={filled}
          />

          <AnimatePresence>
            {filled && !solved && (
              <motion.p
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="pt-1 text-[0.95rem] leading-relaxed text-recalc-deep"
              >
                {productOk
                  ? 'The product works. That is the condition most people check — but the middle term needs the sum to work as well.'
                  : sumOk
                    ? 'The sum works, but the product does not. Both have to hold at once.'
                    : 'Neither condition holds yet. Try a different pair.'}
              </motion.p>
            )}
            {solved && (
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-1"
              >
                <p className="text-[0.98rem] leading-relaxed text-ink">
                  <strong className="font-semibold">Both conditions hold.</strong> Multiply it back out
                  and you get the expression you started with.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-paper-line pt-3">
                  <MathText size="sm" className="text-ink-muted">
                    (x + 3)(x + 4)
                  </MathText>
                  <span aria-hidden="true" className="text-ink-muted">
                    →
                  </span>
                  <MathText size="sm" className="text-ink-muted">
                    x² + 4x + 3x + 12
                  </MathText>
                  <span aria-hidden="true" className="text-ink-muted">
                    →
                  </span>
                  <MathText size="sm" className="text-route-deep">
                    x² + 7x + 12
                  </MathText>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Slot({ value, onClear, index }: { value: number | null; onClear: () => void; index: number }) {
  return (
    <button
      type="button"
      onClick={onClear}
      disabled={value === null}
      className={`mx-[0.12em] inline-flex h-[1.35em] min-w-[1.1em] items-center justify-center border-b-2 px-[0.14em] align-baseline transition-colors ${
        value === null ? 'border-recalc-deep/60 text-transparent' : 'border-ink text-ink'
      }`}
    >
      <span aria-hidden="true">{value ?? '0'}</span>
      <span className="sr-only">
        {value === null ? `Empty slot ${index}` : `Slot ${index} holds ${value}. Activate to clear it.`}
      </span>
    </button>
  );
}

function Condition({
  label,
  expression,
  value,
  target,
  ok,
  active,
}: {
  label: string;
  expression: string;
  value: number | null;
  target: number;
  ok: boolean;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-l-2 py-2.5 pl-4 transition-colors ${
        !active ? 'border-paper-line' : ok ? 'border-route-deep' : 'border-recalc-deep'
      }`}
    >
      <div className="min-w-0">
        <p className="t-label text-ink-muted">{label}</p>
        <p className="math mt-1 text-xl text-ink">
          {expression}
          <span className="op">=</span>
          <motion.span
            key={String(value)}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            className={!active ? 'text-ink-muted' : ok ? 'text-route-deep' : 'text-recalc-deep'}
          >
            {value ?? '?'}
          </motion.span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="math text-lg text-ink-muted">{target}</span>
        <span
          aria-hidden="true"
          className={`grid h-7 w-7 place-items-center border text-sm font-bold ${
            !active
              ? 'border-paper-line text-ink-muted/50'
              : ok
                ? 'border-route-deep bg-route-deep text-paper'
                : 'border-recalc-deep text-recalc-deep'
          }`}
        >
          {!active ? '·' : ok ? '✓' : '✗'}
        </span>
      </div>
      <span className="sr-only">
        {!active
          ? `${label} ${target}: nothing placed yet`
          : ok
            ? `${label} ${target}: satisfied`
            : `${label} ${target}: not satisfied, currently ${value}`}
      </span>
    </div>
  );
}
