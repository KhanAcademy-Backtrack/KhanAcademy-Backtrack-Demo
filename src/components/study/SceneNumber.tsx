'use client';
import {useEffect,useRef,useState} from 'react';
/** Preserve intermediate keyboard text such as "-" without changing the model. */
export function SceneNumber({label,value,min,max,onChange}:{label:string;value:number;min:number;max:number;onChange:(n:number)=>void}){
 const [draft,setDraft]=useState(String(value)),focused=useRef(false);
 useEffect(()=>{if(!focused.current)setDraft(String(value));},[value]);
 const valid=/^[+-]?\d+$/.test(draft)&&Number(draft)>=min&&Number(draft)<=max;
 function commit(n:number){const next=Math.max(min,Math.min(max,n));setDraft(String(next));onChange(next);}
 return <input type="text" role="spinbutton" inputMode="text" aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={valid?String(value):`Enter a whole number from ${min} to ${max}`} value={draft} maxLength={8} onFocus={()=>{focused.current=true;}} onChange={e=>{setDraft(e.target.value);if(/^[+-]?\d+$/.test(e.target.value)){const n=Number(e.target.value);if(n>=min&&n<=max)onChange(n);}}} onBlur={()=>{focused.current=false;if(/^[+-]?\d+$/.test(draft))commit(Number(draft));else setDraft(String(value));}} onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();commit(value+(e.key==='ArrowUp'?1:-1));}if(e.key==='Escape'){setDraft(String(value));e.currentTarget.blur();}}}/>;
}
