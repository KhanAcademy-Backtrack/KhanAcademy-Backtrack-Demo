'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useMemo} from 'react';
import {useProgram} from './ProgramProvider';
import {useReviewerExam} from './useReviewerExam';
import {PageBand,Sheet,btn,Oval,cx,pageBody} from './ui';
import {formFromKey,formItems,formMinutes,formGroups,sprintForm,reviewerFullForm,reviewerSectionForm} from '@/lib/mock/forms';
import {scoreAttempt,answeredCount} from '@/lib/mock/scoring';
import {EXAMS,EXAM_IDS,type ExamId} from '@/lib/program/admissions';
import {reviewerSections,reviewerSectionKey,reviewerFullKey} from '@/lib/mock/reviewer-scope';
import {listNames} from '@/lib/program/exam-coverage';

export function MockHub(){
 const {state,today}=useProgram();
 const {exam,setExam}=useReviewerExam();
 const seed=`${today.replace(/-/g,'')}${state.attempts.length}`;
 const open=state.attempts.filter(a=>!a.submittedAt).slice(-3).reverse();
 const done=state.attempts.filter(a=>a.submittedAt).slice(-8).reverse();
 const sprint=useMemo(()=>sprintForm('x'),[]);
 const full=useMemo(()=>reviewerFullForm(exam,seed),[exam,seed]);
 const fullKey=reviewerFullKey(exam,seed);
 const sections=useMemo(()=>reviewerSections(exam).map(s=>({...s,form:reviewerSectionForm(exam,s.id,seed)})),[exam,seed]);
 const available=sections.filter(s=>s.form),missing=sections.filter(s=>!s.form);
 const card='flex flex-col gap-2 rounded-2xl bg-white p-5 text-navy shadow-sheet sm:p-6',meta='text-sm font-semibold text-ink-soft';
 return <>
  <PageBand title="Practice for your exam" lead="Start with a short set, focus on one subject, or try a timed mock. Every answer has an explanation."/>
  <div className={pageBody}>
   <Sheet className="mb-5 flex flex-wrap items-end gap-4">
    <label className="grid min-w-0 gap-1 text-sm font-semibold">Reviewing for<select value={exam} onChange={e=>setExam(e.target.value as ExamId)} className="min-h-12 max-w-full rounded-lg border-2 border-line-strong bg-white px-3 text-base font-bold text-navy focus:border-green focus:outline-none">{EXAM_IDS.map(e=><option key={e} value={e}>{EXAMS[e].name}</option>)}</select></label>
    <p className="min-w-0 flex-1 basis-64 text-sm text-ink-soft" role="status">Sections and full simulations follow your {EXAMS[exam].name} reviewer.</p>
    <Link href={`/reviewer?exam=${exam}`} className={btn.text}><Headline>Open this reviewer</Headline></Link>
   </Sheet>
   {!!open.length&&<Sheet className="mb-5"><h2 className="text-xl font-extrabold"><Headline>Pick up where you left off</Headline></h2><ul className="mt-3 grid gap-2">{open.map(a=>{const f=formFromKey(a.formKey);if(!f)return null;const n=answeredCount(f,a),total=formItems(f).length;return <li key={a.id}><Link href={`/mock/take?f=${encodeURIComponent(a.formKey)}`} className="flex min-h-14 items-center gap-3 rounded-lg border-2 border-line px-4 py-3 hover:border-line-strong hover:bg-sky"><Oval filled={n>0} size={26}/><span className="flex-1 font-semibold"><Headline>{f.title}</Headline></span><span className="text-sm text-ink-soft">{n} of {total} answered</span></Link></li>;})}</ul></Sheet>}
   <div className="grid gap-5 md:grid-cols-3">
    <div className={card}><p className={meta}>{formMinutes(sprint)} minutes</p><h2 className="text-xl font-extrabold"><Headline>Sprint</Headline></h2><p className="text-ink-soft">{formItems(sprint).length} mixed questions: math, science and language. Check each one as you go.</p><Link className={cx(btn.primary,'mt-auto pt-2.5')} href={`/mock/take?f=sprint~${seed}&mode=practice`}><Headline>Start a sprint</Headline></Link></div>
    <section className={card} aria-labelledby="practice-section"><p className={meta}>{EXAMS[exam].name} sections</p><h2 id="practice-section" className="text-xl font-extrabold"><Headline>Section</Headline></h2><p className="text-ink-soft">Practise one section from your reviewer. Timer optional, answers at the end.</p><div className="mt-auto grid grid-cols-1 gap-2 pt-1 xl:grid-cols-2">{available.map(s=><Link key={s.id} className={cx(btn.ghost,'px-3 text-center')} href={`/mock/take?f=${encodeURIComponent(reviewerSectionKey(exam,s.id,seed))}`}><Headline>{s.name}</Headline></Link>)}</div>{missing.length>0&&<p className="text-sm text-ink-soft">No practice questions yet for {listNames(missing.map(s=>s.name))}.</p>}</section>
    <section className={card} aria-labelledby="practice-full"><p className={meta}>{EXAMS[exam].name} · About {Math.round(formMinutes(full)/60*10)/10} hours</p><h2 id="practice-full" className="text-xl font-extrabold"><Headline>Full simulation</Headline></h2><p className="text-ink-soft">{formGroups(full).length} available {EXAMS[exam].name} sections, {formItems(full).length} questions, breaks between sections. Practise keeping your pace across a longer session.</p>{missing.length>0&&<p className="text-sm text-ink-soft">Not included yet: {listNames(missing.map(s=>s.name))}.</p>}<Link className={cx(btn.ghost,'mt-auto')} href={`/mock/take?f=${encodeURIComponent(fullKey)}`}><Headline>Start a full simulation</Headline></Link></section>
   </div>
   <Sheet className="mt-5"><h2 className="text-xl font-extrabold"><Headline>On paper</Headline></h2><p className="mt-1 text-ink-soft">Print a booklet and an answer sheet for a study group or a classroom, then type the answers in to score them here.</p><div className="mt-3 flex flex-wrap gap-2">{available.map(s=><Link key={s.id} className={btn.ghost} href={`/mock/print?f=${encodeURIComponent(reviewerSectionKey(exam,s.id,seed))}`}><Headline>{s.name} booklet</Headline></Link>)}<Link className={btn.ghost} href={`/mock/print?f=${encodeURIComponent(fullKey)}`}><Headline>{EXAMS[exam].name} full booklet</Headline></Link></div>
    <p className="mt-4 text-sm text-ink-soft">Khanpanion practice settings: {available.map(s=>`${s.name}: ${formItems(s.form!).length} questions in ${formMinutes(s.form!)} min`).join('; ')}. These sets use our shared question banks.</p></Sheet>
   {!!done.length&&<Sheet className="mt-5"><h2 className="text-xl font-extrabold"><Headline>Your results</Headline></h2><ul className="mt-3 divide-y divide-line">{done.map(a=>{const f=formFromKey(a.formKey);if(!f)return null;const r=scoreAttempt(f,a);return <li key={a.id}><Link href={`/mock/result?a=${a.id}`} className="flex min-h-14 items-center gap-3 py-3 hover:bg-sky"><span className="flex-1"><span className="block font-semibold"><Headline>{f.title}</Headline></span><span className="text-sm text-ink-soft">{new Date(a.submittedAt!).toLocaleDateString('en-PH',{month:'short',day:'numeric'})}</span></span><span className="text-lg font-extrabold">{r.total.correct}/{r.total.total}</span></Link></li>;})}</ul><Link className={cx(btn.text,'mt-2')} href="/notebook"><Headline>Mistake notebook</Headline></Link></Sheet>}
  </div>
 </>;
}
