/** A transparent, deterministic routing policy. Evidence is task-specific, never a placement decision. */
export type Topic = 'quadratics' | 'brackets' | 'fractions' | 'ratios' | 'graphs';
export type Skill = 'multiply' | 'equivalent' | 'same_denominator' | 'unit_rate' | 'coordinates' | 'substitute' | 'terms' | 'expand' | 'distribute' | 'factor' | 'zero' | 'linear' | 'goal';
export type Confidence = 'know' | 'unsure' | 'forgot' | 'never';
export type Phase = 'setup' | 'check' | 'feedback' | 'learn' | 'moment' | 'pause' | 'complete' | 'return' | 'support';
export type Attempt = { id: string; skill: Skill; answer: string[]; correct: boolean; assisted: boolean; confidence: Confidence; at: number; purpose: 'route' | 'return' | 'next' };
export type Event = { kind: 'khan_open' | 'practice_report' | 'other_support' | 'pause' | 'resume' | 'next_turn'; skill: Skill; at: number; detail?: string };
export type Recovery = {
  exposedUntil?: number;
  version: 1; topic: Topic; mode: 'self' | 'class'; budget: number; phase: Phase;
  active: Skill; planned: Skill[]; passed: Skill[]; learned: Skill[]; suspected: Skill[];
  evidence: Attempt[]; events: Event[]; serial: number; assisted: boolean;
  correct: boolean | null; message: string; next: Phase; nextSkill: Skill;
  startedAt: number; updatedAt: number; blockCount: number; blockLimit: number;
  goalPassed: boolean; goalWasBlocked: boolean; returnCheck: boolean; extension: boolean;
  cycleStart?: number;
};
export const LABELS: Record<Skill, string> = {
  multiply:'Multiply numbers',equivalent:'Equivalent fractions',same_denominator:'Add equal-sized parts',unit_rate:'Find the amount for one',coordinates:'Read coordinates',substitute:'Use a value in a rule',
  terms: 'Like terms', expand: 'Expand brackets', distribute: 'Multiply brackets',
  factor: 'Find the factors', zero: 'Set each factor to zero', linear: 'Undo multiplication', goal: 'Your destination',
};
export const TOPICS = {
  quadratics: { label: 'Quadratic equations', goal: 'Solve a quadratic', example: 'x² + 7x + 12 = 0', description: 'Find the factors. Find both solutions.', path: ['factor', 'zero', 'goal'] as Skill[] },
  brackets: { label: 'Equations with brackets', goal: 'Solve an equation with brackets', example: '3(x + 2) + 2x = 31', description: 'Open the brackets. Bring the equation together.', path: ['expand', 'linear', 'goal'] as Skill[] },
  fractions: {label:'Adding fractions',goal:'Add fractions with different denominators',example:'\\frac{2}{3} + \\frac{1}{4}',description:'Make the parts match. Add what you have.',path:['equivalent','same_denominator','goal'] as Skill[]},
  ratios: {label:'Ratios and unit rates',goal:'Solve a proportion',example:'3 : 24 = 5 : x',description:'Find the amount for one. Scale it up.',path:['unit_rate','goal'] as Skill[]},
  graphs: {label:'Reading linear graphs',goal:'Read a value from a graph',example:'y = 2x + 3',description:'Find the point. Connect the graph to its rule.',path:['coordinates','substitute','goal'] as Skill[]},
};
export function initialRecovery(topic: Topic = 'quadratics'): Recovery {
  return { version: 1, topic, mode: 'self', budget: 15, phase: 'setup', active: 'goal', planned: [...TOPICS[topic].path], passed: [], learned: [], suspected: [], evidence: [], events: [], serial: 0, assisted: false, correct: null, message: '', next: 'check', nextSkill: 'goal', startedAt: 0, updatedAt: 0, blockCount: 0, blockLimit: 3, goalPassed: false, goalWasBlocked: false, returnCheck: false, extension: false };
}
const deps = (skill: Skill, topic: Topic): Skill[] => skill === 'goal' ? TOPICS[topic].path.filter(x => x !== 'goal') : skill === 'factor' ? ['distribute'] : skill === 'distribute' || skill === 'expand' ? ['terms'] : ['equivalent','unit_rate','substitute'].includes(skill)?['multiply']:[];
export const ORDER: Skill[] = ['multiply','equivalent','same_denominator','unit_rate','coordinates','substitute','terms', 'expand', 'distribute', 'factor', 'zero', 'linear', 'goal'];
export const NEXT_SKILL:Record<Topic,Skill>={quadratics:'factor',brackets:'expand',fractions:'equivalent',ratios:'unit_rate',graphs:'substitute'};
export type GraphData={kind:'point'|'line';x:number;y?:number;slope?:number;intercept?:number};
export type Problem = { id: string; expression: string; prompt: string; labels: string[]; expected: number[]; unordered?: boolean; format?:'fraction'; graph?:GraphData; hint: string; explanation: string; widget?: 'factors' | 'area' };
export function problemFor(s: Recovery): Problem {
  const v = s.serial;
  // Serial is monotonic across the entire route, so exposed problems are never reused as fresh evidence.
  const a = 2 + (v % 5), b = 7 + Math.floor(v / 5);
  const id = `${s.topic}:${s.active}:${v}`;
  if(s.active==='multiply')return {id,expression:`${a} × ${b}`,prompt:'What is the product?',labels:['Product'],expected:[a*b],hint:`Think of ${a} equal groups of ${b}.`,explanation:`${a} × ${b} = ${a*b}.`};
  if(s.active==='equivalent'){const n=1+v%3,d=n+2+Math.floor(v/3),k=2+v%4;return {id,expression:`\\frac{${n}}{${d}} = \\frac{x}{${d*k}}`,prompt:'Fill the missing numerator.',labels:['Missing numerator'],expected:[n*k],hint:`The denominator was multiplied by ${k}. Do the same to the numerator.`,explanation:`${n}/${d} = ${n*k}/${d*k}. Both numbers scale by ${k}.`};}
  if(s.active==='same_denominator'){const den=a+b+1;return {id,expression:`\\frac{${a}}{${den}} + \\frac{${b}}{${den}}`,prompt:'Add the fractions. Give a fraction as your answer.',labels:['Numerator','Denominator'],expected:[a+b,den],format:'fraction',hint:'The pieces are already the same size. Add the numerators and keep the denominator.',explanation:`${a}/${den} + ${b}/${den} = ${a+b}/${den}.`};}
  if(s.active==='unit_rate')return {id,expression:`${a*b} ÷ ${a}`,prompt:`${a} pens cost PHP ${a*b}. How much does one pen cost?`,labels:['Cost of one pen'],expected:[b],hint:`Divide the total cost by ${a}.`,explanation:`PHP ${a*b} ÷ ${a} = PHP ${b} per pen.`};
  if(s.active==='coordinates')return {id,expression:`P = (${a}, ${b})`,prompt:'Read point P. What are its x and y coordinates?',labels:['x coordinate','y coordinate'],expected:[a,b],graph:{kind:'point',x:a,y:b},hint:'Read across first for x, then up for y.',explanation:`Point P is ${a} units right and ${b} units up: (${a}, ${b}).`};
  if(s.active==='substitute'){const x=2+v%4;return {id,expression:`${a}(${x}) + ${b}`,prompt:'Work out this value.',labels:['Value'],expected:[a*x+b],hint:'Multiply first, then add.',explanation:`${a} × ${x} + ${b} = ${a*x+b}.`};}
  if (s.active === 'terms') return { id, expression: `${a}x + ${b}x`, prompt: 'Combine these like terms. What is the coefficient of x?', labels: ['Coefficient of x'], expected: [a+b], hint: 'The variable stays x. Add its coefficients.', explanation: `${a} groups of x and ${b} groups of x make ${a+b}x.` };
  if (s.active === 'expand') return { id, expression: `${a}(x + ${b})`, prompt: 'Fill the two coefficients after expanding.', labels: ['Coefficient of x', 'Constant'], expected: [a,a*b], hint: 'Multiply the outside number by every term inside.', explanation: `${a} × x + ${a} × ${b} = ${a}x + ${a*b}.`, widget: 'area' };
  if (s.active === 'distribute') return { id, expression: `(x + ${a})(x + ${b})`, prompt: 'Build the expanded expression.', labels: ['Coefficient of x²', 'Coefficient of x', 'Constant'], expected: [1,a+b,a*b], hint: 'There are four products: x·x, x·b, a·x, and a·b. Combine the middle two.', explanation: `x² + ${b}x + ${a}x + ${a*b} = x² + ${a+b}x + ${a*b}.`, widget: 'area' };
  if (s.active === 'factor') return { id, expression: `x² + ${a+b}x + ${a*b}`, prompt: `Find two numbers that add to ${a+b} and multiply to ${a*b}.`, labels: ['First factor number', 'Second factor number'], expected: [a,b], unordered: true, hint: `Your pair must multiply to ${a*b} AND add to ${a+b}.`, explanation: `(${a})(${b}) = ${a*b}, and ${a} + ${b} = ${a+b}. So the factors are (x + ${a})(x + ${b}).`, widget: 'factors' };
  if (s.active === 'zero') return { id, expression: `(x + ${a})(x + ${b}) = 0`, prompt: 'A product is zero when at least one factor is zero. Find both values of x.', labels: ['First solution', 'Second solution'], expected: [-a,-b], unordered: true, hint: `Set x + ${a} = 0, then x + ${b} = 0.`, explanation: `x = −${a} or x = −${b}. The positive numbers inside the factors are not the solutions.` };
  if (s.active === 'linear') return { id, expression: `${a}x = ${a*b}`, prompt: 'Keep both sides equal. What is x?', labels: ['Value of x'], expected: [b], hint: `Divide both sides by ${a}.`, explanation: `${a*b} ÷ ${a} = ${b}.` };
  if(s.topic==='fractions'){const d1=v===0?3:2+v%3,d2=v===0?4:5+Math.floor(v/3),n=v===0?2:1+v%2;return {id,expression:`\\frac{${n}}{${d1}} + \\frac{1}{${d2}}`,prompt:'Add the fractions. Equivalent fractions are accepted.',labels:['Numerator','Denominator'],expected:[n*d2+d1,d1*d2],format:'fraction',hint:`Use ${d1*d2} as a common denominator. Multiply the top and bottom of each fraction by the same number.`,explanation:`${n*d2}/${d1*d2} + ${d1}/${d1*d2} = ${n*d2+d1}/${d1*d2}.`};}
  if(s.topic==='ratios'){const qty=v===0?3:2+v%4,rate=v===0?8:5+Math.floor(v/4),want=v===0?5:qty+2+v%3;return {id,expression:`${qty} : ${qty*rate} = ${want} : x`,prompt:`${qty} pens cost PHP ${qty*rate}. At the same price, what do ${want} pens cost?`,labels:['Total cost'],expected:[want*rate],hint:'Find the cost of one pen, then multiply by the number you need.',explanation:`One pen costs PHP ${rate}. ${want} pens cost PHP ${want*rate}.`};}
  if(s.topic==='graphs'){const m=v===0?2:1+v%3,c=v===0?3:1+Math.floor(v/3),x=v===0?4:2+v%4;return {id,expression:`y = ${m}x + ${c}, x = ${x}`,prompt:`Read the line. What is y when x is ${x}?`,labels:['Value of y'],expected:[m*x+c],graph:{kind:'line',x,slope:m,intercept:c},hint:`Start at ${x} on the horizontal axis, move up to the line, then read across to the vertical axis.`,explanation:`At x = ${x}, the line has y = ${m*x+c}. The rule is y = ${m}x + ${c}.`};}
  if (s.topic === 'brackets') {
    if(v===0)return {id,expression:'3(x + 2) + 2x = 31',prompt:'Solve for x.',labels:['Value of x'],expected:[5],hint:'Expand first, combine the x terms, then isolate x.',explanation:'5x + 6 = 31. Subtract 6, then divide by 5: x = 5.'};
    const answer = 3+(v%7), c = 2;
    return { id, expression: `${a}(x + ${b}) + ${c}x = ${(a+c)*answer+a*b}`, prompt: 'Solve for x. You can use any valid method.', labels: ['Value of x'], expected: [answer], hint: 'Expand first, combine the x terms, then keep both sides equal as you isolate x.', explanation: `${a+c}x + ${a*b} = ${(a+c)*answer+a*b}. Subtract ${a*b}, then divide by ${a+c}: x = ${answer}.` };
  }
  // Initial problem is the recognizable classroom anchor; later numbers are genuinely fresh.
  const p = v === 0 ? 3 : a, q = v === 0 ? 4 : b;
  return { id, expression: `x² + ${p+q}x + ${p*q} = 0`, prompt: 'Find both values of x. Any valid solving method is welcome.', labels: ['First solution', 'Second solution'], expected: [-p,-q], unordered: true, hint: `Look for two numbers that multiply to ${p*q} and add to ${p+q}. Factor, then set each factor to zero.`, explanation: `(x + ${p})(x + ${q}) = 0, so x = −${p} or x = −${q}.` };
}
export function isCorrect(p: Problem, answers: string[]): boolean {
  if (answers.length !== p.expected.length) return false;
  const normalized = answers.map(x => x.trim().replace(/[−–－]/g, '-'));
  if (normalized.some(x => !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(x))) return false;
  const values = normalized.map(Number), expected = [...p.expected];
  if (values.some(x => !Number.isFinite(x))) return false;
  if(p.format==='fraction'){
    if(!values.every(Number.isSafeInteger)||values[1]===0)return false;
    const gcd=(a:number,b:number):number=>b===0?Math.abs(a):gcd(b,a%b);
    const simplify=([n,d]:number[])=>{const g=gcd(n,d),sign=d<0?-1:1;return [n/g*sign,d/g*sign];};
    const actual=simplify(values),target=simplify(expected);
    return actual.every((x,i)=>x===target[i]);
  }
  if (p.unordered) { values.sort((a,b)=>a-b); expected.sort((a,b)=>a-b); }
  return values.every((x,i)=>x===expected[i]);
}
export function recentSuccesses(s: Recovery, skill: Skill): number {
  let n=0; const seen = new Set<string>();
  for (const e of [...s.evidence].reverse()) {
    if (e.skill !== skill) continue;
    if (!e.correct || e.assisted) break;
    if(s.returnCheck && Number(e.id.split(':').at(-1))<(s.cycleStart??0))break;
    if (e.purpose !== (s.returnCheck ? 'return' : s.extension ? 'next' : 'route')) continue;
    if (!seen.has(e.id)) { n++; seen.add(e.id); }
  }
  return n;
}
export type RecoveryAction =
  | { type: 'start'; budget: number; mode: 'self'|'class'; now: number }
  | { type: 'submit'; answers: string[]; confidence: Confidence; now: number }
  | { type: 'continue'; now: number }
  | { type: 'hint'; now: number }
  | { type: 'learn'; now: number }
  | { type: 'expose'; serial: number; now: number }
  | { type: 'practice'; detail: string; now: number; advance?:1|2 }
  | { type: 'khan'; detail: string; now: number }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'next'; now: number }
  | { type: 'return'; now: number }
  | { type: 'restore'; state: Recovery }
  | { type: 'restart'; topic: Topic };
