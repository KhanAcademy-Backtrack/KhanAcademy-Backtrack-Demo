import test from 'node:test';
import assert from 'node:assert/strict';
import {initialRecovery,problemFor,recoveryReducer as reduce,isCorrect,answerInputIssue,validRecovery,TOPICS,ORDER,subjectOf} from '../src/lib/recovery.ts';
import {ATOMIC_MASS,COMPOUNDS,EQUATIONS,formulaMass,round} from '../src/lib/science.ts';
import {visualKind,visualReserveThrough} from '../src/lib/concept-labs.ts';
import {speakMath} from '../src/lib/notation.ts';
import {initialStudy,prepareRound,completeStudyTask,planSession,beginSession,validStudy,PACKS,STUDY_KEY} from '../src/lib/study.ts';
import {loadStudy} from '../src/lib/study-storage.ts';

let clock=200000;
const act=(s,a)=>reduce(s,{...a,now:++clock});
const start=(topic,budget=60)=>act(initialRecovery(topic),{type:'start',budget,mode:'self'});
const answer=(s,correct=true,confidence='unsure')=>act(s,{type:'submit',answers:correct?problemFor(s).expected.map(String):problemFor(s).labels.map(()=>'-999'),confidence});
const advance=s=>s.phase==='pause'?act(s,{type:'resume'}):act(s,{type:'continue'});

const SCIENCE=Object.keys(TOPICS).filter(t=>subjectOf(t)!=='maths');
const SCIENCE_SKILLS=['atom_count','formula_mass','unit_convert','net_force'];
/** Every (topic, skill) pair that actually serves a science item. */
const PAIRS=[...SCIENCE.map(topic=>[topic,'goal']),...SCIENCE_SKILLS.map(skill=>['moles',skill])];

/* --- 1. item family integrity ------------------------------------------- */

test('every science family gives 200 consecutive fresh items with printable expected values',()=>{
  for(const [topic,active] of PAIRS){
    const seen=new Set();
    for(let serial=0;serial<200;serial++){
      const p=problemFor({...initialRecovery(topic),active,serial});
      assert.ok(!seen.has(p.expression),`${topic}/${active} repeated ${p.expression}`);
      seen.add(p.expression);
      assert.equal(p.labels.length,p.expected.length,p.id);
      assert.ok(p.expected.length<=4,p.id);
      if(p.fields)assert.equal(p.fields.length,p.expected.length,p.id);
      for(const value of p.expected){
        assert.doesNotMatch(String(value),/e[+-]/i,`${p.id} stringifies as ${value}`);
        assert.ok(value===0||Math.abs(value)>=1e-6,`${p.id} value ${value} is too small to print`);
      }
      assert.ok(isCorrect(p,p.expected.map(String)),p.id);
      assert.equal(isCorrect(p,p.labels.map(()=>'-999')),false,`${p.id} accepts -999`);
      assert.equal(answerInputIssue(p,p.labels.map(()=>'-999')),undefined,`${p.id} rejects -999 as input`);
      for(const bad of ['','Infinity','NaN','1+1','alert(1)','0x10'])assert.equal(isCorrect(p,p.expected.map(()=>bad)),false);
    }
  }
});

test('a declared tolerance accepts the boundary and rejects just outside it',()=>{
  let checked=0;
  for(const [topic,active] of PAIRS)for(let serial=0;serial<40;serial++){
    const p=problemFor({...initialRecovery(topic),active,serial});
    if(p.tolerance===undefined)continue;
    checked++;
    assert.equal(p.tolerance,10**-p.decimals,`${p.id} tolerance must follow the declared precision`);
    assert.match(p.prompt,/decimal place/,`${p.id} must state its precision in the prompt`);
    const at=p.expected.map(v=>String(round(v+p.tolerance,10)));
    const past=p.expected.map(v=>String(round(v+p.tolerance*2,10)));
    assert.ok(isCorrect(p,at),`${p.id} rejects its own boundary`);
    assert.equal(isCorrect(p,past),false,`${p.id} accepts beyond its boundary`);
  }
  assert.ok(checked>0,'no tolerance-bearing item was exercised');
});

