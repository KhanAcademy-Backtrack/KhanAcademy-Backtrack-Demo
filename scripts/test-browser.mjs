import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {problemFor} from '../src/lib/recovery.ts';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const origin='http://127.0.0.1:3050';
const server=spawn(process.execPath,['scripts/serve-static.mjs'],{cwd:root,env:{...process.env,BACKTRACK_PORT:'3050'},windowsHide:true,stdio:'pipe'});
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(Error(`Preview exited: ${code}`)));});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report=[];await fs.mkdir(path.join(root,'.refs/browser-review'),{recursive:true});
async function scenario(name,run,viewport={width:1280,height:850}){
  if(process.env.TEST_FILTER&&!new RegExp(process.env.TEST_FILTER).test(name))return;
  const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{await run(page,context);assert.deepEqual(errors,[],`Browser errors: ${errors.join('; ')}`);report.push({name,passed:true});console.log(`PASS ${name}`);}
  catch(error){await page.screenshot({path:path.join(root,'.refs/browser-review',name.replace(/\W+/g,'-')+'-failure.png'),fullPage:true});report.push({name,passed:false,error:error.message});console.log(`FAIL ${name}: ${error.message}`);}
  finally{await context.close();}
}
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('backtrack.study.v1')||'null'));
const overflow=async page=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal page overflow');
/** The live route from local storage, so the science journey answers the problem actually on screen. */
const routeOf=(page,topic)=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),`backtrack.route.v1.${topic}`);
async function answerCurrent(page,topic){
  const p=problemFor(await routeOf(page,topic));
  for(let i=0;i<p.labels.length;i++){
    const unit=p.fields?.[i]?.unit,name=unit?`${p.labels[i]} in ${unit}`:p.labels[i];
    await page.getByRole('textbox',{name,exact:true}).fill(String(p.expected[i]));
  }
  await page.getByRole('button',{name:'Check my answer'}).click();
  return p;
}
try{
 await scenario('mobile palette and navigation',async page=>{
   await page.goto(origin);await page.getByRole('heading',{name:'Let’s make a start.'}).waitFor();await overflow(page);
   assert.equal(await page.locator('.study-space .button-primary').first().evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(20, 191, 150)');
   assert.equal(await page.locator('h1').evaluate(el=>getComputedStyle(el).color),'rgb(10, 42, 102)');
   await page.screenshot({path:path.join(root,'.refs/browser-review/mobile-home.png'),fullPage:true});
   await page.getByRole('navigation',{name:'Study navigation'}).getByRole('link',{name:'Packs',exact:true}).click();await page.getByRole('heading',{name:'Your study packs.'}).waitFor();await overflow(page);
 },{width:390,height:844});
 await scenario('challenge to fresh checks reviewer and return',async page=>{
   await page.goto(origin+'/challenge?code=FQ1');await page.getByLabel('First number',{exact:true}).fill('2');await page.getByLabel('Second number',{exact:true}).fill('6');await page.getByRole('button',{name:'Check this answer',exact:true}).click();
   await page.getByRole('button',{name:'Try a fresh question'}).click();await page.getByRole('heading',{name:'Find two numbers that add to -10 and multiply to 21.'}).waitFor();
   assert.equal(await page.getByText('Comeback check',{exact:true}).count(),0);
   await page.getByRole('textbox',{name:'First factor number',exact:true}).fill('-3');await page.getByRole('textbox',{name:'Second factor number',exact:true}).fill('-7');await page.getByRole('button',{name:'Check my answer'}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();
   await page.getByRole('textbox',{name:'First factor number',exact:true}).fill('4');await page.getByRole('textbox',{name:'Second factor number',exact:true}).fill('-7');await page.getByRole('button',{name:'Check my answer'}).click();await page.getByRole('button',{name:'Continue my session'}).click();
   await page.getByRole('heading',{name:'You used it on fresh problems.'}).waitFor();await page.getByRole('textbox',{name:'Note to future you'}).fill('Check both the sum and the product.');await page.getByRole('button',{name:'Save my note'}).click();
   const before=await saved(page);assert.equal(before.xp,10);assert.equal(Object.keys(before.review).length,1);assert.ok(before.review['skill:factor'].dueAt>Date.now());
   await page.goto(origin);await page.getByRole('link',{name:'Choose another topic'}).waitFor();await page.getByText('Check both the sum and the product.',{exact:true}).waitFor();await page.reload();
   await page.getByRole('link',{name:'Choose another topic'}).waitFor();assert.equal((await saved(page)).xp,10);await page.screenshot({path:path.join(root,'.refs/browser-review/returning-home.png'),fullPage:true});
 });
 await scenario('personal notes draft edit save and recall',async page=>{
   await page.goto(origin+'/create');await page.getByRole('textbox',{name:'Pack name',exact:true}).fill('Fractions for Friday');await page.getByRole('textbox',{name:'Paste a useful section'}).fill('A denominator is the number of equal parts in a whole.');await page.getByRole('button',{name:'Draft cards from this text'}).click();
   await page.getByRole('textbox',{name:'Question',exact:true}).fill('What does a denominator tell us?');await page.getByRole('checkbox',{name:'I checked this card.'}).check();assert.equal(await page.getByRole('checkbox',{name:'Adding fractions',exact:true}).isChecked(),true);await page.getByRole('button',{name:'Save this study pack'}).click();
   await page.getByRole('heading',{name:'Fractions for Friday',exact:true}).waitFor();const card=page.locator('.study-pack-grid article').filter({has:page.getByRole('heading',{name:'Fractions for Friday',exact:true})});await card.locator('.pack-notes summary').click();await card.getByRole('button',{name:'Reveal my note'}).click();await card.getByRole('button',{name:'I recalled it'}).click();
   const data=await saved(page),pack=data.packs.find(p=>p.name==='Fractions for Friday');assert.equal(pack.cards[0].lastRating,'comfortable');assert.equal(data.xp,0);assert.equal(Object.keys(data.review).length,0);await page.reload();await page.getByRole('heading',{name:'Fractions for Friday',exact:true}).waitFor();await overflow(page);
 },{width:390,height:844});
 await scenario('PDF notes preserve page provenance',async page=>{
   await page.goto(origin+'/create');await page.locator('input[type=file]').setInputFiles(path.join(root,'tests/fixtures/notes.pdf'));await page.getByText('Draft cards added.',{exact:false}).waitFor();
   const text=await page.locator('.creator-cards').innerText();assert.match(text,/Page 1/);assert.match(text,/notes\.pdf/);assert.ok(await page.getByRole('textbox',{name:'Your explanation',exact:true}).count()>0);await overflow(page);
 });
 await scenario('supported Khan activity clip and preserved return',async page=>{
   await page.route('https://www.youtube-nocookie.com/**',route=>route.fulfill({contentType:'text/html',body:'<title>Player parameter check</title>'}));
   await page.goto(origin+'/khan');await page.getByRole('button',{name:'Learn it first',exact:true}).first().click();await page.getByRole('button',{name:/Khan explanation/}).click();await page.locator('.khan-player-cover').click();
   const frame=page.locator('.khan-player iframe');await frame.waitFor();let url=new URL(await frame.getAttribute('src'));assert.equal(url.searchParams.get('start'),'142');assert.equal(url.searchParams.get('end'),'236');
   await page.getByRole('button',{name:'Continue watching',exact:true}).click();url=new URL(await frame.getAttribute('src'));assert.equal(url.searchParams.get('start'),'236');assert.equal(url.searchParams.has('end'),false);
   const practice=page.locator('.khan-practice-stop a[target=_blank]').first();assert.match(await practice.getAttribute('href'),/khanacademy.org/);
   await practice.click({noWaitAfter:true});await page.getByRole('button',{name:'I completed it',exact:true}).click();assert.equal((await saved(page)).pendingKhan.feedback,'completed');assert.equal((await saved(page)).seen.length,0);
   await page.getByRole('button',{name:'Try a fresh check'}).click();await page.locator('.question-stage').waitFor();await page.reload();await page.locator('.question-stage').waitFor();assert.equal((await saved(page)).pendingKhan.feedback,'completed');
 });
 await scenario('quiz rehearsal can finish without a forced hint',async page=>{
   await page.goto(origin+'/packs');await page.getByRole('button',{name:'Quiz rehearsal',exact:true}).first().click();
   for(let round=0;round<2;round++){
     await page.getByRole('button',{name:'I don’t know yet',exact:true}).click();await page.getByRole('button',{name:'Next question'}).click();
     await page.getByRole('button',{name:'I don’t know yet',exact:true}).click();await page.getByRole('button',{name:'Continue my session'}).click();
     if(await page.getByRole('heading',{name:'You gave a difficult step some attention.'}).count())break;
   }
   await page.getByRole('heading',{name:'You gave a difficult step some attention.'}).waitFor();assert.equal((await saved(page)).xp,0);
 });
 await scenario('teacher sheets stay in their own week',async page=>{
   await page.goto(origin+'/schools');await page.getByRole('button',{name:'See a sample class'}).click();assert.equal(await page.locator('.teacher-learner').count(),3);
   await page.getByLabel('Teaching week').selectOption('2');assert.equal(await page.locator('.teacher-learner').count(),0);
   await page.getByLabel('Teaching week').selectOption('1');assert.equal(await page.locator('.teacher-learner').count(),3);
   await page.getByLabel('Current class goal').selectOption('fractions');assert.equal(await page.locator('.teacher-learner').count(),0);
   await page.getByLabel('Current class goal').selectOption('quadratics');assert.equal(await page.locator('.teacher-learner').count(),3);
 });
 await scenario('a physics destination routes into a repair, a lab, then fresh checks and a rematch',async page=>{
   await page.goto(origin+'/start/motion');
   await page.getByRole('heading',{name:'How much time today?'}).waitFor();
   await page.getByRole('button',{name:'15 min'}).click();
   await page.getByRole('button',{name:'Find my missing step'}).click();

   // A wrong destination answer, honestly uncertain, opens an investigation.
   await page.getByText('Destination check',{exact:true}).waitFor();
   const goal=problemFor(await routeOf(page,'motion'));
   assert.equal(goal.fields[0].unit,'m/s','the unit belongs beside the box, not inside it');
   await page.getByRole('textbox',{name:'Final speed in m/s',exact:true}).fill('1');
   await page.getByRole('button',{name:'I’m unsure'}).click();
   await page.getByRole('button',{name:'Check my answer'}).click();
   await page.getByRole('button',{name:'Continue',exact:true}).click();
   await page.locator('.question-stage').waitFor();
   assert.equal(await page.locator('.question-meta .eyebrow').innerText(),'UNIT CONVERSION','the goal miss opens the unit-conversion prerequisite');
   await overflow(page);

   // The original Dunlo lab: predict first, then the visual, then a fresh check.
   await page.getByRole('button',{name:'Learn this step'}).click();
   await page.getByRole('button',{name:'See it visually'}).click();
   await page.getByRole('radio',{name:/the 4 m\/s it already had still counts/}).check();
   await page.getByRole('button',{name:'Now show me'}).click();
   await page.getByRole('heading',{name:'Acceleration is speed added, second by second.'}).waitFor();
   await page.getByRole('button',{name:'Increase seconds'}).click();
   assert.match(await page.locator('.concept-invariant').innerText(),/final speed is/);
   assert.equal(await page.locator('.science-lab .track-figure').getAttribute('role'),'img');
   await page.screenshot({path:path.join(root,'.refs/browser-review/science-lab.png'),fullPage:true});
   await page.getByRole('button',{name:'Use the idea on a fresh check'}).click();

   // Two fresh, unassisted answers on problems the lab never showed.
   const seen=new Set();
   for(let i=0;i<2;i++){
     const p=await answerCurrent(page,'motion');
     assert.ok(!seen.has(p.expression),'a revealed problem came back as a fresh check');
     seen.add(p.expression);
     if(i===0)await page.getByRole('button',{name:'Continue',exact:true}).click();
   }
   await page.getByText('New capability',{exact:true}).waitFor();

   const data=await saved(page);
   const item=data.review['skill:unit_convert'];
   assert.ok(item,'the science step reaches the reviewer');
   assert.equal(item.topic,'motion');
   assert.equal(item.streak,2);
   assert.ok(item.dueAt>Date.now(),'two fresh checks earn a future review date');
   assert.ok(!data.review['motion:goal']?.independentAt,'the destination is not passed off the back of a prerequisite');

   // The step is waiting in the reviewer, and a Rematch opens a fresh version.
   await page.goto(origin+'/review');
   const card=page.locator('.review-grid article').filter({has:page.getByRole('heading',{name:'Unit conversion',exact:true})});
   await card.getByRole('button',{name:/Rematch/}).click();
   await page.locator('.question-stage').waitFor();
   assert.equal(await page.getByRole('heading',{name:goal.prompt}).count(),0,'a rematch is a fresh version, not the old one');
   await overflow(page);
 });
 await scenario('science destinations, packs and class options are grouped by subject',async page=>{
   await page.goto(origin+'/start');
   for(const heading of ['Mathematics','Chemistry','Physics'])await page.getByRole('heading',{name:heading,exact:true}).waitFor();
   assert.equal(await page.locator('.destination-option').count(),9);
   await page.getByRole('link',{name:/Balancing equations/}).click();
   await page.getByRole('heading',{name:'How much time today?'}).waitFor();
   await overflow(page);
   await page.goto(origin+'/packs');
   await page.getByRole('heading',{name:'Counting in chemistry',exact:true}).waitFor();
   await page.getByRole('heading',{name:'Motion and forces',exact:true}).waitFor();
   const rows=await page.locator('.pack-library>article').evaluateAll(cards=>cards.map(c=>c.children.length));
   assert.deepEqual([...new Set(rows)],[8],'a pack card must keep its eight children for the desktop subgrid');
   await page.goto(origin+'/schools');
   assert.deepEqual(await page.getByLabel('Current class goal').locator('optgroup').evaluateAll(g=>g.map(x=>x.label)),['Mathematics','Chemistry','Physics']);
   // Balancing has no hand-verified Khan exercise on either of its steps, and says so.
   await page.getByLabel('Current class goal').selectOption('balancing');
   await page.getByText('No reviewed Khan Academy exercise is matched to this goal yet.',{exact:false}).waitFor();
   // A physics goal still reaches matched Khan practice through its mathematics prerequisite.
   await page.getByLabel('Current class goal').selectOption('forces');
   await page.getByRole('link',{name:/Evaluate expressions/}).waitFor();
   await overflow(page);
 });
 await scenario('group turns do not become personal mastery',async page=>{
   await page.goto(origin+'/together');await page.getByRole('textbox',{name:'Who is at the study table?'}).fill('Ana, Ben');await page.getByRole('button',{name:'Start taking turns'}).click();await page.getByRole('heading',{name:'Ana’s turn.'}).waitFor();
   await page.getByRole('button',{name:'Work through it together'}).click();await page.locator('.together-question input').first().fill('0');await page.locator('.together-question input').last().fill('1');await page.getByRole('button',{name:'Check together',exact:true}).click();await page.getByRole('button',{name:'Pass the turn'}).click();await page.getByRole('heading',{name:'Ben’s turn.'}).waitFor();await page.reload();await page.getByRole('heading',{name:'Ben’s turn.'}).waitFor();
   const data=await saved(page);assert.equal(data.xp,0);assert.equal(Object.keys(data.review).length,0);await overflow(page);
 },{width:360,height:800});
}finally{
 await browser.close();server.kill();await fs.writeFile(path.join(root,'.refs/browser-acceptance.json'),JSON.stringify({at:new Date().toISOString(),results:report},null,2));
}
if(report.some(r=>!r.passed))process.exitCode=1;
