import {CHAPTER_BY_ID} from '../../content/reviewer/index.ts';
import {CONCEPT_BY_ID} from './concepts.ts';
import {itemById} from '../mock/forms.ts';
import type {RecallCard} from './store.ts';

export type RecallPrompt={title:string;front:string;back:string[];href:string};
/** All three saved key types resolve to a readable recall prompt. Self-report
 * updates spacing only; it never passes an independent recovery check. */
export function recallPrompt(key:string):RecallPrompt|undefined{
 if(key.startsWith('concept:')){const c=CONCEPT_BY_ID[key.slice(8)];return c?{title:c.title,front:`What is the main rule for ${c.title.toLowerCase()}?`,back:[c.tldr.rule,...c.tldr.must],href:`/learn/${c.id}`}:undefined;}
 if(key.startsWith('card:')){const [,id,index]=key.split(':'),c=CHAPTER_BY_ID[id],r=c?.recall[Number(index)];return r?{title:c.title,front:r.front,back:[r.back],href:`/reviewer/${id}`}:undefined;}
 if(key.startsWith('item:')){const it=itemById(key.slice(5));return it?{title:'A question you missed',front:it.stem,back:[it.choices[it.answerIndex],...it.solutionSteps],href:`/learn/${it.concept}`}:undefined;}
}
export function recallNext(card:RecallCard,remembered:boolean,now:number):RecallCard{
 const sameDay=Math.floor(card.last/86400000)===Math.floor(now/86400000);
 const stage=remembered?Math.min(3,card.stage+(sameDay?0:1)):0;
 return {stage,last:now,due:now+([1,3,7,14][stage])*86400000};
}
