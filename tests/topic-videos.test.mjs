import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {UPCAT_TOPIC_VIDEOS,UPCAT_NO_VIDEO,SUBJECT_TOPIC_VIDEOS,SUBJECT_NO_VIDEO,outlineVideo,subjectTopicVideo,conceptVideos} from '../src/lib/program/topic-videos.ts';
import {FAMILY_VIDEOS,ITEM_VIDEOS,CONCEPT_VIDEOS} from '../src/lib/program/khan-videos.ts';
import {EXAM_OUTLINES} from '../src/lib/program/exam-outline.ts';
import {SUBJECTS} from '../src/lib/program/college-courses.ts';
import {videoSource} from '../src/lib/video-clips.ts';

const upcat=Object.values(EXAM_OUTLINES.upcat.sections).flat();
const topicVideos=[...Object.values(UPCAT_TOPIC_VIDEOS),...Object.values(SUBJECT_TOPIC_VIDEOS).flatMap(Object.values)];

test('every UPCAT reviewer topic has a Khan video or is listed as having none, never both',()=>{
 const titles=new Set(upcat.flatMap(g=>g.topics.map(t=>t.title)));
 for(const t of titles)assert.ok(Object.hasOwn(UPCAT_TOPIC_VIDEOS,t)!==UPCAT_NO_VIDEO.has(t),t);
 for(const k of [...Object.keys(UPCAT_TOPIC_VIDEOS),...UPCAT_NO_VIDEO])assert.ok(titles.has(k),`unknown UPCAT topic ${k}`);
 assert.ok(Object.keys(UPCAT_TOPIC_VIDEOS).length>=titles.size*0.8,'most topics have a video');
});

test('a Filipino topic never gets an English video',()=>{
 const fil=upcat.filter(g=>['Gramatikang Filipino','Talasalitaang Filipino'].includes(g.name)).flatMap(g=>g.topics.map(t=>t.title));
 assert.ok(fil.length>=10);
 for(const t of fil){assert.equal(outlineVideo('upcat',t),undefined,t);assert.ok(UPCAT_NO_VIDEO.has(t));}
});

test('every college subject topic has a Khan video or is listed as having none, never both',()=>{
 for(const s of SUBJECTS){
  const none=new Set(SUBJECT_NO_VIDEO[s.id]??[]),map=SUBJECT_TOPIC_VIDEOS[s.id]??{};
  for(const t of s.topics)assert.ok(Object.hasOwn(map,t)!==none.has(t),`${s.id}: ${t}`);
  for(const k of [...Object.keys(map),...none])assert.ok(s.topics.includes(k),`${s.id}: unknown topic ${k}`);
 }
 const ids=new Set(SUBJECTS.map(s=>s.id));
 for(const k of [...Object.keys(SUBJECT_TOPIC_VIDEOS),...Object.keys(SUBJECT_NO_VIDEO)])assert.ok(ids.has(k),`unknown subject ${k}`);
 const total=SUBJECTS.reduce((n,s)=>n+s.topics.length,0),mapped=SUBJECTS.reduce((n,s)=>n+s.topics.filter(t=>subjectTopicVideo(s.id,t)).length,0);
 assert.ok(mapped>=total*0.8,`${mapped} of ${total} subject topics have a video`);
});

test('topic videos are full Khan videos, and one id always means one page',()=>{
 for(const v of topicVideos){
  assert.match(v.id,/^[A-Za-z0-9_-]{11}$/,v.title);
  assert.match(v.url,/^https:\/\/www\.khanacademy\.org\/(math|science|ela|test-prep|computing|humanities)\/[^?#\s]+\/v\/[a-z0-9_-]+$/,v.url);
  assert.match(v.checked,/^2026-\d\d-\d\d$/);
  assert.ok(v.title.trim().length>0&&!/\(video\)|Khan Academy$/.test(v.title),v.title);
  assert.doesNotThrow(()=>videoSource(v.id,'https://khanpanion.vercel.app'));
 }
 const all=[...topicVideos,...Object.values(FAMILY_VIDEOS),...Object.values(ITEM_VIDEOS),...Object.values(CONCEPT_VIDEOS)];
 const byUrl=new Map();for(const v of all){const seen=byUrl.get(v.url);if(seen)assert.equal(seen.id,v.id,`${v.url} has one video`);byUrl.set(v.url,v);}
});

test('lookups are safe and limited to what is mapped',()=>{
 assert.equal(outlineVideo('dcat','Circles'),undefined,'only the UPCAT outline is mapped');
 assert.ok(outlineVideo('upcat','Circles'));
 assert.equal(outlineVideo('upcat','toString'),undefined);
 assert.equal(subjectTopicVideo('toString','x'),undefined);
 assert.equal(subjectTopicVideo('calculus1','constructor'),undefined);
 const geo=conceptVideos('geometry');
 assert.ok(geo.length>=3,'the geometry summary lists several topic videos');
 assert.equal(new Set(geo.map(x=>x.video.id)).size,geo.length,'one row per distinct video');
 for(const {topic} of geo)assert.ok(upcat.some(g=>g.topics.some(t=>t.title===topic&&t.concepts?.includes('geometry'))));
 assert.deepEqual(conceptVideos('filipino_gramatika'),[]);
 assert.deepEqual(conceptVideos('not_a_concept'),[]);
});

test('every topic video id and page is in the third-party log',()=>{
 const log=readFileSync(new URL('../docs/THIRD_PARTY_MATERIALS.md',import.meta.url),'utf8');
 for(const v of topicVideos){assert.ok(log.includes(v.id),`${v.id} missing`);assert.ok(log.includes(v.url+')'),`${v.url} missing`);}
});
