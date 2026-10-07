/** Original focused study notes. Worked examples and self-checks are exposed support,
 * never fresh-check evidence. Subject/language review is still pending. */
import {EXPANDED_TOPIC_GUIDES} from './expanded-topic-guides.ts';
export type TopicGuide={idea:string;example:string;question:string;answer:string;trap:string};
export const TOPIC_GUIDES:Record<string,TopicGuide>={
 ...EXPANDED_TOPIC_GUIDES,
 "Operations with integers":{"idea":"Addition combines signed amounts. Subtraction adds the opposite. For multiplication and division, equal signs give a positive result and different signs give a negative result.","example":"$-4-(-7)=-4+7=3$. Subtracting a negative changes to adding its opposite.","question":"What is $(-3)\\times(-5)$?","answer":"$15$. Both factors are negative, so the product is positive.","trap":"The sign rules for products do not replace the number-line reasoning for addition."},
 "Direct and reported speech": {
  "idea": "Direct speech gives the speaker’s exact words in quotation marks. Reported speech retells the message; pronouns and time expressions must match the new speaker and time. A past reporting verb often shifts the tense back, but a still-true fact need not change.",
  "example": "Mia said, “I am ready.” Later, Ben reports: Mia said that she was ready. “I” becomes “she” because Ben is talking about Mia.",
  "question": "Report later: Ana said, “I will study tomorrow.”",
  "answer": "Ana said that she would study the next day.",
  "trap": "Changing commas alone does not turn direct speech into reported speech."
 },
 "Sequence of events": {
  "idea": "Build the timeline of what happened, rather than copying the order in which the writer mentions it. Words such as before, after, first and finally connect events.",
  "example": "“Before submitting her work, Jo checked it. Earlier, she had drafted it.” Timeline: draft, check, submit.",
  "question": "Order these events: “After planting, Eli watered the seed. First he dug a hole.”",
  "answer": "Dig the hole, plant the seed, water it.",
  "trap": "A flashback can appear later in a passage but happen earlier in time."
 },
 "Cause and effect": {
  "idea": "A cause explains why an event happens; an effect is the result. Look for a stated link such as because, therefore or as a result. Events happening in order do not by themselves prove causation.",
  "example": "“Because the road flooded, classes moved online.” Cause: flooded road. Effect: online classes.",
  "question": "Identify the cause: “The seedlings wilted because they received no water.”",
  "answer": "The seedlings received no water.",
  "trap": "Do not reverse the cause and effect or invent a reason the passage never gives."
 },
 "Simple derivatives and integrals": {
  "idea": "A derivative describes instantaneous change. An antiderivative reverses differentiation, and a definite integral measures signed accumulation. The two videos below introduce power-rule differentiation and antiderivatives separately.",
  "example": "For $f(x)=x^2$, the derivative is $2x$. Functions $x^2+5$ and $x^2-3$ have the same derivative because constants do not change.",
  "question": "What family of functions has derivative $3x^2$?",
  "answer": "$x^3+C$, where $C$ is any constant. Differentiate it to check.",
  "trap": "An indefinite integral is a family of functions; a definite integral over bounds is a number."
 },
 "Oscillation and damping": {
  "idea": "An oscillator moves around equilibrium. Damping removes mechanical energy, so the amplitude can shrink. The resonance video gives physical intuition; the characteristic-roots lesson gives the differential-equation method.",
  "example": "In $mx''+bx'+kx=0$, mass is $m$, damping is $b$ and spring stiffness is $k$. For positive coefficients, complex characteristic roots describe underdamped oscillations with a decaying envelope.",
  "question": "For $x''+2x'+5x=0$, what does the negative real part of its characteristic roots tell you?",
  "answer": "The oscillation envelope decays. The roots are $-1+2i$ and $-1-2i$.",
  "trap": "Damping changes both amplitude and frequency. Weak damping can leave the frequency close to the undamped value."
 },
 "Bias and privacy in data": {
  "idea": "Bias concerns systematic distortion in how data are collected, represented or used. Privacy concerns whether people can be identified and whether their information is handled appropriately. Treat these as two separate checks.",
  "example": "A voluntary online poll can underrepresent people with weak internet access. Removing names from its rows still may not protect privacy if exact birthdays and locations identify respondents.",
  "question": "Does removing names fix sampling bias?",
  "answer": "No. It changes one identifier, not who was included or left out.",
  "trap": "Anonymous-looking rows may still be identifiable when combined with other data."
 },
 "Synonyms and antonyms": {
  "idea": "Synonyms have similar meanings in a particular context. Antonyms express an opposite meaning. Match the sense and part of speech used in the sentence.",
  "example": "“The room was bright” can mean well lit. Its opposite here is dark, rather than unintelligent.",
  "question": "Give an antonym for “scarce” in “Water was scarce.”",
  "answer": "Abundant or plentiful.",
  "trap": "A word may be a synonym in one sense and a poor substitute in another."
 },
 "Spelling": {
  "idea": "Separate the base word from its ending and check the spelling change at the boundary. Keep a short list of words you repeatedly confuse.",
  "example": "“Study” becomes “studies”: a consonant before the final y usually changes to i before -es. “Play” becomes “plays” because a vowel comes before y.",
  "question": "Write the plural of “city” and “toy”.",
  "answer": "Cities and toys.",
  "trap": "Spelling patterns have exceptions; a pattern is a useful check, not a guarantee for every word."
 },
 "Active and passive voice": {
  "idea": "In active voice, the subject performs the action. In passive voice, the subject receives it, using a form of be and a past participle. Preserve the original tense when changing voice.",
  "example": "Active: “Lina checked the report.” Passive: “The report was checked by Lina.”",
  "question": "Change to active voice: “The plants were watered by Jo.”",
  "answer": "Jo watered the plants.",
  "trap": "A sentence with “was” is not automatically passive: “Jo was tired” does not describe an action done to Jo."
 },
 "Ng at nang, din at rin, at iba pang madalas mapagpalit": {
  "idea": "Gamitin ang “ng” sa layon o pagmamay-ari, at “nang” sa paglalarawan ng paraan ng kilos. Karaniwang ginagamit ang “rin” pagkatapos ng patinig o w/y, at “din” pagkatapos ng ibang katinig.",
  "example": "“Bumili ng aklat.” Layon ang aklat. “Bumasa nang malinaw.” Paraan ng pagbasa ang malinaw.",
  "question": "Punan: “Sumulat siya ___ maingat.”",
  "answer": "Nang, dahil inilalarawan nito kung paano siya sumulat.",
  "trap": "Alamin muna ang gamit sa pangungusap; hindi sapat ang magkaparehong tunog."
 },
 "Aspekto ng pandiwa": {
  "idea": "Ang aspekto ay tumutukoy kung natapos na, nagpapatuloy, o hindi pa nasisimulan ang kilos. Iugnay ang anyo ng pandiwa sa pahiwatig ng pangungusap.",
  "example": "Kumain: naganap. Kumakain: nagaganap. Kakain: magaganap.",
  "question": "Piliin: “Bukas, ___ kami ng almusal.”",
  "answer": "Kakain, dahil hindi pa nagsisimula ang kilos.",
  "trap": "Huwag piliin ang anyo batay lamang sa salitang-ugat; tingnan ang panahon ng kilos."
 },
 "Pokus ng pandiwa": {
  "idea": "Tingnan ang paksa na minamarkahan ng “ang” at ang kaugnayan nito sa kilos. Maaaring ang paksa ang gumagawa ng kilos o ang bagay na apektado nito.",
  "example": "“Bumili si Lea ng aklat.” Si Lea ang gumagawa. “Binili ni Lea ang aklat.” Ang aklat ang paksa at layon ng pagbili.",
  "question": "Sa “Niluto ni Ben ang isda,” alin ang paksa?",
  "answer": "Ang isda. Ito ang bagay na niluto.",
  "trap": "Hindi laging ang gumagawa ng kilos ang paksa."
 },
 "Panghalip": {
  "idea": "Pamalit sa pangngalan ang panghalip. Linawin kung sino o ano ang tinutukoy nito at kung isahan o maramihan ang kailangan.",
  "example": "“Dumating sina Lea at Ben. Sila ay maaga.” Ang “sila” ay tumutukoy sa dalawang tao.",
  "question": "Punan: “Dumating si Ana. ___ ay may dalang aklat.”",
  "answer": "Siya.",
  "trap": "Iwasan ang panghalip na maaaring tumukoy sa dalawang magkaibang tao."
 },
 "Pang-ugnay: pangatnig at pang-ukol": {
  "idea": "Nagdurugtong ng salita o sugnay ang pangatnig. Nag-uugnay naman sa pangngalan ang pang-ukol upang ipakita ang relasyon nito sa ibang bahagi.",
  "example": "“Nag-aral siya ngunit napagod.” Pangatnig ang ngunit. “Para sa guro ang liham.” Pang-ukol ang para sa.",
  "question": "Anong relasyon ang ipinapakita ng “dahil” sa “Lumiban siya dahil may sakit siya”?",
  "answer": "Dahilan ng pagliban.",
  "trap": "Piliin ang pang-ugnay na akma sa relasyon: dagdag, salungat, dahilan o layunin."
 },
 "Wastong baybay at bantas": {
  "idea": "Gamitin ang bantas upang linawin ang hangganan ng pangungusap at ang relasyon ng mga ideya. Malaking titik ang simula ng pangungusap at ang pangalang pantangi.",
  "example": "“Nasaan si Ana?” May malaking titik sa simula at sa pangalan, at tandang pananong sa hulihan.",
  "question": "Iwasto: “darating ba si lea”",
  "answer": "Darating ba si Lea?",
  "trap": "Huwag magdagdag ng kuwit sa pagitan ng paksa at panaguri nang walang dahilan."
 },
 "Kahulugan ayon sa konteksto": {
  "idea": "Basahin ang pangungusap at mga katabing pangungusap. Hanapin ang paliwanag, halimbawa o pagsalungat na nagbibigay ng pahiwatig sa kahulugan.",
  "example": "“Payapa ang dagat; walang malalaking alon.” Ipinapahiwatig ng ikalawang bahagi na kalmado ang payapa.",
  "question": "Ano ang “masinop” sa “Masinop siya: maayos ang gamit at walang nasasayang”?",
  "answer": "Maingat at maayos sa pag-aasikaso o paggamit.",
  "trap": "Maaaring mag-iba ang angkop na kahulugan ayon sa konteksto."
 },
 "Kasingkahulugan at kasalungat": {
  "idea": "Kasingkahulugan ang magkalapit ang ibig sabihin. Kasalungat ang kabaligtaran. Panatilihin ang diwa ng salita sa pangungusap.",
  "example": "Masaya at maligaya: kasingkahulugan. Masaya at malungkot: kasalungat.",
  "question": "Magbigay ng kasalungat ng “matipid” sa paggamit ng pera.",
  "answer": "Magastos.",
  "trap": "Hindi sapat na magkaugnay lamang ang dalawang salita; dapat magkapareho o magkasalungat ang diwa."
 },
 "Sawikain at idyoma": {
  "idea": "May kahulugang hindi literal ang sawikain. Basahin ang buong pahayag bago ipaliwanag ang ibig sabihin.",
  "example": "“Bukas ang palad” ay handang tumulong o magbigay. Hindi ito simpleng paglalarawan ng kamay.",
  "question": "Ano ang ibig sabihin ng “magaan ang loob” sa isang tao?",
  "answer": "Komportable o may tiwala sa taong iyon.",
  "trap": "Huwag isalin o ipaliwanag nang paisa-isang salita ang idyoma."
 },
 "Salawikain at tayutay": {
  "idea": "Naglalahad ng aral o karaniwang karunungan ang salawikain. Gumagamit ng malikhaing paghahambing o paglalarawan ang tayutay.",
  "example": "“Nasa Diyos ang awa, nasa tao ang gawa” ay salawikain. “Parang araw ang kaniyang ngiti” ay pagtutulad.",
  "question": "May salitang “parang” sa isang paghahambing. Anong tayutay ito?",
  "answer": "Pagtutulad.",
  "trap": "Hindi lahat ng matalinghagang pahayag ay salawikain."
 },
 "Speeches": {
  "idea": "Identify the audience, the speaker’s purpose and the evidence used to persuade. Separate the claim from the emotional or rhetorical language around it.",
  "example": "“Our school should collect rainwater because the garden uses treated water each day.” Claim: collect rainwater. Reason: reduce treated-water use.",
  "question": "Does applause prove that a speaker’s claim is correct?",
  "answer": "No. Audience response is different from evidence for the claim.",
  "trap": "A confident delivery can make a weak argument sound strong."
 },
 "Finding the error in a sentence": {
  "idea": "Read the full sentence for its meaning, then check one feature at a time: subject-verb agreement, tense, pronoun case, sentence boundaries and modifier placement.",
  "example": "“The box of pencils are on the desk.” The subject is box, so change are to is.",
  "question": "Correct: “Walking to class, the rain soaked Lia.”",
  "answer": "“Walking to class, Lia was soaked by the rain,” or “The rain soaked Lia as she walked to class.”",
  "trap": "The nearest noun is not always the subject, and a phrase should clearly describe the right person or thing."
 },
 "Word meaning from context clues": {
  "idea": "Replace the unfamiliar word with a simple phrase that fits the surrounding sentence. Look for contrast, explanation or an example before comparing choices.",
  "example": "“Unlike the noisy market, the library was tranquil.” The contrast suggests quiet or peaceful.",
  "question": "What does “fragile” mean in “Handle the fragile cup carefully; it breaks easily”?",
  "answer": "Easily broken.",
  "trap": "The most familiar dictionary meaning may not fit this sentence."
 },
 "Roots, prefixes and suffixes": {
  "idea": "Break the word into its meaningful parts, then test the likely meaning against the sentence. A prefix changes a base meaning; a suffix often changes its grammatical role.",
  "example": "“Reusable” combines re- (again), use and -able (capable of): able to be used again.",
  "question": "What does “careless” suggest?",
  "answer": "Without enough care.",
  "trap": "A root is a clue, not permission to ignore the surrounding sentence."
 },
 "Recursion and induction": {
  "idea": "Recursion defines a result using smaller instances. Induction proves a statement by checking a base case and showing that one case implies the next.",
  "example": "A countdown stops at zero; otherwise it prints its number and calls itself with one less. The stopping case prevents infinite recursion.",
  "question": "What two parts does an induction proof require?",
  "answer": "A base case and an induction step.",
  "trap": "Testing several examples is not a proof for every integer."
 },
 "Graphs and trees": {
  "idea": "A graph connects vertices with edges. A tree is a connected graph with no cycles, so there is exactly one simple path between any two vertices.",
  "example": "A triangle of three connected vertices has a cycle, so it is a graph but not a tree.",
  "question": "Can a disconnected graph be a tree?",
  "answer": "No. A tree must be connected.",
  "trap": "A graph in computing is not necessarily a coordinate plot."
 },
 "Collecting data ethically": {
  "idea": "Collect only information needed for the question, explain its use and protect respondents. Ethical collection and representative sampling are separate requirements.",
  "example": "A class transport survey can ask for travel-time ranges without collecting exact home addresses.",
  "question": "Would collecting fewer personal details automatically make a sample representative?",
  "answer": "No. You must still check who was invited and who responded.",
  "trap": "Useful data are not automatically appropriate to collect or publish."
 },
 "Reading a methods section": {
  "idea": "Identify the research question, participants, sampling procedure, measurements and analysis. Ask which conclusions the design can support.",
  "example": "A survey of one class can describe that class. Without an appropriate sample, it cannot establish the views of every student in the city.",
  "question": "An observational study finds an association. Does that alone establish causation?",
  "answer": "No. Other variables may explain the association.",
  "trap": "Do not read a causal claim into a design that only measures association."
 },
 "Assumptions and conditions": {
  "idea": "Before classical one-way ANOVA, check independent observations, reasonable within-group normality and comparable population variances. Consider the design and the residuals rather than only the group means.",
  "example": "Repeated measurements from the same student are related observations; treating them as independent groups violates that design requirement.",
  "question": "What should you check before comparing groups with ANOVA?",
  "answer": "Independence, distributional conditions and variance assumptions appropriate to the chosen model.",
  "trap": "A large sample does not repair a study design that treats dependent observations as independent."
 },
 "Following up a significant result": {
  "idea": "A significant omnibus ANOVA indicates that not all population means are equal. It does not identify which groups differ. Use planned contrasts or an appropriate multiple-comparison method.",
  "example": "With three groups, a significant F test could arise from one group differing from the other two. It need not mean every pair differs.",
  "question": "Why not run many unadjusted pairwise tests after ANOVA?",
  "answer": "Doing so increases the chance of at least one false positive.",
  "trap": "An omnibus result is not a list of significant pairwise differences."
 },
 "Drawing and animating with code": {
  "idea": "Draw each frame from the current state, then update the state for the next frame. Keep drawing separate from position or velocity updates.",
  "example": "A circle moves when its horizontal position increases each frame. A static circle call without changing position draws the same frame repeatedly.",
  "question": "What must change between frames to make an object move?",
  "answer": "A state variable used in its drawing, such as position.",
  "trap": "Drawing an object many times is not animation if its state never changes."
 },
 "Variables and functions": {
  "idea": "A variable names a value; a function groups reusable steps and can receive inputs. Distinguish a returned value from a value that is merely printed.",
  "example": "A function that receives a price and returns twice that price lets other code use the result. Printing the result only shows it.",
  "question": "Why pass an input instead of hard-coding one value in a function?",
  "answer": "The function can work for different values and is easier to test.",
  "trap": "Printing a value is not the same as returning it."
 },
 "Logic and if statements": {
  "idea": "A condition selects a branch according to whether it is true or false. Trace the condition using the actual values before deciding which branch runs.",
  "example": "If a score is at least the required threshold, show “Passed”; otherwise show “Try again.”",
  "question": "If the threshold is 60 and the score is 60, does “at least” include it?",
  "answer": "Yes. Equality is included.",
  "trap": "An assignment changes a value; a comparison asks a question about values."
 },
 "Loops and arrays": {
  "idea": "An array stores an ordered collection. A loop processes its elements or repeats an action. Check the first and last valid index.",
  "example": "A three-element array has indices zero, one and two. A loop that accesses index three goes past the end.",
  "question": "How many valid indices does an array of five elements have?",
  "answer": "Five, numbered zero through four.",
  "trap": "Confusing the number of elements with the last valid index causes boundary errors."
 },
 "Objects and object-oriented design": {
  "idea": "An object keeps related data and behavior together. Decide what belongs to each instance and what behavior operates on that state.",
  "example": "Two student objects can share the same methods while holding different names and scores.",
  "question": "Should changing one student’s score also change another student’s score?",
  "answer": "No, if scores are instance data.",
  "trap": "Shared mutable data can accidentally make separate objects affect each other."
 },
 "Inheritance and polymorphism": {
  "idea": "Inheritance expresses an is-a relationship. Polymorphism lets different object types respond to the same operation in their own ways. Prefer composition when the relationship is has-a.",
  "example": "Circle and rectangle objects can each provide an area operation. The caller can ask for area without knowing the calculation used by each shape.",
  "question": "Is “a car has an engine” a reason for Car to inherit from Engine?",
  "answer": "No. That is a composition relationship.",
  "trap": "Reusing code alone is not a sufficient reason for an inheritance hierarchy."
 },
 "Linear and binary search": {
  "idea": "Linear search checks candidates in order. Binary search repeatedly halves an ordered search range; it depends on sorted data.",
  "example": "To find a name in an unsorted list, linear search works directly. Binary search first needs an order that lets you discard one half safely.",
  "question": "Can binary search reliably search an arbitrary unsorted list?",
  "answer": "No. Its elimination step assumes an ordering.",
  "trap": "A faster algorithm is only correct when its prerequisites hold."
 },
 "Selection, insertion, merge and quick sort": {
  "idea": "Compare how each algorithm moves values: select a minimum, insert into an ordered prefix, merge sorted halves, or partition around a pivot. Track the intermediate invariant.",
  "example": "Insertion sort keeps the processed prefix sorted. Each new element is inserted into the correct place in that prefix.",
  "question": "What makes merge sort’s merge step work?",
  "answer": "Both input halves are already sorted.",
  "trap": "Quicksort does not always split into equal halves; poor partitions can harm performance."
 },
 "Recursion": {
  "idea": "A recursive function solves a problem by reducing it to a smaller version. It needs a reachable base case and progress toward it.",
  "example": "A recursive sum removes one item from the list on each call and stops at an empty list.",
  "question": "What happens if the recursive call uses exactly the same input forever?",
  "answer": "It never reaches a smaller problem or base case and can exhaust the call stack.",
  "trap": "Writing a base case is not enough if no execution path reaches it."
 },
 "Graphs and breadth-first search": {
  "idea": "Breadth-first search explores vertices in layers using a queue. Mark vertices as discovered when enqueuing them to avoid repeated work.",
  "example": "From a start vertex, visit its neighbors before vertices two edges away. In an unweighted graph, these layers give shortest path lengths.",
  "question": "Does ordinary BFS find minimum-cost paths when edges have unequal costs?",
  "answer": "Not in general. It minimizes the number of edges in an unweighted graph.",
  "trap": "A queue and a stack explore the graph in different orders."
 },
 "Tables, rows and keys": {
  "idea": "A table represents one kind of entity, a row one record, and a column one attribute. A primary key uniquely identifies a row; a foreign key links it to another table.",
  "example": "A Student table can use student_id as its primary key. An Enrollment row can refer to that student_id.",
  "question": "Is a student’s name always a safe primary key?",
  "answer": "No. Names may repeat or change.",
  "trap": "A key must identify the record, not simply look distinctive in a small sample."
 },
 "Querying with SELECT and WHERE": {
  "idea": "SELECT chooses the columns to return. WHERE filters rows before they are returned. Read the condition carefully and distinguish exact matches from ranges.",
  "example": "SELECT name FROM students WHERE year = 1 returns names of first-year students, rather than changing their records.",
  "question": "Which clause limits the returned rows to a condition?",
  "answer": "WHERE.",
  "trap": "A SELECT query reads data; UPDATE changes it."
 },
 "Aggregating and grouping": {
  "idea": "Aggregation summarizes rows. GROUP BY determines which rows share one result, and HAVING filters the resulting groups.",
  "example": "Grouping enrollments by course and counting rows produces one count for each course.",
  "question": "Would counting enrollment rows always count distinct students?",
  "answer": "No. A student can have multiple enrollment rows.",
  "trap": "Count the entity the question asks about, not merely the rows available."
 },
 "Joining related tables": {
  "idea": "A join combines rows using a relationship such as a foreign key. Check how many matches each row can have, because joins can multiply rows.",
  "example": "Joining Student to Enrollment produces one row per matching enrollment, not necessarily one row per student.",
  "question": "What does a LEFT JOIN preserve from its left table?",
  "answer": "All left-table rows, including ones without a match on the right.",
  "trap": "A join without the right condition can create every possible row pairing."
 },
 "Changing data safely": {
  "idea": "Preview the intended rows before UPDATE or DELETE. Use a precise condition and a transaction when several changes must succeed together.",
  "example": "Before deleting a duplicate record by its key, SELECT that key and inspect the exact row.",
  "question": "Why is an UPDATE without WHERE dangerous?",
  "answer": "It can modify every row in the table.",
  "trap": "A correct new value does not make a change safe if it targets the wrong rows."
 },
 "Designing a database": {
  "idea": "Separate entities and relationships into tables with stable keys. Store each fact where it belongs, then use constraints to protect relationships.",
  "example": "Student names belong in Student; course titles belong in Course; Enrollment connects the two.",
  "question": "Why avoid repeating the course title in every enrollment record?",
  "answer": "Repeated facts can become inconsistent when only some copies are updated.",
  "trap": "Splitting tables without defining their relationships makes data harder to use."
 },
 "Cleaning and filtering data": {
  "idea": "Check types, missing values, duplicate records and invalid ranges before analysis. Keep an untouched source and document each transformation.",
  "example": "A blank response is missing, not a score of zero. Replacing all blanks with zero would change a class average.",
  "question": "Should a missing temperature automatically be replaced with zero?",
  "answer": "No. Zero is a real measured value and needs a justified reason.",
  "trap": "Convenient cleaning choices can silently change the question being answered."
 },
 "Summarising and visualising": {
  "idea": "Choose a summary and chart that match the variable and question. Check units, axes and distribution shape before interpreting the picture.",
  "example": "A median can describe a highly skewed travel-time distribution without being pulled as strongly by a few very long trips.",
  "question": "Why inspect the whole distribution instead of only its mean?",
  "answer": "The mean hides spread, outliers and distinct groups.",
  "trap": "A chart with a truncated axis can make a small difference look large."
 },
 "Drawing conclusions from data": {
  "idea": "Connect the conclusion to the question, sample and study design. Describe uncertainty and separate association from causation.",
  "example": "Students who study longer may score higher, but an observational dataset alone cannot prove that adding an hour causes a specific score increase.",
  "question": "Can an association in one small class be generalized to every student?",
  "answer": "Not without a suitable sampling design and evidence supporting that generalization.",
  "trap": "A pattern in a dataset is not automatically a causal or universal rule."
 },
 "Vectors and forces in code": {
  "idea": "Represent a vector with components. Update velocity using acceleration, then position using velocity, consistently with the simulation time step.",
  "example": "For the same acceleration, doubling the simulated time step doubles the velocity change per step in a simple Euler update.",
  "question": "Should a force update position directly without accounting for velocity and time?",
  "answer": "No. A physical model needs the relationship among force, acceleration, velocity and position.",
  "trap": "Ignoring time-step size makes motion depend on frame rate."
 },
 "Randomness and noise": {
  "idea": "Random draws can produce independent changes; coherent noise produces smoothly related values. Choose based on the behavior the model needs.",
  "example": "Independent random positions jump abruptly. Noise sampled along a path can vary gradually, useful for a drifting animation.",
  "question": "Does “random” mean a simulation has no repeatable structure?",
  "answer": "No. A seeded generator can repeat the same sequence of draws.",
  "trap": "A visually smooth random-looking motion is not the same as independent randomness."
 },
 "Simulation as a scientific tool": {
  "idea": "A simulation explores the consequences of stated rules and assumptions. Compare its predictions with observations and test sensitivity to parameter choices.",
  "example": "A population model can test how growth changes with a carrying-capacity parameter. It does not prove that the chosen parameter matches a real habitat.",
  "question": "Does a realistic-looking animation validate its physical model?",
  "answer": "No. Validation needs comparisons with appropriate observations or known behavior.",
  "trap": "Visual plausibility is different from scientific accuracy."
 },
 "Bacterial growth and genetics": {
  "idea": "A doubling model assumes a fixed generation time and favorable conditions. Real growth can slow as resources are depleted. Genetic variation can come from mutations and gene transfer.",
  "example": "Under an ideal doubling assumption, a population of 100 becomes 200, then 400 over two generations.",
  "question": "Will the population keep doubling forever in a closed container?",
  "answer": "No. Nutrients and space become limited and waste accumulates.",
  "trap": "An exponential model is an assumption over a useful interval, not an unlimited prediction."
 }
};
