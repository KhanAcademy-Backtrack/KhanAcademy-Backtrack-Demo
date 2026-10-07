'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {lazy,Suspense,useState} from 'react';

import {useProgram} from './ProgramProvider';
import {PageBand,Sheet,btn,Oval,cx,pageBody} from './ui';
import {useStudy} from '@/components/study/StudyProvider';
import {StudyBackups} from '@/components/study/StudyBackups';
import {ChangeGoalButton} from './ProgramTourProvider';
import {goalLabel} from '@/lib/program/personalization';




import {validProgram,PROGRAM_KEY} from '@/lib/program/store';
import {validStudy} from '@/lib/study';
import {t} from '@/lib/i18n';

const LiveGroup=lazy(()=>import('./LiveStudyGroup').then(m=>({default:m.LiveStudyGroup})));
export function Group(){return <Suspense fallback={<div className="min-h-screen"/>}><LiveGroup/></Suspense>;}

export function Coach(){
 return <>
  <PageBand title="For teachers and coaches" lead="Run Khanpanion with a class or a review group: set up a Khan Academy class, hold a mock exam day, and see how the group is doing. Everything here is free and printable."/>
  <div className={pageBody}>
   <div className="grid gap-5 lg:grid-cols-2">
    <Sheet><h2 className="text-2xl font-extrabold"><Headline>1. Set up your Khan Academy class</Headline></h2><ol className="mt-3 grid gap-2 text-[16px]">{['Create a free teacher account on Khan Academy and make a class.','Add the Philippine courses your learners need: Grade 7 to 10 Math, SHS Pre-Calculus, General Physics 1, General Chemistry 1, Biology 1.','Set course mastery goals for the units in each learner’s Khanpanion plan.','Khan’s class reports show learning minutes and skills leveled up. Khan recommends about 120 learning minutes a month.'].map((x,i)=><li key={i} className="flex gap-3"><Oval label={String(i+1)} size={30}/><span>{x}</span></li>)}</ol><p className="mt-3 text-sm text-ink-soft">Khan reports and Khanpanion practice stay separate records. Khanpanion never reads Khan data.</p></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold"><Headline>2. Run a mock exam day</Headline></h2><ol className="mt-3 grid gap-2 text-[16px]">{['Print a booklet and answer sheets from the Mocks tab, one per learner.','Read the instructions aloud: time per section, no phones, blanks are fine.','Time each section; announce halfway and five minutes left.','Collect sheets. Learners type their own answers into the scoring screen afterwards and see their fixes.','Close with ten minutes on the most-missed question as a group.'].map((x,i)=><li key={i} className="flex gap-3"><Oval label={String(i+1)} size={30}/><span>{x}</span></li>)}</ol><Link className={cx(btn.text,'mt-2')} href="/mock"><Headline>Printable mocks and answer keys</Headline></Link></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold"><Headline>3. Weekly aggregate sheet</Headline></h2><p className="mt-1 text-ink-soft">Learners read out, or hand in, three numbers each week. No names needed; use seat numbers.</p><table className="mt-4 w-full text-left text-sm"><thead><tr className="border-b-2 border-navy">{['Seat','Study days','Missions','Latest mock','Top miss'].map(h=><th key={h} className="py-2 pr-2">{h}</th>)}</tr></thead><tbody>{[1,2,3,4,5].map(r=><tr key={r} className="border-b border-mint-line">{[r,'','','',''].map((c,i)=><td key={i} className="h-10 py-2 pr-2">{c}</td>)}</tr>)}</tbody></table><button className={cx(btn.ghost,'mt-4 print:hidden')} onClick={()=>window.print()}><Headline>Print this page</Headline></button></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold"><Headline>4. Consent template</Headline></h2><p className="mt-1 text-ink-soft">For schools that want written consent before learners share anything.</p><div className="mt-4 rounded-2xl bg-sky p-4 font-serif text-[16px] leading-relaxed"><p>I agree that my child, a learner in ________________, may use Khanpanion, a free study website, as part of the school’s review program. I understand that Khanpanion has no accounts, that my child’s answers and practice history stay on the device used. In a study group, their nickname and the check-ins they choose to post are visible to the group.</p><p className="mt-4">Parent or guardian: ________________ Date: __________</p></div></Sheet>
   </div>
   <Sheet className="mt-5"><h2 className="text-xl font-extrabold"><Headline>Earlier teacher tools</Headline></h2><div className="mt-3 flex flex-wrap gap-2"><Link className={btn.ghost} href="/classrooms"><Headline>Class routine planner</Headline></Link><Link className={btn.ghost} href="/schools"><Headline>For schools</Headline></Link></div></Sheet>
  </div>
 </>;
}

