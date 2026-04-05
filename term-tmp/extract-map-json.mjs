const fs=await import("fs");
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
  seen.set(href,{href,img:imgM[1]});
}
const arr=[...seen.values()];
fs.writeFileSync(process.argv[2], JSON.stringify({count:arr.length, items:arr}, null, 2));
console.log('wrote',arr.length,'items to',process.argv[2]);
