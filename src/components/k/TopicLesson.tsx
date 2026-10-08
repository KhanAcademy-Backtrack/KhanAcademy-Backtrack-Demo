'use client';
import {Headline,headlineText} from './Headline';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {useRouter} from 'next/navigation';
import {useEffect,useState} from 'react';
import {Rich} from '@/components/math/Math';
import {PageBand,Sheet,btn,pageBody,cx,KhanLink} from './ui';
import {VideoPanel} from './TopicVideo';
import {useProgram} from './ProgramProvider';
import {EXAMS} from '@/lib/program/admissions';
import {lessonHref,standaloneLessonHref,lessonSiblings,type TopicLesson} from '@/lib/program/topic-lessons';
import {selectLesson,useLessonSelection} from './useLessonSelection';
import {lessonQuizFor,verifiedLessonSegment,type LessonQuiz as Quiz} from '@/content/lesson-quizzes';
import {activeLessonCheck} from '@/lib/program/lesson-checks';
import {readingsFor,readingLabel} from '@/lib/program/lesson-readings';
import {clipTime} from '@/lib/video-clips';
const LessonQuiz=dynamic(()=>import('./LessonQuiz').then(m=>m.LessonQuiz));
const LessonPrediction=dynamic(()=>import('./LessonQuiz').then(m=>m.LessonPrediction));

/** Optional Khan articles. On a quiz lesson they appear once the lesson check is finished, so a
 * worked article cannot prime the quiz. Opening one writes nothing. */
function ReadNext({lesson,quiz}:{lesson:TopicLesson;quiz?:Quiz}){
 const {state}=useProgram(),readings=readingsFor(lesson.id);
 if(!readings.length||(quiz&&activeLessonCheck(state,quiz)?.completedAt===undefined))return null;
 return <section aria-label="Read Next" className="grid gap-2 rounded-lg border border-line p-4">
  <h3 className="font-bold"><Headline>Read Next</Headline></h3>
  <p className="text-sm text-ink-soft">Optional Khan Academy articles. Opening one is not tracked and does not count as practice.</p>
  <ul className="grid gap-1">{readings.map(r=><li key={r.url}><KhanLink href={r.url}>{readingLabel(r)}</KhanLink></li>)}</ul>
 </section>;
}

/** Reading or revealing material writes no evidence. Authored quizzes, when available,
 * write their separate device-local practice record only after learner interaction. */
export function LessonMaterial({lesson,nextHref,onNext}:{lesson:TopicLesson;nextHref?:string;onNext?:()=>void}){
 const [revealed,setRevealed]=useState(false),[rewatch,setRewatch]=useState(0),g=lesson.guide,quiz=lessonQuizFor(lesson.id);
 const segment=quiz&&verifiedLessonSegment(quiz),workedExampleId=g?lesson.id+'-worked-example':undefined;
 return <div className="grid min-w-0 gap-5" data-lesson-material={lesson.id}>
  {quiz&&<><LessonPrediction quiz={quiz}/><section aria-label="Watch For This" className="rounded-lg bg-mint p-4">
   <h3 className="font-bold"><Headline>Watch For This</Headline></h3><p className="mt-2"><Rich>{quiz.keyIdea}</Rich></p>
   <ol className="mt-3 grid gap-2">{quiz.watchFor.map(cue=>cue&&<li key={cue.at} className="flex gap-3"><span className="shrink-0 font-bold">{clipTime(cue.at)}</span><span><Rich>{cue.text}</Rich></span></li>)}</ol>
  </section></>}
  {lesson.videos.length>0?<div className="grid gap-5">{lesson.videos.map((v,i)=><section key={v.id} aria-label={v.title}>
   <h3 className="mb-2 text-lg font-bold"><Headline>{lesson.videos.length>1?i+1+'. ':''}{v.title}</Headline></h3>
   <VideoPanel key={v.id+(quiz?.videoId===v.id?rewatch:0)} video={v} id={lesson.id+'-video-'+i} focused={!!segment&&rewatch>0&&quiz?.videoId===v.id}/>
  </section>)}</div>:<p className="rounded-lg bg-mint px-4 py-3 text-sm text-ink-soft">No matching Khan Academy video has been verified for this topic.</p>}
  {quiz&&<LessonQuiz lesson={lesson} quiz={quiz} nextHref={nextHref} onNext={onNext} workedExampleId={workedExampleId} onRewatch={segment?()=>setRewatch(r=>r+1):undefined}/>}
  {g?<section aria-label="Focused Explanation" className="grid gap-4">
   <div><h3 className="text-lg font-extrabold"><Headline>The Idea</Headline></h3><p className="mt-2 max-w-3xl leading-relaxed"><Rich>{g.idea}</Rich></p></div>
   <div id={workedExampleId} className="scroll-mt-28 rounded-xl bg-sky p-4"><h3 className="font-bold"><Headline>Worked Example</Headline></h3><p className="mt-2 font-serif text-lg leading-relaxed"><Rich>{g.example}</Rich></p></div>
   <div className="rounded-xl bg-mint p-4"><h3 className="font-bold"><Headline>Explain It Yourself</Headline></h3><p className="mt-2 leading-relaxed"><Rich>{g.question}</Rich></p>
    <button type="button" className={cx(btn.text,'mt-2')} aria-expanded={revealed} aria-controls={lesson.id+'-answer'} onClick={()=>setRevealed(r=>!r)}><Headline>{revealed?'Hide Explanation':'Show Explanation'}</Headline></button>
    {revealed&&<p id={lesson.id+'-answer'} className="mt-2 leading-relaxed"><Rich>{g.answer}</Rich></p>}
   </div>
   <div><h3 className="font-bold"><Headline>Common Trap</Headline></h3><p className="mt-1 text-ink-soft"><Rich>{g.trap}</Rich></p></div>
  </section>:!quiz&&lesson.videos.length?<section aria-label="Study This Lesson" className="rounded-xl bg-mint p-4">
   <h3 className="font-bold"><Headline>Make the Idea Your Own</Headline></h3><ol className="mt-2 list-decimal space-y-2 pl-5 text-[15px]"><li>Pause at a worked example and predict the next step.</li><li>Explain why that step works in your own words.</li><li>Close your notes and try a similar example. Revisit the part you cannot yet explain.</li></ol>
  </section>:!quiz&&lesson.videos.length===0?<p className="rounded-lg bg-mint p-4 font-semibold">Not written yet. You can save this topic for later.</p>:null}
  <ReadNext lesson={lesson} quiz={quiz}/>
 </div>;
}

