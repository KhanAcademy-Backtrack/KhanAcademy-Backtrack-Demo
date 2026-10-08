import {notFound} from 'next/navigation';
import {Suspense} from 'react';
import {LearnConcept} from '@/components/k/LearnConcept';
import {CONCEPTS} from '@/lib/program/concepts';
export const dynamicParams=false;
export const generateStaticParams=()=>CONCEPTS.map(c=>({concept:c.id}));
export default async function Page({params}:{params:Promise<{concept:string}>}){const {concept}=await params;if(!CONCEPTS.some(c=>c.id===concept))notFound();return <Suspense fallback={<p role="status">Opening your topic…</p>}><LearnConcept id={concept}/></Suspense>;}
