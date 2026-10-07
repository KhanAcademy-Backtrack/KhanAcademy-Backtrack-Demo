import test from 'node:test';
import assert from 'node:assert/strict';
import {initialRecovery,recoveryReducer,problemFor,TOPICS,ORDER} from '../src/lib/recovery.ts';
import {routeGraph,layoutRoute,estimateLines,ROUTE_METRICS} from '../src/lib/route-graph.ts';

let clock=1;
const act=(s,a)=>recoveryReducer(s,{now:clock++,...a});
const start=topic=>act(initialRecovery(topic),{type:'start',budget:60,mode:'self'});
const miss=(s,confidence='unsure')=>act(s,{type:'submit',answers:problemFor(s).labels.map(()=>'-999'),confidence});
const pass=s=>act(s,{type:'submit',answers:problemFor(s).expected.map(String),confidence:'unsure'});
const next=s=>act(s,{type:'continue'});
const edge=(g,from,to)=>g.edges.find(e=>e.from===from&&e.to===to);
const node=(g,id)=>g.nodes.find(n=>n.id===id);

test('a goal resting on two skills draws them side by side, not in a queue',()=>{
 const g=routeGraph(start('brackets'));
 assert.deepEqual(g.nodes.map(n=>n.id),['expand','linear','goal']);
 assert.ok(edge(g,'expand','goal')&&edge(g,'linear','goal'));
 assert.equal(edge(g,'expand','linear'),undefined,'siblings are not chained');
 const l=layoutRoute(g,292),at=Object.fromEntries(l.nodes.map(n=>[n.id,n]));
 assert.equal(at.expand.row,at.linear.row);
 assert.ok(at.goal.row<at.expand.row,'the goal sits above what it rests on');
 assert.notEqual(at.expand.x,at.linear.x);
 assert.equal(node(g,'goal').kind,'active');
 assert.equal(node(g,'goal').status,'You’re here');
 assert.equal(node(routeGraph(initialRecovery('brackets')),'goal').status,'First check');
});

test('a missed check grows the route downward and keeps the goal where it was',()=>{
 let s=start('quadratics');
 const before=layoutRoute(routeGraph(s),292).nodes.find(n=>n.destination);
 s=next(miss(s));s=next(miss(s));s=next(miss(s));
 const g=routeGraph(s),l=layoutRoute(g,292),at=Object.fromEntries(l.nodes.map(n=>[n.id,n]));
 assert.deepEqual(new Set(g.nodes.map(n=>n.id)),new Set(['terms','distribute','factor','zero','goal']));
 assert.ok(edge(g,'terms','distribute')&&edge(g,'distribute','factor')&&edge(g,'factor','goal')&&edge(g,'zero','goal'));
 assert.equal(edge(g,'zero','factor'),undefined);
 assert.equal(at.goal.y,before.y,'the destination does not move');
 assert.ok(at.terms.rank===3&&at.distribute.rank===2&&at.factor.rank===1&&at.zero.rank===1);
 assert.equal(node(g,'terms').kind,'active');
 assert.deepEqual(g.edges.filter(e=>e.onRoute).map(e=>`${e.from}>${e.to}`).sort(),['distribute>factor','factor>goal','terms>distribute']);
 assert.equal(edge(g,'zero','goal').onRoute,false,'a sibling is context, not the way ahead');
 assert.deepEqual(g.nodes.filter(n=>n.step).map(n=>[n.id,n.step]),[['terms',1],['distribute',2],['factor',3],['zero',4]]);
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
 assert.equal(node(g,'multiply').step,undefined);
 assert.ok(edge(g,'multiply','substitute').checked&&edge(g,'multiply','unit_convert').checked);
 assert.equal(g.checked,1);
 assert.equal(g.remaining,2);
 const at=Object.fromEntries(layoutRoute(g,292).nodes.map(n=>[n.id,n]));
 assert.equal(at.multiply.rank,2);
 const mid=(at.substitute.x+at.unit_convert.x)/2;
 assert.ok(Math.abs(at.multiply.x-mid)<1,'the shared foundation settles between the skills it holds up');
});

test('a wrong-turn clue outside the listed dependencies is drawn as a suggested link',()=>{
 const s={...start('brackets'),active:'expand',planned:['multiply','expand','goal'],routeClue:{skill:'multiply',message:'Check every group.',serial:0}};
 const g=routeGraph(s);
 const clue=edge(g,'multiply','expand');
 assert.ok(clue&&clue.inferred);
 assert.equal(edge(g,'expand','goal').inferred,false);
 assert.deepEqual(node(g,'multiply').neededFor,['expand']);
});

