import {notFound} from 'next/navigation';
import {ChapterPage,ExtraPage} from '@/components/k/Reviewer';
import {CHAPTERS} from '@/content/reviewer';
import {EXTRAS} from '@/content/reviewer/extras';
export const dynamicParams=false;
export const generateStaticParams=()=>[...CHAPTERS,...EXTRAS].map(c=>({chapter:c.id}));
export default async function Page({params}:{params:Promise<{chapter:string}>}){const {chapter}=await params;if(CHAPTERS.some(c=>c.id===chapter))return <ChapterPage id={chapter}/>;if(EXTRAS.some(c=>c.id===chapter))return <ExtraPage id={chapter}/>;notFound();}
