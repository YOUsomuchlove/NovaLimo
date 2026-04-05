## Tài liệu đặc tả phân hệ: Web đặt vé & kênh khách hàng NovaLimo

*Tài liệu được **đối chiếu đầy đủ** với bản vẽ chi tiết `web-bôking.pen`: mọi **tên frame** dưới đây trùng với tên trong file Pencil để dev/design tra cứu 1:1.*

**Liên kết hệ thống tài liệu:** [Đặc Tả Tổng Thể Và Cấu Hình Hệ Thống NovaLimo.md](./Đặc%20Tả%20Tổng%20Thể%20Và%20Cấu%20Hình%20Hệ%20Thống%20NovaLimo.md) — chỉ mục các phân hệ, nguyên tắc cấu hình đa môi trường, REST/socket và checklist thay đổi lớn.

---

### 1. Tổng quan

- **Vai trò:** “Mặt tiền” NovaLimo trên web — khách tự **tìm chuyến → chọn ghế → nhập thông tin → thanh toán → nhận xác nhận**, **tra cứu vé**; luồng **ký gửi hàng**; các trang **giới thiệu, bảng giá, liên hệ** và **pháp lý (điều khoản, bảo mật, FAQ, 404)**.
- **Công nghệ:** **Next.js & React** (SSR/SEO), **Ant Design** + **Tailwind CSS** (bám kit trong pen).
- **Phong cách:** Sang trọng, tối giản; **xanh navy / đen**, nhấn **vàng gold** cho CTA; bo góc mềm.

---

### 2. Cấu trúc canvas & thành phần không phải “trang”

Trong `web-bôking.pen`, hai **nhãn vùng canvas** (zone) mô tả bố cục tổng thể:

| Tên frame (trong file) | Ý nghĩa |
|------------------------|--------|
| **Canvas · Khu A — Đặt vé limousine (tìm chuyến → ghế → thông tin → thanh toán → tra cứu → giới thiệu / giá / liên hệ)** | Cột wireframe luồng **hành khách + marketing/hỗ trợ**. |
| **Canvas · Khu B — Ký gửi hàng (landing → form → báo giá → thành công) & pháp lý (điều khoản, bảo mật, FAQ, 404)** | Cột wireframe **cargo + trang pháp lý / lỗi**. |

**Kit & khối minh họa (dùng lại trên nhiều màn):**

| Tên frame (trong file) | Vai trò |
|------------------------|--------|
| **halo: design system components** | Thư viện component (Ant Design–like): Button, Form, Table, Steps, Drawer, Modal, Tabs, v.v. |
| **dashboard-utility**, **dashboard-revenue**, **dashboard-football** | Widget/biểu đồ minh họa (tham chiếu layout dashboard nếu tái sử dụng trên trang chủ hoàn chỉnh). |

---

### 3. Danh mục đầy đủ các màn hình thiết kế (theo tên frame trong `web-bôking.pen`)

Bảng dưới liệt kê **toàn bộ** các frame cấp “màn hình nghiệp vụ” hoặc **bước luồng** (modal/drawer) xuất hiện trong bản vẽ. Cột **Loại** giúp phân biệt khi map sang route Next.js.

#### 3.1. Khu A — Đặt vé limousine & nội dung công khai

