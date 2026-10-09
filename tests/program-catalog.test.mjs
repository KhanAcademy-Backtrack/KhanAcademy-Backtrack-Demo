import test from 'node:test';
import assert from 'node:assert/strict';
import {CHAPTER_IDS} from '../src/content/reviewer/ids.ts';
import {CHAPTERS} from '../src/content/reviewer/index.ts';
import {formFromKey} from '../src/lib/mock/forms.ts';

test('form keys reject malformed seeds before rebuilding generated items',()=>{
 for(const key of ['daily~2026/09/30','topic~percent_fractions|evil~seed','full~a.b','section~math|'])assert.equal(formFromKey(key),undefined,key);
 assert.ok(formFromKey('section~math|20260930'));
});

test('the lightweight chapter catalog stays in sync with the reviewer bank',()=>{assert.deepEqual([...CHAPTER_IDS],CHAPTERS.map(c=>c.id));});
