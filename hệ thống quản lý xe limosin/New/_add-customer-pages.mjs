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
    fontFamily: opts.fontFamily ?? "Inter",
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

function buildCustList(prefix) {
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
          btn(`${prefix}All`, "Tất cả", "secondary", "users"),
          btn(`${prefix}Vip`, "VIP", "secondary", "star"),
          btn(`${prefix}Blk`, "Blacklist", "secondary", "ban"),
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
              txt(`${prefix}SearchTx`, "Tìm khách theo tên / SĐT…", { fill: C.muted, fontSize: 12, fontWeight: "600", width: "fill_container", textGrowth: "fixed-width" }),
            ],
          },
          btn(`${prefix}Create`, "Tạo khách", "primary", "plus"),
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
              headerCell(`${prefix}ThName`, "Khách hàng", 220),
              headerCell(`${prefix}ThPhone`, "SĐT", 140),
              headerCell(`${prefix}ThTag`, "Nhãn", 180),
              headerCell(`${prefix}ThLast`, "Gần nhất", 140),
              headerCell(`${prefix}ThHist`, "Lịch sử", 220),
              headerCell(`${prefix}ThAct`, "Thao tác", 140),
            ],
          },
          row(`${prefix}R1`, [
            cell(`${prefix}R1Name`, "Trần Thị Mai", 220, { bold: true }),
            cell(`${prefix}R1Phone`, "0903 *** 221", 140),
            { type: "frame", id: `${prefix}R1Tag`, width: 180, children: [pill(`${prefix}R1VipP`, "VIP", "#1D4ED8", "#DBEAFE", "star")] },
            cell(`${prefix}R1Last`, "Hôm nay", 140, { fill: C.gold, bold: true }),
            cell(`${prefix}R1Hist`, "Vé: 12 · Hàng: 3", 220),
            { type: "frame", id: `${prefix}R1Act`, width: 140, children: [btn(`${prefix}R1View`, "Xem", "secondary", "eye")] },
          ]),
          row(`${prefix}R2`, [
            cell(`${prefix}R2Name`, "Nguyễn Văn An", 220, { bold: true }),
            cell(`${prefix}R2Phone`, "0912 *** 678", 140),
            { type: "frame", id: `${prefix}R2Tag`, width: 180, children: [pill(`${prefix}R2BlkP`, "Blacklist", "#3B1D00", "#FBBF24", "ban")] },
            cell(`${prefix}R2Last`, "2 ngày trước", 140),
            cell(`${prefix}R2Hist`, "Vé: 2 · Hàng: 0", 220),
            { type: "frame", id: `${prefix}R2Act`, width: 140, children: [btn(`${prefix}R2View`, "Xem", "secondary", "eye")] },
          ]),
        ],
      },
    ],
  };
}

