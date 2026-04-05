const url='https://ant.design/components/overview';
const html=await (await fetch(url,{headers:{"user-agent":"Mozilla/5.0"}})).text();
const linkRe=/href="(\/components\/[^\"]+)"/g;
const imgRe=/<img[^>]+src="([^"]+\/original[^"]*)"/;
const seen=new Map();
let m;
while((m=linkRe.exec(html))){
  const href=m[1];
  if(seen.has(href)) continue;
  const idx=m.index;
  const window=html.slice(idx, idx+3000);
  const imgM=window.match(imgRe);
  if(!imgM) continue;
  // exclude obvious non-component pages if needed
  seen.set(href,{href,img:imgM[1]});
}
const arr=[...seen.values()].map(v=>v.href);
console.log('unique component hrefs with thumbnail:',seen.size);
console.log(arr.slice(0,40).join('\n'));
