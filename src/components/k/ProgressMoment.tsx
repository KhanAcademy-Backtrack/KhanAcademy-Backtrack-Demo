'use client';
import type {ReactNode} from 'react';
import {motion} from 'motion/react';
import {useQuietMotion} from './useQuietMotion';
import {DUR,EASE} from '@/lib/motion-tokens';
/** A single feedback motion. The complete message remains in static modes. */
export function ProgressMoment({children}:{children:ReactNode}){
 const off=useQuietMotion();
 return <motion.div role="status" initial={off?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:off?0:DUR.base,ease:EASE as unknown as [number,number,number,number]}} className="mt-3 rounded-2xl border-2 border-green bg-mint px-4 py-3 font-bold text-navy">{children}</motion.div>;
}
