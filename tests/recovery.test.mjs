import test from 'node:test';
import assert from 'node:assert/strict';
import { initialRecovery, problemFor, recoveryReducer as reduce, isCorrect, validRecovery, ORDER, TOPICS } from '../src/lib/recovery.ts';
let clock=100000;
const act=(s,a)=>reduce(s,{...a,now:++clock});
const start=(topic='quadratics',budget=60)=>act({...initialRecovery(topic),problemVersion:2},{type:'start',budget,mode:'self'});
const answer=(s,correct=true,confidence='unsure')=>act(s,{type:'submit',answers:correct?problemFor(s).expected.map(String):problemFor(s).labels.map(()=>'-999'),confidence});
const advance=s=>s.phase==='pause'?act(s,{type:'resume'}):act(s,{type:'continue'});
test('all generated exercises accept mathematics, root order and Unicode minus',()=>{
  for(const topic of Object.keys(TOPICS))for(const active of ORDER)for(let serial=0;serial<100;serial++){
    const p=problemFor({...start(topic),active,serial});
    assert.ok(isCorrect(p,p.expected.map(String)),p.id);
    assert.ok(isCorrect(p,p.expected.map(x=>String(x).replace('-','−'))));
    if(p.unordered)assert.ok(isCorrect(p,[...p.expected].reverse().map(String)));
    for(const bad of ['', 'Infinity','NaN','1+1','alert(1)','0x10'])assert.equal(isCorrect(p,p.expected.map(()=>bad)),false);
  }
});
test('one answer and self confidence never pass a destination',()=>{for(const confidence of ['know','unsure','forgot','never']){let s=answer(start(),true,confidence);assert.equal(s.goalPassed,false);assert.equal(s.passed.length,0);s=answer(advance(s),true,confidence);assert.equal(s.goalPassed,true);assert.deepEqual(s.passed,['goal']);}});
test('supported answers and prior failures do not qualify as independent evidence',()=>{let s=act(start(),{type:'hint'});s=answer(s);assert.equal(s.goalPassed,false);s=answer(advance(s));assert.equal(s.goalPassed,false);s=answer(advance(s));assert.equal(s.goalPassed,true);assert.equal(s.evidence.length,3);});
test('an uncertain error inserts deeper prerequisites, without calling them mastered',()=>{let s=advance(answer(start(),false));assert.equal(s.active,'factor');s=advance(answer(s,false));assert.equal(s.active,'distribute');assert.ok(s.planned.includes('distribute'));s=advance(answer(s,false));assert.equal(s.active,'terms');assert.ok(s.planned.includes('terms'));assert.deepEqual(s.passed,[]);});
test('confident errors get a contrasting check; forgotten skills get learning support',()=>{let s=answer(start(),false,'know');assert.equal(s.nextSkill,'goal');assert.equal(s.next,'check');s=advance(answer(advance(s),false,'unsure'));assert.equal(s.active,'factor');s=answer(s,false,'forgot');assert.equal(s.next,'learn');assert.equal(s.nextSkill,'factor');});
test('Khan opens and self-reports never demonstrate a skill',()=>{let s=act(start(),{type:'learn'});s=act(s,{type:'khan',detail:'video'});s=act(s,{type:'practice',detail:'self-reported'});assert.deepEqual(s.passed,[]);assert.equal(s.evidence.length,0);assert.equal(s.events.length,2);});
test('all five destinations complete after a genuine deep-gap route',()=>{
  for(const topic of Object.keys(TOPICS)){
    let s=start(topic),saw=new Set(),rounds=0;
    while(s.phase!=='complete'&&rounds++<100){
      assert.ok(validRecovery(s),`${topic} invalid ${s.phase}`);
      if(s.phase==='check') {const first=!saw.has(s.active);saw.add(s.active);s=answer(s,!first);}
      else if(s.phase==='learn')s=act(s,{type:'practice',detail:'self-reported'});
      else s=advance(s);
    }
    assert.equal(s.phase,'complete');assert.equal(s.goalPassed,true);assert.ok(s.suspected.length===0);assert.ok(s.evidence.some(e=>!e.correct));assert.equal(new Set(s.evidence.map(e=>e.id)).size,s.evidence.length);
  }
});
test('session budgets change block size without hiding prerequisites',()=>{const sizes=[];for(const budget of [5,15,30,60]){let s=start('quadratics',budget);sizes.push(s.blockLimit);assert.deepEqual(s.planned,['factor','zero','goal']);if(budget===5){s=advance(answer(s,false));assert.equal(s.phase,'pause');s=advance(s);assert.equal(s.phase,'check');assert.equal(s.active,'factor');}}assert.deepEqual(sizes,[1,3,6,10]);});
test('repeated failure offers human support rather than an endless loop',()=>{let s={...start(),active:'zero'};for(let i=0;i<3;i++){s=answer(s,false);if(i<2){s=advance(s);s=act(s,{type:'practice',detail:'other'});}}assert.equal(s.next,'support');});
test('comeback preserves history but reopens the destination after failure',()=>{let s=advance(answer(advance(answer(start()))));assert.equal(s.phase,'complete');const count=s.evidence.length;s=act(s,{type:'return'});s=answer(s,false);assert.equal(s.goalPassed,false);assert.ok(s.evidence.length>count);assert.ok(!s.passed.includes('goal'));});
test('corrupted local storage is rejected safely',()=>{assert.equal(validRecovery(null),false);assert.equal(validRecovery({version:1,phase:'check'}),false);assert.equal(validRecovery({...initialRecovery(),planned:['madeup']}),false);assert.equal(validRecovery({...initialRecovery(),serial:Infinity}),false);assert.ok(validRecovery(initialRecovery()));});
test('fresh exercises have different expressions, and quadratic roots are distinct',()=>{for(const topic of Object.keys(TOPICS))for(const active of ORDER){const seen=new Set();for(let serial=0;serial<120;serial++){const p=problemFor({...initialRecovery(topic),problemVersion:2,active,serial});assert.ok(!seen.has(p.expression),p.id+' repeated '+p.expression);seen.add(p.expression);if(p.unordered)assert.equal(new Set(p.expected).size,p.expected.length);}}});
test('a new comeback requires two new checks, not the previous comeback answers',()=>{let s=advance(answer(advance(answer(start()))));s=act(s,{type:'return'});s=advance(answer(advance(answer(s))));assert.equal(s.phase,'complete');s=act(s,{type:'return'});s=answer(s);assert.equal(s.phase,'feedback');s=answer(advance(s));assert.equal(s.phase,'moment');});
test('a demonstrated repair does not force untested foundations into the route',()=>{let s=advance(answer(start(),false));s=advance(answer(s,false,'never'));assert.equal(s.phase,'learn');s=act(s,{type:'practice',detail:'self-reported'});s=answer(advance(answer(s)));assert.equal(s.phase,'moment');assert.equal(s.nextSkill,'zero');assert.ok(!s.planned.includes('distribute'));assert.ok(!s.passed.includes('distribute'));});

