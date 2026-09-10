import {diagnosticCheck,supportAfterProbe} from './diagnostic-checks.ts';
import {mathsFamily} from './maths-families.ts';
import {validLab,type LabSave} from './visual-maths.ts';
import {scienceProblem} from './science.ts';
/** A transparent, deterministic routing policy. Evidence is task-specific, never a placement decision. */
export type Topic = 'quadratics' | 'brackets' | 'fractions' | 'ratios' | 'graphs' | 'moles' | 'balancing' | 'motion' | 'forces';
export type Subject = 'maths' | 'chemistry' | 'physics';
export type Skill = 'multiply' | 'equivalent' | 'same_denominator' | 'unit_rate' | 'coordinates' | 'substitute' | 'terms' | 'expand' | 'distribute' | 'factor' | 'zero' | 'linear' | 'atom_count' | 'formula_mass' | 'unit_convert' | 'net_force' | 'goal';
export type Confidence = 'know' | 'unsure' | 'forgot' | 'never';
export type Phase = 'setup' | 'check' | 'feedback' | 'learn' | 'moment' | 'pause' | 'complete' | 'return' | 'support';
export type Attempt = { id: string; skill: Skill; answer: string[]; correct: boolean; assisted: boolean; confidence: Confidence; at: number; purpose: 'route' | 'return' | 'next';problemVersion?:1|2|3; expression?:string; family?:string; classification?:'assisted'|'fresh-independent'|'later-retrieval' };
export type Event = { kind: 'khan_open' | 'khan_feedback' | 'practice_report' | 'other_support' | 'pause' | 'resume' | 'next_turn' | 'visual_prediction' | 'reflection' | 'counterfactual'; skill: Skill; at: number; detail?: string };
export type Recovery = {
  problemVersion?:2|3;
  helpQuestion?:string;
  labs?:Record<string,LabSave>;
  draft?:{id:string;answers:string[];confidence:Confidence};
  original?:{id:string;prompt:string;expression:string;answer:string[];confidence:Confidence;assisted:boolean};
  probes?:number;
  exposedPairs?:string[];
  sharedSerialFloor?:number;
  cycleSkill?:Skill;
  destinationSkill?:Skill;
  goalTitle?:string;
  goalExpression?:string;
  studyTaskId?:string;
  exposedUntil?: number;
  routeClue?: {skill:Skill;message:string;serial:number};
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
  factor: 'Find the factors', zero: 'Set each factor to zero', linear: 'Undo multiplication',
  atom_count: 'Atoms in a formula', formula_mass: 'Formula mass', unit_convert: 'Unit conversion', net_force: 'Forces on a line',
  goal: 'Your destination',
};
export type TopicMeta = {label:string;goal:string;example:string;description:string;path:Skill[];subject:Subject;speak?:string};
/** Typing the record makes TypeScript keep the Topic union and this table in step. */
export const TOPICS:Record<Topic,TopicMeta> = {
  quadratics: { label: 'Quadratic equations', goal: 'Solve a quadratic', example: 'x² + 7x + 12 = 0', description: 'Find the factors. Find both solutions.', path: ['factor', 'zero', 'goal'] as Skill[],subject:'maths' },
  brackets: { label: 'Equations with brackets', goal: 'Solve an equation with brackets', example: '3(x + 2) + 2x = 31', description: 'Open the brackets. Bring the equation together.', path: ['expand', 'linear', 'goal'] as Skill[],subject:'maths' },
  fractions: {label:'Adding fractions',goal:'Add fractions with different denominators',example:'\\frac{2}{3} + \\frac{1}{4}',description:'Make the parts match. Add what you have.',path:['equivalent','same_denominator','goal'] as Skill[],subject:'maths'},
  ratios: {label:'Ratios and unit rates',goal:'Solve a proportion',example:'3 : 24 = 5 : x',description:'Find the amount for one. Scale it up.',path:['unit_rate','goal'] as Skill[],subject:'maths'},
  graphs: {label:'Reading linear graphs',goal:'Read a value from a graph',example:'y = 2x + 3',description:'Find the point. Connect the graph to its rule.',path:['coordinates','substitute','goal'] as Skill[],subject:'maths'},
  moles: {label:'Moles and mass',goal:'Find an amount in moles',example:'n = \\frac{m}{M}',description:'Count what a formula holds. Turn grams into moles.',path:['formula_mass','goal'] as Skill[],subject:'chemistry',speak:'n equals m over M'},
  balancing: {label:'Balancing equations',goal:'Balance a chemical equation',example:'\\mathrm{CH_{4}} + 2\\,\\mathrm{O_{2}} → \\mathrm{CO_{2}} + 2\\,\\mathrm{H_{2}O}',description:'Keep every atom accounted for on both sides.',path:['atom_count','goal'] as Skill[],subject:'chemistry',speak:'C H 4 plus 2 O 2 yields C O 2 plus 2 H 2 O'},
  motion: {label:'Motion and speed',goal:'Find a final speed',example:'v = u + at',description:'Read the units. Add what the acceleration builds up.',path:['unit_convert','substitute','goal'] as Skill[],subject:'physics',speak:'v equals u plus a t'},
  forces: {label:'Forces and acceleration',goal:'Use F = ma in either direction',example:'F = ma',description:'Combine the forces. Rearrange for what is missing.',path:['net_force','substitute','goal'] as Skill[],subject:'physics',speak:'F equals m a'},
};
export const subjectOf=(t:Topic):Subject=>TOPICS[t].subject;
export function initialRecovery(topic: Topic = 'quadratics'): Recovery {
  return { version: 1, problemVersion:3, exposedPairs:[], topic, mode: 'self', budget: 15, phase: 'setup', active: 'goal', planned: [...TOPICS[topic].path], passed: [], learned: [], suspected: [], evidence: [], events: [], serial: 0, assisted: false, correct: null, message: '', next: 'check', nextSkill: 'goal', startedAt: 0, updatedAt: 0, blockCount: 0, blockLimit: 3, goalPassed: false, goalWasBlocked: false, returnCheck: false, extension: false };
}
export const skillDependencies = (skill: Skill, topic: Topic): Skill[] => skill === 'goal' ? TOPICS[topic].path.filter(x => x !== 'goal') : skill === 'factor' ? ['distribute'] : skill === 'distribute' || skill === 'expand' ? ['terms'] : skill === 'formula_mass' ? ['atom_count'] : ['equivalent','unit_rate','substitute','unit_convert'].includes(skill)?['multiply']:[];
const deps=skillDependencies;
export const ORDER: Skill[] = ['multiply','equivalent','same_denominator','unit_rate','coordinates','substitute','terms', 'expand', 'distribute', 'factor', 'zero', 'linear', 'atom_count','formula_mass','unit_convert','net_force', 'goal'];
export const NEXT_SKILL:Record<Topic,Skill>={quadratics:'factor',brackets:'expand',fractions:'equivalent',ratios:'unit_rate',graphs:'substitute',moles:'formula_mass',balancing:'atom_count',motion:'unit_convert',forces:'net_force'};
export type GraphData={kind:'point'|'line';x:number;y?:number;slope?:number;intercept?:number};
/** Units live in the label and beside the input, never inside the answer box. A choice field submits its option index, so every answer stays numeric. */
export type AnswerField = { label: string; kind?: 'number' | 'choice'; unit?: string; options?: string[] };
export type Problem = { family?:string; id: string; expression: string; prompt: string; labels: string[]; expected: number[]; unordered?: boolean; format?:'fraction'; graph?:GraphData; hint: string; explanation: string; widget?: 'factors' | 'area'; factorPair?:[number,number]; zeroFactor?:number;
  /** Aligns index-for-index with labels and expected. Absent means every field is a plain number. */
  fields?: AnswerField[]; tolerance?: number; decimals?: number; speak?: string };
