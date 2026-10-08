import test from 'node:test';
import assert from 'node:assert/strict';
import {initialProgram,validProgram} from '../src/lib/program/store.ts';
import {initialStudy} from '../src/lib/study.ts';
import {findGaps} from '../src/lib/gaps.ts';
import {activeLessonCheck,beginLessonCheck,chooseLessonAnswer,checkLessonAnswer,recordLessonPrediction,openLessonPractice,reportLessonPractice} from '../src/lib/program/lesson-checks.ts';

// Identity-only fixture: no authored teaching content or false caption receipt.
const q={lessonId:'outline-upcat-fractions-and-decimals',version:1,items:[0,1,2,3].map(i=>({id:'fixture_'+i}))};
const finish=(s)=>{for(let i=0;i<4;i++){s=chooseLessonAnswer(s,q,i,i,30+i);s=checkLessonAnswer(s,q,i,30+i);}return s;};

test('lesson quiz writes only its separate record and never creates or clears gaps',()=>{
 const initial=initialProgram(),study=initialStudy(),studyCopy=structuredClone(study),gaps=findGaps(study,initial.attempts,100);
 let s=beginLessonCheck(initial,q,10);assert.equal(beginLessonCheck(s,q,11),s);
 s=recordLessonPrediction(s,q,1,false,12);
 s=chooseLessonAnswer(s,q,0,'idk',15);s=checkLessonAnswer(s,q,0,16);
 assert.equal(checkLessonAnswer(s,q,0,17),s);assert.equal(chooseLessonAnswer(s,q,0,3,17),s);
 s=finish(s);s=recordLessonPrediction(s,q,2,true,40);s=openLessonPractice(s,q,41);s=reportLessonPractice(s,q,'still_difficult',42);
 assert.ok(validProgram(s));assert.equal(activeLessonCheck(s,q).completedAt,33);
 for(const key of Object.keys(initial))assert.deepEqual(s[key],initial[key],key);
 assert.deepEqual(study,studyCopy);assert.deepEqual(findGaps(study,s.attempts,100),gaps);
 assert.deepEqual(activeLessonCheck(s,q).practice,{openedAt:41,reportedAt:42,report:'still_difficult'});
 assert.equal(activeLessonCheck(s,q).answers[0],'idk');
});

test('retakes replace bounded practice without treating the same authored ids as fresh',()=>{
 const done=finish(beginLessonCheck(initialProgram(),q,10));
 const again=beginLessonCheck(done,q,50,true),c=activeLessonCheck(again,q);
 assert.equal(c.runs,2);assert.equal(c.completedAt,undefined);assert.deepEqual(c.itemIds,q.items.map(i=>i.id));
 assert.deepEqual(c.checked,[false,false,false,false]);assert.deepEqual(c.answers,[null,null,null,null]);
 assert.ok(validProgram(again));assert.equal(again.attempts.length,0);assert.deepEqual(again.concepts,{});
 const bounded=beginLessonCheck({...again,lessonChecks:{[q.lessonId]:{...c,runs:1000}}},q,60,true);
 assert.equal(activeLessonCheck(bounded,q).runs,1000);
});

test('invalid calls, premature reports and changed authored versions do not corrupt a save',()=>{
 const empty=initialProgram(),s=beginLessonCheck(empty,q,10);
 assert.equal(checkLessonAnswer(s,q,0,11),s);assert.equal(checkLessonAnswer(s,q,-1,11),s);
 assert.equal(chooseLessonAnswer(s,q,0,4,11),s);assert.equal(chooseLessonAnswer(s,q,4,1,11),s);
 assert.equal(chooseLessonAnswer(s,q,0,1,NaN),s);assert.equal(recordLessonPrediction(s,q,1,true,11),s);
 assert.equal(openLessonPractice(s,q,11),s);assert.equal(reportLessonPractice(s,q,'completed',11),s);
 assert.equal(beginLessonCheck(empty,{...q,lessonId:'constructor'},10),empty);
 assert.equal(activeLessonCheck(s,{...q,version:2}),undefined);
 assert.equal(activeLessonCheck(s,{...q,items:[{id:'changed'},...q.items.slice(1)]}),undefined);
 const renewed=beginLessonCheck(s,{...q,version:2},5);assert.equal(renewed.lessonChecks[q.lessonId].startedAt,10);
 assert.ok(validProgram(renewed));
});
