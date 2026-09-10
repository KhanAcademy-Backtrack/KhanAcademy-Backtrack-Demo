import test from 'node:test';
import assert from 'node:assert/strict';
import {initialStudy,ingestRecovery,planSession,prepareRound,completeStudyTask,smallerSession,validStudy,PACKS,allPacks,parseSharedPack,packFromKhan,recordKhanOpen,recordKhanFeedback,skillKey,DAY,STUDY_KEY} from '../src/lib/study.ts';
import {initialRecovery,recoveryReducer as reduce,problemFor,validRecovery} from '../src/lib/recovery.ts';
import {KHAN_ENTRIES,resolveKhanUrl} from '../src/lib/khan-entry.ts';
import {loadStudy,readStudyImport,restoreStudy,listStudyBackups} from '../src/lib/study-storage.ts';
import {routeSummary} from '../src/lib/teacher-routine.ts';
import {cardsFromNotes,noteSections,suggestedTopics,validStudyCard} from '../src/lib/study-cards.ts';
import {challengeNextStep} from '../src/lib/challenges.ts';
const now=Date.UTC(2026,8,10,8);let clock=now;
const act=(s,a)=>reduce(s,{now:++clock,...a});
const answer=s=>act(s,{type:'submit',answers:problemFor(s).expected.map(String),confidence:'unsure'});
const memory=entries=>{const m=new Map(entries);return {get length(){return m.size;},key:i=>[...m.keys()][i]??null,getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k),m};};

