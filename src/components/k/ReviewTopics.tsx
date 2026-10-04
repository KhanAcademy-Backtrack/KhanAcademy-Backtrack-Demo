'use client';
import {useRouter} from 'next/navigation';
import {useMemo} from 'react';
import {TopicPicker,type TopicChoice} from './TopicPicker';
import {CONCEPTS} from '@/lib/program/concepts';
import {EXAM_COVERAGE,examTopics,listNames} from '@/lib/program/exam-coverage';
import type {ExamId} from '@/lib/program/admissions';
const ALL:TopicChoice[]=CONCEPTS.map(c=>({id:c.id,label:c.title,category:c.subtest==='science'?c.area:c.subtest==='math'?'Math':c.subtest==='language'?'Language':'Reading',search:c.area}));
/** With an exam, the subjects are that exam's own sections in its order, and topics outside them are left out. */
const itemsFor=(exam?:ExamId):TopicChoice[]=>exam?examTopics(exam).map(({concept:c,section})=>({id:c.id,label:c.title,category:section,search:c.area})):ALL;
export function ReviewTopics({exam}:{exam?:ExamId}){
 const router=useRouter(),items=useMemo(()=>itemsFor(exam),[exam]),missing=exam?EXAM_COVERAGE[exam].sections.filter(s=>!s.reviewer.length).map(s=>s.name):[];
 return <><TopicPicker key={exam??'all'} items={items} onChoose={id=>{if(id)router.push('/learn/'+id);}}/>{missing.length>0&&<p className="mt-3 text-sm text-ink-soft">The reviewer does not have {listNames(missing)} material yet.</p>}</>;
}
