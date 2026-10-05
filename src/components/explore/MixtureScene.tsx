'use client';
import {useEffect,useRef,useState} from 'react';
import {animate,motion,useMotionValue,useMotionValueEvent,useTransform,type AnimationPlaybackControls} from 'motion/react';
import {useMotionPolicy} from '@/components/motion/MotionPolicy';
import {DUR,tween} from '@/lib/motion-tokens';
import {Rich} from '@/components/math/Math';
const BOTTOM=226,BASE_HEIGHT=56,fmt=(n:number)=>String(Math.round(n*10)/10);
/** Both layers share one scale, so their two-fifths share survives every frame. */
export function MixtureScene({value,active,still}:{value:number;active:boolean;still:boolean}){
 const {off}=useMotionPolicy(still||!active),playback=useRef<AnimationPlaybackControls|undefined>(undefined),[filling,setFilling]=useState(false);
 const batch=useMotionValue(value),fill=useMotionValue(1),amount=useTransform(()=>batch.get()*fill.get()),[view,setView]=useState({batch:value,fill:1});
 const read=()=>setView({batch:batch.get(),fill:fill.get()});useMotionValueEvent(batch,'change',read);useMotionValueEvent(fill,'change',read);
 useEffect(()=>{if(off){playback.current?.stop();batch.set(value);fill.set(1);setFilling(false);return;}const run=animate(batch,value,tween(false));return()=>run.stop();},[value,off,batch,fill]);
 useEffect(()=>()=>playback.current?.stop(),[]);
 const replay=()=>{if(off)return;playback.current?.stop();fill.set(0);setFilling(true);playback.current=animate(fill,1,{...tween(false,DUR.slow),onComplete:()=>setFilling(false)});};
 return <div className="mixture-visual" data-filling={filling&&!off}>
  <svg viewBox="0 0 540 302" role="img" aria-label={`Original recipe has 2 parts syrup and 3 water. Your selected batch has ${2*value} syrup and ${3*value} water. Both use the same volume scale.`}>
   {[0,1].map(i=>{const x=i?345:65,total=(i?view.batch:1)*view.fill;return <g key={i}>
    <text x={x+65} y="24" textAnchor="middle">{i?'Your batch':'Original recipe'}</text>
    <rect x={x+1.5} y="50" width="127" height="178" fill="#fff"/>
    <g transform={`translate(${x+3},${BOTTOM})`}><motion.g style={{scaleY:i?amount:fill,originX:0,originY:1}}>
     <rect className="mixture-water" x="0" y={-BASE_HEIGHT} width="124" height={BASE_HEIGHT*3/5} fill="#b3e3ee"/>
     <rect className="mixture-syrup" x="0" y={-BASE_HEIGHT*2/5} width="124" height={BASE_HEIGHT*2/5} fill="#14bf96"/>
     <path d={`M0 ${-BASE_HEIGHT*2/5}h124`} stroke="#0a2a66" strokeOpacity=".4" strokeDasharray="4 4"/>
    </motion.g></g>
    {[1,2,3].map(mark=><path key={mark} d={`M${x+112} ${BOTTOM-BASE_HEIGHT*mark}h15`} stroke="#0a2a66" strokeOpacity=".24" strokeWidth="2"/>)}
    <path d={`M${x} 50v178h130V50`} fill="none" stroke="#0a2a66" strokeWidth="3"/>
    <text className="mixture-total" x={x+65} y="258" textAnchor="middle">{fmt(5*total)} parts</text><text className="mixture-ingredients" x={x+65} y="288" textAnchor="middle">{fmt(2*total)} syrup + {fmt(3*total)} water</text>
   </g>;})}
   <text className="mixture-multiplier" x="270" y="137" textAnchor="middle">×{fmt(view.batch)}</text><path d="M246 156h48m-8-7 8 7-8 7" fill="none" stroke="#0a2a66" strokeWidth="2"/>
  </svg>
  <p className="explore-proportion-note">Both containers use the same volume scale.</p><div className="mixture-footer"><strong>{value===1?<Rich>{'$\\frac{2}{5}$ syrup in both'}</Rich>:<Rich>{`$\\frac{2}{5} = \\frac{${2*value}}{${5*value}}$ syrup`}</Rich>}</strong><button type="button" className="mixture-replay" aria-label="Replay recipe animation" disabled={off||filling} onClick={replay}>Replay</button></div>
 </div>;
}
