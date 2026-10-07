import assert from 'node:assert/strict';

/** The BACKTRACK route map: a prerequisite graph that regrows as answers come in. */
export async function routeMapJourneys({scenario,origin}){
 const node=(page,name)=>page.getByRole('button',{name:new RegExp(`^${name}`)});
 const spot=(page,name)=>page.locator('.route-node',{has:node(page,name)}).evaluate(li=>li.style.transform);
 const miss=async page=>{
  for(const input of await page.locator('.learning-stage input:not([type=radio])').all())await input.fill('-999');
  await page.getByRole('button',{name:'I’m unsure'}).click();
  await page.getByRole('button',{name:/Check my answer/}).click();
 };

 await scenario('route map regrows on a miss and springs back from a tug',async page=>{
  await page.goto(origin+'/start/motion');
  await node(page,'Today’s goal').waitFor();
  await page.waitForTimeout(900);
  // Two skills the goal rests on sit side by side, not in a queue.
  assert.equal((await spot(page,'Use a value in a rule')).match(/translateY\([^)]*\)/)?.[0],(await spot(page,'Unit conversion')).match(/translateY\([^)]*\)/)?.[0]);
  await page.getByRole('button',{name:/Start with a check/}).click();
  await miss(page);
  await page.getByRole('button',{name:/^Unit conversion, Up next/}).waitFor();
  await page.getByRole('button',{name:/Continue/}).first().click();
  await miss(page);
  // The missed skill's own foundation joins the map, shared by both skills above it.
  const multiply=node(page,'Multiply numbers');
  await multiply.waitFor();
  const about=await multiply.evaluate(b=>document.getElementById(b.getAttribute('aria-describedby')).textContent);
  assert.equal(about,'Needed for use a value in a rule and unit conversion.');
  assert.equal(await page.locator('.route-edge').count(),4);
  await page.waitForTimeout(900);
  // A tug moves the step and its lines; letting go springs it home without opening it.
  const home=await spot(page,'Unit conversion'),line=await page.locator('.route-edge.is-route').first().getAttribute('d');
  const box=await node(page,'Unit conversion').boundingBox();
  await page.mouse.move(box.x+20,box.y+15);await page.mouse.down();await page.mouse.move(box.x+60,box.y+60,{steps:6});
  assert.notEqual(await spot(page,'Unit conversion'),home);
  assert.notEqual(await page.locator('.route-edge.is-route').first().getAttribute('d'),line,'lines follow the step');
  await page.mouse.up();await page.waitForTimeout(900);
  assert.equal(await spot(page,'Unit conversion'),home);
  assert.equal(await node(page,'Unit conversion').getAttribute('aria-expanded'),'false');
  // Choosing a step explains its links.
  await multiply.click();
  assert.equal(await multiply.getAttribute('aria-expanded'),'true');
  await page.locator('.route-reason').getByText('Needed for use a value in a rule and unit conversion.').waitFor();
 });

 await scenario('route map fits a phone and stays still with reduced motion',async page=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(origin+'/start/quadratics');
  await page.getByRole('button',{name:/See route/}).click();
  await node(page,'Today’s goal').waitFor();
  await page.getByRole('button',{name:/Start with a check/}).click();
  await miss(page);
  // Placed at once: no spring, no fade.
  const label=await page.locator('.route-node').evaluateAll(lis=>lis.map(li=>getComputedStyle(li).opacity));
  assert.ok(label.every(o=>o==='1'),`opacity ${label}`);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal page overflow');
  for(const b of await page.locator('.route-node button').all()){const r=await b.boundingBox();assert.ok(r.height>=40,'tap target');}
 },{width:375,height:812});
}
