'use client';

/* ==========================================================================
   The pieces every demo screen is built from.

   Three layers, on every screen, in the same places:
     · the anchor  — destination and route, quiet, always above
     · the work    — the current learning moment, loud, on paper
     · the reason  — one line saying why you are here, never more

   The mathematics is the interface, so the expression is always the largest
   thing on the screen and the chrome shrinks around it.
   ========================================================================== */

import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { MathText } from '@/components/math/Math';
import type { Choice, Question } from '@/lib/curriculum';

/** One line, top of every screen: why am I doing this? */
export function Why({ children, tone = 'route' }: { children: ReactNode; tone?: 'route' | 'recalc' }) {
  return (
    <p
      className={`max-w-[68ch] border-l-2 pl-4 text-[0.95rem] leading-relaxed text-chalk-muted sm:pl-5 ${
        tone === 'recalc' ? 'border-recalc' : 'border-route'
      }`}
    >
      {children}
    </p>
  );
}

export function Task({ q }: { q: Question }) {
  return (
    <div className="text-center">
      <MathText size="hero" as="div" className="block text-ink">
        {q.expression}
      </MathText>
      <h2 className="mt-6 text-[1.35rem] font-medium text-ink sm:text-[1.6rem]">{q.prompt}</h2>
      {q.note && (
        <p className="mx-auto mt-3 max-w-[54ch] text-[0.95rem] leading-relaxed text-ink-muted">
          {q.note}
        </p>
      )}
    </div>
  );
}

