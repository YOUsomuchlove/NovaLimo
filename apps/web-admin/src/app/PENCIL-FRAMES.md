# Web Admin — tham chiếu Pencil (`web-admin.pen`)

Đối chiếu QA pixel: `get_screenshot` trên đúng node ID.

| Route | Frame ID | Tên frame (pen) |
|-------|----------|-----------------|
| `/dashboard` | `nvDash` | Dashboard & Analytics |
| `/dispatch` | `nvSmartDispPage` | Điều phối Thông minh |
| `/trip-runs` | `nvTripRunsList` | Quản lý Chuyến |
| `/trip-runs/[id]` | `nvTripRunDet` | Chi tiết Chuyến |
| `/trip-runs/[id]/manifest` | `nvTripRunManifest` | Phơi lệnh (Manifest) |
| `/trip-runs/[id]/edit` | `nvTripRunEdit` | Chỉnh sửa Chuyến |
| `/bookings` | `nvOrdPage` | Đơn hàng & Ký gửi (+ `nvOrdPanel2` component) |
| `/bookings/new` | `nvOrdP1Cre` | Tạo đơn vé HK |
| `/bookings/[id]` | `nvOrdP1Det` | Chi tiết đơn vé HK |
| `/bookings/[id]/edit` | `nvOrdP1Ed` | Sửa đơn vé HK |
| `/cargos/new` | `nvOrdP2Cre` | Tạo đơn ký gửi |
| `/cargos/[id]` | `nvOrdP2Det` | Chi tiết vận đơn ký gửi |
| `/cargos/[id]/edit` | `nvOrdP2Ed` | Sửa vận đơn ký gửi |
| `/cargos` (ops) | `nvCargoOpsList` | Vận hành Hàng hóa |
| `/cargos/handoff` | `nvCargoHandoff` | Bàn giao Trung chuyển |
| `/cargos/cod-reconcile` | `nvCargoCodReconcile` | Đối soát COD |
| `/customers` | `nvCustList` | Khách hàng |
| `/customers/[id]` | `nvCustDet` | Chi tiết KH |
| `/customers/[id]/edit` | `nvCustEd` | Sửa KH |
| `/vehicles` | `nvFleet` | Đội xe & Tài xế (+ panel `Xox9m`) |
| `/vehicles/new` | `vnCreVeh` | Tạo xe |
| `/vehicles/[vehicleId]` | `BYSRc` | Chi tiết xe |
| `/vehicles/[vehicleId]/edit` | `smD7h` | Sửa xe |
| `/vehicles/drivers/new` | `vnCreDrv` | Tạo tài xế |
| `/vehicles/drivers/[driverId]` | `GU9mg` | Chi tiết tài xế |
| `/vehicles/drivers/[driverId]/edit` | `kvt1Y` | Sửa tài xế |
| `/finance` | `nvFinance` | Tài chính |
| `/finance/[id]` | `nvFnDet` | Chi tiết tài chính |
| `/finance/[id]/edit` | `nvFnEd` | Sửa tài chính |
| `/monitor` | `nvGsMap` | Giám sát / Command Center |
| `/call-center` | `nvCcCreateBooking` / `nvCcRequests` / `nvCcSupportInbox` | Tổng đài (tabs) |
| `/reports` | `nvRptRevenue` … | Báo cáo (tabs) |
| `/settings` | `nvCfgRoutesStops` … | Cấu hình (tabs) |
| `/rbac` | `nvRbacUsers` … | RBAC (tabs) |
| `/audit` | `nvAuditLog` | Audit Log |
| `/users` | `nvRbacUsers` (gần) | Người dùng nội bộ |
| `/dev/ui-messages` | `nvUiMsgLib` | Thư viện Message (dev) |

Token sidebar: `NOVA_BRAND.adminSiderBg` / `adminSiderStroke` trong [nova-limo-design-tokens.ts](../../../libs/utils-core/src/lib/nova-limo-design-tokens.ts).
