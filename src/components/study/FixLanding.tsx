'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {RouteCanvas} from '@/components/product/RouteCanvas';
import {Sheet,btn,cx} from '@/components/k/ui';
import {Companion} from './Companion';
import {useStudy} from './StudyProvider';
import {prepareRound,type StudySession,type StudyTask} from '@/lib/study';
import {LABELS,TOPICS} from '@/lib/recovery';

/** The page a "Find my missing skill" button lands on, before the lesson opens.
 *  It explains the step and the route, and starting writes nothing: the round's
 *  own start time is set only once the lesson mounts. */
export function FixLanding({session,task,onStart}:{session:StudySession;task:StudyTask;onStart:()=>void}){
 const {state}=useStudy(),router=useRouter();
 const [route]=useState(()=>prepareRound(state,task,Date.now()));
 const step=task.skill==='goal'?TOPICS[task.topic].label:LABELS[task.skill],goal=(route.goalTitle??TOPICS[task.topic].label).toLowerCase();
 const steps:[string,string][]=[
  ['Learn the step','Start with a visual guide or a worked example. Take as long as you need.'],
  ['Answer two fresh questions','Two new questions, answered on your own. A miss is a clue: the route checks an earlier step instead of starting over.'],
  ['Return to your goal',`Once the step holds, the route brings you back to ${goal}.`]
 ];
 const back=()=>{if(window.history.length>1)router.back();else router.push('/reviewer');};
 return <div className="fix-landing mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
  <Sheet as="div" className="min-w-0">
   <div className="flex items-start gap-4">
    <div className="hidden shrink-0 sm:block"><Companion size={64} pose="encourage"/></div>
    <div className="min-w-0">
     <p className="text-sm font-semibold text-ink-soft">Fix a gap</p>
     <h1 className="mt-1 break-words text-[1.9rem] font-extrabold leading-tight tracking-[-.025em] sm:text-[2.3rem]">{step}</h1>
     <p className="mt-2 max-w-xl text-[17px] leading-relaxed text-ink-soft">One short lesson on this step, then fresh questions that bring you back to {goal}.</p>
    </div>
   </div>
   {task.reason&&<div className="mt-5 rounded-lg bg-sky px-4 py-3"><p className="text-sm font-semibold text-ink-soft">Why this step</p><p className="mt-0.5 font-semibold">{task.reason}</p></div>}
   <h2 className="mt-6 text-lg font-extrabold">How it works</h2>
   <ol className="mt-3 grid gap-3">{steps.map(([title,body],i)=><li key={title} className="flex gap-3"><span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-mint text-sm font-extrabold">{i+1}</span><div><p className="font-bold">{title}</p><p className="text-[15px] text-ink-soft">{body}</p></div></li>)}</ol>
   <p className="mt-6 text-sm font-semibold text-ink-soft">About {session.minutes} minutes · Saved in this browser · Stop whenever you like</p>
   <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" className={btn.primary} onClick={onStart}>Start the lesson</button><button type="button" className={btn.quiet} onClick={back}>Not now</button></div>
   <p className="mt-4 text-sm text-ink-soft">This isn’t for a grade. “I don’t know yet” is a useful answer.</p>
  </Sheet>
  <Sheet as="div" className={cx('min-w-0','lg:sticky lg:top-24')}>
   <p className="text-sm font-semibold text-ink-soft">What we’re working toward</p>
   <h2 className="mt-1 text-xl font-extrabold">{route.goalTitle??TOPICS[task.topic].label}</h2>
   <RouteCanvas state={route} compact/>
  </Sheet>
 </div>;
}
