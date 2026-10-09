import {Headline} from './Headline';
import type {ReactNode} from 'react';
import {Sheet,cx} from './ui';

/** A home section: a small label above one card, so the page reads as a short list. */
export function Section({label,children,className}:{label:string;children:ReactNode;className?:string}){
 return <div className={cx('min-w-0',className)}><p className="home-section-label mb-2.5 px-1 text-[15px] font-bold text-navy"><Headline>{label}</Headline></p>{children}</div>;
}

/** One thing to do: an icon, a title, a line of context and one full-width action,
 *  with a quiet illustration beside it on wider screens. */
export function FeatureCard({icon,title,body,action,art,artLayout='side',children,className,...rest}:{icon?:ReactNode;title:ReactNode;body?:ReactNode;action?:ReactNode;art?:ReactNode;artLayout?:'side'|'strip';children?:ReactNode;className?:string}&Record<`data-${string}`,string>){
 return <Sheet {...rest} className={cx('home-feature-card grid min-w-0 gap-5 p-4 sm:p-5',!!art&&artLayout==='side'&&'sm:grid-cols-[minmax(0,1fr)_minmax(0,.85fr)]',className)}>
  <div className="flex min-w-0 flex-col sm:p-1">
   <div className={artLayout==='strip'?'flex items-center gap-3':undefined}>
   {icon&&<span className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-navy">{icon}</span>}
   <h2 className={cx('text-xl font-extrabold leading-tight tracking-[-.015em]',!!icon&&artLayout==='side'&&'mt-3')}><Headline>{title}</Headline></h2>
   </div>
   {body&&<p className={cx('mt-1.5 leading-relaxed text-ink-soft',artLayout==='strip'&&'text-sm')}>{body}</p>}
   {art&&artLayout==='strip'&&<div aria-hidden="true" className="home-card-art home-card-art-strip overflow-hidden rounded-xl bg-mint">{art}</div>}
   {action&&<div className="mt-auto flex flex-wrap gap-2 pt-5 [&>*]:flex-1">{action}</div>}
   {children}
  </div>
  {art&&artLayout==='side'&&<div aria-hidden="true" className="home-card-art hidden min-h-44 overflow-hidden rounded-xl bg-mint sm:block">{art}</div>}
 </Sheet>;
}

const line={fill:'none',stroke:'#0a2a66',strokeWidth:2.5,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
export const glyph={
 book:<svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5C7 4 9.5 4.5 12 6c2.5-1.5 5-2 8-.5V19c-3-1.5-5.5-1-8 .5-2.5-1.5-5-2-8-.5ZM12 6v13.5"/></svg>,
 route:<svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>,
 week:<svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>,
 idea:<svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/></svg>,
 tune:<svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>,
 cap:<svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m2 9 10-5 10 5-10 5-10-5Zm4 2v6c4 3 8 3 12 0v-6m4-2v7"/></svg>,
};

/** A summary card and a check mark: read the idea, then try it. */
export function TopicArt(){
 return <svg viewBox="0 0 240 180" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
  <rect x="44" y="34" width="132" height="112" rx="12" fill="#fff"/><rect x="60" y="54" width="70" height="9" rx="4.5" fill="#0a2a66"/>
  {[76,92,108].map(y=><g key={y}><circle cx="66" cy={y+4} r="4" fill="#14bf96"/><rect x="78" y={y} width={y===92?62:80} height="8" rx="4" fill="#cfd8e6"/></g>)}
  <rect x="148" y="104" width="52" height="52" rx="12" fill="#14bf96"/><path d="m162 130 9 9 17-18" {...line}/>
 </svg>;
}

/** A schematic of the current prerequisite map: the goal stays above its earlier
 *  skills, with one useful way back up highlighted. This is not learner progress. */
export function RouteArt(){
 return <svg viewBox="0 0 240 280" className="h-full w-full" preserveAspectRatio="xMidYMid meet" focusable="false">
  <g {...line} stroke="#adc9c8" strokeWidth="2">
   <path d="M120 216C120 177 62 184 62 143M120 216C120 177 178 184 178 143"/>
   <path d="M62 117C62 88 120 103 120 66M178 117C178 88 120 103 120 66"/>
  </g>
  <g {...line} stroke="#14bf96" strokeWidth="4">
   <path d="M120 210C120 177 62 184 62 148M62 112C62 88 120 103 120 72"/>
   <path d="m57 154 5-7 5 7m48-75 5-7 5 7" strokeWidth="2.5"/>
  </g>
  <circle cx="120" cy="44" r="22" fill="#fff" stroke="#0a2a66" strokeWidth="2.5"/>
  <path d="M114 54V34m1 1h13l-4 5 4 5h-13" {...line} strokeWidth="2"/>
  <circle cx="62" cy="130" r="17" fill="#fff" stroke="#14bf96" strokeWidth="3"/>
  <circle cx="62" cy="130" r="5" fill="#0a2a66"/>
  <circle cx="178" cy="130" r="17" fill="#fff" stroke="#adc9c8" strokeWidth="2"/>
  <circle cx="178" cy="130" r="4" fill="#adc9c8"/>
  <circle cx="120" cy="234" r="28" fill="#14bf96" fillOpacity=".16"/>
  <circle cx="120" cy="234" r="21" fill="#14bf96"/>
  <path d="M109 226q5-2 11 1 6-3 11-1v15q-5-2-11 1-6-3-11-1Zm11 1v15" {...line} strokeWidth="1.8"/>
  <g fill="#0a2a66" fontFamily="var(--font-instrument-sans),Arial" fontSize="14" fontWeight="700" textAnchor="middle">
   <text x="120" y="15">Your goal</text>
   <text x="120" y="126" fontSize="13">Earlier</text>
   <text x="120" y="143" fontSize="13">skills</text>
   <text x="120" y="274">Learn. Then return.</text>
  </g>
 </svg>;
}

/** The learner's own study days, Sunday first. */
export function WeekArt({days,compact=false}:{days:number[];compact?:boolean}){
 const order=[0,1,2,3,4,5,6],names=['S','M','T','W','T','F','S'];
 return <svg viewBox={compact?'0 0 240 68':'0 0 240 180'} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
  <rect x="24" y={compact?4:36} width="192" height={compact?60:108} rx="12" fill="#fff"/>
  {order.map((d,i)=><g key={d}><text x={42+i*26.5} y={compact?24:66} textAnchor="middle" fontSize="12" fontWeight="700" fill="#475e7c" fontFamily="var(--font-instrument-sans),Arial">{names[i]}</text>
   <rect x={31+i*26.5} y={compact?34:80} width="22" height={compact?20:44} rx="6" fill={days.includes(d)?'#14bf96':'#eef3fa'}/></g>)}
 </svg>;
}

/** An idea you can move: a slider and a changing bar. */
export function IdeaArt(){
 return <svg viewBox="0 0 240 180" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
  <rect x="34" y="34" width="172" height="112" rx="12" fill="#fff"/>
  {[0,1,2,3].map(i=><rect key={i} x={56+i*36} y={118-(i+1)*16} width="24" height={(i+1)*16} rx="4" fill={i===3?'#14bf96':'#cfd8e6'}/>)}
  <path d="M56 130h128" {...line} strokeWidth="2"/><circle cx="160" cy="130" r="7" fill="#0a2a66"/>
 </svg>;
}
