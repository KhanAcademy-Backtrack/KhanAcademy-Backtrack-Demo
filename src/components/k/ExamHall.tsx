'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {AnimatePresence,motion} from 'motion/react';
import {useQuietMotion} from './useQuietMotion';
import {useProgram} from './ProgramProvider';
import {Question,PassageView,FixLinks} from './Question';
import {RelatedVideo} from './RelatedVideo';
import {btn,cx,Wordmark} from './ui';
import {Companion} from '@/components/study/Companion';
import {formFromKey,formItems,itemById,formMinutes,type Form} from '@/lib/mock/forms';
import {newAttempt,type Attempt} from '@/lib/program/store';
import {suggestTriage} from '@/lib/mock/analysis';
import {SUBTEST_LABEL} from '@/lib/mock/types';
import {DUR,EASE,tween} from '@/lib/motion-tokens';
import {t} from '@/lib/i18n';

const clock=(s:number)=>{const v=Math.max(0,Math.round(s)),h=Math.floor(v/3600),m=Math.floor(v%3600/60),x=v%60;return h?`${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`:`${m}:${String(x).padStart(2,'0')}`;};
const KEY=/^[a-z][a-z0-9]*~[\w|-]+$/;

export function ExamHall(){
 const params=useSearchParams(),router=useRouter(),{state,ready,update,today}=useProgram(),reduced=useQuietMotion(),lang=state.lang;
 const formKey=params.get('f')??'',practiceParam=params.get('mode')==='practice';
 const form=useMemo(()=>KEY.test(formKey)?formFromKey(formKey):undefined,[formKey]);
 const saved=state.attempts.find(a=>a.formKey===formKey&&!a.submittedAt&&form&&a.section>=0&&a.section<form.sections.length&&a.index>=0&&a.index<form.sections[a.section].itemIds.length);
 if(!ready)return <div className="min-h-screen bg-canvas"/>;
 if(!form||!formItems(form).length)return <div className="grid min-h-screen place-items-center bg-canvas p-8 text-center text-navy"><div><p className="text-2xl font-bold">This mock exam link is not complete.</p><Link href="/mock" className={cx(btn.primary,'mt-6')}><Headline>Choose a mock exam</Headline></Link></div></div>;
 return saved?<Hall key={saved.id} form={form} attempt={saved} practice={practiceParam}/>:<Start form={form} practice={practiceParam} onStart={timed=>{const a=newAttempt(formKey,timed,Date.now());update(s=>({...s,attempts:[...s.attempts,a],activeAttempt:a.id}));}}/>;
}

