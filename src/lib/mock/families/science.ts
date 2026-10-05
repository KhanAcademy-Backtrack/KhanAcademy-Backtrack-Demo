import {fmt,asFraction,tex} from '../prng.ts';
import type {Family} from '../types.ts';

/** Standard atomic masses rounded the way SHS textbooks round them.
 *  Listed for the team's science reviewer. */
export const ATOMIC_MASS={H:1,C:12,N:14,O:16,Na:23,Mg:24,Al:27,S:32,Cl:35.5,Ca:40} as const;
export const G=9.8;
export const WATER_C=4.18;

/* Formulas, units and every equation are LaTeX; the strings change, the draws do not. */
const unit=(u:string,places=4)=>(v:number)=>tex(`${fmt(v,places)}\\,\\mathrm{${u}}`);

type Compound={formula:string;name:string;M:number;slip:number};
/** `slip` is the formula mass a learner gets by ignoring one subscript. */
const COMPOUNDS:Compound[]=[
 {formula:'\\mathrm{H_{2}O}',name:'water',M:18,slip:17},
 {formula:'\\mathrm{CO_{2}}',name:'carbon dioxide',M:44,slip:28},
 {formula:'\\mathrm{NaOH}',name:'sodium hydroxide',M:40,slip:40},
 {formula:'\\mathrm{CaCO_{3}}',name:'calcium carbonate',M:100,slip:68},
 {formula:'\\mathrm{O_{2}}',name:'oxygen gas',M:32,slip:16},
 {formula:'\\mathrm{MgO}',name:'magnesium oxide',M:40,slip:40},
 {formula:'\\mathrm{CH_{4}}',name:'methane',M:16,slip:13}
];

type Bracketed={formula:string;element:string;count:number;inside:number;outside:number;total:number};
const BRACKETED:Bracketed[]=[
 {formula:'\\mathrm{Ca(OH)_{2}}',element:'hydrogen',count:2,inside:1,outside:2,total:5},
 {formula:'\\mathrm{Al_{2}(SO_{4})_{3}}',element:'oxygen',count:12,inside:4,outside:3,total:17},
 {formula:'\\mathrm{Mg(NO_{3})_{2}}',element:'oxygen',count:6,inside:3,outside:2,total:9},
 {formula:'\\mathrm{(NH_{4})_{3}PO_{4}}',element:'hydrogen',count:12,inside:4,outside:3,total:20},
 {formula:'\\mathrm{Fe_{2}(SO_{4})_{3}}',element:'sulfur',count:3,inside:1,outside:3,total:17},
 {formula:'\\mathrm{Ba(NO_{3})_{2}}',element:'nitrogen',count:2,inside:1,outside:2,total:9}
];

/** Percent composition cases. `slipMass`/`slipM` are what a learner gets by ignoring a subscript. */
const COMPOSITION=[
 {formula:'\\mathrm{H_{2}O}',element:'hydrogen',mass:2,M:18,atomShare:2/3,slipMass:1,slipM:17},
 {formula:'\\mathrm{CO_{2}}',element:'carbon',mass:12,M:44,atomShare:1/3,slipMass:12,slipM:28},
 {formula:'\\mathrm{Na_{2}O}',element:'sodium',mass:46,M:62,atomShare:2/3,slipMass:23,slipM:39},
 {formula:'\\mathrm{CaCO_{3}}',element:'calcium',mass:40,M:100,atomShare:1/5,slipMass:40,slipM:68},
 {formula:'\\mathrm{Al_{2}O_{3}}',element:'aluminium',mass:54,M:102,atomShare:2/5,slipMass:27,slipM:75}
];

/** Genetics questions on a single-gene cross, written out rather than generated
 *  so each distractor's reasoning is exact. */
