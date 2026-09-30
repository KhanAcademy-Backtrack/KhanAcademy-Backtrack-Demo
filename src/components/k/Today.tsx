'use client';
import Link from 'next/link';
import {useState} from 'react';
import {useProgram} from './ProgramProvider';
import {ProgressMoment} from './ProgressMoment';
import {Sprint} from './Sprint';
import {Sheet,btn,Oval,OvalRow,cx,KhanLink,Pill} from './ui';
import {Companion} from '@/components/study/Companion';
import {mission,weeks,focusRanking,statusOf,daysBetween,parseDay} from '@/lib/program/planner';
import {calendarItems} from '@/lib/program/calendar';
import {EXAMS} from '@/lib/program/admissions';
import {khanUrl,khanLabel} from '@/lib/program/khan-units';
import {PROGRAM_BY_ID} from '@/lib/program/bridge';
import {t} from '@/lib/i18n';

const longDate=(d:string)=>parseDay(d).toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric'});

export function Today(){
 const {state:s,update,today}=useProgram();const lang=s.lang;
 const [dailyDone,setDailyDone]=useState<{correct:number;total:number}|undefined>(s.daily[today]);
 const bridgeOnly=s.sides.bridge&&(!s.sides.admission||s.activeSide==='bridge');
 const m=mission(s,today),w=weeks(s,today),focus=focusRanking(s,bridgeOnly?['math','science']:undefined).slice(0,4);
 const mock=calendarItems(s,today).find(i=>i.kind==='mock'&&i.date>=today);
 const left=s.pledge?daysBetween(today,s.pledge.examDate):undefined;
 const markStudied=(step:'recall'|'khan'|'exit')=>update(p=>({...p,missions:{...p.missions,[today]:{...p.missions[today],[step]:Date.now()}},studyDays:[...p.studyDays,today]}));
 const conceptKhan=m.concept.khan[0],khanProgress=s.concepts[m.concept.id];
 const awaitingKhan=khanProgress?.khanOpened&&(!khanProgress.khanDone||khanProgress.khanDone<khanProgress.khanOpened)&&Date.now()-khanProgress.khanOpened<3*86400000;
 const allDone=m.steps.every(x=>x.done);
 const program=s.bridgeProgram?PROGRAM_BY_ID[s.bridgeProgram]:undefined;
 return <div className="min-h-screen bg-navy pb-28 md:pb-16">
  <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 sm:px-8 lg:grid-cols-[340px_1fr] lg:gap-8 lg:pt-10">
   <aside className="contents text-white lg:grid lg:content-start lg:gap-4">
    {s.pledge&&!bridgeOnly?<div className="overflow-hidden rounded-[22px] bg-navy-night">
     <div className="flex items-center justify-between bg-green px-5 py-2 text-sm font-bold text-navy"><span>{EXAMS[s.pledge.exam].name} target</span><span>{parseDay(s.pledge.examDate).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})}</span></div>
     <div className="px-5 pb-5 pt-4">{left!==undefined&&left>0?<><p className="text-[4rem] sm:text-[5.5rem] font-extrabold leading-none tracking-[-.06em]">{left}</p><p className="mt-1 text-lg text-white/80">{left===1?t(lang,'today.day'):t(lang,'today.days')} {EXAMS[s.pledge.exam].name}</p></>:<p className="text-2xl font-bold">{t(lang,'today.examToday')}</p>}
      {s.pledge.why&&<p className="mt-4 border-l-2 border-green pl-3 font-serif text-[17px] italic leading-snug text-white/90">“{s.pledge.why}”</p>}</div>
    </div>:program?<div className="rounded-[22px] bg-navy-night p-5"><p className="text-sm text-white/70">Getting ready for</p><p className="text-2xl font-extrabold">{program.title}</p><Link href={`/bridge/${program.id}`} className={cx(btn.onDark,'mt-4')}>Open my bridge map</Link></div>
    :<div className="rounded-[22px] bg-navy-night p-5"><p className="text-lg font-bold">Make a plan to your exam date.</p><Link href="/plan" className={cx(btn.primary,'mt-4')}>{t(lang,'onb.title')}</Link></div>}
    <div className="order-2 rounded-[22px] bg-navy-deep p-5 lg:order-none">
     <div className="flex items-baseline justify-between"><h2 className="font-bold">{t(lang,'today.week')}</h2><span className="text-sm text-white/70">{w.thisWeek.days} of {w.target} days</span></div>
     <div className="mt-3"><OvalRow tone="white" done={Math.min(w.thisWeek.days,w.target)} total={w.target} label={`${w.thisWeek.days} of ${w.target} study days this week`}/></div>
     <p className="mt-3 text-sm text-white/75">{w.shields?`${w.shields} streak shield${w.shields===1?'':'s'} saved. A shield covers a week that falls short.`:'Finish a full week to earn a streak shield.'}</p>
     <div className="mt-3 flex gap-1" aria-hidden="true">{w.rows.slice(0,-1).map(r=><span key={r.start} title={r.start} className={cx('h-2 flex-1 rounded-full',r.met?'bg-green':r.shielded?'bg-green/45':r.days?'bg-white/35':'bg-white/12')}/>)}</div>
    </div>
    {w.thisWeek.days>=w.target&&<div className="order-2 lg:order-none"><ProgressMoment>Week complete. You kept your routine.</ProgressMoment></div>}
    {mock&&<Link href="/calendar" className="rounded-[22px] bg-navy-deep p-5 order-3  hover:bg-navy-night lg:order-none"><p className="text-sm text-white/70">{t(lang,'today.nextMock')}</p><p className="mt-1 text-lg font-bold">{mock.title}</p><p className="text-white/80">{longDate(mock.date)}</p></Link>}
   </aside>
   <div className="contents lg:grid lg:content-start lg:gap-5">
    <Sheet className="order-1 lg:order-none">
     <div className="flex items-start gap-4"><Companion size={64} pose={allDone?'aha':'encourage'}/><div><h1 className="text-[1.7rem] font-extrabold leading-tight tracking-[-.03em]">{allDone?t(lang,'today.allDone'):t(lang,'today.mission')}</h1><p className="mt-1 text-ink-soft">{longDate(today)} · {m.concept.title}</p></div></div>
     {awaitingKhan&&conceptKhan&&<div className="mt-5 rounded-2xl bg-mint p-4"><p className="font-bold">Back from Khan Academy? How did it go?</p><p className="text-sm text-ink-soft">This is your own note. It never counts as a score.</p><div className="mt-3 flex flex-wrap gap-2">{[['done','I finished it'],['hard','Still hard']].map(([k,l])=><button key={k} className={btn.ghost} onClick={()=>update(p=>({...p,concepts:{...p.concepts,[m.concept.id]:{...(p.concepts[m.concept.id]??{checks:[]}),khanDone:Date.now()}},...(k==='hard'?{recall:{...p.recall,[`concept:${m.concept.id}`]:{due:Date.now(),stage:0,last:Date.now()}}}:{})}))}>{l}</button>)}</div></div>}
     <ol className="mt-6 grid gap-3">
      {m.steps.map((step,i)=><li key={step.id} className={cx('flex flex-wrap items-center gap-4 rounded-2xl border-2 p-4',step.done?'border-green bg-mint':'border-navy/10')}>
       <Oval filled={step.done} label={String(i+1)} size={40}/>
       <div className="min-w-0 flex-1"><p className="font-bold">{t(lang,`mission.${step.id}`)}</p><p className="text-sm text-ink-soft">{step.detail}</p></div>
       {step.id==='recall'&&<Link href="/review" onClick={()=>markStudied('recall')} className={step.done?btn.ghost:btn.dark}>{step.done?'Review more':t(lang,'mission.start')}</Link>}
       {step.id==='khan'&&(conceptKhan?<a href={khanUrl(conceptKhan)} target="_blank" rel="noopener noreferrer" onClick={()=>{markStudied('khan');update(p=>({...p,concepts:{...p.concepts,[m.concept.id]:{...(p.concepts[m.concept.id]??{checks:[]}),khanOpened:Date.now()}}}));}} className={step.done?btn.ghost:btn.dark}>Open Khan Academy <span aria-hidden="true">↗</span></a>
        :<Link href={`/learn/${m.concept.id}`} onClick={()=>markStudied('khan')} className={step.done?btn.ghost:btn.dark}>Read</Link>)}
       {step.id==='exit'&&<Link href={`/mock/take?f=exit~${m.concept.id}|${today.replace(/-/g,'')}&mode=practice`} className={step.done?btn.ghost:btn.primary}>{step.done?'Try again':t(lang,'mission.start')}</Link>}
      </li>)}
     </ol>
     <p className="mt-4 text-sm text-ink-soft">{conceptKhan?<>Khan Academy unit: {khanLabel(conceptKhan)}. </>:<>No Khan Academy course matches this topic, so the Khanpanion summary teaches it. </>}<Link href={`/learn/${m.concept.id}`} className="font-semibold text-navy underline decoration-green underline-offset-4">What you need to know</Link></p>
    </Sheet>
    <div className="order-4 grid gap-5 lg:order-none xl:grid-cols-2">
     <Sheet>
      <div className="flex items-baseline justify-between"><h2 className="text-xl font-extrabold">{t(lang,'today.daily3')}</h2>{dailyDone&&<Pill>{dailyDone.correct} of {dailyDone.total}</Pill>}</div>
      <p className="mt-1 text-sm text-ink-soft">Three quick questions to warm up. New ones every day.</p>
      <div className="mt-4">{dailyDone?<div><p className="font-serif text-xl">Done for today.{dailyDone.correct===dailyDone.total?' A clean sweep.':' Every miss is in your notebook for later.'}</p><Link href="/explore" className={cx(btn.text,'mt-2')}>Explore more ideas</Link></div>
       :<Sprint formKey={`daily~${today.replace(/-/g,'')}`} lang={lang} finishLabel="Finish" onFinish={r=>{setDailyDone(r);update(p=>({...p,daily:{...p.daily,[today]:{correct:r.correct,total:r.total}},studyDays:[...p.studyDays,today]}));}}/>}</div>
     </Sheet>
     <Sheet>
      <h2 className="text-xl font-extrabold">{t(lang,'today.focus')}</h2>
      <p className="mt-1 text-sm text-ink-soft">Ranked from your answers so far. Unseen topics start in the middle.</p>
      <ul className="mt-4 grid gap-2">{focus.map(f=><li key={f.concept.id}><Link href={`/learn/${f.concept.id}`} className="flex min-h-14 items-center gap-3 rounded-2xl px-3 py-2 hover:bg-mint">
       <Oval filled={statusOf(f)==='solid'} size={26}/><span className="flex-1"><span className="block font-semibold">{f.concept.title}</span><span className="text-sm text-ink-soft">{statusOf(f)}{f.accuracy!==undefined?` · ${f.accuracy}% right lately`:''}</span></span><span aria-hidden="true" className="text-ink-soft">›</span></Link></li>)}</ul>
      <Link href="/plan" className={cx(btn.text,'mt-2')}>See the whole plan</Link>
     </Sheet>
    </div>
   </div>
  </div>
 </div>;
}
