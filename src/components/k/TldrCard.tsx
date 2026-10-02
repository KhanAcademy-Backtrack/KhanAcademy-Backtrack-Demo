import type {Tldr} from '@/lib/program/concepts';
import {Oval,cx} from './ui';

/** The short "what you need to know" card that opens every concept and chapter. */
export function TldrCard({tldr,title='What you need to know',compact=false}:{tldr:Tldr;title?:string;compact?:boolean}){
 return <div className={cx('rounded-2xl bg-white text-navy shadow-sheet',compact?'p-4':'p-5 sm:p-7')}>
  <h2 className={cx('font-extrabold tracking-[-.02em]',compact?'text-lg':'text-xl')}>{title}</h2>
  <ul className="mt-4 grid gap-3">{tldr.must.map(x=><li key={x} className="flex gap-3 text-[16px] leading-relaxed text-navy"><Oval filled size={20} className="mt-1"/><span>{x}</span></li>)}</ul>
  <div className={cx('mt-5 grid gap-3',compact?'':'sm:grid-cols-3')}>
   <div className="rounded-xl bg-sky/70 p-4"><p className="text-sm font-semibold text-ink-soft">Remember</p><p className="mt-1 font-serif text-lg leading-snug">{tldr.rule}</p></div>
   <div className="rounded-xl bg-sky/70 p-4"><p className="text-sm font-semibold text-ink-soft">Tiny example</p><p className="mt-1 font-serif text-lg leading-snug">{tldr.example.q}</p><p className="mt-1 font-serif text-lg leading-snug text-ink-soft">{tldr.example.a}</p></div>
   <div className="rounded-xl bg-mint p-4 text-navy"><p className="text-sm font-semibold text-ink-soft">The trap</p><p className="mt-1 font-serif text-lg leading-snug">{tldr.trap}</p></div>
  </div>
 </div>;
}
