import {LABELS,NEXT_SKILL,ORDER,TOPICS,skillDependencies,type Skill,type Topic} from './recovery.ts';
import {skillKey,type StudyState} from './study.ts';
import {formFromKey,type FormKind} from './mock/forms.ts';
import {misconception} from './mock/misconceptions.ts';
import {scoreAttempt,type Attempt} from './mock/scoring.ts';
import {CONCEPTS} from './program/concepts.ts';
import {PROGRAMS,RESCUE_BY_ID,type BridgeProgram} from './program/bridge.ts';

/** Which skills does this learner need to repair? Read-only over what this device
 *  already holds; it never writes evidence. A skill is listed only when the learner's
 *  own answers point to it, and it leaves the list once its last two checks were
 *  fresh, unassisted and correct (the reviewer's streak). Like a knowledge-graph
 *  "ready to learn" frontier, a skill whose prerequisite is also missing waits behind it. */
export type GapKind='exam'|'unknown'|'route'|'difficulty'|'hint'|'khan';
export type GapReason={kind:GapKind;text:string;at:number;count?:number};
export type Gap={key:string;topic:Topic;skill:Skill;label:string;context:string;reasons:GapReason[];weight:number;lastAt:number;blockedBy:Skill[]};
export type FixedGap={key:string;topic:Topic;skill:Skill;label:string;at:number};
export type GapMap={ready:Gap[];later:Gap[];fixed:FixedGap[];hasEvidence:boolean};
/** Which practice counts and which topics belong. BACKTRACK routes and the reviewer count in
 *  every scope; only the exam forms differ. A skill belongs when its topic does, or when it
 *  sits on the way to one (a prerequisite of a belonging topic's steps). */
export type GapScope={forms?:(kind:FormKind,formKey:string)=>boolean;topics?:ReadonlySet<Topic>};

/** CET review: entrance-exam practice, and the topics that CET concepts route to. */
export const CET_SCOPE:GapScope={forms:kind=>kind!=='placement',topics:new Set(CONCEPTS.flatMap(c=>c.engine?[c.engine]:[]))};
/** The topics a college program's first year assumes: its placement check, its foundations and its rescues. */
export function programTopics(p:BridgeProgram):Topic[]{return [...new Set([...p.placement.engine,...p.assumes.flatMap(a=>a.engine?[a.engine]:[]),...p.rescue.flatMap(id=>RESCUE_BY_ID[id]?.engine?[RESCUE_BY_ID[id].engine!]:[])])];}
/** College preparation: placement checks, and the topics the learner's program assumes (every program's, before one is chosen). */
export function collegeScope(p?:BridgeProgram):GapScope{
 return {forms:(kind,key)=>kind==='placement'&&(!p||key.startsWith(`placement~${p.id}|`)),topics:new Set((p?[p]:PROGRAMS).flatMap(programTopics))};
}
const reach=(topics:ReadonlySet<Topic>)=>{const out=new Set<Skill>(),stack:[Skill,Topic][]=[...topics].flatMap(t=>TOPICS[t].path.map(s=>[s,t] as [Skill,Topic]));while(stack.length){const [s,t]=stack.pop()!;if(s==='goal'||out.has(s))continue;out.add(s);stack.push(...skillDependencies(s,t).map(d=>[d,t] as [Skill,Topic]));}return out;};

const WEIGHT:Record<GapKind,number>={exam:3,unknown:2,route:3,difficulty:2,hint:1,khan:1};
const RECENT=14*86400000;
const labelOf=(topic:Topic,skill:Skill)=>skill==='goal'?TOPICS[topic].label:LABELS[skill];
const contextOf=(topic:Topic,skill:Skill)=>skill==='goal'?'Whole problems, start to finish':`Used in ${TOPICS[topic].label.toLowerCase()}`;
const plural=(n:number,word:string)=>`${n} ${word}${n===1?'':'s'}`;
const quoted=(xs:string[])=>xs.slice(0,2).map(x=>`“${x}”`).join(', ')+(xs.length>2?` and ${xs.length-2} more`:'');

