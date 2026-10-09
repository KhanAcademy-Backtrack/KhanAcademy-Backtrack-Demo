'use client';
import { useEffect, useRef, useState } from 'react';
import {VERIFIED_CLIPS,videoSource,clipTime,type ClipMode} from '@/lib/video-clips';
import {Headline} from '@/components/k/Headline';

/** The Khan Academy video itself, shown straight away and paused until the learner presses
 *  play (owner's choice, 7 October 2026: no click-to-load cover anywhere). A focused clip
 *  plays its verified segment first. `onOpen` runs once when the player appears; callers
 *  use it only where showing the player was the learner's own request. */
export function KhanPlayer({id,title,source,onOpen,autoplay=false,fullVideo=false}:{id:string;title:string;source:string;onOpen?:()=>void;autoplay?:boolean;fullVideo?:boolean}){
  const [mode,setMode]=useState<ClipMode>('focus'),[origin,setOrigin]=useState<string>();const clip=fullVideo?undefined:VERIFIED_CLIPS[id];
  const opened=useRef(false);
  useEffect(()=>{setOrigin(window.location.origin);if(!opened.current){opened.current=true;onOpen?.();}},[]);// eslint-disable-line react-hooks/exhaustive-deps
  return <div className="khan-player"><p className="mb-2 text-sm font-bold"><Headline>Khan Academy Video</Headline></p>{origin?<iframe key={mode} src={videoSource(id,origin,mode,clip,autoplay||mode!=='focus')} title={`Khan Academy: ${title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>:<div className="khan-player-wait" aria-hidden="true"/>}<div className="khan-player-caption"><span>{clip&&mode==='focus'?`${clipTime(clip.start)} to ${clipTime(clip.end)} · ${clip.label}`:title}</span><a href={source} target="_blank" rel="noopener noreferrer"><Headline>Open on Khan Academy <span aria-hidden="true">↗</span></Headline></a></div>{clip&&<div className="clip-actions">{mode==='focus'&&<button type="button" onClick={()=>setMode('continue')}><Headline>Continue Watching</Headline></button>}<button type="button" onClick={()=>setMode(mode==='focus'?'full':'focus')}><Headline>{mode==='focus'?'Watch from the Start':'Replay Focused Segment'}</Headline></button></div>}</div>;
}
