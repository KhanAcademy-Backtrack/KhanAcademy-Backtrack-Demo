'use client';
import {useMemo,useRef,useState,useEffect} from 'react';
import {useProgram} from './ProgramProvider';
import {Sheet,btn,cx,Oval} from './ui';
import {TopicPicker} from './TopicPicker';
import {StudyWeek} from './StudyWeek';
import {Companion} from '@/components/study/Companion';
import {CONCEPTS,CONCEPT_BY_ID} from '@/lib/program/concepts';
import {PROGRAMS,PROGRAM_BY_ID} from '@/lib/program/bridge';
import {EXAMS,type ExamId} from '@/lib/program/admissions';
import {learnerGoal} from '@/lib/program/personalization';
import {calendarItems} from '@/lib/program/calendar';
import {validDay,type LearnerSetup,type ProgramState} from '@/lib/program/store';

const GOALS=[{id:'exam',title:'Prepare for an entrance exam',detail:'Choose your exam and build a study routine.'},{id:'college',title:'Get ready for college classes',detail:'Find the foundations for your program.'},{id:'topic',title:'Work on a class topic',detail:'Pick a subject and something you want to understand.'}] as const;
const DAYS=[[1,'Mon'],[2,'Tue'],[3,'Wed'],[4,'Thu'],[5,'Fri'],[6,'Sat'],[0,'Sun']] as const;
const field='min-h-12 w-full rounded-xl border-2 border-navy/15 bg-white px-3 text-base text-navy focus:border-navy focus:outline-none';

