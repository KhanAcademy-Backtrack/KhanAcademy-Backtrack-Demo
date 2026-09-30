# Third-party materials

Khan Academy logo: copied from the rendered public header SVG at https://www.khanacademy.org/ on 10 September 2026. Geometry and aspect ratio are unchanged; its inherited neutral fill is resolved to the observed #151521 for standalone SVG rendering. Used as attribution to the source of learning materials, not as BACKTRACK branding or a partnership lockup.

Official Khan videos remain streamed from their original YouTube privacy-enhanced players, loaded only after a learner presses Watch. No video bytes or full transcripts are redistributed. Each player links to the original Khan lesson. The learning stop includes BACKTRACK-authored concept summaries, worked examples, and guided practice connected to the matched Khan topic. Optional exercise and article links open the originals on Khan Academy. A full Khan page is not used as the learning interface: the repair, practice, and return remain inside BACKTRACK. BACKTRACK-authored practice and examples are labeled as its own fresh checks, not official Khan assessment results.

Usage guidance: https://support.khanacademy.org/hc/en-us/articles/202262954-Can-I-use-Khan-Academy-s-videos-name-materials-links-in-my-project

Video map: see src/lib/khan-materials.ts. Source URLs were inspected in Khan's public rendered page or official channel. Each video open is an activity event only, never a completed exercise or learning result.

Interface font: Plus Jakarta Sans, served through next/font from Google Fonts. Math: STIX Two Text. Existing font/package licensing applies. No generated raster artwork, paid image generation, or copied customer/pilot imagery is used.

## Chemistry and physics: no Khan match shipped yet (11 September 2026)

The chemistry and physics steps added on 11 September 2026 ship with **no** matched Khan Academy resource. The standing rule at the top of `src/lib/curriculum.ts` is that every URL is opened by hand in a browser and its page title checked before it ships. Khan Academy is a client-rendered application: an automated fetch returns an empty shell, so it is not verification, and a deep lesson URL must never be pattern-guessed.

On the machine used for this work the in-app browser was blocked from loading Khan's application bundle (`cdn.kastatic.org`, `net::ERR_BLOCKED_BY_CLIENT`) and no second browser was reachable, so no chemistry or physics URL could be verified by hand. Rather than ship a guess, `src/lib/khan-materials.ts` lists these ids explicitly as unmatched:

`atom_count`, `formula_mass`, `unit_convert`, `net_force`, `moles`, `balancing`, `motion`, `forces`

Listing them is deliberate: `khanMaterial` otherwise falls through to the algebra factoring resources, which would silently send a chemistry learner to quadratics. Where a step is unmatched the interface says so in plain words and shows Khanpanion's own explanation instead — a missing third-party match never withholds the original lesson.

Physics learners still reach verified Khan practice. `motion` and `forces` route down into the existing `substitute` and `multiply` skills, whose Khan exercises were verified on 10 September 2026 and are unchanged.

To add a Khan science match later: open the candidate lesson and exercise URLs in a browser, check each page title, add them to `khanMaterial`'s `extra` table keyed by the skill or topic id, remove that id from `UNMATCHED`, add a `KHAN_ENTRIES` spec if the activity should be selectable at `/khan`, and record the URL and check date in this file. A focused video clip additionally needs its captions watched before its id and range enter `VERIFIED_CLIPS`.

## Focused video segments

Four official lessons have caption-verified ranges: factoring D3a8NnpQ2vU at 2:22-3:56, multiplying binomials oOTFGdjhqqM at 1:01-2:51, like terms CLWpkv6ccpA at 1:09-2:16, and distribution Jp25LHI9wII at 0:51-2:19. Continue watching starts at the end of the segment without a stop limit. A learner can also replay the segment or start from the beginning. Other videos retain their full length until their timing is verified.

YouTube documents the start and end parameters here: https://developers.google.com/youtube/player_parameters . The end value is an absolute video timestamp, not a duration.

## Presentation assets

The current deck uses an original abstract street-map background, blue route graphics, and a green BACKTRACK return-route monogram. These are BACKTRACK-authored vectors. The mark draws a lowercase b as a route that turns back toward an earlier step. Its wordmark uses outlined DM Sans Bold. The map is illustrative and does not depict a real campus or Google Maps data. The QR code encodes the professional demo URL in docs/deployment.json.