test('the current skill is always on the map, even when a detour put it there',()=>{
 const s={...start('quadratics'),active:'multiply',phase:'learn'};
 const g=routeGraph(s);
 assert.equal(node(g,'multiply').kind,'active');
 assert.equal(node(g,'multiply').step,1);
 assert.ok(g.edges.some(e=>e.from==='multiply'&&e.inferred),'linked by suggestion, never left floating');
});

test('a finished route keeps only what was checked',()=>{
 let s=start('ratios');
 s=next(pass(s));s=pass(s);
 assert.ok(s.goalPassed);
 const g=routeGraph(s);
 assert.deepEqual(g.nodes.map(n=>[n.id,n.kind]),[['goal','checked']]);
 assert.equal(g.edges.length,0);
 assert.equal(g.remaining,0);
});

test('every topic and width lays out without overlaps or escaping the box',()=>{
 const widths=[232,260,292,320,420,700];
 const states=[];
 for(const topic of Object.keys(TOPICS)){
  let s=start(topic);states.push(s);
  for(let i=0;i<4;i++){s=next(miss(s));states.push(s);}
  let t=start(topic);t=next(miss(t));t=next(pass(t));states.push(t);
 }
 for(const s of states)for(const w of widths){
  const g=routeGraph(s),l=layoutRoute(g,w);
  assert.equal(l.nodes.length,g.nodes.length);
  assert.ok(l.nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)));
  for(const n of l.nodes){
   assert.ok(n.x-ROUTE_METRICS.halo>=-0.01,`${s.topic} ${n.id} leaves the left edge at ${w}`);
   assert.ok(n.x+n.r+ROUTE_METRICS.gap+n.labelWidth<=w+0.01,`${s.topic} ${n.id} label leaves the right edge at ${w}`);
   assert.ok(n.labelWidth>=60,`${s.topic} ${n.id} label too narrow at ${w}`);
   assert.ok(n.bottom<=l.height);
  }
  for(let i=0;i<l.nodes.length;i++)for(let j=i+1;j<l.nodes.length;j++){
   const a=l.nodes[i],b=l.nodes[j];
   const ax=[a.x-a.r,a.x+a.r+ROUTE_METRICS.gap+a.labelWidth],bx=[b.x-b.r,b.x+b.r+ROUTE_METRICS.gap+b.labelWidth];
   const ay=[Math.min(a.top,a.y-a.r),Math.max(a.bottom,a.y+a.r)],by=[Math.min(b.top,b.y-b.r),Math.max(b.bottom,b.y+b.r)];
   const overlap=ax[0]<bx[1]&&bx[0]<ax[1]&&ay[0]<by[1]&&by[0]<ay[1];
   assert.ok(!overlap,`${s.topic}: ${a.id} and ${b.id} overlap at ${w}`);
  }
  // Every line climbs: it starts below the skill it supports.
  for(const e of l.edges){const a=l.nodes.find(n=>n.id===e.from),b=l.nodes.find(n=>n.id===e.to);assert.ok(a.y>b.y,`${e.from}>${e.to} points up`);}
 }
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

test('every skill id the route can show is a known skill',()=>{
 for(const topic of Object.keys(TOPICS)){const g=routeGraph(start(topic));for(const n of g.nodes)assert.ok(ORDER.includes(n.id));}
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
 const states=[];
 for(const topic of Object.keys(TOPICS)){
  let s=start(topic);states.push(s);
  for(let i=0;i<4;i++){s=next(miss(s));states.push(s);}
  let t=start(topic);t=next(miss(t));t=next(pass(t));states.push(t);
  states.push({...start(topic),active:'multiply',phase:'learn'});
 }
 for(const s of states)for(const w of [240,292,343,420,700]){
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

test('the step you are on is numbered first',()=>{
 const s={...start('motion'),active:'unit_convert',planned:['substitute','unit_convert','goal']};
 const g=routeGraph(s);
 assert.deepEqual(g.nodes.filter(n=>n.step).map(n=>[n.id,n.step]).sort((a,b)=>a[1]-b[1]),[['unit_convert',1],['substitute',2]]);
});

test('siblings read left to right in step order',()=>{
 const s={...start('motion'),active:'unit_convert',planned:['substitute','unit_convert','goal']};
 const at=Object.fromEntries(layoutRoute(routeGraph(s),292).nodes.map(n=>[n.id,n]));
 assert.ok(at.unit_convert.x<at.substitute.x);
});
