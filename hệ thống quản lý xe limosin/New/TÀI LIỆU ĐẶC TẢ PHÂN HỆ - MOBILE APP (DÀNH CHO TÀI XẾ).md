# Tài liệu đặc tả phân hệ: Mobile App (dành cho tài xế)

*Tài liệu được **đối chiếu với bản vẽ** trong `app-mobile.pen` và `app-mobile-chat-shift.pen`: mọi **tên frame** dưới đây trùng (hoặc tương ứng) tên trong file Pencil để dev/design tra cửu 1:1.*

**Liên kết hệ thống tài liệu:** [Đặc Tả Tổng Thể Và Cấu Hình Hệ Thống NovaLimo.md](./Đặc%20Tả%20Tổng%20Thể%20Và%20Cấu%20Hình%20Hệ%20Thống%20NovaLimo.md) — ma trận client/API/socket, `EXPO_PUBLIC_API_URL`, quy trình cập nhật đặc tả.

---

## 1. Tổng quan và mục đích

- **Mục tiêu:** App mobile tinh gọn cho tài xế limousine — giảm thao tác khi lái, tập trung vào **phơi lệnh điện tử**, **điều hướng**, **check-in/out**, **hàng ký gửi/COD**, **chat điều hành** và **kết ca**.
- **Nền tảng:** iOS và Android (một codebase).
- **Điểm nổi bật:** Phơi lệnh điện tử theo thứ tự đã chốt; bản đồ/lộ trình; đồng bộ real-time với điều hành; hỗ trợ SOS và quy trình hàng/COD.

---

## 2. Kiến trúc và công nghệ

- **Công nghệ lõi:** **React Native** (hoặc **Expo**) — `apps/app-driver`.
- **Bản đồ:** **Google Maps SDK** (hoặc tương đương) cho hiển thị lộ trình và chỉ đường.
- **Real-time:** **Socket.io** (hoặc WebSocket) cho vị trí, chat, cập nhật trạng thái.
- **Monorepo (Nx):** Dùng chung kiểu dữ liệu từ `libs/shared-types` (`TripRun`, `Booking`, …).

---

## 3. Tệp thiết kế Pencil và vai trò

| Tệp | Nội dung chính |
|-----|----------------|
| **`app-mobile.pen`** | Canvas đầy đủ: **bản đồ luồng màn hình**, toàn bộ màn **NovaLimo Driver · …**, thanh điều hướng 4 tab, thư viện **Permission Dialog**, widget demo (`dashboard-*`). |
| **`app-mobile-chat-shift.pen`** | Canvas mini **NovaLimo Driver · Chat + Kết thúc ca (mini)** — gom hai màn: **Chat nội bộ (Tài xế ↔ Điều hành)** và **Kết thúc ca & Báo cáo** (phiên bản rút gọn/đặt cạnh nhau để xem nhanh). |

Màn **Chat** và **Kết thúc ca** trong hai file là **cùng nghiệp vụ**; `app-mobile-chat-shift.pen` phục vụ trình bày/ghi chú nhanh, `app-mobile.pen` là bộ đầy đủ luồng.

---

## 4. Thành phần thiết kế dùng chung (trong `app-mobile.pen`)

| Tên trong bản vẽ | Mô tả |
|------------------|--------|
| **NovaLimo Driver · Bản đồ luồng màn hình** | Khung **mô tả IA**: thứ tự màn, gợi ý route backend (xem mục 5). Không phải màn người dùng. |
| **Bottom side menu (library)** | Mẫu **thanh dưới 4 tab**: **Chuyến · Hàng · Chat · Ca** (lặp lại trên các màn). |
| **Permission Dialog (library)** | Thư viện popup xin quyền (vị trí, thông báo, camera…). |
| **dashboard-utility**, **dashboard-revenue**, **dashboard-football** | Khối widget minh họa (nếu tái sử dụng trên home/báo cáo). |

---

