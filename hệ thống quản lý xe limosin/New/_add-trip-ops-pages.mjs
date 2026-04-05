import fs from "node:fs";

const penPath = "G:/NovaLimo/hệ thống quản lý xe limosin/New/web-admin.pen";
const doc = JSON.parse(fs.readFileSync(penPath, "utf8"));

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
    // keep names as-is; ids must be unique.
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
    if (found) return;
    if (n?.id === id) found = n;
  });
  return found;
}

// UI helpers (kept minimal but consistent with existing palette)
const C = {
  bg: "#0B1020",
  card: "#0B1020",
  card2: "#050814",
  stroke: "#334155",
  stroke2: "#1F2937",
  text: "#F9FAFB",
  sub: "#9CA6C4",
  muted: "#94A3B8",
  gold: "#D4AF37",
  green: "#22C55E",
  red: "#EF4444",
  blue: "#2563EB",
};

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
    ...(opts.lineHeight ? { lineHeight: opts.lineHeight } : {}),
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

function pill(id, label, colorFill, colorTx, iconName) {
  return {
    type: "frame",
    id,
    width: "fit_content",
    height: 28,
    fill: colorFill,
    cornerRadius: 999,
    padding: [0, 10],
    gap: 8,
    alignItems: "center",
    children: [
      ...(iconName ? [icon(`${id}Ic`, iconName, { size: 14, fill: colorTx })] : []),
      txt(`${id}Tx`, label, { fill: colorTx, fontSize: 12, fontWeight: "800" }),
    ],
  };
}