test('an exact integer answer carries no tolerance, so it is compared exactly',()=>{
  for(const [topic,active] of PAIRS)for(let serial=0;serial<40;serial++){
    const p=problemFor({...initialRecovery(topic),active,serial});
    if(p.decimals!==undefined)continue;
    assert.equal(p.tolerance,undefined,p.id);
    assert.equal(isCorrect(p,p.expected.map(v=>String(v+1))),false,p.id);
  }
});

/* --- 2. chemistry correctness ------------------------------------------- */

test('the reviewed constants table reproduces every formula mass independently',()=>{
  for(const compound of COMPOUNDS){
    const recomputed=Object.entries(compound.parts).reduce((sum,[el,n])=>{
      assert.ok(ATOMIC_MASS[el]!==undefined,`${compound.plain} uses ${el}, which is not in the table`);
      return sum+ATOMIC_MASS[el]*n;
    },0);
    assert.equal(formulaMass(compound.parts),Math.round(recomputed*100)/100,compound.plain);
    assert.ok(formulaMass(compound.parts)>0);
  }
});

test('every mole item follows n = m / M from the same table',()=>{
  for(let serial=0;serial<240;serial++){
    const p=problemFor({...initialRecovery('moles'),active:'goal',serial});
    const compound=COMPOUNDS[serial%COMPOUNDS.length];
    const mass=Number(p.prompt.match(/in (\d+(?:\.\d+)?) g/)[1]);
    const M=Object.entries(compound.parts).reduce((sum,[el,n])=>sum+ATOMIC_MASS[el]*n,0);
    assert.equal(p.expected[0],Math.round(mass/(Math.round(M*100)/100)*100)/100,p.id);
    assert.match(p.prompt,new RegExp(`molar mass is ${(Math.round(M*100)/100).toString().replace('.','\\.')} g/mol`));
  }
});

test('every formula-mass item scales one mole by the stated amount',()=>{
  for(let serial=0;serial<240;serial++){
    const p=problemFor({...initialRecovery('moles'),active:'formula_mass',serial});
    const compound=COMPOUNDS[serial%COMPOUNDS.length];
    const n=Number(p.prompt.match(/mass of (\d+) mol/)[1]);
    const M=Math.round(Object.entries(compound.parts).reduce((sum,[el,q])=>sum+ATOMIC_MASS[el]*q,0)*100)/100;
    assert.equal(p.expected[0],Math.round(n*M*100)/100,p.id);
  }
});

test('every atom-count item multiplies the subscript by the coefficient',()=>{
  for(let serial=0;serial<240;serial++){
    const p=problemFor({...initialRecovery('balancing'),active:'atom_count',serial});
    const compound=COMPOUNDS[serial%COMPOUNDS.length];
    const k=Number(p.expression.match(/^(\d+)/)[1]);
    const element=Object.keys(compound.parts)[serial%Object.keys(compound.parts).length];
    assert.equal(p.expected[0],k*compound.parts[element],p.id);
  }
});

test('every generated balancing item is genuinely balanced, element by element',()=>{
  for(let serial=0;serial<240;serial++){
    const p=problemFor({...initialRecovery('balancing'),active:'goal',serial});
    const e=EQUATIONS[serial%EQUATIONS.length];
    // Rebuild the full coefficient list from the one shown plus the expected answers.
    const shown=Number(p.prompt.match(/is (\d+)\.$/)[1]);
    const givenIndex=e.species.findIndex(sp=>p.prompt.includes(`coefficient of ${sp.plain} is`));
    assert.ok(givenIndex>=0,p.id);
    const coefficients=[];let next=0;
    for(let i=0;i<e.species.length;i++)coefficients.push(i===givenIndex?shown:p.expected[next++]);
    assert.equal(next,p.expected.length,p.id);
    const elements=[...new Set(e.species.flatMap(sp=>Object.keys(sp.parts)))];
    for(const el of elements){
      const side=(from,to)=>e.species.slice(from,to).reduce((sum,sp,i)=>sum+(sp.parts[el]??0)*coefficients[from+i],0);
      assert.equal(side(0,e.reactants),side(e.reactants,e.species.length),`${p.id}: ${el} is unbalanced`);
    }
    assert.ok(coefficients.every(c=>Number.isInteger(c)&&c>0),p.id);
    assert.equal(p.expected.length,e.species.length-1,p.id);
  }
});

