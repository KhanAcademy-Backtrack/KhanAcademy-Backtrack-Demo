import { SKILLS, type KhanResource } from './curriculum';
import type { Recovery } from './recovery';
const ROOT='https://www.khanacademy.org';
const BASICS=ROOT+'/math/algebra-basics';
const EXPRESSIONS=BASICS+'/alg-basics-algebraic-expressions/alg-basics-distributive-property';
const EQUATIONS=BASICS+'/alg-basics-linear-equations-and-inequalities';
export type KhanMaterial={id:string;title:string;source:string;resources:KhanResource[]};
// Video IDs were read from the official lessons' rendered YouTube players,
// 10 September 2026. No internal Khan API or scraping of learner records.
export function khanMaterial(s:Recovery):KhanMaterial{
  if(s.active==='expand'||(s.active==='goal'&&s.topic==='brackets'))return {id:'Jp25LHI9wII',title:'Distributive property with variables',source:EXPRESSIONS+'/v/distributive-property-with-variables-exercise',resources:[{kind:'exercise',title:s.active==='goal'?'Equations with parentheses':'Distributive property with variables',url:s.active==='goal'?EQUATIONS+'/alg-basics-variables-on-both-sides/e/multistep_equations_with_distribution':EXPRESSIONS+'/e/distributive-property-with-variables'}]};
  if(s.active==='linear')return {id:'DqeMQHomwAU',title:'One-step multiplication equations',source:EQUATIONS+'/alg-basics-one-step-add-sub-equations/v/solving-one-step-equations-2',resources:[{kind:'article',title:'One-step equations review',url:ROOT+'/math/algebra-home/alg-basic-eq-ineq/alg-one-step-mult-div-equations/a/one-step-equation-review'},{kind:'exercise',title:'One-step multiplication & division equations',url:EQUATIONS+'/alg-basics-one-step-add-sub-equations/e/linear_equations_1'}]};
  const sourceSkill=s.active==='terms'?SKILLS.like_terms:s.active==='factor'?SKILLS.factor:s.active==='distribute'?SKILLS.distribute:SKILLS.quadratic;
  const ids={terms:'CLWpkv6ccpA',factor:'D3a8NnpQ2vU',distribute:'oOTFGdjhqqM',zero:'2ZzuZvz33X0',goal:'2ZzuZvz33X0'};
  const video=sourceSkill.khan.resources.find(x=>x.kind==='video')!;
  return {id:ids[s.active as keyof typeof ids],title:video.title,source:video.url,resources:sourceSkill.khan.resources.filter(x=>x.kind!=='video')};
}
