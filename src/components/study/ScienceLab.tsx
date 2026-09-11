'use client';
import {useEffect,useRef,useState} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import {useStudy} from './StudyProvider';
import {Companion} from './Companion';
import {MathText} from '@/components/math/Math';
import type {Recovery} from '@/lib/recovery';
import {COMPOUNDS,EQUATIONS,ELEMENT_NAMES,ATOMIC_MASS,formulaMass,signed,round,type Species} from '@/lib/science';
import {freshLab,type LabSave} from '@/lib/visual-maths';

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
/** Each lab's controls are saved with the route, so returning to a guide shows the
 *  arrangement the learner had built rather than the worked example's defaults.
 *  Reading clamps, because a value restored from storage is not trusted. */
type Store={value:(name:string,fallback:number,min:number,max:number)=>number;put:(name:string,next:(v:number)=>number,fallback:number)=>void};
function useSceneMotion(){const reduced=useReducedMotion(),{state}=useStudy();return {duration:reduced||state.settings.quiet?0:.55,ease:[.22,1,.36,1] as [number,number,number,number]};}

function Predict({question,options,answer,onDone}:{question:string;options:string[];answer:number;onDone:()=>void}){
  const [picked,setPicked]=useState<number>();
  return <div className="lab-predict">
    <p className="lab-step">First, a prediction. Nothing is scored here.</p>
    <fieldset><legend>{question}</legend>
      {options.map((option,i)=><label key={option}><input type="radio" name={question} checked={picked===i} onChange={()=>setPicked(i)}/><span>{option}</span></label>)}
    </fieldset>
    {picked!==undefined&&<p className="lab-predict-result" role="status">{picked===answer?'That is the one to hold on to. Now watch why it has to be true.':'Hold that thought. Change something below and see whether it survives.'}</p>}
    <button className="button-secondary" type="button" disabled={picked===undefined} onClick={onDone}>Now show me ↗</button><button className="button-text" onClick={onDone}>Show me an example first</button><button className="button-text" onClick={onDone}>I don’t know yet</button>
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

function BalanceLab({state,store}:{state?:Recovery;store:Store}){
  const move=useSceneMotion();
  // The learner's own equation when there is one, so the guide and the check
  // are about the same chemistry. The reserve below keeps it out of the check.
  const e=EQUATIONS[(state?.topic==='balancing'?state.serial:0)%EQUATIONS.length];
  const coefficients=e.species.map((_,i)=>store.value(`c${i}`,1,1,12));
  const set=(i:number,next:(v:number)=>number)=>store.put(`c${i}`,next,1);
  const elements=[...new Set(e.species.flatMap(sp=>Object.keys(sp.parts)))];
  const count=(from:number,to:number,el:string)=>e.species.slice(from,to).reduce((sum,sp,i)=>sum+(sp.parts[el]??0)*coefficients[from+i],0);
  const left=(el:string)=>count(0,e.reactants,el),right=(el:string)=>count(e.reactants,e.species.length,el);
  const balanced=elements.every(el=>left(el)===right(el));
  const side=(from:number,to:number)=>e.species.slice(from,to).map((sp,i)=>`${coefficients[from+i]}\\,${sp.latex}`).join(' + ');
  const tilt=elements.reduce((sum,el)=>sum+left(el)-right(el),0);
  return <>
    <h3>Atoms are rearranged, never created.</h3>
    <p>Change the numbers in front. Watch the counts on both sides — a coefficient changes how many units there are, and every atom inside them moves with it.</p>
    <div className="lab-equation"><MathText size="md">{`${side(0,e.reactants)} → ${side(e.reactants,e.species.length)}`}</MathText></div>
    <div className="science-buddy-note"><Companion size={82} pose={balanced?'aha':'thinking'}/><p>Compare each element separately. A matching total alone is not enough.</p></div>
    <svg className="balance-figure element-comparison" viewBox={`0 0 400 ${55+elements.length*59}`} role="img" aria-label={`Atom counts: ${elements.map(el=>`${ELEMENT_NAMES[el]}, left ${left(el)}, right ${right(el)}`).join('; ')}. ${balanced?'Every element matches.':'Some elements still differ.'}`}>
      <text x="100" y="20" textAnchor="middle">Reactants</text><text x="280" y="20" textAnchor="middle">Products</text>
      {elements.map((el,i)=>{const max=Math.max(1,left(el),right(el)),y=42+i*59;return <g key={el}><text x="8" y={y+21}>{el}</text><rect x="45" y={y} width="125" height="28" rx="5" fill="#edf5f2"/><rect x="225" y={y} width="125" height="28" rx="5" fill="#edf1f7"/><motion.rect initial={false} x="45" y={y} animate={{width:125*left(el)/max}} height="28" rx="5" fill="#14bf96" transition={move}/><motion.rect initial={false} x="225" y={y} animate={{width:125*right(el)/max}} height="28" rx="5" fill="#b9d5ec" transition={move}/><text x="108" y={y+20} textAnchor="middle">{left(el)}</text><text x="288" y={y+20} textAnchor="middle">{right(el)}</text><text x="197" y={y+20} textAnchor="middle">{left(el)===right(el)?'=':'≠'}</text></g>;})}
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

function MolesLab({state,store}:{state?:Recovery;store:Store}){
  const move=useSceneMotion();
  const compound:Species=state?COMPOUNDS[state.serial%COMPOUNDS.length]:COMPOUNDS[2];
  const M=formulaMass(compound.parts);
  const massMode=state?.active==='formula_mass';
  const top=Math.floor(M*4);
  const massInput=store.value('grams',Math.round(M),1,top),amount=store.value('amount',1,1,4);
  const setGrams=(n:number)=>store.put('grams',()=>n,Math.round(M)),setAmount=(n:number)=>store.put('amount',()=>n,1);
  const grams=massMode?round(amount*M,2):massInput;
  const moles=massMode?amount:round(grams/M,2),particles=round((grams/M)*6.022,2);
  return <>
    <h3>{massMode?'Every atom contributes to the mass.':'One substance, three ways of counting it.'}</h3>
    <p>Molar mass is a fixed exchange rate: {M} g of {compound.plain} is always one mole. Move the mass and watch all three readings move together — they are one quantity, not three.</p>
    <div className="science-buddy-note"><Companion size={80} pose="point"/><p>The substance stays the same. Its mass, amount and particle count describe one quantity.</p></div>
    <details className="formula-mass-parts" open={massMode||undefined}><summary>Where does the molar mass come from?</summary>{Object.entries(compound.parts).map(([element,count])=><p key={element}>{count} × {ATOMIC_MASS[element]} for {ELEMENT_NAMES[element]}</p>)}<p>Total: {M} g/mol, rounded to two decimal places using the table.</p></details>
    {massMode?<label className="concept-slider">Amount of {compound.plain}: <strong>{amount} mol</strong><input type="range" min="1" max="4" value={amount} onChange={e=>setAmount(Number(e.target.value))} aria-label={`Amount of ${compound.plain} in moles`}/></label>:<>    <label className="concept-slider">Mass of {compound.plain}: <strong>{grams} g</strong>
      <input type="range" min="1" max={top} value={grams} onChange={event=>setGrams(Number(event.target.value))} aria-label={`Mass of ${compound.plain} in grams`}/>
    </label>
</>}
    <svg className="moles-figure" viewBox="0 0 320 74" role="img" aria-label={`A bar showing ${grams} grams filling ${moles} of four mole portions.`}>
      <rect x="4" y="20" width="312" height="34" rx="8" fill="#eef3fa" stroke="#0a2a66" strokeWidth="1.5"/>
      <motion.rect initial={false} x="4" y="20" animate={{width:312*grams/(M*4)}} transition={move} height="34" rx="8" fill="#14bf96"/>
      {[1,2,3].map(n=><path key={n} d={`M${4+312*n/4} 20v34`} stroke="#0a2a66" strokeWidth="1.5"/>)}
      {[0,1,2,3].map(n=><text key={n} x={4+312*(n+0.5)/4} y="68" textAnchor="middle" fontSize="10" fill="#475e7c">{n+1} mol</text>)}
    </svg>
    <dl className="lab-readout" aria-live="polite">
      <div><dt>Mass</dt><dd>{grams} g</dd></div>
      <div><dt>Amount</dt><dd>{moles} mol</dd></div>
      <div><dt>Particles (approx.)</dt><dd><MathText size="sm" speak={`${particles} times ten to the power 23 particles`}>{`${particles} × 10^{23}`}</MathText></dd></div>
    </dl>
    <div className="lab-equation">{massMode?<MathText size="md" speak={`Mass equals ${amount} moles times ${M} grams per mole, giving ${grams} grams.`}>{`m = nM = ${amount} × ${M} = ${grams}\\,\\mathrm{g}`}</MathText>:<MathText size="md" speak={`n equals m over M, ${grams} over ${M}, approximately ${moles} moles.`}>{`n = \\frac{m}{M} = \\frac{${grams}}{${M}} ≈ ${moles}\\,\\mathrm{mol}`}</MathText>}</div>
    <p className="concept-invariant">The rate stays the same when the quantity changes. Doubling the mass doubles the moles and doubles the particles; the {M} g per mole never moves.</p>
    <p className="concept-explanation">{massMode?`One mole weighs ${M} g according to this table. Each additional mole adds another ${M} g, so multiply molar mass by the number of moles.`:<>This is why dividing is the right move: you are asking how many whole-mole portions fit inside the mass you have. Multiplying by {M} answers a different question — the mass of {grams} moles.</>}</p>
  </>;
}

/* --- motion: a track and its speed–time reading -------------------------- */

function MotionLab({store}:{store:Store}){
  const move=useSceneMotion();
  const u=store.value('u',3,0,9),a=store.value('accel',2,1,6),t=store.value('secs',3,1,6);
  const setU=(next:(v:number)=>number)=>store.put('u',next,3),setA=(next:(v:number)=>number)=>store.put('accel',next,2),setT=(next:(v:number)=>number)=>store.put('secs',next,3);
  const speed=u+a*t,distance=u*t+a*t*t/2;
  return <>
    <h3>Acceleration is speed added, second by second.</h3>
    <p>The cart is already moving. Each second the acceleration adds the same amount again — so the final speed is what it started with, plus everything the acceleration built up.</p>
    <div className="science-buddy-note"><Companion size={82} pose={t>=5?'aha':'point'}/><p>Change the time, starting speed or acceleration. Watch which part of the journey changes.</p></div>
    <svg className="track-figure" viewBox="0 0 320 145" role="img" aria-label={`A speed–time chart above a track. Each second the bar grows by the same ${a} metres per second. After ${t} seconds the cart has travelled ${round(distance,1)} metres and is moving at ${speed} metres per second.`}>
      {Array.from({length:t+1},(_,i)=>u+a*i).map((v,i)=>{const h=42*v/45;return <g key={i}>
        <motion.rect initial={false} transition={move} x={10+i*44} animate={{y:56-h,height:h}} width="26" rx="3" fill={i===t?'#14bf96':'#e7f9f3'} stroke="#0a2a66" strokeWidth="1.5"/>
        <text x={23+i*44} y="68" textAnchor="middle" fontSize="9" fill="#475e7c">{v}</text>
      </g>;})}
      <path d="M6 56h306" stroke="#0a2a66" strokeWidth="1.5"/>
      <text x="6" y="10" fontSize="9" fill="#475e7c">speed each second (m/s)</text>
      <path d="M8 108h304" stroke="#0a2a66" strokeWidth="2"/>
      {[0,1,2,3,4,5,6].map(n=><path key={n} d={`M${22+n*46} 108v6`} stroke="#475e7c" strokeWidth="1.5"/>)}
      <motion.g className="science-cart" initial={false} animate={{x:8+276*distance/162}} transition={move}><rect y="84" width="28" height="18" rx="4" fill="#14bf96" stroke="#0a2a66" strokeWidth="2"/><circle cx="7" cy="104" r="3" fill="#0a2a66"/><circle cx="21" cy="104" r="3" fill="#0a2a66"/></motion.g>
      {[0,1,2,3,4,5,6].map(n=><text key={n} x={22+n*46} y="128" textAnchor="middle" fontSize="9">{n*27}</text>)}<text x="160" y="143" textAnchor="middle" fontSize="9">position of the cart’s centre (m)</text>
    </svg>
    <div className="lab-steppers">{step('Starting speed',u,setU,0,9)}{step('Acceleration',a,setA,1,6)}{step('Seconds',t,setT,1,6)}</div>
    <div className="lab-equation"><MathText size="md" speak={`v equals u plus a t equals ${u} plus ${a} times ${t} equals ${speed}`}>{`v = u + at = ${u} + ${a} × ${t} = ${speed}`}</MathText></div>
    <p className="concept-invariant" aria-live="polite">The speed increases by {a} m/s each second. The chart uses the same scale as you change the controls. The final speed is {speed} m/s: the {u} m/s it already had, plus the {a*t} m/s the acceleration added.</p>
    <p className="concept-explanation">Dropping the starting speed and using at alone describes a different cart — one that began at rest. The acceleration would be identical; the journey would not.</p>
  </>;
}

/* --- forces: free-body arrows and what they produce ---------------------- */

function ForcesLab({store}:{store:Store}){
  const move=useSceneMotion();
  const right=store.value('fright',12,0,16),left=store.value('fleft',5,0,16),mass=store.value('kg',4,1,8);
  const setRight=(next:(v:number)=>number)=>store.put('fright',next,12),setLeft=(next:(v:number)=>number)=>store.put('fleft',next,5),setMass=(next:(v:number)=>number)=>store.put('kg',next,4);
  const net=right-left,accel=round(net/mass,2);
  const arrow=(x:number,size:number,direction:1|-1,colour:string)=>size===0?null:
    <motion.path initial={false} animate={{d:`M${x} 46h${direction*size*5}m0 0l${-direction*9} -6m${direction*9} 6l${-direction*9} 6`}} transition={move} stroke={colour} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>;
  return <>
    <h3>Forces do not act one at a time.</h3>
    <p>Both pushes are there at once. What the block actually does is set by what is left over after they combine — and by how much block there is to move.</p>
    <div className="science-buddy-note"><Companion size={82} pose={net===0?'aha':'thinking'}/><p>Try making the pushes equal. Then change the mass while keeping the forces fixed.</p></div>
    <svg className="forces-figure" viewBox="0 0 320 92" role="img" aria-label={`A block with ${right} newtons to the right and ${left} newtons to the left. The net force is ${signed(net)} newtons and the acceleration is ${accel} metres per second squared.`}>
      <path d="M8 74h304" stroke="#0a2a66" strokeWidth="2"/>
      <rect x="136" y="32" width="48" height="42" rx="5" fill="#eef3fa" stroke="#0a2a66" strokeWidth="2"/>
      <text x="160" y="59" textAnchor="middle" fontSize="12" fill="#0a2a66">{mass} kg</text>
      {arrow(184,right,1,'#0a2a66')}
      {arrow(136,left,-1,'#475e7c')}
      <motion.rect initial={false} animate={{x:net<0?160-Math.abs(net)*5:160,width:Math.abs(net)*5}} transition={move} y="14" height="8" rx="4" fill="#14bf96"/>
      <text x="160" y="10" textAnchor="middle" fontSize="9" fill="#475e7c">net {signed(net)} N</text>
    </svg>
    <div className="lab-steppers">{step('Force right',right,setRight,0,16)}{step('Force left',left,setLeft,0,16)}{step('Mass',mass,setMass,1,8)}</div>
    <div className="lab-equation"><MathText size="md" speak={`net force equals ${signed(net)} newtons, a equals ${signed(net)} over ${mass} equals ${accel}`}>{`F = ${signed(net)}\\,\\mathrm{N},\\,a = \\frac{${signed(net)}}{${mass}} = ${accel}`}</MathText></div>
    <p className="concept-invariant" aria-live="polite">{net===0?'The forces cancel exactly. The net force is zero, so there is no acceleration — the velocity can stay constant, even though both forces are present.':`The net force sets the acceleration: ${signed(net)} N on ${mass} kg gives ${accel} m/s², to the ${net>0?'right':'left'}.`}</p>
    <p className="concept-explanation">Make the block heavier without touching either push and the arrows stay exactly as they were, but its velocity changes more slowly under the same net force. The forces decide the net push; the mass decides what that push produces.</p>
  </>;
}

export function ScienceLab({kind,onContinue,state,onExpose,reserve,initial,onSave}:{kind:ScienceKind;onContinue:()=>void;state?:Recovery;onExpose?:(serial:number)=>void;reserve?:number;initial?:LabSave;onSave?:(s:LabSave)=>void}){
  const [s,set]=useState<LabSave>(initial??freshLab);const exposed=useRef(false),save=useRef(onSave);save.current=onSave;
  useEffect(()=>{save.current?.(s);},[s]);
  const store:Store={value:(name,fallback,min,max)=>Math.min(max,Math.max(min,s.values[name]??fallback)),
    put:(name,next,fallback)=>set(v=>({...v,values:{...v.values,[name]:next(v.values[name]??fallback)}}))};
  const shown=(s.values.shown??0)===1;
  useEffect(()=>{if(exposed.current||!state||reserve===undefined)return;exposed.current=true;onExpose?.(reserve);},[state,reserve,onExpose]);
  const predict=kind==='balancing'?{question:'If you double every number in front of a balanced equation, is it still balanced?',options:['No — the amounts change','Yes — both sides double together','Only if nothing has a subscript'],answer:1}
    :kind==='moles'?{question:'Two beakers hold the same mass: one of water, one of glucose. Do they hold the same number of moles?',options:['Yes — the mass is the same','No — a mole of each weighs a different amount','Only if both are pure'],answer:1}
    :kind==='motion'?{question:'A cart already moving at 4 m/s accelerates at 2 m/s² for 3 s. Is its final speed 6 m/s?',options:['Yes — 2 × 3 = 6','No — the 4 m/s it already had still counts','Only if it started from rest'],answer:1}
    :{question:'A block is pushed with 10 N right and 10 N left. Is it accelerating?',options:['Yes — two forces are acting','No — the forces cancel, so there is no net force','Only if the block is light'],answer:1};
  return <section className="concept-lab science-lab">
    <div className="repair-kicker"><span>Dunlo visual guide</span></div>
    {shown?<>
      {kind==='balancing'?<BalanceLab state={state} store={store}/>:kind==='moles'?<MolesLab state={state} store={store}/>:kind==='motion'?<MotionLab store={store}/>:<ForcesLab store={store}/>}
      <button className="button-primary" type="button" onClick={onContinue}>Use the idea on a fresh check ↗</button>
      <p className="fine-print">Nothing in this guide is recorded as evidence. The fresh check that follows uses numbers you have not seen here.</p>
    </>:<Predict {...predict} onDone={()=>store.put('shown',()=>1,0)}/>}
  </section>;
}
