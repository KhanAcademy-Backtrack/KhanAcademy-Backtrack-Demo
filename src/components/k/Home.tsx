'use client';
import {useProgram} from './ProgramProvider';
import {Landing} from './Landing';
import {Today} from './Today';

/** First visit: the landing. Once a learner has chosen a side, Today. */
export function Home(){
 const {state,ready}=useProgram();
 if(!ready)return <div className="min-h-[70vh] bg-navy"/>;
 return state.sides.admission||state.sides.bridge||state.pledge?<Today/>:<Landing/>;
}
