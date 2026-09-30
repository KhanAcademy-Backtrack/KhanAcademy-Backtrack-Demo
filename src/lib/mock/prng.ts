/** Seeded randomness for the mock engine. Every item is a pure function of
 *  (familyId, seed): never Math.random, Date.now or locale formatting. */
export type Rng={next:()=>number;int:(lo:number,hi:number)=>number;pick:<T>(xs:readonly T[])=>T;shuffle:<T>(xs:readonly T[])=>T[]};

/** FNV-1a, 32-bit. */
export function hashString(text:string){
 let h=0x811c9dc5;
 for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
 return h>>>0;
}

/** Mulberry32 seeded from a string. */
export function rng(seed:string):Rng{
 let a=hashString(seed)||1;
 const next=()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
 const int=(lo:number,hi:number)=>lo+Math.floor(next()*(hi-lo+1));
 const pick=<T,>(xs:readonly T[])=>xs[Math.floor(next()*xs.length)];
 const shuffle=<T,>(xs:readonly T[])=>{const out=[...xs];for(let i=out.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
 return {next,int,pick,shuffle};
}

/** Plain decimal text: at most `places` decimals, trailing zeros trimmed, never
 *  exponent form, never a negative zero. */
export function fmt(value:number,places=4):string{
 if(!Number.isFinite(value))throw Error(`Cannot format ${value}`);
 const rounded=Math.round(value*10**places)/10**places;
 if(Math.abs(rounded)<1e-9)return '0';
 if(Math.abs(rounded)>=1e21)throw Error(`Too large to format: ${value}`);
 const text=rounded.toFixed(places);
 return text.includes('.')?text.replace(/0+$/,'').replace(/\.$/,''):text;
}

export function gcd(a:number,b:number):number{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;}

/** A fraction `n/d` in lowest terms, as text. Whole numbers print without a denominator. */
export function fracText(n:number,d:number):string{
 if(d===0)throw Error('Zero denominator');
 if(d<0){n=-n;d=-d;}
 const g=gcd(n,d);n/=g;d/=g;
 return d===1?String(n):`${n}/${d}`;
}

/** Recovers a fraction from a value whose denominator is at most `limit`. */
export function asFraction(value:number,limit=400):string{
 for(let d=1;d<=limit;d++){const n=Math.round(value*d);if(Math.abs(n/d-value)<1e-9)return fracText(n,d);}
 return fmt(value);
}

const SUP:Record<string,string>={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
export const sup=(n:number|string)=>String(n).split('').map(c=>SUP[c]??c).join('');
export const peso=(v:number)=>`₱${fmt(v,2)}`;
