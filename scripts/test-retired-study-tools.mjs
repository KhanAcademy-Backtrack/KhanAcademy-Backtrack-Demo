import assert from 'node:assert/strict';
import path from 'node:path';
import {KHAN_ENTRIES} from '../src/lib/khan-entry.ts';
import {initialProgram,PROGRAM_KEY} from '../src/lib/program/store.ts';

const saved=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),PROGRAM_KEY);
async function absent(page){
 assert.doesNotMatch(await page.locator('body').innerText(),/daily recall|khan academy activities|start from a khan activity|already learning on khan/i);
 assert.equal(await page.locator('a[href="/khan"],a[href^="/khan?"]').count(),0);
 assert.equal(await page.locator('.khan-activity-grid,.khan-url-form,[aria-label="Daily recall"]').count(),0);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflows the viewport');
}

export async function retiredStudyToolJourneys({scenario,origin,root}){
 for(const width of [390,1280])await scenario(`program retired study tools and saved progress ${width}`,async page=>{
  const state=initialProgram();
  state.setup={goal:'topic',concept:'percent_fractions',weekdays:[1,3,5],minutes:20,time:'18:30',createdAt:Date.now()};
  state.bookmarks=['m_fractions_percent'];
  state.recall={'concept:percent_fractions':{stage:1,last:Date.now()-86400000,due:Date.now()-1000}};
  await page.addInitScript(({key,state})=>{
   if(!sessionStorage.getItem('retired-tools-seeded')){localStorage.setItem(key,JSON.stringify(state));sessionStorage.setItem('retired-tools-seeded','1');}
   sessionStorage.setItem('backtrack.entry.choice','study');
  },{key:PROGRAM_KEY,state});
  await page.goto(origin+'/');await page.locator('.home-shortcuts').waitFor();
  const before=await saved(page);await absent(page);
  await page.goto(origin+'/reviewer');await page.getByRole('heading',{name:'Study',exact:true}).waitFor();await absent(page);
  const section=page.getByRole('navigation',{name:'Study pages',exact:true});
  assert.deepEqual((await section.getByRole('link').allTextContents()).map(x=>x.toLowerCase()),['cet reviewers','courses','practice exams','study packs','find my missing skill']);
  await page.screenshot({path:path.join(root,`.refs/browser-review/study-tools-${width}.png`),fullPage:false});
  if(width<768)await page.getByRole('button',{name:'Search',exact:true}).click();
  const search=page.getByRole('combobox',{name:'Search Khanpanion',exact:true}).filter({visible:true});
  for(const query of ['daily recall','khan academy activities',KHAN_ENTRIES[0].practice.url]){
   await search.fill(query);await page.getByRole('status').filter({hasText:'No matches yet'}).waitFor();
   assert.equal(await page.locator('[role=option]').count(),0);
  }
  await search.fill('fractions');await page.locator('[role=option]').first().waitFor();await page.keyboard.press('Escape');
  await page.goto(origin+'/reviewer/m_fractions_percent');await page.getByRole('heading',{name:/^7\. Recall cards$/i}).waitFor();await absent(page);
  assert.equal(await page.getByRole('button',{name:/add these cards/i}).count(),0);
  await page.goto(origin+'/review');await page.getByRole('heading',{name:'Your reviewer.',exact:true}).waitFor();await absent(page);
  assert.equal(await page.getByRole('button',{name:'Reveal answer',exact:true}).count(),0);
  for(const route of ['/demo','/study','/explore','/khan?url=https%3A%2F%2Fwww.khanacademy.org%2Fmath']){
   await page.goto(origin+route);
   if(route.startsWith('/khan'))await page.waitForURL(origin+'/reviewer');
   await page.locator('h1').first().waitFor();await absent(page);
  }
  assert.deepEqual(await saved(page),before,'Retiring tools preserves the existing learner record');
  await page.reload();await page.getByRole('heading',{name:'Study',exact:true}).waitFor();assert.deepEqual(await saved(page),before);
 },{width,height:900});
}
