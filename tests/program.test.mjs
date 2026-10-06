import test from 'node:test';
import assert from 'node:assert/strict';
import {initialProgram,validProgram,loadProgram,newAttempt,tidy,PROGRAM_KEY} from '../src/lib/program/store.ts';
import {phases,buildSchedule,focusRanking,readiness,mission,weeks,addDays,daysBetween,statusOf} from '../src/lib/program/planner.ts';
import {calendarItems,monthGrid,toIcs,itemsOn} from '../src/lib/program/calendar.ts';
import {PROGRAMS,RESCUES,summerPlan} from '../src/lib/program/bridge.ts';
import {EXAM_DATES} from '../src/lib/program/admissions.ts';
import {CONCEPT_BY_ID} from '../src/lib/program/concepts.ts';
import {FAMILY_BY_ID} from '../src/lib/mock/families/index.ts';
import {KHAN_UNITS} from '../src/lib/program/khan-units.ts';
import {sprintForm,formItems,itemById,formKey} from '../src/lib/mock/forms.ts';
import {TOPICS} from '../src/lib/recovery.ts';

const today='2026-10-05';
function pledged(){return {...initialProgram(),sides:{admission:true,bridge:false},pledge:{exam:'upcat',examDate:'2027-08-01',why:'Free tuition and a real shot at UP',days:4,minutes:45,when:'after dinner',time:'19:00',weekdays:[1,2,4,6],createdAt:1}};}

class Mem{constructor(){this.m=new Map();}getItem(k){return this.m.has(k)?this.m.get(k):null;}setItem(k,v){this.m.set(k,String(v));}}

test('a fresh and a pledged program both validate, and junk is rejected', ()=>{
 assert.ok(validProgram(initialProgram()));
 assert.ok(validProgram(pledged()));
 assert.ok(!validProgram({...pledged(),pledge:{...pledged().pledge,examDate:'soon'}}));
 assert.ok(!validProgram({...pledged(),lang:'jp'}));
 assert.ok(!validProgram({...pledged(),attempts:[{id:'x'}]}));
 assert.ok(!validProgram({...pledged(),group:{code:'bad code',goal:3,joinedAt:1}}));
});

test('storage round trip, and an unreadable save is backed up, not lost', ()=>{
 const mem=new Mem();const s=pledged();s.attempts.push(newAttempt(formKey('sprint','abc'),false,5));
 mem.setItem(PROGRAM_KEY,JSON.stringify(s));
 const back=loadProgram(mem,10);assert.equal(back.warning,'');assert.deepEqual(back.state,s);
 mem.setItem(PROGRAM_KEY,'{"version":1,"broken":');
 const bad=loadProgram(mem,11);assert.ok(bad.warning);assert.equal(mem.getItem('backtrack.program.backup.11'),'{"version":1,"broken":');
 assert.ok(validProgram(JSON.parse(JSON.stringify(tidy(s)))));
});

test('phases cover every day to the exam without gaps', ()=>{
 for(const exam of ['2026-10-20','2026-11-08','2027-08-01']){
  const p=phases(today,exam);
  assert.equal(p[0].start,today);
  assert.equal(addDays(p[0].end,1),p[1].start);assert.equal(addDays(p[1].end,1),p[2].start);
  assert.equal(p[2].end,addDays(exam,-1));
 }
});

test('the schedule uses the pledged weekdays, has mock days, and never lands after the exam', ()=>{
 const s=pledged();const sched=buildSchedule(s,today);
 assert.ok(sched.length>50);
 for(const e of sched){assert.ok(e.date>=today&&e.date<s.pledge.examDate);}
 const study=sched.filter(e=>e.kind==='study');
 assert.ok(study.every(e=>[1,2,4,6].includes(new Date(e.date+'T00:00').getDay())));
 assert.ok(sched.some(e=>e.kind==='mock'));
 assert.deepEqual(buildSchedule(s,today),sched,'schedule is deterministic');
});

