import test from 'node:test';
import assert from 'node:assert/strict';
import {EXAMS} from '../src/lib/program/admissions.ts';
import {EXAM_COVERAGE,FILIPINO_CONCEPT_AREA,FILIPINO_EXTRAS,inCoverage} from '../src/lib/program/exam-coverage.ts';
import {SUBTESTS} from '../src/lib/mock/types.ts';
import {CONCEPTS} from '../src/lib/program/concepts.ts';
import {EXTRAS} from '../src/content/reviewer/extras.ts';

test('every exam has a coverage entry built from reviewer subjects', () => {
  assert.deepEqual(Object.keys(EXAM_COVERAGE).sort(),Object.keys(EXAMS).sort());
  for(const [exam,c] of Object.entries(EXAM_COVERAGE)){
    assert.ok(c.subtests.length>0,exam);
    for(const s of c.subtests)assert.ok(SUBTESTS.includes(s),`${exam}: ${s}`);
    assert.match(c.checked,/^\d{4}-\d{2}-\d{2}$/);
  }
  assert.deepEqual([...EXAM_COVERAGE.upcat.subtests].sort(),[...SUBTESTS].sort(),'The UPCAT keeps all four subtests');
  assert.equal(EXAM_COVERAGE.upcat.filipino,true);
});

test('English-only exams leave out Filipino material and nothing else', () => {
  assert.ok(CONCEPTS.some(c=>c.area===FILIPINO_CONCEPT_AREA),'Filipino concepts are found by their area');
  for(const id of FILIPINO_EXTRAS)assert.ok(EXTRAS.some(x=>x.id===id),id);
  for(const c of CONCEPTS){
    const fil=c.area===FILIPINO_CONCEPT_AREA;
    assert.equal(inCoverage('dostsei',c.subtest,fil),!fil,c.id);
    assert.equal(inCoverage('upcat',c.subtest,fil),true,c.id);
    assert.equal(inCoverage(undefined,c.subtest,fil),true,c.id);
  }
});
