'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useProgram} from './ProgramProvider';
import {Sprint} from './Sprint';
import {Sheet,btn,cx} from './ui';
import {parseDay} from '@/lib/program/planner';

export function DailyPractice({className}:{className?:string}){
 const {state,update,today}=useProgram(),key=`daily2~${today.replace(/-/g,'')}`,done=state.daily[today];
 const [started,setStarted]=useState(false);
 useEffect(()=>{try{setStarted(!!localStorage.getItem(`backtrack.daily-draft.v2.${key}`));}catch{setStarted(false);}},[key]);
 return <Sheet className={cx('min-w-0',className)} data-daily-practice><div className={cx('flex flex-wrap items-center justify-between gap-4',(started||done)&&'mb-5')}><div><p className="text-sm font-semibold text-ink-soft">{parseDay(today).toLocaleDateString('en-PH',{weekday:'long',month:'short',day:'numeric'})}</p><h2 className="mt-1 text-2xl font-extrabold tracking-[-.02em]">Daily 3</h2>{!started&&!done&&<p className="mt-1 text-ink-soft">Three questions, one at a time. A new mixed set each day.</p>}</div>{started&&!done?<span className="text-xs font-semibold text-ink-soft">Saves as you go</span>:!done&&<button className={btn.primary} onClick={()=>setStarted(true)}>Start today’s practice</button>}</div>
  {done?<div className="rounded-xl bg-mint p-5"><h3 className="text-xl font-bold">Today’s set is complete</h3><p className="mt-2">{done.correct} of {done.total} correct. Your results are saved.</p><p className="mt-2 text-sm text-ink-soft">A different set will be ready tomorrow.</p><Link href="/notebook" className={cx(btn.ghost,'mt-4')}>Review missed questions</Link></div>:started&&<Sprint key={key} formKey={key} lang={state.lang} spacious finishLabel="Finish" onFinish={r=>update(s=>({...s,daily:{...s.daily,[today]:{correct:r.correct,total:r.total}},studyDays:[...s.studyDays,today]}))}/>}
 </Sheet>;
}
