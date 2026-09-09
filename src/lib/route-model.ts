/* ==========================================================================
   The route model.

   A route is an ordered list of stops between where the learner is and where
   their class is. Depth is what makes it a *route* rather than a list: a stop
   at depth 1 dips below the spine and rejoins it, so prerequisite work reads
   as a detour that gets you back, not as a separate journey.

   Nothing here knows about React or SVG. Layout and drawing are downstream.
   ========================================================================== */

export type RouteStatus =
  | 'origin' /* you are here */
  | 'unknown' /* on the route because nothing rules it out yet */
  | 'checking' /* being looked at right now */
  | 'checked' /* demonstrated, kept, no work needed */
  | 'repair' /* named as the thing in the way */
  | 'repaired' /* a fresh answer proved it */
  | 'open' /* nothing is blocking this any more */
  | 'reached'; /* arrived */

export type RouteNode = {
  id: string;
  label: string;
  /** A shorter label used when the route is tight. */
  short?: string;
  /** A short lowercase qualifier under the label: "provisional", "kept to verify". */
  note?: string;
  status: RouteStatus;
  kind?: 'origin' | 'stop' | 'destination';
  /** 0 = on the spine. 1 = a detour below it. 2 = a detour under the detour. */
  depth?: number;
  /** Estimated minutes of work at this stop. Drives the route's time readout. */
  minutes?: number;
  /** The learner is working here now. */
  active?: boolean;
  /** Why this stop is on the route, in one sentence. Shown when it is selected. */
  why?: string;
};

export type RouteModel = {
  nodes: RouteNode[];
  /** A transient label pinned to one node, e.g. "Recalculating". */
  flag?: { nodeId: string; text: string; tone: 'route' | 'recalc' | 'now' } | null;
};

export const STATUS_META: Record<
  RouteStatus,
  { word: string; glyph: string; tone: 'route' | 'recalc' | 'now' | 'muted'; reason: string }
> = {
  origin: { word: 'Here', glyph: '', tone: 'now', reason: 'Where you are starting from today.' },
  unknown: {
    word: 'Ahead',
    glyph: '',
    tone: 'muted',
    reason: 'On the route because nothing has ruled it out yet.',
  },
  checking: {
    word: 'Checking',
    glyph: '',
    tone: 'recalc',
    reason: 'Being looked at right now.',
  },
  checked: { word: 'Kept', glyph: '✓', tone: 'route', reason: 'You showed this, so it stays yours.' },
  repair: {
    word: 'Repair',
    glyph: '',
    tone: 'recalc',
    reason: 'This is the step standing between you and the destination.',
  },
  repaired: {
    word: 'Repaired',
    glyph: '✓',
    tone: 'route',
    reason: 'A fresh question you could not answer before, answered.',
  },
  open: { word: 'Open', glyph: '', tone: 'route', reason: 'Nothing is blocking this now.' },
  reached: { word: 'Reached', glyph: '✓', tone: 'now', reason: 'You got back here.' },
};

export function routeMinutes(model: RouteModel): number {
  return model.nodes.reduce((sum, n) => {
    if (n.status === 'checked' || n.status === 'repaired' || n.status === 'reached') return sum;
    return sum + (n.minutes ?? 0);
  }, 0);
}

export function routeStops(model: RouteModel): number {
  return model.nodes.filter((n) => n.kind !== 'origin').length;
}

export function routeDone(model: RouteModel): number {
  return model.nodes.filter(
    (n) =>
      n.status === 'origin' ||
      n.status === 'checked' ||
      n.status === 'repaired' ||
      n.status === 'reached',
  ).length;
}
