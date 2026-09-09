/* ==========================================================================
   Mathematical typography.

   An expression is written once, as a plain string, and typeset from it:
   variables in italic, digits and operators roman, superscripts raised,
   operator spacing by class rather than by hand-placed spaces. A spoken
   equivalent is derived from the same string, so every equation on the site
   reads correctly aloud without anyone maintaining a second copy of it.

   Nothing here evaluates anything. It is a typesetter, not a parser.
   ========================================================================== */

import { Fragment, type ReactNode } from 'react';

const SIZES = {
  xs: 'text-[0.95rem]',
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-[1.9rem] sm:text-[2.2rem]',
  xl: 'text-[2.4rem] sm:text-[3rem]',
  hero: 'text-[2.75rem] leading-[1.05] sm:text-[3.9rem] md:text-[4.6rem]',
} as const;

export type MathSize = keyof typeof SIZES;

const SUP: Record<string, string> = { '²': '2', '³': '3' };
const OPS = new Set(['+', '−', '-', '=', '×', '·', '÷', '<', '>', '≤', '≥', '±', '≠']);

const SPOKEN: Record<string, string> = {
  '+': 'plus',
  '−': 'minus',
  '-': 'minus',
  '=': 'equals',
  '×': 'times',
  '·': 'times',
  '÷': 'divided by',
  '<': 'is less than',
  '>': 'is greater than',
  '±': 'plus or minus',
  '≠': 'is not equal to',
  '(': 'open bracket',
  ')': 'close bracket',
  '√': 'the square root of',
  '/': 'over',
  ',': ',',
};

/** Derive a spoken form from the written form. */
export function speakMath(src: string): string {
  const out: string[] = [];
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === ' ') continue;
    if (SUP[ch]) {
      out.push(SUP[ch] === '2' ? 'squared' : 'cubed');
      continue;
    }
    if (SPOKEN[ch]) {
      out.push(SPOKEN[ch]);
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let num = ch;
      while (i + 1 < src.length && /[0-9.]/.test(src[i + 1])) num += src[++i];
      out.push(num);
      continue;
    }
    out.push(ch);
  }
  return out.join(' ').replace(/\s+,/g, ',');
}

function typeset(src: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let key = 0;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === ' ') continue;
    if (SUP[ch]) {
      nodes.push(
        <span key={key++} className="sup">
          {SUP[ch]}
        </span>,
      );
      continue;
    }
    if (OPS.has(ch)) {
      nodes.push(
        <span key={key++} className="op">
          {ch}
        </span>,
      );
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      nodes.push(
        <i key={key++} className="v">
          {ch}
        </i>,
      );
      continue;
    }
    nodes.push(<Fragment key={key++}>{ch}</Fragment>);
  }
  return nodes;
}

export function MathText({
  children,
  size = 'md',
  speak,
  className = '',
  as = 'span',
}: {
  children: string;
  size?: MathSize;
  speak?: string;
  className?: string;
  as?: 'span' | 'div' | 'p';
}) {
  const Tag = as;
  return (
    <Tag
      className={`math ${SIZES[size]} ${className}`}
      role="math"
      aria-label={speak ?? speakMath(children)}
    >
      <span aria-hidden="true">{typeset(children)}</span>
    </Tag>
  );
}

/** The same typesetting for a fragment that lives inside a larger structure. */
export function MathInline({ children }: { children: string }) {
  return <span aria-hidden="true">{typeset(children)}</span>;
}
