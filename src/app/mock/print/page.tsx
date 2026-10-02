import {Suspense} from 'react';
import {PrintBooklet} from '@/components/k/PrintBooklet';
export default function Page(){return <Suspense fallback={<div role="status" className="min-h-screen"/>}><PrintBooklet/></Suspense>;}
