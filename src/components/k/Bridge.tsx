'use client';
import Link from 'next/link';
import {useState,type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {useProgram} from './ProgramProvider';
import {TopicPicker} from './TopicPicker';
import {CourseArt,KindMark,SubjectMark} from './CourseArt';
import {PageBand,Sheet,btn,cx,pageBody,KhanLink,Pill} from './ui';
import {useFix} from './useFix';
import {useQuietMotion} from './useQuietMotion';
import {KhanPlayer} from '@/components/product/KhanPlayer';
import {subjectTopicVideo} from '@/lib/program/topic-videos';
import {VideoToggle,VideoPanel} from './TopicVideo';
import {PROGRAMS,PROGRAM_BY_ID,RESCUES,RESCUE_BY_ID,RETIRED_PROGRAMS,summerPlan,type BridgeProgram} from '@/lib/program/bridge';
import {COLLEGE_UNITS,KIND_LABEL,SUBJECT_BY_ID,collegeUnitUrl,type CollegeSubject,type SubjectKind} from '@/lib/program/college-courses';
import {CONCEPT_BY_ID} from '@/lib/program/concepts';
import {focusRanking,statusOf,type FocusRow} from '@/lib/program/planner';
import {khanLabel,khanUrl,KHAN_UNITS} from '@/lib/program/khan-units';
import {NEXT_SKILL} from '@/lib/recovery';
import {formFromKey,formItems,itemById,placementForm} from '@/lib/mock/forms';

const RESCUE_SUBJECT:Record<string,string>={limits:'Math',derivatives:'Math',integrals:'Math',discrete:'Math',statistics:'Statistics',regression:'Statistics',hypothesis:'Statistics',programming:'Computing',vectors:'Physics',kinematics:'Physics',newton:'Physics',circuits:'Physics',stoichiometry:'Chemistry',balancing:'Chemistry',solutions:'Chemistry',logs:'Chemistry',genetics_prob:'Biology',academic_reading:'Reading'};
const subjectsOf=(p:BridgeProgram)=>p.subjects.map(id=>SUBJECT_BY_ID[id]).filter((s):s is CollegeSubject=>!!s);

type Rank=Map<string,FocusRow>;
/** A program's foundations in path order: each concept once, as its first-year assumptions list them. */
const foundationsOf=(p:BridgeProgram)=>[...new Set(p.assumes.flatMap(a=>a.concepts))].filter(c=>CONCEPT_BY_ID[c]);
const statusIn=(rank:Rank,c:string)=>{const r=rank.get(c);return r?statusOf(r):'not started';};
const solidCount=(p:BridgeProgram,rank:Rank)=>foundationsOf(p).filter(c=>statusIn(rank,c)==='solid').length;

/** A thin progress bar. The number beside it carries the meaning; the bar is decoration. */
function Bar({value,total}:{value:number;total:number}){
 return <span aria-hidden="true" className="block h-2 overflow-hidden rounded bg-line"><span className="block h-full rounded bg-green transition-[width] duration-500 motion-reduce:transition-none" style={{width:`${total?Math.round(value/total*100):0}%`}}/></span>;
}

const Check=({className='h-6 w-6'}:{className?:string})=><svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path d="m5.5 12.5 4 4 9-9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;

function Rescue({only}:{only?:string[]}){
 const fix=useFix(),[pick,setPick]=useState<string>('');
 const list=only?RESCUES.filter(r=>only.includes(r.id)):RESCUES,r=pick?RESCUE_BY_ID[pick]:undefined;
 return <Sheet>
  <h2 className="text-xl font-extrabold sm:text-2xl">Work through a class topic</h2>
  <p className="mt-1 text-ink-soft">Stuck on something from class? Find the ideas it builds on.</p>
  <TopicPicker items={list.map(x=>({id:x.id,label:x.topic,category:RESCUE_SUBJECT[x.id],search:x.needs}))} value={pick} onChoose={setPick}/>
  {r&&<div className="mt-5 rounded-2xl bg-mint p-4 sm:p-5" aria-live="polite">
   <p className="font-bold">{r.topic} assumes:</p><p className="mt-1 font-serif text-lg">{r.needs}</p>
   <div className="mt-4 grid gap-2 sm:grid-cols-2">{r.concepts.map(c=><Link key={c} href={`/learn/${c}`} className="flex min-h-14 items-center gap-3 rounded-xl bg-white px-4 py-2 font-semibold hover:bg-sky"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky"><SubjectMark subject={CONCEPT_BY_ID[c].subtest} className="h-5 w-5"/></span>{CONCEPT_BY_ID[c].title}</Link>)}</div>
   <div className="mt-4 flex flex-wrap gap-3">{r.engine&&<button className={btn.dark} onClick={()=>fix(r.engine!,NEXT_SKILL[r.engine!],`Help with ${r.topic}`)}>Find my missing skill</button>}{r.khan.map(k=><KhanLink key={k} href={khanUrl(k)}>{KHAN_UNITS[k].course}: {KHAN_UNITS[k].unit}</KhanLink>)}</div>
  </div>}
 </Sheet>;
}

export function BridgeHub(){
 const {state,update}=useProgram(),router=useRouter(),still=useQuietMotion();
 const rank:Rank=new Map(focusRanking(state).map(r=>[r.concept.id,r]));
 const choose=(id:string)=>{update(s=>s.setup&&s.setup.goal!=='college'?s:{...s,sides:{...s.sides,bridge:true},activeSide:s.setup?s.activeSide:'bridge',bridgeProgram:id});router.push(`/bridge/${id}`);};
 const mine=PROGRAM_BY_ID[state.bridgeProgram??''];
 return <>
  <PageBand title="Courses" lead="Pick a college field to see the subjects you will take, with Khan Academy videos and units for each."/>
  <div className={pageBody}>
   {mine&&(()=>{const n=foundationsOf(mine).length,done=solidCount(mine,rank);return <Sheet className="mb-5 overflow-hidden p-0">
    <div className="grid sm:grid-cols-[minmax(0,260px)_1fr]">
     <CourseArt id={mine.id} className="block aspect-[12/5] w-full sm:aspect-auto sm:h-full"/>
     <div className="flex flex-col justify-center gap-3 p-5 sm:p-7">
      <p className="text-sm font-semibold text-ink-soft">Jump back in</p>
      <h2 className="text-xl font-extrabold sm:text-2xl">{mine.title}</h2>
      <div className="max-w-sm"><p className="mb-1.5 text-sm font-semibold">{done} of {n} foundations solid</p><Bar value={done} total={n}/></div>
      <div><Link className={btn.primary} href={`/bridge/${mine.id}`}>Continue</Link></div>
     </div>
    </div>
   </Sheet>;})()}
   <section aria-labelledby="fields">
    <h2 id="fields" className="px-1 text-xl font-extrabold sm:text-2xl">Explore a college field</h2>
    <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{PROGRAMS.map(p=>{const n=foundationsOf(p).length,done=solidCount(p,rank),current=mine?.id===p.id;
     return <li key={p.id}><button onClick={()=>choose(p.id)} className={cx('group flex h-full w-full flex-row overflow-hidden rounded-2xl sm:flex-col border-2 bg-white text-left text-navy shadow-sheet focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy',current?'border-green':'border-transparent hover:border-line-strong',!still&&'transition hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0')}>
      <CourseArt id={p.id} className="block aspect-square w-28 shrink-0 self-stretch sm:aspect-[16/9] sm:w-full sm:self-auto"/>
      <span className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
       <span className="text-lg font-bold leading-snug">{p.title}</span>
       <span className="mt-auto flex items-center justify-between gap-3 text-sm text-ink-soft"><span>{p.subjects.length} subjects{done?` · ${done} of ${n} foundations solid`:''}</span>{current&&<Pill tone="green">Your field</Pill>}</span>
       {done>0&&<Bar value={done} total={n}/>}
      </span>
     </button></li>;})}</ul>
   </section>
   <div className="mt-8"><Rescue/></div>
  </div>
 </>;
}

/** One step on a course path: a square node on a connecting line, and its content. */
function Step({node,last,lit,children}:{node:ReactNode;last:boolean;lit:boolean;children:ReactNode}){
 return <li className={cx('relative flex gap-4',!last&&'pb-3')}>
  {!last&&<span aria-hidden="true" className={cx('absolute bottom-0 left-6 top-12 w-[3px] -translate-x-1/2 rounded',lit?'bg-green':'bg-line-strong')}/>}
  {node}
  <div className="min-w-0 flex-1">{children}</div>
 </li>;
}

function Section({title,meta,children}:{title:string;meta?:ReactNode;children:ReactNode}){
 return <Sheet>
  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"><h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>{meta}</div>
  {children}
 </Sheet>;
}

export function BridgeProgramPage({id}:{id:string}){
 const {state,today}=useProgram();
 const p=PROGRAM_BY_ID[id];if(!p)return null;
 const rank:Rank=new Map(focusRanking(state).map(r=>[r.concept.id,r]));
 const placement=state.attempts.filter(a=>a.submittedAt&&a.formKey.startsWith(`placement~${id}|`)).sort((a,b)=>b.submittedAt!-a.submittedAt!)[0];
 const placeForm=placement?formFromKey(placement.formKey):undefined;
 const placeScore=placement&&placeForm?formItems(placeForm).filter(x=>placement.answers[x]===itemById(x)?.answerIndex).length:undefined;
 const weeks=summerPlan(p),seed=today.replace(/-/g,'');
 const check=placementForm(p.id,seed),questions=check?formItems(check).length:0,minutes=check?check.sections.reduce((t,s)=>t+s.minutes,0):0;
 const steps=foundationsOf(p),solid=steps.filter(c=>statusIn(rank,c)==='solid').length,next=steps.find(c=>statusIn(rank,c)!=='solid');
 return <div className="mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-8 lg:pb-20 lg:pt-7">
  <Link href="/bridge" className={cx(btn.quiet,'-ml-3 no-underline')}><span aria-hidden="true">←</span> All courses</Link>
  <div className="mt-3 grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-7">
   <Sheet as="div" className="overflow-hidden p-0 lg:sticky lg:top-24">
    <CourseArt id={p.id} className="block aspect-[12/5] w-full lg:aspect-[16/9]"/>
    <div className="p-5 sm:p-6">
     <h1 className="text-[1.6rem] font-extrabold leading-tight tracking-[-.02em]">{p.title}</h1>
     <p className="mt-1.5 text-sm text-ink-soft">{p.examples}</p>
     <div className="mt-5"><p className="mb-1.5 text-sm font-semibold">{solid} of {steps.length} foundations solid</p><Bar value={solid} total={steps.length}/></div>
     <Link className={cx(btn.primary,'mt-5 w-full')} href={`/mock/take?f=placement~${id}|${seed}&mode=practice`}>{placement?'Take the placement check again':'Take the placement check'}</Link>
     {!!questions&&<p className="mt-2 text-center text-sm text-ink-soft">{questions} questions · about {minutes} min</p>}
     {placeScore!==undefined&&<p className="mt-3 rounded-lg bg-sky px-3 py-2 text-sm">Last check: <strong>{placeScore} of {formItems(placeForm!).length}</strong>. <Link className="font-semibold underline underline-offset-4" href={`/mock/result?a=${placement!.id}`}>See what to fix</Link></p>}
     <h2 className="mt-6 text-sm font-semibold text-ink-soft">In your first year</h2>
     <ul className="mt-2 flex flex-wrap gap-1.5">{p.firstYear.map(f=><li key={f} className="rounded-md bg-sky px-2.5 py-1 text-[13px] font-semibold">{f}</li>)}</ul>
    </div>
   </Sheet>

   <div className="grid min-w-0 gap-5">
    <SubjectList p={p}/>

    <Section title="Foundations from high school" meta={<p className="text-sm font-semibold text-ink-soft">{next?`${solid} of ${steps.length} solid`:'All solid'}</p>}>
     <p className="mt-1 text-sm text-ink-soft">What these subjects take for granted on the first day. Each opens its reviewer topic.</p>
     <ol className="mt-5">{steps.map((c,i)=>{const k=CONCEPT_BY_ID[c],st=statusIn(rank,c),isNext=c===next,done=st==='solid',seen=st!=='not started';
      const node=<span aria-hidden="true" className={cx('relative z-[1] grid h-12 w-12 shrink-0 place-items-center rounded-xl',done?'bg-green text-navy':isNext?'bg-navy text-white ring-4 ring-mint':seen?'border-[3px] border-green bg-white text-navy':'border-2 border-line-strong bg-white text-ink-soft')}>{done?<Check/>:<SubjectMark subject={k.subtest}/>}</span>;
      return <Step key={c} node={node} last={i===steps.length-1} lit={done}>
       {isNext?<div className="rounded-xl border-2 border-green bg-mint p-4">
         <p className="text-sm font-semibold text-ink-soft">{seen?'Keep going':'Up next'}</p>
         <p className="mt-0.5 text-lg font-bold leading-snug">{k.title}</p>
         <p className="mt-1 text-sm text-ink-soft">{k.blurb}</p>
         <Link className={cx(btn.dark,'mt-3')} href={`/learn/${c}`}>Start<span className="sr-only"> {k.title}</span></Link>
        </div>
       :<Link href={`/learn/${c}`} className="flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 font-semibold hover:bg-sky focus-visible:outline-3 focus-visible:outline-navy">
         <span>{k.title}</span><span className="shrink-0 text-sm font-normal text-ink-soft">{done?'Solid':seen?'Keep practising':<span className="sr-only">Not started</span>}</span>
        </Link>}
      </Step>;})}</ol>
    </Section>

    <Sheet as="div">
     <details className="group">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
       <span><span className="block text-xl font-extrabold sm:text-2xl">Eight-week pace</span><span className="text-sm text-ink-soft">Senior high review on Khan Academy, about four sessions a week before classes start</span></span>
       <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </summary>
      <ol className="mt-5 grid gap-2 sm:grid-cols-2">{weeks.map(w=><li key={w.week} className="rounded-xl bg-sky p-3">
       <p className="flex min-h-7 flex-wrap items-center justify-between gap-2 text-sm font-bold">Week {w.week}{w.check&&<Pill tone="green">Placement check</Pill>}</p>
       <p className="mt-1 text-[13px] text-ink-soft">{w.khan.length?w.khan.map(khanLabel).join(' · '):w.check?'Then revisit what is still hard':'Review your hardest topics'}</p>
      </li>)}</ol>
     </details>
    </Sheet>

    <Rescue only={p.rescue}/>
   </div>
  </div>
 </div>;
}

/** Ticks on Khan Academy units are the learner's own notes, never learning evidence. */
function useKhanTicks(){
 const {state,update}=useProgram();
 const done=(k:string)=>!!state.concepts[`khan_${k}`]?.khanDone;
 const toggle=(k:string)=>update(s=>{const key=`khan_${k}`,prev=s.concepts[key]??{checks:[]};return {...s,concepts:{...s.concepts,[key]:{...prev,khanDone:prev.khanDone?undefined:Date.now()}}};});
 return {done,toggle};
}

/** A field's college subjects, filterable by kind. Each card opens the subject's own page. */
function SubjectList({p}:{p:BridgeProgram}){
 const {done}=useKhanTicks(),[kind,setKind]=useState<SubjectKind|'all'>('all');
 const list=subjectsOf(p),kinds=[...new Set(list.map(s=>s.kind))],shown=kind==='all'?list:list.filter(s=>s.kind===kind);
 return <Section title="Subjects" meta={<p className="text-sm font-semibold text-ink-soft">{list.length} college subjects</p>}>
  <p className="mt-1 text-sm text-ink-soft">What this field takes in its first two years. Each subject opens to its topics, Khan Academy videos and units.</p>
  <div role="group" aria-label="Show subjects" className="mt-4 flex flex-wrap gap-2">{(['all',...kinds] as const).map(k=><button key={k} type="button" aria-pressed={kind===k} onClick={()=>setKind(k)} className={cx('inline-flex min-h-11 items-center rounded-lg px-4 text-[15px] font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy',kind===k?'bg-navy text-white':'bg-sky text-navy hover:bg-mint')}>{k==='all'?'All':KIND_LABEL[k]}</button>)}</div>
  <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">{shown.map(s=>{const n=s.units.filter(done).length;
   return <li key={s.id}><Link href={`/bridge/${p.id}/${s.id}`} className="flex h-full gap-4 rounded-xl border-2 border-line p-4 hover:border-line-strong hover:bg-sky focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-mint"><KindMark kind={s.kind}/></span>
    <span className="min-w-0 flex-1">
     <span className="block font-bold leading-snug">{s.title}</span>
     <span className="mt-0.5 block text-[13px] text-ink-soft">{KIND_LABEL[s.kind]} · {s.level}</span>
     <span className="mt-2 block text-sm leading-relaxed text-ink-soft">{s.summary}</span>
     <span className="mt-2 block text-[13px] font-semibold">{s.topics.length} topics · {s.videos.length} {s.videos.length===1?'video':'videos'} · {n?`${n} of ${s.units.length} units ticked`:`${s.units.length} Khan units`}</span>
    </span>
   </Link></li>;})}</ul>
 </Section>;
}

