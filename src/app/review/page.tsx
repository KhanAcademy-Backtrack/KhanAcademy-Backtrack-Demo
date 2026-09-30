import {Suspense} from 'react';
import {DailyRecall} from '@/components/k/DailyRecall';
import {StudySpace} from '@/components/study/StudySpace';
export default function Review(){return <Suspense fallback={<p className="study-loading">Opening your study space…</p>}><DailyRecall/><StudySpace view="review"/></Suspense>;}
