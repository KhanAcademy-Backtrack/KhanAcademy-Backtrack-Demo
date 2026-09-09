import Link from 'next/link';
import { RouteMark } from './Wordmark';

const COLS = [
  {
    title: 'Product',
    links: [
      { href: '/demo', label: 'Interactive demo' },
      { href: '/how-it-works', label: 'How it works' },
      { href: '/start/quadratics', label: 'Topic entry point' },
    ],
  },
  {
    title: 'Project',
    links: [
      { href: '/classrooms', label: 'Classrooms' },
      { href: '/evidence', label: 'Evidence' },
      { href: '/about', label: 'About & AI disclosure' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="material-map border-t border-hairline">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5 text-chalk">
              <RouteMark className="h-4 w-[34px] text-route" />
              <span className="text-[0.9rem] font-bold tracking-[0.24em]">BACKTRACK</span>
            </div>
            <p className="mt-4 max-w-[34ch] text-[0.95rem] leading-relaxed text-chalk-muted">
              The shortest path back to where your class is now.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="t-label text-chalk-faint">{c.title}</p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[0.95rem] text-chalk-muted transition-colors hover:text-route"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-14 max-w-[95ch] border-t border-hairline-soft pt-8 text-[0.8125rem] leading-relaxed text-chalk-faint">
          BACKTRACK is an independent concept-stage project prepared for the Khan Academy Education
          Impact Challenge (KEIC) 2026. It is not affiliated with, endorsed by, or partnered with Khan
          Academy, Khan Academy Philippines, Enactus Philippines, or any school. No pilot has run, no
          school has committed, no learner has used it, and no learning outcome has been measured.
          Everything labelled illustrative or proposed on this site is exactly that. The demo stores
          nothing about you outside your own browser.
        </p>
      </div>
    </footer>
  );
}
