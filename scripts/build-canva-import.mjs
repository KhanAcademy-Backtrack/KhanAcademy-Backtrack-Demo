import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const slides=JSON.parse(await fs.readFile(path.join(root,'.refs/deck-build/deck-layout.json'),'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const data=async p=>`data:${p.endsWith('.jpg')?'image/jpeg':p.endsWith('.ttf')?'font/ttf':'image/png'};base64,${(await fs.readFile(p)).toString('base64')}`;
const regular=await data(path.join(root,'.refs/fonts/PlusJakartaSans-Regular.ttf'));
const bold=await data(path.join(root,'.refs/fonts/PlusJakartaSans-Bold.ttf'));
const paper=await data(path.join(root,'.refs/deck-build/paper.jpg'));
const pages=[];
const pos=e=>`position:absolute;left:${e.x}px;top:${e.y}px;width:${e.w}px;height:${e.h}px;`;
function simplify(points,tolerance=1.2){
 if(points.length<=2)return points;
 const a=points[0],b=points.at(-1),dx=b[0]-a[0],dy=b[1]-a[1],den=Math.hypot(dx,dy)||1;let max=0,index=0;
 for(let i=1;i<points.length-1;i++){const p=points[i],d=Math.abs(dy*p[0]-dx*p[1]+b[0]*a[1]-b[1]*a[0])/den;if(d>max){max=d;index=i;}}
 return max>tolerance?[...simplify(points.slice(0,index+1),tolerance).slice(0,-1),...simplify(points.slice(index),tolerance)]:[a,b];
}
for(const s of slides){
 const elems=[];
 for(const e of s.elements){
  if(e.type==='image'&&e.x===0&&e.y===0&&e.w===1280)continue;
  if(e.type==='text')elems.push(`<div style="${pos(e)}font-size:${e.size}px;font-weight:${e.bold?700:400};color:${e.color};text-align:${e.align??'left'};line-height:1.22;white-space:pre-wrap;">${e.link?`<a href="${esc(e.link)}" style="color:inherit;text-decoration:none">${esc(e.text)}</a>`:esc(e.text)}</div>`);
  if(e.type==='rect')elems.push(`<div style="${pos(e)}background:${e.fill};border:${e.line==='none'?'0':`1px solid ${e.line}`};border-radius:${e.radius??0}px"></div>`);
  if(e.type==='circle')elems.push(`<div style="position:absolute;left:${e.x-e.r}px;top:${e.y-e.r}px;width:${e.r*2}px;height:${e.r*2}px;border-radius:50%;background:${e.fill};border:${e.line==='none'?'0':`${e.width??2}px solid ${e.line}`}"></div>`);
  if(e.type==='poly'){
   const points=simplify(e.points);
   for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
    elems.push(`<div aria-label="Route connector" style="position:absolute;left:${a[0]}px;top:${a[1]-e.width/2}px;width:${length+1}px;height:${e.width}px;background:${e.color};border-radius:${e.width}px;transform-origin:0 50%;transform:rotate(${angle}deg)"></div>`);
   }
  }
  if(e.type==='image')elems.push(`<img alt="${e.path.includes('demo-qr')?'Scan to try BACKTRACK':'Khan Academy'}" style="${pos(e)}object-fit:contain" src="${await data(e.path)}">`);
  if(e.type==='table'){
   let row='';for(let r=0;r<e.values.length;r++){row+='<tr>';for(let c=0;c<e.values[r].length;c++){const emphasis=r===0||r===e.values.length-1;row+=`<td style="height:${e.h/e.values.length}px;width:${e.widths[c]}px;padding:3px 10px;border:1px solid ${e.colors.line};background:${emphasis?e.colors.pale:e.colors.white};font-size:${r===0?e.headerSize:e.fontSize}px;font-weight:${c===1||emphasis?700:400};color:${r===e.values.length-1?e.colors.blue:e.colors.ink}">${esc(e.values[r][c])}</td>`;}row+='</tr>';}
   elems.push(`<table aria-label="Pilot budget in Philippine pesos" style="${pos(e)}border-collapse:collapse;table-layout:fixed">${row}</table>`);
  }
 }
 pages.push(`<section data-document-role="page" data-label="${esc(s.title)}" data-speaker-notes="${esc('BACKTRACK: '+s.title)}" class="slide">${elems.join('\n')}</section>`);
}
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>BACKTRACK KEIC 2026 - Editable presentation</title><style>@font-face{font-family:'Plus Jakarta Sans';src:url('${regular}');font-weight:400}@font-face{font-family:'Plus Jakarta Sans';src:url('${bold}');font-weight:700}*{box-sizing:border-box}body{margin:0;background:white;font-family:'Plus Jakarta Sans',Arial,sans-serif}.slide{position:relative;width:1280px;height:720px;overflow:hidden;background:white url('${paper}') center/cover no-repeat}a{color:inherit}table{font-family:inherit}</style></head><body>${pages.join('\n')}</body></html>`;
const output=path.join(root,'output/BACKTRACK_CANVA_IMPORT.html');await fs.writeFile(output,html);console.log(JSON.stringify({path:output,pages:pages.length,bytes:Buffer.byteLength(html)}));
