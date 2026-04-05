import fs from "node:fs";

const penPath = "G:/NovaLimo/hệ thống quản lý xe limosin/New/web-admin.pen";
const doc = JSON.parse(fs.readFileSync(penPath, "utf8"));

const C = {
  card: "#0B1020",
  stroke2: "#1F2937",
  stroke: "#334155",
  text: "#F9FAFB",
  sub: "#9CA6C4",
  muted: "#94A3B8",
  gold: "#D4AF37",
};

function deepClone(x) {
  return JSON.parse(JSON.stringify(x));
}
function walk(node, fn) {
  if (!node) return;
  if (Array.isArray(node)) return node.forEach((n) => walk(n, fn));
  fn(node);
  if (node.children) walk(node.children, fn);
}
function remapIds(root, mapFn) {
  walk(root, (n) => {
    if (typeof n.id === "string") n.id = mapFn(n.id);
    if (n.descendants && typeof n.descendants === "object") {
      const next = {};
      for (const [k, v] of Object.entries(n.descendants)) next[mapFn(k)] = v;
      n.descendants = next;
    }
  });
}
function findById(root, id) {
  let found = null;
  walk(root, (n) => {
    if (!found && n?.id === id) found = n;
  });
  return found;
}
function txt(id, content, opts = {}) {
  return {
    type: "text",
    id,
    content,
    fill: opts.fill ?? C.text,
    fontFamily: "Inter",
    fontSize: opts.fontSize ?? 13,
    fontWeight: opts.fontWeight ?? "600",
    ...(opts.width ? { width: opts.width } : {}),
    ...(opts.textGrowth ? { textGrowth: opts.textGrowth } : {}),
  };
}
function icon(id, name, opts = {}) {
  return {
    type: "icon_font",
    id,
    width: opts.size ?? 16,
    height: opts.size ?? 16,
    iconFontName: name,
    iconFontFamily: "lucide",
    fill: opts.fill ?? C.muted,
  };
}
function btn(id, label, variant, iconName) {
  const v = variant || "secondary";
  const styles =
    v === "primary"
      ? { fill: C.gold, tx: C.card, ic: C.card, stroke: null }
      : { fill: "#111827", tx: "#E5E7EB", ic: "#E5E7EB", stroke: C.stroke };
  return {
    type: "frame",
    id,
    width: "fit_content",
    height: 38,
    fill: styles.fill,
    cornerRadius: 12,
    ...(styles.stroke ? { stroke: { align: "inside", thickness: 1, fill: styles.stroke } } : {}),
    padding: [0, 12],
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    children: [
      ...(iconName ? [icon(`${id}Ic`, iconName, { size: 16, fill: styles.ic })] : []),
      txt(`${id}Tx`, label, { fill: styles.tx, fontSize: 13, fontWeight: "800" }),
    ],
  };
}
function pill(id, label, fill, tx, iconName) {
  return {
    type: "frame",
    id,
    width: "fit_content",
    height: 28,
    fill,
    cornerRadius: 999,
    padding: [0, 10],
    gap: 8,
    alignItems: "center",
    children: [
      ...(iconName ? [icon(`${id}Ic`, iconName, { size: 14, fill: tx })] : []),
      txt(`${id}Tx`, label, { fill: tx, fontSize: 12, fontWeight: "800" }),
    ],
  };
}
function card(id, title, children) {
  return {
    type: "frame",
    id,
    width: "fill_container",
    fill: C.card,
    cornerRadius: 16,
    stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
    padding: 14,
    layout: "vertical",
    gap: 10,
    children: [txt(`${id}T`, title, { fontSize: 14, fontWeight: "900" }), ...children],
  };
}

