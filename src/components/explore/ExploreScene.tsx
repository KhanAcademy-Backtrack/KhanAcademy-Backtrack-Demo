'use client';
import {motion,useReducedMotion} from 'motion/react';
import {Companion} from '@/components/study/Companion';
import {useStudy} from '@/components/study/StudyProvider';
import {exploreValue,type ExploreItem,type ExploreState} from '@/lib/explore';

export function ExploreScene({item,history,onValue,active,still}:{item:ExploreItem;history:ExploreState;onValue:(key:string,value:number)=>void;active:boolean;still:boolean}){
 const {state}=useStudy(),reduced=useReducedMotion(),off=still||state.settings.quiet||!!reduced||!active;
 const defaults:Record<string,[number,number,number,string]>={mixture:[1,1,3,'Batch size'],fractions:[1,1,4,'Pieces in each half'],distribution:[0,0,1,'Open the groups'],factors:[0,0,1,'Separate the pieces'],roots:[0,-6,1,'Value of x'],graph:[0,0,5,'Time in minutes']};
 const [initial,min,max,label]=defaults[item.scene!],value=exploreValue(history,item.id,initial,min,max),transition={duration:off?0:.45,ease:[.22,1,.36,1] as [number,number,number,number]};
 const change=(n:number)=>onValue(item.id,n);
 const isToggle=item.scene==='distribution'||item.scene==='factors';
 return <div className={`explore-scene scene-${item.scene}`}>
  <div className="explore-buddy"><Companion size={58} pose={value!==initial?'aha':'curious'} still={off}/><span>{item.scene==='roots'?'Find where a factor is zero.':isToggle?'The pieces keep their meaning.':'Change it. Watch what stays true.'}</span></div>
  {item.scene==='mixture'&&<svg viewBox="0 0 540 270" role="img" aria-label={`The first recipe has 2 parts syrup and 3 parts water. The bigger batch has ${2*value} and ${3*value} parts. Both are two fifths syrup. The glasses show proportions, not total volume.`}>
   {[1,value].map((scale,i)=><g key={i} transform={`translate(${i?310:55},30)`}><text x="78" y="0" textAnchor="middle">{i?'Your batch':'Original recipe'}</text><path d="M5 28L20 205H136L151 28" fill="#effaf7" stroke="#0a2a66" strokeWidth="3"/><motion.rect x="22" y="139" width="112" height="64" rx="4" fill="#14bf96" initial={false} animate={{height:64}} transition={transition}/><path d="M22 139H134" stroke="#0a2a66" strokeDasharray="4 4"/><text x="78" y="86" textAnchor="middle">{3*scale} water</text><text x="78" y="177" textAnchor="middle">{2*scale} syrup</text><text x="78" y="239" textAnchor="middle">{2*scale}/{5*scale} syrup</text></g>)}
   <text x="270" y="150" textAnchor="middle" className="scene-large">=</text>
  </svg>}
  {item.scene==='fractions'&&<svg viewBox="0 0 540 270" role="img" aria-label={`The same whole is divided into ${2*value} equal pieces. ${value} are shaded: one half.`}>
   <text x="270" y="38" textAnchor="middle">One whole. The same shaded half.</text><rect x="30" y="72" width="480" height="120" rx="8" fill="#eef3f9"/><rect x="30" y="72" width="240" height="120" rx="8" fill="#14bf96"/>
   {Array.from({length:2*value-1},(_,i)=><motion.path key={`${value}-${i}`} initial={off?false:{pathLength:0}} animate={{pathLength:1}} transition={transition} d={`M${30+(i+1)*480/(2*value)} 72V192`} stroke="#0a2a66" strokeWidth="2"/>)}<rect x="30" y="72" width="480" height="120" rx="8" fill="none" stroke="#0a2a66" strokeWidth="3"/>
   <text x="270" y="241" textAnchor="middle" className="scene-large">1/2 = {value}/{2*value}</text>
  </svg>}
  {item.scene==='distribution'&&<svg viewBox="0 0 540 270" role="img" aria-label={value?'Three x tiles and twelve unit tiles, regrouped as 3x plus 12.':'Three groups, each containing one x tile and four unit tiles.'}>
   {[0,1,2].map(group=><g key={group}><motion.rect initial={false} animate={{opacity:value?0:1}} transition={transition} x={20+group*174} y="45" width="155" height="147" rx="12" fill="none" stroke="#a1b8c7" strokeDasharray="5 4"/>
    <motion.g initial={false} animate={{x:value?35+group*53:38+group*174,y:value?83:62}} transition={transition}><rect width="43" height="80" rx="5" fill="#14bf96" stroke="#0a2a66"/><text x="21" y="48" textAnchor="middle">x</text></motion.g>
    {[0,1,2,3].map(unit=><motion.g key={unit} initial={false} animate={{x:value?260+(group*4+unit)%6*36:97+group*174+unit%2*32,y:value?85+Math.floor((group*4+unit)/6)*42:65+Math.floor(unit/2)*49}} transition={transition}><rect width="27" height="31" rx="4" fill="#d8e3f4" stroke="#0a2a66"/><text x="13.5" y="23" textAnchor="middle">1</text></motion.g>)}</g>)}
   <text x="270" y="239" textAnchor="middle" className="scene-large">{value?'3x + 12':'3(x + 4)'}</text>
  </svg>}
  {item.scene==='factors'&&<svg viewBox="0 0 540 300" role="img" aria-label="Four positive areas: x squared, 3x, 4x and 12. Here x is drawn as 5 units. Together they make x squared plus 7x plus 12.">
   {[{x:72,y:42,w:150,h:150,t:'x²'},{x:222,y:42,w:120,h:150,t:'4x'},{x:72,y:192,w:150,h:90,t:'3x'},{x:222,y:192,w:120,h:90,t:'12'}].map((part,i)=><motion.g key={part.t} initial={false} animate={{x:value&&(i===1||i===3)?52:0,y:value&&i>1?10:0}} transition={transition}><rect x={part.x} y={part.y} width={part.w} height={part.h} fill={i===0?'#14bf96':i===3?'#bdecdc':'#e0eaf5'} stroke="#0a2a66" strokeWidth="2"/><text x={part.x+part.w/2} y={part.y+part.h/2+6} textAnchor="middle" className="scene-large">{part.t}</text></motion.g>)}
   <text x="145" y="28" textAnchor="middle">x</text><text x={value?334:282} y="28" textAnchor="middle">4</text><text x="46" y="121" textAnchor="middle">x</text><text x="46" y="242" textAnchor="middle">3</text><text x="458" y="129" textAnchor="middle">3x + 4x</text><text x="458" y="165" textAnchor="middle">= 7x</text>
  </svg>}
  {item.scene==='roots'&&<svg viewBox="0 0 540 270" role="img" aria-label={`x is ${value}. x plus 3 is ${value+3}; x plus 4 is ${value+4}; the product is ${(value+3)*(value+4)}.`}>
   <text x="270" y="46" textAnchor="middle" className="scene-large">(x + 3)(x + 4)</text><path d="M55 178H485" stroke="#0a2a66" strokeWidth="2"/>
   {[-6,-5,-4,-3,-2,-1,0,1].map((n,i)=><g key={n}><path d={`M${55+i*61.4} 171v14`} stroke="#0a2a66"/><text x={55+i*61.4} y="210" textAnchor="middle">{n}</text></g>)}
   <motion.circle initial={false} animate={{cx:55+(value+6)*61.4}} cy="178" r="9" fill="#14bf96" stroke="#0a2a66" transition={transition}/>
   <text x="270" y="111" textAnchor="middle">{value+3} × {value+4} = {(value+3)*(value+4)}</text><text x="270" y="252" textAnchor="middle">{value===-3||value===-4?'One factor is zero, so the product is zero.':'Move x to −3 or −4.'}</text>
  </svg>}
  {item.scene==='graph'&&<svg viewBox="0 0 540 300" role="img" aria-label={`At ${value} minutes the tank holds ${6+2*value} litres. The graph follows V equals 6 plus 2t.`}>
   <path d="M55 35V235H365" fill="none" stroke="#0a2a66" strokeWidth="2"/>{[0,1,2,3,4,5].map(t=><text key={t} x={55+t*58} y="256" textAnchor="middle">{t}</text>)}{[0,4,8,12,16].map(v=><g key={v}><path d={`M55 ${235-v*11}H345`} stroke="#d5e3eb"/><text x="41" y={240-v*11} textAnchor="end">{v}</text></g>)}
   <text x="200" y="289" textAnchor="middle">Time (min)</text><text x="55" y="20">Amount (L)</text><path d="M55 169L345 59" stroke="#0a2a66" strokeWidth="4"/>
   <motion.g initial={false} animate={{x:55+value*58,y:235-(6+2*value)*11}} transition={transition}><circle r="9" fill="#14bf96" stroke="#0a2a66"/></motion.g>
   <rect x="401" y="49" width="88" height="187" rx="8" fill="#eef8f5" stroke="#0a2a66" strokeWidth="2"/><motion.rect initial={false} animate={{y:233-(6+2*value)*10,height:(6+2*value)*10}} transition={transition} x="404" width="82" rx="5" fill="#14bf96"/><text x="445" y="268" textAnchor="middle">{6+2*value} L</text>
  </svg>}
  {item.scene==='factors'&&<p className="explore-proportion-note">The picture uses x = 5.</p>}{item.scene==='mixture'&&<p className="explore-proportion-note">Each glass shows the mix, not the total volume.</p>}<div className="explore-scene-controls">{isToggle?<button type="button" className="explore-action" aria-pressed={!!value} onClick={()=>change(value?0:1)}>{item.scene==='factors'?(value?'Bring the pieces together':'Separate the four pieces'):(value?'Put them back in groups':'Open and regroup')}</button>:<label>{label} <strong>{value}{item.scene==='mixture'?'×':item.scene==='graph'?' min':''}</strong><input type="range" min={min} max={max} step="1" value={value} onChange={e=>change(Number(e.target.value))}/></label>}</div>
 </div>;
}