const CROSSES=[
 {stem:(g:string,t:string)=>`Two plants heterozygous for ${t} ($${g.toUpperCase()}${g} \\times ${g.toUpperCase()}${g}$) are crossed. What fraction of the offspring is expected to show the recessive trait?`,answer:1/4,wrong:[[3/4,'phenotype_swapped'],[1/2,'heterozygous_for_phenotype'],[0,'dominant_takes_all']] as const,steps:['The Punnett square has four equal boxes: one AA, two Aa, one aa.','Only aa shows the recessive trait: 1 of 4 boxes.']},
 {stem:(g:string,t:string)=>`Two plants heterozygous for ${t} ($${g.toUpperCase()}${g} \\times ${g.toUpperCase()}${g}$) are crossed. What fraction of the offspring is expected to show the dominant trait?`,answer:3/4,wrong:[[1/4,'phenotype_swapped'],[1/2,'heterozygous_for_phenotype'],[1/3,'ratio_read_as_fraction']] as const,steps:['The Punnett square has four equal boxes: one AA, two Aa, one aa.','AA and Aa both show the dominant trait: 3 of 4 boxes.']},
 {stem:(g:string,t:string)=>`A plant heterozygous for ${t} ($${g.toUpperCase()}${g}$) is crossed with a homozygous recessive plant ($${g}${g}$). What fraction of the offspring is expected to show the recessive trait?`,answer:1/2,wrong:[[1/4,'phenotype_swapped'],[0,'dominant_takes_all'],[1,'recessive_needs_one']] as const,steps:['Half the gametes of the first parent carry a, and every gamete of the second carries a.','So half the offspring are aa and show the recessive trait.']}
];
const TRAITS=[['t','tall stems'],['p','purple flowers'],['r','round seeds'],['y','yellow seeds']] as const;

