import {notFound} from 'next/navigation';
import {Suspense} from 'react';
import {ChapterPage,ExtraPage} from '@/components/k/Reviewer';
import {CHAPTERS} from '@/content/reviewer';
import {EXTRAS} from '@/content/reviewer/extras';
export const dynamicParams=false;
export const generateStaticParams=()=>[...CHAPTERS,...EXTRAS].map(c=>({chapter:c.id}));
export default async function Page({params}:{params:Promise<{chapter:string}>}){const {chapter}=await params;if(CHAPTERS.some(c=>c.id===chapter))return <Suspense fallback={<p role="status">Opening your chapter…</p>}><ChapterPage id={chapter}/></Suspense>;if(EXTRAS.some(c=>c.id===chapter))return <ExtraPage id={chapter}/>;notFound();}
