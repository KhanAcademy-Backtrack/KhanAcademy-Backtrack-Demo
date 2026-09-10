'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {RecoveryApp} from '@/components/product/RecoveryApp';
import {useStudy} from './StudyProvider';
import {PackNotes} from './PackNotes';
import {Companion} from './Companion';
import {allPacks,prepareRound,completeStudyTask,smallerSession,type StudyTask} from '@/lib/study';
import {LABELS,TOPICS,type Recovery} from '@/lib/recovery';

function playFinish(){try{const context=new AudioContext();const oscillator=context.createOscillator(),gain=context.createGain();oscillator.connect(gain);gain.connect(context.destination);gain.gain.setValueAtTime(.025,context.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.25);oscillator.frequency.setValueAtTime(523.25,context.currentTime);oscillator.frequency.setValueAtTime(659.25,context.currentTime+.1);oscillator.start();oscillator.stop(context.currentTime+.3);oscillator.onended=()=>{void context.close();};}catch{}}
export function StudySession(){
  const {state:s,ready,update}=useStudy();if(!ready)return <p className="study-loading">Opening your saved session…</p>;
  const session=s.activeSession;if(!session)return <div className="study-empty-page"><Companion/><h1>Let’s prepare a useful round.</h1><Link className="button-primary" href="/study">Choose a study session ↗</Link></div>;
  const pack=allPacks(s).find(x=>x.id===session.packId),task=session.tasks[session.index];
  if(session.complete)return <div className="session-complete"><Companion accessory={s.settings.accessory} size={155}/><p className="eyebrow">A useful place to finish</p><h1>{session.tasks.some(t=>t.outcome==='checked')?'You used it on fresh problems.':'You gave a difficult step some attention.'}</h1><p>{session.tasks.filter(t=>t.outcome==='checked').length} {session.tasks.filter(t=>t.outcome==='checked').length===1?'round':'rounds'} finished with independent checks. Your reviewer has the next useful look.</p><div className="completed-rounds">{session.tasks.map(t=><div key={t.id}><span>{t.outcome==='checked'?'✓':'↻'}</span><div><strong>{t.skill==='goal'?TOPICS[t.topic].label:LABELS[t.skill]}</strong><small>{t.outcome==='checked'?'Fresh checks passed':'Keep reviewing this step'}</small></div></div>)}</div><p className="session-points">{session.rewarded?'Study points earned for useful effort. Your learning evidence stays separate.':'Your work is saved. New useful rounds can earn study points.'}</p>{session.deferred>0&&<p className="quiet">{session.deferred} other {session.deferred===1?'step stays':'steps stay'} available in your pack.</p>}<SessionNote sessionId={session.id} note={session.note??''}/><div className="session-finish-actions"><Link className="button-primary" href="/review">See my reviewer ↗</Link><Link className="button-secondary" href="/study">Choose another round</Link><Link className="button-text" href="/">Done for now</Link></div></div>;
  if(!task)return <div className="study-empty-page"><h1>Your session needs a new plan.</h1><Link href="/study">Choose your next session</Link></div>;
  return <div className="study-session"><div className="session-toolbar"><div><span className="eyebrow">{pack?.name??'Your selected topics'}</span><strong>Round {session.index+1} of {session.tasks.length} · {session.rehearsal?'Quiz rehearsal':task.mode==='learn'?'Learn':task.mode==='review'?'Fresh practice':'Challenge'}</strong></div><div><button disabled={session.tasks.length-session.index<=1} onClick={()=>update(st=>({...st,activeSession:st.activeSession?smallerSession(st.activeSession):undefined,updatedAt:Date.now()}))}>Make it smaller</button><Link href="/">Save & stop</Link></div></div>{session.difficultyAdjusted&&<p className="session-adjustment">This step needs more room. One later round has been kept for another session.</p>}<p className="session-reason">{task.reason}</p>{!session.rehearsal&&pack?.cards?.length?<div className="session-personal-notes"><PackNotes pack={pack}/></div>:null}<SessionTask key={task.id} task={task} rehearsal={session.rehearsal} onDone={route=>{update(st=>completeStudyTask(st,route,Date.now(),task.id));if(s.settings.sound&&!s.settings.quiet)playFinish();}}/></div>;
}
function SessionTask({task,onDone,rehearsal=false}:{task:StudyTask;onDone:(route:Recovery)=>void;rehearsal?:boolean}){
  const {state,update}=useStudy();const [launch]=useState(()=>({id:task.id,resume:!!task.startedAt,initial:prepareRound(state,task,Date.now())}));
  useEffect(()=>{if(!task.startedAt)update(s=>({...s,activeSession:s.activeSession?{...s.activeSession,tasks:s.activeSession.tasks.map(t=>t.id===task.id?{...t,startedAt:Date.now()}:t)}:undefined,updatedAt:Date.now()}));},[task.id,task.startedAt,update]);
  return <RecoveryApp topic={task.topic} launch={launch} roundSkill={task.skill} roundStartedAt={task.startedAt} rehearsal={rehearsal} onRoundComplete={onDone}/>;
}

function SessionNote({sessionId,note}:{sessionId:string;note:string}){
 const {update}=useStudy();const [text,setText]=useState(note),[saved,setSaved]=useState(false);
 return <section className="session-note"><h2>A note to future you.</h2><p>Your checks and reviewer are already saved. Add anything you want to remember next time.</p><textarea aria-label="Note to future you" value={text} maxLength={500} placeholder="Next time I want to look at…" onChange={e=>{setText(e.target.value);setSaved(false);}}/><button className="button-secondary" onClick={()=>{update(s=>({...s,sessions:s.sessions.map(x=>x.id===sessionId?{...x,note:text}:x),activeSession:s.activeSession?.id===sessionId?{...s.activeSession,note:text}:s.activeSession,updatedAt:Date.now()}));setSaved(true);}}>{saved?'Note saved ✓':'Save my note'}</button></section>;
}
