'use client';
import Link from 'next/link';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';

/** Compatibility for old bookmarks: the activity picker has been retired. */
export default function FromKhan(){
 const router=useRouter();
 useEffect(()=>{router.replace('/reviewer');},[router]);
 return <p className="study-loading"><Link href="/reviewer">Open Study</Link></p>;
}
