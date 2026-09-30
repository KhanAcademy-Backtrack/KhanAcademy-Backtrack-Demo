'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import {useProgram} from './ProgramProvider';
import {PageBand,Sheet,btn,cx,pageBody} from './ui';
import {calendarItems,itemsOn,monthGrid,toIcs,type CalItem} from '@/lib/program/calendar';
import {parseDay,addDays,toDay} from '@/lib/program/planner';
import {DUR} from '@/lib/motion-tokens';

const WEEK=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const KIND:Record<CalItem['kind'],{dot:string;label:string}>={study:{dot:'bg-green',label:'Study session'},mock:{dot:'bg-navy',label:'Mock exam day'},custom:{dot:'bg-fog',label:'Your event'},exam:{dot:'bg-white ring-2 ring-navy',label:'Exam date'},examWindow:{dot:'bg-mint-line',label:'Exam window'}};
const field='min-h-11 rounded-xl border-2 border-navy/15 bg-white px-3 text-navy focus:border-navy focus:outline-none';

export function CalendarView(){
 const {state,update,today}=useProgram(),reduced=useReducedMotion();
 const [cursor,setCursor]=useState(()=>today.slice(0,7)),[selected,setSelected]=useState(today),[view,setView]=useState<'month'|'agenda'>('month');
 const [moving,setMoving]=useState<string|null>(null),[moveTo,setMoveTo]=useState(''),[adding,setAdding]=useState(false);
 const [draft,setDraft]=useState({title:'',time:'16:00',minutes:30});
 const items=useMemo(()=>calendarItems(state,today),[state,today]);
 const [y,m]=cursor.split('-').map(Number),grid=monthGrid(y,m-1);
 const monthName=new Date(y,m-1,1).toLocaleDateString('en-PH',{month:'long',year:'numeric'});
 const shift=(n:number)=>{const d=new Date(y,m-1+n,1);setCursor(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);};
 const day=itemsOn(items,selected);
 const saveEvent=(e:CalItem&{removed?:boolean})=>update(s=>({...s,events:[...s.events.filter(x=>x.id!==e.id),{id:e.id,date:e.date,time:e.time,minutes:e.minutes,title:e.title,kind:e.kind==='study'||e.kind==='mock'?e.kind:'custom',concept:e.concept,done:e.done,...(e.removed?{removed:true}:{})} as never]}));
 function exportIcs(){const upcoming=items.filter(i=>i.date>=today&&i.date<=addDays(today,400));const stamp=new Date().toISOString().replace(/[-:]/g,'').slice(0,15);const blob=new Blob([toIcs(upcoming,stamp)],{type:'text/calendar'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='khanpanion-study-plan.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 const agenda=items.filter(i=>(i.end??i.date)>=today).slice(0,60);
 const byDay=new Map<string,CalItem[]>();for(const i of agenda){const k=i.date<today?today:i.date;byDay.set(k,[...(byDay.get(k)??[]),i]);}
 return <>
  <PageBand title="Calendar" lead="Your study sessions, mock exam days and official exam dates in one place. Move anything; the plan fills in around it." aside={<div className="flex flex-wrap gap-2"><button className={btn.primary} onClick={exportIcs}>Add to my phone calendar</button>{!state.pledge&&<Link href="/plan" className={btn.onDark}>Make a plan first</Link>}</div>}/>
  <div className={pageBody}>
   <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
    <Sheet className="p-3 sm:p-6">
     <div className="flex flex-wrap items-center gap-2 px-2 pt-2 sm:px-0 sm:pt-0">
      <h2 className="mr-auto text-2xl font-extrabold tracking-[-.02em]" aria-live="polite">{view==='month'?monthName:'Coming up'}</h2>
      <div role="group" aria-label="View" className="flex rounded-full bg-sky p-1">{(['month','agenda'] as const).map(v=><button key={v} aria-pressed={view===v} onClick={()=>setView(v)} className="min-h-10 rounded-full px-4 text-sm font-bold aria-pressed:bg-navy aria-pressed:text-white">{v==='month'?'Month':'Agenda'}</button>)}</div>
      {view==='month'&&<div className="flex gap-1"><button aria-label="Previous month" onClick={()=>shift(-1)} className="grid h-11 w-11 place-items-center rounded-full border-2 border-navy/15 hover:bg-mint">‹</button><button onClick={()=>{setCursor(today.slice(0,7));setSelected(today);}} className="min-h-11 rounded-full border-2 border-navy/15 px-4 text-sm font-bold hover:bg-mint">Today</button><button aria-label="Next month" onClick={()=>shift(1)} className="grid h-11 w-11 place-items-center rounded-full border-2 border-navy/15 hover:bg-mint">›</button></div>}
     </div>
     {view==='month'?<motion.div key={cursor} initial={reduced?false:{opacity:0,x:8}} animate={{opacity:1,x:0}} transition={{duration:DUR.base}} className="mt-4">
      <div className="grid grid-cols-7 text-center text-xs font-bold text-ink-soft sm:text-sm">{WEEK.map(w=><div key={w} className="py-2">{w}</div>)}</div>
      <div role="grid" aria-label={monthName} className="grid grid-cols-7 gap-1">{grid.map(d=>{const list=itemsOn(items,d),inMonth=Number(d.slice(5,7))===m,isToday=d===today,isSel=d===selected,exam=list.find(i=>i.kind==='exam'),win=list.some(i=>i.kind==='examWindow');
       return <button key={d} role="gridcell" aria-selected={isSel} aria-label={`${parseDay(d).toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric'})}${list.length?`, ${list.length} item${list.length===1?'':'s'}`:''}`} onClick={()=>setSelected(d)}
        className={cx('relative flex min-h-14 flex-col items-stretch rounded-xl p-1 text-left transition-colors sm:min-h-24 sm:p-2',inMonth?'bg-white':'bg-transparent text-ink-soft/60',win&&inMonth&&'bg-mint',isSel?'ring-2 ring-navy':'hover:bg-sky')}>
        <span className={cx('grid h-7 w-7 place-items-center self-start rounded-full text-sm font-bold',isToday&&'bg-green text-navy',exam&&!isToday&&'ring-2 ring-navy')}>{Number(d.slice(8))}</span>
        <span className="mt-1 flex flex-wrap gap-1 sm:hidden">{list.filter(i=>i.kind!=='examWindow').slice(0,3).map(i=><span key={i.id} className={cx('h-2 w-2 rounded-full',KIND[i.kind].dot,i.done&&'opacity-40')}/>)}</span>
        <span className="mt-1 hidden flex-col gap-0.5 sm:flex">{list.filter(i=>i.kind!=='examWindow'||i.date===d).slice(0,3).map(i=><span key={i.id} className={cx('truncate rounded-md px-1.5 py-0.5 text-[11px] font-semibold',i.kind==='study'?'bg-green/20':i.kind==='mock'?'bg-navy text-white':i.kind==='exam'?'bg-white ring-1 ring-navy':i.kind==='examWindow'?'bg-mint-line':'bg-sky',i.done&&'line-through opacity-60')}>{i.title}</span>)}{list.length>3&&<span className="text-[11px] text-ink-soft">+{list.length-3} more</span>}</span>
       </button>;})}</div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 px-2 text-sm text-ink-soft sm:px-0">{Object.values(KIND).map(k=><span key={k.label} className="flex items-center gap-2"><span className={cx('h-2.5 w-2.5 rounded-full',k.dot)}/>{k.label}</span>)}</div>
     </motion.div>
     :<ol className="mt-4 grid gap-4">{[...byDay].map(([d,list])=><li key={d}><p className="font-bold">{d===today?'Today':parseDay(d).toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric'})}</p><ul className="mt-2 grid gap-2">{list.map(i=>row(i,i.id+d))}</ul></li>)}{!byDay.size&&<p className="text-ink-soft">Nothing planned yet. Make a study pledge to fill your calendar.</p>}</ol>}
    </Sheet>
    <Sheet className="lg:sticky lg:top-24 lg:self-start">
     <h2 className="text-xl font-extrabold">{selected===today?'Today':parseDay(selected).toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric'})}</h2>
     {day.length?<ul className="mt-3 grid gap-2">{day.map(i=>row(i,i.id))}</ul>:<p className="mt-2 text-ink-soft">Nothing on this day.</p>}
     {adding?<form className="mt-5 grid gap-3 rounded-2xl bg-sky p-4" onSubmit={e=>{e.preventDefault();if(!draft.title.trim())return;saveEvent({id:`own-${Date.now()}`,date:selected,time:draft.time,minutes:draft.minutes,title:draft.title.trim().slice(0,120),kind:'custom'});setAdding(false);setDraft({title:'',time:'16:00',minutes:30});}}>
      <label className="grid gap-1 text-sm font-semibold">What<input className={field} value={draft.title} maxLength={120} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="Group review at the library" autoFocus/></label>
      <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-sm font-semibold">Time<input type="time" className={field} value={draft.time} onChange={e=>setDraft({...draft,time:e.target.value})}/></label><label className="grid gap-1 text-sm font-semibold">Minutes<input type="number" min={5} max={600} className={field} value={draft.minutes} onChange={e=>setDraft({...draft,minutes:Math.max(5,Math.min(600,Number(e.target.value)||30))})}/></label></div>
      <div className="flex gap-2"><button className={btn.primary}>Add to {selected===today?'today':'this day'}</button><button type="button" className={btn.ghost} onClick={()=>setAdding(false)}>Cancel</button></div>
     </form>:<button className={cx(btn.ghost,'mt-5')} onClick={()=>setAdding(true)}>Add an event</button>}
    </Sheet>
   </div>
  </div>
 </>;
 function row(i:CalItem,key:string){
  const own=state.events.find(e=>e.id===i.id);
  return <li key={key} className={cx('rounded-2xl border-2 p-3',i.done?'border-mint-line bg-mint':'border-navy/10')}>
   <div className="flex items-start gap-3"><span className={cx('mt-1.5 h-3 w-3 shrink-0 rounded-full',KIND[i.kind].dot)}/><div className="min-w-0 flex-1"><p className={cx('font-bold',i.done&&'line-through')}>{i.kind==='study'?`Study: ${i.title}`:i.title}</p><p className="text-sm text-ink-soft">{KIND[i.kind].label}{i.time?` · ${i.time}`:''}{i.minutes?` · ${i.minutes} min`:''}{i.end?` · until ${parseDay(i.end).toLocaleDateString('en-PH',{month:'short',day:'numeric'})}`:''}</p></div></div>
   <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 pl-6">
    {i.kind==='study'&&i.concept&&<Link className="min-h-11 py-2 text-sm font-bold underline decoration-green underline-offset-4" href={`/learn/${i.concept}`}>Start</Link>}
    {i.kind==='mock'&&<Link className="min-h-11 py-2 text-sm font-bold underline decoration-green underline-offset-4" href={i.title==='Full simulation'?`/mock/take?f=full~${i.date.replace(/-/g,'')}`:'/mock'}>Start</Link>}
    {(i.kind==='exam'||i.kind==='examWindow')&&i.link&&<a className="min-h-11 py-2 text-sm font-bold underline decoration-green underline-offset-4" href={i.link} target="_blank" rel="noopener noreferrer">Official page ↗</a>}
    {(i.kind==='study'||i.kind==='mock'||i.kind==='custom')&&<>
     <button className="min-h-11 text-sm font-semibold underline underline-offset-4" onClick={()=>{saveEvent({...i,done:!i.done});if(!i.done)update(s=>({...s,studyDays:[...s.studyDays,i.date<=today?i.date:today]}));}}>{i.done?'Not done':'Mark done'}</button>
     <button className="min-h-11 text-sm font-semibold underline underline-offset-4" onClick={()=>{setMoving(i.id);setMoveTo(addDays(i.date,1));}}>Move</button>
     <button className="min-h-11 text-sm font-semibold underline underline-offset-4" onClick={()=>own&&i.kind==='custom'?update(s=>({...s,events:s.events.filter(e=>e.id!==i.id)})):saveEvent({...i,removed:true} as never)}>Remove</button>
    </>}
   </div>
   {moving===i.id&&<form className="mt-2 flex flex-wrap items-end gap-2 pl-6" onSubmit={e=>{e.preventDefault();saveEvent({...i,date:moveTo});setMoving(null);setSelected(moveTo);}}><label className="grid gap-1 text-sm font-semibold">New date<input type="date" min={toDay(new Date())} className={field} value={moveTo} onChange={e=>setMoveTo(e.target.value)}/></label><button className={btn.dark}>Move</button><button type="button" className={btn.ghost} onClick={()=>setMoving(null)}>Cancel</button></form>}
  </li>;
 }
}
