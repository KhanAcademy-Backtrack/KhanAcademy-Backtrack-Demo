'use client';

/* ==========================================================================
   The loop, told on the route itself.

   Six moves, and only one of them is teaching. Each move redraws the same
   route object the product uses, so the explanation and the product are
   literally the same drawing.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { RouteMap } from '@/components/route/RouteMap';
import type { RouteModel } from '@/lib/route-model';

const ORIGIN = {
  id: 'origin',
  kind: 'origin' as const,
  label: 'You are here',
  status: 'origin' as const,
  depth: 0,
};

const STEPS: {
  n: string;
  title: string;
  body: string;
  who: 'backtrack' | 'khan';
  model: RouteModel;
}[] = [
  {
    n: '01',
    title: 'Destination',
    body: 'Start from what you need now, today’s lesson, an upcoming topic, a course objective, or whatever a short video just caught you out on. Not a placement level, and not the start of the subject.',
    who: 'backtrack',
    model: {
      nodes: [
        ORIGIN,
        { id: 'dest', kind: 'destination', label: 'Today’s equation', status: 'unknown', depth: 0 },
      ],
      flag: { nodeId: 'dest', text: 'Where you need to be', tone: 'now' },
    },
  },
  {
    n: '02',
    title: 'Check',
    body: 'One short, honest check of what you can already do. Wrong answers are useful here. They are the only thing that says where to look. Nothing about it is graded.',
    who: 'backtrack',
    model: {
      nodes: [
        ORIGIN,
        { id: 'check', label: 'Today’s check', status: 'checking', depth: 0, minutes: 2 },
        { id: 'dest', kind: 'destination', label: 'Today’s equation', status: 'unknown', depth: 0 },
      ],
      flag: { nodeId: 'check', text: 'Checking', tone: 'recalc' },
    },
  },
  {
    n: '03',
    title: 'Route',
    body: 'Everything you demonstrate is kept and comes off the route. What is left is the prerequisite work that is genuinely load-bearing for this destination, usually far less than “review the whole unit”.',
    who: 'backtrack',
    model: {
      nodes: [
        ORIGIN,
        { id: 'check', label: 'Today’s check', status: 'checked', depth: 0 },
        {
          id: 'factor',
          label: 'Factoring x² + bx + c',
          status: 'repair',
          depth: 1,
          minutes: 6,
          note: 'the missing turn',
        },
        { id: 'dest', kind: 'destination', label: 'Today’s equation', status: 'unknown', depth: 0 },
      ],
      flag: { nodeId: 'factor', text: 'One named step', tone: 'recalc' },
    },
  },
  {
    n: '04',
    title: 'Learn on Khan Academy',
    body: 'The explanations, videos, worked examples and practice are Khan Academy’s. BACKTRACK does not reproduce them and is not trying to compete with them. Opening a resource is never recorded as learning.',
    who: 'khan',
    model: {
      nodes: [
        ORIGIN,
        { id: 'check', label: 'Today’s check', status: 'checked', depth: 0 },
        {
          id: 'factor',
          label: 'Factoring x² + bx + c',
          status: 'repair',
          depth: 1,
          minutes: 6,
          note: 'learning happens here',
          active: true,
        },
        { id: 'dest', kind: 'destination', label: 'Today’s equation', status: 'unknown', depth: 0 },
      ],
      flag: { nodeId: 'factor', text: 'Khan Academy', tone: 'route' },
    },
  },
  {
    n: '05',
    title: 'Prove',
    body: 'A fresh question, with different numbers, decides whether the step is repaired. Learn however you want: Khan Academy, a teacher, your notes, an AI tutor. The check is what counts.',
    who: 'backtrack',
    model: {
      nodes: [
        ORIGIN,
        { id: 'check', label: 'Today’s check', status: 'checked', depth: 0 },
        { id: 'factor', label: 'Factoring x² + bx + c', status: 'repaired', depth: 1 },
        { id: 'dest', kind: 'destination', label: 'Today’s equation', status: 'open', depth: 0 },
      ],
      flag: { nodeId: 'factor', text: 'Repaired', tone: 'route' },
    },
  },
  {
    n: '06',
    title: 'Recalculate',
    body: 'Then it keeps recalculating, if you improve, if you struggle, if you forget, if you disappear for two weeks, or if you turn out to know more than the route assumed.',
    who: 'backtrack',
    model: {
      nodes: [
        ORIGIN,
        { id: 'check', label: 'Today’s check', status: 'checked', depth: 0 },
        { id: 'factor', label: 'Factoring x² + bx + c', status: 'repaired', depth: 1 },
        { id: 'dest', kind: 'destination', label: 'Today’s equation', status: 'reached', depth: 0 },
        { id: 'next', label: 'Next lesson', status: 'unknown', depth: 0, minutes: 4, note: 'already ahead' },
      ],
      flag: { nodeId: 'next', text: 'Route continues', tone: 'now' },
    },
  },
];

export function LoopStepper() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (paused || !inView || reduced) return;
    const t = setTimeout(() => setI((v) => (v + 1) % STEPS.length), 5200);
    return () => clearTimeout(t);
  }, [i, paused, inView, reduced]);

  const step = STEPS[i];

  return (
    <div
      ref={ref}
      className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)] lg:gap-16"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
    >
      <ol className="flex flex-col">
        {STEPS.map((s, idx) => {
          const on = idx === i;
          return (
            <li key={s.n}>
              <button
                type="button"
                onClick={() => setI(idx)}
                aria-current={on ? 'step' : undefined}
                className="group relative flex w-full items-baseline gap-4 border-t border-hairline py-4 text-left"
              >
                <span
                  className={`t-label w-6 shrink-0 transition-colors ${on ? 'text-now' : 'text-chalk-faint'}`}
                >
                  {s.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-[1.15rem] font-medium transition-colors ${
                      on ? 'text-chalk' : 'text-chalk-muted group-hover:text-chalk'
                    }`}
                  >
                    {s.title}
                  </span>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.span
                        initial={reduced ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="block overflow-hidden"
                      >
                        <span className="block max-w-[46ch] pt-2 text-[0.95rem] leading-relaxed text-chalk-muted">
                          {s.body}
                        </span>
                        <span
                          className={`mt-3 inline-block text-[0.7rem] font-semibold uppercase tracking-[0.16em] ${
                            s.who === 'khan' ? 'text-route' : 'text-now'
                          }`}
                        >
                          {s.who === 'khan' ? 'Khan Academy · the learning' : 'BACKTRACK · the navigation'}
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                {on && !reduced && (
                  <motion.span
                    key={i}
                    className="absolute inset-x-0 top-0 h-px origin-left bg-now"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: paused ? 0.06 : 1 }}
                    transition={{ duration: paused ? 0.2 : 5.2, ease: 'linear' }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="border border-hairline bg-field/55 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="t-label text-chalk-faint">Same route, six moves</p>
            <p className="t-label text-chalk-faint">
              {step.n} / {STEPS[STEPS.length - 1].n}
            </p>
          </div>
          <RouteMap model={step.model} variant="inline" compactAt={520} sweepKey={i} className="mt-2" />
        </div>
        <p className="mt-4 text-[0.85rem] leading-relaxed text-chalk-faint">
          This is the same route component the demo runs on. Nothing here is a screenshot.
        </p>
      </div>
    </div>
  );
}
