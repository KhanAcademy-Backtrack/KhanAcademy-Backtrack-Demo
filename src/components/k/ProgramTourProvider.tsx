'use client';
import {Component,createContext,lazy,Suspense,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {btn} from './ui';

const Tour=lazy(()=>import('./ProgramTour').then(m=>({default:m.ProgramTour})));
type OpenTour=(returnFocus?:HTMLElement|null)=>void;
const Context=createContext<OpenTour|null>(null);

function TourMessage({onClose,failed=false}:{onClose:()=>void;failed?:boolean}){
 return <div className="fixed inset-0 z-[70] grid place-items-center bg-navy-night/80 p-4 print:hidden"><div role="dialog" aria-modal="true" aria-label={failed?'Quick tour unavailable':'Opening quick tour'} onKeyDown={e=>{if(e.key==='Tab')e.preventDefault();}} className="max-w-sm rounded-[22px] bg-white p-6 text-navy"><p role="status">{failed?'The tour couldn’t open. You can close it and keep studying.':'Opening the quick tour…'}</p><button autoFocus className={btn.ghost} onClick={onClose}>Close tour</button></div></div>;
}
class TourBoundary extends Component<{onClose:()=>void;children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<TourMessage failed onClose={this.props.onClose}/>:this.props.children;}
}

/** An optional, replayable tour. It never changes a plan, answer or learning record. */
export function ProgramTourProvider({children}:{children:ReactNode}){
 const [open,setOpen]=useState(false),opener=useRef<HTMLElement|null>(null),wasOpen=useRef(false);
 const path=usePathname();
 const close=useCallback(()=>setOpen(false),[]);
 const start=useCallback((returnFocus?:HTMLElement|null)=>{opener.current=returnFocus??(document.activeElement instanceof HTMLElement?document.activeElement:null);setOpen(true);},[]);
 useEffect(()=>setOpen(false),[path]);
 useEffect(()=>{
  if(!open){if(wasOpen.current&&opener.current?.isConnected)opener.current.focus({preventScroll:true});wasOpen.current=false;return;}
  wasOpen.current=true;
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();close();}};
  document.addEventListener('keydown',escape);
  return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',escape);};
 },[open,close]);
 return <Context.Provider value={start}>
  <div inert={open}>{children}</div>
  {open&&<TourBoundary onClose={close}><Suspense fallback={<TourMessage onClose={close}/>}><Tour onClose={close}/></Suspense></TourBoundary>}
 </Context.Provider>;
}
export function useProgramTour(){const open=useContext(Context);if(!open)throw Error('ProgramTourProvider is required');return open;}
export function ProgramTourButton({className,label='Show me around'}:{className?:string;label?:string}){
 const open=useProgramTour();return <button type="button" className={className??btn.ghost} onClick={()=>open()}>{label}</button>;
}