export function Choices({
  q,
  answered,
  onAnswer,
  exampleId,
}: {
  q: Question;
  answered?: string | null;
  onAnswer: (id: string) => void;
  exampleId?: string | null;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="mt-9 grid gap-2.5 sm:grid-cols-2" role="group" aria-label={q.prompt}>
      {q.choices.map((c, i) => {
        const isAnswer = answered === c.id;
        const state = !answered ? 'idle' : isAnswer ? (c.correct ? 'right' : c.unsure ? 'own' : 'wrong') : 'dim';
        return (
          <motion.button
            key={c.id}
            type="button"
            disabled={Boolean(answered)}
            onClick={() => onAnswer(c.id)}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: state === 'dim' ? 0.34 : 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.05 * i, duration: 0.3 }}
            className={`group relative flex min-h-[74px] items-center justify-between gap-4 border px-5 py-4 text-left transition-colors ${
              c.unsure ? 'sm:col-span-2' : ''
            } ${
              state === 'right'
                ? 'border-route-deep bg-route-deep/12'
                : state === 'wrong'
                  ? 'border-recalc-deep bg-recalc-deep/10'
                  : state === 'own'
                    ? 'border-ink bg-ink/5'
                    : 'border-paper-line hover:border-ink hover:bg-ink/5 disabled:hover:border-paper-line disabled:hover:bg-transparent'
            }`}
          >
            {c.unsure ? (
              <span className="text-[1.05rem] text-ink">{c.text}</span>
            ) : (
              <MathText size="sm" className="text-ink">
                {c.text}
              </MathText>
            )}

            {isAnswer && (
              <span
                className={`t-label shrink-0 ${
                  c.correct ? 'text-route-deep' : c.unsure ? 'text-ink-muted' : 'text-recalc-deep'
                }`}
              >
                {c.correct ? '✓ Correct' : c.unsure ? 'Your answer' : '✗ Not this one'}
              </span>
            )}

            {!answered && exampleId === c.id && (
              <span className="t-label shrink-0 text-recalc-deep">Example learner</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export function Verdict({
  tone,
  title,
  children,
  aside,
}: {
  tone: 'good' | 'warn' | 'info';
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div
      role="status"
      className={`mt-8 border-l-2 pl-5 ${
        tone === 'good' ? 'border-route-deep' : tone === 'warn' ? 'border-recalc-deep' : 'border-ink'
      }`}
    >
      <p
        className={`t-label ${
          tone === 'good' ? 'text-route-deep' : tone === 'warn' ? 'text-recalc-deep' : 'text-ink-muted'
        }`}
      >
        {title}
      </p>
      <p className="mt-2 max-w-[64ch] text-[1.02rem] leading-relaxed text-ink">{children}</p>
      {aside && <div className="mt-3 max-w-[64ch] text-[0.92rem] leading-relaxed text-ink-muted">{aside}</div>}
    </div>
  );
}

/** A named beat in the route's story. Lives on the map, not on paper. */
export function Moment({
  kind,
  label,
  line,
  sub,
  children,
}: {
  kind: 'shortcut' | 'gap' | 'capability' | 'reached';
  label: string;
  line: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const accent =
    kind === 'gap' ? 'text-recalc' : kind === 'capability' || kind === 'reached' ? 'text-now' : 'text-route';
  const border =
    kind === 'gap' ? 'border-recalc' : kind === 'capability' || kind === 'reached' ? 'border-now' : 'border-route';

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`border-l-2 pl-5 sm:pl-8 ${border}`}
    >
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`t-label ${accent}`}
      >
        {label}
      </motion.p>
      <motion.h2
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="t-display mt-3 max-w-[20ch] text-[2rem] leading-[1.03] sm:text-[2.9rem]"
      >
        {line}
      </motion.h2>
      {sub && (
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="mt-5 max-w-[58ch] text-[1.02rem] leading-relaxed text-chalk-muted"
        >
          {sub}
        </motion.p>
      )}
      {children && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.45 }}
          className="mt-7"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

export function Actions({
  items,
}: {
  items: ({ label: string; onClick: () => void; primary?: boolean } | null)[];
}) {
  return (
    <div className="mt-9 flex flex-wrap gap-3">
      {items.filter(Boolean).map((a) => (
        <button
          key={a!.label}
          type="button"
          onClick={a!.onClick}
          className={`btn ${a!.primary ? 'btn-primary' : 'btn-ghost'}`}
        >
          {a!.label}
          {a!.primary && <span aria-hidden="true">→</span>}
        </button>
      ))}
    </div>
  );
}

/** Work leaving the route, struck through as it goes. */
export function RemovedList({ items }: { items: string[] }) {
  const reduced = useReducedMotion();
  return (
    <div>
      <ul className="space-y-2">
        <AnimatePresence>
          {items.map((t, i) => (
            <motion.li
              key={t}
              initial={reduced ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.14 }}
              className="relative inline-flex items-center gap-3 text-[1rem] text-chalk-faint"
            >
              <span aria-hidden="true">−</span>
              <span className="relative">
                {t}
                <span
                  className="strike-line absolute left-0 top-1/2 h-px w-full bg-chalk-faint"
                  style={{ animationDelay: `${0.22 + i * 0.14}s` }}
                  aria-hidden="true"
                />
              </span>
              <span className="sr-only">removed from your route</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <p className="t-label mt-4 text-route">
        {items.length} {items.length === 1 ? 'review removed' : 'reviews removed'}
      </p>
    </div>
  );
}

export function PaperPlate({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`material-paper px-5 py-9 sm:px-10 sm:py-12 ${className}`}>{children}</div>
  );
}

export function HonestLine({ children }: { children: ReactNode }) {
  return (
    <p className="mt-10 max-w-[72ch] border-t border-hairline-soft pt-5 text-[0.85rem] leading-relaxed text-chalk-faint">
      {children}
    </p>
  );
}

export function SimBand({ children }: { children: ReactNode }) {
  return (
    <p className="mb-8 border border-recalc/50 bg-recalc/8 px-4 py-3 text-[0.88rem] leading-relaxed text-recalc">
      {children}
    </p>
  );
}

export function ChoiceWhy({ c }: { c: Choice }) {
  return <>{c.why}</>;
}
