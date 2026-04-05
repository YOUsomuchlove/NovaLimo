/**
 * Patches web-bôking.pen:
 * - Inserts new booking/cargo/legal frames below 43TrKq2
 * - Adds "Ký gửi hàng" to header (after Bảng Giá) where missing
 * - Adds footer link5 "Ký gửi hàng" after Liên Hệ where missing
 * Run: node _add-web-booking-pages.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PEN = path.join(__dirname, "web-bôking.pen");

const HEADER_CTA_DESC = {
  dwwx2: { x: 46.5, fill: "#0B1020", y: 14 },
  fIEfR: {
    x: 76.5,
    content: "Đặt vé ngay",
    fill: "#0B1020",
    fontWeight: "900",
    fontSize: 13,
    y: 16,
  },
};

function collectIds(node, set) {
  if (!node || typeof node !== "object") return;
  if (node.id) set.add(node.id);
  if (Array.isArray(node.children)) node.children.forEach((c) => collectIds(c, set));
}

function walkInsertNavCargo(children, used, genId) {
  if (!Array.isArray(children)) return;
  for (let i = 0; i < children.length; i++) {
    const n = children[i];
    if (
      n?.type === "text" &&
      n.name === "Nav Price" &&
      n.content === "Bảng Giá"
    ) {
      const next = children[i + 1];
      if (next?.name === "Nav Cargo") {
        walkInsertNavCargo(n.children, used, genId);
        continue;
      }
      children.splice(i + 1, 0, {
        type: "text",
        id: genId("wbNavCg"),
        name: "Nav Cargo",
        fill: "#F2F3F0",
        content: "Ký gửi hàng",
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "600",
      });
      i++;
    }
    if (n?.children) walkInsertNavCargo(n.children, used, genId);
  }
}

function walkInsertFooterLink(children, genId) {
  if (!Array.isArray(children)) return;
  for (let i = 0; i < children.length; i++) {
    const n = children[i];
    if (
      n?.type === "text" &&
      n.name === "link4" &&
      n.content === "Liên Hệ"
    ) {
      const next = children[i + 1];
      if (next?.name === "link5" && next?.content === "Ký gửi hàng") {
        if (n.children) walkInsertFooterLink(n.children, genId);
        continue;
      }
      children.splice(i + 1, 0, {
        type: "text",
        id: genId("wbFtCg"),
        name: "link5",
        x: 520,
        y: 208,
        fill: "#E8E8EA",
        content: "Ký gửi hàng",
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "500",
      });
      i++;
    }
    if (n?.children) walkInsertFooterLink(n.children, genId);
  }
}

function makeIdFactory(used) {
  return function genId(prefix) {
    let id;
    do {
      id = prefix + crypto.randomBytes(5).toString("hex");
    } while (used.has(id));
    used.add(id);
    return id;
  };
}

/** @param {'home'|'about'|'price'|'cargo'|'contact'} active */
function makeHeader(genId, active) {
  const st = (key) =>
    active === key
      ? { fill: "#D4AF37", fontWeight: "800" }
      : { fill: "#F2F3F0", fontWeight: "600" };

  const h = st("home");
  const a = st("about");
  const p = st("price");
  const c = st("cargo");
  const ct = st("contact");

  return {
    hbg: genId("wbHB"),
    hline: genId("wbHL"),
    hdr: genId("wbHD"),
    left: genId("wbHLf"),
    logo: genId("wbLG"),
    navHome: { id: genId("wbNH"), ...h },
    navAbout: { id: genId("wbNA"), ...a },
    navPrice: { id: genId("wbNP"), ...p },
    navCargo: { id: genId("wbNC"), ...c },
    navContact: { id: genId("wbNT"), ...ct },
    hdrRight: genId("wbHR"),
    cta: genId("wbCT"),
  };
}

