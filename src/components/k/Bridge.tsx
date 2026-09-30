'use client';
import Link from 'next/link';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useProgram} from './ProgramProvider';
import {ProgressMoment} from './ProgressMoment';
import {PageBand,Sheet,btn,Oval,cx,pageBody,KhanLink,Pill} from './ui';
import {useFix} from './useFix';
import {PROGRAMS,PROGRAM_BY_ID,RESCUES,RESCUE_BY_ID,summerPlan} from '@/lib/program/bridge';
import {CONCEPT_BY_ID} from '@/lib/program/concepts';
import {focusRanking,statusOf} from '@/lib/program/planner';
import {khanUrl,KHAN_UNITS} from '@/lib/program/khan-units';
import {NEXT_SKILL} from '@/lib/recovery';
import {formFromKey,formItems,itemById} from '@/lib/mock/forms';

function Rescue({only}:{only?:string[]}){
 const fix=useFix(),[pick,setPick]=useState<string>('');
 const list=only?RESCUES.filter(r=>only.includes(r.id)):RESCUES,r=pick?RESCUE_BY_ID[pick]:undefined;
 return <Sheet>
  <h2 className="text-2xl font-extrabold">Work through a class topic</h2>
  <p className="mt-1 text-ink-soft">Something from class not making sense yet? Choose the topic to find the earlier ideas that can help.</p>
  <div className="mt-4 flex flex-wrap gap-2">{list.map(x=><button key={x.id} aria-pressed={pick===x.id} onClick={()=>setPick(x.id)} className="min-h-11 rounded-full border-2 border-navy/15 px-4 text-sm font-bold aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white text-navy">{x.topic}</button>)}</div>
  {r&&<div className="mt-5 rounded-2xl bg-mint p-4 sm:p-5" aria-live="polite">
   <p className="font-bold">{r.topic} assumes:</p><p className="mt-1 font-serif text-lg">{r.needs}</p>
   <div className="mt-4 grid gap-2 sm:grid-cols-2">{r.concepts.map(c=><Link key={c} href={`/learn/${c}`} className="flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 py-2 font-semibold hover:bg-sky"><Oval size={22}/>{CONCEPT_BY_ID[c].title}</Link>)}</div>
   <div className="mt-4 flex flex-wrap gap-3">{r.engine&&<button className={btn.dark} onClick={()=>fix(r.engine!,NEXT_SKILL[r.engine!],`Help with ${r.topic}`)}>Find my missing skill</button>}{r.khan.map(k=><KhanLink key={k} href={khanUrl(k)}>{KHAN_UNITS[k].course}: {KHAN_UNITS[k].unit}</KhanLink>)}</div>
  </div>}
 </Sheet>;
}

export function BridgeHub(){
 const {state,update}=useProgram(),router=useRouter();
 const choose=(id:string)=>{update(s=>({...s,sides:{...s.sides,bridge:true},activeSide:'bridge',bridgeProgram:id}));router.push(`/bridge/${id}`);};
 return <>
  <PageBand title="Start college strong" lead="Choose your program to find the math and science to revisit before your first-year classes. You can also get help with a topic you met in class today."/>
  <div className={pageBody}>
   <Sheet><h2 className="text-2xl font-extrabold">What will you study?</h2><p className="mt-1 text-ink-soft">Pick the closest match. You can change it any time.</p>
    <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{PROGRAMS.map(p=><li key={p.id}><button onClick={()=>choose(p.id)} className={cx('flex h-full w-full flex-col gap-2 rounded-2xl border-2 p-4 text-left  hover:border-navy/40 hover:bg-mint text-navy',state.bridgeProgram===p.id?'border-navy bg-mint':'border-navy/10')}><span className="flex items-center gap-2 text-lg font-bold"><Oval filled={state.bridgeProgram===p.id} size={24}/>{p.title}</span><span className="text-sm text-ink-soft">{p.examples}</span></button></li>)}</ul>
   </Sheet>
   <div className="mt-5"><Rescue/></div>

  </div>
 </>;
}