test('the reviewed skeletons themselves balance before any scaling',()=>{
  for(const e of EQUATIONS){
    for(const el of new Set(e.species.flatMap(sp=>Object.keys(sp.parts)))){
      const side=(from,to)=>e.species.slice(from,to).reduce((sum,sp,i)=>sum+(sp.parts[el]??0)*e.coefficients[from+i],0);
      assert.equal(side(0,e.reactants),side(e.reactants,e.species.length),`${e.species.map(s=>s.plain).join(' ')}: ${el}`);
    }
    assert.equal(new Set(e.species.map(s=>s.plain)).size,e.species.length,'species labels must stay distinct');
  }
});

/* --- 3. physics correctness --------------------------------------------- */

test('every kinematics item satisfies v = u + at',()=>{
  for(let serial=0;serial<240;serial++){
    const p=problemFor({...initialRecovery('motion'),active:'goal',serial});
    const [,u,a,t]=p.prompt.match(/at (\d+) m\/s and speeds up steadily at (\d+) m\/s² for (\d+) s/).map(Number);
    assert.equal(p.expected[0],u+a*t,p.id);
  }
});

test('every F = ma item is consistent whichever quantity is unknown',()=>{
  const relations=['F = m × a','m = F ÷ a','a = F ÷ m'];
  for(let serial=0;serial<240;serial++){
    const p=problemFor({...initialRecovery('forces'),active:'goal',serial});
    const numbers=[...p.expression.matchAll(/(\w) = (\d+)/g)].map(m=>[m[1],Number(m[2])]);
    const known=Object.fromEntries(numbers);
    const value=p.expected[0],choice=p.expected[1];
    const all={...known,[{0:'F',1:'m',2:'a'}[choice]]:value};
    assert.equal(all.F,all.m*all.a,p.id);
    assert.equal(p.fields[1].kind,'choice');
    assert.deepEqual(p.fields[1].options,relations);
    assert.equal(p.fields[0].unit,['N','kg','m/s²'][choice]);
  }
});

test('every unit conversion matches an independent computation',()=>{
  for(let serial=0;serial<240;serial++){
    const p=problemFor({...initialRecovery('motion'),active:'unit_convert',serial});
    const [,value,from,to]=p.prompt.match(/Convert ([\d.]+) (km\/h|m\/s|km|minutes) to (metres per second|kilometres per hour|metres|seconds)/);
    const v=Number(value);
    const expected=to==='metres per second'?Math.round(v/3.6*100)/100
      :to==='kilometres per hour'?Math.round(v*3.6*10)/10
      :to==='metres'?Math.round(v*1000)
      :Math.round(v*60);
    assert.equal(p.expected[0],expected,`${p.id}: ${from} to ${to}`);
  }
});

test('every net-force item is the signed sum of the two forces it shows',()=>{
  for(let serial=0;serial<240;serial++){
    const p=problemFor({...initialRecovery('forces'),active:'net_force',serial});
    const forces=[...p.expression.matchAll(/= (−?\d+)/g)].map(m=>Number(m[1].replace('−','-')));
    assert.equal(forces.length,2,p.id);
    assert.equal(p.expected[0],forces[0]+forces[1],p.id);
    assert.match(p.prompt,/right as positive/);
  }
});

/* --- 4. prerequisite routing -------------------------------------------- */

test('a science goal failure routes into science, then into the mathematics underneath',()=>{
  // Motion reaches the mathematics bridge on the second miss: unit conversion
  // itself rests on multiplication, which is an existing, Khan-matched skill.
  let m=advance(answer(start('motion'),false));
  assert.equal(m.active,'unit_convert');
  assert.deepEqual(m.passed,[]);
  m=advance(answer(m,false));
  assert.equal(m.active,'multiply','a unit-conversion miss descends into the existing multiplication skill');
  assert.deepEqual(m.passed,[],'no step is marked passed along the way');
  assert.ok(m.planned.includes('multiply'));
  assert.ok(validRecovery(m));

  // Forces has no prerequisite under the net force itself, so a second miss
  // offers an explanation rather than inventing a deeper gap. The mathematics
  // bridge is reached once the force step is demonstrated and the route moves on.
  let f=advance(answer(start('forces'),false));
  assert.equal(f.active,'net_force');
  const stuck=answer(f,false);
  assert.equal(stuck.next,'learn','no invented prerequisite under combining forces');
  assert.deepEqual(stuck.passed,[]);
  f=answer(advance(answer(f,true)),true);
  assert.deepEqual(f.passed,['net_force']);
  assert.equal(f.nextSkill,'substitute','the route continues to the mathematics prerequisite');
  f=advance(f);
  assert.equal(f.active,'substitute');
  f=advance(answer(f,false));
  assert.equal(f.active,'multiply','substitute descends into the existing multiplication skill');
  assert.ok(!f.passed.includes('substitute'));
  assert.ok(!f.passed.includes('multiply'));

  // Chemistry descends within its own subject.
  let c=advance(answer(start('moles'),false));
  assert.equal(c.active,'formula_mass');
  c=advance(answer(c,false));
  assert.equal(c.active,'atom_count','formula mass rests on counting atoms');
  assert.deepEqual(c.passed,[]);

  let b=advance(answer(start('balancing'),false));
  assert.equal(b.active,'atom_count');
  assert.deepEqual(b.passed,[]);
});

