import type {Recovery} from './recovery.ts';
export type ConceptKind='fractions'|'ratios'|'graphs'|'brackets';
export function visualKind(s:Recovery):ConceptKind|undefined{
 if(s.topic==='fractions'&&['goal','equivalent','same_denominator'].includes(s.active))return 'fractions';
 if(s.topic==='ratios'&&['goal','unit_rate'].includes(s.active))return 'ratios';
 if(s.topic==='graphs'&&['goal','coordinates','substitute'].includes(s.active))return 'graphs';
 if(s.active==='expand'||(s.topic==='brackets'&&s.active==='goal'))return 'brackets';
}
export function visualReserveThrough(s:Recovery,kind:ConceptKind){
 if(kind==='graphs'&&s.active==='coordinates')return Math.floor(s.serial/5)*5+4;
 if(kind==='graphs'&&s.serial===0)return 7;
 if(kind==='ratios'){const size=s.active==='unit_rate'?5:4;return Math.floor(s.serial/size)*size+size-1;}
 return s.serial+1;
}