export function findGaps(study:StudyState,attempts:Attempt[],now:number,scope:GapScope={}):GapMap{
 const skills=scope.topics?reach(scope.topics):undefined;
 const belongs=(topic:Topic,skill:Skill)=>!scope.topics||(skill==='goal'?scope.topics.has(topic):scope.topics.has(topic)||skills!.has(skill));
 const counted=attempts.filter(a=>{if(!a.submittedAt)return false;const f=formFromKey(a.formKey);return !!f&&(!scope.forms||scope.forms(f.kind,a.formKey));});
 const found=new Map<string,{topic:Topic;skill:Skill;reasons:GapReason[]}>();
 const add=(topic:Topic,skill:Skill,reason:GapReason)=>{if(!belongs(topic,skill))return;const key=skillKey(topic,skill),g=found.get(key)??{topic,skill,reasons:[]};g.reasons.push(reason);found.set(key,g);};

 // Practice exams: a wrong choice that names a misconception routes to that skill;
 // "I don't know yet" on a topic with a BACKTRACK route points at its first step.
 for(const a of counted){
  const form=formFromKey(a.formKey)!;
  const misses=new Map<string,{topic:Topic;skill:Skill;kind:GapKind;labels:Set<string>;count:number}>();
  for(const m of scoreAttempt(form,a).misses){
   const mc=m.misconceptionId?misconception(m.misconceptionId):undefined;
   if(mc?.recovery){const {topic,skill}=mc.recovery,k=`exam|${skillKey(topic,skill)}`,g=misses.get(k)??{topic,skill,kind:'exam' as const,labels:new Set<string>(),count:0};g.labels.add(mc.label);g.count++;misses.set(k,g);continue;}
   if(m.idk){const c=CONCEPTS.find(x=>x.id===m.item.concept);if(!c?.engine)continue;const topic=c.engine,skill=NEXT_SKILL[topic],k=`unknown|${skillKey(topic,skill)}`,g=misses.get(k)??{topic,skill,kind:'unknown' as const,labels:new Set<string>(),count:0};g.labels.add(c.title);g.count++;misses.set(k,g);}
  }
  for(const g of misses.values())add(g.topic,g.skill,g.kind==='exam'
   ?{kind:'exam',count:g.count,at:a.submittedAt!,text:`Missed ${plural(g.count,'question')} in ${form.title}: ${quoted([...g.labels])}`}
   :{kind:'unknown',count:g.count,at:a.submittedAt!,text:`“I don’t know yet” on ${plural(g.count,'question')} in ${[...g.labels].join(', ')}`});
 }

 // BACKTRACK routes: steps the engine suspects and has not yet seen passed.
 for(const route of Object.values(study.routes)){
  if(!route)continue;
  for(const skill of route.suspected)if(!route.passed.includes(skill))add(route.topic,skill,{kind:'route',at:route.updatedAt,text:`Your ${TOPICS[route.topic].label.toLowerCase()} route pointed back to this step`});
 }

 // Reviewer: a wrong answer, a hint without a later independent answer, or a Khan
 // activity the learner reported as still difficult.
 for(const item of Object.values(study.review)){
  if(item.paused)continue;
  if(item.lastDifficulty)add(item.topic,item.skill,{kind:'difficulty',at:item.lastDifficulty,text:'A check on this step went wrong'});
  else if(item.lastAssisted)add(item.topic,item.skill,{kind:'hint',at:item.lastAssisted,text:'Solved with help, not yet on your own'});
  if(item.khanFeedback==='difficulty'&&item.khanFeedbackAt)add(item.topic,item.skill,{kind:'khan',at:item.khanFeedbackAt,text:'You said the Khan Academy practice was still difficult'});
 }

 const gaps:Gap[]=[],fixed:FixedGap[]=[];
 for(const [key,g] of found){
  const item=study.review[key];if(item?.paused)continue;
  // Two fresh, unassisted, correct answers in a row clear everything that came before them.
  const clearedAt=item&&item.streak>=2&&item.independentAt?item.independentAt:undefined;
  const open=g.reasons.filter(r=>clearedAt===undefined||(r.kind!=='route'&&r.at>clearedAt));
  if(!open.length){if(clearedAt!==undefined&&now-clearedAt<=RECENT)fixed.push({key,topic:g.topic,skill:g.skill,label:labelOf(g.topic,g.skill),at:clearedAt});continue;}
  open.sort((a,b)=>WEIGHT[b.kind]-WEIGHT[a.kind]||b.at-a.at);
  gaps.push({key,topic:g.topic,skill:g.skill,label:labelOf(g.topic,g.skill),context:contextOf(g.topic,g.skill),reasons:open,weight:open.reduce((n,r)=>n+WEIGHT[r.kind]*Math.min(r.count??1,3),0),lastAt:Math.max(...open.map(r=>r.at)),blockedBy:[]});
 }

 // A gap waits behind any missing prerequisite, however far back it sits.
 const missing=new Set(gaps.filter(g=>g.skill!=='goal').map(g=>g.skill));
 for(const g of gaps){
  const seen=new Set<Skill>(),stack=[...skillDependencies(g.skill,g.topic)];
  while(stack.length){const s=stack.pop()!;if(seen.has(s))continue;seen.add(s);stack.push(...skillDependencies(s,g.topic));}
  g.blockedBy=ORDER.filter(s=>seen.has(s)&&missing.has(s));
 }
 const ready=gaps.filter(g=>!g.blockedBy.length).sort((a,b)=>b.weight-a.weight||b.lastAt-a.lastAt||ORDER.indexOf(a.skill)-ORDER.indexOf(b.skill));
 const later=gaps.filter(g=>g.blockedBy.length).sort((a,b)=>ORDER.indexOf(a.skill)-ORDER.indexOf(b.skill)||b.weight-a.weight);
 const hasEvidence=counted.length>0||Object.values(study.review).some(i=>belongs(i.topic,i.skill))||Object.values(study.routes).some(r=>!!r?.evidence.length&&(!scope.topics||scope.topics.has(r.topic)));
 return {ready,later,fixed:fixed.sort((a,b)=>b.at-a.at),hasEvidence};
}
