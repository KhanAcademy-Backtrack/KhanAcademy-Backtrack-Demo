import {TOPICS,type Topic} from './recovery.ts';
import {KHAN_ENTRIES} from './khan-entry.ts';
export type ScopeEntry={text:string;topic?:Topic;referenceOnly?:boolean};
export function validScope(x:unknown):x is ScopeEntry[]{return Array.isArray(x)&&x.length<=50&&x.every(e=>!!e&&typeof e==='object'&&typeof e.text==='string'&&e.text.length>0&&e.text.length<=300&&(e.topic===undefined||Object.hasOwn(TOPICS,e.topic))&&(e.referenceOnly===undefined||typeof e.referenceOnly==='boolean'));}
export function scopeCoverage(entries:ScopeEntry[],selected:Topic[]){return entries.map(e=>{const topic=e.topic&&selected.includes(e.topic)?e.topic:undefined;return {...e,topic,status:e.referenceOnly?'Reference only':topic?'Supported practice':'Not yet supported',resource:topic&&!e.referenceOnly?KHAN_ENTRIES.find(k=>k.topic===topic):undefined};});}
