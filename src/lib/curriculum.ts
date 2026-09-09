/* ==========================================================================
   The demo's vertical slice.

   One destination, four skills, one honest question bank. Everything the demo
   knows about mathematics lives here, in readable data. There is no model
   call, no expression parser and no eval anywhere in the product.

   The chain follows the order a learner actually meets these ideas in an
   Algebra 1 sequence:

     combining like terms  →  multiplying out brackets  →  factoring
                                                            →  solving by factoring

   Two rules this file exists to protect:

     1. Correctness is decided by mathematics alone. Where two answers are
        genuinely valid, both are marked correct, including the ones the
        lesson was not "expecting".
     2. What a learner says about their own confidence changes what gets
        checked next. It never changes whether an answer was right.
   ========================================================================== */

export type SkillId = 'like_terms' | 'distribute' | 'factor' | 'quadratic';

/**
 * A Khan Academy resource. Every URL here was opened by hand on
 * khanacademy.org and the page title checked, so nothing on this site sends a
 * judge to a 404. BACKTRACK has no API relationship with Khan Academy, is not
 * affiliated with or endorsed by them, and cannot see whether anything here
 * was completed, which is exactly why a stop is only ever marked repaired by
 * a fresh answer inside BACKTRACK.
 */
export type KhanResource = {
  kind: 'video' | 'article' | 'exercise';
  title: string;
  url: string;
};

export type KhanUnit = {
  course: string;
  unit: string;
  lesson: string;
  resources: KhanResource[];
};

export type Skill = {
  id: SkillId;
  label: string;
  short: string;
  minutes: number;
  /** Why this sits under the destination, in one sentence. */
  why: string;
  khan: KhanUnit;
};

const KHAN = 'https://www.khanacademy.org';
const U1 = '/math/algebra/x2f8bb11595b61c86:foundation-algebra';
const U13 = '/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring';
const U14 = '/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations';

export const SKILLS: Record<SkillId, Skill> = {
  like_terms: {
    id: 'like_terms',
    label: 'Combining like terms',
    short: 'Like terms',
    minutes: 4,
    why: 'The two middle products of a multiplied-out quadratic have to be added together. If that step is shaky, the middle coefficient never comes out right.',
    khan: {
      course: 'Algebra 1',
      unit: 'Unit 1 · Algebra foundations',
      lesson: 'Combining like terms',
      resources: [
        {
          kind: 'video',
          title: 'Intro to combining like terms',
          url: `${KHAN}${U1}/x2f8bb11595b61c86:combine-like-terms/v/combining-like-terms`,
        },
        {
          kind: 'video',
          title: 'Combining like terms with negative coefficients & distribution',
          url: `${KHAN}${U1}/x2f8bb11595b61c86:combine-like-terms/v/combining-like-terms-and-the-distributive-property`,
        },
        {
          kind: 'exercise',
          title: 'Combining like terms with negative coefficients',
          url: `${KHAN}${U1}/x2f8bb11595b61c86:combine-like-terms/e/combining_like_terms_1`,
        },
      ],
    },
  },
  distribute: {
    id: 'distribute',
    label: 'Multiplying out brackets',
    short: 'Brackets',
    minutes: 5,
    why: 'Factoring is this step run backwards. You cannot reliably undo a multiplication you cannot do forwards.',
    khan: {
      course: 'Algebra 1',
      unit: 'Unit 13 · Quadratics: Multiplying & factoring',
      lesson: 'Multiplying binomials',
      resources: [
        {
          kind: 'video',
          title: 'Multiplying binomials: area model',
          url: `${KHAN}${U13}/x2f8bb11595b61c86:multiply-binomial/v/area-model-for-multiplying-binomials`,
        },
        {
          kind: 'article',
          title: 'Warmup: multiplying binomials',
          url: `${KHAN}${U13}/x2f8bb11595b61c86:multiply-binomial/a/warmup-multiplying-binomials`,
        },
        {
          kind: 'exercise',
          title: 'Multiply binomials: area model',
          url: `${KHAN}${U13}/x2f8bb11595b61c86:multiply-binomial/e/multiply-binomials-area-model`,
        },
      ],
    },
  },
  factor: {
    id: 'factor',
    label: 'Factoring x² + bx + c',
    short: 'Factoring',
    minutes: 6,
    why: 'Today’s lesson solves the equation by factoring it first. This is the step it stands on.',
    khan: {
      course: 'Algebra 1',
      unit: 'Unit 13 · Quadratics: Multiplying & factoring',
      lesson: 'Factoring quadratics intro',
      resources: [
        {
          kind: 'video',
          title: 'Factoring quadratics as (x+a)(x+b)',
          url: `${KHAN}${U13}/x2f8bb11595b61c86:factor-quadratics-intro/v/factoring-simple-quadratic-expression`,
        },
        {
          kind: 'article',
          title: 'Factoring quadratics: leading coefficient = 1',
          url: `${KHAN}${U13}/x2f8bb11595b61c86:factor-quadratics-intro/a/factoring-quadratics-leading-coefficient-1`,
        },
        {
          kind: 'exercise',
          title: 'Factoring quadratics intro',
          url: `${KHAN}${U13}/x2f8bb11595b61c86:factor-quadratics-intro/e/factoring_polynomials_1`,
        },
      ],
    },
  },
  quadratic: {
    id: 'quadratic',
    label: 'Solving by factoring',
    short: 'Today’s lesson',
    minutes: 3,
    why: 'This is where the class is now.',
    khan: {
      course: 'Algebra 1',
      unit: 'Unit 14 · Quadratic functions & equations',
      lesson: 'Solving quadratics by factoring',
      resources: [
        {
          kind: 'video',
          title: 'Solving quadratics by factoring',
          url: `${KHAN}${U14}/x2f8bb11595b61c86:quadratics-solve-factoring/v/example-1-solving-a-quadratic-equation-by-factoring`,
        },
        {
          kind: 'article',
          title: 'Solving quadratics by factoring review',
          url: `${KHAN}${U14}/x2f8bb11595b61c86:quadratics-solve-factoring/a/solving-quadratics-by-factoring-review`,
        },
        {
          kind: 'exercise',
          title: 'Quadratics by factoring (intro)',
          url: `${KHAN}${U14}/x2f8bb11595b61c86:quadratics-solve-factoring/e/solving_quadratics_by_factoring`,
        },
      ],
    },
  },
};

