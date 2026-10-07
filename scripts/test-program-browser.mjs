import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {formFromKey,formItems,itemById} from '../src/lib/mock/forms.ts';
import {misconception} from '../src/lib/mock/misconceptions.ts';
import {LABELS} from '../src/lib/recovery.ts';
import {PROGRAM_KEY,initialProgram,newAttempt} from '../src/lib/program/store.ts';
import {CONCEPTS} from '../src/lib/program/concepts.ts';
import {CHAPTERS} from '../src/content/reviewer/index.ts';
import {EXTRAS} from '../src/content/reviewer/extras.ts';
import {PROGRAMS} from '../src/lib/program/bridge.ts';
import {chooseGoal,closeGuide,startDaily} from './program-qa-helpers.mjs';

export async function programJourneys({scenario,origin,root}){
 const dir=path.join(root,'.refs/program-review');await fs.mkdir(dir,{recursive:true});
 const data=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),PROGRAM_KEY);
 const overflow=async page=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');
 const shot=async(page,name,width)=>{await overflow(page);await page.screenshot({path:path.join(dir,`${name}-${width}.png`),fullPage:true});};
 const clean=async(page)=>{await page.getByRole('navigation',{name:'Main'}).first().waitFor();};
 const exam=async(page,key)=>{await page.goto(`${origin}/mock/take?f=${encodeURIComponent(key)}`);await page.getByRole('button',{name:'Enter the exam hall'}).click();await page.getByRole('radiogroup',{name:'Choices'}).waitFor();};
 const submit=async(page)=>{await page.getByRole('button',{name:'Submit',exact:true}).last().click();await page.getByRole('button',{name:'Submit and see results'}).click();await page.getByRole('heading',{name:/of \d+/}).first().waitFor();};
 const seedPledge=async page=>{const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Manila'});const s=initialProgram();s.sides.admission=true;s.pledge={exam:'upcat',examDate:'2027-08-07',why:'Study Computer Science',days:7,minutes:45,when:'after dinner',time:'19:00',weekdays:[0,1,2,3,4,5,6],createdAt:Date.now()};await page.goto(origin);await clean(page);await page.addInitScript(({k,s})=>{if(!sessionStorage.getItem('qa-pledge')){localStorage.setItem(k,JSON.stringify(s));sessionStorage.setItem('qa-pledge','1');}},{k:PROGRAM_KEY,s});return today;};
 for(const width of [375,1280]){
  const viewport={width,height:850};
  await scenario(`program landing sprint pledge today ${width}`,async page=>{
   await chooseGoal(page,origin,'exam');await shot(page,'personal-guide',width);await closeGuide(page);await shot(page,'personal-home',width);await startDaily(page);
   for(let i=0;i<3;i++){await page.getByRole('radio').first().click();await page.getByRole('button',{name:'Check',exact:true}).click();await overflow(page);await page.getByRole('button',{name:i===2?'Finish':'Next question',exact:true}).click();}
   assert.equal((await data(page)).daily[Object.keys((await data(page)).daily)[0]].total,3);await shot(page,'sprint-result',width);
   await page.goto(origin+'/plan');await page.getByRole('button',{name:'Edit or add CETs'}).click();await page.getByRole('dialog').getByRole('button',{name:'Prepare for an entrance exam',exact:true}).click();await shot(page,'pledge',width);
   await page.getByLabel('Planning date, if you have one').fill('2027-08-07');await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('button',{name:'Show my study space',exact:true}).click();await closeGuide(page);
   await page.getByRole('heading',{name:'UPCAT preparation',exact:true}).waitFor();assert.equal((await data(page)).setup.cet.targets[0].date,'2027-08-07');await page.getByText(/days to your planning target/).waitFor();await shot(page,'today',width);
   await page.goto(origin+'/plan');await page.getByRole('heading',{name:'Your exam targets'}).waitFor();assert.equal(await page.getByRole('button',{name:'Language Proficiency',exact:true}).evaluate(el=>getComputedStyle(el).color),'rgb(10, 42, 102)','Inactive subject labels remain visible on paper');await shot(page,'plan',width);
  },viewport);
  await scenario(`program mock autosave pause reload overtime results fix ${width}`,async page=>{
   const key='section~math|20260930',ids=formItems(formFromKey(key));await exam(page,key);
   await page.getByRole('radio').nth(itemById(ids[0]).answerIndex).click();await page.getByRole('button',{name:'Next',exact:true}).click();const wrong=itemById(ids[1]).misconceptions.findIndex(m=>m&&misconception(m)?.recovery);assert.ok(wrong>=0);await page.getByRole('radio').nth(wrong).click();
   await page.waitForTimeout(8500);const saved=await data(page),a=saved.attempts.at(-1);assert.equal(a.index,1);assert.equal(a.answers[ids[1]],wrong);assert.ok(a.elapsedMs[0]>=8000);
   await page.getByRole('button',{name:'Pause',exact:true}).click();const stopped=(await data(page)).attempts.at(-1);await page.waitForTimeout(1300);
   await page.getByRole('button',{name:'Resume',exact:true}).click();await page.reload();await page.getByRole('radiogroup',{name:'Choices'}).waitFor();const resumed=(await data(page)).attempts.at(-1);
   assert.equal(resumed.index,1);assert.equal(resumed.section,0);assert.deepEqual(resumed.answers,stopped.answers);assert.ok(resumed.seconds[ids[1]]-stopped.seconds[ids[1]]<1,'paused time was excluded');
   await shot(page,'exam-hall',width);if(width===375){await page.getByRole('button',{name:'Questions',exact:true}).click();await shot(page,'exam-navigator',width);await page.getByRole('button',{name:'Close',exact:true}).click();}
   await page.addInitScript(k=>{const s=JSON.parse(localStorage.getItem(k));if(s?.attempts.length){s.attempts.at(-1).elapsedMs[0]=70*60000+3000;localStorage.setItem(k,JSON.stringify(s));}},PROGRAM_KEY);await page.reload();await page.getByLabel('Over time').waitFor();assert.match(await page.getByLabel('Over time').innerText(),/^\+0:0\d over$/);await page.getByRole('button',{name:'Next',exact:true}).click();
   // At phone width reach the last item through the navigator, then submit.
   if(width===375)await page.getByRole('button',{name:'Questions',exact:true}).click();await page.locator('aside').getByRole('button',{name:'Question 50',exact:true}).click();await submit(page);await shot(page,'results',width);
   const answerLabels=page.getByText('Answer',{exact:true});assert.ok(await answerLabels.count()>0);await page.getByRole('button',{name:'Hide answers',exact:true}).click();assert.equal(await answerLabels.count(),0);await page.getByRole('button',{name:'Show answers',exact:true}).click();assert.ok(await answerLabels.count()>0);
   await page.getByRole('button',{name:/Fix this: find the missing skill/}).first().click();await page.waitForURL('**/study/session');await page.locator('.fix-landing').waitFor();await shot(page,'fix-landing',width);await page.getByRole('button',{name:'Start the lesson',exact:true}).click();await page.locator('.learning-stage').waitFor();const study=await page.evaluate(()=>JSON.parse(localStorage.getItem('backtrack.study.v1')));assert.equal(study.activeSession.tasks.length,1);const expected=misconception(itemById(ids[1]).misconceptions[wrong]).recovery;assert.equal(study.activeSession.tasks[0].topic,expected.topic);assert.equal(study.activeSession.tasks[0].skill,expected.skill);assert.equal(study.activeSession.complete,false);await shot(page,'study-session',width);
   // The same miss is listed on Find my missing skill until two fresh answers clear it.
   await page.goto(origin+'/start');await page.getByText(LABELS[expected.skill],{exact:true}).first().waitFor();assert.match(await page.locator('main').innerText(),/Missed \d+ questions? in /);await shot(page,'missing-skills',width);
  },viewport);
  await scenario(`program full form resumes the same section ${width}`,async page=>{
   const key='full~20260930';await exam(page,key);if(width===1280){assert.ok(await page.locator('aside').evaluate(el=>el.getBoundingClientRect().height<innerHeight),'Navigator is bounded by the viewport');assert.ok(await page.locator('aside').locator('xpath=preceding-sibling::div[1]').evaluate(el=>el.getBoundingClientRect().height<innerHeight),'Question sheet has its own natural height');}if(width===375)await page.getByRole('button',{name:'Questions',exact:true}).click();
   await page.locator('aside > div').nth(3).getByRole('button',{name:'Question 3',exact:true}).click();await page.getByRole('radio').nth(1).click();await page.reload();await page.getByRole('radiogroup').waitFor();const a=(await data(page)).attempts.at(-1);assert.equal(a.section,2);assert.equal(a.index,2);assert.equal(Object.values(a.answers)[0],1);
  },viewport);
  await scenario(`program bridge placement ${width}`,async page=>{
   await page.goto(origin+'/bridge');await page.getByRole('button',{name:/CS \/ IT|Computer Science/}).first().click();await page.waitForURL('**/bridge/cs_it');await shot(page,'bridge-program',width);await page.getByRole('link',{name:'Take the placement check',exact:true}).click();await page.getByRole('button',{name:'Enter the exam hall'}).click();await page.getByRole('radio').first().click();
   const a=(await data(page)).attempts.at(-1),f=formFromKey(a.formKey);if(width===375)await page.getByRole('button',{name:'Questions',exact:true}).click();await page.locator('aside').getByRole('button',{name:`Question ${f.sections[0].itemIds.length}`,exact:true}).click();await submit(page);assert.equal((await data(page)).bridgeProgram,'cs_it');await shot(page,'placement-result',width);
  },viewport);
  await scenario(`program calendar move add export ${width}`,async page=>{
   await seedPledge(page);await page.goto(origin+'/calendar');await page.getByRole('heading',{name:'Calendar',exact:true}).waitFor();await page.getByRole('button',{name:'Move',exact:true}).first().click();await page.getByLabel('New date').fill('2026-10-05');await page.locator('form').getByRole('button',{name:'Move',exact:true}).click();assert.ok((await data(page)).events.some(e=>e.date==='2026-10-05'));
   await page.getByRole('button',{name:'Add an event',exact:true}).click();await page.getByLabel('What',{exact:true}).fill('Review at the library');await page.getByRole('button',{name:/^Add to (this day|today)$/}).click();assert.ok((await data(page)).events.some(e=>e.title==='Review at the library'));await shot(page,'calendar',width);
   const dl=page.waitForEvent('download');await page.getByRole('button',{name:'Download calendar'}).click();const download=await dl;assert.match(await fs.readFile(await download.path(),'utf8'),/BEGIN:VCALENDAR/);
   if(width===375){await page.setViewportSize({width:320,height:850});await overflow(page);await page.screenshot({path:path.join(dir,'calendar-320.png'),fullPage:true});}
  },viewport);
  await scenario(`program reviewer search bookmark practice print recall ${width}`,async page=>{
   await page.goto(origin+'/reviewer');await page.getByRole('heading',{name:'The reviewer',exact:true}).waitFor();await shot(page,'reviewer',width);await page.locator('main details summary',{hasText:'Mathematics'}).click();const beforeVideo=await data(page);await page.getByRole('link',{name:/Sets and Venn diagrams/}).click();await page.waitForURL('**/learn/topic/outline-upcat-sets-and-venn-diagrams');const topicPlayer=page.locator('iframe[src*="youtube-nocookie.com/embed/c6TY6fVUlDQ"]');await topicPlayer.waitFor();const topicSrc=new URL(await topicPlayer.getAttribute('src'));assert.equal(topicSrc.searchParams.get('autoplay'),'0');assert.equal(topicSrc.searchParams.has('end'),false,'topic videos have no clip range');assert.equal(await topicPlayer.getAttribute('loading'),'lazy');const afterVideo=await data(page);for(const k of ['concepts','recall','attempts','studyDays','missions'])assert.deepEqual(afterVideo?.[k],beforeVideo?.[k],k+' unchanged by viewing a topic lesson');assert.equal(await page.getByRole('button',{name:/^Watch video:/}).count(),0);await page.getByRole('link',{name:/Back to the Reviewer/}).click();await page.locator('main details summary',{hasText:'Mathematics'}).click();const graphs=page.getByRole('button',{name:'Save Functions and their graphs',exact:true});await graphs.click();assert.equal(await graphs.getAttribute('aria-pressed'),'true');assert.equal(await page.getByRole('button',{name:'Save The coordinate plane, lines and slope',exact:true}).getAttribute('aria-pressed'),'false','topics sharing a summary save separately');await page.getByRole('searchbox').fill('fractions');await page.getByRole('button',{name:/Save Fractions/}).first().click();assert.ok((await data(page)).bookmarks.includes('percent_fractions'));await page.getByRole('link',{name:/Fractions, decimals/}).first().click();await page.waitForURL('**/learn/percent_fractions');assert.equal(await page.getByRole('button',{name:/^Watch video:/}).count(),0,'No duplicate disclosure below immediate lesson material');await page.getByRole('link',{name:/^Read “Fractions, decimals and percent”/}).click();await page.waitForURL('**/reviewer/m_fractions_percent');await shot(page,'reviewer-chapter',width);
   await page.getByRole('radio').first().click();await page.getByRole('button',{name:'Check',exact:true}).first().click();await page.getByText(/Correct\.|Not this time/).first().waitFor();
   await page.emulateMedia({media:'print'});assert.equal(await page.getByRole('navigation',{name:'Main'}).first().isVisible(),false);await shot(page,'reviewer-print',width);await page.emulateMedia({media:'screen'});
   await page.addInitScript(k=>{if(!sessionStorage.getItem('qa-recall')){const s=JSON.parse(localStorage.getItem(k));s.recall['concept:percent_fractions']={stage:0,last:Date.now(),due:Date.now()};localStorage.setItem(k,JSON.stringify(s));sessionStorage.setItem('qa-recall','1');}},PROGRAM_KEY);await page.goto(origin+'/review');await page.getByRole('heading',{name:'Daily recall'}).waitFor();await page.getByRole('button',{name:'Reveal answer',exact:true}).click();await page.getByRole('button',{name:'Still hard',exact:true}).click();assert.ok((await data(page)).recall['concept:percent_fractions'].due>Date.now());await shot(page,'review',width);
  },viewport);
  await scenario(`program recovery confidence and unknown ${width}`,async page=>{
   await page.goto(origin+'/start/brackets');await page.getByRole('button',{name:'15 min',exact:true}).click();await page.getByRole('button',{name:'Start with a check'}).click();await page.locator('.question-stage').waitFor();assert.equal(await page.locator('.confidence-visible button').count(),4);for(const b of await page.locator('.confidence-visible button').all())assert.equal(await b.isVisible(),true);assert.equal(await page.getByRole('button',{name:'I don’t know yet',exact:true}).isVisible(),true);await shot(page,'recovery-check',width);await page.goto(origin+'/me');await page.getByRole('link',{name:'Study space tour',exact:true}).click();await page.getByRole('dialog').waitFor();await page.getByRole('button',{name:'Explore on my own',exact:true}).click();assert.equal(await page.getByRole('dialog').count(),0);
  },viewport);
  await scenario(`program every new route layout ${width}`,async page=>{
   const routes=['/mock','/notebook','/admissions','/about','/group','/coach','/me','/bridge',...CONCEPTS.map(c=>`/learn/${c.id}`),...CHAPTERS.map(c=>`/reviewer/${c.id}`),...EXTRAS.map(c=>`/reviewer/${c.id}`),...PROGRAMS.map(p=>`/bridge/${p.id}`),'/mock/print?f=daily~20260930','/packs','/explore'];
   for(const route of routes){const response=await page.goto(origin+route);assert.equal(response.status(),200,route);await page.locator('h1').first().waitFor();await shot(page,route.replace(/[^\w]/g,'-'),width);if(route==='/packs')assert.ok((await page.locator('.pack-library > article').evaluateAll(cards=>cards.map(c=>c.children.length))).every(n=>n===8),'Every pack keeps eight direct children');}
  },viewport);
  await scenario(`program practice video after check ${width}`,async page=>{
   // The matched Khan video is embedded, paused, only once an answer is checked, once per page, and writes nothing.
   await page.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Video</title>'}));
   await page.goto(`${origin}/mock/take?f=${encodeURIComponent('topic~geometry|r1')}&mode=practice`);await page.getByRole('button',{name:'Enter the exam hall'}).click();await page.getByRole('radiogroup',{name:'Choices'}).waitFor();
   const player=page.locator('iframe[src^="https://www.youtube-nocookie.com/embed/"]');
   assert.equal(await player.count(),0,'No video before the answer is checked');
   await page.getByRole('radio').nth(1).click();const before=await data(page);await page.getByRole('button',{name:'Check',exact:true}).click();await page.getByText(/Correct\.|Not this time/).first().waitFor();
   await player.waitFor();assert.equal(await player.count(),1,'One player, not one per layout');
   assert.equal(new URL(await player.getAttribute('src')).searchParams.get('autoplay'),'0','Embedded paused');
   assert.equal(await player.evaluate(el=>!!el.closest('aside')),width===1280,'Side panel on wide screens, below the feedback on phones');
   assert.equal(await page.getByRole('button',{name:'Close video',exact:true}).count(),0);assert.equal(await page.locator('aside').count(),1);
   const after=await data(page);for(const k of ['concepts','recall','notebook','studyDays','missions'])assert.deepEqual(after[k],before[k],`${k} unchanged by the video`);
   await shot(page,'practice-video',width);
   // Exam mode keeps videos for the results page, where each question has one or says plainly it has none.
   await exam(page,'topic~usage|r1');await page.getByRole('radio').first().click();assert.equal(await player.count(),0,'No video during the exam');await submit(page);
   for(const li of await page.locator('#key ol > li').all())assert.ok(await li.locator('iframe[src*="autoplay=0"]').count()===1||await li.getByText('No Khan Academy video matches this question yet.').count()===1,'Each answered question shows its paused video or says it has none');
   assert.ok(await page.locator('#key iframe').count()>0);
  },viewport);
 }
 const messenger='Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.82 Mobile Safari/537.36 [FBAN/Orca-Android;FBAV/477.0.0.39.110;]';
 for(const width of [375,1280])await scenario(`program Messenger landing sprint exam ${width}`,async(page,context)=>{
  // A separate context is used so the requested user agent really reaches every document.
  const ctx=await context.browser().newContext({viewport:{width,height:850},userAgent:messenger});const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  try{await chooseGoal(p,origin,'exam');await closeGuide(p);await startDaily(p);await p.getByRole('radio').first().click();await p.getByRole('button',{name:'Check',exact:true}).click();await p.getByRole('button',{name:'Next question'}).click();await overflow(p);await exam(p,'daily~20260930');await p.getByRole('radio').first().click();await p.reload();await p.getByRole('radiogroup').waitFor();await overflow(p);assert.deepEqual(errors,[]);}finally{await ctx.close();}
 },{width,height:850});
}
