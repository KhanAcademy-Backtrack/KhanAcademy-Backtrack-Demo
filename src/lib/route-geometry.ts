/* ==========================================================================
   Route geometry.

   Pure functions: nodes in, points and path data out. No DOM, so the same code
   runs during layout measurement, during morphing, and in tests.

   Paths are built from cubic segments and resampled analytically rather than
   with getPointAtLength, which means two routes with different numbers of
   stops can be interpolated point-for-point. That is what lets the viewer
   watch a route recalculate instead of watching one picture replace another.
   ========================================================================== */

import type { RouteNode } from './route-model';

export type Pt = [number, number];

export type Placed = {
  node: RouteNode;
  x: number;
  y: number;
  /** Arc-length fraction of the whole route at this node, 0..1. */
  t: number;
};

export type LayoutOpts = {
  width: number;
  height: number;
  orientation: 'horizontal' | 'vertical';
  /** How far a depth-1 detour leaves the spine. */
  dip: number;
  padStart: number;
  padEnd: number;
  /** Distance of the spine from the top (horizontal) or left (vertical) edge. */
  spine: number;
};

/* --- placement ---------------------------------------------------------- */

export function placeNodes(nodes: RouteNode[], o: LayoutOpts): Placed[] {
  const n = nodes.length;
  if (n === 0) return [];

  /* Stops are spread by index rather than by estimated time: a two-minute
     check and a ten-minute repair are both one turn to take, and spacing them
     by duration made short stops unreadable. */
  const span = o.orientation === 'horizontal' ? o.width : o.height;
  const usable = Math.max(span - o.padStart - o.padEnd, 1);
  const step = n > 1 ? usable / (n - 1) : 0;

  return nodes.map((node, i) => {
    const along = o.padStart + step * i;
    const off = o.spine + (node.depth ?? 0) * o.dip;
    return {
      node,
      x: o.orientation === 'horizontal' ? along : off,
      y: o.orientation === 'horizontal' ? off : along,
      t: n > 1 ? i / (n - 1) : 0,
    };
  });
}

/* --- path construction --------------------------------------------------- */

type Cubic = { p0: Pt; p1: Pt; p2: Pt; p3: Pt };

/**
 * One continuous stroke through the points. The control handles are pulled
 * along the travel axis, so a detour leaves the spine and comes back with the
 * shape of an exit ramp rather than a zigzag.
 */
export function buildCubics(pts: Pt[], orientation: 'horizontal' | 'vertical'): Cubic[] {
  const out: Cubic[] = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (orientation === 'horizontal') {
      const mx = (a[0] + b[0]) / 2;
      out.push({ p0: a, p1: [mx, a[1]], p2: [mx, b[1]], p3: b });
    } else {
      const my = (a[1] + b[1]) / 2;
      out.push({ p0: a, p1: [a[0], my], p2: [b[0], my], p3: b });
    }
  }
  return out;
}

export function cubicsToPath(cs: Cubic[]): string {
  if (!cs.length) return '';
  let d = `M${r(cs[0].p0[0])},${r(cs[0].p0[1])}`;
  for (const c of cs) {
    d += ` C${r(c.p1[0])},${r(c.p1[1])} ${r(c.p2[0])},${r(c.p2[1])} ${r(c.p3[0])},${r(c.p3[1])}`;
  }
  return d;
}

function r(v: number) {
  return Math.round(v * 100) / 100;
}

function cubicAt(c: Cubic, t: number): Pt {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const cc = 3 * mt * t * t;
  const d = t * t * t;
  return [
    a * c.p0[0] + b * c.p1[0] + cc * c.p2[0] + d * c.p3[0],
    a * c.p0[1] + b * c.p1[1] + cc * c.p2[1] + d * c.p3[1],
  ];
}

/* --- arc-length resampling ---------------------------------------------- */

const SUB = 16; /* subdivisions per cubic when building the length table */

type LengthTable = { pts: Pt[]; cum: number[]; total: number };

function lengthTable(cs: Cubic[]): LengthTable {
  const pts: Pt[] = [];
  const cum: number[] = [];
  let total = 0;
  if (!cs.length) return { pts: [[0, 0]], cum: [0], total: 0 };

  pts.push(cs[0].p0);
  cum.push(0);
  for (const c of cs) {
    for (let i = 1; i <= SUB; i++) {
      const p = cubicAt(c, i / SUB);
      const prev = pts[pts.length - 1];
      total += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      pts.push(p);
      cum.push(total);
    }
  }
  return { pts, cum, total };
}

/** N points spaced evenly by arc length along the path. */
export function resample(cs: Cubic[], n: number): Pt[] {
  const { pts, cum, total } = lengthTable(cs);
  const out: Pt[] = [];
  if (total === 0) {
    for (let i = 0; i < n; i++) out.push(pts[0]);
    return out;
  }
  let j = 0;
  for (let i = 0; i < n; i++) {
    const target = (total * i) / (n - 1);
    while (j < cum.length - 2 && cum[j + 1] < target) j++;
    const segLen = cum[j + 1] - cum[j];
    const f = segLen > 0 ? (target - cum[j]) / segLen : 0;
    out.push([
      pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f,
      pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f,
    ]);
  }
  return out;
}

export function polylinePath(pts: Pt[]): string {
  if (!pts.length) return '';
  let d = `M${r(pts[0][0])},${r(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) d += ` L${r(pts[i][0])},${r(pts[i][1])}`;
  return d;
}

export function lerpPoints(a: Pt[], b: Pt[], t: number): Pt[] {
  const n = Math.min(a.length, b.length);
  const out: Pt[] = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = [a[i][0] + (b[i][0] - a[i][0]) * t, a[i][1] + (b[i][1] - a[i][1]) * t];
  }
  return out;
}

/** Total path length, used to drive stroke-dash progress. */
export function pathLength(cs: Cubic[]): number {
  return lengthTable(cs).total;
}

/** Arc-length fraction at each placed node, so progress can stop exactly on one. */
export function nodeFractions(cs: Cubic[]): number[] {
  if (!cs.length) return [0];
  const per = cs.map((c) => lengthTable([c]).total);
  const total = per.reduce((a, b) => a + b, 0);
  const out = [0];
  let acc = 0;
  for (const p of per) {
    acc += p;
    out.push(total > 0 ? acc / total : 0);
  }
  return out;
}

export const SAMPLES = 96;

/** Every hero state has the same path command count, allowing a real morph. */
export function heroRoutePath(answer: 'right' | 'gap' | null): string {
  const points: Pt[] = answer === 'right'
    ? [[64,60],[576,60],[612,60]]
    : [[64,60],[320,150],[576,60],[612,60]];
  return polylinePath(resample(buildCubics(points, 'horizontal'), SAMPLES));
}
