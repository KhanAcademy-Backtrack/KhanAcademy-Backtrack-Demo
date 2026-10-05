/* ==========================================================================
   The tokeniser and the spoken form for mathematical and scientific notation.

   Every equation on the site is written in LaTeX. Inside running text it sits
   between dollar signs, "Solve $2x + 3 = 11$.", and `splitMath` separates the
   two; a whole expression (a BACKTRACK problem, a formula line) is LaTeX on its
   own. This module is deliberately free of JSX so the reading of every
   expression can be asserted directly in the test suite. Math.tsx renders the
   same nodes; nothing here evaluates anything.

   The LaTeX understood is the subset our material uses:

     \frac{a}{b} \dfrac \tfrac   stacked, with a rule
     \sqrt{a} \sqrt[n]{a}        radical sign with an overbar across the radicand
     x^{2} x_{1}                 raised and lowered scripts, which may hold commands
     \mathrm{a} \text{a}         upright, for words, chemical symbols and units
     \sin \cos \tan \log         upright function names
     \times \div \cdot \pm \le \ge \ne \approx \to \rightleftharpoons ...
     \pi \theta \Delta \lambda \circ \% \{ \} \ldots ...
     \, \; \quad \ \!            explicit spaces (\! is ignored)
     \left( \right)              sizing words are ignored; the bracket stays
     8{,}000                     a thousands separator, read as one number
     {a}                         a plain group

   Unicode forms that older BACKTRACK expressions already store (×, ÷, −, x², →)
   are still read, because saved fingerprints depend on those strings.

   The input is authored by us, never by a visitor.
   ========================================================================== */

const SUP: Record<string, string> = { '²': '2', '³': '3' };
const OPS = new Set(['+', '−', '-', '=', '×', '·', '÷', '<', '>', '≤', '≥', '±', '∓', '≠', '→', '⇌', '⇒', ':', '≈', '∝', '∠', '∥', '⊥']);

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
  '∓': 'minus or plus',
  '≠': 'is not equal to',
  '(': 'open bracket',
  ')': 'close bracket',
  '√': 'the square root of',
  '→': 'yields',
  '⇌': 'is in equilibrium with',
  '⇒': 'implies',
  '/': 'over',
  ':': 'to',
  '≈': 'approximately equals',
  '≤': 'is less than or equal to',
  '≥': 'is greater than or equal to',
  '∝': 'is proportional to',
  '∠': 'angle',
  '∥': 'is parallel to',
  '⊥': 'is perpendicular to',
  '△': 'triangle',
  '°': 'degrees',
  '%': 'percent',
  '…': 'and so on',
  'π': 'pi',
  'θ': 'theta',
  'Δ': 'delta',
  'λ': 'lambda',
  'μ': 'mu',
  'Ω': 'ohms',
  'ρ': 'rho',
  'α': 'alpha',
  'β': 'beta',
  'γ': 'gamma',
  'σ': 'sigma',
  '∞': 'infinity',
  '|': 'bar',
  ',': ',',
};

/** Commands that stand for one operator. */
const CMD_OPS: Record<string, string> = {
  times: '×', div: '÷', cdot: '·', pm: '±', mp: '∓', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠',
  approx: '≈', to: '→', rightarrow: '→', longrightarrow: '→', Rightarrow: '⇒', rightleftharpoons: '⇌',
  lt: '<', gt: '>', propto: '∝', angle: '∠', parallel: '∥', perp: '⊥',
};
/** Commands that stand for one upright symbol. */
const CMD_TEXT: Record<string, string> = {
  pi: 'π', Delta: 'Δ', Omega: 'Ω', circ: '°', degree: '°', '%': '%', '{': '{', '}': '}', ldots: '…', dots: '…', cdots: '…',
  infty: '∞', triangle: '△', '$': '$', '#': '#', '&': '&', '_': '_', mid: '|',
};
/** Commands that stand for one italic letter. */
const CMD_VARS: Record<string, string> = {
  theta: 'θ', lambda: 'λ', mu: 'μ', rho: 'ρ', alpha: 'α', beta: 'β', gamma: 'γ', sigma: 'σ', omega: 'ω', phi: 'φ',
};
/** Function names, set upright. */
const FUNCS = new Set(['sin', 'cos', 'tan', 'log', 'ln', 'max', 'min']);
/** Sizing and style words with no effect on how the expression reads. */
const IGNORED = new Set(['left', 'right', 'big', 'Big', 'bigl', 'bigr', 'displaystyle', 'textstyle', 'limits', '!']);