The UP Manila logo is the institution's original horizontal artwork, unchanged in colour and aspect ratio. Source: https://www.upm.edu.ph/wp-content/themes/University%20of%20the%20Philippines%20Manila/images/home/logo-black.png . The team confirmed UP Manila endorsement and requested the logo on all slides. This does not imply a Khan Academy or Google partnership.

The earlier Paper001 texture by ambientCG / Lennart Demes, CC0, from https://commons.wikimedia.org/wiki/File:Paper001_4K_Color.png remains in underlying imported layers and earlier source assets. It is covered by the current map background.

The current Canva deck uses DM Sans. Its editable PowerPoint backup embeds DM Sans regular and bold using PowerPoint font parts. Editable font permissions are fsType 0. Original TTF files and the OFL license accompany the Drive package.

## Design references

Reviewed the Canva project timeline template at https://www.canva.com/templates/s/timeline/?continuation=750 and the creator’s Canva startup pitch reference at https://morebyus.com/products/animated-startup-pitch-deck-template-canva . The references informed node size, consistent spacing, restrained colour, and clear comparison layouts. No template assets or paid design files were copied into BACKTRACK.

DM Sans font source and license: https://github.com/google/fonts/tree/main/ofl/dmsans . The native Canva export is authoritative; earlier Plus Jakarta Sans exports were superseded.

The GPS route and comparison connectors in the current deck are BACKTRACK-authored SVG graphics. The SVG sources accompany the package; presentation text, cards, and stops remain separate editable Canva elements.


## College program resource catalog, checked 2026-09-30

The following unchanged Khan unit URLs were title-checked in the preceding September 30 bank release, as recorded in src/lib/program/khan-units.ts. This routing release introduces no new Khan URL and does not claim a second title check. Course and unit links are optional; opening a link, self-reporting Khan practice and answering independently in Khanpanion remain separate records. Original generated and authored practice is not copied or recalled UPCAT material.

