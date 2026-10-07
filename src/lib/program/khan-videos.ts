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
import {VIDEOS,type KhanVideo} from './khan-video-catalog.ts';
export {VIDEOS,type KhanVideo} from './khan-video-catalog.ts';
export {TOPIC_VIDEOS,TOPIC_NO_VIDEO,topicVideo} from './topic-videos.ts';

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
