import {Suspense} from 'react';
import {ExploreFeed} from '@/components/explore/ExploreFeed';
export const metadata={title:'Explore with Dunlo',description:'Explore original interactive ideas and focused Khan Academy lessons. Save a discovery, try it yourself and keep learning. Dunlo is an independent project.'};
export default function Explore(){return <Suspense fallback={<p className="study-loading">Opening Explore…</p>}><ExploreFeed/></Suspense>;}
