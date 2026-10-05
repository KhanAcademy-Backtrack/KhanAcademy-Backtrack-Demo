'use client';
import {AnimatePresence,motion} from 'motion/react';
import {useMotionPolicy} from '@/components/motion/MotionPolicy';
import {DUR,tween as motionTween} from '@/lib/motion-tokens';
import {mixture} from '@/lib/visual-maths';
import {Rich} from '@/components/math/Math';
export function RatioMixture({a,b,label,staticMode=false}:{a:number;b:number;label:string;staticMode?:boolean}){
 const {off}=useMotionPolicy(staticMode),m=mixture(a,b);
 return <div className="mixture animated-mixture"><strong>{label}: {a} : {b}</strong><div className="mixture-parts" aria-label={`${a} round parts and ${b} square parts`}><AnimatePresence initial={false}>{Array.from({length:a},(_,i)=><motion.i key={`a${i}`} initial={off?false:{opacity:0,scale:.9}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.9}} transition={motionTween(off)}>●</motion.i>)}{Array.from({length:b},(_,i)=><motion.b layout key={`b${i}`} initial={off?false:{opacity:0,scale:.4,y:-8}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.3}} transition={motionTween(off)}>■</motion.b>)}</AnimatePresence></div><svg className="share-strip" viewBox="0 0 480 18" role="img" aria-label={`The round parts make ${a} out of ${m.total} parts.`}><rect width="480" height="12" rx="6" fill="#e2ebf4"/><motion.rect initial={false} width="480" style={{originX:0,originY:0}} animate={{scaleX:m.share}} transition={motionTween(off)} height="12" rx="6" fill="#14bf96"/></svg><p>First-part share: <Rich>{`$\\frac{${a}}{${m.total}}${a===4&&b===6?' = \\frac{2}{5}':''}$`}</Rich> · Total {m.total}</p></div>;
}
export function RatioNumberLines({scale,staticMode=false}:{scale:number;staticMode?:boolean}){const {off}=useMotionPolicy(staticMode);return <svg className="ratio-number-lines" viewBox="0 0 560 140" role="img" aria-label={`The same multiplier ${scale} gives ${2*scale} round parts and ${3*scale} square parts.`}>
 {[0,1].map(row=><g key={row}><path d={`M45 ${35+row*65}H515`} stroke="#0a2a66"/>{[0,1,2,3,4,5,6].map(k=><g key={k}><path d={`M${45+k*76} ${30+row*65}v10`} stroke="#0a2a66"/><text x={45+k*76} y={22+row*65} textAnchor="middle">{k*(row?3:2)}</text></g>)}</g>)}
 <motion.g initial={false} animate={{x:45+scale*76}} transition={motionTween(off)}><path d="M0 35V100" stroke="#649d91" strokeDasharray="4 4"/><circle cy="35" r="7" fill="#14bf96" stroke="#0a2a66"/><rect x="-6" y="94" width="12" height="12" rx="2" fill="#0a2a66"/></motion.g><text x="280" y="134" textAnchor="middle" style={{fontSize:14}}>Both amounts use the same multiplier.</text>
 </svg>;}
