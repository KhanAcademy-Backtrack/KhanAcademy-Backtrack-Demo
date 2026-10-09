'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useProgram} from './ProgramProvider';
import {NavIcon,STUDY_TOOLS,HOME_SHORTCUTS} from './AppNav';
import {cx} from './ui';
import {t} from '@/lib/i18n';

/** The CET reviewer links directly to practice exams. */
const CARDS=new Set(['mocks']);
export function StudyTools(){
 const {state:{lang}}=useProgram();
 return <ul aria-label={t(lang,'nav.studyTools')} className="grid gap-3">{STUDY_TOOLS.filter(x=>CARDS.has(x.key)).map(x=><li key={x.key} className="min-w-0">
  <Link href={x.href} className="flex h-full min-h-28 gap-3 rounded-xl bg-white p-4 shadow-sheet hover:outline-2 hover:outline-line-strong focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy">
   <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-navy"><NavIcon k={x.icon}/></span>
   <span className="min-w-0"><span className="block font-extrabold leading-tight"><Headline>{t(lang,x.label)}</Headline></span><span className="mt-1 block text-sm leading-snug text-ink-soft">{x.blurb}</span>
   </span>
  </Link>
 </li>)}</ul>;
}

/** Courses, CET reviewers and practice exams as one row of buttons on the home page. */
export function HomeShortcuts({className}:{className?:string}){
 const {state:{lang}}=useProgram();
 return <nav aria-label={t(lang,'nav.shortcuts')} className={cx('min-w-0',className)}>
  <ul className="flex flex-wrap gap-2">{HOME_SHORTCUTS.map(x=><li key={x.key}>
   <Link href={x.href} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-transparent px-3.5 text-[14px] font-semibold text-navy hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy">
    <NavIcon small k={x.icon}/><Headline>{t(lang,x.label)}</Headline>
   </Link>
  </li>)}</ul>
 </nav>;
}
