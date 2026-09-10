import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const runtime='C:/Users/matth/.cache/codex-runtimes/codex-primary-runtime/dependencies';
process.env.RUNTIME_NODE_MODULES=path.join(runtime,'node/node_modules');
const req=createRequire(path.join(runtime,'node/node_modules/package.json'));
const {Presentation,PresentationFile}=await import(pathToFileURL(req.resolve('@oai/artifact-tool')).href);
const {GlobalFonts,createCanvas}=req('@napi-rs/canvas');const sharp=req('sharp');
const skill='C:/Users/matth/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const build=path.join(root,'.refs/deck-build'),out=path.join(root,'output');
await fs.mkdir(build,{recursive:true});
for(const f of ['Regular','Bold'])GlobalFonts.registerFromPath(path.join(root,`.refs/fonts/PlusJakartaSans-${f}.ttf`),'Plus Jakarta Sans');
const ctx=createCanvas(1,1).getContext('2d');
const deploy=JSON.parse((await fs.readFile(path.join(root,'docs/deployment.json'),'utf8')).replace(/^\uFEFF/,''));
const URL=deploy.productUrl,host=deploy.url.replace('https://','');
const paper=await sharp(path.join(root,'output/deck-assets/paper.png')).resize(1600,900,{fit:'cover'}).jpeg({quality:88}).toBuffer();
const logo=await sharp(path.join(root,'public/khan-academy.svg')).resize(704,112).png().toBuffer();
await fs.writeFile(path.join(build,'paper.jpg'),paper);await fs.writeFile(path.join(build,'khan-logo.png'),logo);
const qr=await fs.readFile(path.join(root,'output/deck-assets/demo-qr.png'));
const C={ink:'#151521',muted:'#536073',blue:'#5753FA',teal:'#087E70',mint:'#D9F2EA',pale:'#F0EFFF',line:'#CCD7E4',orange:'#C96331',white:'#FFFFFF'};
const deck=Presentation.create({slideSize:{width:1280,height:720}}),manifest=[];let current;
const clean=t=>t.replaceAll('−','-').replaceAll('–','-').replaceAll('—',': ');
function wrap(text,width,size,bold){ctx.font=`${bold?700:400} ${size}px "Plus Jakarta Sans"`;return clean(text).split('\n').map(line=>{const rows=[];let row='';for(const word of line.split(' ')){if(row&&ctx.measureText(row+' '+word).width>width){rows.push(row);row=word;}else row+=(row?' ':'')+word;}rows.push(row);return rows.join('\n');}).join('\n');}
function text(t,x,y,w,size=28,bold=false,color=C.ink,link,h,align='left'){t=wrap(t,w,size,bold);h??=t.split('\n').length*size*1.24+8;const shape=current.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});shape.text=link?[[{run:t,textStyle:{color,underline:'none'},link:{uri:link,isExternal:true}}]]:t;shape.text.style={typeface:'Plus Jakarta Sans',fontSize:size,bold,color,alignment:align,autoFit:'none',wrap:'none',insets:{top:0,left:0,bottom:0,right:0}};manifest.at(-1).elements.push({type:'text',text:t,x,y,w,h,size,bold,color,link,align});return shape;}
function rect(x,y,w,h,fill,line='none',radius=0){current.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:line==='none'?0:1},borderRadius:radius});manifest.at(-1).elements.push({type:'rect',x,y,w,h,fill,line,radius});}
function circle(x,y,r,fill=C.white,line=C.teal,width=3){current.shapes.add({geometry:'ellipse',position:{left:x-r,top:y-r,width:r*2,height:r*2},fill,line:{fill:line,width}});manifest.at(-1).elements.push({type:'circle',x,y,r,fill,line,width});}
function poly(points,color=C.teal,width=5){const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x||1,h=Math.max(...ys)-y||1;if(h<1.1){rect(x,y-width/2,w,width,color);return;}current.shapes.add({geometry:'custom',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:color,width},customPaths:[{width:w,height:h,commands:points.map((p,i)=>({[i?'lineTo':'moveTo']:{x:p[0]-x,y:p[1]-y}}))}]});manifest.at(-1).elements.push({type:'poly',points,color,width});}
function route(coords,color=C.teal,width=6,nodes=true){const pts=[];for(let i=1;i<coords.length;i++){const a=coords[i-1],b=coords[i],mx=(a[0]+b[0])/2;for(let k=0;k<=28;k++){const t=k/28,u=1-t;pts.push([u*u*u*a[0]+3*u*u*t*mx+3*u*t*t*mx+t*t*t*b[0],u*u*u*a[1]+3*u*u*t*a[1]+3*u*t*t*b[1]+t*t*t*b[1]]);}}poly(pts,color,width);if(nodes)coords.forEach((p,i)=>circle(p[0],p[1],i===0?7:11,i===0?color:C.white,color));}
function imageAsset(bytes,file,x,y,w,h,alt){current.images.add({blob:bytes,contentType:file.endsWith('.jpg')?'image/jpeg':'image/png',position:{left:x,top:y,width:w,height:h},fit:'contain',alt});manifest.at(-1).elements.push({type:'image',path:file,x,y,w,h});}
function page(title,section){current=deck.slides.add();current.background.fill=C.white;manifest.push({number:manifest.length+1,title,elements:[]});imageAsset(paper,path.join(build,'paper.jpg'),0,0,1280,720,'Subtle white paper texture');if(section)text(section.toUpperCase(),64,44,700,15,true,C.teal);text(String(manifest.length).padStart(2,'0'),1180,667,45,15,false,C.muted);return current;}
function title(t,w=1100,size=52){text(t,64,85,w,size,true);}
function source(t,u,x=64){text(t,x,672,490,13,false,C.muted,u);}
const sources={reports:['Khan Academy teacher reports','https://support.khanacademy.org/hc/en-us/articles/360031129891-What-reporting-options-are-available-on-Khan-Academy-for-teachers-to-track-student-performance'],aleks:['ALEKS custom objectives','https://www.mheducation.com/unitas/school/explore/sites/aleks/customizing-custom-objectives.pdf'],gemini:['Gemini study notebooks · 2026','https://blog.google/innovation-and-ai/products/gemini-app/gemini-study-notebooks/'],ies:['IES learning practice guide','https://ies.ed.gov/ncee/wwc/practiceguide/1'],retrieval:['Spacing and retrieval · 2022','https://doi.org/10.1038/s44159-022-00089-1'],confidence:['Confidence assessment · Foster','https://doi.org/10.1007/s10763-021-10207-9'],autonomy:['Self-Determination Theory in education','https://selfdeterminationtheory.org/topics/application-education/']};

