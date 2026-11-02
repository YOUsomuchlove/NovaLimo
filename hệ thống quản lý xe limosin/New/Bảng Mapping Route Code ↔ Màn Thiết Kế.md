# Bảng mapping: route / màn hình code ↔ màn thiết kế (Pencil)

_Tài liệu **tiếp nối** [Đặc Tả Tổng Thể Và Cấu Hình Hệ Thống NovaLimo.md](./Đặc%20Tả%20Tổng%20Thể%20Và%20Cấu%20Hình%20Hệ%20Thống%20NovaLimo.md). Dùng để tra nhanh: màn nào trong pen đã được làm trong repo, làm đến đâu, và sẽ làm lại ở giai đoạn nào của [kế hoạch rebuild](../../docs/REBUILD-PLAN.md)._

> **Cập nhật 02/11/2026 (GĐ 0 rebuild):** cột trạng thái được đánh giá lại theo **chất lượng thực tế**, không chỉ theo việc có file route. Bản trước ghi “Đã có” cho cả các màn placeholder.

**Ký hiệu trạng thái**

| Ký hiệu               | Ý nghĩa                                                                      |
| --------------------- | ---------------------------------------------------------------------------- |
| ✅ Hoàn thành         | Dữ liệu thật từ API, đủ trạng thái loading / empty / error, đúng layout pen  |
| 🟡 Một phần           | Có UI và một phần dữ liệu thật, hoặc gọi API nhưng còn lỗi lớn hoặc lệch pen |
| ⚪ Placeholder / mock | Có route nhưng chỉ là khung trống hoặc dữ liệu giả                           |
| ❌ Chưa có            | Có trong pen, chưa có trong code                                             |

Cột **GĐ** là giai đoạn sẽ làm lại trong `docs/REBUILD-PLAN.md`.

---

## 1. Web Admin (`apps/web-admin`)

Tra cứu Frame ID ↔ route: [`PENCIL-FRAMES.md`](../../apps/web-admin/src/app/PENCIL-FRAMES.md).

