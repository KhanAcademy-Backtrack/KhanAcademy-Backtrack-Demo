import {VIDEOS} from '../src/lib/program/khan-video-catalog.ts';
import {TOPIC_LESSONS} from '../src/lib/program/topic-lessons.ts';
import {SUBJECTS} from '../src/lib/program/college-courses.ts';
import {TOPICS,initialRecovery} from '../src/lib/recovery.ts';
import {khanMaterial} from '../src/lib/khan-materials.ts';
import {EXPLORE_ITEMS,exploreMaterial} from '../src/lib/explore.ts';

/** Use the reviewed catalog, including secondary topic videos and recovery resources. */
export function offlineVideos(){
  const videos=new Map();
  const add=video=>{
    if(video?.id&&/^[A-Za-z0-9_-]{11}$/.test(video.id))videos.set(video.id,{id:video.id,title:video.title,source:video.url??video.source});
  };
  Object.values(VIDEOS).forEach(add);
  TOPIC_LESSONS.flatMap(lesson=>lesson.videos).forEach(add);
  SUBJECTS.flatMap(subject=>subject.videos).forEach(add);
  EXPLORE_ITEMS.map(exploreMaterial).forEach(add);
  for(const topic of Object.keys(TOPICS)){
    for(const active of ['goal','terms','expand','distribute','factor','zero','linear'])add(khanMaterial({...initialRecovery(topic),active}));
  }
  return [...videos.values()].sort((a,b)=>a.id.localeCompare(b.id));
}
