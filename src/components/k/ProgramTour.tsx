'use client';
import Link from 'next/link';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {motion} from 'motion/react';
import {Companion} from '@/components/study/Companion';
import {useMotionPolicy} from '@/components/motion/MotionPolicy';
import {DUR,tween} from '@/lib/motion-tokens';
import {useProgram} from './ProgramProvider';
import {goalLabel,learnerGoal} from '@/lib/program/personalization';
import {PROGRAM_BY_ID} from '@/lib/program/bridge';
import {btn,cx,Oval} from './ui';

function tourSteps(state:ReturnType<typeof useProgram>['state'],browsing:boolean){
 if(browsing)return [
 {tab:'today',title:'Look around first.',body:'You can browse without setting a routine or answering questions. Choose a subject, read a topic or explore an interactive idea.',preview:['Browse by subject','Read an explanation','Try an idea if you want'],href:'/',action:'Open the topic browser'},
 {tab:'reviewer',title:'Find something useful.',body:'Search the reviewer for a topic, save a useful page or print it. Practice is there when you want it; it is not required to browse.',preview:['Search a topic','Save a page','Read at your own pace'],href:'/reviewer',action:'Open the reviewer'},
 {tab:'calendar',title:'Keep your own dates here.',body:'You can use the calendar without a study plan. Add a date from your week, edit it or just look around. You can continue the guide without adding anything.',preview:['Pick a day','Add an event if you want','Continue whenever you are ready'],href:'/calendar',action:'Open the calendar'},
 {tab:'today',title:'Choose a goal whenever you want.',body:'The home page keeps your subject browser close. Use Choose my goal when you want a personalized routine. Guide stays in the header if you need another look.',preview:['Keep browsing','Choose a goal later','Your existing work stays saved'],href:'/',action:'Return to browsing'}
 ];
 const goal=learnerGoal(state),label=goalLabel(state),setup=state.setup,topic=setup?.concept,program=PROGRAM_BY_ID[state.bridgeProgram??''];
 const next=goal==='college'?program?'/bridge/'+program.id:'/bridge':goal==='topic'&&topic?'/learn/'+topic:'/plan';
 return [
  {tab:'today',title:'This space is yours.',body:'You chose '+label+'. Your home page now brings the relevant topics and your study week together.',preview:[label,(setup?.weekdays.length??3)+' study days a week',(setup?.minutes??30)+' minutes per session'],href:'/',action:'Open my home page'},
  {tab:'plan',title:goal==='college'?program?'Start with your foundations.':'Explore a college field.':goal==='topic'?'Your chosen topic is close by.':'A routine you can adjust.',body:goal==='college'?program?'Your program map connects first-year topics to foundations you can review. A placement check can help you choose where to begin.':'Start with general foundations. You can browse degree groups and choose a field when you are ready.':goal==='topic'?'Open your topic summary, follow a reviewed lesson where available, and try the practice questions when you are ready.':'Your plan follows your study days. You can change the routine or add a target date whenever you have one.',preview:goal==='college'?program?['Your program','Useful foundations','Placement check']:['General foundations','Browse college fields','Choose your field later']:goal==='topic'?['Read the summary','Learn with an example','Try it yourself']:['Your study days','A manageable session','Your planning target, if known'],href:next,action:goal==='college'?program?'Open my program map':'Explore college fields':goal==='topic'?'Open my topic':'Open my plan'},
  {tab:'calendar',title:'Use your real study calendar.',body:'Your chosen days already have sessions. Pick a date, edit a session or add something from your own week. Let’s try the calendar itself.',preview:['Pick a day','Edit or add a session','Move it when plans change'],href:'/calendar',action:'Open my calendar'},
  {tab:'reviewer',title:'Come back when you need help.',body:'The reviewer is there when a topic needs another look. Search by subject, save a useful page, or return to your home page for the next session.',preview:['Search a topic','Save a useful explanation','Keep your routine flexible'],href:'/reviewer',action:'Open the reviewer'}
 ];
}
type Rect={x:number;y:number;w:number;h:number};

