import {LABELS,TOPICS,recentSuccesses,validRecovery,type Recovery,type Skill,type Topic} from './recovery.ts';

export type KhanEvidence='not_checked'|'assigned'|'opened'|'learner_reported'|'still_difficult'|'access_problem'|'teacher_report_checked';
export const KHAN_EVIDENCE:Record<KhanEvidence,string>={not_checked:'Not checked',assigned:'Assigned by teacher',opened:'Opened (route record)',learner_reported:'Learner reported completion',still_difficult:'Learner reported difficulty',access_problem:'Learner reported access problem',teacher_report_checked:'Teacher checked Khan report'};
export type TeacherRow={code:string;route:Recovery;khan:KhanEvidence;returnDate:string};
export function routeSummary(s:Recovery){
  const checked=s.passed.filter(skill=>recentSuccesses(s,skill)>=2);
  const goal=checked.includes(s.destinationSkill??'goal')&&s.goalPassed;
  const support=!goal&&(s.phase==='support'||s.next==='support');
  const next=s.phase==='feedback'||s.phase==='moment'||s.phase==='pause'?s.nextSkill:s.active;
  const action=goal?'Set a later return check':support?'Work through one example together':s.phase==='setup'?'Start the current task':`Check ${LABELS[next].toLowerCase()}`;
  const feedback=[...s.events].reverse().find(e=>e.kind==='khan_feedback');
  const khan:KhanEvidence=feedback?feedback.detail==='completed'?'learner_reported':feedback.detail==='difficulty'?'still_difficult':'access_problem':s.events.some(e=>e.kind==='practice_report')?'learner_reported':s.events.some(e=>e.kind==='khan_open'&&e.detail?.startsWith('exercise'))?'opened':'not_checked';
  return {checked,goal,support,next,action,khan};
}
export function returnTicket(s:Recovery){
  const summary=routeSummary(s),last=[...s.evidence].reverse().find(e=>!e.correct);
  const attempt=last?.answer.some(x=>x.trim())?last.answer.join(s.topic==='fractions'?' / ':' and '):'I did not know where to start';
  return [`Dunlo — ${s.goalTitle??TOPICS[s.topic].label}`,`Next useful action: ${summary.action}.`,`Checked here: ${summary.checked.length?summary.checked.map(x=>x==='goal'?'Today’s goal':LABELS[x]).join(', '):'No step has two unassisted checks yet.'}`,last?`My last difficult step: ${LABELS[last.skill]}. I tried: ${attempt}.`:'No difficult answer recorded.',`Khan practice: ${KHAN_EVIDENCE[summary.khan]}.`,`Please help me ${summary.goal?'check whether this stays with me next week':`work through ${LABELS[summary.next].toLowerCase()} and try a new example`}.`].join('\n');
}
export function importRouteRecord(raw:string):Recovery{
  if(raw.length>1_000_000)throw new Error('Use a Dunlo route record smaller than 1 MB.');
  let data;try{data=JSON.parse(raw);}catch{throw new Error('This file is not a readable JSON route record.');}
  if(data.sampleMode)throw new Error('Demo records are samples. Use a learner route record, or load the clearly labelled sample class.');
  if(!validRecovery(data))throw new Error('This is not a supported Dunlo route record.');
  return data;
}
const csvCell=(value:string)=>`"${(/^[=+\-@\t\r]/.test(value)?"'":'')+value.replace(/"/g,'""')}"`;
export function actionSheetCsv(rows:TeacherRow[],illustrative:boolean,week?:number){
  const head=['Learner code','Teaching week','Class goal','Next action','Dunlo checks','Khan assignment evidence','Next return date','Record type'];
  return [head,...rows.map(row=>{const s=routeSummary(row.route);return [row.code,week===undefined?'':String(week),TOPICS[row.route.topic].label,s.action,s.checked.map(x=>x==='goal'?'Today’s goal':LABELS[x]).join('; ')||'Not yet checked',KHAN_EVIDENCE[row.khan],row.returnDate,illustrative?'Illustrative sample':'Imported device record; teacher-entered Khan status'];})].map(cols=>cols.map(csvCell).join(',')).join('\r\n');
}
export function sampleTeacherRows(topic:Topic,make:()=>Recovery):TeacherRow[]{
  const base=make(),now=Date.now();
  const done:Recovery={...base,topic,phase:'complete',active:'goal',passed:['goal'],goalPassed:true,startedAt:now,updatedAt:now,evidence:[0,1].map(i=>({id:`${topic}:goal:${i}`,skill:'goal' as Skill,answer:['sample'],correct:true,assisted:false,confidence:'unsure' as const,at:now,purpose:'route' as const}))};
  return [{code:'Sample A',route:done,khan:'teacher_report_checked',returnDate:''},{code:'Sample B',route:{...base,topic,phase:'check',active:TOPICS[topic].path[0],startedAt:now,updatedAt:now},khan:'assigned',returnDate:''},{code:'Sample C',route:{...base,topic,phase:'support',active:TOPICS[topic].path[0],startedAt:now,updatedAt:now},khan:'learner_reported',returnDate:''}];
}
