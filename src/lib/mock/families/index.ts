import {rng,fmt,tex} from '../prng.ts';
import type {Family,MockItem} from '../types.ts';
import {MATH_FAMILIES} from './math.ts';
import {SCIENCE_FAMILIES} from './science.ts';

export const FAMILIES:Family[]=[...MATH_FAMILIES,...SCIENCE_FAMILIES];
export const FAMILY_BY_ID:Record<string,Family>=Object.fromEntries(FAMILIES.map(f=>[f.id,f]));

/** A generated item: a pure function of (familyId, seed). The builder is retried
 *  on the same seeded stream until its key and three distractors print differently. */
export function generateItem(familyId:string,seed:number|string):MockItem{
 const family=FAMILY_BY_ID[familyId];
 if(!family)throw Error(`Unknown family ${familyId}`);
 const r=rng(`${familyId}:${seed}`);
 for(let attempt=0;attempt<60;attempt++){
  const d=family.build(r);
  if(!d||d.wrong.length<3)continue;
  const show=d.show??((v:number)=>tex(fmt(v)));
  const wrong=d.wrong.slice(0,3);
  if(![d.answer,...wrong.map(w=>w.value)].every(Number.isFinite))continue;
  const texts=[show(d.answer),...wrong.map(w=>show(w.value))];
  if(new Set(texts).size!==4)continue;
  if(new Set(wrong.map(w=>w.misconception)).size!==3)continue;
  const order=r.shuffle([0,1,2,3]);
  const choices=order.map(i=>texts[i]);
  const misconceptions=order.map(i=>i===0?null:wrong[i-1].misconception);
  return {id:`${familyId}:${seed}`,source:'family',familyId,subtest:family.subtest,lang:'en',stem:d.stem,choices,answerIndex:order.indexOf(0),solutionSteps:d.steps,misconceptions,skill:family.skill,concept:family.concept,difficulty:family.difficulty,khanRef:family.khanRef,reviewerChapter:family.reviewerChapter,check:{expr:d.expr,value:d.answer},status:'draft'};
 }
 throw Error(`Family ${familyId} could not build distinct choices for seed ${seed}`);
}
