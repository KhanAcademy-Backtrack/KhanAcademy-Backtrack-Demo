'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {motion} from 'motion/react';
import {useQuietMotion} from './useQuietMotion';
import {useProgram} from './ProgramProvider';
import {Explanation,WhyPanel,PassageView} from './Question';
import {TldrCard} from './TldrCard';
import {PageBand,Sheet,btn,Oval,cx,pageBody,Pill} from './ui';
import {Companion} from '@/components/study/Companion';
import {useFix} from './useFix';
import {formFromKey,formItems,itemById} from '@/lib/mock/forms';
import {scoreAttempt,paceCheck,missGroups,type Triage} from '@/lib/mock/scoring';
import {timeMap} from '@/lib/mock/analysis';
import {misconception} from '@/lib/mock/misconceptions';
import {SUBTEST_LABEL} from '@/lib/mock/types';
import {CONCEPT_BY_ID} from '@/lib/program/concepts';
import {chapterHref} from '@/lib/program/links';

import {DUR,EASE} from '@/lib/motion-tokens';
import {t} from '@/lib/i18n';

const LETTERS=['A','B','C','D'];
const TRIAGE:Record<Triage,string>={didnt_know:'Didn’t know yet',careless:'Careless slip',out_of_time:'Ran out of time'};
const mins=(s:number)=>s<90?`${Math.round(s)} s`:`${Math.round(s/60)} min`;

