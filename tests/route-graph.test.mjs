import test from 'node:test';
import assert from 'node:assert/strict';
import {initialRecovery,recoveryReducer,problemFor,skillDependencies,TOPICS,ORDER} from '../src/lib/recovery.ts';
import {routeGraph,layoutRoute,estimateLines,edgePath,ROUTE_METRICS} from '../src/lib/route-graph.ts';

let clock=1;
const act=(s,a)=>recoveryReducer(s,{now:clock++,...a});
const start=topic=>act(initialRecovery(topic),{type:'start',budget:60,mode:'self'});
const miss=(s,confidence='unsure')=>act(s,{type:'submit',answers:problemFor(s).labels.map(()=>'-999'),confidence});
const pass=s=>act(s,{type:'submit',answers:problemFor(s).expected.map(String),confidence:'unsure'});
const next=s=>act(s,{type:'continue'});
const edge=(g,from,to)=>g.edges.find(e=>e.from===from&&e.to===to);
const node=(g,id)=>g.nodes.find(n=>n.id===id);
const placed=(s,w=292)=>Object.fromEntries(layoutRoute(routeGraph(s),w).nodes.map(n=>[n.id,n]));
const attempt=(topic,skill,serial,extra={})=>({id:`${topic}:${skill}:${serial}`,skill,answer:['1'],correct:true,assisted:false,confidence:'unsure',at:serial+1,purpose:'route',...extra});

/** Routes a learner can actually reach: every topic's start, a run of misses, a pass after a miss,
 *  and a support detour or fix task onto each skill the topic's skills rest on. */
function reachable(){
 const states=[];
 for(const topic of Object.keys(TOPICS)){
  let s=start(topic);states.push(s);
  for(let i=0;i<4;i++){s=next(miss(s));states.push(s);}
  let t=start(topic);t=next(miss(t));t=next(pass(t));states.push(t);
  const family=new Set(TOPICS[topic].path);
  for(let grew=true;grew;){grew=false;for(const id of [...family])for(const d of skillDependencies(id,topic))if(!family.has(d)){family.add(d);grew=true;}}
  for(const extra of [...family,'multiply']){
   if(extra==='goal')continue;
   states.push({...start(topic),active:extra,phase:'learn'});
   states.push({...start(topic),active:extra,planned:[...new Set([...TOPICS[topic].path,extra])].sort((a,b)=>ORDER.indexOf(a)-ORDER.indexOf(b))});
  }
 }
 return states;
}

test('a goal resting on two skills draws them side by side, not in a queue',()=>{
 const g=routeGraph(start('brackets'));
 assert.deepEqual(new Set(g.nodes.map(n=>n.id)),new Set(['expand','linear','goal']));
 assert.ok(edge(g,'expand','goal')&&edge(g,'linear','goal'));
 assert.equal(edge(g,'expand','linear'),undefined,'siblings are not chained');
 const at=placed(start('brackets'));
 assert.equal(at.expand.row,at.linear.row);
 assert.ok(at.goal.row<at.expand.row,'the goal sits above what it rests on');
 assert.notEqual(at.expand.x,at.linear.x);
 assert.equal(node(g,'goal').kind,'active');
 assert.equal(node(g,'goal').status,'You’re here');
 assert.equal(node(routeGraph(initialRecovery('brackets')),'goal').status,'First check');
});

test('a missed check grows the route downward and keeps the goal where it was',()=>{
 let s=start('quadratics');
 const before=placed(s).goal;
 s=next(miss(s));s=next(miss(s));s=next(miss(s));
 const g=routeGraph(s),at=placed(s);
 assert.deepEqual(new Set(g.nodes.map(n=>n.id)),new Set(['terms','distribute','factor','zero','goal']));
 assert.ok(edge(g,'terms','distribute')&&edge(g,'distribute','factor')&&edge(g,'factor','goal')&&edge(g,'zero','goal'));
 assert.equal(edge(g,'zero','factor'),undefined);
 assert.equal(at.goal.y,before.y,'the destination does not move');
 assert.equal(at.goal.x,before.x,'nor does it slide sideways');
 assert.ok(at.terms.rank===3&&at.distribute.rank===2&&at.factor.rank===1&&at.zero.rank===1);
 assert.equal(node(g,'terms').kind,'active');
 assert.deepEqual(g.edges.filter(e=>e.onRoute).map(e=>`${e.from}>${e.to}`).sort(),['distribute>factor','factor>goal','terms>distribute']);
 assert.equal(edge(g,'zero','goal').onRoute,false,'a sibling is context, not the way ahead');
});

