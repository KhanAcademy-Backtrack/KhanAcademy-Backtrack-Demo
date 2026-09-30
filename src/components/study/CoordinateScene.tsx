'use client';
import {useEffect,useRef,useState} from 'react';
import {motion} from 'motion/react';
import {useMotionPolicy} from '@/components/motion/MotionPolicy';
import {SceneMotionToggle} from './SceneMotionToggle';
import {DUR,tween} from '@/lib/motion-tokens';
import {Companion} from './Companion';
import {MathText} from '@/components/math/Math';
import {freshLab,type LabSave} from '@/lib/visual-maths';
export function CoordinateScene({initial,onSave,onContinue}:{initial?:LabSave;onSave?:(s:LabSave)=>void;onContinue:()=>void}){
 const [s,set]=useState(initial??freshLab),{off}=useMotionPolicy(s.static),save=useRef(onSave);save.current=onSave;
 /* The trace is part of the saved guide, not a transient flourish: coming back to
    this scene should show the leg the learner had reached, not a blank grid. */
 const phase=Math.max(0,Math.min(2,s.values.phase??0)),setPhase=(n:number)=>set(v=>({...v,values:{...v.values,phase:n}}));
 const x=Math.max(0,Math.min(6,s.values.x??2)),y=Math.max(0,Math.min(8,s.values.y??5));
 useEffect(()=>{save.current?.(s);},[s]);
 const change=(key:string,n:number)=>{setPhase(0);set(v=>({...v,values:{...v.values,[key]:n}}));};
 return <section className="concept-lab coordinate-scene"><div className="scene-heading"><div><span className="scene-eyebrow">Khanpanion visual guide</span><h3>Across first. Then up.</h3></div><Companion size={90} pose={phase===2?'aha':'point'} still={off}/></div><p>The first coordinate tells you how far across. The second gives the height.</p><MathText size="lg">{`P = (${x}, ${y})`}</MathText><svg className="coordinate-drawing" viewBox="0 0 500 370" role="img" aria-label={`Point P has x coordinate ${x} and y coordinate ${y}. Read horizontally to ${x}, then vertically to ${y}.`}>
  {[0,1,2,3,4,5,6].map(n=><g key={`x${n}`}><path d={`M${65+n*60} 50V315`} stroke="#e3eceb"/><text x={65+n*60} y="340" textAnchor="middle">{n}</text></g>)}{[0,1,2,3,4,5,6,7,8].map(n=><g key={`y${n}`}><path d={`M65 ${315-n*32}H430`} stroke="#e3eceb"/><text x="45" y={322-n*32} textAnchor="end">{n}</text></g>)}<path d="M65 38V315H442M60 45l5-7 5 7M435 310l7 5-7 5" stroke="#0a2a66" strokeWidth="2" fill="none"/><text x="35" y="26">y</text><text x="453" y="322">x</text>
  <motion.path initial={false} animate={{pathLength:phase?1:0,opacity:phase?1:0}} transition={tween(off,DUR.base)} d={`M65 315H${65+x*60}`} stroke="#14bf96" strokeWidth="4" fill="none"/><motion.path initial={false} animate={{pathLength:phase===2?1:0,opacity:phase===2?1:0}} transition={tween(off,DUR.base)} d={`M${65+x*60} 315V${315-y*32}`} stroke="#14bf96" strokeWidth="4" fill="none"/>
  <circle cx={65+x*60} cy={315-y*32} r="8" fill="#0a2a66"/><text x={80+x*60} y={303-y*32}>P</text>{phase>0&&<motion.g initial={off?false:{x:65,y:315}} animate={{x:65+x*60,y:phase===2?315-y*32:315}} transition={tween(off,DUR.base)}><circle r="7" fill="#14bf96" stroke="#0a2a66"/></motion.g>}
 </svg><div className="coordinate-controls"><label>Across: x<input aria-label="Across coordinate x" type="range" min="0" max="6" value={x} onChange={e=>change('x',Number(e.target.value))}/></label><label>Up: y<input aria-label="Up coordinate y" type="range" min="0" max="8" value={y} onChange={e=>change('y',Number(e.target.value))}/></label></div><button className="button-secondary" onClick={()=>setPhase(phase===2?0:phase+1)}>{phase===0?'Follow x, then y':phase===1?'Then up':'Start again'}</button><p role="status">{phase===1?`Across to ${x}.`:phase===2?`Then up to ${y}. The point is (${x}, ${y}), in that order.`:'Move either coordinate. Notice which direction the point changes.'}</p><SceneMotionToggle still={s.static} onChange={staticMode=>set(v=>({...v,static:staticMode}))}/><button className="button-primary" onClick={onContinue}>Try without the visual ↗</button></section>;
}
