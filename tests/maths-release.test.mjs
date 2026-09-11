import {visualKind} from '../src/lib/concept-labs.ts';
import {replayModel} from '../src/lib/error-replay.ts';
import {skillDependencies} from '../src/lib/recovery.ts';
import {parse,speakMath} from '../src/lib/notation.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialRecovery,problemFor,recoveryReducer as reduce,isCorrect,validRecovery,TOPICS,ORDER,nextFreshSerial,pairKey} from '../src/lib/recovery.ts';
import {initialStudy,ingestRecovery,validStudy,prepareRound,planRehearsal,PACKS,parseSharedPack,beginSession,completeStudyTask} from '../src/lib/study.ts';
import {distribution,partition,mixture,lineValue,freshLab,validLab} from '../src/lib/visual-maths.ts';
import {scopeCoverage,validScope} from '../src/lib/scope-coverage.ts';
const act=(s,a)=>reduce(s,{now:1000,...a});
const start=topic=>act(initialRecovery(topic),{type:'start',budget:60,mode:'self'});
test('a saved lab keeps its trace phase and rejects an impossible one',()=>{
 const traced={...freshLab(),values:{x:4,y:5,phase:2}};
 assert.ok(validLab(traced));
 assert.ok(validLab({...freshLab(),values:{phase:0}}));
 assert.equal(validLab({...freshLab(),values:{phase:3}}),false);
 assert.equal(validLab({...freshLab(),values:{phase:1.5}}),false);
 let s=act(start('graphs'),{type:'learn',skill:'coordinates'});
 s=act(s,{type:'lab-save',key:'coordinates',value:traced});
 const reopened=JSON.parse(JSON.stringify(s));
 assert.ok(validRecovery(reopened));
 assert.equal(reopened.labs.coordinates.values.phase,2);
 assert.deepEqual(reopened.evidence,[]);assert.deepEqual(reopened.passed,[]);
});
test('v3 mathematical models preserve amounts and signs',()=>{
 assert.deepEqual(distribution(3,4,2),{coefficient:3,constant:12,original:18,incomplete:10});
 assert.deepEqual([distribution(-2,-3,0).coefficient,distribution(-2,-3,0).constant],[-2,6]);
 for(const d of [12,24]){assert.equal(partition(2,3,d).numerator+partition(1,4,d).numerator,11*d/12);assert.equal(partition(2,3,d).amount,2/3);}
 assert.throws(()=>partition(1,0,12));assert.throws(()=>partition(1,3,10));
 assert.equal(mixture(2,3).share,mixture(8,12).share);assert.notEqual(mixture(2,3).share,mixture(4,5).share);assert.throws(()=>mixture(0,0));
 assert.equal(lineValue(6,2,4),14);assert.equal(lineValue(3,-2,4),-5);
});
test('v3 families stay unique, accept their keys and verify quadratic roots independently',()=>{
 for(const topic of Object.keys(TOPICS))for(const active of ORDER){const seen=new Set();for(let serial=0;serial<120;serial++){
  const p=problemFor({...initialRecovery(topic),active,serial});assert.equal(isCorrect(p,p.expected.map(String)),true,`${p.id} ${p.expression}`);
  assert.ok(!seen.has(p.expression),`Repeated ${p.id}: ${p.expression}`);seen.add(p.expression);
  if(p.factorPair&&['goal','zero'].includes(active)&&topic==='quadratics'){const [a,b]=p.factorPair;for(const x of p.expected)assert.ok((x+a)*(x+b)===0);assert.equal(p.expected.length,a===b?1:2);}
 }}
 for(const [topic,active] of [['brackets','expand'],['quadratics','factor'],['quadratics','zero'],['fractions','goal'],['ratios','goal'],['graphs','goal']]){const families=new Set(Array.from({length:9},(_,serial)=>problemFor({...initialRecovery(topic),active,serial:serial+1}).family));assert.ok(families.size>=3);}
});
test('a routing probe separates arithmetic from factoring and cannot promote the learner',()=>{
 let s=act(start('quadratics'),{type:'submit',answers:['2','6'],confidence:'know'});assert.equal(s.nextSkill,'factor');s=act(s,{type:'continue'});
 assert.equal(problemFor(s).family,'diagnostic');assert.deepEqual(problemFor(s).expected,[8,12]);
 const checked=act(s,{type:'submit',answers:['8','12'],confidence:'know'});assert.equal(checked.next,'learn');assert.equal(checked.nextSkill,'factor');assert.equal(checked.evidence.at(-1).assisted,true);assert.deepEqual(checked.passed,[]);
 assert.equal(act(s,{type:'submit',answers:['7','12'],confidence:'unsure'}).nextSkill,'multiply');
 let roots=act(start('quadratics'),{type:'submit',answers:['3','4'],confidence:'unsure'});roots=act(roots,{type:'continue'});assert.deepEqual(problemFor(roots).expected,[-3]);
});
test('visuals, reflections, drafts and original attempts survive without awarding learning evidence',()=>{
 let s=start('brackets');s=act(s,{type:'draft',id:problemFor(s).id,answers:['2'],confidence:'forgot'});s=act(s,{type:'pause'});s=act(s,{type:'resume'});assert.deepEqual(s.draft.answers,['2']);
 s=act(s,{type:'learn'});s=act(s,{type:'lab-save',key:'brackets',value:{...freshLab(),step:3,reflection:'Every group brings its units.',values:{signed:1}}});s=act(s,{type:'learning-event',kind:'reflection',detail:'Every group brings its units.'});
 const saved=JSON.parse(JSON.stringify(s));assert.ok(validRecovery(saved));assert.equal(saved.labs.brackets.step,3);assert.deepEqual(saved.passed,[]);assert.equal(saved.evidence.length,0);
 const study=ingestRecovery(initialStudy(),saved,2000);assert.ok(validStudy(study));assert.deepEqual(study.review,{});
 assert.equal(validRecovery({...saved,labs:{bad:{...freshLab(),values:{x:Infinity}}}}),false);assert.equal(validRecovery({...saved,labs:{fractions:{...freshLab(),values:{denom:0}}}}),false);assert.equal(validRecovery({...saved,labs:{graphs:{...freshLab(),values:{abstract:0,rate:-2}}}}),false);
});
test('exposed quadratic pairs cannot reappear as independent v3 questions',()=>{
 const base={...initialRecovery(),active:'factor',exposedPairs:['2,6','3,4','-2,-2']};for(let i=0;i<80;i++){const serial=nextFreshSerial(base,i),p=problemFor({...base,serial});assert.ok(!base.exposedPairs.includes(pairKey(p.factorPair)));}
});
test('scope receipts account for every request without inventing a Khan match',()=>{
 const scope=[{text:'Fractions',topic:'fractions'},{text:'Teacher’s geometry notes',referenceOnly:true},{text:'Trigonometry'},{text:'Balancing',topic:'balancing'}];assert.ok(validScope(scope));const rows=scopeCoverage(scope,['fractions','balancing']);assert.equal(rows.length,4);assert.deepEqual(rows.map(r=>r.status),['Supported practice','Reference only','Not yet supported','Supported practice']);assert.ok(rows[0].resource);assert.equal(rows[3].resource,undefined);assert.equal(scopeCoverage(scope,[])[0].status,'Not yet supported');assert.equal(validScope([{text:'Fake',topic:'fake'}]),false);
});
test('new rounds preserve v2 historical item meaning while adopting v3',()=>{
 let old={...start('quadratics'),problemVersion:2};old=act(old,{type:'submit',answers:['-3','-4'],confidence:'know'});const state=ingestRecovery(initialStudy(),old,2000);const next=prepareRound(state,{id:'new-round',topic:'quadratics',skill:'goal',mode:'review',reason:'Later practice'},90000000);assert.equal(next.problemVersion,3);assert.equal(next.evidence[0].problemVersion,2);assert.ok(validRecovery(next));
});