function btn(id, label, variant = "primary", iconName) {
  const styles =
    variant === "primary"
      ? { fill: C.gold, tx: C.card, ic: C.card, stroke: null }
      : variant === "danger"
        ? { fill: "#7F1D1D", tx: "#FEE2E2", ic: "#FCA5A5", stroke: "#991B1B" }
        : { fill: "#111827", tx: "#E5E7EB", ic: "#E5E7EB", stroke: C.stroke };

  return {
    type: "frame",
    id,
    width: "fit_content",
    height: 38,
    fill: styles.fill,
    cornerRadius: 12,
    ...(styles.stroke
      ? {
          stroke: { align: "inside", thickness: 1, fill: styles.stroke },
        }
      : {}),
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

function statCard(id, title, value, iconName, accentFill) {
  return {
    type: "frame",
    id,
    width: "fill_container",
    fill: C.card,
    cornerRadius: 16,
    stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
    padding: 14,
    gap: 12,
    alignItems: "center",
    children: [
      {
        type: "frame",
        id: `${id}Badge`,
        width: 38,
        height: 38,
        fill: accentFill,
        cornerRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        children: [icon(`${id}BadgeIc`, iconName, { size: 18, fill: C.text })],
      },
      {
        type: "frame",
        id: `${id}Col`,
        layout: "vertical",
        gap: 2,
        children: [
          txt(`${id}Title`, title, { fill: C.sub, fontSize: 12, fontWeight: "700" }),
          txt(`${id}Val`, value, { fill: C.text, fontSize: 18, fontWeight: "900" }),
        ],
      },
    ],
  };
}

function tableHeaderCell(id, label, w) {
  return txt(id, label, {
    fill: C.sub,
    fontSize: 12,
    fontWeight: "800",
    width: w,
    textGrowth: "fixed-width",
  });
}

function tableCell(id, content, w, opts = {}) {
  return txt(id, content, {
    fill: opts.fill ?? C.text,
    fontSize: 12,
    fontWeight: opts.bold ? "800" : "600",
    width: w,
    textGrowth: "fixed-width",
  });
}

function tableRow(id, cells) {
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

function buildTripRunsListContent(prefix) {
  return {
    type: "frame",
    id: `${prefix}Content`,
    name: "Content",
    width: "fill_container",
    layout: "vertical",
    gap: 14,
    padding: [18, 28],
    children: [
      {
        type: "frame",
        id: `${prefix}StatsRow`,
        width: "fill_container",
        layout: "horizontal",
        gap: 12,
        children: [
          statCard(`${prefix}S1`, "Chuyến đang chạy", "8", "route", "#1D4ED8"),
          statCard(`${prefix}S2`, "Chuyến chờ xuất bến", "5", "clock", "#3B2A00"),
          statCard(`${prefix}S3`, "Tỷ lệ đúng giờ", "92%", "check-circle-2", "#052E16"),
          statCard(`${prefix}S4`, "Sự cố cần xử lý", "2", "triangle-alert", "#3B1D00"),
        ],
      },
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
          btn(`${prefix}DateBtn`, "Hôm nay", "secondary", "calendar"),
          btn(`${prefix}StatusBtn`, "Trạng thái", "secondary", "chevron-down"),
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
              txt(`${prefix}SearchTx`, "Tìm chuyến / biển số / tài xế…", {
                fill: C.muted,
                fontSize: 12,
                fontWeight: "600",
                width: "fill_container",
                textGrowth: "fixed-width",
              }),
            ],
          },
          btn(`${prefix}CreateTrip`, "Tạo chuyến", "primary", "plus"),
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
              tableHeaderCell(`${prefix}ThCode`, "Mã", 90),
              tableHeaderCell(`${prefix}ThRoute`, "Tuyến", 210),
              tableHeaderCell(`${prefix}ThTime`, "Giờ", 90),
              tableHeaderCell(`${prefix}ThVeh`, "Xe", 100),
              tableHeaderCell(`${prefix}ThDrv`, "Tài xế", 160),
              tableHeaderCell(`${prefix}ThPax`, "Khách", 70),
              tableHeaderCell(`${prefix}ThCargo`, "Hàng", 70),
              tableHeaderCell(`${prefix}ThSt`, "Trạng thái", 130),
              tableHeaderCell(`${prefix}ThAct`, "Thao tác", 130),
            ],
          },
          tableRow(`${prefix}R1`, [
            tableCell(`${prefix}R1Code`, "TRP-1400-01", 90, { bold: true }),
            tableCell(`${prefix}R1Route`, "Hà Nội → Quảng Ninh", 210, { bold: true }),
            tableCell(`${prefix}R1Time`, "14:00", 90, { bold: true }),
            tableCell(`${prefix}R1Veh`, "29B-123.45", 100),
            tableCell(`${prefix}R1Drv`, "Nguyễn Văn An", 160),
            tableCell(`${prefix}R1Pax`, "9/9", 70, { fill: C.gold, bold: true }),
            tableCell(`${prefix}R1Cargo`, "3", 70),
            {
              type: "frame",
              id: `${prefix}R1St`,
              width: 130,
              children: [
                pill(`${prefix}R1StP`, "Đang chạy", "#052E16", "#4ADE80", "satellite"),
              ],
            },
            {
              type: "frame",
              id: `${prefix}R1Act`,
              width: 130,
              gap: 8,
              children: [
                btn(`${prefix}R1Eye`, "Xem", "secondary", "eye"),
              ],
            },
          ]),
          tableRow(`${prefix}R2`, [
            tableCell(`${prefix}R2Code`, "TRP-1600-02", 90, { bold: true }),
            tableCell(`${prefix}R2Route`, "Hà Nội → Hải Phòng", 210, { bold: true }),
            tableCell(`${prefix}R2Time`, "16:00", 90, { bold: true }),
            tableCell(`${prefix}R2Veh`, "30A-888.99", 100),
            tableCell(`${prefix}R2Drv`, "Trần Đức Long", 160),
            tableCell(`${prefix}R2Pax`, "6/9", 70),
            tableCell(`${prefix}R2Cargo`, "1", 70),
            {
              type: "frame",
              id: `${prefix}R2St`,
              width: 130,
              children: [
                pill(`${prefix}R2StP`, "Chờ xuất", "#111827", "#E5E7EB", "clock"),
              ],
            },
            {
              type: "frame",
              id: `${prefix}R2Act`,
              width: 130,
              gap: 8,
              children: [
                btn(`${prefix}R2Eye`, "Xem", "secondary", "eye"),
              ],
            },
          ]),
          {
            type: "text",
            id: `${prefix}Hint`,
            content:
              "Gợi ý: click 'Xem' để mở chi tiết chuyến, phơi lệnh và thao tác chỉnh sửa thứ tự đón/trả.",
            fill: C.sub,
            fontFamily: "Inter",
            fontSize: 11,
            fontWeight: "600",
            textGrowth: "fixed-width",
            width: "fill_container",
          },
        ],
      },
    ],
  };
}

