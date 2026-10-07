'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useState} from 'react';
import {addDays,parseDay,weekday} from '@/lib/program/planner';
import {itemsOn,type CalItem} from '@/lib/program/calendar';
import {btn,cx} from './ui';

/** Real schedule data, shared by the setup preview and the personalized home. */
export function StudyWeek({items,today,preview=false}:{items:CalItem[];today:string;preview?:boolean}){
 const [week,setWeek]=useState(()=>addDays(today,-((weekday(today)+6)%7))),[selected,setSelected]=useState(today);
 const days=Array.from({length:7},(_,i)=>addDays(week,i)),events=itemsOn(items,selected);
 const format=(day:string,options:Intl.DateTimeFormatOptions)=>parseDay(day).toLocaleDateString('en-PH',options);
 return <div>
  <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-ink-soft">{format(week,{month:'short',day:'numeric'})} to {format(addDays(week,6),{month:'short',day:'numeric'})}</p><div className="flex gap-1">{[-1,1].map(n=><button key={n} aria-label={n<0?'Previous week':'Next week'} onClick={()=>{const start=addDays(week,n*7);setWeek(start);setSelected(start);}} className="grid h-11 w-11 place-items-center rounded-lg border-2 border-navy/15 text-xl text-navy">{n<0?'‹':'›'}</button>)}</div></div>
  <div role="group" aria-label="Days this week" className="mt-3 grid auto-cols-[minmax(44px,1fr)] grid-flow-col gap-1 overflow-x-auto pb-2">{days.map(d=>{const list=itemsOn(items,d);return <button key={d} aria-label={format(d,{weekday:'long',month:'long',day:'numeric'})} aria-pressed={selected===d} onClick={()=>setSelected(d)} className={cx('flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border-2 text-navy',selected===d?'border-navy bg-mint':'border-transparent hover:bg-sky')}><span className="text-xs">{format(d,{weekday:'short'})}</span><span className="text-lg font-bold">{Number(d.slice(8))}</span><span aria-hidden="true" className={cx('h-1 w-4 rounded-sm',list.length?'bg-green':'bg-navy/10')}/></button>;})}</div>
  <p className="mt-3 font-semibold">{selected===today?'Today':format(selected,{weekday:'long',month:'short',day:'numeric'})}</p>
  {events.length?<ul className="mt-2 grid gap-2">{events.slice(0,3).map(e=><li key={e.id} className="rounded-xl bg-sky p-3"><p className="font-semibold"><Headline>{e.title}</Headline></p><p className="mt-1 text-sm text-ink-soft">{e.time}{e.minutes?` · ${e.minutes} minutes`:''}{e.done?' · Checked off':''}</p>{!preview&&e.concept&&<Link className={cx(btn.text,'text-sm')} href={`/learn/${e.concept}`}><Headline>Open this topic</Headline></Link>}</li>)}</ul>:<p className="mt-2 text-sm text-ink-soft">{preview?'No session planned on this day. Pick another date to see your routine.':'A free day in your calendar. Add a session if it suits your week.'}</p>}
  {!preview&&<div className="mt-3 flex flex-wrap gap-2"><Link className={btn.primary} href={`/calendar?day=${selected}`}><Headline>Open my calendar</Headline></Link><Link className={btn.ghost} href={`/calendar?day=${selected}&add=1`}><Headline>Add an event</Headline></Link></div>}
 </div>;
}
