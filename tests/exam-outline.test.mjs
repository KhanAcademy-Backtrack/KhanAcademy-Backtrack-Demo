import test from 'node:test';
import assert from 'node:assert/strict';
import {EXAM_OUTLINES,OUTLINE_BY_KEY,topicKey} from '../src/lib/program/exam-outline.ts';
import {EXAM_COVERAGE,FILIPINO_CONCEPT_AREA,examTopics,inSection} from '../src/lib/program/exam-coverage.ts';
import {CONCEPT_BY_ID} from '../src/lib/program/concepts.ts';

test('each outline uses its exam’s own sections and real summaries from those sections', () => {
  for(const [exam,outline] of Object.entries(EXAM_OUTLINES)){
    const sections=EXAM_COVERAGE[exam].sections;
    assert.deepEqual(Object.keys(outline.sections),sections.filter(s=>s.reviewer.length).map(s=>s.name),exam);
    for(const [name,groups] of Object.entries(outline.sections)){
      const section=sections.find(s=>s.name===name);
      assert.ok(groups.length,`${exam} ${name} has sub-subjects`);
      const titles=groups.flatMap(g=>g.topics.map(t=>t.title));
      assert.equal(new Set(titles).size,titles.length,`${exam} ${name} topic titles are unique`);
      for(const g of groups){
        assert.ok(g.topics.length,`${exam} ${g.name} has topics`);
        for(const t of g.topics)for(const id of t.concepts??[]){
          const c=CONCEPT_BY_ID[id];
          assert.ok(c,`${exam} ${t.title}: unknown summary ${id}`);
          assert.ok(inSection(section,c.subtest,c.area===FILIPINO_CONCEPT_AREA),`${exam} ${t.title}: ${id} is outside ${name}`);
        }
      }
    }
  }
});

test('every summary the reviewer has for an outlined exam appears in its outline', () => {
  for(const [exam,outline] of Object.entries(EXAM_OUTLINES)){
    for(const {concept,section} of examTopics(exam)){
      const listed=outline.sections[section].some(g=>g.topics.some(t=>t.concepts?.includes(concept.id)));
      assert.ok(listed,`${exam} ${section} leaves out ${concept.id}`);
    }
  }
  const upcat=EXAM_OUTLINES.upcat.sections;
  assert.deepEqual(upcat.Science.map(g=>g.name),['Biology','Chemistry','Physics','Earth science','Astronomy']);
  assert.ok(upcat.Mathematics.find(g=>g.name==='Logic and calculus basics').less,'only some reviewers report logic and calculus');
});

test('the DCAT outline covers its three written sections in English only and leaves Mental Ability empty', () => {
  const dcat=EXAM_OUTLINES.dcat.sections;
  assert.deepEqual(Object.keys(dcat),['Mathematics','Science','English']);
  assert.ok(!('Mental Ability' in dcat),'Mental Ability has no material yet');
  assert.deepEqual(dcat.Mathematics.map(g=>g.name),['Arithmetic and number sense','Algebra','Word problems','Geometry and trigonometry','Statistics and probability']);
  assert.deepEqual(dcat.Science.map(g=>g.name),['Biology','Chemistry','Physics','Earth and space science']);
  assert.deepEqual(dcat.English.map(g=>g.name),['Vocabulary','Grammar and usage','Sentence construction and correction','Reading comprehension']);
  assert.deepEqual(Object.values(dcat).flat().filter(g=>g.less).map(g=>g.name),['Earth and space science'],'only earth and space science is reported by some reviewers alone');
  const ids=Object.values(dcat).flat().flatMap(g=>g.topics.flatMap(t=>t.concepts??[]));
  assert.ok(!ids.some(id=>CONCEPT_BY_ID[id].area===FILIPINO_CONCEPT_AREA),'the DCAT has no Filipino part');
  const circles=[topicKey('upcat','Circles'),topicKey('dcat','Circles')];
  assert.notEqual(circles[0],circles[1],'the same topic title saves separately per exam');
  assert.deepEqual(circles.map(k=>OUTLINE_BY_KEY.get(k).exam),['upcat','dcat']);
  assert.equal(OUTLINE_BY_KEY.get(topicKey('dcat','Gas laws')).section,'Science');
  assert.equal(OUTLINE_BY_KEY.get(topicKey('dcat','Gas laws')).exam,'dcat');
});

test('each outline topic saves under its own key, even when topics share a summary', () => {
  for(const [exam,outline] of Object.entries(EXAM_OUTLINES)){
    const keys=Object.values(outline.sections).flatMap(groups=>groups.flatMap(g=>g.topics.map(t=>topicKey(exam,t.title))));
    assert.equal(new Set(keys).size,keys.length,`${exam} topic keys are unique`);
    for(const k of keys){
      assert.match(k,/^[\w:|~.-]{1,160}$/,`${k} is a valid saved id`);
      assert.ok(OUTLINE_BY_KEY.has(k),k);
    }
  }
  const a=topicKey('upcat','Functions and their graphs'),b=topicKey('upcat','The coordinate plane, lines and slope');
  assert.notEqual(a,b);
  assert.deepEqual(OUTLINE_BY_KEY.get(a).topic.concepts,OUTLINE_BY_KEY.get(b).topic.concepts,'the two share one summary');
});
