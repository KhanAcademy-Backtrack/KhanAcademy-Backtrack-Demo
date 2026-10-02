'use client';
import Link from 'next/link';
import {useProgram} from './ProgramProvider';
import {ChangeGoalButton} from './ProgramTourProvider';
import {Sheet,btn,cx} from './ui';
import {StudyWeek} from './StudyWeek';
import {DailyPractice} from './DailyPractice';
import {ReviewTopics} from './ReviewTopics';
import {FeatureCard,RouteArt,Section,TopicArt,WeekArt,glyph} from './HomeCards';
import {examTargets,goalLabel,learnerGoal,targetDay} from '@/lib/program/personalization';
import {personalFocus,daysBetween,parseDay} from '@/lib/program/planner';
import {calendarItems} from '@/lib/program/calendar';
import {PROGRAM_BY_ID} from '@/lib/program/bridge';
import {TOPICS} from '@/lib/recovery';

/** The personalized home: one short column of labelled sections, most useful first. */
export function PersonalHome(){
 const {state:s,today}=useProgram(),goal=learnerGoal(s),setup=s.setup!;
 const concept=personalFocus(s)[0]?.concept,label=goalLabel(s),target=targetDay(s),seed=today.replace(/-/g,'');
 const items=calendarItems(s,today,false),program=PROGRAM_BY_ID[s.bridgeProgram??''],targets=examTargets(s);
 if(!concept)return <div className="mx-auto max-w-3xl p-5 text-navy"><h1 className="text-2xl font-extrabold">Choose your next topic</h1><ChangeGoalButton className={cx(btn.ghost,'mt-5')}/></div>;
 const engine=concept.engine;
 return <div className="mx-auto grid max-w-4xl gap-8 px-4 pb-32 pt-8 sm:px-8 lg:pb-20 lg:pt-10">
  <header>
   <h1 className="text-[1.65rem] font-extrabold leading-tight tracking-[-.025em] sm:text-[1.9rem]">{label}</h1>
   <p className="mt-1.5 text-ink-soft">{setup.weekdays.length} study days a week · {setup.minutes} minutes a session · Around {setup.time}</p>
   {target&&<p className="mt-1 text-sm text-ink-soft">{target>today?`${daysBetween(today,target)} days to your planning target`:'Your planning target has arrived'} · {parseDay(target).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})}</p>}
  </header>

  {goal==='exam'&&<Section label="Today’s practice"><DailyPractice/></Section>}

  <Section label={goal==='topic'?'Your chosen topic':goal==='exam'?'Your next topic':'A foundation to start with'}>
   <FeatureCard data-program-tour-content="today" icon={glyph.book} title={concept.title} body={concept.blurb} art={<TopicArt/>}
    action={<><Link href={`/learn/${concept.id}`} className={btn.primary}>Learn this topic</Link>{goal==='topic'&&<Link href={`/mock/take?f=topic~${concept.id}|${seed}&mode=practice`} className={btn.ghost}>Try a topic check</Link>}</>}>
    {goal!=='topic'&&<details className="mt-4 border-t border-line pt-2"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">Choose a different topic</summary><ReviewTopics/></details>}
    <Link href="/reviewer" className={cx(btn.text,'mt-1 self-start text-sm')}>{goal==='exam'?'Open the full CET reviewer':'Browse the reviewer'}</Link>
   </FeatureCard>
  </Section>

  <Section label="Stuck on something?">
   <FeatureCard icon={glyph.route} title={engine?`Fix a gap in ${TOPICS[engine].label.toLowerCase()}`:'Find and fix a gap'} body="BACKTRACK checks the earlier step that might be missing, repairs it, then brings you back to your goal with fresh questions." art={<RouteArt/>}
    action={<Link href={engine?`/start/${engine}`:'/start'} className={btn.ghost}>{engine?'Start this route':'Choose a route'}</Link>}/>
  </Section>

  <Section label="Your study week">
   <FeatureCard data-program-tour-content="calendar" icon={glyph.week} title="Your study week" body="Your calendar follows your chosen days. Adjust it whenever your week changes." art={<WeekArt days={setup.weekdays}/>}
    action={<Link href={`/calendar?day=${today}`} className={btn.ghost}>Open my calendar</Link>}>
    <details className="mt-4 border-t border-line pt-2"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">See this week’s sessions</summary><StudyWeek items={items} today={today}/></details>
   </FeatureCard>
  </Section>

  {goal==='college'&&<Section label="Your program map">{program?<FeatureCard icon={glyph.cap} title="Your first-year foundations" body={`Your ${program.title} map connects college topics to the foundations behind them.`}
    action={<><Link href={`/bridge/${program.id}`} className={btn.dark}>Open my program map</Link><Link href={`/mock/take?f=placement~${program.id}|${seed}&mode=practice`} className={btn.ghost}>Try the placement check</Link></>}/>
   :<FeatureCard icon={glyph.cap} title="Choose a field when you’re ready" body="Keep reviewing general foundations, or choose a field for a more specific map." action={<ChangeGoalButton className={btn.ghost} label="Choose my college field"/>}/>}</Section>}

  <Section label="Personalize">
   <Sheet className="p-4 sm:p-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-navy">{glyph.tune}</span><div className="min-w-0"><h2 className="text-lg font-extrabold leading-tight">Make this space fit your week</h2>
    {goal==='exam'&&targets.length>0&&<p className="mt-1 break-words text-sm text-ink-soft">Your exams: {targets.map(t=>t.name).join(', ')}</p>}</div></div>
    <div className="mt-4 flex flex-wrap gap-2"><ChangeGoalButton className={btn.chip} label="Change goal or routine"/>{goal==='exam'&&<Link href="/plan" className={btn.chip}>Edit or add CETs</Link>}{goal==='topic'&&<ChangeGoalButton className={btn.chip} label="Choose another topic"/>}</div>
   </Sheet>
  </Section>
 </div>;
}
