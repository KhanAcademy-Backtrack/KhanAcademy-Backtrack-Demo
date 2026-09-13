import test from 'node:test';
import assert from 'node:assert/strict';
import {EXPLORE_ITEMS,exploreItem,exploreMaterial,savedExplore,validExplore,exploreValue,isExploreReturnPath} from '../src/lib/explore.ts';
import {answerExplore,exposeExplore,saveExplore,startExploreSession} from '../src/lib/explore-learning.ts';
import {initialStudy,validStudy,prepareRound,recordKhanOpen,recordKhanFeedback} from '../src/lib/study.ts';
import {problemFor,pairKey} from '../src/lib/recovery.ts';
import {VERIFIED_CLIPS} from '../src/lib/video-clips.ts';
test('every discovery has a reviewed Khan destination; all feed videos have bounded reviewed segments',()=>{
 assert.equal(new Set(EXPLORE_ITEMS.map(i=>i.id)).size,EXPLORE_ITEMS.length);
 for(const item of EXPLORE_ITEMS){const m=exploreMaterial(item);assert.equal(m.matched,true);assert.match(m.practice.url,/^https:\/\/www\.khanacademy\.org\//);assert.match(m.learning.url,/^https:\/\/www\.khanacademy\.org\//);if(item.format==='khan')assert.ok(VERIFIED_CLIPS[m.id]);assert.ok(item.answer>=0&&item.answer<item.choices.length);}
});
test('scrolling, saving, predicting and showing explanations grant no learning evidence or points',()=>{
 let s=initialStudy();for(const item of EXPLORE_ITEMS){s=exposeExplore(s,item,10);s=saveExplore(s,item,11);s=answerExplore(s,item,item.answer,12);}
 assert.equal(s.xp,0);assert.deepEqual(s.review,{});assert.deepEqual(s.routes,{});assert.deepEqual(s.awards,[]);assert.equal(s.sessions.length,0);assert.equal(validStudy(s),true);
 const restored=JSON.parse(JSON.stringify(s));assert.deepEqual(restored.explore,s.explore);assert.equal(validStudy(restored),true);assert.equal(validStudy(initialStudy()),true);
});
test('discovery answer keys never become the next fresh factor assessment',()=>{
 let s=initialStudy();for(const item of EXPLORE_ITEMS)s=exposeExplore(s,item,100);
 const factor=exploreItem('khan-factor-pairs');s=startExploreSession(s,factor,200);const route=prepareRound(s,s.activeSession.tasks[0],201),p=problemFor(route);
 assert.ok(!['3,4','2,6'].includes(pairKey(p.factorPair)));assert.equal(route.problemVersion,3);assert.equal(route.active,'factor');assert.equal(s.xp,0);assert.equal(validStudy(s),true);
});
test('Khan returns retain the exact discovery without implying completion or corrupting backups',()=>{
 const item=exploreItem('same-mix'),m=exploreMaterial(item),activity={topic:item.topic,skill:item.skill,title:m.practice.title,url:m.practice.url,returnPath:'/explore?item=same-mix',at:100};
 let s=recordKhanOpen(initialStudy(),activity);assert.equal(validStudy(s),true);assert.deepEqual(s.review,{});s=recordKhanFeedback(s,activity,'completed',200);assert.equal(validStudy(s),true);assert.equal(s.xp,0);assert.equal(Object.values(s.review)[0].streak,0);assert.equal(Object.values(s.review)[0].independentAt,undefined);assert.equal(s.pendingKhan.returnPath,activity.returnPath);
 assert.equal(isExploreReturnPath('/explore?item=same-mix&next=https://example.com'),false);assert.equal(isExploreReturnPath('/explore?item=not-real'),false);
});
test('discovery imports reject unbounded or invalid input and filter obsolete item ids',()=>{
 assert.equal(validExplore({saved:[],answers:[],values:{}}),false);assert.equal(validExplore({saved:[],answers:{},values:{a:Infinity}}),false);
 const s=savedExplore({last:'old',saved:['same-mix','old','same-mix'],answers:{'same-mix':99,old:0},values:{'same-mix':1.5}});assert.equal(s.last,undefined);assert.deepEqual(s.saved,['same-mix']);assert.deepEqual(s.answers,{});assert.equal(exploreValue(s,'same-mix',1,1,3),2);
});
test('starting an idea preserves prior session history and old route meanings',()=>{
 let s=startExploreSession(initialStudy(),EXPLORE_ITEMS[0],100);const old=structuredClone(s.activeSession);s=startExploreSession(s,EXPLORE_ITEMS[2],200);assert.deepEqual(s.sessions[0],old);assert.equal(s.activeSession.tasks[0].skill,'expand');assert.equal(validStudy(s),true);
});
