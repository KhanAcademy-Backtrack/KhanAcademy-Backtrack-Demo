import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyRotationForm,dailyForm,formItems,formFromKey,itemById} from '../src/lib/mock/forms.ts';

test('sixty consecutive daily sets contain 180 distinct question IDs and question bodies',()=>{
 for(const start of ['2026-09-30','2026-12-18','2027-02-08']){
  const ids=new Set(),bodies=new Set(),subjects=new Set();
  for(let n=0;n<60;n++){const date=new Date(start+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+n);const key=date.toISOString().slice(0,10).replaceAll('-',''),form=dailyRotationForm(key);assert.ok(form);assert.deepEqual(formFromKey('daily2~'+key),form);assert.equal(formItems(form).length,3);for(const id of formItems(form)){const item=itemById(id);assert.ok(item);assert.equal(new Set(item.choices).size,4);ids.add(id);bodies.add(`${item.passageId??''}|${item.stem}|${item.choices.join('|')}`);subjects.add(item.subtest);}}
  assert.equal(ids.size,180,start);assert.equal(bodies.size,180,start);assert.equal(subjects.size,4);
 }
});
test('new daily keys reject impossible dates and keep older daily keys unchanged',()=>{
 for(const value of ['20260230','20261301','bad','20251231'])assert.equal(dailyRotationForm(value),undefined);
 assert.deepEqual(formItems(dailyForm('20260930')),['m_polygon_angles:20260930-0','s_ohm:20260930-0','lang_vocab_08']);assert.deepEqual(formFromKey('daily~20260930'),dailyForm('20260930'));
});
