import {KHAN_ENTRIES,canonicalKhanPath,type KhanEntry} from '../khan-entry.ts';
import {TOPIC_LESSONS,type TopicLesson} from './topic-lessons.ts';
import type {ExamId} from './admissions.ts';
export {isLessonReturnPath} from '../khan-return-path.ts';

/** Reuse reviewed activities only. A practice activity can teach one part of a broader
 * outline topic; its own title, rather than the outline's title, describes its scope. */
const PRACTICE_PARTS:Record<string,string>={
 'Ratio and proportion':'unit-rates',
 'Quadratic equations':'solve-quadratics',
};
export function lessonKhanPractice(lesson:TopicLesson):KhanEntry|undefined{
 if(!lesson.videos.length)return;
 return KHAN_ENTRIES.find(e=>lesson.videos.some(v=>v.url===e.learning.url))
  ??KHAN_ENTRIES.find(e=>e.id===PRACTICE_PARTS[lesson.title]);
}

/** Respect an exam's own material; never silently use UPCAT as another exam's outline. */
export function recommendedKhanLesson(concept:string,exam:ExamId='upcat'){
 const lessons=TOPIC_LESSONS.filter(l=>l.exam===exam&&l.concepts.includes(concept));
 return lessons.find(l=>l.videos.length>0)??lessons[0];
}

/** Recognize exact, already reviewed video pages without inventing engine topics. */
export function resolveKhanLessonUrl(raw:string){
 if(raw.length>2048)return;
 const path=canonicalKhanPath(raw);if(!path)return;
 return TOPIC_LESSONS.find(l=>l.videos.some(v=>canonicalKhanPath(v.url)===path));
}
