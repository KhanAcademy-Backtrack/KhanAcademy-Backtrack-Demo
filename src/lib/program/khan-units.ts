/** Khan Academy Philippine-curriculum courses and units that were opened and
 *  title-checked in a browser on 2026-09-30. Units are listed with the topics their
 *  own unit page showed. Nothing here is guessed from a URL pattern; see
 *  docs/THIRD_PARTY_MATERIALS.md for the procedure and the check log. */
export const KHAN_ROOT='https://www.khanacademy.org';
export const KHAN_CHECKED='2026-09-30';
export type KhanUnit={id:string;course:string;unit:string;path:string;covers:string};

const u=(id:string,course:string,unit:string,path:string,covers:string):KhanUnit=>({id,course,unit,path,covers});
export const KHAN_UNITS={
 g7m_q1:u('g7m_q1','7th grade Math','1st quarter','/math/7th-grade-matatag/x065dcf1640354e81:1st-quarter','polygons, angles, percentages, rates, rational numbers'),
 g7m_q2:u('g7m_q2','7th grade Math','2nd quarter','/math/7th-grade-matatag/x065dcf1640354e81:2nd-quarter','square and cube roots, irrational numbers, converting measurements, volume of pyramids, sets'),
 g7m_q3:u('g7m_q3','7th grade Math','3rd quarter','/math/7th-grade-matatag/x065dcf1640354e81:3rd-quarter','data and statistical graphs, integers, order of operations, absolute value'),
 g7m_q4:u('g7m_q4','7th grade Math','4th quarter','/math/7th-grade-matatag/x065dcf1640354e81:4th-quarter','algebraic expressions, equations, experiments and outcomes, scientific notation'),
 g8m_q1:u('g8m_q1','8th grade Math','1st quarter','/math/8th-grade-matatag/x7549baa12375f3b9:unit-1','polynomials, special products, factoring, rational expressions, sequences'),
 g8m_q2:u('g8m_q2','8th grade Math','2nd quarter','/math/8th-grade-matatag/x7549baa12375f3b9:2nd-quarter','coordinate plane, volume of cones and spheres, Pythagorean theorem, triangle inequality, profit and loss'),
 g8m_q3:u('g8m_q3','8th grade Math','3rd quarter','/math/8th-grade-matatag/x7549baa12375f3b9:3rd-quarter','linear equations and inequalities, systems of linear equations'),
 g8m_q4:u('g8m_q4','8th grade Math','4th quarter','/math/8th-grade-matatag/x7549baa12375f3b9:4th-quarter','measures of variability, probability, counting principle'),
 g9m_q1:u('g9m_q1','9th grade Math','1st quarter','/math/9th-grade-matatag/x6b946bfca15ae3f5:unit-1','parallel and perpendicular lines, relations and functions, domain and range, slope, linear functions'),
 g9m_q2:u('g9m_q2','9th grade Math','2nd quarter','/math/9th-grade-matatag/x6b946bfca15ae3f5:2nd-quarter','quadrilaterals, triangle congruence'),
 g9m_q3:u('g9m_q3','9th grade Math','3rd quarter','/math/9th-grade-matatag/x6b946bfca15ae3f5:3rd-quarter','quadratic equations and functions, similarity, special triangles, variation'),
 g9m_q4:u('g9m_q4','9th grade Math','4th quarter','/math/9th-grade-matatag/x6b946bfca15ae3f5:4th-quarter','triangle inequality theorems, trigonometric ratios, data analysis, compound probability'),
 g10m_q1:u('g10m_q1','10th grade Math','1st quarter','/math/10th-grade-matatag/x62b99a9328c90b99:unit-1','law of sines, transformations, absolute value, quadratic inequalities'),
 g10m_q2:u('g10m_q2','10th grade Math','2nd quarter','/math/10th-grade-matatag/x62b99a9328c90b99:second-quarter','measures of position, box plots, radicals, nature of roots, quadratic functions'),
 g10m_q3:u('g10m_q3','10th grade Math','3rd quarter','/math/10th-grade-matatag/x62b99a9328c90b99:third-quarter','equations of a circle, statistical reports, compound events'),
 g10m_q4:u('g10m_q4','10th grade Math','4th quarter','/math/10th-grade-matatag/x62b99a9328c90b99:fourth-quarter','simple interest, circle angles, sectors and segments'),
 genmath_functions:u('genmath_functions','SHS General Math','Functions and their graphs','/math/senior-high-school-general-math/xc1934d16446a5789:unit-1','functions and their graphs'),
 genmath_business:u('genmath_business','SHS General Math','Basic business mathematics','/math/senior-high-school-general-math/xc1934d16446a5789:2nd-quarter','interest, business mathematics'),
 precalc_analytic:u('precalc_analytic','SHS Pre-Calculus','Analytic geometry','/math/senior-high-school-precalculus/x3589147324a289c1:1st-quarter','conic sections, analytic geometry'),
 precalc_series:u('precalc_series','SHS Pre-Calculus','Series','/math/senior-high-school-precalculus/x3589147324a289c1:2nd-quarter','sequences and series, induction'),
 precalc_trig:u('precalc_trig','SHS Pre-Calculus','Trigonometry','/math/senior-high-school-precalculus/x3589147324a289c1:trigonometry','angles, circular functions, identities'),
 calc_limits:u('calc_limits','SHS Basic Calculus','Limits and continuity','/math/senior-high-school-basic-calculus/x7f730b2f064f7e01:unit-1','limits and continuity'),
 calc_derivatives:u('calc_derivatives','SHS Basic Calculus','Derivatives','/math/senior-high-school-basic-calculus/x7f730b2f064f7e01:derivatives','derivatives'),
 calc_integrals:u('calc_integrals','SHS Basic Calculus','Integrals','/math/senior-high-school-basic-calculus/x7f730b2f064f7e01:integrals','integrals'),
 statprob:u('statprob','SHS Statistics and Probability','Course','/math/senior-high-school-statistics-probability','random variables, normal distributions, sampling, estimation, hypothesis tests'),
 grp_polynomials:u('grp_polynomials','Get ready for Precalculus','Get ready for polynomials','/math/get-ready-for-precalculus/x65c069afc012e9d0:get-ready-for-polynomials','polynomial arithmetic and factoring'),
 grp_functions:u('grp_functions','Get ready for Precalculus','Get ready for composite and inverse functions','/math/get-ready-for-precalculus/x65c069afc012e9d0:get-ready-for-composite-and-inverse-functions','functions'),
 grp_trig:u('grp_trig','Get ready for Precalculus','Get ready for trigonometry','/math/get-ready-for-precalculus/x65c069afc012e9d0:get-ready-for-trigonometry','right-triangle trigonometry'),
 grp_vectors:u('grp_vectors','Get ready for Precalculus','Get ready for vectors and matrices','/math/get-ready-for-precalculus/x65c069afc012e9d0:get-ready-for-vectors-and-matrices','vectors and matrices'),
 grc_limits:u('grc_limits','Get ready for AP Calculus','Get ready for limits and continuity','/math/get-ready-for-ap-calc/xa350bf684c056c5c:get-ready-for-limits-and-continuity','functions, graphs and algebra behind limits'),
 grc_diff1:u('grc_diff1','Get ready for AP Calculus','Get ready for differentiation','/math/get-ready-for-ap-calc/xa350bf684c056c5c:get-ready-for-differentiation-1','slope, rates of change and algebra behind derivatives'),
 phys1_q1:u('phys1_q1','SHS General Physics 1','1st quarter','/science/shs-general-physics-1/x83bcf7a5ed7a2fbc:1st-quarter','measurement, vectors, motion, free fall, projectiles, Newton’s laws, work, energy, momentum'),
 phys1_q2:u('phys1_q2','SHS General Physics 1','2nd quarter','/science/shs-general-physics-1/x83bcf7a5ed7a2fbc:2nd-quarter','rotation, gravitation, oscillations, waves, fluids, temperature, gas laws, thermodynamics'),
 phys2_q3:u('phys2_q3','SHS General Physics 2','3rd quarter','/science/shs-general-physics-2/xe75071a1e6b5ff51:3rd-quarter','charge, electric fields, potential, capacitance, current, Ohm’s law, circuits, magnetism'),
 phys2_q4:u('phys2_q4','SHS General Physics 2','4th quarter','/science/shs-general-physics-2/xe75071a1e6b5ff51:4th-quarter','induction, electromagnetic waves, optics, photoelectric effect, radioactive decay'),
 chem1_q1:u('chem1_q1','SHS General Chemistry 1','1st quarter','/science/shs-general-chemistry-1/xb62ce2194065a8dc:unit-1-name','separation, isotopes, naming compounds, formulas, balancing equations, stoichiometry, gas laws'),
 chem1_q2:u('chem1_q2','SHS General Chemistry 1','2nd quarter','/science/shs-general-chemistry-1/xb62ce2194065a8dc:2nd-quarter','atomic structure, Lewis structures, molecular shape and polarity, organic compounds, biomolecules'),
 chem2_q1:u('chem2_q1','SHS General Chemistry 2','1st quarter','/science/shs-general-chemistry-2/x8e72aa8e889b96da:unit-1-name','phase diagrams, solutions and colligative properties, thermochemistry, kinetics'),
 chem2_q2:u('chem2_q2','SHS General Chemistry 2','2nd quarter','/science/shs-general-chemistry-2/x8e72aa8e889b96da:2nd-quarter','thermodynamics, equilibrium, acids, bases and pH, electrochemistry'),
 bio1_q1:u('bio1_q1','SHS Biology 1','1st quarter','/science/shs-biology-1/xca2b82fdfba136b8:unit-1-name','cells, the cell cycle, cell transport, enzymes'),
 bio1_q2:u('bio1_q2','SHS Biology 1','2nd quarter','/science/shs-biology-1/xca2b82fdfba136b8:2nd-quarter','ATP, photosynthesis, respiration'),
 bio2_q3:u('bio2_q3','SHS Biology 2','3rd quarter','/science/shs-biology-2/x2ea931c66bba6acd:3rd-quarter','genetics, the central dogma, evolution, classification'),
 bio2_q4:u('bio2_q4','SHS Biology 2','4th quarter','/science/shs-biology-2/x2ea931c66bba6acd:unit-1-name','plant and animal organ systems'),
 earth_q1:u('earth_q1','SHS Earth Science','1st quarter','/science/shs-earth-science/xecff05e2330f305a:unit-1-name','the universe and solar system, Earth systems, minerals and rocks, resources'),
 earth_q2:u('earth_q2','SHS Earth Science','2nd quarter','/science/shs-earth-science/xecff05e2330f305a:2nd-quarter','weathering and erosion, plate tectonics, Earth’s history, Earth’s interior'),
 eng7_q1:u('eng7_q1','7th grade English','Poetry, prose, and drama','/ela/7th-grade-english-matatag/xffd572ebe98884db:1st-quarter','reading literature'),
 eng7_q2:u('eng7_q2','7th grade English','Expository text','/ela/7th-grade-english-matatag/xffd572ebe98884db:2nd-quarter','reading expository text'),
 eng8_q2:u('eng8_q2','8th grade English','Persuasive text','/ela/8th-grade-english-matatag/x9d270d9b47c20571:2nd-quarter','claims, persuasion'),
 eng8_q3:u('eng8_q3','8th grade English','Science & technology articles','/ela/8th-grade-english-matatag/x9d270d9b47c20571:3rd-quarter','reading science articles'),
 eng9_q2:u('eng9_q2','9th grade English','Argumentative text','/ela/9th-grade-english-matatag/x42eb55e74028e61e:2nd-quarter','arguments and evidence'),
 eng9_q3:u('eng9_q3','9th grade English','Informational texts','/ela/9th-grade-english-matatag/x42eb55e74028e61e:3rd-quarter','main idea, text structure'),
 eng10_q1:u('eng10_q1','10th grade English','Poetry, prose, and drama','/ela/10th-grade-english-matatag/x4184394906211756:1st-quarter','reading literature'),
 eng10_q2:u('eng10_q2','10th grade English','Informational text','/ela/10th-grade-english-matatag/x4184394906211756:2nd-quarter','informational reading')
} as const satisfies Record<string,KhanUnit>;
export type KhanUnitId=keyof typeof KHAN_UNITS;
export const khanUrl=(id:KhanUnitId)=>KHAN_ROOT+KHAN_UNITS[id].path;
export const khanLabel=(id:KhanUnitId)=>{const k=KHAN_UNITS[id];return k.unit==='Course'?k.course:`${k.course}: ${k.unit}`;};
