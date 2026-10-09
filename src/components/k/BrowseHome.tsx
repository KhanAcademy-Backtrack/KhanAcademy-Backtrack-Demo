'use client';
import {Headline} from './Headline';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {TopicPicker} from './TopicPicker';
import {ChangeGoalButton} from './ProgramTourProvider';
import {Sheet,btn} from './ui';
import {HomeShortcuts} from './StudyTools';
import {FeatureCard,IdeaArt,RouteArt,Section,glyph} from './HomeCards';
import {CONCEPTS} from '@/lib/program/concepts';
import {HomeWelcome,StudyActivity} from './HomeDashboard';
const topics=CONCEPTS.map(c=>({id:c.id,label:c.title,category:c.subtest==='science'?c.area:c.subtest==='math'?'Math':c.subtest==='language'?'Language':'Reading',search:c.area}));

/** Browsing home: no goal needed. A topic finder first, then two ways to try something. */
export function BrowseHome(){const router=useRouter();return <div className="home-dashboard">
 <HomeWelcome title="Explore at your own pace"><p>Follow a question, try an idea, or find your next topic. There’s room to take your time.</p></HomeWelcome>
 <HomeShortcuts className="home-shortcuts"/>
 <Section label="Find a topic"><Sheet className="p-4 sm:p-6"><h2 className="text-xl font-extrabold"><Headline>What are you curious about?</Headline></h2><TopicPicker items={topics} onChoose={id=>{if(id)router.push('/learn/'+id);}}/></Sheet></Section>
 <StudyActivity/>
 <div className="home-content-grid">
 <Section label="Try an idea"><FeatureCard icon={glyph.idea} title="Try an idea you can move" body="Explore graphs, mixtures and other interactive explanations." art={<IdeaArt/>} action={<Link href="/explore" className={btn.primary}><Headline>Explore an idea</Headline></Link>}/></Section>
 <Section label="Stuck on something?"><FeatureCard className="home-backtrack-card [&>.home-card-art]:flex" icon={glyph.route} title="Find my missing skill" body="Your answers guide BACKTRACK to the earlier skill to check. Work on that step, then return to your goal with fresh questions." art={<RouteArt/>} action={<Link href="/start" className={btn.ghost}><Headline>Find my missing skill</Headline></Link>}/></Section>
 </div>
 <Section label="Personalize"><Sheet className="p-4 sm:p-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-navy">{glyph.tune}</span><div><h2 className="text-lg font-extrabold leading-tight"><Headline>Get a plan that fits your week</Headline></h2><p className="mt-1 text-sm text-ink-soft">Choose an exam, college foundations or a class topic. Your browsing stays saved.</p></div></div><div className="mt-4"><ChangeGoalButton className={btn.chip} label="Choose my goal"/></div></Sheet></Section>
</div>;}
