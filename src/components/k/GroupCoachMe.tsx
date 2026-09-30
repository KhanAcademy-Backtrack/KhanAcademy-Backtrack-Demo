'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {useProgram} from './ProgramProvider';
import {PageBand,Sheet,btn,Oval,OvalRow,cx,pageBody,Pill} from './ui';
import {useStudy} from '@/components/study/StudyProvider';
import {StudyBackups} from '@/components/study/StudyBackups';
import {weeks} from '@/lib/program/planner';
import {formFromKey} from '@/lib/mock/forms';
import {scoreAttempt} from '@/lib/mock/scoring';
import {shareCardPng,shareOrDownload} from '@/lib/share-card';
import {validProgram,PROGRAM_KEY} from '@/lib/program/store';
import {validStudy} from '@/lib/study';
import {t} from '@/lib/i18n';

const field='min-h-12 rounded-xl border-2 border-navy/15 bg-white px-3 text-navy focus:border-navy focus:outline-none';
const CODE=/^[A-Z0-9]{6}$/;
function newCode(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';const r=crypto.getRandomValues(new Uint8Array(6));for(const b of r)s+=a[b%a.length];return s;}

export function Group(){
 const {state,update,today}=useProgram(),params=useSearchParams();
 const [code,setCode]=useState(''),[goal,setGoal]=useState(4),[msg,setMsg]=useState(''),[include,setInclude]=useState({days:true,missions:true,mock:true});
 useEffect(()=>{const j=params.get('join')?.toUpperCase();if(j&&CODE.test(j))setCode(j);},[params]);
 const g=state.group,w=weeks(state,today);
 const lastMock=state.attempts.filter(a=>a.submittedAt).sort((a,b)=>b.submittedAt!-a.submittedAt!)[0];
 const mockScore=lastMock?(()=>{const f=formFromKey(lastMock.formKey);return f?scoreAttempt(f,lastMock).total:undefined;})():undefined;
 const missionsDone=Object.entries(state.missions).filter(([d,v])=>d>=w.thisWeek.start&&v.recall&&v.khan&&v.exit).length;
 const link=g&&typeof window!=='undefined'?`${location.origin}/group?join=${g.code}`:'';
 async function shareCard(){const lines=[];if(include.days)lines.push({label:'Study days this week',value:`${w.thisWeek.days}/${g?.goal??w.target}`,fill:w.thisWeek.days/(g?.goal??w.target)});if(include.missions)lines.push({label:'Full missions',value:String(missionsDone)});if(include.mock&&mockScore)lines.push({label:'Latest mock',value:`${mockScore.correct}/${mockScore.total}`,fill:mockScore.correct/mockScore.total});
  try{const blob=await shareCardPng({title:'My weekly check-in',subtitle:g?`Study group ${g.code}`:'Studying with Khanpanion',lines,footer:'khanpanion.vercel.app · free exam review'});setMsg(await shareOrDownload(blob,'khanpanion-check-in.png','My weekly check-in')==='downloaded'?'Card saved. Send it to your group chat.':'Shared.');}catch{setMsg('This browser could not make the image.');}}
 return <>
  <PageBand title="Study group" lead="Study with friends without accounts. Share a code, agree on a weekly goal, and post a check-in card to your group chat. Only what you choose to share leaves your phone."/>
  <div className={pageBody}>
   {!g?<div className="grid gap-5 md:grid-cols-2">
    <Sheet><h2 className="text-2xl font-extrabold">Start a group</h2><p className="mt-1 text-ink-soft">You get a six-letter code to send your friends.</p><label className="mt-4 grid gap-1 font-semibold">Study days each week, per person<input type="number" min={1} max={7} className={field} value={goal} onChange={e=>setGoal(Math.max(1,Math.min(7,Number(e.target.value)||4)))}/></label><button className={cx(btn.primary,'mt-4')} onClick={()=>update(s=>({...s,group:{code:newCode(),goal,joinedAt:Date.now()}}))}>Create my group</button></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold">Join a group</h2><p className="mt-1 text-ink-soft">Type the code a friend sent you, or open their link.</p><form className="mt-4 flex flex-wrap gap-2" onSubmit={e=>{e.preventDefault();const c=code.trim().toUpperCase();if(!CODE.test(c)){setMsg('A group code has six letters and numbers.');return;}update(s=>({...s,group:{code:c,goal,joinedAt:Date.now()}}));}}><input aria-label="Group code" className={cx(field,'w-40 font-mono text-lg uppercase tracking-widest')} maxLength={6} value={code} onChange={e=>setCode(e.target.value.toUpperCase())}/><button className={btn.dark}>Join</button></form>{msg&&<p role="status" className="mt-2 text-sm">{msg}</p>}</Sheet>
   </div>:<div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
    <Sheet><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-2xl font-extrabold">Group {g.code}</h2><Pill>Goal: {g.goal} days a week</Pill></div>
     <p className="mt-2 text-ink-soft">Send this link to your group chat. Anyone who opens it joins the same code on their own phone.</p>
     <div className="mt-3 flex flex-wrap gap-2"><code className="rounded-xl bg-sky px-3 py-2 text-sm">{link}</code><button className={btn.ghost} onClick={async()=>{try{await navigator.clipboard.writeText(link);setMsg('Link copied.');}catch{setMsg('Copy the link above by hand.');}}}>Copy link</button></div>
     <div className="mt-6"><p className="font-bold">Your week so far</p><div className="mt-2"><OvalRow done={Math.min(w.thisWeek.days,g.goal)} total={g.goal} label={`${w.thisWeek.days} of ${g.goal} days`}/></div><p className="mt-2 text-sm text-ink-soft">{w.thisWeek.days>=g.goal?'Goal met this week.':`${g.goal-w.thisWeek.days} more day${g.goal-w.thisWeek.days===1?'':'s'} to reach the group goal.`}</p></div>
     <p className="mt-6 text-sm text-ink-soft">Khanpanion has no server, so it cannot show your friends’ progress here. Their check-in cards arrive in your group chat, exactly as they chose to share them.</p>
     <button className={cx(btn.text,'mt-2')} onClick={()=>update(s=>({...s,group:undefined}))}>Leave this group</button>
    </Sheet>
    <Sheet><h2 className="text-2xl font-extrabold">Weekly check-in card</h2><p className="mt-1 text-ink-soft">Choose what to include. The card is made on your phone.</p>
     <div className="mt-4 grid gap-2">{([['days','Study days this week'],['missions','Full missions done'],['mock','Latest mock score']] as const).map(([k,l])=><label key={k} className="flex min-h-11 items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-[#14bf96]" checked={include[k]} onChange={e=>setInclude({...include,[k]:e.target.checked})}/>{l}</label>)}</div>
     <button className={cx(btn.primary,'mt-4')} onClick={shareCard}>Make and share my card</button>{msg&&<p role="status" className="mt-2 text-sm">{msg}</p>}
    </Sheet>
   </div>}
   <Sheet className="mt-5"><h2 className="text-xl font-extrabold">Study together in person</h2><div className="mt-3 flex flex-wrap gap-2"><Link className={btn.ghost} href="/together">Take turns on one phone</Link><Link className={btn.ghost} href="/challenge">Send a challenge</Link><Link className={btn.ghost} href="/mock">Print a mock for a study session</Link></div></Sheet>
  </div>
 </>;
}

export function Coach(){
 return <>
  <PageBand title="For teachers and coaches" lead="Run Khanpanion with a class or a review group: set up a Khan Academy class, hold a mock exam day, and see how the group is doing. Everything here is free and printable."/>
  <div className={pageBody}>
   <div className="grid gap-5 lg:grid-cols-2">
    <Sheet><h2 className="text-2xl font-extrabold">1. Set up your Khan Academy class</h2><ol className="mt-3 grid gap-2 text-[16px]">{['Create a free teacher account on Khan Academy and make a class.','Add the Philippine courses your learners need: Grade 7 to 10 Math, SHS Pre-Calculus, General Physics 1, General Chemistry 1, Biology 1.','Set course mastery goals for the units in each learner’s Khanpanion plan.','Khan’s class reports show learning minutes and skills leveled up. Khan recommends about 120 learning minutes a month.'].map((x,i)=><li key={i} className="flex gap-3"><Oval label={String(i+1)} size={30}/><span>{x}</span></li>)}</ol><p className="mt-3 text-sm text-ink-soft">Khan reports and Khanpanion practice stay separate records. Khanpanion never reads Khan data.</p></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold">2. Run a mock exam day</h2><ol className="mt-3 grid gap-2 text-[16px]">{['Print a booklet and answer sheets from the Mocks tab, one per learner.','Read the instructions aloud: time per section, no phones, blanks are fine.','Time each section; announce halfway and five minutes left.','Collect sheets. Learners type their own answers into the scoring screen afterwards and see their fixes.','Close with ten minutes on the most-missed question as a group.'].map((x,i)=><li key={i} className="flex gap-3"><Oval label={String(i+1)} size={30}/><span>{x}</span></li>)}</ol><Link className={cx(btn.text,'mt-2')} href="/mock">Printable mocks and answer keys</Link></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold">3. Weekly aggregate sheet</h2><p className="mt-1 text-ink-soft">Learners read out, or hand in, three numbers each week. No names needed; use seat numbers.</p><table className="mt-4 w-full text-left text-sm"><thead><tr className="border-b-2 border-navy">{['Seat','Study days','Missions','Latest mock','Top miss'].map(h=><th key={h} className="py-2 pr-2">{h}</th>)}</tr></thead><tbody>{[1,2,3,4,5].map(r=><tr key={r} className="border-b border-mint-line">{[r,'','','',''].map((c,i)=><td key={i} className="h-10 py-2 pr-2">{c}</td>)}</tr>)}</tbody></table><button className={cx(btn.ghost,'mt-4 print:hidden')} onClick={()=>window.print()}>Print this page</button></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold">4. Consent template</h2><p className="mt-1 text-ink-soft">For schools that want written consent before learners share anything.</p><div className="mt-4 rounded-2xl bg-sky p-4 font-serif text-[16px] leading-relaxed"><p>I agree that my child, a learner in ________________, may use Khanpanion, a free study website, as part of the school’s review program. I understand that Khanpanion has no accounts, that my child’s progress is stored only on the device used, and that my child chooses what, if anything, to share with the teacher.</p><p className="mt-4">Parent or guardian: ________________ Date: __________</p></div></Sheet>
   </div>
   <Sheet className="mt-5"><h2 className="text-xl font-extrabold">Earlier teacher tools</h2><div className="mt-3 flex flex-wrap gap-2"><Link className={btn.ghost} href="/classrooms">Class routine planner</Link><Link className={btn.ghost} href="/schools">For schools</Link></div></Sheet>
  </div>
 </>;
}

export function Me(){
 const {state,update}=useProgram(),study=useStudy(),lang=state.lang;
 const [msg,setMsg]=useState(''),[confirm,setConfirm]=useState(false);
 function exportAll(){const data={kind:'khanpanion-backup',version:1,exportedAt:new Date().toISOString(),study:study.state,program:state};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='khanpanion-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setMsg('Backup downloaded.');}
 async function importAll(file:File){try{if(file.size>5_000_000)throw Error('Choose a file smaller than 5 MB.');const data=JSON.parse(await file.text());if(data?.kind!=='khanpanion-backup')throw Error('This is not a Khanpanion backup file.');if(!validProgram(data.program)||!validStudy(data.study))throw Error('This backup could not be read.');try{localStorage.setItem(`backtrack.program.backup.${Date.now()}`,localStorage.getItem(PROGRAM_KEY)??'{}');}catch{}study.restore(data.study);update(()=>data.program);setMsg('Backup restored. Your earlier plan was kept as a backup.');}catch(e){setMsg(e instanceof Error?e.message:'This backup could not be read.');}}
 return <>
  <PageBand title="Me" lead="Settings, language and backups. Nothing here leaves your phone unless you download it."/>
  <div className={pageBody}>
   <div className="grid gap-5 lg:grid-cols-2">
    <Sheet><h2 className="text-2xl font-extrabold">{t(lang,'me.language')}</h2><div className="mt-3 flex gap-2">{(['en','fil'] as const).map(l=><button key={l} aria-pressed={lang===l} onClick={()=>update(s=>({...s,lang:l}))} className="min-h-11 rounded-full border-2 border-navy/15 px-5 font-bold aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white">{l==='en'?'English':'Filipino'}</button>)}</div><p className="mt-2 text-sm text-ink-soft">Filipino covers navigation, the pledge, Today and the exam screens.</p></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold">Which sides</h2><div className="mt-3 grid gap-2">{(['admission','bridge'] as const).map(s=><label key={s} className="flex min-h-11 items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-[#14bf96]" checked={state.sides[s]} onChange={e=>update(p=>({...p,sides:{...p.sides,[s]:e.target.checked},activeSide:e.target.checked?s:p.activeSide}))}/>{t(lang,`side.${s}`)}</label>)}</div><div className="mt-3 flex flex-wrap gap-2"><Link className={btn.ghost} href="/plan#pledge">{t(lang,'me.pledge')}</Link><Link className={btn.ghost} href="/bridge">{t(lang,'me.bridge')}</Link></div></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold">Motion and sound</h2><label className="mt-3 flex min-h-11 items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-[#14bf96]" checked={study.state.settings.quiet} onChange={e=>study.update(s=>({...s,settings:{...s.settings,quiet:e.target.checked},updatedAt:Date.now()}))}/>Quiet mode: still pictures, no movement</label><label className="flex min-h-11 items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-[#14bf96]" checked={study.state.settings.sound} onChange={e=>study.update(s=>({...s,settings:{...s.settings,sound:e.target.checked},updatedAt:Date.now()}))}/>Sounds when a round finishes</label><button className={cx(btn.text,'mt-2')} onClick={()=>{study.update(s=>({...s,settings:{...s.settings,tourDone:false},updatedAt:Date.now()}));window.location.href='/study';}}>Replay the welcome tour</button></Sheet>
    <Sheet><h2 className="text-2xl font-extrabold">Backups</h2><p className="mt-1 text-ink-soft">One file holds your plan, mock results, notebook and practice history.</p><div className="mt-3 flex flex-wrap gap-2"><button className={btn.primary} onClick={exportAll}>Download a backup</button><label className={cx(btn.ghost,'cursor-pointer')}>Restore a backup<input type="file" accept="application/json,.json" className="sr-only" onChange={e=>{const f=e.target.files?.[0];e.currentTarget.value='';if(f)void importAll(f);}}/></label></div>{msg&&<p role="status" className="mt-2 text-sm">{msg}</p>}<div className="mt-4"><StudyBackups/></div></Sheet>
    <Sheet className="lg:col-span-2"><h2 className="text-2xl font-extrabold">Shared or borrowed phone?</h2><p className="mt-1 text-ink-soft">Clearing removes your plan, results and practice history from this browser. Download a backup first if you want to keep them.</p>{confirm?<div className="mt-3 flex flex-wrap gap-2"><button className={btn.dark} onClick={()=>{if(study.clear())setMsg('This browser is clear.');setConfirm(false);}}>Yes, clear everything</button><button className={btn.ghost} onClick={()=>setConfirm(false)}>Cancel</button></div>:<button className={cx(btn.ghost,'mt-3')} onClick={()=>setConfirm(true)}>Clear this device</button>}</Sheet>
   </div>
  </div>
 </>;
}
