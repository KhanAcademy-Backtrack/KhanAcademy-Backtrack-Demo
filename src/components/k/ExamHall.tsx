'use client';
import Link from 'next/link';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {AnimatePresence,motion} from 'motion/react';
import {useQuietMotion} from './useQuietMotion';
import {useProgram} from './ProgramProvider';
import {Question,PassageView} from './Question';
import {Oval,btn,cx,Wordmark} from './ui';
import {Companion} from '@/components/study/Companion';
import {formFromKey,formItems,itemById,formMinutes,type Form} from '@/lib/mock/forms';
import {newAttempt,type Attempt} from '@/lib/program/store';
import {suggestTriage} from '@/lib/mock/analysis';
import {SUBTEST_LABEL} from '@/lib/mock/types';
import {DUR,EASE,tween} from '@/lib/motion-tokens';
import {t} from '@/lib/i18n';

const clock=(s:number)=>{const v=Math.max(0,Math.round(s)),h=Math.floor(v/3600),m=Math.floor(v%3600/60),x=v%60;return h?`${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`:`${m}:${String(x).padStart(2,'0')}`;};
const KEY=/^[a-z]+~[\w|-]+$/;

export function ExamHall(){
 const params=useSearchParams(),router=useRouter(),{state,ready,update,today}=useProgram(),reduced=useQuietMotion(),lang=state.lang;
 const formKey=params.get('f')??'',practiceParam=params.get('mode')==='practice';
 const form=useMemo(()=>KEY.test(formKey)?formFromKey(formKey):undefined,[formKey]);
 const saved=state.attempts.find(a=>a.formKey===formKey&&!a.submittedAt&&form&&a.section>=0&&a.section<form.sections.length&&a.index>=0&&a.index<form.sections[a.section].itemIds.length);
 if(!ready)return <div className="min-h-screen bg-navy-night"/>;
 if(!form||!formItems(form).length)return <div className="grid min-h-screen place-items-center bg-navy p-8 text-center text-white"><div><p className="text-2xl font-bold">This mock exam link is not complete.</p><Link href="/mock" className={cx(btn.primary,'mt-6')}>Choose a mock exam</Link></div></div>;
 return saved?<Hall key={saved.id} form={form} attempt={saved} practice={practiceParam}/>:<Start form={form} practice={practiceParam} onStart={timed=>{const a=newAttempt(formKey,timed,Date.now());update(s=>({...s,attempts:[...s.attempts,a],activeAttempt:a.id}));}}/>;
}

