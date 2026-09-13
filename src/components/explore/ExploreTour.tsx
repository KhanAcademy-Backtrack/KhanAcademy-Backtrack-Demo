'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Companion} from '@/components/study/Companion';
import {useStudy} from '@/components/study/StudyProvider';
const STEPS=[
 {selector:'.explore-filters',title:'Find an idea that interests you',body:'Choose a topic, scroll through the collection, or use Previous and Next. Motion on switches to a still view whenever you prefer.'},
 {selector:'#idea-same-mix .explore-scene-controls',title:'Change something and see why',body:'Move the slider or use the model’s controls. Make a prediction, then open the explanation. You can choose “I don’t know yet” at any time.'},
 {selector:'#idea-same-mix .idea-topline > div',title:'Keep an idea or share it',body:'Save keeps the idea in your Saved list and on Today. Share copies a link to this idea. Your answers stay private.'},
 {selector:'#idea-khan-open-brackets .explore-video-cover',title:'Learn with Khan Academy',body:'Khan clips are clearly labelled. Press Play when you want to watch. You can continue the video or open the full original lesson.'},
 {selector:'#idea-khan-open-brackets .idea-continue',title:'Practise, then come back',body:'Practise on Khan opens the related exercise in another tab. Return here to say how it went, get help, or try a fresh question. Your place is saved.'},
 {selector:'a[href="/review"]',title:'Give the idea another look',body:'Fresh study questions build your reviewer. Review brings earlier ideas back for another try. Your saved discoveries stay in Explore and Today.'}
];
export function ExploreTour({onClose}:{onClose:()=>void}){
 const {state}=useStudy(),[step,setStep]=useState(-1),[rect,setRect]=useState<{x:number;y:number;w:number;h:number}>(),[size,setSize]=useState({w:390,h:844}),[height,setHeight]=useState(310);
 const dialog=useRef<HTMLDivElement>(null),target=useRef<HTMLElement|null>(null),previous=useRef<HTMLElement|null>(null),done=useRef(onClose);done.current=onClose;
 function close(){setStep(-1);done.current();previous.current?.focus({preventScroll:true});}
 useEffect(()=>{const start=()=>{previous.current=document.activeElement as HTMLElement;setStep(0);};window.addEventListener('dunlo:explore-tour',start);return()=>window.removeEventListener('dunlo:explore-tour',start);},[]);
 useEffect(()=>{
  if(step<0)return;
  const find=()=>Array.from(document.querySelectorAll<HTMLElement>(STEPS[step].selector)).find(el=>el.getBoundingClientRect().width>0);
  const measure=()=>{setSize({w:innerWidth,h:innerHeight});if(dialog.current)setHeight(dialog.current.getBoundingClientRect().height);target.current=find()??null;const r=target.current?.getBoundingClientRect();setRect(r?{x:Math.max(5,r.x-6),y:Math.max(5,r.y-6),w:Math.min(innerWidth-10,r.width+12),h:r.height+12}:undefined);};
  find()?.scrollIntoView({block:'center',behavior:'instant'});measure();dialog.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
  function keys(e:KeyboardEvent){if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key!=='Tab')return;const nodes=[...Array.from(dialog.current?.querySelectorAll<HTMLElement>('button')??[]),...(target.current?.matches('a,button,input,select')?[target.current]:Array.from(target.current?.querySelectorAll<HTMLElement>('a,button,input,select')??[]))].filter(el=>!(el as HTMLButtonElement).disabled);if(!nodes.length)return;const current=nodes.indexOf(document.activeElement as HTMLElement);e.preventDefault();nodes[(current+(e.shiftKey?-1:1)+nodes.length)%nodes.length]?.focus({preventScroll:true});}
  window.addEventListener('keydown',keys);window.addEventListener('resize',measure);window.addEventListener('scroll',measure,{passive:true});return()=>{window.removeEventListener('keydown',keys);window.removeEventListener('resize',measure);window.removeEventListener('scroll',measure);};
 },[step]);
 if(step<0||typeof document==='undefined')return null;
 const width=Math.min(360,size.w-28),top=rect?(rect.y+rect.h+height+28<size.h-65?rect.y+rect.h+14:Math.max(14,rect.y-height-14)):Math.max(14,(size.h-height)/2),left=rect?Math.min(size.w-width-14,Math.max(14,rect.x)):Math.max(14,(size.w-width)/2);
 return createPortal(<div className={`welcome-tour explore-tour ${state.settings.quiet?'quiet-tour':''}`}>{rect?<><div className="tour-shade" style={{top:0,left:0,right:0,height:rect.y}}/><div className="tour-shade" style={{top:rect.y+rect.h,left:0,right:0,bottom:0}}/><div className="tour-shade" style={{left:0,top:rect.y,width:rect.x,height:rect.h}}/><div className="tour-shade" style={{left:rect.x+rect.w,right:0,top:rect.y,height:rect.h}}/><div className="tour-spotlight" style={{left:rect.x,top:rect.y,width:rect.w,height:rect.h}}/></>:<div className="tour-shade" style={{inset:0}}/>}<div ref={dialog} className="tour-dialog" role="dialog" aria-modal="true" aria-labelledby="explore-tour-title" aria-describedby="explore-tour-body" style={{top,left,width}}><button className="tour-close" aria-label="Close Explore tutorial" onClick={close}>×</button><div className="tour-mascot"><Companion size={55} pose="point"/></div><small>Explore · {step+1} of {STEPS.length}</small><h2 id="explore-tour-title">{STEPS[step].title}</h2><p id="explore-tour-body">{STEPS[step].body}</p><div className="tour-actions">{step>0&&<button className="button-text" onClick={()=>setStep(step-1)}>Back</button>}<button className="button-primary" onClick={()=>step===STEPS.length-1?close():setStep(step+1)}>{step===STEPS.length-1?'Done':'Next'}</button><button className="button-text" onClick={close}>Skip tutorial</button></div></div></div>,document.body);
}
