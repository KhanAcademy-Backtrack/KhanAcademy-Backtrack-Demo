'use client';
import {Headline,headlineText} from './Headline';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {Rich} from '@/components/math/Math';
import {PageBand,Sheet,btn,pageBody,cx} from './ui';
import {VideoPanel} from './TopicVideo';
import {useProgram} from './ProgramProvider';
import {CONCEPT_BY_ID} from '@/lib/program/concepts';
import {SUBJECT_BY_ID} from '@/lib/program/college-courses';
import {PROGRAMS,PROGRAM_BY_ID} from '@/lib/program/bridge';
import {EXAMS} from '@/lib/program/admissions';
import {lessonHref,lessonSiblings,type TopicLesson} from '@/lib/program/topic-lessons';

/** Visible, paused resources and optional exposed self-explanation. No result, streak,
 * exposure-ledger entry or mastery credit is created by reading or revealing this material. */
export function LessonMaterial({lesson}:{lesson:TopicLesson}){
 const [revealed,setRevealed]=useState(false),g=lesson.guide;
 return <div className="grid min-w-0 gap-5" data-lesson-material={lesson.id}>
  {lesson.videos.length>0?<div className="grid gap-5">{lesson.videos.map((v,i)=><section key={v.id} aria-label={v.title}>
   <h3 className="mb-2 text-lg font-bold"><Headline>{lesson.videos.length>1?i+1+'. ':''}{v.title}</Headline></h3>
   <VideoPanel video={v} id={lesson.id+'-video-'+i}/>
  </section>)}</div>:<p className="rounded-lg bg-mint px-4 py-3 text-sm text-ink-soft">No matching Khan Academy video has been verified for this topic.</p>}
  {g?<section aria-label="Focused Explanation" className="grid gap-4">
   <div><h3 className="text-lg font-extrabold"><Headline>The Idea</Headline></h3><p className="mt-2 max-w-3xl leading-relaxed"><Rich>{g.idea}</Rich></p></div>
   <div className="rounded-xl bg-sky p-4"><h3 className="font-bold"><Headline>Worked Example</Headline></h3><p className="mt-2 font-serif text-lg leading-relaxed"><Rich>{g.example}</Rich></p></div>
   <div className="rounded-xl bg-mint p-4"><h3 className="font-bold"><Headline>Explain It Yourself</Headline></h3><p className="mt-2 leading-relaxed"><Rich>{g.question}</Rich></p>
    <button type="button" className={cx(btn.text,'mt-2')} aria-expanded={revealed} aria-controls={lesson.id+'-answer'} onClick={()=>setRevealed(r=>!r)}><Headline>{revealed?'Hide Explanation':'Show Explanation'}</Headline></button>
    {revealed&&<p id={lesson.id+'-answer'} className="mt-2 leading-relaxed"><Rich>{g.answer}</Rich></p>}
   </div>
   <div><h3 className="font-bold"><Headline>Watch For This</Headline></h3><p className="mt-1 text-ink-soft"><Rich>{g.trap}</Rich></p></div>
  </section>:lesson.videos.length?<section aria-label="Study This Lesson" className="rounded-xl bg-mint p-4">
   <h3 className="font-bold"><Headline>Make the Idea Your Own</Headline></h3><ol className="mt-2 list-decimal space-y-2 pl-5 text-[15px]"><li>Pause at a worked example and predict the next step.</li><li>Explain why that step works in your own words.</li><li>Close your notes and try a similar example. Revisit the part you cannot yet explain.</li></ol>
  </section>:<p className="rounded-lg bg-mint p-4 font-semibold">Not written yet. You can save this topic for later.</p>}
 </div>;
}

/** A lesson selector chooses material, rather than asking for another click to open a video.
 * Only the selected topic's players mount, limiting memory/network use on phones. */
