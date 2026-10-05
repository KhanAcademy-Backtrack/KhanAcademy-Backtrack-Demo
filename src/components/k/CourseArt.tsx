import type {ReactNode} from 'react';
import type {Subtest} from '@/lib/mock/types';

/** Original course illustrations and subject marks, drawn only in the Khanpanion palette.
 *  Decorative: every one is aria-hidden, and the course title carries the meaning. */
const N='#0a2a66',G='#14bf96',GD='#0f9f7c',GL='#96e6d2',M='#e7f9f3',ML='#c4e6db',S='#eef3fa',F='#9fb3d4',W='#ffffff';

const SCENES:Record<string,ReactNode>={
 cs_it:<>
  <rect x="34" y="18" width="92" height="64" rx="8" fill={N}/>
  <rect x="34" y="18" width="92" height="13" rx="8" fill="#1b3a65"/><rect x="34" y="26" width="92" height="5" fill="#1b3a65"/>
  <circle cx="44" cy="24.5" r="2.4" fill={G}/><circle cx="52" cy="24.5" r="2.4" fill={GL}/><circle cx="60" cy="24.5" r="2.4" fill={F}/>
  <path d="M50 46 42 53l8 7M74 46l8 7-8 7M67 43l-10 21" fill="none" stroke={G} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
  <rect x="90" y="44" width="26" height="4" rx="2" fill={GL}/><rect x="90" y="53" width="18" height="4" rx="2" fill={F}/><rect x="90" y="62" width="22" height="4" rx="2" fill={GL}/>
  <text x="14" y="34" fontSize="11" fontWeight="700" fill={GD} fontFamily="ui-monospace,monospace">1</text><text x="138" y="76" fontSize="11" fontWeight="700" fill={GD} fontFamily="ui-monospace,monospace">0</text><text x="140" y="30" fontSize="11" fontWeight="700" fill={F} fontFamily="ui-monospace,monospace">1</text>
 </>,
 engineering:<>
  <path d="M18 80h124" stroke={N} strokeWidth="3" strokeLinecap="round"/>
  <path d="M26 80 48 46l22 34 22-34 22 34 22-34" fill="none" stroke={N} strokeWidth="3.4" strokeLinejoin="round"/>
  <path d="M48 46h88" stroke={N} strokeWidth="3.4" strokeLinecap="round"/>
  <g transform="translate(40 30)"><circle r="15" fill={G}/><circle r="5.5" fill={M}/>{[0,45,90,135,180,225,270,315].map(a=><rect key={a} x="-3.5" y="-20" width="7" height="8" rx="1.5" fill={G} transform={`rotate(${a})`}/>)}</g>
  <rect x="104" y="20" width="40" height="10" rx="2" fill={GL} transform="rotate(-8 124 25)"/>
  {[0,1,2,3,4].map(i=><path key={i} d={`M${108+i*7} ${19.5-i}v4`} stroke={N} strokeWidth="1.6" transform="rotate(-8 124 25)"/>)}
 </>,
 health:<>
  <path d="M80 84C52 66 38 52 38 38c0-10 8-18 18-18 10 0 18 6 24 15 6-9 14-15 24-15 10 0 18 8 18 18 0 14-14 28-42 46Z" fill={G}/>
  <path d="M30 50h26l6-12 9 24 7-16 5 8h47" fill="none" stroke={N} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
  <g transform="rotate(-35 130 76)"><rect x="114" y="69" width="34" height="14" rx="7" fill={W} stroke={N} strokeWidth="2.6"/><path d="M131 69h10a7 7 0 0 1 0 14h-10Z" fill={N}/></g>
  <circle cx="26" cy="26" r="5" fill={GL}/><circle cx="140" cy="24" r="3.5" fill={F}/>
 </>,
 natural_sciences:<>
  <g transform="translate(62 50)" fill="none" stroke={N} strokeWidth="2.8"><ellipse rx="34" ry="12"/><ellipse rx="34" ry="12" transform="rotate(60)"/><ellipse rx="34" ry="12" transform="rotate(-60)"/></g>
  <circle cx="62" cy="50" r="7" fill={G}/><circle cx="96" cy="50" r="4" fill={GD}/><circle cx="45" cy="21" r="4" fill={GD}/>
  <path d="M116 22h20M120 22v20l-12 30a5 5 0 0 0 5 7h26a5 5 0 0 0 5-7l-12-30V22" fill={W} stroke={N} strokeWidth="2.8" strokeLinejoin="round"/>
  <path d="M112 62h32l5 10a5 5 0 0 1-5 7h-26a5 5 0 0 1-5-7Z" fill={G}/>
  <circle cx="124" cy="52" r="2.6" fill={GL}/><circle cx="131" cy="44" r="2" fill={GL}/>
 </>,
 business:<>
  <path d="M22 84h116" stroke={N} strokeWidth="3" strokeLinecap="round"/>
  <rect x="32" y="60" width="16" height="24" rx="3" fill={F}/><rect x="56" y="48" width="16" height="36" rx="3" fill={GL}/><rect x="80" y="36" width="16" height="48" rx="3" fill={G}/><rect x="104" y="24" width="16" height="60" rx="3" fill={N}/>
  <path d="M30 50 58 34l20 8 40-26" fill="none" stroke={GD} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M106 14h13v13" fill="none" stroke={GD} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
  <circle cx="138" cy="44" r="12" fill={G}/><text x="138" y="49" textAnchor="middle" fontSize="14" fontWeight="800" fill={N} fontFamily="Arial">₱</text>
 </>,
 social_sciences:<>
  <path d="M22 22h62a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H46l-12 11v-11h-12a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8Z" fill={G}/>
  <rect x="26" y="33" width="44" height="4.5" rx="2.2" fill={N}/><rect x="26" y="43" width="30" height="4.5" rx="2.2" fill={N} opacity=".55"/>
  <path d="M138 36H90a8 8 0 0 0-8 8v18a8 8 0 0 0 8 8h30l11 9v-9h7a8 8 0 0 0 8-8V44a8 8 0 0 0-8-8Z" fill={W} stroke={N} strokeWidth="2.8"/>
  <circle cx="100" cy="53" r="3.2" fill={N}/><circle cx="112" cy="53" r="3.2" fill={N}/><circle cx="124" cy="53" r="3.2" fill={N}/>
  <circle cx="30" cy="84" r="5" fill={GL}/><circle cx="46" cy="86" r="3" fill={F}/>
 </>,
 arts:<>
  <path d="M80 30C66 22 46 20 28 24v54c18-4 38-2 52 6 14-8 34-10 52-6V24c-18-4-38-2-52 6Z" fill={W} stroke={N} strokeWidth="2.8" strokeLinejoin="round"/>
  <path d="M80 30v54" stroke={N} strokeWidth="2.8"/>
  <path d="M38 38c10-2 22-1 32 3M38 48c10-2 22-1 32 3M38 58c10-2 22-1 32 3" stroke={F} strokeWidth="3" strokeLinecap="round" fill="none"/>
  <path d="M92 64c8-14 20-24 34-30" stroke={G} strokeWidth="8" strokeLinecap="round" fill="none"/>
  <path d="M120 22l14-8 4 6-12 10Z" fill={N}/><circle cx="96" cy="44" r="4" fill={GD}/><circle cx="110" cy="70" r="3" fill={GL}/>
 </>
};

