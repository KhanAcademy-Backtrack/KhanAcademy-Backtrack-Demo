import {EXAM_COVERAGE,examTopics} from '../program/exam-coverage.ts';
import type {ExamId} from '../program/admissions.ts';

/** Stable names in links, independent of section order. No new exam coverage is inferred. */
export function reviewerSections(exam:ExamId){
 const topics=examTopics(exam);
 return EXAM_COVERAGE[exam].sections.map(section=>({
  ...section,
  id:section.name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
  concepts:topics.filter(t=>t.section===section.name).map(t=>t.concept)
 }));
}
export const reviewerSectionKey=(exam:ExamId,section:string,seed:string)=>`section2~${exam}-${section}|${seed}`;
export const reviewerTopicKey=(exam:ExamId,concept:string,seed:string)=>`topic2~${exam}-${concept}|${seed}`;
export const reviewerFullKey=(exam:ExamId,seed:string)=>`full2~${exam}|${seed}`;
