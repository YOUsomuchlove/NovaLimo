# Đặc tả phân hệ: Web Admin — Quản trị & điều hành NovaLimo

Tài liệu mô tả nghiệp vụ, giao diện và kỹ thuật cho phân hệ **Web Admin** (`apps/web-admin`). Phần **danh mục màn hình** được **đối chiếu với bản vẽ chi tiết** trong tệp `web-admin.pen` (các frame đặt tên `NovaLimo Admin · …`). Khi triển khai Next.js, nhiều màn có thể gộp thành một route có tab/phụ lộ trình; tài liệu này vẫn liệt kê **đủ từng màn thiết kế** để đội sản phẩm và dev cùng tham chiếu.

**Liên kết hệ thống tài liệu:** [Đặc Tả Tổng Thể Và Cấu Hình Hệ Thống NovaLimo.md](./Đặc%20Tả%20Tổng%20Thể%20Và%20Cấu%20Hình%20Hệ%20Thống%20NovaLimo.md) — sơ đồ phân hệ, cấu hình env, RBAC/API, realtime.

---

## 1. Tổng quan và kiến trúc công nghệ

- **Mục tiêu:** Trung tâm điều khiển (control panel) cho điều hành: quản lý vòng đời chuyến, giám sát đội xe/tài xế, xử lý đơn vé và ký gửi, tài chính/COD, cấu hình vận hành và phân quyền.
- **Nền tảng:** Giao diện **responsive**, ưu tiên **PC và tablet** để điều hành có thể thao tác khi di chuyển mà không bắt buộc cài app riêng.
- **Công nghệ lõi:** **Next.js & React** trong `apps/web-admin`.
- **UI/UX:** **Ant Design** + **Tailwind CSS**, tái sử dụng pattern từ `libs/shared-ui`. Các thao tác **kéo–thả** (chia khách giữa các xe sau khi xếp tự động) có thể dùng **dnd-kit** hoặc thư viện tương đương.
- **Dữ liệu:** Đồng bộ kiểu từ `libs/shared-types` (ví dụ `TripBatch`, `TripRun`, `Booking`, `Vehicle`, …) nhằm **type safety** end-to-end với API.

---

## 2. Thành phần thiết kế dùng chung (trong `web-admin.pen`)

Các khung không phải “trang nghiệp vụ” nhưng phục vụ lắp ráp và nhất quán UI:

| Tên frame (trong file) | Vai trò |
|------------------------|--------|
| **halo: design system components** | Kit component (nút, form, bảng, Steps, Sidebar, …) mô phỏng Ant Design. |
| **NovaLimo UI · Message & Popup Library** | Thư viện thông báo, modal, popup chuẩn hóa. |
| **dashboard-utility**, **dashboard-revenue**, **dashboard-football** | Khối/widget minh họa cho dashboard (thống kê, biểu đồ, v.v.). |
| **panelDrivers** | Panel/component mẫu liên quan danh sách tài xế (dùng lại trong các màn điều phối/giám sát). |

---

## 3. Danh mục đầy đủ các trang/màn hình thiết kế (`NovaLimo Admin · …`)

Dưới đây là **tất cả** các frame đặt tên nghiệp vụ trong bản vẽ, nhóm theo luồng điều hành. Mô tả ngắn gắn với **tên màn** và chức năng kỳ vọng trong hệ thống NovaLimo.

### 3.1. Tổng quan và điều phối

| Màn hình (tên trong `web-admin.pen`) | Mục đích / nội dung chính |
|--------------------------------------|---------------------------|
| **NovaLimo Admin · Dashboard & Analytics** | Bảng điều khiển: chỉ số vận hành/kinh doanh (vé, doanh thu, lấp đầy, xe đang chạy), biểu đồ xu hướng. |
| **NovaLimo Admin · Điều phối Thông minh (Smart Dispatching)** | “Rổ chờ” theo khung giờ (`trip_batch`), danh sách khách chờ xếp xe, nút chạy thuật toán xếp xe, sau đó điều chỉnh kéo–thả và **xuất lệnh** xuống app tài xế. |
| **NovaLimo Admin · Phơi lệnh (Manifest)** | Xem/in phơi lệnh theo chuyến xe — danh sách khách, thứ tự đón/trả sau khi đã chốt. |
| **NovaLimo Admin · Bàn giao Trung chuyển** | Quy trình bàn giao khách/kiện giữa xe tuyến chính và xe trung chuyển (nếu nghiệp vụ có). |

### 3.2. Chuyến chạy (Trip runs)

| Màn hình | Mục đích / nội dung chính |
|----------|---------------------------|
| **NovaLimo Admin · Quản lý Chuyến (Trip Runs)** | Danh sách chuyến xe thực tế đã/đang chạy, lọc theo ngày, tuyến, trạng thái. |
| **NovaLimo Admin · Chi tiết Chuyến** | Chi tiết một `trip_run`: tài xế, xe, lịch trình, khách/giao hàng gắn chuyến. |
| **NovaLimo Admin · Chỉnh sửa Chuyến** | Form chỉnh sửa thông tin chuyến (theo quyền và quy tắc nghiệp vụ). |

