'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {animate,motion,useMotionValue,useMotionValueEvent,useTransform,type AnimationPlaybackControls} from 'motion/react';
import {useMotionPolicy} from '@/components/motion/MotionPolicy';
import {DUR,tween} from '@/lib/motion-tokens';
import {Companion} from './Companion';
import {SceneMotionToggle} from './SceneMotionToggle';
import {MathText} from '@/components/math/Math';
const fmt=(n:number)=>String(Math.round(n*10)/10);
/** One quantity drives the point, guide lines, water and readout. No autoplay.
 * Playback is a finite sequence of minute steps; every step can be inspected. */
export function FillingScene({compact=false,staticMode=false,saved,onChange}:{autoplay?:boolean;compact?:boolean;staticMode?:boolean;saved?:{rate?:number;start?:number;time?:number};onChange?:(v:{rate:number;start:number;time:number})=>void}){
 const [localStill,setLocalStill]=useState(false),policy=useMotionPolicy(staticMode||localStill),{off}=policy;
 const [rate,setRate]=useState(saved?.rate??2),[initial,setInitial]=useState(saved?.start??6),[running,setRunning]=useState(false),[view,setView]=useState({rate:saved?.rate??2,start:saved?.start??6,time:saved?.time??0});
 const time=useMotionValue(saved?.time??0),flow=useMotionValue(saved?.rate??2),start=useMotionValue(saved?.start??6),playback=useRef<AnimationPlaybackControls|undefined>(undefined),hold=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),svg=useRef<SVGSVGElement>(null),dragging=useRef(false),keepPlaying=useRef(false);
 const id=useId().replace(/:/g,''),volume=useTransform(()=>start.get()+flow.get()*time.get()),dotX=useTransform(time,t=>58+t*62),dotY=useTransform(volume,v=>310-v*8),lineStart=useTransform(start,n=>310-n*8),waterScale=useTransform(volume,v=>v*8/262),guideScale=useTransform(volume,v=>v*8/262),lineShear=useTransform(flow,r=>`matrix(1,${(-40*r/310).toFixed(6)},0,1,0,0)`),horizontalScale=useTransform(dotX,x=>(632-x)/574);
 const ruleText=useTransform(()=>`V = ${fmt(start.get())} + ${fmt(flow.get())}t`),captionText=useTransform(()=>`starts at ${fmt(start.get())} L · adds ${fmt(flow.get())} L/min`),timeText=useTransform(time,t=>t.toFixed(1)),volumeText=useTransform(volume,v=>v.toFixed(1));
 const read=()=>setView(old=>{const next={rate:Math.round(flow.get()*10)/10,start:Math.round(start.get()*10)/10,time:Math.round(time.get()*10)/10};return old.rate===next.rate&&old.start===next.start&&old.time===next.time?old:next;});
 useMotionValueEvent(time,'change',read);useMotionValueEvent(flow,'change',read);useMotionValueEvent(start,'change',read);
 const persist=()=>onChange?.({rate:flow.get(),start:start.get(),time:Math.round(time.get()*10)/10});
 function stop(){keepPlaying.current=false;playback.current?.stop();clearTimeout(hold.current);setRunning(false);persist();}
 function nextMinute(play=false){playback.current?.stop();clearTimeout(hold.current);const next=Math.min(5,Math.floor(time.get()+.001)+1);playback.current=animate(time,next,{...tween(off,DUR.slow),onComplete:()=>{persist();if(play&&keepPlaying.current&&next<5)hold.current=setTimeout(()=>nextMinute(true),DUR.slow*3*1000);else{keepPlaying.current=false;setRunning(false);}}});}
 function play(){if(time.get()>=5)time.set(0);keepPlaying.current=true;setRunning(true);nextMinute(true);}
 function move(n:number){if(!Number.isFinite(n))return;stop();time.set(Math.max(0,Math.min(5,n)));persist();}
 function changeRate(n:number){if(!Number.isFinite(n))return;stop();n=Math.max(0,Math.min(4,Math.round(n)));setRate(n);playback.current=animate(flow,n,{...tween(off),onComplete:persist});}
 function changeStart(n:number){if(!Number.isFinite(n))return;stop();n=Math.max(0,Math.min(10,Math.round(n)));setInitial(n);playback.current=animate(start,n,{...tween(off),onComplete:persist});}
 useEffect(()=>{if(off){stop();flow.set(rate);start.set(initial);time.set(Math.round(time.get()*10)/10);persist();}return()=>{playback.current?.stop();clearTimeout(hold.current);};},[off]);
 const noPlayback=policy.quiet||policy.reduced||staticMode||localStill,v=view.start+view.rate*view.time;
 const drag=(e:React.PointerEvent<SVGSVGElement>)=>{if(!dragging.current||!svg.current)return;const r=svg.current.getBoundingClientRect();move(((e.clientX-r.left)/r.width*700-58)/62);};
 return <div className={`filling-scene ${compact?'scene-compact':''}`} data-running={running&&!off}>
  <div className="scene-heading"><div><span className="scene-eyebrow">An idea you can move</span><h3>One amount. Two views.</h3></div><Companion size={86} pose="point" still={off}/></div>
  <div className="scene-formula"><motion.span role="math" className="math font-serif text-2xl text-navy">{ruleText}</motion.span><motion.span>{captionText}</motion.span></div>
  <svg ref={svg} className="filling-drawing" viewBox="0 0 700 370" role="img" aria-label={`A linked graph and container. At ${fmt(view.time)} minutes both show ${fmt(v)} litres.`} onPointerMove={drag} onPointerUp={()=>{dragging.current=false;persist();}} onPointerCancel={()=>{dragging.current=false;}}>
   <defs><clipPath id={`tank-${id}`}><path d="M500 48H626V302Q626 310 618 310H508Q500 310 500 302Z"/></clipPath></defs>
   {[0,5,10,15,20,25,30].map(n=><g key={n}><path d={`M58 ${310-n*8}H380`} stroke="#e6ecf0"/><text x="43" y={317-n*8} textAnchor="end">{n}</text></g>)}
   {[0,1,2,3,4,5].map(n=><g key={n}><path d={`M${58+n*62} 65V310`} stroke="#e6ecf0"/><text x={58+n*62} y="340" textAnchor="middle">{n}</text></g>)}
   <path d="M58 53V310H392" stroke="#0a2a66" strokeWidth="2.5" fill="none"/><text x="17" y="35">Volume (L)</text><text x="302" y="366">Time (min)</text>
   <path d="M58 262L368 182" stroke="#9fb3d4" strokeWidth="2" strokeDasharray="5 6"/>
   <motion.g style={{x:58,y:lineStart}}><motion.path className="flow-rule" d="M0 0H310" style={{transform:lineShear,originX:0,originY:0}} stroke="#0a2a66" strokeWidth="3"/></motion.g>
   <g transform="translate(0,310)"><motion.g style={{x:dotX}}><motion.path d="M0 0V-262" style={{scaleY:guideScale,originX:0,originY:1}} stroke="#14bf96" strokeWidth="2" strokeDasharray="5 5"/></motion.g></g>
   <motion.g style={{y:dotY}}><motion.line x1="0" y1="0" x2="574" y2="0" style={{x:dotX,scaleX:horizontalScale,originX:0,originY:0}} stroke="#9fb3d4" strokeWidth="2" strokeDasharray="5 5"/></motion.g>
   <g clipPath={`url(#tank-${id})`}><g transform="translate(500,310)"><motion.rect className="flow-water" x="0" y="-262" width="126" height="262" style={{scaleY:waterScale,originX:0,originY:1}} fill="#14bf96"/></g></g>
   <path d="M498 48V302Q498 313 509 313H617Q628 313 628 302V48" fill="none" stroke="#0a2a66" strokeWidth="3"/><text x="563" y="345" textAnchor="middle">Same amount</text>
   <motion.g style={{x:dotX,y:dotY}}><circle r="18" fill="white" stroke="#c4e6db" strokeWidth="2" onPointerDown={e=>{dragging.current=true;e.currentTarget.setPointerCapture(e.pointerId);stop();}} style={{cursor:'grab',touchAction:'none'}}/><circle className="flow-point" r="8" fill="#14bf96" stroke="#0a2a66" strokeWidth="2" style={{pointerEvents:'none'}}/></motion.g>
  </svg>
  <div className="scene-readout" aria-live="off"><span>At <motion.b>{timeText}</motion.b> min</span><span>→</span><span><motion.b>{volumeText}</motion.b> L</span></div>
  <div className="scene-control-row flex flex-wrap items-center gap-2"><button className="scene-replay min-h-11 rounded-full bg-green px-4 text-sm font-bold text-navy disabled:cursor-default disabled:opacity-40" disabled={view.time>=5} onClick={()=>{stop();nextMinute();}}>Next minute</button><button className="scene-play h-auto min-h-11 w-auto min-w-28 rounded-full px-4" disabled={noPlayback} onClick={()=>running?stop():play()} aria-label={running?'Pause filling animation':'Play filling animation'}>{running?'Pause':'Play steps'}</button><button className="scene-replay min-h-11 rounded-full border-2 border-navy/15 px-4 text-sm font-bold text-navy" onClick={()=>{stop();time.set(0);persist();}}>Start again</button></div>
  <label className="scene-time"><span>Move time</span><input className="min-h-11" aria-label="Time in the filling model" type="range" min="0" max="5" step=".1" value={view.time} onChange={e=>move(Number(e.target.value))}/></label>
  <div className="scene-rate"><span>Try a different rate</span>{[2,4].map(n=><button className="min-h-11" key={n} aria-pressed={rate===n} onClick={()=>changeRate(n)}>{n} L/min</button>)}</div>
  <p className="scene-insight">Each minute adds the same amount. The point and water represent it together.</p>
  {!compact&&<details className="scene-number-controls"><summary>Type values instead</summary><label>Time (min)<input type="number" min="0" max="5" step=".1" value={view.time} onChange={e=>move(Number(e.target.value))}/></label><label>Rate (L/min)<input type="number" min="0" max="4" value={rate} onChange={e=>changeRate(Number(e.target.value))}/></label><label>Initial volume (L)<input type="number" min="0" max="10" value={initial} onChange={e=>changeStart(Number(e.target.value))}/></label></details>}
  <SceneMotionToggle still={localStill||staticMode} onChange={setLocalStill}/>
 </div>;
}
