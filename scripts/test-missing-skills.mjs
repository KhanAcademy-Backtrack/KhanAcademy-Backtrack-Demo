import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {PROGRAM_KEY,initialProgram,newAttempt} from '../src/lib/program/store.ts';
import {PROGRAMS,PROGRAM_BY_ID} from '../src/lib/program/bridge.ts';
import {formFromKey,formItems,itemById} from '../src/lib/mock/forms.ts';
import {misconception} from '../src/lib/mock/misconceptions.ts';

export async function missingSkillsJourneys({scenario,origin,root}){
 const data=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),PROGRAM_KEY);
 const cta=page=>page.getByRole('link',{name:'Take a practice exam',exact:true});
 const overflow=async page=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
 const seed=async(page,s)=>page.addInitScript(({k,s})=>{if(!sessionStorage.getItem('qa-missing')){localStorage.setItem(k,JSON.stringify(s));sessionStorage.setItem('qa-missing','1');}},{k:PROGRAM_KEY,s});
 const college=()=>({...initialProgram(),sides:{admission:false,bridge:true},activeSide:'bridge',bridgeProgram:'cs_it'});
 const dir=path.join(root,'.refs/missing-skills');await fs.mkdir(dir,{recursive:true});
 for(const width of [375,1280]){
  const viewport={width,height:850};
  await scenario(`program missing skills CET entry and explicit tabs ${width}`,async page=>{
   const s={...initialProgram(),sides:{admission:true,bridge:false},bridgeProgram:'cs_it',reviewerExam:'dcat'};await seed(page,s);
   await page.goto(origin+'/start/cet');await page.getByRole('heading',{name:'Nothing to go on yet',exact:true}).waitFor();
   const tabs=page.getByRole('navigation',{name:'Which skills'});
   assert.deepEqual(await tabs.getByRole('link').allTextContents(),['CET review','College courses']);
   assert.equal(await tabs.locator('[aria-current=page]').getAttribute('href'),'/start/cet');
   assert.equal(await cta(page).getAttribute('href'),'/mock');await cta(page).click();
   await page.waitForURL('**/mock');assert.equal(await page.getByRole('combobox',{name:'Reviewing for'}).inputValue(),'dcat');
   await page.goto(origin+'/start/college');assert.equal(await cta(page).getAttribute('href'),'/bridge/cs_it');
   assert.equal(await tabs.locator('[aria-current=page]').getAttribute('href'),'/start/college');
   await page.goto(origin+'/start');assert.equal(await cta(page).getAttribute('href'),'/mock');
   assert.equal(await tabs.locator('[aria-current=page]').getAttribute('href'),'/start/cet');
   assert.deepEqual((await data(page)).attempts,[]);await overflow(page);
   await page.screenshot({path:path.join(dir,`empty-${width}.png`),fullPage:true});
  },viewport);
  await scenario(`program missing skills college selection and course changes ${width}`,async page=>{
   await seed(page,{...college(),bridgeProgram:'general'});await page.goto(origin+'/start/college');
   assert.equal(await cta(page).getAttribute('href'),'/bridge');await cta(page).click();await page.waitForURL('**/bridge');
   for(const p of PROGRAMS){
    await page.getByRole('button',{name:new RegExp(p.title,'i')}).first().click();await page.waitForURL(`**/bridge/${p.id}`);
    await page.goto(origin+'/start/college');assert.equal(await cta(page).getAttribute('href'),`/bridge/${p.id}`);
    await cta(page).click();await page.waitForURL(`**/bridge/${p.id}`);await page.getByRole('heading',{name:'Subjects',exact:true}).waitFor();
    await page.goto(origin+'/start');assert.equal(await cta(page).getAttribute('href'),`/bridge/${p.id}`);
    assert.equal(await page.getByRole('navigation',{name:'Which skills'}).locator('[aria-current=page]').getAttribute('href'),'/start/college');
    await page.goto(origin+'/bridge');
   }
   assert.deepEqual((await data(page)).attempts,[]);await overflow(page);
  },viewport);
  await scenario(`program missing skills submitted college results and reload ${width}`,async page=>{
   await seed(page,college());await page.goto(origin+'/start/college');await cta(page).click();
   await page.getByRole('link',{name:'Take the placement check',exact:true}).click();
   await page.waitForURL('**/mock/take?*');
   const key=new URL(page.url()).searchParams.get('f'),form=formFromKey(key),ids=formItems(form);
   assert.match(key,/^placement~cs_it\|/);await page.getByRole('button',{name:'Enter the exam hall',exact:true}).click();
   for(const [i,id] of ids.entries()){
    const item=itemById(id),routed=item.misconceptions.findIndex(m=>m&&misconception(m)?.recovery);
    const choice=item.concept==='statistics_probability'?(item.answerIndex+1)%item.choices.length:routed>=0?routed:item.answerIndex;
    await page.getByRole('radio').nth(choice).click();await page.getByRole('button',{name:'Check',exact:true}).click();
    await page.getByRole('button',{name:i===ids.length-1?'Submit':'Next',exact:true}).last().click();
   }
   await page.getByRole('button',{name:'Submit and see results',exact:true}).click();await page.waitForURL('**/mock/result?*');
   const submitted=(await data(page)).attempts.at(-1);assert.ok(submitted.submittedAt);
   await page.goto(origin+'/start/college');await page.getByRole('heading',{name:'Start here',exact:true}).waitFor();
   await page.getByRole('heading',{name:'Topics to revisit',exact:true}).waitFor();
   const review=page.getByRole('link',{name:/^Review topic\s*:\s*Statistics and probability$/});await review.waitFor();
   assert.equal(await review.getAttribute('href'),'/learn/statistics_probability');
   assert.equal(await cta(page).getAttribute('href'),'/bridge/cs_it');
   assert.equal(await page.getByRole('link',{name:'Review this result',exact:true}).getAttribute('href'),`/mock/result?a=${submitted.id}`);
   await overflow(page);await page.screenshot({path:path.join(dir,`placement-${width}.png`),fullPage:true});
   await page.reload();await review.waitFor();assert.deepEqual((await data(page)).attempts.at(-1),submitted);
   await page.goto(origin+'/start/cet');await page.getByRole('heading',{name:'Nothing to go on yet',exact:true}).waitFor();
   assert.equal(await page.getByRole('link',{name:'Review this result',exact:true}).count(),0);
   await page.goto(origin+'/start');await review.waitFor();
  },viewport);
  await scenario(`program missing skills latest CET results and live updates ${width}`,async(page,context)=>{
   const at=Date.now()-10000,key='section~language|missing-language';
   const make=(key,at,wrong)=>{const a={...newAttempt(key,false,at-600000),submittedAt:at};for(const id of formItems(formFromKey(key))){const item=itemById(id);a.answers[id]=wrong?(item.answerIndex+1)%item.choices.length:item.answerIndex;}return a;};
   const wrong=make(key,at,true),placement=make('placement~health|other-field',at+1000,true);
   await seed(page,{...initialProgram(),attempts:[wrong,placement]});await page.goto(origin+'/start/cet');
   await page.getByRole('heading',{name:'Topics to revisit',exact:true}).waitFor();
   assert.equal(await page.getByRole('link',{name:'Review this result',exact:true}).getAttribute('href'),`/mock/result?a=${wrong.id}`);
   const before=await data(page);await page.getByRole('link',{name:/^Review topic\s*:/}).first().click();await page.waitForURL('**/learn/*');
   assert.deepEqual((await data(page)).attempts,before.attempts);await page.goBack();
   // A real storage event from a second same-origin tab updates the open page.
   const fresh=make('section~language|fresh-language',at+2000,false),latest={...await data(page),updatedAt:Date.now(),attempts:[fresh,wrong,placement]};
   const other=await context.newPage();await other.goto(origin+'/robots.txt');
   await other.evaluate(({k,s})=>localStorage.setItem(k,JSON.stringify(s)),{k:PROGRAM_KEY,s:latest});
   await page.getByRole('heading',{name:'No repairs suggested by your answers',exact:true}).waitFor();
   assert.equal(await page.getByRole('link',{name:'Review this result',exact:true}).getAttribute('href'),`/mock/result?a=${fresh.id}`);
   assert.equal(await page.getByRole('heading',{name:'Topics to revisit',exact:true}).count(),0);
   const selected={...latest,updatedAt:Date.now()+1,sides:{admission:false,bridge:true},activeSide:'bridge',bridgeProgram:'health'};
   await other.evaluate(({k,s})=>localStorage.setItem(k,JSON.stringify(s)),{k:PROGRAM_KEY,s:selected});
   await page.goto(origin+'/start/college');assert.equal(await cta(page).getAttribute('href'),'/bridge/health');
   await page.getByText(`Open ${PROGRAM_BY_ID.health.title} to take its placement check.`,{exact:false}).waitFor();
   assert.equal(await page.getByRole('link',{name:'Review this result',exact:true}).getAttribute('href'),`/mock/result?a=${placement.id}`);
   await overflow(page);await other.close();
  },viewport);
 }
}
