'use client';
import {Component,createContext,lazy,Suspense,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {useProgram} from './ProgramProvider';
import {btn} from './ui';

const Tour=lazy(()=>import('./ProgramTour').then(m=>({default:m.ProgramTour})));
const Setup=lazy(()=>import('./GoalSetup').then(m=>({default:m.GoalSetup})));
type Mode='closed'|'setup'|'tour'|'calendar';
type Api={start:(focus?:HTMLElement|null)=>void;configure:(focus?:HTMLElement|null)=>void;finishSetup:()=>void;calendarGuide:boolean;browsing:boolean;browseNow:()=>void;continueGuide:()=>void;close:()=>void};
const Context=createContext<Api|null>(null);
function TourMessage({onClose,failed=false}:{onClose:()=>void;failed?:boolean}){return <div className="fixed inset-0 z-[70] grid place-items-center bg-navy-night/55 p-4 print:hidden"><div role="dialog" aria-modal="true" aria-label={failed?'Guide unavailable':'Opening guide'} onKeyDown={e=>{if(e.key==='Tab')e.preventDefault();}} className="max-w-sm rounded-[22px] bg-white p-6 text-navy"><p role="status">{failed?'The guide couldn’t open. You can close it and keep studying.':'Opening your guide…'}</p><button autoFocus className={btn.ghost} onClick={onClose}>Close guide</button></div></div>;}
class TourBoundary extends Component<{onClose:()=>void;children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<TourMessage failed onClose={this.props.onClose}/>:this.props.children;}}

export function ProgramTourProvider({children}:{children:ReactNode}){
 const {state}=useProgram(),path=usePathname(),router=useRouter();
 const [mode,setMode]=useState<Mode>('closed'),[step,setStep]=useState(0),[browsing,setBrowsing]=useState(false),[entry,setEntry]=useState(false);
 const choice=useRef(false);
 const rememberChoice=(intent:string)=>{choice.current=true;try{sessionStorage.setItem('backtrack.entry.choice',intent);}catch{}};
 const opener=useRef<HTMLElement|null>(null),wasLocked=useRef(false),pendingHome=useRef(false),setupDialog=useRef<HTMLDivElement>(null);
 const locked=mode==='setup'||mode==='tour';
 const close=useCallback(()=>{if(!choice.current){choice.current=true;try{sessionStorage.setItem('backtrack.entry.choice','browse');}catch{}setBrowsing(true);setStep(0);setMode('tour');}else setMode('closed');},[]);
 const browseNow=()=>{rememberChoice('browse');setBrowsing(true);setStep(0);setMode('tour');};
 const remember=(focus?:HTMLElement|null)=>{opener.current=focus??(document.activeElement instanceof HTMLElement?document.activeElement:null);};
 const start=(focus?:HTMLElement|null)=>{remember(focus);setStep(0);setEntry(!choice.current);setMode(choice.current&&(browsing||state.setup)?'tour':'setup');};
 const configure=(focus?:HTMLElement|null)=>{remember(focus);setEntry(false);setMode('setup');};
 const finishSetup=()=>{rememberChoice('study');setBrowsing(false);setEntry(false);setStep(0);window.scrollTo({top:0,behavior:'instant'});if(path==='/')setMode('tour');else{pendingHome.current=true;setMode('closed');router.push('/');}};
 useEffect(()=>{if(pendingHome.current&&path==='/'){pendingHome.current=false;setMode('tour');return;}if(mode==='calendar'&&path==='/calendar')return;setMode('closed');},[path]);
 useEffect(()=>{
  let intent:string|null=null;try{intent=sessionStorage.getItem('backtrack.entry.choice');}catch{}
  choice.current=!!intent;setBrowsing(intent==='browse');
  const url=new URL(location.href),requested=url.searchParams.get('guide')==='1',focused=path.startsWith('/mock/take')||path.startsWith('/mock/print')||(path==='/demo'&&url.searchParams.get('tour')==='1')||(path==='/group'&&(url.searchParams.has('join')||state.group)&&!requested);
  if(!focused&&(!intent||requested)){setStep(0);setEntry(!intent);setMode(!intent||(!state.setup&&intent!=='browse')?'setup':'tour');}
  if(requested){url.searchParams.delete('guide');history.replaceState(history.state,'',url.href);}
 },[]);
 useEffect(()=>{
  if(!locked){if(wasLocked.current){const el=opener.current?.isConnected?opener.current:document.querySelector<HTMLElement>('[data-guide-button]');el?.focus({preventScroll:true});}wasLocked.current=false;return;}
  wasLocked.current=true;const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();close();}};document.addEventListener('keydown',escape);
  return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',escape);};
 },[locked,close]);
 function trap(e:React.KeyboardEvent){if(e.key!=='Tab')return;const nodes=[...setupDialog.current!.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,textarea')],index=nodes.indexOf(document.activeElement as HTMLElement);e.preventDefault();nodes[index<0?(e.shiftKey?nodes.length-1:0):(index+(e.shiftKey?-1:1)+nodes.length)%nodes.length]?.focus();}
 const api:Api={start,configure,finishSetup,calendarGuide:mode==='calendar',browsing,browseNow,continueGuide:()=>{setStep(x=>x+1);setMode('tour');},close};
 return <Context.Provider value={api}><div inert={locked} aria-hidden={locked||undefined}>{children}</div>{locked&&<TourBoundary onClose={close}><Suspense fallback={mode==='setup'?<div className="fixed inset-0 z-[70] bg-white print:hidden"/>:<TourMessage onClose={close}/>}>
  {mode==='setup'?<div ref={setupDialog} role="dialog" aria-modal="true" aria-labelledby="goal-dialog-title" onKeyDown={trap} className="fixed inset-0 z-[70] h-dvh bg-white text-navy print:hidden"><Setup modal entry={entry} onSaved={finishSetup} onCancel={close} onBrowse={browseNow}/></div>
   :<Tour browsing={browsing} step={step} onStep={setStep} onClose={close} onCalendar={()=>{setMode('calendar');router.push('/calendar');}}/>}
 </Suspense></TourBoundary>}</Context.Provider>;
}
export function useProgramGuide(){const api=useContext(Context);if(!api)throw Error('ProgramTourProvider is required');return api;}
export function useProgramTour(){return useProgramGuide().start;}
export function ProgramTourButton({className,label='Show me around'}:{className?:string;label?:string}){const open=useProgramTour();return <button type="button" className={className??btn.ghost} onClick={()=>open()}>{label}</button>;}
export function ChangeGoalButton({className,label='Change my goal or routine'}:{className?:string;label?:string}){const api=useProgramGuide();return <button type="button" className={className??btn.ghost} onClick={()=>api.configure()}>{label}</button>;}
export function CalendarGuide(){const api=useProgramGuide();if(!api.calendarGuide)return null;return <section aria-label="Calendar guide" className="mb-5 rounded-[22px] border-2 border-green bg-mint p-5 text-navy"><h2 className="text-xl font-extrabold">Try your calendar</h2><p className="mt-2 max-w-2xl leading-relaxed">Pick a day to see its sessions. Add an event, or use Edit and Move on a session. Your changes are saved in this browser.</p><div className="mt-3 flex flex-wrap gap-2"><button className={btn.primary} onClick={api.continueGuide}>Continue guide</button><button className={btn.text} onClick={api.close}>Finish here</button></div></section>;}
