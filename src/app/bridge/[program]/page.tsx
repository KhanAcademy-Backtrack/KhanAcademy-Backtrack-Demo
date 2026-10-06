import {notFound} from 'next/navigation';
import {BridgeProgramPage,RetiredProgram} from '@/components/k/Bridge';
import {PROGRAMS,RETIRED_PROGRAMS} from '@/lib/program/bridge';
export const dynamicParams=false;
export const generateStaticParams=()=>[...PROGRAMS.map(p=>p.id),...Object.keys(RETIRED_PROGRAMS)].map(program=>({program}));
export default async function Page({params}:{params:Promise<{program:string}>}){const {program}=await params;if(Object.hasOwn(RETIRED_PROGRAMS,program))return <RetiredProgram id={program}/>;if(!PROGRAMS.some(p=>p.id===program))notFound();return <BridgeProgramPage id={program}/>;}
