'use client';
import { useEffect, useRef, useState } from 'react';
import {VERIFIED_CLIPS,videoSource,clipTime,type ClipMode} from '@/lib/video-clips';

/** The Khan Academy video itself, shown straight away and paused until the learner presses
 *  play (owner's choice, 7 October 2026: no click-to-load cover anywhere). A focused clip
 *  plays its verified segment first. `onOpen` runs once when the player appears; callers
 *  use it only where showing the player was the learner's own request. */
export function KhanPlayer({id,title,source,onOpen,autoplay=false}:{id:string;title:string;source:string;onOpen?:()=>void;autoplay?:boolean}){
  const [mode,setMode]=useState<ClipMode>('focus'),[origin,setOrigin]=useState<string>();const clip=VERIFIED_CLIPS[id];
  const opened=useRef(false);
  useEffect(()=>{setOrigin(window.location.origin);if(!opened.current){opened.current=true;onOpen?.();}},[]);// eslint-disable-line react-hooks/exhaustive-deps
  return <div className="khan-player">{origin?<iframe key={mode} src={videoSource(id,origin,mode,clip,autoplay||mode!=='focus')} title={`Khan Academy: ${title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>:<div className="khan-player-wait" aria-hidden="true"/>}<div className="khan-player-caption"><span>{clip&&mode==='focus'?`${clipTime(clip.start)} to ${clipTime(clip.end)} · ${clip.label}`:title}</span><a href={source} target="_blank" rel="noopener noreferrer">Original lesson ↗</a></div>{clip&&<div className="clip-actions">{mode==='focus'&&<button type="button" onClick={()=>setMode('continue')}>Continue watching</button>}<button type="button" onClick={()=>setMode(mode==='focus'?'full':'focus')}>{mode==='focus'?'Watch from the start':'Replay focused segment'}</button></div>}</div>;
}
