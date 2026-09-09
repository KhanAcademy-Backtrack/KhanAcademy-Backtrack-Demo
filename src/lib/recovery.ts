/** A transparent, deterministic routing policy. Evidence is task-specific, never a placement decision. */
export type Topic = 'quadratics' | 'brackets';
export type Skill = 'terms' | 'expand' | 'distribute' | 'factor' | 'zero' | 'linear' | 'goal';
export type Confidence = 'know' | 'unsure' | 'forgot' | 'never';
export type Phase = 'setup' | 'check' | 'feedback' | 'learn' | 'moment' | 'pause' | 'complete' | 'return' | 'support';
export type Attempt = { id: string; skill: Skill; answer: string[]; correct: boolean; assisted: boolean; confidence: Confidence; at: number; purpose: 'route' | 'return' | 'next' };
export type Event = { kind: 'khan_open' | 'practice_report' | 'other_support' | 'pause' | 'resume' | 'next_turn'; skill: Skill; at: number; detail?: string };
export type Recovery = {
  version: 1; topic: Topic; mode: 'self' | 'class'; budget: number; phase: Phase;
  active: Skill; planned: Skill[]; passed: Skill[]; learned: Skill[]; suspected: Skill[];
  evidence: Attempt[]; events: Event[]; serial: number; assisted: boolean;
  correct: boolean | null; message: string; next: Phase; nextSkill: Skill;
  startedAt: number; updatedAt: number; blockCount: number; blockLimit: number;
  goalPassed: boolean; goalWasBlocked: boolean; returnCheck: boolean; extension: boolean;
  cycleStart?: number;
};
export const LABELS: Record<Skill, string> = {
  terms: 'Like terms', expand: 'Expand brackets', distribute: 'Multiply brackets',
  factor: 'Find the factors', zero: 'Set each factor to zero', linear: 'Undo multiplication', goal: 'Your destination',
};
export const TOPICS = {
  quadratics: { label: 'Quadratic equations', goal: 'Solve a quadratic', example: 'x² + 7x + 12 = 0', description: 'Find the factors. Find both solutions.', path: ['factor', 'zero', 'goal'] as Skill[] },
  brackets: { label: 'Equations with brackets', goal: 'Solve an equation with brackets', example: '3(x + 2) + 2x = 31', description: 'Open the brackets. Bring the equation together.', path: ['expand', 'linear', 'goal'] as Skill[] },
};
export function initialRecovery(topic: Topic = 'quadratics'): Recovery {
  return { version: 1, topic, mode: 'self', budget: 15, phase: 'setup', active: 'goal', planned: [...TOPICS[topic].path], passed: [], learned: [], suspected: [], evidence: [], events: [], serial: 0, assisted: false, correct: null, message: '', next: 'check', nextSkill: 'goal', startedAt: 0, updatedAt: 0, blockCount: 0, blockLimit: 3, goalPassed: false, goalWasBlocked: false, returnCheck: false, extension: false };
}
const deps = (skill: Skill, topic: Topic): Skill[] => skill === 'goal' ? TOPICS[topic].path.filter(x => x !== 'goal') : skill === 'factor' ? ['distribute'] : skill === 'distribute' || skill === 'expand' ? ['terms'] : [];
export const ORDER: Skill[] = ['terms', 'expand', 'distribute', 'factor', 'zero', 'linear', 'goal'];
export type Problem = { id: string; expression: string; prompt: string; labels: string[]; expected: number[]; unordered?: boolean; hint: string; explanation: string; widget?: 'factors' | 'area' };
export function problemFor(s: Recovery): Problem {
  const v = s.serial;
  // Serial is monotonic across the entire route, so exposed problems are never reused as fresh evidence.
  const a = 2 + (v % 5), b = 7 + Math.floor(v / 5);
  const id = `${s.topic}:${s.active}:${v}`;
  if (s.active === 'terms') return { id, expression: `${a}x + ${b}x`, prompt: 'Combine these like terms. What is the coefficient of x?', labels: ['Coefficient of x'], expected: [a+b], hint: 'The variable stays x. Add its coefficients.', explanation: `${a} groups of x and ${b} groups of x make ${a+b}x.` };
  if (s.active === 'expand') return { id, expression: `${a}(x + ${b})`, prompt: 'Fill the two coefficients after expanding.', labels: ['Coefficient of x', 'Constant'], expected: [a,a*b], hint: 'Multiply the outside number by every term inside.', explanation: `${a} × x + ${a} × ${b} = ${a}x + ${a*b}.`, widget: 'area' };
  if (s.active === 'distribute') return { id, expression: `(x + ${a})(x + ${b})`, prompt: 'Build the expanded expression.', labels: ['Coefficient of x²', 'Coefficient of x', 'Constant'], expected: [1,a+b,a*b], hint: 'There are four products: x·x, x·b, a·x, and a·b. Combine the middle two.', explanation: `x² + ${b}x + ${a}x + ${a*b} = x² + ${a+b}x + ${a*b}.`, widget: 'area' };
  if (s.active === 'factor') return { id, expression: `x² + ${a+b}x + ${a*b}`, prompt: `Find two numbers that add to ${a+b} and multiply to ${a*b}.`, labels: ['First factor number', 'Second factor number'], expected: [a,b], unordered: true, hint: `Your pair must multiply to ${a*b} AND add to ${a+b}.`, explanation: `(${a})(${b}) = ${a*b}, and ${a} + ${b} = ${a+b}. So the factors are (x + ${a})(x + ${b}).`, widget: 'factors' };
  if (s.active === 'zero') return { id, expression: `(x + ${a})(x + ${b}) = 0`, prompt: 'A product is zero when at least one factor is zero. Find both values of x.', labels: ['First solution', 'Second solution'], expected: [-a,-b], unordered: true, hint: `Set x + ${a} = 0, then x + ${b} = 0.`, explanation: `x = −${a} or x = −${b}. The positive numbers inside the factors are not the solutions.` };
  if (s.active === 'linear') return { id, expression: `${a}x = ${a*b}`, prompt: 'Keep both sides equal. What is x?', labels: ['Value of x'], expected: [b], hint: `Divide both sides by ${a}.`, explanation: `${a*b} ÷ ${a} = ${b}.` };
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
  | { type: 'practice'; detail: string; now: number }
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
  if (action.type==='khan') return {...s, events:[...s.events,{kind:'khan_open',skill:s.active,at:action.now,detail:action.detail}]};
  if (action.type==='practice') return {...s, learned:add(s.learned,s.active), serial:s.serial+1, assisted:false, phase:'check', events:[...s.events,{kind:action.detail==='other'?'other_support':'practice_report',skill:s.active,at:action.now,detail:action.detail}]};
  if (action.type==='pause') return {...s, phase:'pause', next: s.phase==='feedback'||s.phase==='moment' ? s.next : s.phase==='pause'?s.next:s.phase, nextSkill:s.phase==='feedback'||s.phase==='moment'?s.nextSkill:s.active, events:[...s.events,{kind:'pause',skill:s.active,at:action.now}]};
  if (action.type==='resume') return {...s, phase:s.next==='pause'?'check':s.next, active:s.nextSkill, blockCount:0, events:[...s.events,{kind:'resume',skill:s.nextSkill,at:action.now}]};
  if (action.type==='return') return {...s, phase:'check', active:'goal', serial:s.serial+1, cycleStart:s.serial+1, returnCheck:true, extension:false, assisted:false, blockCount:0};
  if (action.type==='next' && s.phase==='complete' && !s.extension) return {...s, phase:'check', active:s.topic==='quadratics'?'factor':'expand', extension:true, returnCheck:false, serial:s.serial+1, blockCount:0, assisted:false, events:[...s.events,{kind:'next_turn',skill:s.topic==='quadratics'?'factor':'expand',at:action.now}]};
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
    && typeof s.message==='string' && Array.isArray(s.evidence)&&s.evidence.length<2000&&s.evidence.every(e=>typeof e.id==='string'&&skills.has(e.skill)&&Array.isArray(e.answer)&&e.answer.every(x=>typeof x==='string')&&typeof e.correct==='boolean'&&typeof e.assisted==='boolean'&&Number.isFinite(e.at)&&['know','unsure','forgot','never'].includes(e.confidence)&&['route','return','next'].includes(e.purpose))
    && Array.isArray(s.events)&&s.events.length<5000&&s.events.every(e=>skills.has(e.skill)&&typeof e.kind==='string'&&Number.isFinite(e.at));
}
