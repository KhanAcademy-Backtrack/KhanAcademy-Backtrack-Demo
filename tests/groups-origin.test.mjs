import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';

test('group service accepts the public school address while retaining origin and device checks',async()=>{
 let handler;
 const source=await fs.readFile(new URL('../supabase/functions/study-groups/index.ts',import.meta.url),'utf8');
 vm.runInNewContext(stripTypeScriptTypes(source),{
  Deno:{serve:fn=>{handler=fn;},env:{get:()=>{throw Error('Preflight must not read credentials');}}},
  Response,crypto,TextEncoder,console,
 });
 for(const origin of ['https://khanacademy-backtrack.github.io','https://khanpanion.vercel.app','https://dunlo.vercel.app']){
  const preflight=await handler(new Request('https://groups.example/',{method:'OPTIONS',headers:{Origin:origin}}));
  assert.equal(preflight.status,204);
  assert.equal(preflight.headers.get('access-control-allow-origin'),origin);
  const unauthenticated=await handler(new Request('https://groups.example/',{method:'POST',headers:{Origin:origin},body:JSON.stringify({action:'snapshot',code:'ABC234'})}));
  assert.equal(unauthenticated.status,401,'A permitted website still needs a private device capability');
 }
 for(const origin of ['https://unrelated.github.io','https://khanacademy-backtrack.github.io.evil.example']){
  const response=await handler(new Request('https://groups.example/',{method:'OPTIONS',headers:{Origin:origin}}));
  assert.equal(response.status,403);
  assert.equal(response.headers.get('access-control-allow-origin'),null);
 }
});
