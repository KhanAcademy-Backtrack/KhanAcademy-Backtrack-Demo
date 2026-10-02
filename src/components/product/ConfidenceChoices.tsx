'use client';
import type {Confidence} from '@/lib/recovery';
export function ConfidenceChoices({value,onChange}:{value:Confidence;onChange:(value:Confidence)=>void}){
  return <fieldset className="confidence confidence-visible flex flex-wrap gap-2 [&>button]:min-h-11 [&>button]:rounded-lg [&>button]:border-2 [&>button]:border-line [&>button]:bg-white [&>button]:px-4 [&>button]:text-navy [&>button]:hover:border-line-strong [&>button]:aria-pressed:border-navy [&>button]:aria-pressed:bg-mint"><legend>How does this feel?</legend>{([['know','I know this'],['unsure','I’m unsure'],['forgot','I forgot'],['never','Never learned it']] as const).map(([id,label])=><button key={id} type="button" onClick={()=>onChange(id)} aria-pressed={value===id}>{label}</button>)}</fieldset>;
}
