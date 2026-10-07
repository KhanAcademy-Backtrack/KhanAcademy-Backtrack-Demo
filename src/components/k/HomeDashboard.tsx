'use client';
import Link from 'next/link';
import {useEffect,useId,useMemo,useRef,useState,type KeyboardEvent,type ReactNode} from 'react';
import {useProgram} from './ProgramProvider';
import {useStudy} from '@/components/study/StudyProvider';
import {Companion} from '@/components/study/Companion';
import {Headline} from './Headline';
import {Sheet,btn} from './ui';
import {activityWeeks,studyActivity,type ActivityDay} from '@/lib/program/activity';
import {parseDay} from '@/lib/program/planner';
import {ProfileNameEditor} from './ProfileName';

function useActivity(){
 const {state:program,today}=useProgram(),{state:study}=useStudy();
 return useMemo(()=>studyActivity(program,study,today),[program,study,today]);
}

export function HomeWelcome({title,children,action}:{title:string;children:ReactNode;action?:ReactNode}){
 const activity=useActivity(),{profileName}=useProgram(),[editing,setEditing]=useState(false);
 return <><header className="home-welcome">
  <div className="home-welcome-main"><div className="home-buddy"><Companion size={76} pose={activity.weekDays?'encourage':'wave'}/></div>
   <div className="home-profile-copy"><p className="home-kicker">Khanpanion Profile</p>
    <h1 className="home-profile-name">{profileName}</h1><div className="home-welcome-copy"><h2 className="home-profile-goal"><Headline>{title}</Headline></h2>{children}</div>{action}</div>
  </div>
  <dl className="home-stats"><div><dt>Study Days</dt><dd>{activity.activeDays}</dd></div><div><dt>Practice Sets</dt><dd>{activity.sets}</dd></div><div><dt>BACKTRACK Answers</dt><dd>{activity.checks}</dd></div></dl>
  <button type="button" aria-label="Edit profile name" title="Edit profile name" className="home-profile-edit" onClick={()=>setEditing(true)}><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 5Z"/></svg></button>
 </header>{editing&&<ProfileNameEditor onClose={()=>setEditing(false)}/>}</>;
}

const milestones=[1,5,10,25,50];
const fullDate=(day:string)=>parseDay(day).toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
const activityCount=(entry?:ActivityDay)=>`${entry?.count??0} recorded ${entry?.count===1?'activity':'activities'}`;
function dayDetail(entry?:ActivityDay){
 if(!entry?.level)return 'No study recorded';
 const parts=[entry.sets?`${entry.sets} practice ${entry.sets===1?'set':'sets'}`:'',entry.checks?`${entry.checks} BACKTRACK ${entry.checks===1?'answer':'answers'}`:'',entry.review?'Recall reviewed':''].filter(Boolean);
 return parts.join(' · ')||'Study recorded';
}
const flame=<svg viewBox="0 0 24 28" fill="none" aria-hidden="true"><path d="M13 2c2 7-5 8-3 13 1-2 3-3 5-5 5 5 7 9 4 13-3 5-12 5-15 0C0 16 9 12 13 2Z" fill="#14bf96"/><path d="M12 16c-3 3-5 5-3 7 2 2 6 0 5-3" stroke="#0a2a66" strokeWidth="1.5" strokeLinecap="round"/></svg>;

