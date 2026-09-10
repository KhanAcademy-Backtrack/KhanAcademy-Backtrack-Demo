import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, STIX_Two_Text } from 'next/font/google';
import './globals.css';
import './study.css';
import './palette.css';
import './maths-labs.css';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import {StudyProvider} from '@/components/study/StudyProvider';
const sans=Plus_Jakarta_Sans({subsets:['latin'],display:'swap',variable:'--font-instrument-sans'});
const math=STIX_Two_Text({subsets:['latin'],weight:['400','500'],display:'swap',variable:'--font-stix'});
export const metadata:Metadata={title:{default:'Dunlo',template:'Dunlo'},description:'Start a useful study session, make difficult ideas click, and keep a personal reviewer with Khan Academy.',applicationName:'Dunlo',openGraph:{title:'Dunlo · Your study companion',description:'Study packs, focused Khan help, fresh practice, and a useful reason to return.',type:'website'},icons:{icon:[{url:'/favicon.svg?v=dunlo',type:'image/svg+xml'},{url:'/dunlo-icon-32.png',sizes:'32x32',type:'image/png'}],apple:'/dunlo-icon-180.png'}};
export const viewport:Viewport={themeColor:'#ffffff',width:'device-width',initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${sans.variable} ${math.variable}`}><body><StudyProvider><a href="#main" className="skip-link">Skip to content</a><SiteHeader/><main id="main">{children}</main><SiteFooter/></StudyProvider></body></html>}