test('same-day repetition cannot advance spacing as delayed retrieval',()=>{
 let state=initialStudy(),route=start('brackets'),time=1_000_000;
 for(let i=0;i<6;i++){route={...route,phase:'check',active:'expand',serial:i};route=reduce(route,{type:'submit',answers:problemFor(route).expected.map(String),confidence:'know',now:time+i*1000});state=ingestRecovery(state,route,time+i*1000);}
 const first=state.review['skill:expand'];assert.equal(first.stage,1);assert.equal(first.retainedAt,undefined);
 for(let i=6;i<8;i++){route={...route,phase:'check',active:'expand',serial:i};route=reduce(route,{type:'submit',answers:problemFor(route).expected.map(String),confidence:'know',now:time+2*86400000+i*1000});state=ingestRecovery(state,route,time+2*86400000+i*1000);}
 assert.equal(state.review['skill:expand'].stage,2);assert.ok(state.review['skill:expand'].retainedAt);assert.ok(state.review['skill:expand'].dueAt-state.review['skill:expand'].scheduledAt>=7*86400000);
});
test('rehearsal interleaves the supported scope with separate question identities',()=>{const session=planRehearsal(initialStudy(),PACKS[0],10,1000);assert.deepEqual(session.tasks.map(t=>t.topic),['brackets','quadratics','brackets','quadratics']);assert.equal(new Set(session.tasks.map(t=>t.id)).size,4);assert.equal(session.oneQuestionPerTask,true);});
test('shared scope retains gaps and strips private injected fields',()=>{const params=new URLSearchParams({scope:'fractions',title:'Quiz',coverage:JSON.stringify([{text:'Fractions',topic:'fractions',privateNote:'Never share me'},{text:'Trigonometry'}])});const shared=parseSharedPack(params);assert.equal(shared.scope.length,2);assert.equal(shared.scope[0].privateNote,undefined);assert.equal(shared.scope[1].text,'Trigonometry');assert.equal(shared.cards,undefined);params.set('coverage','{broken');assert.equal(parseSharedPack(params),undefined);});

