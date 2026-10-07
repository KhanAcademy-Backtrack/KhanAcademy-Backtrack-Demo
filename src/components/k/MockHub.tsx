'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useProgram} from './ProgramProvider';
import {PageBand,Sheet,btn,Oval,cx,pageBody,Pill} from './ui';
import {formFromKey,formItems,formMinutes,sprintForm,fullForm} from '@/lib/mock/forms';
import {scoreAttempt,answeredCount} from '@/lib/mock/scoring';
import {SUBTEST_LABEL,SUBTESTS} from '@/lib/mock/types';
import {CONCEPTS} from '@/lib/program/concepts';
import {EXAMS} from '@/lib/program/admissions';
import {UPCAT_BLUEPRINT,TOPIC_CHECK} from '@/lib/mock/blueprint';

export function MockHub(){
 const {state,today}=useProgram();
 const seed=`${today.replace(/-/g,'')}${state.attempts.length}`;
 const open=state.attempts.filter(a=>!a.submittedAt).slice(-3).reverse();
 const done=state.attempts.filter(a=>a.submittedAt).slice(-8).reverse();
 const sprint=sprintForm('x'),full=fullForm('x');
 const card='flex flex-col gap-2 rounded-2xl bg-white p-5 text-navy shadow-sheet sm:p-6',meta='text-sm font-semibold text-ink-soft';
 return <>
  <PageBand title="Practice for your exam" lead="Start with a short set, focus on one subject, or try a timed mock. Every answer has an explanation."/>
  <div className={pageBody}>
   {!!open.length&&<Sheet className="mb-5"><h2 className="text-xl font-extrabold"><Headline>Pick up where you left off</Headline></h2><ul className="mt-3 grid gap-2">{open.map(a=>{const f=formFromKey(a.formKey);if(!f)return null;const n=answeredCount(f,a),total=formItems(f).length;return <li key={a.id}><Link href={`/mock/take?f=${encodeURIComponent(a.formKey)}`} className="flex min-h-14 items-center gap-3 rounded-lg border-2 border-line px-4 py-3 hover:border-line-strong hover:bg-sky"><Oval filled={n>0} size={26}/><span className="flex-1 font-semibold"><Headline>{f.title}</Headline></span><span className="text-sm text-ink-soft">{n} of {total} answered</span></Link></li>;})}</ul></Sheet>}
   <div className="grid gap-5 md:grid-cols-3">
    <div className={card}><p className={meta}>{formMinutes(sprint)} minutes</p><h2 className="text-xl font-extrabold"><Headline>Sprint</Headline></h2><p className="text-ink-soft">{formItems(sprint).length} mixed questions: math, science and language. Check each one as you go.</p><Link className={cx(btn.primary,'mt-auto pt-2.5')} href={`/mock/take?f=sprint~${seed}&mode=practice`}><Headline>Start a sprint</Headline></Link></div>
    <div className={card}><p className={meta}>One subtest</p><h2 className="text-xl font-extrabold"><Headline>Section</Headline></h2><p className="text-ink-soft">A full-length section at exam pace. Timer optional, answers at the end.</p><div className="mt-auto grid grid-cols-2 gap-2 pt-1">{SUBTESTS.map(s=><Link key={s} className={btn.ghost} href={`/mock/take?f=section~${s}|${seed}`}><Headline>{s==='language'?'Language':s==='reading'?'Reading':s==='math'?'Math':'Science'}</Headline></Link>)}</div></div>
    <div className={card}><p className={meta}>About {Math.round(formMinutes(full)/60*10)/10} hours</p><h2 className="text-xl font-extrabold"><Headline>Full simulation</Headline></h2><p className="text-ink-soft">All four subtests, {formItems(full).length} questions, breaks between sections. Practise keeping your pace across a longer session.</p><Link className={cx(btn.ghost,'mt-auto')} href={`/mock/take?f=full~${seed}`}><Headline>Start a full simulation</Headline></Link></div>
   </div>
   <Sheet className="mt-5"><h2 className="text-xl font-extrabold"><Headline>Topic checks</Headline></h2><p className="mt-1 text-ink-soft">{TOPIC_CHECK.items} exam-level questions from one topic, right after you study it.</p>
    <div className="mt-4 grid gap-5 md:grid-cols-2">{SUBTESTS.map(sub=><div key={sub}><p className="font-bold">{SUBTEST_LABEL[sub]}</p><div className="mt-2 flex flex-wrap gap-2">{CONCEPTS.filter(c=>c.subtest===sub).map(c=><Link key={c.id} href={`/mock/take?f=topic~${c.id}|${seed}&mode=practice`} className="min-h-11 rounded-lg border-2 border-line px-3 py-2 text-sm font-semibold hover:border-line-strong hover:bg-sky"><Headline>{c.title}</Headline></Link>)}</div></div>)}</div>
   </Sheet>
   <div className="mt-5 grid gap-5 md:grid-cols-2">
    <Sheet><h2 className="text-xl font-extrabold"><Headline>Practice sets for other exams</Headline></h2><p className="mt-1 text-ink-soft">Built from the same banks. Khanpanion’s own practice, not copies of these exams.</p><ul className="mt-3 grid gap-2">{(['dcat','dostsei','pupcet'] as const).map(e=><li key={e} className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">Practice sets for {EXAMS[e].name}</span><span className="flex gap-2"><Link className={btn.ghost} href={`/mock/take?f=section~math|${e}${seed}`}><Headline>Math</Headline></Link><Link className={btn.ghost} href={`/mock/take?f=section~${e==='dostsei'?'science':'language'}|${e}${seed}`}><Headline>{e==='dostsei'?'Science':'Verbal'}</Headline></Link></span></li>)}</ul></Sheet>
    <Sheet><h2 className="text-xl font-extrabold"><Headline>On paper</Headline></h2><p className="mt-1 text-ink-soft">Print a booklet and an answer sheet for a study group or a classroom, then type the answers in to score them here.</p><div className="mt-3 flex flex-wrap gap-2"><Link className={btn.ghost} href={`/mock/print?f=section~math|${seed}`}><Headline>Math booklet</Headline></Link><Link className={btn.ghost} href={`/mock/print?f=full~${seed}`}><Headline>Full booklet</Headline></Link></div>
     <p className="mt-4 text-sm text-ink-soft">Practice settings per section: {SUBTESTS.map(s=>`${SUBTEST_LABEL[s]} ${UPCAT_BLUEPRINT[s].items} questions in ${UPCAT_BLUEPRINT[s].minutes} min`).join('; ')}.</p></Sheet>
   </div>
   {!!done.length&&<Sheet className="mt-5"><h2 className="text-xl font-extrabold"><Headline>Your results</Headline></h2><ul className="mt-3 divide-y divide-line">{done.map(a=>{const f=formFromKey(a.formKey);if(!f)return null;const r=scoreAttempt(f,a);return <li key={a.id}><Link href={`/mock/result?a=${a.id}`} className="flex min-h-14 items-center gap-3 py-3 hover:bg-sky"><span className="flex-1"><span className="block font-semibold"><Headline>{f.title}</Headline></span><span className="text-sm text-ink-soft">{new Date(a.submittedAt!).toLocaleDateString('en-PH',{month:'short',day:'numeric'})}</span></span><span className="text-lg font-extrabold">{r.total.correct}/{r.total.total}</span></Link></li>;})}</ul><Link className={cx(btn.text,'mt-2')} href="/notebook"><Headline>Mistake notebook</Headline></Link></Sheet>}
  </div>
 </>;
}
