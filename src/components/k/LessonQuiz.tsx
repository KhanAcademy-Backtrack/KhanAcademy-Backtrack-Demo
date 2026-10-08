'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Rich} from '@/components/math/Math';
import type {LessonQuiz as Quiz} from '@/content/lesson-quizzes';
import {verifiedLessonSegment} from '@/content/lesson-quizzes';
import type {TopicLesson} from '@/lib/program/topic-lessons';
import {activeLessonCheck,beginLessonCheck,chooseLessonAnswer,checkLessonAnswer,recordLessonPrediction,openLessonPractice,reportLessonPractice} from '@/lib/program/lesson-checks';
import {CONCEPT_BY_ID} from '@/lib/program/concepts';
import {NEXT_SKILL} from '@/lib/recovery';
import {clipTime} from '@/lib/video-clips';
import {speakText} from '@/lib/notation';
import {Headline} from './Headline';
import {Question} from './Question';
import {useProgram} from './ProgramProvider';
import {useFix} from './useFix';
import {btn,cx} from './ui';

/** A prediction is reflection. Before the video it exposes no key or rationale. */
export function LessonPrediction({quiz}:{quiz:Quiz}){
 const {state,update}=useProgram(),c=activeLessonCheck(state,quiz),item=quiz.prediction;
 if(!item||c?.checked.some(Boolean))return null;
 const value=c?.predictionBefore??null;
 const choose=(answer:number|'idk'|null)=>update(s=>recordLessonPrediction(beginLessonCheck(s,quiz,Date.now()),quiz,answer,false,Date.now()));
 return <section aria-label="Predict First" className="rounded-lg bg-sky p-4">
  <h3 className="font-bold"><Headline>Predict First</Headline></h3>
  <p className="mt-1 mb-3 text-sm text-ink-soft"><Rich>Optional: make a prediction before watching. You can reconsider it after the lesson check.</Rich></p>
  <Question item={item} chosen={typeof value==='number'?value:null} idk={value==='idk'} onChoose={choose} onIdk={()=>choose(value==='idk'?null:'idk')} mode="exam"/>
 </section>;
}