export function signedTerm(n:number,variable=''){return n===0?'':` ${n<0?'−':'+'} ${Math.abs(n)===1&&variable?'':Math.abs(n)}${variable}`;}
export function factorText(n:number){return `(x${signedTerm(n)})`;}
export function quadraticText(p:number,q:number){return `x²${signedTerm(p+q,'x')}${signedTerm(p*q)}`;}
export function quadraticPair(serial:number):[number,number]{
  const a=2+serial%5,b=7+Math.floor(serial/5);
  return serial%3===1?[-a,-b]:serial%3===2?[a,-b]:[a,b];
}
/** Input errors do not become mathematics evidence. Blank "I don't know" is handled separately. */
export function answerInputIssue(p:Problem,answers:string[]):string|undefined{
  if(answers.length!==p.expected.length)return 'Enter one number in each box. Your answer has not been assessed yet.';
  const clean=answers.map(x=>x.trim().replace(/[−–－]/g,'-'));
  if(clean.some(x=>!x||x.length>40||!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(x)||!Number.isFinite(Number(x))))return 'Enter one number in each box. Your answer has not been assessed yet.';
  if(p.format==='fraction'&&Number(clean[1])===0)return 'A denominator cannot be zero. Enter a valid fraction first.';
}
export function problemFor(s: Recovery): Problem {
  const v = s.serial;
  // Serial is monotonic across the entire route, so exposed problems are never reused as fresh evidence.
  const a = 2 + (v % 5), b = 7 + Math.floor(v / 5);
  const id = `${s.topic}:${s.active}:${v}`;
  const science=scienceProblem(s.topic,s.active,v,id);
  if(science)return science;
  const diagnostic=diagnosticCheck(s);if(diagnostic)return diagnostic;
  if(s.problemVersion===3&&!(s.routeClue?.serial===v-1&&s.routeClue?.skill===s.active)){const family=mathsFamily(s);if(family)return family;}
  let [p,q]=s.problemVersion!==undefined?quadraticPair(v):[a,b];
  const firstClue=s.problemVersion!==undefined&&s.routeClue?.serial===v-1&&s.routeClue?.skill===s.active;
  if(s.active==='factor'&&firstClue){p=4;q=5;}
  if(s.active==='multiply')return {id,expression:`${a} × ${b}`,prompt:'What is the product?',labels:['Product'],expected:[a*b],hint:`Think of ${a} equal groups of ${b}.`,explanation:`${a} × ${b} = ${a*b}.`};
  if(s.active==='equivalent'){const n=1+v%3,d=n+2+Math.floor(v/3),k=2+v%4;return {id,expression:`\\frac{${n}}{${d}} = \\frac{x}{${d*k}}`,prompt:'Fill the missing numerator.',labels:['Missing numerator'],expected:[n*k],hint:`The denominator was multiplied by ${k}. Do the same to the numerator.`,explanation:`${n}/${d} = ${n*k}/${d*k}. Both numbers scale by ${k}.`};}
  if(s.active==='same_denominator'){const den=a+b+1;return {id,expression:`\\frac{${a}}{${den}} + \\frac{${b}}{${den}}`,prompt:'Add the fractions. Give a fraction as your answer.',labels:['Numerator','Denominator'],expected:[a+b,den],format:'fraction',hint:'The pieces are already the same size. Add the numerators and keep the denominator.',explanation:`${a}/${den} + ${b}/${den} = ${a+b}/${den}.`};}
  if(s.active==='unit_rate')return {id,expression:`${a*b} ÷ ${a}`,prompt:`${a} pens cost PHP ${a*b}. How much does one pen cost?`,labels:['Cost of one pen'],expected:[b],hint:`Divide the total cost by ${a}.`,explanation:`PHP ${a*b} ÷ ${a} = PHP ${b} per pen.`};
  if(s.active==='coordinates')return {id,expression:`P = (${a}, ${b})`,prompt:'Read point P. What are its x and y coordinates?',labels:['x coordinate','y coordinate'],expected:[a,b],graph:{kind:'point',x:a,y:b},hint:'Read across first for x, then up for y.',explanation:`Point P is ${a} units right and ${b} units up: (${a}, ${b}).`};
  if(s.active==='substitute'){const x=2+v%4;return {id,expression:`${a}(${x}) + ${b}`,prompt:'Work out this value.',labels:['Value'],expected:[a*x+b],hint:'Multiply first, then add.',explanation:`${a} × ${x} + ${b} = ${a*x+b}.`};}
  if (s.active === 'terms') return { id, expression: `${a}x + ${b}x`, prompt: 'Combine these like terms. What is the coefficient of x?', labels: ['Coefficient of x'], expected: [a+b], hint: 'The variable stays x. Add its coefficients.', explanation: `${a} groups of x and ${b} groups of x make ${a+b}x.` };
  if (s.active === 'expand') return { id, expression: `${a}(x + ${b})`, prompt: 'Fill the two coefficients after expanding.', labels: ['Coefficient of x', 'Constant'], expected: [a,a*b], hint: 'Multiply the outside number by every term inside.', explanation: `${a} × x + ${a} × ${b} = ${a}x + ${a*b}.`, widget: 'area' };
  if (s.active === 'distribute') return { id, expression: `${factorText(p)}${factorText(q)}`, prompt: 'Build the expanded expression.', labels: ['Coefficient of x²', 'Coefficient of x', 'Constant'], expected: [1,p+q,p*q], factorPair:[p,q], hint: 'Multiply all four pairs, keeping their signs. Combine the two x terms.', explanation: `x²${signedTerm(q,'x')}${signedTerm(p,'x')}${signedTerm(p*q)} = ${quadraticText(p,q)}.`, widget: 'area' };
  if (s.active === 'factor') return { id, expression: quadraticText(p,q), prompt: `Find two numbers that add to ${p+q} and multiply to ${p*q}.`, labels: ['First factor number', 'Second factor number'], expected: [p,q], factorPair:[p,q], unordered: true, hint: `Match both conditions: product ${p*q} and sum ${p+q}. Negative numbers are allowed.`, explanation: `(${p}) × (${q}) = ${p*q}; (${p}) + (${q}) = ${p+q}. So ${quadraticText(p,q)} = ${factorText(p)}${factorText(q)}.`, widget: 'factors' };
  if(s.active==='zero'&&firstClue){const n=5+(s.routeClue?.serial??0);return {id,expression:`x + ${n} = 0`,prompt:'Which value of x makes this factor zero?',labels:['Value of x'],expected:[-n],zeroFactor:n,hint:`Find the number that adds to ${n} to make zero.`,explanation:`−${n} + ${n} = 0, so x = −${n}.`};}
  if (s.active === 'zero') return { id, expression: `${factorText(p)}${factorText(q)} = 0`, prompt: 'Which values of x make this product zero?', labels: ['First solution', 'Second solution'], expected: [-p,-q], factorPair:[p,q], unordered: true, hint: `At least one factor must be zero. Solve x${signedTerm(p)} = 0 and x${signedTerm(q)} = 0 separately.`, explanation: `x = ${-p} or x = ${-q}. Each solution makes at least one factor zero.` };
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
  if(v===0){p=3;q=4;}
  return { id, expression: `${quadraticText(p,q)} = 0`, prompt: 'Find both values of x. Any valid solving method is welcome.', labels: ['First solution', 'Second solution'], expected: [-p,-q], factorPair:[p,q], unordered: true, hint: `Look for two numbers that multiply to ${p*q} and add to ${p+q}. Factor, then set each factor to zero.`, explanation: `${factorText(p)}${factorText(q)} = 0, so x = ${-p} or x = ${-q}.` };
}
export function isCorrect(p: Problem, answers: string[]): boolean {
  if (answers.length !== p.expected.length) return false;
  const normalized = answers.map(x => x.trim().replace(/[−–－]/g, '-'));
  if (normalized.some(x => !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(x))) return false;
  const values = normalized.map(Number), expected = [...p.expected];
  if (values.some(x => !Number.isFinite(x))) return false;
  if(p.format==='fraction'){
    const exact=(value:string)=>{const sign=value.startsWith('-')?-1:1;const [whole,decimal='']=value.replace(/^[+-]/,'').split('.');return {n:BigInt((whole||'0')+decimal)*BigInt(sign),d:BigInt(10)**BigInt(decimal.length)};};
    const n=exact(normalized[0]),d=exact(normalized[1]);
    return d.n!==BigInt(0)&&n.n*d.d*BigInt(expected[1])===d.n*n.d*BigInt(expected[0]);
  }
  // A declared tolerance accepts an answer within one unit of the last required decimal place.
  if(p.tolerance!==undefined&&!p.unordered)return values.every((x,i)=>Math.abs(x-expected[i])<=p.tolerance!+1e-9);
  if (p.unordered) { values.sort((a,b)=>a-b); expected.sort((a,b)=>a-b); }
  return values.every((x,i)=>x===expected[i]);
}
export function wrongTurnClue(s:Recovery,p:Problem,answers:string[]):{skill:Skill;message:string}|undefined {
  if(s.active==='expand'&&answers.length===2&&!isCorrect(p,answers)){const [a,b]=p.expected;if(Number(answers[0])===a&&Number(answers[1])!==b)return {skill:p.expression.startsWith('-')||p.expression.includes('−')?'multiply':'expand',message:'The outside coefficient is in place. Let’s check whether every group contributes before choosing arithmetic or sign support.'};}
  if(s.active!=='goal'||answers.some(x=>!x.trim())||isCorrect(p,answers))return;
  const clean=answers.map(x=>x.trim().replace(/[−–－]/g,'-'));
  if(clean.some(x=>!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(x)))return;
  const values=clean.map(Number);
  if(values.some(x=>!Number.isFinite(x)))return;
  if(s.topic==='quadratics'&&values.length===2){
    const actual=values.map(Math.abs).sort((a,b)=>a-b),factors=p.expected.map(Math.abs).sort((a,b)=>a-b);
    if(actual.every((x,i)=>x===factors[i]))return {skill:'zero',message:'Let’s check how factors become solutions. This next question will help us see whether that step needs work.'};
    if(actual[0]*actual[1]===factors[0]*factors[1]||actual[0]+actual[1]===factors[0]+factors[1])return {skill:'factor',message:'Let’s check the factor pair. Its sum and product must both fit; this next question will help us investigate.'};
  }
  if(s.topic==='graphs')return {skill:'coordinates',message:'A graph answer can involve reading axes, the starting value, or rate. Let’s check the axes first; you can choose another bridge.'};
  if(s.topic==='ratios')return {skill:'unit_rate',message:'Let’s check the amount for one. This helps separate additive reasoning from scaling; one answer cannot tell us the cause.'};
  if(s.topic==='brackets')return {skill:'expand',message:'Let’s try distributing first. This checks whether every term was included before looking at the later arithmetic.'};
  if(s.topic==='fractions'){
    const fractions=[...p.expression.matchAll(/\\frac\{(\d+)\}\{(\d+)\}/g)];
    if(fractions.length===2){
      const wrong=[Number(fractions[0][1])+Number(fractions[1][1]),Number(fractions[0][2])+Number(fractions[1][2])];
      if(isCorrect({...p,expected:wrong},answers))return {skill:'same_denominator',message:'Adding the denominators changes the size of the parts. Let’s check equal-sized parts first.'};
    }
  }
}
export function recentSuccesses(s: Recovery, skill: Skill): number {
  let n=0; const seen = new Set<string>();
  for (const e of [...s.evidence].reverse()) {
    if (e.skill !== skill) continue;
    if (!e.correct || e.assisted) break;
    if((s.returnCheck||s.cycleSkill===skill) && Number(e.id.split(':').at(-1))<(s.cycleStart??0))break;
    if (e.purpose !== (s.returnCheck ? 'return' : s.extension ? 'next' : 'route')) continue;
    if (!seen.has(e.id)) { n++; seen.add(e.id); }
  }
  return n;
}
export const pairKey=(pair:number[])=>[...pair].sort((a,b)=>a-b).join(',');
export function nextFreshSerial(s:Recovery,start:number,skill:Skill=s.active):number{
  let serial=Math.max(start,(s.exposedUntil??-1)+1,s.sharedSerialFloor??0);
  for(let i=0;i<2001;i++,serial++){
    const p=problemFor({...s,active:skill,serial});
    if(!p.factorPair||!s.exposedPairs?.includes(pairKey(p.factorPair)))return serial;
  }
  return serial;
}
export type RecoveryAction =
  | {type:'help-question';text:string;now:number}
  | {type:'lab-save';key:string;value:LabSave;now:number}
  | {type:'learning-event';kind:'visual_prediction'|'reflection'|'counterfactual';detail:string;now:number}
  | {type:'draft';id:string;answers:string[];confidence:Confidence;now:number}
  | { type: 'start'; budget: number; mode: 'self'|'class'; now: number }
  | { type: 'submit'; answers: string[]; confidence: Confidence; now: number }
  | { type: 'continue'; now: number }
  | { type: 'hint'; now: number }
  | { type: 'learn'; now: number; skill?:Skill }
  | { type: 'expose'; serial: number; now: number }
  | { type: 'expose-pair'; pair:[number,number]; now: number }
  | { type: 'shared-context'; floor:number;pairs:string[];used?:string[];now:number }
  | { type: 'practice'; detail: string; now: number; advance?:1|2 }
  | { type: 'khan'; detail: string; now: number }
  | { type: 'report-practice'; detail: string; now: number }
  | { type: 'khan-feedback'; response:'completed'|'difficulty'|'access';now:number }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'next'; now: number }
  | { type: 'return'; now: number }
  | { type: 'rehearsal-next'; now:number }
  | { type: 'restore'; state: Recovery }
  | { type: 'restart'; topic: Topic };