export function BridgeSubjectPage({program,subject}:{program:string;subject:string}){
 const {state}=useProgram(),fix=useFix(),{done,toggle}=useKhanTicks(),[playing,setPlaying]=useState<string>();
 const p=PROGRAM_BY_ID[program],s=SUBJECT_BY_ID[subject];if(!p||!s)return null;
 const rank:Rank=new Map(focusRanking(state).map(r=>[r.concept.id,r]));
 const siblings=subjectsOf(p),at=siblings.findIndex(x=>x.id===s.id),prev=siblings[at-1],next=siblings[at+1];
 const ticked=s.units.filter(done).length,builds=s.buildsOn.filter(c=>CONCEPT_BY_ID[c]),withVideo=s.topics.filter(t=>subjectTopicVideo(s.id,t)).length;
 return <div className="mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-8 lg:pb-20 lg:pt-7">
  <Link href={`/bridge/${p.id}`} className={cx(btn.quiet,'-ml-3 no-underline')}><span aria-hidden="true">←</span> {p.title}</Link>
  <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-7">
   <div className="grid min-w-0 gap-5">
    <Sheet as="div">
     <p className="flex items-center gap-2.5 text-sm font-semibold text-ink-soft"><span className="grid h-9 w-9 place-items-center rounded-lg bg-mint text-navy"><KindMark kind={s.kind} className="h-5 w-5"/></span>{KIND_LABEL[s.kind]} · {s.level}</p>
     <h1 className="mt-3 text-[1.6rem] font-extrabold leading-tight tracking-[-.02em] sm:text-[1.9rem]">{s.title}</h1>
     <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-ink-soft">{s.summary}</p>
    </Sheet>

    <Section title="What you’ll learn" meta={<p className="text-sm font-semibold text-ink-soft">{s.topics.length} topics · {withVideo} {withVideo===1?'video':'videos'}</p>}>
     {withVideo>0&&<p className="mt-1 text-sm text-ink-soft">Each topic with a matching Khan Academy video has a Video button. It opens here, paused, one topic at a time.</p>}
     <ol className="mt-4 grid gap-2 sm:grid-cols-2">{s.topics.map((t,i)=>{const v=subjectTopicVideo(s.id,t),open=!!v&&playing===t,panel=`topic-video-${i+1}`;
      return <li key={t} className={cx('flex flex-wrap items-center gap-3 rounded-xl bg-sky p-3',open&&'sm:col-span-2')}><span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white text-sm font-bold">{i+1}</span><span className="min-w-0 flex-1 font-semibold leading-snug">{t}{!v&&<span className="block text-[13px] font-normal text-ink-soft">No matching Khan video</span>}</span>
       {v&&<VideoToggle open={open} onClick={()=>setPlaying(open?undefined:t)} topic={t} controls={panel}/>}
       {open&&v&&<VideoPanel id={panel} video={v} className="mt-1"/>}</li>;})}</ol>
     {s.gap&&<p className="mt-4 text-sm leading-relaxed text-ink-soft">{s.gap}</p>}
    </Section>

    <Section title="Watch first">
     <p className="mt-1 text-sm text-ink-soft">{s.videos.length===1?'A Khan Academy video that opens this subject.':'Khan Academy videos that open this subject.'} Watching is your own study and is not recorded as a result.</p>
     <div className="mt-4 grid gap-4">{s.videos.map(v=><div key={v.id} className="[&_.khan-player]:my-0"><KhanPlayer id={v.id} title={v.title} source={v.url}/></div>)}</div>
    </Section>

    <Section title="Khan Academy units" meta={<p role="status" className="text-sm font-semibold text-ink-soft">{ticked} of {s.units.length} ticked</p>}>
     <p className="mt-1 text-sm text-ink-soft">Work through these on Khan Academy and tick the ones you finish. Ticks are your own notes, not Khanpanion results.</p>
     <ol className="mt-5">{s.units.map((k,i)=>{const u=COLLEGE_UNITS[k],isDone=done(k),whole=u.unit==='Course',label=whole?u.course:`${u.course}: ${u.unit}`;
      const node=<button type="button" aria-pressed={isDone} aria-label={`Mark ${label} as finished`} onClick={()=>toggle(k)} className={cx('relative z-[1] grid h-12 w-12 shrink-0 place-items-center rounded-xl text-[15px] font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy',isDone?'bg-green text-navy':'border-2 border-line-strong bg-white text-navy hover:border-navy')}>{isDone?<Check/>:i+1}</button>;
      return <Step key={k} node={node} last={i===s.units.length-1} lit={isDone}>
       <a href={collegeUnitUrl(k)} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 py-1.5 hover:bg-sky focus-visible:outline-3 focus-visible:outline-navy"><span className="min-w-0"><span className="block font-semibold leading-snug">{whole?u.course:u.unit}</span>{!whole&&<span className="block text-[13px] text-ink-soft">{u.course}</span>}</span><span aria-hidden="true" className="shrink-0 text-ink-soft">↗</span><span className="sr-only"> (opens Khan Academy in a new tab)</span></a>
      </Step>;})}</ol>
    </Section>
   </div>

   <div className="grid min-w-0 gap-5 lg:sticky lg:top-24">
    <Sheet as="div">
     <h2 className="text-lg font-extrabold">Builds on</h2>
     {builds.length?<>
      <p className="mt-1 text-sm text-ink-soft">High-school topics this subject takes for granted.</p>
      <ul className="mt-3 grid gap-1">{builds.map(c=>{const k=CONCEPT_BY_ID[c],st=statusIn(rank,c);return <li key={c}><Link href={`/learn/${c}`} className="flex min-h-11 items-center gap-3 rounded-lg px-2 font-semibold hover:bg-sky focus-visible:outline-3 focus-visible:outline-navy"><span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-md',st==='solid'?'bg-green':'bg-sky')}>{st==='solid'?<Check className="h-5 w-5"/>:<SubjectMark subject={k.subtest} className="h-4 w-4"/>}</span><span className="min-w-0 flex-1 leading-snug">{k.title}</span>{st==='solid'&&<span className="text-[13px] font-normal text-ink-soft">Solid</span>}</Link></li>;})}</ul>
     </>:<p className="mt-1 text-sm text-ink-soft">No particular high-school topic. You can start here.</p>}
     {s.engine&&<button className={cx(btn.dark,'mt-4 w-full')} onClick={()=>fix(s.engine!,NEXT_SKILL[s.engine!],`Before ${s.title}`)}>Find my missing skill<span className="sr-only"> for {s.title}</span></button>}
    </Sheet>
    <nav aria-label={`More in ${p.title}`} className="rounded-2xl bg-white p-5 text-navy shadow-sheet sm:p-7">
     <h2 className="text-lg font-extrabold">More in {p.title}</h2>
     <ul className="mt-2 grid gap-1">
      {prev&&<li><Link href={`/bridge/${p.id}/${prev.id}`} className="flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold hover:bg-sky"><span aria-hidden="true">←</span><span className="sr-only">Previous subject: </span>{prev.title}</Link></li>}
      {next&&<li><Link href={`/bridge/${p.id}/${next.id}`} className="flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold hover:bg-sky"><span className="sr-only">Next subject: </span>{next.title}<span aria-hidden="true">→</span></Link></li>}
      <li><Link href={`/bridge/${p.id}`} className="flex min-h-11 items-center rounded-lg px-2 font-semibold hover:bg-sky">All {siblings.length} subjects</Link></li>
     </ul>
    </nav>
   </div>
  </div>
 </div>;
}

/** The page left at a retired field's address. */
export function RetiredProgram({id}:{id:string}){
 const r=Object.hasOwn(RETIRED_PROGRAMS,id)?RETIRED_PROGRAMS[id]:undefined,to=r?.movedTo?PROGRAM_BY_ID[r.movedTo]:undefined;if(!r)return null;
 return <>
  <PageBand title={r.title} lead={to?`This field is no longer in Courses. ${to.title} took its place.`:'This field is no longer in Courses.'}/>
  <div className={pageBody}><Sheet>
   <p className="text-ink-soft">Any placement check you took for it still opens from your results.</p>
   <div className="mt-4 flex flex-wrap gap-3">{to&&<Link className={btn.primary} href={`/bridge/${to.id}`}>Open {to.title}</Link>}<Link className={btn.ghost} href="/bridge">All courses</Link></div>
  </Sheet></div>
 </>;
}
