import {fmt,fracText,asFraction,peso,gcd,tex} from '../prng.ts';
import type {Family} from '../types.ts';

/* Every equation, expression, fraction and numeric choice is LaTeX between dollar
   signs. Only the strings may change here: the draws from `r` stay in the same order,
   because saved forms rebuild their questions from the seed. */
const eq=(v:number)=>tex(`x = ${fmt(v)}`);
const frac=(v:number)=>asFraction(v);
const pi=(v:number)=>tex(`${fmt(v)}\\pi`);
const deg=(v:number)=>tex(`${fmt(v)}^\\circ`);
const unit=(u:string)=>(v:number)=>tex(`${fmt(v)}\\,\\mathrm{${u}}`);

/** Twenty mathematics families. Each is a pure function of its seeded generator.
 *  Distractors come from named misconceptions, never from random offsets. */
export const MATH_FAMILIES:Family[]=[
 {id:'m_pct_change',subtest:'math',title:'Percent increase',skill:'percent_change',concept:'percent_fractions',difficulty:1,reviewerChapter:'m_fractions_percent',khanRef:'g7m_q1',build:r=>{
  const P=r.int(4,40)*50,rate=r.pick([10,12,15,20,25,30,40]);const ans=P*(100+rate)/100;
  return {stem:`A school bag costs ${peso(P)}. Its price rises by ${rate}%. What is the new price?`,answer:ans,expr:`${P}*(100+${rate})/100`,show:peso,
   steps:[`The increase is ${rate}% of ${peso(P)}: $${P} \\times \\frac{${rate}}{100} = ${fmt(P*rate/100)}$.`,`Add it to the original price: $${P} + ${fmt(P*rate/100)} = ${fmt(ans)}$.`,`The new price is ${peso(ans)}.`],
   wrong:[{value:P*rate/100,misconception:'percent_part_only'},{value:P+rate,misconception:'percent_as_number'},{value:P*(100-rate)/100,misconception:'percent_wrong_direction'}]};}},
 {id:'m_frac_add',subtest:'math',title:'Adding unlike fractions',skill:'fraction_add',concept:'percent_fractions',difficulty:1,reviewerChapter:'m_fractions_percent',khanRef:'g7m_q1',build:r=>{
  const b=r.pick([2,3,4,5,6]),d=r.pick([3,4,5,7,8,9].filter(x=>x!==b&&x%b!==0&&b%x!==0));if(!d)return null;
  const a=r.int(1,b-1),c=r.int(1,d-1),ans=a/b+c/d,L=b*d/gcd(b,d);
  return {stem:`What is $\\frac{${a}}{${b}} + \\frac{${c}}{${d}}$?`,answer:ans,expr:`${a}/${b}+${c}/${d}`,show:v=>tex(frac(v)),
   steps:[`Use the common denominator ${L}.`,`$\\frac{${a}}{${b}} = \\frac{${a*L/b}}{${L}}$ and $\\frac{${c}}{${d}} = \\frac{${c*L/d}}{${L}}$.`,`Add the numerators: $\\frac{${a*L/b + c*L/d}}{${L}} = ${fracText(a*L/b+c*L/d,L)}$.`],
   wrong:[{value:(a+c)/(b+d),misconception:'add_across'},{value:(a+c)/L,misconception:'keep_one_denominator'},{value:(a+c)/(b*d),misconception:'multiply_denominators_only'}]};}},
 {id:'m_ratio_share',subtest:'math',title:'Sharing in a ratio',skill:'ratio_share',concept:'ratio_rate',difficulty:1,reviewerChapter:'m_ratio',khanRef:'g7m_q1',build:r=>{
  const a=r.int(2,7),b=r.int(2,7);if(a===b||gcd(a,b)!==1)return null;const T=(a+b)*r.int(3,30)*10,ans=T*a/(a+b);
  return {stem:`Ana and Ben share ${peso(T)} in the ratio $${a} : ${b}$. How much does Ana get?`,answer:ans,expr:`${T}*${a}/(${a}+${b})`,show:peso,
   steps:[`There are $${a} + ${b} = ${a+b}$ equal parts.`,`One part is $${T} \\div ${a+b} = ${fmt(T/(a+b))}$.`,`Ana gets ${a} parts: $${a} \\times ${fmt(T/(a+b))} = ${fmt(ans)}$.`],
   wrong:[{value:T*a/b,misconception:'ratio_part_as_total'},{value:T/(a+b),misconception:'ratio_one_share_only'},{value:T*b/(a+b),misconception:'ratio_swapped'}]};}},
 {id:'m_linear_solve',subtest:'math',title:'Solving a linear equation',skill:'linear_solve',concept:'linear_equations',difficulty:1,reviewerChapter:'m_linear',khanRef:'g8m_q3',build:r=>{
  const a=r.int(2,9),x=r.int(-9,12),b=r.int(1,20)*r.pick([1,-1]);if(x===0)return null;const c=a*x+b,sb=b<0?`- ${-b}`:`+ ${b}`;
  return {stem:`Solve for $x$: $${a}x ${sb} = ${c}$`,answer:x,expr:`(${c}-(${b}))/${a}`,show:eq,
   steps:[`${b<0?'Add':'Subtract'} ${Math.abs(b)} on both sides: $${a}x = ${c-b}$.`,`Divide both sides by ${a}: $x = ${fmt(x)}$.`,`Check: $${a}(${x}) ${sb} = ${c}$.`],
   wrong:[{value:(c+b)/a,misconception:'sign_moving_term'},{value:c/a-b,misconception:'divide_before_subtract'},{value:(c-b)*a,misconception:'multiply_instead_divide'}]};}},
 {id:'m_exponents',subtest:'math',title:'Laws of exponents',skill:'exponent_rules',concept:'exponents_polynomials',difficulty:2,reviewerChapter:'m_exponents',khanRef:'g7m_q4',build:r=>{
  const m=r.int(2,9),n=r.int(2,9),k=r.int(1,5);const ans=m+n-k;if(ans<1)return null;
  return {stem:`Simplify $(2^{${m}} \\times 2^{${n}}) \\div 2^{${k}}$.`,answer:ans,expr:`${m}+${n}-${k}`,show:v=>tex(`2^{${fmt(v)}}`),
   steps:[`Same base, multiplying: add exponents. $2^{${m}} \\times 2^{${n}} = 2^{${m+n}}$.`,`Same base, dividing: subtract exponents. $2^{${m+n}} \\div 2^{${k}} = 2^{${ans}}$.`],
   wrong:[{value:m*n-k,misconception:'exponents_multiplied'},{value:m+n+k,misconception:'division_adds_exponent'},{value:(m+n)/k,misconception:'division_divides_exponent'}].filter(w=>Number.isInteger(w.value)&&w.value>0)};}},
 {id:'m_expand_square',subtest:'math',title:'Squaring a binomial',skill:'binomial_square',concept:'exponents_polynomials',difficulty:1,reviewerChapter:'m_polynomials',khanRef:'g8m_q1',build:r=>{
  const a=r.int(3,12);
  return {stem:`When $(x + ${a})^2$ is expanded, what is the coefficient of $x$?`,answer:2*a,expr:`2*${a}`,
   steps:[`$(x + ${a})^2 = (x + ${a})(x + ${a})$.`,`The cross products are $${a}x$ and $${a}x$, which add to $${2*a}x$.`,`So $(x + ${a})^2 = x^2 + ${2*a}x + ${a*a}$.`],
   wrong:[{value:a,misconception:'square_middle_term_once'},{value:0,misconception:'square_distributes'},{value:a*a,misconception:'square_middle_as_square'}]};}},
 {id:'m_quad_root',subtest:'math',title:'Roots of a quadratic',skill:'quadratic_roots',concept:'quadratics',difficulty:2,reviewerChapter:'m_quadratics',khanRef:'g9m_q3',build:r=>{
  const p=r.int(-9,9),q=r.int(-9,9);if(p===0||q===0||p===q||p===-q)return null;const b=-(p+q),c=p*q;
  const t=(n:number,x:string)=>n===0?'':` ${n<0?'-':'+'} ${Math.abs(n)===1&&x?'':Math.abs(n)}${x}`;
  const wrong=[{value:-p,misconception:'root_sign_flip'},{value:c,misconception:'constant_as_root'},{value:p+q,misconception:'sum_as_root'}];
  if(wrong.some(w=>w.value===q))return null;
  return {stem:`Which of these is a solution of $x^2${t(b,'x')}${t(c,'')} = 0$?`,answer:p,expr:`${p}`,show:eq,
   steps:[`Find two numbers with product $${c}$ and sum $${-b}$: $${p}$ and $${q}$.`,`Factor: $(x ${p<0?'+':'-'} ${Math.abs(p)})(x ${q<0?'+':'-'} ${Math.abs(q)}) = 0$.`,`A factor is zero when $x = ${p}$ or $x = ${q}$. Only $x = ${p}$ is listed.`],wrong};}},
 {id:'m_slope',subtest:'math',title:'Slope from two points',skill:'slope',concept:'lines_functions',difficulty:1,reviewerChapter:'m_lines',khanRef:'g9m_q1',build:r=>{
  const x1=r.int(-6,4),y1=r.int(-6,6),dx=r.int(1,6),dy=r.int(-8,8);if(dy===0||Math.abs(dy)===dx)return null;const x2=x1+dx,y2=y1+dy,ans=dy/dx;
  if(x1+x2===0)return null;
  return {stem:`What is the slope of the line through $(${x1}, ${y1})$ and $(${x2}, ${y2})$?`,answer:ans,expr:`(${y2}-(${y1}))/(${x2}-(${x1}))`,show:v=>tex(frac(v)),
   steps:[`Rise: $${y2} - (${y1}) = ${dy}$.`,`Run: $${x2} - (${x1}) = ${dx}$.`,`Slope: $\\frac{\\text{rise}}{\\text{run}} = ${fracText(dy,dx)}$.`],
   wrong:[{value:dx/dy,misconception:'slope_run_over_rise'},{value:(y2+y1)/(x2+x1),misconception:'slope_sum_not_difference'},{value:-ans,misconception:'slope_sign_order'}]};}},
 {id:'m_triangle_area',subtest:'math',title:'Area of a triangle',skill:'triangle_area',concept:'geometry',difficulty:1,reviewerChapter:'m_geometry',khanRef:'g8m_q2',build:r=>{
  const b=r.int(3,20),h=r.int(3,20)*2;
  return {stem:`A triangle has base ${b} cm and height ${h} cm. What is its area?`,answer:b*h/2,expr:`${b}*${h}/2`,show:v=>tex(`${fmt(v)}\\,\\mathrm{cm}^{2}`),
   steps:[`$A = \\frac{1}{2} \\times \\text{base} \\times \\text{height}$.`,`$A = \\frac{1}{2} \\times ${b} \\times ${h} = ${fmt(b*h/2)}\\,\\mathrm{cm}^{2}$.`],
   wrong:[{value:b*h,misconception:'triangle_forgot_half'},{value:b+h,misconception:'area_as_sum'},{value:2*(b+h),misconception:'area_as_perimeter'}]};}},
 {id:'m_pythagoras',subtest:'math',title:'Pythagorean theorem',skill:'pythagoras',concept:'geometry',difficulty:1,reviewerChapter:'m_geometry',khanRef:'g8m_q2',build:r=>{
  const [a0,b0,c0]=r.pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25],[20,21,29]] as const),k=r.int(1,3),a=a0*k,b=b0*k,c=c0*k;
  return {stem:`A right triangle has legs ${a} m and ${b} m. How long is the hypotenuse?`,answer:c,expr:`(${a}^2+${b}^2)^0.5`,show:unit('m'),
   steps:[`$c^2 = ${a}^2 + ${b}^2 = ${a*a} + ${b*b} = ${a*a+b*b}$.`,`$c = \\sqrt{${a*a+b*b}} = ${c}\\,\\mathrm{m}$.`],
   wrong:[{value:a+b,misconception:'hypotenuse_add_legs'},{value:a*a+b*b,misconception:'forgot_square_root'},{value:a*b/2,misconception:'area_for_length'}]};}},
 {id:'m_circle_area',subtest:'math',title:'Area of a circle',skill:'circle_area',concept:'geometry',difficulty:1,reviewerChapter:'m_geometry',khanRef:'g10m_q4',build:r=>{
  const R=r.int(2,12),D=2*R;
  return {stem:`A circular table top has a diameter of ${D} dm. What is its area, in square decimetres?`,answer:R*R,expr:`(${D}/2)^2`,show:pi,
   steps:[`The radius is half the diameter: $${D} \\div 2 = ${R}$.`,`$A = \\pi r^2 = \\pi \\times ${R}^2 = ${R*R}\\pi\\,\\mathrm{dm}^{2}$.`],
   wrong:[{value:D*D,misconception:'diameter_as_radius'},{value:D,misconception:'circumference_for_area'},{value:R,misconception:'radius_not_squared'}]};}},
 {id:'m_mean_missing',subtest:'math',title:'Missing value from a mean',skill:'mean_missing',concept:'statistics_probability',difficulty:2,reviewerChapter:'m_statistics',khanRef:'g7m_q3',build:r=>{
  const n=r.int(4,6),mean=r.int(70,92),known=Array.from({length:n-1},()=>r.int(mean-12,mean+12)),sum=known.reduce((x,y)=>x+y,0),ans=mean*n-sum;
  if(ans<40||ans>100)return null;
  return {stem:`A student's scores on ${n-1} quizzes were ${known.join(', ')}. What score on the next quiz makes the mean of all ${n} quizzes exactly ${mean}?`,answer:ans,expr:`${mean}*${n}-${sum}`,
   steps:[`The ${n} scores must total $${mean} \\times ${n} = ${mean*n}$.`,`The known scores total ${sum}.`,`The missing score is $${mean*n} - ${sum} = ${ans}$.`],
   wrong:[{value:mean,misconception:'mean_missing_as_mean'},{value:mean*(n+1)-sum,misconception:'mean_wrong_count'},{value:Math.round(sum/(n-1)*100)/100,misconception:'mean_of_given'}].filter(w=>w.value!==ans)};}},
 {id:'m_prob_draw',subtest:'math',title:'Probability without replacement',skill:'probability_dependent',concept:'statistics_probability',difficulty:2,reviewerChapter:'m_probability',khanRef:'g8m_q4',build:r=>{
  const red=r.int(3,7),blue=r.int(2,7),n=red+blue,ans=red*(red-1)/(n*(n-1));
  return {stem:`A bag holds ${red} red and ${blue} blue marbles. Two are drawn without putting the first back. What is the probability both are red?`,answer:ans,expr:`${red}/${n}*${red-1}/${n-1}`,show:v=>tex(frac(v)),
   steps:[`First draw: $\\frac{${red}}{${n}}$.`,`Second draw, one red fewer: $\\frac{${red-1}}{${n-1}}$.`,`Multiply: $\\frac{${red}}{${n}} \\times \\frac{${red-1}}{${n-1}} = ${frac(ans)}$.`],
   wrong:[{value:(red/n)**2,misconception:'with_replacement'},{value:red/n,misconception:'one_draw_only'},{value:red/n+(red-1)/(n-1),misconception:'probabilities_added'}].filter(w=>w.value<=1)};}},
 {id:'m_simple_interest',subtest:'math',title:'Simple interest',skill:'simple_interest',concept:'word_problems',difficulty:1,reviewerChapter:'m_word_problems',khanRef:'g10m_q4',build:r=>{
  const P=r.int(2,40)*1000,rate=r.pick([2,3,4,5,6,8]),t=r.int(2,5),ans=P*rate*t/100;
  return {stem:`${peso(P)} is deposited at ${rate}% simple interest per year. How much interest is earned after ${t} years?`,answer:ans,expr:`${P}*${rate}*${t}/100`,show:peso,
   steps:[`$I = P \\times r \\times t$.`,`$I = ${P} \\times \\frac{${rate}}{100} \\times ${t} = ${fmt(ans)}$.`],
   wrong:[{value:P*rate/100,misconception:'interest_one_year'},{value:Math.round((P*(1+rate/100)**t-P)*100)/100,misconception:'compound_for_simple'},{value:P*rate*t,misconception:'percent_as_number'}]};}},
 {id:'m_avg_speed',subtest:'math',title:'Average speed for a round trip',skill:'average_speed',concept:'word_problems',difficulty:3,reviewerChapter:'m_word_problems',khanRef:'g7m_q1',build:r=>{
  const [v1,v2]=r.pick([[30,60],[40,60],[20,30],[60,90],[12,24],[45,90],[30,70],[24,40]] as const),d=r.pick([60,120,180,360]),ans=2*v1*v2/(v1+v2);
  return {stem:`A jeepney travels ${d} km to a town at ${v1} km/h and returns the same way at ${v2} km/h. What is its average speed for the whole trip?`,answer:ans,expr:`2*${d}/(${d}/${v1}+${d}/${v2})`,show:unit('km/h'),
   steps:[`Time there: $${d} \\div ${v1} = ${fmt(d/v1)}\\,\\mathrm{h}$. Time back: $${d} \\div ${v2} = ${fmt(d/v2)}\\,\\mathrm{h}$.`,`Total distance ${2*d} km, total time ${fmt(d/v1+d/v2)} h.`,`Average speed: $${2*d} \\div ${fmt(d/v1+d/v2)} = ${fmt(ans)}\\,\\mathrm{km/h}$.`],
   wrong:[{value:(v1+v2)/2,misconception:'average_of_speeds'},{value:v1+v2,misconception:'speeds_added'},{value:v2-v1,misconception:'speeds_subtracted'}]};}},
 {id:'m_func_eval',subtest:'math',title:'Evaluating a function',skill:'function_eval',concept:'lines_functions',difficulty:2,reviewerChapter:'m_functions',khanRef:'genmath_functions',build:r=>{
  const a=r.int(2,5),b=r.int(1,9),c=r.int(-9,9),k=r.int(2,6),ans=a*k*k-b*k+c;
  const cs=c===0?'':c<0?` - ${-c}`:` + ${c}`;
  return {stem:`If $f(x) = ${a}x^2 + ${b}x${cs}$, what is $f(-${k})$?`,answer:ans,expr:`${a}*(-${k})^2+${b}*(-${k})+(${c})`,
   steps:[`Replace every $x$ with $(-${k})$.`,`$${a}(-${k})^2 = ${a} \\times ${k*k} = ${a*k*k}$. $${b}(-${k}) = ${-b*k}$.`,`$f(-${k}) = ${a*k*k} - ${b*k}${cs} = ${ans}$.`],
   wrong:[{value:-a*k*k-b*k+c,misconception:'negative_squared'},{value:a*k*k+b*k+c,misconception:'sign_dropped_substitution'},{value:-2*a*k-b*k+c,misconception:'square_as_double'}]};}},
 {id:'m_system',subtest:'math',title:'System of two equations',skill:'linear_system',concept:'linear_equations',difficulty:2,reviewerChapter:'m_linear',khanRef:'g8m_q3',build:r=>{
  const x=r.int(2,20),y=r.int(1,15);if(x===y)return null;const s=x+y,d=x-y;
  return {stem:`The sum of two numbers is ${s} and their difference is ${d}. If $x$ is the larger number, what is $x$?`,answer:x,expr:`(${s}+(${d}))/2`,show:eq,
   steps:[`$x + y = ${s}$ and $x - y = ${d}$.`,`Add the equations: $2x = ${s+d}$.`,`$x = ${x}$.`],
   wrong:[{value:y,misconception:'solved_other_variable'},{value:s+d,misconception:'forgot_to_divide'},{value:(s-d),misconception:'subtracted_equations'}]};}},
 {id:'m_polygon_angles',subtest:'math',title:'Interior angles of a polygon',skill:'polygon_angles',concept:'geometry',difficulty:1,reviewerChapter:'m_geometry',khanRef:'g7m_q1',build:r=>{
  const n=r.int(5,12),names:Record<number,string>={5:'pentagon',6:'hexagon',7:'heptagon',8:'octagon',9:'nonagon',10:'decagon',11:'11-sided polygon',12:'dodecagon'},ans=(n-2)*180;
  return {stem:`What is the sum of the interior angles of a ${names[n]}?`,answer:ans,expr:`(${n}-2)*180`,show:deg,
   steps:[`A ${n}-sided polygon splits into $${n} - 2 = ${n-2}$ triangles from one vertex.`,`Sum: $${n-2} \\times 180^\\circ = ${ans}^\\circ$.`],
   wrong:[{value:n*180,misconception:'polygon_n_times_180'},{value:ans/n,misconception:'one_angle_not_sum'},{value:360,misconception:'exterior_for_interior'}]};}},
 {id:'m_arith_seq',subtest:'math',title:'Arithmetic sequence term',skill:'arithmetic_sequence',concept:'sequences',difficulty:1,reviewerChapter:'m_sequences',khanRef:'g8m_q1',build:r=>{
  const a1=r.int(-10,20),d=r.int(2,9)*r.pick([1,1,-1]),n=r.int(8,40),ans=a1+(n-1)*d;
  const first=[0,1,2,3].map(i=>a1+i*d).join(', ');
  return {stem:`What is the ${n}th term of the sequence $${first}, \\ldots$?`,answer:ans,expr:`${a1}+(${n}-1)*(${d})`,
   steps:[`First term $${a1}$, common difference $${d}$.`,`$a_n = a_1 + (n - 1)d = ${a1} + ${n-1} \\times (${d}) = ${ans}$.`],
   wrong:[{value:a1+n*d,misconception:'sequence_off_by_one'},{value:n*d,misconception:'sequence_forgot_first'},{value:a1*n,misconception:'sequence_multiplied'}]};}},
 {id:'m_work_rate',subtest:'math',title:'Working together',skill:'work_rate',concept:'word_problems',difficulty:3,reviewerChapter:'m_word_problems',khanRef:'g7m_q1',build:r=>{
  const [a,b]=r.pick([[2,3],[3,6],[4,12],[6,12],[10,15],[4,6],[12,24],[5,20]] as const),ans=a*b/(a+b);
  return {stem:`Carla can paint a room in ${a} hours. Dino can paint it in ${b} hours. Working together at the same pace, how long do they take?`,answer:ans,expr:`1/(1/${a}+1/${b})`,show:v=>tex(`${fmt(v)}\\text{ hours}`),
   steps:[`Carla paints $\\frac{1}{${a}}$ of the room per hour, Dino $\\frac{1}{${b}}$.`,`Together: $\\frac{1}{${a}} + \\frac{1}{${b}} = ${frac(1/a+1/b)}$ per hour.`,`Time: $1 \\div ${frac(1/a+1/b)} = ${fmt(ans)}$ hours.`],
   wrong:[{value:(a+b)/2,misconception:'rates_averaged'},{value:a+b,misconception:'times_added'},{value:b-a,misconception:'times_subtracted'}]};}},
 {id:'m_trig_ratio',subtest:'math',title:'Trigonometric ratios',skill:'trig_ratio',concept:'trigonometry',difficulty:2,reviewerChapter:'m_trig',khanRef:'g9m_q4',build:r=>{
  const [a0,b0,c0]=r.pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25],[20,21,29]] as const),k=r.int(1,2),a=a0*k,b=b0*k,c=c0*k;
  const fn=r.pick(['sin','cos','tan'] as const);
  const ans=fn==='sin'?a/c:fn==='cos'?b/c:a/b;
  const wrong=fn==='sin'?[{value:b/c,misconception:'trig_adjacent_for_opposite'},{value:a/b,misconception:'trig_wrong_ratio'},{value:c/a,misconception:'trig_ratio_inverted'}]
   :fn==='cos'?[{value:a/c,misconception:'trig_adjacent_for_opposite'},{value:b/a,misconception:'trig_wrong_ratio'},{value:c/b,misconception:'trig_ratio_inverted'}]
   :[{value:b/a,misconception:'trig_adjacent_for_opposite'},{value:a/c,misconception:'trig_wrong_ratio'},{value:c/a,misconception:'trig_ratio_inverted'}];
  const ratio=(top:string,bottom:string,n:number,d:number)=>`$\\${fn} A = \\frac{\\text{${top}}}{\\text{${bottom}}} = \\frac{${n}}{${d}}$.`;
  return {stem:`In right triangle $ABC$, angle $C$ is $90^\\circ$. $BC = ${a}$, $AC = ${b}$ and $AB = ${c}$. What is $\\${fn} A$?`,answer:ans,expr:fn==='sin'?`${a}/${c}`:fn==='cos'?`${b}/${c}`:`${a}/${b}`,show:v=>tex(frac(v)),
   steps:[`From angle $A$: the opposite side is $BC = ${a}$, the adjacent side is $AC = ${b}$, the hypotenuse is $AB = ${c}$.`,fn==='sin'?ratio('opposite','hypotenuse',a,c):fn==='cos'?ratio('adjacent','hypotenuse',b,c):ratio('opposite','adjacent',a,b),`In lowest terms: $${frac(ans)}$.`],wrong};}}
];
