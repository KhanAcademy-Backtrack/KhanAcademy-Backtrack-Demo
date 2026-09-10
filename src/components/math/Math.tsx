/* ==========================================================================
   Mathematical typography.

   An expression is written once, as a plain string, and typeset from it:
   variables in italic, digits and operators roman, superscripts raised,
   fractions stacked over a rule, radicands under a bar, operator spacing by
   class rather than by hand-placed spaces. A spoken equivalent is derived from
   the same string, so every equation on the site reads correctly aloud without
   anyone maintaining a second copy of it.

   The tokeniser and the spoken form live in src/lib/notation.ts, free of JSX
   so the suite can assert how every expression reads. The commands understood
   there are:

     \frac{a}{b}   stacked, with a rule
     \sqrt{a}      radical sign with an overbar across the radicand
     \mathrm{a}    upright, for chemical symbols and unit abbreviations
     \,            an explicit thin space, for "2 O2" and "5 m/s"

   and one plain-text form, because chemistry needs it:

     H_{2}O        subscripts, lowered rather than raised

   Chemical formulae and unit expressions may also carry an authored spoken
   form, which MathText accepts as its `speak` prop; the derived reading is
   correct but says "H 2 O" where a person would say the compound's name.

   Nothing here evaluates anything. It is a typesetter, not a parser: the input
   is authored by us, never by a visitor.
   ========================================================================== */

import { Fragment, type ReactNode } from 'react';

const SIZES = {
  xs: 'text-[1.05rem]',
  sm: 'text-[1.35rem]',
  md: 'text-[1.7rem]',
  lg: 'text-[2rem] sm:text-[2.4rem]',
  xl: 'text-[2.5rem] sm:text-[3.1rem]',
  hero: 'text-[2.6rem] leading-[1.1] sm:text-[3.8rem] md:text-[4.4rem]',
} as const;

export type MathSize = keyof typeof SIZES;

import { parse, speakMath, type Node } from '@/lib/notation';

/* --- rendering ---------------------------------------------------------- */

function render(nodes: Node[], keyBase = 'm'): ReactNode[] {
  return nodes.map((n, i) => {
    const key = `${keyBase}-${i}`;
    switch (n.t) {
      case 'sup':
        return (
          <span key={key} className="sup">
            {n.v}
          </span>
        );
      case 'sub':
        return (
          <span key={key} className="sub">
            {n.v}
          </span>
        );
      case 'space':
        return <span key={key} className="thin" />;
      case 'op':
        return (
          <span key={key} className="op">
            {n.v}
          </span>
        );
      case 'var':
        return (
          <i key={key} className="v">
            {n.v}
          </i>
        );
      case 'frac':
        return (
          <span key={key} className="frac">
            <span className="frac-num">{render(n.num, `${key}n`)}</span>
            <span className="frac-den">{render(n.den, `${key}d`)}</span>
          </span>
        );
      case 'sqrt':
        return (
          <span key={key} className="rad">
            <span className="rad-sign">√</span>
            <span className="rad-body">{render(n.body, `${key}b`)}</span>
          </span>
        );
      default:
        return <Fragment key={key}>{n.v}</Fragment>;
    }
  });
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
  const nodes = parse(children);
  return (
    <Tag
      className={`math ${SIZES[size]} ${className}`}
      role="math"
      aria-label={speak ?? speakMath(children)}
    >
      <span aria-hidden="true">{render(nodes)}</span>
    </Tag>
  );
}

/** The same typesetting for a fragment inside a larger structure. */
export function MathInline({ children }: { children: string }) {
  return <span aria-hidden="true">{render(parse(children))}</span>;
}
