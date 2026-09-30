import type {MockItem} from '../../lib/mock/types.ts';

/** Language Proficiency items, written by Khanpanion for practice. Original items;
 *  none reproduces or reconstructs a real exam item. Every item stays "draft" until
 *  a named team reviewer signs it off, and Filipino items need the team's Filipino
 *  reviewer before they may enter an official form. */
const CHAPTER:Record<string,string>={grammar_agreement:'l_agreement',grammar_verbs:'l_verbs',vocabulary_context:'l_vocabulary',sentence_structure:'l_sentences',usage:'l_usage',filipino_gramatika:'l_filipino',filipino_talasalitaan:'l_filipino_vocab'};
type Row=[string,string];
function L(id:string,concept:string,stem:string,rows:Row[],answerIndex:number,difficulty:1|2|3,lang:'en'|'fil'='en'):MockItem{
 if(rows.length!==4)throw Error(`${id} needs four choices`);
 return {id:`lang_${id}`,source:'authored',subtest:'language',lang,stem,choices:rows.map(r=>r[0]),rationales:rows.map(r=>r[1]),answerIndex,solutionSteps:[rows[answerIndex][1]],misconceptions:rows.map(()=>null),skill:concept,concept,difficulty,reviewerChapter:CHAPTER[concept],status:'draft',author:'Khanpanion team',reviewer:'',createdAt:'2026-09-30'};
}

