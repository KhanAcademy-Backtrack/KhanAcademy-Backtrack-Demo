import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const offline=process.argv.includes('--offline');
const root=path.resolve(import.meta.dirname,offline?'../output/offline-site':'../out');
const port=Number(process.env.BACKTRACK_PORT||(offline?3000:3047));
if(!fs.existsSync(path.join(root,'index.html'))){console.error(offline?'Run npm run offline:prepare while connected first.':'Run npm run build first.');process.exit(1);}
// A verification-only mode blocks outbound subresources while leaving loopback usable.
// This lets us test disconnected behavior without changing the owner's Wi-Fi settings.
const verificationHeaders=process.env.BACKTRACK_BLOCK_EXTERNAL==='1'?{'Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-src 'none'; worker-src 'self' blob:; media-src 'self' blob:; object-src 'none'"}:{};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf','.json':'application/json','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  const base=path.resolve(root,'.'+pathname);
  if(base!==root&&!base.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  const candidates=[base,base+'.html',path.join(base,'index.html')];
  const file=candidates.find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
  if(!file){res.writeHead(404,{'Content-Type':'text/html'});res.end(fs.readFileSync(path.join(root,'404.html')));return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':'no-store',...verificationHeaders});fs.createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Khanpanion ${offline?'offline copy':'production preview'} http://127.0.0.1:${port}`));
