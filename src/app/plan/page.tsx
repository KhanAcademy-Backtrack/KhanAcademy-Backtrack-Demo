import {Suspense} from 'react';
import {PlanView} from '@/components/k/PlanView';
export default function Page(){return <Suspense fallback={<div role="status" className="min-h-screen"/>}><PlanView/></Suspense>;}
