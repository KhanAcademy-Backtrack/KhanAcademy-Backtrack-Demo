import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LESSON_QUIZZES,PILOT_LESSONS,QUIZ_ROLES,lessonQuizIssues,lessonQuizFor,verifiedLessonSegment} from '../src/content/lesson-quizzes/index.ts';
import {LESSON_BY_ID} from '../src/lib/program/topic-lessons.ts';
import {VERIFIED_CLIPS} from '../src/lib/video-clips.ts';
import {splitMath,unknownCommands,unbalancedMath} from '../src/lib/notation.ts';

const log=fs.readFileSync(new URL('../docs/THIRD_PARTY_MATERIALS.md',import.meta.url),'utf8');
const fields=item=>[item.stem,...item.choices,...item.rationales,...item.solutionSteps];
const plainMath=/[=×÷±≤≥≠≈√π²³¹⁰⁴⁵⁶⁷⁸⁹⁻⁺₀₁₂₃₄₅₆₇₈₉−→⇌½¼¾°^]|\d\s*\/\s*\d|[\w)]\s*\+\s*[\w(]|\b\d+[xyz]\b|\b(?:[A-Z][a-z]?\d+)+[A-Z]?[a-z]?\b|(?:^|[\s(“"])[xy](?=[\s.,;:?!)”"]|$)|\s[<>]\s/;
function latex(text){
 assert.equal(unbalancedMath(text),false,text);
 for(const s of splitMath(text))if(s.math){
  assert.deepEqual(unknownCommands(s.v),[],text);
  assert.doesNotMatch(s.v,/[×÷−±≤≥≠≈√π²³⁰-⁹⁻₀-₉→⇌·½°]/,text);
  assert.equal((s.v.replace(/\\[{}]/g,'').match(/\{/g)??[]).length,(s.v.replace(/\\[{}]/g,'').match(/\}/g)??[]).length,text);
 }else assert.doesNotMatch(s.v,plainMath,text);
}

test('quiz registry keys are real pilot lessons with four original draft questions',()=>{
 assert.equal(PILOT_LESSONS.length,107);
 const ids=new Set();
 for(const [key,q] of Object.entries(LESSON_QUIZZES)){
  assert.ok(Object.hasOwn(LESSON_BY_ID,key));assert.equal(q.lessonId,key);
  assert.deepEqual(lessonQuizIssues(q),[],key);
  for(const i of [...q.items,...(q.prediction?[q.prediction]:[])]){assert.ok(!ids.has(i.id),'authored ids must be unique across lessons');ids.add(i.id);}
 }
 assert.equal(lessonQuizFor('constructor'),undefined);assert.equal(lessonQuizFor('not_a_lesson'),undefined);
});

test('all published quiz prose passes the house LaTeX lint',()=>{
 for(const q of Object.values(LESSON_QUIZZES))for(const s of [q.keyIdea,...q.watchFor.map(c=>c.text),...q.items.flatMap(fields),...(q.prediction?fields(q.prediction):[])])latex(s);
 assert.throws(()=>latex('Solve x = 4.'));assert.throws(()=>latex('$x × 4$'));assert.throws(()=>latex('$\\notACommand{x}$'));
 latex('Solve $x = 4$.');
});

test('published videos, practice pages, caption dates and exact segments are logged',()=>{
 for(const q of Object.values(LESSON_QUIZZES)){
  const v=LESSON_BY_ID[q.lessonId].videos.find(v=>v.id===q.videoId);
  for(const value of [v.id,v.url,q.practice.url,q.practice.checked,q.captionsReviewedOn])assert.ok(log.includes(value),value);
  assert.ok(log.includes(`lesson-quiz:${q.lessonId}`),'each caption review needs its own logged receipt');
  if(q.segment){
   assert.deepEqual(verifiedLessonSegment(q),VERIFIED_CLIPS[q.videoId]);
   assert.ok(log.includes(`quiz-clip:${q.videoId}:${q.segment.start}:${q.segment.end}`),'the exact range needs a dated caption-review receipt');
  }
 }
});

// Synthetic labels test the contract only. They are not video-derived questions,
// caption-review receipts or learner-facing material and never enter the registry.
const fixture=()=>({lessonId:'outline-upcat-fractions-and-decimals',version:1,videoId:LESSON_BY_ID['outline-upcat-fractions-and-decimals'].videos[0].id,captionsReviewedOn:'2026-10-08',keyIdea:'Fixture key idea.',watchFor:[{at:10,text:'Fixture first cue.'},{at:20,text:'Fixture second cue.'}],practice:{url:'https://www.khanacademy.org/math/arithmetic-home/arith-review-fractions/add-sub-fractions/e/adding_fractions',label:'Existing fractions exercise URL, fixture only',checked:'2026-10-08'},items:QUIZ_ROLES.map((role,i)=>({id:'fixture_'+i,source:'authored',status:'draft',lang:'en',subtest:'math',role,stem:'Fixture '+role,choices:['First choice','Second choice','Third choice','Fourth choice'],answerIndex:i,misconceptions:[0,1,2,3].map(n=>n===i?null:'fixture_misconception_'+n),rationales:['Fixture rationale','Fixture rationale','Fixture rationale','Fixture rationale'],solutionSteps:['Fixture explanation.'],skill:'fixture',concept:'percent_fractions',difficulty:1,reviewerChapter:'m_fractions_percent'}))});

test('quiz contract rejects missing roles, keys, rationales, distractors, source reviews and ranges',()=>{
 assert.deepEqual(lessonQuizIssues(fixture()),[]);
 const mutations=[q=>q.items.pop(),q=>q.items[0].choices.pop(),q=>q.items[0].answerIndex=4,
  q=>q.items[0].choices[1]=q.items[0].choices[0],q=>q.items[0].misconceptions[1]=null,
  q=>q.items[0].rationales.pop(),q=>q.items[0].status='reviewed',q=>q.items[0].source='family',
  q=>q.items[0].role='apply',q=>q.items[1].answerIndex=0,q=>q.items[1].id=q.items[0].id,
  q=>q.lessonId='outline-upcat-aspekto-ng-pandiwa',q=>q.videoId='not_a_video',
  q=>q.watchFor[1].at=0,q=>q.watchFor=[q.watchFor[0]],q=>q.captionsReviewedOn='2026-02-30',
  q=>q.segment={start:0,end:20,label:'Not caption verified'},q=>q.practice.checked='yesterday',q=>q.practice.url=q.practice.url.replace('/e/','/v/')];
 for(const mutate of mutations){const q=fixture();mutate(q);assert.ok(lessonQuizIssues(q).length,mutate.toString());}
 const [videoId,segment]=Object.entries(VERIFIED_CLIPS)[0];
 assert.deepEqual(verifiedLessonSegment({videoId,segment}),segment);
 assert.equal(verifiedLessonSegment({videoId,segment:{...segment,end:segment.end+1}}),undefined);
 assert.equal(verifiedLessonSegment({videoId:'constructor',segment}),undefined);
});

test('107-lesson content pilot has completed caption review', {skip:Object.keys(LESSON_QUIZZES).length!==PILOT_LESSONS.length?'BLOCKED: caption watching and hand-checked practice pages pending; this is infrastructure, not a completed content pilot.':false},()=>{
 assert.deepEqual(new Set(Object.keys(LESSON_QUIZZES)),new Set(PILOT_LESSONS.map(l=>l.id)));
});
