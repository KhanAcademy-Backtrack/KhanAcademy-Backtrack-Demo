import type {MockItem} from '../../lib/mock/types.ts';
import {LESSON_BY_ID,TOPIC_LESSONS} from '../../lib/program/topic-lessons.ts';
import {VERIFIED_CLIPS,type VideoClip} from '../../lib/video-clips.ts';
import {validDay} from '../../lib/program/store.ts';

type Four<T>=[T,T,T,T];
export type LessonQuestion=MockItem & {source:'authored';status:'draft';choices:Four<string>;misconceptions:Four<string|null>;rationales:Four<string>};
export const QUIZ_ROLES=['recall','explain_why','apply','common_trap'] as const;
export type LessonQuiz={
 lessonId:string;version:number;videoId:string;captionsReviewedOn:string;
 keyIdea:string;watchFor:[{at:number;text:string},{at:number;text:string},{at:number;text:string}?];
 prediction?:LessonQuestion;
 items:Four<LessonQuestion & {role:typeof QUIZ_ROLES[number]}>;
 segment?:VideoClip;
 practice:{url:string;label:string;checked:string};
};

export const PILOT_LESSONS=TOPIC_LESSONS.filter(l=>l.exam==='upcat'&&(l.section==='Mathematics'||l.section==='Science'));
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const nonempty=(v:unknown)=>typeof v==='string'&&v.trim().length>0;
const id=(v:unknown)=>typeof v==='string'&&/^[\w.-]{1,160}$/.test(v);

/** Rewatch never trusts an arbitrary range in content or a saved record. */
export function verifiedLessonSegment(quiz:Pick<LessonQuiz,'videoId'|'segment'>):VideoClip|undefined{
 const clip=Object.hasOwn(VERIFIED_CLIPS,quiz.videoId)?VERIFIED_CLIPS[quiz.videoId]:undefined;
 return clip&&quiz.segment&&clip.start===quiz.segment.start&&clip.end===quiz.segment.end&&clip.label===quiz.segment.label?clip:undefined;
}

/** Publication checks are deliberately stricter than MockItem's optional fields.
 * Checking the third-party log and LaTeX belongs to the node test suite. */
export function lessonQuizIssues(value:unknown):string[]{
 const issues:string[]=[];
 if(!obj(value))return ['quiz must be an object'];
 const l=typeof value.lessonId==='string'&&Object.hasOwn(LESSON_BY_ID,value.lessonId)?LESSON_BY_ID[value.lessonId]:undefined;
 if(!l||!PILOT_LESSONS.some(p=>p.id===l.id))issues.push('lesson must belong to the UPCAT maths/science pilot');
 if(!Number.isInteger(value.version)||Number(value.version)<1||Number(value.version)>1000)issues.push('invalid authored version');
 if(!l?.videos.some(v=>v.id===value.videoId))issues.push('video must be matched to this lesson');
 if(!validDay(value.captionsReviewedOn))issues.push('caption review date required');
 if(!nonempty(value.keyIdea))issues.push('key idea required');
 const cues=value.watchFor;
 if(!Array.isArray(cues)||cues.length<2||cues.length>3||cues.some((c,i)=>!obj(c)||!Number.isInteger(c.at)||Number(c.at)<0||!nonempty(c.text)||(i>0&&Number(c.at)<=Number(cues[i-1].at))))issues.push('two or three ordered timestamp cues required');
 if(value.segment!==undefined&&!verifiedLessonSegment(value as unknown as LessonQuiz))issues.push('segment must exactly match VERIFIED_CLIPS');
 const p=value.practice;
 if(!obj(p)||!nonempty(p.label)||!validDay(p.checked)||typeof p.url!=='string')issues.push('hand-checked practice page required');
 else{try{const u=new URL(p.url);if(u.origin!=='https://www.khanacademy.org'||!u.pathname.includes('/e/')||u.search||u.hash)issues.push('practice must be a canonical Khan exercise page');}catch{issues.push('invalid practice URL');}}
 const items=value.items;
 if(!Array.isArray(items)||items.length!==4)issues.push('exactly four quiz questions required');
 const all=[...(Array.isArray(items)?items:[]),...(value.prediction===undefined?[]:[value.prediction])];
 const ids=new Set<string>();
 for(const [n,item] of all.entries()){
  const prefix=`item ${n+1}: `;
  if(!obj(item)){issues.push(prefix+'must be an object');continue;}
  if(!id(item.id)||ids.has(String(item.id)))issues.push(prefix+'unique authored id required');ids.add(String(item.id));
  if(item.source!=='authored'||item.status!=='draft'||item.lang!=='en')issues.push(prefix+'original English draft required');
  if(item.subtest!==(l?.section==='Mathematics'?'math':'science'))issues.push(prefix+'subtest must match lesson');
  for(const f of ['stem','skill','concept','reviewerChapter'])if(!nonempty(item[f]))issues.push(prefix+f+' required');
  if(typeof item.difficulty!=='number'||![1,2,3].includes(item.difficulty))issues.push(prefix+'invalid difficulty');
  if(!Number.isInteger(item.answerIndex)||Number(item.answerIndex)<0||Number(item.answerIndex)>3)issues.push(prefix+'one key in positions zero through three required');
  if(!Array.isArray(item.choices)||item.choices.length!==4||!item.choices.every(nonempty)||new Set(item.choices).size!==4)issues.push(prefix+'four distinct choices required');
  if(!Array.isArray(item.rationales)||item.rationales.length!==4||!item.rationales.every(nonempty))issues.push(prefix+'rationale for every choice required');
  if(!Array.isArray(item.solutionSteps)||!item.solutionSteps.length||!item.solutionSteps.every(nonempty))issues.push(prefix+'worked rationale required');
  if(!Array.isArray(item.misconceptions)||item.misconceptions.length!==4||item.misconceptions.some((m,i)=>i===item.answerIndex?m!==null:!id(m)))issues.push(prefix+'misconception id for every distractor, null only for the key');
  if(n<4&&item.role!==QUIZ_ROLES[n])issues.push(prefix+'roles must be recall, explain why, apply, common trap');
 }
 if(Array.isArray(items)&&new Set(items.map(i=>obj(i)?i.answerIndex:undefined)).size!==4)issues.push('spread the four answer keys across all positions');
 return issues;
}
