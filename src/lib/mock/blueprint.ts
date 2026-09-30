import type {Subtest} from './types.ts';

/** THE ONE PLACE for exam structure numbers.
 *
 *  Public facts only: the UPCAT has four subtests (Language Proficiency, Reading
 *  Comprehension, Mathematics, Science), is given in English and Filipino, and takes
 *  about four hours in all. The item counts and minutes below are Khanpanion's
 *  practice settings, chosen to fit that length. The team must confirm them before
 *  the pilot; nothing else in the code hard-codes these numbers. */
export const UPCAT_BLUEPRINT:Record<Subtest,{items:number;minutes:number}>={
 language:{items:40,minutes:45},
 reading:{items:30,minutes:50},
 math:{items:50,minutes:70},
 science:{items:50,minutes:60}
};
/** Break between subtests in the full simulation. */
export const BREAK_MINUTES=10;
/** Scoring rule used on every practice result: one point per correct answer, no
 *  deduction for a wrong or blank answer. Confirm with the team. */
export const SCORING={correct:1,wrong:0,blank:0};

/** Shorter formats, all built from the same banks. */
export const SPRINT={items:12,minutes:15};
export const TOPIC_CHECK={items:8,minutes:12};
export const DAILY3={items:3};
/** A section in Section mode runs at the blueprint's length for that subtest. */
export const SECTION_ORDER:Subtest[]=['language','reading','math','science'];

/** Readiness bands. Percent correct on recent work at a subtest, mapped to plain
 *  words. These describe where practice stands, not a predicted exam score. */
export const BANDS=[
 {min:0,id:'building',label:'Building the base',note:'Most questions here still need the basics. That is where the fastest gains are.'},
 {min:40,id:'growing',label:'Growing',note:'You get the common questions. The traps are what cost you now.'},
 {min:60,id:'steady',label:'Steady',note:'Solid on most of it. Timed practice will show whether it holds at exam pace.'},
 {min:80,id:'strong',label:'Strong',note:'Keep it warm with short mixed sets while you work on other subtests.'}
] as const;
export type BandId=typeof BANDS[number]['id'];
export function bandFor(percent:number){let b:typeof BANDS[number]=BANDS[0];for(const x of BANDS)if(percent>=x.min)b=x;return b;}
