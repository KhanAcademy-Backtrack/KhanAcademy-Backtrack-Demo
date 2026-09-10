'use client';
import { useState } from 'react';
import Link from 'next/link';
import { TOPICS, type Topic } from '@/lib/recovery';
export function SchoolLink(){
 const [topic,setTopic]=useState<Topic>('quadratics'),[copied,setCopied]=useState(false),[manual,setManual]=useState('');
 async function copy(){const url=`${location.origin}/start/${topic}`;try{await navigator.clipboard.writeText(url);setCopied(true);setManual('');}catch{setCopied(false);setManual(url);}}
 return <div className="school-tool"><label htmlFor="school-goal">Choose the current class destination</label><select id="school-goal" value={topic} onChange={e=>{setTopic(e.target.value as Topic);setCopied(false);setManual('');}}>{Object.entries(TOPICS).map(([id,t])=><option key={id} value={id}>{t.label}</option>)}</select><button className="button-secondary" onClick={copy}>{copied?'Class link copied ✓':'Copy class link'}</button><Link className="button-text" href={`/start/${topic}`}>Open the learner route ↗</Link><p className="share-url" role="status">{copied?'Share the link with your class.':manual?'Select and copy this class link:':`Topic link: /start/${topic}`}</p>{manual&&<input className="manual-class-link" aria-label="Class link to copy" readOnly value={manual} onFocus={e=>e.currentTarget.select()}/>}</div>;
}
