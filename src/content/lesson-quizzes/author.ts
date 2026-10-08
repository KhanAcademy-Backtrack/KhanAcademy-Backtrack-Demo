import type {LessonQuestion,LessonQuiz} from './schema.ts';
import {QUIZ_ROLES} from './schema.ts';
import {LESSON_BY_ID} from '../../lib/program/topic-lessons.ts';
import {CONCEPT_BY_ID} from '../../lib/program/concepts.ts';
import type {VideoClip} from '../../lib/video-clips.ts';

type Four<T>=[T,T,T,T];
/** One authored question. `miss` holds a misconception id for each distractor and
 * null for the key; `why` explains every choice in the same order. */
export type ItemSpec={stem:string;choices:Four<string>;key:0|1|2|3;miss:Four<string|null>;why:Four<string>;steps:string[];difficulty?:1|2|3};
export type QuizSpec={
 /** Lesson id without the `outline-upcat-` prefix. */
 lesson:string;video:string;reviewed:string;keyIdea:string;
 watchFor:LessonQuiz['watchFor'];
 practice:{url:string;label:string;checked:string};
 items:Four<ItemSpec>;prediction?:ItemSpec;segment?:VideoClip;version?:number;
 /** Only for lessons with no reviewer concept. A local id has no engine, so no repair route is offered. */
 concept?:string;chapter?:string;
};

const DIFFICULTY={recall:1,explain_why:2,apply:2,common_trap:2} as const;

/** Fills the fields every lesson question shares. Content stays original and draft;
 * `lessonQuizIssues` and the node tests still check the result. */
export function lessonQuiz(s:QuizSpec):LessonQuiz{
 const lessonId='outline-upcat-'+s.lesson,l=LESSON_BY_ID[lessonId];
 if(!l)throw Error('Unknown pilot lesson '+lessonId);
 const concept=s.concept??l.concepts[0],chapter=s.chapter??(concept?CONCEPT_BY_ID[concept]?.chapter:undefined);
 if(!concept||!chapter)throw Error('Concept and reviewer chapter required for '+lessonId);
 const base='lq_'+s.lesson.replace(/-/g,'_'),subtest=l.section==='Mathematics'?'math' as const:'science' as const;
 const item=(id:string,q:ItemSpec,difficulty:1|2|3):LessonQuestion=>({id,source:'authored',status:'draft',lang:'en',subtest,stem:q.stem,choices:q.choices,answerIndex:q.key,
  misconceptions:q.miss,rationales:q.why,solutionSteps:q.steps,skill:base.slice(3),concept,difficulty:q.difficulty??difficulty,reviewerChapter:chapter});
 return {lessonId,version:s.version??1,videoId:s.video,captionsReviewedOn:s.reviewed,keyIdea:s.keyIdea,watchFor:s.watchFor,
  ...(s.prediction?{prediction:item(base+'_predict',s.prediction,1)}:{}),
  items:s.items.map((q,i)=>({...item(base+'_'+QUIZ_ROLES[i],q,DIFFICULTY[QUIZ_ROLES[i]]),role:QUIZ_ROLES[i]})) as LessonQuiz['items'],
  ...(s.segment?{segment:s.segment}:{}),practice:s.practice};
}
