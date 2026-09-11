/* ==========================================================================
   The tokeniser and the spoken form for mathematical and scientific notation.

   This module is deliberately free of JSX so the reading of every expression
   on the site can be asserted directly in the test suite. Math.tsx renders the
   same nodes; nothing here evaluates anything.

   Commands understood, because they are the ones that change how an
   expression reads:

     \\frac{a}{b}   stacked, with a rule
     \\sqrt{a}      radical sign with an overbar across the radicand
     \\mathrm{a}    upright, for chemical symbols and unit abbreviations
     \\,            an explicit thin space, for "2 O2" and "5 m/s"

   and one plain-text form, because chemistry needs it:

     H_{2}O        subscripts, lowered rather than raised

   The input is authored by us, never by a visitor.
   ========================================================================== */

const SUP: Record<string, string> = { '²': '2', '³': '3' };
const OPS = new Set(['+', '−', '-', '=', '×', '·', '÷', '<', '>', '≤', '≥', '±', '≠', '→', ':', '≈']);

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
  '→': 'yields',
  '/': 'over',
  ':': 'to',
  '≈': 'approximately equals',
  '≤': 'is less than or equal to',
  '≥': 'is greater than or equal to',
  ',': ',',
};

/* --- a very small tokeniser -------------------------------------------- */

export type Node =
  | { t: 'text'; v: string }
  | { t: 'sup'; v: string }
  | { t: 'sub'; v: string }
  | { t: 'space' }
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

/** `roman` suppresses variable italics, so \\mathrm{NaCl} reads as a symbol rather than four variables. */
export function parse(src: string, roman = false): Node[] {
  const out: Node[] = [];
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];

    if (ch === '\\') {
      if (src.startsWith('\\frac', i)) {
        const [num, a] = group(src, i + 5);
        const [den, b] = group(src, a);
        out.push({ t: 'frac', num: parse(num, roman), den: parse(den, roman) });
        i = b - 1;
        continue;
      }
      if (src.startsWith('\\sqrt', i)) {
        const [body, a] = group(src, i + 5);
        out.push({ t: 'sqrt', body: parse(body, roman) });
        i = a - 1;
        continue;
      }
      if (src.startsWith('\\mathrm', i)) {
        const [body, a] = group(src, i + 7);
        out.push(...parse(body, true));
        i = a - 1;
        continue;
      }
      if (src[i + 1] === ',') {
        out.push({ t: 'space' });
        i += 1;
        continue;
      }
      continue;
    }

    if (ch === ' ') {if(roman)out.push({t:'space'});continue;}
    if (SUP[ch]) {
      out.push({ t: 'sup', v: SUP[ch] });
      continue;
    }
    if (ch === '^' || ch === '_') {
      const t = ch === '^' ? ('sup' as const) : ('sub' as const);
      if (src[i + 1] === '{') {
        const [inner, a] = group(src, i + 1);
        out.push({ t, v: inner });
        i = a - 1;
      } else {
        out.push({ t, v: src[i + 1] ?? '' });
        i += 1;
      }
      continue;
    }
    if (OPS.has(ch)) {
      out.push({ t: 'op', v: ch==='-'?'−':ch });
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      out.push(roman ? { t: 'text', v: ch } : { t: 'var', v: ch });
      continue;
    }
    out.push({ t: 'text', v: ch });
  }
  return out;
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
    if (n.t === 'sub') {
      out.push(n.v);
      continue;
    }
    if (n.t === 'space') continue;
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

