'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {useProgram} from './ProgramProvider';
import {PageBand,Sheet,btn,Oval,cx,pageBody,Pill,KhanLink} from './ui';
import {TldrCard} from './TldrCard';
import {Question} from './Question';
import {useFix} from './useFix';
import {CHAPTERS,CHAPTER_BY_ID} from '@/content/reviewer';
import {CONCEPTS,CONCEPT_BY_ID} from '@/lib/program/concepts';
import {SUBTEST_LABEL,SUBTESTS,type Subtest} from '@/lib/mock/types';
import {misconception} from '@/lib/mock/misconceptions';
import {generateItem} from '@/lib/mock/families';
import {itemById} from '@/lib/mock/forms';
import {khanUrl,KHAN_UNITS} from '@/lib/program/khan-units';
import {EXTRAS} from '@/content/reviewer/extras';
import {StudyTools} from './StudyTools';
import {t} from '@/lib/i18n';
import {EXAMS,type ExamId} from '@/lib/program/admissions';
import {EXAM_COVERAGE,FILIPINO_CONCEPT_AREA,FILIPINO_EXTRAS,hasFilipino,inCoverage,inSection,listNames as list} from '@/lib/program/exam-coverage';
import {firstExam} from '@/lib/program/personalization';

const filipino=(concept:string)=>CONCEPT_BY_ID[concept]?.area===FILIPINO_CONCEPT_AREA;
/** Handbooks by subject; the test-day handbook has none and always shows. */
const EXTRA_SUBJECT:Record<string,Subtest>={x_formulas_math:'math',x_formulas_science:'science',x_grammar_en:'language',x_grammar_fil:'language',x_vocab:'language',x_reading:'reading'};
type Group={key:string;label:string;match:(subtest:Subtest,fil:boolean)=>boolean;empty?:boolean};
type Entry=(typeof CONCEPTS)[number];
/** A section's topics grouped by area, in the reviewer's own order. */
function areas(g:Group):[string,Entry[]][]{
 const m=new Map<string,Entry[]>();
 if(!g.empty)for(const c of CONCEPTS)if(g.match(c.subtest,c.area===FILIPINO_CONCEPT_AREA))m.set(c.area,[...(m.get(c.area)??[]),c]);
 return [...m];
}
const chaptersOf=(concept:string)=>CHAPTERS.filter(ch=>ch.concept===concept);
const row='flex min-h-14 items-center gap-3 px-4 py-3';
const dot=<span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-green"/>;

/** Study: practice exams and daily recall first, then the reviewer library. The library lists the chosen exam's
 *  sections, closed until one is opened; each opens to its topics grouped by area, with the full chapter where one
 *  exists. A search shows matching chapters and summaries from the whole exam. Offline caching is scheduled for Phase B. */
