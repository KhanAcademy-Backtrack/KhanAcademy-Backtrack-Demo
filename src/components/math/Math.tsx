/* ==========================================================================
   Mathematical typography.

   An expression is written once, as a plain string, and typeset from it:
   variables in italic, digits and operators roman, superscripts raised,
   fractions stacked over a rule, radicands under a bar, operator spacing by
   class rather than by hand-placed spaces. A spoken equivalent is derived from
   the same string, so every equation on the site reads correctly aloud without
   anyone maintaining a second copy of it.

   Two LaTeX-shaped commands are understood, because they are the two that
   actually change how an expression reads:

     \frac{a}{b}   stacked, with a rule
     \sqrt{a}      radical sign with an overbar across the radicand

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

/* --- a very small tokeniser -------------------------------------------- */

type Node =
  | { t: 'text'; v: string }
  | { t: 'sup'; v: string }
  | { t: 'op'; v: string }
  | { t: 'var'; v: string }
  | { t: 'frac'; num: Node[]; den: Node[] }
  | { t: 'sqrt'; body: Node[] };

/** Read a {...} group starting at src[i] === '{'. Returns [inner, nextIndex]. */
function group(src: string, i: number): [string, number] {
  if (src[i] !== '{') return ['', i];
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') {
      depth--;
      if (depth === 0) return [src.slice(i + 1, j), j + 1];
    }
  }
  return [src.slice(i + 1), src.length];
}

function parse(src: string): Node[] {
  const out: Node[] = [];
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];

    if (ch === '\\') {
      if (src.startsWith('\\frac', i)) {
        const [num, a] = group(src, i + 5);
        const [den, b] = group(src, a);
        out.push({ t: 'frac', num: parse(num), den: parse(den) });
        i = b - 1;
        continue;
      }
      if (src.startsWith('\\sqrt', i)) {
        const [body, a] = group(src, i + 5);
        out.push({ t: 'sqrt', body: parse(body) });
        i = a - 1;
        continue;
      }
      continue;
    }

    if (ch === ' ') continue;
    if (SUP[ch]) {
      out.push({ t: 'sup', v: SUP[ch] });
      continue;
    }
    if (ch === '^') {
      if (src[i + 1] === '{') {
        const [inner, a] = group(src, i + 1);
        out.push({ t: 'sup', v: inner });
        i = a - 1;
      } else {
        out.push({ t: 'sup', v: src[i + 1] ?? '' });
        i += 1;
      }
      continue;
    }
    if (OPS.has(ch)) {
      out.push({ t: 'op', v: ch });
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      out.push({ t: 'var', v: ch });
      continue;
    }
    out.push({ t: 'text', v: ch });
  }
  return out;
}

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

/* --- spoken form -------------------------------------------------------- */

function speakNodes(nodes: Node[]): string {
  const out: string[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.t === 'frac') {
      out.push('the fraction', speakNodes(n.num), 'over', speakNodes(n.den), ', end fraction');
      continue;
    }
    if (n.t === 'sqrt') {
      out.push('the square root of', speakNodes(n.body), ', end root');
      continue;
    }
    if (n.t === 'sup') {
      out.push(n.v === '2' ? 'squared' : n.v === '3' ? 'cubed' : `to the power ${n.v}`);
      continue;
    }
    if (n.t === 'op') {
      out.push(SPOKEN[n.v] ?? n.v);
      continue;
    }
    if (n.t === 'var') {
      out.push(n.v);
      continue;
    }
    if (SPOKEN[n.v]) {
      out.push(SPOKEN[n.v]);
      continue;
    }
    if (/[0-9]/.test(n.v)) {
      /* Run digits together so "12" is not read as "one two". */
      let num = n.v;
      while (i + 1 < nodes.length) {
        const next = nodes[i + 1];
        if (next.t === 'text' && /[0-9.]/.test(next.v)) {
          num += next.v;
          i++;
        } else break;
      }
      out.push(num);
      continue;
    }
    out.push(n.v);
  }
  return out.join(' ');
}

export function speakMath(src: string): string {
  return speakNodes(parse(src)).replace(/\s+,/g, ',').replace(/\s+/g, ' ').trim();
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
      aria-label={speak ?? speakNodes(nodes).replace(/\s+,/g, ',').replace(/\s+/g, ' ').trim()}
    >
      <span aria-hidden="true">{render(nodes)}</span>
    </Tag>
  );
}

/** The same typesetting for a fragment inside a larger structure. */
export function MathInline({ children }: { children: string }) {
  return <span aria-hidden="true">{render(parse(children))}</span>;
}
