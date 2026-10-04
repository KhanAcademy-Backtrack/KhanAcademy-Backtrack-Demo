import type {Subtest} from '../mock/types.ts';
import type {ExamId} from './admissions.ts';

/** Which reviewer subjects each entrance exam actually tests, so the reviewer can
 *  show only those. Sources and check dates are in docs/research/2026-10-04/CET_COVERAGE.md.
 *  `official` is true only when the exam's own published material lists the sections.
 *  When sources disagree, a subject stays in: leaving out a tested subject is worse
 *  than keeping one extra. */
export type ExamCoverage={
 subtests:Subtest[];
 /** Whether the language part includes Filipino. */
 filipino:boolean;
 /** Tested sections the reviewer has no material for yet. */
 notCovered:string[];
 official:boolean;
 checked:string;
};
export const EXAM_COVERAGE:Record<ExamId,ExamCoverage>={
 upcat:{subtests:['language','reading','math','science'],filipino:true,notCovered:[],official:true,checked:'2026-10-04'},
 dostsei:{subtests:['language','reading','math','science'],filipino:false,notCovered:['Creative reasoning (mechanical, spatial and verbal reasoning)'],official:true,checked:'2026-10-04'},
 dcat:{subtests:['language','reading','math','science'],filipino:false,notCovered:['Mental ability (abstract, numerical and logical reasoning)'],official:false,checked:'2026-10-04'},
 pupcet:{subtests:['language','reading','math','science'],filipino:true,notCovered:['Abstract reasoning'],official:false,checked:'2026-10-04'}
};

/** Reviewer material written in Filipino, left out for English-only exams. */
export const FILIPINO_CONCEPT_AREA='Filipino';
export const FILIPINO_EXTRAS=new Set(['x_grammar_fil']);

/** Whether a reviewer entry belongs to an exam's coverage. `exam` undefined means every CET. */
export function inCoverage(exam:ExamId|undefined,subtest:Subtest,filipino:boolean){
 if(!exam)return true;
 const c=EXAM_COVERAGE[exam];
 return c.subtests.includes(subtest)&&(c.filipino||!filipino);
}