function headerNodes(H) {
  return [
    {
      type: "rectangle",
      id: H.hbg,
      x: 0,
      y: 0,
      name: "Header BG",
      fill: "#0B1020E6",
      width: 1440,
      height: 72,
      effect: {
        type: "shadow",
        shadowType: "outer",
        color: "#00000022",
        offset: { x: 0, y: 2 },
        blur: 18,
        spread: -4,
      },
    },
    {
      type: "rectangle",
      id: H.hline,
      x: 0,
      y: 72,
      name: "Header Line",
      fill: "#D4AF37",
      width: 1440,
      height: 1,
    },
    {
      type: "frame",
      id: H.hdr,
      x: 0,
      y: 0,
      name: "header",
      width: 1440,
      height: 72,
      padding: [0, 64],
      justifyContent: "space_between",
      alignItems: "center",
      children: [
        {
          type: "frame",
          id: H.left,
          name: "Header Left",
          width: 980,
          height: 72,
          gap: 22,
          alignItems: "center",
          children: [
            {
              type: "text",
              id: H.logo,
              name: "Logo Text",
              fill: "#FFFFFF",
              content: "NovaLimo",
              fontFamily: "Inter",
              fontSize: 20,
              fontWeight: "800",
            },
            {
              type: "text",
              id: H.navHome.id,
              name: "Nav Home",
              fill: H.navHome.fill,
              content: "Trang Chủ",
              fontFamily: "Inter",
              fontSize: 14,
              fontWeight: H.navHome.fontWeight,
            },
            {
              type: "text",
              id: H.navAbout.id,
              name: "Nav About",
              fill: H.navAbout.fill,
              content: "Giới Thiệu",
              fontFamily: "Inter",
              fontSize: 14,
              fontWeight: H.navAbout.fontWeight,
            },
            {
              type: "text",
              id: H.navPrice.id,
              name: "Nav Price",
              fill: H.navPrice.fill,
              content: "Bảng Giá",
              fontFamily: "Inter",
              fontSize: 14,
              fontWeight: H.navPrice.fontWeight,
            },
            {
              type: "text",
              id: H.navCargo.id,
              name: "Nav Cargo",
              fill: H.navCargo.fill,
              content: "Ký gửi hàng",
              fontFamily: "Inter",
              fontSize: 14,
              fontWeight: H.navCargo.fontWeight,
            },
            {
              type: "text",
              id: H.navContact.id,
              name: "Nav Contact",
              fill: H.navContact.fill,
              content: "Liên Hệ",
              fontFamily: "Inter",
              fontSize: 14,
              fontWeight: H.navContact.fontWeight,
            },
          ],
        },
        {
          type: "frame",
          id: H.hdrRight,
          name: "Header Right",
          width: 240,
          height: 72,
          gap: 12,
          justifyContent: "end",
          alignItems: "center",
          children: [
            {
              id: H.cta,
              type: "ref",
              ref: "PoWVd",
              name: "Header CTA",
              width: 200,
              height: 52,
              x: 40,
              y: 10,
              fill: "#D4AF37",
              cornerRadius: 14,
              effect: {
                type: "shadow",
                shadowType: "outer",
                color: "#00000022",
                offset: { x: 0, y: 3 },
                blur: 16,
                spread: -4,
              },
              descendants: HEADER_CTA_DESC,
            },
          ],
        },
      ],
    },
  ];
}

function footerNodes(genId) {
  const ids = {
    foot: genId("wbFt"),
    line: genId("wbFL"),
    logo: genId("wbFgL"),
    desc: genId("wbFd"),
    colT: genId("wbFcT"),
    l1: genId("wbFl1"),
    l2: genId("wbFl2"),
    l3: genId("wbFl3"),
    l4: genId("wbFl4"),
    l5: genId("wbFl5"),
    cT: genId("wbFCT"),
    ph: genId("wbFph"),
    em: genId("wbFem"),
    ad: genId("wbFad"),
    bot: genId("wbFbt"),
    botL: genId("wbFbL"),
  };
  return {
    ids,
    nodes: [
      {
        type: "frame",
        id: ids.foot,
        x: 0,
        y: 0,
        name: "foot",
        width: 1440,
        height: 380,
        fill: "#0B1020",
        layout: "none",
        children: [
          {
            type: "rectangle",
            id: ids.line,
            x: 64,
            y: 0,
            name: "Footer Top Line",
            fill: "#D4AF37",
            width: 1312,
            height: 1,
          },
          {
            type: "text",
            id: ids.logo,
            x: 64,
            y: 56,
            name: "Footer Logo",
            fill: "#FFFFFF",
            content: "NovaLimo",
            fontFamily: "Inter",
            fontSize: 20,
            fontWeight: "800",
          },
          {
            type: "text",
            id: ids.desc,
            x: 64,
            y: 96,
            name: "Footer Desc",
            fill: "#B2CCFF",
            content:
              "Đặt vé limousine cao cấp. SĐT đặt vé = SĐT tra cứu vé & liên hệ hỗ trợ (cùng hệ thống).",
            lineHeight: 1.65,
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "normal",
          },
          {
            type: "text",
            id: ids.colT,
            x: 520,
            y: 56,
            name: "colLinksTitle",
            fill: "#D4AF37",
            content: "Liên kết",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "700",
          },
          {
            type: "text",
            id: ids.l1,
            x: 520,
            y: 96,
            name: "link1",
            fill: "#E8E8EA",
            content: "Trang Chủ",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "500",
          },
          {
            type: "text",
            id: ids.l2,
            x: 520,
            y: 124,
            name: "link2",
            fill: "#E8E8EA",
            content: "Giới Thiệu",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "500",
          },
          {
            type: "text",
            id: ids.l3,
            x: 520,
            y: 152,
            name: "link3",
            fill: "#E8E8EA",
            content: "Bảng Giá",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "500",
          },
          {
            type: "text",
            id: ids.l4,
            x: 520,
            y: 180,
            name: "link4",
            fill: "#E8E8EA",
            content: "Liên Hệ",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "500",
          },
          {
            type: "text",
            id: ids.l5,
            x: 520,
            y: 208,
            name: "link5",
            fill: "#E8E8EA",
            content: "Ký gửi hàng",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "500",
          },
          {
            type: "text",
            id: ids.cT,
            x: 900,
            y: 56,
            name: "colContactTitle",
            fill: "#D4AF37",
            content: "Liên Hệ",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "700",
          },
          {
            type: "text",
            id: ids.ph,
            x: 900,
            y: 96,
            name: "phone",
            fill: "#E8E8EA",
            content: "Hotline: 1900 3528",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "500",
          },
          {
            type: "text",
            id: ids.em,
            x: 900,
            y: 124,
            name: "mail",
            fill: "#E8E8EA",
            content: "Email: support@novalimo.vn",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "500",
          },
          {
            type: "text",
            id: ids.ad,
            x: 900,
            y: 152,
            name: "addr",
            fill: "#E8E8EA",
            content:
              "Địa chỉ VP: Tầng 8, 123 Nguyễn Trãi, Q. Thanh Xuân, Hà Nội",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "500",
          },
          {
            type: "text",
            id: ids.bot,
            x: 64,
            y: 340,
            name: "footerBottom",
            fill: "#888799",
            content: "© 2026 NovaLimo. All rights reserved.",
            lineHeight: 1.6,
            fontFamily: "Inter",
            fontSize: 12,
            fontWeight: "normal",
          },
          {
            type: "rectangle",
            id: ids.botL,
            x: 64,
            y: 320,
            name: "Footer Bottom Line",
            fill: "#1A182E",
            width: 1312,
            height: 1,
          },
        ],
      },
    ],
  };
}

