'use client';
import {KhanPlayer} from '@/components/product/KhanPlayer';
import type {KhanVideo} from '@/lib/program/topic-videos';
import {cx} from './ui';

/** The opened player, paused until the learner presses play. */
export function VideoPanel({video,id,className,focused=false}:{video:KhanVideo;id:string;className?:string;focused?:boolean}){
 return <div id={id} className={cx('basis-full scroll-mt-28 [&_.khan-player]:my-0 [&_iframe]:min-h-0',className)}><KhanPlayer id={video.id} title={video.title} source={video.url} fullVideo={!focused}/></div>;
}
