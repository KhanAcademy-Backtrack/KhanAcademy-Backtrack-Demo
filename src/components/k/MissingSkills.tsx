'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {useStudy} from '@/components/study/StudyProvider';
import {MathText,Rich} from '@/components/math/Math';
import {useProgram} from './ProgramProvider';
import {useFix} from './useFix';
import {PageBand,Sheet,btn,cx,pageBody} from './ui';
import {findGaps,CET_SCOPE,collegeScope,type Gap,type GapScope} from '@/lib/gaps';
import {LABELS,TOPICS,type Subject,type Topic} from '@/lib/recovery';
import {formItems,formMinutes,placementForm,sprintForm} from '@/lib/mock/forms';
import {SUBTEST_LABEL} from '@/lib/mock/types';
import {CONCEPTS} from '@/lib/program/concepts';
import {PROGRAM_BY_ID,RESCUE_BY_ID,PROGRAMS,type BridgeProgram} from '@/lib/program/bridge';

const SUBJECTS:[Subject,string][]=[['maths','Mathematics'],['chemistry','Chemistry'],['physics','Physics']];
const topics=Object.entries(TOPICS) as [Topic,(typeof TOPICS)[Topic]][];
const day=(at:number)=>new Date(at).toLocaleDateString(undefined,{month:'short',day:'numeric'});

export type GapView='all'|'cet'|'college';
const VIEWS:[GapView,string,string][]=[['cet','CET review','/start/cet'],['college','College prep','/start/college'],['all','Everything','/start']];
const subtestName=(s:keyof typeof SUBTEST_LABEL)=>s==='math'?'Math':s==='science'?'Science':SUBTEST_LABEL[s];
/** Where a gap shows up for this view: the CET topics it serves, or the first-year courses that assume it. */
function where(view:GapView,g:Gap,field?:BridgeProgram):string{
 if(view==='cet'){const cs=CONCEPTS.filter(c=>c.engine===g.topic);return cs.length?`On the CET: ${subtestName(cs[0].subtest)} · ${cs.slice(0,2).map(c=>c.title).join(', ')}`:g.context;}
 if(view==='college'){
  const programs=field?[field]:PROGRAMS,courses=[...new Set(programs.flatMap(p=>p.rescue.map(id=>RESCUE_BY_ID[id]).filter(r=>r?.engine===g.topic).map(r=>r!.topic)))];
  if(courses.length)return `Needed for ${courses.slice(0,2).join(', ')}${courses.length>2?` and ${courses.length-2} more`:''}`;
  const a=programs.flatMap(p=>p.assumes).find(x=>x.engine===g.topic);return a?`First-year courses assume: ${a.text.replace(/\.$/,'').toLowerCase()}`:g.context;
 }
 return g.context;
}

/** Find my missing skill: only the skills this learner's own answers point to, the
 *  deepest missing prerequisite first. CET review and college prep count different
 *  practice and keep different topics; BACKTRACK and reviewer evidence counts in both.
 *  Reading it records nothing. */