function buildRoutesStops(prefix) {
  return {
    type: "frame",
    id: `${prefix}Content`,
    width: "fill_container",
    layout: "vertical",
    gap: 14,
    padding: [18, 28],
    children: [
      {
        type: "frame",
        id: `${prefix}Top`,
        width: "fill_container",
        height: 54,
        fill: C.card,
        cornerRadius: 16,
        stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
        padding: [0, 14],
        gap: 10,
        alignItems: "center",
        children: [
          btn(`${prefix}City`, "Khu vực", "secondary", "chevron-down"),
          btn(`${prefix}Route`, "Tuyến", "secondary", "chevron-down"),
          { type: "frame", id: `${prefix}Spacer`, width: "fill_container", height: 1, fill: C.card },
          btn(`${prefix}AddStop`, "Thêm điểm", "primary", "plus"),
        ],
      },
      card(`${prefix}List`, "Tuyến & điểm đón/trả (mẫu)", [
        pill(`${prefix}R1`, "HN → QN", "#111827", "#E5E7EB", "route"),
        pill(`${prefix}S1`, "Điểm đón: 12 Trần Phú (PostGIS)", "#052E16", "#4ADE80", "map-pin"),
        pill(`${prefix}S2`, "Điểm trả: Bãi Cháy (PostGIS)", "#3B2A00", "#FBBF24", "flag"),
      ]),
    ],
  };
}

function buildTimeSlots(prefix) {
  return {
    type: "frame",
    id: `${prefix}Content`,
    width: "fill_container",
    layout: "vertical",
    gap: 14,
    padding: [18, 28],
    children: [
      card(`${prefix}Slots`, "Khung giờ / Trip_Batches", [
        pill(`${prefix}T1`, "12:00", "#111827", "#E5E7EB", "clock"),
        pill(`${prefix}T2`, "14:00", "#1D4ED8", "#DBEAFE", "clock"),
        pill(`${prefix}T3`, "16:00", "#111827", "#E5E7EB", "clock"),
        { type: "frame", id: `${prefix}Btns`, width: "fill_container", layout: "horizontal", gap: 10, children: [btn(`${prefix}Add`, "Thêm khung giờ", "primary", "plus"), btn(`${prefix}Sync`, "Đồng bộ", "secondary", "refresh-cw")] },
      ]),
    ],
  };
}

function buildPricing(prefix) {
  return {
    type: "frame",
    id: `${prefix}Content`,
    width: "fill_container",
    layout: "vertical",
    gap: 14,
    padding: [18, 28],
    children: [
      card(`${prefix}Pricing`, "Giá vé / phụ phí", [
        pill(`${prefix}P1`, "HN → QN · 250.000đ", "#111827", "#E5E7EB", "ticket"),
        pill(`${prefix}P2`, "HN → HP · 220.000đ", "#111827", "#E5E7EB", "ticket"),
        pill(`${prefix}Fee1`, "Phụ phí đón tận nơi: 30.000đ", "#3B2A00", "#FBBF24", "map-pin"),
        { type: "frame", id: `${prefix}Btns`, width: "fill_container", layout: "horizontal", gap: 10, children: [btn(`${prefix}Edit`, "Chỉnh giá", "primary", "pencil"), btn(`${prefix}Import`, "Import", "secondary", "upload")] },
      ]),
    ],
  };
}

function buildCodPolicy(prefix) {
  return {
    type: "frame",
    id: `${prefix}Content`,
    width: "fill_container",
    layout: "vertical",
    gap: 14,
    padding: [18, 28],
    children: [
      card(`${prefix}Cod`, "Chính sách COD", [
        pill(`${prefix}C1`, "Giới hạn COD/kiện: 5.000.000đ", "#3B1D00", "#FBBF24", "banknote"),
        pill(`${prefix}C2`, "Thời gian nộp lại: cuối ca", "#111827", "#E5E7EB", "clock"),
        pill(`${prefix}C3`, "Quy trình đối soát: theo tài xế/chuyến", "#111827", "#E5E7EB", "clipboard-check"),
        { type: "frame", id: `${prefix}Btns`, width: "fill_container", layout: "horizontal", gap: 10, children: [btn(`${prefix}Update`, "Cập nhật", "primary", "check"), btn(`${prefix}Preview`, "Xem mẫu", "secondary", "eye")] },
      ]),
    ],
  };
}

