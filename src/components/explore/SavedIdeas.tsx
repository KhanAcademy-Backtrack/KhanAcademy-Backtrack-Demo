'use client';
import Link from 'next/link';
import {useStudy} from '@/components/study/StudyProvider';
import {exploreItem,savedExplore} from '@/lib/explore';
export function SavedIdeas(){const {state}=useStudy(),saved=savedExplore(state.explore).saved;if(!saved.length)return null;return <div className="discovery-saved"><span>Ideas you saved</span>{saved.slice(0,3).map(id=><Link key={id} href={`/explore?item=${id}`}>{exploreItem(id)!.title} ↗</Link>)}{saved.length>3&&<Link href="/explore">All saved ideas ↗</Link>}</div>;}
