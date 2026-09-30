import type {MockItem} from '../../lib/mock/types.ts';
import type {KhanUnitId} from '../../lib/program/khan-units.ts';

/** Reading Comprehension passages and items, written by Khanpanion. Every passage is
 *  original. Items stay "draft" until a named team reviewer signs them off. */
export type Passage={id:string;lang:'en'|'fil';title:string;kind:string;paragraphs:string[];author:string;reviewer:string;status:'draft'|'reviewed';createdAt:string;khanRef?:KhanUnitId};

const P=(id:string,lang:'en'|'fil',title:string,kind:string,paragraphs:string[],khanRef?:KhanUnitId):Passage=>({id,lang,title,kind,paragraphs,author:'Khanpanion team',reviewer:'',status:'draft',createdAt:'2026-09-30',khanRef});

export const PASSAGES:Passage[]=[
 P('mangroves','en','Roots against the sea','Science article',[
  'Along many Philippine coasts, mangrove forests grow where the land meets the sea. Their tangled roots rise out of the mud like the legs of a table, and at high tide the water flows between them.',
  'These roots do more than hold the trees in place. When a storm pushes waves toward the shore, the dense roots and trunks slow the water down. Studies of coastal villages after strong typhoons have found that communities behind wide mangrove belts often suffered less flooding than nearby communities without them.',
  'Mangroves also serve as nurseries. Young fish, crabs and shrimp shelter among the roots, where larger predators cannot easily follow. Many of the fish that coastal families catch in open water spent their first weeks in a mangrove forest.',
  'For decades, however, mangroves were cleared to make room for fishponds and buildings. Replanting has since become common, but not every project succeeds. Seedlings planted in the wrong zone, such as on open mudflats that were never mangrove habitat, often die within a year. Restoration works best where mangroves grew before and where the natural flow of tides has been restored.'],'eng8_q3'),
 P('sleep','en','What happens to a lesson overnight','Science article',[
  'Students often treat sleep as the first thing to cut when an exam is near. Research on memory suggests this trade is usually a poor one.',
  'During the day, new information is held in a fragile form. During sleep, especially deep sleep early in the night, the brain appears to replay recent experiences and strengthen the connections that store them. In several experiments, people who learned a list of facts and then slept remembered more the next day than people who learned the same list and stayed awake for the same number of hours.',
  'Sleep does not only protect memories; it seems to organize them. In one kind of study, participants practiced a task that contained a hidden shortcut. Those who slept before trying again were more likely to discover the shortcut than those who did not.',
  'None of this means that sleep can replace study. A memory that was never formed cannot be strengthened. But it does suggest that a student who studies in the evening and then sleeps well may get more out of the same hours than one who studies until dawn.'],'eng8_q3'),
 P('jeepney','en','The route','Short fiction',[
  'Mang Totoy had driven the same route for twenty-three years, and he knew it the way other people know a song. He knew which corner the school children waited at, which vendor would wave him down for a ride to the market, and which pothole had been there since before his daughter was born.',
  'On the first day of the new school year, a girl in a crisp white blouse climbed aboard and sat directly behind him. She held a folder against her chest with both arms, as if it might escape.',
  '“Is this the way to the national high school?” she asked. Her voice was so quiet that he almost missed it over the engine.',
  '“Every morning,” he said. “I will tell you when.”',
  'She nodded but did not loosen her grip on the folder. At each stop she leaned forward to read the street signs, lips moving silently. When the school gate finally appeared, he slowed and turned his head. “This is you,” he said. She was already standing. She paused at the step, looked back as though she wanted to say something, and then simply raised one hand before hurrying through the gate.',
  'Mang Totoy pulled back into traffic. He found that he was smiling, and that he was already looking forward to tomorrow’s corner.'],'eng10_q1'),
 P('barangay','en','From boat to barangay','History',[
  'The word “barangay” has a history older than the Philippine government that uses it today. Early Spanish accounts describe communities called barangays that were led by a datu and could number from a few dozen to several hundred families.',
  'Many historians connect the word to “balangay”, a kind of large wooden boat. Remains of such boats, some dated to more than a thousand years ago, have been found in Butuan. One explanation is that early communities were formed by families who had traveled together, and the boat’s name came to stand for the group itself.',
  'Historians note that this connection, while widely taught, is difficult to prove directly. Written records from before Spanish arrival are scarce, and the accounts that do exist were written by outsiders with their own purposes.',
  'What is clearer is that the barangay has survived many changes of government. Today it is the smallest unit of local government, and for most Filipinos it is the first office they visit for a clearance, a certificate or help settling a dispute.'],'eng9_q3'),
 P('solar','en','Power on the rooftops','Informational text',[
  'On a clear day, a single square meter of the Earth’s surface in the tropics can receive about a kilowatt of sunlight. Solar panels turn a portion of that energy into electricity, and their price has fallen sharply over the past two decades.',
  'For island communities that depend on diesel generators, the appeal is obvious. Diesel must be shipped in, its price changes with the world market, and generators are noisy and polluting. A solar system, once installed, uses no fuel at all.',
  'Solar power has its own difficulties. Panels produce nothing at night and less on cloudy days, so a community that wants power after sunset needs batteries, which add to the cost and must eventually be replaced. Panels also need cleaning and occasional repair, and a system that no one in the community knows how to maintain may stop working within a few years.',
  'For these reasons, planners increasingly treat training as part of the project rather than an afterthought. A system is only as reliable as the people who look after it.'],'eng9_q3'),
 P('bayanihan','fil','Bayanihan sa bagong panahon','Sanaysay',[
  'Sa mga lumang larawan ng bayanihan, makikita ang mga kalalakihang nagbubuhat ng buong bahay na kubo upang ilipat ito sa bagong lugar. Walang bayad ang tulong; ang tanging kapalit ay ang pagkaing inihanda ng may-ari at ang pangakong tutulong din siya sa susunod.',
  'Bihira na ngayong makakita ng bahay na binubuhat. Ngunit hindi nangangahulugang naglaho na ang diwa ng bayanihan. Tuwing may bagyo, makikita ito sa mga kabataang nagrerepake ng relief goods sa barangay hall, sa mga kapitbahay na nagbabahagi ng generator, at sa mga estrangherong nag-aambag sa online na donasyon para sa pamilyang hindi nila kilala.',
  'May mga nagsasabing mas mahina na ang bayanihan dahil abala ang lahat sa sariling buhay. Maaaring totoo ito sa ilang lugar. Subalit ang pagbabago ng anyo ay hindi katumbas ng pagkawala. Ang mahalaga ay ang paniniwalang ang problema ng isa ay problema ng lahat.'],'eng9_q3'),
 P('wika','fil','Ang wika sa silid-aralan','Sanaysay',[
  'Maraming mag-aaral sa Pilipinas ang lumaki sa isang wika sa bahay, natuto ng Filipino sa paaralan, at gumagamit ng Ingles sa karamihan ng aklat. Para sa kanila, ang bawat aralin ay maaaring maging dalawang hamon nang sabay: ang pag-unawa sa konsepto at ang pag-unawa sa wikang ginamit sa pagtuturo nito.',
  'Hindi ito dahilan upang ituring na mahina ang ganitong mag-aaral. Sa katunayan, ang kakayahang lumipat mula sa isang wika tungo sa iba ay isang kasanayang pinaghihirapan ng maraming tao sa buong mundo.',
  'Ang kailangan ay ang pagkilala na ang hirap ay maaaring nasa wika at hindi sa kaisipan. Ang isang mag-aaral na hindi makasagot ng tanong sa Ingles ay maaaring makasagot nang mahusay kapag ipinaliwanag ito sa wikang kanyang kinalakhan. Kapag napatunayan niyang naiintindihan niya ang konsepto, mas madali nang matutuhan ang mga salitang kailangan upang maipahayag ito sa ibang wika.'],'eng9_q3')
];

