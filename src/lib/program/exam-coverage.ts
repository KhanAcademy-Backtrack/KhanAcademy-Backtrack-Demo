import type {Subtest} from '../mock/types.ts';
import type {ExamId} from './admissions.ts';

/** Each entrance exam's own sections, in its own words, and the reviewer material
 *  that serves each one. Sources and check dates are in docs/research/2026-10-04/CET_COVERAGE.md.
 *
 *  A section's `reviewer` lists the reviewer subjects it draws on; an empty list
 *  means the reviewer has nothing for it yet. `lang` narrows Language Proficiency
 *  material: 'en' leaves out the Filipino guides, 'fil' keeps only them.
 *  `source`: 'official' when the exam's own published material lists the sections,
 *  'team' when the Khanpanion team supplied them, 'reported' when they come from
 *  public preparation guides because the school publishes no list. */
export type Section={name:string;reviewer:Subtest[];lang?:'en'|'fil'};
export type ExamCoverage={sections:Section[];source:'official'|'team'|'reported';checked:string};

const english:Section={name:'English',reviewer:['language','reading'],lang:'en'};
const math:Section={name:'Mathematics',reviewer:['math']};
const science:Section={name:'Science',reviewer:['science']};
const none=(name:string):Section=>({name,reviewer:[]});
const checked='2026-10-04';

export const EXAM_COVERAGE:Record<ExamId,ExamCoverage>={
 upcat:{sections:[{name:'Language Proficiency',reviewer:['language']},{name:'Reading Comprehension',reviewer:['reading']},math,science],source:'official',checked},
 dcat:{sections:[math,science,english,none('Mental Ability')],source:'team',checked},
 dostsei:{sections:[none('Creative Reasoning'),{name:'Language and Literature',reviewer:['language','reading'],lang:'en'},science,math],source:'official',checked},
 pupcet:{sections:[math,english,science,none('General Information'),none('Abstract Reasoning')],source:'team',checked},
 ustet:{sections:[english,math,science,none('Mental Ability')],source:'official',checked},
 acet:{sections:[math,english,none('General Knowledge'),none('Abstract Reasoning'),none('Essay')],source:'official',checked},
 plmat:{sections:[english,{name:'Filipino',reviewer:['language'],lang:'fil'},math,science,none('Abstract Reasoning')],source:'reported',checked},
 tupstat:{sections:[english,math,science,none('Technical Reasoning')],source:'reported',checked},
 msusase:{sections:[english,math,science,none('Mental Aptitude')],source:'reported',checked}
};

/** Reviewer material written in Filipino. */
export const FILIPINO_CONCEPT_AREA='Filipino';
export const FILIPINO_EXTRAS=new Set(['x_grammar_fil']);

/** Whether one reviewer entry serves a section. */
export function inSection(section:Section,subtest:Subtest,filipino:boolean){
 if(!section.reviewer.includes(subtest))return false;
 if(subtest!=='language'||!section.lang)return true;
 return section.lang==='fil'?filipino:!filipino;
}
/** Whether a reviewer entry belongs to an exam. `exam` undefined means every CET. */
export function inCoverage(exam:ExamId|undefined,subtest:Subtest,filipino:boolean){
 return !exam||EXAM_COVERAGE[exam].sections.some(s=>inSection(s,subtest,filipino));
}
/** Whether an exam has a Filipino part, which decides whether Filipino handbooks show. */
export function hasFilipino(exam:ExamId){
 return EXAM_COVERAGE[exam].sections.some(s=>s.reviewer.includes('language')&&s.lang!=='en');
}
