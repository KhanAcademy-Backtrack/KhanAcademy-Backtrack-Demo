import {notFound} from 'next/navigation';
import {BridgeProgramPage} from '@/components/k/Bridge';
import {PROGRAMS} from '@/lib/program/bridge';
export const dynamicParams=false;
export const generateStaticParams=()=>PROGRAMS.map(p=>({program:p.id}));
export default async function Page({params}:{params:Promise<{program:string}>}){const {program}=await params;if(!PROGRAMS.some(p=>p.id===program))notFound();return <BridgeProgramPage id={program}/>;}
