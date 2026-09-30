import {validDay} from './program/store.ts';
import {DEVICE_RESET_KEY} from './device-data.ts';

export const GROUP_API='https://zkznurjruubtolygomdy.supabase.co/functions/v1/study-groups';
export const GROUP_DEVICE_KEY='backtrack.groups.device.v1';
export type GroupCheckin={studyDays:number|null;missions:number|null;mockCorrect:number|null;mockTotal:number|null;postedAt:string};
export type GroupMember={id:string;nickname:string;isMe:boolean;isOwner:boolean;joinedAt:string;checkin:GroupCheckin|null};
export type GroupSnapshot={group:{id:string;code:string;name:string;goal:number;isOwner:boolean};weekStart:string;members:GroupMember[]};
export type GroupAction='create'|'join'|'snapshot'|'checkin'|'rename'|'goal'|'leave';
export class GroupError extends Error{readonly status:number;constructor(message:string,status:number){super(message);this.name='GroupError';this.status=status;}}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function isGroupSnapshot(v:unknown):v is GroupSnapshot{
 if(!object(v)||!object(v.group)||!validDay(v.weekStart)||!Array.isArray(v.members)||v.members.length>30)return false;
 const g=v.group;
 return typeof g.id==='string'&&typeof g.code==='string'&&/^[A-Z0-9]{6}$/.test(g.code)&&typeof g.name==='string'&&g.name.length<=60&&Number.isInteger(g.goal)&&(g.goal as number)>=1&&(g.goal as number)<=7&&typeof g.isOwner==='boolean'
  &&v.members.every(m=>object(m)&&typeof m.id==='string'&&typeof m.nickname==='string'&&m.nickname.length<=32&&typeof m.isMe==='boolean'&&typeof m.isOwner==='boolean'&&typeof m.joinedAt==='string'&&(m.checkin===null||object(m.checkin)&&typeof m.checkin.postedAt==='string'&&['studyDays','missions','mockCorrect','mockTotal'].every(k=>m.checkin!==null&&object(m.checkin)&&(m.checkin[k]===null||Number.isInteger(m.checkin[k])))));
}
let devicePending:Promise<string>|undefined;
async function send(action:string,payload:Record<string,unknown>,token?:string){
 let response:Response|undefined;const marker=localStorage.getItem(DEVICE_RESET_KEY);
 for(let attempt=0;attempt<2;attempt++){
  if(localStorage.getItem(DEVICE_RESET_KEY)!==marker)throw new GroupError('This device was cleared. Open Groups again to reconnect.',409);
  try{response=await fetch(GROUP_API,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({action,...payload}),signal:AbortSignal.timeout(20000)});if(response.status===503&&attempt===0)continue;break;}catch{if(attempt===1)throw new GroupError('Couldn’t connect to your group. Check your connection and try again.',0);}
 }
 if(!response)throw new GroupError('Couldn’t connect to your group. Check your connection and try again.',0);
 let result:unknown;try{result=await response.json();}catch{throw new GroupError('The group service could not respond. Try again shortly.',503);}
 if(!response.ok)throw new GroupError(object(result)&&typeof result.error==='string'?result.error:'The group action could not be completed.',response.status);
 return result;
}
async function device(){
 let stored:string|null=null;try{stored=localStorage.getItem(GROUP_DEVICE_KEY);}catch{throw new GroupError('Allow this browser to save data before joining a group.',0);}
 if(stored&&/^[a-f0-9]{64}$/.test(stored))return stored;
 if(!devicePending){const marker=localStorage.getItem(DEVICE_RESET_KEY);devicePending=(async()=>{const value=await send('session',{});if(localStorage.getItem(DEVICE_RESET_KEY)!==marker)throw new GroupError('This device was cleared. Open Groups again to reconnect.',409);if(!object(value)||typeof value.token!=='string'||!/^[a-f0-9]{64}$/.test(value.token))throw new GroupError('Your device could not connect. Try again.',503);try{localStorage.setItem(GROUP_DEVICE_KEY,value.token);}catch{throw new GroupError('This browser could not save your group connection.',0);}return value.token;})();}
 try{return await devicePending;}finally{devicePending=undefined;}
}
export async function groupAction(action:GroupAction,payload:Record<string,unknown>={}){
 const marker=localStorage.getItem(DEVICE_RESET_KEY);
 const result=await send(action,payload,await device());
 if(localStorage.getItem(DEVICE_RESET_KEY)!==marker)throw new GroupError('This device was cleared. Open Groups again to reconnect.',409);
 if(action==='leave'){if(!object(result)||result.ok!==true)throw new GroupError('The group action could not be confirmed.',503);return null;}
 if(!isGroupSnapshot(result))throw new GroupError('The group response could not be read. Try again.',503);
 return result;
}

/** Paste either a code or an invite link. Only the code is used; no external URL is fetched. */
export function groupCode(value:string){
 const input=value.trim();if(/^[A-Z0-9]{6}$/i.test(input))return input.toUpperCase();
 try{const code=new URL(input).searchParams.get('join');return code&&/^[A-Z0-9]{6}$/i.test(code)?code.toUpperCase():undefined;}catch{return undefined;}
}
