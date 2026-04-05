/**
 * Reorganizes web-bôking.pen canvas:
 * - Zone A (x=0): passenger booking flow → marketing → support
 * - Zone B (x=1560): seat reference (aligned with seat map row) → cargo → legal/FAQ/404
 * - Zone labels above each column
 * - Reorders top-level children: Halo → zone labels → prompts → dashboards → website frames (flow order)
 *
 * Run: node _reorganize-web-booking-canvas.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PEN = path.join(__dirname, "web-bôking.pen");

const GAP = 48;
const COL0 = 0;
const COL1 = 1560;
const Y_START = 5000;
const LABEL_Y = 4916;
const LABEL_H = 72;

function collectIds(node, set) {
  if (!node || typeof node !== "object") return;
  if (node.id) set.add(node.id);
  (node.children || []).forEach((c) => collectIds(c, set));
}

function genId(prefix, used) {
  let id;
  do {
    id = prefix + crypto.randomBytes(4).toString("hex");
  } while (used.has(id));
  used.add(id);
  return id;
}

function makeZoneLabel(id, x, title, used) {
  const bar = genId("wbZB", used);
  const tx = genId("wbZT", used);
  return {
    type: "frame",
    id,
    x,
    y: LABEL_Y,
    name: `Canvas · ${title}`,
    width: 1440,
    height: LABEL_H,
    fill: "#0B1020",
    layout: "none",
    clip: false,
    children: [
      {
        type: "rectangle",
        id: bar,
        x: 0,
        y: 0,
        name: "zoneAccent",
        fill: "#D4AF37",
        width: 1440,
        height: 4,
      },
      {
        type: "text",
        id: tx,
        x: 20,
        y: 20,
        name: "zoneTitle",
        fill: "#E8EAEF",
        content: title,
        fontFamily: "Inter",
        fontSize: 15,
        fontWeight: "800",
      },
    ],
  };
}

function frameHeight(f) {
  if (typeof f.height === "number") return f.height;
  const s = String(f.height || "");
  const m = s.match(/fit_content\((\d+)\)/);
  if (m) return parseInt(m[1], 10);
  return 800;
}

function bottomY(frame) {
  return frame.y + frameHeight(frame);
}

function main() {
  const raw = fs.readFileSync(PEN, "utf8");
  const doc = JSON.parse(raw);
  doc.children = doc.children.filter(
    (c) => c.id !== "wbZoneLblA" && c.id !== "wbZoneLblB"
  );

  const used = new Set();
  collectIds(doc, used);

  const byId = new Map();
  for (const c of doc.children) {
    if (c.id) byId.set(c.id, c);
  }

  const F = (id) => byId.get(id);
  if (!F("sMJzD")) throw new Error("Missing website frames");

  /** Column 0 — passenger + marketing (vertical) */
  let y = Y_START;
  const stack0 = [
    "sMJzD",
    "Kl9cQ",
    "eWbxX",
    "dQZgk",
    "cFLNQ",
    "wbBkSuccess",
    "43Hd5",
    "43TrKq2",
    "lPQio",
    "SPHoT",
    "A1Ssg",
  ];

  for (const id of stack0) {
    const f = F(id);
    if (!f) continue;
    f.x = COL0;
    f.y = y;
    y = bottomY(f) + GAP;
  }

  /** Seat map row — align reference with seat map */
  const seat = F("eWbxX");
  const kr = F("krR4Z");
  if (seat && kr) {
    kr.x = COL1;
    kr.y = seat.y;
  }

  const seatBottom = seat ? bottomY(seat) : Y_START;
  const krBottom = kr ? bottomY(kr) : 0;
  let y1 = Math.max(seatBottom, krBottom) + GAP;

  /** Column 1 — cargo + legal (below seat row) */
  const stack1 = [
    "wbCargoLanding",
    "wbCargoBook",
    "wbCargoResults",
    "wbCargoSuccess",
    "wbLegalTerms",
    "wbLegalPrivacy",
    "wbFaq",
    "wbPg404",
  ];
  for (const id of stack1) {
    const f = F(id);
    if (!f) continue;
    f.x = COL1;
    f.y = y1;
    y1 = bottomY(f) + GAP;
  }

  const lblA = makeZoneLabel(
    "wbZoneLblA",
    COL0,
    "Khu A — Đặt vé limousine (tìm chuyến → ghế → thông tin → thanh toán → tra cứu → giới thiệu / giá / liên hệ)",
    used
  );
  const lblB = makeZoneLabel(
    "wbZoneLblB",
    COL1,
    "Khu B — Ký gửi hàng (landing → form → báo giá → thành công) & pháp lý (điều khoản, bảo mật, FAQ, 404)",
    used
  );

  /** Move sample dashboards / prompts to the right so they stay one block */
  const DASH_X = 3800;
  let py = 0;
  for (const id of ["uL1xr", "OVVG0", "rYhmQ"]) {
    const f = F(id);
    if (f) {
      f.x = DASH_X;
      f.y = py;
      py = bottomY(f) + GAP;
    }
  }
  let prY = py + 200;
  for (const id of ["7cbgG", "KZT7e", "1xdoT"]) {
    const p = F(id);
    if (p) {
      p.x = DASH_X;
      p.y = prY;
      prY += (p.height || 219) + GAP;
    }
  }

  /** Rebuild children order */
  const pick = (ids) => ids.map((id) => byId.get(id)).filter(Boolean);

  const ordered = [
    ...pick(["vtHps"]),
    lblA,
    lblB,
    ...pick(["7cbgG", "KZT7e", "1xdoT"]),
    ...pick(["uL1xr", "OVVG0", "rYhmQ"]),
    ...pick([
      "sMJzD",
      "Kl9cQ",
      "eWbxX",
      "krR4Z",
      "dQZgk",
      "cFLNQ",
      "wbBkSuccess",
      "43Hd5",
      "43TrKq2",
      "lPQio",
      "SPHoT",
      "A1Ssg",
      "wbCargoLanding",
      "wbCargoBook",
      "wbCargoResults",
      "wbCargoSuccess",
      "wbLegalTerms",
      "wbLegalPrivacy",
      "wbFaq",
      "wbPg404",
    ]),
  ];

  const seen = new Set();
  const final = [];
  for (const node of ordered) {
    if (!node?.id || seen.has(node.id)) continue;
    seen.add(node.id);
    final.push(node);
  }

  doc.children = final;

  const dup = new Set();
  const stack = [doc];
  while (stack.length) {
    const n = stack.pop();
    if (!n || typeof n !== "object") continue;
    if (n.id) {
      if (dup.has(n.id)) throw new Error(`Duplicate id: ${n.id}`);
      dup.add(n.id);
    }
    (n.children || []).forEach((c) => stack.push(c));
  }

  fs.writeFileSync(PEN, JSON.stringify(doc, null, 2), "utf8");
  console.log("OK: canvas reorganized (2 columns + zone labels + child order).");
}

main();
