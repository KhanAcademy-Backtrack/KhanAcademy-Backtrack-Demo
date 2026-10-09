'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {KHAN_ENTRIES,resolveKhanUrl,type KhanEntry as Entry} from '@/lib/khan-entry';
import {resolveKhanLessonUrl} from '@/lib/program/khan-integration';
import {lessonHref,type TopicLesson} from '@/lib/program/topic-lessons';
import {packFromKhan,beginSession,planSession} from '@/lib/study';
import {useStudy} from './StudyProvider';
import {MathText} from '@/components/math/Math';
import {Headline} from '@/components/k/Headline';

export function KhanEntry(){
 const {ready,update}=useStudy(),router=useRouter();
 const [url,setUrl]=useState(''),[selected,setSelected]=useState<Entry>(),[lesson,setLesson]=useState<TopicLesson>(),[error,setError]=useState('');
 function match(raw:string){const found=resolveKhanUrl(raw),material=found?undefined:resolveKhanLessonUrl(raw);setSelected(found);setLesson(material);setError(found||material?'':'That link is not one of the reviewed activities here yet. Choose an activity below or find its topic in the reviewer.');}
 useEffect(()=>{const raw=new URLSearchParams(location.search).get('url');if(raw){setUrl(raw.slice(0,2048));match(raw);}},[]);
 function begin(entry:Entry,learn:boolean){const pack=packFromKhan(entry);update(s=>{const now=Date.now();return beginSession({...s,packs:[...s.packs.filter(p=>p.id!==pack.id),pack]},planSession(s,pack,s.settings.minutes,learn?'learn':'review',now),now);});router.push('/study/session');}
 return <div className="study-space khan-entry-page">
  <img className="entry-khan-logo" src="/khan-academy.svg" alt="Khan Academy" width="180" height="30"/>
  <p className="eyebrow"><Headline>Start from the Activity You’re Learning</Headline></p>
  <h1><Headline>Bring Your Khan Goal with You</Headline></h1>
  <p className="khan-entry-intro">Choose an activity or paste a reviewed Khan Academy video or practice link. Keep learning with focused Khanpanion support and independent checks.</p>
  <form className="khan-url-form" onSubmit={e=>{e.preventDefault();match(url);}}><label htmlFor="khan-activity-url"><Headline>Khan Academy Lesson or Practice Link</Headline></label><div><input id="khan-activity-url" value={url} onChange={e=>{setUrl(e.target.value);setSelected(undefined);setLesson(undefined);setError('');}} maxLength={2048} placeholder="https://www.khanacademy.org/math/…" autoComplete="off"/><button className="button-secondary"><Headline>Find My Activity</Headline></button></div></form>
  {error&&<p role="alert" className="input-error">{error}</p>}
  {selected&&<section className="matched-khan-entry"><span className="eyebrow"><Headline>Activity Matched</Headline></span><h2><Headline>{selected.title}</Headline></h2><MathText>{selected.expression}</MathText><p>Learn the idea, practise on Khan Academy, then return for a fresh check.</p><div><button className="button-primary" onClick={()=>begin(selected,false)} disabled={!ready}><Headline>Build My Session <span aria-hidden="true">↗</span></Headline></button><button className="button-text" onClick={()=>begin(selected,true)} disabled={!ready}><Headline>Start with an Explanation</Headline></button></div></section>}
  {lesson&&<section className="matched-khan-entry"><span className="eyebrow"><Headline>Khan Academy Lesson Matched</Headline></span><h2><Headline>{lesson.title}</Headline></h2><p>This reviewed video is part of a focused topic lesson. Its paused player and next learning steps are ready there.</p><Link className="button-primary" href={lessonHref(lesson.id)}><Headline>Study This Khan Lesson <span aria-hidden="true">→</span></Headline></Link></section>}
  <h2 className="entry-list-title"><Headline>Guided Practice Activities</Headline></h2><p>These activities also connect to short BACKTRACK sessions. Other reviewed video links open their matching topic lessons.</p>
  <div className="khan-activity-grid">{KHAN_ENTRIES.map(entry=><article key={entry.id}><h3><Headline>{entry.title}</Headline></h3><MathText size="sm">{entry.expression}</MathText><p><a href={entry.learning.url} target="_blank" rel="noopener noreferrer"><Headline>View on Khan Academy <span aria-hidden="true">↗</span></Headline></a></p><button className="button-primary" disabled={!ready} onClick={()=>begin(entry,false)}><Headline>Study This Activity <span aria-hidden="true">↗</span></Headline></button><button className="button-text" disabled={!ready} onClick={()=>begin(entry,true)}><Headline>Learn It First</Headline></button></article>)}</div>
 </div>;
}
