import {itemById,formItems,type Form} from './forms.ts';
import {bandFor,SCORING,UPCAT_BLUEPRINT} from './blueprint.ts';
import {misconception} from './misconceptions.ts';
import type {MockItem,Subtest} from './types.ts';

export type Triage='didnt_know'|'careless'|'out_of_time';
export type Sure='sure'|'unsure';
/** One learner's work on one form. Answers are choice indexes; null is blank. */
export type Attempt={id:string;formKey:string;startedAt:number;updatedAt:number;submittedAt?:number;timed:boolean;answers:Record<string,number|null>;flags:string[];idk:string[];sure:Record<string,Sure>;seconds:Record<string,number>;triage:Record<string,Triage>;section:number;index:number;pausedMs:number;elapsedMs:Record<number,number>;manual?:boolean};

export type Miss={item:MockItem;chosen:number|null;idk:boolean;misconceptionId?:string;seconds:number;sure?:Sure};
export type SubtestScore={subtest:Subtest;correct:number;total:number;blank:number;idk:number;percent:number;band:ReturnType<typeof bandFor>;seconds:number;minutes:number};
export type Result={total:{correct:number;total:number;percent:number};subtests:SubtestScore[];concepts:{concept:string;subtest:Subtest;correct:number;total:number}[];misses:Miss[];sureButWrong:number;seconds:number};

export function scoreAttempt(form:Form,attempt:Attempt):Result{
 const subtests:SubtestScore[]=[],misses:Miss[]=[];
 const concepts=new Map<string,{concept:string;subtest:Subtest;correct:number;total:number}>();
 let correct=0,total=0,sureButWrong=0,seconds=0;
 form.sections.forEach((section,si)=>{
  let c=0,t=0,blank=0,idk=0,sec=0;
  for(const id of section.itemIds){
   const item=itemById(id);if(!item)continue;
   const chosen=attempt.answers[id]??null,ok=chosen===item.answerIndex,s=attempt.seconds[id]??0;
   t++;sec+=s;if(chosen===null){if(attempt.idk.includes(id))idk++;else blank++;}
   if(ok)c++;else{misses.push({item,chosen,idk:attempt.idk.includes(id),misconceptionId:chosen===null?undefined:item.misconceptions[chosen]??undefined,seconds:s,sure:attempt.sure[id]});if(chosen!==null&&attempt.sure[id]==='sure')sureButWrong++;}
   const k=concepts.get(item.concept)??{concept:item.concept,subtest:item.subtest,correct:0,total:0};k.total++;if(ok)k.correct++;concepts.set(item.concept,k);
  }
  const elapsed=Math.round((attempt.elapsedMs[si]??sec*1000)/1000);
  const percent=t?Math.round(c/t*100):0;
  subtests.push({subtest:section.subtest,correct:c*SCORING.correct,total:t,blank,idk,percent,band:bandFor(percent),seconds:Math.max(elapsed,sec),minutes:section.minutes});
  correct+=c;total+=t;seconds+=Math.max(elapsed,sec);
 });
 return {total:{correct,total,percent:total?Math.round(correct/total*100):0},subtests,concepts:[...concepts.values()],misses,sureButWrong,seconds};
}

/** A gentle, honest pace check: how far a learner would have got in the exam's time
 *  at the pace they actually worked. Never a predicted score. */
export function paceCheck(score:SubtestScore){
 const blueprint=UPCAT_BLUEPRINT[score.subtest];
 if(!score.total||!score.seconds)return undefined;
 const perItem=score.seconds/score.total,limit=blueprint.minutes*60;
 const reach=Math.min(blueprint.items,Math.floor(limit/perItem));
 return {reach,items:blueprint.items,perItem:Math.round(perItem),target:Math.round(limit/blueprint.items),onPace:reach>=blueprint.items};
}

/** Misses grouped by the misconception behind them, biggest first. */
export function missGroups(misses:Miss[]){
 const groups=new Map<string,{id:string;count:number;items:Miss[]}>();
 for(const m of misses){const id=m.misconceptionId&&misconception(m.misconceptionId)?m.misconceptionId:`blank:${m.item.concept}`;const g=groups.get(id)??{id,count:0,items:[]};g.count++;g.items.push(m);groups.set(id,g);}
 return [...groups.values()].sort((a,b)=>b.count-a.count);
}

export const answeredCount=(form:Form,attempt:Attempt)=>formItems(form).filter(id=>attempt.answers[id]!==undefined&&attempt.answers[id]!==null).length;
