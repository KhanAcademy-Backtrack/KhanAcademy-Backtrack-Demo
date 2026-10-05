import test from 'node:test';
import assert from 'node:assert/strict';
import {parse,speakMath,plainMath,splitMath,speakText,plainText,unknownCommands,unbalancedMath} from '../src/lib/notation.ts';
import {FAMILIES,generateItem} from '../src/lib/mock/families/index.ts';
import {MISCONCEPTIONS} from '../src/lib/mock/misconceptions.ts';
import {READING_ITEMS,PASSAGES} from '../src/content/mock/reading.ts';
import {SCIENCE_ITEMS} from '../src/content/mock/science.ts';
import {CHAPTERS} from '../src/content/reviewer/index.ts';
import {EXTRAS} from '../src/content/reviewer/extras.ts';
import {CONCEPTS} from '../src/lib/program/concepts.ts';
import {TOPICS,ORDER,problemFor,initialRecovery} from '../src/lib/recovery.ts';
import {CHALLENGES} from '../src/lib/challenges.ts';
import {EXPLORE_ITEMS} from '../src/lib/explore.ts';

/* Every equation on the site is LaTeX. In running text it sits between dollar signs;
   these checks find mathematics that slipped through as plain text, and LaTeX that the
   typesetter would not understand. */

/** Signs of mathematics written as plain text: operators, scripts, fractions, terms,
 *  chemical formulas and bare variables. Checked only outside $...$. */
