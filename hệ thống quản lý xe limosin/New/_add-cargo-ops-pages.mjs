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

function headerCell(id, label, w) {
  return txt(id, label, { fill: C.sub, fontSize: 12, fontWeight: "800", width: w, textGrowth: "fixed-width" });
}
function cell(id, label, w, opts = {}) {
  return txt(id, label, { fill: opts.fill ?? C.text, fontSize: 12, fontWeight: opts.bold ? "800" : "600", width: w, textGrowth: "fixed-width" });
}
function row(id, cells) {
  return {
    type: "frame",
    id,
    width: "fill_container",
    height: 52,
    fill: "#050814",
    cornerRadius: 12,
    stroke: { align: "inside", thickness: 1, fill: "#111827" },
    padding: [0, 12],
    gap: 10,
    alignItems: "center",
    children: cells,
  };
}

function buildCargoOpsList(prefix) {
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
        id: `${prefix}Filters`,
        width: "fill_container",
        height: 54,
        fill: C.card,
        cornerRadius: 16,
        stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
        padding: [0, 14],
        layout: "horizontal",
        gap: 10,
        alignItems: "center",
        children: [
          btn(`${prefix}StAll`, "Tất cả", "secondary", "package"),
          btn(`${prefix}StWait`, "Chờ nhận", "secondary", "clock"),
          btn(`${prefix}StRun`, "Đang chuyển", "secondary", "truck"),
          btn(`${prefix}StDone`, "Đã giao", "secondary", "check-circle-2"),
          {
            type: "frame",
            id: `${prefix}Search`,
            width: "fill_container",
            height: 38,
            fill: "#111827",
            cornerRadius: 12,
            stroke: { align: "inside", thickness: 1, fill: C.stroke },
            padding: [0, 12],
            gap: 10,
            alignItems: "center",
            children: [
              icon(`${prefix}SearchIc`, "search", { size: 16, fill: C.muted }),
              txt(`${prefix}SearchTx`, "Tìm theo mã vận đơn / SĐT…", { fill: C.muted, fontSize: 12, fontWeight: "600", width: "fill_container", textGrowth: "fixed-width" }),
            ],
          },
          btn(`${prefix}Create`, "Tạo vận đơn", "primary", "plus"),
        ],
      },
      {
        type: "frame",
        id: `${prefix}Table`,
        width: "fill_container",
        fill: C.card,
        cornerRadius: 16,
        stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
        padding: 14,
        layout: "vertical",
        gap: 10,
        children: [
          {
            type: "frame",
            id: `${prefix}Th`,
            width: "fill_container",
            height: 28,
            layout: "horizontal",
            gap: 10,
            alignItems: "center",
            children: [
              headerCell(`${prefix}ThCode`, "Mã vận đơn", 170),
              headerCell(`${prefix}ThFrom`, "Điểm nhận", 260),
              headerCell(`${prefix}ThTo`, "Điểm giao", 260),
              headerCell(`${prefix}ThCod`, "COD", 120),
              headerCell(`${prefix}ThSt`, "Trạng thái", 160),
              headerCell(`${prefix}ThAct`, "Thao tác", 140),
            ],
          },
          row(`${prefix}R1`, [
            cell(`${prefix}R1Code`, "NL-QR-8F2A-1093", 170, { bold: true, fill: C.gold }),
            cell(`${prefix}R1From`, "78 Đại Cồ Việt, HN", 260),
            cell(`${prefix}R1To`, "Cái Lân, Hạ Long", 260),
            cell(`${prefix}R1Cod`, "350.000đ", 120, { bold: true, fill: "#FBBF24" }),
            { type: "frame", id: `${prefix}R1St`, width: 160, children: [pill(`${prefix}R1StP`, "Đang chuyển", "#111827", "#E5E7EB", "truck")] },
            { type: "frame", id: `${prefix}R1Act`, width: 140, children: [btn(`${prefix}R1View`, "Xem", "secondary", "eye")] },
          ]),
          row(`${prefix}R2`, [
            cell(`${prefix}R2Code`, "NL-QR-0C9D-7712", 170, { bold: true }),
            cell(`${prefix}R2From`, "12 Trần Phú, HN", 260),
            cell(`${prefix}R2To`, "Bãi Cháy, HL", 260),
            cell(`${prefix}R2Cod`, "—", 120),
            { type: "frame", id: `${prefix}R2St`, width: 160, children: [pill(`${prefix}R2StP`, "Chờ nhận", "#111827", "#E5E7EB", "clock")] },
            { type: "frame", id: `${prefix}R2Act`, width: 140, children: [btn(`${prefix}R2View`, "Xem", "secondary", "eye")] },
          ]),
        ],
      },
    ],
  };
}

