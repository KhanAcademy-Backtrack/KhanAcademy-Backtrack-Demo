'use client';
import {memo,useEffect,useRef,useState} from 'react';
import type {ComponentProps} from 'react';
import {animate,motion,useMotionValue,useReducedMotion,useTransform} from 'motion/react';
import {useStudy} from './StudyProvider';
import {DUR,EASE,SPRING} from '@/lib/motion-tokens';
export type BuddyPose='idle'|'curious'|'thinking'|'point'|'aha'|'encourage'|'wave';

/** Typing pauses every nonessential movement, including the blink. Sliders,
 *  checkboxes and buttons are not typing: they drive the scenes. */
const NOT_TYPING=['checkbox','radio','range','button','submit','reset','file','color','image'];

/* Every mouth is one cubic curve and every arm one quadratic, written with the same
   commands, so any expression morphs into any other by interpolating numbers.
   All smiles open upward; there is no line under the mouth. */
const FACES:Record<BuddyPose,{mouth:string;arms:[string,string];tilt:number;eyes:number;brows:boolean}>={
 idle:{mouth:'M50 60C55 70 73 70 78 60',arms:['M32 64Q18 69 17 58','M94 65Q105 57 104 51'],tilt:0,eyes:1,brows:false},
 curious:{mouth:'M53 62C58 68 70 68 75 61',arms:['M32 64Q18 69 17 58','M94 65Q107 66 111 59'],tilt:-5,eyes:1.1,brows:true},
 thinking:{mouth:'M54 63C59 67 69 67 74 62',arms:['M32 64Q23 76 28 80','M94 65Q105 59 84 58'],tilt:4,eyes:.85,brows:true},
 point:{mouth:'M50 60C55 70 73 70 78 60',arms:['M32 64Q18 69 17 58','M94 62Q109 58 117 47'],tilt:3,eyes:1,brows:false},
 aha:{mouth:'M48 58C53 76 75 76 80 58',arms:['M32 61Q19 55 15 44','M94 60Q107 53 109 41'],tilt:-3,eyes:1.12,brows:false},
 encourage:{mouth:'M49 59C54 72 74 72 79 59',arms:['M32 64Q18 62 11 66','M94 64Q107 60 115 63'],tilt:2,eyes:.92,brows:false},
 wave:{mouth:'M48 59C54 73 74 73 80 59',arms:['M32 64Q18 69 17 58','M94 61Q108 44 105 33'],tilt:-4,eyes:1,brows:false}
};
const NUMBER=/-?\d+(?:\.\d+)?/g;
const shapeOf=(d:string)=>d.replace(NUMBER,'#');
function morph(from:string,to:string,t:number){
 if(t>=1||shapeOf(from)!==shapeOf(to))return to;
 const start=from.match(NUMBER)!.map(Number);let i=0;
 return to.replace(NUMBER,n=>{const a=start[i++];return String(Math.round((a+(Number(n)-a)*t)*100)/100);});
}
function MorphPath({d,off,...rest}:{d:string;off:boolean}&Omit<ComponentProps<typeof motion.path>,'d'>){
 const t=useMotionValue(1),from=useRef(d),to=useRef(d);
 const shape=useTransform(t,v=>morph(from.current,to.current,v));
 useEffect(()=>{
  if(to.current===d)return;
  from.current=morph(from.current,to.current,t.get());to.current=d;
  if(off){t.set(1);return;}
  t.set(0);const run=animate(t,1,{duration:DUR.base,ease:EASE as unknown as [number,number,number,number]});return()=>run.stop();
 },[d,off,t]);
 return <motion.path {...rest} d={shape}/>;
}

/** An occasional blink at a natural, irregular interval. Never while typing, never
 *  in the quiet or static modes. */
function useBlink(off:boolean){
 const [closed,setClosed]=useState(false);
 useEffect(()=>{
  if(off){setClosed(false);return;}
  let timer:ReturnType<typeof setTimeout>;
  const schedule=()=>{timer=setTimeout(()=>{setClosed(true);timer=setTimeout(()=>{setClosed(false);schedule();},130);},3200+Math.random()*4200);};
  schedule();return()=>clearTimeout(timer);
 },[off]);
 return closed;
}

