import {CONCEPTS,CONCEPT_BY_ID} from './concepts.ts';
import {PROGRAM_BY_ID} from './bridge.ts';
import {EXAMS} from './admissions.ts';
import type {ProgramState} from './store.ts';

export function learnerGoal(s:ProgramState){return s.setup?.goal??(s.sides.bridge&&(s.activeSide==='bridge'||!s.sides.admission)?'college':s.pledge||s.sides.admission?'exam':undefined);}
export function targetDay(s:ProgramState){return s.setup?s.setup.goal==='exam'?s.setup.targetDate:undefined:s.pledge?.examDate;}
export function goalLabel(s:ProgramState){
 const goal=learnerGoal(s);
 if(goal==='college')return PROGRAM_BY_ID[s.bridgeProgram??'']?.title??'Your first year';
 if(goal==='topic')return CONCEPT_BY_ID[s.setup?.concept??'']?.title??'Your class topic';
 if(goal==='exam')return `${EXAMS[s.setup?.exam??s.pledge?.exam??'upcat'].name} preparation`;
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
