'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { LABELS, TOPICS, type Recovery, type Skill } from '@/lib/recovery';
import { buildCubics, resample, polylinePath } from '@/lib/route-geometry';

export function RouteCanvas({ state, compact = false }: { state: Recovery; compact?: boolean }) {
  const reduced=useReducedMotion();
  const [selected,setSelected]=useState<Skill|null>(null);
  const nodes=state.goalPassed?['goal' as Skill]:state.planned.filter(x=>!state.passed.includes(x)||x==='goal');
  const depth=nodes.length;
  // Every leg is a horizontal cubic. Inserting a prerequisite bends the route;
  // proving a stop removes its detour. Retained evidence remains in the history.
  const points=nodes.map((id,i)=>({id,x:80+(i+1)*(640/(nodes.length+1)),y:id==='goal'?105:205+(i%2)*90}));
  const pts=[{x:40,y:105},...points,{x:760,y:105}];
  const path=polylinePath(resample(buildCubics(pts.map(p=>[p.x,p.y]),'horizontal'),96));
  const label=state.goalPassed?'Back on track':state.suspected.length?'Recalculating…':'Your route forward';
  return <div className={`route-canvas ${compact?'compact':''}`}>
    <div className="route-heading"><span className={state.suspected.length&&!state.goalPassed?'warm':''}>{label}</span><span>{state.goalPassed?'Destination checked':`${depth-1} possible review ${depth-1===1?'step':'steps'}`}</span></div>
    <div className="map-desktop">
      <svg viewBox="0 0 800 380" role="img" aria-label={`${label}. ${nodes.map(x=>LABELS[x]).join(', ')}.`}>
        <path d="M 40 105 C 240 105 560 105 760 105" className="route-ghost"/>
        <motion.path d={path} className={`route-stroke ${state.suspected.length&&!state.goalPassed?'detour':''}`} initial={false} animate={{d:path}} transition={{duration:reduced?0:.65,ease:[.22,1,.36,1]}}/>
        <circle cx="40" cy="105" r="6" className="route-origin"/>
        <text x="40" y="73" className="map-label">YOU</text>
        {points.map((p,i)=><g key={p.id}>
          <circle cx={p.x} cy={p.y} r={p.id===state.active?17:11} className={p.id===state.active?'node-active':'node-idle'}/>
          <text x={p.x} y={p.y+5} textAnchor="middle" className="node-number">{state.goalPassed?'✓':i+1}</text>
          <text x={p.x} y={p.y+46} textAnchor="middle" className="map-label">{{terms:'Like terms',expand:'Expand',distribute:'Multiply',factor:'Factors',zero:'Zero rule',linear:'Isolate x',goal:'Today’s goal'}[p.id]}</text>
        </g>)}
        <path d="M752 97 L760 105 L752 113" className="route-arrow"/>
      </svg>
    </div>
    <ol className="map-mobile">{nodes.map((id,i)=><li key={id} data-active={id===state.active}><span>{state.goalPassed?'✓':String(i+1).padStart(2,'0')}</span><div>{id==='goal'?TOPICS[state.topic].label:LABELS[id]}<small>{state.passed.includes(id)?'Demonstrated':id===state.active?'Current step':state.suspected.includes(id)?'Needs a closer look':'To investigate'}</small></div></li>)}</ol>
    <div className="route-inspect">{nodes.map(id=><button key={id} onClick={()=>setSelected(selected===id?null:id)} aria-expanded={selected===id}>{id==='goal'?'Destination':LABELS[id]} <span aria-hidden="true">{selected===id?'−':'+'}</span></button>)}</div>
    {selected&&<p className="route-reason">{selected==='goal'?'Two fresh problems check whether you can use the skill at your destination.':`We check ${LABELS[selected].toLowerCase()} because it supports this destination. Two fresh, unassisted answers can remove its review. A wrong answer is a signal to investigate, not a diagnosis.`}</p>}
  </div>;
}
