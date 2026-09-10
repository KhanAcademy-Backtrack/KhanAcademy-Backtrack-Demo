'use client';
import {useEffect,useRef,useState} from 'react';
import {useReducedMotion} from 'motion/react';
import {MathText} from '@/components/math/Math';
import type {Recovery} from '@/lib/recovery';
import {COMPOUNDS,EQUATIONS,ELEMENT_NAMES,formulaMass,signed,round,type Species} from '@/lib/science';

/* ==========================================================================
   Original interactive explanations for chemistry and physics.

   Every lab follows the same shape, and the order matters:

     1. the learner commits to a prediction before anything moves;
     2. they change one thing, and the picture and the symbols move together;
     3. the invariant is stated in words, in their language;
     4. the support is taken away and a fresh, unexposed problem is handed over.

   A control that is dragged until an indicator turns green is not evidence of
   anything, so nothing here is scored and nothing here reaches the reviewer.
   Every drawing is ours; every value is computed from the reviewed tables in
   src/lib/science.ts. Motion is opt-out via prefers-reduced-motion and the
   study space's quiet mode.
   ========================================================================== */

export type ScienceKind='balancing'|'moles'|'motion'|'forces';

function Predict({question,options,answer,onDone}:{question:string;options:string[];answer:number;onDone:()=>void}){
  const [picked,setPicked]=useState<number>();
  return <div className="lab-predict">
    <p className="lab-step">First, a prediction. Nothing is scored here.</p>
    <fieldset><legend>{question}</legend>
      {options.map((option,i)=><label key={option}><input type="radio" name={question} checked={picked===i} onChange={()=>setPicked(i)}/><span>{option}</span></label>)}
    </fieldset>
    {picked!==undefined&&<p className="lab-predict-result" role="status">{picked===answer?'That is the one to hold on to. Now watch why it has to be true.':'Hold that thought. Change something below and see whether it survives.'}</p>}
    <button className="button-secondary" type="button" disabled={picked===undefined} onClick={onDone}>Now show me ↗</button>
  </div>;
}

/** `set` takes an updater, so two quick clicks compose instead of both reading
 *  the value captured when this rendered. */
const step=(label:string,value:number,set:(next:(v:number)=>number)=>void,min:number,max:number)=>
  <div className="lab-stepper" key={label}>
    <span id={`lab-${label.replace(/\W+/g,'-')}`}>{label}</span>
    <div>
      <button type="button" aria-label={`Decrease ${label.toLowerCase()}`} disabled={value<=min} onClick={()=>set(v=>Math.max(min,v-1))}>−</button>
      <output aria-live="off">{value}</output>
      <button type="button" aria-label={`Increase ${label.toLowerCase()}`} disabled={value>=max} onClick={()=>set(v=>Math.min(max,v+1))}>+</button>
    </div>
  </div>;

/* --- balancing: a two-pan atom count ------------------------------------ */

