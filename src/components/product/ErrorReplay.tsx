'use client';
import {useEffect,useRef,useState} from 'react';
import {MathText} from '@/components/math/Math';
import {factorText,quadraticText} from '@/lib/recovery';
import {factorComparison,testSolution,type ReplayModel} from '@/lib/error-replay';

export function ErrorReplay({model,onExpose,onContinue}:{model:ReplayModel;onExpose:(pair:[number,number])=>void;onContinue:()=>void}){
  const [pair,setPair]=useState<[number,number]>(model.attempt),[x,setX]=useState(model.attempt[0]);
  const [revealed,setRevealed]=useState(false),[contrast,setContrast]=useState(false),[prediction,setPrediction]=useState<string|null>(null);
  const expose=useRef(onExpose);expose.current=onExpose;
  const target: [number,number]=contrast?[-2,5]:model.pair;
  const compare=factorComparison(target,pair),solution=testSolution(target,x);
  const solved=model.kind==='factors'?compare.sumMatches&&compare.productMatches:solution.isSolution;
  useEffect(()=>{expose.current(model.kind==='factors'?pair:target);},[pair[0],pair[1],target[0],target[1],model.kind]);
  function adjust(i:number,n:number){setPair(p=>p.map((v,j)=>i===j?n:v) as [number,number]);setPrediction(null);}
  const bound=Math.max(12,...model.pair.map(Math.abs),...model.attempt.map(Math.abs))+2;
  return <section className="error-replay" aria-label="Explore the attempted step">
    <div className="repair-kicker"><span>{contrast?'Try a different sign pattern':model.fromAttempt?'Replay your earlier attempt':'Explore one example'}</span><span>Explore → explain → try again</span></div>
    <h3>{model.kind==='factors'?'One match is not enough.':'Which value makes a factor zero?'}</h3>
    <p className="replay-instruction">{model.kind==='factors'?`If you put ${model.attempt.join(' and ')} inside the brackets, what changes?`:'Test a value of x. Watch each factor and the product.'}</p>
    <div className="replay-target"><span>{model.kind==='factors'?'Match this expression':'Make this product zero'}</span><MathText size="lg">{model.kind==='factors'?quadraticText(...target):`${factorText(target[0])}${factorText(target[1])} = 0`}</MathText></div>
    {model.kind==='factors'?<>
      <div className="replay-pair-controls">{pair.map((n,i)=><div key={i}><span>{i===0?'First number':'Second number'}</span><div><button type="button" aria-label={`Decrease replay ${i===0?'first':'second'} number`} disabled={n<=-bound} onClick={()=>adjust(i,n-1)}>−</button><output aria-live="polite">{n}</output><button type="button" aria-label={`Increase replay ${i===0?'first':'second'} number`} disabled={n>=bound} onClick={()=>adjust(i,n+1)}>+</button></div></div>)}</div>
      <div className="replay-expanded"><MathText size="md">{`${factorText(pair[0])}${factorText(pair[1])} = ${quadraticText(...pair)}`}</MathText></div>
      <div className="replay-comparisons" aria-live="polite"><div data-match={compare.productMatches}><span>Constant</span><strong>{pair[0]} × {pair[1]} = {compare.product}</strong><small>{compare.productMatches?'✓ Matches':`Needs to be ${compare.targetProduct}`}</small></div><div data-match={compare.sumMatches}><span>Middle coefficient</span><strong>{pair[0]} + ({pair[1]}) = {compare.sum}</strong><small>{compare.sumMatches?'✓ Matches':`Needs to be ${compare.targetSum}`}</small></div></div>
      <p className="replay-principle">The product makes the constant. The sum makes the coefficient of x. Both have to match.</p>
    </>:<>
      <div className="replay-value"><label htmlFor="replay-x">Test x = <strong>{x}</strong></label><input id="replay-x" type="range" min={-bound} max={bound} value={x} onChange={e=>{setX(Number(e.target.value));setPrediction(null);}}/><div className="replay-presets">{Array.from(new Set([model.attempt[0],-target[0],-target[1]])).map(n=><button key={n} type="button" aria-pressed={x===n} onClick={()=>{setX(n);setPrediction(null);}}>Try x = {n}</button>)}</div></div>
      <div className="replay-factor-values" aria-live="polite">{target.map((n,i)=><div key={i} data-zero={solution.factors[i]===0}><MathText size="sm">{factorText(n)}</MathText><strong>{solution.factors[i]}</strong><small>{solution.factors[i]===0?'This factor is zero':'Not zero'}</small></div>)}<div className="replay-product" data-zero={solution.isSolution}><span>Product</span><strong>{solution.product}</strong><small>{solution.isSolution?'✓ x is a solution':'Not a solution'}</small></div></div>
      <p className="replay-principle">{solution.isSolution?'One zero factor is enough to make the whole product zero.':'The numbers inside the brackets are not automatically the solutions.'}</p>
    </>}
    <div className="replay-explain"><p>{model.kind==='factors'?'What must your factor pair match?':'What makes the product zero?'}</p><div className="small-options">{(model.kind==='factors'?[['one','Just the product'],['both','Both sum and product']]:[['both','Both factors must be zero'],['one','At least one factor is zero']]).map(([id,label])=><button key={id} type="button" aria-pressed={prediction===id} onClick={()=>setPrediction(id)}>{label}</button>)}</div>{prediction&&<p role="status">{prediction===(model.kind==='factors'?'both':'one')?'Exactly. Now use that idea on a different problem.':model.kind==='factors'?'Look at the middle coefficient too. A matching product can still give the wrong expression.':'Try making just one factor zero and inspect the product.'}</p>}</div>
    <div className="replay-actions">{model.kind==='factors'&&!solved&&!revealed&&<button className="button-text" type="button" onClick={()=>{setPair(target);setRevealed(true);}}>Show one matching pair</button>}{model.kind==='solutions'&&!contrast&&<button className="button-text" type="button" onClick={()=>{setContrast(true);setX(2);setPrediction(null);}}>Try a mixed-sign example</button>}<button className="button-primary" type="button" onClick={onContinue}>Try it with fresh numbers ↗</button></div>
    <p className="replay-note">This is a worked exploration. Your next check uses a different problem.</p>
  </section>;
}