test('siblings keep their sides while the route moves between them',()=>{
 let s=start('motion');
 const sides=[];
 const look=()=>{const at=placed(s);sides.push(at.unit_convert.x<at.substitute.x);};
 look();s=miss(s);look();s=next(s);look();s=pass(s);look();s=next(s);look();
 assert.ok(sides.every(x=>x===sides[0]),`sides changed: ${sides}`);
});

test('feedback marks where the route goes next',()=>{
 let s=start('quadratics');
 s=miss(s);
 assert.equal(s.phase,'feedback');
 const g=routeGraph(s),upcoming=g.nodes.filter(n=>n.next);
 assert.deepEqual(upcoming.map(n=>[n.id,n.status]),[[s.nextSkill,'Up next']]);
 assert.equal(node(g,'goal').status,'You’re here');
 assert.equal(routeGraph(next(s)).nodes.filter(n=>n.next).length,0,'nothing is "up next" once you are there');
});

test('a shared foundation is one node under both skills, and stays visible once checked',()=>{
 let s=start('motion');
 s=next(miss(s));s=next(miss(s));
 assert.equal(s.active,'multiply');
 s=next(pass(s));s=next(pass(s));
 assert.ok(s.passed.includes('multiply'));
 const g=routeGraph(s);
 assert.equal(g.nodes.filter(n=>n.id==='multiply').length,1);
 assert.equal(node(g,'multiply').kind,'checked');
 assert.ok(edge(g,'multiply','substitute').checked&&edge(g,'multiply','unit_convert').checked);
 assert.equal(g.checked,1);
 assert.equal(g.remaining,2);
 const at=placed(s);
 assert.equal(at.multiply.rank,2);
 assert.ok(Math.abs(at.multiply.x-(at.substitute.x+at.unit_convert.x)/2)<1,'the shared foundation settles between the skills it holds up');
});

test('a wrong-turn clue links to the skill whose answer raised it, even after the route re-sorts',()=>{
 const base=start('brackets');
 const clueState={...base,active:'expand',planned:['multiply','expand','goal'],routeClue:{skill:'multiply',message:'Check every group.',serial:4},evidence:[attempt('brackets','expand',4,{correct:false})]};
 assert.ok(edge(routeGraph(clueState),'multiply','expand')?.inferred);
 // Later the reducer re-sorts the plan and puts like terms between them.
 const later={...clueState,planned:['multiply','terms','expand','goal'],passed:['multiply'],evidence:[...clueState.evidence,attempt('brackets','multiply',5),attempt('brackets','multiply',6),attempt('brackets','expand',7,{correct:false})]};
 const g=routeGraph(later);
 assert.ok(edge(g,'multiply','expand')?.inferred);
 assert.equal(edge(g,'multiply','terms'),undefined);
 assert.ok(edge(g,'terms','expand')&&!edge(g,'terms','expand').inferred);
});

test('a support detour stays on the map once checked, linked to the skill that was probed',()=>{
 const s={...start('quadratics'),active:'factor',passed:['multiply'],evidence:[attempt('quadratics','factor',2,{family:'diagnostic',assisted:true,classification:'assisted'}),attempt('quadratics','multiply',3),attempt('quadratics','multiply',4)]};
 const g=routeGraph(s);
 assert.equal(node(g,'multiply')?.kind,'checked');
 assert.ok(edge(g,'multiply','factor')?.inferred);
 assert.equal(g.checked,1);
});

test('a skill from an earlier round does not reappear as a detour',()=>{
 const s={...start('quadratics'),cycleStart:10,passed:['multiply'],evidence:[attempt('quadratics','multiply',3),attempt('quadratics','multiply',4)]};
 assert.equal(node(routeGraph(s),'multiply'),undefined);
});

test('the current skill is always on the map, even when a detour put it there',()=>{
 const g=routeGraph({...start('quadratics'),active:'multiply',phase:'learn'});
 assert.equal(node(g,'multiply').kind,'active');
 assert.ok(g.edges.some(e=>e.from==='multiply'&&e.inferred),'linked by suggestion, never left floating');
});

