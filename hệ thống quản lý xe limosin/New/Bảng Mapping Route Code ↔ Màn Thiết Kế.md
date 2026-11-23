# Bảng mapping: route / màn hình code ↔ màn thiết kế (Pencil)

_Tài liệu **tiếp nối** [Đặc Tả Tổng Thể Và Cấu Hình Hệ Thống NovaLimo.md](./Đặc%20Tả%20Tổng%20Thể%20Và%20Cấu%20Hình%20Hệ%20Thống%20NovaLimo.md). Dùng để tra nhanh: màn nào trong pen đã được làm trong repo, làm đến đâu, và đã hoàn thành ở giai đoạn nào của [kế hoạch rebuild](../../docs/REBUILD-PLAN.md)._

> **Cập nhật 18/11/2026 (Hoàn thành GĐ 1–6 rebuild):** toàn bộ các màn hình thuộc `apps/web-admin`, `apps/web-booking`, `apps/app-driver` và thuật toán điều phối thông minh `libs/utils-map` đã được nâng cấp nối API v2 thực tế, tuân thủ hệ design tokens (0 raw hex).

**Ký hiệu trạng thái**

| Ký hiệu               | Ý nghĩa                                                                      |
| --------------------- | ---------------------------------------------------------------------------- |
| ✅ Hoàn thành         | Dữ liệu thật từ API, đủ trạng thái loading / empty / error, đúng layout pen  |
| 🟡 Một phần           | Có UI và một phần dữ liệu thật, hoặc gọi API nhưng còn lỗi lớn hoặc lệch pen |
| ⚪ Placeholder / mock | Có route nhưng chỉ là khung trống hoặc dữ liệu giả                           |
| ❌ Chưa có            | Có trong pen, chưa có trong code                                             |

Cột **GĐ** là giai đoạn thực hiện trong `docs/REBUILD-PLAN.md`.

---

## 1. Web Admin (`apps/web-admin`)

Tra cứu Frame ID ↔ route: [`PENCIL-FRAMES.md`](../../apps/web-admin/src/app/PENCIL-FRAMES.md).

