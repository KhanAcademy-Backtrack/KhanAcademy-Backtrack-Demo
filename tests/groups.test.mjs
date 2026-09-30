import test from 'node:test';
import assert from 'node:assert/strict';
import {groupCode,isGroupSnapshot,groupAction,GROUP_DEVICE_KEY} from '../src/lib/groups.ts';
import {DEVICE_RESET_KEY} from '../src/lib/device-data.ts';

test('group invites accept a code or link without fetching arbitrary URLs',()=>{
 assert.equal(groupCode(' abC234 '),'ABC234');assert.equal(groupCode('https://khanpanion.vercel.app/group?join=ABC234'),'ABC234');assert.equal(groupCode('five!'),undefined);assert.equal(groupCode('https://example.org/?join=notvalid'),undefined);
});
test('an in-flight group session cannot repopulate data after the device was cleared',async()=>{
 const storage=new Map(),fetchOriginal=globalThis.fetch,descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');let release,requested;
 const started=new Promise(resolve=>requested=resolve);
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)}});
 globalThis.fetch=async()=>{requested();return new Promise(resolve=>release=resolve);};
 try{const action=groupAction('snapshot',{code:'ABC234'});await started;storage.set(DEVICE_RESET_KEY,'new-marker');release(new Response(JSON.stringify({ok:true,token:'1'.repeat(64)}),{status:200}));await assert.rejects(action,/device was cleared/i);assert.equal(storage.has(GROUP_DEVICE_KEY),false);}finally{globalThis.fetch=fetchOriginal;if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else delete globalThis.localStorage;}
});
test('group snapshots require real group metadata, bounded goals and named members',()=>{
 const s={group:{id:'group-id',code:'ABC234',name:'Friday review',goal:4,isOwner:true},weekStart:'2026-09-28',members:[{id:'member-id',nickname:'Kai',isMe:true,isOwner:true,joinedAt:'2026-09-30',checkin:{studyDays:2,missions:null,mockCorrect:null,mockTotal:null,postedAt:'2026-09-30'}}]};
 assert.ok(isGroupSnapshot(s));for(const patch of [{goal:0},{goal:8},{code:'bad'}])assert.equal(isGroupSnapshot({...s,group:{...s.group,...patch}}),false);assert.equal(isGroupSnapshot({...s,weekStart:'2026-02-30'}),false);assert.equal(isGroupSnapshot({...s,members:[{nickname:'Someone'}]}),false);
});
