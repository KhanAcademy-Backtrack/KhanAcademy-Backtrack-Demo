'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {useProgram} from './ProgramProvider';
import {PageBand,Sheet,btn,Oval,cx,pageBody,Pill,KhanLink} from './ui';
import {Question} from './Question';
import {useFix} from './useFix';
import {CHAPTER_BY_ID} from '@/content/reviewer';
import {CONCEPTS,CONCEPT_BY_ID} from '@/lib/program/concepts';
import {SUBTEST_LABEL,type Subtest} from '@/lib/mock/types';
import {misconception} from '@/lib/mock/misconceptions';
import {generateItem} from '@/lib/mock/families';
import {itemById} from '@/lib/mock/forms';
import {khanUrl,KHAN_UNITS} from '@/lib/program/khan-units';
import {EXTRAS} from '@/content/reviewer/extras';
import {StudyTools} from './StudyTools';
import {t} from '@/lib/i18n';
import {EXAMS,EXAM_IDS,type ExamId} from '@/lib/program/admissions';
import {EXAM_COVERAGE,FILIPINO_CONCEPT_AREA,FILIPINO_EXTRAS,hasFilipino,inCoverage,inSection,listNames as list} from '@/lib/program/exam-coverage';
import {EXAM_OUTLINES,OUTLINE_BY_KEY,topicKey,type OutlineGroup} from '@/lib/program/exam-outline';
import {useReviewerExam} from './useReviewerExam';
import {outlineVideo} from '@/lib/program/topic-videos';
import {outlineLessonId,lessonHref,conceptLessons} from '@/lib/program/topic-lessons';
import {LessonSequence} from './TopicLesson';
import {Rich} from '@/components/math/Math';
import {plainText} from '@/lib/notation';

/** Handbooks by subject; the test-day handbook has none and always shows. */
const EXTRA_SUBJECT:Record<string,Subtest>={x_formulas_math:'math',x_formulas_science:'science',x_grammar_en:'language',x_grammar_fil:'language',x_vocab:'language',x_reading:'reading'};
type Group={key:string;label:string;match:(subtest:Subtest,fil:boolean)=>boolean;empty?:boolean};
const row='flex min-h-14 items-center gap-3 px-4 py-3';

/** Study: practice exams first, then the reviewer library. The library lists the chosen exam's
 *  sections, closed until one is opened; each opens to its topics (the exam's outline where there is one, else its
 *  summaries). A search shows matching summaries from the whole exam. Full chapters open from each topic's page.
 *  Offline caching is scheduled for Phase B. */
