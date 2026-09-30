'use client';
import Link from 'next/link';
import {useProgram} from './ProgramProvider';
import {PageBand,Sheet,btn,Oval,cx,pageBody,Pill} from './ui';
import {bankStats,formFromKey,formItems,formMinutes,sprintForm,fullForm} from '@/lib/mock/forms';
import {scoreAttempt,answeredCount} from '@/lib/mock/scoring';
import {SUBTEST_LABEL,SUBTESTS} from '@/lib/mock/types';
import {CONCEPTS} from '@/lib/program/concepts';
import {EXAMS} from '@/lib/program/admissions';
import {UPCAT_BLUEPRINT,TOPIC_CHECK} from '@/lib/mock/blueprint';

const stats=bankStats();

export function MockHub(){
 const {state,today}=useProgram();
 const seed=`${today.replace(/-/g,'')}${state.attempts.length}`;
 const open=state.attempts.filter(a=>!a.submittedAt).slice(-3).reverse();
 const done=state.attempts.filter(a=>a.submittedAt).slice(-8).reverse();
 const sprint=sprintForm('x'),full=fullForm('x');
 const card='flex flex-col gap-3 rounded-[22px] bg-white p-5 text-navy shadow-sheet sm:p-6';
 return <>
  <PageBand title="Mock exams that never run out" lead={`${stats.families} question families generate new math and science questions every time, beside ${stats.language} language items, ${stats.reading} reading questions on ${stats.passages} passages and ${stats.scienceItems} conceptual science items. Every wrong choice is built from a real misconception, so every miss tells you something.`}/>
  <div className={pageBody}>
   {!!open.length&&<Sheet className="mb-5"><h2 className="text-xl font-extrabold">Pick up where you left off</h2><ul className="mt-3 grid gap-2">{open.map(a=>{const f=formFromKey(a.formKey);if(!f)return null;const n=answeredCount(f,a),total=formItems(f).length;return <li key={a.id}><Link href={`/mock/take?f=${encodeURIComponent(a.formKey)}`} className="flex min-h-14 items-center gap-3 rounded-2xl bg-mint px-4 py-3 hover:bg-mint-line"><Oval filled={n>0} size={26}/><span className="flex-1 font-semibold">{f.title}</span><span className="text-sm text-ink-soft">{n} of {total} answered</span></Link></li>;})}</ul></Sheet>}
   <div className="grid gap-5 md:grid-cols-3">
    <div className={card}><Pill tone="green">{formMinutes(sprint)} minutes</Pill><h2 className="text-2xl font-extrabold">Sprint</h2><p className="text-ink-soft">{formItems(sprint).length} mixed questions: math, science and language. Check each one as you go.</p><Link className={cx(btn.primary,'mt-auto')} href={`/mock/take?f=sprint~${seed}&mode=practice`}>Start a sprint</Link></div>
    <div className={card}><Pill tone="sky">One subtest</Pill><h2 className="text-2xl font-extrabold">Section</h2><p className="text-ink-soft">A full-length section at exam pace. Timer optional, answers at the end.</p><div className="mt-auto grid grid-cols-2 gap-2">{SUBTESTS.map(s=><Link key={s} className={btn.ghost} href={`/mock/take?f=section~${s}|${seed}`}>{s==='language'?'Language':s==='reading'?'Reading':s==='math'?'Math':'Science'}</Link>)}</div></div>
    <div className="flex flex-col gap-3 rounded-[22px] bg-navy-night p-5 text-white sm:p-6"><Pill tone="green">About {Math.round(formMinutes(full)/60*10)/10} hours</Pill><h2 className="text-2xl font-extrabold">Full simulation</h2><p className="text-white/80">All four subtests, {formItems(full).length} questions, breaks between sections. The closest thing to the real day.</p><Link className={cx(btn.primary,'mt-auto')} href={`/mock/take?f=full~${seed}`}>Start a full simulation</Link></div>
   </div>
   <Sheet className="mt-5"><h2 className="text-xl font-extrabold">Topic checks</h2><p className="mt-1 text-ink-soft">{TOPIC_CHECK.items} exam-level questions from one topic, right after you study it.</p>
    <div className="mt-4 grid gap-5 md:grid-cols-2">{SUBTESTS.map(sub=><div key={sub}><p className="font-bold">{SUBTEST_LABEL[sub]}</p><div className="mt-2 flex flex-wrap gap-2">{CONCEPTS.filter(c=>c.subtest===sub).map(c=><Link key={c.id} href={`/mock/take?f=topic~${c.id}|${seed}&mode=practice`} className="min-h-11 rounded-full border-2 border-navy/12 px-3 py-2 text-sm font-semibold hover:border-navy/40 hover:bg-mint">{c.title}</Link>)}</div></div>)}</div>
   </Sheet>
   <div className="mt-5 grid gap-5 md:grid-cols-2">
    <Sheet><h2 className="text-xl font-extrabold">Practice sets for other exams</h2><p className="mt-1 text-ink-soft">Built from the same banks. Khanpanion’s own practice, not copies of these exams.</p><ul className="mt-3 grid gap-2">{(['dcat','dostsei','pupcet'] as const).map(e=><li key={e} className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">Practice sets for {EXAMS[e].name}</span><span className="flex gap-2"><Link className={btn.ghost} href={`/mock/take?f=section~math|${e}${seed}`}>Math</Link><Link className={btn.ghost} href={`/mock/take?f=section~${e==='dostsei'?'science':'language'}|${e}${seed}`}>{e==='dostsei'?'Science':'Verbal'}</Link></span></li>)}</ul></Sheet>
    <Sheet><h2 className="text-xl font-extrabold">On paper</h2><p className="mt-1 text-ink-soft">Print a booklet and an answer sheet for a study group or a classroom, then type the answers in to score them here.</p><div className="mt-3 flex flex-wrap gap-2"><Link className={btn.ghost} href={`/mock/print?f=section~math|${seed}`}>Math booklet</Link><Link className={btn.ghost} href={`/mock/print?f=full~${seed}`}>Full booklet</Link></div>
     <p className="mt-4 text-sm text-ink-soft">Practice settings per section: {SUBTESTS.map(s=>`${SUBTEST_LABEL[s]} ${UPCAT_BLUEPRINT[s].items} questions in ${UPCAT_BLUEPRINT[s].minutes} min`).join('; ')}.</p></Sheet>
   </div>
   {!!done.length&&<Sheet className="mt-5"><h2 className="text-xl font-extrabold">Your results</h2><ul className="mt-3 divide-y divide-mint-line">{done.map(a=>{const f=formFromKey(a.formKey);if(!f)return null;const r=scoreAttempt(f,a);return <li key={a.id}><Link href={`/mock/result?a=${a.id}`} className="flex min-h-14 items-center gap-3 py-3 hover:bg-mint"><span className="flex-1"><span className="block font-semibold">{f.title}</span><span className="text-sm text-ink-soft">{new Date(a.submittedAt!).toLocaleDateString('en-PH',{month:'short',day:'numeric'})}</span></span><span className="text-lg font-extrabold">{r.total.correct}/{r.total.total}</span></Link></li>;})}</ul><Link className={cx(btn.text,'mt-2')} href="/notebook">Mistake notebook</Link></Sheet>}
  </div>
 </>;
}
