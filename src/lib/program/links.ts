import {CHAPTER_IDS} from '../../content/reviewer/ids.ts';
import {CONCEPTS} from './concepts.ts';

/** A written reviewer chapter when one exists; otherwise the concept's study page,
 *  which always has the summary card, the Khan units and a topic check. */
export function chapterHref(chapter:string,concept?:string){
 if(CHAPTER_IDS.has(chapter))return `/reviewer/${chapter}`;
 const c=concept??CONCEPTS.find(x=>x.chapter===chapter)?.id;
 return c?`/learn/${c}`:'/reviewer';
}
