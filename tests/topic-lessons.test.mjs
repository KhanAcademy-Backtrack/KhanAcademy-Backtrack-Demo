import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPIC_LESSONS,LESSON_BY_ID,outlineLessonId,subjectLessonId,conceptLessons,subjectLessons} from '../src/lib/program/topic-lessons.ts';
import {EXAM_OUTLINES,topicKey} from '../src/lib/program/exam-outline.ts';
import {SUBJECTS} from '../src/lib/program/college-courses.ts';
import {unknownCommands,unbalancedMath,splitMath} from '../src/lib/notation.ts';
import {DCAT_TOPIC_VIDEOS,DCAT_NO_VIDEO,UPCAT_NO_VIDEO,outlineVideos,subjectTopicVideos} from '../src/lib/program/topic-videos.ts';

test('every outlined and college topic has its own usable material and stable destination',()=>{
 assert.equal(new Set(TOPIC_LESSONS.map(l=>l.id)).size,TOPIC_LESSONS.length);
 for(const [exam,o] of Object.entries(EXAM_OUTLINES))for(const g of Object.values(o.sections).flat())for(const t of g.topics){
  const l=LESSON_BY_ID[outlineLessonId(exam,t.title)];assert.ok(l,t.title);assert.equal(l.saveKey,topicKey(exam,t.title));assert.equal(l.title,t.title);
 }
 for(const s of SUBJECTS){assert.equal(subjectLessons(s.id).length,s.topics.length);for(const t of s.topics)assert.ok(LESSON_BY_ID[subjectLessonId(s.id,t)]);}
 for(const l of TOPIC_LESSONS){
  assert.ok(l.videos.length||l.guide,`No material for ${l.id}`);
  assert.ok(l.videos.length<=3,`Too many players for ${l.id}`);
  if(l.guide)for(const field of ['idea','example','question','answer','trap'])assert.ok(l.guide[field]?.trim(),l.title+' '+field);
 }
 assert.ok(conceptLessons('vocabulary_context').some(l=>l.title==='Synonyms and antonyms'),'written topic is included alongside the videos');
});
test('every DCAT title is mapped or explicitly unmatched, with no unrelated fallback',()=>{
 const titles=Object.values(EXAM_OUTLINES.dcat.sections).flatMap(gs=>gs.flatMap(g=>g.topics.map(t=>t.title)));
 for(const t of titles)assert.ok(Object.hasOwn(DCAT_TOPIC_VIDEOS,t)!==DCAT_NO_VIDEO.has(t),t);
 assert.deepEqual(new Set([...Object.keys(DCAT_TOPIC_VIDEOS),...DCAT_NO_VIDEO]),new Set(titles));
 assert.ok(UPCAT_NO_VIDEO.has('Direct and reported speech'));
 for(const t of Object.values(EXAM_OUTLINES.upcat.sections).flat().filter(g=>['Gramatikang Filipino','Talasalitaang Filipino','Pagbasa sa Filipino'].includes(g.name)).flatMap(g=>g.topics)){
  assert.deepEqual(outlineVideos('upcat',t.title),[]);assert.deepEqual(outlineVideos('dcat',t.title),[]);
  const l=LESSON_BY_ID[outlineLessonId('upcat',t.title)];assert.ok(l.guide);assert.equal(l.videos.length,0);
 }
});
test('compound topics include the distinct material that was missing from their first video',()=>{
 assert.equal(outlineVideos('upcat','Simple derivatives and integrals').length,2);
 assert.equal(outlineVideos('dcat','Age and mixture problems').length,2);
 assert.equal(subjectTopicVideos('data_analysis','Bias and privacy in data').length,2);
 assert.equal(subjectTopicVideos('diffeq','Oscillation and damping')[0].id,'ubFGdZM1ziM');
});
test('original topic-guide mathematics uses balanced, supported LaTeX',()=>{
 for(const l of TOPIC_LESSONS)for(const s of Object.values(l.guide??{})){
  assert.equal(unbalancedMath(s),false,l.id+' '+s);
  for(const seg of splitMath(s))if(seg.math)assert.deepEqual(unknownCommands(seg.v),[],l.id+' '+seg.v);
 }
});
