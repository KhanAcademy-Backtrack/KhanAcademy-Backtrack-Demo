/* ==========================================================================
   The demo state machine.

   A pure reducer. Everything the screen shows is derived from this state, and
   the route drawing is derived from it too — which is why the route cannot
   drift out of sync with what the learner actually did.

   Undo is a list of snapshots indexed by browser history depth, so the in-page
   Back button, browser Back and browser Forward all agree.
   ========================================================================== */

import {
  BANK,
  DESTINATION,
  PREREQ_ORDER,
  SKILLS,
  checkRoots,
  stopsForBudget,
  type ConfidenceId,
  type SkillId,
} from './curriculum';
import type { RouteModel, RouteNode } from './route-model';

export type Screen =
  | 'mode'
  | 'session'
  | 'check'
  | 'check_result'
  | 'shortcut'
  | 'contrast'
  | 'probe'
  | 'probe_ok'
  | 'gap'
  | 'repair'
  | 'fresh_check'
  | 'capability'
  | 'destination'
  | 'solved'
  | 'next_turn'
  | 'next_turn_check'
  | 'next_turn_result'
  | 'comeback_offer'
  | 'comeback'
  | 'comeback_result'
  | 'stopped'
  | 'end';

export type Evidence = {
  questionId: string;
  answerId: string;
  correct: boolean;
  confidence: ConfidenceId | null;
  assisted: boolean;
};

export type DemoState = {
  mode: 'live' | 'guided' | null;
  screen: Screen;
  budget: number | null;
  baselineMinutes: number;
  evidence: Evidence[];
  answer: string | null;
  confidence: ConfidenceId | null;
  /** Provisional review stops taken off the route by evidence. */
  removed: SkillId[];
  keepToVerify: SkillId[];
  /** Named blockers, in route order (foundation first). */
  gaps: SkillId[];
  repaired: SkillId[];
  /** Which gap the repair screens are currently working on. */
  cursor: number;
  solvedDestination: boolean;
  nextTurnDone: boolean;
  comebackDone: boolean;
  assisted: boolean;
  lastCorrect: boolean | null;
  retry: { why: string; hint?: string } | null;
  solveError: string | null;
  showMethods: boolean;
  flag: RouteModel['flag'];
  /** Bumped whenever the route's shape changes, to trigger the sweep. */
  recalcs: number;
};

export function initialState(): DemoState {
  return {
    mode: null,
    screen: 'mode',
    budget: null,
    baselineMinutes: 0,
    evidence: [],
    answer: null,
    confidence: null,
    removed: [],
    keepToVerify: [],
    gaps: [],
    repaired: [],
    cursor: 0,
    solvedDestination: false,
    nextTurnDone: false,
    comebackDone: false,
    assisted: false,
    lastCorrect: null,
    retry: null,
    solveError: null,
    showMethods: false,
    flag: null,
    recalcs: 0,
  };
}

/* ======================================================================
   Route derivation
   ====================================================================== */

export function visibleStops(s: DemoState): SkillId[] {
  const budgeted = s.budget ? stopsForBudget(s.budget) : PREREQ_ORDER;
  const set = new Set<SkillId>([...budgeted, ...s.gaps, ...s.repaired, ...s.keepToVerify]);
  for (const r of s.removed) if (!s.gaps.includes(r) && !s.repaired.includes(r)) set.delete(r);
  return PREREQ_ORDER.filter((id) => set.has(id));
}