| Route                                                | Trạng thái | Frame `web-admin.pen`                                                                        | Ghi chú hiện trạng                                                                                         | GĐ    |
| ---------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----- |
| `/`                                                  | ✅         | —                                                                                            | Redirect sang `/dashboard`                                                                                 | 4     |
| `/login`                                             | 🟡         | — (thiết kế mới)                                                                             | Gọi API thật; token nằm trong localStorage; không có guard, không có logout; hiển thị gợi ý tài khoản demo | 4     |
| `/dashboard`                                         | ⚪         | `nvDash`                                                                                     | KPI số cứng, chưa có biểu đồ                                                                               | 4     |
| `/dispatch`                                          | ⚪         | `nvSmartDispPage`                                                                            | Demo kéo thả với 3 chip mock                                                                               | 4 + 6 |
| `/dispatch/[batchId]`                                | ⚪         | `nvSmartDispPage`                                                                            | Chỉ in ra batchId                                                                                          | 4 + 6 |
| `/trip-runs`, `/[id]`, `/[id]/edit`                  | ⚪         | `nvTripRunsList`, `nvTripRunDet`, `nvTripRunEdit`                                            | Card placeholder                                                                                           | 4     |
| `/trip-runs/[id]/manifest`                           | ⚪         | `nvTripRunManifest`                                                                          | Card placeholder                                                                                           | 4     |
| `/bookings`                                          | ⚪         | `nvOrdPage` (+ `nvOrdPanel2`)                                                                | Bảng rỗng (`dataSource=[]`); chữ sáng trên nền sáng                                                        | 4     |
| `/bookings/new`, `/[id]`, `/[id]/edit`               | ⚪         | `nvOrdP1Cre`, `nvOrdP1Det`, `nvOrdP1Ed`                                                      | Card một dòng                                                                                              | 4     |
| `/cargos`                                            | ⚪         | `nvCargoOpsList`                                                                             | 3 link                                                                                                     | 4     |
| `/cargos/new`, `/[id]`, `/[id]/edit`                 | ⚪         | `nvOrdP2Cre`, `nvOrdP2Det`, `nvOrdP2Ed`                                                      | Card một dòng                                                                                              | 4     |
| `/cargos/handoff`, `/cargos/cod-reconcile`           | ⚪         | `nvCargoHandoff`, `nvCargoCodReconcile`                                                      | Card một dòng; backend chưa có COD                                                                         | 2 + 4 |
| `/customers`, `/[id]`, `/[id]/edit`                  | ⚪         | `nvCustList`, `nvCustDet`, `nvCustEd`                                                        | Card placeholder                                                                                           | 4     |
| `/vehicles`                                          | 🟡         | `nvFleet`                                                                                    | UI đẹp nhất hiện có, nhưng dữ liệu mock; tổng phân trang giả; cột “KM” gắn sai field                       | 4     |
| `/vehicles/drivers`                                  | 🟡         | `Xox9m` (panelDrivers)                                                                       | Mock; **có cột mật khẩu plaintext**, phải bỏ                                                               | 4     |
| `/vehicles/new`, `/[vehicleId]`, `/[vehicleId]/edit` | ⚪         | `vnCreVeh`, `BYSRc`, `smD7h`                                                                 | Card một dòng                                                                                              | 4     |
| `/vehicles/drivers/new`                              | 🟡         | `vnCreDrv`                                                                                   | Form đầy đủ và upload avatar chạy thật, nhưng **nút lưu không submit**                                     | 4     |
| `/vehicles/drivers/[driverId]`, `/edit`              | ⚪         | `GU9mg`, `kvt1Y`                                                                             | Card placeholder                                                                                           | 4     |
| `/finance`, `/[id]`, `/[id]/edit`                    | ⚪         | `nvFinance`, `nvFnDet`, `nvFnEd`                                                             | Card placeholder                                                                                           | 4     |
| `/monitor`                                           | 🟡         | `nvGsMap`                                                                                    | Socket thật nhưng chỉ in JSON thô; khung bản đồ giả                                                        | 4     |
| `/tracking`                                          | ✅         | —                                                                                            | Redirect sang `/monitor`                                                                                   | 4     |
| `/call-center`                                       | ⚪         | `nvCcCreateBooking`, `nvCcRequests`, `nvCcSupportInbox`                                      | 3 tab placeholder; sẽ tách thành 3 sub-route                                                               | 4     |
| `/reports`                                           | ⚪         | 4 màn Báo cáo (Chuyến / Doanh thu / Hàng hóa-COD / Tài xế)                                   | 4 tab chỉ có chữ “Biểu đồ”; sẽ tách sub-route                                                              | 4     |
| `/settings`                                          | ⚪         | `nvCfgRoutesStops`, `nvCfgTimeSlots`, `nvCfgPricing`, `nvCfgCodPolicy`, `nvCfgNotifications` | 5 tab placeholder; backend chưa có bảng cấu hình                                                           | 2 + 4 |
| `/rbac`                                              | ⚪         | `nvRbacUsers`, `nvRbacRoles`, `nvRbacPermissions`                                            | 3 tab placeholder; backend không kiểm tra quyền                                                            | 2 + 4 |
| `/users`                                             | ⚪         | ~`nvRbacUsers`                                                                               | Trùng với RBAC; sẽ gộp vào `/rbac/users`                                                                   | 4     |
| `/audit`                                             | ⚪         | `nvAuditLog`                                                                                 | Card placeholder; backend chưa có GET audit log                                                            | 2 + 4 |
| `/dev/ui-messages`                                   | 🟡 (dev)   | `nvUiMsgLib`                                                                                 | Sẽ thay bằng `/dev/design-system`                                                                          | 1     |

---

## 2. Web Booking (`apps/web-booking`)

