import {Suspense} from 'react';
import {PackCreator} from '@/components/study/PackCreator';
export default function Page(){return <Suspense fallback={<p className="study-loading">Opening your pack…</p>}><PackCreator/></Suspense>;}
