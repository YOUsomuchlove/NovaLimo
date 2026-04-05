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

function buildWizard(prefix) {
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
        id: `${prefix}Steps`,
        width: "fill_container",
        height: 54,
        fill: "#111827",
        cornerRadius: 16,
        stroke: { align: "inside", thickness: 1, fill: C.stroke },
        padding: [0, 14],
        gap: 10,
        alignItems: "center",
        children: [
          pill(`${prefix}S1`, "1. Thông tin khách", "#1D4ED8", "#DBEAFE", "user"),
          pill(`${prefix}S2`, "2. Điểm đón/trả", "#111827", "#E5E7EB", "map-pin"),
          pill(`${prefix}S3`, "3. Giá & xác nhận", "#111827", "#E5E7EB", "wallet"),
          { type: "frame", id: `${prefix}Spacer`, width: "fill_container", height: 1, fill: "#111827" },
          btn(`${prefix}Next`, "Tiếp tục", "primary", "chevron-right"),
        ],
      },
      card(`${prefix}C1`, "Tạo vé thủ công (Call Center)", [
        pill(`${prefix}F1`, "Họ tên: Trần Thị Mai", "#111827", "#E5E7EB", "user"),
        pill(`${prefix}F2`, "SĐT: 0903 *** 221", "#111827", "#E5E7EB", "phone"),
        pill(`${prefix}F3`, "Tuyến: Hà Nội → Quảng Ninh", "#111827", "#E5E7EB", "route"),
        pill(`${prefix}F4`, "Giờ: 14:00 · Hôm nay", "#111827", "#E5E7EB", "clock"),
        {
          type: "frame",
          id: `${prefix}Actions`,
          width: "fill_container",
          layout: "horizontal",
          gap: 10,
          children: [
            btn(`${prefix}Calc`, "Tính giá", "secondary", "sparkles"),
            btn(`${prefix}Create`, "Tạo vé", "primary", "check"),
          ],
        },
      ]),
    ],
  };
}

function buildRequests(prefix) {
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
          btn(`${prefix}All`, "Tất cả", "secondary", "inbox"),
          btn(`${prefix}Change`, "Đổi giờ", "secondary", "clock"),
          btn(`${prefix}Cancel`, "Hủy", "secondary", "x-circle"),
          btn(`${prefix}Refund`, "Hoàn/COD", "secondary", "banknote"),
          { type: "frame", id: `${prefix}Spacer`, width: "fill_container", height: 1, fill: C.card },
          btn(`${prefix}Export`, "Xuất", "primary", "download"),
        ],
      },
      card(`${prefix}List`, "Yêu cầu cần xử lý", [
        pill(`${prefix}R1`, "REQ-001 · Đổi giờ · Vé ORD-P1-000142", "#111827", "#E5E7EB", "clock"),
        pill(`${prefix}R2`, "REQ-002 · Hủy vé · Lý do: bận đột xuất", "#3B1D00", "#FBBF24", "triangle-alert"),
        {
          type: "frame",
          id: `${prefix}ListBtns`,
          width: "fill_container",
          layout: "horizontal",
          gap: 10,
          children: [
            btn(`${prefix}Approve`, "Duyệt", "primary", "check"),
            btn(`${prefix}Reject`, "Từ chối", "secondary", "x"),
            btn(`${prefix}OpenChat`, "Liên hệ", "secondary", "message-square"),
          ],
        },
      ]),
    ],
  };
}

function buildInbox(prefix) {
  return {
    type: "frame",
    id: `${prefix}Content`,
    width: "fill_container",
    layout: "horizontal",
    gap: 12,
    padding: [18, 28],
    children: [
      card(`${prefix}Threads`, "Hộp thư hỗ trợ", [
        pill(`${prefix}T1`, "Tài xế An · Kẹt xe điểm A", "#111827", "#E5E7EB", "message-square"),
        pill(`${prefix}T2`, "Khách Mai · Đổi điểm đón", "#111827", "#E5E7EB", "message-square"),
        pill(`${prefix}T3`, "COD · Thiếu 200k", "#3B1D00", "#FBBF24", "banknote"),
      ]),
      {
        type: "frame",
        id: `${prefix}Chat`,
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
            id: `${prefix}ChatHdr`,
            width: "fill_container",
            layout: "horizontal",
            justifyContent: "space_between",
            alignItems: "center",
            children: [
              txt(`${prefix}ChatTitle`, "Tài xế An · Chuyến TRP-1400-01", { fontSize: 14, fontWeight: "900" }),
              btn(`${prefix}Call`, "Gọi", "secondary", "phone-call"),
            ],
          },
          pill(`${prefix}M1`, "Tài xế: Kẹt xe điểm A, trễ ~10 phút.", "#111827", "#E5E7EB", "user"),
          pill(`${prefix}M2`, "Điều hành: Ok, đi lối cầu mới. Mình báo khách.", "#1D4ED8", "#DBEAFE", "shield-check"),
          {
            type: "frame",
            id: `${prefix}Composer`,
            width: "fill_container",
            height: 54,
            fill: "#111827",
            cornerRadius: 14,
            stroke: { align: "inside", thickness: 1, fill: C.stroke },
            padding: [0, 12],
            gap: 10,
            alignItems: "center",
            children: [
              icon(`${prefix}CompIc`, "mic", { size: 18, fill: C.gold }),
              txt(`${prefix}CompTx`, "Nhập tin nhắn / gửi voice…", { fill: C.muted, fontSize: 12, fontWeight: "600", width: "fill_container", textGrowth: "fixed-width" }),
              btn(`${prefix}Send`, "Gửi", "primary", "send"),
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

const baseY = 26600;
const pages = [
  buildPageFromTemplate(template, "nvCcCreateBooking", "NovaLimo Admin · Tổng đài · Tạo vé thủ công", 0, baseY, "Tổng đài · Tạo vé thủ công", "Wizard · Khách gọi tổng đài · Xác nhận nhanh", buildWizard),
  buildPageFromTemplate(template, "nvCcRequests", "NovaLimo Admin · Tổng đài · Yêu cầu/CS", 1600, baseY, "Tổng đài · Yêu cầu/CS", "Đổi giờ · Hủy · Hoàn/COD · Tác nghiệp nhanh", buildRequests),
  buildPageFromTemplate(template, "nvCcSupportInbox", "NovaLimo Admin · Tổng đài · Hộp thư hỗ trợ", 3200, baseY, "Tổng đài · Hộp thư hỗ trợ", "Inbox · Chat/ticket (mô phỏng) · Voice note", buildInbox),
];

doc.children.push(...pages);
fs.writeFileSync(penPath, JSON.stringify(doc, null, 2), "utf8");
console.log(`Inserted ${pages.length} callcenter pages at y=${baseY}`);

