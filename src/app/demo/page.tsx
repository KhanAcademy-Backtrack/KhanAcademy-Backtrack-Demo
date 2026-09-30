import {Suspense} from 'react';
import {StudySpace} from '@/components/study/StudySpace';
export default function Page(){return <Suspense fallback={<p role="status">Opening your study space…</p>}><StudySpace view="today"/></Suspense>;}
