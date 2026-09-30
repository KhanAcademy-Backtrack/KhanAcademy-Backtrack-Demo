'use client';
import {useMemo,useRef,useState,useEffect} from 'react';
import {useProgram} from './ProgramProvider';
import {Sheet,btn,cx} from './ui';
import {CETPicker} from './CETPicker';
import {TopicPicker} from './TopicPicker';
import {StudyWeek} from './StudyWeek';
import {Companion} from '@/components/study/Companion';
import {CONCEPTS,CONCEPT_BY_ID} from '@/lib/program/concepts';
import {PROGRAMS,PROGRAM_BY_ID} from '@/lib/program/bridge';
import {EXAMS} from '@/lib/program/admissions';
import {learnerGoal} from '@/lib/program/personalization';
import {calendarItems} from '@/lib/program/calendar';
import {validDay,type CETPreferences,type LearnerSetup,type ProgramState} from '@/lib/program/store';

const GOALS=[{id:'exam',title:'Prepare for an entrance exam',label:'Entrance exam review',detail:'General CET review or your chosen exams.'},{id:'college',title:'Get ready for college classes',label:'College foundations',detail:'Review what your first year builds on.'},{id:'topic',title:'Work on a class topic',label:'Help with a class topic',detail:'Find a subject and start with one topic.'}] as const;
function GoalIcon({goal}:{goal:'exam'|'college'|'topic'}){return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{goal==='exam'?<><rect x="5" y="3" width="14" height="18" rx="2"/><path d="m8 9 1 1 2-2M13 9h3m-8 6 1 1 2-2m2 1h3"/></>:goal==='college'?<><path d="m2 9 10-5 10 5-10 5-10-5Zm4 2v6c4 3 8 3 12 0v-6m4-2v7"/></>:<><path d="M4 5h9a3 3 0 0 1 3 3v3M4 5v14h7"/><circle cx="16" cy="15" r="4"/><path d="m19 18 3 3M7 9h5m-5 4h2"/></>}</svg>;}
const DAYS=[[1,'Mon'],[2,'Tue'],[3,'Wed'],[4,'Thu'],[5,'Fri'],[6,'Sat'],[0,'Sun']] as const;
const field='min-h-12 w-full rounded-xl border-2 border-navy/15 bg-white px-3 text-base text-navy focus:border-navy focus:outline-none';

