'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useEffect,useId,useRef,useState} from 'react';
import {useProgram} from './ProgramProvider';
import {ChangeGoalButton} from './ProgramTourProvider';
import {Sheet,btn,cx} from './ui';
import {StudyWeek} from './StudyWeek';
import {DailyPractice} from './DailyPractice';
import {ReviewTopics} from './ReviewTopics';
import {HomeShortcuts} from './StudyTools';
import {FeatureCard,Section,WeekArt,glyph} from './HomeCards';
import {examTargets,firstExam,goalLabel,learnerGoal,targetDay} from '@/lib/program/personalization';
import {personalFocus,daysBetween,parseDay} from '@/lib/program/planner';
import {calendarItems} from '@/lib/program/calendar';
import {PROGRAM_BY_ID} from '@/lib/program/bridge';
import {TOPICS} from '@/lib/recovery';
import {Rich} from '@/components/math/Math';
import {HomeWelcome,StudyActivity} from './HomeDashboard';

/** The learner's recorded study rhythm, then a useful personal next step. */
export function PersonalHome(){
 const {state:s,today}=useProgram(),goal=learnerGoal(s),setup=s.setup!;
 const [topicPickerOpen,setTopicPickerOpen]=useState(false),topicPickerId=useId();
 const pickerButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(topicPickerOpen){const input=document.getElementById(topicPickerId)?.querySelector('input');input?.focus({preventScroll:true});input?.scrollIntoView({block:'nearest'});}},[topicPickerOpen,topicPickerId]);
 const closePicker=()=>{setTopicPickerOpen(false);pickerButton.current?.focus();};
 const focus=personalFocus(s)[0],concept=focus?.concept,label=goalLabel(s),target=targetDay(s),seed=today.replace(/-/g,'');
 const items=calendarItems(s,today,false),program=PROGRAM_BY_ID[s.bridgeProgram??''],targets=examTargets(s);
 if(!concept)return <div className="mx-auto max-w-3xl p-5 text-navy"><h1 className="text-2xl font-extrabold"><Headline>Choose your next topic</Headline></h1><ChangeGoalButton className={cx(btn.ghost,'mt-5')}/></div>;
 const engine=concept.engine;
 const personalize=<Section label="Personalize">
  <Sheet className="home-personalize p-4 sm:p-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-navy">{glyph.tune}</span><div className="min-w-0"><h2 className="text-lg font-extrabold leading-tight"><Headline>Make this space fit your week</Headline></h2>
   {goal==='exam'&&targets.length>0&&<p className="mt-1 break-words text-sm text-ink-soft">Your exams: {targets.map(t=>t.name).join(', ')}</p>}</div></div>
   <div className="mt-4 flex flex-wrap gap-2"><ChangeGoalButton className={btn.chip} label="Change goal or routine"/>{goal==='exam'&&<ChangeGoalButton className={btn.chip} label="Edit or add CETs"/>}{goal==='topic'&&<ChangeGoalButton className={btn.chip} label="Choose another topic"/>}</div>
  </Sheet>
 </Section>;
 return <div className="home-dashboard">
  <HomeWelcome title={label}>
   <p>{setup.weekdays.length} study days a week · {setup.minutes} minutes a session · Around {setup.time}</p>
   {target&&<p>{target>today?`${daysBetween(today,target)} days to your planning target`:'Your planning target has arrived'} · {parseDay(target).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})}</p>}
  </HomeWelcome>
  <HomeShortcuts className="home-shortcuts"/>
  <StudyActivity/>
  <div className="home-actions-grid">
  <div className="home-content-grid home-next-actions">
  <div className="home-content-primary">
  <Section label={goal==='topic'?'Your chosen topic':goal==='exam'?'Your next topic':'A foundation to start with'}>
   <FeatureCard className="home-topic-feature" data-program-tour-content="today" icon={glyph.book} title={concept.title} body={<Rich>{concept.blurb}</Rich>}
    action={<><Link href={`/learn/${concept.id}`} className={btn.primary}><Headline>Learn this topic</Headline></Link>{goal==='topic'&&<Link href={`/mock/take?f=topic~${concept.id}|${seed}&mode=practice`} className={btn.ghost}><Headline>Try a topic check</Headline></Link>}</>}>
    <p className="mt-3 text-sm text-ink-soft">{goal==='topic'?'This is the topic you chose.':focus.misses>0?`Your mistake notebook has ${focus.misses} unresolved ${focus.misses===1?'question':'questions'} on this topic.`:focus.accuracy!==undefined?`Your recorded answers on this topic were ${focus.accuracy}% correct. This is one place to revisit.`:'This is an unstarted foundation for your goal. A check can help you decide whether it needs more time.'}</p>
    {goal!=='topic'&&<div className="mt-4 border-t border-line pt-2"><button ref={pickerButton} type="button" aria-expanded={topicPickerOpen} aria-controls={topicPickerId} className="min-h-11 py-2 text-left text-sm font-semibold" onClick={()=>setTopicPickerOpen(open=>!open)}><span aria-hidden="true">{topicPickerOpen?'▾':'▸'} </span>Choose a different topic</button></div>}
    <Link href="/reviewer" className={cx(btn.text,'mt-1 self-start text-sm')}><Headline>{goal==='exam'?'Open the full CET reviewer':'Browse the reviewer'}</Headline></Link>
   </FeatureCard>
  </Section>

  </div>
  <div className="home-content-aside">
  {goal==='exam'&&<Section label="A small win for today"><DailyPractice/></Section>}
  {goal==='exam'&&personalize}
  {goal==='college'&&<Section label="Your program map">{program?<FeatureCard icon={glyph.cap} title="Your first-year foundations" body={`Your ${program.title} map connects college topics to the foundations behind them.`}
    action={<><Link href={`/bridge/${program.id}`} className={btn.dark}><Headline>Open my program map</Headline></Link><Link href={`/mock/take?f=placement~${program.id}|${seed}&mode=practice`} className={btn.ghost}><Headline>Try the placement check</Headline></Link></>}/>
   :<FeatureCard icon={glyph.cap} title="Choose a field when you’re ready" body="Keep reviewing general foundations, or choose a field for a more specific map." action={<ChangeGoalButton className={btn.ghost} label="Choose my college field"/>}/>}</Section>}

  {goal==='topic'&&<Section label="Stuck on something?">
   <FeatureCard icon={glyph.route} title="Find and fix a gap" body="Check an earlier step, give it some support, then come back to your topic."
    action={<Link href={engine?`/start/${engine}`:'/start'} className={btn.ghost}><Headline>{engine?'Start this route':'Choose a route'}</Headline></Link>}/>
  </Section>}
  </div>
  </div>
  {goal!=='topic'&&<div id={topicPickerId} hidden={!topicPickerOpen} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();closePicker();}}}><Section label="Choose your next topic"><Sheet className="home-topic-picker p-4 sm:p-5"><ReviewTopics exam={firstExam(s)}/><button type="button" onClick={closePicker} className={cx(btn.text,'mt-3 text-sm')}>Close topic picker</button></Sheet></Section></div>}
  <div className="home-content-grid">
  <Section label="Your week, your pace">
   <FeatureCard className="home-week-feature" data-program-tour-content="calendar" icon={glyph.week} title="Your study week" body={`${setup.weekdays.length} days in your weekly routine.`} art={<WeekArt days={setup.weekdays} compact/>} artLayout="strip"
    action={<Link href={`/calendar?day=${today}`} className={btn.ghost}><Headline>Open my calendar</Headline></Link>}>
    <details className="mt-4 border-t border-line pt-2"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">See this week’s sessions</summary><StudyWeek items={items} today={today}/></details>
   </FeatureCard>
  </Section>
  {goal!=='topic'?<Section label="A little support">
   <FeatureCard icon={glyph.route} title={engine?`Check the foundations for ${TOPICS[engine].label.toLowerCase()}`:'Find and fix a gap'} body="BACKTRACK checks earlier skills, explains the step that needs support, and brings you back with fresh questions."
    action={<Link href={engine?`/start/${engine}`:'/start'} className={btn.ghost}><Headline>{engine?'Start this route':'Choose a route'}</Headline></Link>}/>
  </Section>:<Section label="Keep exploring"><FeatureCard icon={glyph.book} title="Follow your curiosity" body="Your chosen topic is a starting point. Find another idea in the reviewer whenever you like." action={<Link href="/reviewer" className={btn.ghost}><Headline>Browse the reviewer</Headline></Link>}/></Section>}
  </div>
  {goal!=='exam'&&personalize}
  </div>
 </div>;
}