/* --- a very small tokeniser -------------------------------------------- */

export type Node =
  | { t: 'text'; v: string; sep?: true }
  | { t: 'sup'; body: Node[] }
  | { t: 'sub'; body: Node[] }
  | { t: 'space' }
  | { t: 'op'; v: string }
  | { t: 'var'; v: string }
  | { t: 'frac'; num: Node[]; den: Node[] }
  | { t: 'sqrt'; body: Node[]; index?: Node[] };

/** Read a {...} group starting at src[i] === '{'. Returns [inner, nextIndex]. */
function group(src: string, i: number): [string, number] {
  if (src[i] !== '{') return ['', i];
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '\\') {
      j++;
      continue;
    }
    if (src[j] === '{') depth++;
    else if (src[j] === '}') {
      depth--;
      if (depth === 0) return [src.slice(i + 1, j), j + 1];
    }
  }
  return [src.slice(i + 1), src.length];
}

/** One argument: a {...} group, a \command, or a single character. */
function argument(src: string, i: number): [string, number] {
  while (src[i] === ' ') i++;
  if (src[i] === '{') return group(src, i);
  if (src[i] === '\\') {
    const name = /^\\([a-zA-Z]+|.)/.exec(src.slice(i));
    if (name) return [name[0], i + name[0].length];
  }
  return [src[i] ?? '', i + 1];
}

/** The name of the command starting at src[i] === '\\', and the index after it. */
function command(src: string, i: number): [string, number] {
  const m = /^\\([a-zA-Z]+|.)/.exec(src.slice(i));
  if (!m) return ['', i + 1];
  return [m[1], i + m[0].length];
}

/** Commands this tokeniser knows. Used by the content checks, so a typo such as
 *  \frack cannot reach a learner as stray letters. */
export function unknownCommands(src: string): string[] {
  const out: string[] = [];
  for (const m of src.matchAll(/\\([a-zA-Z]+|.)/g)) {
    const n = m[1];
    if (['frac', 'dfrac', 'tfrac', 'sqrt', 'mathrm', 'text', 'textrm', 'operatorname', ',', ';', ':', ' ', 'quad', 'qquad'].includes(n)) continue;
    if (CMD_OPS[n] || CMD_TEXT[n] || CMD_VARS[n] || FUNCS.has(n) || IGNORED.has(n)) continue;
    out.push(n);
  }
  return out;
}

