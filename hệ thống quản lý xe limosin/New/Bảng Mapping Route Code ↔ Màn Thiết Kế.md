# Bảng mapping: route / màn hình code ↔ màn thiết kế (Pencil)

*Tài liệu **tiếp nối** [Đặc Tả Tổng Thể Và Cấu Hình Hệ Thống NovaLimo.md](./Đặc%20Tả%20Tổng%20Thể%20Và%20Cấu%20Hình%20Hệ%20Thống%20NovaLimo.md). Mục đích: tra cứu nhanh **đã implement đâu** trong repo và **tương ứng frame nào** trong bản vẽ; các màn chỉ có trong pen được đánh dấu để roadmap.*

**Ký hiệu trạng thái**

| Ký hiệu | Ý nghĩa |
|---------|--------|
| Đã có | Có route hoặc screen tương ứng trong code |
| Một phần | Chức năng nằm trong một màn lớn / tab, chưa tách như pen |
| Chưa có | Chưa thấy màn tương ứng trong code (có trong pen) — backlog |

---

## 1. Web Admin (`apps/web-admin`)

Base URL giả định: `/` (Next.js App Router). Tra cứu **Frame ID ↔ route**: [`PENCIL-FRAMES.md`](../../apps/web-admin/src/app/PENCIL-FRAMES.md) (repo).

| Route (file) | Trạng thái | Frame / nhóm màn trong `web-admin.pen` (tham chiếu) |
|--------------|------------|-----------------------------------------------------|
| `/` (`app/page.tsx`) | Một phần | Thường redirect/login hoặc dashboard — xem logic `page.tsx` |
| `/login` | Đã có | Đăng nhập (không liệt kê riêng trong pen dưới dạng `NovaLimo Admin · Login`) |
| `/dashboard` | Đã có | **NovaLimo Admin · Dashboard & Analytics** |
| `/dispatch` | Đã có | **NovaLimo Admin · Điều phối Thông minh (Smart Dispatching)** (danh sách batch) |
| `/dispatch/[batchId]` | Đã có | Cùng nhóm điều phối — chi tiết một khung giờ / rổ chờ |
| `/trip-runs` | Đã có | **NovaLimo Admin · Quản lý Chuyến (Trip Runs)** |
| `/trip-runs/[id]` | Đã có | **NovaLimo Admin · Chi tiết Chuyến** / chỉnh sửa tùy UI |
| `/bookings` | Đã có | **NovaLimo Admin · Quản lý Đơn hàng & Ký gửi Hàng hóa** (vé); các màn Tạo/Sửa/Chi tiết vé có thể là tab/modal trong cùng route |
| `/cargos` | Đã có | Cùng nhóm đơn hàng — tập trung ký gửi / **Vận hành Hàng hóa** |
| `/customers` | Đã có | **NovaLimo Admin · Khách hàng** (+ chi tiết/sửa nếu có trong cùng tree) |
| `/vehicles` | Đã có | **NovaLimo Admin · Quản lý Đội xe & Tài xế** / CRUD xe |
| `/users` | Đã có | Người dùng nội bộ — thường gần **RBAC · Users** |
| `/finance` | Đã có | **NovaLimo Admin · Quản lý Tài chính** / đối soát |
| `/monitor` | Đã có | **NovaLimo Admin · Giám sát Hành trình (Command Center)** hoặc màn giám sát tương đương |
| `/tracking` | Đã có | Bản đồ/theo dõi — có thể bổ sung cho Command Center (kiểm tra UI thực tế) |
| `/call-center` | Đã có | Nhóm **Tổng đài** (Tạo vé thủ công, Yêu cầu/CS, Hộp thư) — có thể gộp tab |
| `/reports` | Một phần | **Báo cáo Chuyến / Doanh thu / Hàng hóa/COD / Tài xế** — pen tách 4 màn, code có thể 1 route nhiều tab |
| `/settings` | Một phần | **Cấu hình** tuyến, khung giờ, giá, COD, thông báo — pen tách nhiều màn |
| `/rbac` | Một phần | **RBAC · Users / Roles / Permissions** — có thể gộp hoặc mở rộng sau |
| `/trip-runs/[id]/manifest` | Đã có | **Phơi lệnh (Manifest)** — `nvTripRunManifest` |
| `/cargos/handoff`, `/cargos/cod-reconcile` | Đã có | **Bàn giao Trung chuyển**, **Đối soát COD** |
| `/bookings/new`, `/bookings/[id]`, `/bookings/[id]/edit` | Đã có | Đơn vé HK — `nvOrdP1Cre` / `nvOrdP1Det` / `nvOrdP1Ed` |
| `/cargos/new`, `/cargos/[id]`, `/cargos/[id]/edit` | Đã có | Ký gửi — `nvOrdP2Cre` / `nvOrdP2Det` / `nvOrdP2Ed` |
| `/vehicles/new`, `/vehicles/[vehicleId]`, `…/edit` | Đã có | Xe — `vnCreVeh`, `BYSRc`, `smD7h` |
| `/vehicles/drivers/new`, `…/[driverId]`, `…/edit` | Đã có | Tài xế — `vnCreDrv`, `GU9mg`, `kvt1Y` |
| `/finance/[id]`, `/finance/[id]/edit` | Đã có | `nvFnDet`, `nvFnEd` |
| `/audit` | Đã có | **Audit Log** — `nvAuditLog` |
| `/dev/ui-messages` | Đã có (dev) | Thư viện Message — `nvUiMsgLib` |

**Pen có, vẫn có thể tinh chỉnh pixel sau:**

- **Panel con** `Xox9m` (drivers), `nvOrdPanel2` — component trong `/vehicles`, `/bookings` (không phải route riêng).

---