/** Route order: foundation first, destination last. */
export const PREREQ_ORDER: SkillId[] = ['like_terms', 'distribute', 'factor'];

export const DESTINATION = {
  course: 'Algebra 1',
  unit: 'Quadratic equations',
  lesson: 'Solving quadratics by factoring',
  today: 'x² + 7x + 12 = 0',
  fresh: 'x² + 9x + 20 = 0',
  freshRoots: [-4, -5],
  grade: 'Grade 9 reference scenario',
};

/* ======================================================================
   Questions
   ====================================================================== */

export type Choice = {
  id: string;
  text: string;
  /** Set for the "I don't know yet" option, which is information, not a wrong answer. */
  unsure?: boolean;
  correct?: boolean;
  why: string;
  hint?: string;
};

export type Question = {
  id: string;
  skill: SkillId;
  expression: string;
  prompt: string;
  note?: string;
  choices: Choice[];
};

export const BANK: Record<string, Question> = {
  /* The top-level check: today's lesson, asked at today's level. */
  check: {
    id: 'check',
    skill: 'quadratic',
    expression: 'x² + 7x + 12 = 0',
    prompt: 'Which of these is a valid first step?',
    note: 'More than one of them is. There is usually more than one honest way through a problem.',
    choices: [
      {
        id: 'factor',
        text: '(x + 3)(x + 4) = 0',
        correct: true,
        why: 'Correct. 3 × 4 = 12 and 3 + 4 = 7, so that pair does both jobs at once.',
      },
      {
        id: 'formula',
        text: 'x = \\frac{−7 ± \\sqrt{49 − 48}}{2}',
        correct: true,
        why: 'Also correct. The quadratic formula works on every quadratic, and it gives the same two answers here. BACKTRACK will not mark a valid method wrong because the lesson expected a different one.',
      },
      {
        id: 'pair',
        text: '(x + 6)(x + 2) = 0',
        why: '6 × 2 = 12, which is the part that usually gets checked. But 6 + 2 = 8, and the middle term needs 7. The pair has to do both jobs.',
      },
      { id: 'unsure', text: 'I don’t know yet', unsure: true, why: 'That is information, not a wrong answer.' },
    ],
  },

  /* Confident and wrong: separate a genuine misconception from a slip. */
  contrast: {
    id: 'contrast',
    skill: 'factor',
    expression: 'x² + 8x + 15',
    prompt: 'Factor this one.',
    note: 'You were sure of the last answer. This checks whether the rule in your head is different, or whether that was just a slip.',
    choices: [
      { id: 'ok', text: '(x + 3)(x + 5)', correct: true, why: '3 × 5 = 15 and 3 + 5 = 8. Both conditions met.' },
      {
        id: 'prod',
        text: '(x + 15)(x + 1)',
        why: '15 × 1 = 15, so the product works, but 15 + 1 = 16, not 8. The same pattern as before, which means it is the rule rather than a slip.',
      },
      { id: 'sum', text: '(x + 4)(x + 4)', why: '4 + 4 = 8, so the sum works, but 4 × 4 = 16, not 15.' },
      { id: 'unsure', text: 'I don’t know yet', unsure: true, why: 'Then it is worth repairing rather than testing again.' },
    ],
  },

  /* One step earlier: is the multiplication itself intact? */
  probe: {
    id: 'probe',
    skill: 'distribute',
    expression: '(x + 3)(x + 4)',
    prompt: 'Multiply this out.',
    note: 'One step earlier. Factoring is this step run backwards, so it is worth knowing whether the forwards version is intact before adding anything to your route.',
    choices: [
      {
        id: 'ok',
        text: 'x² + 7x + 12',
        correct: true,
        why: 'All four products, with the two middle ones added together: 4x + 3x = 7x.',
      },
      {
        id: 'ends',
        text: 'x² + 12',
        why: 'Only the first terms and the last terms were multiplied. The two cross products in the middle were left out.',
      },
      {
        id: 'sum',
        text: 'x² + 7x + 7',
        why: 'The middle term is right, but 3 and 4 were added at the end instead of multiplied.',
      },
      { id: 'unsure', text: 'I don’t know yet', unsure: true, why: 'Then this is the step worth repairing.' },
    ],
  },

  /* Fresh checks. Different numbers, and nothing is marked repaired without one. */
  fresh_distribute: {
    id: 'fresh_distribute',
    skill: 'distribute',
    expression: '(x + 2)(x + 5)',
    prompt: 'Multiply this out.',
    note: 'New numbers. Nothing is marked repaired until you answer one of these.',
    choices: [
      { id: 'ok', text: 'x² + 7x + 10', correct: true, why: '2 × 5 = 10, and 5x + 2x = 7x.' },
      {
        id: 'ends',
        text: 'x² + 10',
        why: 'The two cross products went missing again.',
        hint: 'Every term in the first bracket has to meet every term in the second. That is four products, not two.',
      },
      {
        id: 'swap',
        text: 'x² + 10x + 7',
        why: 'The 7 and the 10 have swapped places.',
        hint: 'The last number is the two constants multiplied. The middle number is them added.',
      },
      {
        id: 'sum',
        text: 'x² + 7x + 7',
        why: '2 and 5 were added at the end instead of multiplied.',
        hint: 'The final term comes from 2 × 5.',
      },
    ],
  },

  fresh_factor: {
    id: 'fresh_factor',
    skill: 'factor',
    expression: 'x² + 10x + 21',
    prompt: 'Factor this one.',
    note: 'New numbers. Nothing is marked repaired until you answer one of these.',
    choices: [
      { id: 'ok', text: '(x + 3)(x + 7)', correct: true, why: '3 × 7 = 21 and 3 + 7 = 10.' },
      {
        id: 'prod',
        text: '(x + 21)(x + 1)',
        why: 'The product is 21, but the sum is 22.',
        hint: 'Write out every pair that multiplies to 21, then check which one also adds to 10.',
      },
      {
        id: 'sum',
        text: '(x + 5)(x + 5)',
        why: 'The sum is 10, but 5 × 5 = 25, not 21.',
        hint: 'The pair has to satisfy both conditions at once, not one of them.',
      },
    ],
  },

  /* The optional next turn: a negative constant changes the signs. */
  next_turn: {
    id: 'next_turn',
    skill: 'factor',
    expression: 'x² − 2x − 8',
    prompt: 'Factor this one.',
    note: 'A negative on the end. The one review step your route was still holding in reserve.',
    choices: [
      { id: 'ok', text: '(x − 4)(x + 2)', correct: true, why: '−4 × 2 = −8 and −4 + 2 = −2. Both conditions met.' },
      { id: 'flip', text: '(x + 4)(x − 2)', why: '4 × −2 = −8, so the product works. But 4 + (−2) = +2, and the middle term is −2.' },
      { id: 'both', text: '(x − 4)(x − 2)', why: '−4 × −2 = +8, not −8. Two negatives multiply to a positive.' },
    ],
  },

  /* A week later. Retrieval, not a test. */
  comeback: {
    id: 'comeback',
    skill: 'factor',
    expression: 'x² + 5x + 6',
    prompt: 'Factor this one.',
    note: 'Not a test. It tells BACKTRACK whether to resume where you stopped or re-open a stop.',
    choices: [
      { id: 'ok', text: '(x + 2)(x + 3)', correct: true, why: 'Still there. 2 × 3 = 6 and 2 + 3 = 5.' },
      { id: 'prod', text: '(x + 6)(x + 1)', why: 'The product is 6, but the sum is 7.' },
      { id: 'unsure', text: 'I don’t remember', unsure: true, why: 'Then the stop re-opens instead of the route assuming it stuck.' },
    ],
  },
};

