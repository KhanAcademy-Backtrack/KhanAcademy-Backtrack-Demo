import test from 'node:test';
import assert from 'node:assert/strict';
import {findGaps,CET_SCOPE,collegeScope,programTopics} from '../src/lib/gaps.ts';
import {PROGRAM_BY_ID,PROGRAMS} from '../src/lib/program/bridge.ts';
import {initialStudy,skillKey,DAY} from '../src/lib/study.ts';
import {initialRecovery,ORDER,TOPICS} from '../src/lib/recovery.ts';
import {newAttempt} from '../src/lib/program/store.ts';
import {formFromKey,formItems,itemById} from '../src/lib/mock/forms.ts';
import {misconception} from '../src/lib/mock/misconceptions.ts';

const now=Date.UTC(2026,9,6,8);
const KEY='sprint~20261006';
/** A submitted sprint whose wrong choices name a misconception routed to `skills`. */
function exam(skills,at=now-DAY,submitted=true){
 const a=newAttempt(KEY,false,at-600000);
 for(const id of formItems(formFromKey(KEY))){
  const item=itemById(id),i=item.misconceptions.findIndex(m=>m&&skills.includes(misconception(m)?.recovery?.skill));
  a.answers[id]=i>=0?i:item.answerIndex;
 }
 return submitted?{...a,submittedAt:at}:a;
}
const review=(topic,skill,extra)=>({key:skillKey(topic,skill),topic,skill,dueAt:now,stage:0,streak:0,lastAt:now-DAY,manual:false,paused:false,...extra});

test('no evidence lists nothing and says so',()=>{
 const g=findGaps(initialStudy(),[],now);
 assert.deepEqual([g.ready,g.later,g.fixed],[[],[],[]]);assert.equal(g.hasEvidence,false);
});

test('exam misses list the routed skill and hold its dependants behind the prerequisite',()=>{
 const g=findGaps(initialStudy(),[exam(['multiply','unit_rate'])],now);
 assert.deepEqual(g.ready.map(x=>x.skill),['multiply']);
 assert.equal(g.ready[0].topic,'ratios');assert.match(g.ready[0].reasons[0].text,/^Missed 1 question in Sprint: “/);
 const rate=g.later.find(x=>x.skill==='unit_rate');assert.ok(rate);assert.deepEqual(rate.blockedBy,['multiply']);
 assert.equal(g.hasEvidence,true);
});

test('an unsubmitted exam is not evidence',()=>{
 const g=findGaps(initialStudy(),[exam(['multiply'],now-DAY,false)],now);
 assert.equal(g.ready.length+g.later.length,0);assert.equal(g.hasEvidence,false);
});

test('two fresh unassisted answers clear a gap, free what waited on it, and a later miss reopens it',()=>{
 const cleared={...initialStudy(),review:{[skillKey('ratios','multiply')]:review('ratios','multiply',{streak:2,independentAt:now-3600000})}};
 const g=findGaps(cleared,[exam(['multiply','unit_rate'])],now);
 assert.ok(!g.ready.some(x=>x.skill==='multiply'));assert.deepEqual(g.fixed.map(x=>x.skill),['multiply']);
 assert.ok(g.ready.some(x=>x.skill==='unit_rate'),'unit rate no longer waits');
 const again=findGaps(cleared,[exam(['multiply'],now)],now);
 assert.ok(again.ready.some(x=>x.skill==='multiply'),'a miss after the clearing answers reopens it');
});

test('a single correct answer after a miss does not clear it',()=>{
 const s={...initialStudy(),review:{[skillKey('ratios','multiply')]:review('ratios','multiply',{streak:1,independentAt:now-3600000,lastDifficulty:now-2*DAY})}};
 assert.ok(findGaps(s,[],now).ready.some(x=>x.skill==='multiply'));
});

test('route suspicions count until the step is passed',()=>{
 const route={...initialRecovery('brackets'),suspected:['terms'],passed:[],updatedAt:now-DAY,evidence:[{id:'brackets:goal:0',skill:'goal',answer:['1'],correct:false,assisted:false,confidence:'unsure',at:now-DAY,purpose:'route'}]};
 let g=findGaps({...initialStudy(),routes:{brackets:route}},[],now);
 assert.deepEqual(g.ready.map(x=>x.skill),['terms']);assert.equal(g.ready[0].reasons[0].kind,'route');
 g=findGaps({...initialStudy(),routes:{brackets:{...route,passed:['terms']}}},[],now);
 assert.equal(g.ready.length,0);
});