function head(t,size=52){text(t,64,64,1152,size,true);}
function centered(t,x,y,w,size=28,bold=false,color=C.ink,link){return text(t,x,y,w,size,bold,color,link,undefined,'center');}
function arrow(x,y,w=70,color=C.teal){rect(x,y-2,w-10,4,color);poly([[x+w-15,y-9],[x+w,y],[x+w-15,y+9]],color,3);}
function step(n,label,x,y,w=244,color=C.teal){circle(x+w/2,y,29,color,'none',0);centered(String(n),x+w/2-20,y-20,40,30,true,C.white);centered(label,x,y+51,w,29,true);}

// 01: One focal statement, with a direct product definition.
page('Stuck on today’s lesson. Unsure what to review.');
text('backtrack.',64,56,600,35,true,C.teal);
text('Stuck on today’s lesson.',64,203,1152,72,true);
text('Unsure what to review.',64,302,1152,72,true,C.blue);
text('Find the missing step. Get back to the lesson.',64,462,1152,34,false,C.muted);
text('University of the Philippines Manila',64,641,1000,23,false,C.muted);

// 02: A single left-to-right example, without a competing text column.
page('Today’s task can hide an earlier gap');head('Today’s task can hide an earlier gap',51);
centered('01  THE TASK',64,234,488,21,true,C.blue);
rect(64,285,488,230,C.pale);
centered('Solve this equation',88,313,440,29,true);
centered('x² + 7x + 12 = 0',88,380,440,42,true);
centered('The learner gets stuck.',88,459,440,25,false,C.muted);
arrow(584,401,102,C.orange);
centered('02  A POSSIBLE MISSING STEP',728,234,488,21,true,C.teal);
rect(728,285,488,230,C.mint);
centered('Find the factor pair',752,313,440,29,true);
centered('Multiply to 12.\nAdd to 7.',752,374,440,34,true,C.teal);
centered('BACKTRACK checks what to work on first.',64,583,1152,33,true,C.teal);