function Start({form,practice,onStart}:{form:Form;practice:boolean;onStart:(timed:boolean)=>void}){
  const {state}=useProgram(),lang=state.lang;
  const [timed,setTimed]=useState(form.kind==='full'||form.kind==='section'||form.kind==='fixed');
  const total=formItems(form).length,minutes=formMinutes(form);
  return <div className="min-h-screen bg-navy text-white">
   <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-14">
    <div className="flex items-center justify-between"><Link href="/mock" aria-label="Back to mock exams"><Wordmark onDark small/></Link><Link href="/mock" className="text-white/75 underline underline-offset-4">Not now</Link></div>
    <h1 className="mt-10 text-4xl font-extrabold tracking-[-.035em] sm:text-5xl">{form.title}</h1>
    <p className="mt-3 text-lg text-white/80">{total} questions{form.sections.length>1?` in ${form.sections.length} sections`:''}. About {minutes} minutes at exam pace.</p>
    <ul className="mt-6 grid gap-2">{form.sections.map((s,i)=><li key={i} className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3"><span className="font-semibold">{SUBTEST_LABEL[s.subtest]}</span><span className="text-white/75">{s.itemIds.length} questions · {s.minutes} min</span></li>)}</ul>
    <fieldset className="mt-8"><legend className="font-bold">Timer</legend>
     <div className="mt-3 grid gap-2 sm:grid-cols-2">{[[true,t(lang,'mock.timed'),'Counts down each section. You can pause or hide it any time.'],[false,t(lang,'mock.untimed'),'Take your time. Results still show how long you took.']].map(([v,l,d])=><button key={String(v)} aria-pressed={timed===v} onClick={()=>setTimed(v as boolean)} className="rounded-2xl border-2 border-white/20 p-4 text-left aria-pressed:border-green aria-pressed:bg-white/8 text-white"><span className="flex items-center gap-2 font-bold"><Oval filled={timed===v} size={24} tone="white"/>{l as string}</span><span className="mt-1 block text-sm text-white/75">{d as string}</span></button>)}</div>
    </fieldset>
    <p className="mt-6 text-white/80">{practice?'Practice mode: check each answer as you go and open the explanation straight away.':'Exam mode: answers and explanations appear on the results page, like the real thing.'} Every answer saves on this phone as you go, so you can close the page and come back.</p>
    <button className={cx(btn.primary,'mt-8 w-full sm:w-auto')} onClick={()=>onStart(timed)}>Enter the exam hall</button>
   </div>
  </div>;
 }

 function Hall({form,attempt,practice}:{form:Form;attempt:Attempt;practice:boolean}){
  const router=useRouter(),{state,update,today}=useProgram(),reduced=useQuietMotion(),lang=state.lang;
  const [a,setA]=useState<Attempt>(attempt),live=useRef(a);
  const [paused,setPaused]=useState(false),[hideTimer,setHideTimer]=useState(false),[nav,setNav]=useState(false),[confirm,setConfirm]=useState(false),[breakFor,setBreakFor]=useState<number|null>(null),[revealed,setRevealed]=useState<string[]>([]);
  const section=form.sections[a.section],id=section.itemIds[a.index],item=itemById(id)!;
  const elapsed=useRef(a.elapsedMs[a.section]??0),tick=useRef(Date.now()),itemStart=useRef(Date.now()),running=useRef(true);
  const [now,setNow]=useState(elapsed.current);
  const save=useCallback((next:Attempt)=>{live.current=next;setA(next);update(s=>({...s,attempts:s.attempts.map(x=>x.id===next.id?next:x)}));},[update]);
  const withTime=useCallback((x:Attempt):Attempt=>{const t0=Date.now(),spent=running.current?(t0-itemStart.current)/1000:0;if(running.current)elapsed.current+=t0-tick.current;tick.current=t0;itemStart.current=t0;const cur=form.sections[x.section].itemIds[x.index];return {...x,updatedAt:t0,seconds:{...x.seconds,[cur]:Math.round(((x.seconds[cur]??0)+spent)*10)/10},elapsedMs:{...x.elapsedMs,[x.section]:Math.round(elapsed.current)}};},[form]);
  useEffect(()=>{const h=setInterval(()=>{if(!running.current)return;const t0=Date.now();elapsed.current+=t0-tick.current;tick.current=t0;setNow(elapsed.current);},500);return()=>clearInterval(h);},[]);
  useEffect(()=>{const h=setInterval(()=>save(withTime(live.current)),8000);const hide=()=>save(withTime(live.current));window.addEventListener('pagehide',hide);return()=>{clearInterval(h);window.removeEventListener('pagehide',hide);};},[save,withTime]);
  const stopClock=()=>{save(withTime(live.current));running.current=false;};
  const startClock=()=>{tick.current=Date.now();itemStart.current=tick.current;running.current=true;};
  const go=(section:number,index:number)=>{const x=withTime(live.current);elapsed.current=section!==x.section?(x.elapsedMs[section]??0):elapsed.current;setNow(elapsed.current);save({...x,section,index});setNav(false);};
  const choose=(i:number)=>save({...a,answers:{...a.answers,[id]:i},idk:a.idk.filter(x=>x!==id)});
  const idk=()=>save({...a,answers:{...a.answers,[id]:null},idk:a.idk.includes(id)?a.idk.filter(x=>x!==id):[...a.idk,id]});
  const flag=()=>save({...a,flags:a.flags.includes(id)?a.flags.filter(x=>x!==id):[...a.flags,id]});
  const sure=()=>save({...a,sure:{...a.sure,[id]:a.sure[id]==='sure'?'unsure':'sure'}});
  const lastInSection=a.index===section.itemIds.length-1,lastSection=a.section===form.sections.length-1;
  const next=()=>{if(!lastInSection)return go(a.section,a.index+1);if(!lastSection){stopClock();setBreakFor(a.section+1);return;}setConfirm(true);};
  const remaining=section.minutes*60-now/1000;
  const unanswered=formItems(form).filter(x=>a.answers[x]==null&&!a.idk.includes(x)).length;
  function submit(){
   const x=withTime(live.current),ids=formItems(form),at=Date.now();
   const triage=suggestTriage(ids,x,i=>itemById(i)?.answerIndex);
   const done:Attempt={...x,submittedAt:at,triage};
   const misses=ids.filter(i=>x.answers[i]!==itemById(i)?.answerIndex);
   const kind=form.kind;
   update(s=>{
    const concepts={...s.concepts};
    if(kind==='topic'||kind==='exit'){const c=itemById(ids[0])!.concept;const prev=concepts[c]??{checks:[]};concepts[c]={...prev,checks:[...prev.checks,{at,correct:ids.length-misses.length,total:ids.length}].slice(-20)};}
    const recall={...s.recall};for(const i of misses)recall[`item:${i}`]={due:at+86400000,stage:0,last:at};
    return {...s,attempts:s.attempts.map(y=>y.id===done.id?done:y),activeAttempt:undefined,concepts,recall,studyDays:[...s.studyDays,today],
     missions:kind==='exit'?{...s.missions,[today]:{...s.missions[today],exit:at}}:s.missions,
     notebook:[...s.notebook,...misses.map(i=>{const it=itemById(i)!;const ch=x.answers[i]??null;return {itemId:i,at,formKey:x.formKey,chosen:ch,idk:x.idk.includes(i),triage:triage[i],misconception:ch!==null?it.misconceptions[ch]??undefined:undefined,concept:it.concept};})]};
   });
   router.push(`/mock/result?a=${done.id}`);
  }
  if(breakFor!==null)return <div className="grid min-h-screen place-items-center bg-navy-night px-6 text-center text-white"><div className="max-w-md"><Companion size={110} pose="encourage"/><h1 className="mt-4 text-3xl font-extrabold">Section done. Take a breath.</h1><p className="mt-3 text-white/80">In a full simulation this is a {form.breakMinutes}-minute break. Stand up, drink water, look away from the screen.</p><p className="mt-2 text-white/80">Next: {SUBTEST_LABEL[form.sections[breakFor].subtest]}, {form.sections[breakFor].itemIds.length} questions.</p><button className={cx(btn.primary,'mt-8')} onClick={()=>{const target=breakFor;go(target,0);startClock();setBreakFor(null);}}>Start the next section</button></div></div>;
  return <motion.div className="min-h-screen bg-navy-night text-white" initial={reduced?false:{opacity:0}} animate={{opacity:1}} transition={{duration:DUR.slow}}>
   <header className="sticky top-0 z-30 border-b border-white/10 bg-navy-night/95 backdrop-blur">
    <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-8">
     <div className="min-w-0 basis-full sm:basis-auto sm:flex-1"><p className="truncate text-sm text-white/70">{form.title}</p><p className="truncate font-bold">{SUBTEST_LABEL[section.subtest]} · {a.index+1} of {section.itemIds.length}</p></div>
     {a.timed&&<div className="flex items-center gap-2">
      {!hideTimer&&<motion.span initial={reduced?false:{opacity:0}} animate={{opacity:1}} transition={{duration:DUR.fast,delay:DUR.slow}} className={cx('rounded-full px-3 py-1 font-sans text-lg font-bold tabular-nums',remaining<0?'bg-white text-navy':'bg-white/10')} aria-label={remaining<0?'Over time':'Time left'}>{remaining<0?'+':''}{clock(Math.abs(remaining))}{remaining<0?' over':''}</motion.span>}
      <button className="min-h-11 rounded-full px-3 text-sm font-semibold text-white/80 hover:bg-white/10" onClick={()=>setHideTimer(!hideTimer)}>{hideTimer?t(lang,'mock.showTimer'):t(lang,'mock.hideTimer')}</button>
     </div>}
     <button className="min-h-11 rounded-full border-2 border-white/25 px-4 text-sm font-bold text-white" onClick={()=>{stopClock();setPaused(true);}}>{t(lang,'mock.pause')}</button>
     <button className="min-h-11 rounded-full bg-white/10 px-4 text-sm font-bold lg:hidden text-white" aria-expanded={nav} onClick={()=>setNav(!nav)}>{t(lang,'mock.navigator')}</button>
    </div>
   </header>
   <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-40 pt-6 sm:px-8 lg:grid-cols-[1fr_280px] lg:pb-16">
    <motion.div initial={reduced?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:DUR.slow,ease:EASE as unknown as [number,number,number,number]}}
     className={cx('rounded-[22px] bg-white p-5 text-navy sm:p-8',item.passageId&&'lg:grid lg:grid-cols-2 lg:gap-8')}>
     {item.passageId&&<div className="mb-5 lg:mb-0"><PassageView id={item.passageId} compact/></div>}
     <motion.div key={id} initial={reduced?false:{opacity:0}} animate={{opacity:1}} transition={tween(reduced,DUR.fast)}>
      <Question key={id} item={item} number={a.index+1} mode={practice?'practice':'exam'} lang={lang} showPassage={false} chosen={a.answers[id]??null} idk={a.idk.includes(id)} onChoose={choose} onIdk={idk} revealed={revealed.includes(id)} onReveal={()=>setRevealed(r=>[...r,id])}/>
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-mint-line pt-4">
       <button aria-pressed={a.flags.includes(id)} onClick={flag} className="min-h-11 rounded-full border-2 border-navy/15 px-4 text-sm font-bold aria-pressed:border-navy aria-pressed:bg-sky text-navy">{a.flags.includes(id)?t(lang,'mock.flagged'):t(lang,'mock.flag')}</button>
       <button aria-pressed={a.sure[id]==='sure'} onClick={sure} disabled={a.answers[id]==null} className="min-h-11 rounded-full border-2 border-navy/15 px-4 text-sm font-bold aria-pressed:border-green aria-pressed:bg-mint disabled:opacity-40 text-navy">{t(lang,'mock.sure')}</button>
      </div>
     </motion.div>
    </motion.div>
    <aside className={cx('rounded-[22px] bg-navy p-4 lg:sticky lg:top-24 lg:block lg:self-start',nav?'fixed inset-x-3 bottom-24 z-40 max-h-[60vh] overflow-y-auto shadow-2xl':'hidden')}>
     <div className="mb-3 flex items-center justify-between lg:hidden"><h2 className="font-bold">Question navigator</h2><button className="min-h-11 px-3 font-bold text-white" onClick={()=>setNav(false)}>Close</button></div>
     {form.sections.map((sec,si)=><div key={si} className="mb-4 last:mb-0"><p className="mb-2 text-sm font-bold text-white/80">{SUBTEST_LABEL[sec.subtest]}</p>
      <div className="grid grid-cols-6 gap-1.5">{sec.itemIds.map((x,xi)=>{const cur=si===a.section&&xi===a.index,answered=a.answers[x]!=null||a.idk.includes(x);return <button key={x} onClick={()=>go(si,xi)} aria-label={`Question ${xi+1}${answered?', answered':''}${a.flags.includes(x)?', flagged':''}`} aria-current={cur?'step':undefined}
       className={cx('relative grid h-11 place-items-center rounded-[50%] text-xs font-bold text-navy',answered?'bg-green text-navy':'bg-white/10 text-white',cur&&'ring-2 ring-white ring-offset-2 ring-offset-navy')}>{xi+1}{a.flags.includes(x)&&<span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-white"/>}</button>;})}</div></div>)}
     <p className="mt-3 text-xs text-white/70">Green is answered. A white dot is flagged.</p>
    </aside>
   </div>
   <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-navy-night/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-8">
     <button className={btn.onDark} disabled={a.index===0&&a.section===0} onClick={()=>a.index>0?go(a.section,a.index-1):go(a.section-1,form.sections[a.section-1].itemIds.length-1)}>{t(lang,'mock.prev')}</button>
     <span className="flex-1"/>
     <button className="hidden min-h-11 rounded-full px-4 font-semibold text-white/80 underline underline-offset-4 sm:block" onClick={()=>setConfirm(true)}>{t(lang,'mock.submit')}</button>
     <button className={btn.primary} onClick={next}>{lastInSection?(lastSection?t(lang,'mock.submit'):'Finish section'):t(lang,'mock.next')}</button>
    </div>
   </footer>
   <AnimatePresence>{paused&&<motion.div key="pause" role="dialog" aria-modal="true" aria-labelledby="pause-title" className="fixed inset-0 z-50 grid place-items-center bg-navy-night/97 px-6 text-center" initial={reduced?false:{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:DUR.base}}>
    <div className="max-w-md"><Companion size={110} pose="idle" still/><h2 id="pause-title" className="mt-4 text-3xl font-extrabold">{t(lang,'mock.paused')}</h2><p className="mt-3 text-white/80">The clock is stopped and the question is hidden. Everything is saved.</p><button autoFocus className={cx(btn.primary,'mt-8')} onClick={()=>{startClock();setPaused(false);}}>{t(lang,'mock.resume')}</button><Link href="/mock" className="mt-4 block text-white/75 underline underline-offset-4">Leave and continue later</Link></div>
   </motion.div>}
   {confirm&&<motion.div key="confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="fixed inset-0 z-50 grid place-items-center bg-navy-night/90 px-6" initial={reduced?false:{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:DUR.base}}>
    <div className="w-full max-w-md rounded-[22px] bg-white p-6 text-navy"><h2 id="confirm-title" className="text-2xl font-extrabold">Submit your answers?</h2><p className="mt-2 text-ink-soft">{unanswered?`${unanswered} question${unanswered===1?' is':'s are'} still blank. Blank answers never cost extra points, and you will see how to solve each one.`:'Every question has an answer.'}</p><div className="mt-6 flex flex-wrap gap-2"><button autoFocus className={btn.primary} onClick={submit}>Submit and see results</button><button className={btn.ghost} onClick={()=>setConfirm(false)}>Keep working</button></div></div>
   </motion.div>}</AnimatePresence>
  </motion.div>;
 }