export function routeFor(s: DemoState): RouteModel {
  const nodes: RouteNode[] = [];

  nodes.push({
    id: 'origin',
    kind: 'origin',
    label: 'You are here',
    status: 'origin',
    depth: 0,
    why: 'Where today started: stuck on the equation your class is doing right now.',
  });

  if (s.screen !== 'mode' && s.screen !== 'session') {
    const answered = s.evidence.some((e) => e.questionId === 'check');
    const correct = s.evidence.find((e) => e.questionId === 'check')?.correct;
    nodes.push({
      id: 'check',
      label: 'Today’s check',
      status: !answered ? 'unknown' : correct || s.solvedDestination ? 'checked' : 'checking',
      depth: 0,
      minutes: 2,
      active: s.screen === 'check' || s.screen === 'check_result',
      note: !answered ? 'one question' : undefined,
      why: 'One question at today’s level. It is the only thing that tells BACKTRACK where to look.',
    });
  }

  const stops = visibleStops(s);
  const deepGap = s.gaps.length > 1 ? s.gaps[0] : null;

  for (const id of stops) {
    const skill = SKILLS[id];
    const isGap = s.gaps.includes(id);
    const isRepaired = s.repaired.includes(id);
    const kept = s.keepToVerify.includes(id);
    nodes.push({
      id,
      label: skill.label,
      short: skill.short,
      status: isRepaired ? 'repaired' : isGap ? 'repair' : kept ? 'unknown' : 'unknown',
      note: isRepaired ? undefined : isGap ? 'the missing turn' : kept ? 'kept to verify' : 'provisional',
      depth: id === deepGap ? 2 : 1,
      minutes: skill.minutes,
      active:
        (s.screen === 'repair' || s.screen === 'fresh_check' || s.screen === 'gap') &&
        s.gaps[s.cursor] === id,
      why: skill.why,
    } as RouteNode);
  }

  if (s.budget === 60 && !s.solvedDestination) {
    nodes.push({
      id: 'consolidate',
      label: 'Consolidate',
      status: 'unknown',
      note: 'time allows',
      depth: 1,
      minutes: 8,
      why: 'Only on the route because you said you had an hour. Extra practice so the repair holds next week.',
    });
  }

  const outstanding = s.gaps.some((g) => !s.repaired.includes(g));
  const checkCorrect = s.evidence.find((e) => e.questionId === 'check')?.correct;
  nodes.push({
    id: 'dest',
    kind: 'destination',
    label: 'Today’s equation',
    status: s.solvedDestination ? 'reached' : !outstanding && (checkCorrect || s.repaired.length) ? 'open' : 'unknown',
    depth: 0,
    minutes: 3,
    active: s.screen === 'destination',
    why: `${DESTINATION.lesson} — the destination has not moved all session.`,
  });

  return { nodes, flag: s.flag };
}

export function minutesLeft(s: DemoState): number {
  return routeFor(s).nodes.reduce((sum, n) => {
    if (n.status === 'checked' || n.status === 'repaired' || n.status === 'reached') return sum;
    return sum + (n.minutes ?? 0);
  }, 0);
}

export function minutesSaved(s: DemoState): number {
  return Math.max(0, s.baselineMinutes - minutesLeft(s));
}

/* ======================================================================
   Actions
   ====================================================================== */

export type Action =
  | { type: 'mode'; mode: 'live' | 'guided' }
  | { type: 'budget'; budget: number }
  | { type: 'answer'; qid: string; cid: string }
  | { type: 'confidence'; value: ConfidenceId }
  | { type: 'goto'; screen: Screen }
  | { type: 'continue' }
  | { type: 'assist' }
  | { type: 'solve'; raw: string }
  | { type: 'toggleMethods' }
  | { type: 'switchGuided' }
  | { type: 'restore'; state: DemoState }
  | { type: 'restart' };

