import test from 'node:test';
import assert from 'node:assert/strict';
import {recallPrompt,recallNext} from '../src/lib/program/recall.ts';
import {CHAPTER_IDS} from '../src/content/reviewer/ids.ts';
import {CHAPTERS} from '../src/content/reviewer/index.ts';
import {CONCEPTS} from '../src/lib/program/concepts.ts';
import {dailyForm,formItems,formFromKey} from '../src/lib/mock/forms.ts';

test('Still hard concepts, chapter cards and mock misses all surface in recall',()=>{
 for(const c of CONCEPTS)assert.ok(recallPrompt(`concept:${c.id}`)?.back.length);
 for(const c of CHAPTERS)c.recall.forEach((r,i)=>assert.deepEqual(recallPrompt(`card:${c.id}:${i}`).back,[r.back]));
 for(const id of formItems(dailyForm('20260930')))assert.ok(recallPrompt(`item:${id}`)?.front);
 assert.equal(recallPrompt('concept:missing'),undefined);
});
test('recall self-reports space another look without advancing twice in a day',()=>{
 const now=Date.UTC(2026,8,30,12),card={stage:0,last:now-86400000,due:now};
 const first=recallNext(card,true,now),again=recallNext(first,true,now+1000);
 assert.equal(first.stage,1);assert.equal(again.stage,1);
 assert.equal(recallNext(first,false,now).stage,0);
});
test('form keys reject malformed seeds before rebuilding generated items',()=>{
 for(const key of ['daily~2026/09/30','topic~percent_fractions|evil~seed','full~a.b','section~math|'])assert.equal(formFromKey(key),undefined,key);
 assert.ok(formFromKey('section~math|20260930'));
});

test('the lightweight chapter catalog stays in sync with the reviewer bank',()=>{assert.deepEqual([...CHAPTER_IDS],CHAPTERS.map(c=>c.id));});
