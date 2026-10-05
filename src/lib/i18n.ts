/** Interface text in English and Filipino for navigation, onboarding, Today and the
 *  mock exam screens. Filipino strings are on the team's Filipino review list.
 *  Missing Filipino falls back to English, never to a raw key. */
export type Lang='en'|'fil';
const EN={
 'nav.today':'Home','nav.plan':'Plan','nav.study':'Study','nav.plan.bridge':'College','nav.mocks':'Mocks','nav.reviewer':'Reviewer','nav.calendar':'Calendar','nav.group':'Group','nav.me':'Me','nav.side':'Study goal',
 'nav.main':'Main','nav.all':'All pages','nav.sectionPages':'{section} pages','nav.home':'Khanpanion, Home','nav.guide':'Guide','nav.search':'Search','nav.create':'Create a study pack','nav.changeGoalRoutine':'Change goal or routine',
 'nav.openMenu':'Open menu','nav.closeMenu':'Close menu','nav.menu':'Menu','nav.expand':'Expand sidebar','nav.collapse':'Collapse sidebar','nav.shortcuts':'Shortcuts','nav.studyTools':'Study tools',
 'nav.yourExams':'Your exams','nav.yourProgram':'Your program','nav.yourTopic':'Your topic','nav.yourGoal':'Your goal','nav.generalCet':'General CET review','nav.moreInPlan':'{n} more in your plan','nav.editExams':'Add or edit exams','nav.changeGoal':'Change my goal','nav.setGoal':'Set a study goal',
 'page.college':'College map','page.topic':'My topic','page.plan':'My plan','page.calendar':'Calendar','page.dates':'Exam dates','page.reviewer':'CET Reviewers','page.courses':'Courses','page.mocks':'Practice exams','page.recall':'Daily recall','page.packs':'Study packs',
 'search.label':'Search Khanpanion','search.placeholder':'Search topics, reviewer, practice','search.results':'Search results','search.none':'No matches yet. Try a topic like “fractions” or an exam like “UPCAT”.','search.loading':'Loading…',
 'reviewer.for':'Reviewing for',
 'side.admission.short':'Exam prep','side.bridge.short':'College prep',
 'side.admission':'Getting into college','side.bridge':'Starting college',
 'me.pledge':'My study plan','me.calendar':'Calendar','me.admissions':'Exam dates','me.bridge':'College preparation','me.settings':'Settings and backups','me.about':'About Khanpanion','me.language':'Language',
 'today.days':'days to','today.day':'day to','today.examToday':'Your target date has arrived.','today.mission':'Today’s mission','today.week':'This week','today.nextMock':'Next mock day','today.daily3':'Daily 3','today.focus':'Focus on these first','today.allDone':'Today’s session is complete.',
 'mission.recall':'Quick recall','mission.khan':'Learn it','mission.exit':'Try a fresh question','mission.start':'Start','mission.done':'Done',
 'onb.title':'Make your study plan','onb.exam':'Which exam?','onb.date':'Exam date','onb.why':'Why does this matter to you?','onb.whyHint':'In your own words. Only you will see this.','onb.days':'Days a week','onb.minutes':'Minutes a day','onb.when':'When','onb.at':'I will study at','onb.for':'for','onb.save':'Save my plan','onb.ifthen':'When','onb.weekdays':'Which days?',
 'mock.timed':'Timed','mock.untimed':'Untimed','mock.pause':'Pause','mock.resume':'Resume','mock.flag':'Flag','mock.flagged':'Flagged','mock.idk':'I don’t know yet','mock.next':'Next','mock.prev':'Back','mock.submit':'Submit','mock.hideTimer':'Hide timer','mock.showTimer':'Show timer','mock.navigator':'Questions','mock.explain':'Show explanation','mock.hideExplain':'Hide explanation','mock.sure':'I’m sure','mock.check':'Check','mock.paused':'Paused. Take your time.',
 'result.title':'Your results','result.key':'Answer key','result.showAnswers':'Show answers','result.hideAnswers':'Hide answers','result.fix':'Fix this','result.why':'Why it tempts people','result.pace':'Pace check','result.next':'Your next step'
} as const;
export type Key=keyof typeof EN;
const FIL:Partial<Record<Key,string>>={
 'nav.plan':'Plano','nav.plan.bridge':'Kolehiyo','nav.mocks':'Mock','nav.reviewer':'Reviewer','nav.calendar':'Kalendaryo','nav.group':'Grupo','nav.me':'Ako','nav.side':'Aling panig',
 'side.admission.short':'Makapasok','side.bridge.short':'Magsimula nang malakas',
 'side.admission':'Pagpasok sa kolehiyo','side.bridge':'Pagsisimula sa kolehiyo',
 'me.pledge':'Aking plano sa pag-aaral','me.calendar':'Kalendaryo','me.admissions':'Mga petsa ng exam','me.bridge':'Paghahanda sa kolehiyo','me.settings':'Settings at backup','me.about':'Tungkol sa Khanpanion','me.language':'Wika',
 'today.days':'araw bago ang','today.day':'araw bago ang','today.examToday':'Dumating na ang target mong petsa.','today.mission':'Misyon ngayong araw','today.week':'Ngayong linggo','today.nextMock':'Susunod na mock','today.daily3':'Daily 3','today.focus':'Unahin ang mga ito','today.allDone':'Tapos na ang pag-aaral ngayong araw.',
 'mission.recall':'Mabilis na balik-aral','mission.khan':'Pag-aralan','mission.exit':'Subukan ang bagong tanong','mission.start':'Simulan','mission.done':'Tapos',
 'onb.title':'Gumawa ng plano sa pag-aaral','onb.exam':'Aling exam?','onb.date':'Petsa ng exam','onb.why':'Bakit ito mahalaga sa iyo?','onb.whyHint':'Sa sarili mong salita. Ikaw lang ang makakakita nito.','onb.days':'Araw bawat linggo','onb.minutes':'Minuto bawat araw','onb.when':'Kailan','onb.at':'Mag-aaral ako sa','onb.for':'nang','onb.save':'I-save ang plano','onb.ifthen':'Kapag','onb.weekdays':'Aling mga araw?',
 'mock.timed':'May oras','mock.untimed':'Walang oras','mock.pause':'Ihinto sandali','mock.resume':'Ituloy','mock.flag':'Markahan','mock.flagged':'Minarkahan','mock.idk':'Hindi ko pa alam','mock.next':'Susunod','mock.prev':'Bumalik','mock.submit':'Ipasa','mock.hideTimer':'Itago ang oras','mock.showTimer':'Ipakita ang oras','mock.navigator':'Mga tanong','mock.explain':'Ipakita ang paliwanag','mock.hideExplain':'Itago ang paliwanag','mock.sure':'Sigurado ako','mock.check':'Suriin','mock.paused':'Nakahinto. Maglaan ng oras.',
 'result.title':'Iyong resulta','result.key':'Susi sa pagwawasto','result.showAnswers':'Ipakita ang sagot','result.hideAnswers':'Itago ang sagot','result.fix':'Ayusin ito','result.why':'Bakit ito nakalilito','result.pace':'Bilis mo','result.next':'Susunod mong hakbang'
};
export function t(lang:Lang,key:string):string{
 return (lang==='fil'?FIL[key as Key]:undefined)??EN[key as Key]??key;
}
export const DICTIONARIES={en:EN,fil:FIL};