export function MissingSkills({view='all'}:{view?:GapView}){
 const {state:study,ready:studyReady}=useStudy(),{state:program,ready:programReady,today}=useProgram(),fix=useFix();
 const [now,setNow]=useState<number>();useEffect(()=>setNow(Date.now()),[]);
 const field=PROGRAM_BY_ID[program.bridgeProgram??''];
 const scope:GapScope=useMemo(()=>view==='cet'?CET_SCOPE:view==='college'?collegeScope(field):{},[view,field]);
 const map=useMemo(()=>now!==undefined&&studyReady&&programReady?findGaps(study,program.attempts,now,scope):undefined,[now,studyReady,programReady,study,program.attempts,scope]);
 const seed=`${today.replace(/-/g,'')}${program.attempts.length}`,sprint=useMemo(()=>sprintForm('x'),[]),placement=useMemo(()=>field?placementForm(field.id,'x'):undefined,[field]);
 const any=!!map&&map.ready.length+map.later.length>0;
 const lead=view==='cet'?'Skills behind the CET questions you missed and the steps BACKTRACK found, starting with the one underneath.':view==='college'?`Skills ${field?`a first year in ${field.title}`:'first-year college courses'} ${field?'assumes':'assume'}, where your answers show a gap, starting with the one underneath.`:'Only the skills your own answers point to, starting with the one underneath.';
 const listed=topics.filter(([id])=>!scope.topics||scope.topics.has(id));
 return <>
  <PageBand title="Find my missing skill" lead={`${lead} A skill leaves this list after two fresh answers on your own.`}>
   <nav aria-label="Which skills" className="mt-4"><ul className="inline-flex flex-wrap gap-1 rounded-lg bg-white p-1 shadow-sheet">{VIEWS.map(([id,name,href])=><li key={id}><Link href={href} aria-current={view===id?'page':undefined} className={cx('inline-flex min-h-10 items-center rounded-md px-3.5 text-[14px] font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy',view===id?'bg-navy text-white':'text-navy hover:bg-sky')}>{name}</Link></li>)}</ul></nav>
   {view==='college'&&!field&&<p className="mt-3 text-[15px] text-ink-soft">Showing the foundations every field assumes. <Link className="font-semibold text-navy underline decoration-green decoration-2 underline-offset-4" href="/bridge">Choose your field</Link> to narrow it.</p>}
  </PageBand>
  <div className={cx(pageBody,'grid gap-5')}>
   {!map?<Sheet><p role="status" className="text-ink-soft">Looking at your answers…</p></Sheet>:<>
    {map.ready.length>0&&<section aria-labelledby="gaps-now"><h2 id="gaps-now" className="mb-3 text-lg font-extrabold">Start here</h2>
     <ol className="grid gap-3">{map.ready.map((g,i)=><li key={g.key}><GapCard gap={g} first={i===0} context={where(view,g,field)} onFix={()=>fix(g.topic,g.skill,g.reasons[0].text)}/></li>)}</ol>
    </section>}
    {map.later.length>0&&<Sheet as="section" aria-labelledby="gaps-later"><h2 id="gaps-later" className="text-lg font-extrabold">After that</h2><p className="mt-1 text-[15px] text-ink-soft">These open up once the skill underneath is fixed.</p>
     <ul className="mt-3 divide-y divide-line">{map.later.map(g=><li key={g.key} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"><span><span className="block font-bold">{g.label}</span><span className="text-sm text-ink-soft">{where(view,g,field)}</span></span><span className="text-sm font-semibold text-ink-soft">After {g.blockedBy.map(s=>LABELS[s]).join(', ')}</span></li>)}</ul>
    </Sheet>}
    {!any&&<Sheet as="section">
     <h2 className="text-xl font-extrabold">{map.hasEvidence?'No missing skills right now':'Nothing to go on yet'}</h2>
     {view==='college'?<>
      <p className="mt-2 max-w-2xl text-ink-soft">{map.hasEvidence?'Your answers don’t point to a gap in these foundations. The placement check can look again.':field?`The placement check covers what a first year in ${field.title} assumes. Any skill that needs a repair shows up here.`:'Choose your field first. Its placement check covers what your first year assumes, and any skill that needs a repair shows up here.'}</p>
      {field&&placement?<><Link className={cx(btn.primary,'mt-4')} href={`/mock/take?f=placement~${field.id}|${seed}&mode=practice`}>Take the placement check</Link><p className="mt-2 text-sm text-ink-soft">{formItems(placement).length} questions for {field.title}.</p></>:<Link className={cx(btn.primary,'mt-4')} href="/bridge">Choose your field</Link>}
     </>:<>
      <p className="mt-2 max-w-2xl text-ink-soft">{map.hasEvidence?'Your recent answers don’t point to a gap. A short mixed set can look for new ones.':`This list fills in from your own answers. Finish a short mixed set${view==='cet'?' of CET questions':''} and any skill that needs a repair shows up here.`}</p>
      <Link className={cx(btn.primary,'mt-4')} href={`/mock/take?f=sprint~${seed}&mode=practice`}>Take a {formItems(sprint).length}-question check</Link>
      <p className="mt-2 text-sm text-ink-soft">About {formMinutes(sprint)} minutes. Math, science and language.</p>
     </>}
    </Sheet>}
    {map.fixed.length>0&&<Sheet as="section" aria-labelledby="gaps-fixed"><h2 id="gaps-fixed" className="text-lg font-extrabold">Recently fixed</h2>
     <ul className="mt-2 grid gap-1">{map.fixed.map(f=><li key={f.key} className="flex min-h-10 items-center gap-3"><span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-green text-sm font-extrabold text-navy">✓</span><span><span className="font-bold">{f.label}</span><span className="text-ink-soft"> · two fresh answers, {day(f.at)}</span></span></li>)}</ul>
    </Sheet>}
    <Sheet as="section"><details open={!any} className="group">
     <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 font-extrabold [&::-webkit-details-marker]:hidden"><span className="text-lg">{any?'Something else feels hard? Choose a topic':'Already know what’s hard? Choose a topic'}</span><span aria-hidden="true" className="text-xl group-open:rotate-45">+</span></summary>
     <p className="mt-1 text-[15px] text-ink-soft">A first check finds which earlier step needs a repair. In science, that step is sometimes a piece of mathematics.</p>
     <div className="mt-4 grid gap-5 md:grid-cols-3">{SUBJECTS.filter(([subject])=>listed.some(([,t])=>t.subject===subject)).map(([subject,heading])=><div key={subject}><h3 className="font-bold">{heading}</h3>
      <ul className="mt-2 grid gap-2">{listed.filter(([,t])=>t.subject===subject).map(([id,t])=><li key={id}><Link data-destination href={`/start/${id}`} className="flex min-h-14 flex-col gap-1 rounded-lg border-2 border-line px-4 py-3 hover:border-line-strong hover:bg-sky focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy"><span className="font-bold">{t.label}</span><MathText speak={t.speak}>{t.example}</MathText></Link></li>)}</ul>
     </div>)}</div>
    </details></Sheet>
   </>}
  </div>
 </>;
}

function GapCard({gap,first,context,onFix}:{gap:Gap;first:boolean;context:string;onFix:()=>void}){
 return <Sheet as="article" className={cx('grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start',first&&'outline-2 outline-green')}>
  <div className="min-w-0">
   <h3 className="text-xl font-extrabold">{gap.label}</h3>
   <p className="text-sm font-semibold text-ink-soft">{context}</p>
   <ul className="mt-3 grid gap-1.5" aria-label={`Why ${gap.label}`}>{gap.reasons.slice(0,3).map((r,i)=><li key={i} className="flex gap-2 text-[15px]"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy"/><span><Rich>{r.text}</Rich> <span className="text-ink-soft">· {day(r.at)}</span></span></li>)}</ul>
  </div>
  <button type="button" className={cx(first?btn.primary:btn.ghost,'sm:mt-1')} onClick={onFix}>Fix {gap.label.toLowerCase()}</button>
 </Sheet>;
}
