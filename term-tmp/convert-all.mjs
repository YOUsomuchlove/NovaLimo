import fs from "fs";
import sharp from "sharp";

const map=JSON.parse(fs.readFileSync("apps/web-booking/antd-components-map.json","utf8"));
const items=map.items;
const outDir="apps/web-booking/public/antd-component-thumbs-png";
fs.mkdirSync(outDir,{recursive:true});

let i=0;
for(const item of items){
  i++;
  const slug=item.href.split("/").pop();
  const input="apps/web-booking/public/antd-component-thumbs/"+slug+".svg";
  const output=outDir+"/"+slug+".png";
  if(fs.existsSync(output)) continue;
  try{
    await sharp(input).png().toFile(output);
    console.log("["+i+"/"+items.length+"] converted",slug);
  }catch(e){
    console.error("fail",slug,e.message);
  }
}
console.log("done");