function BalanceLab({state}:{state?:Recovery}){
  // The learner's own equation when there is one, so the guide and the check
  // are about the same chemistry. The reserve below keeps it out of the check.
  const e=EQUATIONS[(state?.topic==='balancing'?state.serial:0)%EQUATIONS.length];
  const [coefficients,setCoefficients]=useState(()=>e.species.map(()=>1));
  const set=(i:number,next:(v:number)=>number)=>setCoefficients(xs=>xs.map((x,j)=>i===j?next(x):x));
  const elements=[...new Set(e.species.flatMap(sp=>Object.keys(sp.parts)))];
  const count=(from:number,to:number,el:string)=>e.species.slice(from,to).reduce((sum,sp,i)=>sum+(sp.parts[el]??0)*coefficients[from+i],0);
  const left=(el:string)=>count(0,e.reactants,el),right=(el:string)=>count(e.reactants,e.species.length,el);
  const balanced=elements.every(el=>left(el)===right(el));
  const side=(from:number,to:number)=>e.species.slice(from,to).map((sp,i)=>`${coefficients[from+i]}\\,${sp.latex}`).join(' + ');
  const tilt=elements.reduce((sum,el)=>sum+left(el)-right(el),0);
  return <>
    <h3>Atoms are rearranged, never created.</h3>
    <p>Change the numbers in front. Watch both pans at once — a coefficient changes how many units there are, and every atom inside them moves with it.</p>
    <div className="lab-equation"><MathText size="md">{`${side(0,e.reactants)} → ${side(e.reactants,e.species.length)}`}</MathText></div>
    <svg className="balance-figure" viewBox="0 0 320 116" role="img" aria-label={`A balance. The reactant pan holds ${elements.map(el=>`${left(el)} ${ELEMENT_NAMES[el]}`).join(', ')}. The product pan holds ${elements.map(el=>`${right(el)} ${ELEMENT_NAMES[el]}`).join(', ')}.`}>
      <path d="M160 96V44" stroke="#0a2a66" strokeWidth="3" strokeLinecap="round"/>
      <path d="M132 100h56" stroke="#0a2a66" strokeWidth="4" strokeLinecap="round"/>
      <g transform={`rotate(${Math.max(-7,Math.min(7,tilt*2))} 160 44)`}>
        <path d="M56 44h208" stroke="#0a2a66" strokeWidth="3" strokeLinecap="round"/>
        <path d="M56 44v16m208-16v16" stroke="#0a2a66" strokeWidth="2"/>
        <rect x="18" y="60" width="76" height="30" rx="8" fill={balanced?'#14bf96':'#e7f9f3'} stroke="#0a2a66" strokeWidth="2"/>
        <rect x="226" y="60" width="76" height="30" rx="8" fill={balanced?'#14bf96':'#eef3fa'} stroke="#0a2a66" strokeWidth="2"/>
      </g>
      <circle cx="160" cy="44" r="5" fill="#0a2a66"/>
    </svg>
    <div className="lab-steppers">{e.species.map((sp,i)=>step(`${sp.plain}`,coefficients[i],next=>set(i,next),1,12))}</div>
    <table className="atom-ledger"><caption>Atoms on each side</caption>
      <thead><tr><th scope="col">Element</th><th scope="col">Left</th><th scope="col">Right</th></tr></thead>
      <tbody>{elements.map(el=><tr key={el} data-match={left(el)===right(el)}><th scope="row">{ELEMENT_NAMES[el]}</th><td>{left(el)}</td><td>{right(el)}</td></tr>)}</tbody>
    </table>
    <p className="concept-invariant" aria-live="polite">{balanced?'Balanced: the number of atoms of each element is the same on both sides.':`Not yet: ${elements.filter(el=>left(el)!==right(el)).map(el=>`${ELEMENT_NAMES[el]} is ${left(el)} against ${right(el)}`).join(', ')}.`}</p>
    <p className="concept-explanation">The invariant is the atom count. Coefficients are the only thing you may change — editing a subscript would balance the numbers by quietly swapping one substance for another.</p>
  </>;
}

/* --- moles: grams, moles and particles as one quantity ------------------- */

function MolesLab({state}:{state?:Recovery}){
  const compound:Species=state?COMPOUNDS[state.serial%COMPOUNDS.length]:COMPOUNDS[2];
  const M=formulaMass(compound.parts);
  const [grams,setGrams]=useState(()=>Math.round(M));
  const moles=round(grams/M,2),particles=round(moles*6.022,2);
  return <>
    <h3>One substance, three ways of counting it.</h3>
    <p>Molar mass is a fixed exchange rate: {M} g of {compound.plain} is always one mole. Move the mass and watch all three readings move together — they are one quantity, not three.</p>
    <label className="concept-slider">Mass of {compound.plain}: <strong>{grams} g</strong>
      <input type="range" min="1" max={Math.round(M*4)} value={grams} onChange={event=>setGrams(Number(event.target.value))} aria-label={`Mass of ${compound.plain} in grams`}/>
    </label>
    <svg className="moles-figure" viewBox="0 0 320 74" role="img" aria-label={`A bar showing ${grams} grams filling ${moles} of four mole portions.`}>
      <rect x="4" y="20" width="312" height="34" rx="8" fill="#eef3fa" stroke="#0a2a66" strokeWidth="1.5"/>
      <rect x="4" y="20" width={Math.max(2,Math.min(312,312*grams/(M*4)))} height="34" rx="8" fill="#14bf96"/>
      {[1,2,3].map(n=><path key={n} d={`M${4+312*n/4} 20v34`} stroke="#0a2a66" strokeWidth="1.5"/>)}
      {[0,1,2,3].map(n=><text key={n} x={4+312*(n+0.5)/4} y="68" textAnchor="middle" fontSize="10" fill="#475e7c">{n+1} mol</text>)}
    </svg>
    <dl className="lab-readout" aria-live="polite">
      <div><dt>Mass</dt><dd>{grams} g</dd></div>
      <div><dt>Amount</dt><dd>{moles} mol</dd></div>
      <div><dt>Particles</dt><dd>{particles} × 10²³</dd></div>
    </dl>
    <div className="lab-equation"><MathText size="md" speak={`n equals m over M equals ${grams} over ${M} equals ${moles}`}>{`n = \\frac{m}{M} = \\frac{${grams}}{${M}} = ${moles}`}</MathText></div>
    <p className="concept-invariant">The rate stays the same when the quantity changes. Doubling the mass doubles the moles and doubles the particles; the {M} g per mole never moves.</p>
    <p className="concept-explanation">This is why dividing is the right move: you are asking how many whole-mole portions fit inside the mass you have. Multiplying by {M} answers a different question — the mass of {grams} moles.</p>
  </>;
}

