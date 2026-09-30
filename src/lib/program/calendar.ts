import {buildSchedule,addDays} from './planner.ts';
import {EXAM_DATES,EXAMS} from './admissions.ts';
import type {ProgramState,CalEvent} from './store.ts';

export type CalItem={id:string;date:string;end?:string;time?:string;minutes?:number;title:string;kind:'study'|'mock'|'custom'|'exam'|'examWindow';concept?:string;done?:boolean;planned?:boolean;link?:string};

/** The learner's calendar: the planned schedule, their own events (which override a
 *  planned session with the same id, so moving or removing one is just an edit),
 *  and official exam dates. */
export function calendarItems(s:ProgramState,today:string):CalItem[]{
 const own=new Map(s.events.map(e=>[e.id,e]));
 const planned=buildSchedule(s,today).filter(e=>!own.has(e.id)).map(e=>({...e,planned:true}));
 const mine=s.events.filter(e=>!(e as CalEvent&{removed?:boolean}).removed);
 const exams:CalItem[]=EXAM_DATES.map(d=>({id:d.id,date:d.start,end:d.end,title:d.title,kind:d.window?'examWindow':'exam',link:d.link}));
 if(s.pledge&&!EXAM_DATES.some(d=>d.exam===s.pledge!.exam&&d.start===s.pledge!.examDate))exams.push({id:'my-exam',date:s.pledge.examDate,title:`My ${EXAMS[s.pledge.exam].name} date`,kind:'exam'});
 return [...planned,...mine,...exams].sort((a,b)=>a.date.localeCompare(b.date)||(a.time??'').localeCompare(b.time??''));
}

export function itemsOn(items:CalItem[],day:string){return items.filter(i=>i.date===day||(i.end&&i.date<=day&&day<=i.end));}

/** A month grid starting on Monday: 5 or 6 rows of 7 days. */
export function monthGrid(year:number,month:number){
 const first=new Date(year,month,1),offset=(first.getDay()+6)%7;
 const start=new Date(year,month,1-offset);
 const cells:string[]=[];
 for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);cells.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);}
 const rows=cells.slice(35).some(c=>Number(c.slice(5,7))-1===month)?6:5;
 return cells.slice(0,rows*7);
}

const esc=(t:string)=>t.replace(/[\\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n');
const stamp=(date:string,time?:string)=>time?`${date.replace(/-/g,'')}T${time.replace(':','')}00`:date.replace(/-/g,'');

/** An .ics file the learner can import into any phone calendar. Floating local
 *  times, so a session at 7 pm stays at 7 pm wherever the phone is. */
export function toIcs(items:CalItem[],nowStamp:string){
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Khanpanion//Study plan//EN','CALSCALE:GREGORIAN'];
 for(const i of items){
  lines.push('BEGIN:VEVENT',`UID:${i.id}@khanpanion`,`DTSTAMP:${nowStamp}`);
  if(i.time){
   lines.push(`DTSTART:${stamp(i.date,i.time)}`);
   const [h,m]=i.time.split(':').map(Number),end=h*60+m+(i.minutes??30);
   const endDate=end>=1440?addDays(i.date,1):i.date,endTime=`${String(Math.floor(end%1440/60)).padStart(2,'0')}:${String(end%60).padStart(2,'0')}`;
   lines.push(`DTEND:${stamp(endDate,endTime)}`);
  }else{lines.push(`DTSTART;VALUE=DATE:${stamp(i.date)}`,`DTEND;VALUE=DATE:${stamp(addDays(i.end??i.date,1))}`);}
  lines.push(`SUMMARY:${esc(i.kind==='study'?`Study: ${i.title}`:i.title)}`);
  if(i.link)lines.push(`URL:${i.link}`);
  lines.push('END:VEVENT');
 }
 lines.push('END:VCALENDAR');
 return lines.join('\r\n')+'\r\n';
}
