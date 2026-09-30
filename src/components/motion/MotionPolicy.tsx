'use client';
import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {useReducedMotion} from 'motion/react';
import {useStudy} from '@/components/study/StudyProvider';

type Policy={reduced:boolean;quiet:boolean;typing:boolean;hidden:boolean;off:boolean};
const Context=createContext<Policy>({reduced:false,quiet:false,typing:false,hidden:false,off:false});
const ACTIVE_CONTROLS=new Set(['checkbox','radio','range','button','submit','reset','file','color','image']);

/** One focus/visibility subscription for every scene and feedback moment. */
export function MotionProvider({children}:{children:ReactNode}){
 const {state}=useStudy(),reduce=useReducedMotion();
 const [typing,setTyping]=useState(false),[hidden,setHidden]=useState(false);
 useEffect(()=>{
  const focus=()=>{const el=document.activeElement;setTyping(el instanceof HTMLElement&&(el.isContentEditable||el.tagName==='TEXTAREA'||(el instanceof HTMLInputElement&&!ACTIVE_CONTROLS.has(el.type))));};
  const visibility=()=>setHidden(document.hidden);
  focus();visibility();document.addEventListener('focusin',focus);document.addEventListener('focusout',focus);document.addEventListener('visibilitychange',visibility);
  return()=>{document.removeEventListener('focusin',focus);document.removeEventListener('focusout',focus);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 const quiet=state.settings.quiet,reduced=!!reduce;
 const value=useMemo(()=>({quiet,reduced,typing,hidden,off:quiet||reduced||typing||hidden}),[quiet,reduced,typing,hidden]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function MotionScope({still,children}:{still:boolean;children:ReactNode}){
 const policy=useContext(Context),value=useMemo(()=>({...policy,off:policy.off||still}),[policy,still]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMotionPolicy(still=false){const policy=useContext(Context);return {...policy,off:policy.off||still};}
