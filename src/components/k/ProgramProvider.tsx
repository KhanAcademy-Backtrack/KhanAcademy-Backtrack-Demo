'use client';
import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {PROGRAM_KEY,initialProgram,loadProgram,tidy,validProgram,type ProgramState} from '@/lib/program/store';
import {toDay} from '@/lib/program/planner';

type Api={state:ProgramState;ready:boolean;warning:string;today:string;update:(fn:(s:ProgramState)=>ProgramState)=>void;flush:()=>void};
const Context=createContext<Api|null>(null);

/** Holds the device-local program save beside the study space. Writes are
 *  immediate, and the latest state is written again on pagehide so a reload or a
 *  closed tab never loses an answer. */
export function ProgramProvider({children}:{children:ReactNode}){
 const [state,setState]=useState(initialProgram),[ready,setReady]=useState(false),[warning,setWarning]=useState(''),[today,setToday]=useState('');
 const live=useRef(state);
 const write=useCallback((s:ProgramState)=>{try{localStorage.setItem(PROGRAM_KEY,JSON.stringify(s));}catch{setWarning('This browser cannot save your plan. Export a backup from Me.');}},[]);
 const update=useCallback((fn:(s:ProgramState)=>ProgramState)=>{const next=fn(live.current);if(next===live.current)return;const t=tidy({...next,updatedAt:Date.now()});live.current=t;setState(t);write(t);},[write]);
 const flush=useCallback(()=>write(live.current),[write]);
 useEffect(()=>{
  try{const r=loadProgram(localStorage,Date.now());live.current=r.state;setState(r.state);setWarning(r.warning);}catch{setWarning('Saved plans could not be opened in this browser.');}
  const updateDay=()=>setToday(new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Manila'}));updateDay();setReady(true);
  const dayTimer=setInterval(updateDay,30000);window.addEventListener('focus',updateDay);document.addEventListener('visibilitychange',updateDay);
  const sync=(e:StorageEvent)=>{if(e.key!==PROGRAM_KEY||!e.newValue)return;try{const n=JSON.parse(e.newValue);if(validProgram(n)&&n.updatedAt>=live.current.updatedAt){live.current=n;setState(n);}}catch{}};
  const cleared=()=>{live.current=initialProgram();setState(live.current);};
  const hide=()=>write(live.current);
  window.addEventListener('storage',sync);window.addEventListener('backtrack:cleared',cleared);window.addEventListener('pagehide',hide);
  return()=>{clearInterval(dayTimer);window.removeEventListener('focus',updateDay);document.removeEventListener('visibilitychange',updateDay);window.removeEventListener('storage',sync);window.removeEventListener('backtrack:cleared',cleared);window.removeEventListener('pagehide',hide);};
 },[write]);
 const api=useMemo(()=>({state,ready,warning,today,update,flush}),[state,ready,warning,today,update,flush]);
 return <Context.Provider value={api}>{ready?<>{warning&&<p role="status" className="bg-mint px-5 py-3 font-semibold text-navy print:hidden">{warning}</p>}{children}</>:<div role="status" aria-label="Opening your study program" className="min-h-screen bg-navy"/>}</Context.Provider>;
}
export function useProgram(){const c=useContext(Context);if(!c)throw Error('ProgramProvider is required');return c;}
