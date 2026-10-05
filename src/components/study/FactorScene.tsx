'use client';
import {useState} from 'react';
import {motion} from 'motion/react';
import {useMotionPolicy} from '@/components/motion/MotionPolicy';
import {DUR,tween as motionTween} from '@/lib/motion-tokens';
import {MathText} from '@/components/math/Math';
import {texQuadratic} from '@/lib/recovery';

/** Four stable pieces assemble; the middle terms then visibly combine. */
export function FactorScene({p,q,join,staticMode=false,focus='all'}:{p:number;q:number;join:boolean;staticMode?:boolean;focus?:'edges'|'products'|'middle'|'all'}){
 const {off}=useMotionPolicy(staticMode),[product,setProduct]=useState(0);
 const u=Math.min(14,240/(10+Math.max(Math.abs(p),Math.abs(q)))),x=10*u,w=q*u,h=p*u,left=(640-x-w)/2,top=32;
 const tween=motionTween(off,DUR.base);
 if(p<=0||q<=0)return <div className="signed-products"><p>Signed products, without physical lengths</p><div>{['x²',`${q}x`,`${p}x`,String(p*q)].map((term,i)=><motion.span key={i} initial={false} animate={{y:0,opacity:1}}><MathText size="lg">{term}</MathText></motion.span>)}</div><MathText size="lg">{texQuadratic(p,q)}</MathText><p>Every part of one bracket still multiplies every part of the other.</p></div>;
 const parts=[{id:'square',dx:0,dy:0,w:x,h:x,label:'x²',fill:'#edf3f8',ink:'#0a2a66'},{id:'right',dx:x,dy:0,w,h:x,label:`${q}x`,fill:'#14bf96',ink:'#0a2a66'},{id:'bottom',dx:0,dy:x,w:x,h,label:`${p}x`,fill:'#a0e6d3',ink:'#0a2a66'},{id:'corner',dx:x,dy:x,w,h,label:String(p*q),fill:'#0a2a66',ink:'#fff'}];
 return <div className="factor-lesson"><svg className="factor-area assembled-factor" viewBox="0 0 640 360" role="img" aria-label={`Four areas x squared, ${q}x, ${p}x and ${p*q}. The two middle terms combine to ${p+q}x. This area model uses positive x.`}>
  {parts.map((part,i)=><motion.g key={part.id} initial={false} animate={{x:left+part.dx+(join?0:part.dx?26:-26),y:top+part.dy+(join?0:part.dy?24:0),opacity:focus==='products'&&i!==product?.65:focus==='middle'&&(i===0||i===3)?.65:1}} transition={tween}>
   <rect width={part.w} height={part.h} rx={join?0:5} fill={part.fill} stroke="#0a2a66" strokeWidth={focus==='products'&&i===product||focus==='middle'&&(i===1||i===2)?3:1.5}/>
   <text x={part.w/2} y={part.h/2+8} textAnchor="middle" fill={part.ink} style={{fontFamily:'var(--font-stix),serif',fontSize:26,fill:part.ink}}>{part.label}</text>
  </motion.g>)}
  <text x={left+x/2} y="20" textAnchor="middle">x</text><text x={left+x+w/2} y="20" textAnchor="middle">{q}</text><text x={left-28} y={top+x/2+7} textAnchor="middle">x</text><text x={left-28} y={top+x+h/2+7} textAnchor="middle">{p}</text>
  <g className="factor-symbols" style={{fontFamily:'var(--font-stix),serif',fontSize:28}}>
   <text x="155" y="322" textAnchor="middle">x²</text><text x="203" y="322">+</text>
   <motion.g initial={false} animate={{x:join?34:0,opacity:join?0:1}} transition={tween}><text x="265" y="322" textAnchor="middle">{p}x</text></motion.g>
   <motion.text initial={false} animate={{opacity:join?0:1}} transition={tween} x="314" y="322" textAnchor="middle">+</motion.text>
   <motion.g initial={false} animate={{x:join?-38:0,opacity:join?0:1}} transition={tween}><text x="365" y="322" textAnchor="middle">{q}x</text></motion.g>
   <motion.rect initial={false} animate={{opacity:join?1:0,scale:join?1:.92}} transition={motionTween(off,DUR.fast,DUR.base)} x="271" y="293" width="88" height="40" rx="7" fill="#ddf8ee"/>
   <motion.text initial={false} animate={{opacity:join?1:0}} transition={{...tween,delay:off?0:.45}} x="315" y="322" textAnchor="middle">{p+q}x</motion.text>
   <text x="413" y="322">+</text><text x="468" y="322" textAnchor="middle">{p*q}</text>
  </g>
  <text x="320" y="352" textAnchor="middle" style={{fontSize:14,fill:'#607786'}}>{join?`${p}x and ${q}x are like terms. Their coefficients add.`:'Each region is one multiplication. Follow the two middle pieces.'}</text>
 </svg>{focus==='products'&&<div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mint p-4"><div aria-live="polite"><MathText size="md">{`${product<2?'x':p} \\times ${product===0||product===2?'x':q} = ${parts[product].label}`}</MathText><p className="text-sm text-ink-soft">Product {product+1} of 4. Match the highlighted area to its two edges.</p></div><button type="button" className="min-h-11 rounded-full bg-navy px-4 font-bold text-white" onClick={()=>setProduct(n=>(n+1)%4)}>Next product</button></div>}</div>;
}
