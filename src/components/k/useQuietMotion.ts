'use client';
import {useReducedMotion} from 'motion/react';
import {useStudy} from '@/components/study/StudyProvider';
export function useQuietMotion(){const reduced=useReducedMotion(),{state}=useStudy();return reduced||state.settings.quiet;}
