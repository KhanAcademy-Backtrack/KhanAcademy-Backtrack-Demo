'use client';
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
  <PageBand title="College entrance exam dates" lead="The exams in this review cycle, each with the official page it was checked against. Dates can change, so confirm on the official page before you plan around one." aside={<button className={btn.primary} onClick={ics}>Add all to my calendar</button>}/>
  <div className={pageBody}>
   <Sheet><ol className="relative grid gap-0">{EXAM_DATES.map((d,i)=>{const past=(d.end??d.start)<today,left=daysBetween(today,d.start);return <li key={d.id} className={cx('grid gap-3 border-l-4 pb-8 pl-6 last:pb-0 sm:grid-cols-[200px_1fr]',past?'border-mint-line opacity-60':'border-green')}>
    <div className="-ml-[38px] flex items-start gap-3 sm:ml-0 sm:block"><span className="grid h-6 w-6 place-items-center rounded-full bg-white sm:hidden"><Oval filled={!past} size={22}/></span><div><p className="text-lg font-extrabold">{fmtDate(d.start)}</p>{d.end&&<p className="text-sm text-ink-soft">to {fmtDate(d.end)}</p>}{!past&&left>0&&<Pill tone={i===0?'green':'mint'}>{left} days away</Pill>}</div></div>
    <div><p className="text-xl font-bold">{d.title}</p><p className="text-sm text-ink-soft">{EXAMS[d.exam].full}</p><p className="mt-2 text-[16px]">{d.note}</p><p className="mt-2 text-sm"><a className="font-semibold underline decoration-green decoration-2 underline-offset-4" href={d.link} target="_blank" rel="noopener noreferrer">Official page ↗</a> <span className="text-ink-soft">· checked {fmtDate(d.checked)}</span></p></div>
   </li>;})}</ol></Sheet>
   <Sheet className="mt-5"><h2 className="text-2xl font-extrabold">Dates to confirm</h2><ul className="mt-4 grid gap-4">{EXAM_NOTICES.map(n=><li key={n.exam}><p className="font-bold">{EXAMS[n.exam].name}</p><p className="mt-1 text-ink-soft">{n.note}</p><a className={btn.text} href={EXAMS[n.exam].link} target="_blank" rel="noopener noreferrer">Official page ↗</a></li>)}</ul></Sheet>
   <div className="mt-5 grid gap-5 lg:grid-cols-2">
    <Sheet><h2 className="text-2xl font-extrabold">Worth knowing</h2><ul className="mt-4 grid gap-3">{['The UPCAT is free for Filipino applicants, and tuition at UP is free.','The UPCAT has four subtests, Language Proficiency, Reading Comprehension, Mathematics and Science, given in English and Filipino, and takes about four hours.','Khanpanion’s practice sets for DCAT, PUPCET and DOST-SEI are built from the same banks as the UPCAT review. They are practice, not copies of those exams.'].map(x=><li key={x} className="flex gap-3"><Oval filled size={20} className="mt-1"/><span className="text-[16px] leading-relaxed">{x}</span></li>)}</ul></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold">Exam-day kit</h2><p className="mt-1 text-ink-soft">A checklist for the night before and the morning of.</p><ul className="mt-4 grid gap-2">{['Test permit and a valid ID, as listed on the official instructions','Pencils and eraser, if the instructions call for them','Your route, with extra time for traffic and rain','Water and a light snack for breaks, if allowed','A jacket: testing rooms are often cold','Sleep at your usual time the night before'].map(x=><li key={x} className="flex items-center gap-3 text-[16px]"><Oval size={22}/>{x}</li>)}</ul><Link href="/reviewer/x_strategy" className={cx(btn.text,'mt-3')}>Read the full test-day handbook</Link></Sheet>
   </div>
  </div>
 </>;
}

export function About(){
 return <>
  <PageBand title="About Khanpanion" lead="A free college program built on Khan Academy’s Philippine curriculum courses. Entrance exam review first, then help getting through the first year of college."/>
  <div className={pageBody}>
   <Sheet><div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center"><div>
    <h2 className="text-2xl font-extrabold">{UP_LINE}</h2>
    <p className="mt-3 max-w-2xl font-serif text-[19px] leading-relaxed">Khan Academy has the curriculum. Khanpanion adds what a paid review program would: a plan to your exam date, a reason to finish it, practice that never runs out, and a way to find exactly what you are missing. It is free, it needs no account, and your progress stays on your phone.</p>
    <p className="mt-3 text-ink-soft">Built on Khan Academy’s Philippine curriculum courses.</p>
   </div><img src="/upm-logo-official.png" alt="University of the Philippines Manila" className="mx-auto h-auto w-full max-w-[260px]"/></div></Sheet>
   <Sheet className="mt-5"><h2 className="text-2xl font-extrabold">Our coach</h2>
    <p className="mt-3 max-w-3xl font-serif text-[18px] leading-[1.7]">John Justin C. Mesias is an Assistant Professor at the College of Arts and Sciences, University of the Philippines Manila, where he has taught mathematics since 2016. An applied mathematician (MS Applied Mathematics, UP Diliman) and member of UP Manila’s Applied Mathematics and Artificial Intelligence Research Laboratory, he works in optimization, data science and sports analytics. His 2026 study analyzes what drove PISA 2022 performance across 81 countries, and his research on turning math anxiety into affinity in UP’s Math 10 was presented at the 2026 UP General Education Conference.</p>
   </Sheet>
   <Sheet className="mt-5"><h2 className="text-2xl font-extrabold">The team</h2><p className="mt-1 text-ink-soft">BS Computer Science students at UP Manila, and all three UPCAT passers.</p>
    <ul className="mt-5 grid gap-4 sm:grid-cols-3">{['Matthew Emmanuel T. Labrador','Paul Andrei H. Recio','Harry C. Gomez'].map(n=><li key={n} className="rounded-2xl bg-mint p-5"><Oval filled size={30}/><p className="mt-3 text-lg font-bold">{n}</p><p className="text-sm text-ink-soft">BS Computer Science, UP Manila</p></li>)}</ul>
    <div className="mt-6 flex gap-4 rounded-2xl bg-navy p-5 text-white"><Companion size={70} pose="encourage"/><p className="font-serif text-[18px] leading-relaxed">Harry moved from an ICT strand into Computer Science and had to rebuild the math and physics his classmates already had. The freshman bridge exists so the next student finds those gaps early.</p></div>
   </Sheet>
   <Sheet className="mt-5"><h2 className="text-xl font-extrabold">How it works underneath</h2><div className="mt-3 flex flex-wrap gap-2"><Link className={btn.ghost} href="/how-it-works">How the mistake finder works</Link><Link className={btn.ghost} href="/evidence">What counts as progress</Link><Link className={btn.ghost} href="/coach">For teachers and coaches</Link><Link className={btn.ghost} href="/explore">Explore ideas</Link></div></Sheet>
  </div>
 </>;
}
