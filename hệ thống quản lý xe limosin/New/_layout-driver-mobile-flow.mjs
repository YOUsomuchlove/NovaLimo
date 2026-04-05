import fs from "node:fs";

const penPath = "G:/NovaLimo/hệ thống quản lý xe limosin/New/app-mobile.pen";
const doc = JSON.parse(fs.readFileSync(penPath, "utf8"));

const STROKE = { align: "inside", thickness: 1, fill: "#334155" };

function navItem(id, icon, label, active) {
  return {
    type: "frame",
    id,
    width: 82,
    height: 58,
    fill: active ? "#111827" : "#0B1020",
    cornerRadius: 16,
    ...(active ? { stroke: STROKE } : {}),
    layout: "vertical",
    gap: 6,
    justifyContent: "center",
    alignItems: "center",
    children: [
      {
        type: "icon_font",
        id: `${id}Ic`,
        width: 20,
        height: 20,
        iconFontName: icon,
        iconFontFamily: "lucide",
        fill: active ? "#D4AF37" : "#94A3B8",
      },
      {
        type: "text",
        id: `${id}Tx`,
        fill: active ? "#F9FAFB" : "#94A3B8",
        content: label,
        fontFamily: "Inter",
        fontSize: 11,
        fontWeight: "normal",
      },
    ],
  };
}

function bottomNav4(prefix, active) {
  return {
    type: "frame",
    id: `${prefix}BottomNav`,
    x: 12,
    y: 758,
    name: "Bottom nav",
    width: 366,
    height: 74,
    fill: "#0B1020",
    cornerRadius: 20,
    stroke: STROKE,
    gap: 8,
    padding: [8, 10],
    justifyContent: "space_between",
    alignItems: "center",
    children: [
      navItem(`${prefix}NavTrips`, "route", "Chuyến", active === "trips"),
      navItem(`${prefix}NavCargo`, "package", "Hàng", active === "cargo"),
      navItem(`${prefix}NavChat`, "message-square", "Chat", active === "chat"),
      navItem(`${prefix}NavShift`, "power", "Ca", active === "shift"),
    ],
  };
}

function findFrameById(nodes, id) {
  if (!nodes) return null;
  if (Array.isArray(nodes)) {
    for (const n of nodes) {
      const f = findFrameById(n, id);
      if (f) return f;
    }
    return null;
  }
  if (nodes.id === id) return nodes;
  if (nodes.children) return findFrameById(nodes.children, id);
  return null;
}

function hasBottomNav(frame) {
  if (!frame?.children) return false;
  return frame.children.some(
    (c) =>
      c.name === "Bottom nav" ||
      (typeof c.id === "string" && c.id.endsWith("BottomNav"))
  );
}

function collectIds(node, out) {
  if (!node) return;
  if (Array.isArray(node)) return node.forEach((n) => collectIds(n, out));
  if (node.id) out.push(node.id);
  if (node.children) collectIds(node.children, out);
}

/** Thứ tự đọc trái → phải, hàng trên → hàng dưới (6 cột) */
const FLOW = [
  { id: "mbDrvLogin", nav: null },
  { id: "mbDrvHomeTrips", nav: null },
  { id: "mbDrvTripDetail", nav: "trips" },
  { id: "mbDrvNavPickup", nav: "trips" },
  { id: "mbDrvPaxList", nav: "trips" },
  { id: "mbDrvIncident", nav: "trips" },
  { id: "mbDrvCargoMng", nav: null },
  { id: "mbDrvCargoItem", nav: "cargo" },
  { id: "mbDrvCargoScan", nav: "cargo" },
  { id: "mbDrvCargoCod", nav: "cargo" },
  { id: "mbDrvCargoTransfer", nav: null },
  { id: "mbDrvChat", nav: null },
  { id: "mbDrvShiftEnd", nav: null },
  { id: "mbDrvNotif", nav: "trips" },
  { id: "mbDrvEarn", nav: "trips" },
  { id: "mbDrvProfile", nav: "trips" },
  { id: "mbDrvPermLibrary", nav: null },
];

const COLS = 6;
const GAP_X = 56;
const GAP_Y = 72;
const W = 390;
const H = 844;
const ORIGIN_X = 420;
const ORIGIN_Y = 5080;

const GUIDE_ID = "mbDrvFlowMap";

const guideBody = `NovaLimo Driver — thứ tự màn & thao tác (prototype)

Hàng 1: (1) Đăng nhập → (2) Trang chủ chuyến → (3) Chi tiết chuyến → (4) Điều hướng → (5) Khách/check-in → (6) Báo sự cố/SOS

Hàng 2: (7) Hàng ký gửi → (8) Chi tiết kiện → (9) Quét QR → (10) COD → (11) Bàn giao hàng → (12) Chat nội bộ

Hàng 3: (13) Kết thúc ca → (14) Thông báo → (15) Thu nhập → (16) Hồ sơ → (17) Thư viện popup quyền

Thanh dưới (4 tab): Chuyến · Hàng · Chat · Ca — tab sáng = màn đang ở nhóm đó. Màn có nút ← = quay lại stack trước.

Thao tác gợi ý: vuốt danh sách · chạm nút CTA · quét QR trong khung · SOS khi khẩn cấp.`;

