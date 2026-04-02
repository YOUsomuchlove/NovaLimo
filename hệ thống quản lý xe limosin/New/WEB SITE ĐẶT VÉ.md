### TÀI LIỆU ĐẶC TẢ PHÂN HỆ: WEB ĐẶT VÉ (WEB BOOKING) - BẢN CẬP NHẬT UI/UX VÀ ANT DESIGN

#### 1. Tổng quan & Kiến trúc Công nghệ

- **Mục tiêu:** Là "mặt tiền" sang trọng của nhà xe NovaLimo, giúp khách hàng tự thao tác tìm kiếm, chọn ghế, đặt vé và thanh toán trực tuyến nhanh chóng, mang lại trải nghiệm mượt mà chuẩn khách VIP.
- **Công nghệ lõi:** **Next.js & React** (hỗ trợ SSR tối ưu SEO cực mạnh).
- **Thư viện UI/UX:** Sử dụng **Ant Design (AntD)** làm thư viện Component chính kết hợp với **Tailwind CSS** để tùy biến giao diện. AntD mang lại sự đồng bộ, chuyên nghiệp, hỗ trợ responsive tốt và cung cấp sẵn các form nhập liệu phức tạp, giúp tiết kiệm thời gian phát triển.
- **Phong cách thiết kế (Visual Style):** Sang trọng, tối giản (Minimalism). Sử dụng tông màu chủ đạo thể hiện sự cao cấp (như Xanh Navy/Đen kết hợp Vàng Gold), các nút bấm (Button) và thẻ (Card) từ AntD sẽ được bo góc mềm mại (border-radius), tạo cảm giác thân thiện và "thích mắt" cho người dùng.

---

#### 2. Cấu trúc các trang (Pages) và Thiết kế Giao diện áp dụng AntD

Để mang lại luồng đặt vé logic, hệ thống chia thành các trang sau với thiết kế cụ thể:

**A. Trang Chủ (Home Page)**

- **Mục đích:** Gây ấn tượng đầu tiên, cung cấp công cụ tìm kiếm vé nhanh và hiển thị các chương trình khuyến mãi.
- **Thiết kế & AntD áp dụng:**
  - **Hero Banner:** Sử dụng `Carousel` của AntD để chạy các hình ảnh xe Limousine nội thất sang trọng.
  - **Hộp tìm kiếm (Search Box):** Đặt nổi bật giữa màn hình. Sử dụng `Select` của AntD (có tính năng search/autocomplete) cho điểm đi/điểm đến, và `DatePicker` của AntD để chọn ngày khởi hành.
  - **Nút Call-to-action:** Nút "Tìm Chuyến" sử dụng `Button` kích thước lớn (size="large"), màu Vàng Gold nổi bật.

**B. Trang Kết quả tìm kiếm & Chọn chuyến (Search Results)**

- **Mục đích:** Liệt kê các chuyến đi phù hợp, hiển thị giá vé, loại xe và thời gian.
- **Thiết kế & AntD áp dụng:**
  - **Bộ lọc (Filters):** Sử dụng `Checkbox` và `Slider` của AntD ở cột bên trái để khách hàng lọc theo giờ chạy, mức giá, hoặc loại xe (9 chỗ, 12 chỗ).
  - **Danh sách chuyến:** Sử dụng `List` hoặc `Card` của AntD. Mỗi Card hiển thị giờ đi - giờ đến, loại xe, và số ghế trống. Khi khách bấm "Chọn chuyến", một khung `Drawer` hoặc giao diện cuộn mượt mà sẽ hiện ra để chọn ghế.

**C. Trang Lựa chọn Sơ đồ ghế (Seat Map Selection)**

- **Mục đích:** Hiển thị sơ đồ ghế đồ họa trực quan, đúng với thực tế của từng dòng xe.
- **Thiết kế & AntD áp dụng:**
  - Giao diện sơ đồ sẽ được custom CSS kết hợp với hệ thống `Grid` (Row, Col) của AntD.
  - **Xe 9 chỗ & 12 chỗ:** Bố trí ghế theo thực tế với 2 ghế đầu, các hàng giữa 2 ghế tách rời, và hàng cuối 3 ghế liền kề.
  - **Xe 19 chỗ & 22 chỗ:** Bố trí theo cấu trúc 2-1 (2 ghế liền kề, 1 ghế đơn có lối đi ở giữa), và hàng ghế cuối có 3 ghế.
  - **Trạng thái ghế:** Ghế trống (màu trắng/xám), Ghế đang chọn (màu Vàng Gold), Ghế đã bán (màu Đỏ, disable nút bấm). Khách click vào sẽ hiện `Tooltip` của AntD báo giá tiền cho vị trí ghế đó (vì ghế VIP sát tài xế hoặc ghế giữa có thể có giá khác nhau).

