'use client';
import {useMemo,useState} from 'react';
import {formFromKey,formItems,itemById} from '@/lib/mock/forms';
import {Question} from './Question';
import {OvalRow,btn} from './ui';
import type {Lang} from '@/lib/i18n';

/** A short practice set answered one question at a time with instant checking.
 *  Used by the landing page's live sprint and Today's Daily 3. */
export function Sprint({formKey,lang='en',onFinish,finishLabel='See how you did'}:{formKey:string;lang?:Lang;onFinish:(r:{answers:Record<string,number|null>;idk:string[];correct:number;total:number})=>void;finishLabel?:string}){
 const ids=useMemo(()=>{const f=formFromKey(formKey);return f?formItems(f):[];},[formKey]);
 const [i,setI]=useState(0),[answers,setAnswers]=useState<Record<string,number|null>>({}),[idk,setIdk]=useState<string[]>([]),[revealed,setRevealed]=useState<string[]>([]);
 const id=ids[i],item=id?itemById(id):undefined;if(!item)return null;
 const done=revealed.length,last=i===ids.length-1;
 const finish=()=>{const correct=ids.filter(x=>answers[x]===itemById(x)?.answerIndex).length;onFinish({answers,idk,correct,total:ids.length});};
 return <div>
  <div className="mb-4 flex items-center justify-between gap-3"><OvalRow done={done} total={ids.length} label={`${done} of ${ids.length} answered`}/><span className="text-sm font-semibold text-ink-soft">Question {i+1} of {ids.length}</span></div>
  <Question key={id} item={item} mode="practice" lang={lang} chosen={answers[id]??null} idk={idk.includes(id)} revealed={revealed.includes(id)}
   onChoose={c=>{setAnswers(a=>({...a,[id]:c}));setIdk(x=>x.filter(y=>y!==id));}}
   onIdk={()=>{setIdk(x=>x.includes(id)?x.filter(y=>y!==id):[...x,id]);setAnswers(a=>({...a,[id]:null}));}}
   onReveal={()=>setRevealed(r=>[...r,id])}/>
  {revealed.includes(id)&&<div className="mt-5 flex justify-end">{last?<button className={btn.dark} onClick={finish}>{finishLabel}</button>:<button className={btn.dark} onClick={()=>setI(i+1)}>Next question</button>}</div>}
 </div>;
}
