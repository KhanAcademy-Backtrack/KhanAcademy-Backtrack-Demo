'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useState} from 'react';
import {useProgram} from './ProgramProvider';
import {ProgramTourButton} from './ProgramTourProvider';
import {Sprint} from './Sprint';
import {Sheet,btn,Oval,cx} from './ui';
import {Companion} from '@/components/study/Companion';

/** One small start, then two useful paths. Product detail belongs with the task. */
export function Landing(){
 const {update,today}=useProgram();
 const [result,setResult]=useState<{correct:number;total:number}>();
 const seed=today.replace(/-/g,'');
 return <div className="bg-navy">
  <section className="mx-auto grid max-w-6xl items-start gap-7 px-5 pb-12 pt-7 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pb-20 lg:pt-14">
   <div className="@container text-white lg:sticky lg:top-28 lg:py-5">
    <p className="text-sm font-semibold text-green">Your college prep</p>
    <h1 className="mt-3 text-[clamp(2rem,12.5cqw,2.55rem)] font-extrabold leading-[1.02] tracking-[-.045em] sm:text-[clamp(2.5rem,12.5cqw,3.3rem)] lg:text-[clamp(3rem,12.5cqw,4.5rem)]"><Headline><span className="block whitespace-nowrap">Know what to</span>{' '}<span className="block whitespace-nowrap">study next.</span></Headline></h1>
    <p className="mt-4 max-w-md text-[17px] leading-relaxed text-white/80">Prepare for entrance exams and your first year of college, with practice and a plan that fits your week.</p>
    <div className="mt-6 flex flex-wrap gap-3">
     <a href="#try" className={btn.primary}><Headline>Try three questions</Headline></a>
     <ProgramTourButton className="inline-flex min-h-11 items-center justify-center rounded-lg px-2 text-sm font-semibold text-white/80 underline decoration-green decoration-2 underline-offset-4 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-green"/>
    </div>
    <p className="mt-4 text-sm text-white/65">Free to use · No account needed</p>
   </div>
   <Sheet as="div" id="try" className="relative scroll-mt-20" aria-labelledby="try-title">
    <div className="-mt-2 mb-4 flex items-center gap-3"><Companion size={52} pose={result?result.correct>=2?'aha':'encourage':'curious'}/><div><h2 id="try-title" className="text-lg font-bold leading-tight"><Headline>Try three questions</Headline></h2><p className="mt-1 text-sm text-ink-soft">Math, science and language. Take your time.</p></div></div>
    {!result?<Sprint formKey={`daily~${seed}`} finishLabel="See how I did" onFinish={r=>{setResult(r);update(s=>({...s,daily:{...s.daily,[today]:{correct:r.correct,total:r.total}}}));}}/>
     :<div className="py-4"><p className="font-serif text-2xl leading-snug">{result.correct} of {result.total} right. {result.correct===3?'A good start. Let’s build on it.':'Now you have a place to start.'}</p>
      <p className="mt-3 text-ink-soft">Your answers are saved. Make a plan for what to study next, or choose another practice set.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/plan?side=admission" className={btn.primary}><Headline>Make my study plan</Headline></Link><Link href="/mock" className={btn.ghost}><Headline>Browse practice sets</Headline></Link></div>
      {result.correct<result.total&&<Link href="/notebook" className={cx(btn.text,'mt-3 text-sm')}><Headline>Revisit the questions I missed</Headline></Link>}</div>}
   </Sheet>
  </section>
  <section aria-labelledby="choose-title" className="border-t border-white/10 bg-navy-deep text-white">
   <div className="mx-auto max-w-6xl px-5 py-9 sm:px-8 lg:py-12">
    <h2 id="choose-title" className="text-2xl font-extrabold tracking-[-.03em] sm:text-3xl"><Headline>What are you getting ready for?</Headline></h2>
    <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-10">
     <Link href="/plan?side=admission" className="group flex gap-4 rounded-2xl border-2 border-white/15 p-5 hover:border-green focus-visible:outline-3 focus-visible:outline-green sm:p-6">
      <Oval filled label="A" size={38} tone="white" className="mt-1"/>
      <div><h3 className="text-xl font-extrabold text-white"><Headline>An entrance exam</Headline></h3><p className="mt-2 max-w-md text-[15px] leading-relaxed text-white/75">Build a study routine for the UPCAT, DCAT, PUPCET or DOST-SEI exam.</p><span className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-green">Make my study plan <span aria-hidden="true">→</span></span></div>
     </Link>
     <Link href="/bridge" className="group flex gap-4 rounded-2xl border-2 border-white/15 p-5 hover:border-green focus-visible:outline-3 focus-visible:outline-green sm:p-6">
      <Oval label="B" size={38} tone="white" className="mt-1"/>
      <div><h3 className="text-xl font-extrabold text-white"><Headline>My first year of college</Headline></h3><p className="mt-2 max-w-md text-[15px] leading-relaxed text-white/75">Review the math and science your program builds on, or work through a topic from class.</p><span className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-green">Choose my program <span aria-hidden="true">→</span></span></div>
     </Link>
    </div>
   </div>
  </section>
  <section className="bg-mint text-navy">
   <div className="mx-auto grid max-w-6xl gap-7 px-5 py-9 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:gap-14 lg:py-12">
    <div><h2 className="text-2xl font-extrabold tracking-[-.03em]"><Headline>Something you want to understand?</Headline></h2><p className="mt-3 max-w-sm text-[16px] leading-relaxed text-ink-soft">Look up a topic in the reviewer, or move the pieces in an interactive explanation.</p><div className="mt-4 flex flex-wrap gap-3"><Link href="/reviewer" className={btn.dark}><Headline>Find a topic</Headline></Link><Link href="/explore" className={btn.ghost}><Headline>Explore an idea</Headline></Link></div></div>
    <div className="lg:border-l lg:border-navy/15 lg:pl-10">
     <details className="border-b border-navy/15"><summary className="cursor-pointer py-4 text-[16px] font-bold focus-visible:outline-3 focus-visible:outline-navy">How does Khan Academy fit in?</summary><p className="pb-4 text-[15px] leading-relaxed text-ink-soft">Built on Khan Academy’s Philippine curriculum courses. Your plan points to reviewed lessons and practice. Khanpanion adds its own questions and explanations to help you choose what to work on next.</p></details>
     <details className="border-b border-navy/15"><summary className="cursor-pointer py-4 text-[16px] font-bold focus-visible:outline-3 focus-visible:outline-navy">Where is my progress saved?</summary><p className="pb-4 text-[15px] leading-relaxed text-ink-soft">Your plan and answers stay in this browser. In Me, you can download a backup or restore one on another device. <Link href="/me" className="font-semibold text-navy underline decoration-green decoration-2 underline-offset-4">Open settings and backups</Link>.</p></details>
     <Link href="/admissions" className={cx(btn.text,'mt-3 text-sm')}><Headline>Check official exam dates</Headline></Link>
    </div>
   </div>
  </section>
 </div>;
}