export function Results(){
 const params=useSearchParams(),{state,ready,update}=useProgram(),reduced=useQuietMotion(),fix=useFix(),lang=state.lang;
 const attempt=state.attempts.find(a=>a.id===params.get('a'));
 const form=attempt?formFromKey(attempt.formKey):undefined;
 const result=useMemo(()=>form&&attempt?scoreAttempt(form,attempt):undefined,[form,attempt]);
 const [showKey,setShowKey]=useState(true),[open,setOpen]=useState<string[]>([]),[shared,setShared]=useState('');
 if(!ready)return <div className="min-h-screen bg-navy"/>;
 if(!attempt||!form||!result||!attempt.submittedAt)return <><PageBand title="No results here yet" lead="Results appear after you submit a mock exam or topic check on this phone."/><div className={pageBody}><Sheet><Link href="/mock" className={btn.primary}>Choose a mock exam</Link></Sheet></div></>;
 const previous=state.attempts.filter(a=>a.submittedAt&&a.id!==attempt.id&&a.formKey.split('~')[0]===attempt.formKey.split('~')[0]&&a.submittedAt<attempt.submittedAt!).sort((a,b)=>b.submittedAt!-a.submittedAt!)[0];
 const prevResult=previous?(()=>{const f=formFromKey(previous.formKey);return f?scoreAttempt(f,previous):undefined;})():undefined;
 const growth=prevResult?result.total.percent-prevResult.total.percent:undefined;
 const groups=missGroups(result.misses),top=groups[0];
 const topM=top&&misconception(top.id),topConcept=top?CONCEPT_BY_ID[top.items[0].item.concept]:undefined;
 const ids=formItems(form),map=timeMap(ids,attempt);
 const setTriage=(id:string,v:Triage)=>update(s=>({...s,attempts:s.attempts.map(a=>a.id===attempt.id?{...a,triage:{...a.triage,[id]:v}}:a),notebook:s.notebook.map(n=>n.itemId===id&&n.formKey===attempt.formKey?{...n,triage:v}:n)}));
 const praise=result.total.percent>=80?'Strong work.':result.total.percent>=60?'Solid. The misses below are very fixable.':result.total.percent>=40?'You have the base. Now for the traps.':'Every miss here is a map of what to learn next.';
 async function share(){try{const {shareCardPng,shareOrDownload}=await import('@/lib/share-card');const blob=await shareCardPng({title:`${result!.total.correct} of ${result!.total.total} on a ${form!.title.toLowerCase()}`,subtitle:growth!==undefined&&growth>0?`Up ${growth} points from last time.`:'Practising for college entrance exams.',lines:result!.subtests.map(s=>({label:SUBTEST_LABEL[s.subtest],value:`${s.correct}/${s.total}`,fill:s.total?s.correct/s.total:0})),footer:'khanpanion.vercel.app · free exam review'});setShared(await shareOrDownload(blob,'khanpanion-result.png','My practice result on Khanpanion'));}catch{setShared('error');}}
 return <>
  <div className="bg-navy text-white">
   <div className="mx-auto grid max-w-6xl gap-8 px-5 pb-16 pt-9 sm:px-8 lg:grid-cols-[1fr_1fr] lg:pb-20 lg:pt-12">
    <div>
     <p className="text-white/75">{form.title} · {t(lang,'result.title').toLowerCase()}</p>
     <h1 className="mt-2 text-5xl font-extrabold tracking-[-.04em] sm:text-6xl">{result.total.correct} of {result.total.total}</h1>
     <p className="mt-3 text-xl text-white/85">{praise}{growth!==undefined&&growth>0&&` Up ${growth} points from your last one.`}</p>
     {result.sureButWrong>0&&<p className="mt-3 max-w-lg text-white/80">{result.sureButWrong} answer{result.sureButWrong===1?' was':'s were'} marked “sure” but wrong. Those are the most useful misses to study: they are ideas that feel right and are not.</p>}
     <div className="mt-6 flex flex-wrap gap-3"><a href="#key" className={btn.primary}>{t(lang,'result.key')}</a><button className={btn.onDark} onClick={share}>Share my result</button></div>
     {shared&&<p role="status" className="mt-2 text-sm text-white/75">{shared==='downloaded'?'Image saved to your downloads.':shared==='shared'?'Shared.':shared==='error'?'This browser could not make the image.':''}</p>}
    </div>
    <div className="grid content-start gap-3">{result.subtests.map((s,i)=>{const pace=paceCheck(s);return <motion.div key={s.subtest} initial={reduced?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:DUR.base,delay:reduced?0:DUR.fast+i*DUR.fast}} className="rounded-2xl bg-white/8 p-4">
     <div className="flex items-baseline justify-between"><p className="font-bold">{SUBTEST_LABEL[s.subtest]}</p><p className="text-2xl font-extrabold">{s.correct}<span className="text-base font-semibold text-white/70">/{s.total}</span></p></div>
     <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/12"><motion.div className="h-full w-full origin-left rounded-full bg-green" initial={reduced?false:{scaleX:0}} animate={{scaleX:s.total?s.correct/s.total:0}} transition={{duration:DUR.fast,delay:reduced?0:DUR.fast+i*DUR.fast,ease:EASE as unknown as [number,number,number,number]}}/></div>
     <p className="mt-2 text-sm text-white/85"><span className="font-bold">{s.band.label}.</span> {s.band.note}</p>
     {pace&&<p className="mt-1 text-sm text-white/70">{t(lang,'result.pace')}: {pace.onPace?`on pace, about ${pace.perItem} s a question.`:`about ${pace.perItem} s a question. At that pace the real ${s.total<pace.items?'section':'exam'} would reach about ${pace.reach} of ${pace.items} questions. One timed section a week closes that gap.`}</p>}
    </motion.div>;})}</div>
   </div>
  </div>
  <div className={pageBody}>
   <Sheet>
    <div className="flex gap-4"><Companion size={64} pose={top?'point':'aha'}/><div className="flex-1"><h2 className="text-xl font-extrabold">{t(lang,'result.next')}</h2>
     {top&&topM?<><p className="mt-1 text-[17px]">{top.count} miss{top.count===1?'':'es'} came from one idea: <span className="font-bold">{topM.label.toLowerCase()}</span>. {topM.fix}</p>
      <div className="mt-4 flex flex-wrap gap-2">{topM.recovery&&<button className={btn.primary} onClick={()=>fix(topM.recovery!.topic,topM.recovery!.skill,topM.recovery!.routeClue)}>Find the missing skill</button>}<Link className={btn.ghost} href={chapterHref(topM.chapter,top.items[0].item.concept)}>Read the reviewer</Link>{topConcept&&<Link className={btn.ghost} href={`/mock/take?f=topic~${topConcept.id}|r${attempt.submittedAt}&mode=practice`}>Topic check: {topConcept.title}</Link>}</div></>
      :top&&topConcept?<><p className="mt-1 text-[17px]">Most misses were in <span className="font-bold">{topConcept.title}</span>. Start with its summary, then a topic check.</p><div className="mt-4 flex flex-wrap gap-2"><Link className={btn.primary} href={`/learn/${topConcept.id}`}>What you need to know</Link></div></>
      :<p className="mt-1 text-[17px]">Nothing missed. Try a harder format: a timed section or a full simulation.</p>}
    </div></div>
    {topConcept&&<div className="mt-5"><TldrCard tldr={topConcept.tldr} title={`${topConcept.title}: what you need to know`} compact/></div>}
   </Sheet>
   {!!groups.length&&<Sheet className="mt-5"><h2 className="text-xl font-extrabold">Why the misses happened</h2><p className="mt-1 text-ink-soft">Grouped by the idea behind each wrong answer. Every miss is in your mistake notebook and comes back in review.</p>
    <ul className="mt-4 grid gap-3">{groups.map(g=>{const m=misconception(g.id),c=CONCEPT_BY_ID[g.items[0].item.concept];return <li key={g.id} className="rounded-2xl border-2 border-mint-line p-4"><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-bold">{m?m.label:`Left blank or “I don’t know yet”: ${c?.title??'this topic'}`}</p><Pill>{g.count}×</Pill></div>{m&&<p className="mt-1 text-[15px] text-ink-soft">{m.why}</p>}</li>;})}</ul>
   </Sheet>}
   <Sheet className="mt-5">
    <h2 className="text-xl font-extrabold">Time map</h2><p className="mt-1 text-ink-soft">Each bar is one question. Taller took longer; green was right.</p>
    <div className="mt-4 flex h-28 items-end gap-[3px] overflow-x-auto" role="img" aria-label="Time spent on each question">{map.map(x=>{const maxS=Math.max(30,...map.map(y=>y.seconds));return <a key={x.id} href={`#q-${x.n}`} title={`Question ${x.n}: ${mins(x.seconds)}`} className={cx('min-w-[6px] flex-1 rounded-t',x.correct?'bg-green':x.blank?'bg-sky':'bg-navy')} style={{height:`${Math.max(6,x.seconds/maxS*100)}%`}}/>;})}</div>
    <p className="mt-2 text-sm text-ink-soft">Total time {mins(result.seconds)}.</p>
   </Sheet>
   <Sheet className="mt-5" id="key">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-extrabold">{t(lang,'result.key')}</h2><button className={btn.dark} aria-pressed={showKey} onClick={()=>{setShowKey(!showKey);setOpen([]);}}>{showKey?t(lang,'result.hideAnswers'):t(lang,'result.showAnswers')}</button></div>
    <p className="mt-1 text-ink-soft">{showKey?'Correct answers are marked. Hide them to try the questions again.':'Answers hidden. Reveal one question at a time, or show them all.'}</p>
    <ol className="mt-5 grid gap-4">{ids.map((id,n)=>{const it=itemById(id)!,chosen=attempt.answers[id]??null,right=chosen===it.answerIndex,revealed=showKey||open.includes(id),isOpen=open.includes(`x:${id}`);const prevPassage=n>0&&itemById(ids[n-1])?.passageId===it.passageId;
     return <li key={id} id={`q-${n+1}`} className="scroll-mt-24 rounded-2xl border-2 border-mint-line p-4 sm:p-5">
      {it.passageId&&!prevPassage&&<details className="mb-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold">Show the passage</summary><PassageView id={it.passageId}/></details>}
      <div className="flex flex-wrap items-start justify-between gap-2"><p className="font-serif text-[19px] leading-snug"><span className="mr-2 font-sans text-sm font-bold text-ink-soft">{n+1}.</span>{it.stem}</p>{revealed&&<Pill tone={right?'green':'sky'}>{right?'Right':attempt.idk.includes(id)?'Didn’t know yet':chosen===null?'Blank':'Missed'}</Pill>}</div>
      <ul className="mt-3 grid gap-1.5">{it.choices.map((c,i)=><li key={i} className={cx('flex items-center gap-3 rounded-xl px-2 py-1.5',revealed&&i===it.answerIndex&&'bg-mint')}><Oval filled={chosen===i} label={LETTERS[i]} size={30}/><span className="font-serif text-[17px]">{c}</span>{revealed&&i===it.answerIndex&&<span className="ml-auto text-sm font-bold">Answer</span>}{chosen===i&&<span className={cx('text-sm text-ink-soft',!(revealed&&i===it.answerIndex)&&'ml-auto')}>Your pick</span>}</li>)}</ul>
      <div className="mt-3 flex flex-wrap gap-2">
       {!showKey&&<button className={btn.ghost} onClick={()=>setOpen(o=>o.includes(id)?o.filter(x=>x!==id):[...o,id])}>{revealed?'Hide answer':'Reveal answer'}</button>}
       <button className={btn.ghost} aria-expanded={isOpen} onClick={()=>setOpen(o=>o.includes(`x:${id}`)?o.filter(x=>x!==`x:${id}`):[...o,`x:${id}`])}>{isOpen?t(lang,'mock.hideExplain'):t(lang,'mock.explain')}</button>
      </div>
      {!right&&revealed&&<div className="mt-3 grid gap-3"><WhyPanel item={it} chosen={chosen} lang={lang}/>
       <fieldset><legend className="text-sm font-semibold">Why did you miss it?</legend><div className="mt-1 flex flex-wrap gap-2">{(Object.keys(TRIAGE) as Triage[]).map(k=><button key={k} aria-pressed={attempt.triage[id]===k} onClick={()=>setTriage(id,k)} className="min-h-11 rounded-full border-2 border-navy/15 px-3 text-sm font-semibold aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white text-navy">{TRIAGE[k]}</button>)}</div></fieldset></div>}
      {isOpen&&<div className="mt-3"><Explanation item={it}/></div>}
     </li>;})}</ol>
   </Sheet>
   <div className="mt-5 flex flex-wrap gap-3"><Link href="/mock" className={btn.dark}>Another mock exam</Link><Link href="/notebook" className={btn.ghost}>Mistake notebook</Link><Link href="/" className={btn.ghost}>Back to Today</Link></div>
  </div>
 </>;
}
