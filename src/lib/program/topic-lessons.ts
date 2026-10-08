import {EXAM_OUTLINES,topicKey} from './exam-outline.ts';
import type {ExamId} from './admissions.ts';
import {SUBJECTS} from './college-courses.ts';
import {outlineVideos,subjectTopicVideos,type KhanVideo} from './topic-videos.ts';
import {TOPIC_GUIDES,type TopicGuide} from '../../content/topic-guides.ts';
import {PROGRAMS} from './bridge.ts';

/** Lesson ids are navigation only, not BACKTRACK topic ids or evidence keys. Existing
 * bookmarks keep their original outline keys. No study/evidence state is written here. */
export type TopicLesson={id:string;title:string;section:string;group:string;exam?:ExamId;subject?:string;concepts:string[];videos:KhanVideo[];guide?:TopicGuide;saveKey?:string};
const slug=(s:string)=>s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const outlineLessonId=(exam:ExamId,title:string)=>topicKey(exam,title).replace(/:/g,'-');
export const subjectLessonId=(subject:string,title:string)=>'college-'+subject+'-'+slug(title);
/** Kept for existing shared links and the static compatibility pages. */
export const standaloneLessonHref=(id:string)=>'/learn/topic/'+id;
export const TOPIC_LESSONS:TopicLesson[]=[
 ...Object.entries(EXAM_OUTLINES).flatMap(([exam,outline])=>Object.entries(outline.sections).flatMap(([section,groups])=>groups.flatMap(g=>g.topics.map(t=>({
  id:outlineLessonId(exam as ExamId,t.title),title:t.title,section,group:g.name,exam:exam as ExamId,
  concepts:t.concepts??[],videos:outlineVideos(exam as ExamId,t.title),guide:TOPIC_GUIDES[t.title],saveKey:topicKey(exam as ExamId,t.title),
 }))))),
 ...SUBJECTS.flatMap(s=>s.topics.map(title=>({
  id:subjectLessonId(s.id,title),title,section:s.title,group:s.title,subject:s.id,
  concepts:[],videos:subjectTopicVideos(s.id,title),guide:TOPIC_GUIDES[title],
 }))),
];
export const LESSON_BY_ID:Record<string,TopicLesson>=Object.fromEntries(TOPIC_LESSONS.map(l=>[l.id,l]));
export const conceptLessons=(id:string,exam:ExamId='upcat')=>TOPIC_LESSONS.filter(l=>l.exam===exam&&l.concepts.includes(id));
export const subjectLessons=(id:string)=>TOPIC_LESSONS.filter(l=>l.subject===id);
export const lessonSiblings=(l:TopicLesson)=>TOPIC_LESSONS.filter(x=>l.subject?x.subject===l.subject:x.exam===l.exam&&x.group===l.group);

/** Open the existing study page with this exact material selected. Never invent a
 * concept match for an unmapped topic or send college learners to a prerequisite. */
export function lessonHref(id:string,program?:string){
 const lesson=Object.hasOwn(LESSON_BY_ID,id)?LESSON_BY_ID[id]:undefined;
 if(lesson?.concepts.length)return '/learn/'+lesson.concepts[0]+'?lesson='+encodeURIComponent(id);
 if(lesson?.subject){
  const parents=PROGRAMS.filter(p=>p.subjects.includes(lesson.subject!));
  const parent=parents.find(p=>p.id===program)??parents[0];
  if(parent)return '/bridge/'+parent.id+'/'+lesson.subject+'?lesson='+encodeURIComponent(id);
 }
 return standaloneLessonHref(id);
}
