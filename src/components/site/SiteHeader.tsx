'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
export function SiteHeader(){const path=usePathname(),[open,setOpen]=useState(false);return <header className="site-header"><Link href="/" className="brand" aria-label="BACKTRACK home">backtrack<span className="brand-stop" aria-hidden="true">.</span></Link><nav aria-label="Main navigation" className={`site-nav ${open?'menu-open':''}`}>{[['/how-it-works','How it works'],['/schools','For schools']].map(([url,label])=><Link key={url} href={url} onClick={()=>setOpen(false)} aria-current={path===url?'page':undefined}>{label}</Link>)}<Link className="nav-cta" href="/start" onClick={()=>setOpen(false)}>Start your route</Link></nav><button className="mobile-menu" aria-label="Navigation menu" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Close':'Menu'}</button></header>}
