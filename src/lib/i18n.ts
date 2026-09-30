/** Interface text in English and Filipino for navigation, onboarding, Today and the
 *  mock exam screens. Filipino strings are on the team's Filipino review list.
 *  Missing Filipino falls back to English, never to a raw key. */
export type Lang='en'|'fil';
const EN={
 'nav.today':'Today','nav.plan':'Plan','nav.plan.bridge':'Bridge','nav.mocks':'Mocks','nav.reviewer':'Reviewer','nav.group':'Group','nav.me':'Me','nav.side':'Which side',
 'side.admission.short':'Get in','side.bridge.short':'Start strong',
 'side.admission':'Getting into college','side.bridge':'Starting college',
 'me.pledge':'My study pledge','me.calendar':'Calendar','me.admissions':'Exam dates','me.bridge':'Freshman bridge','me.settings':'Settings and backups','me.about':'About Khanpanion','me.language':'Language',
 'today.days':'days to','today.day':'day to','today.examToday':'Exam day. You prepared for this.','today.mission':'Today’s mission','today.week':'This week','today.nextMock':'Next mock day','today.daily3':'Daily 3','today.focus':'Focus on these first','today.allDone':'Mission complete. That is a real day of work.',
 'mission.recall':'Quick recall','mission.khan':'Learn it','mission.exit':'Fresh exit check','mission.start':'Start','mission.done':'Done',
 'onb.title':'Make a study pledge','onb.exam':'Which exam?','onb.date':'Exam date','onb.why':'Why does this matter to you?','onb.whyHint':'In your own words. Only you will see this.','onb.days':'Days a week','onb.minutes':'Minutes a day','onb.when':'When','onb.at':'I will study at','onb.for':'for','onb.save':'Save my pledge','onb.ifthen':'When','onb.weekdays':'Which days?',
 'mock.timed':'Timed','mock.untimed':'Untimed','mock.pause':'Pause','mock.resume':'Resume','mock.flag':'Flag','mock.flagged':'Flagged','mock.idk':'I don’t know yet','mock.next':'Next','mock.prev':'Back','mock.submit':'Submit','mock.hideTimer':'Hide timer','mock.showTimer':'Show timer','mock.navigator':'Questions','mock.explain':'Show explanation','mock.hideExplain':'Hide explanation','mock.sure':'I’m sure','mock.check':'Check','mock.paused':'Paused. Take your time.',
 'result.title':'Your results','result.key':'Answer key','result.showAnswers':'Show answers','result.hideAnswers':'Hide answers','result.fix':'Fix this','result.why':'Why it tempts people','result.pace':'Pace check','result.next':'Your next step'
} as const;
export type Key=keyof typeof EN;
const FIL:Partial<Record<Key,string>>={
 'nav.today':'Ngayon','nav.plan':'Plano','nav.plan.bridge':'Tulay','nav.mocks':'Mock','nav.reviewer':'Reviewer','nav.group':'Grupo','nav.me':'Ako','nav.side':'Aling panig',
 'side.admission.short':'Makapasok','side.bridge.short':'Magsimula nang malakas',
 'side.admission':'Pagpasok sa kolehiyo','side.bridge':'Pagsisimula sa kolehiyo',
 'me.pledge':'Aking pangako sa pag-aaral','me.calendar':'Kalendaryo','me.admissions':'Mga petsa ng exam','me.bridge':'Tulay para sa freshman','me.settings':'Settings at backup','me.about':'Tungkol sa Khanpanion','me.language':'Wika',
 'today.days':'araw bago ang','today.day':'araw bago ang','today.examToday':'Araw ng exam. Pinaghandaan mo ito.','today.mission':'Misyon ngayong araw','today.week':'Ngayong linggo','today.nextMock':'Susunod na mock','today.daily3':'Daily 3','today.focus':'Unahin ang mga ito','today.allDone':'Tapos ang misyon. Tunay na araw ng pag-aaral iyan.',
 'mission.recall':'Mabilis na balik-aral','mission.khan':'Pag-aralan','mission.exit':'Bagong exit check','mission.start':'Simulan','mission.done':'Tapos',
 'onb.title':'Gumawa ng pangako sa pag-aaral','onb.exam':'Aling exam?','onb.date':'Petsa ng exam','onb.why':'Bakit ito mahalaga sa iyo?','onb.whyHint':'Sa sarili mong salita. Ikaw lang ang makakakita nito.','onb.days':'Araw bawat linggo','onb.minutes':'Minuto bawat araw','onb.when':'Kailan','onb.at':'Mag-aaral ako sa','onb.for':'nang','onb.save':'I-save ang pangako','onb.ifthen':'Kapag','onb.weekdays':'Aling mga araw?',
 'mock.timed':'May oras','mock.untimed':'Walang oras','mock.pause':'Ihinto sandali','mock.resume':'Ituloy','mock.flag':'Markahan','mock.flagged':'Minarkahan','mock.idk':'Hindi ko pa alam','mock.next':'Susunod','mock.prev':'Bumalik','mock.submit':'Ipasa','mock.hideTimer':'Itago ang oras','mock.showTimer':'Ipakita ang oras','mock.navigator':'Mga tanong','mock.explain':'Ipakita ang paliwanag','mock.hideExplain':'Itago ang paliwanag','mock.sure':'Sigurado ako','mock.check':'Suriin','mock.paused':'Nakahinto. Maglaan ng oras.',
 'result.title':'Iyong resulta','result.key':'Susi sa pagwawasto','result.showAnswers':'Ipakita ang sagot','result.hideAnswers':'Itago ang sagot','result.fix':'Ayusin ito','result.why':'Bakit ito nakalilito','result.pace':'Bilis mo','result.next':'Susunod mong hakbang'
};
export function t(lang:Lang,key:string):string{
 return (lang==='fil'?FIL[key as Key]:undefined)??EN[key as Key]??key;
}
export const DICTIONARIES={en:EN,fil:FIL};
