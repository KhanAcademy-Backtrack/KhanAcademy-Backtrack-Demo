'use client';
import {memo,useEffect,useState} from 'react';
import {motion} from 'motion/react';
import {useStudy} from './StudyProvider';
import {useMotionPolicy} from '@/components/motion/MotionPolicy';
import {DUR,tween} from '@/lib/motion-tokens';
export type BuddyPose='idle'|'curious'|'thinking'|'point'|'aha'|'encourage'|'wave';
const ARMS:Record<BuddyPose,[number,number]>={idle:[0,34],curious:[0,36],thinking:[-12,46],point:[0,0],aha:[40,-10],encourage:[-22,52],wave:[0,-12]};
function useBlink(off:boolean){
 const [closed,setClosed]=useState(false);
 useEffect(()=>{if(off){setClosed(false);return;}let timer:ReturnType<typeof setTimeout>;const next=()=>{timer=setTimeout(()=>{setClosed(true);timer=setTimeout(()=>{setClosed(false);next();},DUR.fast*1000);},6000+Math.random()*5000);};next();return()=>clearTimeout(timer);},[off]);
 return closed;
}
/** A fixed friendly smile and two shoulder pivots. Expressions use transforms,
 * never SVG path morphs, breathing, squashing or a second line under the mouth. */
function Bookmark({accessory='none',size=120,pose='idle',still=false}:{accessory?:'none'|'leaf'|'star'|'sun';size?:number;pose?:BuddyPose;still?:boolean}){
 const {off}=useMotionPolicy(still),{state}=useStudy(),[hello,setHello]=useState(false);
 useEffect(()=>{if(!hello)return;if(off){setHello(false);return;}const timer=setTimeout(()=>setHello(false),DUR.slow*2*1000);return()=>clearTimeout(timer);},[hello,off]);
 const shown=hello&&!off?'wave':pose,arms=ARMS[shown],blink=useBlink(off||hello),move=tween(off);
 const greet=()=>{if(!off)setHello(true);};
 return <motion.svg className="study-companion expressive-buddy rounded-xl focus-visible:outline-3 focus-visible:outline-green" data-pose={shown} width={size} height={size} viewBox="0 0 128 124" role="img" tabIndex={0} aria-label={`Khanpanion’s bookmark study buddy, ${shown==='wave'?'waving hello':shown}`} onPointerDown={greet} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();greet();}}}>
  <ellipse cx="63" cy="113" rx="29" ry="4" fill="#0a2a66" opacity=".09"/>
  <motion.g style={{originX:'32px',originY:'64px',transformBox:'view-box'}} initial={false} animate={{rotate:arms[0]}} transition={move}><path d="M32 64Q19 66 13 57" stroke="#14bf96" strokeWidth="7" fill="none" strokeLinecap="round"/></motion.g>
  <motion.g style={{originX:'94px',originY:'62px',transformBox:'view-box'}} initial={false} animate={{rotate:arms[1]}} transition={move}><path d="M94 62Q107 55 109 41" stroke="#14bf96" strokeWidth="7" fill="none" strokeLinecap="round"/></motion.g>
  <path d="M32 18Q32 9 42 9H78L94 25V96Q94 103 86 101L63 89 40 101Q32 105 32 95Z" fill="#14bf96"/>
  <path d="M78 9V26H94" fill="#a1ebd7"/>
  {[50,76].map(cx=><motion.g key={cx} style={{originX:`${cx}px`,originY:'46px',transformBox:'view-box'}} initial={false} animate={{scaleY:blink?.08:1}} transition={tween(off,DUR.fast)}><ellipse className="buddy-eye" cx={cx} cy="46" rx="4.5" ry="6.5" fill="#0a2a66"/><circle cx={cx+1.2} cy="43.5" r="1.2" fill="white" opacity=".85"/></motion.g>)}
  <motion.path d="M43 34Q49 30 55 33M70 32Q76 29 82 33" fill="none" stroke="#0a2a66" strokeWidth="2.5" strokeLinecap="round" initial={false} animate={{opacity:shown==='curious'||shown==='thinking'?1:0}} transition={move}/>
  <path d="M49 59C54 72 74 72 79 59" stroke="#0a2a66" strokeWidth="3.3" fill="none" strokeLinecap="round"/>
  <ellipse cx="40" cy="57" rx="5" ry="3" fill="#a1ebd7" opacity=".65"/><ellipse cx="86" cy="57" rx="5" ry="3" fill="#a1ebd7" opacity=".65"/>
  {(accessory==='leaf'||state.settings.accessory==='leaf')&&<path d="M80 18Q84 0 103 5Q101 24 80 18" fill="#a1ebd7" stroke="#0a2a66" strokeWidth="2"/>}
  {accessory==='star'&&<path d="M88 0 92 11 104 12 94 20 97 31 88 25 77 31 81 19 72 11 84 10Z" fill="#e7f9f3" stroke="#0a2a66" strokeWidth="2"/>}
  {accessory==='sun'&&<g stroke="#0a2a66" strokeWidth="2.5"><circle cx="91" cy="13" r="11" fill="#e7f9f3"/><path d="M91 0V2M91 27V31M74 13H71M107 13H111"/></g>}
  {shown==='aha'&&<motion.path initial={off?false:{opacity:0}} animate={{opacity:1}} transition={tween(off,DUR.fast)} d="M106 7v7M118 18h-6M114 8l-5 5" stroke="#0a2a66" strokeWidth="2.5" strokeLinecap="round"/>}
 </motion.svg>;
}
export const Companion=memo(Bookmark);
