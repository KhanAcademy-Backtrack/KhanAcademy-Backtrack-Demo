'use client';

/* ==========================================================================
   The demo shell.

   Owns three things and nothing else: the state machine, an undo timeline
   indexed by browser history depth, and local persistence. Everything the
   learner sees is derived from state, so the route on screen cannot drift
   away from what they actually did.

   The shell also carries the demo's motion policy. The cover is allowed to be
   cinematic because its job is to make someone care; in here the learner is
   working, so the environment quietens down while they are reading or
   answering and opens back up for the moments that are genuinely about the
   route changing. `data-focus` is what carries that: it is on for the screens
   where somebody is doing mathematics, off for the screens that are about
   what just happened.

   No account, no server, no learner record, and no generative call anywhere.
   ========================================================================== */

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Atmosphere } from '@/components/site/Atmosphere';
import { Icon } from '@/components/ui/Icon';
import { Anchor } from './Anchor';
import { Stage } from './Stage';
import {
  currentStopLabel,
  initialState,
  minutesLeft,
  reduce,
  routeFor,
  type Action,
  type DemoState,
  type Screen,
} from '@/lib/demo-machine';

const STORE = 'backtrack.demo.v3';

/* Screens where somebody is reading a question or working a widget. The map
   behind them steps back; it has nothing to say while they think. */
const FOCUS_SCREENS: Screen[] = [
  'check',
  'check_result',
  'contrast',
  'probe',
  'repair',
  'fresh_check',
  'destination',
  'next_turn_check',
  'comeback',
];

type Timeline = { steps: DemoState[]; pos: number };

export function DemoApp() {
  const [state, rawSend] = useReducer(reduce, undefined, initialState);
  /* Seeded with the reducer's own first state rather than a second copy of
     it. Two structurally identical objects are not the same object, so the
     timeline used to treat the very first render as a step: Back lit up on
     the opening screen and then went nowhere, which is worse than Back being
     unavailable. */
  const timeline = useRef<Timeline | null>(null);
  if (timeline.current === null) timeline.current = { steps: [state], pos: 0 };
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
          setRestored(parsed.screen !== 'session');
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
    const t = timeline.current!;
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
      const t = timeline.current!;
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
    if (window.scrollY > 4) window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
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

  const canGoBack = (timeline.current?.pos ?? 0) > 0;
  const focused = FOCUS_SCREENS.includes(state.screen);

  return (
    /* No overflow clipping on this element. `overflow: hidden` here made the
       shell the scrollport for everything sticky inside it, which quietly
       broke both of them: the orientation bar sat a header's height too low
       and then scrolled straight off the top of the screen, and the Back
       control at the bottom went with it. The learner lost sight of the goal
       and the route the moment they scrolled, which is the one thing this
       screen exists to prevent. The atmosphere clips itself. */
    <div
      className="material-map relative flex min-h-[calc(100dvh-4rem)] flex-col"
      data-mood={destState === 'solved' ? 'clear' : recalculating ? 'recalc' : undefined}
      data-focus={focused ? 'true' : undefined}
    >
      <Atmosphere variant="quiet" />
      {state.mode === 'guided' && (
        <p className="border-b border-recalc/40 bg-recalc/10 px-5 py-2 text-center text-[0.8rem] text-recalc sm:px-8">
          <strong className="font-semibold">Example learner.</strong> A fictional recovery path,
          shown as an illustration. Nothing here describes a real student.
        </p>
      )}

      <Anchor
        model={model}
        minutes={minutes}
        recalculating={recalculating}
        destState={destState}
        sweepKey={state.recalcs}
        currentStop={currentStopLabel(state)}
      />

      {restored && (
        <ResumeBanner onClear={() => send({ type: 'restart' })} onKeep={() => setRestored(false)} />
      )}

      {/* Screens swap rather than cross-fade. A "wait" transition would leave
          the stage blank if an exit animation ever failed to finish, and an
          empty screen in front of a judge is not worth the extra 200ms of
          polish. */}
      <div
        ref={stageRef}
        className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-5 py-10 sm:px-8 sm:py-14"
      >
        <div key={state.screen} className="rise">
          <Stage state={state} send={send} />
        </div>
      </div>

      {/* --- controls -------------------------------------------------- */}
      <div className="sticky bottom-0 z-20 mt-auto border-t border-hairline bg-base">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-2 sm:px-8">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={() => history.back()}
            className="t-label flex min-h-[40px] items-center gap-2 text-chalk-muted transition-colors hover:text-chalk disabled:opacity-35"
          >
            <Icon name="back" size={14} strokeWidth={2} />
            Back
          </button>

          <AboutThisDemo />

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
            className="t-label min-h-[40px] text-chalk-faint transition-colors hover:text-recalc"
          >
            Start over
          </button>
        </div>
      </div>

      <p ref={liveRef} className="sr-only" role="status" aria-live="polite" />
    </div>
  );
}

/**
 * Everything the demo is careful about, in one place instead of on every
 * screen. The old build repeated a disclaimer under nearly every question,
 * which meant a learner read several hundred words about what BACKTRACK does
 * not claim while trying to factor a quadratic. Nothing has been softened;
 * it has been moved to where somebody who wants it will look for it.
 */
function AboutThisDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="t-label min-h-[40px] text-chalk-faint transition-colors hover:text-route"
      >
        <span className="hidden sm:inline">What this demo does not claim</span>
        <span className="sm:hidden">About this demo</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 mb-3 w-[min(90vw,560px)] -translate-x-1/2 border border-hairline bg-base p-5 shadow-[0_-20px_60px_-20px_rgba(3,8,26,0.9)]">
          <p className="text-[0.88rem] leading-relaxed text-chalk-muted">
            This is product logic you can test in ninety seconds, not a result we are asking you to
            believe. No pilot has run, no school has committed, and no learning outcome has been
            measured. The mathematics is real; everything about impact is a proposal.
          </p>
          <p className="mt-3 text-[0.88rem] leading-relaxed text-chalk-muted">
            No sign-in, nothing recorded about you, nothing leaves your browser. The minute figures
            on the route are rough estimates for this example rather than measurements, and opening
            a Khan Academy link never marks a stop repaired: only a fresh answer here does.
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-quiet mt-4 text-[0.85rem] text-chalk-faint"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

function ResumeBanner({ onClear, onKeep }: { onClear: () => void; onKeep: () => void }) {
  return (
    <div className="border-b border-hairline bg-field">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 sm:px-8">
        <p className="text-[0.92rem] text-chalk">
          <strong className="font-semibold">Welcome back.</strong> Your route was where you left it.
          Nothing expired while you were away.
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
