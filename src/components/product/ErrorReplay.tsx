
'use client';
import {MathsLab} from '@/components/study/MathsLab';
import type {ReplayModel} from '@/lib/error-replay';
import type {LabSave} from '@/lib/visual-maths';
export function ErrorReplay({model,onExpose,onContinue,initial,onSave,onEvent}:{model:ReplayModel;onExpose:(pair:[number,number])=>void;onContinue:()=>void;initial?:LabSave;onSave?:(s:LabSave)=>void;onEvent?:(kind:'visual_prediction'|'reflection'|'counterfactual',detail:string)=>void}){
 return <MathsLab kind={model.kind==='factors'?'factors':'roots'} pair={model.pair} attempt={model.attempt} onContinue={onContinue} onExposePair={onExpose} initial={initial} onSave={onSave} onEvent={onEvent}/>;
}