| # | Tên frame **chính xác** trong `web-bôking.pen` | Loại | Mục đích / ghi chú |
|---|-----------------------------------------------|------|---------------------|
| A1 | **Trang Chủ (Home Page)** | Trang | Hero (**Hero Banner**), khu nổi bật (**Featured Section**), CTA tìm chuyến; **Booking Footer** chung chuẩn site. |
| A2 | **Trang Kết quả tìm kiếm chuyến xe** | Trang | Danh sách chuyến; lớp phủ / khối nội dung (**Content Wrap**, **Results Background**, v.v.). |
| A3 | **Drawer (Mở hé)** | Drawer | Mô phỏng sau khi bấm **Chọn chuyến**: “Lựa chọn sơ đồ ghế”, chọn Limousine 9/12 chỗ, trạng thái ghế — dẫn sang màn sơ đồ đầy đủ. |
| A4 | **Sơ đồ ghế (Seat Map)** | Trang | **Vehicle Segmented** (chọn dòng xe), **Legend**, **Seat Wrap**, **Seat Action Bar** (Tiếp tục); header/footer cùng pattern site. |
| A5 | **Reference: Seat Map 12 chỗ** | Tham chiếu | Khung đối chiếu bố cục ghế 12 chỗ (song song với A4, không thay cho route riêng trừ khi PM quyết định). |
| A6 | **Trang Thông tin (Booking)** | Trang | **Steps** + **Info Content**: thông tin hành khách, điểm đón/trả. |
| A7 | **Trang Thanh toán (Checkout)** | Trang | **Steps** + **Checkout Content**; tóm tắt đơn, chọn kênh thanh toán. |
| A8 | **Popup hoàn tất thanh toán (QR + thông tin)** | Modal | QR chuyển khoản + đối chiếu thông tin chuyến & hành khách; gợi ý xác nhận vé sau vài phút. |
| A9 | **NovaLimo · Đặt vé thành công (Passenger success)** | Trang | Mã đơn (ví dụ `NL-…`), QR thanh toán/check-in, hướng dẫn bước tiếp (SMS/email, có mặt trước giờ chạy). |
| A10 | **Tra cứu vé đã đặt (theo SĐT)** | Trang | Form tra cứu; **Dashboard row** — cột phải trống khi chưa tra cứu. |
| A11 | **Tra cứu vé — có kết quả (demo)** | Trang | Cùng layout A10; cột phải có danh sách vé (mock) khi tra cứu thành công. |
| A12 | **Trang Giới thiệu (About Us)** | Trang | Hero “Hành trình đẳng cấp”, **Fleet cards**, **Stats Row**, **Values row**, v.v. |
| A13 | **Trang Bảng giá (Pricing)** | Trang | **Tabs** theo tuyến, **Pricing table card**, **Alert policy**. |
| A14 | **Trang Liên hệ & Hỗ trợ (Contact)** | Trang | **Contact grid**, hotline/email đồng bộ footer. |

#### 3.2. Khu B — Ký gửi hàng

| # | Tên frame **chính xác** trong `web-bôking.pen` | Loại | Mục đích / ghi chú |
|---|-----------------------------------------------|------|---------------------|
| B1 | **NovaLimo · Ký gửi hàng (Landing)** | Trang | Landing: value prop, **USP row**, quy trình, CTA vào form. |
| B2 | **NovaLimo · Đặt gửi hàng (Cargo booking)** | Trang | **form card**: thông tin kiện; checkbox đồng ý điều khoản & hàng không cấm. |
| B3 | **NovaLimo · Báo giá ký gửi (Cargo results)** | Trang | **results card**: phương án giá (ví dụ Tiêu chuẩn / Nhanh / Hàng dễ vỡ), điều kiện phụ phí. |
| B4 | **NovaLimo · Gửi hàng thành công (Cargo success)** | Trang | Mã vận đơn (ví dụ `CG-…`), QR quầy, nhắc có mặt tại bến trước giờ chạy. |

#### 3.3. Pháp lý & lỗi hệ thống

| # | Tên frame **chính xác** trong `web-bôking.pen` | Loại | Mục đích / ghi chú |
|---|-----------------------------------------------|------|---------------------|
| L1 | **NovaLimo · Điều khoản sử dụng (Terms)** | Trang | Nội dung điều khoản + header/footer chuẩn. |
| L2 | **NovaLimo · Chính sách bảo mật (Privacy)** | Trang | Chính sách bảo mật. |
| L3 | **NovaLimo · Câu hỏi thường gặp (FAQ)** | Trang | FAQ (implementation: **Accordion** từ kit). |
| L4 | **NovaLimo · Không tìm thấy trang (404)** | Trang | 404 + nút quay lại. |

---

