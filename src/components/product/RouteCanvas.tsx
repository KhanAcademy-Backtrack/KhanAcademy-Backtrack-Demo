'use client';

import { AnimatePresence, animate, motion, motionValue, useTransform, type AnimationPlaybackControls, type MotionValue } from 'motion/react';
import {useMotionPolicy} from '@/components/motion/MotionPolicy';
import {DUR,SPRING,tween} from '@/lib/motion-tokens';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { LABELS, TOPICS, type Recovery, type Skill } from '@/lib/recovery';
import { ROUTE_METRICS as M, edgePath, layoutRoute, routeGraph, type PlacedEdge, type PlacedNode } from '@/lib/route-graph';
import {Rich} from '@/components/math/Math';
import {plainText} from '@/lib/notation';

const CheckMark=()=><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const Flag=()=><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.6 14.2V2.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M5.4 2.8h7l-2 2.8 2 2.8h-7z" fill="currentColor"/></svg>;
/** How far a dragged step can be tugged, and how much of that its neighbours follow. */
const TUG=40,FOLLOW=.35;

type Place={x:MotionValue<number>;y:MotionValue<number>};

/** The route as a small living map: the goal anchored at the top, the skills it rests on beneath it.
 *  Placement lives in route-graph.ts. Here every step sits on a spring and every line is redrawn from
 *  where the steps are right now, so a recalculated route visibly regrows instead of being swapped. */
