import {initialStudy,ingestRecovery,STUDY_KEY,validStudy,type StudyState} from './study.ts';
import {validRecovery,type Recovery} from './recovery.ts';
export type StudyStorage=Pick<Storage,'length'|'key'|'getItem'|'setItem'>;
export function loadStudy(storage:StudyStorage,now:number):{state:StudyState;warning:string;writesBlocked:boolean}{
  let state=initialStudy(),warning='',writesBlocked=false;
  try{
    const raw=storage.getItem(STUDY_KEY);
    if(raw){try{const parsed=JSON.parse(raw);if(!validStudy(parsed))throw Error('Unrecognized save');state=parsed;}catch{try{storage.setItem(`backtrack.study.backup.${now}`,raw);warning='An older save needs attention. A backup has been kept; you can export it from My study space.';}catch{writesBlocked=true;warning='Saving is paused to protect an unreadable earlier save. Export or clear it from My study space.';}}}
    const routes:Recovery[]=[];
    for(let i=0;i<storage.length;i++){const key=storage.key(i);if(!key?.startsWith('backtrack.route.v1.'))continue;try{const data=JSON.parse(storage.getItem(key)??'null');if(data?.sampleMode!==true&&validRecovery(data))routes.push(data);}catch{}}
    for(const route of routes.sort((a,b)=>a.updatedAt-b.updatedAt))state=ingestRecovery(state,route,now);
  }catch{warning='Saved study data could not be opened. This session can still run.';writesBlocked=true;}
  return {state,warning,writesBlocked};
}
export function readStudyImport(raw:string):StudyState{
  if(raw.length>5_000_000)throw Error('Choose a study-space file smaller than 5 MB.');
  let data;try{data=JSON.parse(raw);}catch{throw Error('This file is not readable study data.');}
  if(data?.version===1&&data.entries&&typeof data.entries[STUDY_KEY]==='string'){
    try{data=JSON.parse(data.entries[STUDY_KEY]);}catch{throw Error('The earlier study space in this backup needs repair.');}
  }
  if(!validStudy(data))throw Error('This is not a supported study-space export.');return data;
}

export function listStudyBackups(storage:StudyStorage){
  const backups:{key:string;at:number;kind:'earlier-save'|'before-restore'}[]=[];
  for(let i=0;i<storage.length;i++){const key=storage.key(i);if(!key||!/^backtrack\.(?:study|restore)\.backup\.\d+$/.test(key))continue;const at=Number(key.split('.').at(-1));if(!Number.isFinite(at)||at>=8.64e15)continue;backups.push({key,at,kind:key.startsWith('backtrack.restore.')?'before-restore':'earlier-save'});}
  return backups.sort((a,b)=>b.at-a.at).slice(0,5);
}

/** A restore replaces the whole learning snapshot, including old route caches. */
export function restoreStudy(storage:StudyStorage & Pick<Storage,'removeItem'>,next:StudyState,now:number):StudyState{
  if(!validStudy(next))throw Error('Unsupported study-space data.');
  const previous:Record<string,string>={};
  for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key&&(key===STUDY_KEY||key.startsWith('backtrack.route.v1.')||key==='backtrack.together.v1')){const value=storage.getItem(key);if(value!==null)previous[key]=value;}}
  // Keep the backup before changing any live keys; a full store stops here.
  storage.setItem(`backtrack.restore.backup.${now}`,JSON.stringify({version:1,entries:previous}));
  const restored={...next,updatedAt:now};
  try{
    storage.setItem(STUDY_KEY,JSON.stringify(restored));
    for(const key of Object.keys(previous))if(key!==STUDY_KEY)storage.removeItem(key);
  }catch(error){
    for(const [key,value] of Object.entries(previous))storage.setItem(key,value);
    if(!(STUDY_KEY in previous))storage.removeItem(STUDY_KEY);
    throw error;
  }
  return restored;
}