export function reduce(prev: DemoState, action: Action): DemoState {
  const s: DemoState = { ...prev, retry: null, solveError: null };

  switch (action.type) {
    case 'mode':
      return { ...s, mode: action.mode, screen: 'session' };

    case 'budget': {
      const next = { ...s, budget: action.budget, flag: null };
      next.baselineMinutes = minutesLeft({ ...next, screen: 'check' });
      next.screen = 'check';
      next.recalcs = s.recalcs + 1;
      return next;
    }

    case 'answer':
      return answer(s, action.qid, action.cid);

    case 'confidence':
      return confidence(s, action.value);

    case 'goto': {
      const next = { ...s, screen: action.screen, showMethods: false };
      if (action.screen === 'repair') next.assisted = false;
      return next;
    }

    case 'continue': {
      const { screen, cursor } = afterCapability(s);
      return { ...s, screen, cursor, assisted: false, flag: null };
    }

    case 'assist':
      return { ...s, assisted: true, screen: 'repair' };

    case 'solve': {
      if (checkRoots(action.raw, DESTINATION.freshRoots)) {
        return {
          ...s,
          solvedDestination: true,
          screen: 'solved',
          flag: null,
          recalcs: s.recalcs + 1,
          evidence: [
            ...s.evidence,
            { questionId: 'destination', answerId: action.raw, correct: true, confidence: null, assisted: s.assisted },
          ],
        };
      }
      return {
        ...s,
        solveError: action.raw.trim()
          ? `Not ${action.raw.trim()}. Two numbers multiply to 20 and add to 9 — then each bracket is set to zero.`
          : 'Enter both values for x.',
      };
    }

    case 'toggleMethods':
      return { ...s, showMethods: !prev.showMethods };

    case 'switchGuided':
      return {
        ...initialState(),
        mode: 'guided',
        budget: s.budget,
        baselineMinutes: s.baselineMinutes,
        screen: 'check',
      };

    /* Used by the undo timeline and by restoring a saved session. The state
       is replayed wholesale rather than recomputed, so browser Back, browser
       Forward and the in-page Back button can never disagree. */
    case 'restore':
      return action.state;

    case 'restart':
      return initialState();

    default:
      return s;
  }
}

/* --- answering ---------------------------------------------------------- */

function record(s: DemoState, qid: string, cid: string, correct: boolean): Evidence[] {
  return [...s.evidence, { questionId: qid, answerId: cid, correct, confidence: null, assisted: s.assisted }];
}

function answer(s: DemoState, qid: string, cid: string): DemoState {
  const q = BANK[qid];
  const c = q.choices.find((x) => x.id === cid) ?? q.choices[0];
  const correct = Boolean(c.correct);

  if (qid === 'check') {
    return { ...s, answer: cid, evidence: record(s, qid, cid, correct), screen: 'check_result' };
  }

  if (qid === 'contrast') {
    const ev = record(s, qid, cid, correct);
    if (correct) {
      return {
        ...s,
        evidence: ev,
        screen: 'probe_ok',
        removed: PREREQ_ORDER.filter((p) => p !== 'factor'),
        flag: { nodeId: 'check', text: 'A slip, not a gap', tone: 'route' },
        recalcs: s.recalcs + 1,
      };
    }
    return openGap(s, ev, ['factor']);
  }

  if (qid === 'probe') {
    const ev = record(s, qid, cid, correct);
    if (correct) {
      /* The multiplication is intact, so the blocker is the factoring itself
         and nothing deeper gets added. */
      return openGap(s, ev, ['factor']);
    }
    /* This is the recalculation: a stop appears underneath the one we were
       already working on. */
    return openGap(s, ev, ['distribute', 'factor'], {
      nodeId: 'distribute',
      text: 'Recalculating',
      tone: 'recalc',
    });
  }

  if (qid === 'fresh_distribute' || qid === 'fresh_factor') {
    const skill: SkillId = qid === 'fresh_distribute' ? 'distribute' : 'factor';
    if (!correct) {
      return { ...s, retry: { why: c.why, hint: c.hint } };
    }
    const repaired = [...s.repaired, skill];
    return {
      ...s,
      evidence: record(s, qid, cid, true),
      repaired,
      screen: 'capability',
      flag: { nodeId: skill, text: 'Repaired', tone: 'route' },
      recalcs: s.recalcs + 1,
    };
  }

  if (qid === 'next_turn') {
    const ev = record(s, qid, cid, correct);
    return {
      ...s,
      evidence: ev,
      lastCorrect: correct,
      nextTurnDone: correct,
      keepToVerify: correct ? [] : s.keepToVerify,
      removed: correct ? Array.from(new Set([...s.removed, ...s.keepToVerify])) : s.removed,
      screen: 'next_turn_result',
      recalcs: s.recalcs + 1,
      flag: null,
    };
  }

  if (qid === 'comeback') {
    const ev = record(s, qid, cid, correct);
    if (correct) {
      return { ...s, evidence: ev, lastCorrect: true, comebackDone: true, screen: 'comeback_result' };
    }
    /* Forgetting is a routing problem, not a character flaw: the stop comes
       back, nothing else is taken away. */
    return {
      ...s,
      evidence: ev,
      lastCorrect: false,
      comebackDone: true,
      repaired: s.repaired.filter((r) => r !== 'factor'),
      gaps: Array.from(new Set([...s.gaps, 'factor'])) as SkillId[],
      screen: 'comeback_result',
      flag: { nodeId: 'factor', text: 'Re-opened', tone: 'recalc' },
      recalcs: s.recalcs + 1,
    };
  }

  return s;
}