export function StudyActivity(){
 const {state:program,today}=useProgram(),activity=useActivity();
 const [selected,setSelected]=useState(today);
 const [tooltip,setTooltip]=useState<{day:string;x:number;y:number}|null>(null),tooltipId=useId();
 const weeks=useMemo(()=>activityWeeks(today),[today]);
 const year=today.slice(0,4),yearStart=`${year}-01-01`,yearEnd=`${year}-12-31`;
 const scroll=useRef<HTMLDivElement>(null),cells=useRef(new Map<string,HTMLButtonElement>());
 const weekGoal=program.setup?.weekdays.length??program.pledge?.days;
 const focusDay=selected>=yearStart&&selected<=today?selected:today;
 useEffect(()=>{
  const view=scroll.current,cell=cells.current.get(today);
  if(view&&cell)view.scrollLeft=Math.max(0,cell.getBoundingClientRect().right-view.getBoundingClientRect().right+view.scrollLeft+16);
 },[today]);
 useEffect(()=>{
  const hide=()=>setTooltip(null);
  window.addEventListener('scroll',hide);window.addEventListener('resize',hide);
  return()=>{window.removeEventListener('scroll',hide);window.removeEventListener('resize',hide);};
 },[]);
 const showTooltip=(day:string,element:HTMLElement)=>{
  const card=element.closest('.home-activity-card');if(!card)return;
  const r=element.getBoundingClientRect(),c=card.getBoundingClientRect();
  setTooltip({day,x:Math.max(124,Math.min(c.width-124,r.left-c.left+r.width/2)),y:r.top-c.top-8});
 };
 const navigate=(event:KeyboardEvent<HTMLButtonElement>,day:string)=>{
  if(event.key==='Escape'){setTooltip(null);event.preventDefault();return;}
  const days=weeks.flat().filter(d=>d>=yearStart&&d<=today),index=days.indexOf(day);
  const next=event.key==='ArrowRight'?index+7:event.key==='ArrowLeft'?index-7:event.key==='ArrowDown'?index+1:event.key==='ArrowUp'?index-1:event.key==='Home'?0:event.key==='End'?days.length-1:undefined;
  if(next===undefined)return;event.preventDefault();const to=days[Math.max(0,Math.min(days.length-1,next))];setSelected(to);cells.current.get(to)?.focus({preventScroll:true});cells.current.get(to)?.scrollIntoView({block:'nearest',inline:'nearest'});
 };
 const nextMilestone=milestones.find(m=>m>activity.activeDays);
 return <div className="home-progress" data-study-activity>
  <Sheet className="home-activity-card" aria-labelledby="activity-title">
   <div className="home-activity-heading"><div className="home-streak"><span className="home-flame">{flame}</span><div><p className="home-kicker">A little, often</p><h2 id="activity-title"><Headline>Your study rhythm</Headline></h2><p className="home-streak-note">{activity.streak?<><strong>{activity.streak} day{activity.streak===1?'':'s'} in a row</strong><span aria-hidden="true"> · </span></>:null}Personal best: {activity.best} day{activity.best===1?'':'s'}</p></div></div>
    <div className="home-week-note"><span className="home-week-dot" aria-hidden="true"/><div><strong>{activity.weekDays}{weekGoal?` of ${weekGoal}`:''} study day{weekGoal===1||!weekGoal&&activity.weekDays===1?'':'s'} this week</strong><p>{weekGoal&&activity.weekDays>=weekGoal?'Your weekly rhythm is complete. Keep your next step small.':'Every return counts. Pick up wherever you left off.'}</p></div></div>
   </div>
   <div className="home-heatmap-toolbar"><p>{activity.days.filter(e=>e.day>=yearStart).length} active days in {year}</p></div>
   <div className="home-heatmap-scroll" ref={scroll} onScroll={()=>{if(tooltip){const element=scroll.current?.querySelector<HTMLElement>(`[data-day="${tooltip.day}"]`);if(element)showTooltip(tooltip.day,element);}}}>
    <div className="home-heatmap" style={{gridTemplateColumns:`26px repeat(${weeks.length},var(--heatmap-cell))`}} role="group" aria-label={`Study activity heatmap for ${year}, January through December. Use arrow keys to explore days.`}>
     <div className="home-heatmap-labels" aria-hidden="true"><span/>{['S','M','T','W','T','F','S'].map((day,i)=><span key={i}>{day}</span>)}</div>
     {weeks.map(week=>{const monthDay=week.find(day=>day>=yearStart&&day<=yearEnd&&(day===yearStart||day.endsWith('-01')));return <div className="home-heatmap-week" key={week[0]}><span className="home-month" aria-hidden="true">{monthDay?parseDay(monthDay).toLocaleDateString('en-PH',{month:'short'}):''}</span>
      {week.map(day=>day<yearStart||day>yearEnd?<span key={day} className="home-heatmap-cell" aria-hidden="true"/>:day>today?<span key={day} className="home-heatmap-cell home-heatmap-future" data-day={day} role="img" aria-label={`${fullDate(day)}: Upcoming day, 0 recorded activities`} onPointerEnter={e=>{if(e.pointerType!=='touch')showTooltip(day,e.currentTarget);}} onPointerLeave={()=>setTooltip(null)}/>:<button key={day} className="home-heatmap-cell" data-day={day} ref={el=>{if(el)cells.current.set(day,el);else cells.current.delete(day);}} tabIndex={day===focusDay?0:-1} data-level={activity.byDay.get(day)?.level??0} data-today={day===today} aria-pressed={day===focusDay} aria-describedby={tooltip?.day===day?tooltipId:undefined} aria-label={`${fullDate(day)}: ${activityCount(activity.byDay.get(day))} · ${dayDetail(activity.byDay.get(day))}${day===today?' (today)':''}`} onPointerEnter={e=>{if(e.pointerType!=='touch')showTooltip(day,e.currentTarget);}} onPointerLeave={()=>setTooltip(null)} onFocus={e=>{setSelected(day);showTooltip(day,e.currentTarget);}} onBlur={()=>setTooltip(null)} onClick={()=>setSelected(day)} onKeyDown={e=>navigate(e,day)}/>)}
     </div>;})}
    </div>
   </div>
   {tooltip&&<div id={tooltipId} role="tooltip" className="home-heatmap-tooltip" style={{left:tooltip.x,top:tooltip.y}}><time dateTime={tooltip.day}>{fullDate(tooltip.day)}</time><strong>{activityCount(activity.byDay.get(tooltip.day))}</strong><span>{tooltip.day>today?'Upcoming day':dayDetail(activity.byDay.get(tooltip.day))}</span></div>}
   <div className="home-heatmap-footer"><p className="home-day-detail" aria-live="polite"><strong>{parseDay(focusDay).toLocaleDateString('en-PH',{month:'short',day:'numeric'})}{focusDay===today?' · Today':''}</strong><span>{dayDetail(activity.byDay.get(focusDay))}</span></p><div className="home-heatmap-legend" aria-label="Lighter green means less recorded activity; darker green means more"><span>Less</span>{[0,1,2,3,4].map(n=><span className="home-legend-cell" data-level={n} key={n}/>)}<span>More</span></div></div>
   <div className="home-activity-bottom"><p>{activity.activeDays?'Your practice and review, one day at a time.':'Your first little square is waiting. Try a topic or a practice set.'}</p><Link href={`/calendar?day=${focusDay}`} className={btn.text}><Headline>Open calendar <span aria-hidden="true">→</span></Headline></Link></div>
  </Sheet>
  <Sheet className="home-milestones" aria-labelledby="milestones-title"><div className="home-milestone-heading"><div><h2 id="milestones-title"><Headline>Small steps, real momentum</Headline></h2><p>Milestones for showing up. Your study days stay with you.</p></div><span className="home-next-milestone">{nextMilestone?`${nextMilestone-activity.activeDays} ${nextMilestone-activity.activeDays===1?'day':'days'} to your next milestone`:'50 study days reached'}</span></div>
   <ol className="home-milestone-track">{milestones.map((n,i)=>{const done=activity.activeDays>=n,next=nextMilestone===n;return <li key={n} data-done={done} data-next={next}><span className="home-milestone-line" aria-hidden="true"/><span className="home-milestone-number" aria-hidden="true">{n}{done&&<svg viewBox="0 0 16 16"><path d="m4 8 3 3 5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</span><span className="home-milestone-label">{n} study day{n===1?'':'s'}</span><span className="home-milestone-status">{done?'Reached':next?'Up next':'Along the way'}</span><span className="sr-only">{i+1} of {milestones.length}</span></li>;})}</ol>
  </Sheet>
 </div>;
}
