'use client';
import {useRouter} from 'next/navigation';
import {useCallback} from 'react';
import {useStudy} from '@/components/study/StudyProvider';
import {PACKS,beginSession,type StudySession} from '@/lib/study';
import {LABELS,type Topic,type Skill} from '@/lib/recovery';

/** Opens a diagnosis-and-repair session on one skill. A mock miss only SEEDS the
 *  session: passing it still takes the engine's two fresh, unassisted answers. */
export function useFix(){
 const {update}=useStudy(),router=useRouter();
 return useCallback((topic:Topic,skill:Skill,reason:string)=>{
  const now=Date.now(),pack=PACKS.find(p=>p.topics.includes(topic))??PACKS[0];
  const session:StudySession={id:`fix-${now}`,packId:pack.id,minutes:10,tasks:[{id:`${now}-0-${topic}-${skill}`,topic,skill,mode:'learn',reason:reason||`From your practice: ${LABELS[skill]}`}],deferred:0,startedAt:now,lastAt:now,index:0,complete:false,rewarded:false,difficultyAdjusted:false,oneQuestionPerTask:false};
  update(s=>beginSession(s,session,now));
  router.push('/study/session');
 },[update,router]);
}
