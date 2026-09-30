import {Suspense} from 'react';
import {CalendarView} from '@/components/k/CalendarView';
export default function Page(){return <Suspense fallback={<div className="min-h-screen bg-navy"/>}><CalendarView/></Suspense>;}