export function BridgeProgramPage({id}:{id:string}){
 const {state,update,today}=useProgram();
 const p=PROGRAM_BY_ID[id];if(!p)return null;
 const rank=new Map(focusRanking(state).map(r=>[r.concept.id,r]));
 const placement=state.attempts.filter(a=>a.submittedAt&&a.formKey.startsWith(`placement~${id}|`)).sort((a,b)=>b.submittedAt!-a.submittedAt!)[0];
 const placeForm=placement?formFromKey(placement.formKey):undefined;
 const placeScore=placement&&placeForm?formItems(placeForm).filter(x=>placement.answers[x]===itemById(x)?.answerIndex).length:undefined;
 const khanDone=(k:string)=>!!state.concepts[`khan_${k}`]?.khanDone;
 const toggleKhan=(k:string)=>update(s=>{const key=`khan_${k}`,prev=s.concepts[key]??{checks:[]};return {...s,concepts:{...s.concepts,[key]:{...prev,khanDone:prev.khanDone?undefined:Date.now()}}};});
 const weeks=summerPlan(p),seed=today.replace(/-/g,'');
 return <>
  <PageBand title={p.title} lead={`${p.examples}. First-year courses usually include ${p.firstYear.join(', ').toLowerCase()}.`}>
   <div className="mt-6 flex flex-wrap gap-3"><Link className={btn.primary} href={`/mock/take?f=placement~${id}|${seed}&mode=practice`}>{placement?'Take the placement check again':'Take the placement check'}</Link><Link className={btn.onDark} href="/bridge">Change program</Link></div>
   {placeScore!==undefined&&<p className="mt-3 text-white/80">Last placement check: {placeScore} of {formItems(placeForm!).length}. <Link className="underline underline-offset-4" href={`/mock/result?a=${placement!.id}`}>See what to fix</Link></p>}
  </PageBand>
  <div className={pageBody}>
   <Sheet><h2 className="text-2xl font-extrabold">What your first year assumes</h2><p className="mt-1 text-ink-soft">Status comes from your placement check and topic checks. Tap a line to learn it.</p>
    <ul className="mt-4 divide-y divide-mint-line">{p.assumes.map(a=>{const rows=a.concepts.map(c=>rank.get(c)).filter(Boolean);const solid=rows.length>0&&rows.every(r=>statusOf(r!)==='solid'),seen=rows.some(r=>r!.seen);
     return <li key={a.text} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center"><div className="flex gap-3"><Oval filled={solid} size={28} className="mt-0.5"/><div><p className="font-semibold">{a.text}</p><p className="text-sm text-ink-soft">{solid?'Solid':seen?'Keep practising':'Not checked yet'}</p></div></div><div className="flex flex-wrap gap-2 pl-10 sm:pl-0">{a.concepts.map(c=><Link key={c} className={btn.ghost} href={`/learn/${c}`}>{CONCEPT_BY_ID[c].title}</Link>)}</div></li>;})}</ul>
   </Sheet>
   <div className="mt-5 grid gap-5 lg:grid-cols-2">
    <Sheet><h2 className="text-2xl font-extrabold">Your Khan Academy path</h2><ProgressMoment key={p.khanPath.filter(k=>khanDone(k)).length} animateOnMount={p.khanPath.some(k=>khanDone(k))}>{p.khanPath.filter(k=>khanDone(k)).length} of {p.khanPath.length} units marked finished by you</ProgressMoment><p className="mt-1 text-ink-soft">In order. Tick a unit when you finish it on Khan Academy; that tick is your own note and stays separate from your Khanpanion scores.</p>
     <ol className="mt-4 grid gap-2">{p.khanPath.map((k,i)=><li key={k} className="flex items-start gap-3"><button aria-pressed={khanDone(k)} aria-label={`Mark ${KHAN_UNITS[k].unit} as finished`} onClick={()=>toggleKhan(k)} className="grid min-h-11 min-w-11 place-items-center text-navy"><Oval filled={khanDone(k)} label={String(i+1)} size={34}/></button><div className="pt-1"><KhanLink href={khanUrl(k)}>{KHAN_UNITS[k].course}: {KHAN_UNITS[k].unit}</KhanLink><p className="-mt-2 text-sm text-ink-soft">{KHAN_UNITS[k].covers}</p></div></li>)}</ol>
    </Sheet>
    <Sheet><h2 className="text-2xl font-extrabold">An eight-week summer bridge</h2><p className="mt-1 text-ink-soft">A steady pace before classes start: about four sessions a week.</p>
     <ol className="mt-4 grid gap-3">{weeks.map(w=><li key={w.week} className="rounded-2xl bg-sky p-3"><p className="font-bold">Week {w.week}</p><p className="text-[15px]">{w.focus}</p>{!!w.khan.length&&<p className="mt-1 text-sm text-ink-soft">{w.khan.map(k=>`${KHAN_UNITS[k].course}: ${KHAN_UNITS[k].unit}`).join('; ')}</p>}{w.check&&<Pill tone="green">Placement check</Pill>}</li>)}</ol>
    </Sheet>
   </div>
   <div className="mt-5"><Rescue only={p.rescue}/></div>
  </div>
 </>;
}
