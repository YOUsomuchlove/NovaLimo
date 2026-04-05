import fs from "node:fs";

const penPath = "G:/NovaLimo/hệ thống quản lý xe limosin/New/web-admin.pen";
const raw = fs.readFileSync(penPath, "utf8");
const doc = JSON.parse(raw);

const MENU_ICON = {
  dashboard: "layout-dashboard",
  dispatch: "route",
  trips: "clock",
  orders: "ticket",
  cargo: "package",
  customers: "users",
  fleet: "van",
  finance: "wallet",
  monitor: "radar",
  callcenter: "headset",
  reports: "bar-chart-3",
  config: "settings",
  rbac: "shield-check",
};

function makeMenuItem(id, label, iconName, active) {
  return {
    type: "frame",
    id,
    name: `m${label}`,
    ...(active ? { fill: "#101827" } : {}),
    cornerRadius: 8,
    gap: 8,
    padding: [8, 10],
    alignItems: "center",
    children: [
      {
        type: "icon_font",
        id: `${id}Ic`,
        width: 16,
        height: 16,
        iconFontName: iconName,
        iconFontFamily: "lucide",
        fill: active ? "#D4AF37" : "#9CA6C4",
      },
      {
        type: "text",
        id: `${id}Tx`,
        fill: active ? "#F9FAFB" : "#E5E7EB",
        content: label,
        fontFamily: "Inter",
        fontSize: 13,
        fontWeight: active ? "700" : "600",
      },
    ],
  };
}

function activeKeyForMenuId(menuId) {
  const id = String(menuId || "");
  if (id.includes("SmartDisp")) return "dispatch";
  if (id.includes("Ord")) return "orders";
  if (id.startsWith("gs") || id.toLowerCase().includes("gs")) return "monitor";
  if (id.includes("Fn") || id.includes("Fd") || id.includes("Fe")) return "finance";
  if (id.includes("Db")) return "dashboard";
  return "fleet";
}

function buildMenuChildren(prefix, activeKey) {
  const is = (k) => activeKey === k;
  return [
    makeMenuItem(`${prefix}ItemDash2`, "Dashboard", MENU_ICON.dashboard, is("dashboard")),
    makeMenuItem(`${prefix}ItemDispatch2`, "Điều phối", MENU_ICON.dispatch, is("dispatch")),
    makeMenuItem(`${prefix}ItemTrips`, "Chuyến", MENU_ICON.trips, is("trips")),
    makeMenuItem(`${prefix}ItemOrders2`, "Đơn hàng", MENU_ICON.orders, is("orders")),
    makeMenuItem(`${prefix}ItemCargoOps`, "Hàng hóa", MENU_ICON.cargo, is("cargo")),
    makeMenuItem(`${prefix}ItemCustomers`, "Khách hàng", MENU_ICON.customers, is("customers")),
    makeMenuItem(`${prefix}ItemFleet2`, "Đội xe & Tài xế", MENU_ICON.fleet, is("fleet")),
    makeMenuItem(`${prefix}ItemFin2`, "Tài chính", MENU_ICON.finance, is("finance")),
    makeMenuItem(`${prefix}ItemMonitor2`, "Giám sát", MENU_ICON.monitor, is("monitor")),
    makeMenuItem(`${prefix}ItemCallCenter`, "Tổng đài/CS", MENU_ICON.callcenter, is("callcenter")),
    makeMenuItem(`${prefix}ItemReports`, "Báo cáo", MENU_ICON.reports, is("reports")),
    makeMenuItem(`${prefix}ItemConfig`, "Cấu hình", MENU_ICON.config, is("config")),
    makeMenuItem(`${prefix}ItemRbac`, "Phân quyền", MENU_ICON.rbac, is("rbac")),
  ];
}

let updated = 0;

function walk(node, fn) {
  if (!node) return;
  if (Array.isArray(node)) return node.forEach((n) => walk(n, fn));
  fn(node);
  if (node.children) walk(node.children, fn);
}

walk(doc.children, (n) => {
  if (n?.type !== "frame") return;
  if (n.name !== "Sidebar menu") return;

  const activeKey = activeKeyForMenuId(n.id);
  const prefix = `${n.id}X`;
  n.layout = "vertical";
  n.gap = 4;
  n.children = buildMenuChildren(prefix, activeKey);
  updated += 1;
});

fs.writeFileSync(penPath, JSON.stringify(doc, null, 2), "utf8");
console.log(`Updated ${updated} sidebar menus in web-admin.pen`);

