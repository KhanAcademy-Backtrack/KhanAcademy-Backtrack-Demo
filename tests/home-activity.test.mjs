import test from 'node:test';
import assert from 'node:assert/strict';
import {studyActivity,activityWeeks} from '../src/lib/program/activity.ts';
import {initialProgram,newAttempt} from '../src/lib/program/store.ts';
import {initialStudy} from '../src/lib/study.ts';
import {initialRecovery} from '../src/lib/recovery.ts';

const today='2026-10-07';
test('a new home is empty; opening resources and future plans do not fill the heatmap',()=>{
 const p=initialProgram(),s=initialStudy();
 p.studyDays=['not-a-day','2026-02-31','2026-10-08'];
 p.missions[today]={khan:Date.now()};
 p.events=[{id:'plan',date:today,title:'A plan',kind:'study'}];
 s.events=[{kind:'khan_open',at:Date.parse(today+'T08:00:00Z'),detail:'A resource'}];
 const a=studyActivity(p,s,today);
 assert.equal(a.activeDays,0);assert.equal(a.streak,0);assert.equal(a.sets,0);assert.equal(a.checks,0);
});
test('Daily 3 and its submitted attempt count once, including duplicates and older daily keys',()=>{
 const p=initialProgram();
 p.daily[today]={correct:2,total:3};p.studyDays=[today,today];
 const a={...newAttempt('daily2~20261007',false,1),submittedAt:Date.parse(today+'T10:00:00Z')};
 p.attempts=[a,a,{...a,id:'second'}, {...a,id:'legacy',formKey:'daily~20261007'}];
 const result=studyActivity(p,initialStudy(),today);
 assert.equal(result.activeDays,1);assert.equal(result.sets,1);assert.equal(result.byDay.get(today).level,1);
});
test('submitted sets use Manila days and unfinished sets do not count',()=>{
 const p=initialProgram();
 p.attempts=[{...newAttempt('section~math|abc',false,1),submittedAt:Date.parse('2026-10-06T16:05:00Z')},newAttempt('section~math|unfinished',false,2)];
 const a=studyActivity(p,initialStudy(),today);
 assert.equal(a.byDay.get(today).sets,1);assert.equal(a.byDay.has('2026-10-06'),false);
});
test('BACKTRACK counts recorded answers once, including supported work, without unknown responses',()=>{
 const s=initialStudy(),r=initialRecovery('fractions');
 const answer={id:'q:1',skill:'goal',answer:['2'],correct:false,assisted:true,confidence:'unsure',at:Date.parse(today+'T02:00:00Z'),purpose:'route'};
 r.evidence=[answer,answer,{...answer,id:'unknown',answer:['']}];s.routes.fractions=r;
 const a=studyActivity(initialProgram(),s,today);
 assert.equal(a.checks,1);assert.equal(a.activeDays,1);assert.equal(s.xp,0);assert.deepEqual(s.review,{});
});
test('streaks tolerate today before studying, preserve personal best and deduplicate study dates',()=>{
 const p=initialProgram();p.studyDays=['2026-10-01','2026-10-02','2026-10-03','2026-10-05','2026-10-06','2026-10-06'];
 const a=studyActivity(p,initialStudy(),today);
 assert.equal(a.streak,2);assert.equal(a.best,3);assert.equal(a.weekDays,2);assert.equal(a.activeDays,5);
 p.studyDays.push(today);assert.equal(studyActivity(p,initialStudy(),today).streak,3);
 assert.equal(studyActivity(p,initialStudy(),'2026-10-09').streak,0);
});
test('heatmap covers exactly the current calendar year, including leap years needing 54 columns',()=>{
 for(const [day,count,dates] of [['2026-01-01',53,365],['2024-02-29',53,366],['2012-12-31',54,366],[today,53,365]]){
  const weeks=activityWeeks(day),year=day.slice(0,4);assert.equal(weeks.length,count);assert.equal(new Set(weeks.flat()).size,count*7);
  for(const w of weeks){assert.equal(w.length,7);assert.equal(new Date(w[0]+'T12:00:00Z').getUTCDay(),1);}
  const inYear=weeks.flat().filter(d=>d.startsWith(year));
  assert.equal(inYear.length,dates);assert.equal(inYear[0],`${year}-01-01`);assert.equal(inYear.at(-1),`${year}-12-31`);assert.ok(inYear.includes(day));
 }
});
test('activity counts remain exact above the colour scale and do not double recorded study days',()=>{
 const p=initialProgram(),s=initialStudy(),r=initialRecovery('fractions'),at=Date.parse(today+'T08:00:00Z');
 p.studyDays=[today,today];p.daily[today]={correct:2,total:3};p.missions[today]={recall:at};
 p.attempts=[{...newAttempt('section~math|count',false,1),submittedAt:at}];
 r.evidence=Array.from({length:6},(_,i)=>({id:`count:${i}`,skill:'goal',answer:['2'],correct:false,at:at+i,purpose:'route'}));s.routes.fractions=r;
 const day=studyActivity(p,s,today).byDay.get(today);
 assert.equal(day.count,9);assert.equal(day.level,4);assert.equal(day.sets,2);assert.equal(day.checks,6);
 const legacy=initialProgram();legacy.studyDays=[today];assert.equal(studyActivity(legacy,initialStudy(),today).byDay.get(today).count,1);
});
test('meaningful completed sessions retain activity when their route is replaced, without doubling answers',()=>{
 const s=initialStudy(),at=Date.parse(today+'T03:00:00Z');
 s.sessions=[{id:'old-session',complete:true,meaningful:true,lastAt:at},{id:'unknown-only',complete:true,meaningful:false,lastAt:at-86400000}];
 const a=studyActivity(initialProgram(),s,today);
 assert.equal(a.activeDays,1);assert.equal(a.checks,0);assert.equal(a.byDay.get(today).level,1);
});
