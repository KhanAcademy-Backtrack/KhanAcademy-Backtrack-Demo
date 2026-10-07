import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {initialProgram,PROGRAM_KEY} from '../src/lib/program/store.ts';
import {PROFILE_KEY} from '../src/lib/program/profile.ts';
import {chooseGoal,closeGuide} from './program-qa-helpers.mjs';

export async function profileJourneys({scenario,origin,root}){
 const dir=path.join(root,'.refs/profile-review');await fs.mkdir(dir,{recursive:true});
 const overflow=async page=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
 for(const width of [320,390,1100,1440])await scenario(`program profile name editing and preservation ${width}`,async(page,context)=>{
  const state={...initialProgram(),bridgeProgram:'cs_it',studyDays:['2026-10-06'],setup:{goal:'college',weekdays:[1,3,5],minutes:30,time:'19:00',createdAt:1}};
  await page.addInitScript(({key,state})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(state));sessionStorage.setItem('backtrack.entry.choice','study');},{key:PROGRAM_KEY,state});
  await page.goto(origin);const heading=page.getByRole('heading',{level:1,name:'Khanpanion',exact:true});await heading.waitFor();
  assert.equal(await page.locator('.home-kicker').first().innerText(),'Khanpanion Profile');
  assert.equal(await page.locator('.home-welcome time').count(),0);
  assert.deepEqual(await page.locator('.home-stats dt').allTextContents(),['Study Days','Practice Sets','BACKTRACK Answers']);
  assert.equal(await page.locator('.home-profile-goal').textContent(),'Computer Science and IT');
  const before=await page.evaluate(key=>localStorage.getItem(key),PROGRAM_KEY),edit=page.getByRole('button',{name:'Edit profile name',exact:true});
  await edit.click();let dialog=page.getByRole('dialog',{name:'Your profile name',exact:true}),input=dialog.getByLabel('Your name (optional)',{exact:true});await dialog.waitFor();
  assert.equal(await input.evaluate(el=>el===document.activeElement),true);
  await input.fill('Cancel this name');await dialog.getByRole('button',{name:'Cancel',exact:true}).click();await heading.waitFor();
  assert.equal(await edit.evaluate(el=>el===document.activeElement),true,'Cancel returns focus to the pencil');
  await edit.click();await input.fill('Escape this name');await input.press('Escape');await heading.waitFor();assert.equal(await dialog.count(),0);
  assert.equal(await edit.evaluate(el=>el===document.activeElement),true,'Escape returns focus to the pencil');
  await edit.click();await input.fill('  María de la Cruz  ');
  for(let n=0;n<7;n++){await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>!!document.activeElement?.closest('dialog')),'Focus stays in the name editor');}
  await dialog.getByRole('button',{name:'Save Name',exact:true}).click();await page.getByRole('heading',{level:1,name:'María de la Cruz',exact:true}).waitFor();
  assert.equal(await page.locator('.home-profile-name').evaluate(el=>getComputedStyle(el).textTransform),'none','Names retain their spelling and case');
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).name,PROFILE_KEY),'María de la Cruz');
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),PROGRAM_KEY),before,'Name editing does not write learning data');
  await overflow(page);await page.screenshot({path:path.join(dir,`home-name-${width}.png`),fullPage:false});
  await page.reload();await page.getByRole('heading',{level:1,name:'María de la Cruz',exact:true}).waitFor();
  if(width===1440){
   const other=await context.newPage();await other.goto(origin);await other.getByRole('heading',{level:1,name:'María de la Cruz',exact:true}).waitFor();
   await edit.click();await input.fill('Harry Gomez');await dialog.getByRole('button',{name:'Save Name',exact:true}).click();await other.getByRole('heading',{level:1,name:'Harry Gomez',exact:true}).waitFor();await other.close();
  }
  await edit.click();await input.fill('W'.repeat(60));await dialog.getByRole('button',{name:'Save Name',exact:true}).click();await page.getByRole('heading',{level:1,name:'W'.repeat(60),exact:true}).waitFor();await overflow(page);
  await edit.click();await input.fill('');await dialog.getByRole('button',{name:'Save Name',exact:true}).click();await heading.waitFor();await overflow(page);
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),PROGRAM_KEY),before);
 },{width,height:884});
 for(const width of [390,1440])for(const goal of ['exam','college','topic'])await scenario(`program profile optional name after ${goal} setup ${width}`,async page=>{
  await chooseGoal(page,origin,goal,{name:goal==='college'?'harry de la Cruz':goal==='topic'?'':undefined,nativeClock:goal==='topic'});await closeGuide(page);
  const expected=goal==='college'?'harry de la Cruz':'Khanpanion';await page.getByRole('heading',{level:1,name:expected,exact:true}).waitFor();
  const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),PROGRAM_KEY);assert.equal(before.setup.goal,goal);assert.equal(before.setup.time,'18:30');await overflow(page);
  await page.reload();await page.getByRole('heading',{level:1,name:expected,exact:true}).waitFor();
  await page.getByRole('button',{name:'Change goal or routine',exact:true}).click();await page.getByRole('button',{name:goal==='exam'?'Prepare for an entrance exam':goal==='college'?'Get ready for college classes':'Work on a class topic',exact:true}).click();
  await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('button',{name:'Show my study space',exact:true}).click();
  await page.getByRole('heading',{name:'This space is yours.',exact:true}).waitFor();await closeGuide(page);await page.getByRole('heading',{level:1,name:expected,exact:true}).waitFor();
  assert.equal(await page.getByRole('heading',{name:'What should we call you?',exact:true}).count(),0,'Routine edits skip the name step');
  assert.deepEqual((await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),PROGRAM_KEY)).setup,before.setup);
 },{width,height:884});
 await scenario('program first-entry optional profile name phone back and skip',async page=>{
  await page.goto(origin);await page.getByRole('button',{name:'Prepare for an entrance exam',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('button',{name:'45 min',exact:true}).click();await page.getByLabel('Usual study time',{exact:true}).fill('20:30');await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('heading',{name:'What should we call you?',exact:true}).waitFor();assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuetext'),'Step 4 of 4');
  await page.getByLabel('Your name (optional)',{exact:true}).fill('Draft name');await overflow(page);await page.screenshot({path:path.join(dir,'optional-name-short-phone.png'),fullPage:false});
  for(const name of ['Back','Skip','Show my study space'])assert.ok(await page.getByRole('button',{name,exact:true}).evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),'Name-step actions stay visible on a short phone');
  await page.getByRole('button',{name:'Back',exact:true}).click();await page.getByRole('heading',{name:'Choose your study week',exact:true}).waitFor();assert.equal(await page.getByLabel('Usual study time',{exact:true}).inputValue(),'20:30');
  await page.getByRole('button',{name:'Continue',exact:true}).click();assert.equal(await page.getByLabel('Your name (optional)',{exact:true}).inputValue(),'Draft name');
  await page.getByRole('button',{name:'Skip',exact:true}).click();await page.getByRole('heading',{name:'This space is yours.',exact:true}).waitFor();await closeGuide(page);await page.getByRole('heading',{level:1,name:'Khanpanion',exact:true}).waitFor();
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),PROGRAM_KEY);assert.equal(saved.setup.minutes,45);assert.equal(saved.setup.time,'20:30');await overflow(page);
 },{width:320,height:568});
}