const add = <T,>(xs:T[],x:T) => xs.includes(x)?xs:[...xs,x];
export function recoveryReducer(prev: Recovery, action: RecoveryAction): Recovery {
  if (action.type==='restore') return validRecovery(action.state) ? action.state : prev;
  if (action.type==='restart') return initialRecovery(action.topic);
  if(action.type==='shared-context'){const floor=Math.max(prev.sharedSerialFloor??0,action.floor),pairs=[...new Set([...(prev.exposedPairs??[]),...action.pairs])];const p=prev.phase==='check'?problemFor(prev):undefined;const known=!!p&&((!!p.factorPair&&action.pairs.includes(pairKey(p.factorPair)))||!!action.used?.includes(`${prev.active==='goal'?`${prev.topic}:goal`:`skill:${prev.active}`}:${p.expression}`));if(floor===(prev.sharedSerialFloor??0)&&pairs.length===(prev.exposedPairs?.length??0)&&(!known||prev.assisted))return prev;return {...prev,sharedSerialFloor:floor,exposedPairs:pairs,assisted:prev.assisted||known};}
  const s = {...prev, updatedAt:action.now};
  if(action.type==='help-question')return {...s,helpQuestion:action.text.slice(0,1000)};
  if(action.type==='lab-save')return validLab(action.value)&&/^[a-z]+$/.test(action.key)?{...s,labs:{...s.labs,[action.key]:action.value}}:prev;
  if(action.type==='learning-event')return {...s,events:[...s.events,{kind:action.kind,skill:s.active,at:action.now,detail:action.detail.slice(0,1500)}].slice(-4000)};
  if(action.type==='draft')return {...s,draft:{id:action.id,answers:action.answers,confidence:action.confidence}};
  if (action.type==='start') return {...s, serial:nextFreshSerial(s,s.serial),budget: action.budget, mode:action.mode, phase:'check', blockLimit: action.budget<=5?1:action.budget<=15?3:action.budget<=30?6:10, startedAt:action.now};
  if (action.type==='hint' && s.phase==='check') return {...s, assisted:true};
  if (action.type==='learn') {const skill=action.skill??s.active;return {...s, active:skill, phase:'learn', learned:add(s.learned,skill)};}
  if (action.type==='expose' && s.phase==='learn') return {...s,exposedUntil:Math.max(s.exposedUntil??0,action.serial)};
  if(action.type==='expose-pair'&&s.phase==='learn'){
    if(!action.pair.every(Number.isFinite))return prev;
    const key=pairKey(action.pair);if(s.exposedPairs?.includes(key))return prev;
    return {...s,exposedPairs:[...(s.exposedPairs??[]),key]};
  }
  if (action.type==='khan') return {...s, events:[...s.events,{kind:'khan_open',skill:s.active,at:action.now,detail:action.detail}]};
  if (action.type==='report-practice') return {...s,events:[...s.events,{kind:'practice_report',skill:s.active,at:action.now,detail:action.detail}]};
  if (action.type==='khan-feedback')return {...s,events:[...s.events,{kind:'khan_feedback',skill:s.active,at:action.now,detail:action.response}]};
  if (action.type==='practice') return {...s, learned:add(s.learned,s.active), serial:nextFreshSerial(s,s.serial+(action.advance??1)), assisted:false, phase:'check', events:[...s.events,{kind:action.detail==='self-reported'?'practice_report':'other_support',skill:s.active,at:action.now,detail:action.detail}]};
  if (action.type==='pause') return {...s, phase:'pause', next: s.phase==='feedback'||s.phase==='moment' ? s.next : s.phase==='pause'?s.next:s.phase, nextSkill:s.phase==='feedback'||s.phase==='moment'?s.nextSkill:s.active, events:[...s.events,{kind:'pause',skill:s.active,at:action.now}]};
  if (action.type==='resume') {const phase=s.next==='pause'?'check':s.next;return {...s, phase, active:s.nextSkill,serial:phase==='check'&&s.draft?.id!==`${s.topic}:${s.nextSkill}:${s.serial}`?nextFreshSerial(s,s.serial,s.nextSkill):s.serial, blockCount:0, events:[...s.events,{kind:'resume',skill:s.nextSkill,at:action.now}]};}
  if (action.type==='return') {const goal=s.destinationSkill??'goal',fresh=nextFreshSerial(s,s.serial+1,goal);return {...s, phase:'check', active:goal, serial:fresh, cycleStart:fresh,cycleSkill:goal, returnCheck:true, extension:false, assisted:false, blockCount:0};}
  if(action.type==='rehearsal-next'&&(s.phase==='feedback'||s.phase==='moment')){const goal=s.destinationSkill??'goal';return {...s,phase:'check',active:goal,nextSkill:goal,serial:nextFreshSerial(s,s.serial,goal),assisted:false};}
  if (action.type==='next' && s.phase==='complete' && !s.extension) return {...s, phase:'check', active:NEXT_SKILL[s.topic], extension:true, returnCheck:false, serial:nextFreshSerial(s,s.serial+1,NEXT_SKILL[s.topic]), blockCount:0, assisted:false, events:[...s.events,{kind:'next_turn',skill:NEXT_SKILL[s.topic],at:action.now}]};
  if (action.type==='continue' && (s.phase==='feedback'||s.phase==='moment')) {
    if (s.blockCount>=s.blockLimit && s.next!=='complete') return {...s,phase:'pause',blockCount:0};
    return {...s,phase:s.next,active:s.nextSkill,serial:s.next==='check'?nextFreshSerial(s,s.serial,s.nextSkill):s.serial,assisted:false};
  }
  if (action.type!=='submit' || s.phase!=='check') return prev;
  const p=problemFor(s), correct=isCorrect(p,action.answers);
  if(!action.answers.every(x=>x.trim()==='')&&answerInputIssue(p,action.answers))return prev;
  if(action.answers.length!==p.expected.length)return prev;
  const ev:Attempt={id:p.id,skill:s.active,answer:action.answers,correct,assisted:s.assisted||p.family==='diagnostic',confidence:action.confidence,at:action.now,purpose:s.returnCheck?'return':s.extension?'next':'route',problemVersion:s.problemVersion??1,expression:p.expression,family:p.family??`${s.active}:original`,classification:s.assisted||p.family==='diagnostic'?'assisted':s.returnCheck&&s.evidence.some(e=>e.correct&&!e.assisted&&e.skill===s.active&&action.now-e.at>=86400000)?'later-retrieval':'fresh-independent'};
  const n:Recovery={...s,draft:undefined,original:s.original??(s.active===(s.destinationSkill??'goal')?{id:p.id,prompt:p.prompt,expression:p.expression,answer:action.answers,confidence:action.confidence,assisted:s.assisted}:undefined),evidence:[...s.evidence,ev],correct,phase:'feedback',next:'check',nextSkill:s.active,serial:s.serial+1,blockCount:s.blockCount+1};
  if(p.family==='diagnostic'){const support=supportAfterProbe(s,p,action.answers);return {...n,probes:Math.min(3,(s.probes??0)+1),next:'learn',nextSkill:support.skill,message:support.reason};}
  if (s.extension) return {...n,phase:'moment',next:'complete',message:correct?'One more step, demonstrated. Your route is saved.':'That next step can wait. Your earlier progress stays saved.'};
  if (!correct) {
    n.suspected=add(s.suspected,s.active);
    n.goalWasBlocked=s.goalWasBlocked||s.active===(s.destinationSkill??'goal');
    if(s.active===(s.destinationSkill??'goal') && s.returnCheck) { n.goalPassed=false; n.passed=s.passed.filter(x=>x!==(s.destinationSkill??'goal')); n.returnCheck=false; }
    if((s.probes??0)>=3)return {...n,next:n.evidence.filter(e=>!e.correct).length>=6?'support':'learn',nextSkill:s.active,message:'We have tried three short checks. Let’s use an example, choose a different step, or save a question for a helper.'};
    n.probes=(s.probes??0)+1;
    const children=deps(s.active,s.topic).filter(x=>!n.passed.includes(x));
    n.planned=ORDER.filter(x=>new Set([...s.planned,...children]).has(x));
    const misses=n.evidence.filter(e=>e.skill===s.active&&!e.correct&&Number(e.id.split(':').at(-1))>=(s.cycleStart??0)).length;
    if (action.confidence==='know' && misses===1&&(s.problemVersion!==3||!wrongTurnClue(s,p,action.answers))) return {...n,nextSkill:s.active,message:'Let’s check a fresh example before changing your route.'};
    const clue=wrongTurnClue(s,p,action.answers);
    if(clue&&misses<3&&!s.evidence.some(e=>e.skill!==s.active&&Number(e.id.split(':').at(-1))>=(s.cycleStart??0))){
      return {...n,planned:[...new Set([clue.skill,s.active,s.destinationSkill??'goal'])],nextSkill:clue.skill,next:'check',routeClue:{...clue,serial:s.serial},message:clue.message};
    }
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
  if(s.active===(s.destinationSkill??'goal')) return {...n,phase:'moment',next:'complete',goalPassed:true,message:s.returnCheck?'Still with you. You solved two fresh destination problems.':s.goalWasBlocked?'Back on track. Two fresh destination problems, solved without hints.':'You’re already on track. Two destination checks passed; this review route is unnecessary.'};
  n.phase='moment';
  // Untested foundations need not remain on this destination route after the
  // dependent skill is demonstrated. This does not mark those foundations mastered.
  const underneath=new Set<Skill>();
  const collect=(id:Skill)=>{for(const child of deps(id,s.topic)){if(!underneath.has(child)){underneath.add(child);collect(child);}}};
  collect(s.active);
  n.planned=n.planned.filter(id=>!underneath.has(id)||n.suspected.includes(id)||n.passed.includes(id));
  n.message=s.learned.includes(s.active)?`New capability. You demonstrated ${LABELS[s.active].toLowerCase()} on two fresh checks.`:`Shortcut found. ${LABELS[s.active]} review removed after two fresh checks.`;
  n.nextSkill=n.planned.find(x=>!n.passed.includes(x))??s.destinationSkill??'goal';
  n.next='check';
  return n;
}
export function validRecovery(value: unknown): value is Recovery {
  if(!value||typeof value!=='object')return false;
  const s=value as Recovery;
  const skills=new Set(ORDER), phases=new Set(['setup','check','feedback','learn','moment','pause','complete','return','support']);
  return s.version===1 && Object.keys(TOPICS).includes(s.topic) && ['self','class'].includes(s.mode) && phases.has(s.phase) && phases.has(s.next) && skills.has(s.active) && skills.has(s.nextSkill)
    && (s.problemVersion===undefined||s.problemVersion===2||s.problemVersion===3) && (s.exposedPairs===undefined||(Array.isArray(s.exposedPairs)&&s.exposedPairs.length<=2000&&s.exposedPairs.every(x=>typeof x==='string'&&/^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/.test(x))))
    && (s.sharedSerialFloor===undefined||(Number.isInteger(s.sharedSerialFloor)&&s.sharedSerialFloor>=0&&s.sharedSerialFloor<100000)) && (s.cycleSkill===undefined||skills.has(s.cycleSkill))
    &&(s.destinationSkill===undefined||skills.has(s.destinationSkill))&&(s.goalTitle===undefined||(typeof s.goalTitle==='string'&&s.goalTitle.length<=200))&&(s.goalExpression===undefined||(typeof s.goalExpression==='string'&&s.goalExpression.length<=500))&&(s.studyTaskId===undefined||(typeof s.studyTaskId==='string'&&s.studyTaskId.length<=200))
    && ['serial','budget','blockCount','blockLimit','startedAt','updatedAt'].every(k=>typeof s[k as keyof Recovery]==='number'&&Number.isFinite(s[k as keyof Recovery]))
    && Number.isInteger(s.serial) && s.serial>=0 && s.serial<100000 && [5,15,30,60].includes(s.budget) && s.blockLimit>0 && s.blockCount>=0 && (s.cycleStart===undefined||(Number.isInteger(s.cycleStart)&&s.cycleStart>=0)) && ['planned','passed','learned','suspected'].every(k=>Array.isArray(s[k as keyof Recovery])&&(s[k as keyof Recovery] as Skill[]).every(x=>skills.has(x)))
    && ['assisted','goalPassed','goalWasBlocked','returnCheck','extension'].every(k=>typeof s[k as keyof Recovery]==='boolean')
    && (s.exposedUntil===undefined||(Number.isInteger(s.exposedUntil)&&s.exposedUntil>=0&&s.exposedUntil<100000))
    && (s.routeClue===undefined||(typeof s.routeClue==='object'&&s.routeClue!==null&&skills.has(s.routeClue.skill)&&typeof s.routeClue.message==='string'&&Number.isInteger(s.routeClue.serial)&&s.routeClue.serial>=0))
    && (s.helpQuestion===undefined||(typeof s.helpQuestion==='string'&&s.helpQuestion.length<=1000))
    && (s.labs===undefined||(!!s.labs&&typeof s.labs==='object'&&Object.keys(s.labs).length<=12&&Object.entries(s.labs).every(([k,v])=>/^[a-z]+$/.test(k)&&validLab(v))))
    && (s.probes===undefined||(Number.isInteger(s.probes)&&s.probes>=0&&s.probes<=3))
    && (s.draft===undefined||(!!s.draft&&typeof s.draft.id==='string'&&Array.isArray(s.draft.answers)&&s.draft.answers.length<=4&&s.draft.answers.every(a=>typeof a==='string'&&a.length<=40)&&['know','unsure','forgot','never'].includes(s.draft.confidence)))
    && (s.original===undefined||(!!s.original&&typeof s.original.id==='string'&&typeof s.original.prompt==='string'&&s.original.prompt.length<=1000&&typeof s.original.expression==='string'&&s.original.expression.length<=1000&&Array.isArray(s.original.answer)&&s.original.answer.length<=4&&s.original.answer.every(a=>typeof a==='string'&&a.length<=40)&&typeof s.original.assisted==='boolean'&&['know','unsure','forgot','never'].includes(s.original.confidence)))
    && typeof s.message==='string' && Array.isArray(s.evidence)&&s.evidence.length<2000&&s.evidence.every(e=>typeof e.id==='string'&&e.id.split(':').length===3&&e.id.split(':')[0]===s.topic&&e.id.split(':')[1]===e.skill&&/^\d+$/.test(e.id.split(':')[2])&&Number(e.id.split(':')[2])<100000&&skills.has(e.skill)&&Array.isArray(e.answer)&&e.answer.length>0&&e.answer.length<=4&&e.answer.every(x=>typeof x==='string'&&x.length<=40)&&(e.family===undefined||(typeof e.family==='string'&&e.family.length<=100))&&(e.classification===undefined||['assisted','fresh-independent','later-retrieval'].includes(e.classification))&&(e.expression===undefined||(typeof e.expression==='string'&&e.expression.length<=1000))&&typeof e.correct==='boolean'&&typeof e.assisted==='boolean'&&Number.isFinite(e.at)&&e.at>=0&&['know','unsure','forgot','never'].includes(e.confidence)&&['route','return','next'].includes(e.purpose)&&(e.problemVersion===undefined||e.problemVersion===1||e.problemVersion===2||e.problemVersion===3))
    && Array.isArray(s.events)&&s.events.length<5000&&s.events.every(e=>skills.has(e.skill)&&typeof e.kind==='string'&&Number.isFinite(e.at)&&(e.detail===undefined||typeof e.detail==='string'));
}
