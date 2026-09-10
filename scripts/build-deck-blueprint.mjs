import fs from 'node:fs';
import path from 'node:path';
if (!process.argv.includes('--from-backup')) throw new Error('The current slide script follows the Canva export. Pass --from-backup only to replace it with the earlier local design.');
const root=path.resolve(import.meta.dirname,'..');
const slides=JSON.parse(fs.readFileSync(path.join(root,'.refs/deck-build/deck-layout.json'),'utf8'));
if(slides.length!==15)throw Error('Deck must have 15 slides including references.');
const purpose=[
 'State the learner problem before introducing the GPS metaphor.',
 'Read one example from left to right: today’s task, a possible earlier gap, and the next useful action.',
 'Explain the four steps in a single numbered left-to-right flow.',
 'Compare a learner who can skip review with one who needs a repair.',
 'Show how Khan material is tailored to a specific learning need.',
 'Return to the original level of difficulty with fresh numbers.',
 'Invite the audience to try the demo through a clickable button, URL, or QR code. The small note identifies the sample demo as requested.',
 'Define the outcome in plain language before naming retained reentry.',
 'Show the five-month pilot sequence and its proposed cohort size.',
 'Compare two practice routines using the same fresh assessments.',
 'Explain the creative reward: progress changes the route and reduces repetition, while a later return preserves earlier work.',
 'Show how a common routine can extend across fractions, algebra, graphs, and further reviewed goals.',
 'Present the editable budget and its priorities, with the total verified.',
 'Resolve the opening problem and identify the team.',
 'Provide clickable research references.'
];
const body=slides.map((s,i)=>{
 const text=s.elements.filter(e=>e.type==='text'&&e.text!==String(i+1).padStart(2,'0'));
 const links=[...new Set(text.filter(e=>e.link).map(e=>e.link))];
 const table=s.elements.find(e=>e.type==='table');
 return `## Slide ${i+1}: ${s.title}\n\n${purpose[i]}\n\n### On-slide copy\n\n${text.map(e=>'- '+e.text.replaceAll('\n',' ')).join('\n')}${table?'\n'+table.values.map(r=>'- '+r.join(': ')).join('\n'):''}${links.length?'\n\n### Clickable links\n\n'+links.map(u=>'- '+u).join('\n'):''}`;
}).join('\n\n');
fs.writeFileSync(path.join(root,'docs/PITCH_DECK_15_SLIDES.md'),'# BACKTRACK: 15-slide pitch deck\n\nThe story begins with a learner who is stuck on today’s lesson and does not know what to review. The deck explains the recovery route, invites the audience to try it, and sets out the school pilot.\n\nExactly 15 slides. Slide 7 is dedicated to the demo. All visible URLs and source labels are clickable. The editable PowerPoint uses embedded Plus Jakarta Sans fonts, a subtle white paper texture, native flow diagrams, and a native budget table. Every content slide follows headline, main visual, takeaway. Violet identifies actions; teal identifies the route back to the goal.\n\n'+body+'\n');
