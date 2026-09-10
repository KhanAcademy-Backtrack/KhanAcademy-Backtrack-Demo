import type {Problem,Recovery,Skill} from './recovery.ts';
/** Short reviewed discriminators. These checks inform support, not independent promotion. */
export function diagnosticCheck(s:Recovery):Problem|undefined{
 if(s.problemVersion!==3||s.routeClue?.serial!==s.serial-1||s.routeClue.skill!==s.active)return;
 const base={id:`${s.topic}:${s.active}:${s.serial}`,family:'diagnostic',hint:'This small check helps choose useful support. You can open an explanation instead.'};
 if(s.active==='factor')return {...base,expression:'2 + 6; 2 × 6',prompt:'Check the two operations separately.',labels:['Sum','Product'],expected:[8,12],explanation:'2 + 6 = 8 and 2 × 6 = 12. Matching the constant alone does not match the middle coefficient.'};
 if(s.active==='zero')return {...base,expression:'x + 3 = 0',prompt:'Which value makes this single factor zero?',labels:['Value of x'],expected:[-3],zeroFactor:3,explanation:'−3 + 3 = 0. The factor constant is 3, while its root is −3.'};
 if(s.active==='expand')return {...base,expression:'3(x + 4)',prompt:'Each of 3 groups has 4 units. Which calculation counts all the units?',labels:['Calculation'],expected:[0],fields:[{kind:'choice',label:'Choose one',options:['3 × 4','3 + 4','Only 4']}],explanation:'Every group contains four units, so 3 × 4 counts the units. The x tiles and unit tiles both occur in every group.'};
 if(s.active==='multiply'&&!s.evidence.at(-1)?.expression?.match(/[−-]/))return {...base,expression:'3 × 4',prompt:'Count the units from three groups of four.',labels:['Product'],expected:[12],explanation:'Four units in each of three groups gives 4 + 4 + 4 = 12.'};
 if(s.active==='multiply')return {...base,expression:'−2 × (−3)',prompt:'Check the sign and the arithmetic separately.',labels:['Product'],expected:[6],explanation:'Multiplying by a negative reverses the sign. Reversing −3 gives +3; doubling gives +6.'};
 if(s.active==='same_denominator')return {...base,expression:'2/3 + 1/4',prompt:'Before counting pieces together, what needs to match?',labels:['What must match?'],expected:[0],fields:[{kind:'choice',label:'Choose one',options:['The size of the pieces','The number of shaded pieces']}],explanation:'Thirds and quarters are different-sized units. Equivalent fractions let us describe both using the same unit.'};
 if(s.active==='unit_rate')return {...base,expression:'2 : 3 → 4 : ?',prompt:'The first amount doubled. Keep the same mixture.',labels:['Second amount'],expected:[6],explanation:'Double both quantities: 2:3 becomes 4:6. Adding 2 to both would give 4:5 and change the mixture.'};
 if(s.active==='coordinates')return {...base,expression:'P = (2, 5)',graph:{kind:'point',x:2,y:5},prompt:'Read across first, then up. What are the coordinates?',labels:['x coordinate','y coordinate'],expected:[2,5],explanation:'The horizontal coordinate is 2. The vertical coordinate is 5. Reading the axes is separate from calculating a rate.'};
}
export function supportAfterProbe(s:Recovery,p:Problem,answer:string[]):{skill:Skill;reason:string}{
 const correct=answer.every((n,i)=>Number(n)===p.expected[i]&&n.trim()!=='');
 if(s.active==='factor')return correct?{skill:'factor',reason:'The arithmetic works here. Let’s connect those results to the two coefficients.'}:{skill:'multiply',reason:'Let’s compare addition and multiplication first, then return to the factor pair.'};
 if(s.active==='expand')return correct?{skill:'multiply',reason:'You selected a contribution from every group. Let’s check the multiplication, then return to expansion.'}:{skill:'expand',reason:'Let’s collect the units from every group before multiplying. The visual shows why the constant is included.'};
 if(s.active==='same_denominator')return correct?{skill:'equivalent',reason:'You selected equal-sized pieces. Next, practise making equivalent fractions.'}:{skill:'same_denominator',reason:'Let’s see why differently sized pieces cannot be counted as the same unit.'};
 if(s.active==='coordinates'&&correct)return {skill:'substitute',reason:'The coordinates are read correctly here. Next, connect the rule’s starting value and rate to a point.'};
 return {skill:s.active,reason:correct?'That small check is useful. Connect it to the goal with an example, then try independent work.':'Let’s try this step first with a worked example. This is a useful starting point, not a diagnosis of your ability.'};
}