test('every science destination completes only through fresh unassisted checks',()=>{
  for(const topic of SCIENCE){
    let s=start(topic),saw=new Set(),rounds=0;
    while(s.phase!=='complete'&&rounds++<100){
      assert.ok(validRecovery(s),`${topic} invalid at ${s.phase}`);
      if(s.phase==='check'){const first=!saw.has(s.active);saw.add(s.active);s=answer(s,!first);}
      else if(s.phase==='learn')s=act(s,{type:'practice',detail:'self-reported'});
      else s=advance(s);
    }
    assert.equal(s.phase,'complete',topic);
    assert.equal(s.goalPassed,true,topic);
    assert.deepEqual(s.suspected,[],topic);
    assert.equal(new Set(s.evidence.map(e=>e.id)).size,s.evidence.length,topic);
    assert.ok(s.evidence.filter(e=>e.skill==='goal'&&e.correct&&!e.assisted).length>=2,topic);
  }
});

/* --- 5. evidence separation --------------------------------------------- */

test('a science Khan open, a self-report and a hinted answer are activity, never evidence',()=>{
  const study=initialStudy(),pack=PACKS.find(p=>p.id==='motion-and-forces');
  const plan=planSession(study,pack,10,'learn',clock);
  const task={...plan.tasks[0],startedAt:++clock};
  let route=prepareRound(study,task,clock);
  route={...route,phase:'check'};
  route=act(route,{type:'khan',detail:'exercise:whatever'});
  route=act(route,{type:'practice',detail:'self-reported'});
  route=act(route,{type:'hint'});
  route=answer(route,true);
  assert.deepEqual(route.passed,[],'a supported answer passes nothing');
  assert.equal(route.goalPassed,false);
  assert.equal(route.evidence.length,1);
  assert.equal(route.evidence[0].assisted,true);
  assert.equal(route.events.filter(e=>e.kind==='khan_open').length,1);
  const after=completeStudyTask(beginSession(study,{...plan,tasks:[task]},clock),route,++clock,task.id);
  assert.equal(after.xp,0,'no study points for activity');
  assert.deepEqual(after.awards,[]);
});

/* --- 6. exposure -------------------------------------------------------- */

test('a science lab reserves what it reveals, across pause, reload and return',()=>{
  for(const topic of SCIENCE){
    let s=act(start(topic),{type:'learn'});
    const kind=visualKind(s);
    assert.ok(kind,`${topic} has no visual guide`);
    const reserve=visualReserveThrough(s,kind);
    assert.ok(reserve>=s.serial,`${topic} reserve must cover what the lab shows`);
    const shown=[];
    for(let serial=s.serial;serial<=reserve;serial++)shown.push(problemFor({...s,serial}).expression);
    s=act(s,{type:'expose',serial:reserve});
    s=act(s,{type:'pause'});
    s=act(initialRecovery(topic),{type:'restore',state:JSON.parse(JSON.stringify(s))});
    s=act(s,{type:'resume'});
    const comeback=act(s,{type:'return'});
    s=act(s,{type:'practice',detail:'visual-guide'});
    for(const expression of shown){
      assert.notEqual(problemFor(s).expression,expression,`${topic} reused a revealed item`);
      assert.notEqual(problemFor(comeback).expression,expression,`${topic} reused a revealed item on return`);
    }
    assert.equal(s.evidence.length,0,`${topic} recorded evidence from a guide`);
    assert.equal(s.goalPassed,false);
  }
});

