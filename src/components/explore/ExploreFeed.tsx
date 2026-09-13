'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter,useSearchParams} from 'next/navigation';
import {useReducedMotion} from 'motion/react';
import {useStudy} from '@/components/study/StudyProvider';
import {KhanReturnActions} from '@/components/study/KhanReturnActions';
import {KhanPlayer} from '@/components/product/KhanPlayer';
import {Companion} from '@/components/study/Companion';
import {ExploreTour} from './ExploreTour';
import {ExploreScene} from './ExploreScene';
import {EXPLORE_ITEMS,exploreItem,exploreMaterial,savedExplore,type ExploreGroup,type ExploreItem} from '@/lib/explore';
import {answerExplore,exposeExplore,saveExplore,startExploreSession} from '@/lib/explore-learning';
import {recordKhanOpen} from '@/lib/study';
import {VERIFIED_CLIPS,clipTime} from '@/lib/video-clips';

type Filter='all'|ExploreGroup|'saved';
const FILTERS:[Filter,string][]=[['all','All ideas'],['numbers','Everyday numbers'],['algebra','Algebra'],['graphs','Graphs'],['saved','Saved']];
export function ExploreFeed(){
 const {state,ready,update,storageIssue}=useStudy(),params=useSearchParams(),reduced=useReducedMotion();
 const [filter,setFilter]=useState<Filter>('all'),[active,setActive]=useState(EXPLORE_ITEMS[0].id),[still,setStill]=useState(false),[notice,setNotice]=useState('');
 const tourReturn=useRef<{filter:Filter;active:string}|undefined>(undefined);
 const root=useRef<HTMLDivElement>(null),initialized=useRef(false),history=savedExplore(state.explore);
 const items=useMemo(()=>EXPLORE_ITEMS.filter(item=>filter==='all'||(filter==='saved'?history.saved.includes(item.id):item.group===filter)),[filter,history.saved.join('|')]);
 const quiet=still||state.settings.quiet||!!reduced;
 function go(id:string,behavior:ScrollBehavior=quiet?'instant':'smooth'){
  const element=document.getElementById(`idea-${id}`);if(!element)return;setActive(id);element.scrollIntoView({behavior,block:'start'});
 }
 useEffect(()=>{
  if(!ready||initialized.current)return;initialized.current=true;
  const requested=params.get('item'),target=exploreItem(requested)??exploreItem(history.last)??EXPLORE_ITEMS[0];
  if(requested&&!exploreItem(requested))setNotice('That idea is not in this collection. Here is a place to start.');
  if(requested||history.last)requestAnimationFrame(()=>go(target.id,'instant'));
 },[ready]);
 useEffect(()=>{
  if(!ready||!root.current)return;
  const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);const id=(visible[0]?.target as HTMLElement|undefined)?.dataset.idea;if(id)setActive(id);},{rootMargin:'-90px 0px -25% 0px',threshold:[.1,.3,.5,.7]});
  root.current.querySelectorAll('[data-idea]').forEach(el=>observer.observe(el));return()=>observer.disconnect();
 },[ready,items.map(x=>x.id).join('|')]);
 useEffect(()=>{if(!ready)return;const item=exploreItem(active);if(item)update(s=>exposeExplore(s,item,Date.now()));},[active,ready,update]);
 useEffect(()=>{const back=()=>{const id=new URLSearchParams(location.search).get('item');if(exploreItem(id)){setFilter('all');requestAnimationFrame(()=>go(id!,'instant'));}};window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[]);
 function chooseFilter(value:Filter){setFilter(value);setNotice('');const first=EXPLORE_ITEMS.find(x=>value==='all'||(value==='saved'?history.saved.includes(x.id):x.group===value));if(first){setActive(first.id);requestAnimationFrame(()=>go(first.id,'instant'));}}
 async function share(item:ExploreItem){const url=new URL('/explore',location.origin);url.searchParams.set('item',item.id);try{await navigator.clipboard.writeText(url.href);setNotice('Link copied. It opens this idea, without your answers.');}catch{setNotice(url.href);}}
 function startTour(){tourReturn.current={filter,active};setFilter('all');requestAnimationFrame(()=>window.dispatchEvent(new Event('dunlo:explore-tour')));}
 function endTour(){const old=tourReturn.current;if(!old)return;setFilter(old.filter);setActive(old.active);requestAnimationFrame(()=>go(old.active,'instant'));}
 const index=Math.max(0,items.findIndex(i=>i.id===active));
 if(!ready)return <div className="study-loading" role="status">Opening Explore…</div>;
 return <div className="explore-world" ref={root}><ExploreTour onClose={endTour}/>
  <header className="explore-intro"><div><p className="eyebrow">Dunlo Explore</p><h1>Explore something new.</h1><p>Play with an idea. Learn with Khan Academy. Try it yourself.</p></div><div className="explore-intro-links"><img src="/khan-academy.svg" alt="Khan Academy" width="160" height="30"/><Link href={state.activeSession&&!state.activeSession.complete?'/study/session':'/'}>{state.activeSession&&!state.activeSession.complete?'Resume your study session':'Go to Today'} ↗</Link></div></header>
  <div className="explore-toolbar"><div className="explore-filters" role="group" aria-label="Explore topics">{FILTERS.map(([id,label])=><button key={id} type="button" aria-pressed={filter===id} onClick={()=>chooseFilter(id)}>{label}{id==='saved'&&history.saved.length>0?` (${history.saved.length})`:''}</button>)}</div><button type="button" className="explore-motion" aria-pressed={quiet} onClick={()=>setStill(!still)} disabled={state.settings.quiet||!!reduced}>{quiet?'Still view':'Motion on'}</button>{!!items.length&&<nav className="explore-stepper" aria-label="Move between ideas"><button type="button" disabled={index===0} onClick={()=>go(items[index-1].id)}>↑ Previous</button><span>{index+1} / {items.length}</span><button type="button" onClick={startTour}>Quick tour</button><button type="button" disabled={index===items.length-1} onClick={()=>go(items[index+1].id)}>Next ↓</button></nav>}</div>
  {(notice||storageIssue)&&<div className="explore-notice" role="status">{storageIssue||notice}</div>}
  <div className="explore-body"><aside className="explore-index" aria-label="In this collection"><Link className="explore-back" href="/">← Today &amp; your study space</Link><p>IN THIS COLLECTION</p>{items.map((item,i)=><button type="button" key={item.id} aria-current={active===item.id?'step':undefined} onClick={()=>go(item.id)}><span>{String(i+1).padStart(2,'0')}</span><span>{item.title}<small>{item.format==='khan'?'Khan Academy clip':'Play with the idea'}</small></span></button>)}<Link href="/khan">Find a Khan activity ↗</Link></aside>
   <div className="explore-stream">{!items.length?<section className="explore-empty"><Companion size={110} pose="curious" still={quiet}/><h2>Keep an idea for later.</h2><p>Tap Save on any idea. You can find it here whenever you return.</p><button className="explore-action" onClick={()=>chooseFilter('all')}>Explore the collection</button></section>:items.map((item,i)=><IdeaCard key={item.id} item={item} number={i+1} total={items.length} active={active===item.id} still={quiet} onShare={()=>share(item)}/>)}
    {!!items.length&&<section className="explore-ending"><Companion size={90} pose="encourage" still={quiet}/><div><p className="eyebrow">A good place to pause</p><h2>What will you follow next?</h2><p>Your saved ideas are here when you return. Take one into practice, or give an earlier topic a fresh look.</p><div><Link className="explore-action" href="/study">Choose a study session ↗</Link><Link href="/review">Open Review ↗</Link></div></div></section>}
   </div>
  </div>

  <p className="explore-attribution">Dunlo is an independent project. Original Dunlo activities are labelled separately from Khan Academy lessons. All Khan Academy content is available for free at <a href="https://www.khanacademy.org/" target="_blank" rel="noopener noreferrer">khanacademy.org</a>.</p>
 </div>;
}

