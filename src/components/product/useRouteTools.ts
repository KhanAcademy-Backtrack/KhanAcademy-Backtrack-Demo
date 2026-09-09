'use client';
import { useEffect, useRef } from 'react';
import { LABELS, TOPICS, problemFor, type Recovery, type RecoveryAction } from '@/lib/recovery';
type Tool={name:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean};execute:(input:unknown)=>unknown};
export function useRouteTools(state:Recovery,send:(action:RecoveryAction)=>void){
  const live=useRef(state);live.current=state;
  useEffect(()=>{
    const context=(document as Document & {modelContext?:{registerTool:(tool:Tool,options:{signal:AbortSignal})=>unknown}}).modelContext;
    if(!context?.registerTool)return;
    const life=new AbortController();
    const empty=(input:unknown)=>{if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Expected an empty object.');};
    const read=()=>({destination:TOPICS[live.current.topic].label,phase:live.current.phase,currentStep:LABELS[live.current.active],expression:live.current.phase==='check'?problemFor(live.current).expression:null,stepsDemonstrated:live.current.passed.map(x=>LABELS[x]),storage:'this browser only'});
    const schema={type:'object',properties:{},additionalProperties:false};
    try{
      Promise.resolve(context.registerTool({name:'get_backtrack_route',description:'Read the current destination, task and route progress. Does not reveal answer keys or change learning evidence.',inputSchema:schema,annotations:{readOnlyHint:true},execute(input){empty(input);return read();}},{signal:life.signal})).catch(()=>{});
      Promise.resolve(context.registerTool({name:'pause_backtrack_route',description:'Pause the current learning route and save the next activity locally, matching the Pause here control.',inputSchema:schema,annotations:{readOnlyHint:false},async execute(input){empty(input);if(live.current.phase==='setup'||live.current.phase==='pause')return {...read(),changed:false};send({type:'pause',now:Date.now()});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return {...read(),changed:true};}},{signal:life.signal})).catch(()=>{});
    }catch{}
    return()=>life.abort();
  },[send]);
}
