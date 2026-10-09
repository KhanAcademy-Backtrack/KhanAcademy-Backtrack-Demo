import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {PROGRAM_KEY,initialProgram} from '../src/lib/program/store.ts';
import {formFromKey,formItems,itemById} from '../src/lib/mock/forms.ts';

export async function reviewerPracticeJourneys({scenario,origin,root}){
 const data=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),PROGRAM_KEY);
 const section=page=>page.getByRole('region',{name:'Section',exact:true});
 const topics=page=>page.getByRole('region',{name:'Topic checks',exact:true});
 const select=page=>page.getByRole('combobox',{name:'Reviewing for',exact:true});
 const overflow=async page=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
 for(const width of [375,1280]){
  await scenario(`program reviewer practice selection and resume ${width}`,async page=>{
   await page.goto(origin+'/reviewer');
   await select(page).selectOption('dcat');
   await page.locator('main').getByRole('link',{name:'Practice exams',exact:true}).click();
   await page.waitForURL('**/mock');
   assert.equal(await select(page).inputValue(),'dcat');
   assert.deepEqual(await section(page).getByRole('link').allTextContents(),['Mathematics','Science','English']);
   assert.deepEqual(await topics(page).getByRole('heading',{level:3}).allTextContents(),['Mathematics','Science','English']);
   assert.equal(await topics(page).getByRole('link',{name:'Gramatikang Filipino',exact:true}).count(),0);
   await section(page).getByText('No practice questions yet for Mental Ability.',{exact:true}).waitFor();
   await page.reload();assert.equal(await select(page).inputValue(),'dcat');
   await section(page).getByRole('link',{name:'English',exact:true}).click();
   await page.waitForURL('**/mock/take?*');
   const key=new URL(page.url()).searchParams.get('f'),form=formFromKey(key),ids=formItems(form);
   assert.match(key,/^section2~dcat-english\|/);
   await page.getByRole('heading',{name:'DCAT: English section',exact:true}).waitFor();
   await page.getByRole('button',{name:'Enter the exam hall',exact:true}).click();
   await page.getByRole('radio').nth(itemById(ids[0]).answerIndex).click();
   await page.getByRole('button',{name:'Next',exact:true}).click();
   const attempt=(await data(page)).attempts.at(-1);
   assert.equal(attempt.index,1);
   await page.goto(origin+'/mock');
   await select(page).selectOption('acet');
   assert.deepEqual(await section(page).getByRole('link').allTextContents(),['Mathematics','English']);
   assert.equal(await topics(page).getByRole('heading',{name:'Science',exact:true}).count(),0);
   await page.getByRole('link',{name:/DCAT: English section.*answered/}).click();
   await page.getByRole('radiogroup',{name:'Choices',exact:true}).waitFor();
   assert.equal((await data(page)).attempts.at(-1).id,attempt.id);
   assert.equal((await data(page)).attempts.at(-1).index,1);
   assert.deepEqual((await data(page)).attempts.at(-1).answers,attempt.answers);
   await page.goto(origin+'/mock');
   await select(page).selectOption('plmat');
   assert.deepEqual(await section(page).getByRole('link').allTextContents(),['English','Filipino','Mathematics','Science']);
   await topics(page).getByRole('link',{name:'Gramatikang Filipino',exact:true}).click();
   await page.waitForURL('**/mock/take?*');
   await page.getByRole('button',{name:'Enter the exam hall',exact:true}).click();
   await page.getByRole('radio').first().click();
   await page.getByRole('button',{name:'Check',exact:true}).click();
   await page.reload();await page.getByRole('radiogroup',{name:'Choices',exact:true}).waitFor();
   const check=(await data(page)).attempts.at(-1),checkForm=formFromKey(check.formKey);
   assert.match(check.formKey,/^topic2~plmat-filipino_gramatika\|/);
   assert.equal(check.revealed.length,1);
   assert.ok(formItems(checkForm).every(id=>itemById(id).lang==='fil'));
   await page.goto(origin+'/mock');await page.getByRole('link',{name:'Open this reviewer',exact:true}).click();
   assert.equal(await select(page).inputValue(),'plmat');
   await page.goto(origin+'/mock');await overflow(page);
   const dir=path.join(root,'.refs/reviewer-practice');await fs.mkdir(dir,{recursive:true});
   await page.screenshot({path:path.join(dir,`plmat-${width}.png`),fullPage:true});
  },{width,height:850});
 }
 await scenario('program reviewer practice all exam choices and saved target',async page=>{
  const state=initialProgram();state.setup={goal:'exam',exam:'dostsei',weekdays:[1,3,5],minutes:20,time:'18:30',createdAt:1};
  await page.addInitScript(({key,state})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(state));},{key:PROGRAM_KEY,state});
  await page.goto(origin+'/mock');assert.equal(await select(page).inputValue(),'dostsei');
  const expected={
   upcat:['Language Proficiency','Reading Comprehension','Mathematics','Science'],
   dcat:['Mathematics','Science','English'],
   dostsei:['Language and Literature','Science','Mathematics'],
   pupcet:['Mathematics','English','Science'],
   ustet:['English','Mathematics','Science'],
   acet:['Mathematics','English'],
   plmat:['English','Filipino','Mathematics','Science'],
   tupstat:['English','Mathematics','Science'],
   msusase:['English','Mathematics','Science']
  };
  for(const [exam,names] of Object.entries(expected)){
   await select(page).selectOption(exam);
   assert.deepEqual(await section(page).getByRole('link').allTextContents(),names,exam);
   assert.deepEqual(await topics(page).getByRole('heading',{level:3}).allTextContents(),names,exam);
   for(const href of await topics(page).getByRole('link').evaluateAll(links=>links.map(a=>a.href))){
    const key=new URL(href).searchParams.get('f');
    assert.ok(key.startsWith('topic2~'+exam+'-'));
    assert.ok(formItems(formFromKey(key)).length>0,href);
   }
   await overflow(page);
  }
  const saved=await data(page);assert.deepEqual(saved.setup,state.setup);
  for(const key of ['attempts','concepts','recall','bookmarks','studyDays'])assert.deepEqual(saved[key],state[key],key+' unchanged by scope selection');
 });
 await scenario('program reviewer practice cross tab and deep link selection',async(page,context)=>{
  await page.goto(origin+'/mock?exam=dcat');await page.getByText('Section and topic checks follow your DCAT reviewer.',{exact:true}).waitFor();
  const second=await context.newPage();await second.goto(origin+'/reviewer');
  await select(second).selectOption('acet');
  await page.getByText('Section and topic checks follow your ACET reviewer.',{exact:true}).waitFor();
  assert.equal(await section(page).getByRole('link',{name:'Science',exact:true}).count(),0);
  await page.goto(origin+'/reviewer?exam=plmat');assert.equal(await select(page).inputValue(),'plmat');
  await page.goto(origin+'/mock?exam=unknown');assert.equal(await select(page).inputValue(),'plmat');
  await select(page).selectOption('dcat');
  await page.getByRole('link',{name:'English booklet',exact:true}).click();
  await page.getByRole('heading',{name:'DCAT: English section',exact:true}).first().waitFor();
  assert.match(new URL(page.url()).searchParams.get('f'),/^section2~dcat-english\|/);
  await second.close();
 });
}
