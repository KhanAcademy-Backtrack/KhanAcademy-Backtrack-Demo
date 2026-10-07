'use client';
import {Headline} from './Headline';
import {useEffect,useId,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import type {SearchEntry} from '@/lib/site-search';
import {cx} from './ui';
import {useProgram} from './ProgramProvider';
import {t} from '@/lib/i18n';

type Search=(q:string,limit?:number)=>SearchEntry[];
let loaded:Promise<Search>|undefined;
/** The index carries the reviewer titles, so it loads on first use, not with every page. */
const loadSearch=()=>loaded??=import('@/lib/site-search').then(m=>m.searchSite);

/** Header search: topics, reviewer chapters, BACKTRACK routes and pages. Press / to focus. */
export function SiteSearch({className,autoFocus=false,onDone}:{className?:string;autoFocus?:boolean;onDone?:()=>void}){
 const router=useRouter(),{state:{lang}}=useProgram(),id=useId(),input=useRef<HTMLInputElement>(null),box=useRef<HTMLDivElement>(null);
 const [q,setQ]=useState(''),[open,setOpen]=useState(false),[active,setActive]=useState(0),[results,setResults]=useState<SearchEntry[]>([]),[search,setSearch]=useState<Search>();
 useEffect(()=>{if(autoFocus){input.current?.focus();loadSearch().then(f=>setSearch(()=>f));}},[autoFocus]);
 useEffect(()=>{if(!search)return;setResults(search(q));setActive(0);},[q,search]);
 useEffect(()=>{if(autoFocus)return;const key=(e:KeyboardEvent)=>{const el=e.target as HTMLElement|null;if(e.key!=='/'||e.ctrlKey||e.metaKey||e.altKey||el?.closest('input,textarea,select,[contenteditable="true"],[role="dialog"]'))return;if(!input.current||input.current.getBoundingClientRect().width===0)return;e.preventDefault();input.current.focus();};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[autoFocus]);
 useEffect(()=>{if(!open)return;const click=(e:MouseEvent)=>{if(!box.current?.contains(e.target as Node))setOpen(false);};document.addEventListener('mousedown',click);return()=>document.removeEventListener('mousedown',click);},[open]);
 const go=(e:SearchEntry)=>{setOpen(false);setQ('');input.current?.blur();onDone?.();router.push(e.href);};
 const shown=open&&q.trim().length>0;
 return <div ref={box} className={cx('relative',className)}>
  <label htmlFor={id} className="sr-only">{t(lang,'search.label')}</label>
  <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
  <input ref={input} id={id} type="text" role="combobox" autoComplete="off" spellCheck={false} value={q} placeholder={t(lang,'search.placeholder')}
   aria-expanded={shown} aria-controls={`${id}-list`} aria-autocomplete="list" aria-activedescendant={shown&&results[active]?`${id}-${active}`:undefined}
   onFocus={()=>{setOpen(true);loadSearch().then(f=>setSearch(()=>f));}} onChange={e=>{setQ(e.target.value);setOpen(true);}}
   onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setActive(a=>Math.min(a+1,results.length-1));}else if(e.key==='ArrowUp'){e.preventDefault();setActive(a=>Math.max(a-1,0));}else if(e.key==='Enter'&&results[active]){e.preventDefault();go(results[active]);}else if(e.key==='Escape'){if(q)setQ('');else{setOpen(false);input.current?.blur();onDone?.();}}}}
   className="h-11 w-full rounded-lg border-2 border-line bg-white pl-10 pr-10 text-[15px] text-navy placeholder:text-ink-soft focus:border-navy focus:outline-none"/>
  {!q&&<kbd aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 text-xs font-semibold text-ink-soft md:block">/</kbd>}
  {shown&&<div className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-xl border border-line bg-white shadow-lift">
   {results.length?<ul id={`${id}-list`} role="listbox" aria-label={t(lang,'search.results')} className="max-h-[60vh] overflow-y-auto p-1.5">{results.map((r,i)=><li key={r.kind+r.href+r.title} id={`${id}-${i}`} role="option" aria-selected={i===active} onMouseEnter={()=>setActive(i)} onMouseDown={e=>{e.preventDefault();go(r);}}
    className={cx('flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5',i===active&&'bg-sky')}>
    <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-navy"><Headline>{r.title}</Headline></span><span className="block truncate text-sm text-ink-soft">{r.detail}</span></span>
    <span className="shrink-0 rounded-md bg-canvas px-2 py-0.5 text-xs font-semibold text-ink-soft">{r.kind}</span>
   </li>)}</ul>
   :<p id={`${id}-list`} role="status" className="px-4 py-3 text-sm text-ink-soft">{t(lang,search?'search.none':'search.loading')}</p>}
  </div>}
 </div>;
}
