'use client';

/* ==========================================================================
   The demo shell.

   Owns three things and nothing else: the state machine, an undo timeline
   indexed by browser history depth, and local persistence. Everything the
   learner sees is derived from state, so the route on screen cannot drift
   away from what they actually did.

   No account, no server, no learner record, and no generative call anywhere.
   ========================================================================== */

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Anchor } from './Anchor';
import { Stage } from './Stage';
import {
  initialState,
  minutesLeft,
  reduce,
  routeFor,
  type Action,
  type DemoState,
} from '@/lib/demo-machine';

const STORE = 'backtrack.demo.v2';

type Timeline = { steps: DemoState[]; pos: number };

export function DemoApp() {
  const [state, rawSend] = useReducer(reduce, undefined, initialState);
  const timeline = useRef<Timeline>({ steps: [initialState()], pos: 0 });
  const [, forceRender] = useState(0);
  const [restored, setRestored] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  /* --- restore ------------------------------------------------------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoState;
        if (parsed && parsed.screen) {
          rawSend({ type: 'restore', state: parsed });
          timeline.current = { steps: [parsed], pos: 0 };
          setRestored(parsed.screen !== 'mode');
        }
      }
    } catch {
      /* private mode, quota, or a browser that says no. Not important enough
         to interrupt anyone over. */
    }
    try {
      history.replaceState({ bt: 0 }, '');
    } catch {
      /* history is unavailable in some embedded contexts */
    }
  }, []);

  /* --- persist ------------------------------------------------------- */
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  /* --- timeline + history ------------------------------------------- */
  const send = useCallback((action: Action) => {
    rawSend(action);
  }, []);

  useEffect(() => {
    const t = timeline.current;
    const top = t.steps[t.pos];
    if (top === state) return;
    /* A new state that is not the one we just restored to becomes a step. */
    if (t.steps[t.pos]?.screen === state.screen && shallowSame(t.steps[t.pos], state)) return;
    t.steps = t.steps.slice(0, t.pos + 1).concat(state);
    t.pos = t.steps.length - 1;
    try {
      history.pushState({ bt: t.pos }, '');
    } catch {
      /* ignore */
    }
  }, [state]);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const t = timeline.current;
      let idx = e.state && typeof e.state.bt === 'number' ? e.state.bt : 0;
      if (idx >= t.steps.length) idx = t.steps.length - 1;
      if (idx < 0) idx = 0;
      t.pos = idx;
      rawSend({ type: 'restore', state: t.steps[idx] });
      forceRender((v) => v + 1);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /* --- focus + announce on screen change ----------------------------- */
  const prevScreen = useRef(state.screen);
  useEffect(() => {
    if (prevScreen.current === state.screen) return;
    prevScreen.current = state.screen;
    const h = stageRef.current?.querySelector('h1, h2');
    if (h instanceof HTMLElement) {
      h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
    }
    if (window.scrollY > 40) window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    if (liveRef.current) {
      const label = SCREEN_ANNOUNCE[state.screen] ?? '';
      liveRef.current.textContent = '';
      const id = window.setTimeout(() => {
        if (liveRef.current) liveRef.current.textContent = label;
      }, 60);
      return () => clearTimeout(id);
    }
  }, [state.screen, reduced]);

  const model = routeFor(state);
  const minutes = minutesLeft(state);
  const outstanding = state.gaps.some((g) => !state.repaired.includes(g));
  const destState: 'blocked' | 'open' | 'solved' = state.solvedDestination
    ? 'solved'
    : !outstanding && (state.evidence.find((e) => e.questionId === 'check')?.correct || state.repaired.length)
      ? 'open'
      : 'blocked';
  const recalculating =
    state.screen === 'probe' ||
    state.screen === 'contrast' ||
    state.screen === 'gap' ||
    state.screen === 'repair';

  const canGoBack = timeline.current.pos > 0;
  const showAnchor = state.screen !== 'mode';

  return (
    <div className="material-map min-h-[calc(100dvh-4rem)]">
      {state.mode === 'guided' && (
        <p className="border-b border-recalc/40 bg-recalc/10 px-5 py-2.5 text-center text-[0.82rem] text-recalc sm:px-8">
          <strong className="font-semibold">Example learner.</strong> A fictional recovery path, shown
          as an illustration. Nothing here describes a real student.
        </p>
      )}

      {showAnchor && (
        <Anchor
          model={model}
          minutes={minutes}
          recalculating={recalculating}
          destState={destState}
          sweepKey={state.recalcs}
        />
      )}

      {restored && state.screen !== 'mode' && (
        <ResumeBanner onClear={() => send({ type: 'restart' })} onKeep={() => setRestored(false)} />
      )}

      {/* Screens swap rather than cross-fade. A "wait" transition would leave
          the stage blank if an exit animation ever failed to finish, and an
          empty screen in front of a judge is not worth the extra 200ms of
          polish. */}
      <div ref={stageRef} className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16">
        <div key={state.screen} className="rise">
          <Stage state={state} send={send} />
        </div>
      </div>

      {/* --- controls -------------------------------------------------- */}
      <div className="sticky bottom-0 border-t border-hairline bg-base/94 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-2.5 sm:px-8">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={() => history.back()}
            className="t-label flex items-center gap-2 py-2 text-chalk-muted transition-colors hover:text-chalk disabled:opacity-35"
          >
            <span aria-hidden="true">←</span> Back
          </button>
          <p className="hidden text-[0.75rem] text-chalk-faint sm:block">
            No sign-in · nothing recorded about you · progress stays in this browser
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.removeItem(STORE);
              } catch {
                /* ignore */
              }
              send({ type: 'restart' });
            }}
            className="t-label py-2 text-chalk-faint transition-colors hover:text-recalc"
          >
            Clear progress
          </button>
        </div>
      </div>

      <p ref={liveRef} className="sr-only" role="status" aria-live="polite" />
    </div>
  );
}

function ResumeBanner({ onClear, onKeep }: { onClear: () => void; onKeep: () => void }) {
  return (
    <div className="border-b border-hairline bg-field">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 sm:px-8">
        <p className="text-[0.92rem] text-chalk">
          <strong className="font-semibold">Welcome back.</strong> Your route was where you left it —
          nothing expired while you were away.
        </p>
        <div className="flex gap-4">
          <button type="button" className="btn-quiet text-[0.85rem] text-route" onClick={onKeep}>
            Carry on
          </button>
          <button type="button" className="btn-quiet text-[0.85rem] text-chalk-faint" onClick={onClear}>
            Start again
          </button>
        </div>
      </div>
    </div>
  );
}

function shallowSame(a: DemoState, b: DemoState) {
  return a === b;
}

const SCREEN_ANNOUNCE: Partial<Record<DemoState['screen'], string>> = {
  session: 'How much time do you have today?',
  check: 'A check at today’s level.',
  check_result: 'Answer recorded. How confident were you?',
  shortcut: 'Shortcut found. Review removed from your route.',
  gap: 'Found the step in the way. Route recalculated.',
  probe: 'Checking one step earlier.',
  contrast: 'Checking a contrasting case.',
  repair: 'Repair this step, then a fresh question decides.',
  fresh_check: 'A fresh question.',
  capability: 'New capability unlocked. The destination is in reach.',
  destination: 'Today’s equation, fresh numbers.',
  solved: 'Back on track. Destination reached.',
  next_turn: 'One optional next turn.',
  comeback: 'Welcome back. One retrieval check.',
  end: 'End of the demo.',
};