function IdeaCard({item,number,total,active,still,onShare}:{item:ExploreItem;number:number;total:number;active:boolean;still:boolean;onShare:()=>void}){
 const {state,update}=useStudy(),router=useRouter(),history=savedExplore(state.explore),material=exploreMaterial(item),saved=history.saved.includes(item.id),choice=history.answers[item.id];
 const [starting,setStarting]=useState(false),[videoRequested,setVideoRequested]=useState(false),[practiceOpened,setPracticeOpened]=useState(false);
 const answered=choice!==undefined,clip=VERIFIED_CLIPS[material.id];
 useEffect(()=>{if(!active)setVideoRequested(false);},[active]);
 function launch(force=false){if(!force&&state.activeSession&&!state.activeSession.complete){setStarting(true);return;}update(s=>startExploreSession(s,item,Date.now()));router.push('/study/session');}
 const returnPath=`/explore?item=${item.id}`;
 function openPractice(){setPracticeOpened(true);update(s=>recordKhanOpen(s,{topic:item.topic,skill:item.skill,title:material.practice.title,url:material.practice.url,returnPath,at:Date.now()}));}
 const pending=state.pendingKhan?.returnPath===returnPath?state.pendingKhan:undefined;
 return <article id={`idea-${item.id}`} data-idea={item.id} data-active={active} className={`explore-card format-${item.format}`} aria-labelledby={`title-${item.id}`}>
  <div className="idea-topline"><span>{String(number).padStart(2,'0')} / {String(total).padStart(2,'0')} · {item.format==='khan'?'Khan Academy lesson':'Dunlo interactive → Khan practice'}</span><div><button type="button" onClick={()=>update(s=>saveExplore(s,item,Date.now()))} aria-pressed={saved} aria-label={`${saved?'Unsave':'Save'} ${item.title}`}>{saved?'Saved ✓':'Save'}</button><button type="button" onClick={onShare} aria-label={`Share ${item.title}`}>Share ↗</button></div></div>
  <h2 id={`title-${item.id}`}>{item.title}</h2><p className="idea-intro">{item.intro}</p>
  <div className="idea-main"><div className="idea-visual">
   {item.format==='play'?<ExploreScene item={item} history={history} active={active} still={still} onValue={(key,value)=>update(s=>({...s,explore:{...savedExplore(s.explore),values:{...savedExplore(s.explore).values,[key]:value}},updatedAt:Date.now()}))}/>:<div className="explore-khan-video"><div className="khan-video-label"><img src="/khan-academy.svg" alt="Khan Academy" width="174" height="28"/><span>{clip?`${clipTime(clip.end-clip.start)} segment`:'Original lesson'}</span></div>{active&&videoRequested?<KhanPlayer id={material.id} title={material.title} source={material.source} onOpen={()=>{}} initiallyLoaded/>:<button type="button" className="explore-video-cover" onClick={()=>{setVideoRequested(true);update(s=>({...s,events:[...s.events,{kind:'khan_open' as const,at:Date.now(),detail:`video:${material.id}:${item.id}`}].slice(-1000),updatedAt:Date.now()}));}}><span className="explore-play-icon" aria-hidden="true">▶</span><strong>{clip?.label??material.title}</strong><span>Play Khan Academy explanation</span><small>{clip?`${clipTime(clip.start)}–${clipTime(clip.end)} of the original lesson`:''}</small></button>}<a className="khan-original-link" href={material.source} target="_blank" rel="noopener noreferrer">Full Khan Academy lesson ↗</a></div>}
  </div><div className="idea-thinking"><p className="eyebrow">{answered?'The idea behind it':'A quick thought'}</p><h3>{item.question}</h3><div className="idea-choices" role="group" aria-label={item.question}>{item.choices.map((label,i)=>{
    const correct=answered&&i===item.answer,incorrect=choice===i&&!correct;
    return <button key={label} type="button" aria-pressed={choice===i} data-answer={correct?'yes':incorrect?'no':undefined} onClick={()=>update(s=>answerExplore(s,item,i,Date.now()))}>
     <span className="idea-choice-letter">{String.fromCharCode(65+i)}</span>
     <span className="idea-choice-copy">{label}{(correct||incorrect)&&<small className="idea-choice-result"><span aria-hidden="true">{correct?'✓':'×'}</span>{correct?(choice===i?'Correct':'Correct answer'):'Incorrect'}</small>}</span>
    </button>;
   })}</div>{!answered?<button className="idea-show-why" onClick={()=>update(s=>answerExplore(s,item,-1,Date.now()))}>I don’t know yet · Show me why</button>:<div className="idea-explanation" data-result={choice===item.answer?'correct':choice===-1?'revealed':'incorrect'} role="status"><strong>{choice===item.answer?'That’s the relationship.':choice===-1?'Let’s make it clear.':`Not quite. The correct answer is ${String.fromCharCode(65+item.answer)}.`}</strong><p>{item.explanation}</p></div>}</div></div>
  <div className="idea-continue"><div><img src="/khan-academy.svg" alt="Khan Academy" width="140" height="25"/><p>{item.next}</p></div><div className="idea-continue-actions"><a className="explore-action" href={material.practice.url} target="_blank" rel="noopener noreferrer" onClick={openPractice}>Practise on Khan ↗</a>{item.format!=='khan'&&<a href={material.learning.url} target="_blank" rel="noopener noreferrer">Khan explanation ↗</a>}<button type="button" onClick={()=>launch()}>Try a fresh question →</button></div></div>
  {(practiceOpened||pending)&&pending&&<div className="explore-return"><p>Your place here is saved. Return to this tab after Khan practice.</p><KhanReturnActions activity={pending} onFresh={()=>launch()} onSupport={()=>{update(s=>answerExplore(s,item,-1,Date.now()));}}/></div>}
  {starting&&<div className="explore-session-choice" role="status"><p>You have a study session in progress. Resume it, or start a new session for this idea. Your earlier work stays in your history.</p><Link href="/study/session">Resume saved work ↗</Link><button type="button" className="explore-action" onClick={()=>launch(true)}>Start this idea</button><button type="button" onClick={()=>setStarting(false)}>Stay here</button></div>}
 </article>;
}
