'use client';

/* ==========================================================================
   The compounding gap.

   The problem is not "a learner missed a lesson". It is that the class line
   keeps going and every later topic quietly leans on the missed one, so the
   distance between the two lines grows without anyone deciding it should.

   Drawn rather than described: one line that continues, one that falls away,
   and dependency arcs from each later topic back to the same break.
   ========================================================================== */

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

const WEEKS = [
  { x: 90, label: 'Week 1', topic: 'Multiplying out brackets', note: 'Absent two days. Nothing dramatic.' },
  { x: 350, label: 'Week 4', topic: 'Factoring', note: 'Follows along, gets it wrong, can’t say why.' },
  { x: 610, label: 'Week 7', topic: 'Quadratic equations', note: 'Now two layers of the same missing step.' },
  { x: 850, label: 'Today', topic: 'Today’s lesson', note: 'Out of explanations that aren’t about themselves.' },
];

const CLASS_Y = 92;
const DRIFT = [0, 34, 76, 128];

export function CompoundingGap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduced = useReducedMotion();
  const show = inView || reduced;

  return (
    <div ref={ref} className="w-full">
      <svg
        viewBox="0 0 940 300"
        className="w-full"
        role="img"
        aria-label="A class timeline continues in a straight line from Week 1 to today, while one learner's line falls further below it after a missed lesson in Week 1. Arcs from Week 4, Week 7 and today all point back to the same missed lesson."
      >
        {/* the class, which does not wait */}
        <motion.line
          x1={40}
          y1={CLASS_Y}
          x2={900}
          y2={CLASS_Y}
          stroke="var(--color-route)"
          strokeWidth={2.5}
          initial={reduced ? false : { pathLength: 0 }}
          animate={show ? { pathLength: 1 } : {}}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
        <text x={40} y={CLASS_Y - 16} className="route-node-sub" fill="var(--color-route)">
          THE CLASS
        </text>

        {/* the learner, drifting */}
        <motion.path
          d={learnerPath()}
          fill="none"
          stroke="var(--color-recalc)"
          strokeWidth={2.5}
          strokeDasharray="1 0"
          initial={reduced ? false : { pathLength: 0 }}
          animate={show ? { pathLength: 1 } : {}}
          transition={{ duration: 1.3, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.text
          x={40}
          y={CLASS_Y + 40}
          className="route-node-sub"
          fill="var(--color-recalc)"
          initial={reduced ? false : { opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
        >
          ONE LEARNER
        </motion.text>

        {/* every later topic leaning on the same break */}
        {WEEKS.slice(1).map((w, i) => (
          <motion.path
            key={w.label}
            d={arc(w.x, CLASS_Y + DRIFT[i + 1], WEEKS[0].x, CLASS_Y + 6)}
            fill="none"
            stroke="var(--color-recalc)"
            strokeWidth={1.2}
            strokeDasharray="3 5"
            opacity={0.75}
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={show ? { pathLength: 1, opacity: 0.75 } : {}}
            transition={{ duration: 0.7, delay: 1.1 + i * 0.28, ease: 'easeOut' }}
          />
        ))}

        {/* markers */}
        {WEEKS.map((w, i) => {
          const y = CLASS_Y + DRIFT[i];
          const missed = i === 0;
          return (
            <motion.g
              key={w.label}
              initial={reduced ? false : { opacity: 0, y: -6 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.18, duration: 0.4 }}
            >
              <line
                x1={w.x}
                y1={CLASS_Y}
                x2={w.x}
                y2={y}
                stroke="var(--color-hairline)"
                strokeWidth={1}
              />
              <circle
                cx={w.x}
                cy={CLASS_Y}
                r={4.5}
                fill={missed ? 'var(--color-base)' : 'var(--color-route)'}
                stroke={missed ? 'var(--color-recalc)' : 'var(--color-route)'}
                strokeWidth={2}
              />
              {missed && (
                <>
                  <line
                    x1={w.x - 7}
                    y1={CLASS_Y - 7}
                    x2={w.x + 7}
                    y2={CLASS_Y + 7}
                    stroke="var(--color-recalc)"
                    strokeWidth={2}
                  />
                  <line
                    x1={w.x + 7}
                    y1={CLASS_Y - 7}
                    x2={w.x - 7}
                    y2={CLASS_Y + 7}
                    stroke="var(--color-recalc)"
                    strokeWidth={2}
                  />
                </>
              )}
              <circle cx={w.x} cy={y} r={3.5} fill="var(--color-recalc)" opacity={missed ? 0 : 1} />
              <text
                x={w.x}
                y={y + 26}
                textAnchor="middle"
                className="route-node-sub"
                fill={missed ? 'var(--color-recalc)' : 'var(--color-chalk-faint)'}
              >
                {w.label}
                {missed ? ' · MISSED' : ''}
              </text>
              <text
                x={w.x}
                y={y + 44}
                textAnchor="middle"
                className="route-node-label"
                fill="var(--color-chalk)"
              >
                {w.topic}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

function learnerPath() {
  let d = `M40,${CLASS_Y}`;
  WEEKS.forEach((w, i) => {
    const y = CLASS_Y + DRIFT[i];
    const prevX = i === 0 ? 40 : WEEKS[i - 1].x;
    const prevY = CLASS_Y + DRIFT[i === 0 ? 0 : i - 1];
    const mx = (prevX + w.x) / 2;
    d += ` C${mx},${prevY} ${mx},${y} ${w.x},${y}`;
  });
  d += ` L900,${CLASS_Y + DRIFT[DRIFT.length - 1]}`;
  return d;
}

function arc(x1: number, y1: number, x2: number, y2: number) {
  const lift = Math.min(120, Math.abs(x1 - x2) * 0.42);
  return `M${x1},${y1} C${x1 - lift},${y1 + 40} ${x2 + lift},${y2 + 70} ${x2},${y2}`;
}
