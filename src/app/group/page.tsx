import {Suspense} from 'react';
import {Group} from '@/components/k/GroupCoachMe';
export default function Page(){return <Suspense fallback={<div className="min-h-screen bg-navy"/>}><Group/></Suspense>;}