## 5. Bản đồ luồng màn (trích từ frame *Bản đồ luồng màn hình* trong `app-mobile.pen`)

Wireframe ghi nhận thứ tự và gợi ý đường dẫn API (prototype):

- **Hàng 1:** (1) Đăng nhập → (2) Trang chủ chuyến → (3) Chi tiết chuyến → (4) Điều hướng → (5) Khách/check-in → (6) Báo sự cố/SOS  
- **Hàng 2:** (7) Hàng ký gửi → (8) Chi tiết kiện → (9) Quét QR → (10) COD → (11) Bàn giao hàng → (12) Chat nội bộ  
- **Hàng 3:** (13) Kết thúc ca → (14) Thông báo → (15) Thu nhập → (16) Hồ sơ → (17) Thư viện popup quyền  

**Thanh dưới (4 tab)** — gợi ý route:

- **Chuyến:** `/trips/my-runs`, `/trips/:id`, `/trips/:id/passengers`  
- **Hàng:** `/cargos/my-tasks`, `/cargos/:id`, `/cargos/cod`  
- **Chat:** kênh socket (ví dụ `/driver-chat`)  
- **Ca:** `/driver/shifts/current`, `/driver/shifts/summary`  

*Khi triển khai, có thể điều chỉnh path nhưng nên giữ đúng nhóm chức năng trên.*

---

## 6. Danh mục đầy đủ các màn hình thiết kế (tên frame: `NovaLimo Driver · …`)

| # | Tên frame **chính xác** trong `app-mobile.pen` | Mục đích / ghi chú |
|---|-----------------------------------------------|---------------------|
| 1 | **NovaLimo Driver · Đăng nhập & Bắt đầu ca** | Đăng nhập; khối **Bắt đầu ca** sau khi cấp quyền. |
| 2 | **NovaLimo Driver · Trang chủ (Danh sách chuyến đi)** | Tab **Chờ / Đang chạy / Lịch sử** (theo wireframe); danh sách chuyến dạng thẻ; **bottom nav** 4 tab. |
| 3 | **NovaLimo Driver · Chi tiết chuyến đi & Phơi lệnh** | Phơi lệnh: khách/hàng, thứ tự đón/trả, ghi chú; CTA **Bắt đầu hành trình** (chuyển trạng thái chuyến). |
| 4 | **NovaLimo Driver · Điều hướng & Đón trả (đang lái)** | Nửa trên: bản đồ + lộ trình; nửa dưới: sheet **“Đón tiếp theo”**, chỉ đường, vuốt **đã đón**, **không liên lạc được**; dock 4 tab. |
| 5 | **NovaLimo Driver · Danh sách khách & Check-in** | Danh sách khách theo thứ tự; nút quét/CTA hỗ trợ check-in hàng loạt. |
| 6 | **NovaLimo Driver · Báo sự cố / SOS** | Form báo cáo sự cố + nút **SOS** khẩn cấp + gửi. |
| 7 | **NovaLimo Driver · Quản lý Hàng hóa Ký gửi** | Danh sách kiện trên chuyến; **FAB camera** (quét/ảnh). |
| 8 | **NovaLimo Driver · Chi tiết kiện hàng** | Chi tiết một kiện: trạng thái, điểm nhận/giao, ghi chú. |
| 9 | **NovaLimo Driver · Quét QR / Chứng từ** | Khung camera/quét mã, đèn (torch). |
| 10 | **NovaLimo Driver · COD & Bàn giao tiền** | Danh sách COD, số tiền thu hộ, đối soát/bàn giao. |
| 11 | **NovaLimo Driver · Chuyển/Bàn giao hàng hóa** | Luồng chuyển/bàn giao kiện (trung chuyển, bến…). |
| 12 | **NovaLimo Driver · Chat nội bộ (Tài xế ↔ Điều hành)** | Danh sách tin nhắn + composer; tab **Chat** active. Cùng nội dung với frame tương ứng trong `app-mobile-chat-shift.pen`. |
| 13 | **NovaLimo Driver · Kết thúc ca & Báo cáo** | Tổng hợp ca, checklist trước khi off, nút **Kết thúc ca**, cảnh báo không cập nhật chuyến sau khi off. Trùng nghiệp vụ với **Kết thúc ca & Báo cáo** trong `app-mobile-chat-shift.pen`. |
| 14 | **NovaLimo Driver · Thông báo** | Trung tâm thông báo (điều phối, hệ thống). |
| 15 | **NovaLimo Driver · Thu nhập & Đối soát** | Thu nhập theo ngày/ca, đối soát với hệ thống. |
| 16 | **NovaLimo Driver · Hồ sơ tài xế** | Thông tin tài khoản, xe, cài đặt. |