test('a one-question rehearsal can finish without forced failure loops or help',()=>{let state=beginSession(initialStudy(),planRehearsal(initialStudy(),PACKS[0],10,1000),1000);for(let i=0;i<4;i++){const task=state.activeSession.tasks[state.activeSession.index];let route=prepareRound(state,task,2000+i*1000);route=reduce(route,{type:'submit',answers:problemFor(route).expected.map(()=>''),confidence:'never',now:2001+i*1000});state=ingestRecovery(state,route,2001+i*1000);state=completeStudyTask(state,route,2002+i*1000,task.id);}assert.equal(state.activeSession.complete,true);assert.equal(state.xp,0);assert.equal(state.activeSession.tasks.filter(t=>t.outcome==='checked').length,0);});

test('math notation keeps scripts, proper minus, ratio speech and upright units',()=>{assert.equal(speakMath('x² - 3x ≤ 4'),'x squared minus 3 x is less than or equal to 4');assert.equal(speakMath('2 : 3'),'2 to 3');assert.ok(parse('x-2').some(n=>n.t==='op'&&n.v==='−'));assert.ok(parse('\\mathrm{PHP}').every(n=>n.t!=='var'));assert.equal(parse('\\frac{2}{3}')[0].t,'frac');assert.equal(parse('H_{2}')[1].t,'sub');});

test('distribution checks grouping before choosing arithmetic support',()=>{let route={...start('brackets'),active:'expand',serial:0};route=reduce(route,{type:'submit',answers:['2','3'],confidence:'unsure',now:1000});assert.equal(route.nextSkill,'expand');route=reduce(route,{type:'continue',now:1001});assert.equal(problemFor(route).family,'diagnostic');route=reduce(route,{type:'submit',answers:['0'],confidence:'unsure',now:1002});assert.equal(route.nextSkill,'multiply');assert.equal(route.next,'learn');assert.equal(route.passed.length,0);});

test('every current destination and prerequisite has a relevant interactive guide',()=>{for(const topic of Object.keys(TOPICS)){const skills=new Set();const visit=skill=>{if(skills.has(skill))return;skills.add(skill);for(const child of skillDependencies(skill,topic))visit(child);};visit('goal');for(const active of skills){const s={...initialRecovery(topic),active,phase:'learn'};assert.ok(visualKind(s)||replayModel(s),`${topic}/${active} lacks a visual route`);}}});
test('foundational routes select the relevant concept rather than a harder topic model',()=>{assert.equal(visualKind({...initialRecovery('motion'),active:'unit_convert'}),'basics');assert.equal(visualKind({...initialRecovery('graphs'),active:'coordinates'}),'coordinates');assert.equal(visualKind({...initialRecovery('moles'),active:'atom_count'}),'atoms');assert.equal(replayModel({...initialRecovery('quadratics'),active:'distribute'}).kind,'factors');});
