import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {offlineVideos} from './offline-videos.mjs';

const root=path.resolve(import.meta.dirname,'..');
const refs=path.join(root,'.refs');
await fs.mkdir(refs,{recursive:true});
const work=await fs.mkdtemp(path.join(refs,'offline-build-'));
const destination=path.join(root,'output/offline-site');
const videos=offlineVideos();
let previous=[];
try{previous=JSON.parse(await fs.readFile(path.join(destination,'offline-manifest.json'),'utf8')).videos;}catch{/* First preparation. */}

function run(args,extraEnv={}){
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,args,{cwd:work,env:{...process.env,NEXT_PUBLIC_OFFLINE_COPY:'1',NEXT_TELEMETRY_DISABLED:'1',...extraEnv},stdio:'inherit'});
    child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error(`Build exited ${code}`)));
  });
}
async function download(video,previewDir){
  const target=path.join(previewDir,`${video.id}.jpg`);
  try{
    // Reuse only a previous verified receipt and its matching downloaded poster.
    const receipt=previous.find(v=>v.id===video.id&&v.saved);
    if(receipt){await fs.copyFile(path.join(destination,'offline-video-previews',`${video.id}.jpg`),target);return {...receipt,...video};}
  }catch{/* First preparation, or an incomplete previous copy: fetch a fresh poster. */}
  try{
    const metadataUrl=`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${video.id}`)}&format=json`;
    let info={};
    try{
      const metadata=await fetch(metadataUrl,{signal:AbortSignal.timeout(15000)});
      if(metadata.ok)info=await metadata.json();
    }catch{/* A catalog video's public poster can still exist without oEmbed metadata. */}
    const thumbnail=new URL(info.thumbnail_url??`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`);
    if(thumbnail.protocol!=='https:'||thumbnail.hostname!=='i.ytimg.com'||!thumbnail.pathname.startsWith(`/vi/${video.id}/`))throw Error('Unexpected thumbnail source');
    const response=await fetch(thumbnail,{signal:AbortSignal.timeout(15000)});
    if(!response.ok||!response.headers.get('content-type')?.startsWith('image/jpeg'))throw Error(`Thumbnail response ${response.status}`);
    const bytes=Buffer.from(await response.arrayBuffer());
    if(bytes.length<500||bytes.length>2_000_000||bytes[0]!==0xff||bytes[1]!==0xd8)throw Error('Invalid JPEG thumbnail');
    await fs.writeFile(target,bytes);
    return {...video,saved:true,thumbnail:thumbnail.href,providerTitle:info.title,author:info.author_name,bytes:bytes.length,fetchedAt:new Date().toISOString()};
  }catch(error){
    console.warn(`Preview unavailable: ${video.id} (${error.message})`);
    return {...video,saved:false,error:error.message};
  }
}

try{
  // Build a source snapshot in its own cache; never overwrite a running next dev cache.
  for(const file of ['src','public','package.json','package-lock.json','next.config.ts','tsconfig.json','postcss.config.mjs']){
    await fs.cp(path.join(root,file),path.join(work,file),{recursive:true});
  }
  await fs.symlink(path.join(root,'node_modules'),path.join(work,'node_modules'),'dir');
  await fs.copyFile(path.join(root,'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),path.join(work,'public/pdf.worker.min.mjs'));
  const previewDir=path.join(work,'public/offline-video-previews');
  await fs.mkdir(previewDir,{recursive:true});
  console.log(`Saving previews for ${videos.length} reviewed videos…`);
  const receipts=[];let cursor=0;
  await Promise.all(Array.from({length:6},async()=>{
    while(cursor<videos.length){const video=videos[cursor++];receipts.push(await download(video,previewDir));if(receipts.length%50===0)console.log(`${receipts.length}/${videos.length} previews checked`);}
  }));
  const saved=receipts.filter(v=>v.saved).length;
  const manifest={preparedAt:new Date().toISOString(),videoFilesIncluded:false,previewsSaved:saved,previewsTotal:videos.length,videos:receipts.sort((a,b)=>a.id.localeCompare(b.id))};
  await fs.writeFile(path.join(work,'public/offline-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(`${saved}/${videos.length} previews saved. Building the complete local site…`);
  await run([path.join(root,'node_modules/next/dist/bin/next'),'build'],{NEXT_PUBLIC_OFFLINE_MISSING_PREVIEWS:receipts.filter(v=>!v.saved).map(v=>v.id).join(',')});
  await fs.mkdir(path.dirname(destination),{recursive:true});
  try{await fs.rename(destination,path.join(refs,`offline-site-previous-${Date.now()}`));}catch(error){if(error.code!=='ENOENT')throw error;}
  await fs.rename(path.join(work,'out'),destination);
  console.log(`Offline copy ready: ${destination}\nStart with npm run offline, then open http://127.0.0.1:3000/\nSaved ${saved}/${videos.length} preview images; full video playback and live groups still need internet.`);
}finally{
  await fs.rm(work,{recursive:true,force:true});
}
