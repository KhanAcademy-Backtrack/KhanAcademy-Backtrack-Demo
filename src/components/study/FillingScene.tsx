'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {animate,motion,useMotionValue,useMotionValueEvent,useReducedMotion,useTransform,type AnimationPlaybackControls} from 'motion/react';
import {Companion} from './Companion';
import {useStudy} from './StudyProvider';
import {MathText} from '@/components/math/Math';

/** A continuous mathematical model, shared by the original drawing and graph. */
export function FillingScene({autoplay=false,compact=false,staticMode=false,saved,onChange}:{autoplay?:boolean;compact?:boolean;staticMode?:boolean;saved?:{rate?:number;start?:number;time?:number};onChange?:(values:{rate:number;start:number;time:number})=>void}){
 const {state}=useStudy(),reduced=useReducedMotion(),off=staticMode||!!reduced||state.settings.quiet;
 const [rate,setRate]=useState(saved?.rate??2),[initial,setInitial]=useState(saved?.start??6),[running,setRunning]=useState(false),[visible,setVisible]=useState(false),[reading,setReading]=useState({time:saved?.time??0,volume:(saved?.start??6)+(saved?.rate??2)*(saved?.time??0)});
 const time=useMotionValue(saved?.time??0),flow=useMotionValue(saved?.rate??2),start=useMotionValue(saved?.start??6),playback=useRef<AnimationPlaybackControls|undefined>(undefined),stage=useRef<HTMLDivElement>(null),svg=useRef<SVGSVGElement>(null),dragging=useRef(false),autoStarted=useRef(false);
 const id=useId().replace(/:/g,''),volume=useTransform(()=>start.get()+flow.get()*time.get()),dotX=useTransform(time,t=>58+t*62),dotY=useTransform(volume,v=>310-v*8),waterY=useTransform(volume,v=>310-v*8),waterH=useTransform(volume,v=>v*8),lineStart=useTransform(start,n=>310-n*8),lineEnd=useTransform(()=>310-(start.get()+5*flow.get())*8);
 function read(){const t=Math.round(time.get()*10)/10,v=Math.round((start.get()+flow.get()*t)*10)/10;setReading(old=>old.time===t&&old.volume===v?old:{time:t,volume:v});}
 useMotionValueEvent(volume,'change',read);useMotionValueEvent(time,'change',read);
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.25});if(stage.current)observer.observe(stage.current);return()=>observer.disconnect();},[]);
 useEffect(()=>{if(!autoStarted.current&&autoplay&&visible&&!off&&(!compact||(state.settings.tourDone??false))){autoStarted.current=true;setRunning(true);}},[autoplay,visible,off,state.settings.tourDone,compact]);
 useEffect(()=>{playback.current?.stop();if(!running||off||!visible)return;time.set(0);const p=animate(time,5,{duration:7.5,repeat:Infinity,repeatDelay:1.6,ease:'linear'});playback.current=p;return()=>p.stop();},[running,off,visible,time]);
 function pause(){playback.current?.stop();setRunning(false);onChange?.({rate,start:initial,time:Math.round(time.get()*10)/10});}
 function move(t:number,direct=false){if(!Number.isFinite(t))return;playback.current?.stop();setRunning(false);t=Math.max(0,Math.min(5,t));if(!direct)onChange?.({rate,start:initial,time:t});if(direct)time.set(t);else animate(time,t,{duration:off?0:.4,ease:[.22,1,.36,1]});}
 function changeRate(n:number){if(!Number.isFinite(n))return;pause();n=Math.round(n);setRate(n);onChange?.({rate:n,start:initial,time:Math.round(time.get()*10)/10});animate(flow,n,{duration:off?0:.55,ease:[.22,1,.36,1]});}
 function changeInitial(n:number){if(!Number.isFinite(n))return;pause();n=Math.round(n);setInitial(n);onChange?.({rate,start:n,time:Math.round(time.get()*10)/10});animate(start,n,{duration:off?0:.55,ease:[.22,1,.36,1]});}
 function drag(e:React.PointerEvent<SVGSVGElement>){if(!dragging.current||!svg.current)return;const r=svg.current.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*700;playback.current?.stop();setRunning(false);time.set(Math.max(0,Math.min(5,(x-58)/62)));}
 const isPlaying=running&&!off&&visible;
 const pose=reading.time>4.7?'aha':running?'point':'curious';
 return <div ref={stage} className={`filling-scene ${compact?'scene-compact':''}`} data-running={running&&!off&&visible}>
  <div className="scene-heading"><div><span className="scene-eyebrow">An idea you can move</span><h3>Watch a graph fill up.</h3></div><div className="scene-buddy"><Companion size={96} pose={pose}/></div></div>
  <div className="scene-formula"><MathText size="lg">{`V = ${initial} + ${rate}t`}</MathText><span>starts at {initial} L · adds {rate} L/min</span></div>
  <svg ref={svg} className="filling-drawing" viewBox="0 0 700 370" role="img" aria-label={`A linked graph and container. Initially ${initial} litres, adding ${rate} litres per minute. The moving point and water level represent the same amount.`} onPointerMove={drag} onPointerUp={()=>{dragging.current=false;onChange?.({rate,start:initial,time:Math.round(time.get()*10)/10});}} onPointerCancel={()=>{dragging.current=false;}}>
   <defs><linearGradient id={`water-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#14bf96"/><stop offset="1" stopColor="#b0eee0"/></linearGradient><clipPath id={`tank-${id}`}><path d="M500 48H626V302Q626 310 618 310H508Q500 310 500 302Z"/></clipPath></defs>
   {[0,5,10,15,20,25,30].map(n=><g key={n}><path d={`M58 ${310-n*8}H380`} stroke="#e6ecf0"/><text x="43" y={317-n*8} textAnchor="end">{n}</text></g>)}
   {[0,1,2,3,4,5].map(n=><g key={n}><path d={`M${58+n*62} 65V310`} stroke="#e6ecf0"/><text x={58+n*62} y="340" textAnchor="middle">{n}</text></g>)}
   <path d="M58 53V310H392M53 61l5-8 5 8M384 305l8 5-8 5" stroke="#0a2a66" strokeWidth="2.5" fill="none"/>
   <text x="17" y="35" fontWeight="650">Volume (L)</text><text x="302" y="366">Time (min)</text>
   <path d="M58 262L368 182" stroke="#b0bdcb" strokeWidth="2" strokeDasharray="5 6"/>
   <motion.line className="flow-rule" x1="58" y1={lineStart} x2="368" y2={lineEnd} stroke="#0a2a66" strokeWidth="3"/>
   <motion.line x1={dotX} y1="310" x2={dotX} y2={dotY} stroke="#14bf96" strokeWidth="2" strokeDasharray="5 5"/>
   <motion.line x1={dotX} y1={dotY} x2="632" y2={dotY} stroke="#7baeb7" strokeWidth="1.8" strokeDasharray="5 5"/>
   <g clipPath={`url(#tank-${id})`}><motion.rect className="flow-water" x="500" y={waterY} width="126" height={waterH} fill={`url(#water-${id})`}/><motion.line x1="500" x2="626" y1={waterY} y2={waterY} stroke="#0a2a66" strokeWidth="2"/></g>
   <path d="M498 48V302Q498 313 509 313H617Q628 313 628 302V48" fill="none" stroke="#0a2a66" strokeWidth="3" strokeLinecap="round"/>
   <path d="M588 20H563V54" stroke="#0a2a66" strokeWidth="9" strokeLinejoin="round" fill="none"/>
   {running&&!off&&rate>0&&<motion.line x1="563" x2="563" y1="58" y2={waterY} stroke="#14bf96" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 9" animate={{strokeDashoffset:[0,-26]}} transition={{duration:.65,repeat:Infinity,ease:'linear'}}/>}
   <text x="563" y="345" textAnchor="middle">Same amount</text>
   <motion.circle cx={dotX} cy={dotY} r="18" fill="white" stroke="#d5eee5" strokeWidth="2" onPointerDown={e=>{dragging.current=true;e.currentTarget.setPointerCapture(e.pointerId);pause();}} style={{cursor:'grab',touchAction:'none'}}/>
   <motion.circle className="flow-point" cx={dotX} cy={dotY} r="8" fill="#14bf96" stroke="#0a2a66" strokeWidth="2" style={{pointerEvents:'none'}}/>
   <motion.circle cx="58" cy={lineStart} r="4" fill="#0a2a66"/>
  </svg>
  <div className="scene-readout" aria-live="off"><span>At <b>{reading.time.toFixed(1)}</b> min</span><span className="readout-mapping">→</span><span><b>{reading.volume.toFixed(1)}</b> L</span></div>
  <div className="scene-control-row"><button className="scene-play" disabled={off} onClick={()=>running?pause():setRunning(true)} aria-label={isPlaying?'Pause filling animation':'Play filling animation'}>{isPlaying?'Ⅱ':'▶'}</button><label className="scene-time"><span>Move time</span><input aria-label="Time in the filling model" type="range" min="0" max="5" step=".1" style={{'--scene-fill':`${reading.time/5*100}%`} as React.CSSProperties} value={reading.time} onChange={e=>move(Number(e.target.value),true)} onPointerUp={()=>onChange?.({rate,start:initial,time:reading.time})} onKeyUp={()=>onChange?.({rate,start:initial,time:reading.time})}/></label><button className="scene-replay" aria-label="Replay filling animation" onClick={()=>move(0)}>↺ <span>Replay</span></button></div>
  <div className="scene-rate"><span>Try a different rate</span>{[2,4].map(n=><button key={n} aria-pressed={rate===n} onClick={()=>changeRate(n)}>{n} L/min</button>)}</div>
  {(rate!==2||initial!==6)&&<p className="scene-reference">Dashed line: the original 6 L start and 2 L/min rate.</p>}<p className="scene-insight">{rate===2?'The water and the point rise together.':'The line turns about the same starting value.'} <strong>Move the dot or the time slider.</strong></p>
  {!compact&&<details className="scene-number-controls"><summary>Type values instead</summary><label>Time (min)<input type="number" min="0" max="5" step=".1" value={reading.time} onChange={e=>move(Number(e.target.value))}/></label><label>Rate (L/min)<input type="number" min="0" max="4" value={rate} onChange={e=>changeRate(Math.max(0,Math.min(4,Number(e.target.value))))}/></label><label>Initial volume (L)<input type="number" min="0" max="10" value={initial} onChange={e=>changeInitial(Math.max(0,Math.min(10,Number(e.target.value))))}/></label></details>}
  {off&&<p className="scene-motion-note">{staticMode?'Static view is on. Move the controls to inspect each state.':reduced?'Reduced motion is on. The slider still updates every representation.':'Quiet presentation is on. Enable motion in My study space to play this scene.'}</p>}
 </div>;
}