### 3.3. Đơn vé, ký gửi và vận hành hàng hóa

| Màn hình | Mục đích / nội dung chính |
|----------|---------------------------|
| **NovaLimo Admin · Quản lý Đơn hàng & Ký gửi Hàng hóa** | Tra cứu tập trung vé khách và đơn ký gửi; hỗ trợ thao tác hỗ trợ khách qua tổng đài. |
| **NovaLimo Admin · Tạo đơn vé hành khách** | Tạo vé thủ công (điểm đón/trả, ghế, thanh toán). |
| **NovaLimo Admin · Chi tiết đơn vé hành khách** | Xem chi tiết một booking: hành khách, ghế, trạng thái, liên kết chuyến. |
| **NovaLimo Admin · Sửa đơn vé hành khách** | Chỉnh sửa vé đã tạo (đổi giờ/ghế/hủy — theo policy). |
| **NovaLimo Admin · Tạo đơn ký gửi hàng hóa** | Tạo vận đơn ký gửi không hoặc kèm ghế tùy nghiệp vụ. |
| **NovaLimo Admin · Chi tiết vận đơn ký gửi** | Chi tiết mã vận đơn, trạng thái, điểm nhận/giao. |
| **NovaLimo Admin · Sửa vận đơn ký gửi** | Cập nhật đơn ký gửi. |
| **NovaLimo Admin · Vận hành Hàng hóa** | Màn tổng quan vận hành khoảng ký gửi (xử lý tại bến, trạng thái kiện). |

### 3.4. Khách hàng

| Màn hình | Mục đích / nội dung chính |
|----------|---------------------------|
| **NovaLimo Admin · Khách hàng** | Danh sách khách hàng (CRM nhẹ): SĐT, lịch sử đặt, ghi chú. |
| **NovaLimo Admin · Chi tiết Khách hàng** | Hồ sơ chi tiết một khách. |
| **NovaLimo Admin · Sửa Khách hàng** | Chỉnh sửa thông tin khách. |

### 3.5. Đội xe và tài xế

| Màn hình | Mục đích / nội dung chính |
|----------|---------------------------|
| **NovaLimo Admin · Quản lý Đội xe & Tài xế** | Danh sách xe và tài khoản tài xế, trạng thái hoạt động. |
| **NovaLimo Admin · Tạo xe mới** / **NovaLimo Admin · Sửa xe** | CRUD phương tiện (biển số, loại, sức chứa, trạng thái). |
| **NovaLimo Admin · Chi tiết xe** | Chi tiết một xe. |
| **NovaLimo Admin · Tạo tài xế mới** / **NovaLimo Admin · Sửa tài xế** | CRUD tài xế, liên kết app mobile. |
| **NovaLimo Admin · Chi tiết tài xế** | Chi tiết một tài xế (chuyến, KPI nếu có). |

### 3.6. Tài chính và COD

| Màn hình | Mục đích / nội dung chính |
|----------|---------------------------|
| **NovaLimo Admin · Quản lý Tài chính** | Tổng quan thu chi, đối soát giao dịch. |
| **NovaLimo Admin · Chi tiết tài chính** / **NovaLimo Admin · Sửa tài chính** | Xem và điều chỉnh bút toán/giao dịch (theo quyền). |
| **NovaLimo Admin · Đối soát COD** | Đối soát thu hộ COD với tài xế/chuyến. |

### 3.7. Giám sát thời gian thực

| Màn hình | Mục đích / nội dung chính |
|----------|---------------------------|
| **NovaLimo Admin · Giám sát Hành trình (Command Center)** | Bản đồ/trạng thái xe theo thời gian thực (WebSocket/socket.io), click xe xem tài xế, tốc độ, tiến độ đón/trả. |

### 3.8. Tổng đài (Call center)

| Màn hình | Mục đích / nội dung chính |
|----------|---------------------------|
| **NovaLimo Admin · Tổng đài · Tạo vé thủ công** | Luồng nhanh cho CS tạo vé khi khách gọi. |
| **NovaLimo Admin · Tổng đài · Yêu cầu/CS** | Danh sách ticket/yêu cầu hỗ trợ. |
| **NovaLimo Admin · Tổng đài · Hộp thư hỗ trợ** | Hộp thư/tin nhắn hỗ trợ khách. |

### 3.9. Báo cáo

| Màn hình | Mục đích / nội dung chính |
|----------|---------------------------|
| **NovaLimo Admin · Báo cáo Chuyến** | Thống kê theo chuyến (số khách, đúng giờ, sự cố). |
| **NovaLimo Admin · Báo cáo Doanh thu** | Doanh thu theo ngày/tuyến/kênh. |
| **NovaLimo Admin · Báo cáo Hàng hóa/COD** | Ký gửi và COD. |
| **NovaLimo Admin · Báo cáo Tài xế** | Hiệu suất tài xế (chuyến, đánh giá, nếu có). |

