import {rng} from './prng.ts';
import {FAMILIES,FAMILY_BY_ID,generateItem} from './families/index.ts';
import {LANGUAGE_ITEMS} from '../../content/mock/language.ts';
import {READING_ITEMS,PASSAGES} from '../../content/mock/reading.ts';
import {SCIENCE_ITEMS} from '../../content/mock/science.ts';
import {PROGRAM_BY_ID} from '../program/bridge.ts';
import {UPCAT_BLUEPRINT,SECTION_ORDER,SPRINT,TOPIC_CHECK,BREAK_MINUTES} from './blueprint.ts';
import type {MockItem,Subtest} from './types.ts';

export type FormKind='sprint'|'section'|'full'|'topic'|'exit'|'daily'|'fixed'|'placement';
export type FormSection={subtest:Subtest;minutes:number;itemIds:string[]};
export type Form={id:string;kind:FormKind;title:string;seed:string;sections:FormSection[];breakMinutes:number;official:boolean};

const AUTHORED:MockItem[]=[...LANGUAGE_ITEMS,...READING_ITEMS,...SCIENCE_ITEMS];
/** Share of a science section drawn from the conceptual (biology, Earth) bank. */
const CONCEPTUAL_SHARE=.2;
const AUTHORED_BY_ID:Record<string,MockItem>=Object.fromEntries(AUTHORED.map(i=>[i.id,i]));

/** Resolves any item id: `family:seed` regenerates, anything else is authored. */
export function itemById(id:string):MockItem|undefined{
 if(AUTHORED_BY_ID[id])return AUTHORED_BY_ID[id];
 const cut=id.indexOf(':');if(cut<0)return undefined;
 const family=id.slice(0,cut),seed=id.slice(cut+1);
 if(!FAMILY_BY_ID[family])return undefined;
 try{return generateItem(family,seed);}catch{return undefined;}
}
export const passageById=(id:string)=>PASSAGES.find(p=>p.id===id);

/** Bank sizes, computed from the real banks. Pages show these, never a typed number. */
export function bankStats(){
 const families=FAMILIES.length,mathFamilies=FAMILIES.filter(f=>f.subtest==='math').length,scienceFamilies=FAMILIES.filter(f=>f.subtest==='science').length;
 return {families,mathFamilies,scienceFamilies,scienceItems:SCIENCE_ITEMS.length,language:LANGUAGE_ITEMS.length,reading:READING_ITEMS.length,passages:PASSAGES.length,filipino:AUTHORED.filter(i=>i.lang==='fil').length};
}

/** Generated items for a subtest: every family in turn, each with its own seed, so a
 *  form never repeats a stem. */
function generated(subtest:'math'|'science',count:number,seed:string,filter?:(familyId:string)=>boolean):string[]{
 const r=rng(`form:${subtest}:${seed}`);
 const pool=FAMILIES.filter(f=>f.subtest===subtest&&(!filter||filter(f.id)));
 if(!pool.length)return [];
 const ids:string[]=[],stems=new Set<string>();
 let round=0;
 while(ids.length<count&&round<40){
  for(const f of r.shuffle(pool)){
   if(ids.length>=count)break;
   const id=`${f.id}:${seed}-${round}`,item=itemById(id);
   if(!item||stems.has(item.stem))continue;
   stems.add(item.stem);ids.push(id);
  }
  round++;
 }
 return ids;
}

function authored(subtest:'language'|'reading'|'science',count:number,seed:string,opts:{officialOnly?:boolean;concept?:string}={}):string[]{
 const r=rng(`form:${subtest}:${seed}`);
 const ok=(i:MockItem)=>(!opts.officialOnly||i.status==='reviewed')&&(!opts.concept||i.concept===opts.concept);
 if(subtest==='language')return r.shuffle(LANGUAGE_ITEMS.filter(ok)).slice(0,count).map(i=>i.id);
 if(subtest==='science')return r.shuffle(SCIENCE_ITEMS.filter(ok)).slice(0,count).map(i=>i.id);
 // Reading keeps each passage's questions together.
 const ids:string[]=[];
 for(const p of r.shuffle(PASSAGES)){
  const qs=READING_ITEMS.filter(i=>i.passageId===p.id&&ok(i));
  if(!qs.length)continue;
  if(ids.length+qs.length>count&&ids.length)continue;
  ids.push(...qs.map(q=>q.id));
  if(ids.length>=count)break;
 }
 return ids.slice(0,Math.max(count,0));
}

function sectionItems(subtest:Subtest,count:number,seed:string,officialOnly=false){
 if(subtest==='math')return generated('math',count,seed);
 if(subtest==='science'){
  const concept=authored('science',Math.round(count*CONCEPTUAL_SHARE),seed,{officialOnly});
  return rng(`mix:${seed}`).shuffle([...generated('science',count-concept.length,seed),...concept]);
 }
 return authored(subtest,count,seed,{officialOnly});
}

export function sectionForm(subtest:Subtest,seed:string):Form{
 const b=UPCAT_BLUEPRINT[subtest];
 return {id:`section-${subtest}-${seed}`,kind:'section',title:`${subtest[0].toUpperCase()+subtest.slice(1)} section`,seed,official:false,breakMinutes:0,sections:[{subtest,minutes:b.minutes,itemIds:sectionItems(subtest,b.items,seed)}]};
}

export function fullForm(seed:string):Form{
 return {id:`full-${seed}`,kind:'full',title:'Full simulation',seed,official:false,breakMinutes:BREAK_MINUTES,sections:SECTION_ORDER.map(s=>({subtest:s,minutes:UPCAT_BLUEPRINT[s].minutes,itemIds:sectionItems(s,UPCAT_BLUEPRINT[s].items,seed)}))};
}

