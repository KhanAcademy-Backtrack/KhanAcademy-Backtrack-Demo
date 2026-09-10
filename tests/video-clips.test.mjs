import test from 'node:test';import assert from 'node:assert/strict';
import {videoSource,VERIFIED_CLIPS} from '../src/lib/video-clips.ts';
test('focused Khan clips stop at a verified absolute timestamp and can continue',()=>{
 for(const [id,clip] of Object.entries(VERIFIED_CLIPS)){
  const focus=new URL(videoSource(id,'https://backtrack-learning.vercel.app','focus',clip));assert.equal(focus.searchParams.get('start'),String(clip.start));assert.equal(focus.searchParams.get('end'),String(clip.end));
  const next=new URL(videoSource(id,'https://backtrack-learning.vercel.app','continue',clip));assert.equal(next.searchParams.get('start'),String(clip.end));assert.equal(next.searchParams.has('end'),false);
  const full=new URL(videoSource(id,'https://backtrack-learning.vercel.app','full',clip));assert.equal(full.searchParams.get('start'),'0');assert.equal(full.searchParams.has('end'),false);
 }
});
