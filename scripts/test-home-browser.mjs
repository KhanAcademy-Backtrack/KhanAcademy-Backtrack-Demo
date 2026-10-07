import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {initialProgram,PROGRAM_KEY,newAttempt} from '../src/lib/program/store.ts';
import {addDays} from '../src/lib/program/planner.ts';
import {formFromKey,formItems,itemById} from '../src/lib/mock/forms.ts';

export async function homeJourneys({scenario,origin,root}){
 const dir=path.join(root,'.refs/home-review');await fs.mkdir(dir,{recursive:true});
 const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Manila'});
 const setup={goal:'exam',cet:{general:true,targets:[]},weekdays:[1,3,5],minutes:20,time:'18:30',createdAt:1};
 const seed=async(page,{activity=false,browse=false,goal='exam'}={})=>{
  const state=initialProgram();state.setup={...setup,goal,...(goal==='topic'?{concept:'percent_fractions'}:{})};
  if(goal==='college')state.bridgeProgram='cs_it';
  if(activity)for(let n=0;n<90;n++)if(n%7<3||n%13===0){const day=addDays(today,-n);state.studyDays.push(day);state.daily[day]={correct:n%4,total:3};}
  await page.addInitScript(({key,state,browse})=>{const next=sessionStorage.getItem('home-next-fixture');if(next){localStorage.setItem(key,next);sessionStorage.removeItem('home-next-fixture');}else if(!sessionStorage.getItem('home-seeded')){localStorage.setItem(key,JSON.stringify(state));sessionStorage.setItem('home-seeded','1');}sessionStorage.setItem('backtrack.entry.choice',browse?'browse':'study');},{key:PROGRAM_KEY,state,browse});
  await page.goto(origin);await page.locator('[data-study-activity]').waitFor();
 };
 const overflow=async page=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow');
 for(const width of [390,1100,1440]){
  await scenario(`program home activity and keyboard ${width}`,async page=>{
   await seed(page,{activity:true});await page.getByRole('heading',{name:'General CET review',exact:true}).waitFor();
   assert.ok(await page.evaluate(()=>document.querySelector('[data-study-activity]').getBoundingClientRect().bottom<document.querySelector('[data-program-tour-content="today"]').getBoundingClientRect().top),'Heatmap and momentum precede the next topic');
   assert.ok(await page.locator('.home-heatmap button[data-level="1"]').count()>0);
   assert.equal(await page.locator('.home-heatmap button[tabindex="0"]').count(),1);
   const cell=page.locator('.home-heatmap button[data-today="true"]');await cell.focus();await cell.press('ArrowLeft');
   assert.match(await page.locator('.home-day-detail').innerText(),new RegExp(new Date(addDays(today,-7)+'T12:00:00').toLocaleDateString('en-PH',{month:'short',day:'numeric'})));
   assert.equal(await page.locator('.home-activity-bottom a').getAttribute('href'),`/calendar?day=${addDays(today,-7)}`);
   assert.equal(await page.getByRole('button',{name:'12 weeks',exact:true}).count(),0);
   assert.equal(await page.locator('.home-heatmap-week').count(),53);await overflow(page);
   assert.deepEqual((await page.locator('.home-heatmap-labels span').allTextContents()).filter(Boolean),['S','M','T','W','T','F','S']);
   assert.ok(await page.locator('.home-heatmap-week').evaluateAll(weeks=>weeks.every(week=>[...week.querySelectorAll('.home-heatmap-cell')].every((cell,row)=>!cell.dataset.day||new Date(cell.dataset.day+'T12:00:00Z').getUTCDay()===row))),'Heatmap dates align with Sunday-first row labels');
   const year=today.slice(0,4);
   assert.deepEqual((await page.locator('.home-month').allTextContents()).filter(Boolean),['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']);
   assert.equal(await page.locator(`.home-heatmap [data-day="${year}-01-01"]`).count(),1);
   assert.equal(await page.locator(`.home-heatmap [data-day="${year}-12-31"]`).count(),1);
   assert.match(await page.locator('.home-heatmap-toolbar').innerText(),new RegExp(`active days in ${year}`));
   await cell.hover();await page.getByRole('tooltip').waitFor();assert.match(await page.getByRole('tooltip').innerText(),/1 recorded activity/);
   assert.equal(await page.getByRole('tooltip').locator('time').getAttribute('datetime'),today);
   await cell.press('Escape');assert.equal(await page.getByRole('tooltip').count(),0);
   if(today<`${year}-12-31`){
    await page.locator(`.home-heatmap-future[data-day="${year}-12-31"]`).hover();
    assert.match(await page.getByRole('tooltip').innerText(),/0 recorded activities\s+Upcoming day/);
   }
   await page.mouse.move(0,0);
   await cell.scrollIntoViewIfNeeded();await cell.focus();await cell.press('Escape');
   assert.equal(await page.locator('.home-welcome .home-kicker').innerText(),'Khanpanion Profile');
   assert.equal(await page.locator('.home-profile-name').innerText(),'Khanpanion');
   assert.deepEqual(await page.locator('.home-stats dt').allTextContents(),['Study Days','Practice Sets','BACKTRACK Answers']);
   const geometry=await page.locator('.home-heatmap').evaluate(chart=>{
    const columns=[...chart.querySelectorAll('.home-heatmap-week')].map(w=>[...w.querySelectorAll('.home-heatmap-cell')].map(c=>c.getBoundingClientRect()));
    return {squares:columns.flat().every(r=>Math.abs(r.width-r.height)<.01),rows:columns.every(c=>c.slice(1).every((r,i)=>r.top-c[i].bottom>=3.99)),columns:columns.slice(1).every((c,i)=>c[0].left-columns[i][0].right>=3.99)};
   });assert.deepEqual(geometry,{squares:true,rows:true,columns:true},'Every heatmap cell stays square, separated by a real gap');
   assert.equal(await page.locator('.home-card-art svg text').count(),7);
   assert.deepEqual(await page.locator('.home-card-art svg text').allTextContents(),['S','M','T','W','T','F','S']);
   assert.ok(await page.locator('.home-card-art svg text').evaluateAll(labels=>labels.every(label=>{const r=label.getBoundingClientRect(),card=label.closest('.home-card-art').getBoundingClientRect();return r.left>=card.left&&r.right<=card.right&&r.top>=card.top&&r.bottom<=card.bottom;})),'All seven week labels fit inside the illustration');
   if(width===390)assert.ok(await page.locator('.home-heatmap-scroll').evaluate(el=>el.scrollLeft>0),'Latest days are visible on a phone');
   await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
   await page.screenshot({path:path.join(dir,`home-${width}.png`),fullPage:true});
   await page.locator('[data-study-activity]').screenshot({path:path.join(dir,`activity-${width}.png`)});
   await page.getByRole('button',{name:'Choose a different topic',exact:true}).click();
   if(width>=1100)assert.ok(await page.evaluate(()=>{
    const topic=document.querySelector('[data-program-tour-content="today"]').getBoundingClientRect(),personalize=document.querySelector('.home-personalize').getBoundingClientRect(),picker=document.querySelector('.home-topic-picker').getBoundingClientRect(),week=document.querySelector('[data-program-tour-content="calendar"]').getBoundingClientRect();
    return Math.abs(personalize.bottom-topic.bottom)<220&&picker.width>topic.width*1.5&&picker.top>Math.max(topic.bottom,personalize.bottom)&&week.top>picker.bottom;
   }),'Topic picker expands across both columns beneath a balanced first row');
   await overflow(page);await page.locator('.home-actions-grid').screenshot({path:path.join(dir,`home-expanded-${width}.png`)});
   await page.getByRole('button',{name:'Close topic picker',exact:true}).click();
   assert.equal(await page.getByRole('button',{name:'Choose a different topic',exact:true}).getAttribute('aria-expanded'),'false');
   if(width>=1100){
    const empty=initialProgram();empty.setup=setup;
    await page.evaluate(state=>sessionStorage.setItem('home-next-fixture',JSON.stringify(state)),empty);
    await page.reload();await page.locator('[data-study-activity]').waitFor();
    assert.deepEqual(await page.locator('.home-stats dd').allTextContents(),['0','0','0']);
    assert.ok(await page.evaluate(()=>{
     const topic=document.querySelector('[data-program-tour-content="today"]').getBoundingClientRect(),daily=document.querySelector('[data-daily-practice]').getBoundingClientRect(),personalize=document.querySelector('.home-personalize').getBoundingClientRect();
     return Math.abs(topic.bottom-personalize.bottom)<1&&Math.abs(topic.width-daily.width)<1;
    }),'Home columns have equal widths and aligned bottom edges');
    await page.locator('.home-actions-grid').screenshot({path:path.join(dir,`home-idle-${width}.png`)});
    await page.getByRole('button',{name:'Choose a different topic',exact:true}).click();
    assert.equal(await page.locator('.home-topic-picker input[type="search"]').evaluate(el=>el===document.activeElement),true);
    await page.locator('.home-actions-grid').screenshot({path:path.join(dir,`home-idle-expanded-${width}.png`)});
    await page.locator('.home-topic-picker input[type="search"]').press('Escape');
    assert.equal(await page.getByRole('button',{name:'Choose a different topic',exact:true}).evaluate(el=>el===document.activeElement),true);
   }
  },{width,height:950});
 }
 await scenario('program home empty activity updates after real Daily 3',async page=>{
  // Seed only on the first load; let the completed answers survive the reload.
  const state=initialProgram();state.setup=setup;
  await page.addInitScript(({key,state})=>{if(!sessionStorage.getItem('home-seeded')){localStorage.setItem(key,JSON.stringify(state));sessionStorage.setItem('home-seeded','1');}sessionStorage.setItem('backtrack.entry.choice','study');},{key:PROGRAM_KEY,state});
  await page.goto(origin);await page.locator('[data-study-activity]').waitFor();
  assert.deepEqual(await page.locator('.home-stats dd').allTextContents(),['0','0','0']);
  assert.equal(await page.locator('.home-heatmap button:not([data-level="0"])').count(),0);
  await page.getByRole('button',{name:'Start today’s practice',exact:true}).click();
  for(let i=0;i<3;i++){await page.getByRole('radio').first().click();await page.getByRole('button',{name:'Check',exact:true}).click();await page.getByRole('button',{name:i===2?'Finish':'Next question',exact:true}).click();}
  await page.getByRole('heading',{name:'Today’s set is complete',exact:true}).waitFor();
  assert.deepEqual(await page.locator('.home-stats dd').allTextContents(),['1','1','0']);
  assert.equal(await page.locator('.home-heatmap button[data-today="true"]').getAttribute('data-level'),'1');
  await page.reload();await page.getByRole('heading',{name:'Today’s set is complete',exact:true}).waitFor();
  assert.deepEqual(await page.locator('.home-stats dd').allTextContents(),['1','1','0']);await overflow(page);
 },{width:390,height:844});
 for(const width of [390,1440])for(const goal of ['exam','college','topic'])await scenario(`program Plan opens exam dates for ${goal} ${width}`,async page=>{
  await seed(page,{goal});
  const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),PROGRAM_KEY);
  const plan=page.getByRole('link',{name:'Plan',exact:true});
  assert.equal(await plan.getAttribute('href'),'/admissions','Plan opens Exam dates for every study goal');
  await plan.click();await page.waitForURL('**/admissions');await page.getByRole('heading',{name:/^College entrance exam dates$/i}).waitFor();
  assert.equal(await page.getByRole('navigation',{name:'Main',exact:true}).getByRole('link',{name:'Plan',exact:true}).getAttribute('aria-current'),'page');
  assert.deepEqual(await page.getByRole('navigation',{name:'Plan pages',exact:true}).locator('a').evaluateAll(links=>links.map(link=>link.getAttribute('href'))),['/calendar','/admissions']);
  await page.getByRole('navigation',{name:'Plan pages',exact:true}).getByRole('link',{name:/^Calendar$/i}).click();
  await page.waitForURL('**/calendar');await page.getByRole('heading',{name:'Calendar',exact:true}).waitFor();
  assert.equal(await page.getByRole('navigation',{name:'Main',exact:true}).getByRole('link',{name:'Plan',exact:true}).getAttribute('aria-current'),'true','Calendar remains inside Plan');
  const after=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),PROGRAM_KEY);
  assert.deepEqual(after.setup,before.setup,'Navigation preserves the chosen goal and routine');
  assert.equal(after.bridgeProgram,before.bridgeProgram);
  await page.goto(origin+(goal==='college'?'/bridge/cs_it':goal==='topic'?'/learn/percent_fractions':'/reviewer'));
  await page.locator('h1').first().waitFor();
  assert.ok(await page.getByRole('navigation',{name:'Main',exact:true}).getByRole('link',{name:'Study',exact:true}).getAttribute('aria-current'),'Course and topic pages stay in Study');
  await page.getByRole('button',{name:'Open menu',exact:true}).click();
  await page.getByRole('dialog',{name:'Menu',exact:true}).getByRole('link',{name:'Plan',exact:true}).click();
  await page.waitForURL('**/admissions');await page.getByRole('heading',{name:/^College entrance exam dates$/i}).waitFor();
  assert.equal(await page.getByRole('dialog',{name:'Menu',exact:true}).count(),0);
  await overflow(page);await page.screenshot({path:path.join(dir,`plan-${goal}-${width}.png`),fullPage:true});
 },{width,height:900});
 for(const goal of ['college','topic'])await scenario(`program home ${goal} preserves useful actions`,async page=>{
  await seed(page,{goal});await overflow(page);
  assert.equal(await page.locator('a[href="/learn/percent_fractions"]').count()>0,goal==='topic');
  if(goal==='college')assert.equal(await page.getByRole('link',{name:'Open my program map',exact:true}).getAttribute('href'),'/bridge/cs_it');
  await page.screenshot({path:path.join(dir,`home-${goal}.png`),fullPage:true});
  if(goal==='college'){
   await page.getByRole('button',{name:'Change goal or routine',exact:true}).click();await page.locator('[data-goal-setup]').waitFor();
   for(const name of ['Prepare for an entrance exam','Get ready for college classes','Work on a class topic']){
    const button=page.getByRole('button',{name,exact:true});assert.equal(await button.locator('.headline').evaluate(el=>getComputedStyle(el).textTransform),'capitalize');
   }
   assert.equal(await page.getByRole('button',{name:'Work on a class topic',exact:true}).locator('.headline-connector').evaluateAll(words=>words.every(el=>getComputedStyle(el).textTransform==='lowercase')),true);
   await page.screenshot({path:path.join(dir,'plan-headline-buttons.png'),fullPage:true});
  }
 },{width:1280,height:900});
 await scenario('program home browse keeps topic selection and activity',async page=>{
  await seed(page,{browse:true});await page.getByRole('heading',{name:'Explore at your own pace',exact:true}).waitFor();
  await page.getByRole('button',{name:'Math',exact:true}).click();
  assert.ok(await page.getByRole('button',{name:'Fractions, decimals and percent',exact:true}).count()>0);await overflow(page);
  await page.screenshot({path:path.join(dir,'home-browse.png'),fullPage:true});
 },{width:390,height:844});
 await scenario('program home results preserve lowercase of',async page=>{
  const state=initialProgram(),at=Date.now(),key='topic~percent_fractions|home-case';
  const ids=formItems(formFromKey(key));assert.ok(ids.length>=4);
  const attempt={...newAttempt(key,false,at),submittedAt:at,answers:Object.fromEntries(ids.map((id,i)=>[id,i<4?itemById(id).answerIndex:(itemById(id).answerIndex+1)%4]))};
  state.setup=setup;state.attempts=[attempt];
  await page.addInitScript(({key,state})=>{localStorage.setItem(key,JSON.stringify(state));sessionStorage.setItem('backtrack.entry.choice','study');},{key:PROGRAM_KEY,state});
  await page.goto(`${origin}/mock/result?a=${attempt.id}`);const heading=page.getByRole('heading',{name:`4 of ${ids.length}`,exact:true});await heading.waitFor();
  assert.equal(await heading.innerText(),`4 of ${ids.length}`);assert.equal(await heading.evaluate(el=>getComputedStyle(el).textTransform),'none');await overflow(page);
  await page.screenshot({path:path.join(dir,'score-lowercase-of.png'),fullPage:true});
 },{width:390,height:844});
}
