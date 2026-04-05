const url='https://ant.design/components/overview';
const res=await fetch(url,{headers:{'user-agent':'Mozilla/5.0'}});
const html=await res.text();

const linkRe=/href="(\/components\/[^\"]+)"/g;
const slugs=new Set();
let m; let found=0;
function firstMatch(re, start, end){
  const sub=html.slice(start,end);
  const mm=re.exec(sub);
  return mm?mm[1]:null;
}

while((m=linkRe.exec(html))){
  const href=m[1];
  if(slugs.has(href)) continue;
  const idx=m.index;
  const windowEnd=Math.min(html.length, idx+2000);
  // name: take the first span content after the link
  const name=firstMatch(/<span[^>]*>\s*([^<]+?)\s*<\/span>/, idx, windowEnd);
  const img=firstMatch(/<img[^>]+src="([^"]+?\/original[^"]*)"/ , idx, windowEnd);
  if(img && name){
    slugs.add(href);
    found++;
    console.log(JSON.stringify({slug:href, name, img}));
    if(found>=15) break;
  }
}
console.log('done, found',found,'unique');
