'use client';
import {useState} from 'react';
import type {MockItem} from '@/lib/mock/types';
import {videoFor} from '@/lib/program/khan-videos';
import {KhanPlayer} from '@/components/product/KhanPlayer';
import {cx} from './ui';

const Play=({className}:{className:string})=><svg viewBox="0 0 24 24" aria-hidden="true" className={className}><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>;

/** The Khan Academy video matched to one question. In the Work on this panel the player
 *  is embedded straight away, paused until the learner presses play (owner's choice,
 *  6 October 2026). `compact` lists it as one line for the long results key, where the
 *  player loads only when pressed. Watching is activity only; it never counts as an
 *  answer or as progress. */
export function RelatedVideo({item,compact=false,className}:{item:MockItem;compact?:boolean;className?:string}){
 const video=videoFor(item),[open,setOpen]=useState(false);
 if(!video)return <p className={cx('text-sm leading-relaxed text-ink-soft',className)}>No Khan Academy video matches this question yet.{!compact&&' The reviewer and the worked solution cover it.'}</p>;
 if(!compact||open)return <div className={cx('[&_.khan-player]:my-0 [&_iframe]:min-h-0',compact&&'max-w-xl',className)}>
  <KhanPlayer id={video.id} title={video.title} source={video.url} onOpen={()=>{}} initiallyLoaded autoplay={compact}/>
 </div>;
 return <button aria-label={`Watch the Khan Academy video: ${video.title}`} onClick={()=>setOpen(true)} className={cx('group inline-flex min-h-11 items-center gap-2 text-left text-[15px] text-navy focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy',className)}>
  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-mint"><Play className="h-4 w-4"/></span>
  <span><span className="font-semibold underline decoration-green decoration-2 underline-offset-4 group-hover:decoration-navy">{video.title}</span> <span className="text-ink-soft">· Khan Academy video</span></span>
 </button>;
}
