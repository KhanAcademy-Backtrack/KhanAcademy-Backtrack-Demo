'use client';

/* ==========================================================================
   The compounding gap.

   The problem is not "a learner missed a lesson". It is that the class line
   keeps going, every later topic quietly leans on the missed one, and the
   distance between the two lines grows without anyone deciding it should.

   Reading order is deliberate: the class and its topics along the top, the
   learner falling away underneath, thin ties showing where each week sits,
   and, underneath everything so they never tangle with the two lines, the
   dependency arcs, all pointing back at the same missed step.
   ========================================================================== */

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

const W = 960;
const H = 372;
const CLASS_Y = 88;

const WEEKS = [
  { x: 96, label: 'Week 1', topic: 'Multiplying out brackets', drift: 0 },
  { x: 356, label: 'Week 4', topic: 'Factoring', drift: 56 },
  { x: 616, label: 'Week 7', topic: 'Quadratic equations', drift: 116 },
  { x: 862, label: 'Today', topic: 'Today’s lesson', drift: 178 },
];

export function CompoundingGap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();
  const show = inView || reduced;

  const missed = WEEKS[0];
  const last = WEEKS[WEEKS.length - 1];

  return (
    <div ref={ref} className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="A class timeline runs straight from Week 1 to today, through multiplying out brackets, factoring and quadratic equations. One learner missed Week 1, and their line falls further below the class line at every later topic. Arcs from Week 4, Week 7 and today all point back to the same missed lesson."
      >
        <defs>
          <marker id="cg-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="var(--color-chalk-faint)" />
          </marker>
        </defs>

        {/* --- layer 1: the dependency arcs, underneath everything else --- */}
        <g opacity={0.55}>
          {WEEKS.slice(1).map((w, i) => (
            <motion.path
              key={w.label}
              d={dependency(w.x, CLASS_Y + w.drift, missed.x, CLASS_Y + 26)}
              fill="none"
              stroke="var(--color-chalk-faint)"
              strokeWidth={1.1}
              strokeDasharray="4 6"
              markerEnd="url(#cg-arrow)"
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              animate={show ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 1.15 + i * 0.3, ease: 'easeOut' }}
            />
          ))}
        </g>
        <motion.text
          x={missed.x + 18}
          y={H - 16}
          className="route-node-sub"
          fill="var(--color-chalk-faint)"
          initial={reduced ? false : { opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
        >
          EVERY LATER TOPIC LEANS ON THE SAME MISSED STEP
        </motion.text>

        {/* --- layer 2: ties from each week down to the learner ---------- */}
        {WEEKS.map((w, i) => (
          <motion.line
            key={w.label}
            x1={w.x}
            y1={CLASS_Y}
            x2={w.x}
            y2={CLASS_Y + w.drift}
            stroke="var(--color-hairline)"
            strokeWidth={1}
            initial={reduced ? false : { opacity: 0 }}
            animate={show ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 + i * 0.12 }}
          />
        ))}

        {/* --- layer 3: the class, which does not wait -------------------- */}
        <motion.line
          x1={40}
          y1={CLASS_Y}
          x2={W - 40}
          y2={CLASS_Y}
          stroke="var(--color-route)"
          strokeWidth={2.5}
          initial={reduced ? false : { pathLength: 0 }}
          animate={show ? { pathLength: 1 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
        <text x={40} y={CLASS_Y - 60} className="route-node-sub" fill="var(--color-route)">
          THE CLASS
        </text>

        {/* topics belong to the class, so they are labelled above its line */}
        {WEEKS.map((w, i) => (
          <motion.g
            key={w.label}
            initial={reduced ? false : { opacity: 0, y: -6 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25 + i * 0.14, duration: 0.4 }}
          >
            <text
              x={w.x}
              y={CLASS_Y - 38}
              textAnchor="middle"
              className="route-node-sub"
              fill={i === 0 ? 'var(--color-recalc)' : 'var(--color-chalk-faint)'}
            >
              {w.label}
              {i === 0 ? ' · MISSED' : ''}
            </text>
            <text
              x={w.x}
              y={CLASS_Y - 20}
              textAnchor="middle"
              className="route-node-label"
              fill="var(--color-chalk)"
            >
              {w.topic}
            </text>
            {i === 0 ? (
              <g>
                <circle cx={w.x} cy={CLASS_Y} r={7} fill="var(--color-base)" stroke="var(--color-recalc)" strokeWidth={2} />
                <path
                  d={`M${w.x - 3.4},${CLASS_Y - 3.4} L${w.x + 3.4},${CLASS_Y + 3.4} M${w.x + 3.4},${CLASS_Y - 3.4} L${w.x - 3.4},${CLASS_Y + 3.4}`}
                  stroke="var(--color-recalc)"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                />
              </g>
            ) : (
              <circle cx={w.x} cy={CLASS_Y} r={5} fill="var(--color-route)" />
            )}
          </motion.g>
        ))}

        {/* --- layer 4: one learner, drifting ----------------------------- */}
        <motion.path
          d={learnerPath()}
          fill="none"
          stroke="var(--color-recalc)"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={show ? { pathLength: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
        {WEEKS.slice(1).map((w, i) => (
          <motion.circle
            key={w.label}
            cx={w.x}
            cy={CLASS_Y + w.drift}
            r={4.5}
            fill="var(--color-recalc)"
            initial={reduced ? false : { opacity: 0 }}
            animate={show ? { opacity: 1 } : {}}
            transition={{ delay: 0.7 + i * 0.16 }}
          />
        ))}
        <motion.text
          x={W - 40}
          y={CLASS_Y + last.drift + 26}
          textAnchor="end"
          className="route-node-sub"
          fill="var(--color-recalc)"
          initial={reduced ? false : { opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ delay: 1.1 }}
        >
          ONE LEARNER
        </motion.text>

        {/* --- the gap itself, measured ---------------------------------- */}
        <motion.g
          initial={reduced ? false : { opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ delay: 1.5 }}
        >
          <line
            x1={W - 62}
            y1={CLASS_Y + 6}
            x2={W - 62}
            y2={CLASS_Y + last.drift - 6}
            stroke="var(--color-chalk-muted)"
            strokeWidth={1}
            markerEnd="url(#cg-arrow)"
          />
          <text
            x={W - 70}
            y={CLASS_Y + last.drift / 2}
            textAnchor="end"
            className="route-node-sub"
            fill="var(--color-chalk-muted)"
          >
            THE GAP
          </text>
        </motion.g>
      </svg>
    </div>
  );
}

function learnerPath() {
  let d = `M40,${CLASS_Y}`;
  WEEKS.forEach((w, i) => {
    const y = CLASS_Y + w.drift;
    const prevX = i === 0 ? 40 : WEEKS[i - 1].x;
    const prevY = CLASS_Y + (i === 0 ? 0 : WEEKS[i - 1].drift);
    const mx = (prevX + w.x) / 2;
    d += ` C${mx},${prevY} ${mx},${y} ${w.x},${y}`;
  });
  d += ` L${W - 40},${CLASS_Y + WEEKS[WEEKS.length - 1].drift}`;
  return d;
}

/** A wide, shallow arc that dips below both lines before pointing back. */
function dependency(x1: number, y1: number, x2: number, y2: number) {
  const floor = H - 46;
  return `M${x1},${y1 + 10} C${x1 - 40},${floor} ${x2 + 90},${floor} ${x2},${y2}`;
}
