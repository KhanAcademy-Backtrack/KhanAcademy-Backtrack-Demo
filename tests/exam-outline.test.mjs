import test from 'node:test';
import assert from 'node:assert/strict';
import {EXAM_OUTLINES} from '../src/lib/program/exam-outline.ts';
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