const CHAPTER:Record<string,string>={main_idea:'r_main_idea',details:'r_details',inference:'r_inference',vocabulary_in_context:'r_vocabulary',author_purpose:'r_purpose'};
type Row=[string,string];
function R(passageId:string,n:number,concept:string,stem:string,rows:Row[],answerIndex:number,difficulty:1|2|3):MockItem{
 const p=PASSAGES.find(x=>x.id===passageId);if(!p)throw Error(passageId);
 if(rows.length!==4)throw Error(`${passageId}-${n} needs four choices`);
 return {id:`read_${passageId}_${n}`,source:'authored',subtest:'reading',lang:p.lang,passageId,stem,choices:rows.map(r=>r[0]),rationales:rows.map(r=>r[1]),answerIndex,solutionSteps:[rows[answerIndex][1]],misconceptions:rows.map(()=>null),skill:concept,concept,difficulty,khanRef:p.khanRef,reviewerChapter:CHAPTER[concept],status:'draft',author:'Khanpanion team',reviewer:'',createdAt:'2026-09-30'};
}

export const READING_ITEMS:MockItem[]=[
 R('mangroves',1,'main_idea','Which statement best expresses the main idea of the passage?',[
  ['Mangroves protect coasts and support fisheries, but restoring them works only under the right conditions.','Correct. It covers protection, nurseries and the conditions for successful replanting, which is the whole passage.'],
  ['Mangrove roots look like the legs of a table.','A vivid detail from the first paragraph, not the main idea.'],
  ['Fishponds are the main cause of typhoon damage in the Philippines.','The passage never says this; it mentions fishponds only as a reason mangroves were cleared.'],
  ['Every mangrove replanting project succeeds within a year.','The passage says the opposite: many seedlings planted in the wrong zone die.']],0,1),
 R('mangroves',2,'details','According to the passage, why do young fish shelter among mangrove roots?',[
  ['The water there is warmer.','Temperature is never mentioned.'],
  ['Larger predators cannot easily follow them there.','Correct. The third paragraph says this directly.'],
  ['The roots give off food.','The passage does not say the roots produce food.'],
  ['Fishermen cannot reach them there.','The passage does not mention fishermen reaching the roots.']],1,1),
 R('mangroves',3,'inference','Which situation would the author most likely expect to fail?',[
  ['Replanting mangroves in an old mangrove area where tides flow freely again.','The author says this is where restoration works best.'],
  ['Planting mangrove seedlings on an open mudflat that never had mangroves.','Correct. The last paragraph says such seedlings often die within a year.'],
  ['Protecting an existing wide mangrove belt near a village.','The author presents this as beneficial.'],
  ['Studying how mangroves reduce flooding.','Studying is not something that fails in the passage.']],1,2),
 R('mangroves',4,'vocabulary_in_context','In the second paragraph, the word “dense” most nearly means',[
  ['heavy','Weight is not what slows the water; closeness is.'],
  ['closely packed','Correct. Tightly packed roots and trunks slow the water.'],
  ['dark','Colour is not relevant to slowing waves.'],
  ['difficult to understand','That meaning of “dense” refers to ideas, not roots.']],1,1),
 R('mangroves',5,'author_purpose','Why does the author mention studies of coastal villages after typhoons?',[
  ['To give evidence that mangroves reduce flood damage.','Correct. The studies support the claim about slowing waves.'],
  ['To argue that villages should move inland.','The passage does not recommend moving villages.'],
  ['To describe how typhoons form.','Typhoon formation is never explained.'],
  ['To criticize fishpond owners.','The studies are not about fishponds.']],0,2),
 R('sleep',1,'main_idea','What is the central claim of the passage?',[
  ['Sleep can replace studying before an exam.','The last paragraph rejects this directly.'],
  ['Sleeping after studying helps strengthen and organize what was learned.','Correct. Every paragraph builds toward this claim.'],
  ['Deep sleep only happens late at night.','The passage says deep sleep happens early in the night.'],
  ['Students should study until dawn.','The author argues the opposite.']],1,1),
 R('sleep',2,'details','In the experiment with the hidden shortcut, which group was more likely to find the shortcut?',[
  ['Those who practiced longer','Practice time is not the difference described.'],
  ['Those who slept before trying again','Correct. The third paragraph says so.'],
  ['Those who were told about it','No one is said to have been told.'],
  ['Those who stayed awake','This group did worse in the passage.']],1,1),
 R('sleep',3,'inference','Which student would the author most likely advise to change a habit?',[
  ['One who reviews in the evening and sleeps eight hours','This matches what the author recommends.'],
  ['One who skips sleep the night before an exam to review','Correct. The passage argues this trade is usually a poor one.'],
  ['One who naps after a study session','The passage does not discourage this.'],
  ['One who studies a little each day','Nothing in the passage discourages this.']],1,2),
 R('sleep',4,'vocabulary_in_context','In the second paragraph, “fragile” most nearly means',[
  ['easily lost or damaged','Correct. New information is not yet stable until it is strengthened.'],
  ['made of glass','A literal meaning that does not fit memories.'],
  ['very important','Importance is not the point.'],
  ['confusing','The passage is about stability, not clarity.']],0,1),
 R('sleep',5,'author_purpose','Why does the author include the final paragraph?',[
  ['To add a limit to the claim so readers do not overapply it','Correct. It clarifies that sleep strengthens memories but cannot create them.'],
  ['To introduce a new experiment','No new experiment is described.'],
  ['To argue that exams are unfair','Exams are not criticized.'],
  ['To summarize the history of sleep research','There is no history in the paragraph.']],0,2),
 R('jeepney',1,'inference','Why does the girl hold her folder “as if it might escape”?',[
  ['She is nervous about the new school year.','Correct. Her quiet voice, careful sign-reading and tight grip all show nervousness.'],
  ['The folder is very heavy.','Nothing suggests weight.'],
  ['She does not trust the driver.','She trusts him enough to ask for help and to wave.'],
  ['The wind is strong inside the jeepney.','The wind is never mentioned.']],0,2),
 R('jeepney',2,'details','How long has Mang Totoy driven his route?',[
  ['Since his daughter was born','The pothole predates his daughter; that is not his driving time.'],
  ['Twenty-three years','Correct. The first sentence says so.'],
  ['One school year','That is when the story takes place, not how long he has driven.'],
  ['The passage does not say','It does say: twenty-three years.']],1,1),
 R('jeepney',3,'inference','What does the last sentence suggest about Mang Totoy?',[
  ['He is tired of his route.','Looking forward to tomorrow suggests the opposite.'],
  ['He has come to care about the new passenger.','Correct. He is smiling and looking forward to seeing her corner again.'],
  ['He plans to change his route.','Nothing suggests a change.'],
  ['He did not notice the girl leave.','He watched her go and smiled.']],1,2),
 R('jeepney',4,'vocabulary_in_context','The phrase “he knew it the way other people know a song” suggests that he knows the route',[
  ['from memory, without having to think','Correct. A well-known song comes without effort; so does his route.'],
  ['only when music is playing','This reads the comparison literally.'],
  ['because he wrote it','Nothing suggests he designed the route.'],
  ['poorly','The comparison suggests the opposite.']],0,1),
 R('jeepney',5,'author_purpose','Which best describes how the story is built?',[
  ['A small moment of connection between strangers','Correct. The story turns on a brief exchange that changes the driver’s mood.'],
  ['A problem that is solved by a clever plan','No plan or puzzle appears.'],
  ['A comparison of two jeepney routes','Only one route appears.'],
  ['An argument about public transport','The story makes no argument.']],0,2),
 R('barangay',1,'main_idea','What is the passage mainly about?',[
  ['The origins and lasting role of the barangay','Correct. It covers the word’s history, the uncertain boat link, and today’s role.'],
  ['How to build a balangay boat','Boat-building is not described.'],
  ['Why Spanish accounts are always false','The author says they had their own purposes, not that they are false.'],
  ['How to get a barangay clearance','This is mentioned only in passing.']],0,1),
 R('barangay',2,'details','Where have remains of balangay boats been found, according to the passage?',[
  ['Manila','Not mentioned.'],
  ['Butuan','Correct. The second paragraph names Butuan.'],
  ['Cebu','Not mentioned.'],
  ['Spain','Not mentioned.']],1,1),
 R('barangay',3,'inference','The author’s attitude toward the boat explanation is best described as',[
  ['completely certain','The third paragraph says it is hard to prove.'],
  ['openly mocking','The tone is careful, not mocking.'],
  ['cautious','Correct. The author presents it as widely taught but hard to prove directly.'],
  ['uninterested','The author spends two paragraphs on it.']],2,2),
 R('barangay',4,'vocabulary_in_context','In the third paragraph, “scarce” most nearly means',[
  ['frightening','A different word, “scary”.'],
  ['in short supply','Correct. There are few written records from that time.'],
  ['expensive','Cost is not mentioned.'],
  ['recent','The records are old, not recent.']],1,1),
 R('barangay',5,'author_purpose','Why does the author mention that early accounts were “written by outsiders with their own purposes”?',[
  ['To explain why the historical evidence should be read carefully','Correct. It supports the point that the origin is hard to prove.'],
  ['To prove the barangay did not exist','The author says it did exist.'],
  ['To praise the Spanish writers','Nothing here is praise.'],
  ['To describe the datu’s duties','The duties are not described.']],0,2),
 R('solar',1,'main_idea','Which statement best summarizes the passage?',[
  ['Solar power can free island communities from diesel, but it depends on batteries and trained people to last.','Correct. It covers the benefits, the limits and the conclusion about training.'],
  ['Solar panels are now free.','Prices have fallen, not reached zero.'],
  ['Diesel generators are the best option for islands.','The passage lists diesel’s problems.'],
  ['Solar panels work best at night.','They produce nothing at night.']],0,1),
 R('solar',2,'details','Why does a community that wants power after sunset need batteries?',[
  ['Panels produce nothing at night.','Correct. The third paragraph states this.'],
  ['Batteries make panels cheaper.','Batteries add to the cost.'],
  ['Diesel requires batteries.','Not stated.'],
  ['Batteries clean the panels.','Cleaning is a separate task.']],0,1),
 R('solar',3,'inference','Which project would the author most likely consider well planned?',[
  ['One that installs panels and leaves quickly','This matches the failure the author warns about.'],
  ['One that trains local residents to maintain the system','Correct. The last paragraph says a system is only as reliable as its caretakers.'],
  ['One that uses only diesel','The author presents solar as appealing for islands.'],
  ['One that skips batteries to save money','Then there would be no power after sunset.']],1,2),
 R('solar',4,'vocabulary_in_context','In the last paragraph, “an afterthought” means something',[
  ['considered only later, as less important','Correct. Planners now treat training as central instead.'],
  ['thought about very carefully','That is the opposite.'],
  ['that happens in the afternoon','A literal misreading.'],
  ['forgotten completely','An afterthought is considered, just late.']],0,2),
 R('solar',5,'author_purpose','How is the passage organized?',[
  ['Benefits, then difficulties, then a conclusion about what makes projects work','Correct. Paragraphs two, three and four follow that order.'],
  ['A story about one island, told in order','No single island is described.'],
  ['A list of instructions for installing panels','No instructions are given.'],
  ['Two opposing opinions with no conclusion','The passage reaches a conclusion.']],0,2),
 R('bayanihan',1,'main_idea','Ano ang pangunahing ideya ng sanaysay?',[
  ['Nagbago ang anyo ng bayanihan ngunit nananatili ang diwa nito.','Tama. Ito ang ipinapakita ng ikalawa at ikatlong talata.'],
  ['Wala nang bayanihan sa kasalukuyan.','Tinatanggihan ito ng may-akda.'],
  ['Mas mahalaga ang generator kaysa sa bahay.','Halimbawa lamang ang generator.'],
  ['Kailangang magbuhat ng bahay ang lahat.','Hindi ito ang mungkahi ng sanaysay.']],0,1),
 R('bayanihan',2,'details','Ayon sa sanaysay, ano ang kapalit ng tulong sa lumang bayanihan?',[
  ['Pera mula sa may-ari','Sinabing walang bayad.'],
  ['Pagkain at pangakong tutulong din sa susunod','Tama. Nakasaad ito sa unang talata.'],
  ['Lupa','Hindi binanggit.'],
  ['Wala talagang kapalit','May pagkain at pangako.']],1,1),
 R('bayanihan',3,'inference','Ano ang malamang na pananaw ng may-akda sa online na donasyon?',[
  ['Ito ay makabagong anyo ng bayanihan.','Tama. Isinama ito ng may-akda bilang halimbawa ng diwa ng bayanihan ngayon.'],
  ['Hindi ito tunay na pagtulong.','Salungat sa halimbawang ibinigay.'],
  ['Mas masama ito kaysa sa lumang bayanihan.','Hindi ito sinasabi.'],
  ['Para lamang ito sa magkakakilala.','Sinabing para sa hindi kilala.']],0,2),
 R('bayanihan',4,'vocabulary_in_context','Sa ikatlong talata, ano ang kahulugan ng “katumbas”?',[
  ['kapareho o kasinghalaga','Tama. Ang pagbabago ng anyo ay hindi kapareho ng pagkawala.'],
  ['kalaban','Hindi ito ang kahulugan.'],
  ['kasunod','Hindi pagkakasunod ang tinutukoy.'],
  ['kabayaran','Maaaring kaugnay ngunit hindi akma sa pangungusap.']],0,2),
 R('bayanihan',5,'author_purpose','Bakit binanggit ng may-akda ang mga taong nagsasabing mahina na ang bayanihan?',[
  ['Upang sagutin ang isang posibleng tutol at ipagtanggol ang kanyang punto','Tama. Kinikilala niya ito, saka ipinaliwanag kung bakit hindi ito pagkawala.'],
  ['Upang sang-ayunan sila nang buo','Bahagya lamang ang pagsang-ayon.'],
  ['Upang magpatawa','Walang biro sa talata.'],
  ['Upang ilarawan ang isang bagyo','Hindi ito ang layunin ng talata.']],0,3),
 R('wika',1,'main_idea','Ano ang pangunahing mensahe ng sanaysay?',[
  ['Maaaring nasa wika ang hirap ng mag-aaral at hindi sa kanyang pag-unawa sa konsepto.','Tama. Ito ang punto ng huling talata.'],
  ['Ingles lamang dapat ang gamitin sa paaralan.','Hindi ito iminumungkahi.'],
  ['Mahihina ang mag-aaral na maraming wika.','Tinatanggihan ito sa ikalawang talata.'],
  ['Hindi mahalaga ang Filipino.','Walang ganitong pahayag.']],0,1),
 R('wika',2,'details','Ayon sa sanaysay, ano ang dalawang hamon ng ilang mag-aaral sa bawat aralin?',[
  ['Ang konsepto at ang wikang ginamit sa pagtuturo','Tama. Nakasaad ito sa unang talata.'],
  ['Ang takdang-aralin at ang pagsusulit','Hindi binanggit.'],
  ['Ang guro at ang kaklase','Hindi binanggit.'],
  ['Ang oras at ang pera','Hindi binanggit.']],0,1),
 R('wika',3,'inference','Aling gawain ang malamang na imungkahi ng may-akda sa isang guro?',[
  ['Ipaliwanag muna ang konsepto sa wikang kinalakhan ng mag-aaral kung kinakailangan','Tama. Ayon sa huling talata, nakatutulong ito bago matutuhan ang mga salita sa ibang wika.'],
  ['Parusahan ang mag-aaral na hindi makasagot sa Ingles','Salungat sa diwa ng sanaysay.'],
  ['Huwag nang gumamit ng Ingles','Hindi ito sinabi.'],
  ['Ibaba ang marka ng mag-aaral','Walang ganitong mungkahi.']],0,2),
 R('wika',4,'vocabulary_in_context','Sa ikalawang talata, ano ang ibig sabihin ng “pinaghihirapan”?',[
  ['pinagsisikapang matutuhan','Tama. Ang kasanayan ay mahirap at pinagtatrabahuhan.'],
  ['kinaiinisan','Hindi damdamin ang tinutukoy.'],
  ['kinakalimutan','Salungat ito.'],
  ['binabayaran','Hindi pera ang tinutukoy.']],0,2),
 R('wika',5,'author_purpose','Ano ang layunin ng may-akda?',[
  ['Baguhin ang pagtingin sa mga mag-aaral na gumagamit ng maraming wika','Tama. Ipinapakita niyang kalakasan ang kakayahang ito, hindi kahinaan.'],
  ['Magturo ng gramatika','Walang aralin sa gramatika.'],
  ['Magkuwento ng isang pangyayari','Walang tiyak na kuwento.'],
  ['Magbenta ng aklat','Walang ganitong layunin.']],0,2)
];
