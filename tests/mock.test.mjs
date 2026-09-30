import test from 'node:test';
import assert from 'node:assert/strict';
import {FAMILIES,generateItem} from '../src/lib/mock/families/index.ts';
import {MISCONCEPTIONS} from '../src/lib/mock/misconceptions.ts';
import {fmt,rng} from '../src/lib/mock/prng.ts';
import {LANGUAGE_ITEMS} from '../src/content/mock/language.ts';
import {READING_ITEMS,PASSAGES} from '../src/content/mock/reading.ts';
import {SCIENCE_ITEMS} from '../src/content/mock/science.ts';
import {CONCEPTS} from '../src/lib/program/concepts.ts';
import {UPCAT_BLUEPRINT,SPRINT,bandFor} from '../src/lib/mock/blueprint.ts';
import {fullForm,sectionForm,sprintForm,dailyForm,topicForm,fixedForm,formItems,itemById,formFromKey,formKey,bankStats} from '../src/lib/mock/forms.ts';
import {scoreAttempt,paceCheck} from '../src/lib/mock/scoring.ts';
import {suggestTriage} from '../src/lib/mock/analysis.ts';
import {TOPICS,ORDER} from '../src/lib/recovery.ts';
import {KHAN_UNITS} from '../src/lib/program/khan-units.ts';

/** A tiny arithmetic evaluator for the families' check expressions. */
function evaluate(src){
 let i=0;const s=src.replace(/\s+/g,'');
 const peek=()=>s[i];
 function num(){const m=/^\d+(\.\d+)?/.exec(s.slice(i));if(!m)throw Error(`Bad number at ${i} in ${src}`);i+=m[0].length;return Number(m[0]);}
 function atom(){if(peek()==='-'){i++;return -atom();}if(peek()==='('){i++;const v=add();if(s[i++]!==')')throw Error('Missing )');return v;}return num();}
 function pow(){const b=atom();if(peek()==='^'){i++;return b**unary();}return b;}
 function unary(){if(peek()==='-'){i++;return -pow();}return pow();}
 function mul(){let v=unary();while(peek()==='*'||peek()==='/'){const op=s[i++],r=unary();v=op==='*'?v*r:v/r;}return v;}
 function add(){let v=mul();while(peek()==='+'||peek()==='-'){const op=s[i++],r=mul();v=op==='+'?v+r:v-r;}return v;}
 const v=add();if(i!==s.length)throw Error(`Trailing input in ${src}`);return v;
}

const SEEDS=Array.from({length:40},(_,i)=>i);

test('the bank has 20 math and 20 science families', ()=>{
 assert.ok(FAMILIES.filter(f=>f.subtest==='math').length>=20);
 assert.ok(FAMILIES.filter(f=>f.subtest==='science').length>=20);
 assert.equal(new Set(FAMILIES.map(f=>f.id)).size,FAMILIES.length);
 for(const f of FAMILIES)assert.match(f.id,/^\w+$/);
});

test('same seed gives the same item, different seeds vary', ()=>{
 for(const f of FAMILIES){
  assert.deepEqual(generateItem(f.id,7),generateItem(f.id,7),f.id);
  const stems=new Set(SEEDS.map(s=>generateItem(f.id,s).stem));
  assert.ok(stems.size>=3,`${f.id} produced only ${stems.size} distinct stems`);
 }
});

test('every generated item has exactly one correct choice and three distinct mapped distractors', ()=>{
 for(const f of FAMILIES)for(const seed of SEEDS){
  const item=generateItem(f.id,seed);
  assert.equal(item.choices.length,4,item.id);
  assert.equal(new Set(item.choices).size,4,`${item.id} repeats a choice: ${item.choices}`);
  assert.ok(item.answerIndex>=0&&item.answerIndex<4);
  assert.equal(item.misconceptions.filter(m=>m===null).length,1,item.id);
  assert.equal(item.misconceptions[item.answerIndex],null,item.id);
  const wrong=item.misconceptions.filter(Boolean);
  assert.equal(new Set(wrong).size,3,`${item.id} distractors share a misconception`);
  for(const m of wrong)assert.ok(MISCONCEPTIONS[m],`${item.id} uses unknown misconception ${m}`);
 }
});

test('solution arithmetic recomputes the key, and every number prints in plain decimal', ()=>{
 for(const f of FAMILIES)for(const seed of SEEDS){
  const item=generateItem(f.id,seed);
  const value=evaluate(item.check.expr);
  assert.ok(Math.abs(value-item.check.value)<1e-6,`${item.id}: ${item.check.expr} = ${value}, key ${item.check.value}`);
  for(const text of [item.stem,...item.choices,...item.solutionSteps]){
   assert.doesNotMatch(text,/\d[eE][+-]?\d/,`${item.id} prints exponent form: ${text}`);
   assert.doesNotMatch(text,/NaN|Infinity|undefined/,`${item.id}: ${text}`);
  }
  assert.ok(item.solutionSteps.length>=2||f.id==='s_punnett',item.id);
 }
});

test('plain decimal formatting', ()=>{
 assert.equal(fmt(0.1+0.2),'0.3');assert.equal(fmt(1e-7),'0');assert.equal(fmt(-0.00001),'0');
 assert.equal(fmt(12.5),'12.5');assert.equal(fmt(3),'3');assert.equal(fmt(1234567.891,2),'1234567.89');
 const r1=rng('x'),r2=rng('x');assert.equal(r1.next(),r2.next());
});

test('misconceptions point at real engine topics, skills and Khan units', ()=>{
 for(const [id,m] of Object.entries(MISCONCEPTIONS)){
  assert.match(id,/^\w+$/);
  assert.ok(m.label&&m.why&&m.fix&&m.chapter,id);
  if(m.khan)assert.ok(KHAN_UNITS[m.khan],`${id} Khan unit ${m.khan}`);
  if(m.recovery){assert.ok(TOPICS[m.recovery.topic],id);assert.ok(ORDER.includes(m.recovery.skill),id);}
 }
});

