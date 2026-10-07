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
  await page.addInitScript(({key,state,browse})=>{localStorage.setItem(key,JSON.stringify(state));sessionStorage.setItem('backtrack.entry.choice',browse?'browse':'study');},{key:PROGRAM_KEY,state,browse});
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
   assert.match(await page.locator('.home-welcome .home-kicker').innerText(),/^Khanpanion Profile:/);
   const geometry=await page.locator('.home-heatmap').evaluate(chart=>{
    const columns=[...chart.querySelectorAll('.home-heatmap-week')].map(w=>[...w.querySelectorAll('button')].map(c=>c.getBoundingClientRect()));
    return {squares:columns.flat().every(r=>Math.abs(r.width-r.height)<.01),rows:columns.every(c=>c.slice(1).every((r,i)=>r.top-c[i].bottom>=3.99)),columns:columns.slice(1).every((c,i)=>c[0].left-columns[i][0].right>=3.99)};
   });assert.deepEqual(geometry,{squares:true,rows:true,columns:true},'Every heatmap cell stays square, separated by a real gap');
   if(width>=1100)assert.ok(await page.locator('.home-card-art svg text').evaluateAll(labels=>labels.every(label=>{const r=label.getBoundingClientRect(),card=label.closest('.home-card-art').getBoundingClientRect();return r.left>=card.left&&r.right<=card.right&&r.top>=card.top&&r.bottom<=card.bottom;})),'All seven week labels fit inside the illustration');
   if(width===390)assert.ok(await page.locator('.home-heatmap-scroll').evaluate(el=>el.scrollLeft>0),'Latest days are visible on a phone');
   await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
   await page.screenshot({path:path.join(dir,`home-${width}.png`),fullPage:true});
   await page.locator('[data-study-activity]').screenshot({path:path.join(dir,`activity-${width}.png`)});
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
 for(const goal of ['college','topic'])await scenario(`program home ${goal} preserves useful actions`,async page=>{
  await seed(page,{goal});await overflow(page);
  assert.equal(await page.locator('a[href="/learn/percent_fractions"]').count()>0,goal==='topic');
  if(goal==='college')assert.equal(await page.getByRole('link',{name:'Open my program map',exact:true}).getAttribute('href'),'/bridge/cs_it');
  await page.screenshot({path:path.join(dir,`home-${goal}.png`),fullPage:true});
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
