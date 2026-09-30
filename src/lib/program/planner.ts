import {CONCEPTS,CONCEPT_BY_ID,type Concept} from './concepts.ts';
import {bandFor} from '../mock/blueprint.ts';
import {itemById,formFromKey,formItems} from '../mock/forms.ts';
import {SUBTESTS,type Subtest} from '../mock/types.ts';
import type {ProgramState,CalEvent} from './store.ts';

/** Dates are local calendar days written YYYY-MM-DD. Every function here takes
 *  "today" as an argument so plans are testable and never depend on the clock. */
export const DAY_MS=86400000;
export function toDay(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function parseDay(s:string){const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d);}
export function addDays(s:string,n:number){const d=parseDay(s);d.setDate(d.getDate()+n);return toDay(d);}
export function daysBetween(a:string,b:string){return Math.round((parseDay(b).getTime()-parseDay(a).getTime())/DAY_MS);}
export const weekday=(s:string)=>parseDay(s).getDay();

export type Phase={id:'foundation'|'practice'|'simulation';label:string;start:string;end:string;goal:string};
/** Foundation, practice, simulation, in proportion to the time left. Short runways
 *  keep all three phases, just shorter. */
export function phases(today:string,exam:string):Phase[]{
 const total=Math.max(1,daysBetween(today,exam));
 const a=Math.max(1,Math.round(total*.45)),b=Math.max(1,Math.round(total*.35));
 const p1End=addDays(today,a-1),p2End=addDays(today,Math.min(total-1,a+b-1));
 return [
  {id:'foundation',label:'Foundation',start:today,end:p1End,goal:'Learn or relearn each concept, with a topic check after each one.'},
  {id:'practice',label:'Practice',start:addDays(p1End,1),end:p2End,goal:'Mixed sets and one timed section a week. Fix every miss.'},
  {id:'simulation',label:'Simulation',start:addDays(p2End,1),end:addDays(exam,-1),goal:'Full simulations at exam pace, then light review before the day.'}
 ];
}
export function phaseOn(list:Phase[],day:string){return list.find(p=>day>=p.start&&day<=p.end)??list[list.length-1];}

/** Correct and total per concept and per subtest, from every submitted attempt. */
export function performance(s:ProgramState){
 const concept:Record<string,{correct:number;total:number;last:number}>={};
 const subtest:Record<Subtest,{correct:number;total:number;history:{at:number;percent:number}[]}>={language:{correct:0,total:0,history:[]},reading:{correct:0,total:0,history:[]},math:{correct:0,total:0,history:[]},science:{correct:0,total:0,history:[]}};
 for(const a of s.attempts){
  if(!a.submittedAt)continue;
  const form=formFromKey(a.formKey);if(!form)continue;
  const per:Partial<Record<Subtest,{c:number;t:number}>>={};
  for(const id of formItems(form)){
   const item=itemById(id);if(!item)continue;
   const ok=a.answers[id]===item.answerIndex;
   const k=concept[item.concept]??{correct:0,total:0,last:0};k.total++;if(ok)k.correct++;k.last=Math.max(k.last,a.submittedAt);concept[item.concept]=k;
   const p=per[item.subtest]??{c:0,t:0};p.t++;if(ok)p.c++;per[item.subtest]=p;
  }
  for(const [sub,p] of Object.entries(per) as [Subtest,{c:number;t:number}][]){const t=subtest[sub];t.correct+=p.c;t.total+=p.t;t.history.push({at:a.submittedAt,percent:Math.round(p.c/p.t*100)});}
 }
 return {concept,subtest};
}

/** Readiness per subtest from recent work (the last 60 answers weigh the most). */
export function readiness(s:ProgramState){
 const perf=performance(s);
 return SUBTESTS.map(sub=>{
  const h=perf.subtest[sub].history.sort((a,b)=>a.at-b.at);
  const recent=h.slice(-4),percent=recent.length?Math.round(recent.reduce((t,x)=>t+x.percent,0)/recent.length):undefined;
  const first=h[0]?.percent,latest=h[h.length-1]?.percent;
  return {subtest:sub,percent,band:percent===undefined?undefined:bandFor(percent),answered:perf.subtest[sub].total,growth:h.length>1&&first!==undefined&&latest!==undefined?latest-first:undefined};
 });
}

/** Which concepts to study first. Unseen concepts and low accuracy rise; concepts
 *  whose prerequisites are weak wait behind them. Returns every concept, ranked. */
