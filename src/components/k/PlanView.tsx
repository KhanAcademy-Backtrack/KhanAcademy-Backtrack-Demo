'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {motion} from 'motion/react';
import {useQuietMotion} from './useQuietMotion';
import {useProgram} from './ProgramProvider';
import {Pledge} from './Pledge';
import {StudyWeek} from './StudyWeek';
import {ChangeGoalButton,useProgramGuide} from './ProgramTourProvider';
import {PersonalPlan} from './PersonalPlan';
import {calendarItems} from '@/lib/program/calendar';
import {goalLabel,learnerGoal,targetDay} from '@/lib/program/personalization';
import {PageBand,Sheet,btn,Oval,cx,pageBody} from './ui';
import {phases,phaseOn,readiness,focusRanking,statusOf,daysBetween,parseDay} from '@/lib/program/planner';
import {EXAMS} from '@/lib/program/admissions';
import {SUBTEST_LABEL,SUBTESTS,type Subtest} from '@/lib/mock/types';
import {khanLabel} from '@/lib/program/khan-units';
import {DUR} from '@/lib/motion-tokens';
import {Rich} from '@/components/math/Math';

const short=(d:string)=>parseDay(d).toLocaleDateString('en-PH',{month:'short',day:'numeric'});

/** The plan: phases to the exam, readiness per subtest, and every concept by
 *  subject with its status and where to learn it. It adjusts itself every day, so
 *  nothing on it is ever late. */
