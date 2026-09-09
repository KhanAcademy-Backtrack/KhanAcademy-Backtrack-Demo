import type { ReactNode } from 'react';
import { Atmosphere } from './Atmosphere';

export function Section({
  children,
  className = '',
  id,
  tone = 'map',
  atmosphere = 'section',
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: 'map' | 'field' | 'paper';
  atmosphere?: 'section' | 'quiet' | 'none';
}) {
  const base =
    tone === 'paper' ? 'material-paper text-ink' : tone === 'field' ? 'material-field' : 'material-map';
  return (
    <section id={id} className={`relative overflow-hidden border-t border-hairline ${base} ${className}`}>
      {tone !== 'paper' && atmosphere !== 'none' && <Atmosphere variant={atmosphere} />}
      <div className="relative mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">{children}</div>
    </section>
  );
}

export function SectionHead({
  label,
  title,
  lead,
  align = 'split',
}: {
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'split' | 'stack';
}) {
  if (align === 'stack') {
    return (
      <header className="max-w-[24ch]">
        <p className="t-label text-route">{label}</p>
        <h2 className="t-display mt-4 text-[2.1rem] sm:text-[2.9rem]">{title}</h2>
        {lead && (
          <p className="mt-5 max-w-[52ch] text-[1.05rem] leading-relaxed text-chalk-muted">{lead}</p>
        )}
      </header>
    );
  }
  return (
    <header className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-16">
      <div>
        <p className="t-label text-route">{label}</p>
        <h2 className="t-display mt-4 text-[2.1rem] sm:text-[2.9rem] lg:text-[3.3rem]">{title}</h2>
      </div>
      {lead && (
        <p className="max-w-[54ch] self-end text-[1.05rem] leading-relaxed text-chalk-muted">{lead}</p>
      )}
    </header>
  );
}

/** A line that carries the argument on its own. Used sparingly. */
export function Statement({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="relative border-l-2 border-now pl-6 sm:pl-10">
      <span
        aria-hidden="true"
        className="absolute -left-px top-0 h-24 w-px bg-linear-to-b from-now to-transparent"
      />
      <p className="t-display text-[1.9rem] leading-[1.06] sm:text-[2.8rem] lg:text-[3.4rem]">
        {children}
      </p>
      {sub && <p className="mt-5 max-w-[62ch] text-[1rem] leading-relaxed text-chalk-muted">{sub}</p>}
    </div>
  );
}

export function HonestNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-10 max-w-[80ch] border-t border-hairline-soft pt-6 text-[0.85rem] leading-relaxed text-chalk-faint">
      {children}
    </p>
  );
}

/** A framed panel that reads as part of the map rather than as a card. */
export function Panel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative border border-hairline bg-linear-to-b from-white/[0.055] to-transparent ${className}`}
    >
      {children}
    </div>
  );
}
