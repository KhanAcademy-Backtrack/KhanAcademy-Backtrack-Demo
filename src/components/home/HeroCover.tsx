'use client';

/* ==========================================================================
   The cover.

   The idea has to land before anyone reads a paragraph, so the route does the
   explaining: it draws itself toward today's equation, a check comes back
   uncertain, the path bends, and a prerequisite the learner never got is
   physically inserted underneath. Three seconds, no scroll lock.

   Then it hands over. One question, two answers, and the route responds to
   the visitor rather than to a timer, because a route that only ever plays a
   canned animation is a video, not a product.
   ========================================================================== */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RouteMap } from '@/components/route/RouteMap';
import { Atmosphere } from '@/components/site/Atmosphere';
import { MathText } from '@/components/math/Math';
import { routeMinutes, type RouteModel, type RouteNode } from '@/lib/route-model';

type Phase = 'draw' | 'checking' | 'inserted' | 'shortcut' | 'deeper';

const ORIGIN: RouteNode = {
  id: 'origin',
  kind: 'origin',
  label: 'You are here',
  status: 'origin',
  depth: 0,
  why: 'Stuck on the equation the class is doing right now.',
};

const DEST: RouteNode = {
  id: 'dest',
  kind: 'destination',
  label: 'Today’s equation',
  status: 'unknown',
  depth: 0,
  minutes: 3,
  why: 'Solving quadratics by factoring. The destination has not moved.',
};

function model(phase: Phase): RouteModel {
  const check: RouteNode = {
    id: 'check',
    label: 'Today’s check',
    status: phase === 'draw' ? 'unknown' : phase === 'shortcut' ? 'checked' : 'checking',
    depth: 0,
    minutes: 2,
    note: phase === 'draw' ? 'one question' : undefined,
    active: phase !== 'shortcut',
    why: 'One question at today’s level. It is the only thing that says where to look.',
  };

  const factor: RouteNode = {
    id: 'factor',
    label: 'Factoring x² + bx + c',
    status: 'repair',
    depth: 1,
    minutes: 6,
    note: 'the missing turn',
    why: 'Today’s lesson factors the equation before it solves it. This is the step it stands on.',
  };

  const distribute: RouteNode = {
    id: 'distribute',
    label: 'Multiplying out brackets',
    status: 'repair',
    depth: 2,
    minutes: 5,
    note: 'found underneath',
    why: 'Factoring is this run backwards. It turned out to be the thing actually in the way.',
  };

  switch (phase) {
    case 'draw':
      return { nodes: [ORIGIN, check, DEST], flag: null };
    case 'checking':
      return {
        nodes: [ORIGIN, check, DEST],
        flag: { nodeId: 'check', text: 'Checking', tone: 'recalc' },
      };
    case 'inserted':
      return {
        nodes: [ORIGIN, check, factor, DEST],
        flag: { nodeId: 'factor', text: 'Recalculating', tone: 'recalc' },
      };
    case 'shortcut':
      return {
        nodes: [ORIGIN, check, { ...DEST, status: 'open' }],
        flag: { nodeId: 'check', text: 'Kept', tone: 'route' },
      };
    case 'deeper':
      return {
        nodes: [ORIGIN, check, distribute, factor, DEST],
        flag: { nodeId: 'distribute', text: 'Recalculating', tone: 'recalc' },
      };
  }
}

