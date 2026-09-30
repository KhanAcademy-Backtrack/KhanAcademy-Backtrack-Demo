'use client';
import {useMemo,useState} from 'react';
import {btn,cx,Oval} from './ui';

export type TopicChoice={id:string;label:string;category:string;search?:string};
/** A subject first, then a short list. Search also works across subjects. */
export function TopicPicker({items,value,onChoose}:{items:TopicChoice[];value?:string;onChoose:(id:string)=>void}){
 const [category,setCategory]=useState(()=>items.find(x=>x.id===value)?.category??''),[query,setQuery]=useState('');
 const groups=useMemo(()=>[...new Set(items.map(x=>x.category))],[items]);
 const matches=items.filter(x=>(!category||x.category===category)&&(!query.trim()||`${x.label} ${x.category} ${x.search??''}`.toLowerCase().includes(query.trim().toLowerCase())));
 const searching=!!query.trim();
 return <div>
  <label className="mt-4 grid gap-2 text-sm font-semibold">Find a topic<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setCategory('');onChoose('');}} placeholder="Try forces, fractions or reading" className="min-h-12 w-full rounded-xl border-2 border-navy/15 bg-white px-3 text-base font-normal text-navy focus:border-navy focus:outline-none"/></label>
  {!category&&!searching?<>
   <p className="mt-5 font-bold">Choose a subject</p>
   <div className="mt-3 grid gap-2 sm:grid-cols-2">{groups.map((g,i)=><button key={g} onClick={()=>{setCategory(g);onChoose('');}} className="flex min-h-16 items-center gap-3 rounded-2xl border-2 border-navy/12 px-4 py-3 text-left font-semibold text-navy hover:border-navy/40 hover:bg-mint focus-visible:outline-3 focus-visible:outline-navy"><Oval label={String.fromCharCode(65+i)} size={30}/><span className="flex-1">{g}</span><span aria-hidden="true">→</span></button>)}</div>
  </>:<>
   <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-bold">{category||'Search results'}</h3><button className={cx(btn.text,'text-sm')} onClick={()=>{setCategory('');setQuery('');onChoose('');}}>All subjects</button></div>
   {matches.length?<div className="mt-2 grid gap-2">{matches.map(x=><button key={x.id} aria-pressed={value===x.id} onClick={()=>onChoose(x.id)} className={cx('flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[15px] font-semibold text-navy focus-visible:outline-3 focus-visible:outline-navy',value===x.id?'border-green bg-mint':'border-navy/12 hover:bg-sky')}><Oval filled={value===x.id} size={24}/><span className="flex-1">{x.label}{searching&&<span className="mt-0.5 block text-xs font-normal text-ink-soft">{x.category}</span>}</span><span aria-hidden="true">→</span></button>)}</div>:<p role="status" className="py-5 text-ink-soft">No topics match. Try a shorter word or choose a subject.</p>}
  </>}
 </div>;
}
