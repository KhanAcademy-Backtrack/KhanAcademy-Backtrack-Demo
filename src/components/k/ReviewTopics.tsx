'use client';
import {useRouter} from 'next/navigation';
import {TopicPicker} from './TopicPicker';
import {CONCEPTS} from '@/lib/program/concepts';
const items=CONCEPTS.map(c=>({id:c.id,label:c.title,category:c.subtest==='science'?c.area:c.subtest==='math'?'Math':c.subtest==='language'?'Language':'Reading',search:c.area}));
export function ReviewTopics(){const router=useRouter();return <TopicPicker items={items} onChoose={id=>{if(id)router.push('/learn/'+id);}}/>;}
