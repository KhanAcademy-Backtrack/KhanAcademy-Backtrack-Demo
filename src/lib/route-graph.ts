/* ==========================================================================
   Route graph.

   A BACKTRACK route is a small prerequisite graph, not a queue. A goal can rest
   on two skills at once, and one foundation can hold up both of them, so the
   learner sees a map: the goal anchored at the top, the skills it rests on
   beneath it, and anything a missed check uncovers growing further down.

   Pure functions: a saved route in, nodes, edges and positions out. No DOM, no
   clock and no randomness, so the same route always draws the same picture and
   the tests can pin it. Text is measured with an average glyph width that errs
   wide, which leaves slack rather than letting a label run into a line; the
   page passes real heights once the text is on screen.
   ========================================================================== */

import { LABELS, ORDER, skillDependencies, type Attempt, type Recovery, type Skill } from './recovery.ts';

export type RouteNodeKind = 'checked' | 'active' | 'needs' | 'open';

export type RouteGraphNode = {
  id: Skill;
  label: string;
  status: string;
  kind: RouteNodeKind;
  destination: boolean;
  /** The skill the route moves to after this feedback. */
  next: boolean;
  /** Skills in this route that this one builds on, and the skills it is needed for. */
  needs: Skill[];
  neededFor: Skill[];
};

export type RouteGraphEdge = {
  from: Skill;
  to: Skill;
  /** No listed dependency joins these two; an answer pattern or a detour suggested the link. */
  inferred: boolean;
  /** Part of the way from where the learner is now up to the destination. */
  onRoute: boolean;
  /** The lower skill has already been checked. */
  checked: boolean;
};

export type RouteGraph = {
  nodes: RouteGraphNode[];
  edges: RouteGraphEdge[];
  destination: Skill;
  /** Steps still to check, not counting the destination. */
  remaining: number;
  /** Steps already checked, not counting the destination. */
  checked: number;
};

const serialOf = (e: Attempt) => Number(e.id.split(':').at(-1));

/** After a goal is reached the map rests, except while an extra "next step" question is open. */
const isLive = (s: Recovery) => !s.goalPassed || (s.extension && s.phase !== 'complete');

const isUpNext = (s: Recovery, id: Skill) =>
  (s.phase === 'feedback' || s.phase === 'moment') && s.next === 'check' && s.nextSkill !== s.active && id === s.nextSkill;

export function routeStatus(s: Recovery, id: Skill): string {
  const destination = s.destinationSkill ?? 'goal';
  return s.passed.includes(id) ? 'Checked'
    : id === s.active && isLive(s) ? (s.phase === 'setup' ? 'First check' : 'You’re here')
    : isUpNext(s, id) ? 'Up next'
    : id === destination ? 'Where you’re headed'
    : s.suspected.includes(id) ? 'Needs practice'
    : 'Check if you need this';
}