## 2. Web Booking (`apps/web-booking`)

| Route | Trạng thái | Frame trong `web-bôking.pen` |
|-------|------------|--------------------------------|
| `/` | Đã có | **Trang Chủ (Home Page)** |
| `/search` | Đã có | **Trang Kết quả tìm kiếm chuyến xe** |
| `/booking/[tripBatchId]` | Đã có | Cùng URL nhiều bước: **eWbxX** Sơ đồ ghế → **dQZgk** Thông tin → **cFLNQ** Thanh toán + **Modal QR** → **wbBkSuccess** (bước Xong). Tra cứu frame ID: [`PENCIL-FRAMES.md`](../../apps/web-booking/src/app/PENCIL-FRAMES.md) (repo) |
| `/my-tickets` | Đã có | **Tra cứu vé đã đặt** / trạng thái có kết quả (A10/A11) |
| `/about` | Đã có | **Trang Giới thiệu (About Us)** |
| `/pricing` | Đã có | **Trang Bảng giá (Pricing)** |
| `/contact` | Đã có | **Trang Liên hệ & Hỗ trợ (Contact)** |
| `/cargo` | Đã có | **NovaLimo · Ký gửi hàng (Landing)** |
| `/cargo/book` | Đã có | **NovaLimo · Đặt gửi hàng (Cargo booking)** |
| `/cargo/results` | Đã có | **NovaLimo · Báo giá ký gửi (Cargo results)** |
| `/cargo/success` | Đã có | **NovaLimo · Gửi hàng thành công (Cargo success)** |
| `/terms` | Đã có | **NovaLimo · Điều khoản sử dụng (Terms)** |
| `/privacy` | Đã có | **NovaLimo · Chính sách bảo mật (Privacy)** |
| `/faq` | Đã có | **NovaLimo · Câu hỏi thường gặp (FAQ)** |
| `not-found` | Đã có | **NovaLimo · Không tìm thấy trang (404)** |

**Đã map trong code (web-booking):**

- **Drawer (Mở hé)** — `/search`: nút **Xem nhanh (mở hé)** mở Drawer phải (chi tiết chuyến).  
- **Popup hoàn tất thanh toán (QR)** — `/booking/[tripBatchId]` bước Thanh toán: Modal trước khi gọi API tạo vé.  
- **Đặt vé thành công** — cùng route, `step` nội bộ (bước 4 / Xong), layout **wbBkSuccess**.  
- **Reference: Seat Map 12 chỗ** — chỉ tham chiếu thiết kế shared-ui SeatMap, không phải route.

---

## 3. App tài xế (`apps/app-driver`)

Navigation: `RootNavigator` (Login → Permissions → `Main`); `MainNavigator` = 4 tab (Trips, Cargo, Chat, Shift). Chi tiết frame id: [`apps/app-driver/PENCIL-FRAMES.md`](../../apps/app-driver/PENCIL-FRAMES.md). Báo cáo QA: [`docs/qa-fe-vs-pencil-report.md`](../../docs/qa-fe-vs-pencil-report.md).

| Route / screen (code) | Trạng thái | Frame ID / ghi chú `app-mobile.pen` |
|------------------------|------------|--------------------------------------|
| `Login` | Đã có | `mbDrvLogin` |
| `Permissions` | Đã có | `mbDrvPermOverlay`, `mbDrvPermLibrary` |
| Tab **Trips** → `Home` | Đã có | `mbDrvHomeTrips` |
| Tab **Trips** → `TripDetail` | Đã có | `mbDrvTripDetail` |
| Tab **Trips** → `ActiveNav` | Đã có | `mbDrvNavPickup` |
| Tab **Trips** → `Passengers` | Đã có | `mbDrvPaxList` |
| Tab **Trips** → `Sos` | Đã có | `mbDrvIncident` |
| Tab **Trips** → `Notifications` | Đã có | `mbDrvNotif` |
| Tab **Trips** → `Income` | Đã có | `mbDrvEarn` |
| Tab **Trips** → `Profile` | Đã có | `mbDrvProfile` |
| Tab **Cargo** → `CargoPick` | Đã có | `mbDrvCargoMng` |
| Tab **Cargo** → `Cargo` | Đã có | `mbDrvCargoItem` |
| Tab **Cargo** → `CargoScan` | Đã có | `mbDrvCargoScan` |
| Tab **Cargo** → `CargoCod` | Đã có | `mbDrvCargoCod` |
| Tab **Cargo** → `CargoTransfer` | Đã có | `mbDrvCargoTransfer` |
| Tab **Chat** | Đã có | `mbDrvChat` |
| Tab **Shift** (`EndShiftScreen`) | Đã có | `mbDrvShiftEnd` |
| `DriverBottomBar` | Đã có | `mbBottomNavLibrary` |
| Chat-shift mini canvas | Một phần | `app-mobile-chat-shift.pen` — [`MiniChatShiftPreview`](../../apps/app-driver/src/components/MiniChatShiftPreview.tsx) |

**Còn lệch có thể tinh chỉnh pixel:** checklist dài kết thúc ca, độ chi tiết SOS/COD so với pen; so ảnh `get_screenshot` khi mở `.pen` trong Pencil.

---

## 4. Cách cập nhật bảng này

- Khi thêm `page.tsx` hoặc screen mới: thêm một dòng vào đúng phần.  
- Khi đổi tên frame trong Pencil: sửa cột bên phải cho khớp [WEB SITE ĐẶT VÉ / Admin / Mobile].  
- Định kỳ (release): đánh dấu **Chưa có → Đã có** để PM thấy độ phủ thiết kế.

---

*Sinh từ cấu trúc repo tại thời điểm chỉnh sửa; nếu route đổi, cập nhật bảng cùng PR.*