function ensureFlowGuide(rootChildren) {
  if (rootChildren.some((c) => c.id === GUIDE_ID)) return;
  const guide = {
    type: "frame",
    id: GUIDE_ID,
    x: ORIGIN_X,
    y: ORIGIN_Y - 300,
    name: "NovaLimo Driver · Bản đồ luồng màn hình",
    width: COLS * (W + GAP_X) - GAP_X,
    height: 260,
    fill: "#0F172A",
    cornerRadius: 16,
    stroke: STROKE,
    clip: true,
    layout: "vertical",
    gap: 12,
    padding: [20, 24],
    children: [
      {
        type: "text",
        id: `${GUIDE_ID}Title`,
        fill: "#F9FAFB",
        content: "Bản đồ luồng — đọc theo hàng từ trái sang phải",
        fontFamily: "Inter",
        fontSize: 16,
        fontWeight: "700",
        textGrowth: "fixed-width",
        width: "fill_container",
      },
      {
        type: "text",
        id: `${GUIDE_ID}Body`,
        fill: "#94A3B8",
        content: guideBody,
        fontFamily: "Inter",
        fontSize: 12,
        fontWeight: "normal",
        lineHeight: 1.45,
        textGrowth: "fixed-width",
        width: "fill_container",
      },
    ],
  };
  const loginIdx = rootChildren.findIndex((c) => c.id === "mbDrvLogin");
  if (loginIdx >= 0) rootChildren.splice(loginIdx, 0, guide);
  else rootChildren.unshift(guide);
}

function applyGrid() {
  for (let i = 0; i < FLOW.length; i++) {
    const { id } = FLOW[i];
    const f = findFrameById(doc.children, id);
    if (!f) {
      console.warn("Missing frame:", id);
      continue;
    }
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    f.x = ORIGIN_X + col * (W + GAP_X);
    f.y = ORIGIN_Y + row * (H + GAP_Y);
  }
}

function patchTripDetailNav() {
  const root = findFrameById(doc.children, "mbDrvTripDetail");
  if (!root || hasBottomNav(root)) return;
  const safe = findFrameById(root.children, "mbTripDetSafe");
  const list = findFrameById(safe?.children, "mbTripDetList");
  if (safe) safe.height = 694;
  if (list) list.height = 538;
  root.children.push(bottomNav4("mbTdBn", "trips"));
}

function patchSubScreenNav(frameId, safeId, listId, listNewH, safeNewH, prefix, active) {
  const root = findFrameById(doc.children, frameId);
  if (!root || hasBottomNav(root)) return;
  const safe = findFrameById(root.children, safeId);
  if (safe && safeNewH) safe.height = safeNewH;
  if (listId && listNewH) {
    const list = findFrameById(safe?.children, listId);
    if (list) list.height = listNewH;
  }
  root.children.push(bottomNav4(prefix, active));
}

function patchNavPickupNav() {
  const root = findFrameById(doc.children, "mbDrvNavPickup");
  if (!root || hasBottomNav(root)) return;
  const sheet = findFrameById(root.children, "mbNavSheet");
  if (sheet) sheet.height = 264;
  root.children.push(bottomNav4("mbNavDock", "trips"));
}

function run() {
  const rootChildren = doc.children;
  ensureFlowGuide(rootChildren);
  applyGrid();

  patchTripDetailNav();
  patchNavPickupNav();

  patchSubScreenNav(
    "mbDrvNotif",
    "mbDrvNotifSafe",
    "mbNotifList",
    606,
    694,
    "mbNfBn",
    "trips"
  );
  patchSubScreenNav(
    "mbDrvEarn",
    "mbDrvEarnSafe",
    "mbEarnList",
    606,
    694,
    "mbErBn",
    "trips"
  );
  patchSubScreenNav(
    "mbDrvProfile",
    "mbDrvProfileSafe",
    "mbProfList",
    606,
    694,
    "mbPrBn",
    "trips"
  );
  patchSubScreenNav(
    "mbDrvPaxList",
    "mbDrvPaxListSafe",
    "mbPaxList",
    520,
    694,
    "mbPxBn",
    "trips"
  );
  patchSubScreenNav(
    "mbDrvIncident",
    "mbDrvIncidentSafe",
    "mbIncList",
    400,
    694,
    "mbInBn",
    "trips"
  );

  patchSubScreenNav(
    "mbDrvCargoItem",
    "mbDrvCargoItemSafe",
    "mbCiList",
    606,
    694,
    "mbCiBn",
    "cargo"
  );
  patchSubScreenNav(
    "mbDrvCargoScan",
    "mbDrvCargoScanSafe",
    null,
    null,
    694,
    "mbCsBn",
    "cargo"
  );
  patchSubScreenNav(
    "mbDrvCargoCod",
    "mbDrvCargoCodSafe",
    "mbCodList",
    606,
    694,
    "mbCdBn",
    "cargo"
  );

  const ids = [];
  collectIds(doc.children, ids);
  const m = new Map();
  for (const id of ids) m.set(id, (m.get(id) || 0) + 1);
  const dup = [...m.entries()].filter(([, c]) => c > 1);
  if (dup.length) {
    console.error("Duplicate ids:", dup.slice(0, 30));
    process.exit(1);
  }

  fs.writeFileSync(penPath, JSON.stringify(doc, null, 2), "utf8");
  console.log("OK: grid + flow map + bottom nav patches applied.");
}

run();
