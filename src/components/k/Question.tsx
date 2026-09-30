'use client';
import {useState} from 'react';
import Link from 'next/link';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import type {MockItem} from '@/lib/mock/types';
import {passageById} from '@/lib/mock/forms';
import {misconception} from '@/lib/mock/misconceptions';
import {khanUrl,khanLabel} from '@/lib/program/khan-units';
import {chapterHref} from '@/lib/program/links';
import {DUR,SPRING} from '@/lib/motion-tokens';
import {Oval,btn,cx,KhanLink} from './ui';
import {useFix} from './useFix';
import {t,type Lang} from '@/lib/i18n';

const LETTERS=['A','B','C','D'];

/** A passage in booklet type, for reading items. */
export function PassageView({id,compact=false}:{id:string;compact?:boolean}){
 const p=passageById(id);if(!p)return null;
 return <article aria-label={`Passage: ${p.title}`} className={cx('rounded-2xl bg-mint/60 p-5 font-serif text-[18px] leading-[1.7] text-navy sm:p-6',compact?'max-h-[46vh] overflow-y-auto':'')}>
  <h3 className="mb-3 font-sans text-base font-bold">{p.title} <span className="font-normal text-ink-soft">· {p.kind}</span></h3>
  {p.paragraphs.map((x,i)=><p key={i} className="mb-3 last:mb-0">{x}</p>)}
 </article>;
}

/** What went wrong and where to fix it, for one chosen answer. */
export function WhyPanel({item,chosen,lang='en'}:{item:MockItem;chosen:number|null;lang?:Lang}){
 const fix=useFix();
 const mid=chosen!==null?item.misconceptions[chosen]:null,m=mid?misconception(mid):undefined;
 const rationale=chosen!==null?item.rationales?.[chosen]:undefined;
 const khan=m?.khan??item.khanRef;
 return <div className="rounded-2xl border-2 border-mint-line bg-white p-4 text-[15px] leading-relaxed text-navy">
  {m?<><p className="font-bold">{m.label}</p><p className="mt-1"><span className="font-semibold">{t(lang,'result.why')}: </span>{m.why}</p><p className="mt-2">{m.fix}</p></>
   :rationale&&chosen!==item.answerIndex?<p>{rationale}</p>
   :chosen===null?<p>No answer yet is an honest place to start. The worked steps below show the whole method.</p>:null}
  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
   {m?.recovery&&<button className={btn.text} onClick={()=>fix(m.recovery!.topic,m.recovery!.skill,m.recovery!.routeClue)}>{t(lang,'result.fix')}: find the missing skill</button>}
   <Link className={btn.text} href={chapterHref(m?.chapter??item.reviewerChapter,item.concept)}>Read the reviewer</Link>
   {khan&&<KhanLink href={khanUrl(khan)}>{khanLabel(khan)}</KhanLink>}
  </div>
 </div>;
}

export function Explanation({item}:{item:MockItem}){
 return <div className="rounded-2xl bg-sky p-4 text-[15px] leading-relaxed text-navy sm:p-5">
  <p className="font-bold">Worked solution</p>
  <ol className="mt-2 list-decimal space-y-1 pl-5 font-serif text-[17px]">{item.solutionSteps.map((s,i)=><li key={i}>{s}</li>)}</ol>
  <p className="mt-4 font-bold">Every choice</p>
  <ul className="mt-2 space-y-2">{item.choices.map((c,i)=>{const m=item.misconceptions[i]?misconception(item.misconceptions[i]!):undefined;return <li key={i} className="flex gap-3"><Oval filled={i===item.answerIndex} label={LETTERS[i]} size={30}/><span><span className="font-serif">{c}</span>{' '}<span className="text-ink-soft">{i===item.answerIndex?'Correct.':m?`${m.label}. ${m.why}`:item.rationales?.[i]??''}</span></span></li>;})}</ul>
 </div>;
}

type Props={item:MockItem;number?:number;chosen:number|null;idk:boolean;onChoose:(i:number)=>void;onIdk:()=>void;mode:'practice'|'exam';revealed?:boolean;onReveal?:()=>void;lang?:Lang;showPassage?:boolean};

/** One question. In practice mode the learner checks each answer and can open the
 *  explanation straight away; in the exam hall answers stay hidden until the end. */
export function Question({item,number,chosen,idk,onChoose,onIdk,mode,revealed=false,onReveal,lang='en',showPassage=true}:Props){
 const reduced=useReducedMotion(),[explain,setExplain]=useState(false);
 const locked=mode==='practice'&&revealed;
 const right=revealed&&chosen===item.answerIndex;
 return <div className="text-navy">
  {showPassage&&item.passageId&&<div className="mb-5"><PassageView id={item.passageId}/></div>}
  <p className="font-serif text-[21px] leading-[1.5] sm:text-[23px]">{number!==undefined&&<span className="mr-2 font-sans text-base font-bold text-ink-soft">{number}.</span>}{item.stem}</p>
  <div role="radiogroup" aria-label="Choices" className="mt-5 grid gap-2.5">
   {item.choices.map((c,i)=>{
    const picked=chosen===i,isKey=i===item.answerIndex;
    const state=!revealed?(picked?'picked':'idle'):isKey?'key':picked?'wrong':'dim';
    return <motion.button key={i} role="radio" aria-checked={picked} disabled={locked} onClick={()=>onChoose(i)}
     animate={{opacity:state==='wrong'?.6:state==='dim'?.55:1}} transition={reduced?{duration:0}:{duration:DUR.base}}
     className={cx('group flex min-h-14 w-full items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-green',
      state==='picked'?'border-navy bg-mint':state==='key'?'border-green bg-mint':state==='wrong'?'border-navy/30 bg-white':'border-navy/12 bg-white hover:border-navy/40')}>
     <Oval filled={picked||(revealed&&isKey)} label={LETTERS[i]} size={36}/>
     <span className="flex-1 font-serif text-[19px] leading-snug">{c}</span>
     {revealed&&isKey&&<svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 text-green-deep" aria-label="Correct answer"><motion.path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={reduced?false:{pathLength:0}} animate={{pathLength:1}} transition={reduced?{duration:0}:{duration:DUR.base,delay:.05}}/></svg>}
    </motion.button>;})}
  </div>
  <div className="mt-4 flex flex-wrap items-center gap-3">
   <button aria-pressed={idk} disabled={locked} onClick={onIdk} className={cx('min-h-11 rounded-full border-2 px-4 text-[15px] font-semibold transition-colors',idk?'border-navy bg-navy text-white':'border-navy/15 text-navy hover:border-navy/40')}>{t(lang,'mock.idk')}</button>
   {mode==='practice'&&!revealed&&<button className={btn.primary} disabled={chosen===null&&!idk} onClick={onReveal}>{t(lang,'mock.check')}</button>}
  </div>
  <AnimatePresence initial={false}>{mode==='practice'&&revealed&&<motion.div key="fb" initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={reduced?{duration:0}:SPRING} className="mt-5 space-y-3" aria-live="polite">
   <p className="text-lg font-bold">{right?'Correct.':idk?'Good call being honest. Here is how it works.':'Not this time. Here is why.'}</p>
   {!right&&<WhyPanel item={item} chosen={chosen} lang={lang}/>}
   <button className={btn.ghost} aria-expanded={explain} onClick={()=>setExplain(!explain)}>{explain?t(lang,'mock.hideExplain'):t(lang,'mock.explain')}</button>
   {explain&&<Explanation item={item}/>}
  </motion.div>}</AnimatePresence>
 </div>;
}
