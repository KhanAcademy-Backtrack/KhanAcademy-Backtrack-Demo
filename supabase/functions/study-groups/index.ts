// Runtime dependencies: platform fetch, Web Crypto and Deno only.
declare const Deno:{env:{get:(name:string)=>string|undefined};serve:(handler:(request:Request)=>Promise<Response>)=>void};
const allowed=new Set(['https://khanpanion.vercel.app','https://dunlo.vercel.app','https://backtrack-learning.vercel.app','https://backtrack-harrydaks.vercel.app','http://127.0.0.1:3050','http://127.0.0.1:3063','http://localhost:3047']);
const hex=(bytes:Uint8Array)=>[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');
const hash=async(value:string)=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))));
const code=(bytes=crypto.getRandomValues(new Uint8Array(6)))=>{const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return [...bytes].slice(0,6).map(b=>chars[b%chars.length]).join('');};
const clean=(v:unknown,max:number)=>typeof v==='string'&&v.trim().length>0&&v.trim().length<=max&&!/[\u0000-\u001f]/.test(v);

Deno.serve(async req=>{
 const origin=req.headers.get('origin')??'';
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(allowed.has(origin)?{'Access-Control-Allow-Origin':origin}:{}),'Access-Control-Allow-Headers':'authorization,content-type,apikey','Access-Control-Allow-Methods':'POST,OPTIONS'};
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(origin&&!allowed.has(origin))return reply({error:'This origin is not allowed.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({error:'Use a group action.'},405);
 try{
  const raw=await req.text();if(raw.length>8192)return reply({error:'The request is too large.'},413);
  let input:Record<string,unknown>;try{const parsed=JSON.parse(raw);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error();input=parsed;}catch{return reply({error:'This group action could not be read.'},400);}
  const action=input.action;
  if(typeof action!=='string'||!['session','create','join','snapshot','checkin','rename','goal','leave'].includes(action))return reply({error:'Unknown group action.'},400);
  let token:string;
  if(action==='session')token=hex(crypto.getRandomValues(new Uint8Array(32)));
  else{token=(req.headers.get('authorization')??'').replace(/^Bearer /,'');if(!/^[a-f0-9]{64}$/.test(token))return reply({error:'A device session is required.'},401);}
  const payload:Record<string,unknown>={code:typeof input.code==='string'?input.code.trim().toUpperCase():''};
  if(action==='create'){if(input.requestId!==undefined&&(typeof input.requestId!=='string'||!/^[a-f0-9-]{36}$/i.test(input.requestId)))return reply({error:'This creation request could not be read.'},400);payload.code=typeof input.requestId==='string'?code(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token+':'+input.requestId)))):code();}
  if(['create','join','rename'].includes(action)){if(!clean(input.nickname,32))return reply({error:'Choose a nickname of up to 32 characters.'},400);payload.nickname=(input.nickname as string).trim();}
  if(action==='create'){if(!clean(input.name,60))return reply({error:'Give your group a name of up to 60 characters.'},400);payload.name=(input.name as string).trim();}
  if(action==='create'||action==='goal'){if(!Number.isInteger(input.goal)||(input.goal as number)<1||(input.goal as number)>7)return reply({error:'Choose 1 to 7 study days a week.'},400);payload.goal=input.goal;}
  if(action==='checkin'){
   for(const field of ['studyDays','missions','mockCorrect','mockTotal']){const value=input[field];if(value!==undefined&&value!==null&&(!Number.isInteger(value)||(value as number)<0||(value as number)>400))return reply({error:'This check-in could not be read.'},400);payload[field]=value??null;}
  }
  const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),base=Deno.env.get('SUPABASE_URL');
  if(!service||!base)return reply({error:'Groups are temporarily unavailable. Try again shortly.'},503);
  const ip=(req.headers.get('x-forwarded-for')??req.headers.get('cf-connecting-ip')??'unknown').split(',')[0].trim();
  const response=await fetch(`${base}/rest/v1/rpc/khanpanion_group_api`,{method:'POST',headers:{apikey:service,Authorization:`Bearer ${service}`,'Content-Type':'application/json'},body:JSON.stringify({p_action:action,p_device:await hash(token),p_ip:await hash('khanpanion-groups:'+ip),p_payload:payload}),signal:AbortSignal.timeout(12000)});
  if(!response.ok){console.error('Group database request failed',response.status);return reply({error:'The group service could not complete this action. Try again.'},503);}
  const result=await response.json();if(result.error)return reply({error:result.error},result.status??400);
  return reply(action==='session'?{ok:true,token}:result);
 }catch{return reply({error:'Groups are temporarily unavailable. Your local study progress is safe.'},503);}
});