export function RouteCanvas({ state, compact = false }: { state: Recovery; compact?: boolean }) {
  const {off}=useMotionPolicy();
  const uid=useId();
  const [selected,setSelected]=useState<Skill|null>(null);
  const [pointed,setPointed]=useState<Skill|null>(null);
  const [dragged,setDragged]=useState<Skill|null>(null);
  const box=useRef<HTMLDivElement>(null);
  const [width,setWidth]=useState(292);
  // The map is laid out for the width it actually has, so labels never scale with a viewBox.
  useLayoutEffect(()=>{const el=box.current;if(!el)return;const measure=()=>{const w=Math.round(el.clientWidth);if(w>0)setWidth(w);};measure();if(typeof ResizeObserver==='undefined')return;const watch=new ResizeObserver(measure);watch.observe(el);return()=>watch.disconnect();},[]);
  /* Typing an answer saves a draft and rebuilds the route state on every keystroke. The map only
     reacts when its own structure changes: a new step, a new status, a new link. */
  const fresh=routeGraph(state),signature=JSON.stringify(fresh);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const graph=useMemo(()=>fresh,[signature]);
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

  /* Every step's position is a spring. On the first paint the map unfolds from the goal; later, a
     new step starts where the skill that needed it is and springs into its own place, and the rest
     make room. Quiet or reduced motion places everything at once. */
  const places=useRef(new Map<Skill,Place>());
  const mounted=useRef(false);
  const first=!mounted.current;
  const here=layout.nodes.find(n=>n.kind==='active')?.id;
  const placeOf=(n:PlacedNode)=>{
    let p=places.current.get(n.id);
    // Grow out of the step the learner is on when it is one of those this skill supports.
    if(!p){const from=off?undefined:[...n.neededFor].sort((a,b)=>Number(b===here)-Number(a===here)).map(id=>places.current.get(id)).find(Boolean);p={x:motionValue(from?from.x.get():n.x),y:motionValue(from?from.y.get():n.y)};places.current.set(n.id,p);}
    return p;
  };
  const placed=layout.nodes.map(n=>({n,p:placeOf(n)}));
  useEffect(()=>{mounted.current=true;},[]);
  useLayoutEffect(()=>{
    const runs:AnimationPlaybackControls[]=[];
    for(const {n,p} of placed){
      if(off){p.x.jump(n.x);p.y.jump(n.y);continue;}
      if(p.x.get()===n.x&&p.y.get()===n.y)continue;
      const delay=first?.06*n.row:0;
      runs.push(animate(p.x,n.x,{...SPRING,delay}),animate(p.y,n.y,{...SPRING,delay}));
    }
    // A step that left the map regrows from its neighbour if it ever comes back.
    for(const id of [...places.current.keys()])if(!layout.nodes.some(n=>n.id===id))places.current.delete(id);
    return()=>runs.forEach(r=>r.stop());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[layout,off]);

  const byId=new Map(layout.nodes.map(n=>[n.id,n]));
  const destination=graph.destination;

  /* A mouse can tug a step: its lines stretch, its neighbours lean after it, and letting go
     springs everything home. The destination stays put. Touch keeps scrolling and tapping;
     keyboards use selection. */
  const tug=useRef<{id:Skill;sx:number;sy:number;moved:boolean}|null>(null);
  const tugged=useRef(false);
  const neighbours=(id:Skill)=>{const n=byId.get(id);return n?[...n.needs,...n.neededFor].filter(x=>x!==destination):[];};
  const pull=(id:Skill,dx:number,dy:number)=>{
    const ex=TUG*Math.tanh(dx/TUG),ey=TUG*Math.tanh(dy/TUG);
    const move=(skill:Skill,share:number)=>{const n=byId.get(skill),p=places.current.get(skill);if(!n||!p)return;p.x.stop();p.y.stop();p.x.set(n.x+ex*share);p.y.set(n.y+ey*share);};
    move(id,1);for(const other of neighbours(id))move(other,FOLLOW);
  };
  const settle=(id:Skill)=>{for(const skill of [id,...neighbours(id)]){const n=byId.get(skill),p=places.current.get(skill);if(!n||!p)continue;animate(p.x,n.x,SPRING);animate(p.y,n.y,SPRING);}};
  const grab=(e:ReactPointerEvent<HTMLButtonElement>,id:Skill)=>{if(off||id===destination||e.pointerType!=='mouse'||e.button!==0)return;tug.current={id,sx:e.clientX,sy:e.clientY,moved:false};};
  const drag=(e:ReactPointerEvent<HTMLButtonElement>)=>{
    const t=tug.current;if(!t)return;
    const dx=e.clientX-t.sx,dy=e.clientY-t.sy;
    if(!t.moved){if(Math.hypot(dx,dy)<5)return;t.moved=true;e.currentTarget.setPointerCapture(e.pointerId);setDragged(t.id);}
    pull(t.id,dx,dy);
  };
  const drop=()=>{const t=tug.current;tug.current=null;if(t?.moved){tugged.current=true;settle(t.id);setDragged(null);}};

  const label=state.goalPassed?'Back on track':state.suspected.length?'Your updated route':'Your route';
  // Progress only: the count never grows when a check is missed.
  const progress=state.goalPassed?'Destination checked':graph.checked?`${graph.checked} ${graph.checked===1?'step':'steps'} checked`:'Choose a step to see why';

  /* Pointing at, focusing, holding or opening a step lights its own links and its way up to the
     goal; everything else steps back. Labels never dim. */
  const focus=[dragged,pointed,selected].find((id):id is Skill=>!!id&&byId.has(id))??null;
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

  /* Quiet lines first and the way ahead above them. The order ignores hover, because moving a
     line in the page would replay its entrance. */
  const weight=(e:PlacedEdge)=>e.onRoute?2:e.checked?1:0;
  const lines=[...layout.edges].sort((a,b)=>weight(a)-weight(b));

  return <div className={`route-canvas ${compact?'compact':''}`}>
    <div className="route-heading"><span className={state.suspected.length&&!state.goalPassed?'warm':''}>{label}</span><span>{progress}</span></div>
    <div ref={box} className="route-graph" style={{height:layout.height}}>
      <svg className="route-graph-lines" width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
        {lines.map(e=>{const a=places.current.get(e.from),b=places.current.get(e.to),from=byId.get(e.from),to=byId.get(e.to);if(!a||!b||!from||!to)return null;
          return <RouteLine key={key(e)} edge={e} a={a} b={b} ar={from.r} br={to.r} off={off} delay={first?.1+from.row*.06:DUR.fast}
            className={['route-edge',e.onRoute&&'is-route',e.checked&&'is-checked',e.inferred&&'is-inferred',focus&&(lit.has(key(e))?'is-lit':'is-dim')].filter(Boolean).join(' ')}/>;})}
      </svg>
      <ol ref={stops} role="list" className="route-graph-stops">
        <AnimatePresence>
        {placed.map(({n,p})=>{
          const about=[n.destination?`Today’s goal: ${goalName}.`:'',relation(n)].filter(Boolean).join(' ');
          return <RouteStop key={n.id} place={p} off={off} delay={first?.06*n.row:0}
            className="route-node" data-kind={n.kind} data-destination={n.destination||undefined} data-next={n.next||undefined} data-tight={n.tight||undefined} data-dim={focus&&!near.has(n.id)?'':undefined} data-held={dragged===n.id||undefined}
            style={{width:M.halo+n.r+M.gap+n.labelWidth+8,height:Math.max(M.halo*2,n.bottom-(n.y-M.halo))}}>
            <button type="button" aria-label={`${n.label}, ${n.status}`} aria-expanded={selected===n.id} aria-controls={panel} aria-describedby={about?`${uid}-${n.id}`:undefined}
              onClick={()=>{if(tugged.current){tugged.current=false;return;}setSelected(selected===n.id?null:n.id);}}
              onPointerDown={e=>grab(e,n.id)} onPointerMove={drag} onPointerUp={drop} onPointerCancel={drop}
              onMouseEnter={()=>setPointed(n.id)} onMouseLeave={()=>setPointed(null)}
              onFocus={()=>setPointed(n.id)} onBlur={()=>setPointed(null)}>
              <span className="route-dot" aria-hidden="true" style={{left:M.halo-n.r,top:M.halo-n.r,width:n.r*2,height:n.r*2}}>{n.kind==='checked'?<CheckMark/>:n.destination?<Flag/>:n.kind==='active'?<i className="route-pin"/>:null}</span>
              <span className="route-text" data-route-text={n.id} style={{left:M.halo+n.r+M.gap,top:M.halo-M.lift,maxWidth:n.labelWidth}}>
                <span className="route-label">{n.label}</span>
                <small>{n.status}</small>
              </span>
            </button>
            {about&&<span id={`${uid}-${n.id}`} className="sr-only">{about}</span>}
          </RouteStop>;
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

/** One step, positioned by its spring. Only transform and opacity animate. */
function RouteStop({place,off,delay,children,...rest}:{place:Place;off:boolean;delay:number;children:ReactNode;className:string;style:CSSProperties}&Record<`data-${string}`,string|boolean|undefined>){
  const x=useTransform(place.x,v=>v-M.halo),y=useTransform(place.y,v=>v-M.halo);
  return <motion.li {...rest} style={{...rest.style,x,y}}
    initial={off?false:{opacity:0,scale:.6}} animate={{opacity:1,scale:1}}
    exit={off?{opacity:0,transition:{duration:0}}:{opacity:0,scale:.6}}
    transition={tween(off,DUR.base,delay)}>{children}</motion.li>;
}

/** One link, redrawn from where its two steps are this frame, so it stretches as they move.
 *  The path is written straight from the springs' change events rather than through a React
 *  prop, and its entrance is a CSS draw, so nothing can leave a line stuck half drawn. */
function RouteLine({edge,a,b,ar,br,off,delay,className}:{edge:PlacedEdge;a:Place;b:Place;ar:number;br:number;off:boolean;delay:number;className:string}){
  const path=useRef<SVGPathElement>(null);
  // Decided once: toggling the animation later (focus moving in and out of an answer) would replay it.
  const [still]=useState(off);
  const shape=useRef({ar,br,foot:edge.footBelow});shape.current={ar,br,foot:edge.footBelow};
  useLayoutEffect(()=>{
    const draw=()=>path.current?.setAttribute('d',edgePath(a.x.get(),a.y.get(),shape.current.ar,b.x.get(),b.y.get(),shape.current.br,shape.current.foot));
    draw();
    const stops=[a.x,a.y,b.x,b.y].map(v=>v.on('change',draw));
    return()=>stops.forEach(stop=>stop());
  },[a,b,ar,br,edge.footBelow]);
  return <path ref={path} className={still?`${className} is-still`:className} pathLength={edge.inferred?undefined:1} style={still?undefined:{animationDelay:`${delay}s`}}/>;
}

function key(e:{from:Skill;to:Skill}){return `${e.from}>${e.to}`;}