test('reviewer signals: difficulty, help without independence, Khan difficulty; paused items are left out',()=>{
 const s={...initialStudy(),review:{
  [skillKey('graphs','coordinates')]:review('graphs','coordinates',{lastDifficulty:now-DAY}),
  [skillKey('fractions','equivalent')]:review('fractions','equivalent',{lastAssisted:now-DAY}),
  [skillKey('moles','formula_mass')]:review('moles','formula_mass',{khanFeedback:'difficulty',khanFeedbackAt:now-DAY}),
  [skillKey('forces','net_force')]:review('forces','net_force',{lastDifficulty:now-DAY,paused:true})
 }};
 const g=findGaps(s,[],now),skills=[...g.ready,...g.later].map(x=>x.skill).sort();
 assert.deepEqual(skills,['coordinates','equivalent','formula_mass']);
 assert.equal(g.ready[0].skill,'coordinates','a wrong answer outranks help or a report');
});

test('a destination gap waits behind its topic’s missing steps',()=>{
 const s={...initialStudy(),review:{[skillKey('quadratics','goal')]:review('quadratics','goal',{lastDifficulty:now-DAY}),[skillKey('quadratics','factor')]:review('quadratics','factor',{lastDifficulty:now-DAY})}};
 const g=findGaps(s,[],now);
 assert.deepEqual(g.ready.map(x=>x.skill),['factor']);assert.deepEqual(g.later.map(x=>[x.skill,x.label,x.blockedBy]),[['goal','Quadratic equations',['factor']]]);
});

test('findGaps is read-only and every gap launches a real route',()=>{
 const s={...initialStudy(),review:{[skillKey('graphs','coordinates')]:review('graphs','coordinates',{lastDifficulty:now-DAY})}},attempts=[exam(['multiply','unit_rate','unit_convert'])];
 const before=structuredClone([s,attempts]),g=findGaps(s,attempts,now);
 assert.deepEqual([s,attempts],before);
 for(const x of [...g.ready,...g.later]){assert.ok(TOPICS[x.topic]);assert.ok(ORDER.includes(x.skill));assert.ok(x.reasons.length>0);}
});

test('CET review counts exam practice; college prep counts only its placement check',()=>{
 const sprint=exam(['multiply']),placement={...sprint,id:'p1',formKey:'placement~health|20261006'};
 assert.ok(findGaps(initialStudy(),[sprint],now,CET_SCOPE).ready.some(x=>x.skill==='multiply'));
 assert.equal(findGaps(initialStudy(),[sprint],now,collegeScope(PROGRAM_BY_ID.health)).hasEvidence,false,'a CET sprint is not a placement check');
 assert.equal(findGaps(initialStudy(),[placement],now,CET_SCOPE).hasEvidence,false,'a placement check is not CET practice');
 assert.equal(findGaps(initialStudy(),[{...placement,formKey:'placement~arts|20261006'}],now,collegeScope(PROGRAM_BY_ID.health)).hasEvidence,false,'another field’s placement does not count');
});

test('college prep keeps the skills its field assumes, including prerequisites on the way',()=>{
 const s={...initialStudy(),review:{
  [skillKey('brackets','terms')]:review('brackets','terms',{lastDifficulty:now-DAY}),
  [skillKey('ratios','multiply')]:review('ratios','multiply',{lastDifficulty:now-DAY}),
  [skillKey('balancing','atom_count')]:review('balancing','atom_count',{lastDifficulty:now-DAY})
 }};
 const health=findGaps(s,[],now,collegeScope(PROGRAM_BY_ID.health)),skills=health.ready.map(x=>x.skill).sort();
 assert.deepEqual(skills,['atom_count','multiply'],'like terms is not a health foundation; atom counting sits under moles');
 const cs=findGaps(s,[],now,collegeScope(PROGRAM_BY_ID.cs_it));
 assert.deepEqual(cs.ready.map(x=>x.skill).sort(),['multiply','terms'],'CS reads graphs, whose rules need multiplication; balancing is not a CS foundation');
 assert.equal(findGaps(s,[],now,collegeScope()).ready.length,3,'before a field is chosen every field counts');
 for(const p of PROGRAMS)assert.ok(programTopics(p).length>0,p.id);
});

function assessment(key,at,answer){
 const a={...newAttempt(key,false,at-600000),submittedAt:at};
 for(const id of formItems(formFromKey(key))){
  const item=itemById(id),chosen=answer(item);
  if(chosen==='idk'){a.answers[id]=null;a.idk.push(id);}
  else if(chosen!==undefined)a.answers[id]=chosen;
 }
 return a;
}
const correct=item=>item.answerIndex;
const wrong=item=>(item.answerIndex+1)%item.choices.length;

