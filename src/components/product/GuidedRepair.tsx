'use client';
import {useState} from 'react';
import {problemFor,isCorrect,TOPICS,type Recovery} from '@/lib/recovery';
import {MathText} from '@/components/math/Math';
import {GraphBoard} from './GraphBoard';
const FOCUS:Record<string,string>={factor:'Match the sum and the product.',distribute:'Multiply all four pairs, including the middle terms.',expand:'The outside number multiplies every term inside.',terms:'Keep the variable. Add its coefficients.',zero:'Find the x-value that makes each factor zero.',linear:'Keep both sides equal as you undo multiplication.',equivalent:'Scale the top and bottom by the same number.',same_denominator:'Add equal-sized parts without changing their size.',unit_rate:'Find one before finding many.',coordinates:'Read across for x, then up for y.',substitute:'Replace x, multiply first, then add.',multiply:'Use equal groups to check the product.',fractions:'Make the denominators match before adding.',ratios:'Find the unit rate, then scale to the amount you need.',graphs:'Match the horizontal input to the height of the line.'};
export function GuidedRepair({state:s,source,onReady,onExpose}:{state:Recovery;source:string;onReady:()=>void;onExpose:()=>void}){
 const [step,setStep]=useState(0);const p=problemFor({...s,serial:s.serial+(step===2?1:0)}),[answers,setAnswers]=useState(p.labels.map(()=>'')),[checked,setChecked]=useState(false);
 const correct=checked&&isCorrect(p,answers);
 const focus=FOCUS[s.active==='goal'?s.topic:s.active]??'Connect the earlier step to your current goal.';
 return <section className="guided-repair"><div className="repair-kicker"><span>Repair this step</span><span>{step+1} / 3</span></div><h3>{focus}</h3><p className="repair-connection">For your goal: {TOPICS[s.topic].goal.toLowerCase()}.</p>{step===2&&<p className="repair-prompt">{p.prompt}</p>}
   {p.graph?<GraphBoard graph={p.graph} guide={step===1||correct}/>:<div className="repair-equation"><MathText size="lg">{p.expression}</MathText></div>}
   {step===0&&<><p>{p.hint}</p><button className="button-secondary" onClick={()=>setStep(1)}>Work through one example</button></>}
   {step===1&&<><p className="repair-explanation">{p.explanation}</p><p>Now use that step with different numbers.</p><button className="button-secondary" onClick={()=>{onExpose();setStep(2);}}>Let me try</button></>}
   {step===2&&<form onSubmit={e=>{e.preventDefault();setChecked(true);}}><div className="answer-inputs">{p.labels.map((label,i)=><label className="number-field" key={label}><span>{label}</span><input aria-label={`Guided ${label.toLowerCase()}`} value={answers[i]} onChange={e=>{setAnswers(xs=>xs.map((x,j)=>i===j?e.target.value:x));setChecked(false);}} autoComplete="off" maxLength={18} inputMode="text"/></label>)}</div><button className="button-secondary" type="submit" disabled={answers.some(a=>!a.trim())}>Check this step</button>{checked&&<p role="status" className={correct?'accent':'warm'}>{correct?'That works. Ready for fresh numbers?':p.hint}</p>}{correct&&<button className="button-primary" type="button" onClick={onReady}>Try a fresh check ↗</button>}</form>}
   <a href={source} className="repair-source" target="_blank" rel="noopener noreferrer">Khan Academy concept ↗</a>
 </section>;
}
