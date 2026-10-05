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
  must:['Fractions add only when the pieces are the same size, so find a common denominator first.','Percent means “out of 100”: $35\\% = \\frac{35}{100} = 0.35$.','$r\\%$ of a number is $\\text{the number} \\times \\frac{r}{100}$.','An increase of $r\\%$ multiplies by $\\left(1 + \\frac{r}{100}\\right)$; a decrease multiplies by $\\left(1 - \\frac{r}{100}\\right)$.'],
  rule:'$\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$',example:{q:'A ₱800 shirt is 25% off. New price?',a:'$800 \\times 0.75 = 600$, so ₱600'},trap:'Adding straight across: $\\frac{1}{2} + \\frac{1}{3}$ is not $\\frac{2}{5}$.'}}),
 C({id:'ratio_rate',subtest:'math',area:'Numbers',title:'Ratio, rate and proportion',blurb:'Sharing in a ratio, unit rates, scaling recipes and maps.',chapter:'m_ratio',engine:'ratios',khan:['g7m_q1'],after:['percent_fractions'],tldr:{
  must:['In $a : b$ the whole has $a + b$ parts.','Find the size of one part first, then multiply.','A unit rate is “per one”: ₱120 for 4 kg is ₱30 per kg.','Proportions cross-multiply: $\\frac{a}{b} = \\frac{c}{d}$ means $ad = bc$.'],
  rule:'$\\text{Share} = \\text{total} \\times \\text{part} \\div (\\text{sum of parts})$',example:{q:'Split ₱900 in the ratio $2 : 7$.',a:'One part: $900 \\div 9 = 100$, so ₱200 and ₱700.'},trap:'Treating $2 : 7$ as $\\frac{2}{7}$ of the total. It is $\\frac{2}{9}$.'}}),
 C({id:'exponents_polynomials',subtest:'math',area:'Algebra',title:'Exponents and polynomials',blurb:'Laws of exponents, special products, factoring.',chapter:'m_polynomials',engine:'brackets',khan:['g7m_q4','g8m_q1','grp_polynomials'],tldr:{
  must:['Same base, multiplying: add exponents. $x^{a} \\cdot x^{b} = x^{a + b}$.','Same base, dividing: subtract. $x^{a} \\div x^{b} = x^{a - b}$.','Power of a power: multiply. $(x^{a})^{b} = x^{ab}$.','$(x + a)^2 = x^2 + 2ax + a^2$. Never forget the middle term.'],
  rule:'$(a + b)(a - b) = a^2 - b^2$',example:{q:'Expand $(x + 5)^2$.',a:'$x^2 + 10x + 25$'},trap:'Writing $(x + 5)^2 = x^2 + 25$.'}}),
 C({id:'linear_equations',subtest:'math',area:'Algebra',title:'Linear equations and systems',blurb:'Solving for $x$, word problems, two equations at once.',chapter:'m_linear',engine:'graphs',khan:['g8m_q3'],after:['percent_fractions'],tldr:{
  must:['Whatever you do to one side, do to the other.','Undo in reverse order: remove added numbers first, then divide.','Two equations, two unknowns: add or subtract them so one letter disappears.','Always check by putting your answer back in.'],
  rule:'$ax + b = c \\quad \\Rightarrow \\quad x = \\frac{c - b}{a}$',example:{q:'$3x - 4 = 11$',a:'$3x = 15$, so $x = 5$'},trap:'Moving a term across the equals sign and forgetting to change its sign.'}}),
 C({id:'quadratics',subtest:'math',area:'Algebra',title:'Quadratic equations',blurb:'Factoring, roots, the quadratic formula.',chapter:'m_quadratics',engine:'quadratics',khan:['g9m_q3','g10m_q2'],after:['exponents_polynomials','linear_equations'],tldr:{
  must:['Set the equation to zero, then factor.','If a product is zero, one factor is zero.','$x^2 + bx + c$ factors into $(x + p)(x + q)$ where $p + q = b$ and $pq = c$.','When factoring fails, use $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.'],
  rule:'Discriminant $b^2 - 4ac$: positive gives 2 roots, zero gives 1, negative gives none that are real.',example:{q:'$x^2 - 5x + 6 = 0$',a:'$(x - 2)(x - 3) = 0$, so $x = 2$ or $3$'},trap:'Reading $x - 3$ as the root $-3$. The root is $+3$.'}}),
 C({id:'lines_functions',subtest:'math',area:'Algebra',title:'Lines, slope and functions',blurb:'Slope, $y = mx + b$, evaluating $f(x)$.',chapter:'m_lines',engine:'graphs',khan:['g9m_q1','genmath_functions','grc_limits'],after:['linear_equations'],tldr:{
  must:['$\\text{Slope} = \\text{rise} \\div \\text{run} = (y_2 - y_1) \\div (x_2 - x_1)$.','In $y = mx + b$, $m$ is the slope and $b$ is where the line crosses the $y$-axis.','Parallel lines share a slope. Perpendicular slopes multiply to $-1$.','To find $f(-3)$, put $(-3)$ in brackets wherever $x$ appears.'],
  rule:'$y - y_1 = m(x - x_1)$',example:{q:'Slope through $(1, 2)$ and $(4, 11)$?',a:'$(11 - 2) \\div (4 - 1) = 3$'},trap:'Squaring a negative without brackets: $(-3)^2 = 9$, not $-9$.'}}),
 C({id:'geometry',subtest:'math',area:'Geometry',title:'Geometry and measurement',blurb:'Areas, the Pythagorean theorem, circles, angles.',chapter:'m_geometry',khan:['g7m_q1','g8m_q2','g10m_q4'],tldr:{
  must:['$\\text{Triangle area} = \\frac{1}{2} \\times \\text{base} \\times \\text{height}$.','Right triangles: $a^2 + b^2 = c^2$, with $c$ the longest side.','Circle: area $\\pi r^2$, circumference $2\\pi r$. Halve a diameter first.','Interior angles of an $n$-sided polygon add to $(n - 2) \\times 180^\\circ$.'],
  rule:'Common right triangles: 3-4-5, 5-12-13, 8-15-17',example:{q:'Legs 6 and 8. Hypotenuse?',a:'$\\sqrt{36 + 64} = 10$'},trap:'Using the diameter as the radius.'}}),
 C({id:'trigonometry',subtest:'math',area:'Geometry',title:'Basic trigonometry',blurb:'SOH CAH TOA and special angles.',chapter:'m_trig',khan:['g9m_q4','grp_trig','precalc_trig'],after:['geometry'],tldr:{
  must:['$\\sin = \\text{opposite} \\div \\text{hypotenuse}$, $\\cos = \\text{adjacent} \\div \\text{hypotenuse}$, $\\tan = \\text{opposite} \\div \\text{adjacent}$.','Label sides from the angle you are using.','$\\sin 30^\\circ = \\frac{1}{2}$, $\\cos 60^\\circ = \\frac{1}{2}$, $\\tan 45^\\circ = 1$.','$\\sin^2\\theta + \\cos^2\\theta = 1$ for every angle.'],
  rule:'SOH CAH TOA',example:{q:'Hypotenuse 10, angle $30^\\circ$. Opposite side?',a:'$10 \\times \\sin 30^\\circ = 5$'},trap:'Labelling opposite and adjacent from the wrong angle.'}}),
 C({id:'sequences',subtest:'math',area:'Algebra',title:'Sequences and patterns',blurb:'Arithmetic and geometric sequences.',chapter:'m_sequences',khan:['g8m_q1','precalc_series'],tldr:{
  must:['Arithmetic: add the same difference $d$ each time.','$n$th term: $a_n = a_1 + (n - 1)d$.','Geometric: multiply by the same ratio $r$ each time.','Sum of an arithmetic sequence: $n \\times (\\text{first} + \\text{last}) \\div 2$.'],
  rule:'$a_n = a_1 + (n - 1)d$',example:{q:'$5, 9, 13, \\ldots$ 20th term?',a:'$5 + 19 \\times 4 = 81$'},trap:'Using $n$ instead of $n - 1$ steps.'}}),
 C({id:'statistics_probability',subtest:'math',area:'Data',title:'Statistics and probability',blurb:'Mean, median, counting, chance of events.',chapter:'m_probability',khan:['g7m_q3','g8m_q4','g9m_q4','statprob'],tldr:{
  must:['$\\text{Mean} = \\text{total} \\div \\text{count}$, so $\\text{total} = \\text{mean} \\times \\text{count}$.','Median is the middle value after sorting.','$P(\\text{event}) = \\text{favourable} \\div \\text{total}$, between 0 and 1.','“And” multiplies; “or” adds when the events cannot both happen.'],
  rule:'Without replacement, the second draw has one fewer item.',example:{q:'3 red, 2 blue. Two red, no replacement?',a:'$\\frac{3}{5} \\times \\frac{2}{4} = \\frac{3}{10}$'},trap:'Squaring the first probability as if the marble went back.'}}),
 C({id:'word_problems',subtest:'math',area:'Word problems',title:'Word problems: rate, work and money',blurb:'Speed, working together, interest, mixtures.',chapter:'m_word_problems',engine:'ratios',khan:['g7m_q1','g10m_q4','genmath_business'],after:['ratio_rate','linear_equations'],tldr:{
  must:['Write what you know with units before calculating.','$\\text{Average speed} = \\text{total distance} \\div \\text{total time}$, never the average of speeds.','Working together: add rates (jobs per hour), then flip.','Simple interest: $I = P \\times r \\times t$.'],
  rule:'$\\text{Together time} = \\frac{ab}{a + b}$',example:{q:'One pipe fills a tank in 3 h, another in 6 h. Together?',a:'$3 \\times 6 \\div 9 = 2$ hours'},trap:'Averaging the two times.'}}),
 // Science
 C({id:'matter_measurement',subtest:'science',area:'Physics',title:'Measurement, units and density',blurb:'Units, conversions, density.',chapter:'s_units',engine:'motion',khan:['phys1_q1'],tldr:{
  must:['Write units on every number; units tell you whether to multiply or divide.','$\\text{Density} = \\text{mass} \\div \\text{volume}$.','$1\\,\\mathrm{L} = 1000\\,\\mathrm{mL} = 1000\\,\\mathrm{cm}^{3}$.','Convert first, calculate second.'],
  rule:'$\\rho = m \\div V$',example:{q:'54 g in $20\\,\\mathrm{cm}^{3}$?',a:'$2.7\\,\\mathrm{g/cm^{3}}$'},trap:'Dividing volume by mass.'}}),
 C({id:'motion_forces',subtest:'science',area:'Physics',title:'Motion and forces',blurb:'Speed, acceleration, Newton’s laws, weight.',chapter:'s_motion',engine:'forces',khan:['phys1_q1'],after:['matter_measurement'],tldr:{
  must:['$\\text{Speed} = \\text{distance} \\div \\text{time}$.','$\\text{Acceleration} = \\text{change in velocity} \\div \\text{time} = (v - u) \\div t$.','$\\text{Net force} = \\text{mass} \\times \\text{acceleration}$. Use the net force, after friction.','Weight is a force: $W = mg$, with $g = 9.8\\,\\mathrm{m/s^{2}}$.'],
  rule:'$F_{\\text{net}} = ma$',example:{q:'10 kg crate, 50 N push, 20 N friction.',a:'$a = 30 \\div 10 = 3\\,\\mathrm{m/s^{2}}$'},trap:'Forgetting to subtract friction.'}}),
 C({id:'energy_heat',subtest:'science',area:'Physics',title:'Work, energy, power and heat',blurb:'KE, PE, work, power, specific heat.',chapter:'s_energy',khan:['phys1_q1','chem2_q1'],after:['motion_forces'],tldr:{
  must:['$\\text{Work} = \\text{force} \\times \\text{distance}$ (in the direction of the force).','Kinetic energy $= \\frac{1}{2}mv^2$. Potential energy $= mgh$.','$\\text{Power} = \\text{work} \\div \\text{time}$, in watts.','Heat $Q = mc\\Delta T$, with $\\Delta T$ the change in temperature.'],
  rule:'Energy is conserved: $\\text{PE lost} = \\text{KE gained}$ (no friction).',example:{q:'2 kg at 3 m/s. KE?',a:'$\\frac{1}{2} \\times 2 \\times 9 = 9\\,\\mathrm{J}$'},trap:'Forgetting to square the speed.'}}),
 C({id:'electricity_waves',subtest:'science',area:'Physics',title:'Electricity and waves',blurb:'Ohm’s law, circuits, wave speed.',chapter:'s_electricity',khan:['phys2_q3','phys1_q2'],tldr:{
  must:['$V = IR$: $\\text{voltage} = \\text{current} \\times \\text{resistance}$.','Series: resistances add. Parallel: $\\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2}$.','$\\text{Wave speed} = \\text{frequency} \\times \\text{wavelength}$.','Higher frequency means shorter wavelength at the same speed.'],
  rule:'$P = VI$ for electrical power',example:{q:'12 V across $4\\,\\Omega$?',a:'$I = 3\\,\\mathrm{A}$'},trap:'Multiplying $V$ and $R$ to get current.'}}),
 C({id:'gases',subtest:'science',area:'Chemistry',title:'Gas laws',blurb:'Boyle, Charles, and the ideal gas law.',chapter:'s_gases',khan:['chem1_q1','phys1_q2'],tldr:{
  must:['Boyle: at constant temperature, $P_1V_1 = P_2V_2$ (squeeze it, pressure rises).','Charles: at constant pressure, $\\frac{V_1}{T_1} = \\frac{V_2}{T_2}$ with $T$ in kelvin.','$\\text{Kelvin} = {}^{\\circ}\\mathrm{C} + 273$.','$PV = nRT$ combines them.'],
  rule:'Always use kelvin in gas laws.',example:{q:'6 L at 2 atm, pressure becomes 3 atm.',a:'$V = 2 \\times 6 \\div 3 = 4\\,\\mathrm{L}$'},trap:'Treating pressure and volume as if they rise together.'}}),
 C({id:'moles_formulas',subtest:'science',area:'Chemistry',title:'Formulas, moles and composition',blurb:'Counting atoms, molar mass, grams to moles.',chapter:'s_moles',engine:'moles',khan:['chem1_q1'],tldr:{
  must:['A subscript counts the atom before it; a subscript after brackets multiplies everything inside.','$\\text{Molar mass} = \\text{sum of atomic masses in the formula}$.','$\\text{Moles} = \\text{mass} \\div \\text{molar mass}$.','$\\text{Percent by mass} = \\text{element mass} \\div \\text{formula mass} \\times 100$.'],
  rule:'$n = m \\div M$',example:{q:'36 g of water (18 g/mol)?',a:'2 mol'},trap:'Ignoring a subscript: $\\mathrm{H_{2}O}$ is 18, not 17.'}}),
 C({id:'solutions_acids',subtest:'science',area:'Chemistry',title:'Solutions, acids and bases',blurb:'Molarity, pH, neutralisation.',chapter:'s_acids',khan:['chem2_q1','chem2_q2'],after:['moles_formulas'],tldr:{
  must:['$\\text{Molarity} = \\text{moles of solute} \\div \\text{litres of solution}$.','Convert mL to L by dividing by 1000.','$\\mathrm{pH} = -\\log[\\mathrm{H^{+}}]$. $[\\mathrm{H^{+}}] = 10^{-3}$ means pH 3.','pH below 7 is acidic, 7 is neutral, above 7 is basic.'],
  rule:'$\\mathrm{pH} + \\mathrm{pOH} = 14$ at $25\\,^{\\circ}\\mathrm{C}$',example:{q:'0.2 mol in 500 mL?',a:'$0.2 \\div 0.5 = 0.4\\,\\mathrm{M}$'},trap:'Forgetting to convert millilitres.'}}),
 C({id:'nuclear',subtest:'science',area:'Physics',title:'Radioactivity and half-life',blurb:'Decay, half-life, types of radiation.',chapter:'s_nuclear',khan:['phys2_q4'],tldr:{
  must:['Each half-life halves what is left.','$\\text{Number of half-lives} = \\text{time} \\div \\text{half-life}$.','Alpha is stopped by paper, beta by aluminium, gamma needs lead or concrete.','Decay is not steady subtraction.'],
  rule:'$N = N_0 \\times \\left(\\frac{1}{2}\\right)^{n}$',example:{q:'80 g, 3 half-lives?',a:'$80 \\to 40 \\to 20 \\to 10\\,\\mathrm{g}$'},trap:'Subtracting the same amount each half-life.'}}),
 C({id:'genetics',subtest:'science',area:'Biology',title:'Genetics and heredity',blurb:'Punnett squares, dominant and recessive traits.',chapter:'s_genetics',khan:['bio2_q3'],tldr:{
  must:['Each parent passes one allele for each gene.','Dominant ($A$) shows with $AA$ or $Aa$; recessive shows only with $aa$.','$Aa \\times Aa$ gives $1\\,AA : 2\\,Aa : 1\\,aa$, so $3 : 1$ dominant to recessive.','Genotype is the letters; phenotype is the visible trait.'],
  rule:'A $3 : 1$ ratio means $\\frac{3}{4}$ and $\\frac{1}{4}$.',example:{q:'$Aa \\times aa$, chance of recessive?',a:'$\\frac{1}{2}$'},trap:'Reading $3 : 1$ as one third.'}}),
 C({id:'cells_life',subtest:'science',area:'Biology',title:'Cells and life processes',blurb:'Cell parts, transport, photosynthesis, respiration.',chapter:'s_cells',khan:['bio1_q1','bio1_q2'],tldr:{
  must:['Mitochondria release energy in respiration; chloroplasts capture light in photosynthesis.','Photosynthesis: $\\mathrm{CO_{2}} + \\mathrm{H_{2}O} + \\text{light} \\to \\text{glucose} + \\mathrm{O_{2}}$. Respiration runs it the other way and releases energy.','Diffusion moves particles from high to low concentration; osmosis is water doing the same across a membrane.','Plant cells have a cell wall and chloroplasts; animal cells do not.'],
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
