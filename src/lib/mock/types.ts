import type {KhanUnitId} from '../program/khan-units.ts';
import type {Rng} from './prng.ts';

export type Subtest='math'|'science'|'language'|'reading';
export const SUBTESTS:Subtest[]=['language','reading','math','science'];
export const SUBTEST_LABEL:Record<Subtest,string>={language:'Language Proficiency',reading:'Reading Comprehension',math:'Mathematics',science:'Science'};
export const SUBTEST_SHORT:Record<Subtest,string>={language:'Language',reading:'Reading',math:'Math',science:'Science'};

/** One multiple-choice item, generated or authored. Exactly four choices. */
export type MockItem={
 id:string;
 source:'family'|'authored';
 familyId?:string;
 subtest:Subtest;
 lang:'en'|'fil';
 stem:string;
 passageId?:string;
 choices:string[];
 answerIndex:number;
 solutionSteps:string[];
 /** One entry per choice: null for the key, a misconception id for each distractor. */
 misconceptions:(string|null)[];
 /** One entry per choice, for authored items. Generated items explain through misconceptions. */
 rationales?:string[];
 skill:string;
 concept:string;
 difficulty:1|2|3;
 khanRef?:KhanUnitId;
 reviewerChapter:string;
 /** Arithmetic that recomputes the key, checked by the test suite. */
 check?:{expr:string;value:number};
 status:'draft'|'reviewed';
 author?:string;
 reviewer?:string;
 createdAt?:string;
};

/** What a family's builder returns for one set of parameters. */
export type Draft={
 stem:string;
 answer:number;
 /** Plain arithmetic (+ − × ÷ ^ and brackets) that evaluates to `answer`. */
 expr:string;
 steps:string[];
 wrong:{value:number;misconception:string}[];
 show?:(value:number)=>string;
};

export type Family={
 id:string;
 subtest:'math'|'science';
 title:string;
 skill:string;
 concept:string;
 difficulty:1|2|3;
 reviewerChapter:string;
 khanRef:KhanUnitId;
 build:(r:Rng)=>Draft|null;
};
