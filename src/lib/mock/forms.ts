import {rng} from './prng.ts';
import {FAMILIES,FAMILY_BY_ID,generateItem} from './families/index.ts';
import {LANGUAGE_ITEMS} from '../../content/mock/language.ts';
import {READING_ITEMS,PASSAGES} from '../../content/mock/reading.ts';
import {SCIENCE_ITEMS} from '../../content/mock/science.ts';
import {PROGRAM_BY_ID,RETIRED_PROGRAMS} from '../program/bridge.ts';
import {UPCAT_BLUEPRINT,SECTION_ORDER,SPRINT,TOPIC_CHECK,BREAK_MINUTES} from './blueprint.ts';
import type {MockItem,Subtest} from './types.ts';
import {EXAMS,EXAM_IDS,type ExamId} from '../program/admissions.ts';
import {reviewerSections} from './reviewer-scope.ts';

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

function authored(subtest:'language'|'reading'|'science',count:number,seed:string,opts:{officialOnly?:boolean;concept?:string;lang?:'en'|'fil'}={}):string[]{
 const r=rng(`form:${subtest}:${seed}`);
 const ok=(i:MockItem)=>(!opts.officialOnly||i.status==='reviewed')&&(!opts.concept||i.concept===opts.concept)&&(!opts.lang||i.lang===opts.lang);
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

// Versioned separately: older daily~ keys must always rebuild their original questions.
const DAILY_MATH=['m_pct_change','m_frac_add','m_ratio_share','m_linear_solve','m_exponents','m_expand_square','m_quad_root','m_slope','m_triangle_area','m_pythagoras','m_circle_area','m_mean_missing','m_prob_draw','m_simple_interest','m_avg_speed','m_func_eval','m_system','m_polygon_angles','m_arith_seq','m_work_rate','m_trig_ratio'];
const DAILY_SCIENCE=['s_density','s_speed','s_acceleration','s_newton2','s_weight','s_ohm','s_moles','s_molarity','s_atom_count','s_half_life','s_punnett','s_ph','s_kinetic','s_potential','s_work','s_power','s_wave','s_boyle','s_heat','s_percent_comp'];
// Frozen authored IDs: adding future bank material cannot rewrite an archived daily2 key.
const numbered=(prefix:string,count:number)=>Array.from({length:count},(_,i)=>`${prefix}_${String(i+1).padStart(2,'0')}`);
const DAILY_LANGUAGE=rng('daily2-language-v1').shuffle([...numbered('lang_sva',8),...numbered('lang_tense',7),...numbered('lang_vocab',9),...numbered('lang_struct',5),...numbered('lang_usage',6),...numbered('lang_fil',8),...numbered('lang_filv',6)]);
const DAILY_READING=rng('daily2-reading-v1').shuffle(['mangroves','sleep','jeepney','barangay','solar','bayanihan','wika'].flatMap(p=>Array.from({length:5},(_,i)=>`read_${p}_${i+1}`)));
const DAILY_CONCEPTS=rng('daily2-concepts-v1').shuffle([...numbered('sci_cell',8),...numbered('sci_gen',2),...numbered('sci_earth',8)]);
const DAILY_POOLS=new Map<string,string[]>();
const modulo=(n:number,size:number)=>((n%size)+size)%size;
function dailyPool(family:string){
 const cached=DAILY_POOLS.get(family);if(cached)return cached;
 const ids:string[]=[],seen=new Set<string>();
 for(let i=0;i<80&&ids.length<4;i++){const id=`${family}:d2bank-${i}`,item=itemById(id);if(item&&!seen.has(item.stem)){seen.add(item.stem);ids.push(id);}}
 if(ids.length!==4)throw Error(`Daily rotation needs four distinct questions for ${family}`);
 DAILY_POOLS.set(family,ids);return ids;
}
/** Three daily questions, varied by family and bank. No item repeats in any 60-day window. */
export function dailyRotationForm(seed:string):Form|undefined{
 if(!/^\d{8}$/.test(seed))return undefined;
 const year=Number(seed.slice(0,4)),month=Number(seed.slice(4,6)),day=Number(seed.slice(6)),utc=Date.UTC(year,month-1,day),date=new Date(utc);
 if(year<2026||year>2200||date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return undefined;
 const n=Math.floor((utc-Date.UTC(2026,0,1))/86400000),mf=DAILY_MATH[modulo(n,DAILY_MATH.length)],sf=DAILY_SCIENCE[modulo(n,DAILY_SCIENCE.length)];
 const math=dailyPool(mf)[modulo(Math.floor(n/DAILY_MATH.length),4)];
 const science=modulo(n,6)===5?DAILY_CONCEPTS[modulo(Math.floor(n/6),DAILY_CONCEPTS.length)]:dailyPool(sf)[modulo(Math.floor(n/DAILY_SCIENCE.length),4)];
 const verbal=modulo(n,2)===0?DAILY_LANGUAGE[modulo(Math.floor(n/2),DAILY_LANGUAGE.length)]:DAILY_READING[modulo(Math.floor(n/2),DAILY_READING.length)];
 return {id:`daily2-${seed}`,kind:'daily',title:'Daily 3',seed,official:false,breakMinutes:0,sections:[{subtest:'math',minutes:2,itemIds:[math]},{subtest:'science',minutes:2,itemIds:[science]},{subtest:modulo(n,2)===0?'language':'reading',minutes:2,itemIds:[verbal]}]};
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
 const live=Object.hasOwn(PROGRAM_BY_ID,programId)?PROGRAM_BY_ID[programId]:undefined,retired=Object.hasOwn(RETIRED_PROGRAMS,programId)?RETIRED_PROGRAMS[programId]:undefined;
 const p=live?{title:live.title,families:live.placement.families}:retired;if(!p)return undefined;
 const bySub=new Map<Subtest,string[]>();
 for(const f of p.families){const fam=FAMILY_BY_ID[f];if(!fam)continue;bySub.set(fam.subtest,[...(bySub.get(fam.subtest)??[]),`${f}:${seed}-p`]);}
 return {id:`placement-${programId}-${seed}`,kind:'placement',title:`Placement check: ${p.title}`,seed,official:false,breakMinutes:0,sections:[...bySub].map(([subtest,itemIds])=>({subtest,minutes:itemIds.length*2,itemIds}))};
}

export const formItems=(form:Form)=>form.sections.flatMap(s=>s.itemIds);
export const formMinutes=(form:Form)=>form.sections.reduce((t,s)=>t+s.minutes,0)+(form.sections.length>1?form.breakMinutes*(form.sections.length-1):0);

/** New keys pin the selected reviewer to the attempt. Legacy forms above stay unchanged.
 * Combined verbal sections retain their language/reading blocks for honest scoring. */
export function reviewerSectionForm(exam:ExamId,sectionId:string,seed:string):Form|undefined{
 const section=reviewerSections(exam).find(s=>s.id===sectionId);
 if(!section?.reviewer.length)return undefined;
 const sections=section.reviewer.flatMap(subtest=>{
  const b=UPCAT_BLUEPRINT[subtest];
  const itemIds=(subtest==='language'||subtest==='reading')
   ?authored(subtest,b.items,seed,{lang:section.lang})
   :sectionItems(subtest,b.items,seed);
  return itemIds.length?[{subtest,minutes:Math.ceil(b.minutes*itemIds.length/b.items),itemIds}]:[];
 });
 if(!sections.length)return undefined;
 return {id:`section2-${exam}-${sectionId}-${seed}`,kind:'section',title:`${EXAMS[exam].name}: ${section.name} section`,seed,official:false,breakMinutes:0,sections};
}

export function reviewerTopicForm(exam:ExamId,concept:string,seed:string):Form|undefined{
 const section=reviewerSections(exam).find(s=>s.concepts.some(c=>c.id===concept));
 const topic=section?.concepts.find(c=>c.id===concept);
 if(!section||!topic)return undefined;
 const form=topicForm(concept,seed);
 const sections=form.sections.flatMap(s=>{
  const itemIds=section.lang?s.itemIds.filter(id=>itemById(id)?.lang===section.lang):s.itemIds;
  return itemIds.length?[{...s,itemIds}]:[];
 });
 if(!sections.length)return undefined;
 return {...form,id:`topic2-${exam}-${concept}-${seed}`,title:`${EXAMS[exam].name}: ${topic.title}`,sections};
}

/** Rebuilds a saved form from its kind and seed. Forms are never stored whole. */
export function formFromKey(key:string):Form|undefined{
 if(!/^[a-z][a-z0-9]*~[\w-]+(?:\|[\w-]+)?$/.test(key))return undefined;
 const [kind,...rest]=key.split('~');const arg=rest.join('~');
 if(kind==='section2'||kind==='topic2'){
  const [scope,seed]=arg.split('|'),cut=scope.indexOf('-'),exam=scope.slice(0,cut) as ExamId,target=scope.slice(cut+1);
  if(!seed||!EXAM_IDS.includes(exam))return undefined;
  return kind==='section2'?reviewerSectionForm(exam,target,seed):reviewerTopicForm(exam,target,seed);
 }
 if(kind==='sprint')return sprintForm(arg);
 if(kind==='daily')return dailyForm(arg);
 if(kind==='daily2')return dailyRotationForm(arg);
 if(kind==='full')return fullForm(arg);
 if(kind==='section'){const [s,seed]=arg.split('|');if(['math','science','language','reading'].includes(s))return sectionForm(s as Subtest,seed??'1');}
 if(kind==='topic'){const [c,seed]=arg.split('|');return topicForm(c,seed??'1');}
 if(kind==='exit'){const [c,seed]=arg.split('|');const f=topicForm(c,seed??'1');return {...f,id:`exit-${c}-${seed}`,kind:'exit',title:'Exit check',sections:f.sections.slice(0,1).map(s=>({...s,minutes:5,itemIds:s.itemIds.slice(0,4)}))};}
 if(kind==='placement'){const [p,seed]=arg.split('|');return placementForm(p,seed??'1');}
 if(kind==='fixed'&&(FIXED_FORMS as readonly string[]).includes(arg))return fixedForm(arg as typeof FIXED_FORMS[number]);
 return undefined;
}
export const formKey=(kind:FormKind,arg:string)=>`${kind}~${arg}`;
