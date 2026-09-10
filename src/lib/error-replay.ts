import {problemFor,type Recovery,type Skill} from './recovery.ts';

export type ReplayModel={kind:'factors'|'solutions';pair:[number,number];attempt:[number,number];fromAttempt:boolean};
/** Replay an actual earlier goal/skill attempt; exploratory changes never score. */
export function replayModel(s:Recovery):ReplayModel|undefined{
  if(s.topic!=='quadratics'||!['factor','zero','goal'].includes(s.active))return;
  const kind=s.active==='factor'?'factors':'solutions';
  const candidate=[...s.evidence].reverse().find(e=>e.family!=='diagnostic'&&!e.correct&&e.answer.length===2&&e.answer.every(x=>/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(x.replace(/[−–－]/g,'-')))&&
    (e.skill===s.active||e.skill==='goal'));
  if(candidate){
    const p=problemFor({...s,problemVersion:candidate.problemVersion===1?undefined:candidate.problemVersion===2||candidate.problemVersion===3?candidate.problemVersion:s.problemVersion,active:candidate.skill as Skill,serial:Number(candidate.id.split(':').at(-1))});
    if(p.factorPair&&p.factorPair.every(n=>Math.abs(n)<=12)&&candidate.answer.every(n=>Math.abs(Number(n.replace(/[−–－]/g,'-')))<=12))return {kind,pair:p.factorPair,attempt:candidate.answer.map(x=>Number(x.replace(/[−–－]/g,'-'))) as [number,number],fromAttempt:true};
  }
  const p=problemFor(s);
  return {kind,pair:[3,4],attempt:kind==='factors'?[2,6]:[3,4],fromAttempt:false};
}
export function factorComparison(target:[number,number],attempt:[number,number]){
  return {sum:attempt[0]+attempt[1],product:attempt[0]*attempt[1],targetSum:target[0]+target[1],targetProduct:target[0]*target[1],sumMatches:attempt[0]+attempt[1]===target[0]+target[1],productMatches:attempt[0]*attempt[1]===target[0]*target[1]};
}
export function testSolution(pair:[number,number],x:number){const factors=pair.map(n=>x+n) as [number,number];return {factors,product:factors[0]*factors[1],isSolution:factors[0]===0||factors[1]===0};}
