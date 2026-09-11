'use client';
import {useEffect,useRef,useState} from 'react';
import {MathText} from '@/components/math/Math';
import {GraphBoard} from '@/components/product/GraphBoard';
import {problemFor,type Recovery} from '@/lib/recovery';
import {visualReserveThrough,isScienceKind,type ConceptKind} from '@/lib/concept-labs';
import {AtomCountScene} from './AtomCountScene';
import {CoordinateScene} from './CoordinateScene';
import {GuidedRepair} from '@/components/product/GuidedRepair';
import {khanMaterial} from '@/lib/khan-materials';
import {initialRecovery} from '@/lib/recovery';
import {ScienceLab,type ScienceKind} from './ScienceLab';
import {MathsLab} from './MathsLab';
import type {MathsKind,LabSave} from '@/lib/visual-maths';
export function ConceptLab({kind,onContinue,state,onExpose,onSave,onEvent}:{kind:ConceptKind;onContinue:()=>void;state?:Recovery;onExpose?:(serial:number)=>void;onSave?:(s:LabSave)=>void;onEvent?:(kind:'visual_prediction'|'reflection'|'counterfactual',detail:string)=>void}){
 const exposed=useRef(false);useEffect(()=>{if(!state||isScienceKind(kind)||exposed.current)return;exposed.current=true;onExpose?.(visualReserveThrough(state,kind));},[kind,state,onExpose]);
 if(kind==='atoms')return <AtomCountScene state={state??{...initialRecovery('balancing'),active:'atom_count'}} initial={state?.labs?.atoms} onSave={onSave} onContinue={onContinue}/>;
 if(kind==='basics'){const example=state??{...initialRecovery(),active:'multiply' as const};return <GuidedRepair state={example} source={khanMaterial(example).source} onExpose={()=>onExpose?.(example.serial+1)} onReady={onContinue}/>;}
 if(kind==='coordinates')return <CoordinateScene initial={state?.labs?.coordinates} onSave={onSave} onContinue={onContinue}/>;
 if(isScienceKind(kind))return <ScienceLab kind={kind as ScienceKind} onContinue={onContinue} state={state} onExpose={onExpose} reserve={state?visualReserveThrough(state,kind):undefined} initial={state?.labs?.[kind]} onSave={onSave}/>;
 return <MathsLab kind={kind as MathsKind} onContinue={onContinue} initial={state?.labs?.[kind]} onSave={onSave} onEvent={onEvent}/>;
}
