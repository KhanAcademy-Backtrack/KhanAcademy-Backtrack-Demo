/* ==========================================================================
   Icons.

   Khan Academy's own design system (Wonder Blocks) draws its icons from
   Phosphor, so these are drawn to Phosphor's proportions: a 24 unit box, a
   1.75 stroke, round caps and joins, no fills. Learners who use Khan Academy
   should recognise the shapes rather than have to decode them.

   They are inline paths rather than a dependency. Wonder Blocks would bring
   Aphrodite and a runtime style layer with it, which is a large amount of
   machinery to import in order to draw a play triangle onto a static export.

   Icons are used where recognition genuinely beats a word, never as
   decoration on a label that already reads perfectly well on its own.
   ========================================================================== */

import type { ReactElement } from 'react';

export type IconName =
  | 'video'
  | 'article'
  | 'practice'
  | 'external'
  | 'hint'
  | 'retry'
  | 'back'
  | 'route'
  | 'check'
  | 'timer'
  | 'goal'
  | 'recalculate'
  | 'chevron-down'
  | 'chevron-right';

const PATHS: Record<IconName, ReactElement> = {
  /* play in a circle — Khan's video affordance */
  video: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10.2 8.9 L15.4 12 L10.2 15.1 Z" />
    </>
  ),
  /* a page with lines of text */
  article: (
    <>
      <path d="M6 3.5h7.5L18 8v12.5H6z" />
      <path d="M13.5 3.5V8H18" />
      <path d="M9 12.5h6M9 16h4.5" />
    </>
  ),
  /* a checklist: practice is a set of attempted items */
  practice: (
    <>
      <path d="M4 7.2l1.9 1.9L9.3 5.5" />
      <path d="M4 16.2l1.9 1.9 3.4-3.6" />
      <path d="M12.5 7.6H20M12.5 16.6H20" />
    </>
  ),
  /* arrow leaving a box */
  external: (
    <>
      <path d="M14 4.5h5.5V10" />
      <path d="M19.5 4.5 12 12" />
      <path d="M17.5 14v4.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 18.5V8a1.5 1.5 0 0 1 1.5-1.5H10" />
    </>
  ),
  /* a lightbulb */
  hint: (
    <>
      <path d="M9.6 17.2a6 6 0 1 1 4.8 0" />
      <path d="M9.6 17.2v1.4a1.4 1.4 0 0 0 1.4 1.4h2a1.4 1.4 0 0 0 1.4-1.4v-1.4z" />
      <path d="M9.6 17.2h4.8" />
    </>
  ),
  /* an arrow curling back on itself */
  retry: (
    <>
      <path d="M4.6 12a7.4 7.4 0 1 1 2.2 5.2" />
      <path d="M4.6 7.4V12h4.6" />
    </>
  ),
  back: <path d="M19 12H5m0 0 6-6m-6 6 6 6" />,
  /* a path between two pins */
  route: (
    <>
      <circle cx="5.5" cy="6" r="2.2" />
      <circle cx="18.5" cy="18" r="2.2" />
      <path d="M7.7 6h5.1a3.4 3.4 0 0 1 0 6.8H11a3.6 3.6 0 0 0 0 5.2h5.3" />
    </>
  ),
  check: <path d="M4.8 12.4 9.6 17.2 19.2 7" />,
  timer: (
    <>
      <circle cx="12" cy="13.2" r="7.3" />
      <path d="M12 9.6v3.6l2.4 1.6" />
      <path d="M9.6 3.2h4.8" />
    </>
  ),
  /* a flag on a pole: the destination */
  goal: (
    <>
      <path d="M6 20.5V4" />
      <path d="M6 4.8h11.5l-2.6 4 2.6 4H6" />
    </>
  ),
  /* two arrows turning: the route is being redrawn */
  recalculate: (
    <>
      <path d="M4.4 9.6A7.8 7.8 0 0 1 18 7.2" />
      <path d="M19.6 14.4A7.8 7.8 0 0 1 6 16.8" />
      <path d="M18 3.4v3.8h-3.8M6 20.6v-3.8h3.8" />
    </>
  ),
  'chevron-down': <path d="M6.5 9.5 12 15l5.5-5.5" />,
  'chevron-right': <path d="M9.5 6.5 15 12l-5.5 5.5" />,
};

export function Icon({
  name,
  size = 20,
  className = '',
  strokeWidth = 1.75,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
