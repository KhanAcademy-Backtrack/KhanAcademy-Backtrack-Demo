'use client';
import {useState} from 'react';
import type {MockItem} from '@/lib/mock/types';
import {videoFor} from '@/lib/program/khan-videos';
import {KhanPlayer} from '@/components/product/KhanPlayer';
import {btn,cx} from './ui';

const Play=({className}:{className:string})=><svg viewBox="0 0 24 24" aria-hidden="true" className={className}><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>;

/** The Khan Academy video matched to one question, listed the way Khan lists a lesson's
 *  videos: a play tile beside the title (`compact` makes it one text line for long
 *  lists). Nothing loads from YouTube until the learner presses it. Watching is
 *  activity only; it never counts as an answer or as progress. */
export function RelatedVideo({item,compact=false,className}:{item:MockItem;compact?:boolean;className?:string}){
 const video=videoFor(item),[open,setOpen]=useState(false);
 if(!video)return <p className={cx('text-sm leading-relaxed text-ink-soft',className)}>No Khan Academy video matches this question yet.{!compact&&' The reviewer and the worked solution cover it.'}</p>;
 const label=`Watch the Khan Academy video: ${video.title}`;
 if(open)return <div className={cx('[&_.khan-player]:my-0 [&_iframe]:min-h-0',compact&&'max-w-xl',className)}>
  <KhanPlayer id={video.id} title={video.title} source={video.url} onOpen={()=>{}} initiallyLoaded/>
  <button className={cx(btn.text,'text-sm')} onClick={()=>setOpen(false)}>Close video</button>
 </div>;
 if(compact)return <button aria-label={label} onClick={()=>setOpen(true)} className={cx('group inline-flex min-h-11 items-center gap-2 text-left text-[15px] text-navy focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy',className)}>
  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-mint"><Play className="h-4 w-4"/></span>
  <span><span className="font-semibold underline decoration-green decoration-2 underline-offset-4 group-hover:decoration-navy">{video.title}</span> <span className="text-ink-soft">· Khan Academy video</span></span>
 </button>;
 return <button aria-label={label} onClick={()=>setOpen(true)}
  className={cx('flex min-h-14 w-full items-center gap-3 rounded-lg border-2 border-line bg-white p-2 pr-3 text-left text-navy hover:border-line-strong hover:bg-sky focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy',className)}>
  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-mint"><Play className="h-5 w-5"/></span>
  <span className="min-w-0"><span className="block font-semibold leading-snug">{video.title}</span><span className="block text-sm text-ink-soft">Video · Khan Academy</span></span>
 </button>;
}
