'use client';
import { useEffect, useRef, useState } from 'react';
import {VERIFIED_CLIPS,videoSource,clipTime,type ClipMode} from '@/lib/video-clips';
import {Headline} from '@/components/k/Headline';

type PlayerProps={id:string;title:string;source:string;onOpen?:()=>void;autoplay?:boolean;fullVideo?:boolean};

/** Only the separately prepared local copy uses saved posters. The public build keeps
 * its immediately visible paused player. A poster never records a video-open event. */
export function KhanPlayer(props:PlayerProps){
  return process.env.NEXT_PUBLIC_OFFLINE_COPY==='1'
    ?<SavedKhanPreview key={props.id} {...props}/>
    :<OnlineKhanPlayer {...props}/>;
}

function SavedKhanPreview({id,title,source}:PlayerProps){
  const [missing,setMissing]=useState((process.env.NEXT_PUBLIC_OFFLINE_MISSING_PREVIEWS??'').split(',').includes(id));
  return <div className="khan-player" data-saved-video={id}>
    <p className="mb-2 text-sm font-bold"><Headline>Khan Academy Video</Headline></p>
    <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-[#0A2A66] text-white">
      {missing?<p className="p-6 text-center">{title}<br/><span className="text-sm">Preview image unavailable</span></p>
        :<img src={`/offline-video-previews/${id}.jpg`} alt={`Saved video preview: ${title}`} width={480} height={360} className="h-full w-full object-contain" onError={()=>setMissing(true)}/>}
    </div>
    <div className="khan-player-caption"><span>{title}</span><a href={source} target="_blank" rel="noopener noreferrer"><Headline>Open on Khan Academy <span aria-hidden="true">↗</span></Headline></a></div>
    <p className="mt-2 text-sm text-ink-soft">{missing?'You can keep using the local study tools.':'Saved preview.'} Video playback needs an internet connection.</p>
  </div>;
}

/** The Khan Academy video itself, shown straight away and paused until the learner presses
 *  play (owner's choice, 7 October 2026: no click-to-load cover anywhere). A focused clip
 *  plays its verified segment first. `onOpen` runs once when the player appears; callers
 *  use it only where showing the player was the learner's own request. */
function OnlineKhanPlayer({id,title,source,onOpen,autoplay=false,fullVideo=false}:PlayerProps){
  const [mode,setMode]=useState<ClipMode>('focus'),[origin,setOrigin]=useState<string>();const clip=fullVideo?undefined:VERIFIED_CLIPS[id];
  const opened=useRef(false);
  useEffect(()=>{setOrigin(window.location.origin);if(!opened.current){opened.current=true;onOpen?.();}},[]);// eslint-disable-line react-hooks/exhaustive-deps
  return <div className="khan-player"><p className="mb-2 text-sm font-bold"><Headline>Khan Academy Video</Headline></p>{origin?<iframe key={mode} src={videoSource(id,origin,mode,clip,autoplay||mode!=='focus')} title={`Khan Academy: ${title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>:<div className="khan-player-wait" aria-hidden="true"/>}<div className="khan-player-caption"><span>{clip&&mode==='focus'?`${clipTime(clip.start)} to ${clipTime(clip.end)} · ${clip.label}`:title}</span><a href={source} target="_blank" rel="noopener noreferrer"><Headline>Open on Khan Academy <span aria-hidden="true">↗</span></Headline></a></div>{clip&&<div className="clip-actions">{mode==='focus'&&<button type="button" onClick={()=>setMode('continue')}><Headline>Continue Watching</Headline></button>}<button type="button" onClick={()=>setMode(mode==='focus'?'full':'focus')}><Headline>{mode==='focus'?'Watch from the Start':'Replay Focused Segment'}</Headline></button></div>}</div>;
}