test('a fresh learner can learn before any failure, and a smaller plan preserves deferred work',()=>{
 const s=initialStudy(),plan=planSession(s,PACKS[0],10,'learn',now);
 assert.equal(plan.tasks.length,2);const route=prepareRound(s,plan.tasks[0],now);assert.equal(route.phase,'learn');assert.equal(route.evidence.length,0);
 const small=smallerSession(plan);assert.equal(small.tasks.length,1);assert.equal(small.deferred,1);assert.equal(plan.tasks.length,2);
});
test('the same pack gives different sessions from actual history and a selected test date',()=>{
 const base=initialStudy();const key=skillKey('brackets','expand');const older={...base,review:{[key]:{key,topic:'brackets',skill:'expand',dueAt:now-DAY,stage:0,streak:0,lastAt:now-DAY,manual:false,paused:false}}};
 const reviewed=planSession(older,PACKS[0],10,'review',now);assert.equal(reviewed.tasks[0].reason,'A scheduled fresh look at an earlier step.');
 const quiz=planSession(older,{...PACKS[0],testDate:new Date(now+DAY).toISOString().slice(0,10)},10,'review',now);assert.equal(quiz.tasks[0].skill,'goal');assert.match(quiz.tasks[0].reason,/quiz/);
 const chosen=allPacks({...base,packs:[{...PACKS[0],testDate:'2026-09-12'}]});assert.equal(chosen[0].testDate,'2026-09-12');
});
test('real attempts update review once and reload does not inflate the reviewer',()=>{
 let r=act(initialRecovery(),{type:'start',budget:60,mode:'self'});r=act(r,{type:'submit',answers:['2','6'],confidence:'unsure'});
 let s=ingestRecovery(initialStudy(),r,clock);assert.equal(Object.keys(s.review).length,1);const due=s.review['quadratics:goal'].dueAt;
 assert.equal(due,clock+DAY);assert.equal(ingestRecovery(s,r,clock+1),s);
 const loaded=loadStudy(memory([[STUDY_KEY,JSON.stringify(s)],['backtrack.route.v1.quadratics',JSON.stringify(r)]]),clock+DAY);
 assert.equal(Object.keys(loaded.state.review).length,1);assert.equal(loaded.state.review['quadratics:goal'].dueAt,due);
 assert.ok(validStudy(loaded.state));
});
test('a stale route cannot replace a newer route or mark newer learning difficult again',()=>{
 let r=act(initialRecovery(),{type:'start',budget:60,mode:'self'});const old=act(r,{type:'submit',answers:['2','6'],confidence:'unsure'});
 r={...r,serial:5};r=answer(r);r=act(r,{type:'continue'});r=answer(r);
 const newer=ingestRecovery(initialStudy(),r,clock);const after=ingestRecovery(newer,old,clock+1);
 assert.equal(after.routes.quadratics.updatedAt,r.updatedAt);assert.equal(after.review['quadratics:goal'].lastAt,newer.review['quadratics:goal'].lastAt);
});
test('a finished round awards meaningful effort once, never on a replayed completion callback',()=>{
 let s=initialStudy();s.activeSession=planSession(s,PACKS[0],10,'review',clock);const task=s.activeSession.tasks[0];task.startedAt=++clock;
 let r=prepareRound(s,task,clock);r=answer(r);r=act(r,{type:'continue'});r=answer(r);s=ingestRecovery(s,r,clock);
 const done=completeStudyTask(s,r,++clock,task.id);assert.equal(done.xp,10);assert.equal(done.activeSession.index,1);assert.equal(done.activeSession.tasks[0].outcome,'checked');
 assert.equal(completeStudyTask(done,r,++clock,task.id),done);
 assert.equal(completeStudyTask(s,{...r,evidence:[]},++clock,task.id),s);
 assert.ok(validStudy(done));
});
test('Khan URL recognition is exact and a factoring activity stays the factoring destination',()=>{
 const entry=KHAN_ENTRIES.find(x=>x.id==='factor-quadratics');assert.equal(resolveKhanUrl(entry.practice.url+'?utm_source=test#lesson').id,entry.id);
 assert.equal(resolveKhanUrl(entry.practice.url.replaceAll(':quadratics','%3Aquadratics').replace(':factor-','%3Afactor-')).id,entry.id);
 assert.equal(resolveKhanUrl(entry.practice.url.replace('khanacademy.org','khanacademy.org:444')),undefined);
 for(const bad of ['https://evil.test/'+entry.practice.url,'javascript:alert(1)','https://www.khanacademy.org/math/not-mapped'])assert.equal(resolveKhanUrl(bad),undefined);
 const pack=packFromKhan(entry),state=initialStudy(),plan=planSession(state,pack,10,'learn',now);const task=plan.tasks[0];assert.equal(task.skill,'factor');
 let route=prepareRound(state,task,now);assert.equal(route.destinationSkill,'factor');assert.equal(route.goalExpression,'x² + 7x + 12');assert.deepEqual(route.planned,['factor']);route=act(route,{type:'practice',detail:'guided-repair'});route=answer(route);route=act(route,{type:'continue'});route=answer(route);assert.equal(route.goalPassed,true);assert.equal(route.next,'complete');assert.ok(validRecovery(route));
});
test('Khan self-report changes next support, without clearing a skill or awarding points',()=>{
 const entry=KHAN_ENTRIES.find(x=>x.id==='factor-quadratics'),pack=packFromKhan(entry),activity={topic:entry.topic,skill:entry.skill,url:entry.practice.url,title:entry.title,returnPath:'/study/session',at:now};
 for(const response of ['completed','difficulty','access']){const state=recordKhanFeedback(initialStudy(),activity,response,now);assert.equal(state.xp,0);assert.equal(state.seen.length,0);assert.equal(state.review['skill:factor'].streak,0);const plan=planSession(state,pack,10,'review',now);assert.equal(plan.tasks[0].mode,response==='completed'?'challenge':'learn');assert.ok(validStudy(state));}
});
test('shared links contain scope, preserve Khan origin, and reject unknown mappings',()=>{
 const entry=KHAN_ENTRIES[0],query=new URLSearchParams({scope:'quadratics',title:'Friday quiz',khan:entry.id});const p=parseSharedPack(query);assert.equal(p.khanId,entry.id);assert.equal(p.name,'Friday quiz');assert.equal('review' in p,false);
 assert.equal(parseSharedPack(new URLSearchParams({scope:'quadratics',khan:'made-up'})),undefined);
 assert.equal(parseSharedPack(new URLSearchParams({scope:'unknown'})),undefined);
});
test('malformed nested state is rejected and unreadable saves are backed up',()=>{
 const base=initialStudy();for(const change of [{review:{x:null}},{routes:{quadratics:{}}},{activeSession:{tasks:[null]}},{settings:{...base.settings,sound:'yes'}},{pairs:{quadratics:[5]}},{events:[null]}])assert.equal(validStudy({...base,...change}),false);
 const storage=memory([[STUDY_KEY,'{broken']]);const restored=loadStudy(storage,now);assert.equal(restored.writesBlocked,false);assert.equal(storage.m.get(`backtrack.study.backup.${now}`),'{broken');assert.ok(restored.warning);assert.throws(()=>readStudyImport('{broken'));
 const full={...storage,setItem(){throw Error('Full');}};assert.equal(loadStudy(full,now).writesBlocked,true);
});

test('restoring a study space does not resurrect the superseded route cache',()=>{
 let r=act(initialRecovery(),{type:'start',budget:60,mode:'self'});r=answer(r);
 const before=ingestRecovery(initialStudy(),r,clock),storage=memory([[STUDY_KEY,JSON.stringify(before)],['backtrack.route.v1.quadratics',JSON.stringify(r)],['unrelated','keep']]);
 const restored=restoreStudy(storage,initialStudy(),++clock);assert.equal(restored.seen.length,0);assert.equal(loadStudy(storage,++clock).state.seen.length,0);assert.equal(storage.getItem('unrelated'),'keep');
 const backup=JSON.parse(storage.getItem(`backtrack.restore.backup.${clock-1}`));assert.ok(backup.entries['backtrack.route.v1.quadratics']);
});