**D. Trang Nhập thông tin & Chọn điểm đón/trả tận nơi (Passenger Info & Location)**

- **Mục đích:** Thu thập thông tin người đi, người đặt hộ và định vị chính xác điểm đón/trả.
- **Thiết kế & AntD áp dụng:**
  - Sử dụng `Steps` của AntD trên cùng để hiển thị tiến trình (Chọn chuyến -> Chọn ghế -> Thông tin -> Thanh toán).
  - Sử dụng `Form` của AntD với tính năng validate (xác thực) mạnh mẽ (bắt buộc nhập SĐT đúng định dạng).
  - **Tách biệt thông tin:** Chia làm 2 tab (`Tabs` của AntD) cho "Người đi xe" (`passenger_name`, `passenger_phone`) và "Người đặt hộ" (`booker_name`, `booker_phone`).
  - **Bản đồ Số (Google Maps Integration):** Khách hàng nhập địa chỉ qua ô `AutoComplete` của AntD. Hệ thống tự động ghim vị trí lên bản đồ thu nhỏ và lưu tọa độ (Geometry Point Lat/Lng chuẩn PostGIS) vào trường `pickup_location` và `dropoff_location`.

**E. Trang Thanh toán trực tuyến (Checkout & Payment)**

- **Mục đích:** Chốt giao dịch an toàn và nhanh chóng.
- **Thiết kế & AntD áp dụng:**
  - Sử dụng `Radio.Group` kết hợp với thẻ `Card` của AntD để khách chọn phương thức thanh toán: Ví Momo, ZaloPay, VNPay (thẻ nội địa/quốc tế), hoặc Thanh toán tại nhà xe.
  - Hiển thị tóm tắt đơn hàng (Hóa đơn) bên góc phải bằng Component `Descriptions` của AntD để hiển thị rõ ràng: Tên khách, Số ghế, Điểm đón, Tổng tiền.

**F. Trang Quản lý vé cá nhân (User Profile / My Tickets)**

- **Mục đích:** Khách hàng theo dõi vé đã đặt, kiểm tra trạng thái xe.
- **Thiết kế & AntD áp dụng:**
  - Sử dụng `Table` của AntD để liệt kê lịch sử chuyến đi.
  - Sử dụng `Tag` của AntD để hiển thị trạng thái vé cực kỳ trực quan với các màu sắc: Đang chờ xe (Vàng), Đã lên xe (Xanh dương), Đã hoàn thành (Xanh lá), Đã hủy (Đỏ).

---

#### 3. Luồng xử lý Dữ liệu dưới Database (Data Flow)

Sự kết hợp giữa giao diện AntD mượt mà và Database bên dưới diễn ra như sau:

1. **Ghi nhận dữ liệu từ Form (AntD Form -> API):** Khi khách bấm hoàn tất trên giao diện, dữ liệu từ `Form` được gửi về API để tạo bản ghi trong bảng `Bookings`.
2. **Khởi tạo tọa độ thuật toán:** Địa chỉ đón (`pickup_address`) và địa chỉ trả (`dropoff_address`) được lưu cùng tọa độ bản đồ không gian (`pickup_location`, `dropoff_location`).
3. **Gắn rổ chờ:** Vé được gắn ngay vào một `trip_batch_id` (Khung giờ chuyến, ví dụ chuyến 14:00) với trạng thái là `WAITING`. Các trường dữ liệu phân xe (`trip_run_id`), và thứ tự đón trả (`pickup_order`, `dropoff_order`) tạm thời là **NULL** cho đến khi hệ thống Admin kích hoạt thuật toán xếp xe.
4. **Chăm sóc tự động:** Sau khi đặt xong, giao diện hiển thị màn hình Thành công (`Result` component của AntD), đồng thời hệ thống gửi SMS/Zalo kèm link vé điện tử để khách theo dõi vị trí xe.
   



