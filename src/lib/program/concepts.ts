import type {Subtest} from '../mock/types.ts';
import type {KhanUnitId} from './khan-units.ts';
import type {Topic} from '../recovery.ts';

/** The study map, organised by subject and concept rather than grade. Each concept
 *  opens with a short "what you need to know" card, lists the Khan units that teach
 *  it (where one really fits), the reviewer chapter, and the engine topic that can
 *  diagnose a gap. Khan is offered, never required. */
export type Tldr={must:string[];rule:string;example:{q:string;a:string};trap:string};
export type Concept={id:string;subtest:Subtest;area:string;title:string;blurb:string;tldr:Tldr;khan:KhanUnitId[];chapter:string;engine?:Topic;after?:string[]};

const C=(c:Concept)=>c;
export const CONCEPTS:Concept[]=[
 // Mathematics
 C({id:'percent_fractions',subtest:'math',area:'Numbers',title:'Fractions, decimals and percent',blurb:'Adding fractions, converting between forms, percent change.',chapter:'m_fractions_percent',engine:'fractions',khan:['g7m_q1'],tldr:{
  must:['Fractions add only when the pieces are the same size, so find a common denominator first.','Percent means “out of 100”: 35% = 35/100 = 0.35.','r% of a number is the number × r/100.','An increase of r% multiplies by (1 + r/100); a decrease multiplies by (1 − r/100).'],
  rule:'a/b + c/d = (ad + bc)/bd',example:{q:'A ₱800 shirt is 25% off. New price?',a:'800 × 0.75 = ₱600'},trap:'Adding straight across: 1/2 + 1/3 is not 2/5.'}}),
 C({id:'ratio_rate',subtest:'math',area:'Numbers',title:'Ratio, rate and proportion',blurb:'Sharing in a ratio, unit rates, scaling recipes and maps.',chapter:'m_ratio',engine:'ratios',khan:['g7m_q1'],after:['percent_fractions'],tldr:{
  must:['In a : b the whole has a + b parts.','Find the size of one part first, then multiply.','A unit rate is “per one”: ₱120 for 4 kg is ₱30 per kg.','Proportions cross-multiply: a/b = c/d means ad = bc.'],
  rule:'Share = total × part ÷ (sum of parts)',example:{q:'Split ₱900 in the ratio 2 : 7.',a:'One part = 900 ÷ 9 = 100, so ₱200 and ₱700.'},trap:'Treating 2 : 7 as 2/7 of the total. It is 2/9.'}}),
 C({id:'exponents_polynomials',subtest:'math',area:'Algebra',title:'Exponents and polynomials',blurb:'Laws of exponents, special products, factoring.',chapter:'m_polynomials',engine:'brackets',khan:['g7m_q4','g8m_q1','grp_polynomials'],tldr:{
  must:['Same base, multiplying: add exponents. xᵃ · xᵇ = xᵃ⁺ᵇ.','Same base, dividing: subtract. xᵃ ÷ xᵇ = xᵃ⁻ᵇ.','Power of a power: multiply. (xᵃ)ᵇ = xᵃᵇ.','(x + a)² = x² + 2ax + a². Never forget the middle term.'],
  rule:'(a + b)(a − b) = a² − b²',example:{q:'Expand (x + 5)².',a:'x² + 10x + 25'},trap:'Writing (x + 5)² = x² + 25.'}}),
 C({id:'linear_equations',subtest:'math',area:'Algebra',title:'Linear equations and systems',blurb:'Solving for x, word problems, two equations at once.',chapter:'m_linear',engine:'graphs',khan:['g8m_q3'],after:['percent_fractions'],tldr:{
  must:['Whatever you do to one side, do to the other.','Undo in reverse order: remove added numbers first, then divide.','Two equations, two unknowns: add or subtract them so one letter disappears.','Always check by putting your answer back in.'],
  rule:'ax + b = c  →  x = (c − b) ÷ a',example:{q:'3x − 4 = 11',a:'3x = 15, so x = 5'},trap:'Moving a term across the equals sign and forgetting to change its sign.'}}),
 C({id:'quadratics',subtest:'math',area:'Algebra',title:'Quadratic equations',blurb:'Factoring, roots, the quadratic formula.',chapter:'m_quadratics',engine:'quadratics',khan:['g9m_q3','g10m_q2'],after:['exponents_polynomials','linear_equations'],tldr:{
  must:['Set the equation to zero, then factor.','If a product is zero, one factor is zero.','x² + bx + c factors into (x + p)(x + q) where p + q = b and pq = c.','When factoring fails, use x = (−b ± √(b² − 4ac)) ÷ 2a.'],
  rule:'Discriminant b² − 4ac: positive gives 2 roots, zero gives 1, negative gives none that are real.',example:{q:'x² − 5x + 6 = 0',a:'(x − 2)(x − 3) = 0, so x = 2 or 3'},trap:'Reading x − 3 as the root −3. The root is +3.'}}),
 C({id:'lines_functions',subtest:'math',area:'Algebra',title:'Lines, slope and functions',blurb:'Slope, y = mx + b, evaluating f(x).',chapter:'m_lines',engine:'graphs',khan:['g9m_q1','genmath_functions','grc_limits'],after:['linear_equations'],tldr:{
  must:['Slope = rise ÷ run = (y₂ − y₁) ÷ (x₂ − x₁).','In y = mx + b, m is the slope and b is where the line crosses the y-axis.','Parallel lines share a slope. Perpendicular slopes multiply to −1.','To find f(−3), put (−3) in brackets wherever x appears.'],
  rule:'y − y₁ = m(x − x₁)',example:{q:'Slope through (1, 2) and (4, 11)?',a:'(11 − 2) ÷ (4 − 1) = 3'},trap:'Squaring a negative without brackets: (−3)² = 9, not −9.'}}),
 C({id:'geometry',subtest:'math',area:'Geometry',title:'Geometry and measurement',blurb:'Areas, the Pythagorean theorem, circles, angles.',chapter:'m_geometry',khan:['g7m_q1','g8m_q2','g10m_q4'],tldr:{
  must:['Triangle area = ½ × base × height.','Right triangles: a² + b² = c², with c the longest side.','Circle: area πr², circumference 2πr. Halve a diameter first.','Interior angles of an n-sided polygon add to (n − 2) × 180°.'],
  rule:'Common right triangles: 3-4-5, 5-12-13, 8-15-17',example:{q:'Legs 6 and 8. Hypotenuse?',a:'√(36 + 64) = 10'},trap:'Using the diameter as the radius.'}}),
 C({id:'trigonometry',subtest:'math',area:'Geometry',title:'Basic trigonometry',blurb:'SOH CAH TOA and special angles.',chapter:'m_trig',khan:['g9m_q4','grp_trig','precalc_trig'],after:['geometry'],tldr:{
  must:['sin = opposite ÷ hypotenuse, cos = adjacent ÷ hypotenuse, tan = opposite ÷ adjacent.','Label sides from the angle you are using.','sin 30° = ½, cos 60° = ½, tan 45° = 1.','sin²θ + cos²θ = 1 for every angle.'],
  rule:'SOH CAH TOA',example:{q:'Hypotenuse 10, angle 30°. Opposite side?',a:'10 × sin 30° = 5'},trap:'Labelling opposite and adjacent from the wrong angle.'}}),
 C({id:'sequences',subtest:'math',area:'Algebra',title:'Sequences and patterns',blurb:'Arithmetic and geometric sequences.',chapter:'m_sequences',khan:['g8m_q1','precalc_series'],tldr:{
  must:['Arithmetic: add the same difference d each time.','nth term: aₙ = a₁ + (n − 1)d.','Geometric: multiply by the same ratio r each time.','Sum of an arithmetic sequence: n × (first + last) ÷ 2.'],
  rule:'aₙ = a₁ + (n − 1)d',example:{q:'5, 9, 13, … 20th term?',a:'5 + 19 × 4 = 81'},trap:'Using n instead of n − 1 steps.'}}),
 C({id:'statistics_probability',subtest:'math',area:'Data',title:'Statistics and probability',blurb:'Mean, median, counting, chance of events.',chapter:'m_probability',khan:['g7m_q3','g8m_q4','g9m_q4','statprob'],tldr:{
  must:['Mean = total ÷ count, so total = mean × count.','Median is the middle value after sorting.','P(event) = favourable ÷ total, between 0 and 1.','“And” multiplies; “or” adds when the events cannot both happen.'],
  rule:'Without replacement, the second draw has one fewer item.',example:{q:'3 red, 2 blue. Two red, no replacement?',a:'3/5 × 2/4 = 3/10'},trap:'Squaring the first probability as if the marble went back.'}}),
 C({id:'word_problems',subtest:'math',area:'Word problems',title:'Word problems: rate, work and money',blurb:'Speed, working together, interest, mixtures.',chapter:'m_word_problems',engine:'ratios',khan:['g7m_q1','g10m_q4','genmath_business'],after:['ratio_rate','linear_equations'],tldr:{
  must:['Write what you know with units before calculating.','Average speed = total distance ÷ total time, never the average of speeds.','Working together: add rates (jobs per hour), then flip.','Simple interest: I = P × r × t.'],
  rule:'Together time = ab ÷ (a + b)',example:{q:'One pipe fills a tank in 3 h, another in 6 h. Together?',a:'3 × 6 ÷ 9 = 2 hours'},trap:'Averaging the two times.'}}),
 // Science
 C({id:'matter_measurement',subtest:'science',area:'Physics',title:'Measurement, units and density',blurb:'Units, conversions, density.',chapter:'s_units',engine:'motion',khan:['phys1_q1'],tldr:{
  must:['Write units on every number; units tell you whether to multiply or divide.','Density = mass ÷ volume.','1 L = 1000 mL = 1000 cm³.','Convert first, calculate second.'],
  rule:'ρ = m ÷ V',example:{q:'54 g in 20 cm³?',a:'2.7 g/cm³'},trap:'Dividing volume by mass.'}}),
 C({id:'motion_forces',subtest:'science',area:'Physics',title:'Motion and forces',blurb:'Speed, acceleration, Newton’s laws, weight.',chapter:'s_motion',engine:'forces',khan:['phys1_q1'],after:['matter_measurement'],tldr:{
  must:['Speed = distance ÷ time.','Acceleration = change in velocity ÷ time = (v − u) ÷ t.','Net force = mass × acceleration. Use the net force, after friction.','Weight is a force: W = mg, with g = 9.8 m/s².'],
  rule:'F_net = ma',example:{q:'10 kg crate, 50 N push, 20 N friction.',a:'a = 30 ÷ 10 = 3 m/s²'},trap:'Forgetting to subtract friction.'}}),
 C({id:'energy_heat',subtest:'science',area:'Physics',title:'Work, energy, power and heat',blurb:'KE, PE, work, power, specific heat.',chapter:'s_energy',khan:['phys1_q1','chem2_q1'],after:['motion_forces'],tldr:{
  must:['Work = force × distance (in the direction of the force).','Kinetic energy = ½mv². Potential energy = mgh.','Power = work ÷ time, in watts.','Heat Q = mcΔT, with ΔT the change in temperature.'],
  rule:'Energy is conserved: PE lost = KE gained (no friction).',example:{q:'2 kg at 3 m/s. KE?',a:'½ × 2 × 9 = 9 J'},trap:'Forgetting to square the speed.'}}),
 C({id:'electricity_waves',subtest:'science',area:'Physics',title:'Electricity and waves',blurb:'Ohm’s law, circuits, wave speed.',chapter:'s_electricity',khan:['phys2_q3','phys1_q2'],tldr:{
  must:['V = IR: voltage = current × resistance.','Series: resistances add. Parallel: 1/R = 1/R₁ + 1/R₂.','Wave speed = frequency × wavelength.','Higher frequency means shorter wavelength at the same speed.'],
  rule:'P = VI for electrical power',example:{q:'12 V across 4 Ω?',a:'I = 3 A'},trap:'Multiplying V and R to get current.'}}),
 C({id:'gases',subtest:'science',area:'Chemistry',title:'Gas laws',blurb:'Boyle, Charles, and the ideal gas law.',chapter:'s_gases',khan:['chem1_q1','phys1_q2'],tldr:{
  must:['Boyle: at constant temperature, P₁V₁ = P₂V₂ (squeeze it, pressure rises).','Charles: at constant pressure, V₁/T₁ = V₂/T₂ with T in kelvin.','Kelvin = °C + 273.','PV = nRT combines them.'],
  rule:'Always use kelvin in gas laws.',example:{q:'6 L at 2 atm, pressure becomes 3 atm.',a:'V = 2 × 6 ÷ 3 = 4 L'},trap:'Treating pressure and volume as if they rise together.'}}),
 C({id:'moles_formulas',subtest:'science',area:'Chemistry',title:'Formulas, moles and composition',blurb:'Counting atoms, molar mass, grams to moles.',chapter:'s_moles',engine:'moles',khan:['chem1_q1'],tldr:{
  must:['A subscript counts the atom before it; a subscript after brackets multiplies everything inside.','Molar mass = sum of atomic masses in the formula.','Moles = mass ÷ molar mass.','Percent by mass = element mass ÷ formula mass × 100.'],
  rule:'n = m ÷ M',example:{q:'36 g of water (18 g/mol)?',a:'2 mol'},trap:'Ignoring a subscript: H₂O is 18, not 17.'}}),
 C({id:'solutions_acids',subtest:'science',area:'Chemistry',title:'Solutions, acids and bases',blurb:'Molarity, pH, neutralisation.',chapter:'s_acids',khan:['chem2_q1','chem2_q2'],after:['moles_formulas'],tldr:{
  must:['Molarity = moles of solute ÷ litres of solution.','Convert mL to L by dividing by 1000.','pH = −log[H⁺]. [H⁺] = 10⁻³ means pH 3.','pH below 7 is acidic, 7 is neutral, above 7 is basic.'],
  rule:'pH + pOH = 14 at 25 °C',example:{q:'0.2 mol in 500 mL?',a:'0.2 ÷ 0.5 = 0.4 M'},trap:'Forgetting to convert millilitres.'}}),
 C({id:'nuclear',subtest:'science',area:'Physics',title:'Radioactivity and half-life',blurb:'Decay, half-life, types of radiation.',chapter:'s_nuclear',khan:['phys2_q4'],tldr:{
  must:['Each half-life halves what is left.','Number of half-lives = time ÷ half-life.','Alpha is stopped by paper, beta by aluminium, gamma needs lead or concrete.','Decay is not steady subtraction.'],
  rule:'N = N₀ × (½)ⁿ',example:{q:'80 g, 3 half-lives?',a:'80 → 40 → 20 → 10 g'},trap:'Subtracting the same amount each half-life.'}}),
 C({id:'genetics',subtest:'science',area:'Biology',title:'Genetics and heredity',blurb:'Punnett squares, dominant and recessive traits.',chapter:'s_genetics',khan:['bio2_q3'],tldr:{
  must:['Each parent passes one allele for each gene.','Dominant (A) shows with AA or Aa; recessive shows only with aa.','Aa × Aa gives 1 AA : 2 Aa : 1 aa, so 3 : 1 dominant to recessive.','Genotype is the letters; phenotype is the visible trait.'],
  rule:'A 3 : 1 ratio means 3/4 and 1/4.',example:{q:'Aa × aa, chance of recessive?',a:'1/2'},trap:'Reading 3 : 1 as one third.'}}),
 C({id:'cells_life',subtest:'science',area:'Biology',title:'Cells and life processes',blurb:'Cell parts, transport, photosynthesis, respiration.',chapter:'s_cells',khan:['bio1_q1','bio1_q2'],tldr:{
  must:['Mitochondria release energy in respiration; chloroplasts capture light in photosynthesis.','Photosynthesis: CO₂ + H₂O + light → glucose + O₂. Respiration runs it the other way and releases energy.','Diffusion moves particles from high to low concentration; osmosis is water doing the same across a membrane.','Plant cells have a cell wall and chloroplasts; animal cells do not.'],
  rule:'Mitosis makes 2 identical cells; meiosis makes 4 sex cells with half the chromosomes.',example:{q:'Which organelle makes most of the cell’s ATP?',a:'The mitochondrion'},trap:'Thinking plants do not respire. They do, day and night.'}}),
 C({id:'earth_space',subtest:'science',area:'Earth and space',title:'Earth and space',blurb:'Plate tectonics, rocks, weather, the solar system.',chapter:'s_earth',khan:['earth_q1','earth_q2'],tldr:{
  must:['The Philippines sits on plate boundaries, which is why it has earthquakes and volcanoes.','Igneous rock forms from cooled magma, sedimentary from layers, metamorphic from heat and pressure.','Seasons come from Earth’s tilt, not its distance from the Sun.','Typhoons form over warm ocean water.'],
  rule:'Order of planets: My Very Excellent Mother Just Served Us Noodles.',example:{q:'Why is it hotter in some months?',a:'The tilt makes sunlight hit more directly.'},trap:'Saying seasons happen because Earth gets closer to the Sun.'}}),
 // Language
 C({id:'grammar_agreement',subtest:'language',area:'Grammar',title:'Subject-verb agreement',blurb:'Finding the real subject; tricky singulars.',chapter:'l_agreement',khan:[],tldr:{
  must:['Find the real subject, then match the verb to it.','Cross out “of …” phrases: “The list of books is …”.','Each, every, one, either, neither: singular.','With “or” and “nor”, the verb matches the nearer subject.'],
  rule:'Singular subject, singular verb (is, has, runs).',example:{q:'One of the students ___ absent.',a:'is'},trap:'Matching the verb to the noun closest to it.'}}),
 C({id:'grammar_verbs',subtest:'language',area:'Grammar',title:'Verb tenses and forms',blurb:'Perfect tenses, conditionals, verb forms.',chapter:'l_verbs',khan:[],tldr:{
  must:['Past perfect (had + verb) is the earlier of two past events.','Unreal conditions use “were”: If I were you …','After a preposition, use the -ing form: look forward to seeing.','Modals (should, could, must) + have + past participle: should have gone.'],
  rule:'Time words (since, by the time, next week) choose the tense.',example:{q:'By noon, she ___ (finish) the test.',a:'had finished'},trap:'Using “was” in an unreal condition.'}}),
 C({id:'vocabulary_context',subtest:'language',area:'Vocabulary',title:'Vocabulary in context',blurb:'Clues, word parts, synonyms and antonyms.',chapter:'l_vocabulary',khan:['eng9_q3'],tldr:{
  must:['Look for signal words: “but”, “despite” (contrast); “because”, “so” (cause); “like” (similarity).','Try each choice in the sentence and reread.','Word parts help: “bene-” good, “mal-” bad, “ambi-” both, “-less” without.','Pick the meaning that fits this sentence, not the most common meaning.'],
  rule:'Replace the word with your own simple word first, then find the closest choice.',example:{q:'Despite her meticulous notes, she missed a detail.',a:'meticulous = very careful'},trap:'Choosing a meaning you know that does not fit this sentence.'}}),
 C({id:'sentence_structure',subtest:'language',area:'Grammar',title:'Sentence structure',blurb:'Fragments, run-ons, modifiers, parallelism.',chapter:'l_sentences',khan:[],tldr:{
  must:['A sentence needs a subject and a main verb and must stand alone.','Two sentences joined only by a comma is a comma splice.','An opening phrase describes whatever comes right after the comma.','Lists keep the same form: reading, writing, and swimming.'],
  rule:'Join two sentences with a period, a semicolon, or a comma plus and, but, or, so.',example:{q:'Fix: “I studied, I still failed.”',a:'I studied, but I still failed.'},trap:'“Walking home, the rain fell” says the rain was walking.'}}),
 C({id:'usage',subtest:'language',area:'Grammar',title:'Word usage',blurb:'Affect or effect, fewer or less, pronoun case.',chapter:'l_usage',khan:[],tldr:{
  must:['Affect is usually the verb; effect is usually the noun.','Fewer for things you count; less for amounts.','After a preposition, use me, him, her, us, them.','It’s = it is. Its = belonging to it.'],
  rule:'Remove the other person to test pronouns: “between you and me”.',example:{q:'___ books than last year (fewer/less)',a:'fewer'},trap:'“Between you and I.”'}}),
 C({id:'filipino_gramatika',subtest:'language',area:'Filipino',title:'Gramatikang Filipino',blurb:'Ng at nang, din at rin, aspekto at pokus ng pandiwa.',chapter:'l_filipino',khan:[],tldr:{
  must:['“Ng” ang pananda ng layon o pagmamay-ari: bumili ng aklat.','“Nang” para sa paraan, dahilan o “noong”: tumakbo nang mabilis.','Rin, raw, rito: pagkatapos ng patinig o w/y. Din, daw, dito: pagkatapos ng katinig.','Aspekto: kumain (naganap), kumakain (nagaganap), kakain (magaganap).'],
  rule:'Paraan? “Nang.” Layon? “Ng.”',example:{q:'Kumain siya ___ mabilis.',a:'nang'},trap:'Paggamit ng “ng” sa paraan ng kilos.'}}),
 C({id:'filipino_talasalitaan',subtest:'language',area:'Filipino',title:'Talasalitaan at sawikain',blurb:'Kahulugan, kasingkahulugan, kasalungat, idyoma.',chapter:'l_filipino_vocab',khan:[],tldr:{
  must:['Basahin ang buong pangungusap bago pumili.','Ang sawikain ay may kahulugang hindi literal.','Hanapin ang pahiwatig: “kahit”, “dahil”, “ngunit”.','Subukan ang bawat pagpipilian sa loob ng pangungusap.'],
  rule:'Kasingkahulugan: parehong ibig sabihin. Kasalungat: kabaligtaran.',example:{q:'Nagbibilang ng poste',a:'walang trabaho'},trap:'Pagbasa nang literal sa sawikain.'}}),
 // Reading
 C({id:'main_idea',subtest:'reading',area:'Reading',title:'Main idea',blurb:'What the whole passage says.',chapter:'r_main_idea',khan:['eng9_q3','eng7_q2'],tldr:{
  must:['The main idea covers the whole passage, not one paragraph.','Check the first and last paragraphs; the idea often appears there.','A true detail is not automatically the main idea.','Too broad or too narrow are both wrong.'],
  rule:'Ask: what would the author want me to remember in one sentence?',example:{q:'Passage on mangroves’ benefits and restoration limits',a:'Mangroves help coasts, but restoring them needs the right conditions.'},trap:'Picking a vivid detail from the first paragraph.'}}),
 C({id:'details',subtest:'reading',area:'Reading',title:'Stated details',blurb:'Finding what the passage says directly.',chapter:'r_details',khan:['eng9_q3'],tldr:{
  must:['The answer is in the text. Go back and find the line.','Match meaning, not just the same words.','Watch for choices that are true in real life but not stated.','Numbers and names are easy to mix up; check them.'],
  rule:'Point to the sentence before you choose.',example:{q:'Where were boat remains found?',a:'Find the sentence that names the place.'},trap:'Choosing something you know is true but the passage never said.'}}),
 C({id:'inference',subtest:'reading',area:'Reading',title:'Inference',blurb:'What the passage suggests without saying.',chapter:'r_inference',khan:['eng9_q3','eng10_q1'],after:['details'],tldr:{
  must:['An inference must be supported by clues in the text.','Collect two or three clues before deciding.','Avoid choices that go further than the text allows.','In fiction, actions and small details reveal feelings.'],
  rule:'Clue + clue → the safest conclusion.',example:{q:'She held the folder as if it might escape.',a:'She is nervous.'},trap:'Choosing an answer that is possible but not supported.'}}),
 C({id:'vocabulary_in_context',subtest:'reading',area:'Reading',title:'Words in a passage',blurb:'Meaning from the surrounding sentences.',chapter:'r_vocabulary',khan:['eng9_q3'],tldr:{
  must:['Reread the whole sentence and the one before it.','Replace the word with each choice and test it.','The most common meaning is often a trap.','Tone matters: positive, negative or neutral.'],
  rule:'Context beats memory.',example:{q:'“Records are scarce.”',a:'scarce = few, in short supply'},trap:'Picking a meaning that fits the word but not the passage.'}}),
 C({id:'author_purpose',subtest:'reading',area:'Reading',title:'Purpose, tone and structure',blurb:'Why the author wrote it and how it is built.',chapter:'r_purpose',khan:['eng8_q2','eng9_q2'],after:['main_idea'],tldr:{
  must:['Purpose: inform, persuade, entertain, or describe.','Ask why a detail is there: evidence, example, contrast, or limit.','Tone words: objective, cautious, critical, hopeful, nostalgic.','Structure: cause-effect, problem-solution, compare-contrast, sequence.'],
  rule:'Every paragraph has a job. Name it in three words.',example:{q:'Why mention typhoon studies?',a:'To give evidence for the claim.'},trap:'Confusing what a paragraph says with why it is there.'}})
];
export const CONCEPT_BY_ID:Record<string,Concept>=Object.fromEntries(CONCEPTS.map(c=>[c.id,c]));
export const conceptsFor=(s:Subtest)=>CONCEPTS.filter(c=>c.subtest===s);
