import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SEARCH_INDEX,searchSite} from '../src/lib/site-search.ts';
import {CHAPTERS} from '../src/content/reviewer/index.ts';
import {EXTRAS} from '../src/content/reviewer/extras.ts';
import {CONCEPTS} from '../src/lib/program/concepts.ts';
import {TOPICS} from '../src/lib/recovery.ts';

const statics=new Set(['/mock','/start','/review','/notebook','/plan','/calendar','/admissions','/group','/packs','/explore','/reviewer']);

test('every search result points at a statically exported route', () => {
  const reviewer=new Set([...CHAPTERS,...EXTRAS].map(c=>`/reviewer/${c.id}`)),learn=new Set(CONCEPTS.map(c=>`/learn/${c.id}`));
  for(const e of SEARCH_INDEX){
    const ok=statics.has(e.href)||reviewer.has(e.href)||learn.has(e.href)||(e.href.startsWith('/start/')&&e.href.slice(7) in TOPICS&&fs.existsSync(`src/app${e.href}/page.tsx`));
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
  assert.equal(searchSite('fractions zzzz').length,0);
});
