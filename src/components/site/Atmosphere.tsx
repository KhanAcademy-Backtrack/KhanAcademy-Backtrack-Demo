/* ==========================================================================
   Atmosphere.

   The map is a place, so it carries the marks of one: contour lines, the
   ghosts of routes other learners took, abandoned branches that stop at a
   cross, plotted points, and fragments of the mathematics this whole map is
   about. Everything here is deterministic and hand-placed, no randomness, no
   hydration mismatch, no decorative junk that means nothing.

   It is one inline SVG plus CSS gradients, so it costs no requests and stays
   sharp at any size.
   ========================================================================== */

type Props = {
  variant?: 'cover' | 'section' | 'quiet';
  className?: string;
};

const CONTOURS = [
  'M-60 210 C 180 150 330 268 560 236 C 790 204 940 96 1300 150',
  'M-60 268 C 190 208 344 322 566 292 C 792 262 950 158 1300 208',
  'M-60 330 C 200 272 358 380 574 350 C 796 320 962 224 1300 270',
  'M-60 604 C 210 552 352 660 588 636 C 830 610 980 520 1300 566',
  'M-60 664 C 220 612 366 716 596 692 C 838 668 992 582 1300 624',
];

/* Routes other learners took to the same destination. */
const GHOSTS = [
  'M-40 168 C 250 168 300 96 470 96 C 700 96 760 262 980 262 C 1140 262 1200 186 1320 186',
  'M-40 468 C 210 468 268 574 500 574 C 730 574 790 412 1010 412 C 1160 412 1230 470 1320 470',
  'M-40 742 C 280 742 330 828 560 828 C 810 828 880 700 1060 700 C 1180 700 1250 748 1320 748',
];

/* Branches that were considered and abandoned. Each ends at a cross. */
const DEAD_ENDS = [
  { d: 'M300 168 C 360 168 380 116 430 112', x: 434, y: 111 },
  { d: 'M700 574 C 760 574 786 630 830 636', x: 834, y: 637 },
];

const MARKS = [
  { t: 'x² + bx + c', left: 8, top: 7, r: -4, size: '1.5rem' },
  { t: '(x + 3)(x + 4)', left: 78, top: 6, r: 3, size: '1.35rem' },
  { t: 'b² − 4ac', left: 13, top: 93, r: -2, size: '1.25rem' },
  { t: 'ax + b = 0', left: 88, top: 91, r: 4, size: '1.15rem' },
  { t: '3x + 2x = 5x', left: 46, top: 96, r: -3, size: '1.15rem' },
];

const POINTS = [
  [96, 246],
  [188, 168],
  [284, 330],
  [372, 96],
  [468, 268],
  [560, 402],
  [648, 186],
  [742, 348],
  [836, 210],
  [928, 452],
  [1016, 300],
  [1112, 168],
  [176, 566],
  [330, 640],
  [486, 720],
  [640, 604],
  [794, 690],
  [948, 618],
  [1092, 748],
];

export function Atmosphere({ variant = 'section', className = '' }: Props) {
  const cover = variant === 'cover';
  const quiet = variant === 'quiet';

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        className={`h-full w-full ${cover ? 'drift-slow' : ''}`}
        viewBox="0 0 1280 880"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="atm-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-depth)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-route)" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* contour lines: the terrain the route crosses */}
        <g opacity={quiet ? 0.14 : cover ? 0.3 : 0.2}>
          {CONTOURS.map((d, i) => (
            <path key={i} d={d} stroke="url(#atm-fade)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          ))}
        </g>

        {/* other learners' routes */}
        <g opacity={quiet ? 0.16 : cover ? 0.32 : 0.22}>
          {GHOSTS.map((d, i) => (
            <path
              key={i}
              d={d}
              stroke="var(--color-route)"
              strokeWidth={1.4} vectorEffect="non-scaling-stroke"
              strokeDasharray="2 11"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* branches that did not work out */}
        {!quiet && (
          <g opacity={0.3}>
            {DEAD_ENDS.map((b, i) => (
              <g key={i}>
                <path
                  d={b.d}
                  stroke="var(--color-recalc)"
                  strokeWidth={1.2} vectorEffect="non-scaling-stroke"
                  strokeDasharray="3 6"
                  strokeLinecap="round"
                />
                <path
                  d={`M${b.x - 4} ${b.y - 4} L${b.x + 4} ${b.y + 4} M${b.x + 4} ${b.y - 4} L${b.x - 4} ${b.y + 4}`}
                  stroke="var(--color-recalc)"
                  strokeWidth={1.4} vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>
        )}

        {/* plotted points */}
        <g opacity={quiet ? 0.2 : 0.36}>
          {POINTS.map(([x, y], i) =>
            i % 3 === 0 ? (
              <path
                key={i}
                d={`M${x - 3} ${y} L${x + 3} ${y} M${x} ${y - 3} L${x} ${y + 3}`}
                stroke="var(--color-chalk-faint)"
                strokeWidth={1} vectorEffect="non-scaling-stroke"
              />
            ) : (
              <circle key={i} cx={x} cy={y} r={1.4} fill="var(--color-chalk-faint)" />
            ),
          )}
        </g>

        </svg>

      {/* Fragments of the mathematics this map is about. They live in HTML
          rather than inside the SVG so they stay the same size on a laptop and
          on a very large display, instead of being scaled up with the field. */}
      {!quiet && (
        <div className="absolute inset-0" aria-hidden="true">
          {MARKS.map((m) => (
            <span
              key={m.t}
              className={`math absolute whitespace-nowrap text-chalk ${
                cover ? 'opacity-[0.13]' : 'opacity-[0.08]'
              }`}
              style={{
                left: `${m.left}%`,
                top: `${m.top}%`,
                fontSize: m.size,
                transform: `translate(-50%, -50%) rotate(${m.r}deg)`,
              }}
            >
              {m.t}
            </span>
          ))}
        </div>
      )}

      {/* a soft vignette so the composition has a centre */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(130% 95% at 50% 42%, transparent 38%, rgba(10,19,56,0.42) 100%)',
        }}
      />
    </div>
  );
}
