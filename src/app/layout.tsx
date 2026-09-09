import type { Metadata, Viewport } from 'next';
import { Instrument_Sans, Instrument_Serif, STIX_Two_Text } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

const sans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-instrument-serif',
});

/* STIX Two Text is a mathematics companion face. Variables come out italic and
   digits stay roman, which is what makes an expression read as an expression
   rather than as a string. */
const math = STIX_Two_Text({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-stix',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://backtrack-keic.vercel.app'),
  title: {
    default: 'BACKTRACK · the shortest path back to where your class is now',
    template: '%s · BACKTRACK',
  },
  description:
    'School keeps moving forward even when students do not. BACKTRACK finds the shortest useful route from what a learner knows to what their class is doing today, and routes the missing work through Khan Academy. Concept-stage prototype for the Khan Academy Education Impact Challenge 2026.',
  applicationName: 'BACKTRACK',
  authors: [{ name: 'BACKTRACK' }],
  openGraph: {
    title: 'BACKTRACK · the shortest path back to where your class is now',
    description:
      'An adaptive learning-recovery navigator. Concept-stage prototype for KEIC 2026.',
    type: 'website',
  },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#05100e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${math.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-now focus:px-4 focus:py-2 focus:font-semibold focus:text-base"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
