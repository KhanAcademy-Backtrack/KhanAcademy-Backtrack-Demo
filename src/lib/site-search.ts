import {CONCEPTS} from './program/concepts.ts';
import {SUBTEST_LABEL} from './mock/types.ts';
import {TOPICS,type Topic} from './recovery.ts';
import {CHAPTERS} from '../content/reviewer/index.ts';
import {EXTRAS} from '../content/reviewer/extras.ts';
import {plainText} from './notation.ts';
import {PROGRAMS} from './program/bridge.ts';
import {SUBJECTS,KIND_LABEL} from './program/college-courses.ts';
import {TOPIC_LESSONS,lessonHref} from './program/topic-lessons.ts';

/** One place a learner can go from the header search. Everything here is a real,
 *  statically exported route; nothing is fetched, so search works offline. */
export type SearchEntry={kind:'Topic'|'Reviewer'|'Fix a gap'|'College'|'Page';title:string;detail:string;href:string;words:string};

const PAGES:[string,string,string,string][]=[
 ['Practice tests','Sprint, section and full CET simulations','/mock','mock exam cet upcat sprint simulation section timed practice test'],
 ['Topic checks','Eight exam-level questions on one topic','/mock','topic check quiz practice'],
 ['Fix a gap with BACKTRACK','Find the earlier step that needs a repair','/start','backtrack route recovery stuck repair gap'],
 ['Daily recall','Quick review of what is due today','/review','recall review spaced memory'],
 ['Mistake notebook','Every missed question, grouped by idea','/notebook','mistakes notebook wrong missed'],
 ['Study plan','Your routine, study days and exam targets','/plan','plan routine pledge schedule target'],
 ['Calendar','Study sessions and exam dates','/calendar','calendar schedule dates week'],
 ['Exam dates','Verified college entrance exam dates','/admissions','admissions dates upcat dcat pupcet ustet acet'],
 ['Study groups','Study with friends using a group code','/group','group friends together study'],
 ['Study packs','Topic packs that start BACKTRACK rounds','/packs','packs study space'],
 ['Explore ideas','Interactive explanations you can move','/explore','explore interactive ideas'],
 ['Courses','College subjects for each field, with Khan Academy videos and units','/bridge','courses college first year subjects foundations program degree field bridge'],
 ['Study','Practice exams, BACKTRACK, study tools and the reviewer','/reviewer','study reviewer chapters handbook print tools'],
];

export const SEARCH_INDEX:SearchEntry[]=[
 ...CONCEPTS.map(c=>({kind:'Topic' as const,title:c.title,detail:`${SUBTEST_LABEL[c.subtest]} · ${c.area}`,href:`/learn/${c.id}`,words:`${c.title} ${c.area} ${SUBTEST_LABEL[c.subtest]} ${plainText(c.blurb)}`.toLowerCase()})),
 ...CHAPTERS.map(c=>({kind:'Reviewer' as const,title:c.title,detail:`Reviewer chapter · ${SUBTEST_LABEL[c.subtest]}`,href:`/reviewer/${c.id}`,words:`${c.title} ${SUBTEST_LABEL[c.subtest]} reviewer chapter`.toLowerCase()})),
 ...EXTRAS.map(x=>({kind:'Reviewer' as const,title:x.title,detail:'Reviewer handbook',href:`/reviewer/${x.id}`,words:`${x.title} handbook sheet reviewer`.toLowerCase()})),
 ...(Object.keys(TOPICS) as Topic[]).map(t=>({kind:'Fix a gap' as const,title:TOPICS[t].label,detail:`BACKTRACK · ${TOPICS[t].description}`,href:`/start/${t}`,words:`${TOPICS[t].label} ${TOPICS[t].goal} backtrack fix gap ${TOPICS[t].subject}`.toLowerCase()})),
 ...PROGRAMS.map(p=>({kind:'College' as const,title:p.title,detail:`College field · ${p.subjects.length} subjects`,href:`/bridge/${p.id}`,words:`${p.title} ${p.examples} college course field degree`.toLowerCase()})),
 ...SUBJECTS.flatMap(x=>{const p=PROGRAMS.find(p=>p.subjects.includes(x.id));return p?[{kind:'College' as const,title:x.title,detail:`${KIND_LABEL[x.kind]} · ${x.level} · ${p.title}`,href:`/bridge/${p.id}/${x.id}`,words:`${x.title} ${KIND_LABEL[x.kind]} ${x.topics.join(' ')} college subject course`.toLowerCase()}]:[];}),
 ...PAGES.map(([title,detail,href,words])=>({kind:'Page' as const,title,detail,href,words:`${title} ${words}`.toLowerCase()})),
 ...TOPIC_LESSONS.map(l=>({kind:l.subject?'College' as const:'Topic' as const,title:l.title,detail:l.exam?l.exam.toUpperCase()+' · '+l.group:l.section,href:lessonHref(l.id),words:plainText(l.title+' '+l.section+' '+(l.exam??'college')+' '+l.group).toLowerCase()})),
];

/** Every word of the query must appear. Title matches rank first, then title
 *  prefixes, then matches found only in the description. */
export function searchSite(query:string,limit=8):SearchEntry[]{
 const words=query.toLowerCase().split(/\s+/).filter(Boolean);
 if(!words.length)return [];
 const scored:{e:SearchEntry;score:number;i:number}[]=[];
 SEARCH_INDEX.forEach((e,i)=>{
  if(!words.every(w=>e.words.includes(w)))return;
  const title=e.title.toLowerCase();
  const score=(title.startsWith(words[0])?0:words.every(w=>title.includes(w))?1:2)*10+(e.kind==='Page'?0:e.kind==='Topic'?1:e.kind==='Fix a gap'?2:e.kind==='College'?3:4);
  scored.push({e,score,i});
 });
 return scored.sort((a,b)=>a.score-b.score||a.i-b.i).slice(0,limit).map(x=>x.e);
}
