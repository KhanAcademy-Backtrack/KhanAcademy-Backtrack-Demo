'use client';
import {useProgram} from './ProgramProvider';
import {Landing} from './Landing';
import {lazy,Suspense} from 'react';
const Today=lazy(()=>import('./Today').then(m=>({default:m.Today})));

/** First visit: the landing. Once a learner has chosen a side, Today. */
export function Home(){
 const {state,ready}=useProgram();
 if(!ready)return <div className="min-h-[70vh] bg-navy"/>;
 return state.sides.admission||state.sides.bridge||state.pledge?<Suspense fallback={<div className="min-h-screen bg-navy"/>}><Today/></Suspense>:<Landing/>;
}
