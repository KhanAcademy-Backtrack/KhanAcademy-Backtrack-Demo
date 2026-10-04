import {CONCEPTS,CONCEPT_BY_ID} from './concepts.ts';
import {PROGRAM_BY_ID} from './bridge.ts';
import {EXAMS} from './admissions.ts';
import type {ExamId} from './admissions.ts';
import type {CETTarget,ProgramState} from './store.ts';

export function learnerGoal(s:ProgramState){return s.setup?.goal??(s.sides.bridge&&(s.activeSide==='bridge'||!s.sides.admission)?'college':s.pledge||s.sides.admission?'exam':undefined);}
/** The learner's first named entrance exam. The reviewer and the plan's topic list use its own sections. */
export function firstExam(s:ProgramState):ExamId|undefined{return examTargets(s).find(t=>t.exam)?.exam;}
export function examTargets(s:ProgramState):CETTarget[]{
 if(learnerGoal(s)!=='exam')return [];
 if(s.setup?.cet)return s.setup.cet.targets;
 const exam=s.setup?.exam??s.pledge?.exam;
 return exam?[{key:exam,name:EXAMS[exam].name,exam,date:s.setup?s.setup.targetDate:s.pledge?.examDate}]:[];
}
export function targetDay(s:ProgramState){return examTargets(s).flatMap(t=>t.date?[t.date]:[]).sort()[0];}
export function scheduleEnd(s:ProgramState){return examTargets(s).flatMap(t=>t.date?[t.date]:[]).sort().at(-1);}
export function goalLabel(s:ProgramState){
 const goal=learnerGoal(s);
 if(goal==='college')return PROGRAM_BY_ID[s.bridgeProgram??'']?.title??'College foundations';
 if(goal==='topic')return CONCEPT_BY_ID[s.setup?.concept??'']?.title??'Your class topic';
 if(goal==='exam'){
  if(s.setup?.cet?.general)return 'General CET review';
  const targets=examTargets(s);
  return targets.length>1?`CET review · ${targets.length} exam targets`:targets.length?`${targets[0].name} preparation`:'College entrance exam review';
 }
 return 'Your study space';
}
export function goalConceptIds(s:ProgramState){
 const goal=learnerGoal(s);
 if(goal==='topic'&&CONCEPT_BY_ID[s.setup?.concept??''])return [s.setup!.concept!];
 if(goal==='college'){
  const p=PROGRAM_BY_ID[s.bridgeProgram??''];
  if(p)return [...new Set(p.assumes.flatMap(a=>a.concepts))];
  return CONCEPTS.filter(c=>c.subtest==='math'||c.subtest==='science').map(c=>c.id);
 }
 return CONCEPTS.map(c=>c.id);
}