function buildNotifications(prefix) {
  return {
    type: "frame",
    id: `${prefix}Content`,
    width: "fill_container",
    layout: "vertical",
    gap: 14,
    padding: [18, 28],
    children: [
      card(`${prefix}Noti`, "Thông báo (template)", [
        pill(`${prefix}N1`, "SMS: xác nhận đặt vé", "#111827", "#E5E7EB", "message-square"),
        pill(`${prefix}N2`, "Push: sắp đến giờ xuất bến", "#111827", "#E5E7EB", "bell"),
        pill(`${prefix}N3`, "Push: cập nhật trạng thái giao hàng", "#111827", "#E5E7EB", "package"),
        { type: "frame", id: `${prefix}Btns`, width: "fill_container", layout: "horizontal", gap: 10, children: [btn(`${prefix}Edit`, "Sửa template", "primary", "pencil"), btn(`${prefix}Test`, "Gửi thử", "secondary", "send")] },
      ]),
    ],
  };
}

function buildPageFromTemplate(template, pageId, name, x, y, hdrTitle, hdrSub, contentBuilder) {
  const page = deepClone(template);
  remapIds(page, (old) => {
    if (old.startsWith("nvOrd")) return pageId + old.slice("nvOrd".length);
    return `${pageId}_${old}`;
  });
  page.id = pageId;
  page.name = name;
  page.x = x;
  page.y = y;
  page.width = 1440;
  page.height = 2000;

  const hdrT = findById(page, `${pageId}HdrT`);
  const hdrS = findById(page, `${pageId}HdrS`);
  if (hdrT?.type === "text") hdrT.content = hdrTitle;
  if (hdrS?.type === "text") hdrS.content = hdrSub;

  const main = findById(page, `${pageId}Main`);
  if (!main) throw new Error(`Main not found for ${pageId}`);
  const headerFrame = main.children?.find((c) => c?.id === `${pageId}Hdr`);
  main.layout = "vertical";
  main.gap = 0;
  main.height = 2000;
  main.children = [headerFrame, contentBuilder(pageId)].filter(Boolean);
  return page;
}

const template = doc.children.find((n) => n?.type === "frame" && n.id === "nvOrdPage");
if (!template) throw new Error("Template nvOrdPage not found");

const baseY = 31120;
const pages = [
  buildPageFromTemplate(template, "nvCfgRoutesStops", "NovaLimo Admin · Cấu hình tuyến/điểm", 0, baseY, "Cấu hình tuyến/điểm", "Routes · Stops · PostGIS markers", buildRoutesStops),
  buildPageFromTemplate(template, "nvCfgTimeSlots", "NovaLimo Admin · Cấu hình khung giờ", 1600, baseY, "Cấu hình khung giờ", "Trip_Batches · Tabs theo giờ · Đồng bộ", buildTimeSlots),
  buildPageFromTemplate(template, "nvCfgPricing", "NovaLimo Admin · Cấu hình giá", 3200, baseY, "Cấu hình giá", "Giá vé · Phụ phí · Import/Export", buildPricing),
  buildPageFromTemplate(template, "nvCfgCodPolicy", "NovaLimo Admin · Cấu hình COD", 4800, baseY, "Cấu hình COD", "Giới hạn COD · Quy trình đối soát · Ràng buộc", buildCodPolicy),
  buildPageFromTemplate(template, "nvCfgNotifications", "NovaLimo Admin · Cấu hình thông báo", 6400, baseY, "Cấu hình thông báo", "Template SMS/Push · Gửi thử · Bật/tắt", buildNotifications),
];

doc.children.push(...pages);
fs.writeFileSync(penPath, JSON.stringify(doc, null, 2), "utf8");
console.log(`Inserted ${pages.length} config pages at y=${baseY}`);

