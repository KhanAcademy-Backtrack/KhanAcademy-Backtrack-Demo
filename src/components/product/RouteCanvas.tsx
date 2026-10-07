'use client';

import { AnimatePresence, motion } from 'motion/react';
import {useMotionPolicy} from '@/components/motion/MotionPolicy';
import {DUR,tween} from '@/lib/motion-tokens';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LABELS, TOPICS, type Recovery, type Skill } from '@/lib/recovery';
import { ROUTE_METRICS as M, layoutRoute, routeGraph, type PlacedEdge, type PlacedNode } from '@/lib/route-graph';
import {Rich} from '@/components/math/Math';
import {plainText} from '@/lib/notation';

const CheckMark=()=><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const Flag=()=><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.6 14.2V2.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M5.4 2.8h7l-2 2.8 2 2.8h-7z" fill="currentColor"/></svg>;
/** A changed route animates for this long; a resize or a font arriving outside it simply redraws in place. */
const SETTLE_MS=(DUR.base+DUR.slow)*1000+120;

/** The route as a small map: the goal anchored at the top, the skills it rests on beneath it.
 *  Placement lives in route-graph.ts; this draws it and lets a learner trace any step's links. */
export function RouteCanvas({ state, compact = false }: { state: Recovery; compact?: boolean }) {
  const {off}=useMotionPolicy();
  const uid=useId();
  const [selected,setSelected]=useState<Skill|null>(null);
  const [pointed,setPointed]=useState<Skill|null>(null);
  const box=useRef<HTMLDivElement>(null);
  const [width,setWidth]=useState(292);
  // The map is laid out for the width it actually has, so labels never scale with a viewBox.
  useLayoutEffect(()=>{const el=box.current;if(!el)return;const measure=()=>{const w=Math.round(el.clientWidth);if(w>0)setWidth(w);};measure();if(typeof ResizeObserver==='undefined')return;const watch=new ResizeObserver(measure);watch.observe(el);return()=>watch.disconnect();},[]);
  const graph=useMemo(()=>routeGraph(state),[state]);
  const [measured,setMeasured]=useState<{width:number;heights:Partial<Record<Skill,number>>}>();
  const layout=useMemo(()=>layoutRoute(graph,width,measured?.width===width?measured.heights:undefined),[graph,width,measured]);
  // Rows follow the text as the browser actually set it, including after the web font arrives.
  const stops=useRef<HTMLOListElement>(null);
  useLayoutEffect(()=>{
    const list=stops.current;if(!list)return;
    const blocks=()=>[...list.querySelectorAll<HTMLElement>('[data-route-text]')];
    const read=()=>{
      const heights:Partial<Record<Skill,number>>={};let changed=false;
      for(const el of blocks()){const id=el.dataset.routeText as Skill,h=Math.ceil(el.offsetHeight),n=layout.nodes.find(x=>x.id===id);if(!n||h===0)continue;heights[id]=h;if(Math.abs(n.bottom-n.top-h)>1)changed=true;}
      if(changed)setMeasured({width,heights});
    };
    read();
    if(typeof ResizeObserver==='undefined')return;
    const watch=new ResizeObserver(read);blocks().forEach(el=>watch.observe(el));return()=>watch.disconnect();
  },[layout,width]);

  /* Only a changed route moves. The first paint grows from the goal down; a new
     step grows out of the skill that needed it; a resize just redraws in place.
     A line whose shape changed during a route change redraws instead of
     morphing (the animation audit keeps path data out of tweens). */
  const mounted=useRef(false);useEffect(()=>{mounted.current=true;},[]);
  const first=!mounted.current;
  const seen=useRef<{graph:typeof graph;at:number}>({graph,at:0});
  if(seen.current.graph!==graph)seen.current={graph,at:Date.now()};
  const settling=!first&&Date.now()-seen.current.at<SETTLE_MS;
  const still=off||(!first&&!settling);
  const drawn=useRef(new Map<string,{d:string;round:number}>());
  const edgeKey=(e:PlacedEdge)=>{const k=key(e),was=drawn.current.get(k);const round=!was?0:was.d!==e.d&&settling?was.round+1:was.round;drawn.current.set(k,{d:e.d,round});return `${k}:${round}`;};

  const byId=new Map(layout.nodes.map(n=>[n.id,n]));
  const destination=graph.destination;
  const label=state.goalPassed?'Back on track':state.suspected.length?'Your updated route':'Your route';
  // Progress only: the count never grows when a check is missed.
  const progress=state.goalPassed?'Destination checked':graph.checked?`${graph.checked} ${graph.checked===1?'step':'steps'} checked`:'Choose a step to see why';

  /* Pointing at, focusing or opening a step lights its own links and its way up
     to the goal; everything else steps back. Labels never dim. */
  const focus=(pointed&&byId.has(pointed)?pointed:null)??(selected&&byId.has(selected)?selected:null);
  const lit=new Set<string>(),near=new Set<Skill>();
  if(focus){
    near.add(focus);
    const climb=(id:Skill)=>{for(const e of layout.edges)if(e.from===id&&!lit.has(key(e))){lit.add(key(e));near.add(e.to);climb(e.to);}};
    for(const e of layout.edges)if(e.to===focus){lit.add(key(e));near.add(e.from);}
    climb(focus);
  }
  const goalName=plainText(state.goalTitle??TOPICS[state.topic].label);
  const names=(ids:Skill[])=>ids.map(id=>id===destination?'today’s goal':LABELS[id].toLowerCase()).join(' and ');
  const inferred=(from:Skill,to:Skill)=>layout.edges.some(e=>e.from===from&&e.to===to&&e.inferred);
  const relation=(n:PlacedNode)=>{
    const sure=n.neededFor.filter(t=>!inferred(n.id,t)),maybe=n.neededFor.filter(t=>inferred(n.id,t));
    return [n.needs.length?`Builds on ${names(n.needs)}.`:'',sure.length?`Needed for ${names(sure)}.`:'',maybe.length?`May help with ${names(maybe)}.`:''].filter(Boolean).join(' ');
  };
  const open=selected?byId.get(selected):undefined;
  const panel=`${uid}-why`;

  // Quiet lines first, the way ahead above them, and whatever is lit on top.
  const weight=(e:PlacedEdge)=>lit.has(key(e))?3:e.onRoute?2:e.checked?1:0;
  const lines=[...layout.edges].sort((a,b)=>weight(a)-weight(b));

  return <div className={`route-canvas ${compact?'compact':''}`}>
    <div className="route-heading"><span className={state.suspected.length&&!state.goalPassed?'warm':''}>{label}</span><span>{progress}</span></div>
    <div ref={box} className="route-graph" style={{height:layout.height}}>
      <svg className="route-graph-lines" width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
        {lines.map(e=>{
          const draw=!e.inferred,row=byId.get(e.from)?.row??0;
          return <motion.path key={edgeKey(e)} d={e.d}
            className={['route-edge',e.onRoute&&'is-route',e.checked&&'is-checked',e.inferred&&'is-inferred',focus&&(lit.has(key(e))?'is-lit':'is-dim')].filter(Boolean).join(' ')}
            initial={still?false:draw?{pathLength:0,opacity:0}:{opacity:0}}
            animate={draw?{pathLength:1,opacity:1}:{opacity:1}}
            transition={tween(still,DUR.slow,first?.08+row*.06:DUR.base)}/>;
        })}
      </svg>
      <ol ref={stops} role="list" className="route-graph-stops">
        <AnimatePresence>
        {layout.nodes.map(n=>{
          const from=!first&&byId.get(n.neededFor[0]);
          const at={x:n.x-M.halo,y:n.y-M.halo};
          const about=[n.destination?`Today’s goal: ${goalName}.`:'',relation(n)].filter(Boolean).join(' ');
          return <motion.li key={n.id} className="route-node" data-kind={n.kind} data-destination={n.destination||undefined} data-next={n.next||undefined} data-dim={focus&&!near.has(n.id)?'':undefined}
            style={{width:M.halo+n.r+M.gap+n.labelWidth+8,height:Math.max(M.halo*2,n.bottom-(n.y-M.halo))}}
            initial={still?false:from?{x:from.x-M.halo,y:from.y-M.halo,opacity:0,scale:.6}:{...at,y:at.y-6,opacity:0,scale:1}}
            animate={{...at,opacity:1,scale:1}}
            exit={still?{opacity:0,transition:{duration:0}}:{opacity:0,scale:.8}}
            transition={tween(still,DUR.base,first?n.row*.06:0)}>
            <button type="button" aria-expanded={selected===n.id} aria-controls={panel} aria-describedby={about?`${uid}-${n.id}`:undefined}
              onClick={()=>setSelected(selected===n.id?null:n.id)}
              onMouseEnter={()=>setPointed(n.id)} onMouseLeave={()=>setPointed(null)}
              onFocus={()=>setPointed(n.id)} onBlur={()=>setPointed(null)}>
              <span className="route-dot" aria-hidden="true" style={{left:M.halo-n.r,top:M.halo-n.r,width:n.r*2,height:n.r*2}}>{n.kind==='checked'?<CheckMark/>:n.destination?<Flag/>:n.kind==='active'?<i className="route-pin"/>:null}</span>
              <span className="route-text" data-route-text={n.id} style={{left:M.halo+n.r+M.gap,top:M.halo-M.lift,maxWidth:n.labelWidth}}>
                <span className="route-label">{n.label}</span><span className="sr-only">, </span>
                <small>{n.status}</small>
              </span>
            </button>
            {about&&<span id={`${uid}-${n.id}`} className="sr-only">{about}</span>}
          </motion.li>;
        })}
        </AnimatePresence>
      </ol>
    </div>
    <div id={panel} aria-live="polite">{open&&<div className="route-reason">
      {relation(open)&&<p className="route-reason-links">{relation(open)}</p>}
      <p>{state.routeClue?.skill===open.id?<Rich>{state.routeClue.message}</Rich>:open.destination?`Return to ${goalName.toLowerCase()} with two fresh problems.`:open.kind==='checked'?`Two fresh checks passed. It stays on the map so you can see what holds up ${goalName.toLowerCase()}.`:`A useful step toward ${goalName.toLowerCase()}. Pass two fresh checks to skip its review.`}</p>
    </div>}</div>
  </div>;
}

function key(e:{from:Skill;to:Skill}){return `${e.from}>${e.to}`;}