/* --- 7. notation -------------------------------------------------------- */

test('the pre-existing destination examples still read exactly as they did',()=>{
  assert.deepEqual(['quadratics','brackets','fractions','ratios','graphs'].map(t=>speakMath(TOPICS[t].example)),[
    'x squared plus 7 x plus 12 equals 0',
    '3 open bracket x plus 2 close bracket plus 2 x equals 31',
    'the fraction 2 over 3, end fraction plus the fraction 1 over 4, end fraction',
    '3 : 24 equals 5 : x',
    'y equals 2 x plus 3',
  ]);
});

test('subscripts, upright symbols and thin spaces read correctly',()=>{
  assert.equal(speakMath('\\mathrm{H_{2}O}'),'H 2 O');
  assert.equal(speakMath('2\\,\\mathrm{O_{2}}'),'2 O 2');
  assert.equal(speakMath('3\\,\\mathrm{m/s^{2}}'),'3 m over s squared');
  assert.equal(speakMath('\\mathrm{CH_{4}} → \\mathrm{CO_{2}}'),'C H 4 yields C O 2');
  assert.equal(speakMath('F_{1} = −5\\,\\mathrm{N}'),'F 1 equals minus 5 N');
});

test('every science item that needs a spoken form has an authored one',()=>{
  for(const [topic,active] of PAIRS)for(let serial=0;serial<12;serial++){
    const p=problemFor({...initialRecovery(topic),active,serial});
    if(!/\\mathrm|_\{/.test(p.expression))continue;
    assert.ok(p.speak&&p.speak.length>0,`${p.id} needs an authored spoken form`);
  }
  for(const topic of SCIENCE)assert.ok(TOPICS[topic].speak,`${topic} example needs an authored spoken form`);
});

/* --- 8. migration ------------------------------------------------------- */

const preChangeState=()=>({
  version:1,updatedAt:1757000000000,activePack:'algebra-quiz',
  packs:[{id:'algebra-quiz',name:'This week’s algebra',description:'Saved before chemistry and physics existed.',topics:['brackets','quadratics'],testDate:'2026-09-20'}],
  review:{'skill:factor':{key:'skill:factor',topic:'quadratics',skill:'factor',dueAt:1757200000000,stage:1,streak:2,lastAt:1757000000000,independentAt:1757000000000,manual:false,paused:false}},
  seen:['quadratics:goal:x² + 7x + 12 = 0'],seenEvents:[],
  routes:{quadratics:{...initialRecovery('quadratics'),phase:'check',startedAt:1757000000000,updatedAt:1757000000000}},
  cursors:{quadratics:3},pairs:{quadratics:['3,4']},
  sessions:[],xp:10,awards:['2026-9-4:skill:factor'],lastVisit:1757000000000,
  settings:{minutes:10,weeklyGoal:3,quiet:false,sound:false,style:'leaf',accessory:'none',intervals:[1,3,7]},
  events:[{kind:'round_done',at:1757000000000,detail:'task-1'}],
});

test('a study space saved before this change still loads, with no backup written',()=>{
  const saved=preChangeState();
  assert.ok(validStudy(saved),'the pre-change save must still validate');
  const store=new Map([[STUDY_KEY,JSON.stringify(saved)]]);
  const storage={get length(){return store.size;},key:i=>[...store.keys()][i]??null,getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const {state,warning,writesBlocked}=loadStudy(storage,clock);
  assert.equal(warning,'');
  assert.equal(writesBlocked,false);
  assert.equal([...store.keys()].filter(k=>k.includes('backup')).length,0,'nothing may be backed up');
  assert.equal(state.xp,10);
  assert.deepEqual(state.packs,saved.packs,'saved packs survive intact');
  assert.deepEqual(Object.keys(state.review),['skill:factor']);
  assert.equal(state.review['skill:factor'].streak,2);
  assert.equal(state.cursors.quadratics,3);
  assert.ok(validStudy(state));
});

test('every topic id stays word-safe, so saved return paths keep validating',()=>{
  for(const topic of Object.keys(TOPICS))assert.match(topic,/^\w+$/,topic);
  for(const skill of ORDER)assert.match(skill,/^\w+$/,skill);
  for(const topic of Object.keys(TOPICS))assert.match(`/start/${topic}`,/^\/(?:study\/session|start\/\w+|try\/factors|packs|khan)$/);
});
