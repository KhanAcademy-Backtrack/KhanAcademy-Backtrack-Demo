'use client';
import {useMotionPolicy} from '@/components/motion/MotionPolicy';
export function useQuietMotion(){return useMotionPolicy().off;}
