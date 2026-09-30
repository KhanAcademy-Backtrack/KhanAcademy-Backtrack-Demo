import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chooseGoal,closeGuide,startDaily} from './program-qa-helpers.mjs';
import {PROGRAM_KEY} from '../src/lib/program/store.ts';

export async function dailyJourneys({scenario,origin,root}){
 const dir=path.join(root,'.refs/daily-review');await fs.mkdir(dir,{recursive:true});
 for(const width of [375,1280])await scenario(`program daily practice saves progress and changes at Manila midnight ${width}`,async page=>{
  await page.clock.install({time:new Date('2026-09-30T15:58:00Z')});await chooseGoal(page,origin,'exam');await closeGuide(page);
  assert.equal(await page.getByRole('button',{name:'Math',exact:true}).count(),0,'Today does not open with a subject catalog');await startDaily(page);const firstStem=await page.getByRole('radiogroup').locator('xpath=preceding-sibling::div[1]').innerText();
  await page.getByRole('radio').first().click();await page.getByRole('button',{name:'Check',exact:true}).click();await page.getByRole('button',{name:'Next question',exact:true}).click();await page.getByText(/^Question 2 of 3/).waitFor();await page.reload();await page.getByText(/^Question 2 of 3/).waitFor();
  for(let i=0;i<2;i++){await page.getByRole('radio').first().click();await page.getByRole('button',{name:'Check',exact:true}).click();await page.getByRole('button',{name:i===1?'Finish':'Next question',exact:true}).click();}
  await page.getByRole('heading',{name:'Today’s set is complete'}).waitFor();let save=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),PROGRAM_KEY);assert.equal(save.daily['2026-09-30'].total,3);assert.equal(save.attempts.filter(a=>a.formKey==='daily2~20260930').length,1);
  await page.clock.runFor(121000);await page.getByRole('button',{name:'Start today’s practice',exact:true}).waitFor();await startDaily(page);await page.getByText(/^Question 1 of 3/).waitFor();const newStem=await page.getByRole('radiogroup').locator('xpath=preceding-sibling::div[1]').innerText();assert.notEqual(firstStem,newStem);save=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),PROGRAM_KEY);assert.equal(save.daily['2026-10-01'],undefined);assert.equal(save.daily['2026-09-30'].total,3);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(width===1280)assert.equal(await page.getByRole('radiogroup').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),2);await page.screenshot({path:path.join(dir,`daily-${width}.png`),fullPage:true});
 },{width,height:850});
}
