'use client';
import {useState} from 'react';
import {useStudy} from './StudyProvider';
import type {Pack} from '@/lib/study';

export function PackNotes({pack}:{pack:Pack}){
  const {update}=useStudy();const [index,setIndex]=useState(0),[revealed,setRevealed]=useState(false),[message,setMessage]=useState('');
  const cards=pack.cards?.filter(c=>c.reviewed)??[];const card=cards[Math.min(index,cards.length-1)];if(!card)return null;
  function rate(rating:'again'|'comfortable'){
    update(s=>({...s,packs:[...s.packs.filter(p=>p.id!==pack.id),{...pack,cards:pack.cards?.map(c=>c.id===card.id?{...c,lastRating:rating,dueAt:Date.now()+(rating==='again'?1:3)*86400000}:c)}],updatedAt:Date.now()}));
    setMessage(rating==='again'?'Kept for another look tomorrow.':'Kept for a fresh look in three days.');setRevealed(false);setIndex((index+1)%cards.length);
  }
  return <details className="pack-notes"><summary>Your note cards · {cards.length}</summary><div className="note-review-card"><p className="eyebrow">From your notes · {index+1} / {cards.length}</p><h3>{card.prompt}</h3><p className="note-source">{card.source} · {card.locator}</p>{revealed?<><p className="note-answer">{card.answer}</p><p className="note-source">Your own recall check</p><div className="today-actions"><button className="button-secondary" onClick={()=>rate('again')}>Bring this back soon</button><button className="button-primary" onClick={()=>rate('comfortable')}>I recalled it</button></div></>:<button className="button-secondary" onClick={()=>{setRevealed(true);setMessage('');}}>Reveal my note</button>}<p role="status">{message}</p></div></details>;
}
