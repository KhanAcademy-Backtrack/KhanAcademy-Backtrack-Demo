import type {Subtest} from '../../lib/mock/types.ts';
import type {Topic,Skill} from '../../lib/recovery.ts';

/** A complete reviewer chapter. The page renders every part in this order:
 *  summary, worked examples (three levels), traps, a tip from the team, Khan links,
 *  a practice set with full solutions, recall cards, and "if this felt hard". */
export type Chapter={
 id:string;subtest:Subtest;concept:string;title:string;
 summary:{intro:string;sections:{heading:string;body:string[];formula?:string}[]};
 examples:{level:'Warm-up'|'Exam level'|'Stretch';q:string;steps:string[];answer:string}[];
 /** Misconception ids from the mock bank, or written traps for language and reading. */
 traps:(string|{label:string;fix:string})[];
 tip:string;
 practice:{families?:string[];items?:string[]};
 recall:{front:string;back:string}[];
 hard:{text:string;engine?:{topic:Topic;skill:Skill};concepts:string[]};
 author:string;reviewer:string;status:'draft'|'reviewed';createdAt:string;
};
export const TEAM='Khanpanion team';
export const DRAFTED='2026-09-30';
