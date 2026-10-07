import {notFound} from 'next/navigation';
import {TOPIC_LESSONS,LESSON_BY_ID} from '@/lib/program/topic-lessons';
import {TopicLessonPage} from '@/components/k/TopicLesson';
export const dynamicParams=false;
export const generateStaticParams=()=>TOPIC_LESSONS.map(l=>({lesson:l.id}));
export async function generateMetadata({params}:{params:Promise<{lesson:string}>}){const {lesson}=await params;return {title:LESSON_BY_ID[lesson]?.title??'Lesson'};}
export default async function Page({params}:{params:Promise<{lesson:string}>}){const {lesson}=await params;const material=Object.hasOwn(LESSON_BY_ID,lesson)?LESSON_BY_ID[lesson]:undefined;if(!material)notFound();return <TopicLessonPage lesson={material}/>;}
