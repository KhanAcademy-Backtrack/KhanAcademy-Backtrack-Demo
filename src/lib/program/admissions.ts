/** Exam dates shown on /admissions and in the calendar. Each links to the official
 *  page it was checked against, with the date it was checked. */
export type ExamId='upcat'|'dcat'|'dostsei'|'pupcet';
export type ExamDate={id:string;exam:ExamId;title:string;start:string;end?:string;window?:boolean;place?:string;note:string;link:string;checked:string};
export const EXAMS:Record<ExamId,{name:string;full:string;link:string;practice:string}>={
 upcat:{name:'UPCAT',full:'University of the Philippines College Admission Test',link:'https://upcat.up.edu.ph/',practice:'Full UPCAT-style review'},
 dcat:{name:'DCAT',full:'De La Salle University College Admission Test',link:'https://www.dlsu.edu.ph/admission/undergraduate-admissions/',practice:'Practice sets for DCAT'},
 dostsei:{name:'DOST-SEI',full:'DOST-SEI Undergraduate Scholarship Qualifying Examination',link:'https://www.sei.dost.gov.ph/',practice:'Practice sets for DOST-SEI'},
 pupcet:{name:'PUPCET',full:'PUP College Entrance Test',link:'https://www.pup.edu.ph/iapply/',practice:'Practice sets for PUPCET'}
};
const CHECKED='2026-09-30';
export const EXAM_DATES:ExamDate[]=[
 {id:'upcat_2027_test',exam:'upcat',title:'UPCAT 2027 test dates',start:'2026-08-01',end:'2026-08-02',note:'For admission in AY 2027-2028. This testing cycle has finished. The next cycle dates are not yet verified here.',link:'https://upcat.up.edu.ph/htmls/aboutupcat.html',checked:CHECKED},
 {id:'dostsei_nov14',exam:'dostsei',title:'DOST-SEI qualifying exam',start:'2026-11-14',end:'2026-11-15',note:'For the 2027 Undergraduate Scholarships. Confirm your testing assignment on the official portal.',link:'https://ugs.science-scholarships.ph/pages/home.html',checked:CHECKED}
];
export const EXAM_NOTICES=[
 {exam:'upcat' as const,note:'The next UPCAT testing and application dates need an official announcement. You can set your own planning target in your pledge.'},
 {exam:'dcat' as const,note:'The inherited November and December dates could not be confirmed against the current official page. Check DLSU for your testing schedule.'},
 {exam:'pupcet' as const,note:'PUPCET schedules vary by campus. No January to March 2027 window is confirmed here; check the official page for your campus.'}
];
/** Only announced future dates are prefilled. Others are chosen by the learner. */
export const DEFAULT_EXAM_DATE:Record<ExamId,string>={upcat:'',dcat:'',dostsei:'2026-11-14',pupcet:''};
