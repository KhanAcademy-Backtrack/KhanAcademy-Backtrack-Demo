'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {motion} from 'motion/react';
import {useQuietMotion} from './useQuietMotion';
import {useProgram} from './ProgramProvider';
import {useProgramTour,useProgramGuide} from './ProgramTourProvider';
import {SiteSearch} from './SiteSearch';
import {Wordmark,cx} from './ui';
import {SiteFooter} from '@/components/site/SiteFooter';
import {SPRING} from '@/lib/motion-tokens';
import {t,type Lang,type Key as TextKey} from '@/lib/i18n';
import {examTargets,learnerGoal} from '@/lib/program/personalization';
import {PROGRAM_BY_ID} from '@/lib/program/bridge';
import {CONCEPT_BY_ID} from '@/lib/program/concepts';

type Key='today'|'plan'|'study'|'group';
type IconKey=Key|ToolKey|'calendar'|'mocks'|'reviewer'|'courses'|'folder'|'plus'|'goal';
/** A page inside a main section, listed in its horizontal section bar. `label` is an interface text key. */
export type Sub={key:string;href:string;label:TextKey;icon:IconKey;blurb?:string;match:(p:string)=>boolean};
type Tab={href:string;key:Key;match:(p:string)=>boolean;subs:Sub[];bar?:Sub[]};

/** Study tools in the section bar and the home shortcuts, CET practice first. */
type ToolKey='start'|'recall'|'notebook'|'packs'|'explore'|'dates';
export const STUDY_TOOLS:Sub[]=[
 {key:'mocks',href:'/mock',label:'page.mocks',icon:'mocks',blurb:'Full CET-style sets, timed or untimed, with an answer key.',match:p=>p.startsWith('/mock')},
 {key:'recall',href:'/review',label:'page.recall',icon:'recall',blurb:'A quick look at the ideas that are due today.',match:p=>p==='/review'},
 {key:'packs',href:'/packs',label:'page.packs',icon:'packs',blurb:'Topic packs that start short BACKTRACK rounds.',match:p=>p.startsWith('/packs')||p.startsWith('/create')}
];
/** The section's pages stay in its page-level navigation; the global menu stays flat. */
const FIX:Sub={key:'fix',href:'/start',label:'page.fix',icon:'start',match:p=>p==='/start'||p.startsWith('/start/')||p==='/route'||p.startsWith('/try/')};
/** The mistake notebook and explore ideas left the menus on 4 October at the owner's request.
 *  Their addresses still work, are found by search and still belong to Study. */
const OFF_MENU_STUDY=(p:string)=>p.startsWith('/study')||p.startsWith('/notebook')||p.startsWith('/explore');
const IN_REVIEWER=(p:string)=>p.startsWith('/reviewer')||p.startsWith('/learn/'),IN_COURSES=(p:string)=>p.startsWith('/bridge');
const REVIEWER:Sub={key:'reviewer',href:'/reviewer',label:'page.reviewer',icon:'reviewer',match:IN_REVIEWER};
/** College foundations: each field's first-year courses and the math and science they build on. */
const COURSES:Sub={key:'courses',href:'/bridge',label:'page.courses',icon:'courses',match:IN_COURSES};
export const EXAM_DATES_LINK:Sub={key:'dates',href:'/admissions',label:'page.dates',icon:'dates',match:p=>p.startsWith('/admissions')};

/** Four sections, in this order: Home, Study, Plan, Group. Plan opens exam dates
 *  and holds the calendar. Study holds the reviewers, courses, chosen topics and study tools.
 *  The learner's goal changes their personal shortcuts, not the Plan destination. */
