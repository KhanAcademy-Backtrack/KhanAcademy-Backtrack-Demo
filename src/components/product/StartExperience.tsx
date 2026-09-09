'use client';
import Link from 'next/link';
import { TOPICS, type Topic } from '@/lib/recovery';
import { MathText } from '@/components/math/Math';
export function StartExperience(){return <section className="start-page wrap"><p className="eyebrow">Start where you need to be</p><h1>What needs to<br/><em>make sense today?</em></h1><div className="destination-options">{(Object.entries(TOPICS) as [Topic,(typeof TOPICS)[Topic]][]).map(([id,t],i)=><Link key={id} href={`/start/${id}`} className="destination-option"><span className="option-no">0{i+1}</span><div><h2>{t.label}</h2><MathText size="lg">{t.example}</MathText><p>{t.description}</p></div><span className="destination-arrow" aria-hidden="true">↗</span></Link>)}</div><p className="quiet">Two destinations to start. One idea that can travel across the curriculum.</p></section>}
