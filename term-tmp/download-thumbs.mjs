import fs from "fs";
import path from "path";

const mapPath=process.argv[2];
const outDir=process.argv[3];

if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
const raw=fs.readFileSync(mapPath,'utf8');
const {items}=JSON.parse(raw);

function extFromContentType(ct){
  if(!ct) return '.img';
  ct=ct.toLowerCase();
  if(ct.includes('png')) return '.png';
  if(ct.includes('jpeg')||ct.includes('jpg')) return '.jpg';
  if(ct.includes('webp')) return '.webp';
  if(ct.includes('gif')) return '.gif';
  if(ct.includes('svg')) return '.svg';
  return '.img';
}

let i=0;
for(const item of items){
  i++;
  const href=item.href; // /components/<slug>
  const slug=href.split('/').pop();
  const url=item.img;
  try{
    const res=await fetch(url,{headers:{"user-agent":"Mozilla/5.0"}});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct=res.headers.get('content-type');
    const ext=extFromContentType(ct);
    const fileName=`${slug}${ext}`;
    const outPath=path.join(outDir,fileName);
    if(fs.existsSync(outPath)) continue;
    const buf=Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outPath,buf);
    console.log(`[${i}/${items.length}] saved`,fileName,'ct=',ct);
  }catch(e){
    console.error(`[${i}/${items.length}] failed`,href,e.message);
  }
}
console.log('done');