/** A lesson selector chooses material, rather than asking for another click to open a video.
 * Only the selected topic's players mount, limiting memory/network use on phones. */
export function LessonSequence({lessons}:{lessons:TopicLesson[]}){
 const selected=useLessonSelection();
 const lesson=lessons.find(l=>l.id===selected)??lessons[0];if(!lesson)return null;
 const next=lessons[lessons.findIndex(l=>l.id===lesson.id)+1];
 return <Sheet><LessonActions lesson={lesson}/>
  <div className="grid gap-5 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
   <nav aria-label="Choose a Topic Lesson"><label className="grid gap-2 text-sm font-semibold lg:hidden">Choose a Topic<select className="min-h-12 w-full rounded-lg border border-line bg-white px-3 text-base text-navy" value={lesson.id} onChange={e=>selectLesson(e.target.value)}>{lessons.map((l,i)=><option key={l.id} value={l.id}>{i+1}. {headlineText(l.title)}</option>)}</select></label><ol className="hidden gap-1 lg:grid">{lessons.map((l,i)=><li key={l.id}><button type="button" aria-pressed={l.id===lesson.id} onClick={()=>selectLesson(l.id)}
    className={cx('flex min-h-12 w-full gap-2 rounded-lg px-3 py-2 text-left font-semibold focus-visible:outline-3 focus-visible:outline-navy',l.id===lesson.id?'bg-mint':'hover:bg-sky')}><span className="text-ink-soft">{i+1}.</span><span><Headline>{l.title}</Headline></span></button></li>)}</ol></nav>
   <div className="min-w-0"><h2 className="mb-3 text-xl font-extrabold"><Headline>{lesson.title}</Headline></h2><LessonMaterial key={lesson.id} lesson={lesson} onNext={next?()=>selectLesson(next.id):undefined}/></div>
  </div>
 </Sheet>;
}

export function TopicLessonPage({lesson}:{lesson:TopicLesson}){
 const router=useRouter(),target=lessonHref(lesson.id);
 useEffect(()=>{
  if(target===standaloneLessonHref(lesson.id))return;
  const params=new URLSearchParams(window.location.search);
  const destination=lessonHref(lesson.id,params.get('program')??undefined);
  router.replace(destination+window.location.hash);
 },[lesson.id,router,target]);
 if(target!==standaloneLessonHref(lesson.id))return <div className={pageBody}><p role="status">Opening your lesson…</p><Link className={btn.text} href={target}>Continue to the lesson</Link></div>;
 return <StandaloneLessonPage lesson={lesson}/>;
}

function LessonActions({lesson}:{lesson:TopicLesson}){
 const {state,update}=useProgram(),key=lesson.saveKey;
 if(!lesson.exam&&!key)return null;
 const saved=!!key&&state.bookmarks.includes(key);
 return <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
  {lesson.exam&&<Link href={'/reviewer?exam='+lesson.exam} className={btn.quiet}><Headline>← Back to the Reviewer</Headline></Link>}
  {key&&<button type="button" className={btn.chip} aria-pressed={saved} onClick={()=>update(s=>({...s,bookmarks:s.bookmarks.includes(key)?s.bookmarks.filter(k=>k!==key):[...s.bookmarks,key]}))}><Headline>{saved?'Saved':'Save Lesson'}</Headline></button>}
 </div>;
}

function StandaloneLessonPage({lesson}:{lesson:TopicLesson}){
 const siblings=lessonSiblings(lesson),index=siblings.findIndex(l=>l.id===lesson.id),previous=siblings[index-1],next=siblings[index+1];
 const context=lesson.exam?EXAMS[lesson.exam].name+' · '+lesson.group:lesson.section;
 return <><PageBand title={lesson.title} lead={context}/>
  <div className={pageBody}><LessonActions lesson={lesson}/>
   <Sheet><LessonMaterial key={lesson.id} lesson={lesson} nextHref={next?lessonHref(next.id):undefined}/></Sheet>
   <nav aria-label="Lesson Navigation" className="mt-5 flex flex-wrap justify-between gap-3">{previous?<Link href={lessonHref(previous.id)} className={btn.ghost}><Headline>← {previous.title}</Headline></Link>:<span/>}{next&&<Link href={lessonHref(next.id)} className={lessonQuizFor(lesson.id)?btn.quiet:btn.primary}><Headline>{next.title} →</Headline></Link>}</nav>
  </div></>;
}