export function routeGraph(s: Recovery): RouteGraph {
  const destination = s.destinationSkill ?? 'goal';
  const deps = (id: Skill) => skillDependencies(id, s.topic);
  const live = isLive(s);
  const cycle = s.cycleStart ?? 0;

  /* Checked steps stay on the map, so progress is visible instead of vanishing,
     and that includes a detour the route never listed. Once the destination
     holds, only what was actually checked remains. */
  const listed: Skill[] = s.goalPassed ? s.planned.filter((x) => s.passed.includes(x)) : [...s.planned];
  const detours = s.passed.filter((x) => !listed.includes(x) && s.evidence.some((e) => e.skill === x && serialOf(e) >= cycle));
  listed.push(...detours);
  if (live && !listed.includes(s.active)) listed.unshift(s.active);
  const ids = [...new Set(listed.filter((x) => x !== destination)), destination];
  const inRoute = new Set(ids);

  const edges = new Map<string, { from: Skill; to: Skill; inferred: boolean }>();
  const link = (from: Skill, to: Skill, inferred: boolean) => {
    const key = `${from}>${to}`;
    if (from !== to && !edges.has(key)) edges.set(key, { from, to, inferred });
  };
  const reaches = (a: Skill, b: Skill) => {
    const seen = new Set<Skill>();
    const walk = (x: Skill): boolean => {
      if (x === b) return true;
      if (seen.has(x)) return false;
      seen.add(x);
      for (const e of edges.values()) if (e.from === x && walk(e.to)) return true;
      return false;
    };
    return walk(a);
  };

  /* A foundation that has left the route still joins what is under it to what
     is above it, so a chain never breaks into floating pieces. */
  const resolve = (d: Skill, seen: Set<Skill>): Skill[] => {
    if (inRoute.has(d)) return [d];
    if (seen.has(d)) return [];
    seen.add(d);
    return deps(d).flatMap((x) => resolve(x, seen));
  };
  for (const id of ids) for (const d of deps(id)) for (const from of resolve(d, new Set())) link(from, id, false);

  /* A step no listed dependency explains came from a wrong-turn clue or from a
     short routing check. The answer that raised it says which skill it serves;
     without one, it is drawn as support for the next step in the route. */
  const raisedBy = (id: Skill): Skill | undefined => {
    const clue = s.routeClue?.skill === id ? s.evidence.filter((e) => serialOf(e) === s.routeClue!.serial).at(-1) : undefined;
    const probe = [...s.evidence].reverse().find((e) => e.family === 'diagnostic' && e.skill !== id);
    return [clue?.skill, probe?.skill].find((x): x is Skill => !!x && x !== id && inRoute.has(x) && !reaches(x, id));
  };
  ids.forEach((id, i) => {
    if (id === destination || [...edges.values()].some((e) => e.from === id)) return;
    const to = raisedBy(id) ?? ids.slice(i + 1).find((t) => !reaches(t, id));
    if (to) link(id, to, true);
  });

  /* Anything still unable to reach the destination is not part of this route. */
  const kept = ids.filter((id) => reaches(id, destination));
  const keep = new Set(kept);
  const joined = [...edges.values()].filter((e) => keep.has(e.from) && keep.has(e.to));

  const ahead = new Set<Skill>();
  if (live && keep.has(s.active) && s.active !== destination) {
    const walk = (x: Skill) => {
      if (ahead.has(x)) return;
      ahead.add(x);
      for (const e of joined) if (e.from === x) walk(e.to);
    };
    walk(s.active);
  }

  const kind = (id: Skill): RouteNodeKind =>
    s.passed.includes(id) || (id === destination && s.goalPassed) ? 'checked'
    : id === s.active && live ? 'active'
    : id !== destination && s.suspected.includes(id) ? 'needs'
    : 'open';

  const nodes: RouteGraphNode[] = kept.map((id) => ({
    id,
    label: id === destination ? 'Today’s goal' : LABELS[id],
    status: routeStatus(s, id),
    kind: kind(id),
    destination: id === destination,
    next: kind(id) !== 'checked' && isUpNext(s, id),
    needs: joined.filter((e) => e.to === id).map((e) => e.from),
    neededFor: joined.filter((e) => e.from === id).map((e) => e.to),
  }));
  const checkedSet = new Set(nodes.filter((n) => n.kind === 'checked').map((n) => n.id));

  return {
    nodes,
    edges: joined.map((e) => ({ ...e, onRoute: ahead.has(e.from), checked: checkedSet.has(e.from) })),
    destination,
    remaining: nodes.filter((n) => !n.destination && n.kind !== 'checked').length,
    checked: nodes.filter((n) => !n.destination && n.kind === 'checked').length,
  };
}

/* --- placement ----------------------------------------------------------- */

export type PlacedNode = RouteGraphNode & {
  x: number;
  y: number;
  /** Circle radius. */
  r: number;
  /** Distance from the destination: the longest chain of "needed for" links. */
  rank: number;
  /** Row on screen. A rank too wide for the space wraps onto a second row. */
  row: number;
  /** Width available to the label and status text. */
  labelWidth: number;
  /** Top and bottom of the node's text block. */
  top: number;
  bottom: number;
};

export type PlacedEdge = RouteGraphEdge & { d: string };

export type RouteLayout = { width: number; height: number; nodes: PlacedNode[]; edges: PlacedEdge[] };

export const ROUTE_METRICS = {
  /** Room kept left of every circle centre for the "you're here" halo. */
  halo: 20,
  radius: { active: 14, destination: 13, node: 11 },
  /** Text starts this far right of the circle's edge. */
  gap: 10,
  /** The label block begins this far above the circle's centre, so its first line sits level with it. */
  lift: 15,
  /** Label and status line heights, the block's vertical padding, and average glyph widths that err wide. */
  labelLine: 19, statusLine: 16, pad: 6, labelGlyph: 7.7, statusGlyph: 7.1, space: 4,
  /** Clear height for the curve between one row's text and the next row's circles. */
  curve: 30,
  /** Lateral drift between rows of a single chain, so a chain reads as a path rather than a ruler. */
  drift: 16,
  /** The widest a route grows, however wide its container. */
  maxWidth: 520,
} as const;

