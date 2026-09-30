import {MATH_CHAPTERS} from './math.ts';
import {SCIENCE_CHAPTERS} from './science.ts';
import {VERBAL_CHAPTERS} from './verbal.ts';
import type {Chapter} from './types.ts';

export const CHAPTERS:Chapter[]=[...MATH_CHAPTERS,...SCIENCE_CHAPTERS,...VERBAL_CHAPTERS];
export {CHAPTER_IDS} from './ids.ts';
export const CHAPTER_BY_ID:Record<string,Chapter>=Object.fromEntries(CHAPTERS.map(c=>[c.id,c]));
export type {Chapter};