function buildTripDetailContent(prefix) {
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
        id: `${prefix}TopRow`,
        width: "fill_container",
        layout: "horizontal",
        gap: 12,
        children: [
          {
            type: "frame",
            id: `${prefix}Info`,
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
                id: `${prefix}Info1`,
                layout: "horizontal",
                justifyContent: "space_between",
                alignItems: "center",
                children: [
                  txt(`${prefix}Code`, "TRP-1400-01", {
                    fill: C.text,
                    fontSize: 18,
                    fontWeight: "900",
                  }),
                  pill(`${prefix}St`, "Đang chạy", "#052E16", "#4ADE80", "satellite"),
                ],
              },
              txt(`${prefix}Route`, "Tuyến: Hà Nội → Quảng Ninh", {
                fill: C.sub,
                fontSize: 13,
                fontWeight: "700",
              }),
              {
                type: "frame",
                id: `${prefix}MetaRow`,
                width: "fill_container",
                layout: "horizontal",
                gap: 10,
                children: [
                  pill(`${prefix}M1`, "14:00 · Hôm nay", "#111827", "#E5E7EB", "clock"),
                  pill(`${prefix}M2`, "Xe 29B-123.45", "#111827", "#E5E7EB", "van"),
                  pill(`${prefix}M3`, "Tài xế: Nguyễn Văn An", "#111827", "#E5E7EB", "user"),
                ],
              },
              {
                type: "frame",
                id: `${prefix}Actions`,
                width: "fill_container",
                layout: "horizontal",
                gap: 10,
                children: [
                  btn(`${prefix}ToManifest`, "Mở phơi lệnh", "secondary", "file-text"),
                  btn(`${prefix}ToEdit`, "Chỉnh sửa", "primary", "pencil"),
                  btn(`${prefix}MarkIssue`, "Báo sự cố", "danger", "triangle-alert"),
                ],
              },
            ],
          },
          {
            type: "frame",
            id: `${prefix}Timeline`,
            width: 360,
            fill: C.card,
            cornerRadius: 16,
            stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
            padding: 14,
            layout: "vertical",
            gap: 10,
            children: [
              txt(`${prefix}TlT`, "Timeline", { fill: C.text, fontSize: 14, fontWeight: "900" }),
              pill(`${prefix}Tl1`, "14:05 · Rời bến", "#111827", "#E5E7EB", "flag"),
              pill(`${prefix}Tl2`, "14:22 · Đã đón #1", "#052E16", "#4ADE80", "check"),
              pill(`${prefix}Tl3`, "14:35 · Dự kiến đón #2", "#111827", "#E5E7EB", "map-pin"),
              {
                type: "text",
                id: `${prefix}TlHint`,
                content: "Mô phỏng sự kiện realtime (Socket.io).",
                fill: C.sub,
                fontFamily: "Inter",
                fontSize: 11,
                fontWeight: "600",
                textGrowth: "fixed-width",
                width: "fill_container",
              },
            ],
          },
        ],
      },
      {
        type: "frame",
        id: `${prefix}ListsRow`,
        width: "fill_container",
        layout: "horizontal",
        gap: 12,
        children: [
          {
            type: "frame",
            id: `${prefix}PaxList`,
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
                id: `${prefix}PaxHdr`,
                width: "fill_container",
                layout: "horizontal",
                justifyContent: "space_between",
                alignItems: "center",
                children: [
                  txt(`${prefix}PaxT`, "Danh sách khách (thứ tự đón)", {
                    fill: C.text,
                    fontSize: 14,
                    fontWeight: "900",
                  }),
                  pill(`${prefix}PaxCnt`, "9 khách", "#111827", "#E5E7EB", "users"),
                ],
              },
              tableRow(`${prefix}P1`, [
                tableCell(`${prefix}P1No`, "01", 40, { bold: true }),
                tableCell(`${prefix}P1Nm`, "Nguyễn Văn An", 160, { bold: true }),
                tableCell(`${prefix}P1Pk`, "Đón: 12 Trần Phú, HN", 300),
                tableCell(`${prefix}P1Dr`, "Trả: Bãi Cháy, HL", 220),
                {
                  type: "frame",
                  id: `${prefix}P1St`,
                  width: 120,
                  children: [pill(`${prefix}P1StP`, "Đã đón", "#052E16", "#4ADE80", "check")],
                },
              ]),
              tableRow(`${prefix}P2`, [
                tableCell(`${prefix}P2No`, "02", 40, { bold: true }),
                tableCell(`${prefix}P2Nm`, "Trần Thị Mai", 160, { bold: true }),
                tableCell(`${prefix}P2Pk`, "Đón: Ngõ 7 Phố Huế, HN", 300),
                tableCell(`${prefix}P2Dr`, "Trả: Hạ Long, HL", 220),
                {
                  type: "frame",
                  id: `${prefix}P2St`,
                  width: 120,
                  children: [pill(`${prefix}P2StP`, "Chờ đón", "#111827", "#E5E7EB", "clock")],
                },
              ]),
            ],
          },
          {
            type: "frame",
            id: `${prefix}CargoList`,
            width: 380,
            fill: C.card,
            cornerRadius: 16,
            stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
            padding: 14,
            layout: "vertical",
            gap: 10,
            children: [
              {
                type: "frame",
                id: `${prefix}CargoHdr`,
                width: "fill_container",
                layout: "horizontal",
                justifyContent: "space_between",
                alignItems: "center",
                children: [
                  txt(`${prefix}CargoT`, "Hàng hóa đi kèm", {
                    fill: C.text,
                    fontSize: 14,
                    fontWeight: "900",
                  }),
                  pill(`${prefix}CargoCnt`, "3 kiện", "#111827", "#E5E7EB", "package"),
                ],
              },
              tableRow(`${prefix}C1`, [
                tableCell(`${prefix}C1Code`, "NL-QR-8F2A", 120, { bold: true }),
                tableCell(`${prefix}C1To`, "Giao: Hạ Long", 170),
                {
                  type: "frame",
                  id: `${prefix}C1Cod`,
                  width: 120,
                  children: [pill(`${prefix}C1CodP`, "COD 350k", "#3B1D00", "#FBBF24", "banknote")],
                },
              ]),
              tableRow(`${prefix}C2`, [
                tableCell(`${prefix}C2Code`, "NL-QR-0C9D", 120, { bold: true }),
                tableCell(`${prefix}C2To`, "Giao: Bãi Cháy", 170),
                {
                  type: "frame",
                  id: `${prefix}C2Cod`,
                  width: 120,
                  children: [pill(`${prefix}C2CodP`, "Không COD", "#111827", "#E5E7EB", "minus")],
                },
              ]),
            ],
          },
        ],
      },
    ],
  };
}