test('focus ranking moves weak concepts up after a mock', ()=>{
 const s=pledged();const form=sprintForm('rank'),ids=formItems(form);
 const a=newAttempt(formKey('sprint','rank'),false,100);
 for(const id of ids){const it=itemById(id);a.answers[id]=it.subtest==='math'?(it.answerIndex+1)%4:it.answerIndex;}
 a.submittedAt=200;s.attempts.push(a);
 const rank=focusRanking(s);
 const top=rank[0].concept;assert.equal(top.subtest,'math');
 assert.equal(statusOf(rank[0]),'focus here');
 const ready=readiness(s);assert.equal(ready.find(r=>r.subtest==='math').percent,0);
 assert.ok(ready.find(r=>r.subtest==='science').percent>=90);
 const m=mission(s,today);assert.equal(m.steps.length,3);assert.equal(m.concept.subtest,'math');
});

test('weeks and shields never punish, only cover', ()=>{
 const s=pledged();s.pledge.days=2;
 const monday=addDays(today,-((new Date(today+'T00:00').getDay()+6)%7));
 s.studyDays=[addDays(monday,-14),addDays(monday,-13),addDays(monday,-7)];
 const w=weeks(s,today);
 assert.equal(w.rows.length,8);
 const lastWeek=w.rows[w.rows.length-2];assert.equal(lastWeek.days,1);assert.ok(lastWeek.shielded,'a short week after a full one is shielded');
});

test('calendar merges plan, own events and exams; ics is well formed', ()=>{
 const s=pledged();
 const moved={id:`study-${addDays(today,1)}`,date:addDays(today,3),title:'Moved session',kind:'study'};
 s.events.push(moved,{id:'mine1',date:addDays(today,2),time:'16:00',minutes:30,title:'Group review',kind:'custom'});
 const items=calendarItems(s,today);
 assert.ok(items.some(i=>i.id==='mine1'));
 assert.equal(items.filter(i=>i.id===moved.id).length,1);
 assert.ok(items.some(i=>i.kind==='exam'));
 assert.ok(itemsOn(items,'2026-11-15').some(i=>i.id==='dostsei_nov14'));
 const grid=monthGrid(2026,9);assert.ok(grid.length===35||grid.length===42);assert.equal(new Date(grid[0]+'T00:00').getDay(),1);
 assert.ok(grid.includes('2026-10-01')&&grid.includes('2026-10-31'));
 const ics=toIcs(items.slice(0,20),'20261005T000000');
 assert.match(ics,/^BEGIN:VCALENDAR\r\n/);assert.match(ics,/END:VCALENDAR\r\n$/);
 assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,20);
 assert.equal(daysBetween('2026-10-01','2026-10-31'),30);
});

test('bridge maps reference real concepts, families, engine topics and Khan units', ()=>{
 assert.equal(PROGRAMS.length,6);
 assert.deepEqual(PROGRAMS.map(p=>p.id),['cs_it','engineering','health','natural_sciences','statistics','social_sciences']);
 for(const p of PROGRAMS){
  for(const a of p.assumes){for(const c of a.concepts)assert.ok(CONCEPT_BY_ID[c],`${p.id} ${c}`);if(a.engine)assert.ok(TOPICS[a.engine]);}
  for(const f of p.placement.families)assert.ok(FAMILY_BY_ID[f],`${p.id} family ${f}`);
  for(const t of p.placement.engine)assert.ok(TOPICS[t]);
  for(const k of p.khanPath)assert.ok(KHAN_UNITS[k],`${p.id} ${k}`);
  for(const r of p.rescue)assert.ok(RESCUES.some(x=>x.id===r),`${p.id} rescue ${r}`);
  assert.equal(summerPlan(p).length,8);
 }
 for(const r of RESCUES){for(const c of r.concepts)assert.ok(CONCEPT_BY_ID[c],r.id);for(const k of r.khan)assert.ok(KHAN_UNITS[k],r.id);}
 for(const d of EXAM_DATES){assert.match(d.start,/^\d{4}-\d{2}-\d{2}$/);assert.match(d.link,/^https:\/\//);assert.equal(d.checked,'2026-09-30');}
});
