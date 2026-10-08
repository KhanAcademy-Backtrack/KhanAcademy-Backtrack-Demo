import {LESSON_BY_ID} from './topic-lessons.ts';
import type {LessonAnswer,LessonCheck,ProgramState} from './store.ts';
import type {LessonQuiz} from '../../content/lesson-quizzes/schema.ts';

type QuizIdentity=Pick<LessonQuiz,'lessonId'|'version'|'items'>;
const answer=(v:LessonAnswer)=>v===null||v==='idk'||(Number.isInteger(v)&&v>=0&&v<4);
const time=(now:number,c?:LessonCheck)=>Math.max(now,c?.startedAt??0,c?.updatedAt??0);
const clock=(now:number)=>Number.isFinite(now)&&now>=0&&now<=8.64e15;
const index=(i:number)=>Number.isInteger(i)&&i>=0&&i<4;

/** Content revisions can change practice, but cannot silently regrade a saved run. */
export function activeLessonCheck(s:ProgramState,q:QuizIdentity):LessonCheck|undefined{
 const c=s.lessonChecks&&Object.hasOwn(s.lessonChecks,q.lessonId)?s.lessonChecks[q.lessonId]:undefined;
 return c&&c.version===q.version&&c.itemIds.every((id,i)=>id===q.items[i]?.id)?c:undefined;
}
const put=(s:ProgramState,id:string,c:LessonCheck):ProgramState=>({...s,lessonChecks:{...s.lessonChecks,[id]:c}});

/** Only explicit learner actions write this separate practice record. No activity
 * enters the exam attempts, concept checks, gap finder or study exposure ledger. */
export function beginLessonCheck(s:ProgramState,q:QuizIdentity,now:number,retake=false):ProgramState{
 if(!clock(now)||!Object.hasOwn(LESSON_BY_ID,q.lessonId)||q.items.length!==4||new Set(q.items.map(i=>i.id)).size!==4||!Number.isInteger(q.version)||q.version<1||q.version>1000)return s;
 const existing=activeLessonCheck(s,q);if(existing&&!retake)return s;
 const old=s.lessonChecks?.[q.lessonId],at=time(now,old);
 return put(s,q.lessonId,{version:q.version,itemIds:q.items.map(i=>i.id) as LessonCheck['itemIds'],startedAt:at,updatedAt:at,runs:Math.min(1000,(old?.runs??0)+1),answers:[null,null,null,null],checked:[false,false,false,false]});
}

export function chooseLessonAnswer(s:ProgramState,q:QuizIdentity,i:number,value:LessonAnswer,now:number):ProgramState{
 const c=activeLessonCheck(s,q);if(!c||!clock(now)||!index(i)||!answer(value)||c.checked[i]||c.answers[i]===value)return s;
 const answers=[...c.answers] as LessonCheck['answers'];answers[i]=value;
 return put(s,q.lessonId,{...c,answers,updatedAt:time(now,c)});
}
export function checkLessonAnswer(s:ProgramState,q:QuizIdentity,i:number,now:number):ProgramState{
 const c=activeLessonCheck(s,q);if(!c||!clock(now)||!index(i)||c.checked[i]||c.answers[i]===null)return s;
 const checked=[...c.checked] as LessonCheck['checked'];checked[i]=true;const at=time(now,c);
 return put(s,q.lessonId,{...c,checked,updatedAt:at,...(checked.every(Boolean)?{completedAt:at}:{})});
}
export function recordLessonPrediction(s:ProgramState,q:QuizIdentity,value:LessonAnswer,after:boolean,now:number):ProgramState{
 const c=activeLessonCheck(s,q);if(!c||!clock(now)||!answer(value)||(after?c.completedAt===undefined:c.checked.some(Boolean)))return s;
 return put(s,q.lessonId,{...c,[after?'predictionAfter':'predictionBefore']:value,updatedAt:time(now,c)});
}
export function openLessonPractice(s:ProgramState,q:QuizIdentity,now:number):ProgramState{
 const c=activeLessonCheck(s,q);if(!c||!clock(now)||c.completedAt===undefined||c.practice)return s;
 const at=time(now,c);return put(s,q.lessonId,{...c,practice:{openedAt:at},updatedAt:at});
}
export function reportLessonPractice(s:ProgramState,q:QuizIdentity,report:NonNullable<LessonCheck['practice']>['report'],now:number):ProgramState{
 const c=activeLessonCheck(s,q);if(!c?.practice||!clock(now)||!['completed','still_difficult','access_problem'].includes(String(report)))return s;
 const at=time(now,c);return put(s,q.lessonId,{...c,practice:{...c.practice,reportedAt:at,report},updatedAt:at});
}
