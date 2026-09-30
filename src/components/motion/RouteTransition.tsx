'use client';
import {useEffect,useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {motion} from 'motion/react';
import {useMotionPolicy} from './MotionPolicy';
import {DUR,tween} from '@/lib/motion-tokens';

/** Navigation orients once. The exam hall owns its focused entry sequence. */
export function RouteTransition({children}:{children:ReactNode}){
 const path=usePathname(),{off}=useMotionPolicy(),[mounted,setMounted]=useState(false);
 useEffect(()=>setMounted(true),[]);
 // Keep the first server-rendered screen visible while JavaScript starts.
 const still=!mounted||off||path.startsWith('/mock/take');
 return <motion.div key={path} initial={still?false:{opacity:0}} animate={{opacity:1}} transition={tween(still,DUR.fast)}>{children}</motion.div>;
}
