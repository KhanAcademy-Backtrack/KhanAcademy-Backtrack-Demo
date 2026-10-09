import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {initialProgram,PROGRAM_KEY} from '../src/lib/program/store.ts';
import {personalFocus} from '../src/lib/program/planner.ts';
import {recommendedKhanLesson} from '../src/lib/program/khan-integration.ts';
import {lessonHref} from '../src/lib/program/topic-lessons.ts';

const program=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),PROGRAM_KEY);
const overflow=async page=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Home overflows the viewport');
async function seed(page,origin,goal,exam='upcat'){
 const state=initialProgram();
 if(goal){state.setup={goal,concept:goal==='topic'?'motion_forces':undefined,...(goal==='exam'?{exam,cet:{general:false,targets:[{key:exam,name:exam.toUpperCase(),exam}]}}:{}),weekdays:[1,3,5],minutes:20,time:'18:30',createdAt:Date.now()};if(goal==='college')state.bridgeProgram='cs_it';}
 await page.addInitScript(({key,state,browse})=>{if(!sessionStorage.getItem('khan-home-seeded')){localStorage.setItem(key,JSON.stringify(state));sessionStorage.setItem('khan-home-seeded','1');}sessionStorage.setItem('backtrack.entry.choice',browse?'browse':'study');},{key:PROGRAM_KEY,state,browse:!goal});
 await page.goto(origin);await page.locator('[data-khan-getting-started]').waitFor();return state;
}
async function checkVideo(card,lesson){
 assert.equal(await card.locator('[data-khan-recommendation]').getAttribute('data-khan-recommendation'),lesson.id);
 const player=card.locator('iframe');await player.waitFor();const url=new URL(await player.getAttribute('src'));
 assert.equal(url.pathname,'/embed/'+lesson.videos[0].id);assert.equal(url.searchParams.get('autoplay'),'0');
 assert.equal(await card.getByRole('link',{name:'Open the full lesson',exact:true}).getAttribute('href'),lessonHref(lesson.id));
 assert.equal(await card.getByRole('link',{name:/Open on Khan Academy/}).getAttribute('href'),lesson.videos[0].url);
}
export async function khanStartJourneys({scenario,origin,root}){
 const dir=path.join(root,'.refs/khan-start-preview');await fs.mkdir(dir,{recursive:true});
 for(const width of [390,1280]){
  for(const goal of ['topic','college','exam'])await scenario(`program Khan Home recommendation for ${goal} ${width}`,async page=>{
   const initial=await seed(page,origin,goal,goal==='exam'?'dcat':'upcat'),before=await program(page),concept=personalFocus(initial)[0].concept.id;
   const card=page.locator('[data-khan-getting-started]');
   await card.getByRole('heading',{name:'Let’s get you started',exact:true}).waitFor();
   assert.equal(await card.getByRole('combobox').inputValue(),concept);
   await checkVideo(card,recommendedKhanLesson(concept,goal==='exam'?'dcat':undefined));
   assert.ok(await card.evaluate(el=>el.getBoundingClientRect().top<document.querySelector('[data-study-activity]').getBoundingClientRect().top),'Khan is before the activity heatmap');
   assert.ok(await page.locator('[data-study-activity]').evaluate(el=>{const rhythm=el.getBoundingClientRect(),momentum=document.querySelector('.home-milestones').getBoundingClientRect(),shortcuts=document.querySelector('.home-shortcuts').getBoundingClientRect();return rhythm.top<momentum.top&&momentum.bottom<=shortcuts.top;}),'Heatmap and momentum remain above the shortcuts and study cards');
   await overflow(page);await page.screenshot({path:path.join(dir,`${goal}-${width}.png`),fullPage:true});
   assert.deepEqual(await program(page),before,'Showing a suggested video does not award learning or change the routine');
   await card.getByRole('combobox').selectOption('moles_formulas');
   await checkVideo(card,recommendedKhanLesson('moles_formulas',goal==='exam'?'dcat':undefined));
   assert.deepEqual(await program(page),before,'Previewing a different topic preserves the saved goal and evidence');
   await page.reload();await page.locator('[data-khan-getting-started]').waitFor();
   assert.equal(await card.getByRole('combobox').inputValue(),concept,'Reload resumes the saved study preference');
   await card.getByRole('link',{name:'Open the full lesson',exact:true}).click();await page.waitForURL('**'+lessonHref(recommendedKhanLesson(concept,goal==='exam'?'dcat':undefined).id));
   await page.locator('[data-lesson-material]').waitFor();assert.deepEqual(await program(page),before,'Entering the lesson alone is not check evidence');
  },{width,height:900});
  await scenario(`program Khan Home browsing preference and unmatched topic ${width}`,async page=>{
   await seed(page,origin);const before=await program(page),card=page.locator('[data-khan-getting-started]');
   assert.equal(await card.locator('iframe').count(),0);
   assert.ok(await card.evaluate(el=>{const start=el.getBoundingClientRect(),rhythm=document.querySelector('[data-study-activity]').getBoundingClientRect(),momentum=document.querySelector('.home-milestones').getBoundingClientRect(),shortcuts=document.querySelector('.home-shortcuts').getBoundingClientRect();return start.bottom<=rhythm.top&&rhythm.top<momentum.top&&momentum.bottom<=shortcuts.top;}),'Browsing follows the same Khan, heatmap, momentum order');
   await card.getByRole('combobox').selectOption('ratio_rate');await checkVideo(card,recommendedKhanLesson('ratio_rate'));
   await card.getByRole('combobox').selectOption('filipino_gramatika');
   await card.getByRole('status').waitFor();assert.equal(await card.locator('iframe').count(),0,'No unrelated English video for a Filipino preference');
   assert.equal(await card.getByRole('link',{name:'Read this topic',exact:true}).getAttribute('href'),'/learn/filipino_gramatika');
   await overflow(page);assert.deepEqual(await program(page),before);
   await card.getByRole('combobox').selectOption('ratio_rate');await checkVideo(card,recommendedKhanLesson('ratio_rate'));
   await page.screenshot({path:path.join(dir,`browse-${width}.png`),fullPage:true});
  },{width,height:900});
  for(const goal of ['topic',undefined])await scenario(`program Khan Home guide continues past calendar ${goal??'browse'} ${width}`,async page=>{
   await seed(page,origin,goal);const before=await program(page);
   await page.getByRole('button',{name:'Guide',exact:true}).click();
   await page.getByRole('dialog').waitFor();await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByRole('button',{name:'Next',exact:true}).click();
   assert.equal(new URL(page.url()).pathname,'/');assert.equal(await page.getByRole('dialog').count(),1);
   assert.equal(await page.getByRole('button',{name:'Try my calendar',exact:true}).count(),0);
   await page.getByRole('button',{name:'Next',exact:true}).click();assert.equal(new URL(page.url()).pathname,'/');
   await page.getByRole('button',{name:'Finish guide',exact:true}).click();
   await page.waitForURL(origin+'/');await page.locator('[data-khan-getting-started]').waitFor();
   assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await page.getByRole('link',{name:'Home',exact:true}).getAttribute('aria-current'),'page');
   assert.deepEqual(await program(page),before,'Finishing the guide preserves saved work');
   for(const start of ['/calendar','/admissions']){
    await page.goto(origin+start);await page.getByRole('button',{name:'Guide',exact:true}).click();
    for(let step=0;step<3;step++){await page.getByRole('button',{name:'Next',exact:true}).click();assert.equal(new URL(page.url()).pathname,start,'Next keeps the guide on the current page');}
    await page.getByRole('button',{name:'Finish guide',exact:true}).click();await page.waitForURL(origin+'/');await page.locator('[data-khan-getting-started]').waitFor();assert.equal(await page.getByRole('dialog').count(),0);
   }
   await overflow(page);
  },{width,height:900});
 }
}
