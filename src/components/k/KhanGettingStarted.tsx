'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {useId,useState} from 'react';
import {Headline} from './Headline';
import {Sheet,btn,cx} from './ui';
import {CONCEPTS,CONCEPT_BY_ID} from '@/lib/program/concepts';
import {recommendedKhanLesson} from '@/lib/program/khan-integration';
import {lessonHref} from '@/lib/program/topic-lessons';
import type {ExamId} from '@/lib/program/admissions';

const VideoPanel=dynamic(()=>import('./TopicVideo').then(m=>m.VideoPanel));
const categories=[...new Set(CONCEPTS.map(c=>c.subtest))];
const subject={math:'Math',science:'Science',language:'Language',reading:'Reading'};

/** Start from the learner's preference. Merely showing or choosing a video writes no evidence. */
export function KhanGettingStarted({concept,exam,reason}:{concept?:string;exam?:ExamId;reason?:string}){
 const [choice,setChoice]=useState<string>(),id=useId(),selected=choice??concept??'';
 const topic=CONCEPT_BY_ID[selected],lesson=topic?recommendedKhanLesson(selected,exam):undefined,video=lesson?.videos[0];
 return <Sheet aria-labelledby={id+'-heading'} data-khan-getting-started className="p-5 sm:p-6">
  <div className="grid min-w-0 gap-5 lg:grid-cols-[.8fr_1.2fr] lg:gap-8">
   <div className="min-w-0">
    <p className="text-xs font-bold text-ink-soft">Learn with Khan Academy</p>
    <h2 id={id+'-heading'} className="mt-2 text-2xl font-extrabold leading-tight tracking-tight"><Headline>Let’s get you started</Headline></h2>
    <p className="mt-3 text-sm leading-relaxed text-ink-soft">{choice===undefined&&reason?reason:'Choose what you’d like to learn. We’ll suggest a Khan Academy video for that topic.'}</p>
    <label htmlFor={id+'-topic'} className="mt-5 block text-sm font-semibold">{concept?'Your starting topic':'What would you like to learn?'}</label>
    <select id={id+'-topic'} value={selected} onChange={e=>setChoice(e.target.value)} className="mt-2 min-h-12 w-full min-w-0 rounded-xl border-2 border-navy/15 bg-white px-3 text-base text-navy focus:border-navy focus:outline-none">
     <option value="">Choose a topic</option>
     {categories.map(category=><optgroup key={category} label={subject[category]}>{CONCEPTS.filter(c=>c.subtest===category).map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</optgroup>)}
    </select>
    {video&&lesson?<div className="mt-5" data-khan-recommendation={lesson.id}>
     <Link href={lessonHref(lesson.id)} className={btn.primary}><Headline>Open the full lesson</Headline></Link>
    </div>:topic?<div className="mt-5 rounded-xl bg-mint p-4" role="status">
     <p className="text-sm leading-relaxed">No matching Khan Academy video has been verified for this topic. Start with Khanpanion’s written explanation.</p>
     <Link href={'/learn/'+topic.id} className={cx(btn.ghost,'mt-3')}><Headline>Read this topic</Headline></Link>
    </div>:<p className="mt-5 rounded-xl bg-mint p-4 text-sm leading-relaxed">Pick a topic above to find your first video. You can change it any time.</p>}
   </div>
   {video?<div className="min-w-0 self-start rounded-xl bg-sky p-3 sm:p-4"><VideoPanel key={video.id} video={video} id={id+'-video'}/></div>:<div className="hidden items-center justify-center rounded-xl bg-mint p-8 lg:flex"><img src="/khan-academy.svg" alt="Khan Academy" width="220" height="48" className="h-auto w-full max-w-56"/></div>}
  </div>
 </Sheet>;
}
