import type {LessonQuiz} from './schema.ts';
export {PILOT_LESSONS,QUIZ_ROLES,lessonQuizIssues,verifiedLessonSegment} from './schema.ts';
export type {LessonQuestion,LessonQuiz} from './schema.ts';

/** Publish only after the actual matched video has been watched with captions and
 * its cues, optional segment and practice page have been hand-checked and logged.
 * No fabricated content stands in for the pending 107-lesson caption review. */
export const LESSON_QUIZZES:Record<string,LessonQuiz>={};
export const lessonQuizFor=(lessonId:string):LessonQuiz|undefined=>Object.hasOwn(LESSON_QUIZZES,lessonId)?LESSON_QUIZZES[lessonId]:undefined;
