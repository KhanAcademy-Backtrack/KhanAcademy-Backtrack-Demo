'use client';
import {Headline} from './Headline';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import Link from 'next/link';
import {AnimatePresence,animate,motion,useMotionValue} from 'motion/react';
import {useQuietMotion} from './useQuietMotion';
import type {MockItem} from '@/lib/mock/types';
import {passageById} from '@/lib/mock/forms';
import {misconception} from '@/lib/mock/misconceptions';
import {khanUrl,khanLabel} from '@/lib/program/khan-units';
import {chapterHref} from '@/lib/program/links';
import {DUR,SPRING} from '@/lib/motion-tokens';
import {btn,cx,KhanLink} from './ui';
import {useFix} from './useFix';
import {t,type Lang} from '@/lib/i18n';
import {Rich} from '@/components/math/Math';
import {speakText} from '@/lib/notation';

const LETTERS=['A','B','C','D'];

/** A passage in booklet type, for reading items. */
export function PassageView({id,compact=false}:{id:string;compact?:boolean}){
 const p=passageById(id);if(!p)return null;
 return <article aria-label={`Passage: ${p.title}`} className={cx('rounded-xl bg-sky/70 p-5 font-serif text-[18px] leading-[1.7] text-navy sm:p-6',compact?'max-h-[46vh] overflow-y-auto':'')}>
  <h3 className="mb-3 font-sans text-base font-bold"><Headline>{p.title} <span className="font-normal text-ink-soft">· {p.kind}</span></Headline></h3>
  {p.paragraphs.map((x,i)=><p key={i} className="mb-3 last:mb-0">{x}</p>)}
 </article>;
}

/** Where to go next for one chosen answer: the missing skill, the reviewer and a Khan unit.
 *  `stacked` lists them one per line for a narrow side panel. */
export function FixLinks({item,chosen,lang='en',stacked=false,className}:{item:MockItem;chosen:number|null;lang?:Lang;stacked?:boolean;className?:string}){
 const fix=useFix();
 const mid=chosen!==null?item.misconceptions[chosen]:null,m=mid?misconception(mid):undefined;
 const khan=m?.khan??item.khanRef;
 return <div className={cx(stacked?'grid justify-items-start gap-1':'flex flex-wrap gap-x-5 gap-y-1',className)}>
  {m?.recovery&&<button className={btn.text} onClick={()=>fix(m.recovery!.topic,m.recovery!.skill,m.recovery!.routeClue)}><Headline>{t(lang,'result.fix')}: find the missing skill</Headline></button>}
  <Link className={btn.text} href={chapterHref(m?.chapter??item.reviewerChapter,item.concept)}><Headline>Read the reviewer</Headline></Link>
  {khan&&<KhanLink href={khanUrl(khan)}>{khanLabel(khan)}</KhanLink>}
 </div>;
}

/** What went wrong and where to fix it, for one chosen answer. With `linksBeside`, the
 *  page shows the links in its own Work on this panel instead. */
export function WhyPanel({item,chosen,lang='en',linksBeside=false,rationaleFirst=false}:{item:MockItem;chosen:number|null;lang?:Lang;linksBeside?:boolean;rationaleFirst?:boolean}){
 const mid=chosen!==null?item.misconceptions[chosen]:null,m=mid?misconception(mid):undefined;
 const rationale=chosen!==null?item.rationales?.[chosen]:undefined;
 return <div className="rounded-xl border border-line bg-white p-4 text-[15px] leading-relaxed text-navy">
  {rationaleFirst&&rationale&&chosen!==item.answerIndex?<p><Rich>{rationale}</Rich></p>:m?<><p className="font-bold"><Rich>{m.label}</Rich></p><p className="mt-1"><span className="font-semibold">{t(lang,'result.why')}: </span><Rich>{m.why}</Rich></p><p className="mt-2"><Rich>{m.fix}</Rich></p></>
   :rationale&&chosen!==item.answerIndex?<p><Rich>{rationale}</Rich></p>
   :chosen===null?<p>No answer yet is an honest place to start. The worked steps below show the whole method.</p>:null}
  {!linksBeside&&<FixLinks item={item} chosen={chosen} lang={lang} className="mt-3"/>}
 </div>;
}