export function ReviewerLibrary(){
 const {state,update}=useProgram();
 const [q,setQ]=useState('');
 const {exam:scope,setExam}=useReviewerExam();
 const norm=q.trim().toLowerCase();
 /** The shared reviewer preference falls back to the learner's first named exam. */
 const cover=EXAM_COVERAGE[scope];
 const groups:Group[]=cover.sections.map((x,i)=>({key:'s'+i,label:x.name,match:(t:Subtest,f:boolean)=>inSection(x,t,f),empty:!x.reviewer.length}));
 const label=(t:Subtest,f:boolean)=>groups.find(g=>g.match(t,f))?.label??SUBTEST_LABEL[t];
 const concepts=norm?CONCEPTS.filter(c=>inCoverage(scope,c.subtest,c.area===FILIPINO_CONCEPT_AREA)&&plainText([c.title,c.blurb,c.area,...c.tldr.must].join(' ')).toLowerCase().includes(norm)):[];
 const extras=EXTRAS.filter(x=>!EXTRA_SUBJECT[x.id]||(FILIPINO_EXTRAS.has(x.id)?hasFilipino(scope):inCoverage(scope,EXTRA_SUBJECT[x.id],false)));
 const missing=cover.sections.filter(x=>!x.reviewer.length).map(x=>x.name);
 const mark=(id:string)=>update(s=>({...s,bookmarks:s.bookmarks.includes(id)?s.bookmarks.filter(x=>x!==id):[...s.bookmarks,id]}));
 /** Saving remains separate from opening a dedicated lesson. */
 type Line={key:string;title:string;note:string;href:string};
 const lines=(items:Line[])=><ul className="mt-3 grid items-start gap-2 md:grid-cols-2">{items.map(x=>{const on=state.bookmarks.includes(x.key);return <li key={x.key} className="flex flex-wrap items-center gap-2 rounded-lg px-1 py-1 hover:bg-sky">
  <button type="button" aria-pressed={on} aria-label={`Save ${x.title}`} title={on?'Saved. Select to remove':'Save for later'} onClick={()=>mark(x.key)} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg hover:bg-mint focus-visible:outline-3 focus-visible:outline-navy"><Oval filled={on} size={22}/></button>
  <Link href={x.href} className="min-h-11 flex-1 py-2 font-semibold hover:underline"><Headline>{x.title}</Headline><span className="block text-sm font-normal text-ink-soft">{x.note}</span></Link><span aria-hidden="true" className="pr-2">→</span>
 </li>;})}</ul>;
 const summaryLines=(list:typeof CONCEPTS,inside:boolean)=>lines(list.map(c=>({key:c.id,title:c.title,href:`/learn/${c.id}`,note:inside?c.area:`${label(c.subtest,c.area===FILIPINO_CONCEPT_AREA)} · ${c.area}`})));
 /** An outlined exam lists every topic reviewers report, sub-subject by sub-subject. Each topic saves on its own,
  *  even when another topic shares a resource. Every title opens its own learning material. */
 const outline=EXAM_OUTLINES[scope];
 const outlinedMatches=norm?Object.values(outline?.sections??{}).flatMap(gs=>gs.flatMap(g=>g.topics)).filter(x=>x.title.toLowerCase().includes(norm)):[];
 const outlineRows=(sub:OutlineGroup[])=>sub.map((o,j)=><section key={o.name}><h3 className="mt-5 text-lg font-extrabold"><Headline>{String.fromCharCode(97+j)}. {o.name}</Headline></h3>{o.less&&<p className="mt-1 text-sm text-ink-soft">Only some reviewers report this part.</p>}
  {lines(o.topics.map(x=>({key:topicKey(scope,x.title),title:x.title,href:lessonHref(outlineLessonId(scope,x.title)),note:outlineVideo(scope,x.title)?'Video Lesson':'Focused Written Lesson'})))}</section>);
 const summary=(n:number,title:string,note:string)=><summary className={cx(row,'cursor-pointer list-none rounded-xl hover:bg-mint focus-visible:outline-3 focus-visible:outline-navy [&::-webkit-details-marker]:hidden')}><span className="flex-1 text-lg font-extrabold">{n}. {title}</span><span className="text-sm font-semibold text-ink-soft">{note}</span><span aria-hidden="true" className="text-xl leading-none transition-transform group-open:rotate-90 motion-reduce:transition-none">›</span></summary>;
 /** Everything saved, from any exam: outline topics, summaries, and chapters saved before chapters left this list. */
 const saved:Line[]=state.bookmarks.flatMap<Line>(k=>{const o=OUTLINE_BY_KEY.get(k),c=CONCEPT_BY_ID[k],ch=CHAPTER_BY_ID[k];
  return o?[{key:k,title:o.topic.title,href:lessonHref(outlineLessonId(o.exam,o.topic.title)),note:`${EXAMS[o.exam].name} · ${o.section}`}]:c?[{key:k,title:c.title,href:`/learn/${c.id}`,note:`Summary · ${c.area}`}]:ch?[{key:k,title:ch.title,href:`/reviewer/${ch.id}`,note:'Full chapter'}]:[];});
 return <>
  <PageBand title="Study" lead="Practice exams and the full CET reviewer in one place."/>
  <div className={pageBody}>
   <StudyTools/>
   <Sheet className="mt-8">
    <h2 className="text-2xl font-extrabold"><Headline>The reviewer</Headline></h2>
    <p className="mt-1.5 max-w-2xl leading-relaxed text-ink-soft">{CONCEPTS.length} topic foundations and focused lessons, plus formula sheets, grammar guides and a test-day handbook. Open a subject to see its topics.</p>
    <div className="mt-4 flex flex-wrap items-end gap-3">
     <label className="grid gap-1 text-sm font-semibold">{t(state.lang,'reviewer.for')}<select value={scope} onChange={e=>setExam(e.target.value as ExamId)} className="min-h-12 rounded-lg border-2 border-line-strong bg-white px-3 text-base font-bold text-navy focus:border-green focus:outline-none">
      {EXAM_IDS.map(x=><option key={x} value={x}>{EXAMS[x].name}</option>)}
     </select></label>
     <label className="block min-w-0 max-w-xl flex-1 basis-64"><span className="sr-only">Search the reviewer</span><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search: slope, ng at nang, half-life…" className="min-h-12 w-full rounded-lg border-2 border-line-strong bg-white px-4 text-navy placeholder:text-ink-soft focus:border-green focus:outline-none"/></label>
    </div>
    {norm?<>
     <p className="mt-5 text-sm font-semibold text-ink-soft">Matches from every {EXAMS[scope].name} section</p>
     {concepts.length>0&&<><h3 className="mt-5 text-lg font-extrabold"><Headline>Topic Foundations</Headline></h3>{summaryLines(concepts,false)}</>}
     {outlinedMatches.length>0&&<><h3 className="mt-5 text-lg font-extrabold"><Headline>Focused Lessons</Headline></h3>{lines(outlinedMatches.map(x=>({key:topicKey(scope,x.title),title:x.title,href:lessonHref(outlineLessonId(scope,x.title)),note:EXAMS[scope].name+' · '+(outlineVideo(scope,x.title)?'Video Lesson':'Focused Written Lesson')})))}</>}
     {!concepts.length&&!outlinedMatches.length&&<p className="mt-6 text-ink-soft">Nothing matches “{q}”. Try a shorter word.</p>}

    </>:<ul className="mt-5 grid gap-2">
     {groups.map((g,i)=>{const cs=g.empty?[]:CONCEPTS.filter(c=>g.match(c.subtest,c.area===FILIPINO_CONCEPT_AREA)),sub=outline?.sections[g.label];
      const all=sub?.flatMap(o=>o.topics),note=all?`${all.length} topic lessons`:`${cs.length} topic${cs.length===1?'':'s'}`;
      return <li key={g.key}>{cs.length?<details name="reviewer-section" className="group rounded-xl border-2 border-line open:border-line-strong">
       {summary(i+1,g.label,note)}
       <div className="border-t border-line px-3 pb-5 sm:px-5">{sub?outlineRows(sub):<><h3 className="mt-5 text-lg font-extrabold"><Headline>Topic summaries</Headline></h3>{summaryLines(cs,true)}</>}</div>
      </details>:<div className={cx(row,'rounded-xl border-2 border-dashed border-line')}><span className="flex-1 text-lg font-extrabold">{i+1}. {g.label}</span><span className="text-sm font-semibold text-ink-soft">No material yet</span></div>}</li>;})}
     {saved.length>0&&<li><details name="reviewer-section" className="group rounded-xl border-2 border-line open:border-line-strong">
      {summary(groups.length+1,'Saved',`${saved.length} saved`)}
      <div className="border-t border-line px-3 pb-5 sm:px-5">{lines(saved)}</div>
     </details></li>}
    </ul>}
    <div className="mt-4 max-w-3xl rounded-lg bg-sky px-4 py-3 text-sm leading-relaxed text-navy">
     <p><span className="font-bold">{EXAMS[scope].full}:</span> {list(cover.sections.map(x=>x.name))}.</p>
     {missing.length>0&&<p className="mt-1">The reviewer does not have {list(missing)} material yet.</p>}
     <p className="mt-1 text-ink-soft">{cover.source==='official'?'These are the sections the exam itself lists.':'The school does not publish a section list on its admissions pages, so check before you rely on it.'} <a className="font-semibold text-navy underline decoration-green decoration-2 underline-offset-4" href={EXAMS[scope].link} target="_blank" rel="noopener noreferrer">Official page ↗</a></p>
     {outline&&<p className="mt-1 text-ink-soft">The topics under each section follow what established {EXAMS[scope].name} reviewers cover. Open any topic for its own learning material.</p>}
    </div>
   </Sheet>
   <Sheet className="mt-5"><h2 className="text-xl font-extrabold"><Headline>Handbooks and sheets</Headline></h2><ul className="mt-3 grid gap-2 md:grid-cols-2">{extras.map(x=><li key={x.id}><Link href={`/reviewer/${x.id}`} className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-mint-line px-4 py-3 hover:bg-mint"><span className="flex-1"><span className="block font-bold"><Headline>{x.title}</Headline></span><span className="text-sm text-ink-soft"><Rich>{x.blurb}</Rich></span></span></Link></li>)}</ul></Sheet>
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
  <PageBand title={c.title} lead={<Rich>{c.summary.intro}</Rich>}><div className="mt-5 flex flex-wrap gap-2 print:hidden"><button className={btn.primary} onClick={()=>window.print()}><Headline>Print this chapter</Headline></button><button className={btn.quiet} aria-pressed={saved} onClick={()=>update(s=>({...s,bookmarks:saved?s.bookmarks.filter(x=>x!==c.id):[...s.bookmarks,c.id]}))}><Headline>{saved?'Saved':'Save for later'}</Headline></button><Link className={btn.quiet} href={`/mock/take?f=topic~${c.concept}|${today.replace(/-/g,'')}&mode=practice`}><Headline>Topic check</Headline></Link></div></PageBand>
  <div className={cx(pageBody,'print:mt-0')}>
   <LessonSequence lessons={conceptLessons(concept.id)}/>
   <Sheet className="mt-5"><h2 className="text-2xl font-extrabold"><Headline>1. The summary</Headline></h2>
    <div className="mt-4 grid gap-6">{c.summary.sections.map(s=><section key={s.heading}><h3 className="text-lg font-bold"><Rich>{s.heading}</Rich></h3>{s.body.map((b,i)=><p key={i} className="mt-2 max-w-3xl font-serif text-[18px] leading-[1.7]"><Rich>{b}</Rich></p>)}{s.formula&&<p className="mt-3 inline-block max-w-full rounded-xl bg-mint px-4 py-2 font-serif text-lg"><Rich>{s.formula}</Rich></p>}</section>)}</div>
   </Sheet>
   <Sheet className="mt-5"><h2 className="text-2xl font-extrabold"><Headline>2. Worked examples</Headline></h2>
    <div className="mt-4 grid gap-4 lg:grid-cols-3">{c.examples.map(e=><div key={e.q} className="rounded-2xl border-2 border-mint-line p-4"><Pill tone={e.level==='Stretch'?'navy':e.level==='Exam level'?'green':'mint'}>{e.level}</Pill><p className="mt-3 font-serif text-lg leading-snug"><Rich>{e.q}</Rich></p><ol className="mt-3 list-decimal space-y-1 pl-5 text-[15px]">{e.steps.map(s=><li key={s}><Rich>{s}</Rich></li>)}</ol><p className="mt-3 font-bold"><Rich>{e.answer}</Rich></p></div>)}</div>
   </Sheet>
   <Sheet className="mt-5"><h2 className="text-2xl font-extrabold"><Headline>3. Common traps</Headline></h2>
    <ul className="mt-4 grid gap-3 md:grid-cols-2">{c.traps.map((t,i)=>{const m=typeof t==='string'?misconception(t):undefined;const label=typeof t==='string'?m?.label:t.label,fixText=typeof t==='string'?m?.fix:t.fix;return <li key={i} className="rounded-2xl bg-sky p-4"><p className="font-bold"><Rich>{label??''}</Rich></p>{m&&<p className="mt-1 text-[15px] text-ink-soft"><Rich>{m.why}</Rich></p>}<p className="mt-2 text-[15px]"><Rich>{fixText??''}</Rich></p></li>;})}</ul>
   </Sheet>
   <div className="mt-5 grid gap-5 lg:grid-cols-2">
    <Sheet><h2 className="text-2xl font-extrabold"><Headline>4. A tip from the team</Headline></h2><p className="mt-3 border-l-4 border-green pl-4 font-serif text-[19px] leading-relaxed"><Rich>{c.tip}</Rich></p><p className="mt-3 text-sm text-ink-soft">From the Khanpanion team, three UPCAT passers now studying at UP Manila.</p></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold"><Headline>5. Learn it properly</Headline></h2>{concept.khan.length?<ul className="mt-2">{concept.khan.map(k=><li key={k}><KhanLink href={khanUrl(k)}>{KHAN_UNITS[k].course}: {KHAN_UNITS[k].unit}</KhanLink></li>)}</ul>:<p className="mt-2 text-ink-soft">Khan Academy has no Philippine course for this topic. This chapter is the full lesson.</p>}</Sheet>
   </div>
   <Sheet className="mt-5 print:break-before-page"><h2 className="text-2xl font-extrabold"><Headline>6. Practice set</Headline></h2><p className="mt-1 text-ink-soft">{practice.length} questions, fresh each day for math and science. Check each answer and open its full solution.</p>
    <ol className="mt-5 grid gap-8">{practice.map((it,n)=>it&&<li key={it.id} className="border-b border-mint-line pb-6 last:border-0"><Question item={it} number={n+1} mode="practice" chosen={answers[it.id]??null} idk={idk.includes(it.id)} revealed={shown.includes(it.id)} onChoose={i=>setAnswers(a=>({...a,[it.id]:i}))} onIdk={()=>setIdk(x=>x.includes(it.id)?x.filter(y=>y!==it.id):[...x,it.id])} onReveal={()=>setShown(s=>[...s,it.id])} lang={state.lang}/></li>)}</ol>
   </Sheet>
   <Sheet className="mt-5"><h2 className="text-2xl font-extrabold"><Headline>7. Recall cards</Headline></h2><p className="mt-1 text-ink-soft">Say the answer before you flip. Use these cards to check the main ideas in this chapter.</p>
    <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{c.recall.map((r,i)=><li key={i}><button aria-pressed={flip.includes(i)} onClick={()=>setFlip(f=>f.includes(i)?f.filter(x=>x!==i):[...f,i])} className={cx('min-h-32 w-full rounded-2xl p-4 text-left  text-navy',flip.includes(i)?'bg-navy text-white':'bg-mint')}><span className="block text-sm font-bold opacity-70">{flip.includes(i)?'Answer':'Question'}</span><span className="mt-1 block font-serif text-lg leading-snug"><Rich>{flip.includes(i)?r.back:r.front}</Rich></span></button></li>)}</ul>
   </Sheet>
   <Sheet className="mt-5 bg-mint"><h2 className="text-2xl font-extrabold"><Headline>8. If this felt hard, start here</Headline></h2><p className="mt-2 max-w-2xl text-[17px]"><Rich>{c.hard.text}</Rich></p><div className="mt-4 flex flex-wrap gap-2">{c.hard.engine&&<button className={btn.dark} onClick={()=>fix(c.hard.engine!.topic,c.hard.engine!.skill,`Starting point for ${c.title}`)}><Headline>Find my missing skill</Headline></button>}{c.hard.concepts.map(x=><Link key={x} className={btn.ghost} href={`/learn/${x}`}><Headline>{CONCEPT_BY_ID[x].title}</Headline></Link>)}</div></Sheet>
  </div>
 </article>;
}

export function ExtraPage({id}:{id:string}){
 const x=EXTRAS.find(e=>e.id===id);if(!x)return null;
 return <article>
  <PageBand title={x.title} lead={<Rich>{x.blurb}</Rich>}><button className={cx(btn.primary,'mt-5 print:hidden')} onClick={()=>window.print()}><Headline>Print</Headline></button></PageBand>
  <div className={cx(pageBody,'print:mt-0')}><div className="grid gap-5 lg:grid-cols-2">{x.sections.map(s=><Sheet key={s.heading} className="break-inside-avoid"><h2 className="text-xl font-extrabold"><Rich>{s.heading}</Rich></h2>
   {s.rows&&<dl className="mt-3 divide-y divide-mint-line">{s.rows.map(([k,v])=><div key={k} className="grid gap-1 py-2 sm:grid-cols-[40%_1fr]"><dt className="font-semibold"><Rich>{k}</Rich></dt><dd className="font-serif text-[17px]"><Rich>{v}</Rich></dd></div>)}</dl>}
   {s.items&&<ul className="mt-3 grid gap-2">{s.items.map(i=><li key={i} className="flex gap-3 text-[16px] leading-relaxed"><Oval filled size={18} className="mt-1"/><span><Rich>{i}</Rich></span></li>)}</ul>}
  </Sheet>)}</div></div>
 </article>;
}
