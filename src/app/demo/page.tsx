import { RecoveryApp } from '@/components/product/RecoveryApp';
import Link from 'next/link';
export const metadata={title:'Your route'};
export default function Demo(){return <><section className="demo-discovery-entry"><div><p className="eyebrow">Dunlo · Explore. Learn. Return.</p><h1>Try the learning journey.</h1><p>Explore short interactive ideas and Khan Academy clips, or follow the recovery example below.</p></div><Link className="explore-action" href="/explore?item=same-mix">Open Explore ↓</Link></section><RecoveryApp sample/></>}
