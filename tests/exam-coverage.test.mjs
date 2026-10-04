import test from 'node:test';
import assert from 'node:assert/strict';
import {EXAMS,EXAM_IDS} from '../src/lib/program/admissions.ts';
import {EXAM_COVERAGE,FILIPINO_CONCEPT_AREA,FILIPINO_EXTRAS,examTopics,hasFilipino,inCoverage,inSection} from '../src/lib/program/exam-coverage.ts';
import {initialProgram,validProgram} from '../src/lib/program/store.ts';
import {SUBTESTS} from '../src/lib/mock/types.ts';
import {CONCEPTS} from '../src/lib/program/concepts.ts';
import {EXTRAS} from '../src/content/reviewer/extras.ts';

const names=exam=>EXAM_COVERAGE[exam].sections.map(s=>s.name);

test('every exam lists its own sections, built from reviewer subjects', () => {
  assert.deepEqual(Object.keys(EXAMS),[...EXAM_IDS]);
  assert.deepEqual(Object.keys(EXAM_COVERAGE).sort(),[...EXAM_IDS].sort());
  for(const [exam,c] of Object.entries(EXAM_COVERAGE)){
    assert.ok(c.sections.length>1,exam);
    assert.equal(new Set(names(exam)).size,c.sections.length,`${exam} has distinct section names`);
    for(const s of c.sections)for(const r of s.reviewer)assert.ok(SUBTESTS.includes(r),`${exam}: ${r}`);
    assert.ok(c.sections.some(s=>s.reviewer.length),`${exam} has reviewer material`);
    assert.match(c.checked,/^\d{4}-\d{2}-\d{2}$/);
  }
});

test('each exam keeps its own section names, not the UPCAT subtests', () => {
  assert.deepEqual(names('upcat'),['Language Proficiency','Reading Comprehension','Mathematics','Science']);
  assert.deepEqual(names('dcat'),['Mathematics','Science','English','Mental Ability']);
  assert.deepEqual(names('pupcet'),['Mathematics','English','Science','General Information','Abstract Reasoning']);
  assert.deepEqual(names('dostsei'),['Creative Reasoning','Language and Literature','Science','Mathematics']);
  assert.deepEqual(names('ustet'),['English','Mathematics','Science','Mental Ability']);
  assert.ok(names('acet').includes('General Knowledge')&&names('acet').includes('Abstract Reasoning'));
  assert.ok(names('plmat').includes('Filipino'));
});

test('Filipino material follows each exam', () => {
  assert.ok(CONCEPTS.some(c=>c.area===FILIPINO_CONCEPT_AREA),'Filipino concepts are found by their area');
  for(const id of FILIPINO_EXTRAS)assert.ok(EXTRAS.some(x=>x.id===id),id);
  for(const exam of ['dcat','dostsei','ustet','acet','tupstat','msusase'])assert.equal(hasFilipino(exam),false,exam);
  for(const exam of ['upcat','plmat'])assert.equal(hasFilipino(exam),true,exam);
  for(const c of CONCEPTS){
    const fil=c.area===FILIPINO_CONCEPT_AREA;
    assert.equal(inCoverage('dcat',c.subtest,fil),!fil,c.id);
    assert.equal(inCoverage('upcat',c.subtest,fil),true,c.id);
    assert.equal(inCoverage(undefined,c.subtest,fil),true,c.id);
  }
  const filipinoSection=EXAM_COVERAGE.plmat.sections.find(s=>s.name==='Filipino');
  assert.equal(inSection(filipinoSection,'language',true),true);
  assert.equal(inSection(filipinoSection,'language',false),false);
  assert.equal(inSection(filipinoSection,'reading',false),false);
});

test('the plan topic list uses each exam’s own sections and only the topics they cover', () => {
  for(const exam of EXAM_IDS){
    const topics=examTopics(exam),covered=names(exam).filter((_,i)=>EXAM_COVERAGE[exam].sections[i].reviewer.length);
    assert.deepEqual([...new Set(topics.map(x=>x.section))],covered,exam);
    for(const {concept,section} of topics)assert.ok(inCoverage(exam,concept.subtest,concept.area===FILIPINO_CONCEPT_AREA),`${exam} ${concept.id} ${section}`);
    assert.equal(topics.length,CONCEPTS.filter(c=>inCoverage(exam,c.subtest,c.area===FILIPINO_CONCEPT_AREA)).length,exam);
  }
  assert.deepEqual([...new Set(examTopics('upcat').map(x=>x.section))],['Language Proficiency','Reading Comprehension','Mathematics','Science']);
  assert.ok(!examTopics('dcat').some(x=>x.concept.area===FILIPINO_CONCEPT_AREA),'DCAT English leaves out Filipino topics');
  assert.ok(examTopics('plmat').filter(x=>x.section==='Filipino').every(x=>x.concept.area===FILIPINO_CONCEPT_AREA));
  assert.ok(!examTopics('acet').some(x=>x.concept.subtest==='science'),'ACET has no science section');
});

test('saved plans accept every listed exam and still reject unknown ones', () => {
  const s=initialProgram();
  const plan=exam=>({...s,setup:{goal:'exam',cet:{general:false,targets:[{key:exam,name:'Exam',exam}]},weekdays:[1,3,5],minutes:30,time:'18:30',createdAt:1}});
  for(const exam of EXAM_IDS)assert.ok(validProgram(plan(exam)),exam);
  assert.equal(validProgram(plan('madeup')),false);
});
