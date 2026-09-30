'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {motion} from 'motion/react';
import {useQuietMotion} from './useQuietMotion';
import {useProgram} from './ProgramProvider';
import {useProgramTour,useProgramGuide} from './ProgramTourProvider';
import {Wordmark,cx} from './ui';
import {SPRING} from '@/lib/motion-tokens';
import {t} from '@/lib/i18n';
import {learnerGoal} from '@/lib/program/personalization';

type Tab={href:string;key:'today'|'plan'|'calendar'|'mocks'|'reviewer'|'group';match:(p:string)=>boolean};
function tabs(bridge:boolean,topic?:string,program?:string):Tab[]{return [
 {href:'/',key:'today',match:p=>p==='/'||p.startsWith('/study')||p==='/review'},
 {href:bridge?(program?'/bridge/'+program:'/bridge'):topic?'/learn/'+topic:'/plan',key:'plan',match:p=>p.startsWith('/plan')||p.startsWith('/bridge')||p.startsWith('/packs')||(!!topic&&p==='/learn/'+topic)},
 {href:'/calendar',key:'calendar',match:p=>p.startsWith('/calendar')},
 {href:'/mock',key:'mocks',match:p=>p.startsWith('/mock')},
 {href:'/reviewer',key:'reviewer',match:p=>p.startsWith('/reviewer')},
 {href:'/group',key:'group',match:p=>p.startsWith('/group')||p.startsWith('/together')||p.startsWith('/challenge')}
];}

function Icon({k}:{k:Tab['key']}){
 const common={fill:'none',stroke:'currentColor',strokeWidth:1.9,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
 return <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">{
  k==='today'?<><path d="M3 11 12 4l9 7M5 10v10h14V10" {...common}/><ellipse cx="12" cy="15" rx="2.5" ry="2" fill="currentColor"/></>:k==='calendar'?<><rect x="4" y="5" width="16" height="15" rx="2.5" {...common}/><path d="M8 3v4M16 3v4M4 10h16" {...common}/><ellipse cx="12" cy="15" rx="2.6" ry="1.9" fill="currentColor"/></>:
  k==='plan'?<path d="M5 19V5M5 7h11l-2 3 2 3H5" {...common}/>:
  k==='mocks'?<><rect x="5" y="3" width="14" height="18" rx="2" {...common}/><ellipse cx="9.5" cy="9" rx="1.8" ry="1.3" fill="currentColor"/><ellipse cx="9.5" cy="14" rx="1.8" ry="1.3" {...common}/><path d="M13 9h3M13 14h3" {...common}/></>:
  k==='reviewer'?<path d="M4 5.5C7 4 9.5 4.5 12 6c2.5-1.5 5-2 8-.5V19c-3-1.5-5.5-1-8 .5-2.5-1.5-5-2-8-.5ZM12 6v13.5" {...common}/>:
  <><circle cx="8" cy="9" r="3" {...common}/><circle cx="16.5" cy="10" r="2.5" {...common}/><path d="M3 19c.8-3 2.8-4.5 5-4.5s4.2 1.5 5 4.5M14 18.5c.5-2 1.8-3 3.3-3s2.7 1 3.2 3" {...common}/></>
 }</svg>;
}

/** Everything that is a focused, full-screen activity hides the app chrome. */
const FOCUS=[/^\/mock\/take/];