**Lưu ý:** Màn **Bản đồ luồng màn hình** là **sơ đồ IA**, không tính là màn app cho người dùng cuối.

---

## 7. Thanh điều hướng dưới (4 tab)

Trên hầu hết màn, wireframe dùng cùng một **bottom nav** 4 mục:

1. **Chuyến** — danh sách chuyến, chi tiết, điều hướng, khách.  
2. **Hàng** — ký gửi, chi tiết kiện, quét QR, COD.  
3. **Chat** — kênh với điều hành.  
4. **Ca** — kết thúc ca, thông báo, thu nhập, hồ sơ (tùy IA có thể mở từ đây hoặc từ avatar/menu).

---

## 8. Các tính năng cốt lõi (tóm tắt nghiệp vụ)

**A. Nhận lệnh & phơi lệnh điện tử** — Đồng bộ `trip_run`, danh sách khách/hàng theo `pickup_order` / `dropoff_order`.

**B. Điều hướng & tối ưu lộ trình** — Bản đồ, chỉ đường tới điểm đón/trả; hiển thị **một khách tiếp theo** trên sheet để giảm tải nhận thức.

**C. Check-in / check-out** — Cập nhật trạng thái vé (`PICKED_UP`, `DROPPED_OFF`); đồng bộ socket tới Web Admin.

**D. Hàng ký gửi & COD** — Quản lý kiện, quét QR, COD và bàn giao tiền.

**E. GPS & ca làm việc** — Quyền vị trí cho tracking và logic ca (bắt đầu/kết thúc).

**F. Chat & SOS** — Chat điều hành; báo sự cố và SOS.

---

## 9. Luồng dữ liệu (Data flow)

1. **Lấy chuyến:** `GET` danh sách chuyến của tài xế (ví dụ theo trạng thái).  
2. **Hiển thị manifest:** Backend trả booking đã sắp thứ tự; app render list/map/nav.  
3. **Thực thi:** Chỉ đường → đến điểm → check-in/out → cập nhật API.  
4. **Đồng bộ:** Mỗi thay đổi trạng thái gửi API + (tuỳ chọn) socket để Admin cập nhật realtime.

---

## 10. Quy tắc code tại `apps/app-driver`

- **Type:** Mọi entity (`TripRun`, `Booking`, …) import từ `@limo/shared-types` (hoặc alias Nx tương đương).  
- **UI:** **Không** import `libs/shared-ui` (DOM/Ant Design web). Component mobile viết riêng cho React Native hoặc thư viện RN dùng chung trong monorepo nếu sau này tách `libs/shared-mobile-ui`.  
- **Dependency:** Khai báo tập trung ở `package.json` gốc khi có chính sách monorepo.

---

## 11. Mô tả chi tiết theo từng màn (khớp bản vẽ)

### 11.1. Đăng nhập & Bắt đầu ca (`NovaLimo Driver · Đăng nhập & Bắt đầu ca`)

- Form đăng nhập (SĐT/mật khẩu hoặc theo chuẩn backend).  
- Sau đăng nhập: xin quyền **vị trí** và **thông báo** (tham **Permission Dialog** library).  
- **Bắt đầu ca:** bật gửi GPS định kỳ, ghi nhận ca làm việc.

