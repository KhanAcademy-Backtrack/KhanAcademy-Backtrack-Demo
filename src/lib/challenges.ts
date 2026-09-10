import type {Problem,Confidence,Topic} from './recovery.ts';
/** `khanId` is present only where a hand-verified Khan activity is matched; a
 *  challenge without one still leads into a study pack, reviewer and route. */
export type Challenge={code:string;family:'factors'|'fractions'|'ratios'|'balancing'|'motion';audience:string;hook:string;title:string;question:Problem;topic:Topic;khanId?:string;insight:string};
const templates={
 factors:{expression:'x² + 7x + 12',prompt:'Which two numbers belong inside the factors?',labels:['First number','Second number'],expected:[3,4],unordered:true,hint:'Match the sum and the product.',explanation:'3 + 4 = 7, and 3 × 4 = 12. Both conditions must match.',factorPair:[3,4] as [number,number]},
 fractions:{expression:'\\frac{1}{2} + \\frac{1}{3}',prompt:'How much is there altogether?',labels:['Numerator','Denominator'],expected:[5,6],format:'fraction' as const,hint:'Use equal-sized parts before adding.',explanation:'1/2 is 3/6 and 1/3 is 2/6. Together they make 5/6.'},
 ratios:{expression:'3 : 24 = 5 : x',prompt:'Three items cost 24. At the same rate, what do five cost?',labels:['Total for five'],expected:[40],hint:'Find the amount for one first.',explanation:'24 ÷ 3 = 8 for one. Five cost 5 × 8 = 40.'},
 balancing:{expression:'?\\,\\mathrm{H_{2}} + 1\\,\\mathrm{O_{2}} → ?\\,\\mathrm{H_{2}O}',speak:'what H 2 plus 1 O 2 yields what H 2 O',prompt:'Complete the balanced equation. The coefficient of O₂ is 1.',labels:['Coefficient of H₂','Coefficient of H₂O'],expected:[2,2],hint:'Count each element on both sides. Only the numbers in front may change.',explanation:'One O₂ brings 2 oxygen atoms, so 2 H₂O must form. Those 2 water molecules hold 4 hydrogen atoms, so 2 H₂ must react. Changing a subscript instead would swap water for a different substance.'},
 motion:{expression:'u = 4\\,\\mathrm{m/s},\\,a = 3\\,\\mathrm{m/s^{2}},\\,t = 5\\,\\mathrm{s}',speak:'u equals 4 metres per second, a equals 3 metres per second squared, t equals 5 seconds',prompt:'A cart is already moving at 4 m/s and speeds up steadily at 3 m/s² for 5 s. What is its final speed?',labels:['Final speed'],fields:[{label:'Final speed',kind:'number' as const,unit:'m/s'}],expected:[19],hint:'The acceleration adds speed each second, on top of the speed the cart already had.',explanation:'3 m/s² for 5 s adds 15 m/s. The cart already had 4 m/s, so it finishes at 19 m/s. Using 3 × 5 alone would describe a cart that started from rest.'}
};
const entries:[string,Challenge['family'],string,string,string][]=[
 ['FQ1','factors','Quiz preparation','2 and 6 multiply to 12. Why don’t they fit this expression?','One match is not enough.'],
 ['FQ2','factors','Quiz preparation','Check the middle term before you circle that answer.','Find the missing condition.'],
 ['FP1','factors','Puzzle viewers','Two numbers. Two conditions. Can you satisfy both?','Find the pair.'],
 ['FP2','factors','Puzzle viewers','2 and 6 pass one test and fail another.','A pair with a catch.'],
 ['FH1','fractions','Parents and cooking','Half a cup and a third of a cup. Is that two fifths?','Make the pieces match.'],
 ['FH2','fractions','Parents and cooking','These scoops are different sizes. Can we add their counts?','Same amount. Equal-sized parts.'],
 ['FS1','fractions','School revision','Why can’t we just add the denominators?','What does the denominator do?'],
 ['FS2','fractions','School revision','The picture makes the common denominator useful.','See the sixths.'],
 ['RG1','ratios','Gaming quantities','Three crystals give 24 energy. What do five give?','A rate that stays the same.'],
 ['RG2','ratios','Gaming quantities','Two more crystals add more than two energy.','Find the amount for one.'],
 ['RE1','ratios','Everyday costs','Three pens cost 24 pesos. How much for five?','Scale the cost.'],
 ['RE2','ratios','Everyday costs','A bigger quantity needs the same unit price.','Keep the rate, change the amount.'],
 ['CB1','balancing','Science revision','Two hydrogen, two oxygen. Why isn’t one water molecule enough?','Every atom has to go somewhere.'],
 ['CB2','balancing','Science revision','You can change the numbers in front. You may not touch the small ones.','Coefficients, not subscripts.'],
 ['PM1','motion','Physics revision','It accelerates at 3 m/s² for 5 seconds. Is it moving at 15 m/s?','The speed it already had still counts.'],
 ['PM2','motion','Physics revision','Two carts, same acceleration, different finishes. Why?','Where the motion started.'],
];
const TOPIC_OF:Record<Challenge['family'],Topic>={factors:'quadratics',fractions:'fractions',ratios:'ratios',balancing:'balancing',motion:'motion'};
const KHAN_OF:Partial<Record<Challenge['family'],string>>={factors:'factor-quadratics',fractions:'unlike-fractions',ratios:'unit-rates'};
export const CHALLENGES:Challenge[]=entries.map(([code,family,audience,hook,title])=>({code,family,audience,hook,title,question:{id:`source:${code}`,...templates[family]},topic:TOPIC_OF[family],khanId:KHAN_OF[family],insight:templates[family].explanation}));
export const findChallenge=(code:string)=>CHALLENGES.find(c=>c.code===code.trim().toUpperCase());

export function challengeNextStep(confidence:Confidence,correct:boolean,unknown:boolean):{mode:'learn'|'review'|'challenge';reason:string}{
 if(confidence==='forgot'||confidence==='never')return {mode:'learn',reason:confidence==='forgot'?'You asked for a refresher. Start with the idea, then try it.':'Start with an explanation, then find what you can do with it.'};
 if(unknown)return {mode:'review',reason:'A short starting check will help us choose useful support.'};
 if(!correct&&confidence==='know')return {mode:'challenge',reason:'A contrasting example checks the step that felt familiar.'};
 return correct?{mode:'challenge',reason:'Use the idea on fresh numbers.'}:{mode:'review',reason:'A fresh check will help decide which step to work on.'};
}