export const CONFIDENCE = [
  { id: 'confident', label: 'I know this' },
  { id: 'remember', label: 'I kind of remember' },
  { id: 'forgot', label: 'I genuinely forgot' },
  { id: 'never', label: 'I’ve never learned this' },
] as const;

export type ConfidenceId = (typeof CONFIDENCE)[number]['id'];

export const BUDGETS = [
  { id: 5, label: '5 min', sub: 'I’m cooked', line: 'One stop. BACKTRACK picks the one nearest today’s lesson.' },
  { id: 15, label: '15 min', sub: 'I can do something', line: 'Enough to find the missing turn and repair it.' },
  { id: 30, label: '30 min', sub: 'a normal session', line: 'Room to check the foundation underneath as well.' },
  { id: 60, label: '60 min', sub: 'locked in', line: 'Room to consolidate afterwards, so it holds next week.' },
] as const;

/** How many provisional review stops a budget will carry, nearest-first. */
export function stopsForBudget(budget: number): SkillId[] {
  if (budget <= 5) return ['factor'];
  if (budget <= 15) return ['distribute', 'factor'];
  return ['like_terms', 'distribute', 'factor'];
}

/** The example learner's choices, used by guided mode. */
export const EXAMPLE = {
  budget: 15,
  check: 'pair',
  confidence: 'remember' as ConfidenceId,
  probe: 'ends',
  fresh_distribute: 'ok',
  fresh_factor: 'ok',
  next_turn: 'ok',
  comeback: 'ok',
};