function inputRef(genId, x, y, width, placeholder, labelHidden = true) {
  const id = genId("wbIn");
  return {
    id,
    type: "ref",
    ref: "uEeaR",
    name: "Input",
    x,
    y,
    width,
    height: "fit_content",
    descendants: {
      FAr9l: {
        width: "fill_container(564)",
        enabled: !labelHidden,
        height: "fit_content",
      },
      EVJFg: { width: "fill_container" },
      FcSY0: {
        width: "fill_container",
        cornerRadius: 14,
        height: "fit_content",
      },
      SdDrF: {
        width: "fill_container",
        content: placeholder,
        fill: "#616167",
        x: 24,
        y: 18,
      },
    },
  };
}

function selectRef(genId, x, y, width, option) {
  return {
    id: genId("wbSe"),
    type: "ref",
    ref: "gqrFC",
    name: "Select",
    x,
    y,
    width,
    height: "fit_content",
    descendants: {
      w9KWi: { enabled: false, height: "fit_content" },
      yBLtW: { width: "fill_container" },
      J2yno: {
        width: "fill_container",
        cornerRadius: 14,
        height: "fit_content",
      },
      "8mNGM": {
        width: "fill_container",
        content: option,
        fill: "#616167",
        x: 24,
        y: 18,
      },
    },
  };
}

const IMG = {
  cargo: {
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    username: "chuttersnap",
    link: "https://unsplash.com/@chuttersnap",
    author: "CHUTTERSNAP",
  },
  form: {
    url: "https://images.unsplash.com/photo-1566576721346-729356c79a4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    username: "juanmphoto",
    link: "https://unsplash.com/@juanmphoto",
    author: "Juan Manuel",
  },
  results: {
    url: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    username: "chuttersnap",
    link: "https://unsplash.com/@chuttersnap",
    author: "CHUTTERSNAP",
  },
  success: {
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    username: "ninjasonik",
    link: "https://unsplash.com/@ninjasonik",
    author: "Ninja Sonik",
  },
  legal: {
    url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    username: "helloquence",
    link: "https://unsplash.com/@helloquence",
    author: "Helloquence",
  },
  faq: {
    url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    username: "gettyimages",
    link: "https://unsplash.com/@gettyimages",
    author: "Getty Images",
  },
  err: {
    url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    username: "marcelstrauss",
    link: "https://unsplash.com/@marcelstrauss",
    author: "Marcel Strauss",
  },
};

function bgRect(genId, meta, h) {
  return {
    type: "rectangle",
    id: genId("wbBG"),
    x: 0,
    y: 0,
    name: "bg",
    metadata: {
      type: "unsplash",
      username: meta.username,
      link: meta.link,
      author: meta.author,
    },
    fill: {
      type: "image",
      enabled: true,
      url: meta.url,
      mode: "fill",
    },
    width: 1440,
    height: h,
  };
}

function overlay(genId, h) {
  return {
    type: "rectangle",
    id: genId("wbOV"),
    x: 0,
    y: 0,
    name: "ov",
    fill: "#0B1020E8",
    width: 1440,
    height: h,
  };
}

