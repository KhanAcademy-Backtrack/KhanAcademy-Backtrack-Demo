'use client';
import type {MockItem} from '@/lib/mock/types';
import {videoFor} from '@/lib/program/khan-videos';
import {KhanPlayer} from '@/components/product/KhanPlayer';
import {cx} from './ui';

/** The Khan Academy video matched to one question, shown as the player itself and paused
 *  until the learner presses play (owner's choice, 7 October 2026: no click-to-load row or
 *  cover). `compact` keeps it narrower in the long results key. Watching is activity only;
 *  it never counts as an answer or as progress. */
export function RelatedVideo({item,compact=false,className}:{item:MockItem;compact?:boolean;className?:string}){
 const video=videoFor(item);
 if(!video)return <p className={cx('text-sm leading-relaxed text-ink-soft',className)}>No Khan Academy video matches this question yet.{!compact&&' The reviewer and the worked solution cover it.'}</p>;
 return <div className={cx('[&_.khan-player]:my-0 [&_iframe]:min-h-0',compact&&'max-w-xl',className)}>
  <KhanPlayer id={video.id} title={video.title} source={video.url}/>
 </div>;
}
