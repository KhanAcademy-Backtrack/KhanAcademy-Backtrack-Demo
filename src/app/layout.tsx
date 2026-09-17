import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, STIX_Two_Text } from 'next/font/google';
import './globals.css';
import './study.css';
import './palette.css';
import './maths-labs.css';
import './living-scenes.css';
import './explore.css';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import {StudyProvider} from '@/components/study/StudyProvider';
const sans=Plus_Jakarta_Sans({subsets:['latin'],display:'swap',variable:'--font-instrument-sans'});
const math=STIX_Two_Text({subsets:['latin'],weight:['400','500'],display:'swap',variable:'--font-stix'});
export const metadata:Metadata={title:{default:'Khanpanion',template:'%s · Khanpanion'},description:'Explore playable ideas and focused Khan Academy lessons, try fresh questions, and keep learning. Khanpanion is a free independent project.',applicationName:'Khanpanion',openGraph:{title:'Khanpanion · Explore. Learn. Return.',description:'A little curiosity. A useful next step with Khan Academy.',type:'website'},icons:{icon:[{url:'/favicon.svg?v=khanpanion',type:'image/svg+xml'},{url:'/khanpanion-icon-32.png',sizes:'32x32',type:'image/png'}],apple:'/khanpanion-icon-180.png'}};
export const viewport:Viewport={themeColor:'#ffffff',width:'device-width',initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${sans.variable} ${math.variable}`}><body><StudyProvider><a href="#main" className="skip-link">Skip to content</a><SiteHeader/><main id="main">{children}</main><SiteFooter/></StudyProvider></body></html>}
