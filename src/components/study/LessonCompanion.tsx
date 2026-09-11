'use client';
import {useState} from 'react';
import {Companion} from './Companion';
import {useStudy} from './StudyProvider';
import type {MathsKind} from '@/lib/visual-maths';
const CUES:Record<MathsKind,string[]>={
 brackets:['Each row is one whole group. What is inside every row?','Follow the green x tiles. There are still three copies.','Now follow the square unit tiles. Each of the three groups brought four.','Try x = 2. An equivalent expression must give the same result for every x.'],
 factors:['The edge labels tell you which two parts multiply.','Follow all four products, including both middle rectangles.','These two middle areas are both x terms, so their coefficients add.','Check sum and product separately. Matching just one leaves a different polynomial.'],
 roots:['A factor constant and a root are different things.','Try a value that makes just one factor zero.','Anything multiplied by zero is zero. The other factor may be nonzero.','The product is zero exactly at an x-intercept. Check it by substitution.'],
 fractions:['The wholes must have the same length before comparing pieces.','Watch the shading stay fixed while smaller pieces appear.','Now each shaded piece has the same size in both bars.','Count the pieces together. A sum beyond one needs another whole.'],
 ratios:['Compare a part with the total: 2 out of 5.','Adding 2 gives 4 out of 9. Did the share stay the same?','Doubling gives 4 out of 10, the same share as 2 out of 5.','To make 20 from 5, multiply every amount by 4.'],
 graphs:['Find the starting point at time zero.','The rate tells how much is added per minute.','Keep the starting value fixed and change only the rate.','Now keep the rate fixed and change the starting value. Compare the lines.']
};
export function LessonCompanion({kind,step,still=false,onPoint,onExample}:{kind:MathsKind;step:number;still?:boolean;onPoint:()=>void;onExample:()=>void}){const {state,update}=useStudy(),[help,setHelp]=useState(false);const quiet=state.settings.quiet;return <div className="lesson-companion" data-help={help}>
 <button className="buddy-call" aria-label="Ask your bookmark companion for a pointer" aria-expanded={help} onClick={()=>{setHelp(!help);onPoint();}}><Companion pose={help?'point':step===0?'curious':step===4?'aha':'thinking'} size={76} still={still} accessory={state.settings.accessory}/></button>
 <div><strong>{quiet?'Here when you need a hand.':step===0?'Let’s test an idea together.':'Take your time. I’m here.'}</strong><div className="buddy-actions"><button onClick={()=>{setHelp(true);onPoint();}}>Point me to the idea</button><button onClick={onExample}>Show an example</button><button aria-pressed={quiet} onClick={()=>update(s=>({...s,settings:{...s.settings,quiet:!quiet},updatedAt:Date.now()}))}>{quiet?'More guidance':'Keep it quiet'}</button></div>{help&&<p role="status">{CUES[kind][Math.max(0,step-1)]}</p>}</div>
 </div>;}
