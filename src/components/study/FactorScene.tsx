'use client';
import {motion,useReducedMotion} from 'motion/react';
import {useStudy} from './StudyProvider';
import {MathText} from '@/components/math/Math';
import {quadraticText} from '@/lib/recovery';

/** Four stable pieces assemble; the middle terms then visibly combine. */
export function FactorScene({p,q,join,staticMode=false}:{p:number;q:number;join:boolean;staticMode?:boolean}){
 const reduced=useReducedMotion(),{state}=useStudy(),off=staticMode||!!reduced||state.settings.quiet;
 const u=Math.min(14,240/(10+Math.max(Math.abs(p),Math.abs(q)))),x=10*u,w=q*u,h=p*u,left=(640-x-w)/2,top=32;
 const tween=off?{duration:0}:{duration:.72,ease:[.22,1,.36,1] as [number,number,number,number]};
 if(p<=0||q<=0)return <div className="signed-products"><p>Signed products, without physical lengths</p><div>{['x²',`${q}x`,`${p}x`,String(p*q)].map((term,i)=><motion.span key={i} initial={false} animate={{y:0,opacity:1}}><MathText size="lg">{term}</MathText></motion.span>)}</div><MathText size="lg">{quadraticText(p,q)}</MathText><p>Every part of one bracket still multiplies every part of the other.</p></div>;
 const parts=[{id:'square',dx:0,dy:0,w:x,h:x,label:'x²',fill:'#edf3f8',ink:'#0a2a66'},{id:'right',dx:x,dy:0,w,h:x,label:`${q}x`,fill:'#14bf96',ink:'#0a2a66'},{id:'bottom',dx:0,dy:x,w:x,h,label:`${p}x`,fill:'#a0e6d3',ink:'#0a2a66'},{id:'corner',dx:x,dy:x,w,h,label:String(p*q),fill:'#0a2a66',ink:'#fff'}];
 return <svg className="factor-area assembled-factor" viewBox="0 0 640 360" role="img" aria-label={`Four areas x squared, ${q}x, ${p}x and ${p*q}. The two middle terms combine to ${p+q}x. This area model uses positive x.`}>
  {parts.map(part=><motion.g key={part.id} initial={false} animate={{x:left+part.dx+(join?0:part.dx?26:-26),y:top+part.dy+(join?0:part.dy?24:0)}} transition={tween}>
   <motion.rect initial={false} width={part.w} height={part.h} animate={{width:part.w,height:part.h}} transition={tween} rx={join?0:5} fill={part.fill} stroke="#0a2a66" strokeWidth="1.5"/>
   <motion.text initial={false} animate={{x:part.w/2,y:part.h/2+8}} transition={tween} textAnchor="middle" fill={part.ink} style={{fontFamily:'var(--font-stix),serif',fontSize:26,fill:part.ink}}>{part.label}</motion.text>
  </motion.g>)}
  <text x={left+x/2} y="20" textAnchor="middle">x</text><text x={left+x+w/2} y="20" textAnchor="middle">{q}</text><text x={left-28} y={top+x/2+7} textAnchor="middle">x</text><text x={left-28} y={top+x+h/2+7} textAnchor="middle">{p}</text>
  <g className="factor-symbols" style={{fontFamily:'var(--font-stix),serif',fontSize:28}}>
   <text x="155" y="322" textAnchor="middle">x²</text><text x="203" y="322">+</text>
   <motion.text initial={false} animate={{x:join?299:265,opacity:join?0:1}} transition={tween} y="322" textAnchor="middle">{p}x</motion.text>
   <motion.text initial={false} animate={{opacity:join?0:1}} transition={tween} x="314" y="322" textAnchor="middle">+</motion.text>
   <motion.text initial={false} animate={{x:join?327:365,opacity:join?0:1}} transition={tween} y="322" textAnchor="middle">{q}x</motion.text>
   <motion.rect initial={false} animate={{opacity:join?1:0,scale:join?1:.92}} transition={{...tween,delay:off?0:.45}} x="271" y="293" width="88" height="40" rx="7" fill="#ddf8ee"/>
   <motion.text initial={false} animate={{opacity:join?1:0}} transition={{...tween,delay:off?0:.45}} x="315" y="322" textAnchor="middle">{p+q}x</motion.text>
   <text x="413" y="322">+</text><text x="468" y="322" textAnchor="middle">{p*q}</text>
  </g>
  <text x="320" y="352" textAnchor="middle" style={{fontSize:14,fill:'#607786'}}>{join?`${p}x and ${q}x are like terms. Their coefficients add.`:'Each region is one multiplication. Follow the two middle pieces.'}</text>
 </svg>;
}