const add = <T,>(xs:T[],x:T) => xs.includes(x)?xs:[...xs,x];
export function recoveryReducer(prev: Recovery, action: RecoveryAction): Recovery {
  if (action.type==='restore') return validRecovery(action.state) ? action.state : prev;
  if (action.type==='restart') return initialRecovery(action.topic);
  const s = {...prev, updatedAt:action.now};
  if (action.type==='start') return {...s, budget: action.budget, mode:action.mode, phase:'check', blockLimit: action.budget<=5?1:action.budget<=15?3:action.budget<=30?6:10, startedAt:action.now};
  if (action.type==='hint' && s.phase==='check') return {...s, assisted:true};
  if (action.type==='learn') return {...s, phase:'learn', learned:add(s.learned,s.active)};
  if (action.type==='expose' && s.phase==='learn') return {...s,exposedUntil:Math.max(s.exposedUntil??0,action.serial)};
  if (action.type==='khan') return {...s, events:[...s.events,{kind:'khan_open',skill:s.active,at:action.now,detail:action.detail}]};
  if (action.type==='practice') return {...s, learned:add(s.learned,s.active), serial:Math.max(s.serial+(action.advance??1),(s.exposedUntil??-1)+1), assisted:false, phase:'check', events:[...s.events,{kind:action.detail==='self-reported'?'practice_report':'other_support',skill:s.active,at:action.now,detail:action.detail}]};
  if (action.type==='pause') return {...s, phase:'pause', next: s.phase==='feedback'||s.phase==='moment' ? s.next : s.phase==='pause'?s.next:s.phase, nextSkill:s.phase==='feedback'||s.phase==='moment'?s.nextSkill:s.active, events:[...s.events,{kind:'pause',skill:s.active,at:action.now}]};
  if (action.type==='resume') return {...s, phase:s.next==='pause'?'check':s.next, active:s.nextSkill, blockCount:0, events:[...s.events,{kind:'resume',skill:s.nextSkill,at:action.now}]};
  if (action.type==='return') {const fresh=Math.max(s.serial+1,(s.exposedUntil??-1)+1);return {...s, phase:'check', active:'goal', serial:fresh, cycleStart:fresh, returnCheck:true, extension:false, assisted:false, blockCount:0};}
  if (action.type==='next' && s.phase==='complete' && !s.extension) return {...s, phase:'check', active:NEXT_SKILL[s.topic], extension:true, returnCheck:false, serial:s.serial+1, blockCount:0, assisted:false, events:[...s.events,{kind:'next_turn',skill:NEXT_SKILL[s.topic],at:action.now}]};
  if (action.type==='continue' && (s.phase==='feedback'||s.phase==='moment')) {
    if (s.blockCount>=s.blockLimit && s.next!=='complete') return {...s,phase:'pause',blockCount:0};
    return {...s,phase:s.next,active:s.nextSkill,assisted:false};
  }
  if (action.type!=='submit' || s.phase!=='check') return prev;
  const p=problemFor(s), correct=isCorrect(p,action.answers);
  const ev:Attempt={id:p.id,skill:s.active,answer:action.answers,correct,assisted:s.assisted,confidence:action.confidence,at:action.now,purpose:s.returnCheck?'return':s.extension?'next':'route'};
  const n:Recovery={...s,evidence:[...s.evidence,ev],correct,phase:'feedback',next:'check',nextSkill:s.active,serial:s.serial+1,blockCount:s.blockCount+1};
  if (s.extension) return {...n,phase:'moment',next:'complete',message:correct?'One more step, demonstrated. Your route is saved.':'That next step can wait. Your earlier progress stays saved.'};
  if (!correct) {
    n.suspected=add(s.suspected,s.active);
    n.goalWasBlocked=s.goalWasBlocked||s.active==='goal';
    if(s.active==='goal' && s.returnCheck) { n.goalPassed=false; n.passed=s.passed.filter(x=>x!=='goal'); n.returnCheck=false; }
    const children=deps(s.active,s.topic).filter(x=>!n.passed.includes(x));
    n.planned=ORDER.filter(x=>new Set([...s.planned,...children]).has(x));
    const misses=n.evidence.filter(e=>e.skill===s.active&&!e.correct).length;
    if (action.confidence==='know' && misses===1) return {...n,nextSkill:s.active,message:'Let’s check a fresh example before changing your route.'};
    if ((action.confidence==='forgot'||action.confidence==='never') && s.active!=='goal') return {...n,next:misses>=3?'support':'learn',nextSkill:s.active,message:'A refresher first. Then fresh numbers.'};
    n.nextSkill=children[0]??s.active;
    n.next=misses>=3?'support':children.length?'check':'learn';
    if(misses>=3)n.nextSkill=s.active;
    n.message=children.length?`Recalculating. Let’s check ${LABELS[children[0]].toLowerCase()} before adding more practice.`:'This step needs support. Let’s work through it, then try fresh numbers.';
    return n;
  }
  if(s.assisted) return {...n,message:'That works with support. Try a fresh problem without the hint to check what stuck.'};
  if(recentSuccesses(n,s.active)<2) return {...n,message:action.confidence==='know'?'That works. One fresh check before the route moves.':'That works, even if it felt uncertain. Let’s check once more with new numbers.'};
  n.passed=add(n.passed,s.active);
  n.suspected=n.suspected.filter(x=>x!==s.active);
  if(s.active==='goal') return {...n,phase:'moment',next:'complete',goalPassed:true,message:s.returnCheck?'Still with you. You solved two fresh destination problems.':s.goalWasBlocked?'Back on track. Two fresh destination problems, solved without hints.':'You’re already on track. Two destination checks passed; this review route is unnecessary.'};
  n.phase='moment';
  // Untested foundations need not remain on this destination route after the
  // dependent skill is demonstrated. This does not mark those foundations mastered.
  const underneath=new Set<Skill>();
  const collect=(id:Skill)=>{for(const child of deps(id,s.topic)){if(!underneath.has(child)){underneath.add(child);collect(child);}}};
  collect(s.active);
  n.planned=n.planned.filter(id=>!underneath.has(id)||n.suspected.includes(id)||n.passed.includes(id));
  n.message=s.learned.includes(s.active)?`New capability. You demonstrated ${LABELS[s.active].toLowerCase()} on two fresh checks.`:`Shortcut found. ${LABELS[s.active]} review removed after two fresh checks.`;
  n.nextSkill=n.planned.find(x=>!n.passed.includes(x))??'goal';
  n.next='check';
  return n;
}
export function validRecovery(value: unknown): value is Recovery {
  if(!value||typeof value!=='object')return false;
  const s=value as Recovery;
  const skills=new Set(ORDER), phases=new Set(['setup','check','feedback','learn','moment','pause','complete','return','support']);
  return s.version===1 && Object.keys(TOPICS).includes(s.topic) && ['self','class'].includes(s.mode) && phases.has(s.phase) && phases.has(s.next) && skills.has(s.active) && skills.has(s.nextSkill)
    && ['serial','budget','blockCount','blockLimit','startedAt','updatedAt'].every(k=>typeof s[k as keyof Recovery]==='number'&&Number.isFinite(s[k as keyof Recovery]))
    && Number.isInteger(s.serial) && s.serial>=0 && s.serial<100000 && [5,15,30,60].includes(s.budget) && s.blockLimit>0 && s.blockCount>=0 && (s.cycleStart===undefined||(Number.isInteger(s.cycleStart)&&s.cycleStart>=0)) && ['planned','passed','learned','suspected'].every(k=>Array.isArray(s[k as keyof Recovery])&&(s[k as keyof Recovery] as Skill[]).every(x=>skills.has(x)))
    && ['assisted','goalPassed','goalWasBlocked','returnCheck','extension'].every(k=>typeof s[k as keyof Recovery]==='boolean')
    && (s.exposedUntil===undefined||(Number.isInteger(s.exposedUntil)&&s.exposedUntil>=0&&s.exposedUntil<100000))
    && typeof s.message==='string' && Array.isArray(s.evidence)&&s.evidence.length<2000&&s.evidence.every(e=>typeof e.id==='string'&&skills.has(e.skill)&&Array.isArray(e.answer)&&e.answer.every(x=>typeof x==='string')&&typeof e.correct==='boolean'&&typeof e.assisted==='boolean'&&Number.isFinite(e.at)&&['know','unsure','forgot','never'].includes(e.confidence)&&['route','return','next'].includes(e.purpose))
    && Array.isArray(s.events)&&s.events.length<5000&&s.events.every(e=>skills.has(e.skill)&&typeof e.kind==='string'&&Number.isFinite(e.at));
}