const M = ROUTE_METRICS;

/** Greedy word wrap with an average glyph width. */
export function estimateLines(text: string, glyph: number, width: number): number {
  let lines = 1;
  let line = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const w = word.length * glyph;
    if (line > 0 && line + M.space + w > width) { lines++; line = w; }
    else line += (line > 0 ? M.space : 0) + w;
  }
  return lines;
}

const radiusOf = (n: RouteGraphNode) => n.kind === 'active' ? M.radius.active : n.destination ? M.radius.destination : M.radius.node;
const round = (v: number) => Math.round(v * 100) / 100;

function permutations<T>(xs: T[]): T[][] {
  if (xs.length <= 1) return [xs];
  return xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]));
}

/** `measured` holds the rendered height of each node's text block at this width, when the page has it.
 *  The estimate is only the first guess, so spacing follows the real font once it is on screen. */
export function layoutRoute(graph: RouteGraph, containerWidth: number, measured?: Partial<Record<Skill, number>>): RouteLayout {
  const width = Math.max(200, Math.round(containerWidth));
  const usable = Math.min(width, M.maxWidth);
  const left = Math.round((width - usable) / 2);
  const columns = usable >= 470 ? 3 : 2;
  /* Siblings keep the curriculum's own order, so nothing swaps sides when the current step moves. */
  const travel = new Map(graph.nodes.map((n) => [n.id, ORDER.indexOf(n.id)]));
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const up = (id: Skill) => graph.edges.filter((e) => e.from === id).map((e) => e.to);
  const down = (id: Skill) => graph.edges.filter((e) => e.to === id).map((e) => e.from);

  /* Rank: the destination is 0, and every skill sits one row below the lowest
     skill it is needed for. Every edge then points strictly upward, and a shared
     foundation sits beneath all of the skills it supports. */
  const rank = new Map<Skill, number>();
  const rankOf = (id: Skill, trail: Set<Skill> = new Set()): number => {
    const known = rank.get(id);
    if (known !== undefined) return known;
    if (trail.has(id)) return 0;
    trail.add(id);
    const above = up(id);
    const value = above.length ? 1 + Math.max(...above.map((x) => rankOf(x, trail))) : 0;
    trail.delete(id);
    rank.set(id, value);
    return value;
  };
  for (const n of graph.nodes) rankOf(n.id);

  /* Order each rank to cross as few lines as possible with the ranks above,
     trying every order (a rank holds at most a handful of skills). Ties keep
     the curriculum's order. */
  const deepest = Math.max(0, ...rank.values());
  const ranks: Skill[][] = Array.from({ length: deepest + 1 }, (_, r) =>
    graph.nodes.filter((n) => rank.get(n.id) === r).map((n) => n.id));
  const order = new Map<Skill, number>();
  for (const members of ranks) {
    const candidates = members.length <= 5 ? permutations(members) : [members];
    const crossings = (perm: Skill[]) => {
      let count = 0;
      const links = perm.flatMap((id, i) => up(id).map((to) => [i, order.get(to) ?? 0] as const));
      for (let a = 0; a < links.length; a++) for (let b = a + 1; b < links.length; b++) {
        if ((links[a][0] - links[b][0]) * (links[a][1] - links[b][1]) < 0) count++;
      }
      return count;
    };
    const keys = (perm: Skill[]) => perm.map((id) => travel.get(id) ?? 0);
    const before = (a: Skill[], b: Skill[]) => {
      const ca = crossings(a), cb = crossings(b);
      if (ca !== cb) return ca < cb;
      const ka = keys(a), kb = keys(b);
      const i = ka.findIndex((v, j) => v !== kb[j]);
      return i >= 0 && ka[i] < kb[i];
    };
    let best = candidates[0];
    for (const perm of candidates) if (before(perm, best)) best = perm;
    best.forEach((id, i) => order.set(id, members.length > 1 ? i / (members.length - 1) : 0.5));
    members.splice(0, members.length, ...best);
  }

  /* Rows: a rank wider than the space wraps, so labels never squeeze below a readable width. */
  const rows: Skill[][] = [];
  const rowOf = new Map<Skill, number>();
  for (const members of ranks) {
    for (let i = 0; i < members.length; i += columns) {
      const chunk = members.slice(i, i + columns);
      chunk.forEach((id) => rowOf.set(id, rows.length));
      rows.push(chunk);
    }
  }

  /* Horizontal position. A shared row splits the width into equal columns. A
     lone skill settles between the skills it connects to, the way a force
     layout would, but by averaging rather than simulating, so it never jitters. */
  const x = new Map<Skill, number>();
  const fixed = new Set<Skill>();
  const loneLabel = Math.min(220, usable - M.halo - M.radius.active - M.gap);
  const loneMax = left + usable - M.radius.node - M.gap - Math.min(loneLabel, 120);
  const loneHome = left + Math.max(M.halo, Math.round(usable / 2 - 70));
  for (const row of rows) {
    if (row.length > 1) {
      row.forEach((id, i) => { x.set(id, left + M.halo + (i * usable) / row.length); fixed.add(id); });
    } else x.set(row[0], loneHome);
  }
  for (let pass = 0; pass < 12; pass++) {
    for (const row of rows) {
      if (row.length > 1) continue;
      const id = row[0];
      const near = [...up(id), ...down(id)].map((n) => x.get(n)!).filter((v) => v !== undefined);
      if (near.length) x.set(id, near.reduce((a, b) => a + b, 0) / near.length);
    }
  }
  const lone = (id: Skill) => !fixed.has(id);
  for (const [r, row] of rows.entries()) {
    if (row.length !== 1) continue;
    const id = row[0];
    /* A chain drifts a little from side to side; a skill under a shared row stays beneath it. */
    const chain = r > 0 && rows[r - 1].length === 1 && up(id).every(lone) && down(id).every(lone);
    const base = x.get(id)!;
    x.set(id, Math.min(loneMax, Math.max(left + M.halo, base + (chain && r % 2 === 1 ? M.drift : 0))));
  }

  /* Vertical position, top-anchored: the destination never moves, and a newly
     found foundation adds a row underneath instead of pushing the goal away. */
  const placed = new Map<Skill, PlacedNode>();
  let cursor = 0;
  const stems: number[] = [];
  for (const [r, row] of rows.entries()) {
    /* Every row keeps room for the halo, so a row does not shift when the current step moves. */
    const y = cursor + M.halo;
    let stem = y;
    for (const [i, id] of row.entries()) {
      const n = byId.get(id)!;
      const radius = radiusOf(n);
      const cx = x.get(id)!;
      /* Text runs to just short of the next column's halo, or to the edge. */
      const labelWidth = row.length > 1
        ? Math.floor((i < row.length - 1 ? x.get(row[i + 1])! - M.halo - 4 : left + usable) - (cx + radius + M.gap))
        : Math.floor(Math.min(loneLabel, left + usable - cx - radius - M.gap));
      const text = Math.max(labelWidth - 4, 40);
      const height = measured?.[id] ?? M.pad * 2
        + estimateLines(n.label, M.labelGlyph, text) * M.labelLine
        + estimateLines(n.status, M.statusGlyph, text) * M.statusLine;
      const top = y - M.lift;
      const bottom = top + height;
      stem = Math.max(stem, bottom, y + radius);
      placed.set(id, {
        ...n, x: round(cx), y: round(y), r: radius, rank: rank.get(id)!, row: r,
        labelWidth, top: round(top), bottom: round(bottom),
      });
    }
    stems[r] = stem + 4;
    cursor = stems[r] + M.curve;
  }
  const height = Math.ceil(Math.max(...[...placed.values()].map((n) => Math.max(n.bottom, n.y + M.halo))) + 4);

  /* Each line leaves the top of the lower skill and joins the skill above at the
     foot of its text, then runs straight up into the circle. Ends are vertical,
     so siblings fan out from one stem and nothing needs an arrowhead. */
  const edges: PlacedEdge[] = graph.edges.map((e) => {
    const a = placed.get(e.from)!;
    const b = placed.get(e.to)!;
    const y0 = a.y - a.r;
    const foot = Math.min(stems[b.row], y0 - 8);
    const y1 = b.y + b.r;
    let d: string;
    if (Math.abs(a.x - b.x) < 0.5) d = `M${round(a.x)},${round(y0)} L${round(b.x)},${round(y1)}`;
    else {
      const mid = (y0 + foot) / 2;
      d = `M${round(a.x)},${round(y0)} C${round(a.x)},${round(mid)} ${round(b.x)},${round(mid)} ${round(b.x)},${round(foot)} L${round(b.x)},${round(y1)}`;
    }
    return { ...e, d };
  });

  /* Reading order: top to bottom, then left to right, so focus moves the way the eye does. */
  const reading = [...placed.values()].sort((a, b) => a.row - b.row || a.x - b.x);
  return { width, height, nodes: reading, edges };
}
