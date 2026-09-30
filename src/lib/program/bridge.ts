import type {KhanUnitId} from './khan-units.ts';
import type {Topic} from '../recovery.ts';

/** Freshman bridge maps: what a first year in each program assumes you already know.
 *  Drafted by Khanpanion from common first-year course content; every map is on the
 *  faculty review list before the pilot. */
export type Assumption={text:string;concepts:string[];engine?:Topic};
export type Rescue={id:string;topic:string;needs:string;concepts:string[];engine?:Topic;khan:KhanUnitId[]};
export type BridgeProgram={id:string;title:string;examples:string;firstYear:string[];assumes:Assumption[];placement:{families:string[];engine:Topic[]};khanPath:KhanUnitId[];rescue:string[]};

export const RESCUES:Rescue[]=[
 {id:'limits',topic:'Limits',needs:'Factoring, simplifying fractions with variables, reading function values from a graph.',concepts:['exponents_polynomials','lines_functions'],engine:'quadratics',khan:['grc_limits','calc_limits']},
 {id:'derivatives',topic:'Derivatives',needs:'Slope as a rate of change, exponent rules, function notation.',concepts:['lines_functions','exponents_polynomials'],engine:'graphs',khan:['grc_diff1','calc_derivatives']},
 {id:'integrals',topic:'Integrals',needs:'Area of basic shapes, exponent rules, sums of sequences.',concepts:['geometry','exponents_polynomials','sequences'],khan:['calc_integrals']},
 {id:'vectors',topic:'Vectors and components',needs:'Right-triangle trigonometry, the Pythagorean theorem, adding signed numbers.',concepts:['trigonometry','geometry'],khan:['grp_vectors','phys1_q1']},
 {id:'kinematics',topic:'Kinematics (motion equations)',needs:'Solving linear equations, units and rates, substitution.',concepts:['linear_equations','matter_measurement','motion_forces'],engine:'motion',khan:['phys1_q1']},
 {id:'newton',topic:'Newton’s laws and free-body diagrams',needs:'Net force with signs, vectors, solving for one unknown.',concepts:['motion_forces','linear_equations'],engine:'forces',khan:['phys1_q1']},
 {id:'stoichiometry',topic:'Stoichiometry',needs:'Counting atoms, molar mass, ratios and proportions.',concepts:['moles_formulas','ratio_rate'],engine:'moles',khan:['chem1_q1']},
 {id:'balancing',topic:'Balancing equations',needs:'Counting atoms in formulas with brackets and coefficients.',concepts:['moles_formulas'],engine:'balancing',khan:['chem1_q1']},
 {id:'solutions',topic:'Solutions and concentration',needs:'Moles, unit conversion, proportions.',concepts:['solutions_acids','moles_formulas','ratio_rate'],khan:['chem2_q1']},
 {id:'logs',topic:'Logarithms and pH',needs:'Exponent rules and powers of ten.',concepts:['exponents_polynomials','solutions_acids'],khan:['chem2_q2']},
 {id:'genetics_prob',topic:'Genetics crosses',needs:'Probability of combined events, fractions.',concepts:['statistics_probability','genetics'],khan:['bio2_q3']},
 {id:'statistics',topic:'Statistics in research courses',needs:'Mean, median, reading graphs, percent.',concepts:['statistics_probability','percent_fractions'],khan:['g7m_q3','statprob']},
 {id:'discrete',topic:'Discrete math and logic',needs:'Sequences, counting, careful reading of conditions.',concepts:['sequences','statistics_probability'],khan:['g8m_q4','precalc_series']},
 {id:'business_math',topic:'Interest and business math',needs:'Percent, ratio, simple and compound interest.',concepts:['percent_fractions','word_problems'],khan:['genmath_business','g10m_q4']},
 {id:'graphs_econ',topic:'Supply, demand and graphs',needs:'Slope, lines, reading intersections.',concepts:['lines_functions','linear_equations'],engine:'graphs',khan:['g9m_q1']},
 {id:'academic_reading',topic:'Reading academic texts',needs:'Main idea, inference, author purpose.',concepts:['main_idea','inference','author_purpose'],khan:['eng9_q3','eng9_q2']}
];

