import {subjectOf,type Recovery} from './recovery.ts';
export type ConceptKind='fractions'|'ratios'|'graphs'|'brackets'|'balancing'|'moles'|'motion'|'forces';
export function visualKind(s:Recovery):ConceptKind|undefined{
 if(s.topic==='fractions'&&['goal','equivalent','same_denominator'].includes(s.active))return 'fractions';
 if(s.topic==='ratios'&&['goal','unit_rate'].includes(s.active))return 'ratios';
 if(s.topic==='graphs'&&['goal','coordinates','substitute'].includes(s.active))return 'graphs';
 if(s.topic==='balancing'&&['goal','atom_count'].includes(s.active))return 'balancing';
 if(s.topic==='moles'&&['goal','formula_mass'].includes(s.active))return 'moles';
 if(s.topic==='motion'&&['goal','unit_convert'].includes(s.active))return 'motion';
 if(s.topic==='forces'&&['goal','net_force'].includes(s.active))return 'forces';
 if(s.active==='expand'||(s.topic==='brackets'&&s.active==='goal'))return 'brackets';
}
/** The serials a lab reveals, reserved so an explanation never leaks the next check. */
export function visualReserveThrough(s:Recovery,kind:ConceptKind){
 if(s.problemVersion===3&&!isScienceKind(kind))return Math.max(s.serial+2,kind==='fractions'?8:kind==='ratios'?7:2);
 if(kind==='graphs'&&s.active==='coordinates')return Math.floor(s.serial/5)*5+4;
 if(kind==='graphs'&&s.serial===0)return 7;
 if(kind==='ratios'){const size=s.active==='unit_rate'?5:4;return Math.floor(s.serial/size)*size+size-1;}
 return s.serial+1;
}
export const isScienceKind=(kind:ConceptKind)=>['balancing','moles','motion','forces'].includes(kind);
export const labSubject=(s:Recovery)=>subjectOf(s.topic);
