'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { LABELS, TOPICS, type Recovery, type Skill } from '@/lib/recovery';
import { buildCubics, resample, polylinePath } from '@/lib/route-geometry';

export function RouteCanvas({ state, compact = false }: { state: Recovery; compact?: boolean }) {
  const reduced=useReducedMotion();
  const [selected,setSelected]=useState<Skill|null>(null);
  const destination=state.destinationSkill??'goal';
  const nodes=state.goalPassed?[destination]:state.planned.filter(x=>!state.passed.includes(x)||x===destination);
  const depth=nodes.length;
  // Every leg is a horizontal cubic. Inserting a prerequisite bends the route;
  // proving a stop removes its detour. Retained evidence remains in the history.
  const points=nodes.map((id,i)=>({id,x:id===destination?30:58,y:34+i*78}));
  const path=polylinePath(resample(buildCubics(points.map(p=>[p.x,p.y]),'vertical'),96));
  const label=state.goalPassed?'Back on track':state.suspected.length?'Your updated route':'Your route';
  const status=(id:Skill)=>state.passed.includes(id)?'Checked':id===state.active?(state.phase==='setup'?'First check':'You’re here'):id===destination?'Where you’re headed':state.suspected.includes(id)?'Needs practice':'Check if you need this';
  return <div className={`route-canvas ${compact?'compact':''}`}>
    <div className="route-heading"><span className={state.suspected.length&&!state.goalPassed?'warm':''}>{label}</span><span>{state.goalPassed?'Destination checked':depth>1?`${depth-1} possible review ${depth-1===1?'step':'steps'}`:'One skill at a time'}</span></div>
    <div className="route-roadmap">
      <svg viewBox={`0 0 94 ${Math.max(68,nodes.length*78)}`} preserveAspectRatio="none" aria-hidden="true" className="roadmap-line">
        {depth>1&&<motion.path className={`route-stroke ${state.suspected.length&&!state.goalPassed?'detour':''}`} initial={false} animate={{d:path}} transition={{duration:reduced?0:.65,ease:[.22,1,.36,1]}}/>}
        {points.map((p,i)=><g key={p.id}>
          <circle cx={p.x} cy={p.y} r={p.id===state.active?15:12} className={p.id===state.active?'node-active':'node-idle'}/>
          <text x={p.x} y={p.y+4} textAnchor="middle" className="node-number">{state.goalPassed?'✓':i+1}</text>
        </g>)}
      </svg>
      <ol className="roadmap-stops">{nodes.map(id=><li key={id} data-active={id===state.active}><button onClick={()=>setSelected(selected===id?null:id)} aria-expanded={selected===id}><span>{id===destination?'Today’s goal':LABELS[id]}</span><small>{status(id)}</small></button></li>)}</ol>
    </div>
    {selected&&nodes.includes(selected)&&<p className="route-reason">{state.routeClue?.skill===selected?state.routeClue.message:selected===destination?`Return to ${(state.goalTitle??TOPICS[state.topic].label).toLowerCase()} with two fresh problems.`:`A useful step toward ${(state.goalTitle??TOPICS[state.topic].label).toLowerCase()}. Pass two fresh checks to skip its review.`}</p>}
  </div>;
}
