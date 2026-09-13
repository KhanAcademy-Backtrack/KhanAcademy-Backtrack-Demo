'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {animate,useMotionValue,useMotionValueEvent,type AnimationPlaybackControls} from 'motion/react';

const BASE_HEIGHT=56;
const BOTTOM=226;
const fmt=(n:number)=>String(Math.round(n*10)/10);

export function MixtureScene({value,active,still}:{value:number;active:boolean;still:boolean}){
 const root=useRef<HTMLDivElement>(null),introduced=useRef(false),playback=useRef<AnimationPlaybackControls|undefined>(undefined);
 const [visible,setVisible]=useState(false),[filling,setFilling]=useState(false);
 const batch=useMotionValue(value),fill=useMotionValue(1),[view,setView]=useState({batch:value,fill:1});
 const canAnimate=active&&visible&&!still;
 const read=()=>setView({batch:batch.get(),fill:fill.get()});
 useMotionValueEvent(batch,'change',read);
 useMotionValueEvent(fill,'change',read);

 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.2});if(root.current)observer.observe(root.current);return()=>observer.disconnect();},[]);
 useEffect(()=>{
  if(!canAnimate){batch.set(value);return;}
  const controls=animate(batch,value,{duration:.8,ease:[.22,1,.36,1]});
  return()=>controls.stop();
 },[value,canAnimate,batch]);
 const replay=useCallback(()=>{
  if(!canAnimate)return;
  playback.current?.stop();fill.set(0);setFilling(true);
  playback.current=animate(fill,1,{duration:1.6,ease:[.25,.1,.25,1],onComplete:()=>setFilling(false)});
 },[canAnimate,fill]);
 useEffect(()=>{
  if(!canAnimate){playback.current?.stop();fill.set(1);setFilling(false);return;}
  if(!introduced.current){introduced.current=true;replay();}
  return()=>playback.current?.stop();
 },[canAnimate,fill,replay]);

 return <div className="mixture-visual" ref={root} data-filling={filling&&canAnimate}>
  <svg viewBox="0 0 540 302" role="img" aria-label={`Original recipe: 2 parts syrup and 3 parts water, 5 parts total. Your batch: ${2*value} parts syrup and ${3*value} parts water, ${5*value} parts total. Both containers use the same volume scale. The syrup share stays two fifths.`}>
   {[1,view.batch].map((scale,i)=>{
    const x=i?345:65,amount=scale*view.fill,total=BASE_HEIGHT*amount,syrup=total*2/5,water=total*3/5;
    const ripple=Math.sin(view.fill*Math.PI*6)*(1-view.fill)*2+Math.sin(scale*Math.PI*4)*1.5;
    return <g key={i} className={i?'mixture-batch':'mixture-original'} data-amount={amount}>
     <text x={x+65} y="24" textAnchor="middle">{i?'Your batch':'Original recipe'}</text>
     <rect x={x+1.5} y="50" width="127" height="178" fill="#fff"/>
     <rect className="mixture-water" x={x+3} y={BOTTOM-total} width="124" height={water} fill="#b3e3ee"/>
     <rect className="mixture-syrup" x={x+3} y={BOTTOM-syrup} width="124" height={syrup} fill="#14bf96"/>
     {[1,2,3].map(mark=><path key={mark} d={`M${x+112} ${BOTTOM-BASE_HEIGHT*mark}h15`} stroke="#0a2a66" strokeOpacity=".24" strokeWidth="2"/>)}
     {total>.1&&<><path d={`M${x+3} ${BOTTOM-total}q31 ${ripple}62 0t62 0`} fill="none" stroke="#4c9eaf" strokeWidth="2"/><path d={`M${x+3} ${BOTTOM-syrup}h124`} stroke="#0a2a66" strokeOpacity=".45" strokeDasharray="4 4"/></>}
     <path d={`M${x} 50v178h130V50`} fill="none" stroke="#0a2a66" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
     <text className="mixture-total" x={x+65} y="258" textAnchor="middle">{fmt(5*amount)} parts</text>
     <text className="mixture-ingredients" x={x+65} y="288" textAnchor="middle">{fmt(2*amount)} syrup + {fmt(3*amount)} water</text>
    </g>;
   })}
   <text className="mixture-multiplier" x="270" y="137" textAnchor="middle">×{fmt(view.batch)}</text>
   <path d="M246 156h48m-8-7 8 7-8 7" fill="none" stroke="#0a2a66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
  <p className="explore-proportion-note">Both containers use the same volume scale.</p>
  <div className="mixture-footer"><strong>{value===1?'2/5 syrup in both':`2/5 = ${2*value}/${5*value} syrup`}</strong><button type="button" className="mixture-replay" aria-label="Replay recipe animation" disabled={!canAnimate||filling} onClick={replay}><span aria-hidden="true">↻</span> Replay</button></div>
 </div>;
}