/** `rationaleFirst` (lesson quizzes) shows the item's own rationale for every choice: their misconception
 * ids may coincide with unrelated entries in the shared registry. */
export function Explanation({item,rationaleFirst=false}:{item:MockItem;rationaleFirst?:boolean}){
 return <div className="rounded-xl bg-sky/70 p-4 text-[15px] leading-relaxed text-navy sm:p-5">
  <p className="font-bold">Worked solution</p>
  <ol className="mt-2 list-decimal space-y-1 pl-5 font-serif text-[17px]">{item.solutionSteps.map((s,i)=><li key={i}><Rich>{s}</Rich></li>)}</ol>
  <p className="mt-4 font-bold">Every choice</p>
  <ul className="mt-2 space-y-2">{item.choices.map((c,i)=>{const own=rationaleFirst?item.rationales?.[i]:undefined,m=own===undefined&&item.misconceptions[i]?misconception(item.misconceptions[i]!):undefined;return <li key={i} className="flex gap-3"><span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-md font-sans text-sm font-bold',i===item.answerIndex?'bg-green':'bg-white')}>{LETTERS[i]}</span><span><span className="font-serif"><Rich>{c}</Rich></span>{' '}<span className="text-ink-soft"><Rich>{own??(i===item.answerIndex?'Correct.':m?`${m.label}. ${m.why}`:item.rationales?.[i]??'')}</Rich></span></span></li>;})}</ul>
 </div>;
}

type Props={item:MockItem;number?:number;chosen:number|null;idk:boolean;onChoose:(i:number)=>void;onIdk:()=>void;mode:'practice'|'exam';revealed?:boolean;onReveal?:()=>void;lang?:Lang;showPassage?:boolean;spacious?:boolean;keys?:boolean;actions?:ReactNode;checkActions?:ReactNode;linksBeside?:boolean;rationaleFirst?:boolean;panel?:ReactNode};

/** Typing in a field or holding a modifier must never pick an answer. */
const typing=(e:KeyboardEvent)=>{const el=e.target as HTMLElement|null;return e.ctrlKey||e.metaKey||e.altKey||!!el?.closest('input,textarea,select,[contenteditable="true"]');};

/** One question. In practice mode the learner checks each answer and can open the
 *  explanation straight away; in the exam hall answers stay hidden until the end.
 *  The small label above the choices becomes the feedback line after Check, so the
 *  page does not jump. With `keys`, 1–4 or A–D choose an answer. `actions` (such as
 *  Back and Next) sit at the end of the answer row in the exam hall, and beside Show
 *  explanation once a practice answer is checked; `checkActions` sit just before Check.
 *  `panel` follows the feedback once a practice answer is checked, right or wrong. */
export function Question({item,number,chosen,idk,onChoose,onIdk,mode,revealed=false,onReveal,lang='en',showPassage=true,spacious=false,keys=false,actions,checkActions,linksBeside=false,rationaleFirst=false,panel}:Props){
 const reduced=useQuietMotion(),[explain,setExplain]=useState(false);
 const locked=mode==='practice'&&revealed;
 const right=revealed&&chosen===item.answerIndex;
 const settle=useMotionValue(1),handled=useRef('');
 useEffect(()=>{if(!right||handled.current===item.id){if(reduced)settle.set(1);return;}handled.current=item.id;if(reduced)return;settle.set(.985);const run=animate(settle,1,SPRING);return()=>run.stop();},[right,item.id,reduced,settle]);
 const choose=useRef(onChoose);choose.current=onChoose;
 useEffect(()=>{if(!keys||locked)return;const key=(e:KeyboardEvent)=>{if(typing(e))return;const k=e.key.toLowerCase(),i='1234'.includes(k)&&k.length===1?Number(k)-1:'abcd'.includes(k)&&k.length===1?k.charCodeAt(0)-97:-1;if(i<0||i>=item.choices.length)return;e.preventDefault();choose.current(i);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[keys,locked,item.choices.length]);
 const feedback=mode==='practice'&&revealed?(right?'Correct.':idk?'Good call being honest. Here is how it works.':'Not this time. Here is why.'):null;
 return <div className="text-navy">
  {showPassage&&item.passageId&&<div className="mb-5"><PassageView id={item.passageId}/></div>}
  <div className={cx(spacious&&'flex min-h-24 items-center py-2 sm:min-h-28')}><p className={cx('font-serif leading-[1.5]',spacious?'max-w-3xl text-[24px] sm:text-[28px]':'text-[21px] sm:text-[23px]')}>{number!==undefined&&<span className="mr-2 font-sans text-base font-bold text-ink-soft">{number}.</span>}<Rich>{item.stem}</Rich></p></div>
  <p aria-live="polite" className={cx('mb-3 mt-5 text-sm font-semibold',feedback?(right?'text-green-deep':idk?'text-navy':'text-red-700'):'text-ink-soft')}>{feedback??<>Choose an answer{keys&&<span className="hidden font-normal sm:inline"> · or press 1–{item.choices.length}</span>}</>}</p>
  <div role="radiogroup" aria-label="Choices" className={cx('grid gap-3',spacious&&'sm:grid-cols-2')}>
   {item.choices.map((c,i)=>{
    const picked=chosen===i,isKey=i===item.answerIndex;
    const state=!revealed?(picked?'picked':'idle'):isKey?'key':picked?'wrong':'dim';
    return <motion.button key={i} role="radio" aria-label={speakText(c)} aria-checked={picked} aria-keyshortcuts={keys?`${i+1} ${LETTERS[i]}`:undefined} disabled={locked} onClick={()=>onChoose(i)} style={{scale:i===item.answerIndex?settle:1}}
     animate={{opacity:state==='dim'?.5:1}} transition={reduced?{duration:0}:{duration:DUR.base}}
     className={cx('group flex w-full items-center gap-4 rounded-lg border-2 px-4 py-3 text-left text-navy focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-green',spacious?'min-h-16 sm:min-h-20':'min-h-14',
      state==='picked'?'border-navy bg-mint':state==='key'?'border-green bg-mint':state==='wrong'?'border-red-700 bg-red-50':'border-line bg-white hover:border-line-strong')}>
     <span aria-hidden="true" className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-md font-sans text-sm font-bold',state==='wrong'?'bg-red-700 text-white':state==='picked'||state==='key'?'bg-navy text-white':'bg-sky text-ink-soft')}>{LETTERS[i]}</span>
     <span className="flex-1 font-serif text-[19px] leading-snug"><Rich>{c}</Rich></span>
     {state==='key'&&<svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-green-deep" aria-label="Correct answer"><motion.path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={reduced||!right?false:{pathLength:0}} animate={{pathLength:1}} transition={reduced?{duration:0}:{duration:DUR.base}}/></svg>}
     {state==='wrong'&&<svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-red-700" aria-label="Your incorrect answer"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"/></svg>}
    </motion.button>;})}
  </div>
  <div className="mt-4 flex flex-wrap items-center gap-3">
   <button aria-pressed={idk} disabled={locked} onClick={onIdk} className={cx('min-h-11 rounded-lg border-2 px-4 text-[15px] font-semibold',idk?'border-navy bg-navy text-white':'border-line bg-white text-navy hover:border-line-strong')}>{t(lang,'mock.idk')}</button>
   {mode==='practice'&&!revealed&&<div className="ml-auto flex flex-wrap items-center gap-3">{checkActions}<button className={btn.primary} disabled={chosen===null&&!idk} onClick={onReveal}><Headline>{t(lang,'mock.check')}</Headline></button></div>}
   {mode==='exam'&&actions&&<div className="ml-auto flex flex-wrap items-center gap-3">{actions}</div>}
  </div>
  <AnimatePresence initial={false}>{mode==='practice'&&revealed&&<motion.div key="fb" initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={reduced?{duration:0}:SPRING} className="mt-5 space-y-3">
   {!right&&<WhyPanel item={item} chosen={chosen} lang={lang} linksBeside={linksBeside} rationaleFirst={rationaleFirst}/>}
   {panel}
   <div className="flex flex-wrap items-center gap-3">
    <button className={btn.ghost} aria-expanded={explain} onClick={()=>setExplain(!explain)}><Headline>{explain?t(lang,'mock.hideExplain'):t(lang,'mock.explain')}</Headline></button>
    {actions&&<div className="ml-auto flex flex-wrap items-center gap-3">{actions}</div>}
   </div>
   {explain&&<Explanation item={item} rationaleFirst={rationaleFirst}/>}
  </motion.div>}</AnimatePresence>
 </div>;
}
