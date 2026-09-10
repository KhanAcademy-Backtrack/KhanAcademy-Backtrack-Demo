import {initialRecovery,TOPICS,skillDependencies,ORDER,type Topic,type Skill} from './recovery.ts';
import {khanMaterial} from './khan-materials.ts';
export type KhanEntry={id:string;title:string;topic:Topic;skill:Skill;expression:string;learning:{url:string;title:string};practice:{url:string;title:string}};
const specs:{id:string;title:string;topic:Topic;skill:Skill;expression:string}[]=[
  {id:'factor-quadratics',title:'Factoring quadratics',topic:'quadratics',skill:'factor',expression:'x² + 7x + 12'},
  {id:'solve-quadratics',title:'Solving quadratics by factoring',topic:'quadratics',skill:'goal',expression:TOPICS.quadratics.example},
  {id:'bracket-equations',title:'Equations with parentheses',topic:'brackets',skill:'goal',expression:TOPICS.brackets.example},
  {id:'unlike-fractions',title:'Adding fractions with unlike denominators',topic:'fractions',skill:'goal',expression:TOPICS.fractions.example},
  {id:'unit-rates',title:'Unit rates and proportions',topic:'ratios',skill:'goal',expression:TOPICS.ratios.example},
  {id:'graph-values',title:'Evaluating functions from a graph',topic:'graphs',skill:'goal',expression:TOPICS.graphs.example},
];
const focusedLearning:Partial<Record<Topic,{title:string;url:string}>>={
 fractions:{title:'Add and subtract fractions: common questions',url:'https://www.khanacademy.org/math/cc-fifth-grade-math/imp-fractions-3/imp-adding-and-subtracting-fractions-with-unlike-denominators-word-problems/a/add-and-subtract-fractions-faq-2'},
 ratios:{title:'Intro to rates',url:'https://www.khanacademy.org/math/pre-algebra/pre-algebra-ratios-rates/pre-algebra-rates/v/introduction-to-rates'},
 graphs:{title:'Worked example: Evaluating functions from graph',url:'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:evaluating-functions/v/understanding-function-notation-example-2'}
};
export const KHAN_ENTRIES:KhanEntry[]=specs.map(s=>{const material=khanMaterial({...initialRecovery(s.topic),active:s.skill}),practice=material.resources.find(r=>r.kind==='exercise')!;return {...s,learning:focusedLearning[s.topic]??{title:material.title,url:material.source},practice:{title:practice.title,url:practice.url}};});
export const khanEntry=(id?:string)=>KHAN_ENTRIES.find(e=>e.id===id);
function canonical(raw:string){try{const u=new URL(raw.trim());if(u.protocol!=='https:'||!['www.khanacademy.org','khanacademy.org'].includes(u.hostname)||u.username||u.password||u.port)return;return decodeURIComponent(u.pathname).replace(/\/+$/,'');}catch{return;}}
export function resolveKhanUrl(raw:string){const path=canonical(raw);if(!path)return;return KHAN_ENTRIES.find(e=>[e.learning.url,e.practice.url,...khanMaterial({...initialRecovery(e.topic),active:e.skill}).resources.map(r=>r.url)].some(u=>canonical(u)===path));}
export function entrySkills(entry:KhanEntry){const ids=new Set<Skill>();const walk=(skill:Skill)=>{if(ids.has(skill))return;ids.add(skill);for(const parent of skillDependencies(skill,entry.topic))walk(parent);};walk(entry.skill);return ORDER.filter(s=>ids.has(s));}
