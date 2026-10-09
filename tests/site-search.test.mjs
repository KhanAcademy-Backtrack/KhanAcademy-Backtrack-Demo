import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SEARCH_INDEX,searchSite} from '../src/lib/site-search.ts';
import {CHAPTERS} from '../src/content/reviewer/index.ts';
import {EXTRAS} from '../src/content/reviewer/extras.ts';
import {CONCEPTS} from '../src/lib/program/concepts.ts';
import {TOPICS} from '../src/lib/recovery.ts';
import {PROGRAMS} from '../src/lib/program/bridge.ts';
import {TOPIC_LESSONS,lessonHref} from '../src/lib/program/topic-lessons.ts';

const statics=new Set(['/mock','/start','/review','/notebook','/calendar','/admissions','/group','/packs','/explore','/reviewer','/bridge','/khan']);

test('every search result points at a statically exported route', () => {
  const reviewer=new Set([...CHAPTERS,...EXTRAS].map(c=>`/reviewer/${c.id}`)),learn=new Set(CONCEPTS.map(c=>`/learn/${c.id}`));
  const college=new Set(PROGRAMS.flatMap(p=>[`/bridge/${p.id}`,...p.subjects.map(x=>`/bridge/${p.id}/${x}`)]));
  for(const l of TOPIC_LESSONS)learn.add(lessonHref(l.id));
  for(const e of SEARCH_INDEX){
    const ok=statics.has(e.href)||reviewer.has(e.href)||learn.has(e.href)||college.has(e.href)||(e.href.startsWith('/start/')&&e.href.slice(7) in TOPICS&&fs.existsSync(`src/app${e.href}/page.tsx`));
    assert.ok(ok,`${e.title} → ${e.href}`);
  }
  for(const p of statics)assert.ok(fs.existsSync(`src/app${p}/page.tsx`),p);
});

test('search needs every word and ranks title matches first', () => {
  assert.deepEqual(searchSite('   '),[]);
  const fractions=searchSite('fractions');
  assert.ok(fractions.length>0&&fractions.length<=8);
  assert.ok(fractions[0].title.toLowerCase().includes('fraction'));
  assert.ok(searchSite('balancing').some(e=>e.href==='/start/balancing'&&e.kind==='Fix a gap'));
  assert.ok(searchSite('upcat').some(e=>e.href==='/mock'));
  assert.ok(searchSite('courses').some(e=>e.href==='/bridge'),'the courses are found from the header search');
  assert.ok(searchSite('linear algebra').some(e=>e.kind==='College'&&/^\/bridge\/\w+\/linear_algebra$/.test(e.href)),'college subjects are found');
  assert.ok(searchSite('sql').some(e=>e.href==='/bridge/cs_it/databases'));
  assert.equal(searchSite('fractions zzzz').length,0);
});