function buildTripManifestContent(prefix) {
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
        id: `${prefix}PrintBar`,
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
          pill(`${prefix}Doc`, "Phơi lệnh / Manifest", "#111827", "#E5E7EB", "file-text"),
          {
            type: "frame",
            id: `${prefix}Spacer`,
            width: "fill_container",
            height: 1,
            fill: C.card,
          },
          btn(`${prefix}Print`, "In", "secondary", "printer"),
          btn(`${prefix}Export`, "Xuất PDF", "primary", "download"),
        ],
      },
      {
        type: "frame",
        id: `${prefix}Sheet`,
        width: "fill_container",
        fill: "#FFFFFF",
        cornerRadius: 16,
        padding: 18,
        layout: "vertical",
        gap: 12,
        children: [
          {
            type: "frame",
            id: `${prefix}SheetTop`,
            width: "fill_container",
            layout: "horizontal",
            justifyContent: "space_between",
            alignItems: "center",
            children: [
              {
                type: "frame",
                id: `${prefix}SheetTitleCol`,
                layout: "vertical",
                gap: 4,
                children: [
                  txt(`${prefix}SheetTitle`, "PHƠI LỆNH CHUYẾN · TRP-1400-01", {
                    fill: "#0B1020",
                    fontSize: 16,
                    fontWeight: "900",
                  }),
                  txt(`${prefix}SheetSub`, "Hà Nội → Quảng Ninh · 14:00 · Xe 29B-123.45", {
                    fill: "#334155",
                    fontSize: 12,
                    fontWeight: "700",
                  }),
                ],
              },
              {
                type: "frame",
                id: `${prefix}Qr`,
                width: 92,
                height: 92,
                fill: "#F1F5F9",
                cornerRadius: 12,
                stroke: { align: "inside", thickness: 1, fill: "#CBD5E1" },
                justifyContent: "center",
                alignItems: "center",
                children: [
                  icon(`${prefix}QrIc`, "qr-code", { size: 40, fill: "#0F172A" }),
                ],
              },
            ],
          },
          {
            type: "rectangle",
            id: `${prefix}SheetSep`,
            width: "fill_container",
            height: 1,
            fill: "#E2E8F0",
          },
          txt(`${prefix}SheetPaxHdr`, "Danh sách khách (theo thứ tự đón)", {
            fill: "#0B1020",
            fontSize: 13,
            fontWeight: "900",
          }),
          {
            type: "frame",
            id: `${prefix}SheetTbl`,
            width: "fill_container",
            layout: "vertical",
            gap: 8,
            children: [
              {
                type: "frame",
                id: `${prefix}SheetTh`,
                width: "fill_container",
                height: 26,
                layout: "horizontal",
                gap: 10,
                alignItems: "center",
                children: [
                  txt(`${prefix}SThNo`, "#", { fill: "#475569", width: 40, textGrowth: "fixed-width", fontSize: 12, fontWeight: "900" }),
                  txt(`${prefix}SThName`, "Họ tên", { fill: "#475569", width: 160, textGrowth: "fixed-width", fontSize: 12, fontWeight: "900" }),
                  txt(`${prefix}SThPhone`, "SĐT", { fill: "#475569", width: 120, textGrowth: "fixed-width", fontSize: 12, fontWeight: "900" }),
                  txt(`${prefix}SThPick`, "Điểm đón", { fill: "#475569", width: 330, textGrowth: "fixed-width", fontSize: 12, fontWeight: "900" }),
                  txt(`${prefix}SThDrop`, "Điểm trả", { fill: "#475569", width: 330, textGrowth: "fixed-width", fontSize: 12, fontWeight: "900" }),
                ],
              },
              {
                type: "frame",
                id: `${prefix}SRow1`,
                width: "fill_container",
                height: 34,
                layout: "horizontal",
                gap: 10,
                alignItems: "center",
                children: [
                  txt(`${prefix}S1No`, "1", { fill: "#0B1020", width: 40, textGrowth: "fixed-width", fontSize: 12, fontWeight: "800" }),
                  txt(`${prefix}S1Name`, "Nguyễn Văn An", { fill: "#0B1020", width: 160, textGrowth: "fixed-width", fontSize: 12, fontWeight: "800" }),
                  txt(`${prefix}S1Phone`, "0912***678", { fill: "#0B1020", width: 120, textGrowth: "fixed-width", fontSize: 12, fontWeight: "700" }),
                  txt(`${prefix}S1Pick`, "12 Trần Phú, Ba Đình, HN", { fill: "#0B1020", width: 330, textGrowth: "fixed-width", fontSize: 12, fontWeight: "700" }),
                  txt(`${prefix}S1Drop`, "Bãi Cháy, Hạ Long", { fill: "#0B1020", width: 330, textGrowth: "fixed-width", fontSize: 12, fontWeight: "700" }),
                ],
              },
            ],
          },
          txt(`${prefix}SheetCargoHdr`, "Hàng hóa ký gửi", {
            fill: "#0B1020",
            fontSize: 13,
            fontWeight: "900",
          }),
          txt(`${prefix}SheetCargoHint`, "Ghi chú: hàng hóa là “hành khách ảo”, không chiếm ghế.", {
            fill: "#475569",
            fontSize: 12,
            fontWeight: "700",
            textGrowth: "fixed-width",
            width: "fill_container",
          }),
        ],
      },
    ],
  };
}

