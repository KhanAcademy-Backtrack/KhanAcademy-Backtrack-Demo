import {pairKey} from './recovery.ts';
import {beginSession,packFromKhan,planSession,skillKey,type StudyState} from './study.ts';
import {khanEntry} from './khan-entry.ts';
import {savedExplore,type ExploreItem} from './explore.ts';

/** Exploration is exposure, never an independent assessment or an effort award. */
export function exposeExplore(s:StudyState,item:ExploreItem,at:number):StudyState{
 const keys=(item.exposures??[]).map(expression=>`${skillKey(item.topic,item.skill)}:${expression}`);
 const seen=[...new Set([...s.seen,...keys])];
 const pairs=[...new Set([...(s.pairs[item.topic]??[]),...(item.pairs??[]).map(pairKey)])];
 const history=savedExplore(s.explore);
 if(history.last===item.id&&seen.length===s.seen.length&&pairs.length===(s.pairs[item.topic]?.length??0))return s;
 return {...s,seen,pairs:item.pairs?{...s.pairs,[item.topic]:pairs}:s.pairs,explore:{...history,last:item.id},updatedAt:at};
}
export function saveExplore(s:StudyState,item:ExploreItem,at:number):StudyState{
 const history=savedExplore(s.explore),saved=history.saved.includes(item.id)?history.saved.filter(id=>id!==item.id):[...history.saved,item.id];
 return {...s,explore:{...history,saved},updatedAt:at};
}
export function answerExplore(s:StudyState,item:ExploreItem,choice:number,at:number):StudyState{
 if(!Number.isInteger(choice)||choice< -1||choice>=item.choices.length)return s;
 const exposed=exposeExplore(s,item,at),history=savedExplore(exposed.explore);
 return {...exposed,explore:{...history,answers:{...history.answers,[item.id]:choice}},updatedAt:at};
}
export function startExploreSession(s:StudyState,item:ExploreItem,at:number):StudyState{
 const entry=khanEntry(item.entryId)!;const pack=packFromKhan(entry),exposed=exposeExplore(s,item,at);
 const prepared={...exposed,packs:[...exposed.packs.filter(p=>p.id!==pack.id),pack]};
 const session=planSession(prepared,pack,5,'challenge',at);
 session.tasks=[{...session.tasks[0],skill:item.skill,mode:'challenge',reason:'Try a different question after exploring the idea.'}];
 return beginSession(prepared,session,at);
}
