import type {Attempt,Triage} from './scoring.ts';
import {itemById} from './forms.ts';

/** A first guess at why each miss happened, which the learner can change. Blanks
 *  late in a timed section suggest time ran out; a fast miss marked "sure" suggests a
 *  careless slip; everything else starts as "didn't know yet". */
export function suggestTriage(itemIds:string[],attempt:Attempt,correctOf:(id:string)=>number|undefined):Record<string,Triage>{
 const out:Record<string,Triage>={};
 const lastAnswered=Math.max(-1,...itemIds.map((id,i)=>attempt.answers[id]!=null?i:-1));
 const times=itemIds.map(id=>attempt.seconds[id]??0).filter(Boolean).sort((a,b)=>a-b),median=times[Math.floor(times.length/2)]??0;
 itemIds.forEach((id,i)=>{
  const key=correctOf(id),chosen=attempt.answers[id];
  if(key===undefined||chosen===key)return;
  if(attempt.idk.includes(id))out[id]='didnt_know';
  else if(chosen==null)out[id]=attempt.timed&&i>lastAnswered?'out_of_time':'didnt_know';
  else if(attempt.sure[id]==='sure'&&(attempt.seconds[id]??0)<=median)out[id]='careless';
  else out[id]='didnt_know';
 });
 return out;
}

/** Classical item analysis for the coach: difficulty (share correct) and
 *  discrimination (upper minus lower 27 percent), from many learners' attempts. */
export function itemAnalysis(itemIds:string[],attempts:Attempt[]){
 const scored=attempts.map(a=>({a,score:itemIds.filter(id=>a.answers[id]===itemById(id)?.answerIndex).length})).sort((x,y)=>y.score-x.score);
 const k=Math.max(1,Math.round(scored.length*.27)),upper=scored.slice(0,k),lower=scored.slice(-k);
 return itemIds.map(id=>{const key=itemById(id)?.answerIndex,p=(g:typeof scored)=>g.filter(x=>x.a.answers[id]===key).length/g.length;return {id,difficulty:scored.length?p(scored):0,discrimination:scored.length?p(upper)-p(lower):0};});
}