### 4. Thành phần chung header / footer (lặp lại trên các trang)

Theo wireframe, các trang dùng chung pattern:

- **Header:** logo NovaLimo, điều hướng **Trang Chủ — Giới Thiệu — Bảng Giá — Liên Hệ — Ký gửi hàng**, CTA kiểu “Đặt vé ngay” (chi tiết node nằm trong frame từng trang).
- **Footer / Booking Footer:** Hotline **1900 3528**, **support@novalimo.vn**, địa chỉ VP mẫu (Tầng 8, 123 Nguyễn Trãi, Q. Thanh Xuân, Hà Nội), © **2026**; copy nhấn mạnh **một SĐT** cho đặt vé = tra cứu vé = liên hệ hỗ trợ (cùng hệ thống).

---

### 5. Chi tiết UI/UX theo nhóm (triển khai AntD)

#### 5.1. Trang chủ

- Hero, khối tìm kiếm (điểm đi/đến, ngày): `Select`, `DatePicker`.
- Khu “Hành trình được yêu thích” / trải nghiệm đặt vé.

#### 5.2. Kết quả tìm kiếm & Drawer

- Bộ lọc: `Checkbox` / `Slider` / `Select` tùy PM.
- **Drawer (Mở hé):** preview chọn sơ đồ ghế trước khi vào **Sơ đồ ghế (Seat Map)** đầy đủ.

#### 5.3. Sơ đồ ghế

- Segmented “Chọn dòng xe”; legend trống / đã bán / đang chọn; tooltip giá theo ghế nếu nghiệp vụ có.
- Tham chiếu bố cục: frame **Reference: Seat Map 12 chỗ**.

#### 5.4. Thông tin & thanh toán

- **Steps** cho tiến trình; **Form** + validate SĐT; có thể tab Người đi / Người đặt hộ.
- Thanh toán: `Radio` + `Card` (Momo, ZaloPay, VNPay, tại nhà xe); **Popup** QR như màn A8.

#### 5.5. Tra cứu vé

- Một SĐT thống nhất; **Tag** trạng thái vé trên danh sách kết quả (A11).

#### 5.6. Ký gửi & pháp lý

- Cargo: landing → form → báo giá → success (B1–B4).
- Terms / Privacy / FAQ / 404: nội dung dài + layout đọc thoải mái.

---

### 6. Bộ kit trong file (`halo: design system components`)

Map sang **Ant Design** khi code `apps/web-booking`: Button, Card, Input, Select, Steps, Tabs, Table, Drawer, Modal, Tooltip, Accordion, Pagination, v.v.

---

### 7. Luồng dữ liệu & backend (tóm tắt)

1. Submit form → API tạo **Bookings** (và cargo nếu có).
2. Địa chỉ: text + tọa độ khi geocode.
3. Vé gắn `trip_batch_id`; `trip_run_id` / thứ tự đón có thể gán sau điều phối.
4. Sau đặt: success + SMS/email/Zalo; hiển thị mã đơn/QR như **NovaLimo · Đặt vé thành công**.

---

### 8. Kiến trúc monorepo & quy ước (Nx)

- **`apps/web-booking/`:** routes Next.js, gọi API.
- **`libs/shared-types/`**, **`libs/shared-ui/`:** type và component dùng chung.
- Không import trực tiếp từ `web-admin` / `api-server`; dependency npm khai báo ở `package.json` gốc.

---

### 9. Ghi chú mapping thiết kế ↔ code

- Số **frame trang** trong pen **nhiều hơn** số file `page.tsx` hiện có là bình thường: có thể gộp route (ví dụ `/booking/success`) hoặc dùng query/modal cho **Drawer** / **Popup** thay vì URL riêng — cần bảng mapping nội bộ khi chốt IA.
- Hai màn **Tra cứu** (A10/A11) là hai trạng thái UI của cùng một chức năng tra cứu.

---

*Tài liệu căn cứ: `hệ thống quản lý xe limosin/New/web-bôking.pen` và kiến trúc monorepo NovaLimo.*