/** The real navigation is highlighted; the page stays inert while the tour is open. */
export function ProgramTour({onClose,step,onStep,onCalendar,browsing}:{onClose:()=>void;step:number;onStep:(step:number)=>void;onCalendar:()=>void;browsing:boolean}){
 const [rect,setRect]=useState<Rect>(),[position,setPosition]=useState({top:90,left:14});
 const dialog=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null),{off}=useMotionPolicy(),{state}=useProgram();
 const STEPS=tourSteps(state,browsing),current=STEPS[Math.min(step,STEPS.length-1)],href=current.href;
 useLayoutEffect(()=>{
  const measure=()=>{
   const target=[...document.querySelectorAll<HTMLElement>(`[data-program-tour="${current.tab}"]`)].find(el=>el.getBoundingClientRect().width>0);
   const box=target?.getBoundingClientRect(),width=Math.min(420,innerWidth-28),height=Math.min(dialog.current?.getBoundingClientRect().height??430,innerHeight-112);
   const r=box?{x:Math.max(3,box.x-3),y:Math.max(3,box.y-3),w:Math.min(innerWidth-6,box.width+6),h:Math.min(innerHeight-6,box.height+6)}:undefined;
   setRect(r);setPosition({left:r?Math.min(innerWidth-width-14,Math.max(14,r.x)):Math.max(14,(innerWidth-width)/2),top:r?Math.max(14,Math.min(innerHeight-height-14,r.y>innerHeight/2?r.y-height-16:r.y+r.h+16)):Math.max(14,(innerHeight-height)/2)});
  };
  measure();const observer=new ResizeObserver(measure);if(dialog.current)observer.observe(dialog.current);
  window.addEventListener('resize',measure);return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
 },[current.tab]);
 useEffect(()=>{if(dialog.current)dialog.current.scrollTop=0;heading.current?.focus({preventScroll:true});},[step]);
 function trap(e:React.KeyboardEvent){
  if(e.key!=='Tab')return;
  const controls=[...dialog.current!.querySelectorAll<HTMLElement>('button:not(:disabled),a[href]')],index=controls.indexOf(document.activeElement as HTMLElement);
  e.preventDefault();controls[index<0?(e.shiftKey?controls.length-1:0):(index+(e.shiftKey?-1:1)+controls.length)%controls.length]?.focus({preventScroll:true});
 }
 return createPortal(<div className="fixed inset-0 z-[70] print:hidden">
  {rect?<>
   <div className="absolute inset-x-0 top-0 bg-navy-night/80" style={{height:rect.y}}/>
   <div className="absolute inset-x-0 bottom-0 bg-navy-night/80" style={{top:rect.y+rect.h}}/>
   <div className="absolute left-0 bg-navy-night/80" style={{top:rect.y,width:rect.x,height:rect.h}}/>
   <div className="absolute right-0 bg-navy-night/80" style={{top:rect.y,left:rect.x+rect.w,height:rect.h}}/>
   <div data-tour-highlight={current.tab} className="pointer-events-none absolute rounded-2xl border-[3px] border-green" style={{left:rect.x,top:rect.y,width:rect.w,height:rect.h}}/>
  </>:<div className="absolute inset-0 bg-navy-night/80"/>}
  <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="program-tour-title" aria-describedby="program-tour-body" onKeyDown={trap} className="absolute w-[calc(100%-28px)] max-w-[420px] max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain rounded-[22px] bg-white p-5 text-navy shadow-sheet sm:p-6" style={position}>
   <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-ink-soft">Your guide · {step+1} of {STEPS.length}</p><button aria-label="Close guide" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-navy/15 text-xl focus-visible:outline-3 focus-visible:outline-navy" onClick={onClose}>×</button></div>
   <motion.div key={step} initial={off?false:{opacity:0}} animate={{opacity:1}} transition={tween(off,DUR.fast)}>
    <div className="mt-2 flex items-start gap-3"><Companion size={56} pose="point"/><h2 ref={heading} id="program-tour-title" tabIndex={-1} className="pt-1 text-[1.6rem] font-extrabold leading-tight tracking-[-.03em] focus:outline-none">{current.title}</h2></div>
    <p id="program-tour-body" className="mt-4 text-[16px] leading-relaxed text-ink-soft">{current.body}</p>
    <ol aria-label="What you can do" className="mt-4 grid gap-2 rounded-2xl bg-mint p-4">{current.preview.map((line,i)=><li key={line} className="flex items-center gap-3 text-sm font-semibold"><Oval filled={i===0} label={String(i+1)} size={26}/>{line}</li>)}</ol>
    <Link href={href} className={cx(btn.text,'mt-2 text-sm')} onClick={e=>{if(current.tab==='calendar'){e.preventDefault();onCalendar();}else onClose();}}>{current.action} <span aria-hidden="true">→</span></Link>
   </motion.div>
   <div className="mt-3 flex items-center gap-2 border-t border-navy/10 pt-4">{step>0&&<button className={btn.ghost} onClick={()=>onStep(step-1)}>Back</button>}<button className={cx(btn.primary,'ml-auto')} onClick={()=>current.tab==='calendar'?onCalendar():step===STEPS.length-1?onClose():onStep(step+1)}>{current.tab==='calendar'?'Try my calendar':step===STEPS.length-1?'Finish guide':'Next'}</button></div>
   <p className="mt-3 text-right text-xs leading-relaxed text-ink-soft">Open Guide any time from the header.</p>
  </div>
 </div>,document.body);
}
