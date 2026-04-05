import fs from "node:fs";

const penPath = "G:/NovaLimo/hệ thống quản lý xe limosin/New/web-admin.pen";
const doc = JSON.parse(fs.readFileSync(penPath, "utf8"));

/** activeKey must match keys in buildMenuChildren */
const PAGE_ACTIVE = {
  // Halo / template dashboards (generic)
  vtHps: "dashboard",
  rYhmQ: "dashboard",
  OVVG0: "dashboard",
  uL1xr: "dashboard",

  nvDash: "dashboard",

  nvFleet: "fleet",
  BYSRc: "fleet",
  smD7h: "fleet",
  GU9mg: "fleet",
  kvt1Y: "fleet",
  Xox9m: "fleet",
  vnCreVeh: "fleet",
  vnCreDrv: "fleet",

  nvFinance: "finance",
  nvFnDet: "finance",
  nvFnEd: "finance",

  nvGsMap: "monitor",

  nvOrdPage: "orders",
  nvOrdPanel2: "orders",
  nvOrdP1Cre: "orders",
  nvOrdP1Det: "orders",
  nvOrdP1Ed: "orders",
  nvOrdP2Cre: "orders",
  nvOrdP2Det: "orders",
  nvOrdP2Ed: "orders",

  nvSmartDispPage: "dispatch",

  nvUiMsgLib: "dashboard",

  nvTripRunsList: "trips",
  nvTripRunDet: "trips",
  nvTripRunManifest: "trips",
  nvTripRunEdit: "trips",

  nvCustList: "customers",
  nvCustDet: "customers",
  nvCustEd: "customers",

  nvCargoOpsList: "cargo",
  nvCargoHandoff: "cargo",
  nvCargoCodReconcile: "cargo",

  nvCcCreateBooking: "callcenter",
  nvCcRequests: "callcenter",
  nvCcSupportInbox: "callcenter",

  nvRbacUsers: "rbac",
  nvRbacRoles: "rbac",
  nvRbacPermissions: "rbac",
  nvAuditLog: "rbac",

  nvCfgRoutesStops: "config",
  nvCfgTimeSlots: "config",
  nvCfgPricing: "config",
  nvCfgCodPolicy: "config",
  nvCfgNotifications: "config",

  nvRptRevenue: "reports",
  nvRptTrips: "reports",
  nvRptDriverPerf: "reports",
  nvRptCargoCod: "reports",
};

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

function walk(node, fn) {
  if (!node) return;
  if (Array.isArray(node)) return node.forEach((n) => walk(n, fn));
  fn(node);
  if (node.children) walk(node.children, fn);
}

function findSidebarMenus(root, topPageId, acc) {
  walk(root, (n) => {
    if (n?.type === "frame" && n.name === "Sidebar menu") acc.push({ menuId: n.id, pageId: topPageId });
  });
}

let updated = 0;
const seen = new Set();

for (const child of doc.children || []) {
  if (!child || child.type !== "frame") continue;
  const pageId = child.id;
  const menus = [];
  findSidebarMenus(child, pageId, menus);

  const activeKey = PAGE_ACTIVE[pageId] ?? "dashboard";

  for (const { menuId } of menus) {
    if (seen.has(menuId)) continue;
    seen.add(menuId);

    let menuNode = null;
    walk(doc.children, (n) => {
      if (n?.id === menuId && n.name === "Sidebar menu") menuNode = n;
    });
    if (!menuNode) continue;

    const prefix = `${menuId}X`;
    menuNode.layout = "vertical";
    menuNode.gap = 4;
    menuNode.children = buildMenuChildren(prefix, activeKey);
    updated += 1;
  }
}

fs.writeFileSync(penPath, JSON.stringify(doc, null, 2), "utf8");
console.log(`Set active state on ${updated} Sidebar menu instances (unique menu ids).`);
