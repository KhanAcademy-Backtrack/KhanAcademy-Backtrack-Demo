'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {TopicPicker} from './TopicPicker';
import {ChangeGoalButton} from './ProgramTourProvider';
import {Sheet,btn} from './ui';
import {FeatureCard,IdeaArt,RouteArt,Section,glyph} from './HomeCards';
import {CONCEPTS} from '@/lib/program/concepts';
const topics=CONCEPTS.map(c=>({id:c.id,label:c.title,category:c.subtest==='science'?c.area:c.subtest==='math'?'Math':c.subtest==='language'?'Language':'Reading',search:c.area}));

/** Browsing home: no goal needed. A topic finder first, then two ways to try something. */
export function BrowseHome(){const router=useRouter();return <div className="mx-auto grid max-w-4xl gap-8 px-4 pb-32 pt-8 sm:px-8 lg:pb-20 lg:pt-10">
 <header><h1 className="text-[1.65rem] font-extrabold leading-tight tracking-[-.025em] sm:text-[1.9rem]">Explore at your own pace</h1><p className="mt-1.5 text-ink-soft">Pick a subject, read an explanation or play with an idea. You can make a study plan whenever you want.</p></header>
 <Section label="Find a topic"><Sheet className="p-4 sm:p-6"><h2 className="text-xl font-extrabold">What are you curious about?</h2><TopicPicker items={topics} onChoose={id=>{if(id)router.push('/learn/'+id);}}/></Sheet></Section>
 <Section label="Try an idea"><FeatureCard icon={glyph.idea} title="Try an idea you can move" body="Explore graphs, mixtures and other interactive explanations." art={<IdeaArt/>} action={<Link href="/explore" className={btn.primary}>Explore an idea</Link>}/></Section>
 <Section label="Stuck on something?"><FeatureCard icon={glyph.route} title="Find and fix a gap" body="BACKTRACK checks the earlier step that might be missing, repairs it, then brings you back to your goal with fresh questions." art={<RouteArt/>} action={<Link href="/start" className={btn.ghost}>Choose a route</Link>}/></Section>
 <Section label="Personalize"><Sheet className="p-4 sm:p-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-navy">{glyph.tune}</span><div><h2 className="text-lg font-extrabold leading-tight">Get a plan that fits your week</h2><p className="mt-1 text-sm text-ink-soft">Choose an exam, college foundations or a class topic. Your browsing stays saved.</p></div></div><div className="mt-4"><ChangeGoalButton className={btn.chip} label="Choose my goal"/></div></Sheet></Section>
</div>;}
