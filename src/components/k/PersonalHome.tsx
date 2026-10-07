'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useProgram} from './ProgramProvider';
import {ChangeGoalButton} from './ProgramTourProvider';
import {Sheet,btn,cx} from './ui';
import {StudyWeek} from './StudyWeek';
import {DailyPractice} from './DailyPractice';
import {ReviewTopics} from './ReviewTopics';
import {HomeShortcuts} from './StudyTools';
import {FeatureCard,RouteArt,Section,TopicArt,WeekArt,glyph} from './HomeCards';
import {examTargets,firstExam,goalLabel,learnerGoal,targetDay} from '@/lib/program/personalization';
import {personalFocus,daysBetween,parseDay} from '@/lib/program/planner';
import {calendarItems} from '@/lib/program/calendar';
import {PROGRAM_BY_ID} from '@/lib/program/bridge';
import {TOPICS} from '@/lib/recovery';
import {Rich} from '@/components/math/Math';

/** The personalized home: one short column of labelled sections, most useful first. */
export function PersonalHome(){
 const {state:s,today}=useProgram(),goal=learnerGoal(s),setup=s.setup!;
 const focus=personalFocus(s)[0],concept=focus?.concept,label=goalLabel(s),target=targetDay(s),seed=today.replace(/-/g,'');
 const items=calendarItems(s,today,false),program=PROGRAM_BY_ID[s.bridgeProgram??''],targets=examTargets(s);
 if(!concept)return <div className="mx-auto max-w-3xl p-5 text-navy"><h1 className="text-2xl font-extrabold"><Headline>Choose your next topic</Headline></h1><ChangeGoalButton className={cx(btn.ghost,'mt-5')}/></div>;
 const engine=concept.engine;
 return <div className="mx-auto grid max-w-4xl gap-8 px-4 pb-32 pt-8 sm:px-8 lg:pb-20 lg:pt-10">
  <header>
   <h1 className="text-[1.65rem] font-extrabold leading-tight tracking-[-.025em] sm:text-[1.9rem]"><Headline>{label}</Headline></h1>
   <p className="mt-1.5 text-ink-soft">{setup.weekdays.length} study days a week · {setup.minutes} minutes a session · Around {setup.time}</p>
   {target&&<p className="mt-1 text-sm text-ink-soft">{target>today?`${daysBetween(today,target)} days to your planning target`:'Your planning target has arrived'} · {parseDay(target).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})}</p>}
  </header>
  <HomeShortcuts/>

  {goal==='exam'&&<Section label="Today’s practice"><DailyPractice/></Section>}

  <Section label={goal==='topic'?'Your chosen topic':goal==='exam'?'Your next topic':'A foundation to start with'}>
   <FeatureCard data-program-tour-content="today" icon={glyph.book} title={concept.title} body={<Rich>{concept.blurb}</Rich>} art={<TopicArt/>}
    action={<><Link href={`/learn/${concept.id}`} className={btn.primary}><Headline>Learn this topic</Headline></Link>{goal==='topic'&&<Link href={`/mock/take?f=topic~${concept.id}|${seed}&mode=practice`} className={btn.ghost}><Headline>Try a topic check</Headline></Link>}</>}>
    <p className="mt-3 text-sm text-ink-soft">{goal==='topic'?'This is the topic you chose.':focus.misses>0?`Your mistake notebook has ${focus.misses} unresolved ${focus.misses===1?'question':'questions'} on this topic.`:focus.accuracy!==undefined?`Your recorded answers on this topic were ${focus.accuracy}% correct. This is one place to revisit.`:'This is an unstarted foundation for your goal. A check can help you decide whether it needs more time.'}</p>
    {goal!=='topic'&&<details className="mt-4 border-t border-line pt-2"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">Choose a different topic</summary><ReviewTopics exam={firstExam(s)}/></details>}
    <Link href="/reviewer" className={cx(btn.text,'mt-1 self-start text-sm')}><Headline>{goal==='exam'?'Open the full CET reviewer':'Browse the reviewer'}</Headline></Link>
   </FeatureCard>
  </Section>

  <Section label="Stuck on something?">
   <FeatureCard icon={glyph.route} title={engine?`Check the foundations for ${TOPICS[engine].label.toLowerCase()}`:'Find and fix a gap'} body="BACKTRACK checks earlier skills. If a step needs support, it explains that step and brings you back to your goal with fresh questions." art={<RouteArt/>}
    action={<Link href={engine?`/start/${engine}`:'/start'} className={btn.ghost}><Headline>{engine?'Start this route':'Choose a route'}</Headline></Link>}/>
  </Section>

  <Section label="Your study week">
   <FeatureCard data-program-tour-content="calendar" icon={glyph.week} title="Your study week" body="Your calendar follows your chosen days. Adjust it whenever your week changes." art={<WeekArt days={setup.weekdays}/>}
    action={<Link href={`/calendar?day=${today}`} className={btn.ghost}><Headline>Open my calendar</Headline></Link>}>
    <details className="mt-4 border-t border-line pt-2"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">See this week’s sessions</summary><StudyWeek items={items} today={today}/></details>
   </FeatureCard>
  </Section>

  {goal==='college'&&<Section label="Your program map">{program?<FeatureCard icon={glyph.cap} title="Your first-year foundations" body={`Your ${program.title} map connects college topics to the foundations behind them.`}
    action={<><Link href={`/bridge/${program.id}`} className={btn.dark}><Headline>Open my program map</Headline></Link><Link href={`/mock/take?f=placement~${program.id}|${seed}&mode=practice`} className={btn.ghost}><Headline>Try the placement check</Headline></Link></>}/>
   :<FeatureCard icon={glyph.cap} title="Choose a field when you’re ready" body="Keep reviewing general foundations, or choose a field for a more specific map." action={<ChangeGoalButton className={btn.ghost} label="Choose my college field"/>}/>}</Section>}

  <Section label="Personalize">
   <Sheet className="p-4 sm:p-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-navy">{glyph.tune}</span><div className="min-w-0"><h2 className="text-lg font-extrabold leading-tight"><Headline>Make this space fit your week</Headline></h2>
    {goal==='exam'&&targets.length>0&&<p className="mt-1 break-words text-sm text-ink-soft">Your exams: {targets.map(t=>t.name).join(', ')}</p>}</div></div>
    <div className="mt-4 flex flex-wrap gap-2"><ChangeGoalButton className={btn.chip} label="Change goal or routine"/>{goal==='exam'&&<Link href="/plan" className={btn.chip}><Headline>Edit or add CETs</Headline></Link>}{goal==='topic'&&<ChangeGoalButton className={btn.chip} label="Choose another topic"/>}</div>
   </Sheet>
  </Section>
 </div>;
}
