'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useState} from 'react';
import {useProgram} from './ProgramProvider';
import {recallPrompt,recallNext} from '@/lib/program/recall';
import {Sheet,btn,Oval} from './ui';
import {Rich} from '@/components/math/Math';

export function DailyRecall(){
 const {state,update,today}=useProgram(),[shown,setShown]=useState(false);
 const due=Object.entries(state.recall).filter(([key,c])=>c.due<=Date.now()&&recallPrompt(key)).sort((a,b)=>a[1].due-b[1].due);
 const entry=due[0],prompt=entry?recallPrompt(entry[0]):undefined;
 function grade(remembered:boolean){if(!entry)return;update(s=>({...s,recall:{...s.recall,[entry[0]]:recallNext(entry[1],remembered,Date.now())},missions:{...s.missions,[today]:{...s.missions[today],recall:Date.now()}}}));setShown(false);}
 return <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-8"><Sheet aria-label="Daily recall"><div className="flex items-center gap-3"><Oval filled size={30}/><h2 className="text-2xl font-extrabold"><Headline>Daily recall</Headline></h2><span className="ml-auto text-sm text-ink-soft">{due.length} ready</span></div>{prompt?<div key={entry[0]}><p className="mt-3 text-sm text-ink-soft">{prompt.title}. Try to say the answer before revealing it.</p><p className="mt-3 font-serif text-xl leading-relaxed"><Rich>{prompt.front}</Rich></p>{shown?<><ul className="mt-4 grid gap-2 rounded-2xl bg-mint p-4 font-serif text-lg">{prompt.back.map((line,i)=><li key={i}><Rich>{line}</Rich></li>)}</ul><div className="mt-4 flex flex-wrap gap-2"><button className={btn.primary} onClick={()=>grade(true)}><Headline>I recalled it</Headline></button><button className={btn.ghost} onClick={()=>grade(false)}><Headline>Still hard</Headline></button><Link className={btn.text} href={prompt.href}><Headline>Read the explanation</Headline></Link></div></>:<button className={`${btn.dark} mt-4`} onClick={()=>setShown(true)}><Headline>Reveal answer</Headline></button>}<p className="mt-3 text-sm text-ink-soft">Your recall note schedules another look. Fresh independent answers are checked separately.</p></div>:<p className="mt-3 text-ink-soft">You are caught up. Cards you save and topics marked Still hard come back here when due.</p>}</Sheet></div>;
}