export function GoalSetup({onSaved,onCancel,onBrowse,entry=false,modal=false}:{onSaved:()=>void;onCancel?:()=>void;onBrowse?:()=>void;entry?:boolean;modal?:boolean}){
 const {state:s,update,today}=useProgram();
 const [step,setStep]=useState(0),[goal,setGoal]=useState<LearnerSetup['goal']|undefined>(learnerGoal(s));
 const [cet,setCet]=useState<CETPreferences>(()=>{if(s.setup?.cet)return s.setup.cet;const exam=s.setup?.goal==='exam'?s.setup.exam:s.pledge?.exam;return exam?{general:false,targets:[{key:exam,exam,name:EXAMS[exam].name,date:s.setup?.goal==='exam'?s.setup.targetDate:s.pledge?.examDate}]}:{general:true,targets:[]};}),[program,setProgram]=useState(s.bridgeProgram??''),[concept,setConcept]=useState(s.setup?.concept??'');
 const [days,setDays]=useState(s.setup?.weekdays??s.pledge?.weekdays??[1,3,5,6]);
 const [minutes,setMinutes]=useState(s.setup?.minutes??s.pledge?.minutes??30),[time,setTime]=useState(s.setup?.time??s.pledge?.time??'19:00'),[error,setError]=useState('');
 const heading=useRef<HTMLHeadingElement>(null),cetFields=useRef<HTMLDivElement>(null),timeInput=useRef<HTMLInputElement>(null);
 useEffect(()=>{heading.current?.focus({preventScroll:true});if(step>0){const dialog=heading.current?.closest<HTMLElement>('[role="dialog"]');if(dialog)dialog.scrollTop=0;else heading.current?.closest<HTMLElement>('[data-goal-setup]')?.scrollIntoView({block:'start',behavior:'instant'});}setError('');},[step]);
 const firstCet=cet.targets[0],setup:LearnerSetup={goal:goal??'topic',exam:goal==='exam'?firstCet?.exam:s.setup?.exam,...(goal==='exam'?{cet}:s.setup?.cet?{cet:s.setup.cet}:{}),concept:concept||undefined,weekdays:[...days].sort(),minutes,time,createdAt:s.setup?.createdAt??Date.now()};
 const snapshot:ProgramState={...s,setup,bridgeProgram:program||s.bridgeProgram};
 const items=calendarItems(snapshot,today,false);
 const topics=useMemo(()=>CONCEPTS.map(c=>({id:c.id,label:c.title,category:c.subtest==='science'?c.area:c.subtest==='math'?'Math':c.subtest==='language'?'Language':'Reading',search:c.area})),[]);
 const Title=modal?'h2':'h1';
 const title=step===0?'What would you like to work on?':step===1?goal==='exam'?'Which exams are on your list?':goal==='college'?'What will you study?':'Choose a subject and topic':'Choose your study week';
 function advance(){
  if(!goal)return;
  if(step===1){if(goal==='college'&&program!=='general'&&!PROGRAM_BY_ID[program])return setError('Choose a field, or use I’m not sure yet.');if(goal==='topic'&&!CONCEPT_BY_ID[concept])return setError('Choose a topic to start with.');if(goal==='exam'){const targets=cet.targets.map(t=>({...t,date:cetFields.current?.querySelector<HTMLInputElement>(`input[data-cet-key="${t.key}"]`)?.value||undefined}));if(!cet.general&&!targets.length)return setError('Choose General CET review or add an exam.');if(targets.some(t=>t.date&&(!validDay(t.date)||t.date<=today)))return setError('Choose future planning dates, or leave them blank.');setCet({...cet,targets});}}
  setStep(x=>x+1);
 }
 function save(){
  if(!goal||!days.length)return setError('Choose at least one study day.');
  const chosenTime=timeInput.current?.value??time;
  if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(chosenTime))return setError('Choose a study time.');
  update(p=>({...p,setup:{...setup,time:chosenTime},sides:{...p.sides,admission:goal==='exam'||p.sides.admission,bridge:goal==='college'||p.sides.bridge},activeSide:goal==='college'?'bridge':'admission',bridgeProgram:goal==='college'?program:p.bridgeProgram,
   ...(goal==='exam'&&firstCet?.exam&&firstCet.date?{pledge:{exam:firstCet.exam,examDate:firstCet.date,why:p.pledge?.why??'',days:days.length,minutes,when:p.pledge?.when??'after class',time:chosenTime,weekdays:setup.weekdays,createdAt:p.pledge?.createdAt??Date.now()}}:{})}));
  onSaved();
 }
 return <Sheet as="div" data-goal-setup className={cx('min-w-0 scroll-mt-20 p-0 sm:p-0',modal&&'rounded-none shadow-none')}>
  <div className="rounded-t-[22px] bg-navy px-5 pb-5 pt-4 text-white sm:px-7 sm:pb-6"><div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold text-green">{step===0?'YOUR STARTING POINT':step===1?'YOUR FOCUS':'YOUR ROUTINE'}</p>{onCancel&&<button aria-label="Close personalization" onClick={onCancel} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 text-xl hover:bg-white/10">×</button>}</div><div className="mt-1 flex items-center gap-3"><span className="hidden sm:block"><Companion size={48} pose="encourage"/></span><Title ref={heading} id={modal?'goal-dialog-title':'goal-page-title'} tabIndex={-1} className="text-2xl font-extrabold leading-tight tracking-[-.03em] focus:outline-none sm:text-[28px]">{title}</Title></div><p className="mt-2 hidden text-sm text-white/75 min-[360px]:block">{step===0?'Choose what you need today. You can change it any time.':step===1?goal==='college'?'We’ll suggest foundations used in your first year. No placement test is required.':goal==='topic'?'Choose a subject first, then a topic.':'One reviewer, with room for all your exam targets.':'Pick a routine you can change later.'}</p><div aria-label={`Step ${step+1} of 3`} className="mt-4 flex gap-1.5">{[0,1,2].map(n=><span key={n} className={cx('h-1 w-8 rounded-full',n<=step?'bg-green':'bg-white/20')}/>)}</div></div>
  <div className="px-5 py-4 sm:px-7 sm:py-5">
  {step===0?<div className="grid gap-2">{GOALS.map(g=><button key={g.id} aria-label={g.title} aria-pressed={goal===g.id} onClick={()=>{if(entry&&s.setup?.goal===g.id){onSaved();return;}setGoal(g.id);setStep(1);}} className="group flex min-h-16 min-[360px]:min-h-20 items-center gap-3 rounded-2xl border border-navy/12 px-3 py-3 text-left text-navy hover:border-green hover:bg-mint aria-pressed:border-green aria-pressed:bg-mint focus-visible:outline-3 focus-visible:outline-navy"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint text-navy"><GoalIcon goal={g.id}/></span><span className="min-w-0 flex-1"><span className="block font-bold">{g.label}</span><span className="mt-1 hidden text-sm leading-snug text-ink-soft min-[360px]:block">{entry&&s.setup?.goal===g.id?'Continue with your saved goal and routine.':g.detail}</span></span><span aria-hidden="true" className="text-xl text-navy/45">›</span></button>)}{onBrowse&&<button aria-label="I’m just browsing" onClick={onBrowse} className="sticky bottom-0 z-10 mt-1 flex min-h-14 items-center justify-between gap-3 rounded-xl bg-sky px-4 py-3 text-left text-navy hover:bg-mint focus-visible:outline-3 focus-visible:outline-navy"><span><span className="block font-semibold">I’m just browsing</span><span className="mt-1 block text-xs text-ink-soft">Show me around. No setup needed.</span></span><span aria-hidden="true">→</span></button>}</div>
   :step===1?<div className="mt-5">
    {goal==='exam'?<div ref={cetFields}><CETPicker value={cet} onChange={setCet} today={today}/></div>
     :goal==='college'?<div><p className="font-bold">Which field is closest to yours?</p><p className="mt-1 text-sm text-ink-soft">These are groups of degrees, not a college application. Choose one to see relevant topics.</p><button aria-pressed={program==='general'} onClick={()=>setProgram('general')} className="mt-3 min-h-14 w-full rounded-xl border border-navy/15 bg-sky px-4 py-3 text-left font-semibold aria-pressed:border-green aria-pressed:bg-mint">I’m not sure yet<span className="mt-1 block text-xs font-normal text-ink-soft">Start with general math and science foundations.</span></button><div role="group" aria-label="Your college program" className="mt-4 grid gap-2 sm:grid-cols-2">{PROGRAMS.map(p=><button aria-label={p.title} key={p.id} aria-pressed={program===p.id} onClick={()=>setProgram(p.id)} className="min-h-20 rounded-xl border border-navy/15 px-3 py-3 text-left text-navy aria-pressed:border-green aria-pressed:bg-mint hover:bg-sky"><span className="block font-bold">{p.title}</span><span className="mt-1 block text-xs leading-relaxed text-ink-soft">{p.examples.replaceAll('BS ','').replaceAll('BA ','')}</span></button>)}</div></div>
     :<TopicPicker items={topics} value={concept} onChoose={setConcept}/>}
   </div>:<div className="mt-5 grid gap-5">
    <fieldset><legend className="font-bold">Which days work for you?</legend><div className="mt-3 flex flex-wrap gap-2">{DAYS.map(([id,label])=><button type="button" key={id} aria-pressed={days.includes(id)} onClick={()=>setDays(x=>x.includes(id)?x.filter(d=>d!==id):[...x,id])} className="min-h-12 min-w-14 rounded-full border-2 border-navy/15 px-3 font-bold text-navy aria-pressed:border-green aria-pressed:bg-mint">{label}</button>)}</div></fieldset>
    <fieldset><legend className="font-bold">How long is a comfortable session?</legend><div className="mt-3 flex flex-wrap gap-2">{[15,20,30,45,60].map(n=><button type="button" key={n} aria-pressed={minutes===n} onClick={()=>setMinutes(n)} className="min-h-12 rounded-full border-2 border-navy/15 px-4 font-bold text-navy aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white">{n} min</button>)}</div></fieldset>
    <label className="grid gap-2 font-semibold">Usual study time<input ref={timeInput} type="time" className={field} value={time} onChange={e=>setTime(e.target.value)} onInput={e=>setTime(e.currentTarget.value)} onBlur={e=>setTime(e.currentTarget.value)}/></label>
    <div className="min-w-0 rounded-2xl border-2 border-navy/10 p-3 sm:p-4"><h3 className="text-lg font-bold">Your first study week</h3><p className="mt-1 mb-2 text-sm text-ink-soft">Tap a day to see the sessions your choices create.</p><StudyWeek items={items} today={today} preview/></div>
   </div>}
  {error&&<p role="alert" className="mt-3 font-semibold text-navy">{error}</p>}
  {step>0&&<div className={cx('sticky z-20 mt-5 flex flex-wrap gap-2 border-t border-navy/10 bg-white pt-4 pb-1',modal?'bottom-0':'bottom-[calc(4rem+env(safe-area-inset-bottom))] lg:bottom-0')}><button className={btn.ghost} onClick={()=>setStep(x=>x-1)}>Back</button><button className={cx(btn.primary,'ml-auto')} onClick={step===2?save:advance}>{step===2?'Show my study space':'Continue'}</button></div>}
  <p className="mt-3 text-center text-xs leading-relaxed text-ink-soft">Your existing work stays saved.</p>
  </div>
 </Sheet>;
}
