import type {Topic} from './recovery.ts';

export type StudyCard={id:string;prompt:string;answer:string;source:string;locator:string;reviewed:boolean;dueAt?:number;lastRating?:'again'|'comfortable'};
export type NoteSection={text:string;locator:string};

export function noteSections(text:string):NoteSection[]{
  const lines=text.replace(/\r/g,'').split('\n');let heading='Notes';
  return lines.flatMap((line,i)=>{
    const value=line.trim();
    if(/^#{1,6}\s+/.test(value)){heading=value.replace(/^#+\s+/,'');return [];}
    return value.length>=15?[{text:value.slice(0,1200),locator:`${heading} · line ${i+1}`}]:[];
  }).slice(0,100);
}
export function suggestedTopics(sections:NoteSection[]):Topic[]{
  const text=sections.map(s=>s.text).join(' ').toLowerCase();
  const words:Record<Topic,RegExp>={quadratics:/quadratic|factor(?:ing|isation|ization)|zero.product|x[²2]/,brackets:/parenthes|bracket|distribut|like terms/,fractions:/fraction|denominator|numerator|equivalent/,ratios:/ratio|proportion|unit rate|per (?:item|hour|unit)/,graphs:/graph|coordinate|slope|intercept|function/};
  return (Object.keys(words) as Topic[]).filter(topic=>words[topic].test(text));
}
export function cardsFromNotes(sections:NoteSection[],source:string):StudyCard[]{
  // Extract a stated definition or instruction; never manufacture an answer.
  return sections.slice(0,12).map((section,i)=>{
    const match=section.text.match(/^(.{3,80}?)(?:\s*:\s*|\s+is\s+|\s+means\s+)(.{8,})$/i);
    return {id:`card-${i}-${Date.now()}`,prompt:match?`Explain ${match[1].replace(/^[-*]\s*/, '').toLowerCase()}.`:'What is the main idea in this note?',answer:section.text,source:source.slice(0,160),locator:section.locator.slice(0,160),reviewed:false};
  });
}
export function validStudyCard(c:unknown):c is StudyCard{
  if(!c||typeof c!=='object')return false;const x=c as StudyCard;
  return [['id',150],['prompt',300],['answer',1600],['source',160],['locator',160]].every(([key,max])=>typeof x[key as keyof StudyCard]==='string'&&(x[key as keyof StudyCard] as string).length<=(max as number))&&typeof x.reviewed==='boolean'&&(x.dueAt===undefined||Number.isFinite(x.dueAt)&&x.dueAt>=0)&&(x.lastRating===undefined||['again','comfortable'].includes(x.lastRating));
}
