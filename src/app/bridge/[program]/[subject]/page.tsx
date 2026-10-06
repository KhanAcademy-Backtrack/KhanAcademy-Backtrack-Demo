import {notFound} from 'next/navigation';
import {BridgeSubjectPage} from '@/components/k/Bridge';
import {PROGRAMS} from '@/lib/program/bridge';
export const dynamicParams=false;
export const generateStaticParams=()=>PROGRAMS.flatMap(p=>p.subjects.map(subject=>({program:p.id,subject})));
export default async function Page({params}:{params:Promise<{program:string;subject:string}>}){const {program,subject}=await params;if(!PROGRAMS.some(p=>p.id===program&&p.subjects.includes(subject)))notFound();return <BridgeSubjectPage program={program} subject={subject}/>;}
