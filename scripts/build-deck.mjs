import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { slides } from './deck-content.mjs';
const root=path.resolve(import.meta.dirname,'..');
const runtime='C:/Users/matth/.cache/codex-runtimes/codex-primary-runtime/dependencies';
process.env.RUNTIME_NODE_MODULES=path.join(runtime,'node/node_modules');
const require=createRequire(path.join(runtime,'node/node_modules/package.json'));
const {Presentation,PresentationFile}=await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href);
const {GlobalFonts,createCanvas}=require('@napi-rs/canvas');
const sharp=require('sharp');
const skill='C:/Users/matth/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const build=path.join(root,'.refs/deck-build'),out=path.join(root,'output');
await fs.mkdir(build,{recursive:true});await fs.mkdir(out,{recursive:true});
for(const f of ['Regular','SemiBold','Bold'])GlobalFonts.registerFromPath(path.join(root,`.refs/fonts/PlusJakartaSans-${f}.ttf`),'Plus Jakarta Sans');
const logo=await sharp(path.join(root,'public/khan-academy.svg')).resize(704,112).png().toBuffer();
await fs.writeFile(path.join(build,'khan-logo.png'),logo);
const deploy=JSON.parse((await fs.readFile(path.join(root,'docs/deployment.json'),'utf8')).replace(/^\uFEFF/,''));
const URL=deploy.productUrl,clean=t=>t.replaceAll('−','-').replaceAll('–','-').replaceAll('—',': ');
const C={ink:'#151521',muted:'#505A6B',blue:'#5753FA',teal:'#087E70',line:'#D8E2EF',pale:'#F4F7FC',orange:'#B94F18',white:'#FFFFFF'};
const deck=Presentation.create({slideSize:{width:1280,height:720}}),manifest=[];
const measure=createCanvas(2,2).getContext('2d');
function wrap(t,width,size,bold){measure.font=`${bold?700:400} ${size}px "Plus Jakarta Sans"`;return clean(t).split('\n').map(line=>{let rows=[],row='';for(const word of line.split(' ')){if(row&&measure.measureText(row+' '+word).width>width){rows.push(row);row=word;}else row+=(row?' ':'')+word;}rows.push(row);return rows.join('\n');}).join('\n');}
function text(sl,t,x,y,w,h,size=28,bold=false,color=C.ink,link){t=wrap(t,w,size,bold);const shape=sl.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});shape.text=link?[[{run:t,link:{uri:link,isExternal:true}}]]:t;shape.text.style={typeface:'Plus Jakarta Sans',fontSize:size,bold,color,autoFit:'none',wrap:'none',insets:{top:0,bottom:0,left:0,right:0}};manifest.at(-1).elements.push({type:'text',text:t,x,y,w,h,size,bold,color,link});return shape;}
function rect(sl,x,y,w,h,fill,line='none',radius=0){sl.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:line==='none'?0:1},borderRadius:radius});manifest.at(-1).elements.push({type:'rect',x,y,w,h,fill,line,radius});}
function circle(sl,x,y,r,fill,line=C.teal){sl.shapes.add({geometry:'ellipse',position:{left:x-r,top:y-r,width:r*2,height:r*2},fill,line:{fill:line,width:2}});manifest.at(-1).elements.push({type:'circle',x,y,r,fill,line});}
function poly(sl,points,color=C.teal,width=3){const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);const x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x||1,h=Math.max(...ys)-y||1;if(h<=1){rect(sl,x,y-width/2,w,width,color);return;}sl.shapes.add({geometry:'custom',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:color,width},customPaths:[{width:w,height:h,commands:points.map((p,i)=>({[i?'lineTo':'moveTo']:{x:p[0]-x,y:p[1]-y}}))}]});manifest.at(-1).elements.push({type:'poly',points,color,width});}
function route(sl,coords,color=C.teal){let pts=[];for(let i=1;i<coords.length;i++){const a=coords[i-1],b=coords[i],mx=(a[0]+b[0])/2;for(let k=0;k<=20;k++){const t=k/20,u=1-t;pts.push([u*u*u*a[0]+3*u*u*t*mx+3*u*t*t*mx+t*t*t*b[0],u*u*u*a[1]+3*u*u*t*a[1]+3*u*t*t*b[1]+t*t*t*b[1]]);}}poly(sl,pts,color,4);coords.forEach((p,i)=>circle(sl,p[0],p[1],i===0?7:10,i===0?color:C.white,color));}
function heading(sl,s,i){text(sl,s.title,72,65,1110,156,52,true);text(sl,`${String(i+1).padStart(2,'0')} / 15`,1150,666,80,22,15,false,C.muted);}
const sources=[
 ['Official KEIC 2026 rules','https://enactus.ph/2026-national-competition/khan-academy-challenge'],
 ['Live application form','https://form.typeform.com/to/bJw9THj3'],
 ['Khan teacher reports','https://support.khanacademy.org/hc/en-us/articles/360031129891-What-reporting-options-are-available-on-Khan-Academy-for-teachers-to-track-student-performance'],
 ['Khan material-use guidance','https://support.khanacademy.org/hc/en-us/articles/202262954-Can-I-use-Khan-Academy-s-videos-name-materials-links-in-my-project'],
 ['ALEKS custom objectives','https://www.mheducation.com/unitas/school/explore/sites/aleks/customizing-custom-objectives.pdf'],
 ['Gemini study notebooks (June 2026)','https://blog.google/innovation-and-ai/products/gemini-app/gemini-study-notebooks/'],
 ['IES learning practice guide','https://ies.ed.gov/ncee/wwc/practiceguide/1'],
 ['Spacing and retrieval (2022)','https://doi.org/10.1038/s44159-022-00089-1'],
 ['Confidence assessment (Foster)','https://doi.org/10.1007/s10763-021-10207-9'],
 ['Self-Determination Theory in education','https://selfdeterminationtheory.org/topics/application-education/']
];
for(let i=0;i<slides.length;i++){
 const s=slides[i],sl=deck.slides.add();sl.background.fill=C.white;manifest.push({number:i+1,title:s.title,elements:[]});
 sl.speakerNotes.textFrame.setText(`${s.copy.join('\n')}\n\nProduct: ${URL}\n\nSupporting research:\n${sources.filter((_,j)=>![0,1,3].includes(j)).map(([t,u])=>t+': '+u).join('\n')}`);
 if(i!==0)heading(sl,s,i);
 if(i===0){text(sl,'backtrack.',72,62,500,55,34,true);text(sl,'Your GPS recalculates.',72,164,1120,110,66,true);text(sl,'Why doesn’t learning?',72,255,1120,110,66,true,C.blue);text(sl,'A new route to the lesson you need now.',75,375,820,70,30,false,C.muted);route(sl,[[770,530],[925,595],[1100,530]]);text(sl,'Try BACKTRACK',75,498,500,50,28,true,C.blue,URL);text(sl,deploy.url.replace('https://',''),75,550,650,40,21,false,C.muted,deploy.url);text(sl,'University of the Philippines Manila',75,646,900,30,21,false,C.muted);}
 if(i===1){text(sl,'TODAY’S CLASS',72,244,500,30,18,true,C.teal);text(sl,'x² + 7x + 12 = 0',72,290,1100,115,70,true);text(sl,'A learner can be stuck here because of a step underneath.',72,434,800,80,30,false,C.muted);route(sl,[[80,575],[410,595],[755,575]]);text(sl,'Multiplying brackets?',110,615,400,30,22,false,C.muted);text(sl,'Finding factors?',520,615,400,30,22,false,C.muted);}
 if(i===2){route(sl,[[100,330],[395,485],[715,405],[1110,330]],C.teal);['Current goal','Check a prerequisite','Find useful practice','Fresh return task'].forEach((t,j)=>{const [x,y]=[[72,258],[270,520],[605,450],[952,258]][j];text(sl,t,x,y,260,70,25,true,j===1?C.orange:C.ink);});text(sl,'A wrong answer opens an investigation. It is not a permanent label.',72,600,1060,44,23,false,C.muted);}
 if(i===3){text(sl,'BEFORE THE CHECKS',72,240,500,30,18,true,C.muted);route(sl,[[92,315],[390,415],[715,315]]);text(sl,'Possible review',285,445,380,40,24,false,C.muted);text(sl,'AFTER TWO FRESH CHECKS',72,535,600,30,18,true,C.teal);route(sl,[[92,595],[715,595]]);text(sl,'One review removed.',855,282,340,110,40,true,C.teal);text(sl,'Earlier progress stays.',855,408,330,70,24,false,C.muted);text(sl,'Try BACKTRACK',855,530,330,45,25,true,C.blue,URL);}
 if(i===4){sl.images.add({blob:logo,contentType:'image/png',position:{left:72,top:229,width:352,height:56},alt:'Khan Academy official logo',fit:'contain'});manifest.at(-1).elements.push({type:'image',path:path.join(build,'khan-logo.png'),x:72,y:229,w:352,h:56});const labels=['Watch here','Practice on Khan','Return here'],desc=['Official Khan lessons inside the route.','Matched exercises in an existing learning environment.','Fresh checks reconnect the route.'];labels.forEach((t,j)=>{const x=72+j*395;text(sl,String(j+1).padStart(2,'0'),x,335,100,65,44,true,C.teal);text(sl,t,x,416,345,50,29,true);text(sl,desc[j],x,483,345,115,25,false,C.muted);});}
 if(i===5){text(sl,'FRESH DESTINATION TASK',72,252,700,30,18,true,C.teal);text(sl,'x² + 11x + 28 = 0',72,306,1120,100,64,true);text(sl,'x = -4 or x = -7',72,425,850,90,48,true,C.teal);text(sl,'The route ends with something the learner can demonstrate.',72,558,1050,75,27,false,C.muted);}
 if(i===6){text(sl,'Retained reentry',72,238,1040,60,36,true,C.teal);text(sl,'Pass after the route.',72,328,1080,70,43,true);text(sl,'Pass again 7–14 days later.',72,417,1090,70,43,true,C.blue);rect(sl,72,525,1110,2,C.line);text(sl,'Report against every enrolled baseline-blocked learner.',72,559,1080,65,27,false,C.muted);}
 if(i===7){text(sl,'80–120',72,247,580,110,74,true,C.teal);text(sl,'learners across 2–3 cohorts',72,355,800,65,31,true);text(sl,'Planning targets, subject to agreements, permissions and access.',72,424,1080,60,24,false,C.muted);const months=[['NOV','Review + baseline'],['DEC–JAN','First cycle + comparison'],['FEB','Second educator'],['MAR','Follow-up + handover']];months.forEach(([a,b],j)=>{const x=72+j*287;text(sl,a,x,524,260,35,22,true,C.blue);text(sl,b,x,572,258,62,23,false);});}
 if(i===8){text(sl,'Teacher-selected\nKhan practice',72,246,520,110,36,true);text(sl,'BACKTRACK-supported\nKhan practice',690,246,520,110,36,true,C.blue);rect(sl,621,237,2,275,C.line);text(sl,'Comparable access time and adult support.',72,412,1110,65,29,false,C.muted);text(sl,'Fresh post and delayed tasks in both groups.',72,477,1110,65,29,false,C.muted);text(sl,'Randomized delayed start where feasible. Otherwise report feasibility, not causation.',72,573,1100,65,23,false,C.muted);}
 if(i===9){[['ALEKS','Objectives and prerequisites'],['Gemini','Goal-based diagnosis and study plans'],['Khan','Personalization and learning infrastructure']].forEach(([a,b],j)=>{text(sl,a,72,244+j*89,225,55,31,true);text(sl,b,335,250+j*89,840,60,28,false,C.muted);});rect(sl,72,530,1110,2,C.line);text(sl,'Our opportunity: a repeatable Khan recovery routine that schools can inspect and test.',72,560,1110,75,28,true,C.teal);}
 if(i===10){s.copy.slice(0,4).forEach((t,j)=>{text(sl,String(j+1).padStart(2,'0'),72,242+j*83,80,45,26,true,C.teal);text(sl,t,165,240+j*83,1030,65,29,false);});text(sl,s.copy[4],72,602,1100,42,24,true,C.blue);}
 if(i===11){s.copy.slice(0,5).forEach((t,j)=>{const x=j<3?72:695,y=245+(j<3?j:j-3)*105;text(sl,String(j+1).padStart(2,'0'),x,y,75,40,24,true,C.teal);text(sl,t,x+85,y,440,76,28,true);});text(sl,s.copy[5],72,595,1100,45,25,false,C.muted);}
 if(i===12){s.copy.slice(0,8).forEach((t,j)=>{const x=j<4?72:705,y=244+(j%4)*79;const parts=t.split(' · ');text(sl,parts[0],x,y,360,40,23,false,C.muted);text(sl,parts[1],x+345,y,180,45,27,true,C.ink);});text(sl,s.copy[8],72,602,1110,48,21,false,C.muted);}
 if(i===13){text(sl,'Try BACKTRACK',72,259,1110,68,43,true,C.blue,URL);text(sl,deploy.url.replace('https://',''),72,337,1090,44,26,false,C.muted,deploy.url);text(sl,'University of the Philippines Manila',72,428,1100,52,29,true);text(sl,'Matthew Labrador · Paul Recio · Harry Gomez',72,489,1100,44,25,false);text(sl,'Coach: Justin Mesias',72,540,1000,40,24,false,C.muted);text(sl,s.copy[3],72,607,1110,42,21,false,C.muted);}
 if(i===14){sources.filter((_,j)=>![0,1,3].includes(j)).forEach(([title,url],j)=>{const x=j<4?72:676,y=258+(j%4)*82;text(sl,title,x,y,515,62,23,false,C.blue,url);});}
 if(![0,13,14].includes(i)){const links=i===4?[sources[2]]:i===6?[sources[6],sources[7]]:i===9?[sources[4],sources[5]]:[];if(links.length)links.forEach(([t,u],j)=>text(sl,t,72+j*440,666,415,24,14,false,C.muted,u));else if([2,3,5].includes(i))text(sl,i===5?'Worked example':'Example route',72,666,1050,24,14,false,C.muted);}
}
await fs.writeFile(path.join(build,'deck-layout.json'),JSON.stringify(manifest,null,2));
const candidate=path.join(build,'candidate.pptx');await(await PresentationFile.exportPptx(deck)).save(candidate);
const embeddedCandidate=path.join(build,'candidate-embedded.pptx');
execFileSync('C:/Users/matth/AppData/Local/Programs/Python/Python312/python.exe',[path.join(root,'scripts/embed-fonts.py'),candidate,embeddedCandidate],{stdio:'inherit'});
for(let i=0;i<15;i++){const img=await deck.export({slide:deck.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(build,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await img.arrayBuffer()));}
const result=await finalizePresentation({workspaceDir:root,candidatePath:embeddedCandidate,finalPath:path.join(out,'BACKTRACK_KEIC_2026_Embedded.pptx'),pythonExecutable:path.join(runtime,'python/python.exe'),integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],explicitTotalSlideCount:15,fontPolicy:{basis:'design',families:['Plus Jakarta Sans']},verifyArtifactToolImport:true,receiptPath:path.join(build,'validation-embedded.json')});
console.log(JSON.stringify(result));
