import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, STIX_Two_Text } from 'next/font/google';
import './globals.css';
import './study.css';
import './palette.css';
import './maths-labs.css';
import './living-scenes.css';
import './explore.css';
import { AppNav } from '@/components/k/AppNav';
import { ProgramProvider } from '@/components/k/ProgramProvider';
import { SiteFooter } from '@/components/site/SiteFooter';
import {StudyProvider} from '@/components/study/StudyProvider';
const sans=Plus_Jakarta_Sans({subsets:['latin'],display:'swap',variable:'--font-instrument-sans'});
const math=STIX_Two_Text({subsets:['latin'],weight:['400','500'],display:'swap',variable:'--font-stix'});
export const metadata:Metadata={title:{default:'Khanpanion',template:'%s · Khanpanion'},description:'Free college entrance exam review and freshman bridge study, with daily plans, original practice, reviewer chapters and Khan Academy lessons.',applicationName:'Khanpanion',openGraph:{title:'Khanpanion · Your next step to college.',description:'A plan, original practice and a reviewer for your next step to college.',type:'website'},icons:{icon:[{url:'/favicon.svg?v=khanpanion',type:'image/svg+xml'},{url:'/khanpanion-icon-32.png',sizes:'32x32',type:'image/png'}],apple:'/khanpanion-icon-180.png'}};
export const viewport:Viewport={themeColor:'#0A2A66',width:'device-width',initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${sans.variable} ${math.variable}`}><body className="min-h-screen bg-navy pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 print:min-h-0 print:bg-white print:pb-0"><StudyProvider><ProgramProvider><a href="#main" className="skip-link print:hidden">Skip to content</a><AppNav/><main id="main">{children}</main><SiteFooter/></ProgramProvider></StudyProvider></body></html>}