function Start({form,practice,onStart}:{form:Form;practice:boolean;onStart:(timed:boolean)=>void}){
  const {state}=useProgram(),lang=state.lang;
  const [timed,setTimed]=useState(form.kind==='full'||form.kind==='section'||form.kind==='fixed');
  const total=formItems(form).length,minutes=formMinutes(form);
  return <div className="min-h-screen bg-canvas text-navy">
   <div className="mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-10">
    <div className="flex items-center justify-between"><Link href="/mock" aria-label="Back to mock exams"><Wordmark small/></Link><Link href="/mock" className="flex min-h-11 items-center rounded-lg px-3 font-semibold text-ink-soft hover:bg-white hover:text-navy">Not now</Link></div>
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-sheet sm:p-8">
    <h1 className="text-3xl font-extrabold tracking-[-.025em]"><Headline>{form.title}</Headline></h1>
    <p className="mt-2 text-ink-soft">{total} questions{form.sections.length>1?` in ${form.sections.length} sections`:''}. About {minutes} minutes at exam pace.</p>
    <ul className="mt-5 divide-y divide-line border-y border-line">{form.sections.map((s,i)=><li key={i} className="flex items-center justify-between gap-3 py-3"><span className="font-semibold">{SUBTEST_LABEL[s.subtest]}</span><span className="text-sm text-ink-soft">{s.itemIds.length} questions · {s.minutes} min</span></li>)}</ul>
    <fieldset className="mt-6"><legend className="text-sm font-semibold text-ink-soft">Timer</legend>
     <div className="mt-3 grid gap-2 sm:grid-cols-2">{[[true,t(lang,'mock.timed'),'Counts down each section. You can pause or hide it any time.'],[false,t(lang,'mock.untimed'),'Take your time. Results still show how long you took.']].map(([v,l,d])=><button key={String(v)} aria-pressed={timed===v} onClick={()=>setTimed(v as boolean)} className="rounded-xl border-2 border-line p-4 text-left text-navy hover:border-line-strong aria-pressed:border-navy aria-pressed:bg-mint"><span className="flex items-center gap-2 font-bold"><span aria-hidden="true" className={cx('grid h-5 w-5 place-items-center rounded border-2 border-line-strong text-sm',timed===v&&'border-green bg-green text-navy')}>{timed===v?'✓':' '}</span>{l as string}</span><span className="mt-1 block text-sm text-ink-soft">{d as string}</span></button>)}</div>
    </fieldset>
    <p className="mt-5 text-sm leading-relaxed text-ink-soft">{practice?'Practice mode: check each answer as you go and open the explanation straight away.':'Exam mode: answers and explanations appear on the results page, like the real thing.'} Every answer saves on this phone as you go, so you can close the page and come back.</p>
    <button className={cx(btn.primary,'mt-6 w-full sm:w-auto')} onClick={()=>onStart(timed)}><Headline>Enter the exam hall</Headline></button>
    </div>
   </div>
  </div>;
 }

 function Hall({form,attempt,practice}:{form:Form;attempt:Attempt;practice:boolean}){
  const router=useRouter(),{state,update,today}=useProgram(),reduced=useQuietMotion(),lang=state.lang;
  const [a,setA]=useState<Attempt>(attempt),live=useRef(a);
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});},[]);
  const [paused,setPaused]=useState(false),[hideTimer,setHideTimer]=useState(false),[nav,setNav]=useState(false),[confirm,setConfirm]=useState(false),[breakFor,setBreakFor]=useState<number|null>(null);
  const section=form.sections[a.section],id=section.itemIds[a.index],item=itemById(id)!;
  const elapsed=useRef(a.elapsedMs[a.section]??0),tick=useRef(Date.now()),itemStart=useRef(Date.now()),running=useRef(true);
  const [now,setNow]=useState(elapsed.current);
  const save=useCallback((next:Attempt)=>{live.current=next;setA(next);update(s=>({...s,attempts:s.attempts.map(x=>x.id===next.id?next:x)}));},[update]);
  const withTime=useCallback((x:Attempt):Attempt=>{const t0=Date.now(),spent=running.current?(t0-itemStart.current)/1000:0;if(running.current)elapsed.current+=t0-tick.current;tick.current=t0;itemStart.current=t0;const cur=form.sections[x.section].itemIds[x.index];return {...x,updatedAt:t0,seconds:{...x.seconds,[cur]:Math.round(((x.seconds[cur]??0)+spent)*10)/10},elapsedMs:{...x.elapsedMs,[x.section]:Math.round(elapsed.current)}};},[form]);
  useEffect(()=>{const h=setInterval(()=>{if(!running.current)return;const t0=Date.now();elapsed.current+=t0-tick.current;tick.current=t0;setNow(elapsed.current);},500);return()=>clearInterval(h);},[]);
  useEffect(()=>{const h=setInterval(()=>save(withTime(live.current)),8000);const hide=()=>save(withTime(live.current));window.addEventListener('pagehide',hide);return()=>{clearInterval(h);window.removeEventListener('pagehide',hide);};},[save,withTime]);
  const stopClock=()=>{save(withTime(live.current));running.current=false;};
  const startClock=()=>{tick.current=Date.now();itemStart.current=tick.current;running.current=true;};
  const go=(section:number,index:number)=>{const x=withTime(live.current);elapsed.current=section!==x.section?(x.elapsedMs[section]??0):elapsed.current;setNow(elapsed.current);save({...x,section,index});setNav(false);window.scrollTo({top:0,behavior:'instant'});};
  const choose=(i:number)=>save({...a,answers:{...a.answers,[id]:i},idk:a.idk.filter(x=>x!==id)});
  const idk=()=>save({...a,answers:{...a.answers,[id]:null},idk:a.idk.includes(id)?a.idk.filter(x=>x!==id):[...a.idk,id]});
  const flag=()=>save({...a,flags:a.flags.includes(id)?a.flags.filter(x=>x!==id):[...a.flags,id]});
  const sure=()=>save({...a,sure:{...a.sure,[id]:a.sure[id]==='sure'?'unsure':'sure'}});
  const lastInSection=a.index===section.itemIds.length-1,lastSection=a.section===form.sections.length-1;
  const next=()=>{if(!lastInSection)return go(a.section,a.index+1);if(!lastSection){stopClock();setBreakFor(a.section+1);return;}setConfirm(true);};
  const first=a.index===0&&a.section===0,back=()=>a.index>0?go(a.section,a.index-1):go(a.section-1,form.sections[a.section-1].itemIds.length-1);
  const nextLabel=lastInSection?(lastSection?t(lang,'mock.submit'):'Finish section'):t(lang,'mock.next');
  // Back and Next live in the question card, at the end of its answer row (beside Show
  // explanation once a practice answer is checked). Once checked, right or wrong, the
  // Work on this panel (the matched Khan video, plus the fix links after a miss) sits in
  // the side panel on wide screens and below the feedback on narrow ones. Never before
  // the answer is checked, so a video cannot help an answer that is then counted. Only
  // one of the two is rendered, so the embedded player loads once.
  const [wide,setWide]=useState(false);
  useEffect(()=>{const q=matchMedia('(min-width:1024px)'),sync=()=>setWide(q.matches);sync();q.addEventListener('change',sync);return()=>q.removeEventListener('change',sync);},[]);
  const revealed=a.revealed??[],shown=practice&&revealed.includes(id),missed=shown&&(a.answers[id]??null)!==item.answerIndex;
  const work=(heading:string,stacked:boolean)=><><h2 id={heading} className="text-sm font-semibold text-ink-soft"><Headline>Work on this</Headline></h2>
   <RelatedVideo key={id} item={item} className="mt-2"/>
   {missed&&<FixLinks item={item} chosen={a.answers[id]??null} lang={lang} stacked={stacked} className="mt-1"/>}</>;
  const backButton=!first&&<button className={btn.ghost} onClick={back}><Headline>{t(lang,'mock.prev')}</Headline></button>;
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
    return {...s,attempts:s.attempts.map(y=>y.id===done.id?done:y),activeAttempt:undefined,concepts,studyDays:[...s.studyDays,today],
     missions:kind==='exit'?{...s.missions,[today]:{...s.missions[today],exit:at}}:s.missions,
     notebook:[...s.notebook,...misses.map(i=>{const it=itemById(i)!;const ch=x.answers[i]??null;return {itemId:i,at,formKey:x.formKey,chosen:ch,idk:x.idk.includes(i),triage:triage[i],misconception:ch!==null?it.misconceptions[ch]??undefined:undefined,concept:it.concept};})]};
   });
   router.push(`/mock/result?a=${done.id}`);
  }
  if(breakFor!==null)return <div className="grid min-h-screen place-items-center bg-canvas px-4 text-center text-navy"><div className="max-w-md rounded-2xl bg-white p-6 shadow-sheet sm:p-8"><Companion size={72} pose="encourage"/><h1 className="mt-4 text-2xl font-extrabold"><Headline>Section done. Take a breath.</Headline></h1><p className="mt-3 text-ink-soft">In a full simulation this is a {form.breakMinutes}-minute break. Stand up, drink water, look away from the screen.</p><p className="mt-2 text-ink-soft">Next: {SUBTEST_LABEL[form.sections[breakFor].subtest]}, {form.sections[breakFor].itemIds.length} questions.</p><button className={cx(btn.primary,'mt-8')} onClick={()=>{const target=breakFor;go(target,0);startClock();setBreakFor(null);}}><Headline>Start the next section</Headline></button></div></div>;
  return <motion.div className="min-h-screen bg-canvas text-navy" initial={reduced?false:{opacity:0}} animate={{opacity:1}} transition={{duration:DUR.slow}}>
   <header className="sticky top-0 z-30 border-b border-line bg-white">
    <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-8">
     <div className="min-w-0 basis-full sm:basis-auto sm:flex-1"><p className="truncate text-sm text-ink-soft"><Headline>{form.title}</Headline></p><p className="truncate font-bold">{SUBTEST_LABEL[section.subtest]} · {a.index+1} of {section.itemIds.length}</p></div>
     {a.timed&&<div className="flex items-center gap-2">
      {!hideTimer&&<motion.span initial={reduced?false:{opacity:0}} animate={{opacity:1}} transition={{duration:DUR.fast,delay:DUR.slow}} className={cx('rounded-lg px-3 py-1 font-sans text-lg font-bold tabular-nums',remaining<0?'bg-navy text-white':'bg-sky text-navy')} aria-label={remaining<0?'Over time':'Time left'}>{remaining<0?'+':''}{clock(Math.abs(remaining))}{remaining<0?' over':''}</motion.span>}
      <button className="min-h-11 rounded-lg px-3 text-sm font-semibold text-ink-soft hover:bg-sky hover:text-navy" onClick={()=>setHideTimer(!hideTimer)}>{hideTimer?t(lang,'mock.showTimer'):t(lang,'mock.hideTimer')}</button>
     </div>}
     <button className="min-h-11 rounded-lg border-2 border-line px-4 text-sm font-bold text-navy hover:border-line-strong" onClick={()=>{stopClock();setPaused(true);}}>{t(lang,'mock.pause')}</button>
     <button className="min-h-11 rounded-lg bg-sky px-4 text-sm font-bold text-navy lg:hidden" aria-expanded={nav} onClick={()=>setNav(!nav)}>{t(lang,'mock.navigator')}</button>
    </div>
    <div aria-hidden="true" className="h-1 bg-line"><div className="h-full bg-green transition-[width] duration-300 motion-reduce:transition-none" style={{width:`${(formItems(form).length-unanswered)/formItems(form).length*100}%`}}/></div>
   </header>
   <div className="mx-auto grid max-w-6xl items-start gap-6 px-4 pb-40 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:pb-24 xl:grid-cols-[minmax(0,1fr)_380px]">
    <motion.div initial={reduced?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:DUR.slow,ease:EASE as unknown as [number,number,number,number]}}
     className={cx('min-w-0 self-start rounded-2xl bg-white p-5 text-navy shadow-sheet sm:p-8',item.passageId&&'lg:grid lg:grid-cols-2 lg:gap-8')}>
     {item.passageId&&<div className="mb-5 lg:mb-0"><PassageView id={item.passageId} compact/></div>}
     <motion.div key={id} initial={reduced?false:{opacity:0}} animate={{opacity:1}} transition={tween(reduced,DUR.fast)}>
      <Question key={id} keys={!paused&&!confirm&&!nav} item={item} number={a.index+1} mode={practice?'practice':'exam'} lang={lang} showPassage={false} chosen={a.answers[id]??null} idk={a.idk.includes(id)} onChoose={choose} onIdk={idk} revealed={revealed.includes(id)} onReveal={()=>{if(!revealed.includes(id))save({...a,revealed:[...revealed,id]});}} linksBeside
       panel={shown&&!wide&&<section aria-labelledby="work-on-this-inline" className="rounded-xl border border-line bg-white p-4 lg:hidden">{work('work-on-this-inline',false)}</section>}
       actions={<>{backButton}<button className={btn.primary} onClick={next}><Headline>{nextLabel}</Headline></button></>}
       checkActions={<>{backButton}<button className={btn.ghost} onClick={next}><Headline>{nextLabel}</Headline></button></>}/>
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4">
       <button aria-pressed={a.flags.includes(id)} onClick={flag} className="min-h-11 rounded-lg border-2 border-line px-4 text-sm font-bold text-navy hover:border-line-strong aria-pressed:border-navy aria-pressed:bg-sky">{a.flags.includes(id)?t(lang,'mock.flagged'):t(lang,'mock.flag')}</button>
       <button aria-pressed={a.sure[id]==='sure'} onClick={sure} disabled={a.answers[id]==null} className="min-h-11 rounded-lg border-2 border-line px-4 text-sm font-bold text-navy hover:border-line-strong aria-pressed:border-green aria-pressed:bg-mint disabled:opacity-40">{t(lang,'mock.sure')}</button>
      </div>
     </motion.div>
    </motion.div>
    <aside className={cx('rounded-2xl bg-white p-4 text-navy shadow-sheet lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-11rem)] lg:overflow-y-auto lg:self-start',nav?'fixed inset-x-3 bottom-24 z-40 max-h-[60vh] overflow-y-auto shadow-lift':'hidden')}>
     <div className="mb-3 flex items-center justify-between lg:hidden"><h2 className="font-bold"><Headline>Question navigator</Headline></h2><button className="min-h-11 rounded-lg px-3 font-bold text-navy hover:bg-sky" onClick={()=>setNav(false)}>Close</button></div>
     {form.sections.map((sec,si)=><div key={si} className="mb-4 last:mb-0"><p className="mb-2 text-sm font-semibold text-ink-soft">{SUBTEST_LABEL[sec.subtest]}</p>
      <div className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">{sec.itemIds.map((x,xi)=>{const cur=si===a.section&&xi===a.index,answered=a.answers[x]!=null||a.idk.includes(x);return <button key={x} onClick={()=>go(si,xi)} aria-label={`Question ${xi+1}${answered?', answered':''}${a.flags.includes(x)?', flagged':''}`} aria-current={cur?'step':undefined}
       className={cx('relative grid h-11 place-items-center rounded-lg border-2 text-xs font-bold text-navy',answered?'border-green bg-green':'border-line bg-white hover:border-line-strong',cur&&'ring-2 ring-navy ring-offset-2 ring-offset-white')}>{xi+1}{a.flags.includes(x)&&<span className="absolute right-1 top-1 h-1.5 w-1.5 bg-navy"/>}</button>;})}</div></div>)}
     <p className="mt-3 text-xs text-ink-soft">Green is answered. A dark corner mark is flagged.</p>
     {shown&&wide&&<section aria-labelledby="work-on-this" className="hidden border-t border-line bg-white pb-1 pt-4 lg:sticky lg:bottom-0 lg:mt-4 lg:block">{work('work-on-this',true)}</section>}
    </aside>
   </div>
   <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
    <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3 sm:px-8">
     <button className="min-h-11 rounded-lg px-4 font-semibold text-ink-soft hover:bg-sky hover:text-navy" onClick={()=>setConfirm(true)}>{t(lang,'mock.submit')}</button>
    </div>
   </footer>
   <AnimatePresence>{paused&&<motion.div key="pause" role="dialog" aria-modal="true" aria-labelledby="pause-title" className="fixed inset-0 z-50 grid place-items-center bg-canvas px-6 text-center text-navy" initial={reduced?false:{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:DUR.base}}>
    <div className="max-w-md"><Companion size={72} pose="idle" still/><h2 id="pause-title" className="mt-4 text-2xl font-extrabold"><Headline>{t(lang,'mock.paused')}</Headline></h2><p className="mt-3 text-ink-soft">The clock is stopped and the question is hidden. Everything is saved.</p><button autoFocus className={cx(btn.primary,'mt-8')} onClick={()=>{startClock();setPaused(false);}}><Headline>{t(lang,'mock.resume')}</Headline></button><Link href="/mock" className="mt-4 block text-ink-soft underline underline-offset-4 hover:text-navy">Leave and continue later</Link></div>
   </motion.div>}
   {confirm&&<motion.div key="confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="fixed inset-0 z-50 grid place-items-center bg-navy-night/45 px-6" initial={reduced?false:{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:DUR.base}}>
    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-navy shadow-lift"><h2 id="confirm-title" className="text-xl font-extrabold"><Headline>Submit your answers?</Headline></h2><p className="mt-2 text-ink-soft">{unanswered?`${unanswered} question${unanswered===1?' is':'s are'} still blank. Blank answers never cost extra points, and you will see how to solve each one.`:'Every question has an answer.'}</p><div className="mt-6 flex flex-wrap gap-2"><button autoFocus className={btn.primary} onClick={submit}><Headline>Submit and see results</Headline></button><button className={btn.ghost} onClick={()=>setConfirm(false)}><Headline>Keep working</Headline></button></div></div>
   </motion.div>}</AnimatePresence>
  </motion.div>;
 }