export function LessonQuiz({lesson,quiz,onRewatch,workedExampleId,nextHref,onNext}:{lesson:TopicLesson;quiz:Quiz;onRewatch?:()=>void;workedExampleId?:string;nextHref?:string;onNext?:()=>void}){
 const {state,update}=useProgram(),fix=useFix(),c=activeLessonCheck(state,quiz);
 const [started,setStarted]=useState(!!c?.checked.some(Boolean)||!!c?.answers.some(a=>a!==null)),[index,setIndex]=useState(()=>Math.max(0,c?.checked.findIndex(x=>!x)??0)),[review,setReview]=useState(false),[finishShown,setFinishShown]=useState(c?.completedAt!==undefined),[predictionRevealed,setPredictionRevealed]=useState(false);
 const done=c?.completedAt!==undefined,finished=done&&finishShown&&!review,item=quiz.items[index],value=c?.answers[index]??null;
 const chosen=typeof value==='number'?value:null,revealed=c?.checked[index]??false;
 const clip=verifiedLessonSegment(quiz),engine=CONCEPT_BY_ID[item.concept]?.engine;
 const write=(answer:number|'idk'|null)=>update(s=>chooseLessonAnswer(s,quiz,index,answer,Date.now()));
 const nextAction=()=>{if(index===3){setReview(false);setFinishShown(true);}else setIndex(i=>i+1);};
 const next=<button type="button" className={btn.primary} onClick={nextAction}><Headline>{index===3?'Finish Lesson Check':'Next Question'}</Headline></button>;
 return <section aria-label="Check Your Understanding" data-lesson-quiz={lesson.id} className="grid gap-4 rounded-lg border border-line p-4 sm:p-5">
  <div><h3 className="text-lg font-extrabold"><Headline>Check Your Understanding</Headline></h3><p className="mt-1 text-sm text-ink-soft"><Rich>Original lesson practice, pending subject review. These authored checks do not pass a BACKTRACK step. Repeating them is practice with the same items.</Rich></p></div>
  {!started&&!done?<div><p className="mb-3"><Rich>Four questions about the idea, its reasoning, a new application and a common trap.</Rich></p><button type="button" className={btn.primary} onClick={()=>{update(s=>beginLessonCheck(s,quiz,Date.now()));setStarted(true);}}><Headline>Start Lesson Check</Headline></button></div>
   :finished?<>
    <p role="status" className="font-bold"><Rich>{`Lesson check finished: ${quiz.items.filter((it,i)=>c?.answers[i]===it.answerIndex).length} of 4 correct.`}</Rich></p>
    <div className="flex flex-wrap gap-3"><button type="button" className={btn.quiet} onClick={()=>{setIndex(0);setReview(true);}}><Headline>Review Answers</Headline></button><button type="button" className={btn.quiet} onClick={()=>{update(s=>beginLessonCheck(s,quiz,Date.now(),true));setIndex(0);setReview(false);setFinishShown(false);setStarted(true);setPredictionRevealed(false);}}><Headline>Retake These Items</Headline></button></div>
    {quiz.prediction&&<div className="grid gap-3 rounded-lg bg-sky p-4"><h4 className="font-bold"><Headline>Revisit Your Prediction</Headline></h4>
     <p className="text-sm"><Rich>{typeof c?.predictionBefore==='number'?`Before watching, you chose: ${quiz.prediction.choices[c.predictionBefore]}`:c?.predictionBefore==='idk'?'Before watching, you chose “I don’t know yet”.':'You skipped the prediction. You can consider it now.'}</Rich></p>
     <Question key={'prediction-'+c?.runs} item={quiz.prediction} chosen={typeof c?.predictionAfter==='number'?c.predictionAfter:null} idk={c?.predictionAfter==='idk'} onChoose={a=>update(s=>recordLessonPrediction(s,quiz,a,true,Date.now()))} onIdk={()=>update(s=>recordLessonPrediction(s,quiz,c?.predictionAfter==='idk'?null:'idk',true,Date.now()))} mode="exam"/>
     <button type="button" className={btn.text} aria-expanded={predictionRevealed} onClick={()=>setPredictionRevealed(v=>!v)}><Headline>{predictionRevealed?'Hide Prediction Explanation':'Show Prediction Explanation'}</Headline></button>
     {predictionRevealed&&<p><Rich>{quiz.prediction.solutionSteps.join(' ')}</Rich></p>}
     <p className="text-sm text-ink-soft"><Rich>This is reflection on an exposed question, not a fresh check.</Rich></p>
    </div>}
    <div className="grid gap-3 border-t border-line pt-4"><h4 className="font-bold"><Headline>Optional Khan Academy Practice</Headline></h4>
     <a href={quiz.practice.url} target="_blank" rel="noopener noreferrer" className={btn.ghost} onClick={()=>update(s=>openLessonPractice(s,quiz,Date.now()))}><Headline><Rich>{quiz.practice.label}</Rich> ↗</Headline></a>
     <p className="text-sm text-ink-soft"><Rich>Khan results are not synced. Opening this page and your own report stay separate from lesson answers and BACKTRACK evidence.</Rich></p>
     {c?.practice&&<fieldset className="grid gap-2"><legend className="mb-2 font-semibold"><Headline>When You Return</Headline></legend><div className="flex flex-wrap gap-2">{([['completed','I completed the practice'],['still_difficult','Still difficult'],['access_problem','I could not open it']] as const).map(([report,label])=><button key={report} type="button" className={btn.quiet} aria-pressed={c.practice?.report===report} onClick={()=>update(s=>reportLessonPractice(s,quiz,report,Date.now()))}><Headline>{label}</Headline></button>)}</div></fieldset>}
    </div>
    {nextHref?<Link className={btn.primary} href={nextHref}><Headline>Next Lesson →</Headline></Link>:onNext?<button type="button" className={btn.primary} onClick={onNext}><Headline>Next Lesson →</Headline></button>:<p><Rich>You reached the last lesson in this topic group.</Rich></p>}
   </>:<>
    <p className="text-sm font-semibold text-ink-soft"><Rich>{`Question ${index+1} of 4`}</Rich></p>
    <Question key={item.id+'-'+c?.runs} item={item} chosen={chosen} idk={value==='idk'} onChoose={write} onIdk={()=>write(value==='idk'?null:'idk')} mode="practice" revealed={revealed} onReveal={()=>update(s=>checkLessonAnswer(s,quiz,index,Date.now()))} linksBeside rationaleFirst
     checkActions={index>0?<button type="button" className={btn.quiet} onClick={()=>setIndex(i=>i-1)}><Headline>Back</Headline></button>:undefined}
     actions={<>{index>0&&<button type="button" className={btn.quiet} onClick={()=>setIndex(i=>i-1)}><Headline>Back</Headline></button>}{next}</>}
     panel={revealed&&chosen!==item.answerIndex?<div className="grid justify-items-start gap-2 rounded-lg bg-mint p-4"><h4 className="font-bold"><Headline>Work on This</Headline></h4>
      {clip&&onRewatch&&<a href={'#'+lesson.id+'-video-'+lesson.videos.findIndex(v=>v.id===quiz.videoId)} className={btn.quiet} onClick={onRewatch} aria-label={`Rewatch verified segment: ${clipTime(clip.start)} to ${clipTime(clip.end)}, ${speakText(clip.label)}`}><Headline>Rewatch Verified Segment</Headline><span className="text-sm">{clipTime(clip.start)}–{clipTime(clip.end)} · <Rich>{clip.label}</Rich></span></a>}
      {workedExampleId&&<a href={'#'+workedExampleId} className={btn.quiet}><Headline>Read the Worked Example</Headline></a>}
      {engine&&<button type="button" className={cx(btn.quiet,'text-left')} onClick={()=>fix(engine,NEXT_SKILL[engine],`From the lesson on ${lesson.title}. This authored miss suggests a starting point; fresh checks still decide the route.`)}><Headline>Find My Missing Skill</Headline></button>}
     </div>:undefined}/>
   </>}
 </section>;
}
