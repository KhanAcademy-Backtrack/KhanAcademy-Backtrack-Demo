import Link from 'next/link';
import { Atmosphere } from '@/components/site/Atmosphere';

export default function NotFound() {
  return (
    <section className="material-map relative flex min-h-[80svh] items-center overflow-hidden">
      <Atmosphere variant="cover" />
      <div className="relative mx-auto w-full max-w-[1400px] px-5 py-24 sm:px-8">
        <p className="t-label text-recalc">404 · Recalculating</p>
        <h1 className="t-display mt-5 max-w-[16ch] text-[2.6rem] leading-[0.98] sm:text-[4rem]">
          That turn does not exist. The destination still does.
        </h1>
        <p className="mt-6 max-w-[48ch] text-[1.05rem] leading-relaxed text-chalk-muted">
          Nothing is lost. Pick a route back.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Back to the start
            <span aria-hidden="true">→</span>
          </Link>
          <Link href="/demo" className="btn btn-ghost">
            Try the demo
          </Link>
        </div>
      </div>
    </section>
  );
}
