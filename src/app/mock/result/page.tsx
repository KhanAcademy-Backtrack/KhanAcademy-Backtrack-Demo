import {Suspense} from 'react';
import {Results} from '@/components/k/Results';
export default function Page(){return <Suspense fallback={<div role="status" className="min-h-screen bg-navy"/>}><Results/></Suspense>;}
