import test from 'node:test';
import assert from 'node:assert/strict';
import {initialProgram,validProgram,loadProgram,PROGRAM_KEY,validDay} from '../src/lib/program/store.ts';
import {buildSchedule,personalFocus,weekday} from '../src/lib/program/planner.ts';
import {calendarItems,toIcs} from '../src/lib/program/calendar.ts';
import {goalLabel,targetDay} from '../src/lib/program/personalization.ts';
const setup=(goal='topic')=>({goal,exam:'upcat',concept:'percent_fractions',weekdays:[1,3,5],minutes:20,time:'19:15',createdAt:1});

test('old saves load unchanged while setup validates its own optional fields',()=>{
 const old=initialProgram(),writes=[];
 const loaded=loadProgram({getItem:()=>JSON.stringify(old),setItem:(...args)=>writes.push(args)},2);
 assert.deepEqual(loaded.state,old);assert.deepEqual(writes,[]);
 for(const goal of ['exam','college','topic'])assert.ok(validProgram({...old,setup:setup(goal)}));
 for(const patch of [{goal:'other'},{weekdays:[]},{weekdays:[1,1]},{minutes:20.5},{time:'25:00'},{concept:'bad value'},{targetDate:'2027-02-30'}])assert.equal(validProgram({...old,setup:{...setup(),...patch}}),false,JSON.stringify(patch));
 assert.ok(validDay('2028-02-29'));assert.equal(validDay('2027-02-29'),false);
});
test('topic preferences drive the actual session and calendar without an exam date',()=>{
 const s={...initialProgram(),setup:setup()},before=JSON.stringify(s);
 assert.equal(personalFocus(s)[0].concept.id,'percent_fractions');
 const events=buildSchedule(s,'2026-10-01');assert.ok(events.length>0);
 assert.ok(events.every(e=>e.concept==='percent_fractions'&&e.time==='19:15'&&e.minutes===20&&s.setup.weekdays.includes(weekday(e.date))));
 assert.equal(targetDay(s),undefined);assert.equal(JSON.stringify(s),before);
});
test('college schedules follow the selected program rather than every subject',()=>{
 const s={...initialProgram(),setup:setup('college'),bridgeProgram:'health'};
 assert.equal(personalFocus(s)[0].concept.id,'cells_life');assert.equal(goalLabel(s),'Health sciences');
 assert.ok(buildSchedule(s,'2026-10-01').every(e=>e.kind==='study'&&e.minutes===20));
 assert.ok(calendarItems(s,'2026-10-01',false).every(e=>e.kind!=='exam'&&e.kind!=='examWindow'));
});
test('unknown exam dates still produce a budgeted routine without a fabricated target',()=>{
 const s={...initialProgram(),setup:setup('exam')};
 assert.ok(buildSchedule(s,'2026-10-01').length>0);
 assert.equal(calendarItems(s,'2026-10-01',false).some(e=>e.id==='my-exam'),false);
 const dated={...s,setup:{...s.setup,targetDate:'2026-10-15'}};
 assert.ok(buildSchedule(dated,'2026-10-01').every(e=>e.date<'2026-10-15'));
 assert.ok(calendarItems(dated,'2026-10-01',false).some(e=>e.id==='my-exam'&&e.date==='2026-10-15'));
});
test('moved and removed automatic sessions remain overridden after rebuild and reload',()=>{
 const s={...initialProgram(),setup:setup()},event=buildSchedule(s,'2026-10-01')[0];
 s.events=[{...event,date:'2026-10-20',time:'10:30',minutes:45}];
 const raw=JSON.stringify(s),loaded=loadProgram({getItem:()=>raw,setItem:()=>assert.fail('valid save must not be backed up')},3).state;
 assert.ok(calendarItems(loaded,'2026-10-03',false).some(e=>e.id===event.id&&e.date==='2026-10-20'&&e.time==='10:30'));
 loaded.events[0].removed=true;assert.equal(calendarItems(loaded,'2026-10-01',false).some(e=>e.id===event.id),false);
});
test('calendar export keeps local times, UTC stamps, midnight rollover and UTF-8 folding',()=>{
 const title='Balik-aral 📚 '.repeat(14),ics=toIcs([{id:'test-event',date:'2026-10-01',time:'23:45',minutes:45,title,kind:'study'}],'20260930T100000');
 const unfolded=ics.replace(/\r\n[ \t]/g,'');
 assert.match(unfolded,/DTSTAMP:20260930T100000Z\r\n/);assert.match(unfolded,/DTSTART:20261001T234500/);assert.match(unfolded,/DTEND:20261002T003000/);
 assert.ok(unfolded.includes('SUMMARY:Study: '+title));
 for(const line of ics.split('\r\n'))assert.ok(Buffer.byteLength(line,'utf8')<=75);
 assert.ok(validProgram({...initialProgram(),setup:setup()}));assert.equal(PROGRAM_KEY,'backtrack.program.v1');
});

test('general CET review does not assume UPCAT or require a date',()=>{
 const s={...initialProgram(),setup:{...setup('exam'),exam:undefined,cet:{general:true,targets:[]}}};
 assert.ok(validProgram(s));assert.equal(goalLabel(s),'General CET review');assert.equal(targetDay(s),undefined);assert.ok(buildSchedule(s,'2026-10-01').length>0);
 for(const cet of [{general:false,targets:[]},{general:true,targets:[{key:'x',name:''}]},{general:false,targets:[{key:'x',name:'Exam',date:'2027-02-30'}]}])assert.equal(validProgram({...s,setup:{...s.setup,cet}}),false);
});
test('several CET targets retain separate dates and schedule through the last exam',()=>{
 const s={...initialProgram(),setup:{...setup('exam'),cet:{general:false,targets:[{key:'dcat',name:'DCAT',exam:'dcat',date:'2026-10-15'},{key:'own-test',name:'My school CET',date:'2026-11-15'}]}}};
 assert.ok(validProgram(s));assert.equal(targetDay(s),'2026-10-15');assert.equal(goalLabel(s),'CET review · 2 exam targets');assert.ok(buildSchedule(s,'2026-10-01').some(e=>e.date>'2026-10-15'));
 const dates=calendarItems(s,'2026-10-01',false).filter(e=>e.kind==='exam');assert.deepEqual(dates.map(e=>e.date),['2026-10-15','2026-11-15']);assert.equal(new Set(dates.map(e=>e.id)).size,2);
 const raw=JSON.stringify(s);assert.deepEqual(loadProgram({getItem:()=>raw,setItem:()=>assert.fail('valid multi-CET save')},3).state,s);
 const college={...s,setup:{...s.setup,goal:'college'},bridgeProgram:'general'};assert.ok(validProgram(college));assert.equal(targetDay(college),undefined);assert.equal(calendarItems(college,'2026-10-01',false).some(e=>e.kind==='exam'),false);
});