Tra cứu frame ID: [`PENCIL-FRAMES.md`](../../apps/web-booking/src/app/PENCIL-FRAMES.md).

| Route                    | Trạng thái | Frame `web-bôking.pen`                                                   | Ghi chú hiện trạng                                                                                                                                  | GĐ    |
| ------------------------ | ---------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `/`                      | 🟡         | A1 Trang Chủ                                                             | Lấy trip-batches thật, nhưng tuyến được parse từ chuỗi bằng regex; ảnh hotlink Unsplash; một số class không được định nghĩa                         | 3     |
| `/search`                | 🟡         | A2 Kết quả tìm kiếm                                                      | Lọc toàn bộ ở client; **giá, sức chứa, ghế trống bị bịa** khi API thiếu dữ liệu; giờ đến cố định +2h30                                              | 3     |
| (drawer)                 | ❌         | A3 Drawer (Mở hé)                                                        | Mới có drawer tóm tắt, chưa có sơ đồ ghế xem trước                                                                                                  | 3     |
| `/booking/[tripBatchId]` | 🟡         | A4 Seat Map → A6 Thông tin → A7 Thanh toán → A8 Popup QR → A9 Thành công | Luồng chạy được, nhưng **giá và sức chứa lấy từ URL**; QR giả; mã đơn tự sinh không lưu; F5 là mất dữ liệu đã nhập; marker bản đồ không đúng tọa độ | 2 + 3 |
| (tham chiếu)             | 🟡         | A5 Reference: Seat Map 12 chỗ                                            | Khách tự chọn 9 hay 12 chỗ thay vì lấy theo xe thật                                                                                                 | 3     |
| `/my-tickets`            | 🟡         | A10 / A11 Tra cứu vé                                                     | API public theo SĐT, **không OTP** (lộ PII); chưa có chi tiết vé hay hủy vé                                                                         | 2 + 3 |
| `/about`                 | 🟡         | A12 Giới thiệu                                                           | UI xong; số liệu cứng; render phía client                                                                                                           | 3     |
| `/pricing`               | 🟡         | A13 Bảng giá                                                             | Giá cứng trong file; **chính sách ghế VIP mâu thuẫn với SeatMap**                                                                                   | 3     |
| `/contact`               | 🟡         | A14 Liên hệ                                                              | Form chỉ hiện “Đã ghi nhận (demo)”                                                                                                                  | 3     |
| `/cargo`                 | 🟡         | B1 Ký gửi (Landing)                                                      | UI tĩnh                                                                                                                                             | 3     |
| `/cargo/book`            | ⚪         | B2 Đặt gửi hàng                                                          | Tuyến demo; thiếu trường người gửi/nhận; chưa có API public                                                                                         | 2 + 3 |
| `/cargo/results`         | ⚪         | B3 Báo giá                                                               | Giá cứng 240k/310k                                                                                                                                  | 2 + 3 |
| `/cargo/success`         | ⚪         | B4 Gửi hàng thành công                                                   | Mã vận đơn giả, QR demo                                                                                                                             | 2 + 3 |
| `/terms`, `/privacy`     | 🟡         | Pháp lý                                                                  | UI xong; render phía client                                                                                                                         | 3     |
| `/faq`                   | 🟡         | FAQ                                                                      | Dùng glass cards, chưa phải Accordion như đặc tả                                                                                                    | 3     |
| `not-found`              | ✅         | 404                                                                      | —                                                                                                                                                   | 3     |

---

## 3. App tài xế (`apps/app-driver`)

Navigation: `RootNavigator` (Login → Permissions → `Main`); `MainNavigator` gồm 4 tab. Chi tiết frame: [`apps/app-driver/PENCIL-FRAMES.md`](../../apps/app-driver/PENCIL-FRAMES.md).

