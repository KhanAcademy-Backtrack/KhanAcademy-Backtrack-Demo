import type {ReactNode} from 'react';
import type {Subtest} from '@/lib/mock/types';
import type {SubjectKind} from '@/lib/program/college-courses';

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
  <circle cx="20" cy="76" r="5" fill={GL}/><circle cx="142" cy="26" r="3.5" fill={F}/>
 </>,
 engineering:<>
  <path d="M20 80h120" stroke={N} strokeWidth="3" strokeLinecap="round"/>
  <path d="M26 80 44 50l18 30 18-30 18 30 18-30 18 30" fill="none" stroke={N} strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round"/>
  <path d="M44 50h72" stroke={N} strokeWidth="3.4" strokeLinecap="round"/>
  <g transform="translate(34 27)"><circle r="13" fill={G}/><circle r="5" fill={M}/>{[0,45,90,135,180,225,270,315].map(a=><rect key={a} x="-3" y="-17.5" width="6" height="7" rx="1.2" fill={G} transform={`rotate(${a})`}/>)}</g>
  <g transform="rotate(-8 121 27)"><rect x="100" y="22" width="42" height="10" rx="2" fill={GL}/>{[0,1,2,3,4,5].map(i=><path key={i} d={`M${104+i*7} 22v${i%2?3:5}`} stroke={N} strokeWidth="1.6" strokeLinecap="round"/>)}</g>
 </>,
 health:<>
  <path d="M80 84C52 66 38 52 38 38c0-10 8-18 18-18 10 0 18 6 24 15 6-9 14-15 24-15 10 0 18 8 18 18 0 14-14 28-42 46Z" fill={G}/>
  <path d="M30 50h26l6-12 9 24 7-16 5 8h47" fill="none" stroke={N} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
  <g transform="rotate(-35 136 75)"><rect x="119" y="68" width="34" height="14" rx="7" fill={W} stroke={N} strokeWidth="2.6"/><path d="M136 68h10a7 7 0 0 1 0 14h-10Z" fill={N}/></g>
  <circle cx="26" cy="26" r="5" fill={GL}/><circle cx="140" cy="24" r="3.5" fill={F}/>
 </>,
 natural_sciences:<>
  <g transform="translate(62 50)" fill="none" stroke={N} strokeWidth="2.8"><ellipse rx="34" ry="12"/><ellipse rx="34" ry="12" transform="rotate(60)"/><ellipse rx="34" ry="12" transform="rotate(-60)"/></g>
  <circle cx="62" cy="50" r="7" fill={G}/><circle cx="96" cy="50" r="4" fill={GD}/><circle cx="45" cy="21" r="4" fill={GD}/>
  <path d="M120 22v20l-12 30a5 5 0 0 0 5 7h26a5 5 0 0 0 5-7l-12-30V22Z" fill={W}/>
  <path d="M112 62h28l4 10a5 5 0 0 1-5 7h-26a5 5 0 0 1-5-7Z" fill={G}/>
  <path d="M116 22h20M120 22v20l-12 30a5 5 0 0 0 5 7h26a5 5 0 0 0 5-7l-12-30V22" fill="none" stroke={N} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
  <circle cx="124" cy="53" r="2.6" fill={GL}/><circle cx="128" cy="45" r="2" fill={GL}/>
 </>,
 statistics:<>
  {[76,61.6,43.2,30.3,43.2,61.6,76].map((y,i)=><rect key={i} x={29+i*15} y={y} width="12" height={84-y} rx="2.5" fill={i===3?G:i%2?F:GL}/>)}
  <path d="M18 84h124" stroke={N} strokeWidth="3" strokeLinecap="round"/>
  <path d="M20 78.2C21.7 77.2 26.7 74.7 30 72.2C33.3 69.7 36.7 66.6 40 63.1C43.3 59.6 46.7 55.3 50 51.3C53.3 47.3 56.7 42.7 60 39.1C63.3 35.4 66.7 31.8 70 29.6C73.3 27.4 76.7 26 80 26C83.3 26 86.7 27.4 90 29.6C93.3 31.8 96.7 35.4 100 39.1C103.3 42.7 106.7 47.3 110 51.3C113.3 55.3 116.7 59.6 120 63.1C123.3 66.6 126.7 69.7 130 72.2C133.3 74.7 138.3 77.2 140 78.2" fill="none" stroke={N} strokeWidth="3.2" strokeLinecap="round"/>
  <path d="M80 16v8" stroke={GD} strokeWidth="2.4" strokeLinecap="round"/><path d="M80 31v50" stroke={W} strokeWidth="1.8" strokeDasharray="3 3" opacity=".9"/>
  <circle cx="134" cy="22" r="9" fill={M} stroke={N} strokeWidth="2.8"/><path d="m140.5 28.5 7 7" stroke={N} strokeWidth="3.4" strokeLinecap="round"/><circle cx="134" cy="22" r="3" fill={G}/>
 </>,
 social_sciences:<>
  <path d="M22 22h62a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H46l-12 11v-11h-12a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8Z" fill={G}/>
  <rect x="26" y="33" width="44" height="4.5" rx="2.2" fill={N}/><rect x="26" y="43" width="30" height="4.5" rx="2.2" fill={N} opacity=".55"/>
  <path d="M138 36H90a8 8 0 0 0-8 8v18a8 8 0 0 0 8 8h30l11 9v-9h7a8 8 0 0 0 8-8V44a8 8 0 0 0-8-8Z" fill={W} stroke={N} strokeWidth="2.8"/>
  <circle cx="100" cy="53" r="3.2" fill={N}/><circle cx="112" cy="53" r="3.2" fill={N}/><circle cx="124" cy="53" r="3.2" fill={N}/>
  <circle cx="30" cy="84" r="5" fill={GL}/><circle cx="46" cy="86" r="3" fill={F}/>
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

/** A small stroke mark for each kind of college subject. */
export function KindMark({kind,className='h-6 w-6'}:{kind:SubjectKind;className?:string}){
 const p={fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
 return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{
  kind==='math'?<path {...p} d="M5 19c3 0 3-14 6-14M4 12h6M14 9l5 6M19 9l-5 6"/>
  :kind==='statistics'?<><path {...p} d="M4 20h16"/><path {...p} d="M7 20v-5M11 20V8M15 20v-8M19 20v-3"/></>
  :kind==='programming'?<><path {...p} d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></>
  :kind==='computing'?<><rect {...p} x="4" y="5" width="16" height="11" rx="1.5"/><path {...p} d="M9 20h6M12 16v4"/></>
  :kind==='science'?<><path {...p} d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 14h9"/></>
  :<><circle {...p} cx="9" cy="8" r="3"/><circle {...p} cx="17" cy="9" r="2.4"/><path {...p} d="M3.5 19c.8-3.4 3-5 5.5-5s4.7 1.6 5.5 5M14.5 14.5c2.6-.4 4.8.9 5.8 4"/></>
 }</svg>;
}