export function Me(){
 const {state,update}=useProgram(),study=useStudy(),lang=state.lang;
 const [msg,setMsg]=useState(''),[confirm,setConfirm]=useState(false);
 function exportAll(){const data={kind:'khanpanion-backup',version:1,exportedAt:new Date().toISOString(),study:study.state,program:state};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='khanpanion-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setMsg('Backup downloaded.');}
 async function importAll(file:File){try{if(file.size>5_000_000)throw Error('Choose a file smaller than 5 MB.');const data=JSON.parse(await file.text());if(data?.kind!=='khanpanion-backup')throw Error('This is not a Khanpanion backup file.');if(!validProgram(data.program)||!validStudy(data.study))throw Error('This backup could not be read.');try{localStorage.setItem(`backtrack.program.backup.${Date.now()}`,localStorage.getItem(PROGRAM_KEY)??'{}');}catch{}study.restore(data.study);update(()=>data.program);setMsg('Backup restored. Your earlier plan was kept as a backup.');}catch(e){setMsg(e instanceof Error?e.message:'This backup could not be read.');}}
 return <>
  <PageBand title="Me" lead="Adjust your settings, choose a study goal and keep a backup of your progress."/>
  <div className={pageBody}>
   <div className="grid gap-5 lg:grid-cols-2">
    <Sheet className="lg:col-span-2"><h2 className="text-2xl font-extrabold"><Headline>The practice rooms</Headline></h2><p className="mt-1 text-ink-soft">Explore the earlier study space and its interactive lessons.</p><Link href="/demo?tour=1" className={cx(btn.text,'mt-2 text-sm')}><Headline>Study space tour</Headline></Link></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold"><Headline>{t(lang,'me.language')}</Headline></h2><div className="mt-3 flex gap-2">{(['en','fil'] as const).map(l=><button key={l} aria-pressed={lang===l} onClick={()=>update(s=>({...s,lang:l}))} className="min-h-11 rounded-full border-2 border-navy/15 px-5 font-bold aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white text-navy">{l==='en'?'English':'Filipino'}</button>)}</div><p className="mt-2 text-sm text-ink-soft">Filipino covers navigation, your plan, Today and the exam screens.</p></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold"><Headline>Your goal and routine</Headline></h2><p className="mt-3 font-semibold">{goalLabel(state)}</p><p className="mt-1 text-sm text-ink-soft">Change what you are preparing for, your topic or your study days.</p><ChangeGoalButton className={cx(btn.primary,'mt-4')}/></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold"><Headline>Motion and sound</Headline></h2><label className="mt-3 flex min-h-11 items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-[#14bf96]" checked={study.state.settings.quiet} onChange={e=>study.update(s=>({...s,settings:{...s.settings,quiet:e.target.checked},updatedAt:Date.now()}))}/>Quiet mode: still pictures, no movement</label><label className="flex min-h-11 items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-[#14bf96]" checked={study.state.settings.sound} onChange={e=>study.update(s=>({...s,settings:{...s.settings,sound:e.target.checked},updatedAt:Date.now()}))}/>Sounds when a round finishes</label></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold"><Headline>Backups</Headline></h2><p className="mt-1 text-ink-soft">One file holds your plan, mock results, notebook and practice history.</p><div className="mt-3 flex flex-wrap gap-2"><button className={btn.primary} onClick={exportAll}><Headline>Download a backup</Headline></button><label className={cx(btn.ghost,'cursor-pointer')}>Restore a backup<input type="file" accept="application/json,.json" className="sr-only" onChange={e=>{const f=e.target.files?.[0];e.currentTarget.value='';if(f)void importAll(f);}}/></label></div>{msg&&<p role="status" className="mt-2 text-sm">{msg}</p>}<div className="mt-4"><StudyBackups/></div></Sheet>
    <Sheet className="lg:col-span-2"><h2 className="text-2xl font-extrabold"><Headline>Shared or borrowed phone?</Headline></h2><p className="mt-1 text-ink-soft">Clearing removes your plan, results and practice history from this browser. Download a backup first if you want to keep them.</p>{confirm?<div className="mt-3 flex flex-wrap gap-2"><button className={btn.dark} onClick={()=>{if(study.clear())setMsg('This browser is clear.');setConfirm(false);}}><Headline>Yes, clear everything</Headline></button><button className={btn.ghost} onClick={()=>setConfirm(false)}><Headline>Cancel</Headline></button></div>:<button className={cx(btn.ghost,'mt-3')} onClick={()=>setConfirm(true)}><Headline>Clear this device</Headline></button>}</Sheet>
   </div>
  </div>
 </>;
}
