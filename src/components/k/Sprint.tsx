'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {formFromKey,formItems,itemById} from '@/lib/mock/forms';
import {useProgram} from './ProgramProvider';
import {newAttempt} from '@/lib/program/store';
import {Question} from './Question';
import {btn,cx} from './ui';
import {SUBTEST_SHORT} from '@/lib/mock/types';
import type {Lang} from '@/lib/i18n';

/** A short practice set answered one question at a time with instant checking.
 *  Used by the landing page's live sprint and Today's Daily 3. */
export function Sprint({formKey,lang='en',onFinish,finishLabel='See how you did',spacious=false}:{formKey:string;lang?:Lang;onFinish:(r:{answers:Record<string,number|null>;idk:string[];correct:number;total:number})=>void;finishLabel?:string;spacious?:boolean}){
 const {update}=useProgram();
 const ids=useMemo(()=>{const f=formFromKey(formKey);return f?formItems(f):[];},[formKey]);
 const [i,setI]=useState(0),[answers,setAnswers]=useState<Record<string,number|null>>({}),[idk,setIdk]=useState<string[]>([]),[revealed,setRevealed]=useState<string[]>([]);
 const draftKey=formKey.startsWith('daily2~')?`backtrack.daily-draft.v2.${formKey}`:undefined,[loaded,setLoaded]=useState(!draftKey),finished=useRef(false),draft=useRef({i,answers,idk,revealed});
 const panel=useRef<HTMLDivElement>(null);
 draft.current={i,answers,idk,revealed};
 useEffect(()=>{if(draftKey)try{const d=JSON.parse(localStorage.getItem(draftKey)||'null');if(d?.version===1&&Number.isInteger(d.i)&&d.i>=0&&d.i<ids.length&&d.answers&&typeof d.answers==='object'&&!Array.isArray(d.answers)&&Object.entries(d.answers).every(([key,v])=>ids.includes(key)&&(v===null||Number.isInteger(v)&&Number(v)>=0&&Number(v)<4))&&Array.isArray(d.idk)&&d.idk.every((x:string)=>ids.includes(x))&&Array.isArray(d.revealed)&&d.revealed.every((x:string)=>ids.includes(x))){setI(d.i);setAnswers(d.answers);setIdk(d.idk);setRevealed([...new Set<string>(d.revealed)]);}}catch{}setLoaded(true);},[draftKey,ids]);
 useEffect(()=>{if(!draftKey||!loaded)return;const save=()=>{try{localStorage.setItem(draftKey,JSON.stringify({version:1,...draft.current}));}catch{}};save();window.addEventListener('pagehide',save);return()=>window.removeEventListener('pagehide',save);},[draftKey,loaded,i,answers,idk,revealed]);
 useEffect(()=>{if(loaded&&spacious)panel.current?.scrollIntoView({block:'start',behavior:'instant'});},[loaded,spacious,i]);
 const id=ids[i],item=id?itemById(id):undefined;if(!item)return null;
 const done=revealed.length,last=i===ids.length-1;
 const finish=()=>{if(finished.current)return;finished.current=true;const correct=ids.filter(x=>answers[x]===itemById(x)?.answerIndex).length;const at=Date.now(),attempt={...newAttempt(formKey,false,at),answers,idk,submittedAt:at};update(s=>{const misses=ids.filter(x=>answers[x]!==itemById(x)?.answerIndex),recall={...s.recall};for(const x of misses)recall[`item:${x}`]={due:at+86400000,stage:0,last:at};return {...s,attempts:[...s.attempts,attempt],recall,notebook:[...s.notebook,...misses.map(x=>({itemId:x,at,formKey,chosen:answers[x]??null,idk:idk.includes(x),concept:itemById(x)!.concept}))]};});onFinish({answers,idk,correct,total:ids.length});};
 if(!loaded)return <p role="status">Opening your daily practice…</p>;
 return <div ref={panel} className={spacious?'scroll-mt-20':undefined}>
  <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-sky px-4 py-3"><div><p className="text-xs font-semibold text-ink-soft">Correct so far</p><p className="mt-1 text-xl font-bold">{revealed.filter(x=>answers[x]===itemById(x)?.answerIndex).length}</p></div><div><p className="text-xs font-semibold text-ink-soft">Completed</p><p className="mt-1 text-xl font-bold">{done} / {ids.length}</p></div><div className="text-right"><p className="text-sm font-bold">Question {i+1} of {ids.length} · {SUBTEST_SHORT[item.subtest]}</p><div aria-label={`${done} of ${ids.length} answered`} role="img" className="mt-2 flex gap-1">{ids.map(x=><span key={x} className={cx('h-1.5 w-7 rounded-sm',revealed.includes(x)?'bg-green':'bg-navy/15')}/>)}</div></div></div>
  <Question key={id} item={item} mode="practice" spacious={spacious} lang={lang} chosen={answers[id]??null} idk={idk.includes(id)} revealed={revealed.includes(id)}
   onChoose={c=>{setAnswers(a=>({...a,[id]:c}));setIdk(x=>x.filter(y=>y!==id));}}
   onIdk={()=>{setIdk(x=>x.includes(id)?x.filter(y=>y!==id):[...x,id]);setAnswers(a=>({...a,[id]:null}));}}
   onReveal={()=>setRevealed(r=>[...r,id])}/>
  {revealed.includes(id)&&<div className="mt-5 flex justify-end">{last?<button className={btn.dark} onClick={finish}>{finishLabel}</button>:<button className={btn.dark} onClick={()=>setI(i+1)}>Next question</button>}</div>}
 </div>;
}
