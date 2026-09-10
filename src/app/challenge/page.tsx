import {Suspense} from 'react';
import {ChallengeExperience} from '@/components/study/ChallengeExperience';
export default function Challenge(){return <Suspense fallback={<p className="study-loading">Opening your challenge…</p>}><ChallengeExperience/></Suspense>;}
