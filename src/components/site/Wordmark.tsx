import Link from 'next/link';

/** Origin dot, a route that dips and recovers, destination square. */
export function RouteMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 16" className={className} aria-hidden="true" fill="none">
      <path
        d="M4 8 H9 C12.5 8 12.5 13 16.5 13 C20.5 13 20.5 8 24 8 H27"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="4" cy="8" r="2.6" fill="currentColor" />
      <rect x="26" y="5.4" width="5.2" height="5.2" rx="1" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 text-chalk transition-colors hover:text-route ${className}`}
    >
      <RouteMark className="h-4 w-[34px] text-route transition-colors group-hover:text-now" />
      <span className="text-[0.9rem] font-bold tracking-[0.24em]">BACKTRACK</span>
    </Link>
  );
}
