import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {initialRecovery} from '../src/lib/recovery.ts';
const dir='.refs/lesson-scenes',origin='http://127.0.0.1:3054';await fs.mkdir(dir,{recursive:true});
const server=spawn(process.execPath,['scripts/serve-static.mjs'],{env:{...process.env,BACKTRACK_PORT:'3054'},windowsHide:true,stdio:'pipe'});await new Promise((r,j)=>{server.stdout.once('data',r);server.once('error',j);});
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
const cases=[
 ['brackets','expand','.distribution-scene','Collect the groups'],
 ['quadratics','factor','.assembled-factor','3 Join the middle terms'],
 ['quadratics','distribute','.assembled-factor','3 Join the middle terms'],
 ['quadratics','zero','.maths-lab','Try x = -3'],
 ['fractions','equivalent','.fraction-amount','4 Count equal-sized pieces'],
 ['fractions','same_denominator','.fraction-amount','4 Count equal-sized pieces'],
 ['fractions','goal','.fraction-amount','4 Count equal-sized pieces'],
 ['ratios','unit_rate','.animated-mixture','4 Build a target mixture'],
 ['ratios','goal','.animated-mixture','4 Build a target mixture'],
 ['graphs','coordinates','.coordinate-drawing','Follow x, then y'],
 ['graphs','goal','.filling-scene','Pause filling animation'],
 ['quadratics','multiply','.basic-skill-scene','Collect and count'],
 ['quadratics','terms','.basic-skill-scene','Combine the like terms'],
 ['brackets','linear','.basic-skill-scene','Split both sides by 5'],
 ['graphs','substitute','.operation-chain','Follow the input through the rule'],
 ['motion','unit_convert','.unit-equivalence','Describe the same quantity in the new unit'],
 ['moles','atom_count','.formula-units','Add a formula unit'],
 ['moles','formula_mass','.formula-mass-parts',null],
 ['moles','goal','.moles-figure',null],
 ['balancing','goal','.element-comparison',null],
 ['motion','goal','.science-cart','Increase seconds'],
 ['forces','net_force','.forces-figure','Increase force left'],
 ['forces','goal','.forces-figure','Increase mass']
];
try{for(const [topic,skill,selector,action] of cases){const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));const key=`backtrack.route.v1.${topic}`,route={...initialRecovery(topic),active:skill,phase:'learn',serial:3,startedAt:Date.now(),updatedAt:Date.now()};await context.addInitScript(({key,route})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(route));},{key,route});try{await page.goto(origin+'/start/'+topic);await page.locator('.learn-stage').waitFor();if(await page.locator('.math-prediction').count())await page.locator('.math-prediction').getByRole('button',{name:'Show me an example first',exact:true}).click();if(await page.locator('.lab-predict').count())await page.locator('.lab-predict').getByRole('button',{name:'Show me an example first',exact:true}).click();await page.locator(selector).first().waitFor();if(action)await page.getByRole('button',{name:action,exact:true}).click();
 if(skill==='zero'){const x=page.getByRole('spinbutton',{name:'Value of x',exact:true});await x.focus();await x.press('ControlOrMeta+A');await x.pressSequentially('-4');assert.equal(await x.inputValue(),'-4');}
 if(topic==='moles'&&skill==='formula_mass'){const slider=page.getByRole('slider');await slider.focus();await slider.press('ArrowRight');assert.match(await page.locator('.lab-equation').innerText(),/m/);}
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page overflow');const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(saved.evidence.length,0,'Exploration must not create graded attempts');assert.equal(saved.passed.length,0);assert.deepEqual(errors,[]);await page.screenshot({path:`${dir}/${topic}-${skill}.png`,fullPage:true});results.push({topic,skill,passed:true});console.log(`PASS ${topic}/${skill}`);
 }catch(e){results.push({topic,skill,passed:false,error:e.message});await page.screenshot({path:`${dir}/${topic}-${skill}-failed.png`,fullPage:true});console.log(`FAIL ${topic}/${skill}: ${e.message}`);}finally{await context.close();}}

 /* The coordinate trace is part of the saved guide. Reloading should show the leg
    the learner reached rather than an untraced grid. */
 {const name='coordinate trace survives a reload';const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
  const key='backtrack.route.v1.graphs',route={...initialRecovery('graphs'),active:'coordinates',phase:'learn',serial:3,startedAt:Date.now(),updatedAt:Date.now()};
  await context.addInitScript(({key,route})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(route));},{key,route});
  try{await page.goto(origin+'/start/graphs');await page.locator('.coordinate-drawing').waitFor();
   await page.getByRole('slider',{name:'Across coordinate x'}).fill('4');
   await page.getByRole('button',{name:'Follow x, then y',exact:true}).click();
   await page.getByText('The point is (4, 5), in that order.',{exact:false}).waitFor();
   await page.reload();await page.locator('.coordinate-drawing').waitFor();
   await page.getByText('The point is (4, 5), in that order.',{exact:false}).waitFor();
   const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
   assert.equal(saved.labs.coordinates.values.phase,2,'the finished trace should be saved');
   assert.equal(saved.evidence.length,0);assert.deepEqual(errors,[]);
   results.push({topic:'coordinates',skill:'trace-reload',passed:true});console.log('PASS '+name);
  }catch(e){results.push({topic:'coordinates',skill:'trace-reload',passed:false,error:e.message});await page.screenshot({path:`${dir}/coordinate-trace-failed.png`,fullPage:true});console.log(`FAIL ${name}: ${e.message}`);}finally{await context.close();}}

 /* A scene's own static view must stop the companion's decorative loops too,
    not only the mathematical motion. Global quiet and reduced motion are
    covered by the living-scene suite. */
 {const name='per-scene static view stills the companion';const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
  const key='backtrack.route.v1.brackets',route={...initialRecovery('brackets'),active:'expand',phase:'learn',serial:3,startedAt:Date.now(),updatedAt:Date.now()};
  await context.addInitScript(({key,route})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(route));},{key,route});
  const loops=()=>page.evaluate(async()=>{const seen=el=>el.getAttribute('style')||'';const eye=document.querySelector('.lesson-companion .buddy-eye'),breath=document.querySelector('.lesson-companion .buddy-breath'),e=new Set(),b=new Set();
   for(let i=0;i<40;i++){e.add(seen(eye));b.add(seen(breath));await new Promise(r=>requestAnimationFrame(r));}return {eye:e.size,breath:b.size};});
  try{await page.goto(origin+'/start/brackets');await page.locator('.learn-stage').waitFor();
   await page.locator('.math-prediction').getByRole('button',{name:'Show me an example first',exact:true}).click();
   await page.locator('.lesson-companion .buddy-eye').first().waitFor();
   const moving=await loops();assert.ok(moving.eye>1||moving.breath>1,`the companion should be alive before static view: ${JSON.stringify(moving)}`);
   await page.getByRole('checkbox',{name:'Static view',exact:true}).check();await page.waitForTimeout(250);
   const stilled=await loops();assert.deepEqual(stilled,{eye:1,breath:1},`static view must stop the companion: ${JSON.stringify(stilled)}`);
   await page.getByRole('checkbox',{name:'Static view',exact:true}).uncheck();await page.waitForTimeout(250);
   const revived=await loops();assert.ok(revived.eye>1||revived.breath>1,'clearing static view should bring the companion back');
   assert.deepEqual(errors,[]);results.push({topic:'companion',skill:'static',passed:true});console.log('PASS '+name);
  }catch(e){results.push({topic:'companion',skill:'static',passed:false,error:e.message});await page.screenshot({path:`${dir}/companion-static-failed.png`,fullPage:true});console.log(`FAIL ${name}: ${e.message}`);}finally{await context.close();}}
}finally{await browser.close();server.kill();await fs.writeFile(`${dir}/results.json`,JSON.stringify(results,null,2));}
if(results.some(r=>!r.passed))process.exitCode=1;
