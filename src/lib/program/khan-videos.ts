import type {MockItem} from '../mock/types.ts';

/** Khan Academy videos matched to practice questions. Every page below was opened in a
 *  browser on its check date and its rendered title and youtube-nocookie embed id were
 *  read there; nothing is guessed from a URL pattern. The log, with each URL and id, is
 *  in docs/THIRD_PARTY_MATERIALS.md. Full videos only: a focused clip needs its captions
 *  watched before it enters VERIFIED_CLIPS in src/lib/video-clips.ts.
 *
 *  Lookup: a generated item uses its own family's video or none, never another family's.
 *  An authored item uses its own video, then its concept's. Keys listed in NO_VIDEO were
 *  searched for and have no Khan match; the interface says so plainly. Watching a video
 *  is activity only and never counts as an answer or as progress. */
export type KhanVideo={id:string;title:string;url:string;checked:string};

const KHAN='https://www.khanacademy.org';
const v=(id:string,title:string,path:string,checked='2026-10-05'):KhanVideo=>({id,title,url:KHAN+path,checked});

/** Every question video by a short name; the reviewer's topic videos reuse them where they match. */
export const VIDEOS={
 // Mathematics
 percentTax:v('jb_RwR_Eso4','Percent word problems: tax and discount','/math/7th-grade-matatag/x065dcf1640354e81:1st-quarter/x065dcf1640354e81:percentages/v/tax-discount-and-tip-examples'),
 fractionsAdd:v('zkJ1gOrYhEg','Adding fractions with unlike denominators introduction','/math/6th-grade-math-foundations/x7f9e1f592eb7eeaf:cd2-numbers-and-algebra/x7f9e1f592eb7eeaf:addition-and-subtraction-of-dissimilar-fractions/v/adding-fractions-with-unlike-denominators-introduction'),
 ratioPart:v('ZJ6y8OVJRw8','Part to whole ratio word problem using tables','/math/6th-grade-matatag/xb8e22b8c4894c878:2nd-quarter/xb8e22b8c4894c878:ratio-and-proportion/v/ratio-word-problem-exercise-example-1'),
 twoStep:v('_y_Q3_B2Vh8','Intro to two-step equations','/math/8th-grade-math-revised-k-to-10-3-terms/x39ed6d789992bb2a:2nd-quarter/x39ed6d789992bb2a:linear-equations-in-one-variable/v/why-we-do-the-same-thing-to-both-sides-two-step-equations'),
 elimination:v('xCIHAjsZCE0','Systems of equations with elimination: King’s cupcakes','/math/8th-grade-math-revised-k-to-10-3-terms/x39ed6d789992bb2a:3rd-quarter/x39ed6d789992bb2a:systems-of-linear-equations-in-two-variables/v/king-s-cupcakes-solving-systems-by-elimination'),
 exponentProducts:v('zM_p7tfWvLU','Exponent properties with products','/math/als-k-to-12-math/x54b4346ef80b5dcc:performance-standard-e/x54b4346ef80b5dcc:exponents/v/exponent-properties-involving-products'),
 squareBinomial:v('xjkbR7Gjgjs','Squaring binomials of the form (ax+b)²','/math/8th-grade-math-revised-k-to-10-3-terms/x39ed6d789992bb2a:unit-1/x39ed6d789992bb2a:special-products/v/square-a-binomial'),
 quadraticFactor:v('2ZzuZvz33X0','Solving quadratics by factoring','/math/9th-grade-math-revised-k-to-10-3-terms/x1e64c39423990571:2nd-quarter/x1e64c39423990571:solving-quadratic-equations/v/example-1-solving-a-quadratic-equation-by-factoring'),
 slope:v('WkspBxrzuZo','Worked example: slope from two points','/math/pisa-2025-math-supplement/x092b0b93d51c9e96:1/x092b0b93d51c9e96:equations/v/slope-of-a-line-2'),
 evaluateFunction:v('Id6UovYjd-M','Worked example: Evaluating functions from equation','/math/als-k-to-12-math/x54b4346ef80b5dcc:performance-standard-e/x54b4346ef80b5dcc:polynomial-functions/v/understanding-function-notation-example-1'),
 triangleArea:v('rRTXKQpblEc','Area of a triangle','/math/pisa-2025-math-supplement/x092b0b93d51c9e96:space-and-shape/x092b0b93d51c9e96:measurement-of-area/v/intuition-for-area-of-a-triangle'),
 pythagoras:v('AA6RfgP-AHU','Intro to the Pythagorean theorem','/math/pisa-2025-math-supplement/x092b0b93d51c9e96:space-and-shape/x092b0b93d51c9e96:measurement-of-distance-and-lengths-including-pythagorean-theorem/v/the-pythagorean-theorem'),
 circleArea:v('ZyOhRgnFmIY','Area of a circle','/math/pisa-2025-math-supplement/x092b0b93d51c9e96:space-and-shape/x092b0b93d51c9e96:measurement-of-area/v/area-of-a-circle'),
 polygonAngles:v('qG3HnRccrQU','Sum of interior angles of a polygon','/math/7th-grade-matatag/x065dcf1640354e81:1st-quarter/x065dcf1640354e81:regular-and-irregular-polygons/v/sum-of-interior-angles-of-a-polygon'),
 meanMissing:v('qpbaglogObM','Missing value given the mean','/math/pisa-2025-math-supplement/x092b0b93d51c9e96:uncertainty-and-data/x092b0b93d51c9e96:data-variability/v/using-mean-to-find-missing-value'),
 dependentProbability:v('VjLEoo3hIoM','Dependent probability introduction','/math/10th-grade-math-revised-k-to-10-3-terms/x06a77af3c81397cf:third-term/x06a77af3c81397cf:probability-of-compound-events/v/introduction-to-dependent-probability'),
 interest:v('GtaoP0skPWc','Introduction to interest','/math/strengthened-shs-general-math/x24dc5a0902f75de5:first-quarter/x24dc5a0902f75de5:financial-application-of-sequence-and-series/v/introduction-to-interest'),
 averageSpeed:v('oRKxmXwLvUU','Calculating average velocity or speed','/science/strengthened-shs-physics-1/x5eb5cea12d2cf683:introduction-to-physics/x5eb5cea12d2cf683:descriptors-of-motion/v/calculating-average-velocity-or-speed'),
 arithmeticSequence:v('ViLt2WI0XSg','Explicit formulas for arithmetic sequences','/math/als-k-to-12-math/x54b4346ef80b5dcc:performance-standard-e/x54b4346ef80b5dcc:arithmetic-sequence/v/explicit-formulas-for-arithmetic-sequences'),
 trigRatios:v('Jsiy4TxgIME','Intro to the trigonometric ratios','/math/9th-grade-math-revised-k-to-10-3-terms/x1e64c39423990571:3rd-quarter/x1e64c39423990571:trigonometric-ratios/v/basic-trigonometry'),
 // Physics and chemistry
 density:v('rW_33U7-8u8','Density equation','/science/strengthened-shs-chemistry-1/x174677b2bfa4bea2:1st-quarter/x174677b2bfa4bea2:investigating-density/v/density-equation'),
 speed:v('W6Ar0ls6tVA','Speed and velocity','/science/strengthened-shs-physics-1/x5eb5cea12d2cf683:introduction-to-physics/x5eb5cea12d2cf683:descriptors-of-motion/v/speed-and-velocity'),
 acceleration:v('JSPwCtIPfQw','Acceleration','/science/shs-physical-science/x0492729e402f0c6b:4th-quarter/x0492729e402f0c6b:universal-laws-of-physics/v/intro_to_acceleration'),
 newtonSecond:v('O5G4uHe-qc4','Newton’s second law calculations','/science/als-k-to-12-science/x46c2fc9f8e023990:4th-quarter/x46c2fc9f8e023990:understanding-the-interrelationship-between-force-motion-and-energy/v/newtons_second_law_calculations'),
 massWeight:v('INZNifEXOcQ','Mass & weight','/science/strengthened-shs-physics-1/x5eb5cea12d2cf683:introduction-to-physics/x5eb5cea12d2cf683:kinematics-free-fall-motion/v/mass-weight-gravity-physics-khan-academy'),
 ohm:v('F_vLWkkOETI','Ohm’s law','/science/9th-grade-science-matatag/xc6c9cbcd628f26fe:1st-quarter/xc6c9cbcd628f26fe:ohm-s-law/v/circuits-part-1'),
 waves:v('ClHuscLyuLo','Wave properties','/science/6th-grade-science-matatag/x1c42f0f13f909d5b:3rd-quarter/x1c42f0f13f909d5b:waves/v/wave-properties-wave-properties-high-school-physics-khan-academy'),
 moles:v('PAqzpZ-nMlg','Worked example: Calculating molar mass and number of moles','/science/9th-grade-melcs/x48ae216379e0830b:2nd-quarter/x48ae216379e0830b:mole-concept/v/worked-example-calculating-molar-mass-and-number-of-moles'),
 formulas:v('36nlbUdRvUM','Compounds and chemical formulas','/science/strengthened-shs-chemistry-1/x174677b2bfa4bea2:measurements-in-chemistry/x174677b2bfa4bea2:molecular-and-empirical-formulas/v/compounds-and-chemical-formulas'),
 massPercent:v('enTtIDEtda8','Worked example: Calculating mass percent','/science/strengthened-shs-chemistry-1/x174677b2bfa4bea2:measurements-in-chemistry/x174677b2bfa4bea2:percentage-composition/v/worked-example-calculating-mass-percent'),
 molarity:v('L-Uhyjt8t10','Molarity','/science/shs-general-chemistry-2/x8e72aa8e889b96da:unit-1-name/x8e72aa8e889b96da:solution-chemistry-and-colligative-properties/v/molarity'),
 ph:v('J7-GewgqWUQ','Definition of pH','/science/shs-general-chemistry-2/x8e72aa8e889b96da:2nd-quarter/x8e72aa8e889b96da:acids-bases-and-ph-calculations/v/introduction-to-definition-of-ph'),
 halfLife:v('9REPnibO4IQ','Half-life and carbon dating','/science/shs-earth-and-life-science/x901efce4a07b98a5:unit-1/x901efce4a07b98a5:history-of-the-earth/v/half-life'),
 kinetic:v('eVW8X_TsBzE','Kinetic energy','/science/als-k-to-12-science/x46c2fc9f8e023990:4th-quarter/x46c2fc9f8e023990:understanding-the-interrelationship-between-force-motion-and-energy/v/kinetic_energy'),
 potential:v('aUrms3VFn0I','Potential energy','/science/als-k-to-12-science/x46c2fc9f8e023990:4th-quarter/x46c2fc9f8e023990:understanding-the-interrelationship-between-force-motion-and-energy/v/potential_energy'),
 work:v('ewfMcg3wRaQ','Intro to work','/science/strengthened-shs-physics-1/x5eb5cea12d2cf683:kinematics/x5eb5cea12d2cf683:work-and-power/v/intro-to-work-work-energy-physics-khan-academy'),
 power:v('RpbxIG5HTf4','Power','/science/strengthened-shs-physics-1/x5eb5cea12d2cf683:kinematics/x5eb5cea12d2cf683:work-and-power/v/power'),
 specificHeat:v('9_gvwicIbHg','Specific heat capacity','/science/strengthened-shs-physics-2/x4423f488fef32c93:heat-and-thermonadynamics/x4423f488fef32c93:heat-calculations-temperature-change-phase-change-and-latent-heat/v/specific-heat-capacity'),
 boyle:v('PIM4G3IZk5Y','Boyle’s law','/science/10th-grade-melcs/x1cfbe2e54160ac98:4th-quarter/x1cfbe2e54160ac98:gas-laws/v/boyles-law'),
 // Biology
 punnett:v('VH1lAfZL_fU','Worked examples: Punnett squares','/science/8th-grade-science-revised-k-to-10-3-terms/x7174210a6d38b11d:1st-quarter/x7174210a6d38b11d:heredity-and-variation/v/worked-examples-punnett-squares'),
 geneticsVocabulary:v('kvwK63Mwhw0','Genetics vocabulary','/science/8th-grade-science-revised-k-to-10-3-terms/x7174210a6d38b11d:1st-quarter/x7174210a6d38b11d:heredity-and-variation/v/genetics-vocabulary'),
 genesProteins:v('tfZfLDRu39c','Genes, proteins, and traits','/science/als-k-to-12-science/x46c2fc9f8e023990:2nd-quarter/x46c2fc9f8e023990:observable-traits-passed-from-parents-to-offspring/v/genes-proteins-and-traits'),
 respiration:v('NUFbQUOLAXc','Cellular respiration','/science/strengthened-shs-biology-1/x12d91beacfa56326:cell-metabolism/x12d91beacfa56326:metabolism-respiration/v/cellular-respiration'),
 plantAnimalCells:v('HjC-eMiMDfo','Comparing animal and plant cells','/science/7th-grade-science-revised-k-to-10-3-terms/x7a95920ff531ae11:1st-quarter/x7a95920ff531ae11:plant-and-animal-organelles/v/comparing-animal-and-plant-cells'),
 osmosis:v('rCNlG_j_gSM','Osmosis','/science/strengthened-shs-biology-1/x12d91beacfa56326:cell-biology/x12d91beacfa56326:cell-transport-mechanisms/v/osmosis'),
 mitosis:v('TKGcfbyFXsw','Mitosis','/science/strengthened-shs-biology-1/x12d91beacfa56326:cell-biology/x12d91beacfa56326:the-cell-cycle/v/mitosis'),
 enzymes:v('A90HKrgUOg0','Enzymes','/science/shs-biology-1/xca2b82fdfba136b8:unit-1-name/xca2b82fdfba136b8:enzymes/v/enzymes'),
 photosynthesis:v('-rsYk4eCKnA','Photosynthesis','/science/8th-grade-science-revised-k-to-10-3-terms/x7174210a6d38b11d:1st-quarter/x7174210a6d38b11d:photosynthesis-and-cellular-respiration/v/photosynthesis'),
 respirationOverview:v('9zoS5WGsmpc','Overview of cellular respiration','/science/8th-grade-science-revised-k-to-10-3-terms/x7174210a6d38b11d:1st-quarter/x7174210a6d38b11d:photosynthesis-and-cellular-respiration/v/overview-of-cellular-respiration'),
 atp:v('PK6HmIe2EAg','ATP: Adenosine triphosphate','/science/shs-biology-1/xca2b82fdfba136b8:2nd-quarter/xca2b82fdfba136b8:atp-adp-cycle/v/adenosine-triphosphate'),
 // Earth and space
 convergentBoundaries:v('Y0eWnOZpSpQ','Plate tectonics: Geological features of convergent plate boundaries','/science/strengthened-shs-earth-and-space-science-1/x006d5d274c051fd7:origin-and-structure-of-the-earth/x006d5d274c051fd7:a-brief-history-of-the-earth/v/plate-tectonics-geological-features-of-convergent-plate-boundaries'),
 rockCycle:v('rmH4W92eHVM','The rock cycle','/science/shs-earth-and-life-science/x901efce4a07b98a5:unit-1/x901efce4a07b98a5:minerals-and-rocks/v/the-rock-cycle'),
 seasons:v('05qDIjKevJo','How Earth’s tilt causes seasons','/science/als-k-to-12-science/x46c2fc9f8e023990:4th-quarter/x46c2fc9f8e023990:demonstrating-earth-s-rotation-and-revolution-using-a-globe-to-explain-day-night-and-the-sequence-of-seasons/v/how-earth-s-tilt-causes-seasons'),
 cyclones:v('kRp-VcCaUS0','Tropical cyclones','/science/strengthened-shs-general-science-3-terms/x381269a1083161e8:4th-quarter-earth-and-space-science/x381269a1083161e8:natural-hazards-disasters-prevention-and-mitigation-preparedness-and-adaptation/v/tropical-cyclones'),
 earthLayers:v('hHteUIS0OFY','Compositional and mechanical layers of the earth','/science/strengthened-shs-earth-and-space-science-1/x006d5d274c051fd7:origin-and-structure-of-the-earth/x006d5d274c051fd7:inside-the-earth/v/compositional-and-mechanical-layers-of-the-earth'),
 solarSystem:v('wTyqO-tfs7Q','The solar system','/science/strengthened-shs-earth-and-space-science-1/x006d5d274c051fd7:origin-and-structure-of-the-earth/x006d5d274c051fd7:what-the-universe-is-made-of/v/the-solar-system-ms'),
 weathering:v('xWWOHttrkWI','Weathering and erosion','/science/strengthened-shs-earth-and-space-science-2/x21bb710e6de17395:plate-tectonics-and-earth-s-processes/x21bb710e6de17395:weathering-erosion-and-sedimentation/v/weathering-and-erosion'),
 tsunami:v('MYdA8sXP8d0','Tsunami','/science/als-k-to-12-science/x46c2fc9f8e023990:3rd-quarter/x46c2fc9f8e023990:using-models-to-explain-how-fault-movements-generate-earthquakes/v/tsunami'),
 // Language and reading
 agreement:v('06A5X87nA_M','Subject-verb agreement | Worked example','/test-prep/get-ready-for-sat-prep-reading-and-writing/x07a01ed1f1ffc4bd:digital-sat-grammar-practice/x07a01ed1f1ffc4bd:fss-sva/v/subject-verb-agreement-worked-example'),
 verbForms:v('Yzuf-m2M98E','Verb forms | Worked example','/test-prep/get-ready-for-sat-prep-reading-and-writing/x07a01ed1f1ffc4bd:digital-sat-grammar-practice/x07a01ed1f1ffc4bd:fss-verb-forms/v/verb-form-worked-example'),
 linkingClauses:v('l98aa1ShJWs','Linking clauses | Worked example','/test-prep/get-ready-for-sat-prep-reading-and-writing/x07a01ed1f1ffc4bd:digital-sat-grammar-practice/x07a01ed1f1ffc4bd:boundaries-linking-clauses/v/linking-clauses-video'),
 subjectObjectPronouns:v('q5HmV3Czl6g','Subject and object pronouns','/ela/flemms-supplement/x3c3bbc36e759a314:reading-comprehending-texts/x3c3bbc36e759a314:pronouns/v/subject-and-object-pronouns-the-parts-of-speech-grammar'),
 possessivePronouns:v('bhzh8VDykc4','Possessive pronouns','/ela/flemms-supplement/x3c3bbc36e759a314:reading-comprehending-texts/x3c3bbc36e759a314:pronouns/v/possessive-pronouns-the-parts-of-speech-grammar'),
 wordsInContext:v('uKid6-WPRe8','Words in context | Worked example','/test-prep/get-ready-for-sat-prep-reading-and-writing/x07a01ed1f1ffc4bd:get-ready-craft-and-structure/x07a01ed1f1ffc4bd:words-in-context/v/words-in-context-worked-example'),
 centralIdeas:v('5G2LYyXSAn8','Central ideas and details | Worked example','/test-prep/get-ready-for-sat-prep-reading-and-writing/x07a01ed1f1ffc4bd:get-ready-information-and-ideas/x07a01ed1f1ffc4bd:central-ideas-and-details/v/central-ideas-and-details-worked-example'),
 inferences:v('mDJuTM4mqhs','Inferences | Worked example','/test-prep/get-ready-for-sat-prep-reading-and-writing/x07a01ed1f1ffc4bd:get-ready-information-and-ideas/x07a01ed1f1ffc4bd:inferences/v/inferences-worked-example'),
 textStructure:v('lbZjD48fWd8','Text structure and purpose | Worked example','/test-prep/get-ready-for-sat-prep-reading-and-writing/x07a01ed1f1ffc4bd:get-ready-craft-and-structure/x07a01ed1f1ffc4bd:text-structure-and-purpose/v/text-structure-and-purpose-video'),
 affectEffect:v('5pfZ3dyG1cg','Affect and effect','/humanities/grammar/usage-and-style/frequently-confused-words/v/affect-and-effect-final','2026-10-07'),
 lessFewer:v('ZkFihBrRMCM','Less versus fewer','/humanities/grammar/usage-and-style/frequently-confused-words/v/less-v-fewer','2026-10-07')
};
const V=VIDEOS;

