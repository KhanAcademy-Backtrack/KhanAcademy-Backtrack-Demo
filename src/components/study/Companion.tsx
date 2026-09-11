'use client';
import {memo,useEffect,useRef,useState} from 'react';
import type {ComponentProps} from 'react';
import {animate,motion,useMotionValue,useReducedMotion,useTransform} from 'motion/react';
import {useStudy} from './StudyProvider';
export type BuddyPose='idle'|'curious'|'thinking'|'point'|'aha'|'encourage'|'wave';
/** Nonessential movement pauses while a learner is writing an answer. A checkbox,
 *  a stepper or a range slider is not writing: those are how the scenes are driven,
 *  and the companion should keep reacting while they are used. */
const NOT_TYPING=['checkbox','radio','range','button','submit','reset','file','color','image'];
const FACES:Record<BuddyPose,{mouth:string;arms:string;tilt:number;eyes:number}>={
 idle:{mouth:'M49 60C54 72 74 72 79 60',arms:'M32 64Q18 69 17 58M94 65Q105 57 104 51',tilt:0,eyes:1},
 curious:{mouth:'M53 63C60 69 70 69 77 60',arms:'M32 64Q18 69 17 58M94 65Q107 66 111 59',tilt:-5,eyes:1.12},
 thinking:{mouth:'M54 64C60 68 69 68 75 62',arms:'M32 64Q23 76 28 80M94 65Q105 59 80 60',tilt:5,eyes:.78},
 point:{mouth:'M49 60C54 72 74 72 79 60',arms:'M32 64Q18 69 17 58M94 62Q109 58 117 47',tilt:3,eyes:1},
 aha:{mouth:'M47 57C52 79 76 79 81 57',arms:'M32 61Q19 55 15 44M94 60Q107 53 109 41',tilt:-3,eyes:1.18},
 encourage:{mouth:'M48 59C54 74 75 74 81 59',arms:'M32 64Q18 62 11 66M94 64Q107 60 115 63',tilt:2,eyes:.9},
 wave:{mouth:'M47 59C54 75 75 75 81 59',arms:'M32 64Q18 69 17 58M94 61Q108 44 105 33',tilt:-4,eyes:1}
};
/* Two poses are written with the same path commands and differ only in their
   numbers, so a face can be morphed by interpolating between them. Motion cannot
   tween `d` itself — asking it to leaves the attribute momentarily undefined,
   which the browser rejects and which made every expression change snap. */
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
  t.set(0);const run=animate(t,1,{duration:.42,ease:[.22,1,.36,1]});return()=>run.stop();
 },[d,off,t]);
 return <motion.path {...rest} d={shape}/>;
}
function Bookmark({accessory='none',size=120,pose='idle',still=false}:{accessory?:'none'|'leaf'|'star'|'sun';size?:number;pose?:BuddyPose;still?:boolean}){
 const reduced=useReducedMotion(),{state}=useStudy(),[gaze,setGaze]=useState({x:0,y:0}),[hello,setHello]=useState(false);
 const [typing,setTyping]=useState(false);useEffect(()=>{const sync=()=>{const el=document.activeElement as HTMLInputElement|null;setTyping(!!el&&(el.matches('textarea')||(el.matches('input')&&!NOT_TYPING.includes(el.type))));};document.addEventListener('focusin',sync);document.addEventListener('focusout',sync);return()=>{document.removeEventListener('focusin',sync);document.removeEventListener('focusout',sync);};},[]);useEffect(()=>{if(!hello)return;const timer=setTimeout(()=>setHello(false),1300);return()=>clearTimeout(timer);},[hello]);
 const off=still||!!reduced||state.settings.quiet||typing,face=FACES[hello?'wave':pose];
 const transition=off?{duration:0}:{type:'spring' as const,stiffness:210,damping:19,mass:.6};
 return <motion.svg className="study-companion expressive-buddy" data-pose={hello?'wave':pose} width={size} height={size} viewBox="0 0 128 124" role="img" aria-label={`Dunlo’s bookmark study buddy, ${hello?'waving hello':pose}`} onPointerMove={e=>{if(off)return;const r=e.currentTarget.getBoundingClientRect();setGaze({x:Math.max(-3,Math.min(3,(e.clientX-r.left-r.width/2)/r.width*8)),y:Math.max(-2,Math.min(2,(e.clientY-r.top-r.height/2)/r.height*5))});}} onPointerLeave={()=>{setGaze({x:0,y:0});setHello(false);}} onPointerDown={()=>setHello(true)}>
  <ellipse cx="63" cy="113" rx="29" ry="4" fill="#0a2a66" opacity=".09"/>
  <motion.g style={{transformOrigin:'63px 85px'}} animate={{rotate:face.tilt,y:pose==='aha'?-4:0,scaleX:pose==='aha'?1.025:1,scaleY:pose==='thinking'?.97:1}} transition={transition}>
   <motion.g className="buddy-breath" animate={off?{y:0}:{y:[0,-2,0]}} transition={off?{duration:0}:{duration:4.5,repeat:Infinity,ease:'easeInOut'}}>
    {face.arms.split('M').filter(Boolean).map((part,i)=><MorphPath key={i} className="buddy-arms" d={'M'+part} off={off} style={{transformOrigin:'94px 61px'}} animate={{rotate:!off&&i===1&&(hello||pose==='wave')?[0,-12,8,-10,0]:0}} transition={off?{duration:0}:{duration:1.1,ease:'easeInOut'}} stroke="#14bf96" strokeWidth="7" fill="none" strokeLinecap="round"/>)}
    <path d="M32 18Q32 9 42 9H78L94 25V96Q94 103 86 101L63 89 40 101Q32 105 32 95Z" fill="#14bf96"/>
    <path d="M78 9V26H94" fill="#a1ebd7"/>
    <motion.g animate={{x:gaze.x+(pose==='point'?2:0),y:gaze.y}} transition={transition}>
     {[50,76].map((cx,i)=><motion.g className="buddy-eye" key={cx} style={{transformOrigin:`${cx}px 46px`}} animate={off?{scaleY:face.eyes}:{scaleY:[face.eyes,face.eyes,.08,face.eyes,face.eyes]}} transition={off?{duration:0}:{duration:4.6,repeat:Infinity,times:[0,.76,.79,.82,1],delay:i*.025}}><ellipse cx={cx} cy="46" rx="4.5" ry="6.5" fill="#0a2a66"/><circle cx={cx+1.2} cy="43.5" r="1.2" fill="white" opacity=".85"/></motion.g>)}
    </motion.g>
    <MorphPath d={face.mouth} off={off} stroke="#0a2a66" strokeWidth="3.3" fill={pose==='aha'?'#0a2a66':'none'} strokeLinecap="round"/>
    <ellipse cx="40" cy="57" rx="5" ry="3" fill="#a1ebd7" opacity=".65"/><ellipse cx="85" cy="57" rx="5" ry="3" fill="#a1ebd7" opacity=".65"/>
    {(pose==='curious'||pose==='thinking')&&<path d="M43 34Q49 30 55 33M70 32Q76 29 82 33" fill="none" stroke="#0a2a66" strokeWidth="2.5" strokeLinecap="round"/>}
    {accessory==='leaf'&&<path d="M80 18Q84 0 103 5Q101 24 80 18" fill="#bdd979" stroke="#375e21" strokeWidth="2"/>}
    {accessory==='star'&&<path d="M88 0 92 11 104 12 94 20 97 31 88 25 77 31 81 19 72 11 84 10Z" fill="#f4c45d" stroke="#8d6316" strokeWidth="2"/>}
    {accessory==='sun'&&<g stroke="#b77416" strokeWidth="2.5"><circle cx="91" cy="13" r="11" fill="#ffd474"/><path d="M91 0V2M91 27V31M74 13H71M107 13H111"/></g>}
   </motion.g>
  </motion.g>
  {pose==='aha'&&<motion.path initial={off?false:{opacity:0}} animate={{opacity:1}} d="M106 7v7M118 18h-6M114 8l-5 5" stroke="#0a2a66" strokeWidth="2.5" strokeLinecap="round"/>}
 </motion.svg>;
}

export const Companion=memo(Bookmark);
