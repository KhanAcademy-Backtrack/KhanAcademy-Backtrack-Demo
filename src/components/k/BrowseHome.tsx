'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {TopicPicker} from './TopicPicker';
import {ChangeGoalButton,ProgramTourButton} from './ProgramTourProvider';
import {PageBand,Sheet,btn,pageBody,cx} from './ui';
import {CONCEPTS} from '@/lib/program/concepts';
const topics=CONCEPTS.map(c=>({id:c.id,label:c.title,category:c.subtest==='science'?c.area:c.subtest==='math'?'Math':c.subtest==='language'?'Language':'Reading',search:c.area}));
export function BrowseHome(){const router=useRouter();return <>
 <PageBand title="Explore at your own pace" lead="Pick a subject, read an explanation or play with an idea. You can make a study plan whenever you want." aside={<ProgramTourButton className={btn.onDark} label="Show my guide"/>}/>
 <div className={pageBody}><div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
  <Sheet><h2 className="text-2xl font-extrabold">What are you curious about?</h2><TopicPicker items={topics} onChoose={id=>{if(id)router.push('/learn/'+id);}}/></Sheet>
  <div className="grid content-start gap-5"><Sheet><h2 className="text-xl font-extrabold">Try an idea you can move</h2><p className="mt-2 text-ink-soft">Explore graphs, mixtures and other interactive explanations. There is no quiz you have to finish.</p><Link href="/explore" className={cx(btn.primary,'mt-4')}>Explore an idea</Link></Sheet><Sheet><h2 className="text-xl font-extrabold">Want a routine later?</h2><p className="mt-2 text-ink-soft">Your saved work stays here. Choose a goal when you want topics and a calendar built around it.</p><ChangeGoalButton className={cx(btn.ghost,'mt-4')} label="Choose my goal"/></Sheet></div>
 </div></div></>;}
