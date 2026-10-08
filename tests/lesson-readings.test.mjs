import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LESSON_READINGS,NO_READING,readingsFor,readingLabel} from '../src/lib/program/lesson-readings.ts';
import {PILOT_LESSONS} from '../src/content/lesson-quizzes/index.ts';
import {LESSON_BY_ID} from '../src/lib/program/topic-lessons.ts';
import {splitMath,unknownCommands,unbalancedMath} from '../src/lib/notation.ts';

const log=fs.readFileSync(new URL('../docs/THIRD_PARTY_MATERIALS.md',import.meta.url),'utf8');
// The matched video for word problems is a physics example, so its readings are physics articles.
const CROSS_SUBJECT=new Set(['outline-upcat-word-problems']);

test('every pilot lesson has readings or is listed as searched with none',()=>{
 const pilot=new Set(PILOT_LESSONS.map(l=>l.id));
 for(const id of [...Object.keys(LESSON_READINGS),...NO_READING])assert.ok(pilot.has(id)&&Object.hasOwn(LESSON_BY_ID,id),id);
 for(const id of pilot)assert.equal(Object.hasOwn(LESSON_READINGS,id)+NO_READING.includes(id),1,id);
 assert.deepEqual(readingsFor('constructor'),[]);assert.deepEqual(readingsFor('not_a_lesson'),[]);
});

test('readings are hand-read Khan articles with logged receipts',()=>{
 for(const [id,rs] of Object.entries(LESSON_READINGS)){
  assert.ok(rs.length>=1&&rs.length<=2,id);assert.equal(new Set(rs.map(r=>r.url)).size,rs.length,id);
  const science=LESSON_BY_ID[id].section!=='Mathematics';
  for(const r of rs){
   const u=new URL(r.url);
   assert.equal(u.origin,'https://www.khanacademy.org',r.url);assert.match(u.pathname,/\/a\/[\w-]+$/,r.url);assert.equal(u.search+u.hash,'',r.url);
   if(!CROSS_SUBJECT.has(id))assert.match(u.pathname,science?/^\/(?:science|partner-content)\//:/^\/math\//,`${id} must not link another subject: ${r.url}`);
   assert.match(r.title,/\(article\)( \|[^|]+)? \| Khan Academy$/,r.title);assert.match(r.checked,/^\d{4}-\d{2}-\d{2}$/);
   const label=readingLabel(r);assert.ok(label.length>2&&!/\(article\)|\|/.test(label),label);
   assert.ok(r.why.length>0&&r.why.length<=140,r.why);assert.equal(unbalancedMath(r.why),false,r.why);
   for(const s of splitMath(r.why))if(s.math)assert.deepEqual(unknownCommands(s.v),[],r.why);
   const receipt=log.split('\n').find(l=>l.startsWith('- `lesson-reading:'+id+'`'));
   assert.ok(receipt?.includes(r.url)&&receipt.includes(r.title)&&receipt.includes(r.checked),'receipt for '+r.url);
  }
 }
 assert.equal(readingLabel({title:'Learn: What is the ideal gas law? (article) | Khan Academy',url:'',checked:'',why:''}),'What is the ideal gas law?');
 assert.equal(readingLabel({title:'Difference of squares | Factoring quadratics (article) | Khan Academy',url:'',checked:'',why:''}),'Difference of squares');
});