const PLAIN_MATH=[
 [/[=×÷±≤≥≠≈√π²³¹⁰⁴⁵⁶⁷⁸⁹⁻⁺₀₁₂₃₄₅₆₇₈₉−→⇌½¼¾°^]/,'a mathematical symbol'],
 [/\d\s*\/\s*\d/,'a fraction'],
 [/[\w)]\s*\+\s*[\w(]/,'a sum'],
 [/\b\d+[xyz]\b/,'a term'],
 [/\b(?:[A-Z][a-z]?\d+)+[A-Z]?[a-z]?\b/,'a chemical formula'],
 [/(?:^|[\s(“"])[xy](?=[\s.,;:?!)”"]|$)/,'a variable'],
 [/\s[<>]\s/,'an inequality'],
];

/** Inside LaTeX, operators and scripts are commands (\\times, ^{2}), not Unicode look-alikes. */
const UNICODE_IN_LATEX=/[×÷−±≤≥≠≈√π²³⁰-⁹⁻₀-₉→⇌·½°]/;

function strings(value,path,out,seen=new Set()){
 if(value==null)return out;
 if(typeof value==='string'){if(!/^(?:https?:|\/)/.test(value))out.push([path,value]);return out;}
 if(typeof value!=='object'||seen.has(value))return out;
 seen.add(value);
 for(const [k,v] of Object.entries(value))strings(v,`${path}.${k}`,out,seen);
 return out;
}

function problems([path,text]){
 const found=[];
 if(unbalancedMath(text))found.push('an unclosed $');
 for(const seg of splitMath(text)){
  if(seg.math){
   const unknown=unknownCommands(seg.v);if(unknown.length)found.push(`unknown LaTeX \\${unknown.join(', \\')}`);
   const open=(seg.v.replace(/\\[{}]/g,'').match(/\{/g)??[]).length,close=(seg.v.replace(/\\[{}]/g,'').match(/\}/g)??[]).length;
   if(open!==close)found.push('unbalanced braces');
   const unicode=seg.v.match(UNICODE_IN_LATEX);if(unicode)found.push(`Unicode “${unicode[0]}” inside LaTeX; use the command`);
  }else for(const [re,what] of PLAIN_MATH)if(re.test(seg.v))found.push(`${what} outside LaTeX: “${seg.v.match(re)[0]}”`);
 }
 return found.map(f=>`${path}: ${f}\n    ${text}`);
}

const generated=()=>FAMILIES.flatMap(f=>Array.from({length:40},(_,s)=>generateItem(f.id,s))).flatMap(it=>strings({stem:it.stem,choices:it.choices,steps:it.solutionSteps},it.id,[]));

function assertLatex(entries){
 const bad=entries.flatMap(problems);
 assert.equal(bad.length,0,`${bad.length} strings need LaTeX:\n${bad.slice(0,Number(process.env.LATEX_SHOW??40)).join('\n')}`);
}

test('generated mathematics and science questions write every equation in LaTeX',()=>assertLatex(generated()));

/* Language items and grammar guides talk about letters as letters (“after w or y”), so the
   checks cover the mathematics and science material and the reading passages. */
test('authored questions, passages and misconceptions write every equation in LaTeX',()=>{
 assertLatex([
  ...strings(SCIENCE_ITEMS.map(i=>({stem:i.stem,choices:i.choices,rationales:i.rationales,steps:i.solutionSteps})),'science',[]),
  ...strings(READING_ITEMS.map(i=>({stem:i.stem,choices:i.choices,rationales:i.rationales,steps:i.solutionSteps})),'reading',[]),
  ...strings(PASSAGES.map(p=>p.paragraphs),'passages',[]),
  ...strings(Object.fromEntries(Object.entries(MISCONCEPTIONS).map(([k,m])=>[k,{label:m.label,why:m.why,fix:m.fix}])),'misconceptions',[]),
 ]);
});

test('reviewer chapters, handbooks and topic summaries write every equation in LaTeX',()=>{
 assertLatex([
  ...strings(CHAPTERS.filter(c=>c.subtest==='math'||c.subtest==='science').map(c=>({title:c.title,summary:c.summary,examples:c.examples,traps:c.traps.filter(t=>typeof t!=='string'),tip:c.tip,recall:c.recall,hard:c.hard.text})),'chapters',[]),
  ...strings(EXTRAS.filter(x=>x.id.startsWith('x_formulas')).map(x=>({title:x.title,blurb:x.blurb,sections:x.sections})),'extras',[]),
  ...strings(CONCEPTS.filter(c=>c.subtest==='math'||c.subtest==='science').map(c=>({title:c.title,blurb:c.blurb,tldr:c.tldr})),'concepts',[]),
 ]);
});

/* BACKTRACK keeps each problem's `expression` byte for byte, because saved progress
   fingerprints it; everything a learner reads around it is checked here. */
function backtrackStrings(){
 const out=[];
 for(const [k,m] of Object.entries(TOPICS))strings({label:m.label,goal:m.goal,description:m.description},`TOPICS.${k}`,out);
 for(const topic of Object.keys(TOPICS))for(const active of new Set(['goal',...ORDER]))for(const problemVersion of [undefined,2,3])for(let serial=0;serial<16;serial++){
  const p=problemFor({...initialRecovery(topic),active,serial,problemVersion});
  strings({prompt:p.prompt,hint:p.hint,explanation:p.explanation,labels:p.labels,fields:p.fields},`${topic}.${active}.${serial}`,out);
 }
 for(const c of CHALLENGES)strings({hook:c.hook,title:c.title,insight:c.insight,prompt:c.question.prompt,labels:c.question.labels,explanation:c.question.explanation,hint:c.question.hint},`challenge.${c.code}`,out);
 for(const e of EXPLORE_ITEMS)strings({title:e.title,intro:e.intro,question:e.question,choices:e.choices,explanation:e.explanation},`explore.${e.id}`,out);
 for(const [k,m] of Object.entries(MISCONCEPTIONS))if(m.recovery)out.push([`misconceptions.${k}.routeClue`,m.recovery.routeClue]);
 return out;
}

test('BACKTRACK prompts, hints, explanations and answer labels write every equation in LaTeX',()=>assertLatex(backtrackStrings()));

test('the typesetter reads the LaTeX the material uses',()=>{
 assert.equal(speakMath('\\frac{3}{4} \\times 2'),'the fraction 3 over 4, end fraction times 2');
 assert.equal(speakMath('x^{2} - 5x + 6 \\le 0'),'x squared minus 5 x plus 6 is less than or equal to 0');
 assert.equal(speakMath('\\sqrt{169} = 13'),'the square root of 169, end root equals 13');
 assert.equal(speakMath('\\sqrt[3]{27}'),'the root of index 3 of 27, end root');
 assert.equal(speakMath('90^\\circ'),'90 degrees');
 assert.equal(speakMath('2\\pi r'),'2 pi r');
 assert.equal(speakMath('8{,}000 \\div 4'),'8,000 divided by 4');
 assert.equal(speakMath('(3, 4)'),'open bracket 3, 4 close bracket');
 assert.equal(speakMath('\\text{new} = \\text{original} \\times 1.15'),'new equals original times 1.15');
 assert.equal(speakMath('\\sin A = \\frac{\\text{opposite}}{\\text{hypotenuse}}'),'sin A equals the fraction opposite over hypotenuse, end fraction');
 assert.equal(speakMath('\\left(\\frac{1}{2}\\right)^{3}'),'open bracket the fraction 1 over 2, end fraction close bracket cubed');
 assert.equal(speakMath('a_{n} = a_{1} + (n - 1)d'),'a n equals a 1 plus open bracket n minus 1 close bracket d');
 assert.equal(speakMath('25\\%'),'25 percent');
 assert.equal(speakMath('\\mathrm{N_{2}} + 3\\,\\mathrm{H_{2}} \\rightleftharpoons 2\\,\\mathrm{NH_{3}}'),'N 2 plus 3 H 2 is in equilibrium with 2 N H 3');
 assert.deepEqual(unknownCommands('\\frack{1}{2} \\times \\pi'),['frack']);
 assert.equal(parse('\\frac12')[0].t,'frac','an unbraced argument is one character');
 assert.equal(parse('x^{-1}')[1].body.length,2,'a script holds a signed exponent');
});

test('running text splits on dollar signs and reads aloud and as plain text',()=>{
 assert.deepEqual(splitMath('Solve $2x + 3 = 11$ now.'),[{math:false,v:'Solve '},{math:true,v:'2x + 3 = 11'},{math:false,v:' now.'}]);
 assert.deepEqual(splitMath('It costs \\$5.'),[{math:false,v:'It costs $5.'}]);
 assert.equal(unbalancedMath('Half $x = 1'),true);
 assert.equal(speakText('What is $\\frac{2}{3} + \\frac{1}{4}$?'),'What is the fraction 2 over 3, end fraction plus the fraction 1 over 4, end fraction?');
 assert.equal(plainText('What is $\\frac{2}{3} + \\frac{1}{4}$?'),'What is 2/3 + 1/4?');
 assert.equal(plainMath('x^{2} + \\sqrt{x+1}'),'x² + √(x + 1)');
 assert.equal(plainMath('\\mathrm{H_{2}O}'),'H₂O');
 assert.equal(plainMath('90^\\circ'),'90°');
 assert.equal(plainMath('-2(x - 3)'),'−2(x − 3)','a leading sign stays unary');
 assert.equal(plainMath('y = -2x + 3'),'y = −2x + 3');
 assert.equal(plainMath('(-3) \\times 4'),'(−3) × 4');
 assert.equal(plainText('Try $x = 2$ and 6'),'Try x = 2 and 6');
});