function tabs():Tab[]{
 const plan:Sub[]=[{key:'calendar',href:'/calendar',label:'page.calendar',icon:'calendar',match:p=>p.startsWith('/calendar')},EXAM_DATES_LINK];
 return [
 {href:'/',key:'today',match:p=>p==='/',subs:[]},
 {href:'/reviewer',key:'study',match:p=>OFF_MENU_STUDY(p)||[REVIEWER,COURSES,...STUDY_TOOLS,FIX].some(x=>x.match(p)),subs:[REVIEWER,COURSES,...STUDY_TOOLS],bar:[FIX]},
 {href:'/admissions',key:'plan',match:p=>plan.some(x=>x.match(p)),subs:plan},
 {href:'/group',key:'group',match:p=>p.startsWith('/group')||p.startsWith('/together')||p.startsWith('/challenge'),subs:[]}
];}

const stroke={fill:'none',stroke:'currentColor',strokeWidth:1.9,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
export function NavIcon({k,small=false}:{k:IconKey;small?:boolean}){
 return <svg viewBox="0 0 24 24" className={small?'h-5 w-5 shrink-0':'h-6 w-6 shrink-0'} aria-hidden="true">{
  k==='today'?<><path d="M3 11 12 4l9 7M5 10v10h14V10" {...stroke}/><ellipse cx="12" cy="15" rx="2.5" ry="2" fill="currentColor"/></>:k==='calendar'?<><rect x="4" y="5" width="16" height="15" rx="2.5" {...stroke}/><path d="M8 3v4M16 3v4M4 10h16" {...stroke}/><ellipse cx="12" cy="15" rx="2.6" ry="1.9" fill="currentColor"/></>:
  k==='plan'?<path d="M5 19V5M5 7h11l-2 3 2 3H5" {...stroke}/>:
  k==='mocks'?<><rect x="5" y="3" width="14" height="18" rx="2" {...stroke}/><ellipse cx="9.5" cy="9" rx="1.8" ry="1.3" fill="currentColor"/><ellipse cx="9.5" cy="14" rx="1.8" ry="1.3" {...stroke}/><path d="M13 9h3M13 14h3" {...stroke}/></>:
  k==='reviewer'||k==='study'?<path d="M4 5.5C7 4 9.5 4.5 12 6c2.5-1.5 5-2 8-.5V19c-3-1.5-5.5-1-8 .5-2.5-1.5-5-2-8-.5ZM12 6v13.5" {...stroke}/>:
  k==='group'?<><circle cx="8" cy="9" r="3" {...stroke}/><circle cx="16.5" cy="10" r="2.5" {...stroke}/><path d="M3 19c.8-3 2.8-4.5 5-4.5s4.2 1.5 5 4.5M14 18.5c.5-2 1.8-3 3.3-3s2.7 1 3.2 3" {...stroke}/></>:
  k==='start'?<><path d="M9 14 4 9l5-5" {...stroke}/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" {...stroke}/></>:
  k==='recall'?<><path d="M20 12a8 8 0 1 1-2.4-5.7" {...stroke}/><path d="M20 4v5h-5" {...stroke}/></>:
  k==='notebook'?<><rect x="5" y="3" width="14" height="18" rx="2" {...stroke}/><path d="M9 3v18M12.5 8h3M12.5 12h3" {...stroke}/></>:
  k==='packs'?<><path d="m12 3 9 5-9 5-9-5 9-5Z" {...stroke}/><path d="m3 13 9 5 9-5" {...stroke}/></>:
  k==='explore'?<><circle cx="12" cy="12" r="9" {...stroke}/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" {...stroke}/></>:
  k==='dates'?<><rect x="4" y="5" width="16" height="15" rx="2.5" {...stroke}/><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4" {...stroke}/></>:
  k==='folder'?<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5Z" {...stroke}/>:
  k==='courses'?<path d="m2.5 9.5 9.5-5 9.5 5-9.5 5-9.5-5Zm4 2.3v5.2c3.5 2.6 7.5 2.6 11 0v-5.2M21 9.5v6" {...stroke}/>:
  k==='goal'?<><circle cx="12" cy="12" r="8" {...stroke}/><circle cx="12" cy="12" r="3.5" {...stroke}/></>:
  <path d="M12 5v14M5 12h14" {...stroke}/>
 }</svg>;
}

/** Everything that is a focused, full-screen activity hides the app chrome. */
const FOCUS=[/^\/mock\/take/];
const SIDEBAR_KEY='backtrack.sidebar.v1';
const Shell=createContext<{rail:boolean;setRail:(v:boolean)=>void}>({rail:false,setRail:()=>{}});

/** The page frame: top bar, sidebar on wide screens, phone bar below 1024 px.
 *  Content is offset by the sidebar's width, which the learner can narrow. */
export function AppShell({children}:{children:ReactNode}){
 const path=usePathname()||'/',focus=FOCUS.some(r=>r.test(path));
 const [rail,setRailState]=useState(false);
 useEffect(()=>{try{setRailState(localStorage.getItem(SIDEBAR_KEY)==='rail');}catch{}},[]);
 const setRail=(v:boolean)=>{setRailState(v);try{localStorage.setItem(SIDEBAR_KEY,v?'rail':'open');}catch{}};
 return <Shell.Provider value={{rail,setRail}}>
  <AppNav/>
  <div className={cx('transition-[padding] duration-200 motion-reduce:transition-none print:pl-0',!focus&&(rail?'lg:pl-[76px]':'lg:pl-[76px] xl:pl-60'))}><main id="main">{!focus&&<SectionBar/>}{children}</main><SiteFooter/></div>
 </Shell.Provider>;
}

/** The learner's sections, worked out from their goal and the current address. */
function useSections(){
 const guide=useProgramGuide(),{state}=useProgram(),path=usePathname()||'/';
 const goal=guide.browsing?undefined:learnerGoal(state);
 const list=tabs();
 return {list,active:list.find(x=>x.match(path))?.key,path,goal,lang:state.lang,label:(x:Tab)=>t(state.lang,`nav.${x.key}`)};
}

/** The current section's pages belong in the page, on every screen width. */
function SectionBar(){
 const {list,active,path,lang,label}=useSections(),tab=list.find(x=>x.key===active),bar=useRef<HTMLUListElement>(null);
 useEffect(()=>{bar.current?.querySelector('[aria-current=page]')?.scrollIntoView({block:'nearest',inline:'nearest'});},[path]);
 if(!tab?.subs.length)return null;
 const pages=[...tab.subs,...(tab.bar??[])],sub=pages.find(y=>y.match(path));
 return <nav aria-label={t(lang,'nav.sectionPages').replace('{section}',label(tab))} className="print:hidden mx-auto max-w-6xl px-4 pt-3 sm:px-8">
  <ul ref={bar} className="flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]">{pages.map(y=><li key={y.key} className="shrink-0">
   <Link href={y.href} aria-current={sub===y?'page':undefined} className={cx('relative flex min-h-11 items-center gap-2 whitespace-nowrap rounded-t-lg px-3 text-[14px] font-semibold focus-visible:outline-3 focus-visible:-outline-offset-2 focus-visible:outline-navy',sub===y?'text-navy':'text-ink-soft hover:text-navy')}>
    <NavIcon small k={y.icon}/><Headline>{t(lang,y.label)}</Headline>{sub===y&&<span aria-hidden="true" className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-sm bg-green"/>}
   </Link></li>)}</ul>
 </nav>;
}

type Rail='always'|'below-xl'|'never';
function SidebarContent({rail,list,active,path,goal,lang,label,onPick,main=false}:{rail:Rail;list:Tab[];active?:Key;path:string;goal:ReturnType<typeof learnerGoal>;lang:Lang;label:(x:Tab)=>string;onPick?:()=>void;main?:boolean}){
 const {state}=useProgram(),guide=useProgramGuide(),reduced=useQuietMotion();
 const hide=rail==='always'?'sr-only':rail==='below-xl'?'sr-only xl:not-sr-only':'';
 const center=rail==='always'?'justify-center px-0':rail==='below-xl'?'justify-center px-0 xl:justify-start xl:px-3':'px-3';
 const heading=cx('px-3 pb-1.5 pt-1 text-sm font-semibold text-ink-soft',rail==='always'?'hidden':rail==='below-xl'?'hidden xl:block':'');
 const item=(current:boolean,animated=false)=>cx('relative flex min-h-11 items-center gap-3 rounded-lg text-[15px] font-semibold text-navy hover:bg-white focus-visible:outline-3 focus-visible:-outline-offset-2 focus-visible:outline-navy',center,current&&!animated&&'bg-white shadow-sheet');
 /* Narrowing the sidebar keeps the four section names readable: each stacks a short label under its icon. */
 const stacked='min-h-14 flex-col justify-center gap-0.5 px-0 text-[11.5px] leading-tight';
 const section=(current:boolean,animated:boolean)=>cx('relative flex items-center rounded-lg font-semibold text-navy hover:bg-white focus-visible:outline-3 focus-visible:-outline-offset-2 focus-visible:outline-navy',rail==='never'?'min-h-11 gap-3 px-3 text-[15px]':rail==='always'?stacked:cx(stacked,'xl:min-h-11 xl:flex-row xl:justify-start xl:gap-3 xl:px-3 xl:text-[15px] xl:leading-normal'),current&&!animated&&'bg-white shadow-sheet');
 const tip=rail==='never'?undefined:true;
 const setup=state.setup,targets=examTargets(state),program=PROGRAM_BY_ID[state.bridgeProgram??''],concept=CONCEPT_BY_ID[setup?.concept??''];
 const mine:{href:string;title:string}[]=goal==='exam'?[...(setup?.cet?.general?[{href:'/reviewer',title:t(lang,'nav.generalCet')}]:[]),...targets.slice(0,5).map(x=>({href:'/admissions',title:x.name}))]:goal==='college'&&program?[{href:'/bridge/'+program.id,title:program.title}]:goal==='topic'&&concept?[{href:'/learn/'+concept.id,title:concept.title}]:[];
 return <>
  <nav aria-label={t(lang,main?'nav.main':'nav.all')} className="grid gap-1">
   {list.map(x=>{const on=active===x.key;return <Link key={x.key} href={x.href} onClick={onPick} {...(main?{'data-program-tour':x.key}:{})} aria-current={on?(x.href===path?'page':'true'):undefined} className={section(on,main)}>
     {main&&on&&<motion.span layoutId="tab-oval" transition={reduced?{duration:0}:SPRING} className="absolute inset-0 rounded-lg bg-white shadow-sheet"/>}
     <span className="relative"><NavIcon k={x.key}/></span><span className="relative"><Headline>{label(x)}</Headline></span>
    </Link>;})}
  </nav>
  <hr className="my-3 border-line"/>
  <p className={heading}>{t(lang,goal==='exam'?'nav.yourExams':goal==='college'?'nav.yourProgram':goal==='topic'?'nav.yourTopic':'nav.yourGoal')}</p>
  <ul aria-label={t(lang,'nav.yourGoal')} className="grid gap-1">
   {mine.map(x=><li key={x.title}><Link href={x.href} onClick={onPick} title={tip&&x.title} className={item(false)}><NavIcon k={goal==='exam'?'folder':'goal'}/><span className={cx('min-w-0 truncate',hide)}><Headline>{x.title}</Headline></span></Link></li>)}
   {goal==='exam'&&targets.length>5&&<li className={cx('px-3 text-sm text-ink-soft',hide)}>{t(lang,'nav.moreInPlan').replace('{n}',String(targets.length-5))}</li>}
   <li>{(()=>{const k=goal==='exam'?'nav.editExams':goal?'nav.changeGoal':'nav.setGoal';return <button type="button" onClick={()=>{onPick?.();guide.configure();}} title={tip&&t(lang,k)} className={cx(item(false),'w-full')}><NavIcon k="plus"/><span className={hide}><Headline>{t(lang,k)}</Headline></span></button>;})()}</li>
  </ul>

 </>;
}

export function AppNav(){
 const openTour=useProgramTour(),guide=useProgramGuide(),{rail}=useContext(Shell);
 const {state,update}=useProgram(),reduced=useQuietMotion(),{list,active,path,goal,lang,label}=useSections();
 const [menu,setMenu]=useState(false),button=useRef<HTMLButtonElement>(null),panel=useRef<HTMLDivElement>(null);
 const [drawer,setDrawer]=useState(false),[searching,setSearching]=useState(false),[scrolled,setScrolled]=useState(false);
 const burger=useRef<HTMLButtonElement>(null),drawerPanel=useRef<HTMLDivElement>(null);
 useEffect(()=>{setMenu(false);setDrawer(false);setSearching(false);},[path]);
 useEffect(()=>{const scroll=()=>setScrolled(scrollY>4);scroll();addEventListener('scroll',scroll,{passive:true});return()=>removeEventListener('scroll',scroll);},[]);
 useEffect(()=>{if(!menu)return;const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenu(false);button.current?.focus();}};const click=(e:MouseEvent)=>{if(!panel.current?.contains(e.target as Node)&&!button.current?.contains(e.target as Node))setMenu(false);};document.addEventListener('keydown',key);document.addEventListener('mousedown',click);return()=>{document.removeEventListener('keydown',key);document.removeEventListener('mousedown',click);};},[menu]);
 useEffect(()=>{
  if(!drawer)return;
  const previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  drawerPanel.current?.querySelector<HTMLElement>('a,button')?.focus();
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();close();}
   if(e.key!=='Tab')return;
   const items=drawerPanel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
   if(!items?.length)return;
   const first=items[0],last=items[items.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  };
  document.addEventListener('keydown',key);
  return()=>{document.body.style.overflow=previousOverflow;document.removeEventListener('keydown',key);};
 },[drawer]);
 const close=()=>{setDrawer(false);burger.current?.focus();};
 if(FOCUS.some(r=>r.test(path)))return null;
 const move=reduced?{duration:0}:SPRING;
 return <>
  <header className={cx('print:hidden sticky top-0 z-40 border-b bg-canvas text-navy',scrolled?'border-line':'border-transparent')}>
   <div className="flex h-16 items-center gap-1 px-2 sm:gap-2 sm:px-4">
    <button ref={burger} type="button" aria-label={t(lang,'nav.openMenu')} aria-expanded={drawer} onClick={()=>setDrawer(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-navy hover:bg-white focus-visible:outline-3 focus-visible:outline-navy">
     <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
    <Link href="/" aria-label={t(lang,'nav.home')} className="rounded-lg px-1 focus-visible:outline-3 focus-visible:outline-navy"><Wordmark small compact/></Link>
    <div className="flex min-w-0 flex-1 justify-center px-2 lg:px-6"><SiteSearch className="hidden w-full max-w-xl md:block"/></div>
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
     <button type="button" aria-label={t(lang,'nav.search')} aria-expanded={searching} onClick={()=>setSearching(!searching)} className="grid h-11 w-11 place-items-center rounded-lg text-navy hover:bg-white md:hidden"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg></button>
     <Link href="/create" aria-label={t(lang,'nav.create')} title={t(lang,'nav.create')} className="hidden h-10 w-10 place-items-center rounded-lg bg-green text-navy hover:bg-green-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy md:grid"><NavIcon k="plus"/></Link>
     <button data-guide-button onClick={e=>openTour(e.currentTarget)} className="min-h-11 rounded-lg px-3 text-sm font-semibold text-navy hover:bg-white focus-visible:outline-3 focus-visible:outline-navy">{t(lang,'nav.guide')}</button>
     <div className="relative">
      <button aria-label="Me" ref={button} aria-expanded={menu} aria-controls="me-menu" onClick={()=>setMenu(!menu)} className="flex min-h-11 items-center gap-2 rounded-lg px-2 min-[400px]:pr-3 text-[15px] font-semibold text-navy hover:bg-white aria-expanded:bg-white focus-visible:outline-3 focus-visible:outline-navy">
       <span className="grid h-7 w-7 place-items-center rounded-md bg-green text-navy" aria-hidden="true"><svg viewBox="0 0 24 24" className="h-4 w-4"><circle cx="12" cy="9" r="4" fill="currentColor"/><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" fill="currentColor"/></svg></span><span className="hidden min-[400px]:inline">{t(lang,'nav.me')}</span>
      </button>
      {menu&&<div ref={panel} id="me-menu" className="absolute right-0 top-14 w-72 rounded-xl border border-line bg-white p-2 text-navy shadow-lift">
       <button onClick={()=>{setMenu(false);guide.configure(button.current);}} className="flex min-h-11 w-full items-center rounded-lg px-3 text-left font-semibold hover:bg-sky"><Headline>{t(lang,'nav.changeGoalRoutine')}</Headline></button>
       {[['/calendar','me.calendar'],['/admissions','me.admissions'],['/bridge','me.bridge'],['/me','me.settings'],['/about','me.about']].map(([href,key])=><Link key={href} href={href} onClick={()=>setMenu(false)} className="flex min-h-11 items-center rounded-lg px-3 font-semibold hover:bg-sky"><Headline>{t(lang,key)}</Headline></Link>)}
       <div className="mt-1 flex items-center justify-between border-t border-line px-3 pt-2"><span className="text-sm font-semibold">{t(lang,'me.language')}</span>
        <div className="flex gap-1">{(['en','fil'] as const).map(l=><button key={l} aria-pressed={lang===l} onClick={()=>update(p=>({...p,lang:l}))} className="min-h-11 rounded-lg px-3 text-sm font-bold aria-pressed:bg-navy aria-pressed:text-white text-navy">{l==='en'?'English':'Filipino'}</button>)}</div>
       </div>
      </div>}
     </div>
    </div>
   </div>
   {searching&&<div className="px-3 pb-3 md:hidden"><SiteSearch autoFocus onDone={()=>setSearching(false)}/></div>}
  </header>
  <div data-sidebar className={cx('print:hidden fixed bottom-0 left-0 top-16 z-30 hidden overflow-y-auto overflow-x-hidden bg-canvas px-3 pb-6 pt-2 lg:block',rail?'w-[76px]':'w-[76px] xl:w-60')}>
   <SidebarContent main rail={rail?'always':'below-xl'} list={list} active={active} path={path} goal={goal} lang={lang} label={label}/>
  </div>
  {drawer&&<div role="dialog" aria-modal="true" aria-label={t(lang,'nav.menu')} className="print:hidden fixed inset-0 z-50">
   <div className="absolute inset-0 bg-navy-night/40" onClick={close}/>
   <div ref={drawerPanel} className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-canvas px-3 pb-6 pt-2 shadow-lift">
    <div className="mb-2 flex h-14 items-center justify-between"><span className="px-2"><Wordmark small/></span><button type="button" aria-label={t(lang,'nav.closeMenu')} onClick={close} className="grid h-11 w-11 place-items-center rounded-lg hover:bg-white"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
    <SidebarContent rail="never" list={list} active={active} path={path} goal={goal} lang={lang} label={label} onPick={()=>setDrawer(false)}/>
   </div>
  </div>}
  <nav aria-label={t(lang,'nav.main')} className="print:hidden fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] text-navy lg:hidden">
   <div className="grid grid-cols-4">
    {list.map(x=><Link key={x.key} href={x.href} data-program-tour={x.key} aria-current={active===x.key?(x.href===path?'page':'true'):undefined} className={cx('relative flex min-h-16 flex-col items-center justify-center gap-0.5 text-[12px] font-semibold',active===x.key?'text-navy':'text-ink-soft')}>
     {active===x.key&&<motion.span layoutId="tab-oval-m" transition={move} className="absolute inset-x-3 top-0 h-[3px] rounded-b-sm bg-green"/>}
     <span className="relative grid h-8 w-12 place-items-center"><NavIcon k={x.key}/></span>
     {label(x)}
    </Link>)}
   </div>
  </nav>
 </>;
}