### 3.10. Cấu hình hệ thống

| Màn hình | Mục đích / nội dung chính |
|----------|---------------------------|
| **NovaLimo Admin · Cấu hình tuyến/điểm** | Tuyến, bến, điểm dừng. |
| **NovaLimo Admin · Cấu hình khung giờ** | Khung giờ xuất bến / `trip_batch`. |
| **NovaLimo Admin · Cấu hình giá** | Bảng giá, điều kiện áp dụng. |
| **NovaLimo Admin · Cấu hình COD** | Quy tắc thu hộ và đối soát COD. |
| **NovaLimo Admin · Cấu hình thông báo** | Mẫu SMS/Zalo/email, trigger. |

### 3.11. RBAC và kiểm toán

| Màn hình | Mục đích / nội dung chính |
|----------|---------------------------|
| **NovaLimo Admin · RBAC · Users** | Người dùng nội bộ và quyền đăng nhập admin. |
| **NovaLimo Admin · RBAC · Roles** | Vai trò (dispatcher, kế toán, …). |
| **NovaLimo Admin · RBAC · Permissions** | Ma trận quyền chi tiết. |
| **NovaLimo Admin · Audit Log** | Nhật ký thao tác quan trọng (ai làm gì, khi nào). |

---

## 4. Tính năng cốt lõi: điều phối thông minh (bổ sung chi tiết kỹ thuật)

Phần này khớp với màn **Điều phối Thông minh** và luồng dữ liệu backend đã mô tả trong kiến trúc NovaLimo:

- **Giao diện “rổ chờ”:** Tabs hoặc bộ lọc theo khung giờ (`trip_batch`), danh sách booking trạng thái chờ xếp.
- **Xếp xe tự động:** API gọi backend dùng **PostGIS** (gom khách theo khoảng cách) và **OR-Tools** (tối ưu tuyến/thứ tự), sinh **`trip_run`** và gán `trip_run_id`, `pickup_order`, `dropoff_order`.
- **Kéo–thả:** Sau khi có đề xuất, điều hành có thể kéo khách giữa các xe; cảnh báo khi vượt sức chứa hoặc vi phạm ràng buộc.
- **Xuất lệnh:** Lưu trạng thái chính thức, đồng bộ xuống **app tài xế** (thứ tự đón/trả đã chốt).

---

## 5. Luồng giao tiếp dữ liệu (tóm tắt)

1. **Hiển thị:** Web Admin gọi API lấy `bookings` theo `trip_batch_id` (trạng thái phù hợp với “mở rổ”).
2. **Chạy thuật toán:** Trả về các `trip_run` và phân bổ booking; UI cập nhật state cho vùng kéo–thả.
3. **Điều chỉnh tay:** State thay đổi theo thao tác kéo–thả cục bộ.
4. **Chốt:** Gửi payload cập nhật xuống API: ghi `trip_run_id`, thứ tự đón/trả, chuyển trạng thái chuyến/batch theo quy ước hệ thống.

---

## 6. Quy ước code tại `apps/web-admin`

- **UI dùng chung:** Component lặp (bản đồ, form vé, bảng chuẩn) nên đặt trong **`libs/shared-ui`** (Nx generators), tránh nhân bản chỉ trong `web-admin` khi có thể tái sử dụng.
- **Kiểu dữ liệu:** Dùng `@limo/shared-types` (hoặc alias Nx tương đương trong repo) cho mọi entity từ API.
- **Thư viện:** Khai báo dependency chung ở `package.json` gốc monorepo để đồng phiên bản với `web-booking` và các app khác.

---

## 7. Ghi chú đồng bộ thiết kế và mã nguồn

- Bản **`web-admin.pen`** mô tả **đầy đủ** các màn riêng (ví dụ từng loại báo cáo, từng màn tạo/sửa). Trong **Next.js**, một số nhóm có thể gộp (ví dụ `/reports` với tab, `/settings` với tab) — cần bảng mapping route ↔ frame khi triển khai.
- Các route hiện có trong repo (tham chiếu nhanh): `dashboard`, `dispatch`, `dispatch/[batchId]`, `trip-runs`, `trip-runs/[id]`, `bookings`, `cargos`, `customers`, `vehicles`, `users`, `finance`, `monitor`, `tracking`, `call-center`, `reports`, `settings`, `rbac`, `login`, v.v. Việc mở rộng cho khớp toàn bộ màn trong pen là hạng mục sản phẩm/roadmap.

---

*Tài liệu căn cứ: wireframe `hệ thống quản lý xe limosin/New/web-admin.pen` và kiến trúc monorepo NovaLimo.*