/** By MockItem.familyId. A family missing here must be listed in NO_VIDEO. */
export const FAMILY_VIDEOS:Record<string,KhanVideo>={
 m_pct_change:V.percentTax,m_frac_add:V.fractionsAdd,m_ratio_share:V.ratioPart,m_linear_solve:V.twoStep,
 m_exponents:V.exponentProducts,m_expand_square:V.squareBinomial,m_quad_root:V.quadraticFactor,m_slope:V.slope,
 m_triangle_area:V.triangleArea,m_pythagoras:V.pythagoras,m_circle_area:V.circleArea,m_mean_missing:V.meanMissing,
 m_prob_draw:V.dependentProbability,m_simple_interest:V.interest,m_avg_speed:V.averageSpeed,m_func_eval:V.evaluateFunction,
 m_system:V.elimination,m_polygon_angles:V.polygonAngles,m_arith_seq:V.arithmeticSequence,m_trig_ratio:V.trigRatios,
 s_density:V.density,s_speed:V.speed,s_acceleration:V.acceleration,s_newton2:V.newtonSecond,s_weight:V.massWeight,
 s_ohm:V.ohm,s_moles:V.moles,s_molarity:V.molarity,s_atom_count:V.formulas,s_half_life:V.halfLife,s_punnett:V.punnett,
 s_ph:V.ph,s_kinetic:V.kinetic,s_potential:V.potential,s_work:V.work,s_power:V.power,s_wave:V.waves,s_boyle:V.boyle,
 s_heat:V.specificHeat,s_percent_comp:V.massPercent
};