### 5. Cấu trúc Hệ thống & Quy tắc Viết code (Architecture & Coding Conventions)

Để đảm bảo khả năng bảo trì, mở rộng và đồng bộ với toàn bộ hệ sinh thái NovaLimo, phân hệ **Web Đặt vé** tuân thủ nghiêm ngặt các tiêu chuẩn của kiến trúc **Integrated Monorepo** được quản lý bởi **Nx**.

#### 5.1. Cấu trúc thư mục hệ thống (Directory Structure)

Mã nguồn của Web Đặt vé không nằm rời rạc mà được đặt trong cấu trúc thư mục gốc chung của toàn dự án, tuân thủ theo nguyên tắc chia tách **Apps** (Ứng dụng) và **Libs** (Thư viện dùng chung). Cấu trúc cụ thể liên quan đến Web Đặt vé như sau:

- **`apps/web-booking/`**: Nơi chứa mã nguồn chính của ứng dụng Web Đặt vé (sử dụng Next.js & React). Thư mục này chỉ chứa các trang (Pages) điều hướng, xử lý logic gọi API và gắn kết các component.
- **`libs/shared-types/`**: Thư viện chứa các định nghĩa kiểu dữ liệu (Interfaces/Types) của hệ thống (ví dụ: `Booking`, `TripRun`, `Vehicle`).
- **`libs/shared-ui/`**: Thư viện chứa các Component giao diện (đã được tùy biến bằng Ant Design và Tailwind CSS) dùng chung cho cả Web Đặt vé và Web Admin.

#### 5.2. Quy tắc Viết code (Coding Conventions)

Để dự án vận hành trơn tru và không phát sinh nợ kỹ thuật (technical debt), lập trình viên khi code phân hệ Web Đặt vé phải tuân thủ các quy tắc sau:

**A. Quy tắc về Luồng phụ thuộc một chiều (One-way Dependency Flow)**

- Để tránh tình trạng xung đột mã nguồn (circular dependencies), **Web Đặt vé tuyệt đối không được import code trực tiếp từ các app khác** (như `apps/web-admin` hay `apps/api-server`).
- Mọi giao tiếp dữ liệu nội bộ phải thông qua các thư viện nằm trong thư mục `libs/`.

**B. Đảm bảo an toàn kiểu dữ liệu từ đầu đến cuối (End-to-End Type Safety)**

- Mọi dữ liệu trả về từ API hoặc form nhập liệu của khách hàng đều phải sử dụng chung Type/Interface đã khai báo tại `libs/shared-types`.
- Khi import kiểu dữ liệu, bắt buộc sử dụng Alias chuẩn của Nx (ví dụ: `import { Booking } from '@limo/shared-types';`) thay vì sử dụng đường dẫn tương đối (như `../../libs/...`). Nhờ quy tắc này, nếu Backend thay đổi cấu trúc dữ liệu, Web Đặt vé sẽ báo lỗi ngay lúc biên dịch (compile time), ngăn chặn lỗi phát sinh ở môi trường thật.

**C. Nguyên tắc chia sẻ UI Component tối đa (Code Sharing)**

- Nếu một thành phần giao diện (Component) trên Web Đặt vé có khả năng tái sử dụng (Ví dụ: Sơ đồ ghế đồ họa, Form nhập địa chỉ đón trả, Nút bấm chuẩn AntD), lập trình viên **không được viết trực tiếp vào thư mục `apps/web-booking`**.
- Thay vào đó, phải sử dụng công cụ **Nx Generators** (`nx g @nx/react:lib`) để tạo Component này bên trong `libs/shared-ui`. Hệ thống sẽ tự động cập nhật liên kết trong file `tsconfig.base.json`, sau đó Web Đặt vé mới gọi ra sử dụng thông qua cú pháp `import { SeatMap } from '@limo/shared-ui';`.

**D. Quản lý thư viện tập trung (Single Source of Truth)**

- Lập trình viên không được tự ý cài đặt các thư viện npm riêng lẻ (như AntD, Axios, Lodash...) vào bên trong thư mục `apps/web-booking`.
- Tất cả các thư viện ngoại vi đều phải được khai báo và cài đặt chung tại file `package.json` nằm ở thư mục gốc của dự án, nhằm tránh xung đột phiên bản giữa Web Đặt vé, Web Admin và Backend.
