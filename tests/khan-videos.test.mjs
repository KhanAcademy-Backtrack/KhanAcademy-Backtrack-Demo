import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {FAMILY_VIDEOS,ITEM_VIDEOS,CONCEPT_VIDEOS,NO_VIDEO,videoFor} from '../src/lib/program/khan-videos.ts';
import {FAMILIES,generateItem} from '../src/lib/mock/families/index.ts';
import {CONCEPTS} from '../src/lib/program/concepts.ts';
import {itemById} from '../src/lib/mock/forms.ts';
import {videoSource} from '../src/lib/video-clips.ts';

const all=[...Object.values(FAMILY_VIDEOS),...Object.values(ITEM_VIDEOS),...Object.values(CONCEPT_VIDEOS)];

test('every matched video has a YouTube id, a Khan video page and a check date',()=>{
 for(const v of all){
  assert.match(v.id,/^[A-Za-z0-9_-]{11}$/,v.title);
  assert.match(v.url,/^https:\/\/www\.khanacademy\.org\/(math|science|ela|test-prep)\/[^?#\s]+\/v\/[a-z0-9_-]+$/,v.url);
  assert.match(v.checked,/^2026-\d\d-\d\d$/);
  assert.ok(v.title.trim().length>0);
  assert.doesNotThrow(()=>videoSource(v.id,'https://khanpanion.vercel.app'));
 }
 const paused=new URL(videoSource(all[0].id,'https://khanpanion.vercel.app','focus',undefined,false));
 assert.equal(paused.hostname,'www.youtube-nocookie.com');assert.equal(paused.searchParams.get('autoplay'),'0','the embedded panel player waits for play');
 assert.equal(new URL(videoSource(all[0].id,'https://khanpanion.vercel.app')).searchParams.get('autoplay'),'1','pressed players still start at once');
 const byId=new Map();for(const v of all){const seen=byId.get(v.id);if(seen)assert.equal(seen.url,v.url,`${v.id} points at one page`);byId.set(v.id,v);}
 const byUrl=new Map();for(const v of all){const seen=byUrl.get(v.url);if(seen)assert.equal(seen.id,v.id,`${v.url} has one video`);byUrl.set(v.url,v);}
});

test('every family and every concept is matched or listed as having no video, never both',()=>{
 for(const f of FAMILIES)assert.ok(Object.hasOwn(FAMILY_VIDEOS,f.id)!==NO_VIDEO.has(f.id),f.id);
 for(const c of CONCEPTS)assert.ok(Object.hasOwn(CONCEPT_VIDEOS,c.id)!==NO_VIDEO.has(c.id),c.id);
 const families=new Set(FAMILIES.map(f=>f.id)),concepts=new Set(CONCEPTS.map(c=>c.id));
 for(const k of Object.keys(FAMILY_VIDEOS))assert.ok(families.has(k),`unknown family ${k}`);
 for(const k of Object.keys(CONCEPT_VIDEOS))assert.ok(concepts.has(k),`unknown concept ${k}`);
 for(const k of NO_VIDEO)assert.ok(families.has(k)||concepts.has(k)||itemById(k),`unknown NO_VIDEO key ${k}`);
 for(const k of Object.keys(ITEM_VIDEOS)){const it=itemById(k);assert.ok(it,`unknown item ${k}`);assert.equal(it.source,'authored',`${k} is authored; generated items use their family`);assert.ok(!NO_VIDEO.has(k));}
});

test('a generated item gets its own family’s video or none, never another family’s',()=>{
 for(const f of FAMILIES){
  const it=generateItem(f.id,3),v=videoFor(it);
  if(NO_VIDEO.has(f.id))assert.equal(v,undefined,`${f.id} has no video even though its concept ${f.concept} does`);
  else assert.equal(v,FAMILY_VIDEOS[f.id]);
 }
 assert.ok(Object.hasOwn(CONCEPT_VIDEOS,'word_problems'),'the work-rate family’s concept has a video it must not borrow');
 assert.equal(videoFor({id:'unknown:1',familyId:'not_a_family',concept:'geometry'}),undefined);
});

test('an authored item uses its own video, then its concept’s, else none',()=>{
 assert.equal(videoFor(itemById('sci_cell_03')).id,ITEM_VIDEOS.sci_cell_03.id);
 assert.equal(videoFor(itemById('lang_sva_01')).id,CONCEPT_VIDEOS.grammar_agreement.id);
 assert.equal(videoFor(itemById('lang_usage_01')),undefined,'affect/effect has no Khan match');
 assert.equal(videoFor(itemById('lang_usage_05')).id,ITEM_VIDEOS.lang_usage_05.id);
 assert.equal(videoFor({id:'constructor',concept:'toString'}),undefined,'prototype keys are not videos');
});

test('every video id and page is recorded in the third-party log',()=>{
 const log=readFileSync(new URL('../docs/THIRD_PARTY_MATERIALS.md',import.meta.url),'utf8');
 for(const v of all){assert.ok(log.includes(v.id),`${v.id} missing from docs/THIRD_PARTY_MATERIALS.md`);assert.ok(log.includes(v.url),`${v.url} missing from docs/THIRD_PARTY_MATERIALS.md`);}
});