/* --- motion: a track and its speed–time reading -------------------------- */

function MotionLab(){
  const reduced=useReducedMotion();
  const [u,setU]=useState(3),[a,setA]=useState(2),[t,setT]=useState(3);
  const speed=u+a*t,distance=u*t+a*t*t/2;
  return <>
    <h3>Acceleration is speed added, second by second.</h3>
    <p>The cart is already moving. Each second the acceleration adds the same amount again — so the final speed is what it started with, plus everything the acceleration built up.</p>
    <svg className="track-figure" viewBox="0 0 320 118" role="img" aria-label={`A speed–time chart above a track. Each second the bar grows by the same ${a} metres per second. After ${t} seconds the cart has travelled ${round(distance,1)} metres and is moving at ${speed} metres per second.`}>
      {Array.from({length:t+1},(_,i)=>u+a*i).map((v,i)=>{const h=Math.max(3,42*v/Math.max(1,speed));return <g key={i}>
        <rect x={10+i*44} y={56-h} width="26" height={h} rx="3" fill={i===t?'#14bf96':'#e7f9f3'} stroke="#0a2a66" strokeWidth="1.5"/>
        <text x={23+i*44} y="68" textAnchor="middle" fontSize="9" fill="#475e7c">{v}</text>
      </g>;})}
      <path d="M6 56h306" stroke="#0a2a66" strokeWidth="1.5"/>
      <text x="6" y="10" fontSize="9" fill="#475e7c">speed each second (m/s)</text>
      <path d="M8 104h304" stroke="#0a2a66" strokeWidth="2"/>
      {[0,1,2,3,4,5,6].map(n=><path key={n} d={`M${8+n*50.6} 104v7`} stroke="#475e7c" strokeWidth="1.5"/>)}
      <rect x={8+276*Math.min(1,distance/108)} y="84" width="28" height="18" rx="4" fill="#14bf96" stroke="#0a2a66" strokeWidth="2" style={reduced?undefined:{transition:'x .25s ease-out'}}/>
    </svg>
    <div className="lab-steppers">{step('Starting speed',u,setU,0,9)}{step('Acceleration',a,setA,1,6)}{step('Seconds',t,setT,1,6)}</div>
    <div className="lab-equation"><MathText size="md" speak={`v equals u plus a t equals ${u} plus ${a} times ${t} equals ${speed}`}>{`v = u + at = ${u} + ${a} × ${t} = ${speed}`}</MathText></div>
    <p className="concept-invariant" aria-live="polite">Each bar is one second taller by the same {a} m/s. The final speed is {speed} m/s: the {u} m/s it already had, plus the {a*t} m/s the acceleration added.</p>
    <p className="concept-explanation">Dropping the starting speed and using at alone describes a different cart — one that began at rest. The acceleration would be identical; the journey would not.</p>
  </>;
}

/* --- forces: free-body arrows and what they produce ---------------------- */