function buildCargoHandoff(prefix) {
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
        id: `${prefix}Card`,
        width: "fill_container",
        fill: C.card,
        cornerRadius: 16,
        stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
        padding: 14,
        layout: "vertical",
        gap: 10,
        children: [
          txt(`${prefix}T`, "Bàn giao trung chuyển (mô phỏng)", { fontSize: 14, fontWeight: "900" }),
          pill(`${prefix}P1`, "Điểm bàn giao: Bến xe Mỹ Đình", "#111827", "#E5E7EB", "map-pin"),
          pill(`${prefix}P2`, "Người nhận: NV Trung chuyển (ID: TC-22)", "#111827", "#E5E7EB", "user"),
          {
            type: "frame",
            id: `${prefix}Steps`,
            width: "fill_container",
            layout: "vertical",
            gap: 8,
            children: [
              pill(`${prefix}S1`, "1) Quét QR kiện hàng", "#1D4ED8", "#DBEAFE", "qr-code"),
              pill(`${prefix}S2`, "2) Đối chiếu COD / tình trạng", "#3B1D00", "#FBBF24", "banknote"),
              pill(`${prefix}S3`, "3) Xác nhận bàn giao", "#052E16", "#4ADE80", "shield-check"),
            ],
          },
          {
            type: "frame",
            id: `${prefix}Btns`,
            width: "fill_container",
            layout: "horizontal",
            gap: 10,
            children: [
              btn(`${prefix}Scan`, "Quét QR", "primary", "qr-code"),
              btn(`${prefix}Confirm`, "Xác nhận", "secondary", "check"),
            ],
          },
        ],
      },
    ],
  };
}

function buildCodReconcile(prefix) {
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
        id: `${prefix}Summary`,
        width: "fill_container",
        fill: C.card,
        cornerRadius: 16,
        stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
        padding: 14,
        layout: "horizontal",
        gap: 12,
        alignItems: "center",
        children: [
          pill(`${prefix}D`, "Hôm nay", "#111827", "#E5E7EB", "calendar"),
          pill(`${prefix}Total`, "Tổng COD: 5.250.000đ", "#3B1D00", "#FBBF24", "banknote"),
          pill(`${prefix}Need`, "Cần nộp: 3.900.000đ", "#7F1D1D", "#FEE2E2", "circle-alert"),
          { type: "frame", id: `${prefix}Spacer`, width: "fill_container", height: 1, fill: C.card },
          btn(`${prefix}Export`, "Xuất Excel", "primary", "download"),
        ],
      },
      {
        type: "frame",
        id: `${prefix}Table`,
        width: "fill_container",
        fill: C.card,
        cornerRadius: 16,
        stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
        padding: 14,
        layout: "vertical",
        gap: 10,
        children: [
          {
            type: "frame",
            id: `${prefix}Th`,
            width: "fill_container",
            height: 28,
            layout: "horizontal",
            gap: 10,
            alignItems: "center",
            children: [
              headerCell(`${prefix}ThDriver`, "Tài xế", 220),
              headerCell(`${prefix}ThTrips`, "Chuyến", 120),
              headerCell(`${prefix}ThCod`, "COD thu", 140),
              headerCell(`${prefix}ThPaid`, "Đã nộp", 140),
              headerCell(`${prefix}ThDiff`, "Còn lại", 140),
              headerCell(`${prefix}ThAct`, "Thao tác", 140),
            ],
          },
          row(`${prefix}R1`, [
            cell(`${prefix}R1Driver`, "Nguyễn Văn An", 220, { bold: true }),
            cell(`${prefix}R1Trips`, "2", 120),
            cell(`${prefix}R1Cod`, "1.250.000đ", 140, { bold: true, fill: "#FBBF24" }),
            cell(`${prefix}R1Paid`, "500.000đ", 140),
            cell(`${prefix}R1Diff`, "750.000đ", 140, { bold: true, fill: "#FCA5A5" }),
            { type: "frame", id: `${prefix}R1Act`, width: 140, children: [btn(`${prefix}R1View`, "Đối soát", "secondary", "receipt")] },
          ]),
        ],
      },
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

const baseY = 24340;
const pages = [
  buildPageFromTemplate(template, "nvCargoOpsList", "NovaLimo Admin · Vận hành Hàng hóa", 0, baseY, "Vận hành Hàng hóa", "Danh sách vận đơn theo trạng thái · SLA · COD", buildCargoOpsList),
  buildPageFromTemplate(template, "nvCargoHandoff", "NovaLimo Admin · Bàn giao Trung chuyển", 1600, baseY, "Bàn giao Trung chuyển", "Quét QR · Đối chiếu COD · Xác nhận bàn giao", buildCargoHandoff),
  buildPageFromTemplate(template, "nvCargoCodReconcile", "NovaLimo Admin · Đối soát COD", 3200, baseY, "Đối soát COD", "Theo ngày/tài xế/chuyến · Export · Theo dõi chênh lệch", buildCodReconcile),
];

doc.children.push(...pages);
fs.writeFileSync(penPath, JSON.stringify(doc, null, 2), "utf8");
console.log(`Inserted ${pages.length} cargo ops pages at y=${baseY}`);

