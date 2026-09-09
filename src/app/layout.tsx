import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, STIX_Two_Text } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
const sans=Plus_Jakarta_Sans({subsets:['latin'],display:'swap',variable:'--font-instrument-sans'});
const math=STIX_Two_Text({subsets:['latin'],weight:['400','500'],display:'swap',variable:'--font-stix'});
export const metadata:Metadata={title:{default:'BACKTRACK · Your GPS for learning',template:'%s · BACKTRACK'},description:'Your GPS recalculates. So can your learning. Find the missing step, practice with Khan Academy, and return to today’s lesson.',applicationName:'BACKTRACK',openGraph:{title:'BACKTRACK · Your GPS for learning',description:'A learning route that changes with your answers. Find the missing step and practice with Khan Academy.',type:'website'},icons:{icon:'/favicon.svg'}};
export const viewport:Viewport={themeColor:'#ffffff',width:'device-width',initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${sans.variable} ${math.variable}`}><body><a href="#main" className="skip-link">Skip to content</a><SiteHeader/><main id="main">{children}</main><SiteFooter/></body></html>}