### 11.2. Trang chủ — Danh sách chuyến (`… Trang chủ (Danh sách chuyến đi)`)

- Tab phân loại: chờ xuất bến / đang chạy / lịch sử.  
- Mỗi chuyến: tuyến, biển số, giờ xuất bến, số khách/kiện. Chạm vào → chi tiết chuyến.

### 11.3. Chi tiết chuyến & phơi lệnh (`… Chi tiết chuyến đi & Phơi lệnh`)

- Danh sách khách/hàng đúng thứ tự thuật toán; ghi chú khách.  
- **Bắt đầu hành trình:** chuyển sang trạng thái đang chạy, mở luồng điều hướng.

### 11.4. Điều hướng & đón trả (`… Điều hướng & Đón trả (đang lái)`)

- Map + polyline; một thẻ **đón tiếp theo** với địa chỉ, **Chỉ đường**, vuốt/xác nhận **đã đón**, **Không liên lạc được**.  
- Sau check-in, chuyển khách tiếp theo.

### 11.5. Danh sách khách & check-in (`… Danh sách khách & Check-in`)

- List view toàn bộ khách chuyến; hỗ trợ thao tác nhanh/ quét nếu nghiệp vụ yêu cầu.

### 11.6. Báo sự cố / SOS (`… Báo sự cố / SOS`)

- Gửi mô tả sự cố; nút **SOS** nổi bật cho tình huống khẩn.

### 11.7. Hàng ký gửi — tổng quan (`… Quản lý Hàng hóa Ký gửi`)

- Danh sách kiện; FAB mở camera/quét.

### 11.8. Chi tiết kiện (`… Chi tiết kiện hàng`)

- Trạng thái nhận/giao, địa điểm, COD liên quan (nếu có).

### 11.9. Quét QR / chứng từ (`… Quét QR / Chứng từ`)

- Full-screen camera, vùng quét, bật đèn.

### 11.10. COD & bàn giao tiền (`… COD & Bàn giao tiền`)

- Tổng hợp tiền mặt/COD cần nộp; xác nhận bàn giao.

### 11.11. Chuyển/bàn giao hàng (`… Chuyển/Bàn giao hàng hóa`)

- Thao tác chuyển kiện sang xe/chuyến khác hoặc bàn giao tại bến.

### 11.12. Chat nội bộ (`… Chat nội bộ (Tài xế ↔ Điều hành)`)

- Hội thoại với điều hành; real-time qua socket. File **`app-mobile-chat-shift.pen`** có cùng màn dạng canvas mini.

### 11.13. Kết thúc ca & báo cáo (`… Kết thúc ca & Báo cáo`)

- Checklist; nút kết ca; cảnh báo hậu quả (không cập nhật chuyến sau khi off). Canvas **`app-mobile-chat-shift.pen`** đặt cạnh **Chat** để review nhanh.

### 11.14. Thông báo (`… Thông báo`)

- Danh sách thông báo hệ thống/điều phối.

### 11.15. Thu nhập & đối soát (`… Thu nhập & Đối soát`)

- Theo ca/ngày; khớp với báo cáo nội bộ.

### 11.16. Hồ sơ tài xế (`… Hồ sơ tài xế`)

- Thông tin cá nhân, phương tiện gán, đăng xuất, cài đặt.

---

## 12. Ghi chú biên tập

- Tài liệu cũ mô tả 7 nhóm màn chung; bản này **mở rộng đúng số màn** trong `app-mobile.pen` (16 màn `NovaLimo Driver · …` + bản đồ luồng + thư viện).  
- **`app-mobile-chat-shift.pen`** không thêm màn mới về nghiệp vụ — chỉ bố cục mini cho **Chat** và **Kết thúc ca**.

---

*Tài liệu căn cứ: `hệ thống quản lý xe limosin/New/app-mobile.pen`, `app-mobile-chat-shift.pen`, và kiến trúc monorepo NovaLimo.*