function buildTripEditContent(prefix) {
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
        id: `${prefix}Warn`,
        width: "fill_container",
        height: 54,
        fill: "#3B1D00",
        cornerRadius: 16,
        stroke: { align: "inside", thickness: 1, fill: "#F59E0B" },
        padding: [0, 14],
        gap: 10,
        alignItems: "center",
        children: [
          icon(`${prefix}WarnIc`, "triangle-alert", { size: 18, fill: "#FBBF24" }),
          txt(`${prefix}WarnTx`, "Chỉnh sửa thứ tự đón/trả sẽ ảnh hưởng lộ trình. Hãy kiểm tra trước khi xuất lệnh.", {
            fill: "#FEF3C7",
            fontSize: 12,
            fontWeight: "800",
            width: "fill_container",
            textGrowth: "fixed-width",
          }),
          btn(`${prefix}SaveBtn`, "Lưu thay đổi", "primary", "check"),
        ],
      },
      {
        type: "frame",
        id: `${prefix}DnD`,
        width: "fill_container",
        fill: C.card,
        cornerRadius: 16,
        stroke: { align: "inside", thickness: 1, fill: C.stroke2 },
        padding: 14,
        layout: "vertical",
        gap: 10,
        children: [
          txt(`${prefix}DnDT`, "Kéo thả để sắp xếp lại (mô phỏng)", {
            fill: C.text,
            fontSize: 14,
            fontWeight: "900",
          }),
          tableRow(`${prefix}DnD1`, [
            icon(`${prefix}DnD1Grip`, "grip-vertical", { size: 16, fill: C.muted }),
            tableCell(`${prefix}DnD1No`, "01", 40, { bold: true }),
            tableCell(`${prefix}DnD1Nm`, "Nguyễn Văn An", 160, { bold: true }),
            tableCell(`${prefix}DnD1Pk`, "Đón: 12 Trần Phú, HN", 360),
            pill(`${prefix}DnD1Tag`, "Đang giữ", "#052E16", "#4ADE80", "check"),
          ]),
          tableRow(`${prefix}DnD2`, [
            icon(`${prefix}DnD2Grip`, "grip-vertical", { size: 16, fill: C.muted }),
            tableCell(`${prefix}DnD2No`, "02", 40, { bold: true }),
            tableCell(`${prefix}DnD2Nm`, "Trần Thị Mai", 160, { bold: true }),
            tableCell(`${prefix}DnD2Pk`, "Đón: Ngõ 7 Phố Huế, HN", 360),
            pill(`${prefix}DnD2Tag`, "Chờ", "#111827", "#E5E7EB", "clock"),
          ]),
          {
            type: "frame",
            id: `${prefix}DnDHintRow`,
            width: "fill_container",
            layout: "horizontal",
            gap: 10,
            children: [
              btn(`${prefix}RecalcBtn`, "Tính lại ETA", "secondary", "sparkles"),
              btn(`${prefix}ExportBtn`, "Xuất lệnh", "primary", "send"),
            ],
          },
        ],
      },
    ],
  };
}

