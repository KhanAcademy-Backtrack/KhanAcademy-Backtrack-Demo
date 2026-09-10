'use client';
import type {Confidence} from '@/lib/recovery';
export function ConfidenceChoices({value,onChange}:{value:Confidence;onChange:(value:Confidence)=>void}){
  return <fieldset className="confidence confidence-visible"><legend>How does this feel?</legend>{([['know','I know this'],['unsure','I’m unsure'],['forgot','I forgot'],['never','Never learned it']] as const).map(([id,label])=><button key={id} type="button" onClick={()=>onChange(id)} aria-pressed={value===id}>{label}</button>)}</fieldset>;
}
