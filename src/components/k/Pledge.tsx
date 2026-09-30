'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useProgram} from './ProgramProvider';
import {Sheet,btn,cx} from './ui';
import {EXAMS,DEFAULT_EXAM_DATE,type ExamId} from '@/lib/program/admissions';
import {t} from '@/lib/i18n';

const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const field='min-h-12 w-full rounded-xl border-2 border-navy/15 bg-white px-3 text-[16px] text-navy focus:border-navy focus:outline-none';

/** The study pledge: exam and date, the learner's own reason, days and minutes,
 *  and an if-then plan. Implementation intentions like these make a routine stick. */
export function Pledge({onSaved}:{onSaved?:()=>void}){
 const {state,update,today}=useProgram(),router=useRouter(),lang=state.lang,p=state.pledge;
 const [exam,setExam]=useState<ExamId>(p?.exam??'upcat'),[date,setDate]=useState(p?.examDate??DEFAULT_EXAM_DATE.upcat),[why,setWhy]=useState(p?.why??'');
 const [weekdays,setWeekdays]=useState<number[]>(p?.weekdays??[1,3,5,6]),[minutes,setMinutes]=useState(p?.minutes??45),[when,setWhen]=useState(p?.when??'after dinner'),[time,setTime]=useState(p?.time??'19:00');
 const [error,setError]=useState('');
 function save(){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<=today){setError('Choose an exam date after today.');return;}
  if(!weekdays.length){setError('Choose at least one day a week.');return;}
  update(s=>({...s,pledge:{exam,examDate:date,why:why.trim().slice(0,400),days:weekdays.length,minutes,when:when.trim().slice(0,200)||'after class',time,weekdays:[...weekdays].sort(),createdAt:p?.createdAt??Date.now()},sides:{...s.sides,admission:true},activeSide:'admission'}));
  onSaved?.();router.push('/');
 }
 return <Sheet id="pledge" aria-labelledby="pledge-title">
  <h2 id="pledge-title" className="text-2xl font-extrabold tracking-[-.02em]">{t(lang,'onb.title')}</h2>
  <p className="mt-1 text-ink-soft">Start with a routine you can keep. You can change these choices later.</p>
  <div className="mt-6 grid gap-6">
   <fieldset><legend className="mb-2 font-bold">{t(lang,'onb.exam')}</legend>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(Object.keys(EXAMS) as ExamId[]).map(e=><button type="button" key={e} aria-pressed={exam===e} onClick={()=>{setExam(e);if(!p)setDate(DEFAULT_EXAM_DATE[e]);}} className="min-h-12 rounded-xl border-2 border-navy/15 px-3 font-bold text-navy aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white">{EXAMS[e].name}</button>)}</div>
    {exam!=='upcat'&&<p className="mt-2 text-sm text-ink-soft">Your plan uses Khanpanion’s practice sets for {EXAMS[exam].name}, built from the same banks as the UPCAT review.</p>}
   </fieldset>
   <label className="grid gap-2"><span className="font-bold">{t(lang,'onb.date')}</span><input type="date" aria-label={t(lang,'onb.date')} aria-describedby="date-note" className={field} value={date} min={today} onChange={e=>setDate(e.target.value)} onInput={e=>setDate(e.currentTarget.value)}/><span id="date-note" className="text-sm text-ink-soft">Use your announced exam date, or choose a personal planning target. A target does not confirm an official test date.</span></label>
   <label className="grid gap-2"><span className="font-bold">{t(lang,'onb.why')}</span><span className="text-sm text-ink-soft">{t(lang,'onb.whyHint')}</span><textarea className={cx(field,'min-h-24 py-2 font-serif text-lg')} maxLength={400} value={why} onChange={e=>setWhy(e.target.value)} placeholder="What would you like this study routine to help you do?"/></label>
   <fieldset><legend className="mb-2 font-bold">{t(lang,'onb.weekdays')}</legend>
    <div className="flex flex-wrap gap-2">{DAYS.map((d,i)=><button type="button" key={d} aria-pressed={weekdays.includes(i)} onClick={()=>setWeekdays(w=>w.includes(i)?w.filter(x=>x!==i):[...w,i])} className="min-h-12 min-w-14 rounded-full border-2 border-navy/15 px-3 font-bold aria-pressed:border-green aria-pressed:bg-green text-navy">{d}</button>)}</div>
    <p className="mt-2 text-sm text-ink-soft">{weekdays.length} day{weekdays.length===1?'':'s'} a week. Saturdays become mock exam days once practice starts.</p>
   </fieldset>
   <fieldset><legend className="mb-2 font-bold">{t(lang,'onb.minutes')}</legend>
    <div className="flex flex-wrap gap-2">{[20,30,45,60,90].map(n=><button type="button" key={n} aria-pressed={minutes===n} onClick={()=>setMinutes(n)} className="min-h-12 rounded-full border-2 border-navy/15 px-4 font-bold aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white text-navy">{n} min</button>)}</div>
   </fieldset>
   <div className="rounded-2xl bg-mint p-4 sm:p-5">
    <p className="font-bold">When will you study?</p>
    <p className="mt-3 flex flex-wrap items-center gap-2 font-serif text-xl leading-loose">
     <span>{t(lang,'onb.ifthen')}</span>
     <input aria-label="When" className="min-h-11 w-48 rounded-lg border-2 border-navy/20 bg-white px-2 font-sans text-base" value={when} maxLength={200} onChange={e=>setWhen(e.target.value)}/>
     <span>, {t(lang,'onb.at').toLowerCase()}</span>
     <input aria-label="Time" type="time" className="min-h-11 rounded-lg border-2 border-navy/20 bg-white px-2 font-sans text-base" value={time} onChange={e=>setTime(e.target.value)}/>
     <span>{t(lang,'onb.for')} {minutes} minutes.</span>
    </p>
   </div>
   {error&&<p role="alert" className="font-semibold text-navy">{error}</p>}
   <div><button className={btn.primary} onClick={save}>{t(lang,'onb.save')}</button></div>
  </div>
 </Sheet>;
}
