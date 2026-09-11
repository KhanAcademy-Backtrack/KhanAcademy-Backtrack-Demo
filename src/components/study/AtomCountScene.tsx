'use client';
import {useEffect,useRef,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {useStudy} from './StudyProvider';
import {Companion} from './Companion';
import {COMPOUNDS,ELEMENT_NAMES} from '@/lib/science';
import {MathText} from '@/components/math/Math';
import type {Recovery} from '@/lib/recovery';
import {freshLab,type LabSave} from '@/lib/visual-maths';
export function AtomCountScene({state:s,initial,onSave,onContinue}:{state:Recovery;initial?:LabSave;onSave?:(s:LabSave)=>void;onContinue:()=>void}){
 const compound=COMPOUNDS[s.serial%COMPOUNDS.length],entries=Object.entries(compound.parts);
 /* Saved with the route: the count the learner built, and which element they were
    following. The element is stored as a position, because only numbers are saved. */
 const [lab,setLab]=useState<LabSave>(initial??freshLab);
 const put=(name:string,n:number)=>setLab(v=>({...v,values:{...v.values,[name]:n}}));
 const units=Math.min(4,Math.max(1,lab.values.units??1)),setUnits=(next:(v:number)=>number)=>put('units',Math.min(4,Math.max(1,next(units))));
 const at=Math.min(entries.length-1,Math.max(0,lab.values.elem??0)),element=entries[at][0],setElement=(i:number)=>put('elem',i);
 const save=useRef(onSave);save.current=onSave;useEffect(()=>{save.current?.(lab);},[lab]);
 const reduced=useReducedMotion(),{state}=useStudy(),off=!!reduced||state.settings.quiet,per=compound.parts[element];
 return <section className="concept-lab atom-count-scene"><div className="scene-heading"><div><span className="scene-eyebrow">Dunlo visual guide</span><h3>The whole formula repeats.</h3></div><Companion size={90} pose={units>1?'aha':'point'} still={off}/></div><MathText size="lg">{`${units}\\,${compound.latex}`}</MathText><p>A subscript counts atoms inside one formula unit. The coefficient repeats that entire unit.</p><div className="atom-unit-controls"><button className="button-secondary" disabled={units===1} onClick={()=>setUnits(n=>n-1)} aria-label="Remove a formula unit">−</button><strong>{units} formula {units===1?'unit':'units'}</strong><button className="button-secondary" disabled={units===4} onClick={()=>setUnits(n=>n+1)} aria-label="Add a formula unit">+</button></div><div className="formula-units"><AnimatePresence initial={false}>{Array.from({length:units},(_,i)=><motion.div layout key={i} initial={off?false:{opacity:0,y:-15,scale:.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:10}} transition={{duration:off?0:.45}}><small>Unit {i+1}</small>{entries.map(([el,n])=><span key={el} data-selected={el===element}>{el} <b>× {n}</b></span>)}</motion.div>)}</AnimatePresence></div><p className="fine-print">These are counting groups, not molecular structures.</p><div className="atom-element-choice">{entries.map(([el],i)=><button className="button-secondary" key={el} aria-pressed={element===el} onClick={()=>setElement(i)}>Count {ELEMENT_NAMES[el]}</button>)}</div><div className="atom-total" aria-live="polite"><MathText size="lg">{`${units} × ${per} = ${units*per}`}</MathText><p>{units*per} {ELEMENT_NAMES[element]} atoms in all. Every copy brought {per}.</p></div><button className="button-primary" onClick={onContinue}>Try without the visual ↗</button></section>;
}
