import Link from 'next/link';
import {PageBand,Sheet,btn,pageBody} from '@/components/k/ui';
export const metadata={title:'Understanding your progress'};
export default function Evidence(){return <>
 <PageBand title="Understanding your progress" lead="Your results help you choose what to review. Here is what the different records mean."/>
 <div className={pageBody}>
  <Sheet><h2 className="text-2xl font-extrabold">A practice result gives you a starting point</h2><p className="mt-3 max-w-3xl font-serif text-lg leading-relaxed">A short set or mock shows which questions you answered correctly and which topics to revisit. A missed answer can suggest a useful skill check. It does not automatically mark that skill as learned.</p><Link href="/notebook" className={btn.text}>Revisit missed questions</Link></Sheet>
  <Sheet className="mt-5"><h2 className="text-2xl font-extrabold">Help and independent answers are different</h2><p className="mt-3 max-w-3xl font-serif text-lg leading-relaxed">Examples, hints and visual explanations help you practise. In the guided skill checks, a step is passed after two fresh questions answered correctly without help. The examples you have already seen are kept separate from those checks.</p><Link href="/study" className={btn.text}>Work through a skill</Link></Sheet>
  <Sheet className="mt-5"><h2 className="text-2xl font-extrabold">A study day records activity</h2><p className="mt-3 max-w-3xl font-serif text-lg leading-relaxed">Finishing a session or checking in helps you keep a routine. Opening a Khan Academy lesson, saying how it went and answering Khanpanion questions are separate records. A group check-in does not change your personal skill results.</p></Sheet>
  <Sheet className="mt-5"><h2 className="text-2xl font-extrabold">Keep a copy of your work</h2><p className="mt-3 max-w-3xl font-serif text-lg leading-relaxed">Progress is saved in this browser. Download a backup from Me before changing devices or clearing browser data. You can restore the file in another browser when you want to continue there.</p><Link href="/me" className={btn.text}>Open settings and backups</Link></Sheet>
 </div>
 </>;}
