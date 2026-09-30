import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {PROGRAM_KEY,initialProgram} from '../src/lib/program/store.ts';

export async function programTourJourneys({scenario,origin,root}){
 const dir=path.join(root,'.refs/program-review');await fs.mkdir(dir,{recursive:true});
 const data=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),PROGRAM_KEY);
 const overflow=async page=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');
 const titles=['Start with a few questions.','Choose a goal that fits you.','Come back to a clear next step.','Practise at your own pace.','Find the explanation you need.','Keep each other going.'];
 await scenario('program homepage at intermediate pane widths',async page=>{
  await page.goto(origin);await page.getByRole('heading',{name:'Know what to study next.'}).waitFor();await page.evaluate(()=>document.fonts.ready.then(()=>true));
  for(const width of [320,560,640,768,1024,1280]){
   await page.setViewportSize({width,height:850});
   const lines=await page.locator('h1').evaluate(h=>{
    const text=h.textContent,walker=document.createTreeWalker(h,NodeFilter.SHOW_TEXT),nodes=[];let node;
    while(node=walker.nextNode())nodes.push(node);
    const wordRect=word=>{let offset=text.indexOf(word);for(const n of nodes){if(offset<n.textContent.length){const range=document.createRange();range.setStart(n,offset);range.setEnd(n,offset+word.length);const r=range.getBoundingClientRect();return {y:r.y,right:r.right};}offset-=n.textContent.length;}};
    return {know:wordRect('Know'),to:wordRect('to'),study:wordRect('study'),next:wordRect('next'),right:h.getBoundingClientRect().right};
   });
   assert.ok(Math.abs(lines.know.y-lines.to.y)<1,'First phrase stays together');assert.ok(Math.abs(lines.study.y-lines.next.y)<1,'No orphaned final word');assert.ok(lines.study.y>lines.know.y,'Headline has two clear lines');
   assert.ok(Object.values(lines).filter(x=>typeof x==='object').every(r=>r.right<=lines.right+2),'Headline fits its column');await overflow(page);
   await page.screenshot({path:path.join(dir,`home-pane-${width}.png`),fullPage:true});
  }
 },{width:560,height:850});
 for(const width of [375,1280]){
  await scenario(`program homepage and six-step quick tour ${width}`,async page=>{
   await page.goto(origin);await page.getByRole('heading',{name:'Know what to study next.'}).waitFor();
   assert.equal(await page.getByRole('dialog').count(),0);
   assert.equal(await page.getByText(/The UPCAT is free|So is UP|very large bank|Matthew Labrador|PISA/).count(),0);
   assert.ok(await page.locator('#try').evaluate(el=>el.getBoundingClientRect().top<innerHeight-120),'Practice is visible on the first screen');
   await page.getByRole('radio').first().check();const before=await data(page);
   await page.getByRole('button',{name:'Show me around',exact:true}).click();
   const dialog=page.getByRole('dialog');await dialog.getByRole('heading',{name:titles[0]}).waitFor();
   assert.ok(await page.locator('main').evaluate(el=>!!el.closest('[inert]')));
   await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Skip tour');
   for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>!!document.activeElement.closest('[role="dialog"]')),'Focus remains inside the tour');}
   for(let i=0;i<titles.length;i++){
    await dialog.getByRole('heading',{name:titles[i]}).waitFor();await overflow(page);await page.screenshot({path:path.join(dir,`quick-tour-${i+1}-${width}.png`),fullPage:true});
    assert.ok(await dialog.evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1;}));
    if(i<titles.length-1)await dialog.getByRole('button',{name:'Next',exact:true}).click();
   }
   await dialog.getByRole('button',{name:'Back',exact:true}).click();await dialog.getByRole('heading',{name:titles[4]}).waitFor();
   await dialog.getByRole('button',{name:'Next',exact:true}).click();await dialog.getByRole('button',{name:'Finish tour',exact:true}).click();
   assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Show me around');
   assert.equal(await page.getByRole('radio').first().isChecked(),true);assert.deepEqual(await data(page),before,'Tour does not write learning or planning records');
   assert.equal(await page.locator('main').evaluate(el=>!!el.closest('[inert]')),false);
   await page.getByText('Where is my progress saved?',{exact:true}).click();await page.getByRole('link',{name:'Open settings and backups'}).waitFor();
   await page.reload();await page.getByRole('heading',{name:'Know what to study next.'}).waitFor();assert.equal(await page.getByRole('dialog').count(),0);
   await page.goto(origin+'/evidence');await page.getByRole('heading',{name:'Understanding your progress'}).waitFor();assert.equal(await page.getByText(/Our pilot|compare this routine|research behind/i).count(),0);
  },{width,height:850});
  await scenario(`program tour replay and college context ${width}`,async page=>{
   await page.goto(origin+'/me');await page.getByRole('button',{name:'Show me around',exact:true}).click();await page.getByRole('heading',{name:titles[0]}).waitFor();
   await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Show me around');
   await page.getByRole('button',{name:'Me',exact:true}).click();await page.locator('#me-menu').getByRole('button',{name:'Show me around',exact:true}).click();await page.getByRole('heading',{name:titles[0]}).waitFor();
   await page.getByRole('button',{name:'Close tour',exact:true}).click();assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Me');
   const s=initialProgram();s.sides.bridge=true;s.activeSide='bridge';s.bridgeProgram='cs_it';
   await page.addInitScript(({k,s})=>localStorage.setItem(k,JSON.stringify(s)),{k:PROGRAM_KEY,s});await page.reload();
   await page.getByRole('button',{name:'Show me around',exact:true}).click();await page.getByRole('heading',{name:titles[0]}).waitFor();
   await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByRole('heading',{name:titles[1]}).waitFor();
   assert.equal(await page.getByRole('link',{name:'Choose my goal'}).getAttribute('href'),'/bridge');
   await page.getByRole('link',{name:'Choose my goal'}).click();await page.waitForURL('**/bridge');await page.getByRole('heading',{name:'Start college strong'}).waitFor();assert.equal(await page.getByRole('dialog').count(),0);
   assert.equal(await page.evaluate(()=>document.body.style.overflow),'');await overflow(page);
  },{width,height:850});
 }
 await scenario('program quick tour on a short phone and quiet mode',async page=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(origin);await page.getByRole('button',{name:'Show me around',exact:true}).click();await page.getByRole('heading',{name:titles[0]}).waitFor();
  for(let i=0;i<6;i++){
   const box=await page.getByRole('dialog').boundingBox(),highlight=await page.locator('[data-tour-highlight]').boundingBox();
   assert.ok(box.y+box.height<highlight.y,'Tour leaves the phone navigation visible');await overflow(page);
   await page.getByRole('button',{name:i===5?'Finish tour':'Next',exact:true}).click();
  }
  await page.goto(origin+'/me');await page.getByRole('checkbox',{name:'Quiet mode: still pictures, no movement'}).check();
  await page.getByRole('button',{name:'Show me around',exact:true}).click();await page.getByRole('heading',{name:titles[0]}).waitFor();
  assert.equal(await page.getByRole('dialog').evaluate(el=>el.getAnimations({subtree:true}).length),0);
  await page.getByRole('button',{name:'Skip tour',exact:true}).click();assert.equal(await page.getByRole('dialog').count(),0);
 },{width:320,height:568});
}
