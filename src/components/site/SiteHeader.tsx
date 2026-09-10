'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
export function SiteHeader(){const path=usePathname(),[open,setOpen]=useState(false),menu=useRef<HTMLButtonElement>(null);
 useEffect(()=>setOpen(false),[path]);
 useEffect(()=>{if(!open)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);menu.current?.focus();}};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[open]);
 return <header className="site-header"><Link href="/" className="brand" aria-label="BACKTRACK home" onClick={()=>setOpen(false)}><img src="/backtrack-logo.svg" alt="BACKTRACK" width="180" height="40"/></Link><nav id="main-navigation" aria-label="Main navigation" className={`site-nav ${open?'menu-open':''}`}>{[['/how-it-works','How it works'],['/schools','For schools']].map(([url,label])=><Link key={url} href={url} onClick={()=>setOpen(false)} aria-current={path===url?'page':undefined}>{label}</Link>)}<Link className="nav-cta" href="/start" onClick={()=>setOpen(false)}>Start your route</Link></nav><button ref={menu} className="mobile-menu" aria-label="Navigation menu" aria-controls="main-navigation" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Close':'Menu'}</button></header>}
