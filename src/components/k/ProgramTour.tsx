'use client';
import Link from 'next/link';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {motion} from 'motion/react';
import {Companion} from '@/components/study/Companion';
import {useMotionPolicy} from '@/components/motion/MotionPolicy';
import {DUR,tween} from '@/lib/motion-tokens';
import {useProgram} from './ProgramProvider';
import {btn,cx,Oval} from './ui';

const STEPS=[
 {tab:'today',title:'Start with a few questions.',body:'Try the three-question practice on your home page. Check each answer and read the explanation. “I don’t know yet” is always an option.',preview:['Choose an answer','Check it','See why'],href:'/',action:'Open my home page'},
 {tab:'plan',title:'Choose a goal that fits you.',body:'Preparing for an exam? Choose your date and study days. Starting college? Pick your program to see which foundations to review.',preview:['An exam date and routine','Or your college program'],href:'/plan',action:'Choose my goal'},
 {tab:'today',title:'Come back to a clear next step.',body:'Once you have a plan, Today brings your next study session together: revisit a topic, learn with Khan Academy, then try a fresh question.',preview:['Review','Learn','Try it yourself'],href:'/',action:'Open Today'},
 {tab:'mocks',title:'Practise at your own pace.',body:'Choose a short set, a subject check or a timed mock. Your results explain the answers and help you decide what to work on next.',preview:['Short practice','Timed mocks','Explanations and next steps'],href:'/mock',action:'Browse practice sets'},
 {tab:'reviewer',title:'Find the explanation you need.',body:'Search by topic, read a chapter and try its practice questions. Save useful pages for later, or print them to study away from a screen.',preview:['Search a topic','Read and practise','Save or print'],href:'/reviewer',action:'Open the reviewer'},
 {tab:'group',title:'Keep each other going.',body:'Agree on a weekly goal and make a check-in card to share with friends. You choose what to share. Your own practice stays separate.',preview:['Set a weekly goal','Make a check-in card','Share when you choose'],href:'/group',action:'Open Group'}
] as const;
type Rect={x:number;y:number;w:number;h:number};

/** The real navigation is highlighted; the page stays inert while the tour is open. */
export function ProgramTour({onClose}:{onClose:()=>void}){
 const [step,setStep]=useState(0),[rect,setRect]=useState<Rect>(),[position,setPosition]=useState({top:90,left:14});
 const dialog=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null),{off}=useMotionPolicy(),{state}=useProgram();
 const current=STEPS[step],bridge=state.sides.bridge&&state.activeSide==='bridge';
 const href=current.tab==='plan'&&bridge?'/bridge':current.href;
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
   <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-ink-soft">Quick tour · {step+1} of {STEPS.length}</p><button aria-label="Close tour" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-navy/15 text-xl focus-visible:outline-3 focus-visible:outline-navy" onClick={onClose}>×</button></div>
   <motion.div key={step} initial={off?false:{opacity:0}} animate={{opacity:1}} transition={tween(off,DUR.fast)}>
    <div className="mt-2 flex items-start gap-3"><Companion size={56} pose="point"/><h2 ref={heading} id="program-tour-title" tabIndex={-1} className="pt-1 text-[1.6rem] font-extrabold leading-tight tracking-[-.03em] focus:outline-none">{current.title}</h2></div>
    <p id="program-tour-body" className="mt-4 text-[16px] leading-relaxed text-ink-soft">{current.body}</p>
    <ol aria-label="What you can do" className="mt-4 grid gap-2 rounded-2xl bg-mint p-4">{current.preview.map((line,i)=><li key={line} className="flex items-center gap-3 text-sm font-semibold"><Oval filled={i===0} label={String(i+1)} size={26}/>{line}</li>)}</ol>
    <Link href={href} className={cx(btn.text,'mt-2 text-sm')} onClick={onClose}>{current.action} <span aria-hidden="true">→</span></Link>
   </motion.div>
   <div className="mt-3 flex items-center gap-2 border-t border-navy/10 pt-4">{step>0&&<button className={btn.ghost} onClick={()=>setStep(s=>s-1)}>Back</button>}<button className={cx(btn.primary,'ml-auto')} onClick={()=>step===STEPS.length-1?onClose():setStep(s=>s+1)}>{step===STEPS.length-1?'Finish tour':'Next'}</button></div>
   <div className="mt-2 flex items-center justify-between gap-3"><button className={cx(btn.text,'text-sm')} onClick={onClose}>Skip tour</button><p className="max-w-48 text-right text-xs leading-relaxed text-ink-soft">Replay this any time from Me.</p></div>
  </div>
 </div>,document.body);
}
