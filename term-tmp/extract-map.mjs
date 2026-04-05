const url='https://ant.design/components/overview';
const html=await (await fetch(url,{headers:{"user-agent":"Mozilla/5.0"}})).text();

const linkRe=/href="(\/components\/[^\"]+)"/g;
const imgRe=/<img[^>]+src="([^"]+\/original[^"]*)"/;
const spanRe=/<span[^>]*>([^<]+)<\/span>/;

const seen=new Map();
let m;
while((m=linkRe.exec(html))){
  const href=m[1];
  if(seen.has(href)) continue;
  const idx=m.index;
  const window=html.slice(idx, idx+2500);
  const imgM=window.match(imgRe);
  if(!imgM) continue;
  const nameM=window.match(spanRe);
  const name=nameM?nameM[1].trim():href.split('/').pop();
  seen.set(href,{name,href,img:imgM[1]});
  if(seen.size>=20) break;
}

console.log('found',seen.size);
for(const [href,v] of seen.entries()){
  console.log(JSON.stringify({name:v.name, href:v.href, img:v.img}));
}