function buildPageFromTemplate(template, pageId, name, x, y, hdrTitle, hdrSub, contentBuilder) {
  const page = deepClone(template);

  // remap ids: nvOrd* -> pageId*
  remapIds(page, (old) => {
    if (old.startsWith("nvOrd")) return pageId + old.slice("nvOrd".length);
    if (old.startsWith("nvOrdP")) return pageId + old.slice("nvOrdP".length);
    return `${pageId}_${old}`;
  });

  // set top-level
  page.id = pageId;
  page.name = name;
  page.x = x;
  page.y = y;
  page.width = 1440;
  page.height = 2000;

  // update header texts
  const hdrT = findById(page, `${pageId}HdrT`);
  const hdrS = findById(page, `${pageId}HdrS`);
  if (hdrT && hdrT.type === "text") hdrT.content = hdrTitle;
  if (hdrS && hdrS.type === "text") hdrS.content = hdrSub;

  // replace main content under Main column, keep header frame, then new content
  const main = findById(page, `${pageId}Main`);
  if (!main) throw new Error(`Main not found for ${pageId}`);
  const headerFrame = main.children?.find((c) => c?.id === `${pageId}Hdr`);
  main.layout = "vertical";
  main.gap = 0;
  main.height = 2000;
  main.children = [headerFrame, contentBuilder(`${pageId}`)].filter(Boolean);

  return page;
}

const template = doc.children.find((n) => n?.type === "frame" && n.id === "nvOrdPage");
if (!template) throw new Error("Template nvOrdPage not found");

const baseY = 19820;
const pages = [
  buildPageFromTemplate(
    template,
    "nvTripRunsList",
    "NovaLimo Admin · Quản lý Chuyến (Trip Runs)",
    0,
    baseY,
    "Quản lý Chuyến (Trip Runs)",
    "Danh sách chuyến · Filter mạnh · Drill-down chi tiết/phơi lệnh",
    buildTripRunsListContent
  ),
  buildPageFromTemplate(
    template,
    "nvTripRunDet",
    "NovaLimo Admin · Chi tiết Chuyến",
    1600,
    baseY,
    "Chi tiết Chuyến",
    "Timeline realtime · Danh sách khách & hàng hóa theo chuyến",
    buildTripDetailContent
  ),
  buildPageFromTemplate(
    template,
    "nvTripRunManifest",
    "NovaLimo Admin · Phơi lệnh (Manifest)",
    3200,
    baseY,
    "Phơi lệnh (Manifest)",
    "In/xuất lệnh · QR · Thứ tự đón/trả",
    buildTripManifestContent
  ),
  buildPageFromTemplate(
    template,
    "nvTripRunEdit",
    "NovaLimo Admin · Chỉnh sửa Chuyến",
    4800,
    baseY,
    "Chỉnh sửa Chuyến",
    "Kéo thả thứ tự đón/trả · Tính ETA · Xuất lệnh",
    buildTripEditContent
  ),
];

doc.children.push(...pages);

fs.writeFileSync(penPath, JSON.stringify(doc, null, 2), "utf8");
console.log(`Inserted ${pages.length} Trip Ops pages at y=${baseY}`);

