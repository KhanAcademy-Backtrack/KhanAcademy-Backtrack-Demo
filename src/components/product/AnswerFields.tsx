'use client';
import type {Problem} from '@/lib/recovery';

/**
 * One answer field. Units are shown beside the box and spoken in its accessible
 * name; they never go inside the box, so the numeric checker stays authoritative
 * and no free-text unit parsing is ever attempted. A choice field submits its
 * option index, which keeps every stored answer numeric.
 */
export function AnswerField({p,index,value,onChange,ariaLabel,stepper=false}:{p:Problem;index:number;value:string;onChange:(v:string)=>void;ariaLabel?:string;stepper?:boolean}){
  const label=p.labels[index],field=p.fields?.[index],unit=field?.unit;
  if(field?.kind==='choice'&&field.options)return <fieldset className="choice-field">
    <legend>{label}</legend>
    {field.options.map((option,i)=><label key={option}><input type="radio" name={`${p.id}-${index}`} value={String(i)} checked={value===String(i)} onChange={()=>onChange(String(i))}/><span>{option}</span></label>)}
  </fieldset>;
  const name=ariaLabel??label,input=<input aria-label={unit?`${name} in ${unit}`:name} value={value} onChange={e=>onChange(e.target.value)} inputMode="text" autoComplete="off" maxLength={18}/>;
  return <label className={`number-field ${stepper?'stepper':''}`}>
    <span>{label}</span>
    {stepper||unit
      ?<div>{stepper&&<button type="button" aria-label={`Decrease ${label.toLowerCase()}`} onClick={()=>onChange(String(Number(value||0)-1))}>−</button>}{input}{stepper&&<button type="button" aria-label={`Increase ${label.toLowerCase()}`} onClick={()=>onChange(String(Number(value||0)+1))}>+</button>}{unit&&<small className="field-unit" aria-hidden="true">{unit}</small>}</div>
      :input}
  </label>;
}

/** Every field of one problem, in the order the problem declares. */
export function AnswerFields({p,values,onChange,ariaLabel,stepper=false}:{p:Problem;values:string[];onChange:(index:number,value:string)=>void;ariaLabel?:(label:string)=>string;stepper?:boolean}){
  return <>{p.labels.map((label,i)=><AnswerField key={label} p={p} index={i} value={values[i]??''} onChange={v=>onChange(i,v)} ariaLabel={ariaLabel?.(label)} stepper={stepper}/>)}</>;
}