/* A normaliser, not an evaluator. Nothing typed by a visitor is executed.

   The previous version folded the separators into the same character class as
   the minus signs, so a comma and a space both became "-": the answer "-4, -5"
   normalised to "-4---5", found no delimiter, and was rejected. Which meant
   the destination, the moment the whole demo is built to arrive at, refused
   the exact format its own help text tells the learner to type.

   The two jobs are now separate. First every dash-shaped character a keyboard
   or a copy-paste can produce becomes an ASCII minus; then every separator a
   person might reasonably use becomes a comma. */
export function checkRoots(raw: string, roots: number[]): boolean {
  const cleaned = raw
    .toLowerCase()
    /* every dash a browser, keyboard or textbook might hand us */
    .replace(/[−–—‐‑˗－]/g, '-')
    /* "x = -4", "x1=-4" */
    .replace(/x\s*\d*\s*=/g, '')
    /* the ways people write "and" */
    .replace(/\band\b|\bor\b|&/g, ',')
    /* anything left that separates two answers */
    .replace(/[;\s]+/g, ',')
    .replace(/,+/g, ',');

  const parts = cleaned.split(',').filter(Boolean);
  if (parts.length !== roots.length) return false;
  const got = parts.map(Number);
  if (got.some((n) => !Number.isFinite(n))) return false;
  const want = [...roots].sort((a, b) => a - b);
  const have = [...got].sort((a, b) => a - b);
  return want.every((v, i) => v === have[i]);
}
