import {Suspense} from 'react';
import {StudySpace} from '@/components/study/StudySpace';
export default function Packs(){return <Suspense fallback={<p className="study-loading">Opening your study space…</p>}><StudySpace view="packs"/></Suspense>;}
