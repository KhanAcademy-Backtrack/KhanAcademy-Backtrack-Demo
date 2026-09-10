import { SKILLS, type KhanResource } from './curriculum.ts';
import type { Recovery } from './recovery';
const ROOT='https://www.khanacademy.org';
const BASICS=ROOT+'/math/algebra-basics';
const EXPRESSIONS=BASICS+'/alg-basics-algebraic-expressions/alg-basics-distributive-property';
const EQUATIONS=BASICS+'/alg-basics-linear-equations-and-inequalities';
/** `matched:false` means no reviewed Khan resource exists for this step yet. The
 *  learner is told so plainly; the original Dunlo explanation is never withheld
 *  because a third-party match is missing. */
export type KhanMaterial={id:string;title:string;source:string;resources:KhanResource[];matched:boolean};
/** Chemistry and physics steps have no hand-verified Khan URL yet. Listing them
 *  explicitly is what stops the fall-through below from serving algebra
 *  factoring resources to a chemistry learner. See docs/THIRD_PARTY_MATERIALS.md. */
const UNMATCHED=new Set(['atom_count','formula_mass','unit_convert','net_force','moles','balancing','motion','forces']);
export const NO_KHAN_MATCH:KhanMaterial={id:'',title:'',source:'',resources:[],matched:false};
// Video IDs were read from the official lessons' rendered YouTube players,
// 10 September 2026. No internal Khan API or scraping of learner records.
export function khanMaterial(s:Recovery):KhanMaterial{
  const extra:Partial<Record<string,{title:string;url:string;kind:'article'|'exercise'}[]>>={
    multiply:[{kind:'exercise',title:'Multiply with arrays',url:ROOT+'/math/cc-third-grade-math/intro-to-multiplication/multiplication-with-arrays/e/multiplying-with-arrays'}],
    equivalent:[{kind:'exercise',title:'Equivalent fractions',url:ROOT+'/exercise/equivalent-fraction'}],
    same_denominator:[{kind:'exercise',title:'Add fractions with common denominators',url:ROOT+'/exercise/adding_fractions_with_common_denominators'}],
    unit_rate:[{kind:'exercise',title:'Unit rates',url:ROOT+'/exercise/unit-rates'}],
    coordinates:[{kind:'article',title:'Read and plot coordinates',url:ROOT+'/math/cc-fifth-grade-math/imp-geometry-3/imp-intro-to-the-coordinate-plane/a/graph-points-review'},{kind:'exercise',title:'Graph points',url:ROOT+'/exercise/graphing_points'}],
    substitute:[{kind:'article',title:'Evaluating expressions with one variable',url:ROOT+'/math/algebra-home/alg-intro-to-algebra/a/evaluating-expressions-with-one-variable'},{kind:'exercise',title:'Evaluate expressions',url:ROOT+'/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:intro-variables/e/evaluating_expressions_1'}],
    fractions:[{kind:'exercise',title:'Add fractions with unlike denominators',url:ROOT+'/math/arithmetic-home/arith-review-fractions/add-sub-fractions/e/adding_fractions'}],
    ratios:[{kind:'exercise',title:'Unit rates',url:ROOT+'/exercise/unit-rates'}],
    graphs:[{kind:'exercise',title:'Evaluate functions from a graph',url:ROOT+'/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:evaluating-functions/e/evaluate-functions-from-their-graph'}]
  };
  const key=s.active==='goal'?s.topic:s.active;
  if(UNMATCHED.has(key))return NO_KHAN_MATCH;
  const matched=extra[key];
  if(matched)return {id:'',title:matched[0].title,source:matched[0].url,resources:matched,matched:true};
  if(s.active==='expand'||(s.active==='goal'&&s.topic==='brackets'))return {id:'Jp25LHI9wII',title:'Distributive property with variables',source:EXPRESSIONS+'/v/distributive-property-with-variables-exercise',resources:[{kind:'exercise',title:s.active==='goal'?'Equations with parentheses':'Distributive property with variables',url:s.active==='goal'?EQUATIONS+'/alg-basics-variables-on-both-sides/e/multistep_equations_with_distribution':EXPRESSIONS+'/e/distributive-property-with-variables'}],matched:true};
  if(s.active==='linear')return {id:'DqeMQHomwAU',title:'One-step multiplication equations',source:EQUATIONS+'/alg-basics-one-step-add-sub-equations/v/solving-one-step-equations-2',resources:[{kind:'article',title:'One-step equations review',url:ROOT+'/math/algebra-home/alg-basic-eq-ineq/alg-one-step-mult-div-equations/a/one-step-equation-review'},{kind:'exercise',title:'One-step multiplication & division equations',url:EQUATIONS+'/alg-basics-one-step-add-sub-equations/e/linear_equations_1'}],matched:true};
  const sourceSkill=s.active==='terms'?SKILLS.like_terms:s.active==='factor'?SKILLS.factor:s.active==='distribute'?SKILLS.distribute:SKILLS.quadratic;
  const ids={terms:'CLWpkv6ccpA',factor:'D3a8NnpQ2vU',distribute:'oOTFGdjhqqM',zero:'2ZzuZvz33X0',goal:'2ZzuZvz33X0'};
  const video=sourceSkill.khan.resources.find(x=>x.kind==='video')!;
  return {id:ids[s.active as keyof typeof ids],title:video.title,source:video.url,resources:sourceSkill.khan.resources.filter(x=>x.kind!=='video'),matched:true};
}