/** A course illustration on its tinted panel. */
export function CourseArt({id,className,tone}:{id:string;className?:string;tone?:'mint'|'sky'}){
 const bg=(tone??(['cs_it','natural_sciences','social_sciences'].includes(id)?'sky':'mint'))==='sky'?S:M;
 return <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid meet" className={className} aria-hidden="true" style={{background:bg}}>
  <circle cx="148" cy="96" r="30" fill={bg===S?'#dfe8f6':ML} opacity=".9"/><circle cx="8" cy="6" r="18" fill={bg===S?'#dfe8f6':ML} opacity=".9"/>
  {SCENES[id]??SCENES.natural_sciences}
 </svg>;
}

/** A small stroke mark for each subject, used on lesson-path nodes. */
export function SubjectMark({subject,className='h-6 w-6'}:{subject:Subtest|'khan';className?:string}){
 const p={fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
 return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{
  subject==='math'?<><path {...p} d="M5 7h6M8 4v6M14 7h5M5 17l4-4M5 13l4 4M14 15h5M14 19h5"/></>
  :subject==='science'?<><path {...p} d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 14h9"/></>
  :subject==='reading'?<><path {...p} d="M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5Zm0 0v13"/></>
  :subject==='language'?<><path {...p} d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-7l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/><path {...p} d="M8 13l2-5 2 5M8.7 11.4h2.6M14 9.5h3M15.5 8v1.5"/></>
  :<><path {...p} d="M12 3 4 7.5v9L12 21l8-4.5v-9Z"/><path {...p} d="m8.5 12 2.5 2.5 4.5-5"/></>
 }</svg>;
}
