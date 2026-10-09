'use client';
import {useEffect} from 'react';
import {useProgram} from './ProgramProvider';
import {EXAM_IDS,type ExamId} from '@/lib/program/admissions';
import {firstExam} from '@/lib/program/personalization';

/** Reviewer and practice share a preference without changing the learner's exam targets. */
export function useReviewerExam(){
 const {state,update}=useProgram();
 useEffect(()=>{
  const read=()=>{
   const exam=new URLSearchParams(window.location.search).get('exam') as ExamId;
   if(EXAM_IDS.includes(exam))update(s=>s.reviewerExam===exam?s:{...s,reviewerExam:exam});
  };
  read();window.addEventListener('popstate',read);
  return()=>window.removeEventListener('popstate',read);
 },[update]);
 const setExam=(exam:ExamId)=>{
  if(!EXAM_IDS.includes(exam))return;
  update(s=>s.reviewerExam===exam?s:{...s,reviewerExam:exam});
  const url=new URL(window.location.href);
  url.searchParams.set('exam',exam);
  window.history.replaceState(window.history.state,'',url);
 };
 return {exam:state.reviewerExam??firstExam(state)??EXAM_IDS[0],setExam};
}