export function focusRanking(s:ProgramState,subtests:Subtest[]=SUBTESTS){
 const perf=performance(s).concept;
 const score=(c:Concept)=>{
  const p=perf[c.id],checks=s.concepts[c.id]?.checks??[];
  const lastCheck=checks[checks.length-1];
  const accuracy=lastCheck?lastCheck.correct/lastCheck.total:p&&p.total?p.correct/p.total:undefined;
  const misses=s.notebook.filter(n=>n.concept===c.id&&!n.resolved).length;
  let v=accuracy===undefined?0.55:1-accuracy;
  v+=Math.min(.3,misses*.05);
  const weakPrereq=(c.after??[]).some(a=>{const q=perf[a];return q&&q.total>=3&&q.correct/q.total<.5;});
  if(weakPrereq)v-=.25;
  return {concept:c,priority:Math.round(v*100),accuracy:accuracy===undefined?undefined:Math.round(accuracy*100),misses,weakPrereq,seen:!!(p&&p.total)||checks.length>0};
 };
 return CONCEPTS.filter(c=>subtests.includes(c.subtest)).map(score).sort((a,b)=>b.priority-a.priority||CONCEPTS.indexOf(a.concept)-CONCEPTS.indexOf(b.concept));
}
export type FocusRow=ReturnType<typeof focusRanking>[number];
export const statusOf=(row:FocusRow)=>!row.seen?'not started':row.accuracy!==undefined&&row.accuracy>=80?'solid':row.accuracy!==undefined&&row.accuracy>=50?'getting there':'focus here';

/** Study sessions from today to the exam on the learner's chosen weekdays. Each
 *  session gets the highest-priority concept not yet scheduled that week. Mock days
 *  are Saturdays in practice (a section) and simulation (a full run). Rebuilding
 *  simply redistributes what is left; nothing is ever marked late. */
export function buildSchedule(s:ProgramState,today:string):CalEvent[]{
 const p=s.pledge;if(!p)return [];
 const list=phases(today,p.examDate),rank=focusRanking(s).map(r=>r.concept.id);
 const days=p.weekdays.length?p.weekdays:[1,3,5];
 const out:CalEvent[]=[];let cursor=0;
 const horizon=Math.min(daysBetween(today,p.examDate),370);
 for(let i=0;i<horizon;i++){
  const day=addDays(today,i),wd=weekday(day),phase=phaseOn(list,day);
  if(wd===6&&phase.id!=='foundation'){out.push({id:`mock-${day}`,date:day,time:'09:00',minutes:phase.id==='simulation'?240:60,title:phase.id==='simulation'?'Full simulation':'Timed section',kind:'mock'});continue;}
  if(!days.includes(wd))continue;
  const concept=rank[cursor++%rank.length];
  out.push({id:`study-${day}`,date:day,time:p.time||undefined,minutes:p.minutes,title:CONCEPT_BY_ID[concept].title,kind:'study',concept});
 }
 return out;
}

/** Today's three-step mission: quick recall, a Khan block, a fresh exit check. */
export function mission(s:ProgramState,today:string){
 const top=focusRanking(s,s.sides.bridge&&!s.sides.admission?['math','science']:SUBTESTS)[0];
 const done=s.missions[today]??{};
 const dueRecall=Object.values(s.recall).filter(r=>r.due<=parseDay(today).getTime()+DAY_MS).length;
 return {concept:top.concept,steps:[
  {id:'recall' as const,done:!!done.recall,title:'Quick recall',detail:dueRecall?`${dueRecall} card${dueRecall===1?'':'s'} due`:'Five minutes of mixed review'},
  {id:'khan' as const,done:!!done.khan,title:top.concept.khan.length?'Learn it on Khan Academy':'Read the summary',detail:top.concept.title},
  {id:'exit' as const,done:!!done.exit,title:'Fresh exit check',detail:`${top.concept.title}, new questions`}
 ]};
}

/** Weeks since the pledge with the study days logged, and shields: every full week
 *  earns one (up to two), and a shield quietly covers a week that fell short. */
export function weeks(s:ProgramState,today:string){
 const target=s.pledge?.days??3;
 const start=addDays(today,-((weekday(today)+6)%7));
 const rows=[] as {start:string;days:number;met:boolean;shielded:boolean}[];
 let shields=0;
 for(let w=7;w>=0;w--){
  const from=addDays(start,-7*w),to=addDays(from,6);
  const days=s.studyDays.filter(d=>d>=from&&d<=to).length,met=days>=target,current=w===0;
  let shielded=false;
  if(!current){if(met)shields=Math.min(2,shields+1);else if(shields>0&&days>0){shields--;shielded=true;}}
  rows.push({start:from,days,met,shielded});
 }
 return {rows,shields,target,thisWeek:rows[rows.length-1]};
}

export function nextMockDay(events:CalEvent[],today:string){return events.filter(e=>e.kind==='mock'&&e.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0];}
