'use client';
import {useMotionPolicy} from '@/components/motion/MotionPolicy';
export function SceneMotionToggle({still,onChange}:{still:boolean;onChange:(still:boolean)=>void}){
 const {quiet,reduced}=useMotionPolicy();
 return <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-full border-2 border-navy/15 bg-white px-4 py-2 text-sm font-semibold text-navy"><input type="checkbox" className="h-5 w-5 accent-navy" checked={still||quiet||reduced} disabled={quiet||reduced} onChange={e=>onChange(e.target.checked)}/>Still view{(quiet||reduced)&&<span className="font-normal text-ink-soft">from your preference</span>}</label>;
}
