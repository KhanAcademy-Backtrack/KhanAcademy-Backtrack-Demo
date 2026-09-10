'use client';
import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {STUDY_KEY,initialStudy,validStudy,ingestRecovery,type StudyState} from '@/lib/study';
import {validRecovery,type Recovery} from '@/lib/recovery';
import {DEVICE_RESET_KEY,clearBacktrackActivity} from '@/lib/device-data';
import {loadStudy,restoreStudy} from '@/lib/study-storage';

type StudyApi={state:StudyState;ready:boolean;storageIssue:string;update:(fn:(s:StudyState)=>StudyState)=>void;ingest:(r:Recovery)=>void;clear:()=>boolean;restore:(next:StudyState)=>boolean};
const Context=createContext<StudyApi|null>(null);
export function StudyProvider({children}:{children:ReactNode}){
  const [state,setState]=useState(initialStudy),[ready,setReady]=useState(false),[storageIssue,setStorageIssue]=useState('');const live=useRef(state),blocked=useRef(false);
  const update=useCallback((fn:(s:StudyState)=>StudyState)=>{const next=fn(live.current);if(next===live.current)return;live.current=next;setState(next);if(blocked.current)return;try{localStorage.setItem(STUDY_KEY,JSON.stringify(next));}catch{setStorageIssue('This browser cannot save your study space. Export your progress before leaving.');}},[]);
  useEffect(()=>{try{const result=loadStudy(localStorage,Date.now());blocked.current=result.writesBlocked;live.current=result.state;setState(result.state);setStorageIssue(result.warning);}catch{blocked.current=true;setStorageIssue('This browser cannot save your study space. You can still study and export your progress.');}setReady(true);
    const sync=(e:StorageEvent)=>{if(e.key===DEVICE_RESET_KEY){const clean=initialStudy();live.current=clean;setState(clean);}else if(e.key===STUDY_KEY&&e.newValue){try{const next=JSON.parse(e.newValue);if(validStudy(next)&&next.updatedAt>=live.current.updatedAt){live.current=next;setState(next);}}catch{}}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);
  },[]);
  const ingest=useCallback((route:Recovery)=>update(s=>ingestRecovery(s,route,Date.now())),[update]);
  const clear=useCallback(()=>{try{clearBacktrackActivity(localStorage,Date.now());blocked.current=false;update(()=>initialStudy());setStorageIssue('');window.dispatchEvent(new Event('backtrack:cleared'));return true;}catch{setStorageIssue('The browser could not clear all saved activity. Clear site data in browser settings.');return false;}},[update]);
  const restore=useCallback((next:StudyState)=>{if(!validStudy(next))return false;try{const restored=restoreStudy(localStorage,next,Date.now());blocked.current=false;live.current=restored;setState(restored);setStorageIssue('');window.dispatchEvent(new Event('backtrack:cleared'));return true;}catch{setStorageIssue('The browser could not restore this file. A backup is kept if the restore had started.');return false;}},[]);
  const api=useMemo(()=>({state,ready,storageIssue,update,ingest,clear,restore}),[state,ready,storageIssue,update,ingest,clear,restore]);
  return <Context.Provider value={api}><div className={`study-root tone-${state.settings.style} ${state.settings.quiet?'quiet-mode':''}`} data-quiet={state.settings.quiet}>{children}</div></Context.Provider>;
}
export function useStudy(){const c=useContext(Context);if(!c)throw Error('StudyProvider is required');return c;}
