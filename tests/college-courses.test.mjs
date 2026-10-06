import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {SUBJECTS,SUBJECT_BY_ID,COLLEGE_UNITS,COLLEGE_VIDEOS,collegeUnitUrl,KIND_LABEL} from '../src/lib/program/college-courses.ts';
import {PROGRAMS,PROGRAM_BY_ID,RETIRED_PROGRAMS} from '../src/lib/program/bridge.ts';
import {CONCEPT_BY_ID} from '../src/lib/program/concepts.ts';
import {TOPICS} from '../src/lib/recovery.ts';
import {formFromKey,formItems,placementForm} from '../src/lib/mock/forms.ts';
import {videoSource} from '../src/lib/video-clips.ts';
import {KHAN_UNITS} from '../src/lib/program/khan-units.ts';

test('every field lists real college subjects, and every subject belongs to a field',()=>{
 const used=new Set();
 for(const p of PROGRAMS){
  assert.ok(p.subjects.length>=8,`${p.id} offers a real choice of subjects`);
  assert.equal(new Set(p.subjects).size,p.subjects.length,`${p.id} lists a subject twice`);
  for(const id of p.subjects){assert.ok(SUBJECT_BY_ID[id],`${p.id} ${id}`);used.add(id);}
  assert.ok(new Set(p.subjects.map(id=>SUBJECT_BY_ID[id].kind)).size>=2,`${p.id} mixes kinds of subject`);
 }
 for(const s of SUBJECTS)assert.ok(used.has(s.id),`${s.id} is in no field`);
});

test('subjects are complete: ids, topics, units, videos and foundations',()=>{
 assert.equal(new Set(SUBJECTS.map(s=>s.id)).size,SUBJECTS.length);
 for(const s of SUBJECTS){
  assert.match(s.id,/^\w+$/,s.id);
  assert.ok(KIND_LABEL[s.kind],s.id);
  assert.ok(['First year','Second year','Elective'].includes(s.level),s.id);
  assert.ok(s.summary.length>30&&s.summary.length<220,`${s.id} summary length`);
  assert.ok(s.topics.length>=5,`${s.id} has at least five topics`);
  assert.equal(new Set(s.topics).size,s.topics.length,`${s.id} repeats a topic`);
  assert.ok(s.units.length>=1&&s.videos.length>=1,`${s.id} has Khan units and a video`);
  for(const u of s.units)assert.ok(COLLEGE_UNITS[u],`${s.id} unit ${u}`);
  for(const c of s.buildsOn)assert.ok(CONCEPT_BY_ID[c],`${s.id} builds on ${c}`);
  if(s.engine)assert.ok(TOPICS[s.engine],`${s.id} engine ${s.engine}`);
 }
});

test('college units are separate from the reviewer’s senior high units and point at Khan pages',()=>{
 const paths=new Set();
 for(const [id,u] of Object.entries(COLLEGE_UNITS)){
  assert.equal(u.id,id);assert.match(id,/^\w+$/);
  assert.ok(!Object.hasOwn(KHAN_UNITS,id),`${id} collides with a reviewer unit id`);
  assert.match(u.path,/^\/(math|science|computing|test-prep|humanities)\/[\w:-]+(?:\/[\w:-]+)?$/,u.path);
  assert.ok(!paths.has(u.path),`${u.path} listed twice`);paths.add(u.path);
  assert.match(collegeUnitUrl(id),/^https:\/\/www\.khanacademy\.org\//);
  assert.doesNotMatch(u.path,/matatag|senior-high-school|shs-/,'college units are not the senior high reviewer courses');
 }
});

test('every college video is a full Khan video with an embeddable id',()=>{
 const ids=new Map();
 for(const v of Object.values(COLLEGE_VIDEOS)){
  assert.match(v.id,/^[A-Za-z0-9_-]{11}$/,v.title);
  assert.match(v.url,/^https:\/\/www\.khanacademy\.org\/(math|science|computing|test-prep|humanities)\/[^?#\s]+\/v\/[a-z0-9_-]+$/,v.url);
  assert.ok(v.title.trim().length>0);
  assert.doesNotThrow(()=>videoSource(v.id,'https://khanpanion.vercel.app'));
  assert.ok(!ids.has(v.id)||ids.get(v.id)===v.url,`${v.id} points at one page`);ids.set(v.id,v.url);
 }
});

test('the computing field leads with programming and still takes calculus',()=>{
 const cs=PROGRAM_BY_ID.cs_it.subjects.map(id=>SUBJECT_BY_ID[id]);
 assert.ok(cs.filter(s=>s.kind==='programming').length>=6,'several coding subjects');
 assert.ok(cs.some(s=>s.id==='calculus1')&&cs.some(s=>s.id==='calculus2'),'calculus I and II');
 assert.ok(PROGRAM_BY_ID.statistics.subjects.filter(id=>SUBJECT_BY_ID[id].kind==='statistics').length>=5);
});

test('retired fields are gone from Courses but their saved placement checks still open',()=>{
 for(const id of Object.keys(RETIRED_PROGRAMS)){
  assert.equal(PROGRAM_BY_ID[id],undefined,`${id} is not offered`);
  const f=formFromKey(`placement~${id}|20261001`);assert.ok(f&&formItems(f).length>0,`${id} placement still rebuilds`);
  assert.deepEqual(placementForm(id,'20261001'),f);
 }
 assert.equal(RETIRED_PROGRAMS.business.movedTo,'statistics');assert.ok(PROGRAM_BY_ID.statistics);
 assert.equal(placementForm('toString','1'),undefined,'prototype keys are not fields');
});

test('every college unit and video is recorded in the third-party log',()=>{
 const log=readFileSync(new URL('../docs/THIRD_PARTY_MATERIALS.md',import.meta.url),'utf8');
 for(const id of Object.keys(COLLEGE_UNITS))assert.ok(log.includes(collegeUnitUrl(id)+')'),`${collegeUnitUrl(id)} missing from docs/THIRD_PARTY_MATERIALS.md`);
 for(const v of Object.values(COLLEGE_VIDEOS)){assert.ok(log.includes(v.id),`${v.id} missing`);assert.ok(log.includes(v.url),`${v.url} missing`);}
});
