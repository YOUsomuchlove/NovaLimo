# App Driver — tham chiếu Pencil (`app-mobile.pen` + `app-mobile-chat-shift.pen`)

Đối chiếu QA pixel: dùng Pencil MCP `get_screenshot` / `batch_get` trên **node id** (mở đúng `.pen` trong editor).  
Nếu MCP timeout, mở file trong Pencil rồi chạy lại.

## `app-mobile.pen` — màn chính

| Screen (navigator) | File | Frame ID (pen) | Ghi chú |
|--------------------|------|----------------|---------|
| `Login` | `screens/LoginScreen.tsx` | `mbDrvLogin` | Header `mbDrvHeader`, form `mbDrvForm` |
| `Permissions` | `screens/PermissionsScreen.tsx` | `mbDrvPermOverlay` + `mbDrvPermLibrary` | Dialog quyền |
| Tab Trips → `Home` | `screens/HomeScreen.tsx` | `mbDrvHomeTrips` | `mbHomeTabs` segmented |
| Tab Trips → `TripDetail` | `screens/TripDetailScreen.tsx` | `mbDrvTripDetail` | |
| Tab Trips → `ActiveNav` | `screens/ActiveNavigationScreen.tsx` | `mbDrvNavPickup` | Ảnh map OSM — asset `assets/images/osm-tile-nav.png` |
| Tab Trips → `Passengers` | `screens/PassengersScreen.tsx` | `mbDrvPaxList` | |
| Tab Trips → `Sos` | `screens/SosScreen.tsx` | `mbDrvIncident` | |
| Tab Trips → `Notifications` | `screens/NotificationsScreen.tsx` | `mbDrvNotif` | |
| Tab Trips → `Income` | `screens/IncomeScreen.tsx` | `mbDrvEarn` | Tách khỏi Profile (pen) |
| Tab Trips → `Profile` | `screens/ProfileScreen.tsx` | `mbDrvProfile` | |
| Tab Cargo → `CargoPick` | `screens/CargoPickScreen.tsx` | `mbDrvCargoMng` | FAB camera |
| Tab Cargo → `Cargo` | `screens/CargoScreen.tsx` | `mbDrvCargoItem` | |
| Tab Cargo → `CargoScan` | `screens/CargoScanScreen.tsx` | `mbDrvCargoScan` | |
| Tab Cargo → `CargoCod` | `screens/CargoCodScreen.tsx` | `mbDrvCargoCod` | |
| Tab Cargo → `CargoTransfer` | `screens/CargoTransferScreen.tsx` | `mbDrvCargoTransfer` | |
| Tab `Chat` | `screens/ChatScreen.tsx` | `mbDrvChat` | |
| Tab `Shift` | `screens/EndShiftScreen.tsx` | `mbDrvShiftEnd` | |
| `DriverBottomBar` | `components/DriverBottomBar.tsx` | `mbBottomNavLibrary` | 4 tab |

## Flow map (không phải màn app)

| Node | Ý nghĩa |
|------|---------|
| `mbDrvFlowMapBody` | Khối mô tả luồng trên canvas |

## `app-mobile-chat-shift.pen`

| Component / vùng | File | Ghi chú |
|------------------|------|---------|
| Mini canvas Chat + Ca | `components/MiniChatShiftPreview.tsx` | Thay thế tìm node `mbMiniCanvas` nếu đổi tên — dùng `batch_get` pattern `.*[Mm]ini.*` trong file chat-shift |

Token RN: [`src/theme/tokens.ts`](./src/theme/tokens.ts) — căn `NOVA_DRIVER` trong [`libs/utils-core/.../nova-limo-design-tokens.ts`](../../../libs/utils-core/src/lib/nova-limo-design-tokens.ts).