export function AppNav(){
 const openTour=useProgramTour(),guide=useProgramGuide();
 const path=usePathname()||'/',{state,update}=useProgram(),reduced=useQuietMotion();
 const [menu,setMenu]=useState(false),button=useRef<HTMLButtonElement>(null),panel=useRef<HTMLDivElement>(null);
 const goal=guide.browsing?undefined:learnerGoal(state),lang=state.lang,both=state.sides.admission&&state.sides.bridge,bridge=goal==='college',topic=goal==='topic'?state.setup?.concept:undefined;
 const list=tabs(bridge,topic,state.bridgeProgram),active=list.find(x=>x.match(path))?.key;
 useEffect(()=>setMenu(false),[path]);
 useEffect(()=>{if(!menu)return;const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenu(false);button.current?.focus();}};const click=(e:MouseEvent)=>{if(!panel.current?.contains(e.target as Node)&&!button.current?.contains(e.target as Node))setMenu(false);};document.addEventListener('keydown',key);document.addEventListener('mousedown',click);return()=>{document.removeEventListener('keydown',key);document.removeEventListener('mousedown',click);};},[menu]);
 if(FOCUS.some(r=>r.test(path)))return null;
 const move=reduced?{duration:0}:SPRING;
 return <>
  <header className="print:hidden sticky top-0 z-40 bg-navy text-white shadow-[0_1px_0_rgba(255,255,255,.08)]">
   <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-4 sm:px-8">
    <Link href="/" aria-label="Khanpanion, Today" className="rounded-lg focus-visible:outline-3 focus-visible:outline-green"><Wordmark onDark small/></Link>
    <nav aria-label="Main" className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
     {list.map(x=><Link key={x.key} href={x.href} data-program-tour={x.key} aria-current={active===x.key?'page':undefined} className="relative flex min-h-11 items-center rounded-full px-2.5 text-[14px] xl:px-4 xl:text-[15px] font-semibold text-white/75  hover:text-white aria-[current=page]:text-navy">
      {active===x.key&&<motion.span layoutId="tab-oval" transition={move} className="absolute inset-0 rounded-full bg-green"/>}
      <span className="relative">{x.key==='plan'&&topic?'Topic':x.key==='mocks'&&goal!=='exam'?'Practice':t(lang,`nav.${x.key}${x.key==='plan'&&bridge?'.bridge':''}`)}</span>
     </Link>)}
    </nav>
    <div className="ml-auto flex items-center gap-2">
     {both&&!guide.browsing&&goal!=='topic'&&<div role="group" aria-label={t(lang,'nav.side')} className="hidden rounded-full bg-white/10 p-1 xl:flex">
      {(['admission','bridge'] as const).map(s=><button key={s} aria-pressed={state.activeSide===s} onClick={()=>update(p=>({...p,activeSide:s,...(p.setup?{setup:{...p.setup,goal:s==='bridge'?'college':'exam',exam:p.setup.exam??p.pledge?.exam??'upcat'}}:{})}))} className="min-h-11 rounded-full px-3 text-[13px] font-semibold text-white/75 aria-pressed:bg-white aria-pressed:text-navy">{t(lang,`side.${s}.short`)}</button>)}
     </div>}
     <button data-guide-button onClick={e=>openTour(e.currentTarget)} className="min-h-11 rounded-full border-2 border-white/25 px-3 text-sm font-semibold text-white hover:border-green focus-visible:outline-3 focus-visible:outline-green">Guide</button>
     <div className="relative">
      <button aria-label="Me" ref={button} aria-expanded={menu} aria-controls="me-menu" onClick={()=>setMenu(!menu)} className="flex min-h-11 items-center gap-2 rounded-full border-2 border-white/20 px-2 min-[360px]:pr-4 text-[15px] font-semibold hover:border-white/50 focus-visible:outline-3 focus-visible:outline-green text-white">
       <span className="grid h-7 w-7 place-items-center rounded-full bg-green text-navy" aria-hidden="true"><svg viewBox="0 0 24 24" className="h-4 w-4"><circle cx="12" cy="9" r="4" fill="currentColor"/><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" fill="currentColor"/></svg></span><span className="hidden min-[360px]:inline">{t(lang,'nav.me')}</span>
      </button>
      {menu&&<div ref={panel} id="me-menu" className="absolute right-0 top-14 w-72 rounded-2xl bg-white p-2 text-navy shadow-[0_24px_60px_-20px_rgba(4,19,51,.6)]">
       <button onClick={()=>{setMenu(false);openTour(button.current);}} className="flex min-h-11 w-full items-center rounded-xl px-3 text-left font-semibold hover:bg-mint">Show me around</button>
       {[['/plan#pledge','me.pledge'],['/calendar','me.calendar'],['/admissions','me.admissions'],['/bridge','me.bridge'],['/me','me.settings'],['/about','me.about']].map(([href,key])=><Link key={href} href={href} onClick={()=>setMenu(false)} className="flex min-h-11 items-center rounded-xl px-3 font-semibold hover:bg-mint">{t(lang,key)}</Link>)}
       <div className="mt-1 flex items-center justify-between rounded-xl bg-sky px-3 py-2"><span className="text-sm font-semibold">{t(lang,'me.language')}</span>
        <div className="flex gap-1">{(['en','fil'] as const).map(l=><button key={l} aria-pressed={lang===l} onClick={()=>update(p=>({...p,lang:l}))} className="min-h-11 rounded-full px-3 text-sm font-bold aria-pressed:bg-navy aria-pressed:text-white text-navy">{l==='en'?'English':'Filipino'}</button>)}</div>
       </div>
      </div>}
     </div>
    </div>
   </div>
  </header>
  <nav aria-label="Main" className="print:hidden fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy pb-[env(safe-area-inset-bottom)] text-white lg:hidden">
   <div className="grid grid-cols-6">
    {list.map(x=><Link key={x.key} href={x.href} data-program-tour={x.key} aria-current={active===x.key?'page':undefined} className="relative flex min-h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-white/70 aria-[current=page]:text-white">
     <span className="relative grid h-8 w-12 place-items-center">
      {active===x.key&&<motion.span layoutId="tab-oval-m" transition={move} className="absolute inset-0 rounded-[50%] bg-green"/>}
      <span className={cx('relative',active===x.key&&'text-navy')}><Icon k={x.key}/></span>
     </span>
     {x.key==='plan'&&topic?'Topic':x.key==='mocks'&&goal!=='exam'?'Practice':t(lang,`nav.${x.key}${x.key==='plan'&&bridge?'.bridge':''}`)}
    </Link>)}
   </div>
  </nav>
 </>;
}
