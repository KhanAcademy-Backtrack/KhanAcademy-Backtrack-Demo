import type {LessonQuiz} from './schema.ts';
import {MATH_NUMBER} from './math-number.ts';
import {MATH_ALGEBRA} from './math-algebra.ts';
import {MATH_GEOMETRY} from './math-geometry.ts';
import {MATH_TRIGONOMETRY} from './math-trigonometry.ts';
import {MATH_STATISTICS} from './math-statistics.ts';
export {PILOT_LESSONS,QUIZ_ROLES,lessonQuizIssues,verifiedLessonSegment} from './schema.ts';
export type {LessonQuestion,LessonQuiz} from './schema.ts';

/** Publish only after the actual matched video's timestamped captions have been read on
 * Khan's own page and its cues, optional segment and practice page have been hand-checked
 * and logged. No fabricated content stands in for a lesson that has not been reviewed. */
export const LESSON_QUIZZES:Record<string,LessonQuiz>=Object.fromEntries([
 ...MATH_NUMBER,
 ...MATH_ALGEBRA,
 ...MATH_GEOMETRY,
 ...MATH_TRIGONOMETRY,
 ...MATH_STATISTICS,
].map(q=>[q.lessonId,q]));
export const lessonQuizFor=(lessonId:string):LessonQuiz|undefined=>Object.hasOwn(LESSON_QUIZZES,lessonId)?LESSON_QUIZZES[lessonId]:undefined;
