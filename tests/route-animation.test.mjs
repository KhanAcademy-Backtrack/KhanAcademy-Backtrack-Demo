import test from 'node:test';
import assert from 'node:assert/strict';
import {heroRoutePath,SAMPLES} from '../src/lib/route-geometry.ts';
test('hero answer paths have compatible geometry for interpolation',()=>{
 const paths=[null,'gap','right'].map(heroRoutePath);
 assert.equal(new Set(paths).size,3);
 for(const p of paths){assert.equal((p.match(/L/g)||[]).length,SAMPLES-1);assert.equal((p.match(/-?\d+(?:\.\d+)?/g)||[]).length,SAMPLES*2);assert.ok(p.startsWith('M45,265'));assert.ok(p.endsWith('L660,105'));}
});