/** Twenty science families across physics, chemistry and biology. */
export const SCIENCE_FAMILIES:Family[]=[
 {id:'s_density',subtest:'science',title:'Density',skill:'density',concept:'matter_measurement',difficulty:1,reviewerChapter:'s_units',khanRef:'phys1_q1',build:r=>{
  const V=r.pick([2,4,5,8,10,20,25]),d=r.pick([0.5,0.8,1.2,2.5,2.7,7.9,11.3]),m=Math.round(d*V*100)/100;
  return {stem:`A block has a mass of ${fmt(m)} g and a volume of $${V}\\,\\mathrm{cm}^{3}$. What is its density?`,answer:d,expr:`${m}/${V}`,show:unit('g/cm^{3}'),
   steps:['$\\text{Density} = \\text{mass} \\div \\text{volume}$.',`$\\rho = ${fmt(m)}\\,\\mathrm{g} \\div ${V}\\,\\mathrm{cm}^{3} = ${fmt(d)}\\,\\mathrm{g/cm^{3}}$.`],
   wrong:[{value:V/m,misconception:'ratio_inverted'},{value:m*V,misconception:'multiplied_quantities'},{value:m-V,misconception:'subtracted_quantities'}].filter(w=>w.value>0)};}},
 {id:'s_speed',subtest:'science',title:'Average speed',skill:'speed',concept:'motion_forces',difficulty:1,reviewerChapter:'s_motion',khanRef:'phys1_q1',build:r=>{
  const t=r.pick([4,5,8,10,12,20,25]),v=r.int(2,15),d=v*t;
  return {stem:`A runner covers ${d} m in ${t} s. What is the runner's average speed?`,answer:v,expr:`${d}/${t}`,show:unit('m/s'),
   steps:['$\\text{Average speed} = \\text{distance} \\div \\text{time}$.',`$v = ${d}\\,\\mathrm{m} \\div ${t}\\,\\mathrm{s} = ${v}\\,\\mathrm{m/s}$.`],
   wrong:[{value:t/d,misconception:'ratio_inverted'},{value:d*t,misconception:'multiplied_quantities'},{value:d-t,misconception:'subtracted_quantities'}]};}},
 {id:'s_acceleration',subtest:'science',title:'Acceleration',skill:'acceleration',concept:'motion_forces',difficulty:1,reviewerChapter:'s_motion',khanRef:'phys1_q1',build:r=>{
  const t=r.int(2,8),a=r.int(1,6),u=r.int(2,20),v=u+a*t;
  return {stem:`A car speeds up from ${u} m/s to ${v} m/s in ${t} s. What is its acceleration?`,answer:a,expr:`(${v}-${u})/${t}`,show:unit('m/s^{2}'),
   steps:['$a = (v - u) \\div t$.',`$a = (${v} - ${u}) \\div ${t} = ${v-u} \\div ${t} = ${a}\\,\\mathrm{m/s^{2}}$.`],
   wrong:[{value:v/t,misconception:'initial_velocity_ignored'},{value:(v+u)/t,misconception:'velocity_change_added'},{value:(v-u)*t,misconception:'multiplied_by_time'}]};}},
 {id:'s_newton2',subtest:'science',title:'Newton’s second law with friction',skill:'net_force_accel',concept:'motion_forces',difficulty:2,reviewerChapter:'s_forces',khanRef:'phys1_q1',build:r=>{
  const m=r.pick([2,4,5,8,10,20]),a=r.int(1,5),f=r.int(2,20),F=m*a+f;
  return {stem:`A ${m} kg crate is pushed with a ${F} N force across a floor where friction is ${f} N. What is the crate's acceleration?`,answer:a,expr:`(${F}-${f})/${m}`,show:unit('m/s^{2}'),
   steps:[`Net force: $${F}\\,\\mathrm{N} - ${f}\\,\\mathrm{N} = ${F-f}\\,\\mathrm{N}$.`,`$a = F_{\\text{net}} \\div m = ${F-f} \\div ${m} = ${a}\\,\\mathrm{m/s^{2}}$.`],
   wrong:[{value:F/m,misconception:'friction_ignored'},{value:(F+f)/m,misconception:'forces_added'},{value:(F-f)*m,misconception:'multiplied_quantities'}]};}},
 {id:'s_weight',subtest:'science',title:'Weight',skill:'weight',concept:'motion_forces',difficulty:1,reviewerChapter:'s_forces',khanRef:'phys1_q1',build:r=>{
  const m=r.pick([2,5,10,15,20,40,50,60]),W=m*G;
  return {stem:`What is the weight of a ${m} kg sack of rice on Earth? Use $g = 9.8\\,\\mathrm{m/s^{2}}$.`,answer:W,expr:`${m}*${G}`,show:unit('N'),
   steps:['Weight is a force: $W = mg$.',`$W = ${m}\\,\\mathrm{kg} \\times 9.8\\,\\mathrm{m/s^{2}} = ${fmt(W)}\\,\\mathrm{N}$.`],
   wrong:[{value:m,misconception:'mass_as_weight'},{value:m/G,misconception:'divided_by_g'},{value:m+G,misconception:'added_g'}]};}},
 {id:'s_ohm',subtest:'science',title:'Ohm’s law',skill:'ohms_law',concept:'electricity_waves',difficulty:1,reviewerChapter:'s_electricity',khanRef:'phys2_q3',build:r=>{
  const R=r.pick([2,4,5,6,8,10,12,20]),I=r.pick([0.5,1,1.5,2,2.5,3,4]),V=R*I;
  return {stem:`A ${fmt(V)} V battery drives current through a $${R}\\,\\Omega$ resistor. What current flows?`,answer:I,expr:`${V}/${R}`,show:unit('A'),
   steps:['Ohm’s law: $V = IR$, so $I = V \\div R$.',`$I = ${fmt(V)} \\div ${R} = ${fmt(I)}\\,\\mathrm{A}$.`],
   wrong:[{value:V*R,misconception:'multiplied_quantities'},{value:R/V,misconception:'ratio_inverted'},{value:V-R,misconception:'subtracted_quantities'}].filter(w=>w.value>0)};}},
 {id:'s_moles',subtest:'science',title:'Grams to moles',skill:'grams_to_moles',concept:'moles_formulas',difficulty:1,reviewerChapter:'s_moles',khanRef:'chem1_q1',build:r=>{
  const c=r.pick(COMPOUNDS.filter(x=>x.slip!==x.M)),n=r.pick([0.5,1.5,2,2.5,3,4,5]),mass=c.M*n;
  return {stem:`How many moles are in ${fmt(mass)} g of ${c.name} ($${c.formula}$)? Use $\\mathrm{H} = 1$, $\\mathrm{C} = 12$, $\\mathrm{O} = 16$, $\\mathrm{Ca} = 40$.`,answer:n,expr:`${mass}/${c.M}`,show:unit('mol'),
   steps:[`The molar mass of $${c.formula}$ is ${c.M} g/mol.`,`$n = \\text{mass} \\div \\text{molar mass} = ${fmt(mass)} \\div ${c.M} = ${fmt(n)}\\,\\mathrm{mol}$.`],
   wrong:[{value:mass*c.M,misconception:'multiplied_quantities'},{value:c.M/mass,misconception:'ratio_inverted'},{value:mass/c.slip,misconception:'subscript_ignored'}]};}},
 {id:'s_molarity',subtest:'science',title:'Molarity',skill:'molarity',concept:'solutions_acids',difficulty:1,reviewerChapter:'s_moles',khanRef:'chem2_q1',build:r=>{
  const V=r.pick([100,200,250,400,500]),M=r.pick([0.1,0.2,0.4,0.5,0.8,1,2]),n=Math.round(M*V/1000*1000)/1000;
  return {stem:`${fmt(n)} mol of salt is dissolved to make ${V} mL of solution. What is the molarity?`,answer:M,expr:`${n}/(${V}/1000)`,show:unit('M'),
   steps:[`Convert volume: $${V}\\,\\mathrm{mL} = ${fmt(V/1000)}\\,\\mathrm{L}$.`,`Molarity: $\\text{moles} \\div \\text{litres} = ${fmt(n)} \\div ${fmt(V/1000)} = ${fmt(M)}\\,\\mathrm{M}$.`],
   wrong:[{value:n/V,misconception:'ml_not_converted'},{value:n*V/1000,misconception:'multiplied_quantities'},{value:V/1000/n,misconception:'ratio_inverted'}]};}},
 {id:'s_atom_count',subtest:'science',title:'Counting atoms in a formula',skill:'atom_count_brackets',concept:'moles_formulas',difficulty:1,reviewerChapter:'s_moles',khanRef:'chem1_q1',build:r=>{
  const f=r.pick(BRACKETED);
  return {stem:`How many ${f.element} atoms are in one formula unit of $${f.formula}$?`,answer:f.count,expr:`${f.inside}*${f.outside}`,
   steps:[`Inside the brackets there ${f.inside===1?'is':'are'} ${f.inside} ${f.element} atom${f.inside===1?'':'s'}.`,`The subscript ${f.outside} multiplies the whole bracket: $${f.inside} \\times ${f.outside} = ${f.count}$.`],
   wrong:[{value:f.inside,misconception:'parentheses_subscript_ignored'},{value:f.inside+f.outside,misconception:'subscripts_added'},{value:f.total,misconception:'counted_all_atoms'}]};}},
 {id:'s_half_life',subtest:'science',title:'Half-life',skill:'half_life',concept:'nuclear',difficulty:2,reviewerChapter:'s_nuclear',khanRef:'phys2_q4',build:r=>{
  const N0=r.pick([80,160,200,320,400,640,800]),T=r.pick([2,5,8,10,30]),k=r.int(2,4),ans=N0/2**k;
  return {stem:`A radioactive sample starts at ${N0} g. Its half-life is ${T} days. How much remains after ${T*k} days?`,answer:ans,expr:`${N0}/2^${k}`,show:unit('g'),
   steps:[`Number of half-lives: $${T*k} \\div ${T} = ${k}$.`,`Halve ${k} times: $${N0} \\times \\left(\\frac{1}{2}\\right)^{${k}} = ${fmt(ans)}\\,\\mathrm{g}$.`],
   wrong:[{value:N0-k*N0/4,misconception:'halflife_linear'},{value:N0/2,misconception:'one_half_life_only'},{value:N0/2**(k+1),misconception:'halflife_off_by_one'}]};}},
 {id:'s_punnett',subtest:'science',title:'Single-gene cross',skill:'punnett',concept:'genetics',difficulty:1,reviewerChapter:'s_genetics',khanRef:'bio2_q3',build:r=>{
  const c=r.pick(CROSSES),[g,t]=r.pick(TRAITS);
  return {stem:c.stem(g,t),answer:c.answer,expr:`${c.answer}`,show:v=>tex(asFraction(v)),steps:[...c.steps,`Answer: $${asFraction(c.answer)}$.`],wrong:c.wrong.map(([value,misconception])=>({value,misconception}))};}},
 {id:'s_ph',subtest:'science',title:'pH from hydrogen ion concentration',skill:'ph',concept:'solutions_acids',difficulty:1,reviewerChapter:'s_acids',khanRef:'chem2_q2',build:r=>{
  const n=r.int(2,5);
  return {stem:`A solution has $[\\mathrm{H^{+}}] = 1 \\times 10^{-${n}}\\,\\mathrm{M}$. What is its pH?`,answer:n,expr:`${n}`,
   steps:['$\\mathrm{pH} = -\\log[\\mathrm{H^{+}}]$.',`$-\\log(10^{-${n}}) = ${n}$.`],
   wrong:[{value:-n,misconception:'ph_sign'},{value:14-n,misconception:'ph_poh_swap'},{value:10**-n,misconception:'concentration_for_ph'}]};}},
 {id:'s_kinetic',subtest:'science',title:'Kinetic energy',skill:'kinetic_energy',concept:'energy_heat',difficulty:1,reviewerChapter:'s_energy',khanRef:'phys1_q1',build:r=>{
  const m=r.pick([2,4,5,10,20,50,60]),v=r.int(2,12),ans=m*v*v/2;
  return {stem:`What is the kinetic energy of a ${m} kg object moving at ${v} m/s?`,answer:ans,expr:`0.5*${m}*${v}^2`,show:unit('J'),
   steps:['$\\mathrm{KE} = \\frac{1}{2}mv^2$.',`$\\mathrm{KE} = \\frac{1}{2} \\times ${m} \\times ${v}^2 = \\frac{1}{2} \\times ${m} \\times ${v*v} = ${fmt(ans)}\\,\\mathrm{J}$.`],
   wrong:[{value:m*v*v,misconception:'forgot_half'},{value:m*v/2,misconception:'forgot_square'},{value:m*v,misconception:'momentum_for_energy'}]};}},
 {id:'s_potential',subtest:'science',title:'Gravitational potential energy',skill:'potential_energy',concept:'energy_heat',difficulty:1,reviewerChapter:'s_energy',khanRef:'phys1_q1',build:r=>{
  const m=r.pick([2,5,10,20,50]),h=r.pick([2,3,4,5,10,12,15]),ans=m*G*h;
  return {stem:`A ${m} kg box is lifted onto a shelf ${h} m high. How much gravitational potential energy does it gain? Use $g = 9.8\\,\\mathrm{m/s^{2}}$.`,answer:ans,expr:`${m}*${G}*${h}`,show:unit('J'),
   steps:['$\\mathrm{PE} = mgh$.',`$\\mathrm{PE} = ${m} \\times 9.8 \\times ${h} = ${fmt(ans)}\\,\\mathrm{J}$.`],
   wrong:[{value:m*h,misconception:'forgot_g'},{value:ans/2,misconception:'half_from_ke'},{value:m*G,misconception:'forgot_height'}]};}},
 {id:'s_work',subtest:'science',title:'Work',skill:'work',concept:'energy_heat',difficulty:1,reviewerChapter:'s_energy',khanRef:'phys1_q1',build:r=>{
  const F=r.pick([10,20,25,40,50,80,120]),d=r.pick([2,3,4,5,8,10]);
  return {stem:`A ${F} N force pushes a cart ${d} m in the direction of the force. How much work is done?`,answer:F*d,expr:`${F}*${d}`,show:unit('J'),
   steps:['$W = F \\times d$.',`$W = ${F}\\,\\mathrm{N} \\times ${d}\\,\\mathrm{m} = ${F*d}\\,\\mathrm{J}$.`],
   wrong:[{value:F/d,misconception:'divided_instead'},{value:F+d,misconception:'added_quantities'},{value:d/F,misconception:'ratio_inverted'}]};}},
 {id:'s_power',subtest:'science',title:'Power',skill:'power',concept:'energy_heat',difficulty:1,reviewerChapter:'s_energy',khanRef:'phys1_q1',build:r=>{
  const t=r.pick([2,4,5,10,20]),P=r.pick([25,40,50,60,100,150,200]),W=P*t;
  return {stem:`A motor does ${W} J of work in ${t} s. What is its power?`,answer:P,expr:`${W}/${t}`,show:unit('W'),
   steps:['$P = W \\div t$.',`$P = ${W}\\,\\mathrm{J} \\div ${t}\\,\\mathrm{s} = ${P}\\,\\mathrm{W}$.`],
   wrong:[{value:W*t,misconception:'multiplied_quantities'},{value:t/W,misconception:'ratio_inverted'},{value:W-t,misconception:'subtracted_quantities'}]};}},
 {id:'s_wave',subtest:'science',title:'Wave speed',skill:'wave_speed',concept:'electricity_waves',difficulty:1,reviewerChapter:'s_waves',khanRef:'phys1_q2',build:r=>{
  const f=r.pick([2,4,5,10,20,50,100]),L=r.pick([0.5,1.5,2,3,4,6.8]),v=f*L;
  return {stem:`A wave has a frequency of ${f} Hz and a wavelength of ${fmt(L)} m. How fast does it travel?`,answer:v,expr:`${f}*${L}`,show:unit('m/s'),
   steps:['$v = f\\lambda$.',`$v = ${f}\\,\\mathrm{Hz} \\times ${fmt(L)}\\,\\mathrm{m} = ${fmt(v)}\\,\\mathrm{m/s}$.`],
   wrong:[{value:f/L,misconception:'divided_instead'},{value:L/f,misconception:'ratio_inverted'},{value:f+L,misconception:'added_quantities'}]};}},
 {id:'s_boyle',subtest:'science',title:'Boyle’s law',skill:'boyles_law',concept:'gases',difficulty:2,reviewerChapter:'s_gases',khanRef:'chem1_q1',build:r=>{
  const P1=r.pick([1,2,3,4]),V1=r.pick([6,8,12,24]),P2=r.pick([2,3,4,6,8].filter(x=>x!==P1)),V2=P1*V1/P2;
  return {stem:`A gas occupies ${V1} L at ${P1} atm. At the same temperature, the pressure changes to ${P2} atm. What is the new volume?`,answer:V2,expr:`${P1}*${V1}/${P2}`,show:unit('L'),
   steps:['At constant temperature, $P_1V_1 = P_2V_2$.',`$V_2 = P_1V_1 \\div P_2 = ${P1} \\times ${V1} \\div ${P2} = ${fmt(V2)}\\,\\mathrm{L}$.`],
   wrong:[{value:V1*P2/P1,misconception:'direct_for_inverse'},{value:V1,misconception:'no_change_assumed'},{value:P1*V1*P2,misconception:'multiplied_quantities'}]};}},
 {id:'s_heat',subtest:'science',title:'Heat and temperature change',skill:'specific_heat',concept:'energy_heat',difficulty:2,reviewerChapter:'s_energy',khanRef:'chem2_q1',build:r=>{
  const m=r.pick([50,100,200,250,500]),T1=r.pick([20,25,30]),dT=r.pick([10,20,25,40,50]),T2=T1+dT,Q=m*WATER_C*dT;
  return {stem:`How much heat warms ${m} g of water from $${T1}\\,^{\\circ}\\mathrm{C}$ to $${T2}\\,^{\\circ}\\mathrm{C}$? Use $c = 4.18\\,\\mathrm{J/(g\\,^{\\circ}C)}$.`,answer:Q,expr:`${m}*${WATER_C}*(${T2}-${T1})`,show:unit('J'),
   steps:[`$\\Delta T = ${T2} - ${T1} = ${dT}\\,^{\\circ}\\mathrm{C}$.`,`$Q = mc\\Delta T = ${m} \\times 4.18 \\times ${dT} = ${fmt(Q)}\\,\\mathrm{J}$.`],
   wrong:[{value:m*WATER_C*T2,misconception:'final_temp_for_change'},{value:m*WATER_C,misconception:'forgot_temp_change'},{value:m*dT,misconception:'forgot_specific_heat'}]};}},
 {id:'s_percent_comp',subtest:'science',title:'Percent composition',skill:'percent_composition',concept:'moles_formulas',difficulty:2,reviewerChapter:'s_moles',khanRef:'chem1_q1',build:r=>{
  const c=r.pick(COMPOSITION),ans=c.mass/c.M*100;
  return {stem:`What is the percent by mass of ${c.element} in $${c.formula}$? Use $\\mathrm{H} = 1$, $\\mathrm{C} = 12$, $\\mathrm{O} = 16$, $\\mathrm{Na} = 23$, $\\mathrm{Al} = 27$, $\\mathrm{Ca} = 40$.`,answer:ans,expr:`${c.mass}/${c.M}*100`,show:v=>tex(`${fmt(v,2)}\\%`),
   steps:[`Mass of ${c.element} in one formula: ${c.mass}. Formula mass: ${c.M}.`,`$${c.mass} \\div ${c.M} \\times 100 = ${fmt(ans,2)}\\%$.`],
   wrong:[{value:c.atomShare*100,misconception:'counted_atoms_fraction'},{value:c.mass,misconception:'element_mass_as_percent'},{value:c.slipMass/c.slipM*100,misconception:'subscript_ignored'}]};}}
];
