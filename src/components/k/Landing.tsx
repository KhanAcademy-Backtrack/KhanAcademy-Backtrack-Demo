'use client';
import Link from 'next/link';
import {useState} from 'react';
import {useProgram} from './ProgramProvider';
import {Sprint} from './Sprint';
import {Sheet,btn,Oval,cx} from './ui';
import {Companion} from '@/components/study/Companion';
import {bankStats} from '@/lib/mock/forms';

const stats=bankStats();

/** First visit with nothing saved: the landing is the product. Play first, commit
 *  second, and no signup anywhere. */
export function Landing(){
 const {update,today}=useProgram();
 const [result,setResult]=useState<{correct:number;total:number}>();
 const seed=today.replace(/-/g,'');
 return <div className="bg-navy">
  <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-24 lg:pt-16">
   <div className="text-white lg:pt-6">
    <h1 className="text-[2.6rem] font-extrabold leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-[4.4rem]">Everything a paid review program gives you. Free.</h1>
    <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">Review for the UPCAT and other college entrance exams with a plan, a very large bank of mock exams and a full reviewer. Then get help through your first year of college.</p>
    <ul className="mt-7 grid max-w-xl gap-3 text-[15px] text-white/85">
     {['A study plan built from Khan Academy’s Philippine curriculum courses','Every wrong answer traced to the skill behind it',`${stats.families} question families that make new practice every time, plus ${stats.language+stats.reading+stats.scienceItems} written questions`,'No signup. Your progress stays on this phone.'].map(x=><li key={x} className="flex items-start gap-3"><Oval filled size={22} tone="white" className="mt-0.5"/>{x}</li>)}
    </ul>
    <div className="mt-8 flex flex-wrap gap-3">
     <a href="#try" className={cx(btn.primary,'lg:hidden')}>Try 3 questions now</a>
     <Link href="/plan?side=admission" className={btn.onDark}>Make my study plan</Link>
    </div>
   </div>
   <Sheet as="div" className="relative" aria-labelledby="try-title">
    <div id="try" className="-mt-2 mb-4 flex items-center gap-3"><Companion size={52} pose={result?result.correct>=2?'aha':'encourage':'curious'}/><div><h2 id="try-title" className="text-lg font-bold leading-tight">Try three questions</h2><p className="text-sm text-ink-soft">Math, science and language. Check each answer as you go.</p></div></div>
    {!result?<Sprint formKey={`daily~${seed}`} finishLabel="See how I did" onFinish={r=>{setResult(r);update(s=>({...s,daily:{...s.daily,[today]:{correct:r.correct,total:r.total}}}));}}/>
     :<div className="py-4"><p className="font-serif text-2xl leading-snug">{result.correct} of {result.total} right.{result.correct===3?' A strong start.':result.correct===2?' Close. One trap got through.':' That is exactly what practice is for.'}</p>
      <p className="mt-3 text-ink-soft">A plan turns this into a routine: a short mission each day, a mock exam each week, and the reviewer for whatever you miss.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/plan?side=admission" className={btn.primary}>Make my study plan</Link><Link href="/mock" className={btn.ghost}>Browse mock exams</Link></div></div>}
   </Sheet>
  </section>
  <section aria-label="Choose where you are" className="bg-white">
   <div className="mx-auto grid max-w-6xl md:grid-cols-2">
    <Link href="/plan?side=admission" className="group flex flex-col gap-4 border-b border-mint-line px-5 py-10 transition-colors hover:bg-mint sm:px-8 md:border-b-0 md:border-r md:py-14">
     <Oval filled size={40}/>
     <h2 className="text-3xl font-extrabold tracking-[-.03em] text-navy">Getting into college</h2>
     <p className="max-w-md text-[17px] leading-relaxed text-ink-soft">UPCAT first, with practice sets for DCAT, PUPCET and the DOST-SEI scholarship exam. A plan to your exam date, daily missions, mock exams and a complete reviewer.</p>
     <span className="mt-auto font-bold text-navy underline decoration-green decoration-2 underline-offset-4">Start my exam plan</span>
    </Link>
    <Link href="/bridge" className="group flex flex-col gap-4 px-5 py-10 transition-colors hover:bg-mint sm:px-8 md:py-14">
     <Oval size={40}/>
     <h2 className="text-3xl font-extrabold tracking-[-.03em] text-navy">Starting college</h2>
     <p className="max-w-md text-[17px] leading-relaxed text-ink-soft">What your program’s first year assumes you already know, a placement check, a Khan Academy path through senior high math and science, and help with the topic you met in class today.</p>
     <span className="mt-auto font-bold text-navy underline decoration-green decoration-2 underline-offset-4">Get ready for first year</span>
    </Link>
   </div>
  </section>
  <section className="bg-mint">
   <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-3">
    <div><h2 className="text-xl font-extrabold text-navy">A University of the Philippines Manila team</h2><p className="mt-2 leading-relaxed text-ink-soft">Built by Matthew Labrador, Paul Recio and Harry Gomez, BS Computer Science students and UPCAT passers.</p></div>
    <div><h2 className="text-xl font-extrabold text-navy">Coached by a UP mathematician</h2><p className="mt-2 leading-relaxed text-ink-soft">John Justin C. Mesias, Assistant Professor at the College of Arts and Sciences, UP Manila, teaching mathematics since 2016.</p><Link href="/about" className={cx(btn.text,'mt-1')}>Meet the team</Link></div>
    <div><h2 className="text-xl font-extrabold text-navy">The UPCAT is free. So is UP.</h2><p className="mt-2 leading-relaxed text-ink-soft">147,437 took the UPCAT 2026 and 18,350 qualified, about one in eight. Preparation should not depend on what your family can pay.</p><Link href="/admissions" className={cx(btn.text,'mt-1')}>See exam dates</Link></div>
   </div>
  </section>
 </div>;
}