test('authored items carry a rationale for every choice and authorship', ()=>{
 const ids=new Set();
 for(const item of [...LANGUAGE_ITEMS,...READING_ITEMS,...SCIENCE_ITEMS]){
  assert.ok(!ids.has(item.id),`duplicate ${item.id}`);ids.add(item.id);
  assert.equal(item.choices.length,4,item.id);assert.equal(new Set(item.choices).size,4,item.id);
  assert.equal(item.rationales.length,4,item.id);assert.ok(item.rationales.every(r=>r.length>5),item.id);
  assert.ok(item.author&&item.createdAt&&['draft','reviewed'].includes(item.status),item.id);
  assert.doesNotMatch(item.stem+item.choices.join(''),/[—–]/,`${item.id} uses a dash`);
 }
 for(const item of READING_ITEMS)assert.ok(PASSAGES.some(p=>p.id===item.passageId),item.id);
 assert.ok(LANGUAGE_ITEMS.length>=UPCAT_BLUEPRINT.language.items);
 assert.ok(READING_ITEMS.length>=UPCAT_BLUEPRINT.reading.items);
});

test('forms match their blueprint counts and never repeat an item', ()=>{
 for(const seed of ['a','b','c']){
  const full=fullForm(seed);
  for(const section of full.sections){
   assert.equal(section.itemIds.length,UPCAT_BLUEPRINT[section.subtest].items,`${seed} ${section.subtest}`);
   assert.equal(section.minutes,UPCAT_BLUEPRINT[section.subtest].minutes);
  }
  const ids=formItems(full);assert.equal(new Set(ids).size,ids.length);
  const stems=ids.map(id=>{const it=itemById(id);return it.stem+'|'+it.choices.join('|');});assert.equal(new Set(stems).size,stems.length,'a stem repeats within a form');
  assert.equal(formItems(sprintForm(seed)).length,SPRINT.items);
  assert.equal(formItems(dailyForm(seed)).length,3);
  for(const s of ['math','science','language','reading'])assert.equal(sectionForm(s,seed).sections[0].itemIds.length,UPCAT_BLUEPRINT[s].items);
 }
 assert.deepEqual(fullForm('q'),fullForm('q'));
 assert.ok(formItems(topicForm('geometry','1')).length>=5);
 assert.deepEqual(formFromKey(formKey('section','math|z')),sectionForm('math','z'));
 const stats=bankStats();assert.equal(stats.families,FAMILIES.length);assert.equal(stats.language,LANGUAGE_ITEMS.length);
});

test('official fixed forms exclude draft items', ()=>{
 const form=fixedForm('A');
 for(const id of formItems(form)){const item=itemById(id);if(item.source==='authored')assert.equal(item.status,'reviewed',id);}
 const drafts=[...LANGUAGE_ITEMS,...READING_ITEMS].filter(i=>i.status==='draft').map(i=>i.id);
 for(const id of drafts)assert.ok(!formItems(form).includes(id));
});

test('scoring, bands, pace and triage', ()=>{
 const form=sprintForm('score');const ids=formItems(form);
 const answers={},seconds={};ids.forEach((id,i)=>{const it=itemById(id);answers[id]=i<6?it.answerIndex:(it.answerIndex+1)%4;seconds[id]=40;});
 const attempt={id:'t',formKey:formKey('sprint','score'),startedAt:0,updatedAt:0,timed:true,answers,flags:[],idk:[ids[11]],sure:{[ids[6]]:'sure'},seconds,triage:{},section:0,index:0,pausedMs:0,elapsedMs:{}};
 answers[ids[11]]=null;
 const result=scoreAttempt(form,attempt);
 assert.equal(result.total.correct,6);assert.equal(result.total.total,12);assert.equal(result.misses.length,6);
 assert.equal(result.sureButWrong,1);
 assert.ok(result.misses.filter(m=>!m.idk&&m.chosen!==null).every(m=>m.misconceptionId||m.item.source==='authored'));
 assert.equal(bandFor(50).id,'growing');assert.equal(bandFor(0).id,'building');assert.equal(bandFor(95).id,'strong');
 const pace=paceCheck(result.subtests.find(s=>s.subtest==='math'));assert.ok(pace&&pace.reach>0);
 const triage=suggestTriage(ids,attempt,id=>itemById(id).answerIndex);
 assert.equal(triage[ids[11]],'didnt_know');
 assert.ok(Object.keys(triage).length===6);
});

test('every concept on the study map has a topic check and a complete summary card', ()=>{
 for(const c of CONCEPTS){
  assert.match(c.id,/^\w+$/);
  const items=formItems(topicForm(c.id,'t'));
  assert.ok(items.length>=4,`${c.id} topic check has only ${items.length} items`);
  for(const id of items)assert.equal(itemById(id).concept,c.id,`${c.id} topic check pulled ${id}`);
  assert.ok(c.tldr.must.length>=3&&c.tldr.rule&&c.tldr.example.q&&c.tldr.trap,c.id);
  for(const k of c.khan)assert.ok(KHAN_UNITS[k],`${c.id} Khan ${k}`);
  if(c.engine)assert.ok(TOPICS[c.engine]);
  for(const text of [c.title,c.blurb,...c.tldr.must,c.tldr.rule,c.tldr.trap])assert.doesNotMatch(text,/[—–]/,`${c.id}: ${text}`);
 }
 const families=new Set(FAMILIES.map(f=>f.concept));
 for(const f of families)assert.ok(CONCEPTS.some(c=>c.id===f),`family concept ${f} missing from the map`);
});
