import {Suspense} from 'react';
import {StudySpace} from '@/components/study/StudySpace';
export default function Home(){return <Suspense fallback={<p className="study-loading">Opening your study space…</p>}><StudySpace view="today"/></Suspense>;}
