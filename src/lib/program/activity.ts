import type {ProgramState} from './store.ts';
import {validDay} from './store.ts';
import type {StudyState} from '../study.ts';
import {addDays,weekday} from './planner.ts';

export type ActivityDay={day:string;sets:number;checks:number;review:boolean;recorded:boolean;count:number;level:number};
const manilaDay=(at:number)=>Number.isFinite(at)&&at>0?new Date(at).toLocaleDateString('en-CA',{timeZone:'Asia/Manila'}):'';

/** Participation only. Resource opens, planned sessions, confidence and scores
 * never produce activity. Daily results and their saved attempts count once. */
export function studyActivity(program:ProgramState,study:StudyState,today:string){
 const byDay=new Map<string,ActivityDay>();
 const get=(day:string)=>{
  if(!validDay(day)||day>today)return undefined;
  let entry=byDay.get(day);
  if(!entry){entry={day,sets:0,checks:0,review:false,recorded:false,count:0,level:0};byDay.set(day,entry);}
  return entry;
 };
 for(const day of new Set(program.studyDays)){const e=get(day);if(e)e.recorded=true;}
 const dailyAttempts=new Set<string>(),attempts=new Set<string>();
 for(const a of program.attempts){
  if(!a.submittedAt||attempts.has(a.id))continue;
  attempts.add(a.id);
  const daily=/^daily2?~(\d{4})(\d{2})(\d{2})$/.exec(a.formKey);
  const day=daily?`${daily[1]}-${daily[2]}-${daily[3]}`:manilaDay(a.submittedAt);
  if(daily&&dailyAttempts.has(day))continue;
  const e=get(day);if(e){e.sets++;if(daily)dailyAttempts.add(day);}
 }
 for(const [day,result] of Object.entries(program.daily)){
  if(result.total>0&&!dailyAttempts.has(day)){const e=get(day);if(e)e.sets++;}
 }
 for(const [day,m] of Object.entries(program.missions)){
  if(m.recall){const e=get(day);if(e)e.review=true;}
 }
 // Completed meaningful sessions retain their date even after a topic starts
 // another route. They don't add a second count for the same answers.
 for(const session of study.sessions){
  if(session.complete&&session.meaningful){const e=get(manilaDay(session.lastAt));if(e)e.recorded=true;}
 }
 const checks=new Set<string>();
 for(const route of Object.values(study.routes)){
  if(!route)continue;
  for(const attempt of route.evidence){
   // "I don't know yet" is support metadata, not a completed answer.
   if(!attempt.answer.some(a=>a.trim())||checks.has(`${route.topic}:${attempt.id}:${attempt.at}`))continue;
   checks.add(`${route.topic}:${attempt.id}:${attempt.at}`);
   const e=get(manilaDay(attempt.at));if(e)e.checks++;
  }
 }
 for(const e of byDay.values()){e.count=e.sets+e.checks+(e.review?1:0)||(e.recorded?1:0);e.level=Math.min(4,e.count);}
 const days=[...byDay.values()].filter(e=>e.level>0).sort((a,b)=>a.day.localeCompare(b.day));
 const active=new Set(days.map(e=>e.day));
 let streak=0,cursor=active.has(today)?today:addDays(today,-1);
 while(active.has(cursor)){streak++;cursor=addDays(cursor,-1);}
 let best=0,run=0,previous='';
 for(const e of days){run=previous&&addDays(previous,1)===e.day?run+1:1;best=Math.max(best,run);previous=e.day;}
 const weekStart=addDays(today,-((weekday(today)+6)%7));
 return {byDay,days,activeDays:days.length,sets:days.reduce((n,e)=>n+e.sets,0),checks:days.reduce((n,e)=>n+e.checks,0),streak,best,weekDays:days.filter(e=>e.day>=weekStart).length};
}

/** Whole Sunday-first columns covering January through December. Dates outside
 * the calendar year are padding; future dates never gain recorded activity. */
export function activityWeeks(today:string){
 const year=today.slice(0,4),first=`${year}-01-01`,last=`${year}-12-31`;
 const start=addDays(first,-weekday(first));
 const end=addDays(last,6-weekday(last));
 const count=Math.floor((Date.parse(end)-Date.parse(start))/86400000/7)+1;
 return Array.from({length:count},(_,w)=>Array.from({length:7},(_,d)=>addDays(start,w*7+d)));
}
