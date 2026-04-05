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

function buildReport(prefix, kind) {
  const title =
    kind === "revenue"
      ? "Báo cáo Doanh thu"
      : kind === "trips"
        ? "Báo cáo Chuyến"
        : kind === "drivers"
          ? "Báo cáo Hiệu suất Tài xế"
          : "Báo cáo Hàng hóa/COD";

  const kpi =
    kind === "revenue"
      ? [pill(`${prefix}K1`, "Doanh thu: 125.000.000đ", "#3B2A00", "#FBBF24", "wallet"), pill(`${prefix}K2`, "Vé: 420", "#111827", "#E5E7EB", "ticket")]
      : kind === "trips"
        ? [pill(`${prefix}K1`, "Tổng chuyến: 36", "#111827", "#E5E7EB", "route"), pill(`${prefix}K2`, "Đúng giờ: 92%", "#052E16", "#4ADE80", "check-circle-2")]
        : kind === "drivers"
          ? [pill(`${prefix}K1`, "Top driver: Nguyễn Văn An", "#111827", "#E5E7EB", "user"), pill(`${prefix}K2`, "Điểm: 4.8/5", "#1D4ED8", "#DBEAFE", "star")]
          : [pill(`${prefix}K1`, "COD: 5.250.000đ", "#3B1D00", "#FBBF24", "banknote"), pill(`${prefix}K2`, "Đã giao: 11 kiện", "#052E16", "#4ADE80", "package")];

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
        id: `${prefix}Bar`,
        width: "fill_container",
        height: 54,
        fill: C.card,
        cornerRadius: 16,
        stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
        padding: [0, 14],
        gap: 10,
        alignItems: "center",
        children: [
          btn(`${prefix}Range`, "Tháng này", "secondary", "calendar"),
          ...kpi,
          { type: "frame", id: `${prefix}Spacer`, width: "fill_container", height: 1, fill: C.card },
          btn(`${prefix}Export`, "Xuất", "primary", "download"),
        ],
      },
      card(`${prefix}Chart`, "Biểu đồ (placeholder)", [
        {
          type: "frame",
          id: `${prefix}ChartBox`,
          width: "fill_container",
          height: 280,
          fill: "#111827",
          cornerRadius: 14,
          stroke: { align: "inside", thickness: 1, fill: C.stroke },
          justifyContent: "center",
          alignItems: "center",
          children: [
            icon(`${prefix}ChartIc`, "bar-chart-3", { size: 40, fill: C.muted }),
            txt(`${prefix}ChartTx`, title, { fill: C.muted, fontSize: 12, fontWeight: "700" }),
          ],
        },
      ]),
      card(`${prefix}Table`, "Bảng tổng hợp (placeholder)", [
        pill(`${prefix}T1`, "Có thể dùng table nâng cao + filter + pagination", "#111827", "#E5E7EB", "table"),
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

const baseY = 33380;
const pages = [
  buildPageFromTemplate(template, "nvRptRevenue", "NovaLimo Admin · Báo cáo Doanh thu", 0, baseY, "Báo cáo Doanh thu", "KPI · biểu đồ · export", (p) => buildReport(p, "revenue")),
  buildPageFromTemplate(template, "nvRptTrips", "NovaLimo Admin · Báo cáo Chuyến", 1600, baseY, "Báo cáo Chuyến", "Số chuyến · đúng giờ · export", (p) => buildReport(p, "trips")),
  buildPageFromTemplate(template, "nvRptDriverPerf", "NovaLimo Admin · Báo cáo Tài xế", 3200, baseY, "Báo cáo Tài xế", "Hiệu suất · điểm · export", (p) => buildReport(p, "drivers")),
  buildPageFromTemplate(template, "nvRptCargoCod", "NovaLimo Admin · Báo cáo Hàng hóa/COD", 4800, baseY, "Báo cáo Hàng hóa/COD", "COD · giao hàng · export", (p) => buildReport(p, "cargo")),
];

doc.children.push(...pages);
fs.writeFileSync(penPath, JSON.stringify(doc, null, 2), "utf8");
console.log(`Inserted ${pages.length} report pages at y=${baseY}`);

