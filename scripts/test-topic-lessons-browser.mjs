import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {TOPIC_LESSONS,lessonHref,outlineLessonId,subjectLessonId} from '../src/lib/program/topic-lessons.ts';
import {PROGRAM_KEY} from '../src/lib/program/store.ts';
import {STUDY_KEY} from '../src/lib/study.ts';

export async function topicLessonJourneys({scenario,origin,root}){
 const dir=path.join(root,'.refs/lesson-review');await fs.mkdir(dir,{recursive:true});
 // A successful source registry is not enough: every material route must exist in the export.
 for(const l of TOPIC_LESSONS)assert.ok((await fs.stat(path.join(root,'out',lessonHref(l.id)+'.html'))).isFile(),l.id);
 for(const width of [375,1280])await scenario(`program focused topic materials and safe study ${width}`,async page=>{
  // Player contracts are deterministic here; external playback availability is reported separately.
  await page.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Paused Player Fixture</title>'}));
  const read=()=>page.evaluate(({p,s})=>({program:JSON.parse(localStorage.getItem(p)||'null'),study:JSON.parse(localStorage.getItem(s)||'null')}),{p:PROGRAM_KEY,s:STUDY_KEY});
  const fits=[
   [outlineLessonId('dcat','Work problems'),1],
   [outlineLessonId('dcat','Age and mixture problems'),2],
   [outlineLessonId('upcat','Simple derivatives and integrals'),2],
   [subjectLessonId('diffeq','Oscillation and damping'),2],
   [subjectLessonId('data_analysis','Bias and privacy in data'),2],
   [outlineLessonId('upcat','Pokus ng pandiwa'),0],
   [outlineLessonId('upcat','Paghihinuha at kongklusyon'),0],
   [outlineLessonId('upcat','Electron configuration and quantum numbers'),2],
   [outlineLessonId('upcat','Quadrilaterals and polygons'),3],
   [subjectLessonId('databases','Joining related tables'),0],
  ];
  for(const [id,count] of fits){
   assert.equal((await page.goto(origin+lessonHref(id))).status(),200);await page.locator('[data-lesson-material]').waitFor();await page.locator('h1').waitFor();
   const players=page.locator('iframe[src^="https://www.youtube-nocookie.com/embed/"]');
   if(count)await players.first().waitFor();
   assert.equal(await players.count(),count,id);
   for(const player of await players.all())assert.equal(new URL(await player.getAttribute('src')).searchParams.get('autoplay'),'0','Paused immediately');
   assert.equal(await page.getByRole('button',{name:/^(?:(?:Watch|Hide) the Khan Academy video|Watch video:|Video$)/i}).count(),0);
   assert.equal(await page.getByRole('heading',{name:'What you need to know',exact:true}).count(),0);
   const before=await read();
   const reveal=page.getByRole('button',{name:'Show Explanation',exact:true});
   if(await reveal.count()){await reveal.click();await page.getByRole('button',{name:'Hide Explanation',exact:true}).waitFor();}
   const after=await read();
   for(const k of ['concepts','recall','studyDays','missions','notebook','attempts'])assert.deepEqual(after.program?.[k],before.program?.[k],k+' unchanged by lesson activity');
   for(const k of ['xp','review','routes','exposures'])assert.deepEqual(after.study?.[k],before.study?.[k],k+' unchanged by lesson activity');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
  }
  await page.goto(origin+'/learn/vocabulary_context');await page.getByRole('navigation',{name:'Choose a Topic Lesson'}).waitFor();await page.locator('iframe').waitFor();
  assert.equal(await page.getByRole('button',{name:/^Watch video:/}).count(),0,'Selected material has no duplicate video disclosures');
  const choose=async title=>width<1024?page.getByRole('combobox',{name:'Choose a Topic',exact:true}).selectOption(outlineLessonId('upcat',title)):page.getByRole('navigation',{name:'Choose a Topic Lesson'}).getByRole('button',{name:new RegExp(title)}).click();
  await choose('Synonyms and antonyms');await page.getByRole('heading',{name:'Synonyms and antonyms',exact:true}).waitFor();assert.equal(await page.locator('iframe').count(),0,'Switch replaces the material instead of retaining hidden players');
  await choose('Roots, prefixes and suffixes');await page.locator('iframe').waitFor();assert.equal(await page.locator('iframe').count(),1);
  const heading=page.getByRole('heading',{name:'Roots, prefixes and suffixes',exact:true});
  assert.equal(await heading.locator('.headline-connector').evaluate(el=>getComputedStyle(el).textTransform),'lowercase','Short conjunction stays lowercase');
  assert.equal(await heading.locator('.headline').evaluate(el=>getComputedStyle(el).textTransform),'capitalize','Main headline words capitalize');
  assert.equal(await page.locator('[data-lesson-material] section[aria-label="Focused Explanation"] p').first().evaluate(el=>getComputedStyle(el).textTransform),'none','Lesson prose keeps sentence case');
  if(width<1024)assert.equal(await page.getByRole('combobox',{name:'Choose a Topic',exact:true}).locator('option:checked').textContent(),'3. Roots, Prefixes and Suffixes','Native phone selector uses headline casing too');
  await page.screenshot({path:path.join(dir,`topic-selector-${width}.png`),fullPage:true});
  await page.goto(origin+lessonHref(outlineLessonId('upcat','Paghihinuha at kongklusyon')));await page.getByRole('button',{name:'Show Explanation',exact:true}).click();await page.screenshot({path:path.join(dir,`filipino-reading-${width}.png`),fullPage:true});
  await page.goto(origin+lessonHref(outlineLessonId('dcat','Work problems')));await page.getByRole('link',{name:'Back to the Reviewer',exact:false}).click();await page.waitForURL('**/reviewer?exam=dcat');const exam=page.locator('main select');await exam.waitFor();assert.equal(await exam.inputValue(),'dcat');
  await page.getByRole('searchbox').fill('work problems');await page.getByRole('link',{name:/Work problems/}).click();await page.waitForURL('**/'+outlineLessonId('dcat','Work problems'));
 },{width,height:850});
 await scenario('program headline labels and contained topic chooser',async page=>{
  for(const width of [320,915,1536]){
   await page.setViewportSize({width,height:850});
   await page.goto(origin+'/mock');
   const topic=page.getByRole('link',{name:'Vocabulary in context',exact:true});await topic.waitFor();
   assert.equal(await topic.locator('.headline').evaluate(el=>getComputedStyle(el).textTransform),'capitalize');
   assert.equal(await topic.locator('.headline-connector').evaluate(el=>getComputedStyle(el).textTransform),'lowercase');
   await page.goto(origin+'/bridge');
   const field=page.getByRole('button',{name:/Health sciences/});await field.waitFor();assert.equal(await field.locator('.headline').evaluate(el=>getComputedStyle(el).textTransform),'capitalize');
   await page.goto(origin+'/bridge/cs_it');
   const course=page.locator('a[href="/bridge/cs_it/python"]');await course.waitFor();assert.equal(await course.locator('.headline-connector').evaluate(el=>getComputedStyle(el).textTransform),'lowercase');
   await page.goto(origin+'/start');await page.locator('[data-destination]').last().waitFor();assert.equal(await page.locator('[data-destination]').count(),9);
   const cards=await page.locator('[data-destination]').evaluateAll(nodes=>nodes.map(el=>{const card=el.getBoundingClientRect(),frame=el.querySelector('.math').parentElement.getBoundingClientRect();return {left:card.left,right:card.right,top:card.top,bottom:card.bottom,frameLeft:frame.left,frameRight:frame.right};}));
   assert.ok(await page.locator('[data-destination] .math').evaluateAll(nodes=>nodes.every(el=>el.parentElement.scrollWidth<=el.parentElement.clientWidth+1)),'Entire equation preview fits at each tested width');
   for(const card of cards){assert.ok(card.frameLeft>=card.left&&card.frameRight<=card.right,'Equation stays inside its card');for(const other of cards)if(card!==other&&Math.abs(card.top-other.top)<1)assert.ok(card.right<=other.left||other.right<=card.left,'Subject cards do not overlap');}
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Chooser fits the page');
   await page.screenshot({path:path.join(dir,`topic-chooser-${width}.png`),fullPage:true});
  }
 });
}