| Screen                         | Trạng thái | Frame `app-mobile.pen`                 | Ghi chú hiện trạng                                                   | GĐ    |
| ------------------------------ | ---------- | -------------------------------------- | -------------------------------------------------------------------- | ----- |
| `Login`                        | 🟡         | `mbDrvLogin`                           | API thật; token chỉ lưu trong bộ nhớ, mất khi khởi động lại app      | 5     |
| `Permissions`                  | ⚪         | `mbDrvPermOverlay`, `mbDrvPermLibrary` | Switch giả, **không gọi API xin quyền**                              | 5     |
| `Home`                         | 🟡         | `mbDrvHomeTrips`                       | Danh sách chuyến và ca thật; GPS chỉ chạy khi đang mở màn này        | 5     |
| `TripDetail`                   | 🟡         | `mbDrvTripDetail`                      | Lấy dữ liệu từ params, không fetch lại; chưa có “Bắt đầu hành trình” | 2 + 5 |
| `ActiveNav`                    | ⚪         | `mbDrvNavPickup`                       | Khách mock, bản đồ là ảnh PNG tĩnh                                   | 5     |
| `Passengers`                   | ⚪         | `mbDrvPaxList`                         | Mảng mock; chưa có check-in                                          | 2 + 5 |
| `Sos`                          | ⚪         | `mbDrvIncident`                        | Chỉ gọi `tel:113`; gửi báo cáo chưa làm gì                           | 2 + 5 |
| `Notifications`                | ⚪         | `mbDrvNotif`                           | Danh sách mock                                                       | 2 + 5 |
| `Income`                       | ⚪         | `mbDrvEarn`                            | Số cứng                                                              | 2 + 5 |
| `Profile`                      | ⚪         | `mbDrvProfile`                         | Thông tin cứng                                                       | 2 + 5 |
| `CargoPick`                    | 🟡         | `mbDrvCargoMng`                        | API thật; lỗi bị nuốt, không báo                                     | 5     |
| `Cargo`                        | ⚪         | `mbDrvCargoItem`                       | Mã cứng “NL-CARGO-DEMO”                                              | 2 + 5 |
| `CargoScan`                    | ⚪         | `mbDrvCargoScan`                       | Chưa dùng camera                                                     | 5     |
| `CargoCod`                     | ⚪         | `mbDrvCargoCod`                        | Mock                                                                 | 2 + 5 |
| `CargoTransfer`                | ⚪         | `mbDrvCargoTransfer`                   | Mock                                                                 | 2 + 5 |
| Tab `Chat`                     | ⚪         | `mbDrvChat`                            | Tin nhắn mock, chưa có socket                                        | 2 + 5 |
| Tab `Shift` (`EndShiftScreen`) | 🟡         | `mbDrvShiftEnd`                        | Kết ca qua API thật; tổng kết số liệu cứng; checklist không bắt buộc | 2 + 5 |
| `DriverBottomBar`              | 🟡         | `mbBottomNavLibrary`                   | IA sẽ đổi thành Chuyến / Hàng / Chat / Tôi                           | 5     |
| Chat-shift mini canvas         | 🟡         | `app-mobile-chat-shift.pen`            | `MiniChatShiftPreview`, dữ liệu cứng                                 | 5     |

---

## 4. Tổng hợp

| App                   | ✅  | 🟡  | ⚪  | ❌  |
| --------------------- | --- | --- | --- | --- |
| web-admin (28 dòng)   | 2   | 6   | 20  | 0   |
| web-booking (16 dòng) | 1   | 11  | 3   | 1   |
| app-driver (19 dòng)  | 0   | 7   | 12  | 0   |

## 5. Cách cập nhật bảng này

- Mỗi PR rebuild một màn: cập nhật trạng thái và đính kèm ảnh so sánh pen ↔ code (`docs/design-ref/`).
- Chỉ đánh ✅ khi đạt đủ tiêu chí DoD trong `docs/REBUILD-PLAN.md` §1.
- Đổi tên frame trong Pencil thì sửa cột frame trong bảng này cho khớp.
