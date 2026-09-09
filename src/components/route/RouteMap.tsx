'use client';

/* ==========================================================================
   RouteMap — BACKTRACK's signature object.

   The route is not a picture of a list. It is one continuous stroke through
   the stops between where a learner is and where their class is, and when the
   evidence changes the stroke is *morphed* rather than swapped: the old shape
   is resampled, the new shape is resampled, and the drawing walks from one to
   the other. The old route is left behind for a moment as a dashed ghost,
   which is what makes a recalculation legible instead of magical.
   ========================================================================== */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { RouteModel, RouteNode } from '@/lib/route-model';
import { STATUS_META } from '@/lib/route-model';
import {
  SAMPLES,
  buildCubics,
  cubicsToPath,
  lerpPoints,
  nodeFractions,
  placeNodes,
  polylinePath,
  resample,
  type Pt,
} from '@/lib/route-geometry';

type Variant = 'ribbon' | 'inline';

type Props = {
  model: RouteModel;
  variant?: Variant;
  /** Below this width the route stands up and runs vertically. */
  compactAt?: number;
  onSelectNode?: (node: RouteNode | null) => void;
  selectedId?: string | null;
  /** Subtle parallax + a light that follows the pointer. Cover only. */
  pointerReactive?: boolean;
  className?: string;
  /** Announce shape changes with a sweep along the stroke. */
  sweepKey?: string | number;
};

const GEOM = {
  ribbon: { spine: 50, dip: 74, padStart: 42, padEnd: 46, bottom: 74, nodeR: 7 },
  inline: { spine: 34, dip: 52, padStart: 28, padEnd: 30, bottom: 54, nodeR: 5.5 },
} as const;

const VGEOM = {
  ribbon: { spine: 26, dip: 44, padStart: 34, padEnd: 34, step: 78 },
  inline: { spine: 20, dip: 34, padStart: 26, padEnd: 26, step: 62 },
} as const;

function toneColor(tone: string) {
  switch (tone) {
    case 'route':
      return 'var(--color-route)';
    case 'recalc':
      return 'var(--color-recalc)';
    case 'now':
      return 'var(--color-now)';
    default:
      return 'var(--color-chalk-faint)';
  }
}

function wrap(text: string, max: number, lines = 2): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out.slice(0, lines);
}

