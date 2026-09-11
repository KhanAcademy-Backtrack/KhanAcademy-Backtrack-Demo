'use client';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {useStudy} from './StudyProvider';
export function FractionScene({amount,parts,label,staticMode=false}:{amount:number;parts:number;label:string;staticMode?:boolean}){
 const reduced=useReducedMotion(),{state}=useStudy(),off=staticMode||!!reduced||state.settings.quiet;
 return <div className="amount-row"><strong>{label}</strong>{Array.from({length:Math.max(1,Math.ceil(amount))},(_,whole)=><svg key={whole} viewBox="0 0 480 52" role="img" aria-label={`${label}, whole ${whole+1}; equal-sized whole with ${parts} parts`}>
  <rect x="1" y="4" width="478" height="42" rx="3" fill="#edf4f3"/>
  <motion.rect className="fraction-amount" initial={false} animate={{width:478*Math.max(0,Math.min(1,amount-whole))}} transition={{duration:off?0:.5}} x="1" y="4" height="42" fill="#14bf96"/>
  <AnimatePresence>{Array.from({length:parts+1},(_,i)=><motion.path key={(i/parts).toFixed(8)} initial={off?false:{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}} exit={{pathLength:0,opacity:0}} transition={{duration:off?0:.42,delay:off?0:i*.012}} d={`M${1+i*478/parts} 4v42`} stroke="#0a2a66" strokeWidth="1.2"/>)}</AnimatePresence>
  <rect x="1" y="4" width="478" height="42" rx="3" fill="none" stroke="#0a2a66"/>
 </svg>)}</div>;
}
