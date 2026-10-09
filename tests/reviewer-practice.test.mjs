import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {EXAM_IDS} from '../src/lib/program/admissions.ts';
import {reviewerSections,reviewerSectionKey,reviewerTopicKey} from '../src/lib/mock/reviewer-scope.ts';
import {formFromKey,formItems,itemById,formMinutes,formGroups,continuesSection} from '../src/lib/mock/forms.ts';
import {initialProgram,validProgram,tidy,loadProgram,PROGRAM_KEY,newAttempt} from '../src/lib/program/store.ts';
import {scoreAttempt,scoreGroups,paceCheck} from '../src/lib/mock/scoring.ts';

test('each reviewer opens only its own available sections and topics',()=>{
 for(const exam of EXAM_IDS)for(const section of reviewerSections(exam)){
  const key=reviewerSectionKey(exam,section.id,'scope'),form=formFromKey(key);
  if(!section.reviewer.length){assert.equal(form,undefined,key);continue;}
  assert.ok(formItems(form).length>0,key);
  assert.equal(form.kind,'section');
  assert.equal(new Set(formItems(form)).size,formItems(form).length,'no repeated items');
  for(const id of formItems(form)){
   const item=itemById(id);
   assert.ok(section.reviewer.includes(item.subtest),key+' '+id);
   if(section.lang)assert.equal(item.lang,section.lang,key+' '+id);
  }
  for(const c of section.concepts){
   const topicKey=reviewerTopicKey(exam,c.id,'scope'),topic=formFromKey(topicKey);
   assert.ok(formItems(topic).length>0,topicKey);
   assert.equal(topic.kind,'topic');
   for(const id of formItems(topic)){
    assert.equal(itemById(id).concept,c.id,topicKey);
    if(section.lang)assert.equal(itemById(id).lang,section.lang,topicKey+' '+id);
   }
   assert.deepEqual(formFromKey(topicKey),topic,'saved topic regenerates exactly');
  }
  assert.deepEqual(formFromKey(key),form,'saved section regenerates exactly');
 }
});

test('English combines language and reading without Filipino; PLMAT keeps Filipino separate',()=>{
 const english=formFromKey('section2~dcat-english|scope');
 assert.deepEqual(english.sections.map(s=>s.subtest),['language','reading']);
 assert.ok(formItems(english).every(id=>itemById(id).lang==='en'));
 const filipino=formFromKey('section2~plmat-filipino|scope');
 assert.deepEqual(filipino.sections.map(s=>s.subtest),['language']);
 assert.ok(formItems(filipino).every(id=>itemById(id).lang==='fil'));
 const reading=formFromKey('topic2~dcat-details|scope');
 assert.ok(formItems(reading).every(id=>itemById(id).lang==='en'));
 assert.equal(formItems(reading).length,5,'no Filipino passage or repeated filler');
 assert.ok(formItems(formFromKey('section2~upcat-reading-comprehension|scope')).some(id=>itemById(id).lang==='fil'));
});

test('unknown and unavailable scopes never fall back to unrelated questions',()=>{
 for(const key of ['section2~unknown-mathematics|scope','section2~acet-science|scope','section2~dcat-mental-ability|scope','section2~dcat-english','topic2~acet-motion_forces|scope','topic2~dcat-filipino_gramatika|scope','topic2~plmat-unknown|scope']){
  assert.equal(formFromKey(key),undefined,key);
 }
});

test('scoped sections score the actual questions and preserve both verbal score blocks',()=>{
 const key='section2~dcat-english|score',form=formFromKey(key),attempt=newAttempt(key,false,1);
 for(const id of formItems(form))attempt.answers[id]=itemById(id).answerIndex;
 const result=scoreAttempt(form,attempt);
 assert.equal(result.total.correct,formItems(form).length);
 assert.equal(result.total.percent,100);
 assert.deepEqual(result.subtests.map(s=>s.subtest),['language','reading']);
});

test('the optional reviewer preference round trips without changing targets or prior attempts',()=>{
 const old=initialProgram();
 old.setup={goal:'exam',exam:'upcat',minutes:20,time:'18:30',weekdays:[1,3,5],createdAt:1};
 old.attempts=[newAttempt('section~math|saved',false,1)];
 assert.ok(validProgram(old));
 for(const reviewerExam of EXAM_IDS){
  const next=tidy({...old,reviewerExam});
  assert.ok(validProgram(next));
  const storage=new Map([[PROGRAM_KEY,JSON.stringify(next)]]);
  const loaded=loadProgram({getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},2);
  assert.equal(loaded.warning,'');
  assert.equal(loaded.state.reviewerExam,reviewerExam);
  assert.deepEqual(loaded.state.setup,old.setup);
  assert.deepEqual(loaded.state.attempts,old.attempts);
 }
 for(const reviewerExam of ['unknown',null,{},['upcat']])assert.equal(validProgram({...old,reviewerExam}),false);
});