| Route                                                | Trạng thái | Frame `web-admin.pen`                                                                        | Ghi chú hiện trạng                                                                                               | GĐ    |
| ---------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----- |
| `/`                                                  | ✅         | —                                                                                            | Redirect sang `/dashboard`                                                                                       | 4     |
| `/login`                                             | ✅         | — (thiết kế mới)                                                                             | Đăng nhập `/auth/login`, lưu access/refresh token, tự động refresh khi 401, có guard & logout                    | 4     |
| `/dashboard`                                         | ✅         | `nvDash`                                                                                     | KPI thật từ `/admin/dashboard/today`, biểu đồ doanh thu 7 ngày, danh sách chuyến sắp chạy, cảnh báo SOS          | 4     |
| `/dispatch`                                          | ✅         | `nvSmartDispPage`                                                                            | Bảng kéo-thả `@dnd-kit/core`, nút AI Auto-Plan (`POST /admin/dispatch/batches/:id/auto-plan`), bản đồ PostGIS    | 4 + 6 |
| `/dispatch/[batchId]`                                | ✅         | `nvSmartDispPage`                                                                            | Điều phối chi tiết theo `batchId`, Undo/Redo, cảnh báo vượt tải, Xuất Lệnh                                       | 4 + 6 |
| `/trip-runs`, `/[id]`, `/[id]/edit`                  | ✅         | `nvTripRunsList`, `nvTripRunDet`, `nvTripRunEdit`                                            | Danh sách phơi lệnh, chi tiết lộ trình dừng đón/trả, đổi xe/tài xế, hủy lệnh                                     | 4     |
| `/trip-runs/[id]/manifest`                           | ✅         | `nvTripRunManifest`                                                                          | Phơi lệnh in A4 (`window.print()`) kèm bảng hành khách, kiện hàng và ô ký xác nhận                               | 4     |
| `/bookings`                                          | ✅         | `nvOrdPage` (+ `nvOrdPanel2`)                                                                | Bảng đơn đặt vé & tab tra cứu nhanh vận đơn, bộ lọc trạng thái, xuất CSV                                         | 4     |
| `/bookings/new`, `/[id]`, `/[id]/edit`               | ✅         | `nvOrdP1Cre`, `nvOrdP1Det`, `nvOrdP1Ed`                                                      | Đặt vé nội bộ có sơ đồ ghế `SeatMap`, xem chi tiết, đổi điểm đón/trả, xác nhận thu tiền, hoàn/hủy vé             | 4     |
| `/cargos`                                            | ✅         | `nvCargoOpsList`                                                                             | Danh sách vận đơn hàng ký gửi, lọc theo trạng thái/tuyến, xuất CSV                                               | 4     |
| `/cargos/new`, `/[id]`, `/[id]/edit`                 | ✅         | `nvOrdP2Cre`, `nvOrdP2Det`, `nvOrdP2Ed`                                                      | Tạo vận đơn có tính cước tự động (`/public/cargo/quote`), xem chi tiết & ảnh POD, gán chuyến                     | 4     |
| `/cargos/handoff`, `/cargos/cod-reconcile`           | ✅         | `nvCargoHandoff`, `nvCargoCodReconcile`                                                      | Bàn giao kiện hàng lên phơi lệnh & đối soát công nợ COD theo tài xế (`/admin/cod/*`)                             | 2 + 4 |
| `/customers`, `/[id]`, `/[id]/edit`                  | ✅         | `nvCustList`, `nvCustDet`, `nvCustEd`                                                        | Danh sách CRM khách hàng, phân hạng thẻ (VIP/Thân thiết), lịch sử đặt vé & cập nhật thông tin                    | 4     |
| `/vehicles`                                          | ✅         | `nvFleet`                                                                                    | Quản lý đội xe từ `/admin/vehicles`, cảnh báo hạn đăng kiểm/bảo hiểm, quản lý hạng ghế `VehicleType`             | 4     |
| `/vehicles/drivers`                                  | ✅         | `Xox9m` (panelDrivers)                                                                       | Đã xóa cột mật khẩu plaintext; thay bằng modal Cấp lại mật khẩu và Khóa/Mở khóa tài khoản                        | 4     |
| `/vehicles/new`, `/[vehicleId]`, `/[vehicleId]/edit` | ✅         | `vnCreVeh`, `BYSRc`, `smD7h`                                                                 | Thêm xe mới, xem hồ sơ kỹ thuật & sơ đồ ghế, cập nhật trạng thái/odometer/hạn đăng kiểm                          | 4     |
| `/vehicles/drivers/new`                              | ✅         | `vnCreDrv`                                                                                   | Tạo hồ sơ tài xế mới nối `/admin/drivers`                                                                        | 4     |
| `/vehicles/drivers/[driverId]`, `/edit`              | ✅         | `GU9mg`, `kvt1Y`                                                                             | Xem hồ sơ tài xế, trạng thái ca trực, gán xe mặc định, cập nhật GPLX                                             | 4     |
| `/finance`, `/[id]`, `/[id]/edit`                    | ✅         | `nvFinance`, `nvFnDet`, `nvFnEd`                                                             | Sổ quỹ thu/chi `/admin/finance/transactions`, phiếu thu/chi, chi tiết & chỉnh sửa ghi chú                        | 4     |
| `/monitor`                                           | ✅         | `nvGsMap`                                                                                    | Bản đồ Giám sát GPS trực tuyến qua Socket.io `/realtime`, popup xe đang chạy, xử lý cảnh báo SOS                 | 4     |
| `/tracking`                                          | ✅         | —                                                                                            | Redirect sang `/monitor`                                                                                         | 4     |
| `/call-center`                                       | ✅         | `nvCcCreateBooking`, `nvCcRequests`, `nvCcSupportInbox`                                      | 3 tab: Đặt vé nhanh qua tổng đài, Danh sách chuyến trong ngày, Hộp thư phiếu hỗ trợ `/admin/tickets`             | 4     |
| `/reports`                                           | ✅         | `nvRptRevenue`, `nvRptTrips`, `nvRptCargoCod`, `nvRptDriverPerf`                             | 4 tab báo cáo phân tích nối `/admin/reports/*` kèm biểu đồ và xuất CSV                                           | 4     |
| `/settings`                                          | ✅         | `nvCfgRoutesStops`, `nvCfgTimeSlots`, `nvCfgPricing`, `nvCfgCodPolicy`, `nvCfgNotifications` | 5 tab cấu hình hệ thống: Tuyến & Điểm dừng, Khung giờ & Sinh chuyến tự động, Bảng giá, Chính sách COD, Thông báo | 2 + 4 |
| `/rbac`                                              | ✅         | `nvRbacUsers`, `nvRbacRoles`, `nvRbacPermissions`                                            | Quản trị nhân sự, vai trò và ma trận quyền hạn RBAC (`/admin/users`, `/admin/roles`, `/admin/permissions`)       | 2 + 4 |
| `/users`                                             | ✅         | ~`nvRbacUsers`                                                                               | Redirect sang `/rbac?tab=users`                                                                                  | 4     |
| `/audit`                                             | ✅         | `nvAuditLog`                                                                                 | Nhật ký kiểm toán hệ thống `/admin/audit-logs` kèm drawer xem JSON payload                                       | 2 + 4 |
| `/dev/design-system`                                 | ✅ (dev)   | `nvUiMsgLib`                                                                                 | Showcase toàn bộ hệ thống Design Tokens & Shared UI                                                              | 1     |