test('equivalent fraction answers count and zero denominators do not',()=>{const p=problemFor(initialRecovery('fractions'));assert.ok(isCorrect(p,['22','24']));assert.ok(isCorrect(p,['-11','-12']));assert.equal(isCorrect(p,['11','0']),false);assert.equal(isCorrect(p,['12','11']),false);});


test('guided examples stay excluded from fresh checks after pause and reload',()=>{
  for(const topic of Object.keys(TOPICS)){
    let s=act(start(topic),{type:'learn'});
    const worked=problemFor(s).expression,guided=problemFor({...s,serial:s.serial+1}).expression;
    s=act(s,{type:'expose',serial:s.serial+1});
    s=act(s,{type:'pause'});
    s=act(initialRecovery(topic),{type:'restore',state:JSON.parse(JSON.stringify(s))});
    s=act(s,{type:'resume'});
    const comeback=act(s,{type:'return'});
    s=act(s,{type:'practice',detail:'guided-repair'});
    assert.notEqual(problemFor(s).expression,worked);
    assert.notEqual(problemFor(s).expression,guided);
    assert.notEqual(problemFor(comeback).expression,guided);
    assert.equal(s.evidence.length,0);
    assert.equal(s.goalPassed,false);
  }
});
test('fraction equality is exact for decimals and tiny magnitudes',()=>{
 const p=problemFor(initialRecovery('fractions'));
 for(const pair of [['0','0.000000000001'],['0.000000000001','0.000000000001'],['0.000000000010','0.000000000012']])assert.equal(isCorrect(p,pair),false);
 for(const pair of [['.11','.12'],['0.000000000011','0.000000000012'],['11000000000000000','12000000000000000']])assert.ok(isCorrect(p,pair));
 assert.ok(isCorrect(p,['1100000','1200000']));
});

test('different wrong answers lead to different starting checks without awarding mastery',()=>{
 const signs=act(start(),{type:'submit',answers:['3','4'],confidence:'unsure'});
 const product=act(start(),{type:'submit',answers:['2','6'],confidence:'unsure'});
 assert.equal(signs.nextSkill,'zero');assert.deepEqual(signs.planned,['zero','goal']);
 assert.equal(product.nextSkill,'factor');assert.deepEqual(product.planned,['factor','goal']);
 for(const s of [signs,product]){assert.equal(s.correct,false);assert.deepEqual(s.passed,[]);assert.equal(s.evidence.length,1);assert.ok(validRecovery(s));assert.ok(s.routeClue.message);}
 const confident=act(start(),{type:'submit',answers:['3','4'],confidence:'know'});
 assert.equal(confident.nextSkill,'goal');
});
test('a clue can avoid an unnecessary review while the fresh destination remains required',()=>{
 let s=advance(act(start(),{type:'submit',answers:['3','4'],confidence:'unsure'}));
 assert.equal(s.active,'zero');
 s=answer(advance(answer(s)));assert.equal(s.phase,'moment');assert.equal(s.nextSkill,'goal');
 assert.equal(s.goalPassed,false);assert.ok(!s.passed.includes('factor'));
 s=advance(s);s=advance(answer(advance(answer(s))));
 assert.equal(s.phase,'complete');assert.ok(s.goalPassed);assert.equal(s.evidence.some(e=>e.skill==='factor'),false);
});
test('adding denominators triggers a parts-size check, and malformed input is not a clue',()=>{
 const s=act(start('fractions'),{type:'submit',answers:['3','7'],confidence:'unsure'});
 assert.equal(s.nextSkill,'same_denominator');assert.deepEqual(s.passed,[]);
 const invalid=act(start(),{type:'submit',answers:['0x3','0x4'],confidence:'unsure'});
 assert.equal(invalid.routeClue,undefined);
 assert.equal(validRecovery({...initialRecovery(),routeClue:{skill:'madeup',message:'x',serial:0}}),false);
});
