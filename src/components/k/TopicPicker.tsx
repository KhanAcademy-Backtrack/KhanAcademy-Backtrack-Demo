'use client';
import {useMemo,useState} from 'react';
import {btn,cx} from './ui';

export type TopicChoice={id:string;label:string;category:string;search?:string};
/** A subject first, then a short list. Search also works across subjects. */
export function TopicPicker({items,value,onChoose}:{items:TopicChoice[];value?:string;onChoose:(id:string)=>void}){
 const [category,setCategory]=useState(()=>items.find(x=>x.id===value)?.category??''),[query,setQuery]=useState(''),[all,setAll]=useState(false);
 const groups=useMemo(()=>[...new Set(items.map(x=>x.category))],[items]);
 const term=query.trim().toLowerCase();
 const matches=items.filter(x=>(!category||x.category===category)&&(!term||`${x.label} ${x.category} ${x.search??''}`.toLowerCase().includes(term))).sort((a,b)=>term?Number(b.label.toLowerCase().includes(term))-Number(a.label.toLowerCase().includes(term)):0);
 const searching=!!query.trim();
 const visible=all?matches:matches.slice(0,3);const selected=matches.find(x=>x.id===value);if(!all&&selected&&!visible.includes(selected)){visible[visible.length-1]=selected;}
 return <div>
  <label className="mt-4 grid gap-2 text-sm font-semibold">Find a topic<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setCategory('');setAll(false);onChoose('');}} placeholder="Try forces, fractions or reading" className="min-h-12 w-full rounded-xl border-2 border-navy/15 bg-white px-3 text-base font-normal text-navy focus:border-navy focus:outline-none"/></label>
  {!category&&!searching?<>
   <p className="mt-5 font-bold">Choose a subject</p>
   <div className="mt-3 grid grid-cols-2 gap-2">{groups.map(g=><button key={g} onClick={()=>{setCategory(g);setAll(false);onChoose('');}} className="flex min-h-16 items-center gap-2 rounded-xl border border-navy/15 px-3 py-3 text-left text-sm font-semibold text-navy hover:border-navy/40 hover:bg-mint focus-visible:outline-3 focus-visible:outline-navy"><span className="flex-1">{g}</span><span aria-hidden="true">›</span></button>)}</div>
  </>:<>
   <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-bold">{category||'Search results'}</h3><button className={cx(btn.text,'text-sm')} onClick={()=>{setCategory('');setQuery('');setAll(false);onChoose('');}}>All subjects</button></div>
   {matches.length?<><div className="mt-2 grid gap-2">{visible.map((x,i)=><button key={x.id} aria-label={x.label+(searching?' '+x.category:'')} aria-pressed={value===x.id} onClick={()=>onChoose(x.id)} className={cx('flex min-h-16 items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] font-semibold text-navy focus-visible:outline-3 focus-visible:outline-navy',value===x.id?'border-green bg-mint':'border-navy/15 hover:bg-sky')}><span className="flex-1">{!searching&&!value&&i===0&&<span className="mb-1 block text-xs font-normal text-ink-soft">A place to start</span>}{x.label}{searching&&<span className="mt-0.5 block text-xs font-normal text-ink-soft">{x.category}</span>}</span><span aria-hidden="true">›</span></button>)}</div>{matches.length>3&&<button className={cx(btn.text,'mt-2 text-sm')} onClick={()=>setAll(!all)}>{all?'Show fewer topics':`Show all ${matches.length} topics`}</button>}</>:<p role="status" className="py-5 text-ink-soft">No topics match. Try a shorter word or choose a subject.</p>}
  </>}
 </div>;
}
