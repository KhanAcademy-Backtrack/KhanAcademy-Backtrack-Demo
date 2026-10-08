'use client';
import {useSearchParams} from 'next/navigation';

/** Navigation only: reload/back/share restore the lesson without writing study evidence. */
export function useLessonSelection(){
 return useSearchParams().get('lesson')??'';
}
export function selectLesson(id:string){
 const url=new URL(window.location.href);
 if(url.searchParams.get('lesson')===id)return;
 url.searchParams.set('lesson',id);
 // A worked-example/video anchor belongs to the old lesson.
 url.hash='';
 window.history.pushState(null,'',url.pathname+url.search);
}