function Bookmark({accessory='none',size=120,pose='idle',still=false}:{accessory?:'none'|'leaf'|'star'|'sun';size?:number;pose?:BuddyPose;still?:boolean}){
 const reduced=useReducedMotion(),{state}=useStudy(),[hello,setHello]=useState(false),[typing,setTyping]=useState(false);
 useEffect(()=>{const sync=()=>{const el=document.activeElement as HTMLInputElement|null;setTyping(!!el&&(el.matches('textarea')||(el.matches('input')&&!NOT_TYPING.includes(el.type))));};document.addEventListener('focusin',sync);document.addEventListener('focusout',sync);return()=>{document.removeEventListener('focusin',sync);document.removeEventListener('focusout',sync);};},[]);
 useEffect(()=>{if(!hello)return;const timer=setTimeout(()=>setHello(false),900);return()=>clearTimeout(timer);},[hello]);
 const off=still||!!reduced||state.settings.quiet||typing;
 const shown:BuddyPose=hello&&!off?'wave':pose,face=FACES[shown];
 const blink=useBlink(off);
 const move=off?{duration:0}:SPRING;
 return <motion.svg className="study-companion expressive-buddy" data-pose={shown} width={size} height={size} viewBox="0 0 128 124" role="img" aria-label={`Khanpanion’s bookmark study buddy, ${shown==='wave'?'waving hello':shown}`} onPointerDown={()=>setHello(true)}>
  <ellipse cx="63" cy="113" rx="29" ry="4" fill="#0a2a66" opacity=".09"/>
  <motion.g style={{transformOrigin:'63px 90px'}} animate={{rotate:face.tilt,y:shown==='aha'?-3:0}} transition={move}>
   {face.arms.map((d,i)=><MorphPath key={i} d={d} off={off} stroke="#14bf96" strokeWidth="7" fill="none" strokeLinecap="round"/>)}
   <path d="M32 18Q32 9 42 9H78L94 25V96Q94 103 86 101L63 89 40 101Q32 105 32 95Z" fill="#14bf96"/>
   <path d="M78 9V26H94" fill="#a1ebd7"/>
   {[50,76].map(cx=><motion.g key={cx} style={{transformOrigin:`${cx}px 46px`}} animate={{scaleY:blink?.1:face.eyes}} transition={off?{duration:0}:{duration:blink?.07:DUR.base}}>
    <ellipse cx={cx} cy="46" rx="4.5" ry="6.5" fill="#0a2a66"/><circle cx={cx+1.2} cy="43.5" r="1.2" fill="white" opacity=".85"/>
   </motion.g>)}
   <motion.path d="M43 34Q49 30 55 33M70 32Q76 29 82 33" fill="none" stroke="#0a2a66" strokeWidth="2.5" strokeLinecap="round" initial={false} animate={{opacity:face.brows?1:0}} transition={off?{duration:0}:{duration:DUR.fast}}/>
   <MorphPath d={face.mouth} off={off} stroke="#0a2a66" strokeWidth="3.3" fill={shown==='aha'?'#0a2a66':'none'} strokeLinecap="round"/>
   <ellipse cx="40" cy="57" rx="5" ry="3" fill="#a1ebd7" opacity=".65"/><ellipse cx="86" cy="57" rx="5" ry="3" fill="#a1ebd7" opacity=".65"/>
   {accessory==='leaf'&&<path d="M80 18Q84 0 103 5Q101 24 80 18" fill="#bdd979" stroke="#375e21" strokeWidth="2"/>}
   {accessory==='star'&&<path d="M88 0 92 11 104 12 94 20 97 31 88 25 77 31 81 19 72 11 84 10Z" fill="#f4c45d" stroke="#8d6316" strokeWidth="2"/>}
   {accessory==='sun'&&<g stroke="#b77416" strokeWidth="2.5"><circle cx="91" cy="13" r="11" fill="#ffd474"/><path d="M91 0V2M91 27V31M74 13H71M107 13H111"/></g>}
  </motion.g>
  {shown==='aha'&&<motion.path initial={off?false:{opacity:0,scale:.6}} animate={{opacity:1,scale:1}} transition={off?{duration:0}:{duration:DUR.base}} style={{transformOrigin:'112px 13px'}} d="M106 7v7M118 18h-6M114 8l-5 5" stroke="#0a2a66" strokeWidth="2.5" strokeLinecap="round"/>}
 </motion.svg>;
}

export const Companion=memo(Bookmark);