function ForcesLab(){
  const [right,setRight]=useState(12),[left,setLeft]=useState(5),[mass,setMass]=useState(4);
  const net=right-left,accel=round(net/mass,2);
  const arrow=(x:number,size:number,direction:1|-1,colour:string)=>size===0?null:
    <path d={`M${x} 46h${direction*Math.min(84,size*5)}m0 0l${-direction*9} -6m${direction*9} 6l${-direction*9} 6`} stroke={colour} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>;
  return <>
    <h3>Forces do not act one at a time.</h3>
    <p>Both pushes are there at once. What the block actually does is set by what is left over after they combine — and by how much block there is to move.</p>
    <svg className="forces-figure" viewBox="0 0 320 92" role="img" aria-label={`A block with ${right} newtons to the right and ${left} newtons to the left. The net force is ${signed(net)} newtons and the acceleration is ${accel} metres per second squared.`}>
      <path d="M8 74h304" stroke="#0a2a66" strokeWidth="2"/>
      <rect x="136" y="32" width="48" height="42" rx="5" fill="#eef3fa" stroke="#0a2a66" strokeWidth="2"/>
      <text x="160" y="59" textAnchor="middle" fontSize="12" fill="#0a2a66">{mass} kg</text>
      {arrow(184,right,1,'#0a2a66')}
      {arrow(136,left,-1,'#475e7c')}
      <rect x={net<0?160-Math.min(84,Math.abs(net)*5):160} y="14" width={Math.max(1,Math.min(84,Math.abs(net)*5))} height="8" rx="4" fill="#14bf96"/>
      <text x="160" y="10" textAnchor="middle" fontSize="9" fill="#475e7c">net {signed(net)} N</text>
    </svg>
    <div className="lab-steppers">{step('Force right',right,setRight,0,16)}{step('Force left',left,setLeft,0,16)}{step('Mass',mass,setMass,1,8)}</div>
    <div className="lab-equation"><MathText size="md" speak={`net force equals ${signed(net)} newtons, a equals ${signed(net)} over ${mass} equals ${accel}`}>{`F = ${signed(net)}\\,\\mathrm{N},\\,a = \\frac{${signed(net)}}{${mass}} = ${accel}`}</MathText></div>
    <p className="concept-invariant" aria-live="polite">{net===0?'The forces cancel exactly. The net force is zero, so there is no acceleration — that is balance, not the absence of forces.':`The net force sets the acceleration: ${signed(net)} N on ${mass} kg gives ${accel} m/s², to the ${net>0?'right':'left'}.`}</p>
    <p className="concept-explanation">Make the block heavier without touching either push and the arrows stay exactly as they were, but the acceleration falls. The forces decide the net push; the mass decides what that push produces.</p>
  </>;
}

export function ScienceLab({kind,onContinue,state,onExpose,reserve}:{kind:ScienceKind;onContinue:()=>void;state?:Recovery;onExpose?:(serial:number)=>void;reserve?:number}){
  const [shown,setShown]=useState(false);const exposed=useRef(false);
  useEffect(()=>{if(exposed.current||!state||reserve===undefined)return;exposed.current=true;onExpose?.(reserve);},[state,reserve,onExpose]);
  const predict=kind==='balancing'?{question:'If you double every number in front of a balanced equation, is it still balanced?',options:['No — the amounts change','Yes — both sides double together','Only if nothing has a subscript'],answer:1}
    :kind==='moles'?{question:'Two beakers hold the same mass: one of water, one of glucose. Do they hold the same number of moles?',options:['Yes — the mass is the same','No — a mole of each weighs a different amount','Only if both are pure'],answer:1}
    :kind==='motion'?{question:'A cart already moving at 4 m/s accelerates at 2 m/s² for 3 s. Is its final speed 6 m/s?',options:['Yes — 2 × 3 = 6','No — the 4 m/s it already had still counts','Only if it started from rest'],answer:1}
    :{question:'A block is pushed with 10 N right and 10 N left. Is it accelerating?',options:['Yes — two forces are acting','No — the forces cancel, so there is no net force','Only if the block is light'],answer:1};
  return <section className="concept-lab science-lab">
    <div className="repair-kicker"><span>Dunlo visual guide</span></div>
    {shown?<>
      {kind==='balancing'?<BalanceLab state={state}/>:kind==='moles'?<MolesLab state={state}/>:kind==='motion'?<MotionLab/>:<ForcesLab/>}
      <button className="button-primary" type="button" onClick={onContinue}>Use the idea on a fresh check ↗</button>
      <p className="fine-print">Nothing in this guide is recorded as evidence. The fresh check that follows uses numbers you have not seen here.</p>
    </>:<Predict {...predict} onDone={()=>setShown(true)}/>}
  </section>;
}
