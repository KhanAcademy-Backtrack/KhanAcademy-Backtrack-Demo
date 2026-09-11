'use client';
import {motion,useReducedMotion} from 'motion/react';
import {useStudy} from './StudyProvider';

export function DistributionScene({collected,emphasizeX,staticMode=false}:{collected:boolean;emphasizeX:boolean;staticMode?:boolean}){
 const reduced=useReducedMotion(),{state}=useStudy(),off=staticMode||!!reduced||state.settings.quiet;
 const move=off?{duration:0}:{duration:.85,ease:[.22,1,.36,1] as [number,number,number,number]};
 return <svg className="distribution-scene" viewBox="0 0 560 265" role="img" aria-label={collected?'The same three x tiles and twelve units regroup into 3x and 12.':'Three groups each contain one x and four units.'}>
  {[0,1,2].map(row=><g key={row}>
   <motion.rect initial={false} x="18" y={15+row*75} width="390" height="64" rx="12" fill="#f8fcfa" stroke="#d5e4df" animate={{opacity:collected?0:1}} transition={move}/>
   <motion.g initial={false} animate={{x:collected?25+row*94:30,y:collected?45:28+row*75}} transition={move}>
    <motion.rect width="80" height="40" rx="6" fill="#14bf96" animate={{strokeWidth:emphasizeX?3:1,stroke:'#0a2a66'}} transition={{duration:off?0:.2}}/>
    <text x="40" y="29" textAnchor="middle" style={{fontFamily:'var(--font-stix),serif',fontSize:29}}>x</text>
   </motion.g>
   {[0,1,2,3].map(col=><motion.g key={col} initial={false} animate={{x:collected?340+col*43:150+col*48,y:collected?25+row*46:28+row*75}} transition={{...move,delay:off?0:row*.045}}>
    <rect width="34" height="38" rx="5" fill="#0a2a66"/><text x="17" y="25" textAnchor="middle" style={{fill:'white',fontSize:20}}>1</text>
   </motion.g>)}
  </g>)}
  <motion.g initial={false} animate={{opacity:collected?1:0,y:collected?0:8}} transition={{...move,delay:off?0:.6}}>
   <path d="M25 102v10H293v-10M340 168v10H503v-10" fill="none" stroke="#789e99" strokeWidth="1.5"/>
   <text x="159" y="153" textAnchor="middle" style={{fontFamily:'var(--font-stix),serif',fontSize:32}}>3x</text><text x="422" y="217" textAnchor="middle" style={{fontFamily:'var(--font-stix),serif',fontSize:32}}>12</text>
   <text x="159" y="180" textAnchor="middle" style={{fontSize:15,fill:'#577274'}}>three copies of x</text><text x="422" y="243" textAnchor="middle" style={{fontSize:15,fill:'#577274'}}>three groups of four</text>
  </motion.g>
 </svg>;
}
