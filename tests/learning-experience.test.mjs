import test from 'node:test';
import assert from 'node:assert/strict';
import {initialRecovery,problemFor,recoveryReducer as reduce,quadraticPair,pairKey,validRecovery,answerInputIssue} from '../src/lib/recovery.ts';
import {factorComparison,testSolution,replayModel} from '../src/lib/error-replay.ts';
import {routeSummary,importRouteRecord,actionSheetCsv} from '../src/lib/teacher-routine.ts';
import {clearBacktrackActivity,DEVICE_RESET_KEY} from '../src/lib/device-data.ts';
const act=(s,a)=>reduce(s,{now:1000,...a});
const start=()=>act({...initialRecovery(),problemVersion:2},{type:'start',budget:60,mode:'self'});

test('fresh quadratics cover three sign patterns and each solution satisfies the polynomial',()=>{
  const patterns=new Set();
  for(let serial=0;serial<180;serial++)for(const active of ['goal','zero','factor','distribute']){
    const p=problemFor({...initialRecovery(),problemVersion:2,serial,active}),[a,b]=p.factorPair;
    assert.doesNotMatch(p.expression,/\+ -|− -|− −/);
    assert.notEqual(a,b);
    if(active==='goal'||active==='zero'){
      for(const x of p.expected)assert.equal(x*x+(a+b)*x+a*b,0,p.expression);
      patterns.add(p.expected.every(x=>x<0)?'negative':p.expected.every(x=>x>0)?'positive':'mixed');
    }
  }
  assert.deepEqual([...patterns].sort(),['mixed','negative','positive']);
});
test('older saved routes retain their existing problem sequence',()=>{
  const old={...initialRecovery(),problemVersion:undefined,serial:1};assert.ok(validRecovery(old));
  assert.deepEqual(problemFor(old).expected,[-3,-7]);
  assert.deepEqual(problemFor({...old,problemVersion:2}).expected,[3,7]);
});
test('wrong-turn investigation uses a targeted fresh question before a repair',()=>{
  for(const [answers,skill,expected] of [[['2','6'],'factor',[4,5]],[['3','4'],'zero',[-5]]]){
    let s=act(start(),{type:'submit',answers,confidence:'unsure'});s=act(s,{type:'continue'});
    assert.equal(s.phase,'check');assert.equal(s.active,skill);assert.deepEqual(problemFor(s).expected,expected);assert.deepEqual(s.passed,[]);
  }
});
test('error replay exposes why a tempting pair fails and why one zero factor suffices',()=>{
  const wrong=factorComparison([3,4],[2,6]);assert.equal(wrong.productMatches,true);assert.equal(wrong.sumMatches,false);assert.equal(wrong.sum,8);
  assert.equal(factorComparison([3,4],[3,4]).sumMatches,true);
  assert.equal(testSolution([3,4],3).product,42);assert.equal(testSolution([3,4],-3).isSolution,true);
  for(const x of [2,-5])assert.equal(testSolution([-2,5],x).isSolution,true);
  assert.equal(testSolution([-2,5],-2).isSolution,false);
  let s=act(start(),{type:'submit',answers:['2','6'],confidence:'unsure'});s=act(s,{type:'learn',skill:'factor'});
  assert.deepEqual(replayModel(s),{kind:'factors',pair:[3,4],attempt:[2,6],fromAttempt:true});
});
test('replay examples remain excluded from fresh checks through reload, pause and return',()=>{
  let s={...start(),active:'factor',serial:1,phase:'learn'};
  s=act(s,{type:'expose-pair',pair:quadraticPair(2)});s=act(s,{type:'expose-pair',pair:quadraticPair(3)});
  s=act({...initialRecovery(),problemVersion:2},{type:'restore',state:JSON.parse(JSON.stringify(s))});
  s=act(s,{type:'pause'});s=act(s,{type:'resume'});s=act(s,{type:'practice',detail:'interactive-replay'});
  assert.equal(s.serial,4);assert.equal(s.evidence.length,0);assert.deepEqual(s.passed,[]);
  assert.ok(!s.exposedPairs.includes(pairKey(problemFor(s).factorPair)));
  let paused={...s,phase:'pause',serial:2,next:'check',nextSkill:'factor'};
  assert.equal(act(paused,{type:'resume'}).serial,4);
  assert.equal(act({...s,serial:1},{type:'return'}).serial,4);
});
test('invalid formatting does not record a mathematics failure, but I do not know remains valid',()=>{
  const s=start();assert.ok(answerInputIssue(problemFor(s),['x=3','4']));
  assert.equal(act(s,{type:'submit',answers:['x=3','4'],confidence:'unsure'}),s);
  const unknown=act(s,{type:'submit',answers:['',''],confidence:'never'});assert.equal(unknown.evidence.length,1);
});
test('self-reported Khan practice changes no score or question',()=>{
  const s=act(start(),{type:'learn'}),n=act(s,{type:'report-practice',detail:'Factoring'});
  assert.equal(n.serial,s.serial);assert.deepEqual(n.evidence,[]);assert.deepEqual(n.passed,[]);assert.equal(n.events[0].kind,'practice_report');
});
test('shared-device clearing removes all BACKTRACK topics and preserves other applications',()=>{
  const m=new Map([['backtrack.route.v1.quadratics','a'],['backtrack.route.v1.fractions','b'],['backtrack.route.v1.quadratics.quick','c'],['another-app','keep']]);
  const storage={get length(){return m.size;},key:i=>[...m.keys()][i]??null,removeItem:k=>m.delete(k),setItem:(k,v)=>m.set(k,v)};
  clearBacktrackActivity(storage,55);assert.deepEqual([...m.entries()],[['another-app','keep'],[DEVICE_RESET_KEY,'55']]);
});
test('teacher records reject demos and do not treat one answer as a cleared goal',()=>{
  const s=start();assert.throws(()=>importRouteRecord(JSON.stringify({...s,sampleMode:true})),/samples/);assert.throws(()=>importRouteRecord('{bad'),/readable/);
  const partial=act(s,{type:'submit',answers:problemFor(s).expected.map(String),confidence:'unsure'});
  assert.equal(routeSummary({...partial,goalPassed:true,passed:['goal']}).goal,false);
  const csv=actionSheetCsv([{code:'=UNTRUSTED()',route:partial,khan:'learner_reported',returnDate:''}],false);
  assert.ok(csv.includes('"\'=UNTRUSTED()"'));assert.ok(csv.includes('Learner reported completion'));assert.ok(csv.includes('Imported device record'));
});
