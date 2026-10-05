import type {ExamId} from './admissions.ts';

/** What each exam section asks about, sub-subject by sub-subject, so the reviewer can show the
 *  whole map and not only the topics it has written. Sources and method are in
 *  docs/research/2026-10-05/UPCAT_TOPIC_OUTLINE.md and DCAT_TOPIC_OUTLINE.md.
 *
 *  The schools publish their sections, not topic lists. These outlines follow what established
 *  review books and review sites agree the exam covers, in Khanpanion's own words. Their names
 *  stay out of the learner-facing site.
 *
 *  `concepts` lists the reviewer summaries that teach a topic; a topic without one is shown as
 *  not written yet. `less` marks a sub-subject that only some reviewers report. Section names
 *  must match EXAM_COVERAGE. */
export type OutlineTopic={title:string;concepts?:string[]};
export type OutlineGroup={name:string;topics:OutlineTopic[];less?:boolean};
export type ExamOutline={sections:Record<string,OutlineGroup[]>;checked:string};

const T=(title:string,...concepts:string[]):OutlineTopic=>concepts.length?{title,concepts}:{title};

/** A topic's save key. Saving is per topic, not per summary: two topics taught by the same
 *  summary are saved separately. Keys come from the title, so renaming a topic drops its saves. */
export const topicKey=(exam:ExamId,title:string)=>`outline:${exam}:${title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`;

