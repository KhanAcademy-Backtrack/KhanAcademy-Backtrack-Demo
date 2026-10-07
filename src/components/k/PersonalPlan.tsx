'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useProgram} from './ProgramProvider';
import {ChangeGoalButton} from './ProgramTourProvider';
import {StudyWeek} from './StudyWeek';
import {ReviewTopics} from './ReviewTopics';
import {PageBand,Sheet,btn,pageBody,cx} from './ui';
import {calendarItems} from '@/lib/program/calendar';
import {examTargets,firstExam,goalLabel,learnerGoal} from '@/lib/program/personalization';
import {EXAMS} from '@/lib/program/admissions';
import {parseDay} from '@/lib/program/planner';
import {PROGRAM_BY_ID} from '@/lib/program/bridge';

export function PersonalPlan({browsing=false}:{browsing?:boolean}){
 const {state,today}=useProgram(),goal=learnerGoal(state),targets=examTargets(state),program=PROGRAM_BY_ID[state.bridgeProgram??''],exam=browsing?undefined:firstExam(state);
 return <><PageBand title={browsing?'Explore before making a plan':goal==='exam'?'Your CET plan':'Your study routine'} lead={browsing?'Browse topics now. Choose a goal whenever you want a personal routine.':goalLabel(state)} aside={<ChangeGoalButton className={btn.quiet} label={browsing?'Choose my goal':'Change goal or routine'}/>}/><div className={pageBody}><div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
  <Sheet className="min-w-0">{browsing||goal==='exam'?<><h2 className="text-2xl font-extrabold"><Headline>{browsing?'Find a topic':'Your CET reviewer'}</Headline></h2><p className="mt-2 text-sm text-ink-soft">{exam?`Choose a ${EXAMS[exam].name} section to read its topics.`:'Choose a subject to read its topics.'} Practice is available when you want it.</p><ReviewTopics exam={exam}/><Link href="/reviewer" className={cx(btn.text,'mt-3')}><Headline>Open the full reviewer</Headline></Link></>:<><h2 className="text-2xl font-extrabold"><Headline>{goalLabel(state)}</Headline></h2><p className="mt-2 text-ink-soft">{goal==='topic'?'Your chosen topic is ready to revisit.':'Review useful foundations for your first year.'}</p><div className="mt-4 flex flex-wrap gap-2"><Link href={goal==='topic'?`/learn/${state.setup?.concept}`:program?`/bridge/${program.id}`:'/bridge'} className={btn.primary}><Headline>{goal==='topic'?'Open my topic':program?'Open my program map':'Explore college fields'}</Headline></Link><Link href="/reviewer" className={btn.ghost}><Headline>Browse the reviewer</Headline></Link></div></>}</Sheet>
  <div className="grid min-w-0 content-start gap-5">{!browsing&&goal==='exam'&&<Sheet className="min-w-0"><h2 className="text-xl font-extrabold"><Headline>Your exam targets</Headline></h2>{targets.length?<ul className="mt-3 divide-y divide-navy/10">{targets.map(t=><li key={t.key} className="py-3"><p className="break-words font-bold">{t.name}</p><p className="mt-1 text-sm text-ink-soft">{t.date?`Planning target: ${parseDay(t.date).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})}`:'Date not set yet'}</p></li>)}</ul>:<p className="mt-2 text-ink-soft">You chose general CET review. Add one or several exams when you know where you’ll apply.</p>}<ChangeGoalButton className={cx(btn.ghost,'mt-3')} label="Edit or add CETs"/><p className="mt-3 text-xs leading-relaxed text-ink-soft">The reviewer covers shared foundations. Adding a target does not change the practice bank into that exam’s exact format.</p></Sheet>}{!browsing&&<Sheet className="min-w-0" data-program-tour-content="calendar"><h2 className="mb-2 text-xl font-extrabold"><Headline>Your study week</Headline></h2><StudyWeek items={calendarItems(state,today,goal==='exam')} today={today}/></Sheet>}</div>
 </div></div></>;
}
