/** Draws a share card on a canvas and returns a PNG blob. Client-side only: the
 *  learner decides where it goes, and it carries only what they chose to share. */
export type CardLine={label:string;value:string;fill?:number};
export async function shareCardPng({title,subtitle,lines,footer}:{title:string;subtitle:string;lines:CardLine[];footer:string}):Promise<Blob>{
 const w=1080,h=1350,c=document.createElement('canvas');c.width=w;c.height=h;
 const g=c.getContext('2d');if(!g)throw Error('Canvas is not available');
 const sans=getComputedStyle(document.body).fontFamily||'Arial';
 g.fillStyle='#0a2a66';g.fillRect(0,0,w,h);
 g.fillStyle='#14bf96';g.fillRect(0,0,w,18);
 // Bookmark buddy mark
 g.save();g.translate(80,90);g.scale(2.2,2.2);g.fillStyle='#14bf96';g.beginPath();g.moveTo(15,10);g.quadraticCurveTo(15,5,20,5);g.lineTo(41,5);g.lineTo(51,15);g.lineTo(51,55);g.quadraticCurveTo(51,59,47,56);g.lineTo(33,48);g.lineTo(19,56);g.quadraticCurveTo(15,59,15,54);g.closePath();g.fill();g.fillStyle='#0a2a66';g.beginPath();g.arc(26,27,2.6,0,7);g.arc(40,27,2.6,0,7);g.fill();g.restore();
 g.fillStyle='#ffffff';g.font=`800 44px ${sans}`;g.fillText('Khanpanion',230,190);
 g.font=`800 76px ${sans}`;wrap(g,title,80,340,920,86);
 g.fillStyle='rgba(255,255,255,.8)';g.font=`500 38px ${sans}`;wrap(g,subtitle,80,470,920,50);
 let y=600;
 for(const l of lines){
  g.fillStyle='rgba(255,255,255,.08)';round(g,80,y,920,130,28);g.fill();
  g.fillStyle='#ffffff';g.font=`700 40px ${sans}`;g.fillText(l.label,120,y+60);
  g.font=`800 44px ${sans}`;const tw=g.measureText(l.value).width;g.fillText(l.value,960-tw,y+60);
  if(l.fill!==undefined){g.fillStyle='rgba(255,255,255,.14)';round(g,120,y+84,840,18,9);g.fill();g.fillStyle='#14bf96';round(g,120,y+84,Math.max(18,840*Math.min(1,l.fill)),18,9);g.fill();}
  y+=150;
 }
 g.fillStyle='rgba(255,255,255,.7)';g.font=`500 32px ${sans}`;g.fillText(footer,80,h-80);
 return await new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(Error('No image')),'image/png'));
}
function round(g:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function wrap(g:CanvasRenderingContext2D,text:string,x:number,y:number,max:number,lh:number){const words=text.split(' ');let line='';for(const w of words){const test=line?line+' '+w:w;if(g.measureText(test).width>max&&line){g.fillText(line,x,y);line=w;y+=lh;}else line=test;}if(line)g.fillText(line,x,y);}

/** Shares through the phone's share sheet when available, otherwise downloads. */
export async function shareOrDownload(blob:Blob,name:string,text:string){
 const file=new File([blob],name,{type:'image/png'});
 const nav=navigator as Navigator&{canShare?:(d:ShareData)=>boolean};
 if(nav.canShare?.({files:[file]})){try{await nav.share({files:[file],text});return 'shared';}catch{return 'cancelled';}}
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return 'downloaded';
}