export function RouteMap({
  model,
  variant = 'ribbon',
  compactAt = 720,
  onSelectNode,
  selectedId = null,
  pointerReactive = false,
  className = '',
  sweepKey,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  /* The route is drawn as a stack of strokes rather than one line: a shadow
     that gives it weight, the dashed road ahead, plotted ticks along it, a
     halo, the covered core, and a highlight that keeps travelling toward the
     destination. They all take the same path data. */
  const shadowRef = useRef<SVGPathElement>(null);
  const aheadRef = useRef<SVGPathElement>(null);
  const ticksRef = useRef<SVGPathElement>(null);
  const haloRef = useRef<SVGPathElement>(null);
  const doneRef = useRef<SVGPathElement>(null);
  const travelRef = useRef<SVGPathElement>(null);
  const ghostRef = useRef<SVGPathElement>(null);
  const rafRef = useRef(0);
  const prevPtsRef = useRef<Pt[] | null>(null);
  const prevProgressRef = useRef(0);

  const [width, setWidth] = useState(0);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const vertical = width > 0 && width < compactAt;
  const nodes = model.nodes;
  const maxDepth = useMemo(() => Math.max(0, ...nodes.map((n) => n.depth ?? 0)), [nodes]);

  /* --- layout ---------------------------------------------------------- */

  const { placed, height, viewW } = useMemo(() => {
    const w = Math.max(width, 240);
    if (vertical) {
      const g = VGEOM[variant];
      const h = g.padStart + g.padEnd + Math.max(nodes.length - 1, 0) * g.step;
      return {
        placed: placeNodes(nodes, {
          width: w,
          height: h,
          orientation: 'vertical' as const,
          dip: g.dip,
          padStart: g.padStart,
          padEnd: g.padEnd,
          spine: g.spine,
        }),
        height: h,
        viewW: w,
      };
    }
    const g = GEOM[variant];
    const h = g.spine + maxDepth * g.dip + g.bottom;
    return {
      placed: placeNodes(nodes, {
        width: w,
        height: h,
        orientation: 'horizontal' as const,
        dip: g.dip,
        padStart: g.padStart,
        padEnd: g.padEnd,
        spine: g.spine,
      }),
      height: h,
      viewW: w,
    };
  }, [nodes, width, vertical, variant, maxDepth]);

  const orientation = vertical ? ('vertical' as const) : ('horizontal' as const);

  const target = useMemo(() => {
    const pts: Pt[] = placed.map((p) => [p.x, p.y]);
    if (pts.length < 2) return { pts: [] as Pt[], cubics: [], fractions: [0] };
    const cubics = buildCubics(pts, orientation);
    return { pts: resample(cubics, SAMPLES), cubics, fractions: nodeFractions(cubics) };
  }, [placed, orientation]);

  /* Progress = how far along the route the learner has actually got. */
  const progress = useMemo(() => {
    let last = 0;
    placed.forEach((p, i) => {
      const s = p.node.status;
      if (s === 'origin' || s === 'checked' || s === 'repaired' || s === 'reached') last = i;
    });
    const active = placed.findIndex((p) => p.node.active);
    const idx = active > last ? active : last;
    return target.fractions[Math.min(idx, target.fractions.length - 1)] ?? 0;
  }, [placed, target.fractions]);

  /* --- morph ----------------------------------------------------------- */

  useEffect(() => {
    if (!target.pts.length) return;
    const layers = [
      shadowRef.current,
      aheadRef.current,
      ticksRef.current,
      haloRef.current,
      doneRef.current,
      travelRef.current,
    ];
    const done = doneRef.current;
    const halo = haloRef.current;
    const ghost = ghostRef.current;
    if (!done || !halo) return;

    const from = prevPtsRef.current;
    const to = target.pts;
    const fromP = prevProgressRef.current;
    const toP = progress;

    const apply = (pts: Pt[], p: number) => {
      const d = polylinePath(pts);
      for (const l of layers) l?.setAttribute('d', d);
      let len = 0;
      for (let i = 1; i < pts.length; i++) {
        len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      }
      /* The whole route is drawn dashed — "not yours yet" — and the covered
         part is painted solid over the top of it. */
      done.setAttribute('stroke-dasharray', `${len * p} ${len}`);
      halo.setAttribute('stroke-dasharray', `${len * p} ${len}`);
    };

    const sameShape =
      from && from.length === to.length && from.every((p, i) => p[0] === to[i][0] && p[1] === to[i][1]);

    if (!from || reduced || sameShape) {
      apply(to, toP);
    } else {
      /* The route it *was* stays on the map for a beat. Old routes do not
         vanish in real navigation either. */
      if (ghost) {
        ghost.setAttribute('d', polylinePath(from));
        ghost.style.opacity = '0.55';
        ghost.style.transition = 'opacity 900ms linear';
        requestAnimationFrame(() => {
          ghost.style.opacity = '0';
        });
      }
      const start = performance.now();
      const dur = 760;
      cancelAnimationFrame(rafRef.current);
      const tick = (now: number) => {
        const raw = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - raw, 4); /* easeOutQuart: fast commit, soft settle */
        apply(lerpPoints(from, to, e), fromP + (toP - fromP) * e);
        if (raw < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }

    prevPtsRef.current = to;
    prevProgressRef.current = toP;
    return () => cancelAnimationFrame(rafRef.current);
  }, [target.pts, progress, reduced]);

  /* --- recalculation sweep --------------------------------------------- */

  const [sweeping, setSweeping] = useState(false);
  const firstSweep = useRef(true);
  useEffect(() => {
    if (sweepKey === undefined || reduced) return;
    if (firstSweep.current) {
      firstSweep.current = false;
      return;
    }
    setSweeping(true);
    const t = setTimeout(() => setSweeping(false), 1100);
    return () => clearTimeout(t);
  }, [sweepKey, reduced]);

  /* --- pointer light ---------------------------------------------------- */

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pointerReactive || reduced) return;
      const r = hostRef.current?.getBoundingClientRect();
      if (!r) return;
      setPointer({ x: e.clientX - r.left, y: e.clientY - r.top });
    },
    [pointerReactive, reduced],
  );

  const parallax = pointer
    ? { x: (pointer.x / Math.max(viewW, 1) - 0.5) * 8, y: (pointer.y / Math.max(height, 1) - 0.5) * 5 }
    : { x: 0, y: 0 };

  const interactive = Boolean(onSelectNode);
  const g = vertical ? VGEOM[variant] : GEOM[variant];
  const nodeR = vertical ? (variant === 'ribbon' ? 6.5 : 5) : GEOM[variant].nodeR;
  const big = variant === 'ribbon';

  return (
    <div
      ref={hostRef}
      className={`relative w-full ${className}`}
      onPointerMove={onMove}
      onPointerLeave={() => setPointer(null)}
    >
      {width > 0 && (
        <svg
          className="route-svg"
          viewBox={`0 0 ${viewW} ${height}`}
          width={viewW}
          height={height}
          preserveAspectRatio="xMidYMid meet"
          role={interactive ? 'group' : 'presentation'}
          aria-label={interactive ? 'Your route. Select a stop to see why it is on the route.' : undefined}
          aria-hidden={interactive ? undefined : true}
        >
          <defs>
            <linearGradient id="rm-done" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-now)" />
              <stop offset="100%" stopColor="var(--color-route)" />
            </linearGradient>
            <radialGradient id="rm-light">
              <stop offset="0%" stopColor="var(--color-route)" stopOpacity="0.16" />
              <stop offset="100%" stopColor="var(--color-route)" stopOpacity="0" />
            </radialGradient>
            <filter id="rm-glow" x="-30%" y="-60%" width="160%" height="220%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <filter id="rm-soft" x="-30%" y="-60%" width="160%" height="220%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {pointerReactive && pointer && (
            <circle cx={pointer.x} cy={pointer.y} r={190} fill="url(#rm-light)" />
          )}

          <motion.g
            animate={{ x: parallax.x, y: parallax.y }}
            transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          >
            {/* the route it used to be */}
            <path ref={ghostRef} className="route-ghost" style={{ opacity: 0 }} />

            {/* weight: the route sits on the map rather than floating over it */}
            <path
              ref={shadowRef}
              className="route-stroke"
              stroke="rgba(3, 8, 26, 0.75)"
              strokeWidth={big ? 9 : 6}
              transform="translate(0, 5)"
              filter="url(#rm-soft)"
            />

            {/* the road ahead: dashed, because it is not yours yet */}
            <path
              ref={aheadRef}
              className="route-stroke"
              stroke="var(--color-chalk-faint)"
              strokeWidth={big ? 2.5 : 2}
              strokeDasharray="4 9"
              opacity={0.9}
            />

            {/* plotted ticks along the whole route, like survey marks */}
            <path
              ref={ticksRef}
              className="route-stroke"
              stroke="var(--color-chalk-faint)"
              strokeWidth={big ? 6 : 4.5}
              strokeDasharray="0.6 27"
              opacity={0.5}
            />

            {/* halo, then core: the covered part reads as lit */}
            <path
              ref={haloRef}
              className="route-stroke"
              stroke="var(--color-route)"
              strokeWidth={big ? 12 : 8}
              opacity={0.22}
              filter="url(#rm-glow)"
            />
            <path
              ref={doneRef}
              className="route-stroke"
              stroke="url(#rm-done)"
              strokeWidth={big ? 3.6 : 2.75}
            />

            {/* a signal that keeps travelling toward the destination */}
            <path
              ref={travelRef}
              className="route-stroke route-travel"
              stroke="var(--color-now)"
              strokeWidth={big ? 2.2 : 1.6}
              strokeDasharray="16 504"
              opacity={0.55}
            />

            {sweeping && (
              <motion.path
                d={polylinePath(target.pts)}
                className="route-stroke"
                stroke="var(--color-recalc)"
                strokeWidth={variant === 'ribbon' ? 5 : 3.5}
                strokeDasharray="26 4000"
                initial={{ strokeDashoffset: 4000, opacity: 0.9 }}
                animate={{ strokeDashoffset: -200, opacity: 0 }}
                transition={{ duration: 1.05, ease: 'easeInOut' }}
              />
            )}

            <AnimatePresence initial={false}>
              {placed.map((p) => (
                <Node
                  key={p.node.id}
                  node={p.node}
                  x={p.x}
                  y={p.y}
                  r={nodeR}
                  vertical={vertical}
                  variant={variant}
                  selected={selectedId === p.node.id}
                  flag={model.flag?.nodeId === p.node.id ? model.flag : null}
                  onSelect={onSelectNode}
                  reduced={Boolean(reduced)}
                  labelWidth={
                    vertical
                      ? viewW - (g.spine + maxDepth * g.dip) - 44
                      : (viewW - GEOM[variant].padStart - GEOM[variant].padEnd) /
                        Math.max(nodes.length - 1, 1)
                  }
                />
              ))}
            </AnimatePresence>
          </motion.g>
        </svg>
      )}

      {/* The same state, in words. The route survives a screen reader, a
          printout and a browser with images off. */}
      <ol className="sr-only">
        {nodes.map((n) => (
          <li key={n.id}>
            {n.label} — {STATUS_META[n.status].word}. {n.why ?? STATUS_META[n.status].reason}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

function Node({
  node,
  x,
  y,
  r,
  vertical,
  variant,
  selected,
  flag,
  onSelect,
  reduced,
  labelWidth,
}: {
  node: RouteNode;
  x: number;
  y: number;
  r: number;
  vertical: boolean;
  variant: Variant;
  selected: boolean;
  flag: RouteModel['flag'];
  onSelect?: (n: RouteNode | null) => void;
  reduced: boolean;
  labelWidth: number;
}) {
  const meta = STATUS_META[node.status];
  const color = toneColor(meta.tone);
  const isDest = node.kind === 'destination';
  const isOrigin = node.kind === 'origin';
  const solid =
    node.status === 'checked' ||
    node.status === 'repaired' ||
    node.status === 'reached' ||
    node.status === 'origin';

  /* Wrap against the space this stop actually has, so a five-stop route and a
     two-stop route both read cleanly instead of one of them breaking mid-term. */
  const maxChars = Math.max(10, Math.min(30, Math.floor(labelWidth / 6.4)));
  const labelLines = wrap(node.label, maxChars);
  const labelAnchor = vertical ? 'start' : 'middle';
  const lx = vertical ? r + 14 : 0;
  const ly = vertical ? -3 : r + 20;

  const interactive = Boolean(onSelect);

  return (
    <motion.g
      initial={reduced ? { x, y, opacity: 1, scale: 1 } : { x, y, opacity: 0, scale: 0.4 }}
      animate={{ x, y, opacity: 1, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.3 }}
      transition={{ type: 'spring', stiffness: 190, damping: 24, opacity: { duration: 0.28 } }}
      className={interactive ? 'route-hit' : undefined}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? `${node.label}. ${meta.word}. ${node.why ?? meta.reason}` : undefined}
      onClick={interactive ? () => onSelect?.(selected ? null : node) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect?.(selected ? null : node);
              }
            }
          : undefined
      }
    >
      <circle className="route-focus-ring" r={r + 12} fill="none" stroke="var(--color-now)" strokeWidth={2} opacity={0} />
      {interactive && <circle r={r + 14} fill="transparent" />}

      {node.active && !reduced && (
        <circle className="pulse-now" r={r + 4} fill="none" stroke={color} strokeWidth={2} />
      )}
      {node.active && <circle r={r + 8} fill="none" stroke={color} strokeWidth={1.5} opacity={0.55} />}
      {selected && <circle r={r + 11} fill="none" stroke="var(--color-now)" strokeWidth={1.5} />}

      {/* every stop sits in its own pool of light */}
      <circle r={r + 13} fill={color} opacity={node.status === 'unknown' ? 0.05 : 0.12} />

      {isDest ? (
        <g>
          {/* a destination marker, not a dot: a pin with a small pennant */}
          <path
            d={`M0,${r + 9} L0,${-r - 12}`}
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
            opacity={0.75}
          />
          <path
            d={`M0,${-r - 12} L${r + 9},${-r - 8} L0,${-r - 4} Z`}
            fill={color}
            opacity={solid ? 1 : 0.55}
          />
          <rect
            x={-r - 1.5}
            y={-r - 1.5}
            width={(r + 1.5) * 2}
            height={(r + 1.5) * 2}
            rx={2}
            fill={solid ? color : 'var(--color-base)'}
            stroke={color}
            strokeWidth={2.25}
          />
          {solid && (
            <path
              d="M-3.4,0 L-1,2.6 L3.6,-2.8"
              fill="none"
              stroke="var(--color-base)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>
      ) : (
        <circle
          r={r}
          fill={solid ? color : 'var(--color-base)'}
          stroke={color}
          strokeWidth={2.25}
          strokeDasharray={node.status === 'unknown' ? '2.6 3' : undefined}
        />
      )}
      {/* a repaired stop keeps a stamp: you did that, and it stays done */}
      {node.status === 'repaired' && (
        <circle r={r + 5} fill="none" stroke={color} strokeWidth={1.2} opacity={0.6} />
      )}
      {isOrigin && <circle r={r - 3.2} fill="var(--color-base)" />}

      <text
        className="route-node-sub"
        x={lx}
        y={vertical ? ly - 12 : -r - 12}
        textAnchor={labelAnchor}
        fill={color}
        opacity={node.status === 'unknown' ? 0.62 : 1}
      >
        {meta.glyph ? `${meta.glyph} ` : ''}
        {meta.word}
      </text>

      {labelLines.map((line, i) => (
        <text
          key={i}
          className="route-node-label"
          x={lx}
          y={ly + i * 13}
          textAnchor={labelAnchor}
          fill={node.status === 'unknown' ? 'var(--color-chalk-muted)' : 'var(--color-chalk)'}
        >
          {line}
        </text>
      ))}

      {node.note && variant === 'ribbon' && (
        <text
          className="route-node-sub"
          x={lx}
          y={ly + labelLines.length * 13 + 2}
          textAnchor={labelAnchor}
          fill="var(--color-chalk-faint)"
        >
          {node.note}
        </text>
      )}

      {flag && (
        <motion.g
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <rect
            x={vertical ? lx - 4 : -flagWidth(flag.text) / 2}
            y={vertical ? -r - 34 : -r - 46}
            width={flagWidth(flag.text)}
            height={20}
            rx={2}
            fill={toneColor(flag.tone)}
          />
          <text
            className="route-node-sub"
            x={vertical ? lx - 4 + flagWidth(flag.text) / 2 : 0}
            y={vertical ? -r - 20 : -r - 32}
            textAnchor="middle"
            fill="var(--color-base)"
          >
            {flag.text}
          </text>
        </motion.g>
      )}
    </motion.g>
  );
}

function flagWidth(text: string) {
  return Math.max(56, text.length * 6.4 + 18);
}
