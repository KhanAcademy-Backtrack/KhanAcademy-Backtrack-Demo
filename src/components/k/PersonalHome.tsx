'use client';
import Link from 'next/link';
import {useState} from 'react';
import {useProgram} from './ProgramProvider';
import {ChangeGoalButton} from './ProgramTourProvider';
import {PageBand,Sheet,btn,cx,Oval,Pill,pageBody} from './ui';
import {StudyWeek} from './StudyWeek';
import {Sprint} from './Sprint';
import {ReviewTopics} from './ReviewTopics';
import {Companion} from '@/components/study/Companion';
import {examTargets,goalLabel,learnerGoal,targetDay} from '@/lib/program/personalization';
import {personalFocus,daysBetween,parseDay} from '@/lib/program/planner';
import {calendarItems} from '@/lib/program/calendar';
import {PROGRAM_BY_ID} from '@/lib/program/bridge';
import {t} from '@/lib/i18n';

export function PersonalHome(){
 const {state:s,update,today}=useProgram(),goal=learnerGoal(s),setup=s.setup!;
 const focus=personalFocus(s),concept=focus[0]?.concept,label=goalLabel(s),target=targetDay(s),seed=today.replace(/-/g,'');
 const [daily,setDaily]=useState(s.daily[today]);
 const items=calendarItems(s,today,goal==='exam'),program=PROGRAM_BY_ID[s.bridgeProgram??''],targets=examTargets(s);
 if(!concept)return <div className="mx-auto max-w-3xl p-5 text-white"><h1 className="text-3xl font-extrabold">Choose your next topic</h1><ChangeGoalButton className={cx(btn.onDark,'mt-5')}/></div>;
 return <>
  <PageBand title={label} lead={`${setup.weekdays.length} study days a week · ${setup.minutes} minutes a session · Around ${setup.time}`} aside={<div className="flex flex-wrap gap-2"><ChangeGoalButton className={btn.onDark} label="Change goal or routine"/></div>}>
   {target&&<p className="mt-3 text-sm text-white/80">{target>today?`${daysBetween(today,target)} days to your planning target`:'Your planning target has arrived'} · {parseDay(target).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})}</p>}
  </PageBand>
  <div className={pageBody}>
   <div className="grid min-w-0 gap-5 lg:grid-cols-[1.1fr_1fr]">
    <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-5">
     <Sheet className="order-1 lg:order-none" data-program-tour-content="today">{goal==='exam'||(goal==='college'&&!program)?<><h2 className="text-2xl font-extrabold">Review by subject</h2><p className="mt-2 text-sm text-ink-soft">Math, science, language and reading. Choose where to begin.</p>{targets.length>0&&<p className="mt-3 break-words text-sm font-semibold">Your targets: {targets.map(t=>t.name).join(', ')}</p>}<ReviewTopics/><Link href="/reviewer" className={cx(btn.text,'mt-3')}>{goal==='exam'?'Open the full CET reviewer':'Open the full reviewer'}</Link></>:<><div className="flex items-start gap-3"><Companion size={56} pose="encourage"/><div><p className="text-sm font-semibold text-ink-soft">{goal==='topic'?'Your chosen topic':'A foundation for your program'}</p><h2 className="mt-1 text-2xl font-extrabold leading-tight">{concept.title}</h2></div></div><p className="mt-4 leading-relaxed text-ink-soft">{concept.blurb}</p><div className="mt-5 flex flex-wrap gap-2"><Link href={`/learn/${concept.id}`} className={btn.primary}>Learn this topic</Link><Link href={`/mock/take?f=topic~${concept.id}|${seed}&mode=practice`} className={btn.ghost}>Try a topic check</Link></div></>}</Sheet>
     {goal==='exam'?<Sheet className="order-3 lg:order-none"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-extrabold">{t(s.lang,'today.daily3')}</h2>{daily&&<Pill>{daily.correct} of {daily.total}</Pill>}</div><p className="mt-2 text-sm text-ink-soft">A short mixed practice set when you want a warm-up.</p><div className="mt-4">{daily?<><p>Saved for today. You can revisit any missed questions.</p><Link href="/notebook" className={btn.text}>Open my mistake notebook</Link></>:<Sprint formKey={`daily~${seed}`} lang={s.lang} finishLabel="Finish" onFinish={r=>{setDaily(r);update(p=>({...p,daily:{...p.daily,[today]:{correct:r.correct,total:r.total}},studyDays:[...p.studyDays,today]}));}}/>}</div></Sheet>
      :goal==='college'&&program?<Sheet className="order-3 lg:order-none"><h2 className="text-xl font-extrabold">Where should you begin?</h2><p className="mt-2 text-ink-soft">Use your {program.title} map, or try a placement check to find foundations worth revisiting.</p><div className="mt-4 flex flex-wrap gap-2"><Link href={`/bridge/${program.id}`} className={btn.dark}>Open my program map</Link><Link href={`/mock/take?f=placement~${program.id}|${seed}&mode=practice`} className={btn.ghost}>Try the placement check</Link></div></Sheet>
      :goal==='college'?<Sheet className="order-3 lg:order-none"><h2 className="text-xl font-extrabold">Find your field when you’re ready</h2><p className="mt-2 text-ink-soft">Start with general foundations. Choose a field later for a more specific first-year map.</p><ChangeGoalButton className={cx(btn.ghost,'mt-4')} label="Choose my college field"/></Sheet>:<Sheet className="order-3 lg:order-none"><h2 className="text-xl font-extrabold">Need a different topic?</h2><p className="mt-2 text-ink-soft">You can change your focus when class moves on. Your earlier work stays saved.</p><ChangeGoalButton className={cx(btn.ghost,'mt-4')} label="Choose another topic"/></Sheet>}
    </div>
    <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-5">
     <Sheet className="order-2 min-w-0 lg:order-none" data-program-tour-content="calendar"><h2 className="mb-2 text-xl font-extrabold">Your study week</h2><StudyWeek items={items} today={today}/></Sheet>
     {goal!=='topic'&&focus.length>1&&<Sheet className="order-4 lg:order-none"><h2 className="text-xl font-extrabold">Other useful topics</h2><ul className="mt-3 grid gap-1">{focus.slice(1,4).map(f=><li key={f.concept.id}><Link href={`/learn/${f.concept.id}`} className="flex min-h-14 items-center gap-3 rounded-xl px-2 py-2 font-semibold hover:bg-mint"><Oval size={24}/><span>{f.concept.title}</span></Link></li>)}</ul></Sheet>}
    </div>
   </div>
  </div>
 </>;
}
