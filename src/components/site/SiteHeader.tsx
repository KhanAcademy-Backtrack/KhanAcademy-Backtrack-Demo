'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Wordmark } from './Wordmark';

const LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/classrooms', label: 'Classrooms' },
  { href: '/evidence', label: 'Evidence' },
  { href: '/about', label: 'About' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        lifted ? 'border-b border-hairline bg-base/88 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-5 sm:px-8">
        <Wordmark />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative px-3 py-2 text-[0.875rem] font-medium transition-colors ${
                  active ? 'text-now' : 'text-chalk-muted hover:text-chalk'
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-px h-px bg-now"
                  />
                )}
              </Link>
            );
          })}
          <Link href="/demo" className="btn btn-primary ml-3 !min-h-[38px] !text-[0.875rem]">
            Open the demo
          </Link>
        </nav>

        <button
          type="button"
          className="-mr-2 flex h-11 w-11 items-center justify-center text-chalk md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Menu'}</span>
          <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
            <motion.path
              animate={open ? { d: 'M2 1 L20 13' } : { d: 'M0 1 L22 1' }}
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <motion.path
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              d="M0 7 L22 7"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <motion.path
              animate={open ? { d: 'M2 13 L20 1' } : { d: 'M0 13 L22 13' }}
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="material-map fixed inset-x-0 top-16 z-40 border-b border-hairline px-5 pb-8 pt-4 md:hidden"
          >
            <nav aria-label="Main" className="flex flex-col">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="border-b border-hairline-soft py-4 text-[1.35rem] text-chalk"
                >
                  {l.label}
                </Link>
              ))}
              <Link href="/demo" className="btn btn-primary mt-6">
                Open the demo
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
