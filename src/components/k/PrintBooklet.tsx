'use client';
import {useMemo,useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {useProgram} from './ProgramProvider';
import {PassageView} from './Question';
import {btn,Oval,cx,Wordmark} from './ui';
import {formFromKey,formItems,itemById} from '@/lib/mock/forms';
import {newAttempt} from '@/lib/program/store';
import {SUBTEST_LABEL} from '@/lib/mock/types';

const LETTERS=['A','B','C','D'];

/** A printable booklet and answer sheet for short bond paper, plus manual answer
 *  entry so a paper sitting can be scored on the phone. */
export function PrintBooklet(){
 const params=useSearchParams(),router=useRouter(),{update}=useProgram();
 const key=params.get('f')??'';
 const form=useMemo(()=>/^[a-z]+~[\w|-]+$/.test(key)?formFromKey(key):undefined,[key]);
 const [entry,setEntry]=useState(false),[answers,setAnswers]=useState<Record<string,number|null>>({});
 if(!form)return <p className="p-8">This booklet link is not complete.</p>;
 const ids=formItems(form);let n=0;
 function score(){const a=newAttempt(`${key}`,false,Date.now());const done={...a,answers,submittedAt:Date.now(),manual:true};update(s=>({...s,attempts:[...s.attempts.filter(x=>x.formKey!==key||x.submittedAt),done]}));router.push(`/mock/result?a=${done.id}`);}
 return <div className="bg-white text-navy print:text-black">
  <div className="mx-auto max-w-[8.5in] px-5 py-8 print:px-0 print:py-0">
   <div className="flex flex-wrap items-center justify-between gap-3 print:hidden"><Wordmark small/><div className="flex flex-wrap gap-2"><button className={btn.dark} onClick={()=>window.print()}>Print booklet and answer sheet</button><button className={btn.ghost} aria-pressed={entry} onClick={()=>setEntry(!entry)}>{entry?'Back to the booklet':'Enter answers from paper'}</button></div></div>
   {!entry?<>
    <header className="mt-6 border-b-2 border-navy pb-3 print:mt-0"><h1 className="text-2xl font-extrabold">{form.title}</h1><p className="text-sm">Khanpanion practice booklet · {ids.length} questions · khanpanion.vercel.app</p></header>
    {form.sections.map((sec,si)=><section key={si} className="mt-6 break-inside-avoid-page"><h2 className="text-xl font-bold">{SUBTEST_LABEL[sec.subtest]} · {sec.minutes} minutes</h2>
     <ol className="mt-3 grid gap-5">{sec.itemIds.map((id,xi)=>{const it=itemById(id)!;n++;const showPassage=it.passageId&&(xi===0||itemById(sec.itemIds[xi-1])?.passageId!==it.passageId);return <li key={id} className="break-inside-avoid">{showPassage&&<div className="mb-3"><PassageView id={it.passageId!}/></div>}<p className="font-serif text-[16px] leading-snug print:text-[11pt]"><b className="font-sans">{n}.</b> {it.stem}</p><ol className="mt-1 grid gap-0.5 pl-6 font-serif text-[15px] print:text-[10.5pt] sm:grid-cols-2">{it.choices.map((c,i)=><li key={i}>{LETTERS[i]}. {c}</li>)}</ol></li>;})}</ol></section>)}
    <section className="mt-10 break-before-page"><h2 className="text-xl font-bold">Answer sheet</h2><p className="text-sm">Shade one oval per question.</p><div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4 print:grid-cols-4">{ids.map((id,i)=><div key={id} className="flex items-center gap-1"><span className="w-7 text-right text-sm font-bold">{i+1}</span>{LETTERS.map(l=><Oval key={l} label={l} size={24}/>)}</div>)}</div></section>
    <section className="mt-10 break-before-page"><h2 className="text-xl font-bold">Answer key</h2><p className="text-sm">Cut this page off before handing out the booklet.</p><div className="mt-3 grid grid-cols-5 gap-1 text-sm sm:grid-cols-10">{ids.map((id,i)=><span key={id}>{i+1}. {LETTERS[itemById(id)!.answerIndex]}</span>)}</div></section>
   </>:<div className="mt-6"><h1 className="text-2xl font-extrabold">Enter answers from paper</h1><p className="mt-1 text-ink-soft">Tap the oval each question was shaded with. Leave blanks empty.</p>
    <div className="mt-4 grid gap-2 sm:grid-cols-2">{ids.map((id,i)=><div key={id} className="flex items-center gap-2"><span className="w-8 text-right font-bold">{i+1}</span>{LETTERS.map((l,c)=><button key={l} aria-label={`Question ${i+1}, ${l}`} aria-pressed={answers[id]===c} onClick={()=>setAnswers(a=>({...a,[id]:a[id]===c?null:c}))} className="grid min-h-11 min-w-11 place-items-center rounded-full"><Oval filled={answers[id]===c} label={l} size={34}/></button>)}</div>)}</div>
    <button className={cx(btn.primary,'mt-6')} onClick={score}>Score this sheet</button></div>}
  </div>
 </div>;
}
