'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {useProgram} from './ProgramProvider';
import {Headline} from './Headline';
import {btn} from './ui';
import {DEFAULT_PROFILE_NAME,PROFILE_NAME_LIMIT} from '@/lib/program/profile';

export function ProfileNameField({value,onChange,autoFocus=false}:{value:string;onChange:(name:string)=>void;autoFocus?:boolean}){
 const hint=useId();
 return <div className="grid gap-2">
  <label className="grid gap-2 font-semibold">Your name (optional)<input autoFocus={autoFocus} autoComplete="nickname" maxLength={PROFILE_NAME_LIMIT} value={value} onChange={e=>onChange(e.target.value)} placeholder={DEFAULT_PROFILE_NAME} aria-describedby={hint} className="min-h-12 w-full rounded-xl border-2 border-line-strong bg-white px-3 text-base font-normal text-navy focus:border-navy focus:outline-none"/></label>
  <p id={hint} className="text-sm leading-relaxed text-ink-soft">Leave this blank to use Khanpanion. You can change it from Home any time.</p>
 </div>;
}

/** Native modal makes the background inert; Tab stays within the name controls. */
export function ProfileNameEditor({onClose}:{onClose:()=>void}){
 const {profileName,setProfileName}=useProgram(),[name,setName]=useState(profileName===DEFAULT_PROFILE_NAME?'':profileName);
 const dialog=useRef<HTMLDialogElement>(null),title=useId();
 useEffect(()=>{const el=dialog.current;el?.showModal();el?.querySelector('input')?.focus();return()=>el?.close();},[]);
 const close=()=>{dialog.current?.close();onClose();};
 return <dialog ref={dialog} aria-labelledby={title} onCancel={e=>{e.preventDefault();close();}} onClose={onClose} onKeyDown={e=>{
  if(e.key!=='Tab')return;
  const nodes=[...e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)')],index=nodes.indexOf(document.activeElement as HTMLElement);
  if(!nodes.length)return;e.preventDefault();nodes[index<0?(e.shiftKey?nodes.length-1:0):(index+(e.shiftKey?-1:1)+nodes.length)%nodes.length]?.focus();
 }} className="profile-name-dialog">
  <form onSubmit={e=>{e.preventDefault();setProfileName(name);dialog.current?.close();onClose();}}>
   <div className="mb-5 flex items-start justify-between gap-4"><h2 id={title} className="text-xl font-extrabold"><Headline>Your profile name</Headline></h2><button type="button" aria-label="Close name editor" onClick={close} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-sky focus-visible:outline-2 focus-visible:outline-navy"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
   <ProfileNameField value={name} onChange={setName} autoFocus/>
   <div className="mt-6 flex flex-wrap justify-end gap-2"><button type="button" className={btn.ghost} onClick={close}>Cancel</button><button type="submit" className={btn.primary}>Save Name</button></div>
  </form>
 </dialog>;
}