export const EXAM_OUTLINES:Partial<Record<ExamId,ExamOutline>>={
 upcat:{checked:'2026-10-05',sections:{
  'Language Proficiency':[
   {name:'English vocabulary',topics:[
    T('Word meaning from context clues','vocabulary_context'),
    T('Synonyms and antonyms','vocabulary_context'),
    T('Roots, prefixes and suffixes','vocabulary_context'),
    T('Commonly confused words','usage'),
    T('Spelling'),
    T('Idioms and figurative expressions')
   ]},
   {name:'English grammar and usage',topics:[
    T('Parts of speech'),
    T('Subject-verb agreement','grammar_agreement'),
    T('Verb tenses and forms','grammar_verbs'),
    T('Pronoun case and agreement','usage'),
    T('Adjectives and adverbs'),
    T('Prepositions and articles'),
    T('Active and passive voice'),
    T('Punctuation and capitalization')
   ]},
   {name:'Sentence structure',topics:[
    T('Fragments and run-on sentences','sentence_structure'),
    T('Misplaced and dangling modifiers','sentence_structure'),
    T('Parallel structure','sentence_structure'),
    T('Combining and ordering sentences'),
    T('Direct and reported speech')
   ]},
   {name:'Gramatikang Filipino',topics:[
    T('Ng at nang, din at rin, at iba pang madalas mapagpalit','filipino_gramatika'),
    T('Aspekto ng pandiwa','filipino_gramatika'),
    T('Pokus ng pandiwa','filipino_gramatika'),
    T('Panghalip'),
    T('Pang-ugnay: pangatnig at pang-ukol'),
    T('Wastong baybay at bantas')
   ]},
   {name:'Talasalitaang Filipino',topics:[
    T('Kahulugan ayon sa konteksto','filipino_talasalitaan'),
    T('Kasingkahulugan at kasalungat','filipino_talasalitaan'),
    T('Sawikain at idyoma','filipino_talasalitaan'),
    T('Salawikain at tayutay')
   ]}
  ],
  'Reading Comprehension':[
   {name:'Understanding the passage',topics:[
    T('Main idea and best title','main_idea'),
    T('Stated details','details'),
    T('Sequence of events'),
    T('Fact and opinion')
   ]},
   {name:'Reasoning from the text',topics:[
    T('Inferences and conclusions','inference'),
    T('Cause and effect'),
    T('Word meaning in a passage','vocabulary_in_context')
   ]},
   {name:'The author’s craft',topics:[
    T('Purpose and point of view','author_purpose'),
    T('Tone and mood','author_purpose'),
    T('How the passage is organized','author_purpose'),
    T('Figurative language in a passage')
   ]},
   {name:'Kinds of passages, in English and Filipino',topics:[
    T('Essays and articles'),
    T('Short stories'),
    T('Poems'),
    T('Speeches'),
    T('Tables, graphs and diagrams')
   ]}
  ],
  'Mathematics':[
   {name:'Arithmetic and number sense',topics:[
    T('The real number system'),
    T('Integers and the order of operations'),
    T('Factors, multiples and divisibility'),
    T('Fractions and decimals','percent_fractions'),
    T('Percent','percent_fractions'),
    T('Ratio and proportion','ratio_rate')
   ]},
   {name:'Algebra and functions',topics:[
    T('Algebraic expressions and laws of exponents','exponents_polynomials'),
    T('Polynomials, special products and factoring','exponents_polynomials'),
    T('Rational expressions'),
    T('Radicals'),
    T('Linear equations and inequalities','linear_equations'),
    T('Systems of linear equations','linear_equations'),
    T('Quadratic equations','quadratics'),
    T('Functions and their graphs','lines_functions'),
    T('The coordinate plane, lines and slope','lines_functions'),
    T('Exponents and logarithms'),
    T('Sequences and series','sequences'),
    T('Word problems','word_problems')
   ]},
   {name:'Geometry',topics:[
    T('Lines, angles and their properties','geometry'),
    T('Triangles, congruence and similarity','geometry'),
    T('Right triangles and the Pythagorean theorem','geometry'),
    T('Perimeter and area of plane figures','geometry'),
    T('Circles','geometry'),
    T('Surface area and volume of solids'),
    T('Converting units of measurement')
   ]},
   {name:'Trigonometry',topics:[
    T('The six trigonometric ratios','trigonometry'),
    T('Special angles and the unit circle','trigonometry'),
    T('Angles of elevation and depression')
   ]},
   {name:'Statistics and probability',topics:[
    T('Mean, median and mode','statistics_probability'),
    T('Permutations and combinations','statistics_probability'),
    T('Probability of events','statistics_probability'),
    T('Reading tables and graphs')
   ]},
   {name:'Logic and calculus basics',less:true,topics:[
    T('Propositions and truth tables'),
    T('Limits'),
    T('Simple derivatives and integrals')
   ]}
  ],
  'Science':[
   {name:'Biology',topics:[
    T('Characteristics of life and the scientific method'),
    T('Biomolecules'),
    T('Cell structure and transport','cells_life'),
    T('Photosynthesis and cellular respiration','cells_life'),
    T('Mitosis and meiosis'),
    T('DNA, RNA and protein synthesis'),
    T('Inheritance and Punnett squares','genetics'),
    T('Evolution and natural selection'),
    T('Classification and biodiversity'),
    T('Human body systems'),
    T('Plant structure and function'),
    T('Ecosystems and energy flow')
   ]},
   {name:'Chemistry',topics:[
    T('Matter, its properties and changes'),
    T('Atomic structure'),
    T('The periodic table and periodic trends'),
    T('Chemical bonding and naming compounds'),
    T('Formulas, molar mass and the mole','moles_formulas'),
    T('Chemical reactions and balancing equations'),
    T('Stoichiometry','moles_formulas'),
    T('Gas laws','gases'),
    T('Solutions and concentration','solutions_acids'),
    T('Acids, bases and pH','solutions_acids'),
    T('Reaction rates and equilibrium'),
    T('Heat in chemical reactions'),
    T('Carbon compounds and biochemistry')
   ]},
   {name:'Physics',topics:[
    T('Measurement, units and density','matter_measurement'),
    T('Scalars and vectors'),
    T('Speed, velocity and acceleration','motion_forces'),
    T('Newton’s laws and friction','motion_forces'),
    T('Projectile motion'),
    T('Work, energy and power','energy_heat'),
    T('Momentum and impulse'),
    T('Pressure and buoyancy in fluids'),
    T('Heat and temperature','energy_heat'),
    T('Waves and sound','electricity_waves'),
    T('Light, mirrors and lenses'),
    T('Electric circuits','electricity_waves'),
    T('Magnetism and electromagnetism'),
    T('Radioactivity and half-life','nuclear')
   ]},
   {name:'Earth science',topics:[
    T('Earth’s layers and composition','earth_space'),
    T('Rocks and minerals','earth_space'),
    T('Plate tectonics, earthquakes and volcanoes','earth_space'),
    T('Weathering, erosion and landforms'),
    T('Fossils and the geologic time scale'),
    T('Weather, climate and the atmosphere','earth_space')
   ]},
   {name:'Astronomy',topics:[
    T('The solar system and its planets','earth_space'),
    T('Earth’s rotation, revolution and the seasons'),
    T('Phases of the Moon and eclipses'),
    T('Stars and constellations'),
    T('The origin of the universe')
   ]}
  ]
 }},
 dcat:{checked:'2026-10-05',sections:{
  'Mathematics':[
   {name:'Arithmetic and number sense',topics:[
    T('Operations with integers'),
    T('Fractions and decimals','percent_fractions'),
    T('Percent and percent change','percent_fractions'),
    T('Ratio and proportion','ratio_rate'),
    T('Square roots and radicals')
   ]},
   {name:'Algebra',topics:[
    T('Algebraic expressions and laws of exponents','exponents_polynomials'),
    T('Special products and factoring','exponents_polynomials'),
    T('Linear equations and inequalities','linear_equations'),
    T('Systems of linear equations','linear_equations'),
    T('Quadratic equations','quadratics'),
    T('Functions, lines and slope','lines_functions'),
    T('Number patterns and sequences','sequences')
   ]},
   {name:'Word problems',topics:[
    T('Rate, distance and time','word_problems'),
    T('Work problems','word_problems'),
    T('Age and mixture problems'),
    T('Interest, discounts and other business math','word_problems','percent_fractions')
   ]},
   {name:'Geometry and trigonometry',topics:[
    T('Angles and polygons','geometry'),
    T('Triangles and the Pythagorean theorem','geometry'),
    T('Perimeter and area','geometry'),
    T('Circles','geometry'),
    T('Surface area and volume'),
    T('Trigonometric ratios','trigonometry'),
    T('Special angles','trigonometry')
   ]},
   {name:'Statistics and probability',topics:[
    T('Mean, median and mode','statistics_probability'),
    T('Counting outcomes'),
    T('Probability of events','statistics_probability'),
    T('Reading tables and graphs')
   ]}
  ],
  'Science':[
   {name:'Biology',topics:[
    T('Cell parts and transport','cells_life'),
    T('Photosynthesis and respiration','cells_life'),
    T('Genetics and inheritance','genetics'),
    T('Human body systems')
   ]},
   {name:'Chemistry',topics:[
    T('Matter and its changes'),
    T('Atomic structure'),
    T('Chemical symbols and naming compounds'),
    T('Formulas, molar mass and the mole','moles_formulas'),
    T('Gas laws','gases'),
    T('Acids, bases and solutions','solutions_acids')
   ]},
   {name:'Physics',topics:[
    T('SI units, measurement and density','matter_measurement'),
    T('Motion and Newton’s laws','motion_forces'),
    T('Work, energy and power','energy_heat'),
    T('Heat and temperature','energy_heat'),
    T('Electricity and circuits','electricity_waves'),
    T('Waves, sound and light','electricity_waves'),
    T('Radioactivity','nuclear')
   ]},
   {name:'Earth and space science',less:true,topics:[
    T('Earth’s structure and plate tectonics','earth_space'),
    T('Rocks and minerals','earth_space'),
    T('Weather and climate','earth_space'),
    T('The solar system','earth_space')
   ]}
  ],
  'English':[
   {name:'Vocabulary',topics:[
    T('Word meaning from context clues','vocabulary_context'),
    T('Synonyms and antonyms','vocabulary_context'),
    T('Word roots, prefixes and suffixes','vocabulary_context'),
    T('Commonly confused words','usage'),
    T('Idioms')
   ]},
   {name:'Grammar and usage',topics:[
    T('Subject-verb agreement','grammar_agreement'),
    T('Verb tenses and forms','grammar_verbs'),
    T('Pronoun case','usage'),
    T('Punctuation')
   ]},
   {name:'Sentence construction and correction',topics:[
    T('Fragments, run-ons and comma splices','sentence_structure'),
    T('Misplaced and dangling modifiers','sentence_structure'),
    T('Parallel structure','sentence_structure'),
    T('Finding the error in a sentence')
   ]},
   {name:'Reading comprehension',topics:[
    T('Main idea','main_idea'),
    T('Stated details','details'),
    T('Inferences and conclusions','inference'),
    T('Word meaning in a passage','vocabulary_in_context'),
    T('Author’s purpose and tone','author_purpose'),
    T('Graphs and data in a passage')
   ]}
  ]
 }}
};

/** Every outlined topic by its save key, for the reviewer's Saved list. */
export const OUTLINE_BY_KEY=new Map(Object.entries(EXAM_OUTLINES).flatMap(([exam,o])=>Object.entries(o?.sections??{}).flatMap(([section,groups])=>groups.flatMap(g=>g.topics.map(topic=>[topicKey(exam as ExamId,topic.title),{exam:exam as ExamId,section,topic}] as const)))));