test('real course placements show mapped repairs and unsupported topics only for the selected field',()=>{
 const cs=assessment('placement~cs_it|cs-review',now-DAY,item=>item.concept==='statistics_probability'?wrong(item):item.misconceptions.findIndex(m=>m&&misconception(m)?.recovery)>=0?item.misconceptions.findIndex(m=>m&&misconception(m)?.recovery):correct(item));
 const health=assessment('placement~health|health-review',now,wrong);
 const state=initialStudy(),before=structuredClone([state,cs,health]);
 const g=findGaps(state,[cs,health],now,collegeScope(PROGRAM_BY_ID.cs_it));
 assert.ok(g.ready.length+g.later.length>0,'actual CS answers create a repair');
 assert.ok(g.topics.some(t=>t.concept==='statistics_probability'));
 assert.equal(g.assessment.id,cs.id);assert.equal(g.assessment.total,8);
 assert.equal(findGaps(state,[cs,health],now,CET_SCOPE).assessment,undefined);
 assert.deepEqual([state,cs,health],before,'reading results changes no learning records');
});

test('latest answered result per topic updates review suggestions without claiming engine mastery',()=>{
 const old=assessment('placement~cs_it|old-review',now-2*DAY,wrong);
 const fresh=assessment('placement~cs_it|new-review',now-DAY,correct);
 const g=findGaps(initialStudy(),[fresh,old],now,collegeScope(PROGRAM_BY_ID.cs_it));
 assert.equal(g.assessment.id,fresh.id,'submission date wins over array order');
 assert.deepEqual(g.topics,[],'the newer answers replace old topic-review suggestions');
 assert.ok(g.ready.length+g.later.length>0,'assessment answers cannot clear a BACKTRACK repair');
 const again=assessment('placement~cs_it|again-review',now,item=>item.concept==='statistics_probability'?wrong(item):correct(item));
 assert.ok(findGaps(initialStudy(),[again,fresh,old],now,collegeScope(PROGRAM_BY_ID.cs_it)).topics.some(t=>t.concept==='statistics_probability'));
});

test('unsupported uncertainty is a topic review; untouched blanks are not evidence and cannot erase it',()=>{
 const key='placement~social_sciences|uncertain';
 const uncertain=assessment(key,now-DAY,item=>item.concept==='statistics_probability'?'idk':undefined);
 const blank=assessment('placement~social_sciences|blank',now,()=>undefined);
 const scope=collegeScope(PROGRAM_BY_ID.social_sciences);
 const g=findGaps(initialStudy(),[blank,uncertain],now,scope);
 assert.ok(g.topics.some(t=>t.concept==='statistics_probability'&&t.unknown>0&&t.wrong===0));
 assert.equal(g.assessment.id,blank.id);assert.equal(g.assessment.blank,g.assessment.total);
 const empty=findGaps(initialStudy(),[blank],now,scope);
 assert.equal(empty.hasEvidence,false);assert.deepEqual([empty.ready,empty.later,empty.topics],[[],[],[]]);
 const draft={...uncertain,submittedAt:undefined};
 assert.equal(findGaps(initialStudy(),[draft],now,scope).assessment,undefined);
});

test('CET language misses remain visible as review topics without inventing a repair',()=>{
 const a=assessment('section~language|language-review',now,wrong);
 const g=findGaps(initialStudy(),[a],now,CET_SCOPE);
 assert.ok(g.topics.length>0);assert.equal(g.ready.length+g.later.length,0);
 assert.equal(g.assessment.correct,0);assert.equal(g.hasEvidence,true);
 assert.equal(findGaps(initialStudy(),[a],now,collegeScope(PROGRAM_BY_ID.cs_it)).topics.length,0);
});

test('every live course placement miss stays visible even when its repair falls outside the field',()=>{
 for(const program of PROGRAMS){
  const key=`placement~${program.id}|coverage`,scope=collegeScope(program);
  for(const id of formItems(formFromKey(key))){
   const item=itemById(id);
   for(const choice of [...item.choices.keys(),'idk']){
    if(choice===item.answerIndex)continue;
    const a=assessment(key,now,x=>x.id===id?choice:undefined),g=findGaps(initialStudy(),[a],now,scope);
    assert.ok(g.ready.length+g.later.length+g.topics.length>0,`${program.id}: ${id}, choice ${choice}`);
   }
  }
 }
});