test('legacy saved form keys keep their original questions, order, timing and titles',()=>{
 const hashes={
  'section~math|saved':'c90e7827d691de9478172294d8d807d17123fe6db070cc32e19ee97b745b131f',
  'section~reading|saved':'019eb061c44b0df0bdb95018fe00637cc496819a54fdc7bf7c6548b14d48d9cf',
  'topic~details|saved':'7b11f5577c1beb4c5958edcce8c54c137e0ace24286d8c4c09a85d1f900530e5',
  'full~saved':'9f2f72ade5a56664429c6a2115d6037e70861b83a38df7a75615c4fb243d0f36',
  'sprint~saved':'b766d4d08984132bcf610cb99696a413f03a722bce40e266c30467bf2e1984c8'
 };
 for(const [key,hash] of Object.entries(hashes))assert.equal(createHash('sha256').update(JSON.stringify(formFromKey(key))).digest('hex'),hash,key);
});

test('full simulations follow all nine reviewers with their own available section order',()=>{
 const expected={
  upcat:['Language Proficiency','Reading Comprehension','Mathematics','Science'],
  dcat:['Mathematics','Science','English'],
  dostsei:['Language and Literature','Science','Mathematics'],
  pupcet:['Mathematics','English','Science'],
  ustet:['English','Mathematics','Science'],
  acet:['Mathematics','English'],
  plmat:['English','Filipino','Mathematics','Science'],
  tupstat:['English','Mathematics','Science'],
  msusase:['English','Mathematics','Science']
 };
 for(const [exam,names] of Object.entries(expected)){
  const key=`full2~${exam}|full-check`,form=formFromKey(key);
  assert.equal(form.exam,exam);assert.equal(form.kind,'full');
  assert.deepEqual(formGroups(form).map(g=>g.name),names,exam);
  assert.deepEqual(formFromKey(key),form,'a saved full run rebuilds deterministically');
  assert.equal(new Set(formItems(form)).size,formItems(form).length,'no repeated items');
  for(const section of form.sections)for(const id of section.itemIds){
   const item=itemById(id);assert.equal(item.subtest,section.subtest,'scoring retains the real subject');
   if(exam!=='upcat')assert.equal(item.lang,section.group==='Filipino'?'fil':'en',exam+' '+id);
  }
 }
 assert.ok(formItems(formFromKey('full2~acet|scope')).every(id=>itemById(id).subtest!=='science'));
});

test('full simulation time counts breaks between CET sections, never inside English',()=>{
 const dcat=formFromKey('full2~dcat|scope'),acet=formFromKey('full2~acet|scope'),plmat=formFromKey('full2~plmat|scope');
 assert.equal(formItems(dcat).length,160);assert.equal(formMinutes(dcat),232);
 assert.deepEqual(formGroups(dcat).map(g=>g.minutes),[70,60,82]);
 assert.equal(continuesSection(dcat,2),true);
 assert.equal(continuesSection(dcat,1),false);
 assert.equal(continuesSection(dcat,3),false);
 assert.equal(formItems(acet).length,110);assert.equal(formMinutes(acet),162);
 assert.equal(formItems(plmat).length,174);assert.equal(formMinutes(plmat),258);
 assert.equal(formMinutes(formFromKey('full2~upcat|scope')),255);
 assert.deepEqual(dcat.missingSections,['Mental Ability']);
 assert.deepEqual(acet.missingSections,['General Knowledge','Abstract Reasoning','Essay']);
});

test('full simulation results keep English and Filipino labels distinct and use actual practice timing',()=>{
 const key='full2~plmat|score',form=formFromKey(key),attempt=newAttempt(key,true,1);
 form.sections.forEach((s,i)=>{
  for(const id of s.itemIds)attempt.answers[id]=itemById(id).answerIndex;
  attempt.elapsedMs[i]=s.minutes*60000;
 });
 const result=scoreAttempt(form,attempt);
 assert.equal(result.total.correct,174);assert.equal(result.total.percent,100);
 assert.deepEqual(result.subtests.map(s=>s.label),['English · Language','English · Reading','Filipino','Mathematics','Science']);
 assert.deepEqual(scoreGroups(form,result),[{label:'English',correct:60,total:60},{label:'Filipino',correct:14,total:14},{label:'Mathematics',correct:50,total:50},{label:'Science',correct:50,total:50}]);
 for(const score of result.subtests){
  const pace=paceCheck(score);
  assert.equal(pace.items,score.total);assert.equal(pace.reach,score.total);
  assert.equal(pace.target,Math.round(score.minutes*60/score.total));
 }
});

test('invalid full simulation keys cannot silently open UPCAT',()=>{
 for(const key of ['full2~unknown|scope','full2~dcat','full2~dcat|','full2~dcat|scope|extra'])assert.equal(formFromKey(key),undefined,key);
});
