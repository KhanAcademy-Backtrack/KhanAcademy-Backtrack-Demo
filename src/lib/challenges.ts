import type {Problem,Confidence} from './recovery.ts';
export type Challenge={code:string;family:'factors'|'fractions'|'ratios';audience:string;hook:string;title:string;question:Problem;khanId:string;insight:string};
const templates={
 factors:{expression:'x² + 7x + 12',prompt:'Which two numbers belong inside the factors?',labels:['First number','Second number'],expected:[3,4],unordered:true,hint:'Match the sum and the product.',explanation:'3 + 4 = 7, and 3 × 4 = 12. Both conditions must match.',factorPair:[3,4] as [number,number]},
 fractions:{expression:'\\frac{1}{2} + \\frac{1}{3}',prompt:'How much is there altogether?',labels:['Numerator','Denominator'],expected:[5,6],format:'fraction' as const,hint:'Use equal-sized parts before adding.',explanation:'1/2 is 3/6 and 1/3 is 2/6. Together they make 5/6.'},
 ratios:{expression:'3 : 24 = 5 : x',prompt:'Three items cost 24. At the same rate, what do five cost?',labels:['Total for five'],expected:[40],hint:'Find the amount for one first.',explanation:'24 ÷ 3 = 8 for one. Five cost 5 × 8 = 40.'}
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
];
export const CHALLENGES:Challenge[]=entries.map(([code,family,audience,hook,title])=>({code,family,audience,hook,title,question:{id:`source:${code}`,...templates[family]},khanId:family==='factors'?'factor-quadratics':family==='fractions'?'unlike-fractions':'unit-rates',insight:templates[family].explanation}));
export const findChallenge=(code:string)=>CHALLENGES.find(c=>c.code===code.trim().toUpperCase());

export function challengeNextStep(confidence:Confidence,correct:boolean,unknown:boolean):{mode:'learn'|'review'|'challenge';reason:string}{
 if(confidence==='forgot'||confidence==='never')return {mode:'learn',reason:confidence==='forgot'?'You asked for a refresher. Start with the idea, then try it.':'Start with an explanation, then find what you can do with it.'};
 if(unknown)return {mode:'review',reason:'A short starting check will help us choose useful support.'};
 if(!correct&&confidence==='know')return {mode:'challenge',reason:'A contrasting example checks the step that felt familiar.'};
 return correct?{mode:'challenge',reason:'Use the idea on fresh numbers.'}:{mode:'review',reason:'A fresh check will help decide which step to work on.'};
}
