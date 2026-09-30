import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {PROGRAM_KEY} from '../src/lib/program/store.ts';
import {CONCEPT_BY_ID} from '../src/lib/program/concepts.ts';
import {chooseGoal,closeGuide} from './program-qa-helpers.mjs';
export async function programTourJourneys({scenario,origin,root}){
 const dir=path.join(root,'.refs/program-review');await fs.mkdir(dir,{recursive:true});
 const data=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),PROGRAM_KEY);
 const overflow=p=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1).then(ok=>assert.ok(ok,'Horizontal overflow'));
 const shot=async(p,name,width)=>{await overflow(p);await p.screenshot({path:path.join(dir,`${name}-${width}.png`),fullPage:true});};
 for(const width of [375,1280]){
  await scenario(`program first-entry picker and browsing ${width}`,async page=>{
   await page.goto(origin);const dialog=page.getByRole('dialog');await dialog.getByRole('heading',{name:'What would you like to work on?'}).waitFor();
   assert.equal(await dialog.getByRole('button',{name:'I’m just browsing',exact:true}).isVisible(),true);const before=await data(page);
   await dialog.getByRole('button',{name:'I’m just browsing',exact:true}).click();await page.getByRole('heading',{name:'Look around first.'}).waitFor();await shot(page,'browsing-guide',width);
   await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByRole('button',{name:'Try my calendar',exact:true}).click();await page.getByRole('heading',{name:'Try your calendar'}).waitFor();
   await page.getByRole('button',{name:'Continue guide'}).click();await page.getByRole('button',{name:'Finish guide'}).click();await page.goto(origin);await page.getByRole('heading',{name:'Explore at your own pace'}).waitFor();assert.equal(await page.getByRole('radiogroup',{name:'Choices'}).count(),0);
   const after=await data(page);assert.equal(after?.setup,undefined);assert.equal(after?.attempts.length??0,before?.attempts.length??0);assert.equal(after?.events.length??0,0);await page.reload();await page.getByRole('heading',{name:'Explore at your own pace'}).waitFor();assert.equal(await page.getByRole('dialog').count(),0);
   await page.getByRole('button',{name:'Guide',exact:true}).click();await page.getByRole('heading',{name:'Look around first.'}).waitFor();await page.keyboard.press('Escape');await shot(page,'browsing-home',width);
  },{width,height:850});

  for(const goal of ['exam','college','topic'])await scenario(`program personalized ${goal} setup guide and calendar ${width}`,async page=>{
   await chooseGoal(page,origin,goal,{nativeClock:goal==='topic'});const before=await data(page);assert.equal(before.setup.goal,goal);assert.equal(before.setup.minutes,20);assert.equal(before.setup.time,'18:30');assert.equal(before.attempts.length,0);
   await shot(page,`goal-${goal}-guide`,width);
   await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByRole('heading',{name:'Use your real study calendar.'}).waitFor();
   await page.getByRole('button',{name:'Try my calendar',exact:true}).click();await page.waitForURL('**/calendar');await page.getByRole('heading',{name:'Try your calendar'}).waitFor();
   assert.equal(await page.getByRole('dialog').count(),0);await page.getByRole('button',{name:'Add an event',exact:true}).click();await page.getByLabel('What',{exact:true}).fill(`${goal} review at the library`);await page.getByLabel('Event date').fill('2026-10-05');await page.getByRole('button',{name:/Add to (today|this day)/}).click();
   assert.ok((await data(page)).events.some(e=>e.title===`${goal} review at the library`&&e.date==='2026-10-05'));
   await page.getByRole('button',{name:'Continue guide'}).click();await page.getByRole('heading',{name:'Come back when you need help.'}).waitFor();await page.getByRole('button',{name:'Finish guide'}).click();
   await page.goto(origin);await page.locator('h1').waitFor();await shot(page,`personalized-${goal}-home`,width);
   const after=await data(page);assert.equal(after.setup.goal,goal);assert.deepEqual(after.attempts,before.attempts);assert.deepEqual(after.concepts,before.concepts);assert.deepEqual(after.studyDays,before.studyDays);
   if(goal==='topic')await page.getByRole('heading',{name:CONCEPT_BY_ID.percent_fractions.title,exact:true}).first().waitFor();
   if(goal==='college')await page.getByRole('heading',{name:'Computer Science and IT',exact:true}).waitFor();
   await page.reload();await page.locator('h1').waitFor();assert.equal((await data(page)).setup.goal,goal);if(width===375)assert.ok(await page.evaluate(()=>document.querySelector('[data-program-tour-content=today]').getBoundingClientRect().y<document.querySelector('[data-program-tour-content=calendar]').getBoundingClientRect().y),'Chosen topic is before the calendar on a phone');
   await page.getByRole('button',{name:'Guide',exact:true}).click();await page.getByRole('heading',{name:'This space is yours.'}).waitFor();await page.keyboard.press('Shift+Tab');for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>!!document.activeElement.closest('[role=dialog]')));}await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Guide');
  },{width,height:850});
  await scenario(`program categorized class topics and calendar editing ${width}`,async page=>{
   await page.goto(origin+'/bridge');const section=page.locator('section').filter({has:page.getByRole('heading',{name:'Work through a class topic'})});
   assert.equal(await section.getByRole('button',{name:'Limits',exact:true}).count(),0);await section.getByRole('button',{name:'Physics',exact:true}).click();assert.equal(await section.getByRole('button',{name:'Limits',exact:true}).count(),0);
   await section.getByRole('button',{name:'Kinematics (motion equations)',exact:true}).click();await section.getByText('Kinematics (motion equations) assumes:',{exact:true}).waitFor();await shot(page,'categorized-physics',width);
   await section.getByRole('button',{name:'All subjects'}).click();await section.getByRole('searchbox',{name:'Find a topic'}).fill('pH');await section.getByRole('button',{name:/^Logarithms and pH/}).click();await section.getByText('Logarithms and pH assumes:',{exact:true}).waitFor();
   await chooseGoal(page,origin,'topic');await closeGuide(page);await page.goto(origin+'/calendar?day=2026-10-05&add=1');await page.getByLabel('What',{exact:true}).fill('Library appointment');await page.getByLabel('Time',{exact:true}).fill('23:45');await page.getByLabel('Minutes',{exact:true}).fill('45');await page.getByRole('button',{name:'Add to this day',exact:true}).click();
   let s=await data(page),event=s.events.find(e=>e.title==='Library appointment');assert.ok(event);const id=event.id;
   let row=page.locator('li').filter({has:page.getByText('Library appointment',{exact:true})});await row.getByRole('button',{name:'Mark done',exact:true}).click();assert.deepEqual((await data(page)).studyDays,s.studyDays,'A personal event is not a study day');
   await row.getByRole('button',{name:'Edit',exact:true}).click();await page.getByLabel('What',{exact:true}).fill('Library study session');await page.getByLabel('Time',{exact:true}).fill('17:30');await page.getByLabel('Event type').selectOption('study');await page.getByRole('button',{name:'Save changes',exact:true}).click();
   row=page.locator('li').filter({has:page.getByText('Study: Library study session',{exact:true})});await row.getByRole('button',{name:'Move',exact:true}).click();await page.getByLabel('New date').fill('2026-11-04');await page.locator('form').getByRole('button',{name:'Move',exact:true}).click();assert.equal((await data(page)).events.find(e=>e.id===id).date,'2026-11-04');
   await row.getByRole('button',{name:'Remove',exact:true}).click();assert.equal(await page.getByText('Study: Library study session',{exact:true}).count(),0);await page.getByRole('button',{name:'Undo',exact:true}).click();await page.getByText('Study: Library study session',{exact:true}).waitFor();
   const dl=page.waitForEvent('download');await page.getByRole('button',{name:'Download calendar',exact:true}).click();const download=await dl,ics=await fs.readFile(await download.path(),'utf8');assert.ok(ics.includes('DTSTART:20261104T173000'));assert.match(ics,/DTSTAMP:\d{8}T\d{6}Z/);
   await page.reload();await page.getByRole('gridcell',{name:/Wednesday, November 4/}).click();await page.getByText('Study: Library study session',{exact:true}).waitFor();await shot(page,'calendar-edited-restored',width);
  },{width,height:850});
 }
 await scenario('program returning picker preserves saved work and browsing preferences',async(page,context)=>{
  await chooseGoal(page,origin,'topic');await closeGuide(page);const before=await data(page);
  const returning=await context.newPage();await returning.goto(origin);const picker=returning.getByRole('dialog');await picker.getByText('Continue with your saved goal and routine.',{exact:true}).waitFor();await picker.getByRole('button',{name:'Work on a class topic',exact:true}).click();await returning.getByRole('heading',{name:'This space is yours.'}).waitFor();await closeGuide(returning);assert.deepEqual((await data(returning)).setup,before.setup);await returning.close();
  const browse=await context.newPage();await browse.goto(origin);await browse.getByRole('dialog').getByRole('button',{name:'I’m just browsing',exact:true}).click();await browse.getByRole('heading',{name:'Look around first.'}).waitFor();await closeGuide(browse);await browse.getByRole('heading',{name:'Explore at your own pace'}).waitFor();const after=await data(browse);for(const key of ['setup','attempts','concepts','studyDays','events','pledge','bridgeProgram'])assert.deepEqual(after[key],before[key],`Browsing preserves ${key}`);await browse.close();
 },{width:375,height:850});
 await scenario('program visible guide and setup at intermediate widths',async page=>{
  await page.goto(origin);await page.getByRole('heading',{name:'What would you like to work on?'}).waitFor();
  for(const width of [320,560,640,768,1024,1280]){await page.setViewportSize({width,height:850});await overflow(page);assert.equal(await page.getByRole('button',{name:'Guide',exact:true}).isVisible(),true);await shot(page,'goal-picker',width);}
  await page.setViewportSize({width:320,height:568});await page.getByRole('button',{name:'Guide',exact:true}).click();await page.getByRole('dialog').getByRole('heading',{name:'What would you like to work on?'}).waitFor();await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
 },{width:560,height:850});
 await scenario('program direct guide link and quiet personalized guide',async page=>{
  await page.goto(origin+'/?guide=1');await page.getByRole('dialog').getByRole('heading',{name:'What would you like to work on?'}).waitFor();await page.getByRole('dialog').getByRole('button',{name:'Prepare for an entrance exam',exact:true}).click();await page.keyboard.press('Escape');await page.getByRole('heading',{name:'Look around first.'}).waitFor();await closeGuide(page);
  await page.goto(origin+'/me');await page.getByRole('button',{name:'Change my goal or routine',exact:true}).click();await page.getByRole('button',{name:'Work on a class topic',exact:true}).click();await page.getByRole('button',{name:'Math',exact:true}).click();await page.getByRole('button',{name:CONCEPT_BY_ID.percent_fractions.title,exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('button',{name:'Show my study space',exact:true}).click();await page.getByRole('heading',{name:'This space is yours.'}).waitFor();await closeGuide(page);await page.goto(origin+'/me');await page.getByRole('checkbox',{name:'Quiet mode: still pictures, no movement'}).check();
  await page.getByRole('button',{name:'Guide',exact:true}).click();await page.getByRole('heading',{name:'This space is yours.'}).waitFor();assert.equal(await page.getByRole('dialog').evaluate(el=>el.getAnimations({subtree:true}).length),0);await page.keyboard.press('Escape');
 },{width:320,height:568});
}
