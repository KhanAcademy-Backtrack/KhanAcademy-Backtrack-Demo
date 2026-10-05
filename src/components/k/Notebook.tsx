'use client';
import Link from 'next/link';
import {useState} from 'react';
import {useProgram} from './ProgramProvider';
import {WhyPanel,Explanation} from './Question';
import {PageBand,Sheet,btn,Oval,cx,pageBody,Pill} from './ui';
import {itemById} from '@/lib/mock/forms';
import {CONCEPT_BY_ID} from '@/lib/program/concepts';
import {misconception} from '@/lib/mock/misconceptions';
import {Rich} from '@/components/math/Math';

const LETTERS=['A','B','C','D'];

/** Every miss from mock exams and topic checks, grouped by topic. Retrying uses a
 *  fresh question; marking an entry understood is the learner's own note. */
export function Notebook(){
 const {state,update,today}=useProgram();
 const [showResolved,setShowResolved]=useState(false),[open,setOpen]=useState<string[]>([]);
 const entries=state.notebook.filter(n=>showResolved||!n.resolved).slice().reverse();
 const byConcept=new Map<string,typeof entries>();for(const e of entries){const l=byConcept.get(e.concept)??[];l.push(e);byConcept.set(e.concept,l);}
 const seed=today.replace(/-/g,'');
 return <>
  <PageBand title="Mistake notebook" lead="Revisit questions you missed or weren’t sure about. Read the explanation, then work on the topic behind the question."/>
  <div className={pageBody}>
   <Sheet><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-ink-soft">{state.notebook.filter(n=>!n.resolved).length} open · {state.notebook.filter(n=>n.resolved).length} understood</p><button className={btn.ghost} aria-pressed={showResolved} onClick={()=>setShowResolved(!showResolved)}>{showResolved?'Hide understood':'Show understood'}</button></div>
    {!entries.length&&<div className="py-8 text-center"><p className="font-serif text-2xl">Nothing here yet.</p><p className="mt-2 text-ink-soft">Take a sprint or a topic check. Anything you miss lands here with its fix.</p><Link href="/mock" className={cx(btn.primary,'mt-5')}>Choose a mock exam</Link></div>}
   </Sheet>
   {[...byConcept].map(([concept,list])=>{const c=CONCEPT_BY_ID[concept];return <Sheet key={concept} className="mt-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold">{c?.title??concept}</h2><p className="text-sm text-ink-soft">{list.length} entr{list.length===1?'y':'ies'}</p></div><div className="flex flex-wrap gap-2"><Link className={btn.ghost} href={`/learn/${concept}`}>What you need to know</Link><Link className={btn.primary} href={`/mock/take?f=topic~${concept}|n${seed}${list.length}&mode=practice`}>Retry with fresh questions</Link></div></div>
    <ul className="mt-4 grid gap-3">{list.map((e,k)=>{const it=itemById(e.itemId);if(!it)return null;const key=`${e.itemId}${e.at}`,isOpen=open.includes(key),m=e.misconception?misconception(e.misconception):undefined;return <li key={key+k} className={cx('rounded-2xl border-2 p-4',e.resolved?'border-mint-line opacity-70':'border-navy/10')}>
     <div className="flex flex-wrap items-start justify-between gap-2"><p className="font-serif text-lg leading-snug"><Rich>{it.stem}</Rich></p><div className="flex gap-2">{e.idk&&<Pill tone="sky">Didn’t know yet</Pill>}{m&&<Pill><Rich>{m.label}</Rich></Pill>}</div></div>
     <p className="mt-2 text-sm text-ink-soft">Your answer: {e.chosen===null?'none':<>{LETTERS[e.chosen]}. <Rich>{it.choices[e.chosen]}</Rich></>} · Correct: {LETTERS[it.answerIndex]}. <Rich>{it.choices[it.answerIndex]}</Rich></p>
     <div className="mt-3 flex flex-wrap gap-2"><button className={btn.ghost} aria-expanded={isOpen} onClick={()=>setOpen(o=>o.includes(key)?o.filter(x=>x!==key):[...o,key])}>{isOpen?'Hide the fix':'Show the fix'}</button><button className={btn.ghost} onClick={()=>update(s=>({...s,notebook:s.notebook.map(n=>n.itemId===e.itemId&&n.at===e.at?{...n,resolved:!n.resolved}:n)}))}><Oval filled={!!e.resolved} size={22}/>{e.resolved?'Understood':'I get it now'}</button></div>
     {isOpen&&<div className="mt-3 grid gap-3"><WhyPanel item={it} chosen={e.chosen} lang={state.lang}/><Explanation item={it}/></div>}
    </li>;})}</ul>
   </Sheet>;})}
  </div>
 </>;
}