test('a finished route keeps only what was checked, until a next-step question opens',()=>{
 let s=start('ratios');
 s=next(pass(s));s=pass(s);
 assert.ok(s.goalPassed);
 const g=routeGraph(s);
 assert.deepEqual(g.nodes.map(n=>[n.id,n.kind]),[['goal','checked']]);
 assert.equal(g.edges.length,0);
 assert.equal(g.remaining,0);
 s=act(next(s),{type:'next'});
 assert.equal(s.extension,true);
 const extra=routeGraph(s);
 assert.equal(node(extra,s.active)?.kind,'active');
 assert.equal(node(extra,'goal').kind,'checked');
});

test('reachable routes never need more than two side-by-side skills',()=>{
 for(const s of reachable()){
  const l=layoutRoute(routeGraph(s),292),perRank={};
  for(const n of l.nodes)perRank[n.rank]=(perRank[n.rank]??0)+1;
  assert.ok(Math.max(...Object.values(perRank))<=2,`${s.topic} with ${s.active}: ${JSON.stringify(perRank)}`);
 }
});

test('every reachable route lays out without overlaps or escaping the box',()=>{
 for(const s of reachable())for(const w of [200,212,236,260,292,320,420,700]){
  const g=routeGraph(s),l=layoutRoute(g,w);
  assert.equal(l.nodes.length,g.nodes.length);
  assert.ok(l.nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)));
  for(const n of l.nodes){
   assert.ok(n.x-ROUTE_METRICS.halo>=-0.01,`${s.topic} ${n.id} leaves the left edge at ${w}`);
   assert.ok(n.x+n.r+ROUTE_METRICS.gap+n.labelWidth<=w+0.01,`${s.topic} ${n.id} label leaves the right edge at ${w}`);
   assert.ok(n.labelWidth>=48,`${s.topic} ${n.id} label too narrow at ${w}`);
   assert.ok(n.bottom<=l.height);
  }
  for(let i=0;i<l.nodes.length;i++)for(let j=i+1;j<l.nodes.length;j++){
   const a=l.nodes[i],b=l.nodes[j];
   const ax=[a.x-a.r,a.x+a.r+ROUTE_METRICS.gap+a.labelWidth],bx=[b.x-b.r,b.x+b.r+ROUTE_METRICS.gap+b.labelWidth];
   const ay=[Math.min(a.top,a.y-a.r),Math.max(a.bottom,a.y+a.r)],by=[Math.min(b.top,b.y-b.r),Math.max(b.bottom,b.y+b.r)];
   assert.ok(!(ax[0]<bx[1]&&bx[0]<ax[1]&&ay[0]<by[1]&&by[0]<ay[1]),`${s.topic}: ${a.id} and ${b.id} overlap at ${w}`);
  }
  for(const e of l.edges){const a=l.nodes.find(n=>n.id===e.from),b=l.nodes.find(n=>n.id===e.to);assert.ok(a.y>b.y,`${e.from}>${e.to} points up`);}
 }
});

/** Points along a layout path: "M x,y L x,y" or "M x,y C a,b c,d e,f L x,y". */
function sample(d){
 const n=d.match(/-?\d+(?:\.\d+)?/g).map(Number),pts=[];
 if(n.length===4){for(let t=0;t<=1;t+=.02)pts.push([n[0]+(n[2]-n[0])*t,n[1]+(n[3]-n[1])*t]);return pts;}
 const [x0,y0,x1,y1,x2,y2,x3,y3,x4,y4]=n;
 for(let t=0;t<=1;t+=.02){const u=1-t;pts.push([u*u*u*x0+3*u*u*t*x1+3*u*t*t*x2+t*t*t*x3,u*u*u*y0+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y3]);}
 for(let t=0;t<=1;t+=.05)pts.push([x3+(x4-x3)*t,y3+(y4-y3)*t]);
 return pts;
}

