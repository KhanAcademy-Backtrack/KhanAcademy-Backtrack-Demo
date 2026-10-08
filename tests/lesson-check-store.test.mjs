import test from 'node:test';
import assert from 'node:assert/strict';
import {initialProgram,validProgram,loadProgram,PROGRAM_KEY,LESSON_CHECK_LIMIT,tidy} from '../src/lib/program/store.ts';
import {TOPIC_LESSONS} from '../src/lib/program/topic-lessons.ts';

const lessonId='outline-upcat-fractions-and-decimals';
const check=()=>({version:1,itemIds:['lesson_recall','lesson_why','lesson_apply','lesson_trap'],startedAt:10,updatedAt:20,runs:1,answers:[0,'idk',null,null],checked:[true,true,false,false]});
const saved=c=>({...initialProgram(),lessonChecks:{[lessonId]:c}});

test('old program saves load unchanged without a lessonChecks field',()=>{
 const old=initialProgram(),data=new Map([[PROGRAM_KEY,JSON.stringify(old)]]);
 const result=loadProgram({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},30);
 assert.equal(result.warning,'');assert.deepEqual(result.state,old);assert.equal(data.size,1);
 assert.ok(validProgram({...old,lessonChecks:{}}));
 assert.equal(Object.hasOwn(tidy(old),'lessonChecks'),false);
});

test('lesson checks validate partial work, unknown answers, completion and separate self-report',()=>{
 assert.ok(validProgram(saved(check())));
 const done={...check(),answers:[0,1,2,'idk'],checked:[true,true,true,true],completedAt:19,predictionBefore:2,predictionAfter:1,practice:{openedAt:19,reportedAt:20,report:'still_difficult'}};
 assert.ok(validProgram(saved(done)));
 const s=saved(done),data=new Map([[PROGRAM_KEY,JSON.stringify(s)]]);
 assert.deepEqual(loadProgram({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},30).state,s);
 for(const key of ['attempts','concepts','notebook','recall','placement','daily','studyDays','missions'])assert.deepEqual(s[key],initialProgram()[key],key);
});

test('lessonChecks rejects malformed, oversized and counterfeit evidence records',()=>{
 const mutations=[null,[],1,'saved',{...check(),version:0},{...check(),version:1.5},{...check(),runs:1001},
  {...check(),answers:[0,1,2]},{...check(),answers:[4,1,2,3]},{...check(),answers:[NaN,1,2,3]},
  {...check(),checked:[true,true,false]},{...check(),checked:[1,true,false,false]},
  {...check(),answers:[null,'idk',null,null]},
  {...check(),itemIds:['same','same','third','fourth']},{...check(),itemIds:['bad/identity','b','c','d']},
  {...check(),startedAt:-1},{...check(),updatedAt:9},{...check(),completedAt:20},
  {...check(),checked:[true,true,true,true],answers:[0,1,2,3]},
  {...check(),predictionBefore:4},{...check(),predictionAfter:1},
  {...check(),practice:{openedAt:20}}, {...check(),independent:true}, {...check(),passed:true}];
 for(const v of mutations)assert.equal(validProgram(saved(v)),false,JSON.stringify(v));
 for(const v of [null,[],{unknown:check()},{constructor:check()},{[lessonId]:check(),bad:check()}])assert.equal(validProgram({...initialProgram(),lessonChecks:v}),false);
 assert.equal(validProgram({...initialProgram(),lessonChecks:Object.fromEntries(Array.from({length:LESSON_CHECK_LIMIT+1},(_,i)=>['extra'+i,check()]))}),false);
 const all=Object.fromEntries(TOPIC_LESSONS.map(l=>[l.id,check()]));
 assert.ok(validProgram({...initialProgram(),lessonChecks:all}));
});

test('completed lesson checks reject impossible self-report chronology and fields',()=>{
 const done={...check(),answers:[0,1,2,3],checked:[true,true,true,true],completedAt:19};
 for(const practice of [{openedAt:18},{openedAt:21},{openedAt:19,report:'completed'},
  {openedAt:19,reportedAt:20},{openedAt:19,reportedAt:18,report:'completed'},
  {openedAt:19,reportedAt:20,report:'passed'},{openedAt:19,verified:true}])assert.equal(validProgram(saved({...done,practice})),false);
 assert.equal(validProgram(saved({...done,completedAt:21})),false);
});
