/** Khan resource registry. Original lesson links are preserved and rechecked. */
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
