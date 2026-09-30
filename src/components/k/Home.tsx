'use client';
import {useProgram} from './ProgramProvider';
import {GoalSetup} from './GoalSetup';
import {useProgramGuide} from './ProgramTourProvider';
import {lazy,Suspense} from 'react';
const BrowseHome=lazy(()=>import('./BrowseHome').then(m=>({default:m.BrowseHome})));
const PersonalHome=lazy(()=>import('./PersonalHome').then(m=>({default:m.PersonalHome})));
const Today=lazy(()=>import('./Today').then(m=>({default:m.Today})));

/** First visit: the landing. Once a learner has chosen a side, Today. */
export function Home(){
 const {state,ready}=useProgram(),guide=useProgramGuide();
 if(guide.browsing)return <Suspense fallback={<div className="min-h-screen bg-navy"/>}><BrowseHome/></Suspense>;
 if(state.setup)return <Suspense fallback={<div className="min-h-screen bg-navy"/>}><PersonalHome/></Suspense>;
 if(!ready)return <div className="min-h-[70vh] bg-navy"/>;
 return state.setup||state.sides.admission||state.sides.bridge||state.pledge?<Suspense fallback={<div className="min-h-screen bg-navy"/>}><Today/></Suspense>:<div className="bg-navy pb-12"><div className="mx-auto grid max-w-6xl items-start gap-7 px-4 pt-7 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-12 lg:pt-14"><div className="@container hidden text-white lg:block lg:sticky lg:top-28"><p className="text-[clamp(2rem,12.5cqw,2.55rem)] font-extrabold leading-tight tracking-[-.045em] sm:text-5xl"><span className="block">Know what to</span>{' '}<span className="block">study next.</span></p><p className="mt-4 max-w-md text-[17px] leading-relaxed text-white/80">Start with what you need. Your topics, guide and study week will follow.</p><p className="mt-4 text-sm text-white/65">No account needed. Your progress stays in this browser.</p></div><GoalSetup onSaved={guide.finishSetup} onBrowse={guide.browseNow}/></div></div>;
}
