'use client';
import {useEffect,useRef,useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {findChallenge,CHALLENGES,challengeNextStep,type Challenge} from '@/lib/challenges';
import {isCorrect,answerInputIssue,pairKey,type Confidence} from '@/lib/recovery';
import {khanEntry} from '@/lib/khan-entry';
import {packFromKhan,beginSession,planSession,skillKey,PACKS,type StudyEvent} from '@/lib/study';
import {useStudy} from './StudyProvider';
import {MathText} from '@/components/math/Math';
import {ErrorReplay} from '@/components/product/ErrorReplay';
import {ConfidenceChoices} from '@/components/product/ConfidenceChoices';
import {ConceptLab} from './ConceptLab';
import {PackKhanResources} from './PackKhanResources';
import {AnswerFields} from '@/components/product/AnswerFields';

export function ChallengeExperience(){
 const params=useSearchParams(),challenge=findChallenge(params.get('code')??''),router=useRouter();const [code,setCode]=useState('');
 return challenge?<ChallengeRound key={challenge.code} challenge={challenge}/>:<div className="study-space challenge-missing"><h1>Find your challenge.</h1><p>Enter the short code from the video or shared link.</p><form className="challenge-code" onSubmit={e=>{e.preventDefault();router.push(`/challenge?code=${encodeURIComponent(code.trim().toUpperCase())}`);}}><label>Challenge code<input value={code} onChange={e=>setCode(e.target.value)} maxLength={8} placeholder="FQ1"/></label><button className="button-primary">Open challenge</button></form>{params.has('code')&&<p role="status">That code did not match. Check its letters and numbers.</p>}<div className="challenge-suggestions">{[CHALLENGES[0],CHALLENGES[4],CHALLENGES[8]].map(c=><Link key={c.code} href={`/challenge?code=${c.code}`}>{c.title} ↗</Link>)}</div></div>;
}
function ChallengeRound({challenge:c}:{challenge:Challenge}){
 const {ready,update}=useStudy(),router=useRouter();
 const [values,setValues]=useState(c.question.labels.map(()=>'')),[confidence,setConfidence]=useState<Confidence>('unsure'),[unknown,setUnknown]=useState(false),[checked,setChecked]=useState(false),[error,setError]=useState(''),[explain,setExplain]=useState(false);
 // A challenge without a matched Khan activity still leads into a real pack.
 const logged=useRef(false),entry=khanEntry(c.khanId),pack=entry?packFromKhan(entry):PACKS.find(p=>p.topics.includes(c.topic))!;
 const topic=entry?.topic??c.topic,skill=entry?.skill??'goal';
 const correct=checked&&!unknown&&isCorrect(c.question,values),nextStep=challengeNextStep(confidence,correct,unknown);
 useEffect(()=>{if(!ready||logged.current)return;logged.current=true;update(s=>({...s,seen:[...new Set([...s.seen,`${skillKey(topic,skill)}:${c.question.expression}`])],cursors:{...s.cursors,[topic]:Math.max(s.cursors[topic]??0,1)},pairs:c.family==='factors'?{...s.pairs,quadratics:[...new Set([...(s.pairs.quadratics??[]),pairKey([3,4])])]}:s.pairs,events:[...s.events,{kind:'challenge_open' as const,at:Date.now(),detail:c.code}].slice(-1000),updatedAt:Date.now()}));},[ready,c.code,update,topic,skill,c.family,c.question.expression]);
 function respond(dontKnow=false){
  if(!dontKnow){const issue=answerInputIssue(c.question,values);if(issue){setError(issue);return;}}
  const response=dontKnow?'unknown':isCorrect(c.question,values)?'correct':'incorrect';
  setError('');setUnknown(dontKnow);setChecked(true);setExplain(false);if(dontKnow)setValues(c.question.labels.map(()=>''));
  const event:StudyEvent={kind:'challenge_attempt',at:Date.now(),detail:`${c.code}:${response}`,confidence,response};
  update(s=>({...s,events:[...s.events,event].slice(-1000),updatedAt:Date.now()}));
 }
 function begin(afterExplanation=false){
  update(s=>{const exposed={...s,cursors:{...s.cursors,[topic]:Math.max(s.cursors[topic]??0,1)},pairs:c.family==='factors'?{...s.pairs,quadratics:[...new Set([...(s.pairs.quadratics??[]),pairKey([3,4])])]}:s.pairs};const choice=afterExplanation?{mode:'challenge' as const,reason:'Use the explanation on a fresh example.'}:nextStep;const session=planSession(exposed,pack,5,choice.mode,Date.now());session.tasks=session.tasks.map((t,i)=>i===0?{...t,reason:choice.reason}:t);return beginSession({...exposed,packs:[...s.packs.filter(p=>p.id!==pack.id),pack]},session,Date.now());});router.push('/study/session');
 }
 const numericAttempt=values.map(v=>Number(v.replace(/[−–－]/g,'-'))) as [number,number];
 return <div className="study-space challenge-page"><div className="challenge-heading"><div><p className="eyebrow">Challenge {c.code}</p><h1>{c.title}</h1><p>{c.hook}</p></div><Link className="button-text" href="/packs">My packs ↗</Link></div>
  <section className="source-challenge"><h2>{c.question.prompt}</h2><MathText size="hero" speak={c.question.speak}>{c.question.expression}</MathText>
   <form onSubmit={e=>{e.preventDefault();respond();}}><div className="answer-inputs"><AnswerFields p={c.question} values={values} onChange={(i,v)=>{setValues(xs=>xs.map((x,j)=>i===j?v:x));setChecked(false);setUnknown(false);setError('');setExplain(false);}}/></div>
    <ConfidenceChoices value={confidence} onChange={value=>{setConfidence(value);setChecked(false);setUnknown(false);setExplain(false);}}/>
    {error&&<p role="alert">{error}</p>}<div className="question-actions"><button className="button-primary" disabled={!ready||values.some(x=>!x.trim())}>Check this answer</button><button className="button-text" type="button" disabled={!ready} onClick={()=>respond(true)}>I don’t know yet</button></div>
   </form>
   {checked&&<div className="challenge-feedback" role="status"><h3>{unknown?'Let’s find your starting point.':correct?'That fits. Ready for a new version?':'Let’s look at the step together.'}</h3><p>{unknown?'A short check can show which step to work on first.':c.insight}</p><div><button className={unknown||correct?'button-primary':'button-secondary'} onClick={()=>begin()}>{unknown?'Find my starting point ↗':nextStep.mode==='learn'?'Start with a refresher ↗':'Try a fresh question ↗'}</button><button className={unknown||correct?'button-text':'button-primary'} onClick={()=>setExplain(!explain)}>{explain?'Close explanation':'Make the idea click'}</button></div></div>}
  </section>
  {explain&&(c.family==='factors'?<ErrorReplay model={{kind:'factors',pair:[3,4],attempt:unknown?[2,6]:numericAttempt,fromAttempt:!unknown}} onExpose={pair=>update(s=>({...s,pairs:{...s.pairs,quadratics:[...new Set([...(s.pairs.quadratics??[]),pairKey(pair)])]},updatedAt:Date.now()}))} onContinue={()=>begin(true)}/>:<ConceptLab kind={c.family} onContinue={()=>begin(true)}/>)}
  <section className="challenge-next"><h2>{entry?'Keep going with this Khan activity.':'Keep going with this study pack.'}</h2><p>{entry?`${entry.title}. The same learning goal continues into your pack and reviewer.`:`${pack.name}. The same learning goal continues into your pack and reviewer.`}</p><PackKhanResources pack={pack}/><button className="button-text" onClick={()=>{update(s=>({...s,packs:[...s.packs.filter(x=>x.id!==pack.id),pack],activePack:pack.id,updatedAt:Date.now()}));router.push('/packs');}}>Save this study pack ↗</button></section>
 </div>;
}