export function ReviewerLibrary(){
 const {state,update}=useProgram();
 const [q,setQ]=useState(''),[picked,setPicked]=useState<ExamId|'all'>();
 const norm=q.trim().toLowerCase();
 /** Start from the learner's first named exam; "All CETs" shows every subject. */
 const exam=picked??firstExam(state)??'all',scope=exam==='all'?undefined:exam,cover=scope&&EXAM_COVERAGE[scope];
 const groups:Group[]=cover?cover.sections.map((x,i)=>({key:'s'+i,label:x.name,match:(t:Subtest,f:boolean)=>inSection(x,t,f),empty:!x.reviewer.length})):SUBTESTS.map(x=>({key:x,label:SUBTEST_LABEL[x],match:(t:Subtest)=>t===x}));
 const label=(t:Subtest,f:boolean)=>groups.find(g=>g.match(t,f))?.label??SUBTEST_LABEL[t];
 const concepts=norm?CONCEPTS.filter(c=>inCoverage(scope,c.subtest,c.area===FILIPINO_CONCEPT_AREA)&&[c.title,c.blurb,c.area,...c.tldr.must].join(' ').toLowerCase().includes(norm)):[];
 const chapters=norm?CHAPTERS.filter(c=>inCoverage(scope,c.subtest,filipino(c.concept))&&[c.title,c.summary.intro,...c.summary.sections.flatMap(x=>[x.heading,...x.body])].join(' ').toLowerCase().includes(norm)):[];
 const saved=[...CHAPTERS.filter(c=>state.bookmarks.includes(c.id)).map(c=>({id:c.id,title:c.title,href:`/reviewer/${c.id}`})),...CONCEPTS.filter(c=>state.bookmarks.includes(c.id)).map(c=>({id:c.id,title:c.title,href:`/learn/${c.id}`}))];
 const extras=EXTRAS.filter(x=>!scope||!EXTRA_SUBJECT[x.id]||(FILIPINO_EXTRAS.has(x.id)?hasFilipino(scope):inCoverage(scope,EXTRA_SUBJECT[x.id],false)));
 const missing=cover?cover.sections.filter(x=>!x.reviewer.length).map(x=>x.name):[];
 const mark=(id:string)=>update(s=>({...s,bookmarks:s.bookmarks.includes(id)?s.bookmarks.filter(x=>x!==id):[...s.bookmarks,id]}));
 const summary=(n:number,title:string,note:string)=><summary className={cx(row,'cursor-pointer list-none rounded-lg hover:bg-sky focus-visible:outline-3 focus-visible:outline-navy [&::-webkit-details-marker]:hidden')}><span className="flex-1 text-lg font-extrabold">{n}. {title}</span><span className="text-sm font-semibold text-ink-soft">{note}</span><span aria-hidden="true" className="text-xl leading-none transition-transform group-open:rotate-90 motion-reduce:transition-none">›</span></summary>;
 return <>
  <PageBand title="Study" lead="Practice exams, daily recall and the full CET reviewer in one place."/>
  <div className={pageBody}>
   <StudyTools/>
   <Sheet className="mt-8">
    <h2 className="text-2xl font-extrabold">The reviewer</h2>
    <p className="mt-1.5 max-w-2xl leading-relaxed text-ink-soft">Open a subject to see its topics. Each topic has a one-screen summary, and the main ones have a full printable chapter.</p>
    <div className="mt-4 flex flex-wrap items-end gap-3">
     <label className="grid gap-1 text-sm font-semibold">{t(state.lang,'reviewer.for')}<select value={exam} onChange={e=>setPicked(e.target.value as ExamId|'all')} className="min-h-12 rounded-lg border-2 border-line-strong bg-white px-3 text-base font-bold text-navy focus:border-green focus:outline-none">
      <option value="all">{t(state.lang,'reviewer.all')}</option>{(Object.keys(EXAMS) as ExamId[]).map(x=><option key={x} value={x}>{EXAMS[x].name}</option>)}
     </select></label>
     <label className="block min-w-0 max-w-xl flex-1 basis-64"><span className="sr-only">Search the reviewer</span><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search: slope, ng at nang, half-life…" className="min-h-12 w-full rounded-lg border-2 border-line-strong bg-white px-4 text-navy placeholder:text-ink-soft focus:border-green focus:outline-none"/></label>
    </div>
    {cover&&scope&&<div className="mt-4 max-w-3xl rounded-lg bg-sky px-4 py-3 text-sm leading-relaxed text-navy">
     <p><span className="font-bold">{EXAMS[scope].full}:</span> {list(cover.sections.map(x=>x.name))}.</p>
     {missing.length>0&&<p className="mt-1">The reviewer does not have {list(missing)} material yet.</p>}
     <p className="mt-1 text-ink-soft">{cover.source==='official'?'These are the sections the exam itself lists.':'The school does not publish a section list on its admissions pages, so check before you rely on it.'} <a className="font-semibold text-navy underline decoration-green decoration-2 underline-offset-4" href={EXAMS[scope].link} target="_blank" rel="noopener noreferrer">Official page ↗</a></p>
    </div>}
    {norm?<>
     <p className="mt-5 text-sm font-semibold text-ink-soft">Matches from every {scope?EXAMS[scope].name+' section':'subject'}</p>
     {!!chapters.length&&<><h3 className="mt-5 text-xl font-extrabold">Full chapters</h3><ul className="mt-3 grid gap-3 md:grid-cols-2">{chapters.map(c=><li key={c.id} className="flex items-start gap-3 rounded-2xl border-2 border-mint-line p-4"><Oval filled size={26} className="mt-1"/><div className="flex-1"><Link href={`/reviewer/${c.id}`} className="text-lg font-bold hover:underline">{c.title}</Link><p className="text-sm text-ink-soft">{label(c.subtest,filipino(c.concept))} · {c.examples.length} worked examples · {c.recall.length} recall cards</p></div><button aria-pressed={state.bookmarks.includes(c.id)} aria-label={`Save ${c.title}`} onClick={()=>mark(c.id)} className="min-h-11 rounded-lg px-3 text-sm font-bold aria-pressed:bg-mint text-navy">{state.bookmarks.includes(c.id)?'Saved':'Save'}</button></li>)}</ul></>}
     {!!concepts.length&&<><h3 className="mt-6 text-xl font-extrabold">Topic summaries</h3><ul className="mt-3 grid gap-2 md:grid-cols-2">{concepts.map(c=><li key={c.id} className="flex items-center gap-3 rounded-2xl px-2 py-1 hover:bg-mint"><Oval size={22}/><Link href={`/learn/${c.id}`} className="min-h-11 flex-1 py-2 font-semibold">{c.title}<span className="block text-sm font-normal text-ink-soft">{label(c.subtest,c.area===FILIPINO_CONCEPT_AREA)} · {c.area}</span></Link><button aria-pressed={state.bookmarks.includes(c.id)} aria-label={`Save ${c.title}`} onClick={()=>mark(c.id)} className="min-h-11 rounded-lg px-3 text-sm font-bold aria-pressed:bg-mint text-navy">{state.bookmarks.includes(c.id)?'Saved':'Save'}</button></li>)}</ul></>}
     {!chapters.length&&!concepts.length&&<p className="mt-6 text-ink-soft">Nothing matches “{q}”. Try a shorter word.</p>}
    </>:<ul className="mt-5 grid gap-2">
     {groups.map((g,i)=>{const sets=areas(g),count=sets.reduce((n,[,x])=>n+x.length,0);return <li key={g.key}>{count?<details name="reviewer-section" className="group rounded-xl border-2 border-line open:border-line-strong">
      {summary(i+1,g.label,`${count} topic${count===1?'':'s'}`)}
      <div className="grid gap-5 border-t border-line px-4 pb-5 pt-4 sm:px-6">{sets.map(([area,items],j)=><section key={area}>
       {sets.length>1&&<h3 className="text-base font-bold leading-snug text-ink-soft">{String.fromCharCode(97+j)}. {area}</h3>}
       <ul className={cx('grid gap-0.5',sets.length>1&&'mt-1.5 pl-4')}>{items.map(c=>{const full=chaptersOf(c.id);return <li key={c.id} className="flex gap-3 py-2">{dot}<span className="min-w-0"><Link href={`/learn/${c.id}`} className="font-semibold hover:underline">{c.title}</Link>{full.map(ch=><Link key={ch.id} href={`/reviewer/${ch.id}`} aria-label={`Full chapter: ${ch.title}`} className="ml-3 inline-block whitespace-nowrap text-sm font-semibold text-ink-soft underline decoration-green decoration-2 underline-offset-4 hover:text-navy">{full.length>1?`Chapter: ${ch.title}`:'Full chapter'}</Link>)}</span></li>;})}</ul>
      </section>)}</div>
     </details>:<div className={cx(row,'rounded-xl border-2 border-dashed border-line')}><span className="flex-1 text-lg font-extrabold">{i+1}. {g.label}</span><span className="text-sm font-semibold text-ink-soft">No material yet</span></div>}</li>;})}
     {!!saved.length&&<li><details name="reviewer-section" className="group rounded-xl border-2 border-line open:border-line-strong">
      {summary(groups.length+1,'Saved',`${saved.length} saved`)}
      <ul className="grid gap-0.5 border-t border-line px-4 pb-5 pt-4 sm:px-6">{saved.map(x=><li key={x.id} className="flex min-h-10 items-start gap-3 py-1">{dot}<Link href={x.href} className="flex-1 font-semibold hover:underline">{x.title}</Link><button aria-label={`Remove ${x.title} from saved`} onClick={()=>mark(x.id)} className="min-h-10 rounded-lg px-3 text-sm font-bold text-navy hover:bg-sky">Remove</button></li>)}</ul>
     </details></li>}
    </ul>}
   </Sheet>
   <Sheet className="mt-5"><h2 className="text-xl font-extrabold">Handbooks and sheets</h2><ul className="mt-3 grid gap-2 md:grid-cols-2">{extras.map(x=><li key={x.id}><Link href={`/reviewer/${x.id}`} className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-mint-line px-4 py-3 hover:bg-mint"><span className="flex-1"><span className="block font-bold">{x.title}</span><span className="text-sm text-ink-soft">{x.blurb}</span></span></Link></li>)}</ul></Sheet>
  </div>
 </>;
}

export function ChapterPage({id}:{id:string}){
 const {state,update,today}=useProgram(),fix=useFix();
 const c=CHAPTER_BY_ID[id],concept=c?CONCEPT_BY_ID[c.concept]:undefined;
 const practice=useMemo(()=>{if(!c)return [];const seed=today.replace(/-/g,'');return [...(c.practice.families??[]).flatMap(f=>[0,1].map(k=>generateItem(f,`${seed}-${k}`))),...(c.practice.items??[]).map(i=>itemById(i)).filter(Boolean) as ReturnType<typeof itemById>[]].slice(0,8);},[c,today]);
 const [answers,setAnswers]=useState<Record<string,number|null>>({}),[idk,setIdk]=useState<string[]>([]),[shown,setShown]=useState<string[]>([]),[flip,setFlip]=useState<number[]>([]);
 if(!c||!concept)return null;
 const saved=state.bookmarks.includes(c.id);
 return <article>
  <PageBand title={c.title} lead={c.summary.intro}><div className="mt-5 flex flex-wrap gap-2 print:hidden"><button className={btn.primary} onClick={()=>window.print()}>Print this chapter</button><button className={btn.quiet} aria-pressed={saved} onClick={()=>update(s=>({...s,bookmarks:saved?s.bookmarks.filter(x=>x!==c.id):[...s.bookmarks,c.id]}))}>{saved?'Saved':'Save for later'}</button><Link className={btn.quiet} href={`/mock/take?f=topic~${c.concept}|${today.replace(/-/g,'')}&mode=practice`}>Topic check</Link></div></PageBand>
  <div className={cx(pageBody,'print:mt-0')}>
   <TldrCard tldr={concept.tldr}/>
   <Sheet className="mt-5"><h2 className="text-2xl font-extrabold">1. The summary</h2>
    <div className="mt-4 grid gap-6">{c.summary.sections.map(s=><section key={s.heading}><h3 className="text-lg font-bold">{s.heading}</h3>{s.body.map((b,i)=><p key={i} className="mt-2 max-w-3xl font-serif text-[18px] leading-[1.7]">{b}</p>)}{s.formula&&<p className="mt-3 inline-block rounded-xl bg-mint px-4 py-2 font-serif text-lg">{s.formula}</p>}</section>)}</div>
   </Sheet>
   <Sheet className="mt-5"><h2 className="text-2xl font-extrabold">2. Worked examples</h2>
    <div className="mt-4 grid gap-4 lg:grid-cols-3">{c.examples.map(e=><div key={e.q} className="rounded-2xl border-2 border-mint-line p-4"><Pill tone={e.level==='Stretch'?'navy':e.level==='Exam level'?'green':'mint'}>{e.level}</Pill><p className="mt-3 font-serif text-lg leading-snug">{e.q}</p><ol className="mt-3 list-decimal space-y-1 pl-5 text-[15px]">{e.steps.map(s=><li key={s}>{s}</li>)}</ol><p className="mt-3 font-bold">{e.answer}</p></div>)}</div>
   </Sheet>
   <Sheet className="mt-5"><h2 className="text-2xl font-extrabold">3. Common traps</h2>
    <ul className="mt-4 grid gap-3 md:grid-cols-2">{c.traps.map((t,i)=>{const m=typeof t==='string'?misconception(t):undefined;const label=typeof t==='string'?m?.label:t.label,fixText=typeof t==='string'?m?.fix:t.fix;return <li key={i} className="rounded-2xl bg-sky p-4"><p className="font-bold">{label}</p>{m&&<p className="mt-1 text-[15px] text-ink-soft">{m.why}</p>}<p className="mt-2 text-[15px]">{fixText}</p></li>;})}</ul>
   </Sheet>
   <div className="mt-5 grid gap-5 lg:grid-cols-2">
    <Sheet><h2 className="text-2xl font-extrabold">4. A tip from the team</h2><p className="mt-3 border-l-4 border-green pl-4 font-serif text-[19px] leading-relaxed">{c.tip}</p><p className="mt-3 text-sm text-ink-soft">From the Khanpanion team, three UPCAT passers now studying at UP Manila.</p></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold">5. Learn it properly</h2>{concept.khan.length?<ul className="mt-2">{concept.khan.map(k=><li key={k}><KhanLink href={khanUrl(k)}>{KHAN_UNITS[k].course}: {KHAN_UNITS[k].unit}</KhanLink></li>)}</ul>:<p className="mt-2 text-ink-soft">Khan Academy has no Philippine course for this topic. This chapter is the full lesson.</p>}</Sheet>
   </div>
   <Sheet className="mt-5 print:break-before-page"><h2 className="text-2xl font-extrabold">6. Practice set</h2><p className="mt-1 text-ink-soft">{practice.length} questions, fresh each day for math and science. Check each answer and open its full solution.</p>
    <ol className="mt-5 grid gap-8">{practice.map((it,n)=>it&&<li key={it.id} className="border-b border-mint-line pb-6 last:border-0"><Question item={it} number={n+1} mode="practice" chosen={answers[it.id]??null} idk={idk.includes(it.id)} revealed={shown.includes(it.id)} onChoose={i=>setAnswers(a=>({...a,[it.id]:i}))} onIdk={()=>setIdk(x=>x.includes(it.id)?x.filter(y=>y!==it.id):[...x,it.id])} onReveal={()=>setShown(s=>[...s,it.id])} lang={state.lang}/></li>)}</ol>
   </Sheet>
   <Sheet className="mt-5"><h2 className="text-2xl font-extrabold">7. Recall cards</h2><p className="mt-1 text-ink-soft">Say the answer before you flip. Cards you save come back in your daily recall.</p>
    <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{c.recall.map((r,i)=><li key={i}><button aria-pressed={flip.includes(i)} onClick={()=>setFlip(f=>f.includes(i)?f.filter(x=>x!==i):[...f,i])} className={cx('min-h-32 w-full rounded-2xl p-4 text-left  text-navy',flip.includes(i)?'bg-navy text-white':'bg-mint')}><span className="block text-sm font-bold opacity-70">{flip.includes(i)?'Answer':'Question'}</span><span className="mt-1 block font-serif text-lg leading-snug">{flip.includes(i)?r.back:r.front}</span></button></li>)}</ul>
    <button className={cx(btn.ghost,'mt-4')} onClick={()=>update(s=>{const recall={...s.recall};c.recall.forEach((_,i)=>{recall[`card:${c.id}:${i}`]=recall[`card:${c.id}:${i}`]??{due:Date.now()+86400000,stage:0,last:Date.now()};});return {...s,recall};})}>Add these cards to my daily recall</button>
   </Sheet>
   <Sheet className="mt-5 bg-mint"><h2 className="text-2xl font-extrabold">8. If this felt hard, start here</h2><p className="mt-2 max-w-2xl text-[17px]">{c.hard.text}</p><div className="mt-4 flex flex-wrap gap-2">{c.hard.engine&&<button className={btn.dark} onClick={()=>fix(c.hard.engine!.topic,c.hard.engine!.skill,`Starting point for ${c.title}`)}>Find my missing skill</button>}{c.hard.concepts.map(x=><Link key={x} className={btn.ghost} href={`/learn/${x}`}>{CONCEPT_BY_ID[x].title}</Link>)}</div></Sheet>
  </div>
 </article>;
}

export function ExtraPage({id}:{id:string}){
 const x=EXTRAS.find(e=>e.id===id);if(!x)return null;
 return <article>
  <PageBand title={x.title} lead={x.blurb}><button className={cx(btn.primary,'mt-5 print:hidden')} onClick={()=>window.print()}>Print</button></PageBand>
  <div className={cx(pageBody,'print:mt-0')}><div className="grid gap-5 lg:grid-cols-2">{x.sections.map(s=><Sheet key={s.heading} className="break-inside-avoid"><h2 className="text-xl font-extrabold">{s.heading}</h2>
   {s.rows&&<dl className="mt-3 divide-y divide-mint-line">{s.rows.map(([k,v])=><div key={k} className="grid gap-1 py-2 sm:grid-cols-[40%_1fr]"><dt className="font-semibold">{k}</dt><dd className="font-serif text-[17px]">{v}</dd></div>)}</dl>}
   {s.items&&<ul className="mt-3 grid gap-2">{s.items.map(i=><li key={i} className="flex gap-3 text-[16px] leading-relaxed"><Oval filled size={18} className="mt-1"/><span>{i}</span></li>)}</ul>}
  </Sheet>)}</div></div>
 </article>;
}