/** A quick mixed set. Language items stand in for the verbal side; reading needs a passage. */
export function sprintForm(seed:string,subtests:('math'|'science'|'language')[]=['math','science','language']):Form{
 const share=Math.floor(SPRINT.items/subtests.length);
 const sections=subtests.map((s,i)=>{const n=i===subtests.length-1?SPRINT.items-share*(subtests.length-1):share;return {subtest:s as Subtest,minutes:Math.round(SPRINT.minutes*n/SPRINT.items),itemIds:s==='language'?authored('language',n,seed):generated(s,n,seed)};});
 return {id:`sprint-${seed}`,kind:'sprint',title:'Sprint',seed,official:false,breakMinutes:0,sections};
}

/** The landing page's live three-question sprint and Today's Daily 3. */
export function dailyForm(seed:string):Form{
 return {id:`daily-${seed}`,kind:'daily',title:'Daily 3',seed,official:false,breakMinutes:0,sections:[
  {subtest:'math',minutes:2,itemIds:generated('math',1,seed,id=>FAMILY_BY_ID[id].difficulty===1)},
  {subtest:'science',minutes:2,itemIds:generated('science',1,seed,id=>FAMILY_BY_ID[id].difficulty===1)},
  {subtest:'language',minutes:1,itemIds:authored('language',1,seed)}
 ]};
}

/** A topic check: exam-level questions from one concept only. */
export function topicForm(concept:string,seed:string):Form{
 const fam=FAMILIES.filter(f=>f.concept===concept);
 const sections:FormSection[]=[];
 const bySubtest=new Map<Subtest,string[]>();
 const add=(s:Subtest,ids:string[])=>{if(ids.length)bySubtest.set(s,[...(bySubtest.get(s)??[]),...ids]);};
 if(fam.length)add(fam[0].subtest,generated(fam[0].subtest as 'math'|'science',TOPIC_CHECK.items,seed,id=>FAMILY_BY_ID[id].concept===concept));
 for(const s of ['science','language','reading'] as const)add(s,authored(s,TOPIC_CHECK.items,seed,{concept}));
 const r=rng(`topic:${concept}:${seed}`);
 for(const [subtest,itemIds] of bySubtest)sections.push({subtest,minutes:TOPIC_CHECK.minutes,itemIds:(subtest==='reading'?itemIds:r.shuffle(itemIds)).slice(0,TOPIC_CHECK.items)});
 return {id:`topic-${concept}-${seed}`,kind:'topic',title:'Topic check',seed,official:false,breakMinutes:0,sections};
}

/** Fixed forms A, B and C for before, middle and after measurement. Official forms
 *  use reviewed authored items only; generated items are fixed by their seed. */
export const FIXED_FORMS=['A','B','C'] as const;
export function fixedForm(letter:typeof FIXED_FORMS[number]):Form{
 const seed=`fixed-${letter}`;
 return {id:`fixed-${letter}`,kind:'fixed',title:`Form ${letter}`,seed,official:true,breakMinutes:BREAK_MINUTES,sections:SECTION_ORDER.map(s=>({subtest:s,minutes:UPCAT_BLUEPRINT[s].minutes,itemIds:sectionItems(s,UPCAT_BLUEPRINT[s].items,seed,true)}))};
}

/** A freshman bridge placement check: one question from each family the program's
 *  first year leans on, grouped by subtest. */
export function placementForm(programId:string,seed:string):Form|undefined{
 const p=PROGRAM_BY_ID[programId];if(!p)return undefined;
 const bySub=new Map<Subtest,string[]>();
 for(const f of p.placement.families){const fam=FAMILY_BY_ID[f];if(!fam)continue;bySub.set(fam.subtest,[...(bySub.get(fam.subtest)??[]),`${f}:${seed}-p`]);}
 return {id:`placement-${programId}-${seed}`,kind:'placement',title:`Placement check: ${p.title}`,seed,official:false,breakMinutes:0,sections:[...bySub].map(([subtest,itemIds])=>({subtest,minutes:itemIds.length*2,itemIds}))};
}

export const formItems=(form:Form)=>form.sections.flatMap(s=>s.itemIds);
export const formMinutes=(form:Form)=>form.sections.reduce((t,s)=>t+s.minutes,0)+(form.sections.length>1?form.breakMinutes*(form.sections.length-1):0);

/** Rebuilds a saved form from its kind and seed. Forms are never stored whole. */
export function formFromKey(key:string):Form|undefined{
 if(!/^[a-z]+~[\w-]+(?:\|[\w-]+)?$/.test(key))return undefined;
 const [kind,...rest]=key.split('~');const arg=rest.join('~');
 if(kind==='sprint')return sprintForm(arg);
 if(kind==='daily')return dailyForm(arg);
 if(kind==='full')return fullForm(arg);
 if(kind==='section'){const [s,seed]=arg.split('|');if(['math','science','language','reading'].includes(s))return sectionForm(s as Subtest,seed??'1');}
 if(kind==='topic'){const [c,seed]=arg.split('|');return topicForm(c,seed??'1');}
 if(kind==='exit'){const [c,seed]=arg.split('|');const f=topicForm(c,seed??'1');return {...f,id:`exit-${c}-${seed}`,kind:'exit',title:'Exit check',sections:f.sections.slice(0,1).map(s=>({...s,minutes:5,itemIds:s.itemIds.slice(0,4)}))};}
 if(kind==='placement'){const [p,seed]=arg.split('|');return placementForm(p,seed??'1');}
 if(kind==='fixed'&&(FIXED_FORMS as readonly string[]).includes(arg))return fixedForm(arg as typeof FIXED_FORMS[number]);
 return undefined;
}
export const formKey=(kind:FormKind,arg:string)=>`${kind}~${arg}`;
