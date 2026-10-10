'use client';
import {Headline} from './Headline';
import {useMemo,useRef,useState,useEffect} from 'react';
import {useProgram} from './ProgramProvider';
import {Sheet,Wordmark,btn,cx} from './ui';
import {CETPicker} from './CETPicker';
import {TopicPicker} from './TopicPicker';
import {Companion} from '@/components/study/Companion';
import {CONCEPTS,CONCEPT_BY_ID} from '@/lib/program/concepts';
import {PROGRAMS,PROGRAM_BY_ID} from '@/lib/program/bridge';
import {EXAMS} from '@/lib/program/admissions';
import {learnerGoal} from '@/lib/program/personalization';
import {validDay,type CETPreferences,type LearnerSetup} from '@/lib/program/store';
import {DEFAULT_PROFILE_NAME} from '@/lib/program/profile';
import {ProfileNameField} from './ProfileName';

const GOALS=[{id:'exam',title:'Prepare for an entrance exam',label:'Entrance exam review',detail:'General CET review or your chosen exams.'},{id:'college',title:'Get ready for college classes',label:'College foundations',detail:'Review what your first year builds on.'},{id:'topic',title:'Work on a class topic',label:'Help with a class topic',detail:'Find a subject and start with one topic.'}] as const;
function GoalIcon({goal}:{goal:'exam'|'college'|'topic'}){return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{goal==='exam'?<><rect x="5" y="3" width="14" height="18" rx="2"/><path d="m8 9 1 1 2-2M13 9h3m-8 6 1 1 2-2m2 1h3"/></>:goal==='college'?<><path d="m2 9 10-5 10 5-10 5-10-5Zm4 2v6c4 3 8 3 12 0v-6m4-2v7"/></>:<><path d="M4 5h9a3 3 0 0 1 3 3v3M4 5v14h7"/><circle cx="16" cy="15" r="4"/><path d="m19 18 3 3M7 9h5m-5 4h2"/></>}</svg>;}
/** A choice that sits on a lip and presses down when tapped. Pressed (chosen) choices turn mint with a green lip. */
const tile='rounded-xl border-2 border-line-strong bg-white text-navy shadow-[0_3px_0_var(--color-line-strong)] transition-[transform,box-shadow,background-color,border-color] duration-100 hover:bg-sky active:translate-y-[3px] active:shadow-none aria-pressed:border-green aria-pressed:bg-mint aria-pressed:shadow-[0_3px_0_var(--color-green-deep)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy motion-reduce:transition-none motion-reduce:active:translate-y-0';
const cta='min-h-12 whitespace-nowrap border-b-4 border-green-deep text-base active:translate-y-[2px] active:border-b-2 max-[359px]:px-3 motion-reduce:active:translate-y-0';