export const PROGRAMS:BridgeProgram[]=[
 {id:'cs_it',title:'Computer Science and IT',examples:'BS Computer Science, BS Information Technology, BS Computer Engineering',
  firstYear:['College algebra and trigonometry','Calculus I','Introduction to programming','Discrete mathematics'],
  assumes:[
   {text:'You can simplify and factor polynomials without a calculator.',concepts:['exponents_polynomials'],engine:'brackets'},
   {text:'You can solve linear equations and systems quickly.',concepts:['linear_equations'],engine:'graphs'},
   {text:'You read function notation and slope easily.',concepts:['lines_functions'],engine:'graphs'},
   {text:'You know exponent rules and are comfortable with powers of two.',concepts:['exponents_polynomials']},
   {text:'You can count cases and work out simple probabilities.',concepts:['statistics_probability']},
   {text:'You can follow a sequence rule and find its nth term.',concepts:['sequences']},
   {text:'You can read a long problem statement carefully and pull out what is asked.',concepts:['word_problems','main_idea']}],
  placement:{families:['m_linear_solve','m_exponents','m_expand_square','m_quad_root','m_slope','m_func_eval','m_arith_seq','m_prob_draw'],engine:['brackets','quadratics','graphs']},
  khanPath:['grp_polynomials','grp_functions','g9m_q1','g9m_q3','grp_trig','precalc_series','grc_limits','calc_limits','calc_derivatives'],
  rescue:['limits','derivatives','discrete','logs']},
 {id:'engineering',title:'Engineering',examples:'BS Civil, Electrical, Mechanical, Chemical and Industrial Engineering',
  firstYear:['Calculus I and II','Physics for engineers (mechanics)','General chemistry','Engineering drawing'],
  assumes:[
   {text:'Algebra is automatic: factoring, rational expressions, solving for a variable.',concepts:['exponents_polynomials','linear_equations'],engine:'brackets'},
   {text:'Trigonometry: SOH CAH TOA, special angles and identities.',concepts:['trigonometry']},
   {text:'Functions and graphs, including quadratics.',concepts:['lines_functions','quadratics'],engine:'quadratics'},
   {text:'Motion and forces with units and vectors.',concepts:['motion_forces','matter_measurement'],engine:'forces'},
   {text:'Energy, work and power.',concepts:['energy_heat']},
   {text:'Chemical formulas, moles and balancing.',concepts:['moles_formulas'],engine:'balancing'},
   {text:'Unit conversion without hesitation.',concepts:['matter_measurement'],engine:'motion'}],
  placement:{families:['m_linear_solve','m_quad_root','m_trig_ratio','m_func_eval','s_acceleration','s_newton2','s_kinetic','s_moles'],engine:['quadratics','forces','motion','moles']},
  khanPath:['grp_polynomials','g9m_q3','grp_trig','precalc_trig','precalc_analytic','grc_limits','calc_limits','calc_derivatives','calc_integrals','phys1_q1','phys1_q2','chem1_q1'],
  rescue:['limits','derivatives','integrals','vectors','kinematics','newton','stoichiometry']},
 {id:'health',title:'Health sciences',examples:'BS Nursing, Pharmacy, Medical Technology, Physical Therapy, Public Health',
  firstYear:['General chemistry','General biology','College algebra or statistics','Physics for health sciences'],
  assumes:[
   {text:'Cells, organelles, transport and energy.',concepts:['cells_life']},
   {text:'Genetics and simple crosses.',concepts:['genetics']},
   {text:'Moles, concentration and dilution for doses and solutions.',concepts:['moles_formulas','solutions_acids'],engine:'moles'},
   {text:'Ratios and proportions for dosage calculations.',concepts:['ratio_rate'],engine:'ratios'},
   {text:'Percent and fractions without a calculator.',concepts:['percent_fractions'],engine:'fractions'},
   {text:'Reading data and basic statistics.',concepts:['statistics_probability']}],
  placement:{families:['m_ratio_share','m_pct_change','m_frac_add','s_molarity','s_moles','s_ph','s_punnett','m_mean_missing'],engine:['ratios','fractions','moles']},
  khanPath:['g7m_q1','bio1_q1','bio1_q2','bio2_q3','bio2_q4','chem1_q1','chem2_q1','chem2_q2','statprob'],
  rescue:['stoichiometry','solutions','logs','genetics_prob','statistics']},
 {id:'natural_sciences',title:'Natural sciences',examples:'BS Biology, Chemistry, Physics, Mathematics, Molecular Biology',
  firstYear:['Calculus I','General chemistry with laboratory','General biology or physics','Scientific writing'],
  assumes:[
   {text:'Algebra and functions, including quadratics.',concepts:['exponents_polynomials','quadratics','lines_functions'],engine:'quadratics'},
   {text:'Units, measurement and significant figures.',concepts:['matter_measurement'],engine:'motion'},
   {text:'Chemistry basics: formulas, moles, solutions.',concepts:['moles_formulas','solutions_acids'],engine:'moles'},
   {text:'Cells and genetics.',concepts:['cells_life','genetics']},
   {text:'Motion, forces and energy.',concepts:['motion_forces','energy_heat'],engine:'forces'},
   {text:'Reading scientific texts for claims and evidence.',concepts:['main_idea','author_purpose']}],
  placement:{families:['m_quad_root','m_func_eval','m_slope','s_moles','s_molarity','s_newton2','s_half_life','s_punnett'],engine:['quadratics','graphs','moles','forces']},
  khanPath:['grp_polynomials','grp_functions','g9m_q3','precalc_trig','calc_limits','calc_derivatives','chem1_q1','chem1_q2','bio1_q1','bio2_q3','phys1_q1'],
  rescue:['limits','derivatives','stoichiometry','solutions','kinematics','genetics_prob']},
 {id:'business',title:'Business and economics',examples:'BS Accountancy, Business Administration, Economics, Management',
  firstYear:['Mathematics in the modern world','Business mathematics or college algebra','Principles of economics','Statistics'],
  assumes:[
   {text:'Percent, markup, discount and interest.',concepts:['percent_fractions','word_problems'],engine:'fractions'},
   {text:'Ratios and rates.',concepts:['ratio_rate'],engine:'ratios'},
   {text:'Lines and slope for supply and demand graphs.',concepts:['lines_functions','linear_equations'],engine:'graphs'},
   {text:'Mean, median and reading charts.',concepts:['statistics_probability']},
   {text:'Reading arguments and spotting claims.',concepts:['author_purpose','inference']}],
  placement:{families:['m_pct_change','m_simple_interest','m_ratio_share','m_slope','m_system','m_mean_missing','m_linear_solve','m_frac_add'],engine:['fractions','ratios','graphs']},
  khanPath:['g7m_q1','g8m_q2','g8m_q3','g9m_q1','genmath_business','g10m_q4','statprob'],
  rescue:['business_math','graphs_econ','statistics']},
 {id:'social_sciences',title:'Social sciences',examples:'BA Psychology, Political Science, Sociology, Communication',
  firstYear:['Purposive communication','Mathematics in the modern world','Introduction to the discipline','Statistics for the social sciences'],
  assumes:[
   {text:'Reading long academic texts and summarising them.',concepts:['main_idea','details']},
   {text:'Making careful inferences from evidence.',concepts:['inference']},
   {text:'Clear sentences and correct grammar in essays.',concepts:['sentence_structure','grammar_agreement','usage']},
   {text:'Percent, charts and basic statistics.',concepts:['percent_fractions','statistics_probability'],engine:'fractions'}],
  placement:{families:['m_pct_change','m_mean_missing','m_prob_draw','m_ratio_share'],engine:['fractions','ratios']},
  khanPath:['eng9_q2','eng9_q3','eng10_q2','g7m_q3','g8m_q4','statprob'],
  rescue:['academic_reading','statistics']},
 {id:'arts',title:'Arts and humanities',examples:'BA Philippine Studies, Literature, Art Studies, History, Fine Arts',
  firstYear:['Purposive communication','Readings in Philippine history','Art appreciation','Mathematics in the modern world'],
  assumes:[
   {text:'Reading literature closely: tone, purpose, figurative language.',concepts:['inference','author_purpose']},
   {text:'Writing clear, correct sentences in English and Filipino.',concepts:['sentence_structure','usage','filipino_gramatika']},
   {text:'Building an argument from sources.',concepts:['main_idea','author_purpose']},
   {text:'Everyday numbers: percent and ratios.',concepts:['percent_fractions','ratio_rate'],engine:'fractions'}],
  placement:{families:['m_pct_change','m_ratio_share','m_frac_add'],engine:['fractions','ratios']},
  khanPath:['eng7_q1','eng10_q1','eng9_q2','eng9_q3','g7m_q1'],
  rescue:['academic_reading']}
];
export const PROGRAM_BY_ID:Record<string,BridgeProgram>=Object.fromEntries(PROGRAMS.map(p=>[p.id,p]));
export const RESCUE_BY_ID:Record<string,Rescue>=Object.fromEntries(RESCUES.map(r=>[r.id,r]));

/** An eight-week summer bridge: the program's Khan path spread across weeks, with a
 *  placement check at the start and again at the end. */
export function summerPlan(p:BridgeProgram){
 const weeks:{week:number;focus:string;khan:KhanUnitId[];check:boolean}[]=[];
 const per=Math.ceil(p.khanPath.length/6);
 weeks.push({week:1,focus:'Placement check, then your first unit',khan:p.khanPath.slice(0,1),check:true});
 for(let w=0;w<6;w++){const slice=p.khanPath.slice(1+w*per,1+(w+1)*per);weeks.push({week:w+2,focus:slice.length?'Work through these units, then a topic check':'Review the topics you marked hardest',khan:slice,check:false});}
 weeks.push({week:8,focus:'Placement check again, then rescue topics you still find hard',khan:[],check:true});
 return weeks;
}
