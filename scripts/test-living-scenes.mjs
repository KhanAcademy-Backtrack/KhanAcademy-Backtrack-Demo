import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
const dir='.refs/living-scenes',origin='http://127.0.0.1:3053';await fs.mkdir(dir,{recursive:true});
const server=spawn(process.execPath,['scripts/serve-static.mjs'],{env:{...process.env,BACKTRACK_PORT:'3053'},windowsHide:true,stdio:'pipe'});
await new Promise((r,j)=>{server.stdout.once('data',r);server.once('error',j);});
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
async function run(name,work,options={}){
 const context=await browser.newContext({viewport:{width:1280,height:850},recordVideo:{dir:`${dir}/video`,size:{width:1280,height:850}},...options}),page=await context.newPage(),errors=[];
 page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{await work(page);assert.deepEqual(errors,[]);results.push({name,passed:true});console.log('PASS '+name);}catch(e){results.push({name,passed:false,error:e.message});await page.screenshot({path:`${dir}/${name.replace(/\W/g,'-')}-failure.png`,fullPage:true});console.log('FAIL '+name+': '+e.message);}finally{await context.close();}
}
async function open(page){await page.goto(origin+'/demo');await page.locator('.filling-scene').waitFor();}
const geometry=page=>page.evaluate(()=>{const svg=document.querySelector('.filling-drawing'),point=document.querySelector('.flow-point').getBoundingClientRect(),water=document.querySelector('.flow-water').getBoundingClientRect(),inverse=svg.getScreenCTM().inverse(),p=new DOMPoint(point.x+point.width/2,point.y+point.height/2).matrixTransform(inverse),w=new DOMPoint(water.x,water.y).matrixTransform(inverse),b=new DOMPoint(water.x,water.bottom).matrixTransform(inverse);return {x:p.x,y:p.y,waterY:w.y,waterH:b.y-w.y};});
const synced=g=>{assert.ok(Math.abs(g.y-g.waterY)<.25,'point and water show the same quantity');assert.ok(Math.abs(g.waterY+g.waterH-310)<.25,'water grows from a fixed bottom');assert.ok(Math.abs((310-g.y)/8-(6+2*(g.x-58)/62))<.1,'both views obey the same equation');};
try{for(const width of [375,1280]){
 await run(`controlled linked model ${width}`,async page=>{
  await open(page);const idle=await geometry(page);await page.waitForTimeout(1000);assert.deepEqual(await geometry(page),idle,'reading does not start an animation');
  await page.getByRole('button',{name:'Next minute',exact:true}).click();await page.waitForTimeout(100);const middle=await geometry(page);synced(middle);assert.ok(middle.x>58&&middle.x<120,'the step is real movement');await page.waitForTimeout(500);const end=await geometry(page);synced(end);assert.ok(Math.abs(end.x-120)<.25);
  await page.locator('.filling-scene').screenshot({path:`${dir}/linked-model-${width}.png`});
  await page.getByRole('button',{name:'Play filling animation',exact:true}).click();await page.waitForTimeout(100);await page.getByRole('button',{name:'Pause filling animation',exact:true}).click();const stopped=await geometry(page);await page.waitForTimeout(500);assert.ok(Math.abs((await geometry(page)).x-stopped.x)<.25);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 },{viewport:{width,height:850}});
 await run(`parameter rule stays synchronized ${width}`,async page=>{
  await open(page);await page.getByRole('button',{name:'4 L/min',exact:true}).click();
  const samples=await page.evaluate(async()=>{const out=[];for(let i=0;i<35;i++){const svg=document.querySelector('.filling-drawing'),path=document.querySelector('.flow-rule'),m=path.getCTM(),inv=svg.getScreenCTM().inverse(),a=new DOMPoint(0,0).matrixTransform(m).matrixTransform(inv),b=new DOMPoint(310,0).matrixTransform(m).matrixTransform(inv),text=document.querySelector('.scene-formula .math').textContent.replace(/\s/g,''),match=text.match(/V=([\d.]+)\+([\d.]+)t/);out.push({shown:match?Number(match[2]):null,drawn:(a.y-b.y)/40});await new Promise(r=>requestAnimationFrame(r));}return out;});
  for(const s of samples.filter(s=>s.shown!==null))assert.ok(Math.abs(s.shown-s.drawn)<.4,JSON.stringify(s));assert.ok(samples.some(s=>s.shown>2&&s.shown<4));assert.match(await page.locator('.scene-formula').innerText(),/adds 4 L\/min/);
 },{viewport:{width,height:850}});
 await run(`still model and keyboard ${width}`,async page=>{
  await open(page);assert.equal(await page.getByRole('button',{name:'Play filling animation',exact:true}).isDisabled(),true);await page.getByRole('slider',{name:'Time in the filling model'}).fill('3');const g=await geometry(page);synced(g);assert.ok(Math.abs(g.x-244)<.25);await page.getByRole('button',{name:'Next minute',exact:true}).click();assert.ok(Math.abs((await geometry(page)).x-306)<.25);await page.locator('.filling-scene').screenshot({path:`${dir}/still-model-${width}.png`});
 },{viewport:{width,height:850},reducedMotion:'reduce'});
 await run(`recipe is inspectable and keeps proportions ${width}`,async page=>{
  await page.goto(origin+'/explore?item=same-mix');const card=page.locator('#idea-same-mix');await card.scrollIntoViewIfNeeded();await card.locator('.mixture-visual').waitFor();assert.equal(await card.locator('.mixture-visual').getAttribute('data-filling'),'false');await page.waitForTimeout(800);assert.equal(await card.locator('.mixture-visual').getAttribute('data-filling'),'false');await card.getByRole('slider').fill('3');await page.waitForTimeout(350);
  const dimensions=await card.locator('.mixture-visual').evaluate(el=>[...el.querySelectorAll('.mixture-water')].map((w,i)=>({water:w.getBoundingClientRect().height,syrup:el.querySelectorAll('.mixture-syrup')[i].getBoundingClientRect().height})));for(const d of dimensions)assert.ok(Math.abs(d.syrup/(d.syrup+d.water)-.4)<.001);assert.ok(Math.abs(dimensions[1].syrup/dimensions[0].syrup-3)<.01);await card.getByRole('button',{name:'Replay recipe animation'}).click();await page.waitForTimeout(100);const mid=await card.locator('.mixture-visual').evaluate(el=>{const w=el.querySelector('.mixture-water').getBoundingClientRect().height,s=el.querySelector('.mixture-syrup').getBoundingClientRect().height;return s/(s+w);});assert.ok(Math.abs(mid-.4)<.001);await page.waitForTimeout(500);assert.equal(await card.locator('.mixture-visual').getAttribute('data-filling'),'false');await card.locator('.mixture-visual').screenshot({path:`${dir}/recipe-${width}.png`});
 },{viewport:{width,height:850}});
}}
finally{await browser.close();server.kill();await fs.writeFile(`${dir}/results.json`,JSON.stringify(results,null,2));}
if(results.some(r=>!r.passed))process.exitCode=1;