// 03: An unmistakable four-stage reading order.
page('Four steps back to the lesson');head('Four steps back to the lesson');
const stages=['Try today’s\ntask','Find a useful\nearlier step','Learn + practise\nwith Khan','Try a fresh\ncurrent task'];
stages.forEach((label,i)=>{const x=64+i*304;step(i+1,label,x,331,240,i===1?C.orange:i===3?C.blue:C.teal);if(i<3)arrow(x+190,331,102,C.line);});
centered('The goal stays. The route changes with the learner’s answers.',64,573,1152,29,false,C.muted);

// 04: Two short horizontal lanes show the actual mechanic.
page('Your answers change the route');head('Your answers change the route');
text('Already know it?',64,264,335,34,true,C.teal);arrow(395,288,160,C.teal);rect(589,240,627,99,C.mint);centered('Skip that review',610,262,585,38,true,C.teal);
text('Need help?',64,438,300,34,true,C.orange);arrow(367,465,117,C.orange);rect(510,415,306,102,'#F8EADF');centered('Khan repair',526,444,274,31,true,C.orange);arrow(843,465,91,C.orange);rect(960,415,256,102,C.pale);centered('Fresh check',968,444,240,30,true,C.blue);
centered('The reward is less repetition.',64,608,1152,35,true);

