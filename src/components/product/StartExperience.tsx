'use client';
import Link from 'next/link';
import { TOPICS, type Subject, type Topic } from '@/lib/recovery';
import { MathText } from '@/components/math/Math';

const GROUPS:{subject:Subject;heading:string}[]=[{subject:'maths',heading:'Mathematics'},{subject:'chemistry',heading:'Chemistry'},{subject:'physics',heading:'Physics'}];
const entries=Object.entries(TOPICS) as [Topic,(typeof TOPICS)[Topic]][];

export function StartExperience(){
  return <section className="start-page wrap">
    <p className="eyebrow">Start where you need to be</p>
    <h1>What needs to<br/><em>make sense today?</em></h1>
    <p className="start-context">Choose the lesson you’re stuck on. We’ll check which earlier step needs a repair — in science, that step is sometimes a piece of mathematics.</p>
    {GROUPS.map(group=><div className="destination-group" key={group.subject}>
      <h2 className="destination-subject">{group.heading}</h2>
      <div className="destination-options">{entries.filter(([,t])=>t.subject===group.subject).map(([id,t])=>
        <Link key={id} href={`/start/${id}`} className="destination-option">
          <span className="option-no">{String(entries.findIndex(([x])=>x===id)+1).padStart(2,'0')}</span>
          <div><h3>{t.label}</h3><MathText size="lg" speak={t.speak}>{t.example}</MathText><p>{t.description}</p></div>
          <span className="destination-arrow" aria-hidden="true">↗</span>
        </Link>)}</div>
    </div>)}
    <p className="quiet">Pick a topic. We’ll find the next useful step.</p>
  </section>;
}
