import {validStudyCard,type StudyCard} from './study-cards.ts';
import {initialRecovery,problemFor,nextFreshSerial,pairKey,TOPICS,ORDER,validRecovery,recentSuccesses,answerInputIssue,type Topic,type Skill,type Recovery,type Attempt,type Confidence} from './recovery.ts';
import {khanEntry,entrySkills,type KhanEntry} from './khan-entry.ts';

export const STUDY_KEY='backtrack.study.v1';
export const DAY=86400000;
export type Pack={id:string;name:string;description:string;topics:Topic[];testDate?:string;custom?:boolean;khanId?:string;cards?:StudyCard[]};
export const PACKS:Pack[]=[
  {id:'algebra-quiz',name:'This week’s algebra',description:'Brackets, factors, and quadratic solutions. Learn the steps or prepare for a quiz.',topics:['brackets','quadratics']},
  {id:'everyday-maths',name:'Everyday numbers',description:'Fractions and ratios that make sense beyond a worksheet.',topics:['fractions','ratios']},
  {id:'graph-reader',name:'Make graphs make sense',description:'Coordinates, rules, and the story a line tells.',topics:['graphs']},
];
export type RoundMode='learn'|'review'|'challenge';
export type KhanFeedback='completed'|'difficulty'|'access';
export type KhanReturn={topic:Topic;skill:Skill;title:string;url:string;returnPath:string;at:number;feedback?:KhanFeedback;feedbackAt?:number};
export type ReviewItem={key:string;topic:Topic;skill:Skill;dueAt:number;stage:number;streak:number;lastAt:number;lastDifficulty?:number;lastAssisted?:number;independentAt?:number;manual:boolean;paused:boolean;khanFeedback?:KhanFeedback;khanFeedbackAt?:number};
export type StudyTask={id:string;topic:Topic;skill:Skill;mode:RoundMode;reason:string;startedAt?:number;done?:boolean;outcome?:'checked'|'practised';khanId?:string};
export type StudySession={id:string;packId:string;minutes:number;tasks:StudyTask[];deferred:number;startedAt:number;lastAt:number;index:number;complete:boolean;rewarded:boolean;difficultyAdjusted:boolean;meaningful?:boolean;xpEarned?:number;note?:string;rehearsal?:boolean};
export type StudyEvent={kind:'challenge_open'|'challenge_attempt'|'pack_shared'|'pack_saved'|'khan_open'|'khan_report'|'khan_feedback'|'round_done'|'session_done';at:number;detail:string;confidence?:Confidence;response?:'correct'|'incorrect'|'unknown'};
export type StudyState={version:1;updatedAt:number;activePack:string;packs:Pack[];review:Record<string,ReviewItem>;seen:string[];seenEvents:string[];routes:Partial<Record<Topic,Recovery>>;cursors:Partial<Record<Topic,number>>;pairs:Partial<Record<Topic,string[]>>;sessions:StudySession[];activeSession?:StudySession;xp:number;awards:string[];lastVisit:number;settings:{minutes:number;weeklyGoal:number;quiet:boolean;sound:boolean;style:'leaf'|'sky'|'peach';accessory:'none'|'leaf'|'star'|'sun';intervals:[number,number,number]};events:StudyEvent[];pendingKhan?:KhanReturn};
export const initialStudy=():StudyState=>({version:1,updatedAt:0,activePack:'',packs:[],review:{},seen:[],seenEvents:[],routes:{},cursors:{},pairs:{},sessions:[],xp:0,awards:[],lastVisit:0,settings:{minutes:10,weeklyGoal:3,quiet:false,sound:false,style:'leaf',accessory:'none',intervals:[1,3,7]},events:[]});
export const skillKey=(topic:Topic,skill:Skill)=>skill==='goal'?`${topic}:goal`:`skill:${skill}`;
export const dayKey=(at:number)=>{const d=new Date(at);return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;};
export function allPacks(s:StudyState){return [...PACKS.map(p=>s.packs.find(x=>x.id===p.id)??p),...s.packs.filter(p=>!PACKS.some(c=>c.id===p.id))];}
export function selectedPack(s:StudyState){return allPacks(s).find(p=>p.id===s.activePack);}
export function packFromKhan(entry:KhanEntry):Pack{return {id:`khan-${entry.id}`,name:entry.title,description:'Study the Khan activity, work through a useful check, and keep the step in your reviewer.',topics:[entry.topic],khanId:entry.id,custom:true};}
export function recordKhanOpen(s:StudyState,activity:KhanReturn,routeDetail?:string){return {...s,pendingKhan:activity,updatedAt:activity.at,seenEvents:[...new Set([...s.seenEvents,`${activity.topic}:khan_open:${activity.skill}:${activity.at}:${routeDetail??'exercise:'+activity.title}`])],events:[...s.events,{kind:'khan_open' as const,at:activity.at,detail:`${activity.topic}:${activity.skill}:${activity.title}`}].slice(-1000)};}
export function recordKhanFeedback(s:StudyState,activity:KhanReturn,feedback:KhanFeedback,now:number):StudyState{
  const key=skillKey(activity.topic,activity.skill),old=s.review[key];
  const item:ReviewItem=old?{...old,khanFeedback:feedback,khanFeedbackAt:now,dueAt:Math.min(old.dueAt,now)}:{key,topic:activity.topic,skill:activity.skill,dueAt:now,stage:0,streak:0,lastAt:now,manual:false,paused:false,khanFeedback:feedback,khanFeedbackAt:now};
  return {...s,review:{...s.review,[key]:item},pendingKhan:{...activity,feedback,feedbackAt:now},seenEvents:[...s.seenEvents,`${activity.topic}:khan_feedback:${activity.skill}:${now}:${feedback}`],events:[...s.events,{kind:'khan_feedback' as const,at:now,detail:`${key}:${feedback}`}].slice(-1000),updatedAt:now};
}
const fingerprint=(s:Recovery,e:Attempt)=>`${skillKey(s.topic,e.skill)}:${problemFor({...s,problemVersion:e.problemVersion===1?undefined:e.problemVersion===2?2:s.problemVersion,active:e.skill,serial:Number(e.id.split(':').at(-1))}).expression}`;
export function ingestRecovery(state:StudyState,route:Recovery,now:number):StudyState{
  const seen=new Set(state.seen),review={...state.review};let changed=false;
  const pairs=new Set([...(state.pairs[route.topic]??[]),...(route.exposedPairs??[])]);
  for(const e of route.evidence){
    const key=fingerprint(route,e);if(seen.has(key))continue;seen.add(key);changed=true;
    const p=problemFor({...route,problemVersion:e.problemVersion===1?undefined:e.problemVersion===2?2:route.problemVersion,active:e.skill,serial:Number(e.id.split(':').at(-1))});if(p.factorPair)pairs.add(pairKey(p.factorPair));
    const id=skillKey(route.topic,e.skill),old=review[id];
    if(old&&e.at<old.lastAt)continue;
    const item:ReviewItem=old?{...old,topic:route.topic,lastAt:e.at}:{key:id,topic:route.topic,skill:e.skill,dueAt:e.at+DAY,stage:0,streak:0,lastAt:e.at,manual:false,paused:false};
    if(!e.correct||e.assisted){item.streak=0;item.stage=0;item.dueAt=e.at+DAY;if(!e.correct)item.lastDifficulty=e.at;if(e.assisted)item.lastAssisted=e.at;}
    else{item.streak++;item.independentAt=e.at;if(item.streak%2===0){item.dueAt=e.at+state.settings.intervals[Math.min(item.stage,2)]*DAY;item.stage=Math.min(item.stage+1,2);}}
    review[id]=item;
  }
  const seenEvents=new Set(state.seenEvents),events=[...state.events];
  for(const e of route.events){const id=`${route.topic}:${e.kind}:${e.skill}:${e.at}:${e.detail??''}`;if(seenEvents.has(id))continue;seenEvents.add(id);changed=true;if(e.kind==='khan_open'||e.kind==='practice_report')events.push({kind:e.kind==='khan_open'?'khan_open':'khan_report',at:e.at,detail:`${route.topic}:${e.skill}`});}
  const viewed=route.phase==='check'||route.phase==='learn'?route.serial:Math.max(-1,...route.evidence.map(e=>Number(e.id.split(':').at(-1))));
  const cursor=Math.max(state.cursors[route.topic]??0,viewed+1,(route.exposedUntil??-1)+1);
  const previous=state.routes[route.topic];
  const routeChanged=!previous||route.updatedAt>previous.updatedAt||(route.updatedAt===previous.updatedAt&&(previous.phase!==route.phase||previous.serial!==route.serial||previous.assisted!==route.assisted));
  if(!changed&&!routeChanged&&cursor===(state.cursors[route.topic]??0)&&pairs.size===(state.pairs[route.topic]?.length??0))return state;
  let active=state.activeSession;
  if(active&&!active.complete&&!active.difficultyAdjusted){const task=active.tasks[active.index],since=task?.startedAt;if(task?.topic===route.topic&&since!==undefined&&route.evidence.some(e=>e.at>=since&&!e.correct)&&active.tasks.length-active.index>1){active={...active,tasks:active.tasks.slice(0,active.tasks.length-1),deferred:active.deferred+1,difficultyAdjusted:true,lastAt:now};}}
  return {...state,updatedAt:now,seen:[...seen],seenEvents:[...seenEvents],review,routes:routeChanged?{...state.routes,[route.topic]:route}:state.routes,cursors:{...state.cursors,[route.topic]:cursor},pairs:{...state.pairs,[route.topic]:[...pairs]},events:events.slice(-1000),activeSession:active,pendingKhan:state.pendingKhan?.topic===route.topic&&route.evidence.filter(e=>e.at>state.pendingKhan!.at&&e.skill===state.pendingKhan!.skill&&e.correct&&!e.assisted).length>=2?undefined:state.pendingKhan};
}
export function planSession(s:StudyState,pack:Pack,minutes:number,mode:RoundMode,now:number):StudySession{
  const limit=minutes<=5?1:minutes<=10?2:minutes<=20?3:4;
  const origin=khanEntry(pack.khanId),allowed=origin?entrySkills(origin):undefined;
  const due=Object.values(s.review).filter(x=>!x.paused&&x.dueAt<=now&&pack.topics.includes(x.topic)&&(!allowed||allowed.includes(x.skill))).sort((a,b)=>a.dueAt-b.dueAt);
  const tasks:StudyTask[]=[];const keys=new Set<string>();
  const add=(topic:Topic,skill:Skill,m:RoundMode,reason:string)=>{const k=skillKey(topic,skill);if(keys.has(k))return;keys.add(k);const prior=s.review[k];if(prior?.khanFeedback&&(prior.khanFeedbackAt??0)>(prior.independentAt??0)){m=prior.khanFeedback==='completed'?'challenge':'learn';reason=prior.khanFeedback==='completed'?'You reported Khan practice. Check what you can apply now.':prior.khanFeedback==='difficulty'?'You asked for another explanation after Khan practice.':'You reported an access problem. Start with a text explanation here.';}tasks.push({id:`${now}-${tasks.length}-${k}`,topic,skill,mode:m,reason,khanId:pack.khanId});};
  const lastWork=(topic:Topic)=>Math.max(0,...(s.routes[topic]?.evidence.map(e=>e.at)??[]));
  const topics=[...pack.topics].sort((a,b)=>lastWork(a)-lastWork(b));
  const testAt=pack.testDate?new Date(pack.testDate+'T23:59:59').getTime():NaN;
  const preparing=Number.isFinite(testAt)&&testAt>=now&&testAt-now<=3*DAY;
  if(preparing&&mode!=='learn')add(topics[0],origin?.skill??'goal','challenge','A fresh application from your upcoming quiz scope.');
  if(mode==='review'&&due[0])add(due[0].topic,due[0].skill,'review','A scheduled fresh look at an earlier step.');
  for(const topic of topics){const skill=origin?.skill??(mode==='challenge'?'goal':TOPICS[topic].path.find(x=>(s.review[skillKey(topic,x)]?.streak??0)<2)??'goal');add(topic,skill,mode,mode==='learn'?'Start with an explanation, then use the idea.':mode==='challenge'?'Apply the idea on a fresh problem.':'Work toward the topics in this pack.');}
  if(mode==='review')for(const x of due.slice(1))add(x.topic,x.skill,'review','Another earlier step kept within reach.');
  return {id:`session-${now}`,packId:pack.id,minutes,tasks:tasks.slice(0,limit),deferred:Math.max(0,tasks.length-limit),startedAt:now,lastAt:now,index:0,complete:false,rewarded:false,difficultyAdjusted:false};
}
export function smallerSession(s:StudySession){const end=Math.min(s.tasks.length,s.index+1);return {...s,tasks:s.tasks.slice(0,end),deferred:s.deferred+s.tasks.length-end,minutes:5};}
export function beginSession(s:StudyState,session:StudySession,now:number):StudyState{
 const previous=s.activeSession;const sessions=previous&&!previous.complete?[...s.sessions.filter(x=>x.id!==previous.id),previous].slice(-300):s.sessions;
 return {...s,sessions,activeSession:session,activePack:session.packId,lastVisit:now,updatedAt:now};
}
export function prepareRound(s:StudyState,task:StudyTask,now:number):Recovery{
  const old=s.routes[task.topic]??initialRecovery(task.topic);
  const origin=khanEntry(task.khanId);
  const base:Recovery={...old,problemVersion:2,evidence:old.evidence.map(e=>({...e,problemVersion:e.problemVersion??(old.problemVersion===2?2:1)})),mode:'self',budget:60,blockLimit:10,blockCount:0,phase:task.mode==='learn'?'learn':'check',active:task.skill,next:'check',nextSkill:task.skill,planned:[...new Set([...TOPICS[task.topic].path,task.skill])].sort((a,b)=>ORDER.indexOf(a)-ORDER.indexOf(b)),passed:old.passed.filter(x=>x!==task.skill),goalPassed:false,extension:false,returnCheck:task.mode==='review'&&task.skill==='goal'&&!!s.review[skillKey(task.topic,task.skill)]?.independentAt,assisted:false,correct:null,startedAt:old.startedAt||now,updatedAt:now,sharedSerialFloor:s.cursors[task.topic]??0,exposedPairs:[...new Set([...(old.exposedPairs??[]),...(s.pairs[task.topic]??[])])],cycleSkill:task.skill};
  const activity=s.pendingKhan;
  if(activity?.topic===task.topic){
    const additions:Recovery['events']=[{kind:'khan_open',skill:activity.skill,at:activity.at,detail:'exercise:'+activity.title}];
    const feedbackAt=activity.feedbackAt??s.review[skillKey(activity.topic,activity.skill)]?.khanFeedbackAt;
    if(activity.feedback&&feedbackAt!==undefined)additions.push({kind:'khan_feedback',skill:activity.skill,at:feedbackAt,detail:activity.feedback});
    base.events=[...old.events,...additions.filter(e=>!old.events.some(x=>x.kind===e.kind&&x.skill===e.skill&&x.at===e.at&&x.detail===e.detail))];
  }
  base.destinationSkill=origin?.skill??'goal';base.goalTitle=origin?.title;base.goalExpression=origin?.expression;base.studyTaskId=task.id;
  if(origin){base.planned=origin.skill==='goal'?[...TOPICS[task.topic].path]:[origin.skill];base.goalPassed=false;base.returnCheck=task.mode==='review'&&task.skill===origin.skill&&!!s.review[skillKey(task.topic,task.skill)]?.independentAt;}
  base.serial=nextFreshSerial(base,Math.max(old.serial+1,s.cursors[task.topic]??0));base.cycleStart=base.serial;return base;
}
export function completeStudyTask(s:StudyState,route:Recovery,now:number,taskId:string):StudyState{
  const active=s.activeSession;if(!active||active.complete)return s;const task=active.tasks[active.index];if(!task||task.done||task.id!==taskId||task.topic!==route.topic)return s;
  const recorded=route.evidence.filter(e=>e.at>=(task.startedAt??active.startedAt)&&e.at<=now);
  if(new Set(recorded.map(e=>e.id)).size<2)return s;
  const unique=new Set<string>();
  const answered=route.evidence.filter(e=>{if(e.at<(task.startedAt??active.startedAt)||e.at>now)return false;const p=problemFor({...route,problemVersion:e.problemVersion===1?undefined:e.problemVersion===2?2:route.problemVersion,active:e.skill,serial:Number(e.id.split(':').at(-1))});const key=fingerprint(route,e);if(answerInputIssue(p,e.answer)||unique.has(key))return false;unique.add(key);return true;});
  const checked=route.active===task.skill&&route.phase==='moment'&&route.passed.includes(task.skill)&&recentSuccesses(route,task.skill)>=2&&answered.filter(e=>e.skill===task.skill&&e.correct&&!e.assisted).length>=2;
  const award=`${dayKey(now)}:${skillKey(task.topic,task.skill)}`;const earns=answered.length>=2&&!s.awards.includes(award);
  const tasks=active.tasks.map((t,i)=>i===active.index?{...t,done:true,outcome:checked?'checked' as const:'practised' as const}:t);
  const complete=active.index+1>=tasks.length;const session={...active,tasks,index:complete?active.index:active.index+1,complete,lastAt:now,rewarded:active.rewarded||earns,meaningful:active.meaningful||answered.length>=2,xpEarned:(active.xpEarned??0)+(earns?10:0)};
  return {...s,updatedAt:now,xp:s.xp+(earns?10:0),awards:earns?[...s.awards,award]:s.awards,activeSession:session,sessions:complete?[...s.sessions.filter(x=>x.id!==session.id),session].slice(-300):s.sessions,events:[...s.events,{kind:'round_done' as const,at:now,detail:task.id},...(complete?[{kind:'session_done' as const,at:now,detail:session.id}]:[])].slice(-1000)};
}
export function parseSharedPack(params:URLSearchParams):Pack|undefined{
  const raw=params.get('scope');if(!raw)return;const topics=raw.split('.');if(!topics.length||topics.length>5||topics.some(x=>!Object.hasOwn(TOPICS,x)))return;
  const origin=khanEntry(params.get('khan')??undefined);if(params.has('khan')&&!origin)return;
  const unique=[...new Set(topics)] as Topic[];if(origin&&(unique.length!==1||unique[0]!==origin.topic))return;
  const name=(params.get('title')??'Shared study pack').trim().slice(0,60)||'Shared study pack';let hash=2166136261;for(const char of unique.join('.')+':'+name)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;return {id:origin?`khan-${origin.id}`:`shared-${hash.toString(36)}`,name,description:'Shared scope. Your progress and support stay personal.',topics:unique,custom:true,khanId:origin?.id};
}
export function validStudy(x:unknown):x is StudyState{
  const obj=(v:unknown)=>!!v&&typeof v==='object'&&!Array.isArray(v);
  const text=(v:unknown,max=200)=>typeof v==='string'&&v.length<=max;
  const time=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<8.64e15;
  const int=(v:unknown,max=100000)=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=max;
  const strings=(v:unknown,max=20000)=>Array.isArray(v)&&v.length<=max&&v.every(t=>text(t,1000));
  const pack=(p:Pack)=>obj(p)&&text(p.id)&&text(p.name,60)&&text(p.description,1000)&&Array.isArray(p.topics)&&p.topics.length>0&&p.topics.length<=5&&p.topics.every(t=>Object.hasOwn(TOPICS,t))&&(p.khanId===undefined||!!khanEntry(p.khanId))&&(p.cards===undefined||Array.isArray(p.cards)&&p.cards.length<=40&&p.cards.every(validStudyCard))&&(p.testDate===undefined||p.testDate===''||/^\d{4}-\d{2}-\d{2}$/.test(p.testDate));
  const task=(t:StudyTask)=>obj(t)&&text(t.id)&&Object.hasOwn(TOPICS,t.topic)&&ORDER.includes(t.skill)&&['learn','review','challenge'].includes(t.mode)&&text(t.reason,1000)&&(t.khanId===undefined||!!khanEntry(t.khanId))&&(t.startedAt===undefined||time(t.startedAt))&&(t.done===undefined||typeof t.done==='boolean')&&(t.outcome===undefined||['checked','practised'].includes(t.outcome));
  const session=(a:StudySession)=>obj(a)&&text(a.id)&&text(a.packId)&&[5,10,20,30].includes(a.minutes)&&Array.isArray(a.tasks)&&a.tasks.length>0&&a.tasks.length<=8&&a.tasks.every(task)&&int(a.index,a.tasks.length-1)&&int(a.deferred)&&time(a.startedAt)&&time(a.lastAt)&&typeof a.complete==='boolean'&&typeof a.rewarded==='boolean'&&typeof a.difficultyAdjusted==='boolean'&&(a.meaningful===undefined||typeof a.meaningful==='boolean')&&(a.xpEarned===undefined||int(a.xpEarned))&&(a.note===undefined||text(a.note,500))&&(a.rehearsal===undefined||typeof a.rehearsal==='boolean');
  if(!obj(x))return false;const s=x as StudyState;
  if(s.version!==1||!time(s.updatedAt)||!time(s.lastVisit)||!text(s.activePack)||!Array.isArray(s.packs)||s.packs.length>100||!s.packs.every(pack)||!obj(s.review)||!obj(s.routes)||!obj(s.cursors)||!obj(s.pairs)||!obj(s.settings))return false;
  return Object.entries(s.review).every(([k,i])=>obj(i)&&k===skillKey(i.topic,i.skill)&&i.key===k&&Object.hasOwn(TOPICS,i.topic)&&ORDER.includes(i.skill)&&time(i.dueAt)&&time(i.lastAt)&&int(i.stage,2)&&int(i.streak)&&typeof i.manual==='boolean'&&typeof i.paused==='boolean'&&[i.lastDifficulty,i.lastAssisted,i.independentAt,i.khanFeedbackAt].every(t=>t===undefined||time(t))&&(i.khanFeedback===undefined||['completed','difficulty','access'].includes(i.khanFeedback)))
    &&strings(s.seen)&&strings(s.seenEvents)&&Object.entries(s.routes).every(([topic,r])=>Object.hasOwn(TOPICS,topic)&&validRecovery(r)&&r.topic===topic)&&Object.entries(s.cursors).every(([topic,v])=>Object.hasOwn(TOPICS,topic)&&int(v,99999))&&Object.entries(s.pairs).every(([topic,v])=>Object.hasOwn(TOPICS,topic)&&strings(v,2000)&&v.every(p=>/^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/.test(p)))
    &&Array.isArray(s.sessions)&&s.sessions.length<=300&&s.sessions.every(session)&&(s.activeSession===undefined||session(s.activeSession))&&strings(s.awards)&&int(s.xp,10000000)&&Array.isArray(s.events)&&s.events.length<=1000&&s.events.every(e=>obj(e)&&['challenge_open','challenge_attempt','pack_shared','pack_saved','khan_open','khan_report','khan_feedback','round_done','session_done'].includes(e.kind)&&time(e.at)&&text(e.detail,1000)&&(e.confidence===undefined||['know','unsure','forgot','never'].includes(e.confidence))&&(e.response===undefined||['correct','incorrect','unknown'].includes(e.response)))
    &&(s.pendingKhan===undefined||(obj(s.pendingKhan)&&Object.hasOwn(TOPICS,s.pendingKhan.topic)&&ORDER.includes(s.pendingKhan.skill)&&text(s.pendingKhan.title,200)&&/^https:\/\/(www\.)?khanacademy\.org\//.test(s.pendingKhan.url)&&/^\/(?:study\/session|start\/\w+|try\/factors|packs|khan)$/.test(s.pendingKhan.returnPath)&&time(s.pendingKhan.at)&&(s.pendingKhan.feedbackAt===undefined||time(s.pendingKhan.feedbackAt))&&(s.pendingKhan.feedback===undefined||['completed','difficulty','access'].includes(s.pendingKhan.feedback))))
    &&[5,10,20,30].includes(s.settings.minutes)&&[3,4,5,7].includes(s.settings.weeklyGoal)&&typeof s.settings.quiet==='boolean'&&typeof s.settings.sound==='boolean'&&['leaf','sky','peach'].includes(s.settings.style)&&['none','leaf','star','sun'].includes(s.settings.accessory)&&Array.isArray(s.settings.intervals)&&s.settings.intervals.length===3&&s.settings.intervals.every(n=>int(n,30)&&n>=1);
}
