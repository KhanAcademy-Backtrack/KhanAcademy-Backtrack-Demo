import assert from 'node:assert/strict';
import {CONCEPT_BY_ID} from '../src/lib/program/concepts.ts';
import {PROGRAM_BY_ID} from '../src/lib/program/bridge.ts';
export async function chooseGoal(page,origin,goal='exam',options={}){
 await page.goto(origin);const firstEntry=await page.evaluate(()=>!sessionStorage.getItem('backtrack.entry.choice'));const picker=firstEntry?page.getByRole('dialog'):page;await picker.getByRole('heading',{name:'What would you like to work on?'}).waitFor();
 await picker.getByRole('button',{name:goal==='exam'?'Prepare for an entrance exam':goal==='college'?'Get ready for college classes':'Work on a class topic',exact:true}).click();
 if(goal==='college')await page.getByRole('button',{name:PROGRAM_BY_ID[options.program??'cs_it'].title,exact:true}).click();
 if(goal==='exam'&&!options.general)await page.getByRole('button',{name:'UPCAT',exact:true}).click();
 if(goal==='topic'){await page.getByRole('button',{name:'Math',exact:true}).click();await page.getByRole('button',{name:CONCEPT_BY_ID[options.concept??'percent_fractions'].title,exact:true}).click();}
 if(goal==='exam'&&options.date)await page.getByLabel('Planning date, if you have one').fill(options.date);
 const next=page.getByRole('button',{name:'Continue',exact:true});await next.scrollIntoViewIfNeeded();assert.ok(await next.evaluate(el=>{const r=el.getBoundingClientRect(),dialog=el.closest('[role=dialog]'),bar=[...document.querySelectorAll('nav')].find(n=>getComputedStyle(n).position==='fixed'&&n.getBoundingClientRect().width>0);return dialog?r.top>=dialog.getBoundingClientRect().top&&r.bottom<=Math.min(innerHeight,dialog.getBoundingClientRect().bottom):!bar||r.bottom<=bar.getBoundingClientRect().top+1;}),'Continue must stay inside its modal or above the phone navigation');await next.click();await page.getByRole('button',{name:'20 min',exact:true}).click();if(options.nativeClock)await page.getByLabel('Usual study time').evaluate(el=>{el.value='18:30';});else await page.getByLabel('Usual study time').fill('18:30');
 await page.getByRole('button',{name:'Show my study space',exact:true}).click();await page.getByRole('heading',{name:'This space is yours.'}).waitFor();
}
export async function closeGuide(page){await page.getByRole('button',{name:'Close guide',exact:true}).first().click();}
export async function startDaily(page){await page.getByRole('button',{name:'Start today’s practice',exact:true}).click();await page.getByRole('radiogroup',{name:'Choices',exact:true}).waitFor();}
