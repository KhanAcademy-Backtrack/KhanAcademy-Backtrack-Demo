import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_PROFILE_NAME,PROFILE_KEY,PROFILE_NAME_LIMIT,loadProfileName,normalizeProfileName,saveProfileName} from '../src/lib/program/profile.ts';
import {initialProgram,PROGRAM_KEY} from '../src/lib/program/store.ts';

test('missing, blank and unreadable names use Khanpanion',()=>{
 for(const raw of [null,'broken','null','{}','{"version":2,"name":"Harry"}','{"version":1,"name":42}','{"version":1,"name":"  "}'])assert.equal(loadProfileName({getItem:()=>raw}),DEFAULT_PROFILE_NAME);
 assert.equal(loadProfileName({getItem:()=>{throw Error('Storage unavailable');}}),DEFAULT_PROFILE_NAME);
});
test('names retain their spelling, case and Unicode while removing empty space and controls',()=>{
 assert.equal(normalizeProfileName('  María   de la Cruz  '),'María de la Cruz');
 assert.equal(normalizeProfileName('João\n李\u0000'),'João 李');
 assert.equal(normalizeProfileName('a'.repeat(100)).length,PROFILE_NAME_LIMIT);
 assert.equal(normalizeProfileName('\u0000\u007f'),DEFAULT_PROFILE_NAME);
});
test('editing or resetting a name leaves all learning records intact',()=>{
 const program={...initialProgram(),studyDays:['2026-10-07'],bridgeProgram:'engineering'},records=new Map([[PROGRAM_KEY,JSON.stringify(program)]]);
 const storage={getItem:key=>records.get(key)??null,setItem:(key,value)=>records.set(key,value)};
 assert.equal(saveProfileName(storage,'  Harry Gomez '),'Harry Gomez');
 assert.equal(loadProfileName(storage),'Harry Gomez');
 assert.deepEqual(JSON.parse(records.get(PROFILE_KEY)),{version:1,name:'Harry Gomez'});
 assert.equal(saveProfileName(storage,''),DEFAULT_PROFILE_NAME);
 assert.deepEqual(JSON.parse(records.get(PROGRAM_KEY)),program);
});
test('failed name writes propagate so the interface can report that saving is unavailable',()=>{
 assert.throws(()=>saveProfileName({setItem:()=>{throw Error('Full storage');}},'Harry'),/Full storage/);
});