export const LANGUAGE_ITEMS:MockItem[]=[
 // Subject-verb agreement
 L('sva_01','grammar_agreement','Choose the correct verb: “The list of requirements ____ posted outside the registrar’s office.”',[
  ['is','Correct. The subject is “list”, which is singular. “Of requirements” only describes it.'],
  ['are','Tempting because “requirements” sits right before the verb, but it is inside the phrase “of requirements”, not the subject.'],
  ['were','Plural and past. The subject “list” is singular.'],
  ['have been','Plural helping verb. “List” needs “has been” if you want the perfect tense.']],0,1),
 L('sva_02','grammar_agreement','Choose the correct verb: “Neither the teacher nor the students ____ aware of the change in schedule.”',[
  ['was','Tempting because “neither” feels singular, but with “neither … nor” the verb agrees with the nearer subject.'],
  ['were','Correct. With “neither … nor”, the verb agrees with the subject closer to it: “students”, which is plural.'],
  ['is','Singular and present. The nearer subject “students” is plural.'],
  ['has been','Singular. The nearer subject “students” needs a plural verb.']],1,2),
 L('sva_03','grammar_agreement','Choose the correct verb: “Each of the barangay captains ____ a copy of the ordinance.”',[
  ['receive','Tempting because “captains” is plural, but the subject is “each”.'],
  ['have received','Plural. “Each” takes a singular verb.'],
  ['receives','Correct. “Each” is singular, so the verb is singular.'],
  ['are receiving','Plural. “Each” is singular.']],2,1),
 L('sva_04','grammar_agreement','Choose the correct verb: “Mathematics ____ my favorite subject since Grade 7.”',[
  ['have been','Tempting because the word ends in -s, but “mathematics” is the name of one subject.'],
  ['are','Plural. “Mathematics” is singular in meaning.'],
  ['were','Plural and it does not fit “since Grade 7”, which needs the present perfect.'],
  ['has been','Correct. “Mathematics” is singular, and “since Grade 7” calls for the present perfect.']],3,2),
 L('sva_05','grammar_agreement','Choose the correct verb: “The team ____ arguing among themselves about who should present first.”',[
  ['is','Tempting when “team” acts as one unit, but here the members act separately, shown by “among themselves”.'],
  ['are','Correct. When members of a group act as individuals, the collective noun takes a plural verb.'],
  ['was','Singular. “Among themselves” shows the members act separately.'],
  ['has been','Singular. The members are acting as individuals.']],1,3),
 L('sva_06','grammar_agreement','Choose the correct verb: “There ____ a pen and two notebooks on the desk.”',[
  ['is','Correct in standard formal usage. With “there is/are”, the verb agrees with the first item in the list, here “a pen”.'],
  ['are','Tempting because the list has three things in total. Formal usage matches the first item after the verb.'],
  ['be','Not a finite verb form here.'],
  ['were','Plural and past. The sentence is in the present.']],0,3),
 L('sva_07','grammar_agreement','Which sentence is correct?',[
  ['One of my classmates live in Tondo.','“Live” agrees with “classmates”, but the subject is “one”.'],
  ['One of my classmates lives in Tondo.','Correct. The subject is “one”, which is singular.'],
  ['One of my classmates are living in Tondo.','Plural verb. The subject “one” is singular.'],
  ['One of my classmates have lived in Tondo.','Plural helping verb. The subject “one” needs “has lived”.']],1,1),
 L('sva_08','grammar_agreement','Choose the correct pronoun: “Every student should bring ____ own calculator.”',[
  ['their','Accepted in everyday English as a singular “they”, but formal grammar exams usually pair “every student” with “his or her”.'],
  ['his or her','Correct for formal usage. “Every student” is singular.'],
  ['its','“Its” refers to things, not people.'],
  ['our','Wrong person. The sentence is about “every student”, not “we”.']],1,2),
 // Verbs and tense
 L('tense_01','grammar_verbs','Choose the correct verb: “By the time the bus arrived, we ____ for an hour.”',[
  ['waited','Simple past does not show that the waiting was ongoing before another past event.'],
  ['have been waiting','Present perfect continuous connects to now, but the sentence is set in the past.'],
  ['had been waiting','Correct. The past perfect continuous shows an action in progress before another past event.'],
  ['are waiting','Present tense. The sentence is about the past.']],2,2),
 L('tense_02','grammar_verbs','Choose the correct verb: “If I ____ you, I would review the formulas tonight.”',[
  ['was','Common in speech, but formal English uses the subjunctive “were” in unreal conditions.'],
  ['were','Correct. Unreal or imagined conditions use “were” for all subjects.'],
  ['am','Present indicative. The condition is imagined, not real.'],
  ['will be','Future tense does not belong in the if-clause of an unreal condition.']],1,2),
 L('tense_03','grammar_verbs','Choose the correct verb: “She ____ the book before the movie came out.”',[
  ['has read','Present perfect connects to the present, but “came out” fixes the time in the past.'],
  ['reads','Present tense. The event happened in the past.'],
  ['had read','Correct. The reading happened before another past event, so the past perfect fits.'],
  ['will read','Future tense. The time is past.']],2,1),
 L('tense_04','grammar_verbs','Choose the correct verb: “The results ____ announced next week.”',[
  ['were','Past tense clashes with “next week”.'],
  ['will be','Correct. “Next week” calls for the future, and results are announced by someone else, so it is passive.'],
  ['has been','Singular and present perfect. “Results” is plural and the time is future.'],
  ['are being','Present progressive describes something happening now.']],1,1),
 L('tense_05','grammar_verbs','Choose the correct form: “I look forward to ____ from you.”',[
  ['hear','Tempting because “to” often comes before a base verb, but here “to” is a preposition.'],
  ['hearing','Correct. “Look forward to” ends in the preposition “to”, which takes an -ing form.'],
  ['heard','Past participle does not follow a preposition here.'],
  ['have heard','A perfect infinitive does not fit after the preposition “to”.']],1,2),
 L('tense_06','grammar_verbs','Choose the correct form: “The package should have ____ yesterday.”',[
  ['arrive','Base form. After “should have” you need the past participle.'],
  ['arrived','Correct. “Should have” is followed by the past participle.'],
  ['arriving','The -ing form does not follow “should have”.'],
  ['arrives','Present tense does not follow “should have”.']],1,1),
 L('tense_07','grammar_verbs','Choose the correct verb: “The chairs ____ lain out in rows before the program started.”',[
  ['has been','Singular helping verb. “Chairs” is plural.'],
  ['had been','Correct. Plural subject, and the action came before another past event.'],
  ['were being','Tempting, but the progressive passive does not show the action was finished before the program.'],
  ['have','Active voice. Chairs do not lay themselves out.']],1,3),
 // Vocabulary in context
 L('vocab_01','vocabulary_context','In the sentence “The new policy was met with widespread ambivalence,” ambivalence most nearly means',[
  ['strong approval','The word does not show a clear positive feeling.'],
  ['mixed feelings','Correct. “Ambi-” means both; ambivalence is holding two opposing feelings.'],
  ['open anger','That would be hostility or outrage.'],
  ['complete silence','Silence is a behaviour, not a feeling.']],1,2),
 L('vocab_02','vocabulary_context','“Despite her meticulous notes, she missed one detail in the instructions.” Meticulous most nearly means',[
  ['careless','This is the opposite. “Despite” signals the notes were good.'],
  ['very careful and precise','Correct. “Despite” shows a contrast: careful notes, yet a missed detail.'],
  ['short','Length is not the point of the contrast.'],
  ['colorful','Nothing in the sentence is about appearance.']],1,1),
 L('vocab_03','vocabulary_context','“The speaker’s remarks were so terse that the audience wanted more explanation.” Terse means',[
  ['brief and abrupt','Correct. The audience wanted more because the remarks were very short.'],
  ['angry','Terse remarks may sound unfriendly, but the word is about length.'],
  ['confusing','The problem was too little explanation, not unclear wording.'],
  ['humorous','Nothing suggests jokes.']],0,1),
 L('vocab_04','vocabulary_context','“The flood waters began to abate by morning, and families returned to their homes.” Abate means',[
  ['rise','The families returned, so the water did not rise.'],
  ['become less intense','Correct. Families could return once the water went down.'],
  ['freeze','There is no cold in the context.'],
  ['change color','Nothing in the sentence is about color.']],1,1),
 L('vocab_05','vocabulary_context','“Her explanation was lucid; even the Grade 7 students understood it.” Lucid means',[
  ['long','Length does not explain why young students understood.'],
  ['clear','Correct. The second clause shows it was easy to understand.'],
  ['strange','Strange explanations are harder to follow, not easier.'],
  ['loud','Volume is not the point.']],1,1),
 L('vocab_06','vocabulary_context','Which word best completes the sentence? “The two reports reached ____ conclusions, so the committee had to investigate further.”',[
  ['identical','If they matched, no further investigation would be needed.'],
  ['conflicting','Correct. Disagreeing conclusions explain why more investigation was needed.'],
  ['brief','Length does not create a need to investigate.'],
  ['official','Being official does not create a problem to solve.']],1,1),
 L('vocab_07','vocabulary_context','“The mayor’s promise proved to be ephemeral; within a month, it was forgotten.” Ephemeral means',[
  ['lasting a very short time','Correct. It was forgotten within a month.'],
  ['expensive','Cost is not mentioned.'],
  ['popular','Popularity would make it less likely to be forgotten.'],
  ['written','The form of the promise is not the point.']],0,2),
 L('vocab_08','vocabulary_context','Choose the word closest in meaning to “diligent”.',[
  ['lazy','This is the opposite.'],
  ['hardworking','Correct. Diligent means careful and persistent in work.'],
  ['intelligent','A diligent person may or may not be intelligent; the word is about effort.'],
  ['talkative','Unrelated.']],1,1),
 L('vocab_09','vocabulary_context','Choose the word most nearly OPPOSITE in meaning to “scarce”.',[
  ['rare','This is a synonym, not an opposite.'],
  ['plentiful','Correct. Scarce means in short supply; plentiful means abundant.'],
  ['expensive','Scarce things are often expensive, but that is not the opposite.'],
  ['hidden','Unrelated to quantity.']],1,1),
 // Sentence structure
 L('struct_01','sentence_structure','Which sentence is correct?',[
  ['Walking to school, the rain soaked my uniform.','Dangling modifier: it says the rain was walking to school.'],
  ['Walking to school, I got my uniform soaked by the rain.','Correct. The person doing the walking comes right after the opening phrase.'],
  ['Walking to school, my uniform was soaked by the rain.','Dangling modifier: it says the uniform was walking.'],
  ['The rain soaked my uniform, walking to school.','The phrase still seems to describe the rain.']],1,2),
 L('struct_02','sentence_structure','Which sentence uses parallel structure?',[
  ['She likes reading, to swim, and biking.','Mixes -ing forms with “to swim”.'],
  ['She likes reading, swimming, and biking.','Correct. All three items share the same -ing form.'],
  ['She likes to read, swimming, and to bike.','Mixes “to” forms with an -ing form.'],
  ['She likes reading, swimming, and to bike.','The last item breaks the pattern.']],1,1),
 L('struct_03','sentence_structure','Which is a complete sentence?',[
  ['Because the exam starts at seven.','A fragment: “because” starts a clause that needs a main clause.'],
  ['The exam starts at seven, so arrive early.','Correct. Two complete clauses joined by “so”.'],
  ['Arriving early for the exam at seven.','A fragment with no main verb.'],
  ['The exam that starts at seven.','A fragment: “that starts at seven” describes the exam but no main verb follows.']],1,1),
 L('struct_04','sentence_structure','Which sentence is punctuated correctly?',[
  ['I reviewed all night, I still felt nervous.','A comma splice: two complete sentences joined only by a comma.'],
  ['I reviewed all night; I still felt nervous.','Correct. A semicolon can join two closely related complete sentences.'],
  ['I reviewed all night I still felt nervous.','A run-on: two sentences with no punctuation.'],
  ['I reviewed, all night I still felt nervous.','The comma is in the wrong place and the sentences still run together.']],1,2),
 L('struct_05','sentence_structure','Choose the best way to combine: “The library closes at five. Many students study there after class.”',[
  ['The library closes at five, many students study there after class.','Comma splice.'],
  ['Although the library closes at five, many students study there after class.','Correct. “Although” shows the contrast between the early closing and the after-class studying.'],
  ['The library closes at five because many students study there after class.','“Because” claims a cause that the sentences do not state.'],
  ['The library closes at five, therefore many students study there after class.','A comma before “therefore” still makes a comma splice, and the logic is wrong.']],1,2),
 // Usage
 L('usage_01','usage','Choose the correct word: “The new schedule will ____ everyone in Section B.”',[
  ['effect','“Effect” is usually a noun, the result.'],
  ['affect','Correct. “Affect” is the verb meaning to influence.'],
  ['affects','Needs the base form after “will”.'],
  ['effects','Noun, plural. A verb is needed.']],1,1),
 L('usage_02','usage','Choose the correct word: “____ going to the review class later?”',[
  ['Their','Possessive, as in “their books”.'],
  ['There','A place or “there is”.'],
  ['They’re','Correct. “They’re” is “they are”.'],
  ['Theyre','Missing the apostrophe.']],2,1),
 L('usage_03','usage','Choose the correct sentence.',[
  ['Between you and I, the test was easy.','After a preposition like “between”, use the object form “me”.'],
  ['Between you and me, the test was easy.','Correct. “Between” is a preposition, so it takes “me”.'],
  ['Between yourself and I, the test was easy.','“Yourself” and “I” are both the wrong forms here.'],
  ['Between you and myself, the test was easy.','“Myself” is reflexive and needs “I” earlier in the sentence.']],1,2),
 L('usage_04','usage','Choose the correct word: “There were ____ applicants this year than last year.”',[
  ['less','“Less” is for things you cannot count, like water or time.'],
  ['fewer','Correct. Applicants can be counted, so use “fewer”.'],
  ['lesser','“Lesser” means lower in importance.'],
  ['few','The comparison with “than” needs “fewer”.']],1,1),
 L('usage_05','usage','Choose the correct word: “The committee gave ____ approval yesterday.”',[
  ['it’s','“It’s” means “it is” or “it has”.'],
  ['its','Correct. “Its” is the possessive.'],
  ['its’','Not a word in English.'],
  ['their’s','Not a word in English.']],1,1),
 L('usage_06','usage','Choose the correct word: “She did ____ on the long test.”',[
  ['good','“Good” is an adjective; “did” needs an adverb.'],
  ['well','Correct. “Well” is the adverb describing how she did.'],
  ['greatly','Grammatical but not idiomatic with “did”.'],
  ['best','A superlative needs a comparison group.']],1,1),
 // Filipino: gramatika
 L('fil_01','filipino_gramatika','Piliin ang wastong salita: “Tumakbo siya ____ mabilis upang umabot sa klase.”',[
  ['ng','Ang “ng” ay pananda ng pangngalan o ng tuwirang layon, hindi ng paraan ng kilos.'],
  ['nang','Tama. Ginagamit ang “nang” bilang pang-abay na nagsasaad ng paraan: tumakbo nang mabilis.'],
  ['na','Ang “na” ay pang-angkop o panghalip na pamatlig, hindi pang-uugnay ng paraan.'],
  ['ang','Pananda ng paksa, hindi ng paraan ng kilos.']],1,1,'fil'),
 L('fil_02','filipino_gramatika','Piliin ang wastong salita: “Bumili ako ____ bagong kuwaderno.”',[
  ['nang','Ginagamit ang “nang” sa paraan o sa “noong”, hindi bilang pananda ng layon.'],
  ['ng','Tama. Ang “ng” ay pananda ng layon ng pandiwa: bumili ng kuwaderno.'],
  ['na','Pang-angkop ito, hindi pananda ng layon.'],
  ['sa','Ang “sa” ay para sa lugar o direksiyon, hindi sa bagay na binili.']],1,1,'fil'),
 L('fil_03','filipino_gramatika','Alin ang wastong gamit ng “din” at “rin”?',[
  ['Ako rin ay pupunta.','Tama. Sumusunod sa salitang nagtatapos sa patinig o malapatinig (w, y) ang “rin”.'],
  ['Ako din ay pupunta.','Karaniwan sa pananalita, ngunit ayon sa tuntunin, “rin” ang kasunod ng salitang nagtatapos sa patinig.'],
  ['Siya’y pupunta rin din.','Dobleng gamit, mali.'],
  ['Kami din ay pupunta.','Ang “kami” ay nagtatapos sa patinig kaya “rin” ang wasto.']],0,1,'fil'),
 L('fil_04','filipino_gramatika','Alin ang pangungusap na may wastong gamit ng “raw” o “daw”?',[
  ['Aalis daw siya bukas.','Tama. Nagtatapos sa katinig na “s” ang “aalis”, kaya “daw” ang kasunod.'],
  ['Aalis raw siya bukas.','Ang “raw” ay para sa salitang nagtatapos sa patinig o malapatinig.'],
  ['Sila daw ang nanalo.','Ang “sila” ay nagtatapos sa patinig, kaya “raw” dapat.'],
  ['Pupunta daw kami.','Ang “pupunta” ay nagtatapos sa patinig, kaya “raw” dapat.']],0,1,'fil'),
 L('fil_05','filipino_gramatika','Anong aspekto ng pandiwa ang “kumakain”?',[
  ['Perpektibo (naganap na)','Ang naganap na ay “kumain”.'],
  ['Imperpektibo (nagaganap)','Tama. Inuulit ang unang pantig ng salitang-ugat at may “-um-”: kumakain, kasalukuyang ginagawa.'],
  ['Kontemplatibo (magaganap pa)','Ang magaganap pa ay “kakain”.'],
  ['Pawatas','Ang pawatas ay “kumain” o “kainin” na walang aspekto.']],1,1,'fil'),
 L('fil_06','filipino_gramatika','Piliin ang wastong pangungusap.',[
  ['Pinag-aralan niya ng mabuti ang aralin.','Paraan ang “mabuti” kaya “nang” ang dapat.'],
  ['Pinag-aralan niya nang mabuti ang aralin.','Tama. “Nang” ang ginagamit sa paraan ng pagkilos.'],
  ['Pinag-aralan niya na mabuti ang aralin.','Hindi pang-angkop ang kailangan dito.'],
  ['Pinag-aralan niya ang mabuti ang aralin.','Dalawang “ang”, mali ang estruktura.']],1,1,'fil'),
 L('fil_07','filipino_gramatika','Ano ang pokus ng pandiwa sa pangungusap: “Binili ni Ana ang aklat sa tindahan.”',[
  ['Pokus sa aktor','Nasa aktor ang pokus kung si Ana ang paksa (“Bumili si Ana …”).'],
  ['Pokus sa layon','Tama. Ang “aklat” ang paksa, na tinutukoy ng “ang”, at ito ang layon ng kilos.'],
  ['Pokus sa ganapan','Kung ganapan, ang “tindahan” ang magiging paksa (“Binilhan …”).'],
  ['Pokus sa tagatanggap','Walang tumanggap na paksa sa pangungusap.']],1,2,'fil'),
 L('fil_08','filipino_gramatika','Piliin ang wastong baybay.',[
  ['pakikipag-usap','Tama. May gitling sa pagitan ng panlaping nagtatapos sa katinig at salitang-ugat na nagsisimula sa patinig.'],
  ['pakikipagusap','Kulang ng gitling, kaya maaaring mabasa nang mali.'],
  ['pakiki-pag-usap','Sobra ang gitling.'],
  ['pakikipag usap','Hindi hinihiwalay ng espasyo ang panlapi at salitang-ugat.']],0,2,'fil'),
 // Filipino: talasalitaan
 L('filv_01','filipino_talasalitaan','“Masigasig siyang nag-aral kahit gabi na.” Ano ang kahulugan ng masigasig?',[
  ['tamad','Kasalungat ito.'],
  ['matiyaga at puspos ng sipag','Tama. Nag-aral pa rin kahit gabi na, kaya masipag at matiyaga.'],
  ['malungkot','Walang pahiwatig ng damdamin.'],
  ['mabagal','Hindi bilis ang tinutukoy.']],1,1,'fil'),
 L('filv_02','filipino_talasalitaan','Ano ang kasingkahulugan ng “marikit”?',[
  ['maganda','Tama. Ang marikit ay maganda o kaakit-akit.'],
  ['matalino','Ibang katangian ito.'],
  ['mabait','Ibang katangian ito.'],
  ['malaki','Tungkol sa sukat, hindi sa ganda.']],0,1,'fil'),
 L('filv_03','filipino_talasalitaan','Ano ang kasalungat ng “maramot”?',[
  ['madamot','Kasingkahulugan ito, hindi kasalungat.'],
  ['mapagbigay','Tama. Ang maramot ay ayaw magbigay; ang kasalungat ay mapagbigay.'],
  ['mayaman','Hindi ito kasalungat; maaaring mayaman ang maramot.'],
  ['masipag','Walang kaugnayan sa pagbibigay.']],1,1,'fil'),
 L('filv_04','filipino_talasalitaan','“Nagbabadya ang maitim na ulap ng malakas na ulan.” Ano ang kahulugan ng nagbabadya?',[
  ['nagpapahiwatig','Tama. Ang maitim na ulap ay palatandaan ng darating na ulan.'],
  ['nagtatago','Hindi itinatago ng ulap ang ulan.'],
  ['nagpapahinto','Hindi pinipigilan ng ulap ang ulan.'],
  ['nagpapaliwanag','Hindi nagpapaliwanag ang ulap.']],0,2,'fil'),
 L('filv_05','filipino_talasalitaan','Ano ang ibig sabihin ng sawikaing “nagbibilang ng poste”?',[
  ['nagtatrabaho sa kuryente','Literal na pagbasa ito, hindi ang kahulugan ng sawikain.'],
  ['walang trabaho','Tama. Ang taong walang trabaho ay palakad-lakad na parang binibilang ang mga poste.'],
  ['nag-aaral ng matematika','Literal at maling pagbasa.'],
  ['naliligaw','Walang kaugnayan sa pagkaligaw.']],1,1,'fil'),
 L('filv_06','filipino_talasalitaan','Ano ang ibig sabihin ng “balat-sibuyas”?',[
  ['madaling masaktan ang damdamin','Tama. Manipis ang balat ng sibuyas, kaya madaling masugatan, tulad ng damdamin ng taong maramdamin.'],
  ['mahilig magluto','Literal na pagbasa ito.'],
  ['maputi ang balat','Literal na pagbasa ito.'],
  ['madaling umiyak dahil sa sibuyas','Literal na pagbasa ito.']],0,1,'fil')
];
