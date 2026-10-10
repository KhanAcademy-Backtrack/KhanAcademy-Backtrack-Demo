'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useRef,useState} from 'react';
import {Companion} from '@/components/study/Companion';
import {calendarItems} from '@/lib/program/calendar';
import {useProgram} from './ProgramProvider';
import {ChangeGoalButton} from './ProgramTourProvider';
import {StudyWeek} from './StudyWeek';
import {Headline} from './Headline';
import {PageBand,Sheet,btn,cx,pageBody} from './ui';

const DAYS=[[1,'Mon'],[2,'Tue'],[3,'Wed'],[4,'Thu'],[5,'Fri'],[6,'Sat'],[0,'Sun']] as const;
const tile='rounded-xl border-2 border-line-strong bg-white text-navy shadow-[0_3px_0_var(--color-line-strong)] transition-[transform,box-shadow,background-color,border-color] duration-100 hover:bg-sky active:translate-y-[3px] active:shadow-none aria-pressed:border-green aria-pressed:bg-mint aria-pressed:shadow-[0_3px_0_var(--color-green-deep)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy motion-reduce:transition-none motion-reduce:active:translate-y-0';
const field='min-h-12 w-full rounded-xl border-2 border-line-strong bg-white px-3 text-base text-navy focus:border-navy focus:outline-none';
const hours=(m:number)=>m<60?`${m} min`:`${Math.floor(m/60)} h${m%60?` ${m%60} min`:''}`;

export function StudyRoutine(){
 const {state,update,today}=useProgram(),router=useRouter(),saved=state.setup??state.pledge;
 const [days,setDays]=useState(saved?.weekdays??[1,3,5,6]),[minutes,setMinutes]=useState(saved?.minutes??30),[time,setTime]=useState(saved?.time??'19:00'),[error,setError]=useState('');
 const timeInput=useRef<HTMLInputElement>(null);
 const routine={weekdays:[...days].sort(),minutes,time};
 const snapshot={...state,...(state.setup?{setup:{...state.setup,...routine}}:{}),...(state.pledge?{pledge:{...state.pledge,...routine,days:days.length}}:{})};
 const items=calendarItems(snapshot,today,false);
 function save(){
  if(!days.length)return setError('Choose at least one study day.');
  const chosenTime=timeInput.current?.value??time;
  if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(chosenTime))return setError('Choose a study time.');
  update(p=>({...p,...(p.setup?{setup:{...p.setup,...routine,time:chosenTime}}:{}),...(p.pledge?{pledge:{...p.pledge,...routine,time:chosenTime,days:days.length}}:{})}));
  router.push('/calendar');
 }
 return <>
  <PageBand title="Choose your study week" lead="Pick a routine you can change later." aside={<Link className={btn.quiet} href="/calendar"><Headline>Back to calendar</Headline></Link>}/>
  <div className={pageBody}><Sheet className="mx-auto max-w-2xl">
   {saved?<form onSubmit={e=>{e.preventDefault();save();}} className="grid gap-6">
    <div className="flex items-center gap-3"><Companion size={64} pose="encourage"/><p className="text-sm font-semibold text-ink-soft">Choose the days and time that fit your week.</p></div>
    <fieldset><legend className="font-bold">Which days work for you?</legend><div className="mt-3 grid grid-cols-4 gap-2 min-[420px]:grid-cols-7">{DAYS.map(([id,label])=><button type="button" key={id} aria-pressed={days.includes(id)} onClick={()=>{setDays(x=>x.includes(id)?x.filter(d=>d!==id):[...x,id]);setError('');}} className={cx(tile,'min-h-12 px-1 font-bold')}>{label}</button>)}</div></fieldset>
    <fieldset><legend className="font-bold">How long is a comfortable session?</legend><div className="mt-3 grid grid-cols-3 gap-2 min-[420px]:grid-cols-5">{[15,20,30,45,60].map(n=><button type="button" key={n} aria-pressed={minutes===n} onClick={()=>setMinutes(n)} className={cx(tile,'min-h-12 px-2 font-bold')}>{n} min</button>)}</div></fieldset>
    <label className="grid gap-2 font-bold">Usual study time<input ref={timeInput} type="time" className={cx(field,'font-normal')} value={time} onChange={e=>setTime(e.target.value)} onInput={e=>setTime(e.currentTarget.value)} onBlur={e=>setTime(e.currentTarget.value)}/></label>
    <div className="min-w-0 rounded-xl border-2 border-line p-3 sm:p-4"><div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"><h2 className="text-lg font-bold"><Headline>Your study week</Headline></h2><p aria-live="polite" className="rounded-lg bg-mint px-2.5 py-1 text-sm font-bold text-navy">{days.length} {days.length===1?'session':'sessions'} · {hours(days.length*minutes)} a week</p></div><p className="mt-1 mb-2 text-sm text-ink-soft">Tap a day to see the sessions your choices create.</p><StudyWeek items={items} today={today} preview/></div>
    {error&&<p role="alert" className="font-semibold text-navy">{error}</p>}
    <div className="flex flex-wrap gap-3 border-t border-line pt-5"><Link className={btn.ghost} href="/calendar"><Headline>Cancel</Headline></Link><button type="submit" className={cx(btn.primary,'basis-full sm:ml-auto sm:basis-auto')}><Headline>Save my study routine</Headline></button></div>
   </form>:<><h2 className="text-xl font-bold"><Headline>Choose your study goal first</Headline></h2><p className="mt-2 text-ink-soft">Your calendar will use your goal to plan useful sessions for the days you choose.</p><ChangeGoalButton className={cx(btn.primary,'mt-5')} label="Choose my goal"/></>}
  </Sheet></div>
 </>;
}