test('notes extraction keeps source wording and asks the author to review the draft',()=>{
 const sections=noteSections('# Fractions\nA denominator is the number of equal parts in a whole.\nEquivalent fractions name the same amount.');
 assert.deepEqual(suggestedTopics(sections),['fractions']);const cards=cardsFromNotes(sections,'Class notes.md');
 assert.equal(cards[0].answer,sections[0].text);assert.match(cards[0].locator,/Fractions · line 2/);assert.equal(cards[0].reviewed,false);assert.ok(validStudyCard(cards[0]));
 assert.ok(validStudy({...initialStudy(),packs:[{...PACKS[1],cards}]}));assert.equal(validStudy({...initialStudy(),packs:[{...PACKS[1],cards:[{...cards[0],answer:9}]}]}),false);
});

test('first Khan study is not called a comeback and independent return clears its pending prompt',()=>{
 const entry=KHAN_ENTRIES[0],pack=packFromKhan(entry),activity={topic:entry.topic,skill:entry.skill,url:entry.practice.url,title:entry.title,returnPath:'/study/session',at:clock};
 let s=recordKhanFeedback(initialStudy(),activity,'completed',++clock);const task=planSession(s,pack,5,'review',++clock).tasks[0];let r=prepareRound(s,task,++clock);assert.equal(r.returnCheck,false);
 r=answer(r);s=ingestRecovery(s,r,clock);assert.ok(s.pendingKhan);r=act(r,{type:'continue'});r=answer(r);s=ingestRecovery(s,r,clock);assert.equal(s.pendingKhan,undefined);
});

test('two differently named shared packs with the same topics keep distinct identities',()=>{
 const a=parseSharedPack(new URLSearchParams({scope:'quadratics',title:'Friday quiz'}));const b=parseSharedPack(new URLSearchParams({scope:'quadratics',title:'Study circle'}));
 assert.notEqual(a.id,b.id);assert.equal(a.id,parseSharedPack(new URLSearchParams({scope:'quadratics',title:'Friday quiz'})).id);
});

test('challenge confidence and unknown responses choose useful support without claiming a skill',()=>{
 const state=initialStudy(),pack=packFromKhan(KHAN_ENTRIES[0]);
 for(const confidence of ['know','unsure','forgot','never']){
  const choice=challengeNextStep(confidence,false,true),plan=planSession(state,pack,5,choice.mode,now),route=prepareRound(state,plan.tasks[0],now);
  assert.equal(route.phase,['forgot','never'].includes(confidence)?'learn':'check');assert.equal(route.goalPassed,false);assert.equal(route.evidence.length,0);assert.equal(state.xp,0);
 }
 assert.equal(challengeNextStep('know',false,false).mode,'challenge');
 const event={kind:'challenge_attempt',at:now,detail:'FQ1:unknown',confidence:'unsure',response:'unknown'};
 assert.ok(validStudy({...state,events:[event]}));assert.equal(validStudy({...state,events:[{...event,confidence:'genius'}]}),false);
});

test('Khan return reports stay with the learner record without duplicating resource opens',()=>{
 const entry=KHAN_ENTRIES[0],pack=packFromKhan(entry),activity={topic:entry.topic,skill:entry.skill,url:entry.practice.url,title:entry.practice.title,returnPath:'/study/session',at:now};
 let s=recordKhanOpen(initialStudy(),activity);s=recordKhanFeedback(s,activity,'completed',now+10);
 const task=planSession(s,pack,5,'review',now+20).tasks[0],route=prepareRound(s,task,now+30);
 assert.equal(routeSummary(route).khan,'learner_reported');assert.equal(route.events.find(e=>e.kind==='khan_feedback').at,now+10);assert.equal(route.evidence.length,0);assert.equal(route.goalPassed,false);
 const after=ingestRecovery(s,route,now+40);assert.equal(after.events.filter(e=>e.kind==='khan_open').length,1);assert.equal(after.events.filter(e=>e.kind==='khan_feedback').length,1);assert.ok(validStudy(after));
});

test('a new review round does not display an old goal pass as its own result',()=>{
 let route=act(initialRecovery(),{type:'start',budget:60,mode:'self'});route=answer(route);route=act(route,{type:'continue'});route=answer(route);assert.equal(route.goalPassed,true);
 const state=ingestRecovery(initialStudy(),route,clock),next=prepareRound(state,{id:'later-factor',topic:'quadratics',skill:'factor',mode:'review',reason:'A fresh look.'},++clock);
 assert.equal(next.goalPassed,false);assert.equal(next.evidence.length,route.evidence.length);assert.equal(state.routes.quadratics.goalPassed,true);
});

test('saved backup files can be found and reopened without exposing unrelated storage',()=>{
 const original={...initialStudy(),activePack:PACKS[0].id},storage=memory([[STUDY_KEY,JSON.stringify(original)],['unrelated.backup.99','private']]);restoreStudy(storage,initialStudy(),now);
 const backups=listStudyBackups(storage);assert.equal(backups.length,1);assert.equal(backups[0].kind,'before-restore');assert.equal(readStudyImport(storage.getItem(backups[0].key)).activePack,PACKS[0].id);
});
