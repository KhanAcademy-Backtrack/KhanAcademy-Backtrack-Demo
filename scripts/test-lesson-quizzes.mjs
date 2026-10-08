import assert from 'node:assert/strict';
import {LESSON_QUIZZES,verifiedLessonSegment,PILOT_LESSONS} from '../src/content/lesson-quizzes/index.ts';
import {LESSON_BY_ID,lessonHref} from '../src/lib/program/topic-lessons.ts';
import {readingsFor} from '../src/lib/program/lesson-readings.ts';
import {PROGRAM_KEY,initialProgram} from '../src/lib/program/store.ts';

const snapshot=page=>page.evaluate(({key,empty})=>{
 const p=JSON.parse(localStorage.getItem(key)||'null')??empty;
 return {study:localStorage.getItem('backtrack.study.v1'),routes:Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('backtrack.route.v1.')).sort().map(k=>[k,localStorage.getItem(k)])),program:p?Object.fromEntries(['attempts','concepts','recall','notebook','daily','studyDays','missions','placement'].map(k=>[k,p[k]])):null};
},{key:PROGRAM_KEY,empty:initialProgram()});
const program=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),PROGRAM_KEY);
const overflow=async page=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'lesson quiz overflows viewport');

/** Real content only. The absence of caption-reviewed content is visibly skipped,
 * never counted as a completed quiz or replaced with a fabricated teaching item. */
export async function lessonQuizJourneys({scenario,origin,fixture}){
 const quiz=fixture?.quiz??Object.values(LESSON_QUIZZES).find(q=>verifiedLessonSegment(q));
 for(const width of [375,1280]){
  const viewport={width,height:850};
  if(!quiz){
   console.log(`SKIP lesson quiz miss, rewatch and completion ${width}: caption-reviewed pilot quiz with a VERIFIED_CLIPS segment not yet available.`);
   await scenario(`program pending lesson quiz preserves evidence ${width}`,async page=>{
    await page.goto(origin+lessonHref(PILOT_LESSONS[0].id));await page.locator('[data-lesson-material]').waitFor();
    const before=await snapshot(page);
    assert.equal(await page.locator('[data-lesson-quiz]').count(),0);
    const player=page.locator('iframe[src*="youtube-nocookie.com"]');await player.first().waitFor();
    assert.equal(new URL(await player.first().getAttribute('src')).searchParams.get('autoplay'),'0');
    await page.reload();await page.locator('[data-lesson-material]').waitFor();
    assert.deepEqual(await snapshot(page),before);assert.equal((await program(page))?.lessonChecks,undefined);await overflow(page);
   },viewport);
   continue;
  }
  await scenario(`program lesson quiz miss rewatch completion and retake ${width}`,async page=>{
   const lesson=fixture?.lesson??LESSON_BY_ID[quiz.lessonId],clip=verifiedLessonSegment(quiz);
   await page.goto(origin+(fixture?.route??lessonHref(quiz.lessonId)));await page.locator('[data-lesson-quiz]').waitFor();
   const before=await snapshot(page),panel=page.locator('[data-lesson-quiz]');
   const readNext=page.getByRole('region',{name:'Read Next'});assert.equal(await readNext.count(),0,'readings wait until the lesson check is finished');
   if(quiz.prediction){const p=page.getByRole('region',{name:'Predict First'});assert.equal(await p.locator('[aria-label="Correct answer"]').count(),0);await p.getByRole('radio').first().click();}
   await panel.getByRole('button',{name:'Start Lesson Check',exact:true}).click();
   await panel.getByRole('radio').nth((quiz.items[0].answerIndex+1)%4).click();await panel.getByRole('button',{name:'Check',exact:true}).click();
   await panel.getByText('Not this time. Here is why.',{exact:true}).waitFor();
   // Lesson misconception ids can coincide with shared registry ids; every choice must keep the quiz's own rationale.
   await panel.getByRole('button',{name:/^Show explanation$/i}).click();
   for(const [i,r] of quiz.items[0].rationales.entries()){const prose=r.split('$')[0].trim().slice(0,24);if(prose.length>=8)assert.ok(await panel.getByRole('listitem').filter({hasText:prose}).count()>=1,`Every choice line ${i} must show the quiz rationale`);}
   const rewatch=panel.getByRole('link',{name:/^Rewatch verified segment:/});await rewatch.waitFor();await rewatch.click();
   const player=page.locator(`iframe[src*="youtube-nocookie.com/embed/${quiz.videoId}"]`);await player.waitFor();
   const src=new URL(await player.getAttribute('src'));assert.equal(src.searchParams.get('start'),String(clip.start));assert.equal(src.searchParams.get('end'),String(clip.end));assert.equal(src.searchParams.get('autoplay'),'0');
   assert.equal(await page.locator('script[src*="iframe_api"]').count(),0);
   if(lesson.guide)assert.equal(await panel.getByRole('link',{name:'Read the Worked Example'}).count(),1);
   assert.deepEqual(await snapshot(page),before,'miss and rewatch cannot write BACKTRACK evidence or change gaps');
   await panel.getByRole('button',{name:'Next Question',exact:true}).click();
   for(let i=1;i<4;i++){
    await panel.getByRole('radio').nth(i===3?(quiz.items[i].answerIndex+1)%4:quiz.items[i].answerIndex).click();await panel.getByRole('button',{name:'Check',exact:true}).click();
    if(i===3){await panel.getByText('Not this time. Here is why.',{exact:true}).waitFor();await panel.getByRole('button',{name:'Finish Lesson Check',exact:true}).click();}
    else await panel.getByRole('button',{name:'Next Question',exact:true}).click();
   }
   await panel.getByText(/Lesson check finished: 2 of 4 correct/).waitFor();
   if(readingsFor(quiz.lessonId).length){await readNext.waitFor();const links=readNext.getByRole('link');assert.equal(await links.count(),readingsFor(quiz.lessonId).length);
    for(const l of await links.all()){assert.equal(await l.getAttribute('target'),'_blank');assert.match(await l.getAttribute('rel'),/noopener/);}
    await links.first().evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));await links.first().click();}
   if(quiz.prediction)await panel.getByRole('heading',{name:'Revisit Your Prediction',exact:true}).waitFor();
   const practice=panel.getByRole('link',{name:/↗$/});assert.equal(await practice.getAttribute('href'),quiz.practice.url);
   // Prevent navigation; the real external page was hand-verified during authoring.
   await practice.evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));await practice.click();
   await panel.getByRole('button',{name:'Still difficult',exact:true}).click();
   const c=(await program(page)).lessonChecks[quiz.lessonId];assert.ok(c.completedAt);assert.equal(c.practice.report,'still_difficult');assert.equal(c.runs,1);
   assert.deepEqual(await snapshot(page),before,'completion and self-report cannot clear gaps or write evidence');
   await page.reload();await page.getByText(/Lesson check finished: 2 of 4 correct/).waitFor();
   await page.getByRole('button',{name:'Retake These Items',exact:true}).click();
   const repeat=(await program(page)).lessonChecks[quiz.lessonId];assert.equal(repeat.runs,2);assert.deepEqual(repeat.itemIds,c.itemIds);assert.deepEqual(repeat.checked,[false,false,false,false]);
   assert.deepEqual(await snapshot(page),before);await overflow(page);
  },viewport);
 }
}
