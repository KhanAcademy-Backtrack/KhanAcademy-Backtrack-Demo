'use client';
import Link from 'next/link';
import {useProgram} from './ProgramProvider';
import {ChangeGoalButton} from './ProgramTourProvider';
import {PageBand,Sheet,btn,cx,pageBody} from './ui';
import {StudyWeek} from './StudyWeek';
import {DailyPractice} from './DailyPractice';
import {ReviewTopics} from './ReviewTopics';
import {Companion} from '@/components/study/Companion';
import {examTargets,goalLabel,learnerGoal,targetDay} from '@/lib/program/personalization';
import {personalFocus,daysBetween,parseDay} from '@/lib/program/planner';
import {calendarItems} from '@/lib/program/calendar';
import {PROGRAM_BY_ID} from '@/lib/program/bridge';

export function PersonalHome(){
 const {state:s,today}=useProgram(),goal=learnerGoal(s),setup=s.setup!;
 const concept=personalFocus(s)[0]?.concept,label=goalLabel(s),target=targetDay(s),seed=today.replace(/-/g,'');
 const items=calendarItems(s,today,false),program=PROGRAM_BY_ID[s.bridgeProgram??''],targets=examTargets(s);
 if(!concept)return <div className="mx-auto max-w-3xl p-5 text-navy"><h1 className="text-2xl font-extrabold">Choose your next topic</h1><ChangeGoalButton className={cx(btn.ghost,'mt-5')}/></div>;
 return <><PageBand title={label} lead={`${setup.weekdays.length} study days a week · ${setup.minutes} minutes a session · Around ${setup.time}`} aside={<ChangeGoalButton className={btn.ghost} label="Change goal or routine"/>}>
  {target&&<p className="mt-2 text-sm text-ink-soft">{target>today?`${daysBetween(today,target)} days to your planning target`:'Your planning target has arrived'} · {parseDay(target).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})}</p>}
 </PageBand><div className={pageBody}>
  {goal==='exam'&&<DailyPractice className="mb-6"/>}
  <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[1.1fr_1fr]">
   <Sheet className="min-w-0" data-program-tour-content="today"><div className="flex items-start gap-3"><Companion size={40} pose="encourage"/><div><p className="text-sm font-semibold text-ink-soft">{goal==='topic'?'Your chosen topic':goal==='exam'?'Your next topic':'A foundation to start with'}</p><h2 className="mt-1 text-xl font-extrabold leading-tight">{concept.title}</h2></div></div><p className="mt-4 leading-relaxed text-ink-soft">{concept.blurb}</p><div className="mt-5 flex flex-wrap gap-2"><Link href={`/learn/${concept.id}`} className={btn.primary}>Learn this topic</Link>{goal==='topic'&&<Link href={`/mock/take?f=topic~${concept.id}|${seed}&mode=practice`} className={btn.ghost}>Try a topic check</Link>}</div>
    {goal!=='topic'&&<details className="mt-5 border-t border-navy/10 pt-3"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">Choose a different topic</summary><ReviewTopics/></details>}
    <Link href="/reviewer" className={cx(btn.text,'mt-3 text-sm')}>{goal==='exam'?'Open the full CET reviewer':'Browse the reviewer'}</Link>
   </Sheet>
   <Sheet className="min-w-0" data-program-tour-content="calendar"><h2 className="text-xl font-extrabold">Your study week</h2><p className="mt-2 text-sm text-ink-soft">Your calendar follows your chosen days. Adjust it whenever your week changes.</p><Link href={`/calendar?day=${today}`} className={cx(btn.ghost,'mt-4')}>Open my calendar</Link><details className="mt-4 border-t border-navy/10 pt-3"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">See this week’s sessions</summary><StudyWeek items={items} today={today}/></details></Sheet>
   {goal==='college'&&program?<Sheet className="min-w-0 lg:col-span-2"><h2 className="text-xl font-extrabold">Your first-year foundations</h2><p className="mt-2 text-sm text-ink-soft">Your {program.title} map connects college topics to the foundations behind them.</p><div className="mt-4 flex flex-wrap gap-2"><Link href={`/bridge/${program.id}`} className={btn.dark}>Open my program map</Link><Link href={`/mock/take?f=placement~${program.id}|${seed}&mode=practice`} className={btn.ghost}>Try the placement check</Link></div></Sheet>:goal==='college'?<Sheet className="min-w-0 lg:col-span-2"><h2 className="text-xl font-extrabold">Choose a field when you’re ready</h2><p className="mt-2 text-sm text-ink-soft">Keep reviewing general foundations, or choose a field for a more specific map.</p><ChangeGoalButton className={cx(btn.ghost,'mt-4')} label="Choose my college field"/></Sheet>:goal==='topic'?<div className="lg:col-span-2"><ChangeGoalButton className={btn.ghost} label="Choose another topic"/></div>:targets.length>0?<details className="rounded-2xl bg-white px-5 py-3 text-navy shadow-sheet lg:col-span-2"><summary className="min-h-11 cursor-pointer py-2 font-semibold">My exam targets</summary><p className="mt-2 break-words text-sm text-ink-soft">{targets.map(t=>t.name).join(', ')}</p><Link href="/plan" className={cx(btn.ghost,'mt-3')}>Edit or add CETs</Link></details>:null}
  </div>
 </div></>;
}