/** `roman` suppresses variable italics, so \\mathrm{NaCl} reads as a symbol rather than four variables. */
export function parse(src: string, roman = false): Node[] {
  const out: Node[] = [];
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];

    if (ch === '\\') {
      const [name, after] = command(src, i);
      if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
        const [num, a] = argument(src, after);
        const [den, b] = argument(src, a);
        out.push({ t: 'frac', num: parse(num, roman), den: parse(den, roman) });
        i = b - 1;
        continue;
      }
      if (name === 'sqrt') {
        let at = after;
        let index: Node[] | undefined;
        if (src[at] === '[') {
          const close = src.indexOf(']', at);
          index = parse(src.slice(at + 1, close < 0 ? src.length : close), roman);
          at = close < 0 ? src.length : close + 1;
        }
        const [body, a] = argument(src, at);
        out.push(index ? { t: 'sqrt', body: parse(body, roman), index } : { t: 'sqrt', body: parse(body, roman) });
        i = a - 1;
        continue;
      }
      if (name === 'text' || name === 'textrm' || name === 'operatorname') {
        /* Words stay words, so \text{rise} reads "rise", not "r i s e". */
        const [body, a] = argument(src, after);
        for (const word of body.split(/( )/)) {
          if (word === ' ') out.push({ t: 'space' });
          else if (word) out.push({ t: 'text', v: word.replace(/\\([%$#&{}])/g, '$1') });
        }
        i = a - 1;
        continue;
      }
      if (name === 'mathrm') {
        const [body, a] = argument(src, after);
        out.push(...parse(body, true));
        i = a - 1;
        continue;
      }
      if (name === ',' || name === ';' || name === ':' || name === ' ' || name === 'quad' || name === 'qquad') {
        out.push({ t: 'space' });
        if (name === 'quad' || name === 'qquad') out.push({ t: 'space' }, { t: 'space' });
        i = after - 1;
        continue;
      }
      if (CMD_OPS[name]) {
        out.push({ t: 'op', v: CMD_OPS[name] });
        i = after - 1;
        continue;
      }
      if (CMD_TEXT[name]) {
        out.push({ t: 'text', v: CMD_TEXT[name] });
        i = after - 1;
        continue;
      }
      if (CMD_VARS[name]) {
        out.push(roman ? { t: 'text', v: CMD_VARS[name] } : { t: 'var', v: CMD_VARS[name] });
        i = after - 1;
        continue;
      }
      if (FUNCS.has(name)) {
        out.push({ t: 'text', v: name }, { t: 'space' });
        i = after - 1;
        continue;
      }
      /* \left, \right and unknown words are dropped; the bracket after \left stays. */
      if (src[after] === '.' && (name === 'left' || name === 'right')) i = after;
      else i = after - 1;
      continue;
    }

    if (ch === '{') {
      const [inner, a] = group(src, i);
      if (inner === ',') out.push({ t: 'text', v: ',', sep: true });
      else out.push(...parse(inner, roman));
      i = a - 1;
      continue;
    }
    if (ch === '}') continue;
    if (ch === ' ') {
      if (roman) out.push({ t: 'space' });
      continue;
    }
    if (SUP[ch]) {
      out.push({ t: 'sup', body: [{ t: 'text', v: SUP[ch] }] });
      continue;
    }
    if (ch === '^' || ch === '_') {
      const t = ch === '^' ? ('sup' as const) : ('sub' as const);
      const [inner, a] = argument(src, i + 1);
      out.push({ t, body: parse(inner, roman) });
      i = a - 1;
      continue;
    }
    if (OPS.has(ch)) {
      out.push({ t: 'op', v: ch === '-' ? '−' : ch });
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

const isDigit = (n: Node | undefined) => !!n && n.t === 'text' && /^[0-9.]$/.test(n.v);

function speakScript(body: Node[]): string {
  const only = body.length === 1 && body[0].t === 'text' ? body[0].v : undefined;
  if (only === '2') return 'squared';
  if (only === '3') return 'cubed';
  if (only === '°') return 'degrees';
  return `to the power ${speakNodes(body)}`;
}

function speakNodes(nodes: Node[]): string {
  const out: string[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.t === 'frac') {
      out.push('the fraction', speakNodes(n.num), 'over', speakNodes(n.den), ', end fraction');
      continue;
    }
    if (n.t === 'sqrt') {
      if (n.index) out.push('the root of index', speakNodes(n.index), 'of', speakNodes(n.body), ', end root');
      else out.push('the square root of', speakNodes(n.body), ', end root');
      continue;
    }
    if (n.t === 'sup') {
      out.push(speakScript(n.body));
      continue;
    }
    if (n.t === 'sub') {
      out.push(speakNodes(n.body));
      continue;
    }
    if (n.t === 'space') continue;
    if (n.t === 'op') {
      out.push(SPOKEN[n.v] ?? n.v);
      continue;
    }
    if (n.t === 'var') {
      out.push(SPOKEN[n.v] ?? n.v);
      continue;
    }
    if (/[0-9]/.test(n.v)) {
      /* Run digits together so "12" is not read as "one two", and 8{,}000 as one number. */
      let num = n.v;
      while (i + 1 < nodes.length) {
        const next = nodes[i + 1];
        if (isDigit(next)) {
          num += (next as { v: string }).v;
          i++;
        } else if (next.t === 'text' && next.sep && isDigit(nodes[i + 2])) {
          num += ',';
          i++;
        } else break;
      }
      out.push(num);
      continue;
    }
    if (SPOKEN[n.v]) {
      out.push(SPOKEN[n.v]);
      continue;
    }
    out.push(n.v);
  }
  return out.join(' ');
}

export function speakMath(src: string): string {
  return speakNodes(parse(src)).replace(/\s+,/g, ',').replace(/\s+/g, ' ').trim();
}

/* --- plain linear form -------------------------------------------------- */

const SUPER: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '−': '⁻', '+': '⁺', n: 'ⁿ' };
const SUBSCRIPT: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };

function plainNodes(nodes: Node[]): string {
  let out = '';
  const wrap = (s: string) => (/^[\w.°πθ²³]+$/u.test(s) ? s : `(${s})`);
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.t === 'frac') out += `${wrap(plainNodes(n.num))}/${wrap(plainNodes(n.den))}`;
    else if (n.t === 'sqrt') out += `${n.index ? plainNodes(n.index) : ''}√${wrap(plainNodes(n.body))}`;
    else if (n.t === 'sup') {
      const s = plainNodes(n.body);
      out += [...s].every((c) => SUPER[c]) ? [...s].map((c) => SUPER[c]).join('') : s === '°' ? '°' : `^${wrap(s)}`;
    } else if (n.t === 'sub') {
      const s = plainNodes(n.body);
      out += [...s].every((c) => SUBSCRIPT[c]) ? [...s].map((c) => SUBSCRIPT[c]).join('') : `_${wrap(s)}`;
    } else if (n.t === 'space') out += ' ';
    else if (n.t === 'op') {
      /* A sign at the start, after an operator or after a bracket is unary: −2, (−3), = −5. */
      const unary = (n.v === '−' || n.v === '+') && (i === 0 || nodes[i - 1].t === 'op' || (nodes[i - 1].t === 'text' && /^[([,]$/.test((nodes[i - 1] as { v: string }).v)));
      out += unary ? (out.endsWith(' ') || out === '' || /[([]$/.test(out) ? n.v : ` ${n.v}`) : /[:→=≈<>≤≥≠±+−×÷⇌]/.test(n.v) ? ` ${n.v} ` : n.v;
    }
    else if (n.t === 'text' && n.v === ',' && !n.sep) out += ', ';
    else out += n.v;
  }
  return out.replace(/ {2,}/g, ' ').trim();
}

/** The expression as one line of ordinary text, for places that cannot hold
 *  typeset notation: a page title, a select option, a shared message. */
export function plainMath(src: string): string {
  return plainNodes(parse(src));
}

/* --- running text with inline math -------------------------------------- */

export type Segment = { math: boolean; v: string };

/** Splits running text on $...$. A backslash before a dollar sign keeps it literal. */
export function splitMath(text: string): Segment[] {
  const out: Segment[] = [];
  let buf = '';
  let math = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\\' && text[i + 1] === '$') {
      buf += math ? '\\$' : '$';
      i++;
      continue;
    }
    if (ch === '$') {
      if (buf) out.push({ math, v: buf });
      buf = '';
      math = !math;
      continue;
    }
    buf += ch;
  }
  if (buf) out.push({ math, v: buf });
  return out;
}

/** True when the text holds an unclosed $. */
export function unbalancedMath(text: string): boolean {
  return (text.replace(/\\\$/g, '').match(/\$/g)?.length ?? 0) % 2 === 1;
}

/** Running text read aloud: its math in words. */
export function speakText(text: string): string {
  return splitMath(text)
    .map((s) => (s.math ? speakMath(s.v) : s.v))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Running text as one line of ordinary text. */
export function plainText(text: string): string {
  return splitMath(text)
    .map((s) => (s.math ? plainMath(s.v) : s.v))
    .join('');
}
