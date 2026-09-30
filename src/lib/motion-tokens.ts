/** Shared motion. UI motion runs 150 to 400 ms on one ease and one spring, and only
 *  transform and opacity are animated. See docs/ux/ANIMATION_AUDIT.md. */
export const DUR={fast:.15,base:.24,slow:.4} as const;
export const EASE=[.2,.8,.2,1] as const;
export const SPRING={type:'spring' as const,stiffness:420,damping:34,mass:.8};
export const ease=(duration:number=DUR.base,delay=0)=>({duration,delay,ease:EASE as unknown as [number,number,number,number]});
export const STILL={duration:0};
/** A complete static path uses zero delay as well as zero duration. */
export const tween=(off:boolean,duration:number=DUR.base,delay=0)=>({type:'tween' as const,duration:off?0:duration,delay:off?0:delay,ease:EASE as unknown as [number,number,number,number]});
