'use client';
import Link from 'next/link';
import type {ReactNode,ComponentProps} from 'react';
import {motion} from 'motion/react';
import {useQuietMotion} from './useQuietMotion';
import {DUR,SPRING} from '@/lib/motion-tokens';

export const cx=(...xs:(string|false|null|undefined)[])=>xs.filter(Boolean).join(' ');

/** Button looks. Green actions carry navy labels; every target is at least 44 px.
 *  One primary action per view; everything else is quiet. */
export const btn={
 primary:'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-green px-5 py-2.5 text-[15px] font-bold text-navy hover:bg-green-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:opacity-45',
 dark:'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-[15px] font-bold text-white hover:bg-navy-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-green disabled:opacity-45',
 ghost:'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-line bg-white px-5 py-2 text-[15px] font-semibold text-navy hover:border-line-strong hover:bg-sky focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy',
 quiet:'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-[15px] font-semibold text-navy underline decoration-line-strong decoration-2 underline-offset-4 hover:bg-sky hover:decoration-navy focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy',
 text:'inline-flex min-h-11 items-center gap-1 font-semibold text-navy underline decoration-green decoration-2 underline-offset-4 hover:decoration-navy'
};

/** The site mark: the bookmark buddy and the name, readable on navy or white. */
export function Wordmark({onDark=false,small=false}:{onDark?:boolean;small?:boolean}){
 return <span className={cx('inline-flex items-center gap-2 font-extrabold tracking-[-.03em]',small?'text-xl':'text-2xl',onDark?'text-white':'text-navy')}>
  <svg viewBox="12 3 42 58" className={small?'h-7 w-auto':'h-8 w-auto'} aria-hidden="true"><path d="M15 10Q15 5 20 5H41L51 15V55Q51 59 47 56L33 48 19 56Q15 59 15 54Z" fill="#14bf96"/><path d="M41 5V16H51" fill="#96e6d2"/><circle cx="26" cy="27" r="2.6" fill="#0a2a66"/><circle cx="40" cy="27" r="2.6" fill="#0a2a66"/><path d="M26 36C29 43 39 43 42 36" fill="none" stroke="#0a2a66" strokeWidth="2.4" strokeLinecap="round"/></svg>
  Khanpanion
 </span>;
}

/** The answer-sheet oval: the product's unit of choice and of progress. */
export function Oval({filled=false,label,size=28,tone='navy',className}:{filled?:boolean;label?:string;size?:number;tone?:'navy'|'green'|'white';className?:string}){
 const reduced=useQuietMotion();
 const ring=tone==='white'?'#ffffff':tone==='green'?'#14bf96':'#0a2a66';
 return <svg width={size} height={size*.72} viewBox="0 0 40 29" className={cx('shrink-0',className)} aria-hidden="true">
  <ellipse cx="20" cy="14.5" rx="18" ry="12.5" fill="none" stroke={ring} strokeOpacity={filled?1:.45} strokeWidth="2.2"/>
  <motion.ellipse cx="20" cy="14.5" rx="15.2" ry="9.8" fill="#14bf96" initial={false} animate={{scale:filled?1:0,opacity:filled?1:0}} style={{transformOrigin:'20px 14.5px'}} transition={reduced?{duration:0}:SPRING}/>
  {label&&<text x="20" y="19.5" textAnchor="middle" fontSize="13" fontWeight="700" fill={filled?'#0a2a66':ring} fontFamily="var(--font-instrument-sans),Arial">{label}</text>}
 </svg>;
}

/** A row of ovals for progress: filled ones are done. */
export function OvalRow({done,total,tone='navy',label}:{done:number;total:number;tone?:'navy'|'white';label:string}){
 return <div role="img" aria-label={label} className="flex flex-wrap gap-1">{Array.from({length:total},(_,i)=><Oval key={i} filled={i<done} size={22} tone={tone}/>)}</div>;
}

/** A white study card on the calm canvas: soft shadow, no border. */
export function Sheet({children,className,as='section',...rest}:{children:ReactNode;className?:string;as?:'section'|'div'|'article'}&Omit<ComponentProps<'section'>,'className'|'children'|'ref'>){
 const Tag=as as 'section';
 return <Tag {...rest} className={cx('rounded-2xl text-navy shadow-sheet',!/\bbg-/.test(className??'')&&'bg-white',!/\bp-/.test(className??'')&&'p-5 sm:p-7',className)}>{children}</Tag>;
}

/** Page header: a small title on the canvas and one quiet line underneath. */
export function PageBand({title,lead,children,aside}:{title:ReactNode;lead?:ReactNode;children?:ReactNode;aside?:ReactNode}){
 return <div>
  <div className="mx-auto grid max-w-6xl gap-4 px-5 pb-6 pt-8 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:pt-10">
   <div className="min-w-0 max-w-3xl"><h1 className="break-words text-[1.65rem] font-extrabold leading-tight tracking-[-.025em] text-navy sm:text-[1.9rem]">{title}</h1>{lead&&<p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-ink-soft">{lead}</p>}{children}</div>
   {aside}
  </div>
 </div>;
}
export const pageBody='mx-auto max-w-6xl px-4 pb-32 sm:px-8 lg:pb-20';

export function Pill({children,tone='mint'}:{children:ReactNode;tone?:'mint'|'navy'|'sky'|'green'}){
 const c=tone==='navy'?'bg-navy text-white':tone==='sky'?'bg-sky text-navy':tone==='green'?'bg-green text-navy':'bg-mint text-navy';
 return <span className={cx('inline-flex items-center rounded-md px-2.5 py-1 text-[13px] font-semibold',c)}>{children}</span>;
}

export function KhanLink({href,children,className}:{href:string;children:ReactNode;className?:string}){
 return <a href={href} target="_blank" rel="noopener noreferrer" className={cx('inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline decoration-green decoration-2 underline-offset-4 hover:decoration-navy',className)}>{children}<span aria-hidden="true">↗</span><span className="sr-only"> (opens Khan Academy in a new tab)</span></a>;
}

export function Rise({children,delay=0,className}:{children:ReactNode;delay?:number;className?:string}){
 const reduced=useQuietMotion();
 return <motion.div className={className} initial={reduced?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:DUR.slow,delay,ease:[.2,.8,.2,1]}}>{children}</motion.div>;
}

export function NextLink(props:ComponentProps<typeof Link>){return <Link {...props}/>;}