function buildFrames(genId) {
  const Y = {
    landing: 24700,
    book: 27220,
    results: 29640,
    bkOk: 31960,
    cgOk: 33380,
    terms: 34600,
    privacy: 38120,
    faq: 41540,
    p404: 44640,
  };

  const H = {
    landing: makeHeader(genId, "cargo"),
    book: makeHeader(genId, "cargo"),
    results: makeHeader(genId, "cargo"),
    bkOk: makeHeader(genId, "home"),
    cgOk: makeHeader(genId, "cargo"),
    terms: makeHeader(genId, "home"),
    privacy: makeHeader(genId, "home"),
    faq: makeHeader(genId, "contact"),
    p404: makeHeader(genId, "home"),
  };

  const foot = (y, gen) => {
    const f = footerNodes(gen);
    f.nodes[0].y = y;
    return f;
  };

  /** Cargo landing */
  const fl = foot(2040, genId);
  const wbCargoLanding = {
    type: "frame",
    id: "wbCargoLanding",
    x: 0,
    y: Y.landing,
    name: "NovaLimo · Ký gửi hàng (Landing)",
    width: 1440,
    height: 2400,
    layout: "none",
    children: [
      bgRect(genId, IMG.cargo, 2400),
      overlay(genId, 2400),
      ...headerNodes(H.landing),
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 120,
        name: "title",
        fill: "#FFFFFF",
        content: "Ký gửi hàng cùng chuyến",
        fontFamily: "Inter",
        fontSize: 36,
        fontWeight: "900",
      },
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 176,
        name: "sub",
        fill: "#B2CCFF",
        content:
          "Gửi kiện theo tuyến xe limousine — minh bạch phí, hỗ trợ COD, nhận/giao tại bến.",
        lineHeight: 1.55,
        fontFamily: "Inter",
        fontSize: 15,
        fontWeight: "600",
      },
      {
        id: genId("wbCta1"),
        type: "ref",
        ref: "PoWVd",
        name: "Hero CTA",
        x: 80,
        y: 240,
        width: 240,
        height: 52,
        fill: "#D4AF37",
        cornerRadius: 14,
        descendants: {
          dwwx2: { enabled: false },
          fIEfR: {
            content: "Ước tính / Đặt gửi hàng",
            fill: "#0B1020",
            fontWeight: "900",
            fontSize: 13,
            x: 24,
            y: 16,
          },
        },
      },
      {
        type: "frame",
        id: genId("wbUSP"),
        x: 80,
        y: 340,
        name: "USP row",
        width: 1280,
        height: 160,
        gap: 20,
        children: [
          {
            type: "frame",
            id: genId("wbC1"),
            width: 400,
            height: 160,
            fill: "#FFFFFF12",
            cornerRadius: 16,
            stroke: { align: "inside", thickness: 1, fill: "#D4AF3744" },
            padding: [20, 22],
            layout: "vertical",
            gap: 8,
            children: [
              {
                type: "text",
                id: genId("wbTx"),
                fill: "#D4AF37",
                content: "Kích thước & trọng lượng",
                fontFamily: "Inter",
                fontSize: 15,
                fontWeight: "900",
              },
              {
                type: "text",
                id: genId("wbTx"),
                fill: "#E8EAEF",
                content:
                  "Tối đa theo khung kiện chuẩn. Vượt khung sẽ báo phụ phí trước khi xác nhận.",
                lineHeight: 1.5,
                fontFamily: "Inter",
                fontSize: 13,
                fontWeight: "600",
              },
            ],
          },
          {
            type: "frame",
            id: genId("wbC2"),
            width: 400,
            height: 160,
            fill: "#FFFFFF12",
            cornerRadius: 16,
            stroke: { align: "inside", thickness: 1, fill: "#D4AF3744" },
            padding: [20, 22],
            layout: "vertical",
            gap: 8,
            children: [
              {
                type: "text",
                id: genId("wbTx"),
                fill: "#D4AF37",
                content: "COD & giá trị hàng",
                fontFamily: "Inter",
                fontSize: 15,
                fontWeight: "900",
              },
              {
                type: "text",
                id: genId("wbTx"),
                fill: "#E8EAEF",
                content:
                  "Thu hộ COD theo thỏa thuận. Khai báo giá trị để áp dụng bảo hiểm/điều kiện.",
                lineHeight: 1.5,
                fontFamily: "Inter",
                fontSize: 13,
                fontWeight: "600",
              },
            ],
          },
          {
            type: "frame",
            id: genId("wbC3"),
            width: 400,
            height: 160,
            fill: "#FFFFFF12",
            cornerRadius: 16,
            stroke: { align: "inside", thickness: 1, fill: "#D4AF3744" },
            padding: [20, 22],
            layout: "vertical",
            gap: 8,
            children: [
              {
                type: "text",
                id: genId("wbTx"),
                fill: "#D4AF37",
                content: "Nhận / giao tại bến",
                fontFamily: "Inter",
                fontSize: 15,
                fontWeight: "900",
              },
              {
                type: "text",
                id: genId("wbTx"),
                fill: "#E8EAEF",
                content:
                  "Điểm giao nhận rõ ràng. Hàng dễ vỡ / cấm gửi được cảnh báo ngay trên báo giá.",
                lineHeight: 1.5,
                fontFamily: "Inter",
                fontSize: 13,
                fontWeight: "600",
              },
            ],
          },
        ],
      },
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 560,
        name: "sec",
        fill: "#FFFFFF",
        content: "Quy trình gửi nhanh",
        fontFamily: "Inter",
        fontSize: 22,
        fontWeight: "900",
      },
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 604,
        name: "steps",
        fill: "#C9CDD8",
        lineHeight: 1.65,
        content:
          "1) Chọn tuyến & ngày  →  2) Nhập loại kiện & khối lượng  →  3) Xem báo giá  →  4) Xác nhận & mang hàng ra bến theo mã vận đơn.",
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "600",
      },
      ...fl.nodes,
    ],
  };

  /** Cargo booking form */
  const fbook = footerNodes(genId);
  fbook.nodes[0].y = 1820;
  const Hb = H.book;
  const wbCargoBook = {
    type: "frame",
    id: "wbCargoBook",
    x: 0,
    y: Y.book,
    name: "NovaLimo · Đặt gửi hàng (Cargo booking)",
    width: 1440,
    height: 2200,
    layout: "none",
    children: [
      bgRect(genId, IMG.form, 2200),
      overlay(genId, 2200),
      ...headerNodes(Hb),
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 110,
        name: "title",
        fill: "#FFFFFF",
        content: "Đặt gửi hàng",
        fontFamily: "Inter",
        fontSize: 32,
        fontWeight: "900",
      },
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 156,
        name: "sub",
        fill: "#B2CCFF",
        content:
          "Điền thông tin kiện hàng — hệ thống sẽ báo giá ước tính và điều kiện áp dụng.",
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "600",
      },
      {
        type: "frame",
        id: genId("wbCard"),
        x: 80,
        y: 220,
        name: "form card",
        width: 1280,
        height: 1480,
        fill: "#FFFFFF",
        cornerRadius: 24,
        stroke: { align: "inside", thickness: 1, fill: "#E5E7EB" },
        layout: "none",
        children: [
          {
            type: "text",
            id: genId("wbT"),
            x: 28,
            y: 24,
            name: "ft",
            fill: "#0B1020",
            content: "Thông tin gửi hàng",
            fontFamily: "Inter",
            fontSize: 20,
            fontWeight: "900",
          },
          selectRef(genId, 28, 72, 600, "Chọn tuyến — ví dụ Hà Nội → Hải Phòng"),
          selectRef(genId, 660, 72, 592, "Ngày gửi — chọn ngày"),
          selectRef(genId, 28, 180, 600, "Loại kiện — thùng / bao / kiện gỗ"),
          inputRef(genId, 660, 180, 592, "Khối lượng (kg)", true),
          inputRef(genId, 28, 288, 600, "Kích thước (DxRxC cm)", true),
          inputRef(genId, 660, 288, 592, "Giá trị hàng (VNĐ)", true),
          inputRef(genId, 28, 396, 600, "Thu hộ COD (VNĐ) — để trống nếu không dùng", true),
          {
            type: "text",
            id: genId("wbT"),
            x: 28,
            y: 500,
            name: "n2",
            fill: "#0B1020",
            content: "Ghi chú & đồng ý",
            fontFamily: "Inter",
            fontSize: 16,
            fontWeight: "900",
          },
          inputRef(genId, 28, 536, 1224, "Ghi chú: hàng dễ vỡ, cần xếp riêng…", true),
          {
            type: "text",
            id: genId("wbT"),
            x: 28,
            y: 640,
            name: "chk",
            fill: "#616167",
            content:
              "☑ Tôi đã đọc Điều khoản & Chính sách và xác nhận hàng không thuộc danh mục cấm.",
            fontFamily: "Inter",
            fontSize: 13,
            fontWeight: "700",
            lineHeight: 1.45,
          },
          {
            type: "frame",
            id: genId("wbRow"),
            x: 28,
            y: 720,
            name: "actions",
            width: 1224,
            height: 56,
            gap: 16,
            children: [
              {
                id: genId("wbBtn"),
                type: "ref",
                ref: "PoWVd",
                name: "Submit",
                width: 220,
                height: 52,
                fill: "#D4AF37",
                cornerRadius: 14,
                descendants: {
                  dwwx2: { enabled: false },
                  fIEfR: {
                    content: "Xem báo giá",
                    fill: "#0B1020",
                    fontWeight: "900",
                    fontSize: 13,
                    x: 48,
                    y: 16,
                  },
                },
              },
            ],
          },
        ],
      },
      ...fbook.nodes,
    ],
  };

  /** Cargo results */
  const fres = footerNodes(genId);
  fres.nodes[0].y = 1680;
  const wbCargoResults = {
    type: "frame",
    id: "wbCargoResults",
    x: 0,
    y: Y.results,
    name: "NovaLimo · Báo giá ký gửi (Cargo results)",
    width: 1440,
    height: 2000,
    layout: "none",
    children: [
      bgRect(genId, IMG.results, 2000),
      overlay(genId, 2000),
      ...headerNodes(H.results),
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 110,
        name: "title",
        fill: "#FFFFFF",
        content: "Kết quả báo giá",
        fontFamily: "Inter",
        fontSize: 32,
        fontWeight: "900",
      },
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 156,
        name: "sub",
        fill: "#B2CCFF",
        content:
          "Ước tính theo khung kiện bạn nhập — phí cuối có thể điều chỉnh khi kiểm tra thực tế tại bến.",
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "600",
      },
      {
        type: "frame",
        id: genId("wbTbl"),
        x: 80,
        y: 220,
        name: "results card",
        width: 1280,
        height: 420,
        fill: "#FFFFFF",
        cornerRadius: 20,
        stroke: { align: "inside", thickness: 1, fill: "#E5E7EB" },
        layout: "none",
        children: [
          {
            type: "text",
            id: genId("wbT"),
            x: 28,
            y: 24,
            fill: "#0B1020",
            content: "Phương án gợi ý",
            fontFamily: "Inter",
            fontSize: 18,
            fontWeight: "900",
          },
          {
            type: "text",
            id: genId("wbT"),
            x: 28,
            y: 64,
            fill: "#616167",
            content:
              "Tiêu chuẩn — 240.000đ  |  Nhanh (+4h) — 310.000đ  |  Hàng dễ vỡ (+10%)",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "600",
          },
          {
            type: "text",
            id: genId("wbT"),
            x: 28,
            y: 120,
            fill: "#0B1020",
            content:
              "Điều kiện: không vận chuyển chất lỏng dễ cháy, không hàng cấm theo quy định. Kiện vượt khung: phụ phí theo bảng.",
            lineHeight: 1.55,
            fontFamily: "Inter",
            fontSize: 13,
            fontWeight: "600",
          },
          {
            type: "frame",
            id: genId("wbPill"),
            x: 28,
            y: 200,
            name: "badges",
            width: 900,
            height: 36,
            gap: 10,
            children: [
              {
                type: "frame",
                id: genId("wbP"),
                padding: [8, 14],
                cornerRadius: 8,
                fill: "#F6FFED",
                stroke: { align: "inside", thickness: 1, fill: "#B7EB8F" },
                children: [
                  {
                    type: "text",
                    id: genId("wbTx"),
                    fill: "#389E0D",
                    content: "Đủ điều kiện gửi",
                    fontFamily: "Inter",
                    fontSize: 12,
                    fontWeight: "800",
                  },
                ],
              },
              {
                type: "frame",
                id: genId("wbP"),
                padding: [8, 14],
                cornerRadius: 8,
                fill: "#FFF7E6",
                stroke: { align: "inside", thickness: 1, fill: "#FFD591" },
                children: [
                  {
                    type: "text",
                    id: genId("wbTx"),
                    fill: "#D46B08",
                    content: "Dễ vỡ: xếp riêng",
                    fontFamily: "Inter",
                    fontSize: 12,
                    fontWeight: "800",
                  },
                ],
              },
            ],
          },
          {
            id: genId("wbBtn"),
            type: "ref",
            ref: "PoWVd",
            name: "Confirm",
            x: 28,
            y: 300,
            width: 260,
            height: 52,
            fill: "#D4AF37",
            cornerRadius: 14,
            descendants: {
              dwwx2: { enabled: false },
              fIEfR: {
                content: "Xác nhận gửi hàng",
                fill: "#0B1020",
                fontWeight: "900",
                fontSize: 13,
                x: 40,
                y: 16,
              },
            },
          },
        ],
      },
      ...fres.nodes,
    ],
  };

  /** Passenger success */
  const fok = footerNodes(genId);
  fok.nodes[0].y = 1060;
  const wbBkSuccess = {
    type: "frame",
    id: "wbBkSuccess",
    x: 0,
    y: Y.bkOk,
    name: "NovaLimo · Đặt vé thành công (Passenger success)",
    width: 1440,
    height: 1400,
    layout: "none",
    children: [
      bgRect(genId, IMG.success, 1400),
      overlay(genId, 1400),
      ...headerNodes(H.bkOk),
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 120,
        name: "title",
        fill: "#FFFFFF",
        content: "Đặt vé thành công",
        fontFamily: "Inter",
        fontSize: 34,
        fontWeight: "900",
      },
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 176,
        name: "code",
        fill: "#D4AF37",
        content: "Mã đơn: NL-20260403-8F2A",
        fontFamily: "Inter",
        fontSize: 18,
        fontWeight: "900",
      },
      {
        type: "frame",
        id: genId("wbQr"),
        x: 80,
        y: 240,
        name: "qr",
        width: 200,
        height: 200,
        fill: "#FFFFFF",
        cornerRadius: 12,
        stroke: { align: "inside", thickness: 1, fill: "#E5E7EB" },
        layout: "none",
        children: [
          {
            type: "text",
            id: genId("wbT"),
            x: 40,
            y: 88,
            fill: "#888799",
            content: "QR thanh toán /\n check-in",
            textAlign: "center",
            fontFamily: "Inter",
            fontSize: 13,
            fontWeight: "700",
          },
        ],
      },
      {
        type: "text",
        id: genId("wbT"),
        x: 320,
        y: 260,
        name: "next",
        fill: "#E8EAEF",
        lineHeight: 1.55,
        content:
          "Bước tiếp theo: hoàn tất thanh toán (nếu còn) → nhận vé điện tử qua SMS/email → có mặt trước giờ khởi hành 15 phút.",
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "600",
      },
      ...fok.nodes,
    ],
  };

  /** Cargo success */
  const fcg = footerNodes(genId);
  fcg.nodes[0].y = 1060;
  const wbCargoSuccess = {
    type: "frame",
    id: "wbCargoSuccess",
    x: 0,
    y: Y.cgOk,
    name: "NovaLimo · Gửi hàng thành công (Cargo success)",
    width: 1440,
    height: 1400,
    layout: "none",
    children: [
      bgRect(genId, IMG.success, 1400),
      overlay(genId, 1400),
      ...headerNodes(H.cgOk),
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 120,
        name: "title",
        fill: "#FFFFFF",
        content: "Tạo vận đơn thành công",
        fontFamily: "Inter",
        fontSize: 34,
        fontWeight: "900",
      },
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 176,
        name: "code",
        fill: "#D4AF37",
        content: "Mã vận đơn: CG-20260403-91BD",
        fontFamily: "Inter",
        fontSize: 18,
        fontWeight: "900",
      },
      {
        type: "frame",
        id: genId("wbQr"),
        x: 80,
        y: 240,
        name: "qr",
        width: 200,
        height: 200,
        fill: "#FFFFFF",
        cornerRadius: 12,
        stroke: { align: "inside", thickness: 1, fill: "#E5E7EB" },
        layout: "none",
        children: [
          {
            type: "text",
            id: genId("wbT"),
            x: 36,
            y: 88,
            fill: "#888799",
            textAlign: "center",
            content: "QR vận đơn /\n nhận tại quầy",
            fontFamily: "Inter",
            fontSize: 13,
            fontWeight: "700",
          },
        ],
      },
      {
        type: "text",
        id: genId("wbT"),
        x: 320,
        y: 250,
        name: "hint",
        fill: "#E8EAEF",
        lineHeight: 1.55,
        content:
          "Mang hàng & mã vận đơn đến quầy ký gửi tại bến trước giờ xe chạy ít nhất 30 phút. Nhân viên sẽ đối chiếu khối lượng/kích thước thực tế.",
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "600",
      },
      ...fcg.nodes,
    ],
  };

  const legalBody = (title, paras) => {
    const out = [
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 120,
        name: "lt",
        fill: "#FFFFFF",
        content: title,
        fontFamily: "Inter",
        fontSize: 30,
        fontWeight: "900",
      },
    ];
    let yy = 190;
    for (const p of paras) {
      out.push({
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: yy,
        name: "lp",
        fill: "#C9CDD8",
        lineHeight: 1.65,
        content: p,
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "500",
      });
      yy += Math.min(120, 24 + Math.ceil(p.length / 85) * 22);
    }
    return out;
  };

  const termsParas = [
    "1. Phạm vi dịch vụ: NovaLimo cung cấp dịch vụ vận chuyển hành khách và ký gửi hàng hóa theo tuyến đã công bố. Điều khoản này điều chỉnh việc đặt chỗ, thanh toán, và sử dụng dịch vụ qua website/ứng dụng.",
    "2. Đặt vé & xác nhận: Thông tin đặt vé phải chính xác. Sau khi xác nhận, mã đơn/QR được dùng để lên xe và tra cứu. Thay đổi/hủy theo chính sách phí đã thông báo tại thời điểm đặt.",
    "3. Ký gửi hàng: Người gửi khai báo trung thực về loại hàng, khối lượng, giá trị. Hàng cấm, hàng nguy hiểm, hàng không đúng mô tả có thể bị từ chối. Phụ phí phát sinh khi kiểm tra thực tế khác khai báo.",
    "4. Thanh toán & COD: Thanh toán điện tử theo hướng dẫn trên vé. Dịch vụ thu hộ COD (nếu có) thực hiện theo biên nhận và đối soát với người nhận.",
    "5. Giới hạn trách nhiệm: NovaLimo áp dụng nỗ lực hợp lý để bảo quản hàng hóa. Trách nhiệm tối đa theo gói bảo hiểm/khai báo giá trị và quy định pháp luật hiện hành.",
    "6. Khiếu nại & hỗ trợ: Mọi khiếu nại gửi qua hotline/email trong 07 ngày kể từ ngày sử dụng dịch vụ, kèm mã đơn/mã vận đơn.",
  ];

  const privacyParas = [
    "1. Thu thập dữ liệu: Họ tên, số điện thoại, email (nếu có), thông tin chuyến đi và thanh toán phục vụ đặt vé, hỗ trợ và tuân thủ pháp luật.",
    "2. Mục đích sử dụng: Xác nhận đặt vé, gửi thông báo chuyến, tra cứu vé, chăm sóc khách hàng, cải thiện dịch vụ, và chống gian lận.",
    "3. Lưu trữ & bảo mật: Dữ liệu được lưu trên hệ thống có kiểm soát truy cập, mã hóa kết nối theo tiêu chuẩn ngành.",
    "4. Chia sẻ: Chỉ chia sẻ cho đối tác vận hành tối thiểu cần thiết (ví dụ cổng thanh toán) theo hợp đồng bảo mật.",
    "5. Quyền của bạn: Yêu cầu truy cập, chỉnh sửa, xóa dữ liệu cá nhân theo quy định — liên hệ support@novalimo.vn.",
    "6. Cookie & analytics: Website có thể dùng cookie để ghi nhớ phiên và thống kê ẩn danh; bạn có thể điều chỉnh trình duyệt.",
  ];

  const fterm = footerNodes(genId);
  fterm.nodes[0].y = 2860;
  const wbLegalTerms = {
    type: "frame",
    id: "wbLegalTerms",
    x: 0,
    y: Y.terms,
    name: "NovaLimo · Điều khoản sử dụng (Terms)",
    width: 1440,
    height: 3200,
    layout: "none",
    children: [
      bgRect(genId, IMG.legal, 3200),
      overlay(genId, 3200),
      ...headerNodes(H.terms),
      ...legalBody("Điều khoản sử dụng", termsParas),
      ...fterm.nodes,
    ],
  };

  const fpr = footerNodes(genId);
  fpr.nodes[0].y = 2860;
  const wbLegalPrivacy = {
    type: "frame",
    id: "wbLegalPrivacy",
    x: 0,
    y: Y.privacy,
    name: "NovaLimo · Chính sách bảo mật (Privacy)",
    width: 1440,
    height: 3200,
    layout: "none",
    children: [
      bgRect(genId, IMG.legal, 3200),
      overlay(genId, 3200),
      ...headerNodes(H.privacy),
      ...legalBody("Chính sách bảo mật", privacyParas),
      ...fpr.nodes,
    ],
  };

  const ffaq = footerNodes(genId);
  ffaq.nodes[0].y = 2460;
  const faqItems = [
    ["Làm sao để tra cứu vé?", "Dùng đúng SĐT đã đặt vé tại mục Tra cứu vé. Hệ thống hiển thị trạng thái và mã QR nếu có."],
    ["Ký gửi hàng có tính COD không?", "Có — khai báo số tiền thu hộ khi đặt gửi. Phí dịch vụ và điều kiện đối soát hiển thị trước khi bạn xác nhận."],
    ["Hàng nào bị từ chối?", "Chất dễ cháy/nổ, hàng cấm theo luật, hàng không khớp mô tả sau kiểm tra. Danh mục chi tiết được nhắc trên báo giá."],
    ["Đổi hoặc hủy vé?", "Theo gói vé và thời điểm yêu cầu — phí đổi/hủy (nếu có) hiển thị trước khi bạn xác nhận thao tác."],
  ];
  const faqChildren = [];
  let fy = 120;
  for (const [q, a] of faqItems) {
    faqChildren.push({
      type: "frame",
      id: genId("wbFq"),
      x: 80,
      y: fy,
      width: 1280,
      fill: "#FFFFFF10",
      cornerRadius: 14,
      stroke: { align: "inside", thickness: 1, fill: "#FFFFFF22" },
      padding: [16, 20],
      layout: "vertical",
      gap: 8,
      children: [
        {
          type: "text",
          id: genId("wbT"),
          fill: "#D4AF37",
          content: q,
          fontFamily: "Inter",
          fontSize: 15,
          fontWeight: "900",
        },
        {
          type: "text",
          id: genId("wbT"),
          fill: "#E8EAEF",
          lineHeight: 1.55,
          content: a,
          fontFamily: "Inter",
          fontSize: 14,
          fontWeight: "600",
        },
      ],
    });
    fy += 130;
  }

  const wbFaq = {
    type: "frame",
    id: "wbFaq",
    x: 0,
    y: Y.faq,
    name: "NovaLimo · Câu hỏi thường gặp (FAQ)",
    width: 1440,
    height: 2800,
    layout: "none",
    children: [
      bgRect(genId, IMG.faq, 2800),
      overlay(genId, 2800),
      ...headerNodes(H.faq),
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 80,
        name: "title",
        fill: "#FFFFFF",
        content: "Câu hỏi thường gặp",
        fontFamily: "Inter",
        fontSize: 32,
        fontWeight: "900",
      },
      ...faqChildren,
      ...ffaq.nodes,
    ],
  };

  const f404 = footerNodes(genId);
  f404.nodes[0].y = 860;
  const wbPg404 = {
    type: "frame",
    id: "wbPg404",
    x: 0,
    y: Y.p404,
    name: "NovaLimo · Không tìm thấy trang (404)",
    width: 1440,
    height: 1200,
    layout: "none",
    children: [
      bgRect(genId, IMG.err, 1200),
      overlay(genId, 1200),
      ...headerNodes(H.p404),
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 200,
        name: "t404",
        fill: "#FFFFFF",
        content: "404",
        fontFamily: "Inter",
        fontSize: 72,
        fontWeight: "900",
      },
      {
        type: "text",
        id: genId("wbT"),
        x: 80,
        y: 300,
        name: "m404",
        fill: "#B2CCFF",
        content: "Trang bạn tìm không tồn tại hoặc đã được di chuyển.",
        fontFamily: "Inter",
        fontSize: 16,
        fontWeight: "600",
      },
      {
        id: genId("wbB404"),
        type: "ref",
        ref: "PoWVd",
        name: "Back",
        x: 80,
        y: 380,
        width: 200,
        height: 52,
        fill: "#D4AF37",
        cornerRadius: 14,
        descendants: {
          dwwx2: { enabled: false },
          fIEfR: {
            content: "Về trang chủ",
            fill: "#0B1020",
            fontWeight: "900",
            fontSize: 13,
            x: 44,
            y: 16,
          },
        },
      },
      ...f404.nodes,
    ],
  };

  return [
    wbCargoLanding,
    wbCargoBook,
    wbCargoResults,
    wbBkSuccess,
    wbCargoSuccess,
    wbLegalTerms,
    wbLegalPrivacy,
    wbFaq,
    wbPg404,
  ];
}

function main() {
  const raw = fs.readFileSync(PEN, "utf8");
  const doc = JSON.parse(raw);
  const used = new Set();
  collectIds(doc, used);
  const genId = makeIdFactory(used);

  const idx = doc.children.findIndex((c) => c.id === "43TrKq2");
  if (idx === -1) throw new Error("Frame 43TrKq2 not found");

  const newFrames = buildFrames(genId);
  for (const f of newFrames) collectIds(f, used);

  doc.children.splice(idx + 1, 0, ...newFrames);

  walkInsertNavCargo(doc.children, used, genId);
  walkInsertFooterLink(doc.children, genId);

  const dupCheck = new Set();
  const stack = [doc];
  while (stack.length) {
    const n = stack.pop();
    if (!n || typeof n !== "object") continue;
    if (n.id) {
      if (dupCheck.has(n.id)) throw new Error(`Duplicate id: ${n.id}`);
      dupCheck.add(n.id);
    }
    if (Array.isArray(n.children)) for (const c of n.children) stack.push(c);
  }

  fs.writeFileSync(PEN, JSON.stringify(doc, null, 2), "utf8");
  console.log(
    "OK: inserted",
    newFrames.length,
    "frames after 43TrKq2; nav+footer patched; ids unique."
  );
}

main();