export function HeroCover() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('draw');
  const [answered, setAnswered] = useState<'right' | 'wrong' | null>(null);
  const [selected, setSelected] = useState<RouteNode | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (reduced) {
      setPhase('inserted');
      return;
    }
    timers.current.push(window.setTimeout(() => setPhase('checking'), 2000));
    timers.current.push(window.setTimeout(() => setPhase('inserted'), 3900));
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, [reduced]);

  const current = useMemo(() => model(phase), [phase]);
  const minutes = routeMinutes(current);
  const recalculating = phase === 'checking' || phase === 'inserted' || phase === 'deeper';

  function answer(right: boolean) {
    setAnswered(right ? 'right' : 'wrong');
    setPhase(right ? 'shortcut' : 'deeper');
  }

  function replay() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setAnswered(null);
    setSelected(null);
    setPhase('draw');
    timers.current.push(window.setTimeout(() => setPhase('checking'), 1200));
    timers.current.push(window.setTimeout(() => setPhase('inserted'), 3100));
  }

  return (
    <section
      className="material-map relative flex min-h-[94svh] flex-col overflow-hidden border-b border-hairline"
      data-mood={phase === 'shortcut' ? 'clear' : phase === 'checking' || phase === 'deeper' ? 'recalc' : undefined}
    >
      {/* the map this route is drawn on: contours, other learners routes,
          abandoned branches, plotted points and fragments of the mathematics */}
      <Atmosphere variant="cover" />

      <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center gap-8 px-5 pb-10 pt-8 sm:px-8 sm:pt-10 lg:gap-10">
        {/* ---- the statement, and the way in ---------------------------- */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <p className="t-label text-chalk-faint">Today’s class · Algebra 1 · Quadratic equations</p>
            <h1 className="t-display mt-3 text-[2.5rem] leading-[0.98] sm:text-[3.4rem] lg:text-[4.2rem]">
              The shortest path back to
              <br className="hidden sm:block" /> where your class is{' '}
              <span className="text-route">now</span>.
            </h1>
            <p className="mt-5 max-w-[52ch] text-[1.05rem] leading-relaxed text-chalk-muted">
              School keeps moving forward even when students don’t. BACKTRACK finds the one turn a
              learner missed, routes the repair through Khan Academy, and puts them back on today’s
              lesson, without restarting the chapter.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/demo" className="btn btn-primary">
                Try the demo
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/how-it-works" className="btn btn-ghost">
                How it works
              </Link>
              <span className="t-label text-chalk-faint">90 seconds · no sign-in</span>
            </div>
          </div>

          {/* The destination is content, not decoration, so it is revealed with
              CSS and never waits for hydration. */}
          <div className="material-paper settle d1 w-full px-6 py-5 lg:max-w-[420px] lg:justify-self-end">
            <p className="t-label text-ink-muted">Where this learner is trying to get</p>
            <MathText size="lg" className="mt-2 block text-ink" as="div">
              x² + 7x + 12 = 0
            </MathText>
            <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-muted">
              The class moved on to this on Monday. It does not wait, and it does not move all
              session. Everything else on the route below is negotiable.
            </p>
          </div>
        </div>

        {/* ---- the route: the same object the demo runs on ------------- */}
        <div className="rise d2">
          <RouteMap
            model={current}
            variant="ribbon"
            compactAt={640}
            pointerReactive
            sweepKey={phase}
            onSelectNode={setSelected}
            selectedId={selected?.id ?? null}
          />
        </div>

        {/* ---- live readout --------------------------------------------- */}
        <div className="-mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hairline-soft pt-3">
          <span className="flex items-center gap-2 text-[0.8rem] font-semibold tracking-wide">
            <span
              className={`h-1.5 w-1.5 rounded-full ${recalculating ? 'bg-recalc' : 'bg-route'}`}
              aria-hidden="true"
            />
            <span className={recalculating ? 'text-recalc' : 'text-route'}>
              {recalculating ? 'Recalculating…' : 'Route live'}
            </span>
          </span>
          <span className="t-mono-num text-[0.8rem] text-chalk-muted">
            ≈ {minutes} min · {current.nodes.length - 1} stops
          </span>
          <span className="hidden text-[0.8rem] text-chalk-faint sm:inline">
            Select any stop to see why it is on the route.
          </span>
          {answered && (
            <button type="button" className="btn-quiet text-[0.8rem] text-chalk-faint" onClick={replay}>
              Replay
            </button>
          )}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-[70ch] overflow-hidden text-[0.9rem] leading-relaxed text-chalk-muted"
            >
              <span className="pt-2 block">
                <strong className="font-semibold text-chalk">{selected.label}.</strong> {selected.why}
              </span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* ---- the handover: the route responds to the visitor ---------- */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
          <p className="flex items-start gap-2 self-end text-[0.8rem] leading-relaxed text-chalk-faint">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-chalk-faint" aria-hidden="true" />
            Concept-stage prototype for the Khan Academy Education Impact Challenge 2026. No pilot,
            no partner school, no results.
          </p>

          <HeroQuestion answered={answered} onAnswer={answer} phase={phase} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

function HeroQuestion({
  answered,
  onAnswer,
  phase,
}: {
  answered: 'right' | 'wrong' | null;
  onAnswer: (right: boolean) => void;
  phase: Phase;
}) {
  const ready = phase !== 'draw' && phase !== 'checking';

  if (!ready) {
    return (
      <div className="lg:pt-2">
        <p className="t-label text-chalk-faint">Drawing the route…</p>
      </div>
    );
  }

  if (answered === null) {
    return (
      <div key="ask" className="rise border-l-2 border-recalc pl-5 lg:mt-2">
        <p className="t-label text-recalc">Your turn</p>
        <p className="mt-2 text-[1.05rem] leading-snug text-chalk">
          One question decides the route. Which is a valid first step?
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <ChoiceButton onClick={() => onAnswer(true)} text="(x + 3)(x + 4) = 0" />
          <ChoiceButton onClick={() => onAnswer(false)} text="(x + 6)(x + 2) = 0" />
        </div>
        <p className="mt-3 text-[0.8rem] text-chalk-faint">
          Nothing is recorded. The route above responds either way.
        </p>
      </div>
    );
  }

  const right = answered === 'right';
  return (
    <div
      key={answered}
      className={`rise border-l-2 pl-5 lg:mt-2 ${right ? 'border-route' : 'border-recalc'}`}
    >
      <p className={`t-label ${right ? 'text-route' : 'text-recalc'}`}>
        {right ? 'Shortcut found' : 'Recalculating'}
      </p>
      <p className="mt-2 max-w-[38ch] text-[1.05rem] leading-snug text-chalk">
        {right
          ? 'You showed the step, so the review left your route. One stop fewer, before you spent a minute on it.'
          : '6 × 2 = 12, but 6 + 2 = 8. The route just added the step underneath, and the destination did not move.'}
      </p>
      <p className="mt-3 max-w-[40ch] text-[0.9rem] leading-relaxed text-chalk-muted">
        {right
          ? 'The reward is not a badge. It is work you no longer have to do.'
          : 'No red screen, no restart, no “review the whole unit”. One named step, and a way back.'}
      </p>
      <Link href="/demo" className="btn btn-primary mt-5">
        Try the demo
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

function ChoiceButton({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[54px] items-center justify-between gap-4 border border-hairline px-4 text-left transition-colors hover:border-now hover:bg-now/8"
    >
      <MathText size="sm" className="text-chalk">
        {text}
      </MathText>
      <span
        aria-hidden="true"
        className="text-chalk-faint transition-colors group-hover:text-now"
      >
        →
      </span>
    </button>
  );
}

