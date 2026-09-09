'use client';

/* ==========================================================================
   One destination, thirty-two routes.

   The teacher surface is not a dashboard of individuals. It is the shape of
   the class: where routes bend, and therefore what to reteach to the room.
   Every stroke here is one synthetic learner heading to the same lesson.

   The numbers are invented. They exist to show the shape of the summary, and
   the component says so on its face.
   ========================================================================== */

import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const W = 940;
const SPINE = 54;

const BANDS = [
  { id: 'like_terms', label: 'Combining like terms', x: 300, y: 120, count: 4 },
  { id: 'distribute', label: 'Multiplying out brackets', x: 480, y: 168, count: 11 },
  { id: 'factor', label: 'Factoring x² + bx + c', x: 660, y: 216, count: 7 },
] as const;

const READY = 10;
const TOTAL = READY + BANDS.reduce((a, b) => a + b.count, 0);

/* A small deterministic generator, so the same class is drawn every render. */
function rand(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

type Learner = { id: number; band: (typeof BANDS)[number] | null; jitter: number };

export function ClassSpread() {
  const [hover, setHover] = useState<string | null>(null);
  const reduced = useReducedMotion();

  const learners = useMemo<Learner[]>(() => {
    const out: Learner[] = [];
    let id = 0;
    for (let i = 0; i < READY; i++) out.push({ id: id++, band: null, jitter: rand(id) });
    for (const b of BANDS) {
      for (let i = 0; i < b.count; i++) out.push({ id: id++, band: b, jitter: rand(id) });
    }
    return out;
  }, []);

  const height = 300;

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        className="w-full"
        role="img"
        aria-label={`Thirty-two synthetic learner routes to one lesson. ${READY} go straight through. ${BANDS.map((b) => `${b.count} bend at ${b.label}`).join('. ')}.`}
      >
        {learners.map((l, i) => {
          const dim = hover !== null && l.band?.id !== hover;
          return (
            <motion.path
              key={l.id}
              d={routeFor(l)}
              fill="none"
              stroke={l.band ? 'var(--color-recalc)' : 'var(--color-route)'}
              strokeWidth={1.15}
              strokeLinecap="round"
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: dim ? 0.1 : l.band ? 0.5 : 0.42 }}
              animate={{ opacity: dim ? 0.1 : l.band ? 0.5 : 0.42 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: reduced ? 0 : i * 0.02, ease: 'easeOut' }}
            />
          );
        })}

        {/* origin and destination */}
        <circle cx={40} cy={SPINE} r={6} fill="var(--color-now)" />
        <circle cx={40} cy={SPINE} r={2.6} fill="var(--color-base)" />
        <text x={40} y={SPINE - 16} className="route-node-sub" fill="var(--color-chalk-faint)">
          32 LEARNERS
        </text>
        <rect
          x={W - 48}
          y={SPINE - 8}
          width={16}
          height={16}
          rx={2}
          fill="var(--color-base)"
          stroke="var(--color-now)"
          strokeWidth={2.4}
        />
        <text
          x={W - 40}
          y={SPINE - 18}
          textAnchor="middle"
          className="route-node-sub"
          fill="var(--color-now)"
        >
          TODAY’S LESSON
        </text>

        {/* where the class bends */}
        {BANDS.map((b) => (
          <g
            key={b.id}
            onPointerEnter={() => setHover(b.id)}
            onPointerLeave={() => setHover(null)}
            className="cursor-default"
          >
            <rect x={b.x - 70} y={b.y - 26} width={230} height={52} fill="transparent" />
            <line
              x1={b.x - 62}
              y1={b.y}
              x2={b.x + 62}
              y2={b.y}
              stroke="var(--color-recalc)"
              strokeWidth={hover === b.id ? 3 : 2}
              opacity={0.9}
            />
            <text x={b.x + 74} y={b.y - 3} className="route-node-label" fill="var(--color-chalk)">
              {b.label}
            </text>
            <text x={b.x + 74} y={b.y + 13} className="route-node-sub" fill="var(--color-recalc)">
              {b.count} OF {TOTAL} BEND HERE
            </text>
          </g>
        ))}

        <text x={40} y={height - 14} className="route-node-sub" fill="var(--color-route)">
          {READY} OF {TOTAL} GO STRAIGHT THROUGH — NO REVIEW NEEDED
        </text>
      </svg>
      <figcaption className="mt-4 text-[0.85rem] leading-relaxed text-chalk-faint">
        <span className="mr-2 inline-block border border-recalc px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-recalc">
          Illustrative classroom
        </span>
        Synthetic figures, invented to show the shape of the summary a teacher would open. No class has
        used BACKTRACK and no real learner data exists.
      </figcaption>
    </figure>
  );
}

/* Coordinates are rounded so the server and the client agree exactly: Math.sin
   is allowed to differ in the last bits between engines, and React treats that
   as a hydration mismatch. */
const r2 = (n: number) => Math.round(n * 100) / 100;

function routeFor(l: Learner) {
  const j = r2((l.jitter - 0.5) * 7);
  const y0 = r2(SPINE + j);
  if (!l.band) {
    return `M40,${y0} C${W * 0.35},${r2(y0 - 4)} ${W * 0.65},${r2(y0 + 4)} ${W - 40},${SPINE}`;
  }
  const b = l.band;
  const dy = r2(b.y + j * 1.6);
  const inX = b.x - 62;
  const outX = b.x + 62;
  return [
    `M40,${y0}`,
    `C${(40 + inX) / 2},${y0} ${(40 + inX) / 2},${dy} ${inX},${dy}`,
    `L${outX},${dy}`,
    `C${(outX + W - 40) / 2},${dy} ${(outX + W - 40) / 2},${SPINE} ${W - 40},${SPINE}`,
  ].join(' ');
}
