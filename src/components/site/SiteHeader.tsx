'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
const NAV=[['/','Today'],['/explore','Explore'],['/study','Study'],['/review','Review'],['/packs','My packs']];
function NavIcon({index}:{index:number}){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{index===0?<path d="M3 11 12 3 21 11M6 9V21H18V9M10 21V15H14V21"/>:index===1?<><circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/></>:index===2?<path d="M12 5C8 2 5 3 3 4V20C7 18 9 19 12 21M12 5C16 2 19 3 21 4V20C17 18 15 19 12 21ZM12 5V21"/>:index===3?<path d="M5 8A8 8 0 1 1 4 15M5 3V8H10M12 7V12L16 14"/>:<><rect x="4" y="7" width="16" height="14" rx="2"/><path d="M6 4H18M8 1H16M9 12H15"/></>}</svg>;}
export function SiteHeader(){
 const path=usePathname(),[open,setOpen]=useState(false),menu=useRef<HTMLButtonElement>(null);
 useEffect(()=>setOpen(false),[path]);
 useEffect(()=>{if(!open)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);menu.current?.focus();}};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[open]);
 const selected=(url:string)=>url==='/'?path==='/':path.startsWith(url);
 return <><header className="site-header companion-header"><Link href="/" className="brand" aria-label="Khanpanion home" onClick={()=>setOpen(false)}><img src="/khanpanion-logo.svg" alt="Khanpanion" width="220" height="43"/></Link><nav id="main-navigation" aria-label="Main navigation" className={`site-nav ${open?'menu-open':''}`}>{NAV.map(([url,label])=><Link key={url} href={url} onClick={()=>setOpen(false)} aria-current={selected(url)?'page':undefined}>{label}</Link>)}<Link className="nav-cta" href="/khan" onClick={()=>setOpen(false)}>From Khan ↗</Link></nav><button ref={menu} className="mobile-menu" aria-label="Navigation menu" aria-controls="main-navigation" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Close':'Menu'}</button></header><nav className="mobile-study-nav" aria-label="Study navigation">{NAV.map(([url,label],i)=><Link key={url} href={url} onClick={()=>setOpen(false)} aria-current={selected(url)?'page':undefined}><NavIcon index={i}/><span>{label==='My packs'?'Packs':label}</span></Link>)}</nav></>;
}