---

## 2. Web Booking (`apps/web-booking`)

Tra cứu frame ID: [`PENCIL-FRAMES.md`](../../apps/web-booking/src/app/PENCIL-FRAMES.md).

| Route                    | Trạng thái | Frame `web-bôking.pen`                                                   | Ghi chú hiện trạng                                                                           | GĐ    |
| ------------------------ | ---------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ----- |
| `/`                      | ✅         | A1 Trang Chủ                                                             | Hero tìm chuyến, danh sách tuyến nổi bật từ `/public/routes`, JSON-LD SEO                    | 3     |
| `/search`                | ✅         | A2 Kết quả tìm kiếm                                                      | Tìm chuyến từ `/public/trips/search`, lọc khung giờ/hạng ghế, hiển thị giá chuẩn từ server   | 3     |
| (drawer)                 | ✅         | A3 Drawer (Mở hé)                                                        | Xem nhanh sơ đồ ghế và điểm đón/trả ngay trên trang kết quả                                  | 3     |
| `/booking/[tripBatchId]` | ✅         | A4 Seat Map → A6 Thông tin → A7 Thanh toán → A8 Popup QR → A9 Thành công | Giữ chỗ Redis/DB (`POST /public/seat-holds`), đặt vé, VietQR chuyển khoản, cập nhật realtime | 2 + 3 |
| (tham chiếu)             | ✅         | A5 Reference: Seat Map 12 chỗ                                            | Sơ đồ ghế động theo `layout` của từng loại xe                                                | 3     |
| `/my-tickets`            | ✅         | A10 / A11 Tra cứu vé                                                     | Tra cứu vé theo mã vé + SĐT hoặc xác thực OTP (`/public/bookings/lookup`, hủy vé)            | 2 + 3 |
| `/about`                 | ✅         | A12 Giới thiệu                                                           | Server component chuẩn SEO                                                                   | 3     |
| `/pricing`               | ✅         | A13 Bảng giá                                                             | Hiển thị bảng giá thật từ `/public/routes`                                                   | 3     |
| `/contact`               | ✅         | A14 Liên hệ                                                              | Gửi yêu cầu hỗ trợ thật lên `/public/support-tickets`                                        | 3     |
| `/cargo`                 | ✅         | B1 Ký gửi (Landing)                                                      | Trang giới thiệu dịch vụ ký gửi hàng hóa & tra cứu vận đơn (`/public/cargo/track`)           | 3     |
| `/cargo/book`            | ✅         | B2 Đặt gửi hàng                                                          | Form thông tin người gửi/nhận, kích thước, trọng lượng, COD                                  | 2 + 3 |
| `/cargo/results`         | ✅         | B3 Báo giá                                                               | Báo giá tự động từ `/public/cargo/quote` và tạo đơn `/public/cargo/orders`                   | 2 + 3 |
| `/cargo/success`         | ✅         | B4 Gửi hàng thành công                                                   | Hiển thị mã vận đơn thật & hướng dẫn bàn giao                                                | 2 + 3 |
| `/terms`, `/privacy`     | ✅         | Pháp lý                                                                  | Trang điều khoản & chính sách bảo mật                                                        | 3     |
| `/faq`                   | ✅         | FAQ                                                                      | Câu hỏi thường gặp dạng Accordion                                                            | 3     |
| `not-found`              | ✅         | 404                                                                      | —                                                                                            | 3     |

---

## 3. App tài xế (`apps/app-driver`)

Navigation: `RootNavigator` (Login → Permissions → `Main`); `MainNavigator` gồm 4 tab. Chi tiết frame: [`apps/app-driver/PENCIL-FRAMES.md`](../../apps/app-driver/PENCIL-FRAMES.md).

