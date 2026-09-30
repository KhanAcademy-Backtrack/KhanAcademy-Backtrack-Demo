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
 {id:'dcat_nov8',exam:'dcat',title:'DCAT (Manila)',start:'2026-11-08',place:'Manila',note:'Testing day',link:EXAMS.dcat.link,checked:CHECKED},
 {id:'dostsei_nov14',exam:'dostsei',title:'DOST-SEI qualifying exam',start:'2026-11-14',end:'2026-11-15',note:'Two testing days',link:EXAMS.dostsei.link,checked:CHECKED},
 {id:'dcat_nov15',exam:'dcat',title:'DCAT (Manila)',start:'2026-11-15',place:'Manila',note:'Testing day',link:EXAMS.dcat.link,checked:CHECKED},
 {id:'dcat_dec6',exam:'dcat',title:'DCAT (Laguna)',start:'2026-12-06',place:'Laguna',note:'Testing day',link:EXAMS.dcat.link,checked:CHECKED},
 {id:'pupcet_2027',exam:'pupcet',title:'PUPCET testing',start:'2027-01-01',end:'2027-03-31',window:true,note:'Testing runs January to March 2027. Check the official page for your schedule.',link:EXAMS.pupcet.link,checked:CHECKED},
 {id:'upcat_apply_2027',exam:'upcat',title:'UPCAT applications open',start:'2027-03-01',end:'2027-03-31',window:true,note:'Applications open around March 2027. Watch the official page for the exact dates.',link:EXAMS.upcat.link,checked:CHECKED},
 {id:'upcat_2027',exam:'upcat',title:'UPCAT',start:'2027-08-01',end:'2027-08-31',window:true,note:'Scheduled for August 2027. The exact testing days are announced by the UP Office of Admissions.',link:EXAMS.upcat.link,checked:CHECKED}
];
/** A sensible default exam date for the pledge, used only until the learner edits it. */
export const DEFAULT_EXAM_DATE:Record<ExamId,string>={upcat:'2027-08-01',dcat:'2026-11-08',dostsei:'2026-11-14',pupcet:'2027-02-01'};