export function GoalSetup({onSaved,onCancel,onBrowse,entry=false,modal=false}:{onSaved:()=>void;onCancel?:()=>void;onBrowse?:()=>void;entry?:boolean;modal?:boolean}){
 const {state:s,update,today,profileName,setProfileName}=useProgram();
 const askName=!s.setup,totalSteps=askName?3:2;
 const [name,setName]=useState(profileName===DEFAULT_PROFILE_NAME?'':profileName);
 const [step,setStep]=useState(0),[goal,setGoal]=useState<LearnerSetup['goal']|undefined>(learnerGoal(s));
 const [cet,setCet]=useState<CETPreferences>(()=>{if(s.setup?.cet)return s.setup.cet;const exam=s.setup?.goal==='exam'?s.setup.exam:s.pledge?.exam;return exam?{general:false,targets:[{key:exam,exam,name:EXAMS[exam].name,date:s.setup?.goal==='exam'?s.setup.targetDate:s.pledge?.examDate}]}:{general:true,targets:[]};}),[program,setProgram]=useState(s.bridgeProgram??''),[concept,setConcept]=useState(s.setup?.concept??'');
 const [error,setError]=useState('');
 const heading=useRef<HTMLHeadingElement>(null),cetFields=useRef<HTMLDivElement>(null),scroller=useRef<HTMLDivElement>(null);
 useEffect(()=>{heading.current?.focus({preventScroll:true});if(step>0){if(scroller.current)scroller.current.scrollTop=0;else heading.current?.closest<HTMLElement>('[data-goal-setup]')?.scrollIntoView({block:'start',behavior:'instant'});}setError('');},[step]);
 const topics=useMemo(()=>CONCEPTS.map(c=>({id:c.id,label:c.title,category:c.subtest==='science'?c.area:c.subtest==='math'?'Math':c.subtest==='language'?'Language':'Reading',search:c.area})),[]);
 const Title=modal?'h2':'h1';
 const title=step===0?'What would you like to work on?':step===1?goal==='exam'?'Which exams are on your list?':goal==='college'?'What will you study?':'Choose a subject and topic':'What should we call you?';
 function advance(){
  if(!goal)return;
  let chosenCet=cet;
  if(step===1){if(goal==='college'&&program!=='general'&&!PROGRAM_BY_ID[program])return setError('Choose a field, or use I’m not sure yet.');if(goal==='topic'&&!CONCEPT_BY_ID[concept])return setError('Choose a topic to start with.');if(goal==='exam'){const targets=cet.targets.map(t=>({...t,date:cetFields.current?.querySelector<HTMLInputElement>(`input[data-cet-key="${t.key}"]`)?.value||undefined}));if(!cet.general&&!targets.length)return setError('Choose General CET review or add an exam.');if(targets.some(t=>t.date&&(!validDay(t.date)||t.date<=today)))return setError('Choose future planning dates, or leave them blank.');chosenCet={...cet,targets};setCet(chosenCet);}if(!askName){save(false,chosenCet);return;}}
  setStep(x=>x+1);
 }
 function save(skipName=false,chosenCet=cet){
  if(!goal)return;
  if(askName)setProfileName(skipName?'':name);
  update(p=>{
   const prior=p.setup??p.pledge,weekdays=prior?.weekdays.length?[...prior.weekdays]:[1,3,5,6],minutes=prior?.minutes??30,time=prior?.time&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(prior.time)?prior.time:'19:00',firstCet=chosenCet.targets[0];
   const setup:LearnerSetup={goal,exam:goal==='exam'?firstCet?.exam:p.setup?.exam,...(goal==='exam'?{cet:chosenCet}:p.setup?.cet?{cet:p.setup.cet}:{}),concept:concept||undefined,weekdays:weekdays.sort(),minutes,time,createdAt:p.setup?.createdAt??Date.now()};
   return {...p,setup,sides:{...p.sides,admission:goal==='exam'||p.sides.admission,bridge:goal==='college'||p.sides.bridge},activeSide:goal==='college'?'bridge':'admission',bridgeProgram:goal==='college'?program:p.bridgeProgram,
    ...(goal==='exam'&&firstCet?.exam&&firstCet.date?{pledge:{exam:firstCet.exam,examDate:firstCet.date,why:p.pledge?.why??'',days:weekdays.length,minutes,when:p.pledge?.when??'after class',time,weekdays:setup.weekdays,createdAt:p.pledge?.createdAt??Date.now()}}:{})};
  });
  onSaved();
 }
 const kicker=step===0?'Your starting point':step===1?'Your focus':'Your name · optional';
 const note=step===0?'Choose what you need today. You can change it any time.':step===1?goal==='college'?'We’ll suggest foundations used in your first year. No placement test is required.':goal==='topic'?'Choose a subject first, then a topic.':'One reviewer, with room for all your exam targets.':'Add a name, or skip this and use Khanpanion.';
 const progress=<div role="progressbar" aria-label="Setup progress" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={step+1} aria-valuetext={`Step ${step+1} of ${totalSteps}`} className="h-3 min-w-0 flex-1 overflow-hidden rounded-sm bg-line"><span className="block h-full rounded-sm bg-green transition-[width] duration-500 ease-out motion-reduce:transition-none" style={{width:`${(step+1)*100/totalSteps}%`}}/></div>;
 const close=onCancel&&<button aria-label="Close personalization" onClick={onCancel} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg p-0 text-navy hover:bg-sky focus-visible:outline-2 focus-visible:outline-navy"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg></button>;
 const intro=<>
  <div className="flex items-center gap-3"><span className="shrink-0"><Companion size={modal?64:48} pose={step===0?'wave':step===1?'curious':'encourage'}/></span><p className="relative min-w-0 rounded-xl border-2 border-line bg-white px-3.5 py-2.5 text-[15px] font-semibold leading-snug text-navy before:absolute before:-left-[9px] before:top-1/2 before:h-4 before:w-4 before:-translate-y-1/2 before:rotate-45 before:border-b-2 before:border-l-2 before:border-line before:bg-white">{note}</p></div>
  <p className="mt-6 text-sm font-semibold text-ink-soft"><Headline>{step===0?'Your Study Companion for Khan Academy':kicker}</Headline></p>
  <Title ref={heading} id={modal?'goal-dialog-title':'goal-page-title'} tabIndex={-1} className={cx('mt-1 font-extrabold leading-tight tracking-[-.03em] focus:outline-none',modal?'text-[1.75rem] sm:text-4xl':'text-2xl')}>{title}</Title>
  {step===0&&<p className="mt-2 text-sm leading-relaxed text-ink-soft">Khan Academy lessons, focused Khanpanion explanations and fresh checks, connected to your goal.</p>}
 </>;
 const body=<>
  {step===0?<div className="mt-6 grid gap-3">{GOALS.map(g=><button key={g.id} aria-label={g.title} aria-pressed={goal===g.id} onClick={()=>{if(entry&&s.setup?.goal===g.id){onSaved();return;}setGoal(g.id);setStep(1);}} className={cx(tile,'flex min-h-[4.75rem] w-full items-center gap-4 px-4 py-3 text-left')}><span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-mint text-navy"><GoalIcon goal={g.id}/></span><span className="min-w-0 flex-1"><span className="block text-[17px] font-bold"><Headline>{g.label}</Headline></span><span className="mt-0.5 block text-sm leading-snug text-ink-soft">{entry&&s.setup?.goal===g.id?'Continue with your saved goal and routine.':g.detail}</span></span><span aria-hidden="true" className="text-2xl text-navy/45">›</span></button>)}</div>
   :step===1?<div className="mt-6">
    {goal==='exam'?<div ref={cetFields}><CETPicker value={cet} onChange={setCet} today={today}/></div>
     :goal==='college'?<div><p className="font-bold">Which field is closest to yours?</p><p className="mt-1 text-sm text-ink-soft">These are groups of degrees, not a college application. Choose one to see relevant topics.</p><button aria-pressed={program==='general'} onClick={()=>setProgram('general')} className={cx(tile,'mt-3 min-h-14 w-full px-4 py-3 text-left font-semibold')}>I’m not sure yet<span className="mt-1 block text-xs font-normal text-ink-soft">Start with general math and science foundations.</span></button><div role="group" aria-label="Your college program" className="mt-4 grid gap-3 sm:grid-cols-2">{PROGRAMS.map(p=><button aria-label={p.title} key={p.id} aria-pressed={program===p.id} onClick={()=>setProgram(p.id)} className={cx(tile,'min-h-20 px-3 py-3 text-left')}><span className="block font-bold"><Headline>{p.title}</Headline></span><span className="mt-1 block text-xs leading-relaxed text-ink-soft">{p.examples.replaceAll('BS ','').replaceAll('BA ','')}</span></button>)}</div></div>
     :<TopicPicker items={topics} value={concept} onChoose={setConcept}/>}
   </div>:<form className="mt-6" onSubmit={e=>{e.preventDefault();save();}}><ProfileNameField value={name} onChange={setName}/></form>}
  {error&&<p role="alert" className="mt-4 font-semibold text-navy">{error}</p>}
 </>;
 const actions=step===0?onBrowse&&<button aria-label="I’m just browsing" onClick={onBrowse} className={cx(tile,'flex min-h-12 w-full items-center justify-center gap-2 px-4 py-2 text-center')}><span className="font-bold"><Headline>I’m just browsing</Headline></span></button>
  :<><button className={cx(btn.ghost,'min-h-12')} onClick={()=>setStep(x=>x-1)}><Headline>Back</Headline></button>{step===2&&askName&&<button type="button" className={cx(btn.quiet,'min-h-12 max-[359px]:px-2')} onClick={()=>save(true)}>Skip</button>}<button className={cx(btn.primary,cta,'flex-1 sm:ml-auto sm:min-w-56 sm:flex-none',step===2&&askName&&'basis-full sm:basis-auto')} onClick={step===2?()=>save():advance}><Headline>{step===2?'Show my study space':'Continue'}</Headline></button></>;
 /** As the first-visit picker it fills the screen in white, so nothing behind it competes for attention. */
 if(modal)return <div data-goal-setup className="flex h-full min-h-0 flex-col bg-white text-navy">
  <div className="shrink-0 border-b border-line"><div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-3 sm:gap-5 sm:px-6"><span className="shrink-0"><Wordmark small compact/></span>{progress}{close}</div></div>
  <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain"><div className="mx-auto w-full max-w-xl px-5 pb-8 pt-6 sm:pt-12">{intro}{body}</div></div>
  {actions&&<div className="shrink-0 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]"><div className="mx-auto flex w-full max-w-xl flex-wrap gap-2 px-5 py-3">{actions}</div></div>}
 </div>;
 return <Sheet as="div" data-goal-setup className="min-w-0 scroll-mt-20 overflow-hidden bg-white p-0 sm:p-0">
  <div className="flex items-center gap-3 border-b border-line px-5 py-3 sm:px-7">{progress}{close}</div>
  <div className="px-5 pb-4 pt-5 sm:px-7 sm:pt-6">{intro}{body}</div>
  {actions&&<div className={cx('z-20 flex flex-wrap gap-2 border-t border-line bg-white px-5 py-3 sm:px-7',step>0&&'sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-0')}>{actions}</div>}
 </Sheet>;
}
