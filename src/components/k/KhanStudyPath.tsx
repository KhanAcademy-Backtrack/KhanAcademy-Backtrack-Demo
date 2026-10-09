'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Headline} from './Headline';
import {Sheet,btn,cx} from './ui';
import {useProgram} from './ProgramProvider';
import {useStudy} from '@/components/study/StudyProvider';
import {KhanReturnActions} from '@/components/study/KhanReturnActions';
import {recordKhanOpen,packFromKhan,planSession,beginSession} from '@/lib/study';
import {lessonKhanPractice,isLessonReturnPath} from '@/lib/program/khan-integration';
import {lessonHref,type TopicLesson} from '@/lib/program/topic-lessons';
import {freshCheckKey} from '@/lib/program/attempts';

export function KhanRelationship(){return <p className="text-sm font-semibold text-navy"><Headline>Your Study Companion for Khan Academy</Headline></p>;}

/** A compact introduction, with an optional entrance for existing Khan learners. */
export function KhanStartCard(){return <Sheet className="p-4 sm:p-5" data-khan-start>
 <KhanRelationship/><h2 className="mt-2 text-xl font-extrabold"><Headline>Bring Your Lesson, Find Your Next Step</Headline></h2>
 <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">Start with a reviewed Khan Academy activity. Khanpanion connects it to an explanation, independent practice and your next review.</p>
 <Link href="/khan" className={cx(btn.primary,'mt-4')}><Headline>Start from a Khan Academy Activity</Headline></Link>
</Sheet>;}

/** Preserve the task when external practice opens, without replacing an active session
 * or treating the open/report as an independently checked answer. */
export function LessonKhanPractice({lesson}:{lesson:TopicLesson}){
 const entry=lessonKhanPractice(lesson),{state,update,ready}=useStudy(),program=useProgram(),router=useRouter();
 if(!entry)return null;
 const returnPath=lessonHref(lesson.id),pending=state.pendingKhan;
 const activity=pending?.returnPath===returnPath&&pending.url===entry.practice.url?pending:undefined;
 function open(){update(s=>recordKhanOpen(s,{topic:entry!.topic,skill:entry!.skill,title:entry!.practice.title,url:entry!.practice.url,returnPath,at:Date.now()}));}
 function fresh(){const concept=lesson.concepts[0];if(concept){const key=freshCheckKey({attempts:program.state.attempts},'topic',concept,program.today);router.push(`/mock/take?f=${key}&mode=practice`);}else{const pack=packFromKhan(entry!);update(s=>{const now=Date.now();return beginSession({...s,packs:[...s.packs.filter(p=>p.id!==pack.id),pack]},planSession(s,pack,5,'challenge',now),now);});router.push('/study/session');}}
 function support(){document.querySelector<HTMLElement>(`[data-lesson-material="${lesson.id}"]`)?.scrollIntoView({block:'start',behavior:'instant'});}
 return <section className="mt-5 rounded-xl border border-mint-line bg-mint p-4 sm:p-5" aria-label="Khan Academy Practice" data-khan-practice>
  <p className="text-xs font-bold text-ink-soft"><Headline>Next: Practice on Khan Academy</Headline></p>
  <h3 className="mt-1 text-lg font-extrabold"><Headline>{entry.practice.title}</Headline></h3>
  <p className="mt-2 text-sm leading-relaxed text-ink-soft">Practise {entry.title.toLowerCase()}, one part of this topic. Return to this lesson for support or a fresh Khanpanion check.</p>
  <a href={entry.practice.url} target="_blank" rel="noopener noreferrer" onClick={e=>{if(!ready)e.preventDefault();else open();}} aria-disabled={!ready} className={cx(btn.primary,'mt-3')}><Headline>Practice on Khan Academy <span aria-hidden="true">↗</span></Headline></a>
  {activity&&<div className="mt-4 border-t border-mint-line pt-4"><KhanReturnActions activity={activity} onFresh={fresh} onSupport={support}/>
   <p className="mt-3 text-xs leading-relaxed text-ink-soft">Your report records your experience. Only independently answered questions count as check results.{lesson.concepts.length?' The topic check also includes related skills.':''}</p></div>}
 </section>;
}

export function KhanPracticeResume(){const {state}=useStudy(),pending=state.pendingKhan;
 if(!pending||!isLessonReturnPath(pending.returnPath))return null;
 return <Sheet className="p-4 sm:p-5" data-khan-resume><p className="text-xs font-bold text-ink-soft"><Headline>Continue Your Khan Academy Practice</Headline></p><h2 className="mt-1 text-lg font-extrabold"><Headline>{pending.title}</Headline></h2><p className="mt-2 text-sm text-ink-soft">Your lesson is ready to return to. Share how practice went, then choose support or a fresh check.</p><Link href={pending.returnPath} className={cx(btn.primary,'mt-3')}><Headline>Return to My Lesson</Headline></Link></Sheet>;
}
