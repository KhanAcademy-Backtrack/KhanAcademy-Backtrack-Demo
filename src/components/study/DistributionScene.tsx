'use client';
import {motion} from 'motion/react';
import {useMotionPolicy} from '@/components/motion/MotionPolicy';
import {DUR,tween as motionTween} from '@/lib/motion-tokens';

export function DistributionScene({collected,emphasizeX,staticMode=false,movedRows}:{collected:boolean;emphasizeX:boolean;staticMode?:boolean;movedRows?:number}){
 const {off}=useMotionPolicy(staticMode);
 const moved=Math.max(0,Math.min(3,movedRows??(collected?3:0)));
 const move=motionTween(off,DUR.base);
 return <svg className="distribution-scene" viewBox="0 0 560 265" role="img" aria-label={collected?'The same three x tiles and twelve units regroup into 3x and 12.':'Three groups each contain one x and four units.'}>
  {[0,1,2].map(row=>{const collected=row<moved;return <g key={row}>
   <motion.rect initial={false} x="18" y={15+row*75} width="390" height="64" rx="12" fill="#f8fcfa" stroke="#d5e4df" animate={{opacity:collected?0:1}} transition={move}/>
   <motion.g initial={false} animate={{x:collected?25+row*94:30,y:collected?45:28+row*75}} transition={move}>
    <rect width="80" height="40" rx="6" fill="#14bf96" strokeWidth={emphasizeX?3:1} stroke="#0a2a66"/>
    <text x="40" y="29" textAnchor="middle" style={{fontFamily:'var(--font-stix),serif',fontSize:29}}>x</text>
   </motion.g>
   {[0,1,2,3].map(col=><motion.g key={col} initial={false} animate={{x:collected?340+col*43:150+col*48,y:collected?25+row*46:28+row*75}} transition={move}>
    <rect width="34" height="38" rx="5" fill="#0a2a66"/><text x="17" y="25" textAnchor="middle" style={{fill:'white',fontSize:20}}>1</text>
   </motion.g>)}
  </g>;})}
  <motion.g initial={false} animate={{opacity:moved===3?1:0,y:moved===3?0:8}} transition={motionTween(off,DUR.fast,DUR.base)}>
   <path d="M25 102v10H293v-10M340 168v10H503v-10" fill="none" stroke="#789e99" strokeWidth="1.5"/>
   <text x="159" y="153" textAnchor="middle" style={{fontFamily:'var(--font-stix),serif',fontSize:32}}>3x</text><text x="422" y="217" textAnchor="middle" style={{fontFamily:'var(--font-stix),serif',fontSize:32}}>12</text>
   <text x="159" y="180" textAnchor="middle" style={{fontSize:15,fill:'#577274'}}>three copies of x</text><text x="422" y="243" textAnchor="middle" style={{fontSize:15,fill:'#577274'}}>three groups of four</text>
  </motion.g>
 </svg>;
}
