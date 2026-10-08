'use client';
import {Headline} from './Headline';
import Link from 'next/link';

import {useProgram} from './ProgramProvider';
import {TldrCard} from './TldrCard';
import {PageBand,Sheet,btn,KhanLink,pageBody,cx,Pill} from './ui';
import {useFix} from './useFix';
import {CONCEPT_BY_ID} from '@/lib/program/concepts';
import {CHAPTER_IDS,CHAPTER_BY_ID} from '@/content/reviewer';
import {khanUrl,KHAN_UNITS} from '@/lib/program/khan-units';
import {SUBTEST_LABEL} from '@/lib/mock/types';
import {TOPICS,NEXT_SKILL} from '@/lib/recovery';
import {TOPIC_CHECK} from '@/lib/mock/blueprint';
import {Rich} from '@/components/math/Math';
import {conceptLessons,LESSON_BY_ID} from '@/lib/program/topic-lessons';
import {LessonSequence} from './TopicLesson';
import {useLessonSelection} from './useLessonSelection';

export function LearnConcept({id}:{id:string}){
 const {state,today}=useProgram(),fix=useFix();
 const selected=useLessonSelection(),requested=Object.hasOwn(LESSON_BY_ID,selected)?LESSON_BY_ID[selected]:undefined;
 const c=CONCEPT_BY_ID[id];if(!c)return null;
 const lessons=conceptLessons(c.id,requested?.concepts.includes(c.id)?requested.exam:undefined);
 const lesson=lessons.find(l=>l.id===selected)??lessons[0];
 const related=lesson?.concepts.filter(concept=>concept!==id)??[];
 const checks=state.concepts[id]?.checks??[],last=checks[checks.length-1];
 const chapter=CHAPTER_IDS.has(c.chapter)?CHAPTER_BY_ID[c.chapter]:undefined;
 const seed=`${today.replace(/-/g,'')}${checks.length}`;
 return <>
  <PageBand title={c.title} lead={<Rich>{c.blurb}</Rich>}><div className="mt-4 flex flex-wrap gap-2"><Pill tone="green">{SUBTEST_LABEL[c.subtest]}</Pill><Pill tone="sky">{c.area}</Pill>{last&&<Pill tone="mint">Last check: {last.correct} of {last.total}</Pill>}</div></PageBand>
  <div className={pageBody}>
   <LessonSequence lessons={lessons}/>
   <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
    <Sheet id="practice">
     <h2 className="text-xl font-extrabold"><Headline>Check Yourself on This Topic</Headline></h2>
     <p className="mt-1 text-ink-soft">{TOPIC_CHECK.items} exam-level questions from this topic only, new every time. Timer optional. You can see each explanation right after you answer.</p>
     <div className="mt-4 flex flex-wrap gap-2"><Link className={btn.primary} href={`/mock/take?f=topic~${c.id}|${seed}&mode=practice`}><Headline>Start a topic check</Headline></Link><Link className={btn.ghost} href={`/mock/take?f=topic~${c.id}|${seed}&mode=exam`}><Headline>Exam style (answers at the end)</Headline></Link></div>
     {related.length>0&&<div className="mt-4"><p className="text-sm font-semibold">This lesson also connects to:</p><div className="mt-2 flex flex-wrap gap-2">{related.map(concept=><Link key={concept} href={`/learn/${concept}?lesson=${lesson.id}#practice`} className={btn.quiet}><Headline>{CONCEPT_BY_ID[concept].title}</Headline></Link>)}</div></div>}
     {chapter&&<div className="mt-6 rounded-2xl bg-mint p-4"><p className="font-bold">Full reviewer chapter</p><p className="text-[15px] text-ink-soft">Summary, worked examples at three levels, traps, a practice set and recall cards.</p><Link className={cx(btn.text,'mt-1')} href={`/reviewer/${chapter.id}`}><Headline>Read “{chapter.title}”</Headline></Link></div>}
    </Sheet>
    <Sheet>
     <h2 className="text-xl font-extrabold"><Headline>More Learning Resources</Headline></h2>
     {c.khan.length?<><p className="mt-1 text-ink-soft">Khan Academy units that teach this, from its Philippine curriculum courses. Optional, and free.</p><ul className="mt-3 grid gap-1">{c.khan.map(k=><li key={k}><KhanLink href={khanUrl(k)}>{KHAN_UNITS[k].course}: {KHAN_UNITS[k].unit}</KhanLink><p className="-mt-2 mb-2 text-sm text-ink-soft">Covers {KHAN_UNITS[k].covers}.</p></li>)}</ul></>
      :<p className="mt-1 text-ink-soft">Khan Academy has no Philippine course that matches this topic, so the focused lessons and reviewer teach it here.</p>}
     {c.engine&&<div className="mt-4 border-t border-mint-line pt-4"><p className="font-bold">If this felt hard, start here</p><p className="text-[15px] text-ink-soft">A short diagnosis finds the skill underneath and walks you back up to {TOPICS[c.engine].label.toLowerCase()}.</p><button className={cx(btn.dark,'mt-3')} onClick={()=>fix(c.engine!,NEXT_SKILL[c.engine!],`Starting point for ${c.title}`)}><Headline>Find my missing skill</Headline></button></div>}
    </Sheet>
   </div>
   <details className="mt-5"><summary className="min-h-11 cursor-pointer rounded-lg bg-mint px-4 py-3 font-bold">Quick Reference</summary><TldrCard title="Key Reminders" tldr={c.tldr}/></details>
   {!!c.after?.length&&<Sheet className="mt-5"><h2 className="text-lg font-extrabold"><Headline>Builds on</Headline></h2><div className="mt-3 flex flex-wrap gap-2">{c.after.map(a=><Link key={a} href={`/learn/${a}`} className={btn.ghost}><Headline>{CONCEPT_BY_ID[a].title}</Headline></Link>)}</div></Sheet>}
  </div>
 </>;
}
