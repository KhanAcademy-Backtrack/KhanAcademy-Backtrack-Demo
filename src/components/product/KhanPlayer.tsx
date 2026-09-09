'use client';
import { useState } from 'react';
export function KhanPlayer({id,title,source,onOpen}:{id:string;title:string;source:string;onOpen:()=>void}){
  const [loaded,setLoaded]=useState(false);
  return <div className="khan-player">{loaded?<iframe src={`https://www.youtube-nocookie.com/embed/${id}?controls=1&enablejsapi=1&rel=0&cc_load_policy=1&autoplay=1&origin=${encodeURIComponent(window.location.origin)}`} title={`Khan Academy: ${title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>:<button className="khan-player-cover" onClick={()=>{setLoaded(true);onOpen();}}><span className="play-circle" aria-hidden="true">▶</span><strong>Watch: {title}</strong><span className="fine-print">Khan Academy · Captions available</span></button>}<div className="khan-player-caption"><span>Official Khan Academy video</span><a href={source} target="_blank" rel="noopener noreferrer">{loaded?'Player not loading? Open on Khan ↗':'Open on Khan ↗'}</a></div></div>;
}