export function GoalSetup({onSaved,onCancel,onBrowse,entry=false,modal=false}:{onSaved:()=>void;onCancel?:()=>void;onBrowse?:()=>void;entry?:boolean;modal?:boolean}){
 const {state:s,update,today}=useProgram();
 const [step,setStep]=useState(0),[goal,setGoal]=useState<LearnerSetup['goal']|undefined>(learnerGoal(s));
 const [exam,setExam]=useState<ExamId>(s.setup?.exam??s.pledge?.exam??'upcat'),[program,setProgram]=useState(s.bridgeProgram??''),[concept,setConcept]=useState(s.setup?.concept??'');
 const [date,setDate]=useState(s.setup?s.setup.targetDate??'':s.pledge?.examDate??''),[days,setDays]=useState(s.setup?.weekdays??s.pledge?.weekdays??[1,3,5,6]);
 const [minutes,setMinutes]=useState(s.setup?.minutes??s.pledge?.minutes??30),[time,setTime]=useState(s.setup?.time??s.pledge?.time??'19:00'),[error,setError]=useState('');
 const heading=useRef<HTMLHeadingElement>(null),dateInput=useRef<HTMLInputElement>(null),timeInput=useRef<HTMLInputElement>(null);
 useEffect(()=>{heading.current?.focus({preventScroll:true});if(step>0){const dialog=heading.current?.closest<HTMLElement>('[role="dialog"]');if(dialog)dialog.scrollTop=0;else heading.current?.closest<HTMLElement>('[data-goal-setup]')?.scrollIntoView({block:'start',behavior:'instant'});}setError('');},[step]);
 const setup:LearnerSetup={goal:goal??'topic',exam,concept:concept||undefined,targetDate:goal==='exam'&&date?date:undefined,weekdays:[...days].sort(),minutes,time,createdAt:s.setup?.createdAt??Date.now()};
 const snapshot:ProgramState={...s,setup,bridgeProgram:program||s.bridgeProgram};
 const items=calendarItems(snapshot,today,false);
 const topics=useMemo(()=>CONCEPTS.map(c=>({id:c.id,label:c.title,category:c.subtest==='science'?c.area:c.subtest==='math'?'Math':c.subtest==='language'?'Language':'Reading',search:c.area})),[]);
 const Title=modal?'h2':'h1';
 const title=step===0?'What would you like to work on?':step===1?goal==='exam'?'Which exam are you preparing for?':goal==='college'?'What will you study?':'Choose a subject and topic':'Make room for a little study';
 function advance(){
  if(!goal)return;
  if(step===1){if(goal==='college'&&!PROGRAM_BY_ID[program])return setError('Choose the program closest to yours.');if(goal==='topic'&&!CONCEPT_BY_ID[concept])return setError('Choose a topic to start with.');const chosenDate=dateInput.current?.value??date;if(goal==='exam'&&chosenDate&&(!validDay(chosenDate)||chosenDate<=today))return setError('Choose a future planning date, or leave it blank for now.');setDate(chosenDate);}
  setStep(x=>x+1);
 }
 function save(){
  if(!goal||!days.length)return setError('Choose at least one study day.');
  const chosenTime=timeInput.current?.value??time;
  if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(chosenTime))return setError('Choose a study time.');
  update(p=>({...p,setup:{...setup,time:chosenTime},sides:{...p.sides,admission:goal==='exam'||p.sides.admission,bridge:goal==='college'||p.sides.bridge},activeSide:goal==='college'?'bridge':'admission',bridgeProgram:goal==='college'?program:p.bridgeProgram,
   ...(goal==='exam'&&date?{pledge:{exam,examDate:date,why:p.pledge?.why??'',days:days.length,minutes,when:p.pledge?.when??'after class',time:chosenTime,weekdays:setup.weekdays,createdAt:p.pledge?.createdAt??Date.now()}}:{})}));
  onSaved();
 }
 return <Sheet as="div" data-goal-setup className={cx('min-w-0 scroll-mt-20',modal&&'rounded-none shadow-none p-0 sm:p-0')}>
  <p className="text-sm font-semibold text-ink-soft">Make it yours · {step+1} of 3</p>
  <div className="mt-3 flex items-start gap-3"><Companion size={52} pose="encourage"/><Title ref={heading} id={modal?'goal-dialog-title':'goal-page-title'} tabIndex={-1} className="text-2xl font-extrabold leading-tight tracking-[-.03em] focus:outline-none">{title}</Title></div>
  {step===0?<div className="mt-5 grid gap-3">{GOALS.map((g,i)=><button key={g.id} aria-label={g.title} aria-pressed={goal===g.id} onClick={()=>{if(entry&&s.setup?.goal===g.id){onSaved();return;}setGoal(g.id);setStep(1);}} className="flex min-h-24 items-start gap-3 rounded-2xl border-2 border-navy/15 px-4 py-4 text-left text-navy hover:border-green hover:bg-mint focus-visible:outline-3 focus-visible:outline-navy"><Oval filled={goal===g.id} label={String.fromCharCode(65+i)} size={34} className="mt-1"/><span className="flex-1"><span className="block font-bold">{g.title}</span><span className="mt-1 block text-sm leading-relaxed text-ink-soft">{entry&&s.setup?.goal===g.id?'Continue with your saved goal and routine.':g.detail}</span></span><span aria-hidden="true">→</span></button>)}{onBrowse&&<button aria-label="I’m just browsing" onClick={onBrowse} className="flex min-h-20 items-start gap-3 rounded-2xl border-2 border-navy/15 px-4 py-4 text-left text-navy hover:border-green hover:bg-mint focus-visible:outline-3 focus-visible:outline-navy"><Oval label="D" size={34} className="mt-1"/><span><span className="block font-bold">I’m just browsing</span><span className="mt-1 block text-sm leading-relaxed text-ink-soft">Show me around. No plan or questions needed.</span></span></button>}</div>
   :step===1?<div className="mt-5">
    {goal==='exam'?<><fieldset><legend className="sr-only">Exam</legend><div className="grid grid-cols-2 gap-2">{Object.entries(EXAMS).map(([id,e])=><button type="button" key={id} aria-pressed={exam===id} onClick={()=>setExam(id as ExamId)} className="min-h-12 rounded-full border-2 border-navy/15 px-3 font-bold text-navy aria-pressed:border-green aria-pressed:bg-mint">{e.name}</button>)}</div></fieldset><label className="mt-5 grid gap-2 font-semibold">Planning date, if you have one<input ref={dateInput} type="date" min={today} className={field} value={date} onChange={e=>setDate(e.target.value)} onInput={e=>setDate(e.currentTarget.value)}/><span className="text-sm font-normal leading-relaxed text-ink-soft">Leave it blank if you are still waiting for a date. A personal target does not confirm an official exam schedule.</span></label></>
     :goal==='college'?<label className="grid gap-2 font-semibold">Your college program<select className={field} value={program} onChange={e=>setProgram(e.target.value)}><option value="">Choose the closest match</option>{PROGRAMS.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select>{PROGRAM_BY_ID[program]&&<span className="text-sm font-normal leading-relaxed text-ink-soft">{PROGRAM_BY_ID[program].examples}</span>}</label>
     :<TopicPicker items={topics} value={concept} onChoose={setConcept}/>}
   </div>:<div className="mt-5 grid gap-5">
    <fieldset><legend className="font-bold">Which days work for you?</legend><div className="mt-3 flex flex-wrap gap-2">{DAYS.map(([id,label])=><button type="button" key={id} aria-pressed={days.includes(id)} onClick={()=>setDays(x=>x.includes(id)?x.filter(d=>d!==id):[...x,id])} className="min-h-12 min-w-14 rounded-full border-2 border-navy/15 px-3 font-bold text-navy aria-pressed:border-green aria-pressed:bg-mint">{label}</button>)}</div></fieldset>
    <fieldset><legend className="font-bold">How long is a comfortable session?</legend><div className="mt-3 flex flex-wrap gap-2">{[15,20,30,45,60].map(n=><button type="button" key={n} aria-pressed={minutes===n} onClick={()=>setMinutes(n)} className="min-h-12 rounded-full border-2 border-navy/15 px-4 font-bold text-navy aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white">{n} min</button>)}</div></fieldset>
    <label className="grid gap-2 font-semibold">Usual study time<input ref={timeInput} type="time" className={field} value={time} onChange={e=>setTime(e.target.value)} onInput={e=>setTime(e.currentTarget.value)} onBlur={e=>setTime(e.currentTarget.value)}/></label>
    <div className="min-w-0 rounded-2xl border-2 border-navy/10 p-3 sm:p-4"><h3 className="text-lg font-bold">Your first study week</h3><p className="mt-1 mb-2 text-sm text-ink-soft">Tap a day to see the sessions your choices create.</p><StudyWeek items={items} today={today} preview/></div>
   </div>}
  {error&&<p role="alert" className="mt-3 font-semibold text-navy">{error}</p>}
  <div className={cx('sticky z-20 mt-5 flex flex-wrap gap-2 border-t border-navy/10 bg-white pt-4 pb-1',modal?'bottom-0':'bottom-[calc(4rem+env(safe-area-inset-bottom))] lg:bottom-0')}>{step>0&&<button className={btn.ghost} onClick={()=>setStep(x=>x-1)}>Back</button>}{onCancel&&<button className={cx(btn.text,'text-sm')} onClick={onCancel}>Close</button>}{step>0&&<button className={cx(btn.primary,'ml-auto')} onClick={step===2?save:advance}>{step===2?'Show my study space':'Continue'}</button>}</div>
  <p className="mt-2 text-xs leading-relaxed text-ink-soft">You can change your goal or routine later. Your existing work stays saved.</p>
 </Sheet>;
}
