export type VideoClip={start:number;end:number;label:string};
export type ClipMode='focus'|'continue'|'full';
export const VERIFIED_CLIPS:Record<string,VideoClip>={
 D3a8NnpQ2vU:{start:142,end:236,label:'Match the sum and product'},
 oOTFGdjhqqM:{start:61,end:171,label:'Find all four products'},
 CLWpkv6ccpA:{start:69,end:136,label:'Combine the x terms'},
 Jp25LHI9wII:{start:51,end:139,label:'Multiply every term inside'}
};
export function videoSource(id:string,origin:string,mode:ClipMode='focus',clip?:VideoClip):string{
 if(!/^[A-Za-z0-9_-]{11}$/.test(id))throw Error('Invalid video ID');
 const p=new URLSearchParams({controls:'1',enablejsapi:'1',rel:'0',cc_load_policy:'1',autoplay:'1',origin});
 if(clip){if(!Number.isInteger(clip.start)||!Number.isInteger(clip.end)||clip.start<0||clip.end<=clip.start)throw Error('Invalid clip range');p.set('start',String(mode==='continue'?clip.end:mode==='full'?0:clip.start));if(mode==='focus')p.set('end',String(clip.end));}
 return `https://www.youtube-nocookie.com/embed/${id}?${p}`;
}
export function clipTime(seconds:number){return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