test('no line runs through another step’s circle or text',()=>{
 for(const s of reachable())for(const w of [200,236,292,343,420,700]){
  const l=layoutRoute(routeGraph(s),w);
  for(const e of l.edges){
   const pts=sample(e.d);
   for(const n of l.nodes){
    if(n.id===e.from||n.id===e.to)continue;
    for(const [px,py] of pts){
     assert.ok(Math.hypot(px-n.x,py-n.y)>n.r+2,`${s.topic} ${e.from}>${e.to} crosses the ${n.id} circle at ${w}`);
     const inText=px>n.x+n.r+ROUTE_METRICS.gap-2&&px<n.x+n.r+ROUTE_METRICS.gap+n.labelWidth&&py>n.top&&py<n.bottom;
     assert.ok(!inText,`${s.topic} ${e.from}>${e.to} crosses the ${n.id} text at ${w}`);
    }
   }
  }
 }
});

test('nodes come out in reading order: top to bottom, then left to right',()=>{
 let s=start('quadratics');s=next(miss(s));s=next(miss(s));
 const l=layoutRoute(routeGraph(s),292);
 assert.equal(l.nodes[0].id,'goal');
 for(let i=1;i<l.nodes.length;i++){const a=l.nodes[i-1],b=l.nodes[i];assert.ok(a.row<b.row||(a.row===b.row&&a.x<b.x));}
});

test('the same route always draws the same picture',()=>{
 let s=start('quadratics');s=next(miss(s));s=next(miss(s));
 assert.deepEqual(layoutRoute(routeGraph(s),292),layoutRoute(routeGraph(structuredClone(s)),292));
});

test('measured text heights replace the estimate',()=>{
 const g=routeGraph(start('brackets'));
 const guess=layoutRoute(g,292);
 const real=layoutRoute(g,292,{goal:40,expand:40,linear:40});
 assert.ok(real.height<=guess.height);
 for(const n of real.nodes)assert.equal(n.bottom-n.top,40);
});

test('the estimate errs toward more lines, never fewer',()=>{
 assert.equal(estimateLines('Like terms',ROUTE_METRICS.labelGlyph,200),1);
 assert.ok(estimateLines('Set each factor to zero',ROUTE_METRICS.labelGlyph,97)>=2);
 assert.equal(estimateLines('',ROUTE_METRICS.labelGlyph,100),1);
});

test('a routing check from an earlier round does not label a new detour',()=>{
 const s={...start('quadratics'),cycleStart:50,active:'multiply',phase:'learn',evidence:[attempt('quadratics','zero',10,{family:'diagnostic',assisted:true})]};
 const g=routeGraph(s);
 assert.equal(edge(g,'multiply','zero'),undefined);
 assert.ok(edge(g,'multiply','factor')?.inferred);
});

test('a checked detour with nothing to say where it came from never crowds the goal’s row',()=>{
 const s={...start('quadratics'),planned:['factor','zero','goal'],passed:['multiply'],evidence:[attempt('quadratics','multiply',1),attempt('quadratics','multiply',2)]};
 const g=routeGraph(s),l=layoutRoute(g,292);
 assert.equal(edge(g,'multiply','goal'),undefined);
 assert.equal(l.nodes.filter(n=>n.rank===1).length,2);
});

test('lines can be redrawn from live positions with the same shape as the layout',()=>{
 let s=start('quadratics');s=next(miss(s));s=next(miss(s));
 const l=layoutRoute(routeGraph(s),292),at=Object.fromEntries(l.nodes.map(n=>[n.id,n]));
 for(const e of l.edges){const a=at[e.from],b=at[e.to];assert.equal(edgePath(a.x,a.y,a.r,b.x,b.y,b.r,e.footBelow),e.d);}
 assert.match(edgePath(20,200,11,20,100,13,40),/^M20,189 L20,113$/);
 assert.match(edgePath(20,200,11,90,100,13,40),/^M20,189 C/);
 // A step tugged up close to its parent joins the circle directly instead of tucking behind the text.
 assert.doesNotMatch(edgePath(60,120,11,100,100,13,40),/ L/);
});

test('a word wider than its column is flagged so the page can hyphenate it',()=>{
 const s={...start('brackets'),active:'expand'};
 const narrow=Object.fromEntries(layoutRoute(routeGraph(s),236).nodes.map(n=>[n.id,n]));
 assert.equal(narrow.linear.tight,true,'“multiplication” at a 320 px phone');
 const wide=Object.fromEntries(layoutRoute(routeGraph(s),420).nodes.map(n=>[n.id,n]));
 assert.equal(wide.linear.tight,false);
 assert.ok(estimateLines('multiplication',ROUTE_METRICS.labelGlyph,60)>=2);
});
