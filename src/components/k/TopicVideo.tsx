'use client';
import {KhanPlayer} from '@/components/product/KhanPlayer';
import type {KhanVideo} from '@/lib/program/topic-videos';
import {cx} from './ui';

/** The opened player, paused until the learner presses play. */
export function VideoPanel({video,id,className}:{video:KhanVideo;id:string;className?:string}){
 return <div id={id} className={cx('basis-full [&_.khan-player]:my-0 [&_iframe]:min-h-0',className)}><KhanPlayer id={video.id} title={video.title} source={video.url} fullVideo/></div>;
}