export function LessonSequence({lessons,program}:{lessons:TopicLesson[];program?:string}){
 const [selected,setSelected]=useState(lessons[0]?.id);
 const lesson=lessons.find(l=>l.id===selected)??lessons[0];if(!lesson)return null;
 return <Sheet><h2 className="text-xl font-extrabold"><Headline>Topic Lessons</Headline></h2><p className="mt-1 text-ink-soft">Choose one topic. Its learning material is ready below.</p>
  <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
   <nav aria-label="Choose a Topic Lesson"><label className="grid gap-2 text-sm font-semibold lg:hidden">Choose a Topic<select className="min-h-12 w-full rounded-lg border border-line bg-white px-3 text-base text-navy" value={lesson.id} onChange={e=>setSelected(e.target.value)}>{lessons.map((l,i)=><option key={l.id} value={l.id}>{i+1}. {headlineText(l.title)}</option>)}</select></label><ol className="hidden gap-1 lg:grid">{lessons.map((l,i)=><li key={l.id}><button type="button" aria-pressed={l.id===lesson.id} onClick={()=>setSelected(l.id)}
    className={cx('flex min-h-12 w-full gap-2 rounded-lg px-3 py-2 text-left font-semibold focus-visible:outline-3 focus-visible:outline-navy',l.id===lesson.id?'bg-mint':'hover:bg-sky')}><span className="text-ink-soft">{i+1}.</span><span><Headline>{l.title}</Headline></span></button></li>)}</ol></nav>
   <div className="min-w-0"><h2 className="mb-3 text-xl font-extrabold"><Headline>{lesson.title}</Headline></h2><LessonMaterial key={lesson.id} lesson={lesson}/><Link className={cx(btn.text,'mt-4')} href={lessonHref(lesson.id)+(program?'?program='+program:'')}><Headline>Open This Lesson <span aria-hidden="true">→</span></Headline></Link></div>
  </div>
 </Sheet>;
}

export function TopicLessonPage({lesson}:{lesson:TopicLesson}){
 const {state,update}=useProgram();
 const [program,setProgram]=useState<string>();
 useEffect(()=>{const p=new URLSearchParams(location.search).get('program');setProgram(p&&PROGRAM_BY_ID[p]?.subjects.includes(lesson.subject??'')?p:undefined);},[lesson.id,lesson.subject]);
 const siblings=lessonSiblings(lesson),index=siblings.findIndex(l=>l.id===lesson.id),previous=siblings[index-1],next=siblings[index+1];
 const subjectProgram=program??PROGRAMS.find(p=>p.subjects.includes(lesson.subject??''))?.id;
 const parent=lesson.exam?'/reviewer?exam='+lesson.exam:subjectProgram?'/bridge/'+subjectProgram+'/'+lesson.subject:'/bridge';
 const href=(id:string)=>lessonHref(id)+(program?'?program='+program:'');
 const context=lesson.exam?EXAMS[lesson.exam].name+' · '+lesson.group:lesson.section;
 const saved=!!lesson.saveKey&&state.bookmarks.includes(lesson.saveKey);
 const subject=lesson.subject?SUBJECT_BY_ID[lesson.subject]:undefined;
 return <><PageBand title={lesson.title} lead={context}/>
  <div className={pageBody}><div className="mb-4 flex flex-wrap items-center justify-between gap-2">
   <Link href={parent} className={btn.quiet}><Headline>← {lesson.exam?'Back to the Reviewer':'Back to '+lesson.section}</Headline></Link>
   {lesson.saveKey&&<button type="button" className={btn.chip} aria-pressed={saved} onClick={()=>update(s=>({...s,bookmarks:s.bookmarks.includes(lesson.saveKey!)?s.bookmarks.filter(k=>k!==lesson.saveKey):[...s.bookmarks,lesson.saveKey!]}))}><Headline>{saved?'Saved':'Save Lesson'}</Headline></button>}
  </div>
   <Sheet><LessonMaterial key={lesson.id} lesson={lesson}/></Sheet>
   {(lesson.concepts.length>0||subject?.buildsOn.length)&&<Sheet className="mt-5"><h2 className="text-lg font-extrabold"><Headline>{subject?'Useful Foundations':'Continue With Practice'}</Headline></h2>
    {lesson.concepts.length>0&&<p className="mt-1 text-sm text-ink-soft">These broader topic checks include this idea and related skills.</p>}
    <div className="mt-3 flex flex-wrap gap-2">{(subject?.buildsOn??lesson.concepts).map(c=>CONCEPT_BY_ID[c]&&<Link key={c} href={'/learn/'+c+'#practice'} className={btn.ghost}><Headline>{CONCEPT_BY_ID[c].title}</Headline></Link>)}</div>
   </Sheet>}
   <nav aria-label="Lesson Navigation" className="mt-5 flex flex-wrap justify-between gap-3">{previous?<Link href={href(previous.id)} className={btn.ghost}><Headline>← {previous.title}</Headline></Link>:<span/>}{next&&<Link href={href(next.id)} className={btn.primary}><Headline>{next.title} →</Headline></Link>}</nav>
  </div></>;
}
