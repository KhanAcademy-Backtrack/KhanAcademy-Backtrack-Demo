'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useProgram} from './ProgramProvider';
import {NavIcon,STUDY_TOOLS,HOME_SHORTCUTS} from './AppNav';
import {cx} from './ui';
import {t} from '@/lib/i18n';
import {recallPrompt} from '@/lib/program/recall';

/** A short live note under a tool: what is waiting there for this learner. */
function useToolNotes(){
 const {state}=useProgram(),[now,setNow]=useState<number>();
 useEffect(()=>setNow(Date.now()),[]);
 const due=now?Object.entries(state.recall).filter(([key,c])=>c.due<=now&&recallPrompt(key)).length:0;
 return (key:string)=>key==='recall'&&due?`${due} ready today`:undefined;
}

/** The Study page's cards: practice exams and daily recall, with what each is for. */
const CARDS=new Set(['mocks','recall']);
export function StudyTools(){
 const note=useToolNotes(),{state:{lang}}=useProgram();
 return <ul aria-label={t(lang,'nav.studyTools')} className="grid gap-3 sm:grid-cols-2">{STUDY_TOOLS.filter(x=>CARDS.has(x.key)).map(x=><li key={x.key} className="min-w-0">
  <Link href={x.href} className="flex h-full min-h-28 gap-3 rounded-xl bg-white p-4 shadow-sheet hover:outline-2 hover:outline-line-strong focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy">
   <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-navy"><NavIcon k={x.icon}/></span>
   <span className="min-w-0"><span className="block font-extrabold leading-tight"><Headline>{t(lang,x.label)}</Headline></span><span className="mt-1 block text-sm leading-snug text-ink-soft">{x.blurb}</span>
    {note(x.key)&&<span className="mt-2 inline-block rounded-md bg-mint px-2 py-0.5 text-xs font-bold text-navy">{note(x.key)}</span>}</span>
  </Link>
 </li>)}</ul>;
}

/** Courses, CET reviewers, practice exams and daily recall as one row of buttons on the home page. */
export function HomeShortcuts({className}:{className?:string}){
 const note=useToolNotes(),{state:{lang}}=useProgram();
 return <nav aria-label={t(lang,'nav.shortcuts')} className={cx('min-w-0',className)}>
  <ul className="flex flex-wrap gap-2">{HOME_SHORTCUTS.map(x=><li key={x.key}>
   <Link href={x.href} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-transparent px-3.5 text-[14px] font-semibold text-navy hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy">
    <NavIcon small k={x.icon}/><Headline>{t(lang,x.label)}</Headline>{note(x.key)&&<><span aria-hidden="true" className="rounded-md bg-green px-1.5 text-xs font-bold text-navy">{note(x.key)?.split(' ')[0]}</span><span className="sr-only">, {note(x.key)}</span></>}
   </Link>
  </li>)}</ul>
 </nav>;
}
