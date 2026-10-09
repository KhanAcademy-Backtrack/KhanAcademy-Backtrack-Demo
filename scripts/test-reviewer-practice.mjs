import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {PROGRAM_KEY,initialProgram} from '../src/lib/program/store.ts';
import {formFromKey,formItems,itemById,formMinutes,formGroups} from '../src/lib/mock/forms.ts';
import {scoreAttempt} from '../src/lib/mock/scoring.ts';

export async function reviewerPracticeJourneys({scenario,origin,root}){
 const data=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),PROGRAM_KEY);
 const section=page=>page.getByRole('region',{name:'Section',exact:true});
 const full=page=>page.getByRole('region',{name:'Full simulation',exact:true});
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
   assert.equal(await page.getByRole('heading',{name:'Topic checks',exact:true}).count(),0);
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
   assert.match(await full(page).innerText(),/2 available ACET sections, 110 questions/);
   await page.getByRole('link',{name:/DCAT: English section.*answered/}).click();
   await page.getByRole('radiogroup',{name:'Choices',exact:true}).waitFor();
   assert.equal((await data(page)).attempts.at(-1).id,attempt.id);
   assert.equal((await data(page)).attempts.at(-1).index,1);
   assert.deepEqual((await data(page)).attempts.at(-1).answers,attempt.answers);
   await page.goto(origin+'/mock');
   await select(page).selectOption('plmat');
   assert.deepEqual(await section(page).getByRole('link').allTextContents(),['English','Filipino','Mathematics','Science']);
   // Existing topic checks still work from lesson links and saved attempts.
   await page.goto(origin+'/mock/take?f=topic2~plmat-filipino_gramatika%7Cretained&mode=practice');
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
  await scenario(`program reviewer full simulation sections resume results and booklet ${width}`,async page=>{
   await page.goto(origin+'/mock?exam=plmat');
   await page.getByText('Sections and full simulations follow your PLMAT reviewer.',{exact:true}).waitFor();
   assert.equal(await page.getByRole('heading',{name:'Topic checks',exact:true}).count(),0);
   await full(page).getByRole('link',{name:'Start a full simulation',exact:true}).click();
   await page.getByRole('heading',{name:'PLMAT: Full simulation',exact:true}).waitFor();
   const key=new URL(page.url()).searchParams.get('f'),form=formFromKey(key);
   assert.match(key,/^full2~plmat\|/);
   await page.getByText('174 questions in 4 sections. About 258 minutes using Khanpanion practice timing.',{exact:true}).waitFor();
   await page.getByText('Not included yet: Abstract Reasoning.',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Enter the exam hall',exact:true}).click();
   const answer=async(si,qi=0)=>page.getByRole('radio').nth(itemById(form.sections[si].itemIds[qi]).answerIndex).click();
   const jumpLast=async si=>{
    if(width<1024)await page.getByRole('button',{name:'Questions',exact:true}).click();
    await page.locator('aside > div').filter({has:page.getByText(form.sections[si].label,{exact:true})}).getByRole('button',{name:`Question ${form.sections[si].itemIds.length}`,exact:true}).click();
   };
   await answer(0);await jumpLast(0);
   await page.getByRole('button',{name:'Next',exact:true}).click();
   await page.getByText('English · Reading · 1 of 25',{exact:true}).waitFor();
   assert.equal(await page.getByRole('heading',{name:'Section done. Take a breath.',exact:true}).count(),0,'no break inside English');
   await answer(1);
   const before=(await data(page)).attempts.at(-1);
   await page.reload();await page.getByText('English · Reading · 1 of 25',{exact:true}).waitFor();
   assert.deepEqual((await data(page)).attempts.at(-1).answers,before.answers);
   await page.goto(origin+'/mock');await select(page).selectOption('acet');
   await page.getByRole('link',{name:/PLMAT: Full simulation.*answered/}).click();
   await page.getByText('English · Reading · 1 of 25',{exact:true}).waitFor();
   assert.equal((await data(page)).attempts.at(-1).formKey,key,'reviewer changes do not rewrite an active full simulation');
   await jumpLast(1);await page.getByRole('button',{name:'Finish section',exact:true}).click();
   await page.getByRole('heading',{name:'Section done. Take a breath.',exact:true}).waitFor();
   await page.getByText('Next: Filipino, 14 questions.',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Start the next section',exact:true}).click();
   await page.getByText('Filipino · 1 of 14',{exact:true}).waitFor();await answer(2);
   await jumpLast(4);await answer(4,49);
   await page.getByRole('button',{name:'Submit',exact:true}).last().click();
   await page.getByRole('button',{name:'Submit and see results',exact:true}).click();
   await page.waitForURL('**/mock/result?*');
   const attempt=(await data(page)).attempts.at(-1),result=scoreAttempt(form,attempt);
   await page.getByRole('heading',{name:`${result.total.correct} of 174`,exact:true}).waitFor();
   assert.equal(result.total.correct,4);
   for(const label of ['English · Language','English · Reading','Filipino'])await page.getByText(label,{exact:true}).waitFor();
   await overflow(page);
   if(width===1280){
    await page.evaluate(()=>Object.defineProperty(navigator,'canShare',{value:()=>false,configurable:true}));
    const download=page.waitForEvent('download');await page.getByRole('button',{name:'Share my result',exact:true}).click();
    const file=await download,dir=path.join(root,'.refs/reviewer-practice');await fs.mkdir(dir,{recursive:true});
    await file.saveAs(path.join(dir,'plmat-full-result.png'));
   }
   await page.goto(origin+'/mock');assert.equal(await select(page).inputValue(),'acet');
   await page.getByRole('link',{name:'ACET full booklet',exact:true}).click();
   await page.getByRole('heading',{name:'ACET: Full simulation',exact:true}).waitFor();
   assert.match(new URL(page.url()).searchParams.get('f'),/^full2~acet\|/);
   assert.ok((await page.locator('main').innerText()).includes('110 questions'));
   assert.equal(await page.getByRole('heading',{name:/Science/,level:2}).count(),0);
   await overflow(page);
   await page.goto(origin+'/mock?exam=dcat');await full(page).getByText('DCAT · About 3.9 hours',{exact:true}).waitFor();
   const dir=path.join(root,'.refs/reviewer-practice');await fs.mkdir(dir,{recursive:true});
   await page.screenshot({path:path.join(dir,`dcat-full-${width}.png`),fullPage:true});
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
   assert.equal(await page.getByRole('heading',{name:'Topic checks',exact:true}).count(),0);
   const href=await full(page).getByRole('link').getAttribute('href');
   const key=new URL(href,origin).searchParams.get('f'),form=formFromKey(key);
   assert.ok(key.startsWith('full2~'+exam+'|'));
   assert.deepEqual(formGroups(form).map(g=>g.name),names,exam);
   const copy=await full(page).innerText();
   assert.ok(copy.includes(formItems(form).length+' questions'),exam);
   assert.ok(copy.includes('About '+Math.round(formMinutes(form)/60*10)/10+' hours'),exam);
   for(const missing of form.missingSections)assert.ok(copy.includes(missing),exam+' gap '+missing);
   const booklets=await page.locator('a[href^="/mock/print?f=full2"]').getAttribute('href');
   assert.equal(new URL(booklets,origin).searchParams.get('f'),key,'booklet and online form agree');
   await overflow(page);
  }
  const saved=await data(page);assert.deepEqual(saved.setup,state.setup);
  for(const key of ['attempts','concepts','recall','bookmarks','studyDays'])assert.deepEqual(saved[key],state[key],key+' unchanged by scope selection');
 });
 await scenario('program reviewer practice cross tab and deep link selection',async(page,context)=>{
  await page.goto(origin+'/mock?exam=dcat');await page.getByText('Sections and full simulations follow your DCAT reviewer.',{exact:true}).waitFor();
  const second=await context.newPage();await second.goto(origin+'/reviewer');
  await select(second).selectOption('acet');
  await page.getByText('Sections and full simulations follow your ACET reviewer.',{exact:true}).waitFor();
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