- [7th grade Math: 1st quarter](https://www.khanacademy.org/math/7th-grade-matatag/x065dcf1640354e81:1st-quarter). Checked 2026-09-30. Coverage: polygons, angles, percentages, rates, rational numbers.
- [7th grade Math: 2nd quarter](https://www.khanacademy.org/math/7th-grade-matatag/x065dcf1640354e81:2nd-quarter). Checked 2026-09-30. Coverage: square and cube roots, irrational numbers, converting measurements, volume of pyramids, sets.
- [7th grade Math: 3rd quarter](https://www.khanacademy.org/math/7th-grade-matatag/x065dcf1640354e81:3rd-quarter). Checked 2026-09-30. Coverage: data and statistical graphs, integers, order of operations, absolute value.
- [7th grade Math: 4th quarter](https://www.khanacademy.org/math/7th-grade-matatag/x065dcf1640354e81:4th-quarter). Checked 2026-09-30. Coverage: algebraic expressions, equations, experiments and outcomes, scientific notation.
- [8th grade Math: 1st quarter](https://www.khanacademy.org/math/8th-grade-matatag/x7549baa12375f3b9:unit-1). Checked 2026-09-30. Coverage: polynomials, special products, factoring, rational expressions, sequences.
- [8th grade Math: 2nd quarter](https://www.khanacademy.org/math/8th-grade-matatag/x7549baa12375f3b9:2nd-quarter). Checked 2026-09-30. Coverage: coordinate plane, volume of cones and spheres, Pythagorean theorem, triangle inequality, profit and loss.
- [8th grade Math: 3rd quarter](https://www.khanacademy.org/math/8th-grade-matatag/x7549baa12375f3b9:3rd-quarter). Checked 2026-09-30. Coverage: linear equations and inequalities, systems of linear equations.
- [8th grade Math: 4th quarter](https://www.khanacademy.org/math/8th-grade-matatag/x7549baa12375f3b9:4th-quarter). Checked 2026-09-30. Coverage: measures of variability, probability, counting principle.
- [9th grade Math: 1st quarter](https://www.khanacademy.org/math/9th-grade-matatag/x6b946bfca15ae3f5:unit-1). Checked 2026-09-30. Coverage: parallel and perpendicular lines, relations and functions, domain and range, slope, linear functions.
- [9th grade Math: 2nd quarter](https://www.khanacademy.org/math/9th-grade-matatag/x6b946bfca15ae3f5:2nd-quarter). Checked 2026-09-30. Coverage: quadrilaterals, triangle congruence.
- [9th grade Math: 3rd quarter](https://www.khanacademy.org/math/9th-grade-matatag/x6b946bfca15ae3f5:3rd-quarter). Checked 2026-09-30. Coverage: quadratic equations and functions, similarity, special triangles, variation.
- [9th grade Math: 4th quarter](https://www.khanacademy.org/math/9th-grade-matatag/x6b946bfca15ae3f5:4th-quarter). Checked 2026-09-30. Coverage: triangle inequality theorems, trigonometric ratios, data analysis, compound probability.
- [10th grade Math: 1st quarter](https://www.khanacademy.org/math/10th-grade-matatag/x62b99a9328c90b99:unit-1). Checked 2026-09-30. Coverage: law of sines, transformations, absolute value, quadratic inequalities.
- [10th grade Math: 2nd quarter](https://www.khanacademy.org/math/10th-grade-matatag/x62b99a9328c90b99:second-quarter). Checked 2026-09-30. Coverage: measures of position, box plots, radicals, nature of roots, quadratic functions.
- [10th grade Math: 3rd quarter](https://www.khanacademy.org/math/10th-grade-matatag/x62b99a9328c90b99:third-quarter). Checked 2026-09-30. Coverage: equations of a circle, statistical reports, compound events.
- [10th grade Math: 4th quarter](https://www.khanacademy.org/math/10th-grade-matatag/x62b99a9328c90b99:fourth-quarter). Checked 2026-09-30. Coverage: simple interest, circle angles, sectors and segments.
- [SHS General Math: Functions and their graphs](https://www.khanacademy.org/math/senior-high-school-general-math/xc1934d16446a5789:unit-1). Checked 2026-09-30. Coverage: functions and their graphs.
- [SHS General Math: Basic business mathematics](https://www.khanacademy.org/math/senior-high-school-general-math/xc1934d16446a5789:2nd-quarter). Checked 2026-09-30. Coverage: interest, business mathematics.
- [SHS Pre-Calculus: Analytic geometry](https://www.khanacademy.org/math/senior-high-school-precalculus/x3589147324a289c1:1st-quarter). Checked 2026-09-30. Coverage: conic sections, analytic geometry.
- [SHS Pre-Calculus: Series](https://www.khanacademy.org/math/senior-high-school-precalculus/x3589147324a289c1:2nd-quarter). Checked 2026-09-30. Coverage: sequences and series, induction.
- [SHS Pre-Calculus: Trigonometry](https://www.khanacademy.org/math/senior-high-school-precalculus/x3589147324a289c1:trigonometry). Checked 2026-09-30. Coverage: angles, circular functions, identities.
- [SHS Basic Calculus: Limits and continuity](https://www.khanacademy.org/math/senior-high-school-basic-calculus/x7f730b2f064f7e01:unit-1). Checked 2026-09-30. Coverage: limits and continuity.
- [SHS Basic Calculus: Derivatives](https://www.khanacademy.org/math/senior-high-school-basic-calculus/x7f730b2f064f7e01:derivatives). Checked 2026-09-30. Coverage: derivatives.
- [SHS Basic Calculus: Integrals](https://www.khanacademy.org/math/senior-high-school-basic-calculus/x7f730b2f064f7e01:integrals). Checked 2026-09-30. Coverage: integrals.
- [SHS Statistics and Probability: Course](https://www.khanacademy.org/math/senior-high-school-statistics-probability). Checked 2026-09-30. Coverage: random variables, normal distributions, sampling, estimation, hypothesis tests.
- [Get ready for Precalculus: Get ready for polynomials](https://www.khanacademy.org/math/get-ready-for-precalculus/x65c069afc012e9d0:get-ready-for-polynomials). Checked 2026-09-30. Coverage: polynomial arithmetic and factoring.
- [Get ready for Precalculus: Get ready for composite and inverse functions](https://www.khanacademy.org/math/get-ready-for-precalculus/x65c069afc012e9d0:get-ready-for-composite-and-inverse-functions). Checked 2026-09-30. Coverage: functions.
- [Get ready for Precalculus: Get ready for trigonometry](https://www.khanacademy.org/math/get-ready-for-precalculus/x65c069afc012e9d0:get-ready-for-trigonometry). Checked 2026-09-30. Coverage: right-triangle trigonometry.
- [Get ready for Precalculus: Get ready for vectors and matrices](https://www.khanacademy.org/math/get-ready-for-precalculus/x65c069afc012e9d0:get-ready-for-vectors-and-matrices). Checked 2026-09-30. Coverage: vectors and matrices.
- [Get ready for AP Calculus: Get ready for limits and continuity](https://www.khanacademy.org/math/get-ready-for-ap-calc/xa350bf684c056c5c:get-ready-for-limits-and-continuity). Checked 2026-09-30. Coverage: functions, graphs and algebra behind limits.
- [Get ready for AP Calculus: Get ready for differentiation](https://www.khanacademy.org/math/get-ready-for-ap-calc/xa350bf684c056c5c:get-ready-for-differentiation-1). Checked 2026-09-30. Coverage: slope, rates of change and algebra behind derivatives.
- [SHS General Physics 1: 1st quarter](https://www.khanacademy.org/science/shs-general-physics-1/x83bcf7a5ed7a2fbc:1st-quarter). Checked 2026-09-30. Coverage: measurement, vectors, motion, free fall, projectiles, Newton’s laws, work, energy, momentum.
- [SHS General Physics 1: 2nd quarter](https://www.khanacademy.org/science/shs-general-physics-1/x83bcf7a5ed7a2fbc:2nd-quarter). Checked 2026-09-30. Coverage: rotation, gravitation, oscillations, waves, fluids, temperature, gas laws, thermodynamics.
- [SHS General Physics 2: 3rd quarter](https://www.khanacademy.org/science/shs-general-physics-2/xe75071a1e6b5ff51:3rd-quarter). Checked 2026-09-30. Coverage: charge, electric fields, potential, capacitance, current, Ohm’s law, circuits, magnetism.
- [SHS General Physics 2: 4th quarter](https://www.khanacademy.org/science/shs-general-physics-2/xe75071a1e6b5ff51:4th-quarter). Checked 2026-09-30. Coverage: induction, electromagnetic waves, optics, photoelectric effect, radioactive decay.
- [SHS General Chemistry 1: 1st quarter](https://www.khanacademy.org/science/shs-general-chemistry-1/xb62ce2194065a8dc:unit-1-name). Checked 2026-09-30. Coverage: separation, isotopes, naming compounds, formulas, balancing equations, stoichiometry, gas laws.
- [SHS General Chemistry 1: 2nd quarter](https://www.khanacademy.org/science/shs-general-chemistry-1/xb62ce2194065a8dc:2nd-quarter). Checked 2026-09-30. Coverage: atomic structure, Lewis structures, molecular shape and polarity, organic compounds, biomolecules.
- [SHS General Chemistry 2: 1st quarter](https://www.khanacademy.org/science/shs-general-chemistry-2/x8e72aa8e889b96da:unit-1-name). Checked 2026-09-30. Coverage: phase diagrams, solutions and colligative properties, thermochemistry, kinetics.
- [SHS General Chemistry 2: 2nd quarter](https://www.khanacademy.org/science/shs-general-chemistry-2/x8e72aa8e889b96da:2nd-quarter). Checked 2026-09-30. Coverage: thermodynamics, equilibrium, acids, bases and pH, electrochemistry.
- [SHS Biology 1: 1st quarter](https://www.khanacademy.org/science/shs-biology-1/xca2b82fdfba136b8:unit-1-name). Checked 2026-09-30. Coverage: cells, the cell cycle, cell transport, enzymes.
- [SHS Biology 1: 2nd quarter](https://www.khanacademy.org/science/shs-biology-1/xca2b82fdfba136b8:2nd-quarter). Checked 2026-09-30. Coverage: ATP, photosynthesis, respiration.
- [SHS Biology 2: 3rd quarter](https://www.khanacademy.org/science/shs-biology-2/x2ea931c66bba6acd:3rd-quarter). Checked 2026-09-30. Coverage: genetics, the central dogma, evolution, classification.
- [SHS Biology 2: 4th quarter](https://www.khanacademy.org/science/shs-biology-2/x2ea931c66bba6acd:unit-1-name). Checked 2026-09-30. Coverage: plant and animal organ systems.
- [SHS Earth Science: 1st quarter](https://www.khanacademy.org/science/shs-earth-science/xecff05e2330f305a:unit-1-name). Checked 2026-09-30. Coverage: the universe and solar system, Earth systems, minerals and rocks, resources.
- [SHS Earth Science: 2nd quarter](https://www.khanacademy.org/science/shs-earth-science/xecff05e2330f305a:2nd-quarter). Checked 2026-09-30. Coverage: weathering and erosion, plate tectonics, Earth’s history, Earth’s interior.
- [7th grade English: Poetry, prose, and drama](https://www.khanacademy.org/ela/7th-grade-english-matatag/xffd572ebe98884db:1st-quarter). Checked 2026-09-30. Coverage: reading literature.
- [7th grade English: Expository text](https://www.khanacademy.org/ela/7th-grade-english-matatag/xffd572ebe98884db:2nd-quarter). Checked 2026-09-30. Coverage: reading expository text.
- [8th grade English: Persuasive text](https://www.khanacademy.org/ela/8th-grade-english-matatag/x9d270d9b47c20571:2nd-quarter). Checked 2026-09-30. Coverage: claims, persuasion.
- [8th grade English: Science & technology articles](https://www.khanacademy.org/ela/8th-grade-english-matatag/x9d270d9b47c20571:3rd-quarter). Checked 2026-09-30. Coverage: reading science articles.
- [9th grade English: Argumentative text](https://www.khanacademy.org/ela/9th-grade-english-matatag/x42eb55e74028e61e:2nd-quarter). Checked 2026-09-30. Coverage: arguments and evidence.
- [9th grade English: Informational texts](https://www.khanacademy.org/ela/9th-grade-english-matatag/x42eb55e74028e61e:3rd-quarter). Checked 2026-09-30. Coverage: main idea, text structure.
- [10th grade English: Poetry, prose, and drama](https://www.khanacademy.org/ela/10th-grade-english-matatag/x4184394906211756:1st-quarter). Checked 2026-09-30. Coverage: reading literature.
- [10th grade English: Informational text](https://www.khanacademy.org/ela/10th-grade-english-matatag/x4184394906211756:2nd-quarter). Checked 2026-09-30. Coverage: informational reading.

### Official exam pages

- [UPCAT: University of the Philippines College Admission Test](https://upcat.up.edu.ph/). Checked 2026-09-30.
- [DCAT: De La Salle University College Admission Test](https://www.dlsu.edu.ph/admission/undergraduate-admissions/). Checked 2026-09-30.
- [DOST-SEI: DOST-SEI Undergraduate Scholarship Qualifying Examination](https://www.sei.dost.gov.ph/). Checked 2026-09-30.
- [PUPCET: PUP College Entrance Test](https://www.pup.edu.ph/iapply/). Checked 2026-09-30.

Date verification: the [UPCAT admissions bulletin](https://upcat.up.edu.ph/htmls/aboutupcat.html) identifies the UPCAT 2027 test as August 1 and 2, 2026, for AY 2027-2028. The [DOST-SEI 2027 scholarship portal](https://ugs.science-scholarships.ph/pages/home.html), linked from the official SEI helpdesk, gives November 14 and 15, 2026. Those are the dated events included in the calendar. DLSU exact future dates were not confirmed because its admissions page returned HTTP 403; the PUP page lists campus-specific schedules without confirming the inherited 2027 window. The inherited November DCAT dates, January to March 2027 PUPCET window, and August 2027 UPCAT window were removed from the official calendar. Personal pledge dates are planning targets.

Website institutional wording comes exclusively from src/lib/program/facts.ts. UP_ENDORSED remains false pending owner confirmation of the signed letter; historical presentation notes above do not authorize a website endorsement claim.
