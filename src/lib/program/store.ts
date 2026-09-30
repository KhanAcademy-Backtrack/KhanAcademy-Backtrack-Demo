import type {Attempt,Triage,Sure} from '../mock/scoring.ts';
import type {ExamId} from './admissions.ts';

/** Device-local program data: the pledge, mock attempts, the calendar, the mistake
 *  notebook and reviewer progress. Stored beside (never inside) the study space so
 *  existing saves keep loading unchanged. No names or identifiers are stored. */
export const PROGRAM_KEY='backtrack.program.v1';
export type Side='admission'|'bridge';
export type Pledge={exam:ExamId;examDate:string;why:string;days:number;minutes:number;when:string;time:string;weekdays:number[];createdAt:number};
export type CalEvent={id:string;date:string;time?:string;minutes?:number;title:string;kind:'study'|'mock'|'custom';concept?:string;done?:boolean};
export type NoteEntry={itemId:string;at:number;formKey:string;chosen:number|null;idk:boolean;triage?:Triage;misconception?:string;concept:string;resolved?:boolean};
export type ConceptProgress={khanOpened?:number;khanDone?:number;read?:number;checks:{at:number;correct:number;total:number}[]};
export type RecallCard={due:number;stage:number;last:number};
export type ProgramState={
 version:1;updatedAt:number;lang:'en'|'fil';
 sides:Record<Side,boolean>;activeSide:Side;
 pledge?:Pledge;bridgeProgram?:string;
 attempts:Attempt[];activeAttempt?:string;
 concepts:Record<string,ConceptProgress>;
 missions:Record<string,{recall?:number;khan?:number;exit?:number}>;
 studyDays:string[];
 events:CalEvent[];
 notebook:NoteEntry[];
 bookmarks:string[];
 recall:Record<string,RecallCard>;
 daily:Record<string,{correct:number;total:number}>;
 group?:{code:string;goal:number;joinedAt:number};
 placement:Record<string,{at:number;correct:number;total:number;weak:string[]}>;
};
export const initialProgram=():ProgramState=>({version:1,updatedAt:0,lang:'en',sides:{admission:false,bridge:false},activeSide:'admission',attempts:[],concepts:{},missions:{},studyDays:[],events:[],notebook:[],bookmarks:[],recall:{},daily:{},placement:{}});

const LIMITS={attempts:80,notebook:400,events:600,studyDays:800};
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown,max=300)=>typeof v==='string'&&v.length<=max;
const num=(v:unknown,lo=0,hi=8.64e15)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
const date=(v:unknown)=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v);
const id=(v:unknown)=>typeof v==='string'&&/^[\w:|~.-]{1,160}$/.test(v);

function validAttempt(a:unknown):a is Attempt{
 if(!obj(a))return false;
 const answers=a.answers,sure=a.sure,seconds=a.seconds,triage=a.triage,elapsed=a.elapsedMs;
 return id(a.id)&&text(a.formKey,200)&&num(a.startedAt)&&num(a.updatedAt)&&(a.submittedAt===undefined||num(a.submittedAt))&&typeof a.timed==='boolean'
  &&obj(answers)&&Object.entries(answers).every(([k,v])=>id(k)&&(v===null||(Number.isInteger(v)&&(v as number)>=0&&(v as number)<4)))
  &&Array.isArray(a.flags)&&a.flags.every(id)&&Array.isArray(a.idk)&&a.idk.every(id)
  &&obj(sure)&&Object.values(sure).every(v=>v==='sure'||v==='unsure')
  &&obj(seconds)&&Object.values(seconds).every(v=>num(v,0,86400))
  &&obj(triage)&&Object.values(triage).every(v=>v==='didnt_know'||v==='careless'||v==='out_of_time')
  &&Number.isInteger(a.section)&&Number.isInteger(a.index)&&num(a.pausedMs)&&obj(elapsed)&&Object.values(elapsed).every(v=>num(v));
}

