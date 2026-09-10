'use client';
import {useState} from 'react';
import {LABELS,TOPICS,type Recovery} from '@/lib/recovery';
export function LocalHelpCard({state:s,onQuestion}:{state:Recovery;onQuestion?:(text:string)=>void}){
 const [question,setQuestion]=useState(s.helpQuestion??'');
 const original=s.original,last=s.evidence.at(-1);
 const text=`Dunlo — a question for a helper\nGoal: ${s.goalTitle??TOPICS[s.topic].goal}\nOriginal problem: ${original?.expression??s.goalExpression??TOPICS[s.topic].example}\nAttempt: ${original?.answer.join(', ')||last?.answer.join(', ')||'No answer yet'}\nCurrent step: ${LABELS[s.active]}\nSupport tried: ${s.learned.map(x=>LABELS[x]).join(', ')||'None recorded'}\nRemaining question: ${question||'Please help me understand this step.'}\n\nLearner-owned local record. Confidence, reflections and resource opens are not verified learning results.`;
 function download(){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='dunlo-help-card.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <details className="help-card"><summary>Still stuck? Make a help card</summary><p>Keep a compact question to show a teacher or classmate yourself.</p><label>What would you like help with?<textarea value={question} onChange={e=>{setQuestion(e.target.value);onQuestion?.(e.target.value);}} maxLength={1000}/></label><pre style={{whiteSpace:'pre-wrap',fontFamily:'inherit',fontSize:13}}>{text}</pre><button className="button-secondary" onClick={download}>Save my help card</button></details>;
}
