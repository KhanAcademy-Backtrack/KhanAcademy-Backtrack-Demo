'use client';

/* ==========================================================================
   The area model — the repair for multiplying out brackets.

   The learner does the multiplication rather than watching it. Each region of
   the rectangle is a product they have to claim, and the two middle regions
   are the ones that usually go missing, so the interface makes their absence
   physical: the sum underneath is visibly incomplete until they are filled.

   The last beat is the one that matters for factoring: the two middle terms
   slide together and merge into one. That is the same "3 and 4 add to 7" fact
   the factoring step needs, arrived at forwards.
   ========================================================================== */

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { MathText } from './Math';

type Cell = { id: string; product: string; speak: string; row: 0 | 1; col: 0 | 1 };

const CELLS: Cell[] = [
  { id: 'xx', product: 'x²', speak: 'x squared', row: 0, col: 0 },
  { id: 'x4', product: '4x', speak: '4 x', row: 0, col: 1 },
  { id: '3x', product: '3x', speak: '3 x', row: 1, col: 0 },
  { id: '34', product: '12', speak: '12', row: 1, col: 1 },
];

const COLS = ['x', '+ 4'];
const ROWS = ['x', '+ 3'];

export function AreaModel({ onComplete }: { onComplete: (done: boolean) => void }) {
  const [open, setOpen] = useState<string[]>([]);
  const [combined, setCombined] = useState(false);
  const reduced = useReducedMotion();

  const all = open.length === CELLS.length;

  const terms = useMemo(() => {
    if (combined) {
      return [
        { key: 'xx', text: 'x²' },
        { key: 'mid', text: '+ 7x' },
        { key: '34', text: '+ 12' },
      ];
    }
    const list: { key: string; text: string }[] = [];
    for (const c of CELLS) {
      if (!open.includes(c.id)) continue;
      list.push({ key: c.id, text: list.length === 0 ? c.product : `+ ${c.product}` });
    }
    return list;
  }, [open, combined]);

  function toggle(id: string) {
    if (combined) return;
    setOpen((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      onComplete(false);
      return next;
    });
  }

  function combine() {
    setCombined(true);
    onComplete(true);
  }

  return (
    <div className="material-paper relative px-5 py-7 sm:px-10 sm:py-9">
      <p className="t-label text-ink-muted">Do the multiplication</p>
      <p className="mt-2 max-w-[52ch] text-[0.98rem] leading-relaxed text-ink-muted">
        Every term on the left has to meet every term on top. Claim each region of the rectangle —
        including the two that usually get skipped.
      </p>

      <div className="mt-7 flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-12">
        {/* the rectangle */}
        <div className="shrink-0">
          <div className="grid grid-cols-[auto_repeat(2,minmax(64px,86px))] gap-x-1">
            <div />
            {COLS.map((c) => (
              <div key={c} className="pb-2 text-center">
                <MathText size="md" className="text-ink">
                  {c}
                </MathText>
              </div>
            ))}

            {ROWS.map((rowLabel, r) => (
              <div key={rowLabel} className="contents">
                <div className="flex items-center pr-3">
                  <MathText size="md" className="text-ink">
                    {rowLabel}
                  </MathText>
                </div>
                {[0, 1].map((c) => {
                  const cell = CELLS.find((x) => x.row === r && x.col === c)!;
                  const isOpen = open.includes(cell.id);
                  return (
                    <button
                      key={cell.id}
                      type="button"
                      onClick={() => toggle(cell.id)}
                      aria-pressed={isOpen}
                      disabled={combined}
                      className={`relative flex h-[68px] items-center justify-center border transition-colors sm:h-[82px] ${
                        isOpen
                          ? 'border-route-deep bg-route-deep/12 text-ink'
                          : 'border-dashed border-paper-line bg-transparent text-ink-muted hover:border-ink hover:bg-ink/5'
                      }`}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isOpen ? (
                          <motion.span
                            key="p"
                            initial={reduced ? false : { opacity: 0, scale: 0.7, filter: 'blur(3px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <MathText size="md" speak={cell.speak}>
                              {cell.product}
                            </MathText>
                          </motion.span>
                        ) : (
                          <motion.span
                            key="q"
                            initial={false}
                            className="text-2xl text-ink-muted/60"
                            aria-hidden="true"
                          >
                            ?
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <span className="sr-only">
                        {isOpen ? `Claimed: ${cell.speak}` : `Reveal ${ROWS[r]} times ${COLS[c]}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* the running total */}
        <div className="min-w-0 flex-1">
          <p className="t-label text-ink-muted">Adds up to</p>
          <motion.div layout className="mt-3 flex flex-wrap items-baseline gap-x-1 gap-y-2">
            <AnimatePresence mode="popLayout" initial={false}>
              {terms.length === 0 && (
                <motion.span
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[1.4rem] text-ink-muted/70"
                >
                  nothing yet
                </motion.span>
              )}
              {terms.map((t) => (
                <motion.span
                  key={t.key}
                  layout
                  initial={reduced ? false : { opacity: 0, y: 10, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: 'blur(4px)' }}
                  transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                  className={t.key === 'mid' ? 'text-route-deep' : undefined}
                >
                  <MathText size="lg">{t.text}</MathText>
                </motion.span>
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="mt-6 min-h-[76px]">
            {!all && (
              <p className="max-w-[38ch] text-[0.95rem] leading-relaxed text-ink-muted">
                {open.length === 0
                  ? 'Four regions. Four products.'
                  : `${open.length} of 4 claimed. Two of these are the ones that go missing most often.`}
              </p>
            )}
            {all && !combined && (
              <div>
                <p className="max-w-[40ch] text-[0.95rem] leading-relaxed text-ink">
                  Two of those terms are the same kind of thing.{' '}
                  <MathText size="xs">4x</MathText> and <MathText size="xs">3x</MathText> can become one
                  term.
                </p>
                <button type="button" className="btn btn-on-paper mt-4" onClick={combine}>
                  Combine them
                </button>
              </div>
            )}
            {combined && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="max-w-[42ch] text-[0.98rem] leading-relaxed text-ink">
                  <strong className="font-semibold">That is the whole mechanism.</strong> The last number
                  is 3 × 4. The middle number is 3 + 4. Factoring is this run backwards — which is
                  exactly the step your route says is in the way.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
