'use client';
import {KhanPlayer} from '@/components/product/KhanPlayer';
import type {KhanVideo} from '@/lib/program/topic-videos';
import {cx} from './ui';

/** The small "Video" control beside a topic, in the manner of a Khan lesson list: a play mark
 *  and the word, opening that topic's Khan video in place. One topic opens at a time, so a long
 *  list never loads more than one player. Opening it is activity only, never evidence. */
export function VideoToggle({open,onClick,topic,controls}:{open:boolean;onClick:()=>void;topic:string;controls:string}){
 return <button type="button" aria-expanded={open} aria-controls={controls} aria-label={`${open?'Hide':'Watch'} the Khan Academy video for ${topic}`} onClick={onClick}
  className={cx('inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-bold focus-visible:outline-3 focus-visible:outline-navy',open?'bg-navy text-white':'bg-mint text-navy hover:bg-green')}>
  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4"><circle cx="8" cy="8" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M6.4 5.2v5.6L11 8z" fill="currentColor"/></svg>
  {open?'Hide':'Video'}
 </button>;
}

/** The opened player, paused until the learner presses play. */
export function VideoPanel({video,id,className}:{video:KhanVideo;id:string;className?:string}){
 return <div id={id} className={cx('basis-full [&_.khan-player]:my-0 [&_iframe]:min-h-0',className)}><KhanPlayer id={video.id} title={video.title} source={video.url}/></div>;
}
