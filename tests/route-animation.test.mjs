import test from 'node:test';
import assert from 'node:assert/strict';
import {heroRoutePath,SAMPLES} from '../src/lib/route-geometry.ts';
test('hero answer paths have compatible geometry for interpolation',()=>{
 const paths=[null,'gap','right'].map(heroRoutePath);
 assert.notEqual(paths[1],paths[2]);
 for(const p of paths){assert.equal((p.match(/L/g)||[]).length,SAMPLES-1);assert.equal((p.match(/-?\d+(?:\.\d+)?/g)||[]).length,SAMPLES*2);assert.ok(p.startsWith('M64,60'));assert.ok(p.endsWith('L612,60'));}
});
