import {TEAM,DRAFTED,type Chapter} from './types.ts';

const ids=(prefix:string,n:number[])=>n.map(i=>`${prefix}_${String(i).padStart(2,'0')}`);

export const VERBAL_CHAPTERS:Chapter[]=[
 {id:'l_agreement',subtest:'language',concept:'grammar_agreement',title:'Subject-verb agreement',author:TEAM,reviewer:'',status:'draft',createdAt:DRAFTED,
  summary:{intro:'Agreement questions look easy and cost points because the sentence is built to distract you. The whole skill is finding the real subject before looking at the verb.',
   sections:[
    {heading:'Find the real subject',body:['Cross out phrases that start with a preposition (of, in, with, along with, as well as). The subject is never inside them.','“The box of pencils IS on the desk.” Cross out “of pencils”: the box is.']},
    {heading:'Words that are always singular',body:['Each, every, either, neither, one, anyone, everybody, someone, nobody take singular verbs.','“Each of the students HAS a locker.”','Subjects that end in -s but name one thing are singular: mathematics, news, physics, the Philippines.']},
    {heading:'Or and nor',body:['With “either … or” and “neither … nor”, the verb agrees with the nearer subject.','“Neither the coach nor the players ARE ready.” “Neither the players nor the coach IS ready.”']},
    {heading:'Collective nouns',body:['Team, class, family, committee: singular when the group acts as one, plural when the members act separately.','“The class IS on a field trip.” “The class ARE arguing among themselves” (members acting separately).']},
    {heading:'There is, there are',body:['The subject comes after the verb. “There ARE three answers.” “There IS a pen and two notebooks” (formal usage follows the first item).']}
   ]},
  examples:[
   {level:'Warm-up',q:'The price of the books (is / are) high.',steps:['Cross out “of the books”.','The subject is “price”, singular.'],answer:'is'},
   {level:'Exam level',q:'Either my parents or my sister (drive / drives) me to school.',steps:['“Either … or” agrees with the nearer subject.','“Sister” is singular.'],answer:'drives'},
   {level:'Stretch',q:'The number of applicants (has / have) doubled, and a number of them (was / were) from Mindanao.',steps:['“The number” is one number: singular.','“A number of” means “many”: plural.'],answer:'has, were'}
  ],
  traps:[{label:'Matching the nearest noun',fix:'Cross out the prepositional phrase and look again.'},{label:'Treating “each” or “one” as plural',fix:'These words are always singular.'},{label:'Ignoring “or” and “nor”',fix:'The nearer subject decides the verb.'}],
  tip:'Read the sentence with the phrase removed, out loud in your head. “The list … are posted” sounds wrong at once.',
  practice:{items:ids('lang_sva',[1,2,3,4,5,6,7,8])},
  recall:[{front:'Is “everyone” singular or plural?',back:'Singular: everyone is.'},{front:'Neither A nor B: verb agrees with?',back:'The nearer subject, B.'},{front:'“The number of” vs “a number of”',back:'Singular vs plural.'},{front:'Is “mathematics” singular?',back:'Yes: mathematics is.'}],
  hard:{text:'Review sentence structure first so you can spot the subject quickly.',concepts:['sentence_structure']}},
 {id:'l_vocabulary',subtest:'language',concept:'vocabulary_context',title:'Vocabulary in context',author:TEAM,reviewer:'',status:'draft',createdAt:DRAFTED,
  summary:{intro:'You cannot memorise every word, but you can learn to read the sentence around one. Most vocabulary questions give you the clue; the skill is noticing it.',
   sections:[
    {heading:'Signal words',body:['Contrast: but, however, although, despite, yet. The unknown word is the opposite of something nearby.','Cause and result: because, so, therefore, as a result. The word fits the cause or effect.','Restatement: that is, in other words, a colon or a dash-free appositive. The meaning is spelled out next to the word.']},
    {heading:'Word parts',body:['Prefixes: bene- (good), mal- (bad), ambi- (both), omni- (all), pre- (before), sub- (under), trans- (across).','Roots: chron (time), dict (say), spec (look), port (carry), scrib (write).','Suffixes: -less (without), -ous (full of), -ify (make).']},
    {heading:'Test every choice',body:['Replace the word with each choice and reread. The right one keeps the sentence’s meaning and tone.','Beware the most common meaning of a word with several: “dense” can mean thick, closely packed, or slow to understand.']}
   ]},
  examples:[
   {level:'Warm-up',q:'“Though usually garrulous, Lito said nothing at dinner.” Garrulous means',steps:['“Though” signals contrast with “said nothing”.'],answer:'very talkative'},
   {level:'Exam level',q:'“The new rule was so ambiguous that teachers read it in three different ways.” Ambiguous means',steps:['Three readings means more than one meaning.'],answer:'unclear; open to more than one meaning'},
   {level:'Stretch',q:'“Her benevolent donation paid for the entire library.” Using word parts, benevolent means',steps:['bene- means good; vol relates to wishing.'],answer:'kind and generous'}
  ],
  traps:[{label:'Choosing the meaning you know best',fix:'Pick the meaning that fits this sentence.'},{label:'Ignoring the signal word',fix:'Circle but, despite, because and so before you choose.'}],
  tip:'Before looking at the choices, put your own simple word in the blank. Then pick the choice closest to yours. The choices are designed to pull you toward near-misses.',
  practice:{items:ids('lang_vocab',[1,2,3,4,5,6,7,8,9])},
  recall:[{front:'bene- means',back:'good'},{front:'mal- means',back:'bad'},{front:'Contrast signal words',back:'but, however, although, despite, yet'},{front:'ephemeral',back:'lasting a very short time'},{front:'meticulous',back:'very careful and precise'}],
  hard:{text:'Reading passages for meaning trains the same skill.',concepts:['vocabulary_in_context']}},
 {id:'l_filipino',subtest:'language',concept:'filipino_gramatika',title:'Gramatikang Filipino',author:TEAM,reviewer:'',status:'draft',createdAt:DRAFTED,
  summary:{intro:'Maraming tanong sa Filipino ang umiikot sa ilang tuntuning madalas malimutan sa pang-araw-araw na pananalita: ng at nang, din at rin, at ang aspekto at pokus ng pandiwa.',
   sections:[
    {heading:'Ng at nang',body:['“Ng” ang pananda ng layon o pagmamay-ari: bumili ng aklat, bahay ng lola.','“Nang” ang ginagamit sa paraan (tumakbo nang mabilis), sa dahilan o layunin, sa “noong” (nang dumating siya), at sa pag-uulit ng pandiwa (lakad nang lakad).']},
    {heading:'Din at rin, daw at raw',body:['Rin, raw, rito, roon: pagkatapos ng salitang nagtatapos sa patinig o malapatinig na w at y. “Ako rin.” “Kami raw.”','Din, daw, dito, doon: pagkatapos ng katinig. “Aalis din.” “Sinabi niya daw” ay mali; “Sinabi niya raw” ang wasto dahil nagtatapos sa patinig ang “niya”.']},
    {heading:'Aspekto ng pandiwa',body:['Perpektibo (naganap na): kumain, nagluto.','Imperpektibo (nagaganap o paulit-ulit): kumakain, nagluluto.','Kontemplatibo (magaganap pa): kakain, magluluto.']},
    {heading:'Pokus ng pandiwa',body:['Tinutukoy ng pokus kung aling bahagi ng pangungusap ang paksa (may “ang” o “si”).','Aktor: Bumili si Ana ng aklat. Layon: Binili ni Ana ang aklat. Ganapan: Binilhan ni Ana ng aklat ang tindahan. Tagatanggap: Ibinili ni Ana ng aklat ang kapatid niya.']}
   ]},
  examples:[
   {level:'Warm-up',q:'Nag-aral siya ___ mabuti. (ng / nang)',steps:['Paraan ng pag-aaral ang “mabuti”.'],answer:'nang'},
   {level:'Exam level',q:'Pupunta ___ kami sa plasa. (din / rin)',steps:['Nagtatapos sa patinig ang “pupunta”.'],answer:'rin'},
   {level:'Stretch',q:'Anong pokus: “Pinagsulatan ni Carlo ng liham ang papel na ito.”',steps:['Ang paksa (“ang papel na ito”) ay kung saan ginawa ang kilos.'],answer:'Pokus sa ganapan'}
  ],
  traps:[{label:'“Ng” sa paraan ng kilos',fix:'Kung paano ginawa, “nang” ang gamitin.'},{label:'“Din” pagkatapos ng patinig',fix:'Tingnan ang huling titik ng naunang salita.'},{label:'Paghalo ng aspekto',fix:'Hanapin ang salitang nagsasaad ng panahon: kahapon, ngayon, bukas.'}],
  tip:'Basahin nang malakas sa isip ang pangungusap. Kadalasan, ang tamang sagot ang mas natural pakinggan kapag sinunod ang tuntunin, hindi ang nakasanayang pananalita.',
  practice:{items:ids('lang_fil',[1,2,3,4,5,6,7,8])},
  recall:[{front:'Paraan ng kilos: ng o nang?',back:'nang'},{front:'Pagkatapos ng patinig: din o rin?',back:'rin'},{front:'Kontemplatibo ng “kain”',back:'kakain'},{front:'Pokus kapag ang layon ang paksa',back:'Pokus sa layon'}],
  hard:{text:'Balikan ang talasalitaan at pagbasa sa Filipino para masanay sa tamang anyo.',concepts:['filipino_talasalitaan']}},
 {id:'r_main_idea',subtest:'reading',concept:'main_idea',title:'Finding the main idea',author:TEAM,reviewer:'',status:'draft',createdAt:DRAFTED,
  summary:{intro:'Main idea questions ask for the one sentence the author would want you to remember. The trap choices are true details, or ideas too big or too small for the passage.',
   sections:[
    {heading:'Where it lives',body:['Often in the first or last paragraph, but not always. Read the first sentence of each paragraph to see the direction.','If the passage turns with “however” or “but”, the main idea often follows the turn.']},
    {heading:'Too broad, too narrow, just right',body:['Too narrow: a true detail from one paragraph.','Too broad: a claim about a whole topic the passage never covers.','Just right: covers every paragraph without adding anything.']},
    {heading:'A two-step method',body:['Write a six-word summary of each paragraph in your head.','Join them into one sentence. Then find the choice that matches it.']}
   ]},
  examples:[
   {level:'Warm-up',q:'A passage explains what mangroves do and why replanting sometimes fails. Which choice is just right?',steps:['It covers benefits AND restoration conditions.'],answer:'“Mangroves protect coasts, but restoration needs the right conditions.”'},
   {level:'Exam level',q:'Why is “Mangrove roots look like table legs” wrong as a main idea?',steps:['It is true, but it describes one sentence of one paragraph.'],answer:'Too narrow'},
   {level:'Stretch',q:'A passage lists benefits of solar power, then its problems, then says training matters most. What is the main idea?',steps:['The last paragraph gives the author’s conclusion, and the others lead up to it.'],answer:'Solar projects succeed when communities can maintain them.'}
  ],
  traps:[{label:'Picking a vivid detail',fix:'Ask whether it covers every paragraph.'},{label:'Picking a claim bigger than the passage',fix:'The answer should not need outside knowledge.'}],
  tip:'Read the questions for a passage before the passage itself, but only the stems, not the choices. You will know what to look for without being misled by the wrong options.',
  practice:{items:['read_mangroves_1','read_sleep_1','read_barangay_1','read_solar_1','read_bayanihan_1','read_wika_1']},
  recall:[{front:'Too narrow means',back:'A true detail, not the whole passage'},{front:'Where does the main idea often appear?',back:'First or last paragraph, or after a turn like “however”'},{front:'Two-step method',back:'Summarise each paragraph, then join them'}],
  hard:{text:'Practise finding stated details first; main ideas are built from them.',concepts:['details']}},
 {id:'r_inference',subtest:'reading',concept:'inference',title:'Making inferences',author:TEAM,reviewer:'',status:'draft',createdAt:DRAFTED,
  summary:{intro:'An inference is a conclusion the passage supports but does not state. The right answer is the safest conclusion from the clues, not the most interesting one.',
   sections:[
    {heading:'Clues first',body:['Collect two or three clues before deciding. In fiction, clues are actions, small details and what a character does not say.','In non-fiction, clues are the author’s word choices and what the evidence would predict.']},
    {heading:'Safe, not bold',body:['Reject choices that go further than the text: “always”, “never”, “all” are warning signs.','A correct inference could be defended by pointing to specific lines.']},
    {heading:'Apply to a new case',body:['Some questions ask what the author would think of a new situation. Find the author’s rule in the passage, then apply it.']}
   ]},
  examples:[
   {level:'Warm-up',q:'“She held the folder against her chest with both arms.” What does this suggest?',steps:['Holding tightly with both arms is a nervous gesture.'],answer:'She is nervous.'},
   {level:'Exam level',q:'The author says replanting works where mangroves grew before. Which project would the author expect to fail?',steps:['Find the rule: right zone, restored tides.','Apply it: a mudflat that never had mangroves breaks the rule.'],answer:'Planting on a mudflat that never had mangroves.'},
   {level:'Stretch',q:'A driver “found that he was smiling” after a passenger left. What changed?',steps:['He did not plan to smile, so the feeling surprised him.','He looks forward to “tomorrow’s corner”.'],answer:'He has come to care about the new passenger.'}
  ],
  traps:[{label:'Possible but unsupported',fix:'Point to the line. If you cannot, reject it.'},{label:'Extreme words',fix:'Be suspicious of always, never and all.'}],
  tip:'If two choices both seem right, the one that says less is usually the answer. Inference questions reward caution.',
  practice:{items:['read_mangroves_3','read_sleep_3','read_jeepney_1','read_jeepney_3','read_barangay_3','read_solar_3','read_bayanihan_3','read_wika_3']},
  recall:[{front:'Test for a good inference',back:'Can you point to the lines that support it?'},{front:'Warning words',back:'always, never, all, only'},{front:'Applying the author’s view',back:'Find the rule, then apply it to the new case'}],
  hard:{text:'Get comfortable finding stated details first.',concepts:['details','main_idea']}},
 {id:'r_purpose',subtest:'reading',concept:'author_purpose',title:'Author’s purpose, tone and structure',author:TEAM,reviewer:'',status:'draft',createdAt:DRAFTED,
  summary:{intro:'These questions ask not what the passage says but why it says it and how it is built. Every paragraph and many sentences have a job.',
   sections:[
    {heading:'Purpose',body:['Inform, persuade, entertain, describe, or explain a process.','A detail can be there as evidence, an example, a contrast, a concession to the other side, or a limit on a claim.']},
    {heading:'Tone',body:['Tone is the author’s attitude: objective, cautious, critical, hopeful, nostalgic, urgent.','Look for loaded words and hedges (“may”, “suggests”, “difficult to prove”).']},
    {heading:'Structure',body:['Common patterns: cause and effect, problem and solution, compare and contrast, chronological, claim and evidence.','Signal words reveal the pattern: “as a result”, “however”, “first”, “similarly”.']}
   ]},
  examples:[
   {level:'Warm-up',q:'Why would an author mention studies of villages after typhoons in a passage about mangroves?',steps:['The studies support the claim that mangroves reduce flooding.'],answer:'As evidence'},
   {level:'Exam level',q:'An author writes that a link is “widely taught” but “difficult to prove”. The tone is',steps:['The author neither accepts nor rejects the idea.'],answer:'cautious'},
   {level:'Stretch',q:'A passage gives benefits, then problems, then a conclusion about what makes projects succeed. The structure is',steps:['It weighs two sides and then resolves them.'],answer:'benefits, drawbacks, then a conclusion'}
  ],
  traps:[{label:'Confusing what it says with why it is there',fix:'Name the paragraph’s job in three words.'},{label:'Picking an extreme tone',fix:'Most exam passages are measured, not angry or ecstatic.'}],
  tip:'For “why does the author mention” questions, reread the sentence right before and right after. The job of a detail is almost always defined by its neighbours.',
  practice:{items:['read_mangroves_5','read_sleep_5','read_jeepney_5','read_barangay_5','read_solar_5','read_bayanihan_5','read_wika_5']},
  recall:[{front:'Four purposes',back:'Inform, persuade, entertain, describe'},{front:'Jobs a detail can do',back:'Evidence, example, contrast, concession, limit'},{front:'Hedge words signal',back:'A cautious tone'}],
  hard:{text:'Main idea comes first; purpose builds on it.',concepts:['main_idea']}}
];