/** Accepts only well-formed saves. Older saves without newer optional fields pass. */
export function validProgram(x:unknown):x is ProgramState{
 if(!obj(x)||x.version!==1||!num(x.updatedAt))return false;
 if(x.lang!=='en'&&x.lang!=='fil')return false;
 if(!obj(x.sides)||typeof x.sides.admission!=='boolean'||typeof x.sides.bridge!=='boolean')return false;
 if(x.activeSide!=='admission'&&x.activeSide!=='bridge')return false;
 const p=x.pledge;
 if(p!==undefined&&!(obj(p)&&['upcat','dcat','dostsei','pupcet'].includes(p.exam as string)&&date(p.examDate)&&text(p.why,400)&&num(p.days,1,7)&&num(p.minutes,5,240)&&text(p.when,200)&&text(p.time,10)&&Array.isArray(p.weekdays)&&p.weekdays.every(d=>Number.isInteger(d)&&d>=0&&d<7)&&num(p.createdAt)))return false;
 if(x.bridgeProgram!==undefined&&!id(x.bridgeProgram))return false;
 if(!Array.isArray(x.attempts)||x.attempts.length>LIMITS.attempts||!x.attempts.every(validAttempt))return false;
 if(x.activeAttempt!==undefined&&!id(x.activeAttempt))return false;
 if(!obj(x.concepts)||!Object.entries(x.concepts).every(([k,v])=>id(k)&&obj(v)&&Array.isArray(v.checks)&&v.checks.every(c=>obj(c)&&num(c.at)&&num(c.correct)&&num(c.total))))return false;
 if(!obj(x.missions)||!Object.entries(x.missions).every(([k,v])=>date(k)&&obj(v)))return false;
 if(!Array.isArray(x.studyDays)||x.studyDays.length>LIMITS.studyDays||!x.studyDays.every(date))return false;
 if(!Array.isArray(x.events)||x.events.length>LIMITS.events||!x.events.every(e=>obj(e)&&id(e.id)&&date(e.date)&&text(e.title,120)&&['study','mock','custom'].includes(e.kind as string)&&(e.time===undefined||text(e.time,5))&&(e.minutes===undefined||num(e.minutes,1,600))))return false;
 if(!Array.isArray(x.notebook)||x.notebook.length>LIMITS.notebook||!x.notebook.every(n=>obj(n)&&id(n.itemId)&&num(n.at)&&text(n.formKey,200)&&id(n.concept)))return false;
 if(!Array.isArray(x.bookmarks)||!x.bookmarks.every(id))return false;
 if(!obj(x.recall)||!Object.entries(x.recall).every(([k,v])=>id(k)&&obj(v)&&num(v.due)&&num(v.stage,0,10)))return false;
 if(!obj(x.daily)||!Object.entries(x.daily).every(([k,v])=>date(k)&&obj(v)&&num(v.correct)&&num(v.total)))return false;
 if(x.group!==undefined&&!(obj(x.group)&&/^[A-Z0-9]{6}$/.test(String(x.group.code))&&num(x.group.goal,1,100)&&num(x.group.joinedAt)))return false;
 if(!obj(x.placement))return false;
 return true;
}

/** Loads the program save, keeping a backup of anything unreadable. */
export function loadProgram(storage:Pick<Storage,'getItem'|'setItem'>,now:number):{state:ProgramState;warning:string}{
 const raw=storage.getItem(PROGRAM_KEY);
 if(!raw)return {state:initialProgram(),warning:''};
 try{const parsed=JSON.parse(raw);if(validProgram(parsed))return {state:parsed,warning:''};}catch{}
 try{storage.setItem(`backtrack.program.backup.${now}`,raw);}catch{}
 return {state:initialProgram(),warning:'An earlier plan could not be read. A backup was kept in this browser.'};
}

/** Trims every list to its limit so a long-used device never outgrows its save. */
export function tidy(s:ProgramState):ProgramState{
 return {...s,attempts:s.attempts.slice(-LIMITS.attempts),notebook:s.notebook.slice(-LIMITS.notebook),events:s.events.slice(-LIMITS.events),studyDays:[...new Set(s.studyDays)].sort().slice(-LIMITS.studyDays)};
}

export function newAttempt(formKey:string,timed:boolean,now:number):Attempt{
 return {id:`a${now.toString(36)}`,formKey,startedAt:now,updatedAt:now,timed,answers:{},flags:[],idk:[],sure:{},seconds:{},triage:{},section:0,index:0,pausedMs:0,elapsedMs:{}};
}
export type {Attempt,Sure,Triage};