export function PlanView(){
 const {state:s,ready,today}=useProgram(),params=useSearchParams(),reduced=useQuietMotion(),guide=useProgramGuide();
 const [editing,setEditing]=useState(false),[tab,setTab]=useState<Subtest>('math');
 useEffect(()=>{if(typeof window!=='undefined'&&window.location.hash==='#pledge')setEditing(true);},[]);
 useEffect(()=>{const side=params.get('side');if(side==='admission'&&ready&&!s.sides.admission&&!s.pledge)setEditing(true);},[params,ready,s.sides.admission,s.pledge]);
 if(!ready)return <div className="min-h-[60vh]"/>;
 if(!learnerGoal(s))return <PersonalPlan browsing/>;
 if(guide.browsing||s.setup?.cet||s.setup?.goal==='college'||s.setup?.goal==='topic')return <PersonalPlan browsing={guide.browsing}/>;
 if(s.setup&&(!targetDay(s)||s.setup.goal!=='exam')&&!editing)return <><PageBand title="Your study routine" lead={goalLabel(s)} aside={<ChangeGoalButton className={btn.quiet}/>}/><div className={pageBody}><Sheet className="mx-auto min-w-0 max-w-3xl"><h2 className="mb-3 text-xl font-extrabold"><Headline>Your chosen study days</Headline></h2><StudyWeek items={calendarItems(s,today,s.setup.goal==='exam')} today={today}/>{s.setup.goal==='exam'&&<button className={cx(btn.text,'mt-4')} onClick={()=>setEditing(true)}><Headline>Add an exam planning date</Headline></button>}</Sheet></div></>;
 if(!s.pledge||editing)return <><PageBand title={s.pledge?'Adjust your study plan':'Build your study plan'} lead="Choose your exam date and a routine that works for you. We’ll turn it into a weekly schedule."/><div className={pageBody}><div className="mx-auto max-w-3xl"><Pledge onSaved={()=>setEditing(false)}/></div></div></>;
 const p=s.pledge,list=phases(today,p.examDate),now=phaseOn(list,today),total=Math.max(1,daysBetween(today,p.examDate));
 const ready4=readiness(s),rank=focusRanking(s),byId=new Map(rank.map(r=>[r.concept.id,r]));
 const conceptsOf=(sub:Subtest)=>rank.filter(r=>r.concept.subtest===sub).map(r=>r.concept).sort((a,b)=>a.area.localeCompare(b.area));
 return <>
  <PageBand title={`Your plan to the ${EXAMS[p.exam].name}`} lead={`${total} days, ${p.days} days a week, ${p.minutes} minutes a day. Adjust your routine whenever your week changes.`}>
   <div className="mt-6 flex flex-wrap gap-3"><Link href="/calendar" className={btn.primary}><Headline>Open my calendar</Headline></Link><button className={btn.quiet} onClick={()=>setEditing(true)}><Headline>Edit my plan</Headline></button></div>
  </PageBand>
  <div className={cx(pageBody,'grid gap-5 lg:grid-cols-[340px_1fr]')}>
   <aside className="min-w-0"><Sheet>
    <h2 className="text-xl font-extrabold"><Headline>Three phases</Headline></h2>
    <div className="mt-4 flex h-12 overflow-hidden rounded-full bg-sky" role="img" aria-label={`You are in the ${now.label.toLowerCase()} phase.`}>
     {list.map(ph=>{const w=Math.max(8,(daysBetween(ph.start,ph.end)+1)/total*100);return <div key={ph.id} style={{width:`${w}%`}} className={cx('flex items-center justify-center border-r-2 border-white px-2 text-sm font-bold last:border-0',ph.id===now.id?'bg-green text-navy':'text-ink-soft')}>{ph.label}</div>;})}
    </div>
    <div className="mt-5 grid gap-3">{list.map(ph=><div key={ph.id} className={cx('rounded-2xl p-4',ph.id===now.id?'bg-mint':'')}><p className="font-bold">{ph.label}{ph.id===now.id&&' · now'}</p><p className="text-sm text-ink-soft">{short(ph.start)} to {short(ph.end)}</p><p className="mt-2 text-[15px] leading-relaxed">{ph.goal}</p></div>)}</div>
   </Sheet>
   <Sheet className="mt-5">
    <h2 className="text-xl font-extrabold"><Headline>Where you stand</Headline></h2>
    <p className="mt-1 text-ink-soft">From your recent mock exams and topic checks. A band describes your practice so far, not a predicted exam score.</p>
    <div className="mt-5 grid gap-3">{ready4.map((r,i)=><div key={r.subtest} className="grid items-center gap-2">
     <p className="font-bold">{SUBTEST_LABEL[r.subtest]}</p>
     <div className="h-4 overflow-hidden rounded-full bg-sky"><motion.div className="h-full origin-left rounded-full bg-green" initial={reduced?false:{scaleX:0}} animate={{scaleX:(r.percent??0)/100}} transition={reduced?{duration:0}:{duration:DUR.slow,delay:i*DUR.fast}} style={{width:'100%'}}/></div>
     <p className="text-[15px]">{r.band?<><span className="font-bold">{r.band.label}</span>{r.growth!==undefined&&r.growth!==0&&<span className="text-ink-soft"> · {r.growth>0?`up ${r.growth} points`:'dipped a little'}</span>}</>:<span className="text-ink-soft">No answers yet. <Link className="font-semibold text-navy underline decoration-green underline-offset-4" href={`/mock/take?f=section~${r.subtest}|${today.replace(/-/g,'')}&mode=practice`}>Take a section</Link></span>}</p>
    </div>)}</div>
   </Sheet></aside>
   <Sheet className="min-w-0">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold"><Headline>Every topic, by subject</Headline></h2><p className="mt-1 text-ink-soft">Start at the top of each list. Each topic has a one-screen summary, an optional Khan Academy unit, and a topic check.</p></div></div>
    <div role="tablist" aria-label="Subjects" className="sticky top-16 z-20 -mx-2 mt-5 grid grid-cols-4 gap-1 rounded-2xl bg-white p-2 shadow-sheet sm:flex sm:flex-wrap sm:gap-2">{SUBTESTS.map(sub=><button key={sub} role="tab" aria-selected={tab===sub} onClick={()=>setTab(sub)} className={cx('min-h-11 rounded-full border-2 px-1 text-xs font-bold sm:px-4 sm:text-base',tab===sub?'border-navy bg-navy text-white':'border-navy/15 text-navy')}>{sub==='language'?'Language':sub==='reading'?'Reading':sub==='math'?'Math':'Science'}</button>)}</div>
    <ul role="tabpanel" className="mt-4 divide-y divide-mint-line">
     {conceptsOf(tab).map(c=>{const r=byId.get(c.id)!,st=statusOf(r);return <li key={c.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex gap-3"><Oval filled={st==='solid'} size={30} className="mt-1"/><div><p className="text-sm text-ink-soft">{c.area}</p><Link href={`/learn/${c.id}`} className="text-lg font-bold hover:underline"><Headline>{c.title}</Headline></Link><p className="text-[15px] text-ink-soft"><Rich>{c.blurb}</Rich></p>
       <p className="mt-1 text-sm"><span className={cx('font-semibold',st==='focus here'?'text-navy':'text-ink-soft')}>{st}</span>{r.accuracy!==undefined&&<span className="text-ink-soft"> · {r.accuracy}% lately</span>}{c.khan[0]?<span className="text-ink-soft"> · Khan: {khanLabel(c.khan[0])}</span>:<span className="text-ink-soft"> · taught in Khanpanion</span>}</p></div></div>
      <div className="flex flex-wrap gap-2 sm:justify-end"><Link href={`/learn/${c.id}`} className={btn.ghost}><Headline>Learn</Headline></Link><Link href={`/mock/take?f=topic~${c.id}|${today.replace(/-/g,'')}&mode=practice`} className={btn.dark}><Headline>Topic check</Headline></Link></div>
     </li>;})}
    </ul>
   </Sheet>
   <div className="grid gap-5 md:grid-cols-2 lg:col-span-2">
    <Sheet><h2 className="text-xl font-extrabold"><Headline>Practise a topic your way</Headline></h2><p className="mt-1 text-ink-soft">The step-by-step practice rooms from before are still here, with fresh questions and the mistake finder.</p><div className="mt-4 flex flex-wrap gap-2"><Link href="/study" className={btn.ghost}><Headline>Practice rooms</Headline></Link><Link href="/packs" className={btn.ghost}><Headline>Topic packs</Headline></Link><Link href="/khan" className={btn.ghost}><Headline>Bring a Khan activity</Headline></Link></div></Sheet>
    <Sheet><h2 className="text-xl font-extrabold"><Headline>Preparing for your first year?</Headline></h2><p className="mt-1 text-ink-soft">Choose your program to find useful math and science foundations to review.</p><div className="mt-4 flex flex-wrap gap-2"><Link href="/bridge" className={btn.ghost}><Headline>College preparation</Headline></Link><Link href="/admissions" className={btn.ghost}><Headline>Exam dates</Headline></Link></div></Sheet>
   </div>
  </div>
 </>;
}
