import fs from "node:fs";

const penPath = "G:/NovaLimo/hệ thống quản lý xe limosin/New/web-admin.pen";
const doc = JSON.parse(fs.readFileSync(penPath, "utf8"));

const SHIFT_FROM_Y = 19820;
const DELTA_Y = 800;

let moved = 0;
for (const n of doc.children || []) {
  if (!n || n.type !== "frame") continue;
  if (n.id === "nvUiMsgLib") continue;
  if (typeof n.y === "number" && n.y >= SHIFT_FROM_Y) {
    n.y += DELTA_Y;
    moved += 1;
  }
}

fs.writeFileSync(penPath, JSON.stringify(doc, null, 2), "utf8");
console.log(`Shifted ${moved} top-level frames by +${DELTA_Y}y (from y>=${SHIFT_FROM_Y}).`);

