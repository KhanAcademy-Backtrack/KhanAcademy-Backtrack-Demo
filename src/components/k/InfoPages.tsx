'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useProgram} from './ProgramProvider';
import {PageBand,Sheet,btn,Oval,cx,pageBody,Pill} from './ui';
import {Companion} from '@/components/study/Companion';
import {EXAM_DATES,EXAMS,EXAM_NOTICES} from '@/lib/program/admissions';
import {parseDay,daysBetween} from '@/lib/program/planner';
import {toIcs} from '@/lib/program/calendar';
import {UP_LINE} from '@/lib/program/facts';

const fmtDate=(d:string)=>parseDay(d).toLocaleDateString('en-PH',{month:'long',day:'numeric',year:'numeric'});

export function Admissions(){
 const {today}=useProgram();
 function ics(){const blob=new Blob([toIcs(EXAM_DATES.map(d=>({id:d.id,date:d.start,end:d.end,title:d.title,kind:d.window?'examWindow':'exam',link:d.link})),new Date().toISOString().replace(/[-:]/g,'').slice(0,15))],{type:'text/calendar'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='college-exam-dates.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <>
  <PageBand title="College entrance exam dates" lead="The exams in this review cycle, each with the official page it was checked against. Dates can change, so confirm on the official page before you plan around one." aside={<button className={btn.primary} onClick={ics}><Headline>Add all to my calendar</Headline></button>}/>
  <div className={pageBody}>
   <Sheet><ol className="relative grid gap-0">{EXAM_DATES.map((d,i)=>{const past=(d.end??d.start)<today,left=daysBetween(today,d.start);return <li key={d.id} className={cx('grid gap-3 border-l-4 pb-8 pl-6 last:pb-0 sm:grid-cols-[200px_1fr]',past?'border-mint-line opacity-60':'border-green')}>
    <div className="-ml-[38px] flex items-start gap-3 sm:ml-0 sm:block"><span className="grid h-6 w-6 place-items-center rounded-full bg-white sm:hidden"><Oval filled={!past} size={22}/></span><div><p className="text-lg font-extrabold">{fmtDate(d.start)}</p>{d.end&&<p className="text-sm text-ink-soft">to {fmtDate(d.end)}</p>}{!past&&left>0&&<Pill tone={i===0?'green':'mint'}>{left} days away</Pill>}</div></div>
    <div><p className="text-xl font-bold"><Headline>{d.title}</Headline></p><p className="text-sm text-ink-soft">{EXAMS[d.exam].full}</p><p className="mt-2 text-[16px]">{d.note}</p><p className="mt-2 text-sm"><a className="font-semibold underline decoration-green decoration-2 underline-offset-4" href={d.link} target="_blank" rel="noopener noreferrer">Official page ↗</a> <span className="text-ink-soft">· checked {fmtDate(d.checked)}</span></p></div>
   </li>;})}</ol></Sheet>
   <Sheet className="mt-5"><h2 className="text-2xl font-extrabold"><Headline>Dates to confirm</Headline></h2><ul className="mt-4 grid gap-4">{EXAM_NOTICES.map(n=><li key={n.exam}><p className="font-bold">{EXAMS[n.exam].name}</p><p className="mt-1 text-ink-soft">{n.note}</p><a className={btn.text} href={EXAMS[n.exam].link} target="_blank" rel="noopener noreferrer"><Headline>Official page ↗</Headline></a></li>)}</ul></Sheet>
   <div className="mt-5 grid gap-5 lg:grid-cols-2">
    <Sheet><h2 className="text-2xl font-extrabold"><Headline>Before you choose a date</Headline></h2><ul className="mt-4 grid gap-3">{['Confirm your campus, application deadlines and test schedule on the official exam page.','Check your test permit for the place, time and instructions you need to follow.','Khanpanion’s practice sets use original questions. They help you review; the official exam instructions tell you what to expect on the day.'].map(x=><li key={x} className="flex gap-3"><Oval filled size={20} className="mt-1"/><span className="text-[16px] leading-relaxed">{x}</span></li>)}</ul></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold"><Headline>Exam-day kit</Headline></h2><p className="mt-1 text-ink-soft">A checklist for the night before and the morning of.</p><ul className="mt-4 grid gap-2">{['Test permit and a valid ID, as listed on the official instructions','Pencils and eraser, if the instructions call for them','Your route, with extra time for traffic and rain','Water and a light snack for breaks, if allowed','A jacket: testing rooms are often cold','Sleep at your usual time the night before'].map(x=><li key={x} className="flex items-center gap-3 text-[16px]"><Oval size={22}/>{x}</li>)}</ul><Link href="/reviewer/x_strategy" className={cx(btn.text,'mt-3')}><Headline>Read the full test-day handbook</Headline></Link></Sheet>
   </div>
  </div>
 </>;
}

export function About(){
 return <>
  <PageBand title="About Khanpanion" lead="A study companion for entrance exam preparation and your first year of college."/>
  <div className={pageBody}>
   <Sheet><div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center"><div>
    <h2 className="text-2xl font-extrabold"><Headline>{UP_LINE}</Headline></h2>
    <p className="mt-3 max-w-2xl font-serif text-[19px] leading-relaxed">Khanpanion brings practice questions, explanations and a study routine together. Use it to prepare for an entrance exam, revisit a difficult topic or review the foundations for your college program. It is free to use, with no account needed.</p>
    <p className="mt-3 text-ink-soft">Built on Khan Academy’s Philippine curriculum courses.</p>
   </div><img src="/upm-logo-official.png" alt="University of the Philippines Manila" className="mx-auto h-auto w-full max-w-[260px]"/></div></Sheet>
   <Sheet className="mt-5"><h2 className="text-2xl font-extrabold"><Headline>Our coach</Headline></h2>
    <p className="mt-3 max-w-3xl font-serif text-[18px] leading-[1.7]">John Justin C. Mesias, Assistant Professor of Mathematics at the College of Arts and Sciences, UP Manila, coaches the team.</p>
   </Sheet>
   <Sheet className="mt-5"><h2 className="text-2xl font-extrabold"><Headline>The team</Headline></h2><p className="mt-1 text-ink-soft">BS Computer Science students at UP Manila, and all three UPCAT passers.</p>
    <ul className="mt-5 grid gap-4 sm:grid-cols-3">{['Matthew Emmanuel T. Labrador','Paul Andrei H. Recio','Harry C. Gomez'].map(n=><li key={n} className="rounded-2xl bg-mint p-5"><Oval filled size={30}/><p className="mt-3 text-lg font-bold">{n}</p><p className="text-sm text-ink-soft">BS Computer Science, UP Manila</p></li>)}</ul>
    <div className="mt-6 flex gap-4 rounded-2xl bg-mint p-5 text-navy"><Companion size={56} pose="encourage"/><p className="font-serif text-[18px] leading-relaxed">Harry moved from an ICT strand into Computer Science and had to rebuild the math and physics his classmates already had. The freshman bridge exists so the next student finds those gaps early.</p></div>
   </Sheet>
   <Sheet className="mt-5"><h2 className="text-xl font-extrabold"><Headline>How it works underneath</Headline></h2><div className="mt-3 flex flex-wrap gap-2"><Link className={btn.ghost} href="/how-it-works"><Headline>How the mistake finder works</Headline></Link><Link className={btn.ghost} href="/evidence"><Headline>What counts as progress</Headline></Link><Link className={btn.ghost} href="/coach"><Headline>For teachers and coaches</Headline></Link><Link className={btn.ghost} href="/explore"><Headline>Explore ideas</Headline></Link></div></Sheet>
  </div>
 </>;
}
