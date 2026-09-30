import {Suspense} from 'react';
import {ExamHall} from '@/components/k/ExamHall';
export default function Page(){return <Suspense fallback={<div role="status" className="min-h-screen bg-navy"/>}><ExamHall/></Suspense>;}