/** By authored item id, for questions narrower than their concept's video. */
export const ITEM_VIDEOS:Record<string,KhanVideo>={
 sci_cell_01:V.respiration,sci_cell_02:V.plantAnimalCells,sci_cell_03:V.osmosis,sci_cell_04:V.mitosis,
 sci_cell_05:V.enzymes,sci_cell_06:V.photosynthesis,sci_cell_07:V.respirationOverview,sci_cell_08:V.atp,
 sci_gen_01:V.geneticsVocabulary,sci_gen_02:V.genesProteins,
 sci_earth_01:V.convergentBoundaries,sci_earth_02:V.rockCycle,sci_earth_03:V.seasons,sci_earth_04:V.cyclones,
 sci_earth_05:V.earthLayers,sci_earth_06:V.solarSystem,sci_earth_07:V.weathering,sci_earth_08:V.tsunami,
 lang_usage_01:V.affectEffect,lang_usage_02:V.possessivePronouns,lang_usage_03:V.subjectObjectPronouns,lang_usage_04:V.lessFewer,lang_usage_05:V.possessivePronouns
};

/** By concept id, for authored items without their own video. A concept missing here
 *  must be listed in NO_VIDEO. */
export const CONCEPT_VIDEOS:Record<string,KhanVideo>={
 percent_fractions:V.fractionsAdd,ratio_rate:V.ratioPart,exponents_polynomials:V.exponentProducts,linear_equations:V.twoStep,
 quadratics:V.quadraticFactor,lines_functions:V.slope,geometry:V.pythagoras,trigonometry:V.trigRatios,sequences:V.arithmeticSequence,
 statistics_probability:V.meanMissing,word_problems:V.averageSpeed,
 matter_measurement:V.density,motion_forces:V.newtonSecond,energy_heat:V.kinetic,electricity_waves:V.ohm,gases:V.boyle,
 moles_formulas:V.moles,solutions_acids:V.molarity,nuclear:V.halfLife,genetics:V.punnett,cells_life:V.plantAnimalCells,
 earth_space:V.convergentBoundaries,
 grammar_agreement:V.agreement,grammar_verbs:V.verbForms,vocabulary_context:V.wordsInContext,sentence_structure:V.linkingClauses,
 main_idea:V.centralIdeas,details:V.centralIdeas,inference:V.inferences,vocabulary_in_context:V.wordsInContext,author_purpose:V.textStructure
};

/** Searched on Khan Academy with no matching video: a work-rate family, the word-usage
 *  concept as a whole (good/well has none; affect/effect and fewer/less items have their own,
 *  found in Khan's Grammar course on 7 October 2026) and the two Filipino language concepts. */
export const NO_VIDEO:ReadonlySet<string>=new Set(['m_work_rate','usage','filipino_gramatika','filipino_talasalitaan']);

const own=(map:Record<string,KhanVideo>,key:string|undefined)=>key!==undefined&&Object.hasOwn(map,key)?map[key]:undefined;

/** The Khan video for one question, or undefined when none is matched. A Filipino item
 *  (lang 'fil') never borrows its concept's English video (owner's choice, 7 October 2026). */
export function videoFor(item:Pick<MockItem,'id'|'familyId'|'concept'>&Partial<Pick<MockItem,'lang'>>):KhanVideo|undefined{
 if(item.lang==='fil')return undefined;
 if(item.familyId)return own(FAMILY_VIDEOS,item.familyId);
 return own(ITEM_VIDEOS,item.id)??own(CONCEPT_VIDEOS,item.concept);
}
