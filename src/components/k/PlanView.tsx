'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {motion,useReducedMotion} from 'motion/react';
import {useProgram} from './ProgramProvider';
import {Pledge} from './Pledge';
import {PageBand,Sheet,btn,Oval,cx,pageBody} from './ui';
import {phases,phaseOn,readiness,focusRanking,statusOf,daysBetween,parseDay} from '@/lib/program/planner';
import {EXAMS} from '@/lib/program/admissions';
import {SUBTEST_LABEL,SUBTESTS,type Subtest} from '@/lib/mock/types';
import {khanLabel} from '@/lib/program/khan-units';
import {DUR} from '@/lib/motion-tokens';

const short=(d:string)=>parseDay(d).toLocaleDateString('en-PH',{month:'short',day:'numeric'});

/** The plan: phases to the exam, readiness per subtest, and every concept by
 *  subject with its status and where to learn it. It adjusts itself every day, so
 *  nothing on it is ever late. */
export function PlanView(){
 const {state:s,ready,today}=useProgram(),params=useSearchParams(),reduced=useReducedMotion();
 const [editing,setEditing]=useState(false),[tab,setTab]=useState<Subtest>('math');
 useEffect(()=>{if(typeof window!=='undefined'&&window.location.hash==='#pledge')setEditing(true);},[]);
 useEffect(()=>{const side=params.get('side');if(side==='admission'&&ready&&!s.sides.admission&&!s.pledge)setEditing(true);},[params,ready,s.sides.admission,s.pledge]);
 if(!ready)return <div className="min-h-[60vh] bg-navy"/>;
 if(!s.pledge||editing)return <><PageBand title={s.pledge?'Edit your study pledge':'Your plan starts with a pledge'} lead="Pick your exam, your reason and your routine. Khanpanion builds the schedule, the daily missions and the mock exam days from it."/><div className={pageBody}><div className="mx-auto max-w-3xl"><Pledge onSaved={()=>setEditing(false)}/></div></div></>;
 const p=s.pledge,list=phases(today,p.examDate),now=phaseOn(list,today),total=Math.max(1,daysBetween(today,p.examDate));
 const ready4=readiness(s),rank=focusRanking(s),byId=new Map(rank.map(r=>[r.concept.id,r]));
 const conceptsOf=(sub:Subtest)=>rank.filter(r=>r.concept.subtest===sub).map(r=>r.concept).sort((a,b)=>a.area.localeCompare(b.area));
 return <>
  <PageBand title={`Your plan to the ${EXAMS[p.exam].name}`} lead={`${total} days, ${p.days} days a week, ${p.minutes} minutes a day. The plan rebalances itself every day, so nothing here is ever late.`}>
   <div className="mt-6 flex flex-wrap gap-3"><Link href="/calendar" className={btn.primary}>Open my calendar</Link><button className={btn.onDark} onClick={()=>setEditing(true)}>Edit my pledge</button></div>
  </PageBand>
  <div className={pageBody}>
   <Sheet>
    <h2 className="text-xl font-extrabold">Three phases</h2>
    <div className="mt-4 flex h-12 overflow-hidden rounded-full bg-sky" role="img" aria-label={`You are in the ${now.label.toLowerCase()} phase.`}>
     {list.map(ph=>{const w=Math.max(8,(daysBetween(ph.start,ph.end)+1)/total*100);return <div key={ph.id} style={{width:`${w}%`}} className={cx('flex items-center justify-center border-r-2 border-white px-2 text-sm font-bold last:border-0',ph.id===now.id?'bg-green text-navy':'text-ink-soft')}>{ph.label}</div>;})}
    </div>
    <div className="mt-5 grid gap-4 sm:grid-cols-3">{list.map(ph=><div key={ph.id} className={cx('rounded-2xl p-4',ph.id===now.id?'bg-mint':'')}><p className="font-bold">{ph.label}{ph.id===now.id&&' · now'}</p><p className="text-sm text-ink-soft">{short(ph.start)} to {short(ph.end)}</p><p className="mt-2 text-[15px] leading-relaxed">{ph.goal}</p></div>)}</div>
   </Sheet>
   <Sheet className="mt-5">
    <h2 className="text-xl font-extrabold">Where you stand</h2>
    <p className="mt-1 text-ink-soft">From your recent mock exams and topic checks. A band describes your practice so far, not a predicted exam score.</p>
    <div className="mt-5 grid gap-3">{ready4.map((r,i)=><div key={r.subtest} className="grid items-center gap-2 sm:grid-cols-[200px_1fr_220px]">
     <p className="font-bold">{SUBTEST_LABEL[r.subtest]}</p>
     <div className="h-4 overflow-hidden rounded-full bg-sky"><motion.div className="h-full origin-left rounded-full bg-green" initial={reduced?false:{scaleX:0}} animate={{scaleX:(r.percent??0)/100}} transition={reduced?{duration:0}:{duration:DUR.slow,delay:i*.15}} style={{width:'100%'}}/></div>
     <p className="text-[15px]">{r.band?<><span className="font-bold">{r.band.label}</span>{r.growth!==undefined&&r.growth!==0&&<span className="text-ink-soft"> · {r.growth>0?`up ${r.growth} points`:'dipped a little'}</span>}</>:<span className="text-ink-soft">No answers yet. <Link className="font-semibold text-navy underline decoration-green underline-offset-4" href={`/mock/take?f=section~${r.subtest}|${today.replace(/-/g,'')}&mode=practice`}>Take a section</Link></span>}</p>
    </div>)}</div>
   </Sheet>
   <Sheet className="mt-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold">Every topic, by subject</h2><p className="mt-1 text-ink-soft">Start at the top of each list. Each topic has a one-screen summary, an optional Khan Academy unit, and a topic check.</p></div></div>
    <div role="tablist" aria-label="Subjects" className="mt-5 flex flex-wrap gap-2">{SUBTESTS.map(sub=><button key={sub} role="tab" aria-selected={tab===sub} onClick={()=>setTab(sub)} className="min-h-11 rounded-full border-2 border-navy/15 px-4 font-bold aria-selected:border-navy aria-selected:bg-navy aria-selected:text-white">{SUBTEST_LABEL[sub]}</button>)}</div>
    <ul role="tabpanel" className="mt-4 divide-y divide-mint-line">
     {conceptsOf(tab).map(c=>{const r=byId.get(c.id)!,st=statusOf(r);return <li key={c.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex gap-3"><Oval filled={st==='solid'} size={30} className="mt-1"/><div><p className="text-sm text-ink-soft">{c.area}</p><Link href={`/learn/${c.id}`} className="text-lg font-bold hover:underline">{c.title}</Link><p className="text-[15px] text-ink-soft">{c.blurb}</p>
       <p className="mt-1 text-sm"><span className={cx('font-semibold',st==='focus here'?'text-navy':'text-ink-soft')}>{st}</span>{r.accuracy!==undefined&&<span className="text-ink-soft"> · {r.accuracy}% lately</span>}{c.khan[0]?<span className="text-ink-soft"> · Khan: {khanLabel(c.khan[0])}</span>:<span className="text-ink-soft"> · taught in Khanpanion</span>}</p></div></div>
      <div className="flex flex-wrap gap-2 sm:justify-end"><Link href={`/learn/${c.id}`} className={btn.ghost}>Learn</Link><Link href={`/mock/take?f=topic~${c.id}|${today.replace(/-/g,'')}&mode=practice`} className={btn.dark}>Topic check</Link></div>
     </li>;})}
    </ul>
   </Sheet>
   <div className="mt-5 grid gap-5 md:grid-cols-2">
    <Sheet><h2 className="text-xl font-extrabold">Practise a topic your way</h2><p className="mt-1 text-ink-soft">The step-by-step practice rooms from before are still here, with fresh questions and the mistake finder.</p><div className="mt-4 flex flex-wrap gap-2"><Link href="/study" className={btn.ghost}>Practice rooms</Link><Link href="/packs" className={btn.ghost}>Topic packs</Link><Link href="/khan" className={btn.ghost}>Bring a Khan activity</Link></div></Sheet>
    <Sheet><h2 className="text-xl font-extrabold">Other sides of Khanpanion</h2><p className="mt-1 text-ink-soft">Starting college soon? The freshman bridge maps what your program’s first year assumes.</p><div className="mt-4 flex flex-wrap gap-2"><Link href="/bridge" className={btn.ghost}>Freshman bridge</Link><Link href="/admissions" className={btn.ghost}>Exam dates</Link></div></Sheet>
   </div>
  </div>
 </>;
}