// 05: One focused learning stop, with a concrete factoring example.
page('Khan material, focused on the missing step');head('Khan material, focused on the missing step',46);
imageAsset(logo,path.join(build,'khan-logo.png'),465,164,350,56,'Khan Academy');
const repairs=[['1','Watch the key part','2:22–3:56\nMatch sum and product'],['2','Try the step here','Use the idea with\ndifferent numbers'],['3','Return to the goal','Solve a fresh\nquadratic equation']];
repairs.forEach(([n,t,b],i)=>{const x=64+i*408;rect(x,281,336,250,i===1?C.mint:C.pale);text(n,x+26,302,60,34,true,C.blue);text(t,x+26,367,289,27,true);text(b,x+26,431,289,24,false,C.muted);if(i<2)arrow(x+355,405,35,C.line);});
centered('Short enough to use now. More Khan practice when they need it.',64,591,1152,27,false,C.muted);
source('Khan Academy: factoring quadratics', 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:factor-quadratics-intro/v/factoring-simple-quadratic-expression');

// 06: A single large task makes the return concrete.
page('Back to the skill that stopped them');head('Back to the skill that stopped them');
centered('FRESH CURRENT-LEVEL TASK',64,241,1152,20,true,C.teal);
centered('x² + 11x + 28 = 0',64,308,1152,78,true);
centered('x = -4  or  x = -7',64,445,1152,55,true,C.teal);
centered('New numbers. The same skill they came to recover.',64,601,1152,29,false,C.muted);

// 07: Dedicated, clickable demo invitation.
page('Try BACKTRACK');head('Try the demo. Watch the route change.',52);
text('Choose “I don’t know yet”\nto see a different way forward.',64,237,758,37,false,C.muted);
rect(64,383,738,112,C.blue,'none',10);centered('Try BACKTRACK',86,406,694,46,true,C.white,URL);
centered(host,64,530,738,25,false,C.blue,deploy.url);
imageAsset(qr,path.join(root,'output/deck-assets/demo-qr.png'),949,314,235,235,'Scan to try BACKTRACK');centered('Scan to start',918,570,297,22,true,C.muted);
text('A few sample routes to help you picture BACKTRACK.\nThe full product is still in development.',64,615,780,20,false,C.muted);

// 08: A simple assessment sequence explains the outcome.
page('Can they still do it next week?');head('Can they still do it next week?',56);
step(1,'Stuck before\nthe route',64,313,270,C.orange);arrow(298,313,98,C.line);
step(2,'Pass a fresh task\nafter practice',472,313,270,C.teal);arrow(706,313,98,C.line);
step(3,'Pass again\n7–14 days later',880,313,270,C.blue);
centered('Retained reentry',64,559,1152,35,true,C.teal);
centered('Count everyone who started unable to do the task.',64,617,1152,25,false,C.muted);source(...sources.retrieval);

// 09: Date labels and actions share the same aligned columns.
page('A five-month school pilot');head('A five-month school pilot',57);
text('80–120 learners across 2–3 cohorts',64,157,1152,31,false,C.teal);
const stops=[['NOV','Review maps\n+ baseline'],['DEC','First school\ncycle'],['JAN','Compare\n+ improve'],['FEB','New educator\n+ repeat'],['MAR','Follow-up\n+ handover']];
rect(148,337,963,4,C.line);stops.forEach(([month,body],i)=>{const x=64+i*240;circle(x+90,339,42,i%2?C.pale:C.mint,'none',0);centered(month,x+37,322,106,24,true,i%2?C.blue:C.teal);centered(body,x,427,210,25,true);});
text('November 2026–March 2027',64,589,1152,31,true);text('Pilot targets, fitted to each school’s access and timetable.',64,641,1090,22,false,C.muted);

// 10: Centred comparison lanes converge on one clear assessment box.
page('Does the route add value?');head('Does the route add value?',57);
rect(64,258,543,152,C.mint);rect(646,258,570,152,C.pale);
centered('Khan practice',88,282,495,37,true,C.teal);centered('Selected by the teacher',88,353,495,24,false,C.muted);
centered('Khan + BACKTRACK',670,282,522,37,true,C.blue);centered('Practice tied to the recovery route',670,353,522,24,false,C.muted);
poly([[335,410],[335,475],[640,475],[640,521]],C.teal,4);poly([[930,410],[930,475],[640,475]],C.blue,4);
rect(190,521,900,86,C.teal);centered('The same fresh assessments',213,541,854,38,true,C.white);
centered('After practice, then 7–14 days later. Similar time and support.',64,643,1152,24,false,C.muted);

// 11: The distinctive motivation idea gets its own focal slide.
page('The route is the reward');head('The route is the reward',63);
text('What the learner does',64,223,430,21,true,C.muted);text('What changes',694,223,520,21,true,C.muted);
const rewards=[['Know the step','Skip its review',C.teal],['Repair a gap','Move closer to the goal',C.orange],['Come back later','Keep earlier progress',C.blue]];
rewards.forEach(([a,b,c],i)=>{const y=304+i*114;text(a,64,y,440,34,true,c);arrow(523,y+24,113,c);text(b,694,y,522,34,true);if(i<2)rect(64,y+83,1152,1,C.line);});
text('Progress changes what you need to do next.',64,651,1110,25,false,C.muted);

// 12: Separate the scale of the idea from the simple replication kit.
page('One routine. Many learning goals.');head('One routine. Many learning goals.',53);
const goals=['Fractions','Algebra','Graphs'];goals.forEach((g,i)=>{const x=64+i*408;rect(x,245,336,93,i===1?C.pale:C.mint);centered(g,x+16,267,304,35,true,i===1?C.blue:C.teal);});
centered('Every new destination uses a reusable kit',64,395,1152,33,true);
centered('A reviewed map + fresh checks + matched Khan material',64,461,1152,28,false,C.muted);
centered('Another educator can run the same recovery routine.',64,565,1152,30,true,C.teal);
centered('For classes, self-study, and the next topic a learner needs.',64,627,1152,25,false,C.muted);

// 13: The table and its priority figure stay native and editable.
page('A budget built around learners');head('A budget built around learners',54);
text('PHP 100,000',64,218,570,48,true);text('60%',64,310,560,116,true,C.teal);text('for learning review,\naccess and evaluation',64,467,536,31,true);text('Learner access stays free.',64,601,580,25,false,C.muted);
const budget=[['Allocation','PHP'],['Learning review','24,000'],['Access support','18,000'],['Evaluation','18,000'],['Deployment','16,000'],['Product operations','8,000'],['Teacher onboarding','8,000'],['Recruitment content','3,000'],['Contingency','5,000'],['Total','100,000']];
const table=current.tables.add({rows:10,columns:2,left:665,top:214,width:544,height:420,columnWidths:[376,168],values:budget});table.borders.assign({fill:C.line,width:.6});
for(let r=0;r<10;r++)for(let c=0;c<2;c++){const cell=table.getCell(r,c);cell.fill=r===0||r===9?C.pale:C.white;cell.text.style={typeface:'Plus Jakarta Sans',fontSize:r===0?18:22,bold:c===1||r===0||r===9,color:r===9?C.blue:C.ink,verticalAlignment:'middle',insets:{left:10,right:10,top:3,bottom:3}};}
manifest.at(-1).elements.push({type:'table',x:665,y:214,w:544,h:420,widths:[376,168],values:budget,fontSize:22,headerSize:18,colors:C});
if(budget.slice(1,-1).reduce((n,r)=>n+Number(r[1].replaceAll(',','')),0)!==100000)throw Error('Budget total');source('Planning allocation',null);

// 14: A single closing thought, then the team.
page('A route back to today’s lesson');
text('backtrack.',64,56,600,35,true,C.teal);
text('A route back to\ntoday’s lesson.',64,205,1152,82,true,C.blue);
text('University of the Philippines Manila',64,509,1152,31,true);
text('Matthew Labrador, Paul Recio, Harry Gomez',64,572,1152,27,false,C.muted);
text('Coach: Justin Mesias',64,629,1152,24,false,C.muted);

// 15: Quiet, clickable references in a consistent list.
page('Research behind the approach');head('Research behind the approach',54);
Object.values(sources).forEach(([t,u],i)=>{const x=i<4?64:681,y=242+(i%4)*98;text(t,x,y,535,24,false,C.blue,u);});


for(let i=0;i<manifest.length;i++){
 const m=manifest[i];deck.slides.items[i].speakerNotes.textFrame.setText(`${m.elements.filter(e=>e.type==='text').map(e=>e.text).join('\n')}\n\nProduct: ${URL}\n\nResearch:\n${Object.values(sources).map(([t,u])=>t+': '+u).join('\n')}\n\nTexture: ambientCG / Lennart Demes, Paper001, CC0. https://commons.wikimedia.org/wiki/File:Paper001_4K_Color.png`);
 for(const e of m.elements){if(e.type==='text'&&(e.y+e.h>713||e.x+e.w>1260))throw Error(`Text frame out of bounds on slide ${i+1}: ${e.text}`);}
}
await fs.writeFile(path.join(build,'deck-layout.json'),JSON.stringify(manifest,null,2));
const candidate=path.join(build,'candidate-refined.pptx'),embedded=path.join(build,'candidate-refined-embedded.pptx');await(await PresentationFile.exportPptx(deck)).save(candidate);
execFileSync('C:/Users/matth/AppData/Local/Programs/Python/Python312/python.exe',[path.join(root,'scripts/embed-fonts.py'),candidate,embedded],{stdio:'inherit'});
for(let i=0;i<15;i++){const png=await deck.export({slide:deck.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(build,`refined-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));}
const revision=Date.now();
const result=await finalizePresentation({workspaceDir:root,candidatePath:embedded,finalPath:path.join(out,`BACKTRACK_KEIC_2026_Refined_${revision}.pptx`),pythonExecutable:path.join(runtime,'python/python.exe'),integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit','--require-native-table-slide','13'],explicitTotalSlideCount:15,requiredNativeTableOwnerSlides:[13],fontPolicy:{basis:'design',families:['Plus Jakarta Sans']},verifyArtifactToolImport:true,receiptPath:path.join(build,`validation-refined-${revision}.json`)});
await fs.writeFile(path.join(build,'latest-refined.json'),JSON.stringify(result,null,2));
// Keep the current Canva exports intact; result.finalPath is a versioned backup.
console.log(JSON.stringify(result));