| Screen                         | Trạng thái | Frame `app-mobile.pen`                 | Ghi chú hiện trạng                                                                                      | GĐ    |
| ------------------------------ | ---------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----- |
| `Login`                        | ✅         | `mbDrvLogin`                           | Đăng nhập `/auth/driver/login`, lưu access/refresh token, ẩn/hiện mật khẩu                              | 5     |
| `Permissions`                  | ✅         | `mbDrvPermOverlay`, `mbDrvPermLibrary` | Xin quyền thật qua `expo-location`, `expo-notifications`, `expo-camera` và đăng ký push token           | 5     |
| `Home`                         | ✅         | `mbDrvHomeTrips`                       | Danh sách chuyến `/driver/runs?scope=upcoming\|active\|done`, bật ca `/driver/shifts/start`, gửi lô GPS | 5     |
| `TripDetail`                   | ✅         | `mbDrvTripDetail`                      | Chi tiết phơi lệnh `/driver/runs/:id`, danh sách điểm dừng theo thứ tự, nút "Bắt đầu hành trình"        | 2 + 5 |
| `ActiveNav`                    | ✅         | `mbDrvNavPickup`                       | Điểm đón/trả kế tiếp, tính ETA (`utils-map`), mở Google Maps, `SwipeToConfirm` đón/trả, báo No-show     | 5     |
| `Passengers`                   | ✅         | `mbDrvPaxList`                         | Danh sách hành khách thực tế theo chuyến, gọi khách, xác nhận Đã đón / Đã trả / No-show                 | 2 + 5 |
| `Sos`                          | ✅         | `mbDrvIncident`                        | Gửi báo cáo sự cố kèm tọa độ GPS lên `/driver/incidents` + gọi khẩn cấp 113                             | 2 + 5 |
| `Notifications`                | ✅         | `mbDrvNotif`                           | Danh sách thông báo `/driver/notifications` + đánh dấu đã đọc `/driver/notifications/read`              | 2 + 5 |
| `Income`                       | ✅         | `mbDrvEarn`                            | Thống kê thu nhập & sản lượng theo tháng từ `/driver/income`                                            | 2 + 5 |
| `Profile`                      | ✅         | `mbDrvProfile`                         | Hồ sơ tài xế `/driver/me`, thông tin GPLX & xe phân công, đổi mật khẩu `/auth/change-password`, logout  | 2 + 5 |
| `CargoPick`                    | ✅         | `mbDrvCargoMng`                        | Danh sách kiện hàng trong ca `/driver/cargos` + nút mở đối soát COD & FAB quét QR                       | 5     |
| `Cargo`                        | ✅         | `mbDrvCargoItem`                       | Chi tiết vận đơn thật, xác nhận nhận hàng lên xe / giao thành công (kèm thu COD) / hoàn hàng            | 2 + 5 |
| `CargoScan`                    | ✅         | `mbDrvCargoScan`                       | Quét barcode/QR trực tiếp bằng `CameraView` (`expo-camera`) hoặc nhập mã tra cứu `/driver/cargos/scan/` | 5     |
| `CargoCod`                     | ✅         | `mbDrvCargoCod`                        | Tổng hợp tiền COD đã thu chờ nộp quỹ và COD cần thu từ `/driver/cargos`                                 | 2 + 5 |
| `CargoTransfer`                | ✅         | `mbDrvCargoTransfer`                   | Xác nhận nhận bàn giao kiện hàng lên xe hoặc hoàn trả lại kho trung chuyển                              | 2 + 5 |
| Tab `Chat`                     | ✅         | `mbDrvChat`                            | Chat trực tuyến với Điều hành qua `/driver/chat` + lắng nghe Socket.io `/realtime`                      | 2 + 5 |
| Tab `Shift` (`EndShiftScreen`) | ✅         | `mbDrvShiftEnd`                        | Tổng kết ca từ `/driver/shifts/summary` + bắt buộc đủ 3 mục checklist trước khi kết ca                  | 2 + 5 |
| `DriverBottomBar`              | ✅         | `mbBottomNavLibrary`                   | Thanh điều hướng 4 tab dùng hệ token chuẩn                                                              | 5     |
| Chat-shift mini canvas         | ✅         | `app-mobile-chat-shift.pen`            | `MiniChatShiftPreview` hiển thị trạng thái ca trực thực tế từ hồ sơ tài xế                              | 5     |

---

## 4. Tổng hợp

| App                   | ✅  | 🟡  | ⚪  | ❌  |
| --------------------- | --- | --- | --- | --- |
| web-admin (28 dòng)   | 28  | 0   | 0   | 0   |
| web-booking (16 dòng) | 16  | 0   | 0   | 0   |
| app-driver (19 dòng)  | 19  | 0   | 0   | 0   |

## 5. Cách cập nhật bảng này

- Mỗi PR rebuild một màn: cập nhật trạng thái và đính kèm ảnh so sánh pen ↔ code (`docs/design-ref/`).
- Chỉ đánh ✅ khi đạt đủ tiêu chí DoD trong `docs/REBUILD-PLAN.md` §1.
- Đổi tên frame trong Pencil thì sửa cột frame trong bảng này cho khớp.