function openGap(
  s: DemoState,
  evidence: Evidence[],
  gaps: SkillId[],
  flag?: RouteModel['flag'],
): DemoState {
  return {
    ...s,
    evidence,
    gaps,
    cursor: 0,
    removed: PREREQ_ORDER.filter((p) => !gaps.includes(p)),
    keepToVerify: [],
    screen: 'gap',
    flag: flag ?? { nodeId: gaps[0], text: 'The missing turn', tone: 'recalc' },
    recalcs: s.recalcs + 1,
  };
}

/* --- self-report -------------------------------------------------------- */

/**
 * Confidence never decides whether an answer was right. It decides what gets
 * checked next — which is the difference between a route built on evidence and
 * a route built on a guess.
 */
function confidence(s: DemoState, value: ConfidenceId): DemoState {
  const ev = s.evidence.find((e) => e.questionId === 'check');
  const evidence = s.evidence.map((e) => (e.questionId === 'check' ? { ...e, confidence: value } : e));
  const correct = Boolean(ev?.correct);
  const unsure = s.answer === 'unsure';
  const base = { ...s, evidence, confidence: value, recalcs: s.recalcs + 1 };

  if (correct) {
    if (value === 'confident') {
      return {
        ...base,
        removed: [...PREREQ_ORDER],
        keepToVerify: [],
        screen: 'shortcut',
        flag: { nodeId: 'check', text: 'Kept', tone: 'route' },
      };
    }
    if (value === 'remember') {
      return {
        ...base,
        removed: PREREQ_ORDER.filter((p) => p !== 'factor'),
        keepToVerify: ['factor'],
        screen: 'shortcut',
        flag: { nodeId: 'factor', text: 'Kept to verify', tone: 'route' },
      };
    }
    return {
      ...base,
      removed: [],
      keepToVerify: [...PREREQ_ORDER],
      screen: 'shortcut',
      flag: null,
    };
  }

  if (value === 'never') {
    /* Nobody should have to prove, over ten questions, a thing they have just
       told you they were never taught. */
    return openGap(base, evidence, unsure ? ['distribute', 'factor'] : ['factor'], {
      nodeId: unsure ? 'distribute' : 'factor',
      text: 'Never taught',
      tone: 'recalc',
    });
  }

  if (value === 'confident' && !unsure) {
    return {
      ...base,
      screen: 'contrast',
      flag: { nodeId: 'check', text: 'Possible misconception', tone: 'recalc' },
    };
  }

  return {
    ...base,
    screen: 'probe',
    flag: { nodeId: 'check', text: 'Checking one step earlier', tone: 'recalc' },
  };
}

/* --- flow helpers ------------------------------------------------------- */

/** After a capability unlocks: another gap to repair, or the destination. */
export function afterCapability(s: DemoState): { screen: Screen; cursor: number } {
  const next = s.gaps.findIndex((g) => !s.repaired.includes(g));
  if (next >= 0) return { screen: 'repair', cursor: next };
  return { screen: 'destination', cursor: s.cursor };
}

export function currentGap(s: DemoState): SkillId | null {
  return s.gaps[s.cursor] ?? null;
}

export function freshQuestionId(skill: SkillId): string {
  return skill === 'distribute' ? 'fresh_distribute' : 'fresh_factor';
}