function buildCustDet(prefix) {
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
        id: `${prefix}Profile`,
        width: "fill_container",
        fill: C.card,
        cornerRadius: 16,
        stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
        padding: 14,
        layout: "horizontal",
        gap: 14,
        alignItems: "center",
        children: [
          {
            type: "frame",
            id: `${prefix}Avatar`,
            width: 54,
            height: 54,
            fill: "#111827",
            cornerRadius: 999,
            stroke: { align: "inside", thickness: 1, fill: C.stroke },
            justifyContent: "center",
            alignItems: "center",
            children: [icon(`${prefix}AvatarIc`, "user", { size: 22, fill: C.gold })],
          },
          {
            type: "frame",
            id: `${prefix}InfoCol`,
            width: "fill_container",
            layout: "vertical",
            gap: 4,
            children: [
              txt(`${prefix}Name`, "Trần Thị Mai", { fontSize: 18, fontWeight: "900" }),
              txt(`${prefix}Meta`, "0903 *** 221 · Hà Nội", { fill: C.sub, fontSize: 12, fontWeight: "700" }),
              { type: "frame", id: `${prefix}Badges`, layout: "horizontal", gap: 8, children: [pill(`${prefix}VipP`, "VIP", "#1D4ED8", "#DBEAFE", "star"), pill(`${prefix}NoteP`, "Có ghi chú", "#111827", "#E5E7EB", "sticky-note")] },
            ],
          },
          btn(`${prefix}Edit`, "Sửa", "primary", "pencil"),
        ],
      },
      {
        type: "frame",
        id: `${prefix}History`,
        width: "fill_container",
        fill: C.card,
        cornerRadius: 16,
        stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
        padding: 14,
        layout: "vertical",
        gap: 10,
        children: [
          txt(`${prefix}HistT`, "Lịch sử gần đây", { fontSize: 14, fontWeight: "900" }),
          row(`${prefix}H1`, [
            cell(`${prefix}H1Type`, "Vé", 70, { bold: true }),
            cell(`${prefix}H1Code`, "ORD-P1-000142", 160, { bold: true }),
            cell(`${prefix}H1Route`, "HN → QN", 120),
            cell(`${prefix}H1Time`, "14:00", 90),
            { type: "frame", id: `${prefix}H1St`, width: 170, children: [pill(`${prefix}H1StP`, "Đã hoàn thành", "#052E16", "#4ADE80", "check-circle-2")] },
            { type: "frame", id: `${prefix}H1Act`, width: 120, children: [btn(`${prefix}H1View`, "Xem", "secondary", "eye")] },
          ]),
          row(`${prefix}H2`, [
            cell(`${prefix}H2Type`, "Hàng", 70, { bold: true }),
            cell(`${prefix}H2Code`, "NL-QR-8F2A-1093", 160, { bold: true, fill: C.gold }),
            cell(`${prefix}H2Route`, "Nhận HN · Giao HL", 120),
            cell(`${prefix}H2Time`, "Hôm nay", 90),
            { type: "frame", id: `${prefix}H2St`, width: 170, children: [pill(`${prefix}H2StP`, "Đang vận chuyển", "#111827", "#E5E7EB", "truck")] },
            { type: "frame", id: `${prefix}H2Act`, width: 120, children: [btn(`${prefix}H2View`, "Xem", "secondary", "eye")] },
          ]),
        ],
      },
    ],
  };
}

function buildCustEdit(prefix) {
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
        id: `${prefix}Form`,
        width: "fill_container",
        fill: C.card,
        cornerRadius: 16,
        stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
        padding: 14,
        layout: "vertical",
        gap: 10,
        children: [
          txt(`${prefix}T`, "Cập nhật khách hàng", { fontSize: 14, fontWeight: "900" }),
          pill(`${prefix}F1`, "Tên: Trần Thị Mai", "#111827", "#E5E7EB", "user"),
          pill(`${prefix}F2`, "SĐT: 0903 *** 221", "#111827", "#E5E7EB", "phone"),
          pill(`${prefix}F3`, "Ghi chú: Ưu tiên ghế đầu", "#111827", "#E5E7EB", "sticky-note"),
          {
            type: "frame",
            id: `${prefix}Row`,
            width: "fill_container",
            layout: "horizontal",
            gap: 10,
            children: [
              btn(`${prefix}Save`, "Lưu", "primary", "check"),
              btn(`${prefix}Cancel`, "Hủy", "secondary", "x"),
              btn(`${prefix}Blk`, "Đưa vào blacklist", "secondary", "ban"),
            ],
          },
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

const baseY = 22080;
const pages = [
  buildPageFromTemplate(template, "nvCustList", "NovaLimo Admin · Khách hàng", 0, baseY, "Khách hàng", "Danh sách khách · Tag/VIP/Blacklist · Lịch sử vé & ký gửi", buildCustList),
  buildPageFromTemplate(template, "nvCustDet", "NovaLimo Admin · Chi tiết Khách hàng", 1600, baseY, "Chi tiết Khách hàng", "Hồ sơ · Lịch sử vé/ký gửi · Ghi chú nội bộ", buildCustDet),
  buildPageFromTemplate(template, "nvCustEd", "NovaLimo Admin · Sửa Khách hàng", 3200, baseY, "Sửa Khách hàng", "Cập nhật thông tin · Ghi chú · Blacklist", buildCustEdit),
];

doc.children.push(...pages);
fs.writeFileSync(penPath, JSON.stringify(doc, null, 2), "utf8");
console.log(`Inserted ${pages.length} customer pages at y=${baseY}`);

