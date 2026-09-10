import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../out');
const port=Number(process.env.BACKTRACK_PORT||3047);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.json':'application/json','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  const base=path.resolve(root,'.'+pathname);
  if(base!==root&&!base.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  const candidates=[base,base+'.html',path.join(base,'index.html')];
  const file=candidates.find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
  if(!file){res.writeHead(404,{'Content-Type':'text/html'});res.end(fs.readFileSync(path.join(root,'404.html')));return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Referrer-Policy':'strict-origin-when-cross-origin'});fs.createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`BACKTRACK production preview http://127.0.0.1:${port}`));
