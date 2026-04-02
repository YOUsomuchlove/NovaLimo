Dưới đây là tài liệu đặc tả nghiệp vụ và kỹ thuật chi tiết dành riêng cho phân hệ **Web Admin (Web Quản trị/Điều hành \- apps/web-admin)**. Đây được xem là "bộ não" của toàn bộ hệ thống NovaLimo, nơi các nhân viên điều hành trực tiếp giám sát và kích hoạt các thuật toán thông minh.

### TÀI LIỆU ĐẶC TẢ PHÂN HỆ: WEB ADMIN (QUẢN TRỊ & ĐIỀU HÀNH)

#### 1\. Tổng quan & Kiến trúc Công nghệ

* **Mục tiêu:** Là trung tâm điều khiển (Control Panel) cho phép bộ phận điều hành quản lý toàn bộ vòng đời chuyến đi, giám sát đội xe/tài xế thời gian thực, quản lý doanh thu và đặc biệt là xử lý linh hoạt việc chia xe, ghép chuyến 1, 2\.  
* **Nền tảng & Thiết kế:** Giao diện Responsive hoạt động mượt mà trên cả PC và máy tính bảng (Tablet), giúp điều hành viên có thể thao tác ngay cả khi đang di chuyển mà không cần tải App riêng 2\.  
* **Công nghệ lõi:** Sử dụng **Next.js & React** nằm trong thư mục apps/web-admin 3\.  
* **Thư viện UI/UX:** Tương tự Web Đặt vé, Web Admin tiếp tục sử dụng **Ant Design (AntD)** kết hợp với Tailwind CSS (lấy từ libs/shared-ui). Ngoài ra, tích hợp thêm các thư viện hỗ trợ thao tác **Kéo thả (Drag & Drop)** chuyên sâu (như dnd-kit hoặc react-beautiful-dnd) để xử lý tác vụ chuyển khách giữa các xe 3, 4\.  
* **Giao tiếp Dữ liệu:** Đồng bộ định nghĩa dữ liệu chặt chẽ từ libs/shared-types (như bảng Trip\_Batches, Trip\_Runs, Bookings) để đảm bảo End-to-End Type Safety 5-7.

#### 2\. Cấu trúc các Trang (Pages) và Tính năng Cốt lõi

**A. Trang Bảng điều khiển (Dashboard & Analytics)**

* **Mục đích:** Cung cấp cái nhìn toàn cảnh về tình hình kinh doanh và vận hành trong ngày.  
* **Thiết kế (AntD):** Sử dụng Card và Statistic để hiển thị các con số tổng quan: Tổng doanh thu, Số vé đã bán, Tỷ lệ lấp đầy ghế, Số xe đang chạy 8\. Tích hợp biểu đồ (Charts) để phân tích doanh thu, chi phí phát sinh và lương tài xế 8\.

**B. Trang Quản lý Đội xe & Tài xế (Fleet & Driver Management)**

* **Mục đích:** Khai báo năng lực vận tải của nhà xe.  
* **Tính năng:**  
* Quản lý danh sách xe (Vehicles): Thêm biển số, loại xe (Limousine 9 chỗ, 11 chỗ, v.v.), sức chứa, và trạng thái (Sẵn sàng, Đang bảo dưỡng, Đang chạy) 8, 9\.  
* Quản lý nhân sự (Users): Tạo tài khoản cho tài xế, cấp quyền truy cập Mobile App, theo dõi trạng thái hoạt động 9\.  
* **Thiết kế (AntD):** Dùng Table kết hợp Modal để thêm/sửa thông tin.

**C. Trang Giám sát Hành trình (Live Tracking & GPS)**

* **Mục đích:** Theo dõi vị trí đội xe theo thời gian thực trên bản đồ số.  
* **Tính năng:** Thông qua **Socket.io** tích hợp với Backend, trang này hiển thị icon các xe đang di chuyển trên bản đồ 3, 10\. Điều hành viên có thể click vào từng xe để xem vận tốc, tài xế đang lái, và tiến độ đón/trả khách 10\.

**D. Trang Quản lý Đơn hàng & Hàng hóa (Bookings & Cargos)**

* **Mục đích:** Tra cứu, hỗ trợ tạo vé thủ công (cho khách gọi tổng đài) và quản lý ký gửi.  
* **Tính năng:**  
* Lưu trữ thông tin vé: Họ tên, SĐT hành khách, người đặt hộ, địa chỉ đón/trả tận nơi, tọa độ PostGIS (pickup\_location, dropoff\_location) 7, 8\.  
* Quản lý Hàng hóa: Xử lý hàng hóa như một "hành khách ảo" có mã vận đơn, điểm nhận/giao nhưng không chiếm ghế ngồi 8, 11\.

**E. TRANG ĐIỀU PHỐI THÔNG MINH (SMART DISPATCHING) \- TÍNH NĂNG QUAN TRỌNG NHẤT**

* **Mục đích:** Kích hoạt thuật toán AI (OR-Tools) và xử lý ngoại lệ trước giờ xe xuất bến. Trang này giải quyết bài toán cốt lõi: Chia 30 khách vào 3 xe nhỏ sao cho tối ưu 3, 4\.  
* **Thiết kế & Hoạt động:**  
* **Giao diện "Rổ chờ" (Trip\_Batches):** Sử dụng Component Tabs của AntD để hiển thị các khung giờ (VD: Chuyến 14:00) với danh sách toàn bộ khách đang chờ xếp xe 6, 12\.  
* **Nút "Xếp Xe Tự Động":** Khi click, hệ thống gọi API xuống Backend. Backend dùng **PostGIS** để gom các khách gần nhau (bán kính 0.5km), sau đó dùng **OR-Tools** vẽ lộ trình khép kín không chạy lòng vòng và sinh ra các xe thực tế (Trip\_Runs) 3, 4, 12\.  
* **Giao diện Kéo thả linh hoạt (Drag & Drop):** Sau khi thuật toán chia xong, hệ thống hiển thị danh sách các xe (Card 1, Card 2, Card 3). Nếu có khách thứ 31 (vượt sức chứa) hoặc khách yêu cầu đổi xe, hệ thống báo đỏ 4\. Điều hành viên có thể dùng chuột **kéo (drag) khách từ xe này thả (drop) sang xe khác**, hoặc điều thêm xe trung chuyển cực kỳ trực quan 1, 3, 4\.  
* **Chốt lệnh:** Sau khi rà soát, Điều hành viên bấm "Xuất Lệnh", toàn bộ thứ tự đón (pickup\_order) và trả (dropoff\_order) sẽ được chốt cứng và đẩy thẳng xuống Mobile App của tài xế 7, 12\.

#### 3\. Luồng Giao tiếp Dữ liệu (Workflow) trên Web Admin

1. **Hiển thị dữ liệu:** Web Admin gọi API lấy danh sách từ bảng Bookings theo từng trip\_batch\_id (Khung giờ) đang ở trạng thái OPEN 6, 7\.  
2. **Chạy thuật toán:** Khi bấm "Xếp xe", Backend trả về kết quả là các Trip\_Runs (Chuyến xe thực tế) kèm danh sách khách đã được gán trip\_run\_id và thứ tự đón/trả tối ưu 6, 7, 12\.  
3. **Xử lý State React:** Giao diện Kéo Thả (Drag & Drop) nhận dữ liệu JSON này, lưu vào State nội bộ. Khi nhân viên kéo thả đổi khách, State cập nhật theo thời gian thực.  
4. **Cập nhật Database:** Khi bấm "Xuất Lệnh", Web Admin gửi lại mảng dữ liệu mới nhất xuống Backend để lưu chính thức vào bảng Bookings (thay đổi trip\_run\_id tương ứng) và đổi trạng thái chuyến thành IN\_PROGRESS 6, 7, 12\.

#### 4\. Quy tắc Code & Vận hành tại thư mục apps/web-admin

* **Import thư viện:** Mọi Component UI phức tạp (như bảng điều khiển bản đồ, nút bấm chuẩn, form tạo vé) đều phải được tạo bằng Nx Generators trong libs/shared-ui và import vào Web Admin, tuyệt đối không code cứng (hardcode) trực tiếp tại Web Admin để đảm bảo Web Booking cũng có thể tái sử dụng 5, 13, 14\.  
* **Quản lý Type:** Import toàn bộ kiểu dữ liệu (Interfaces/Types) như Booking, TripRun, Vehicle từ alias @limo/shared-types 15\. Nếu Backend thêm trường dữ liệu (ví dụ thêm thuộc tính fuel\_cost cho xe), Frontend sẽ được báo lỗi ngay lúc code nếu chưa cập nhật.

Bạn có muốn tôi phác thảo thử cấu trúc một file JSON Payload (dữ liệu mẫu trả về từ API) cho phần "Xếp xe tự động" để hình dung rõ cách dữ liệu đẩy lên trang Web Admin phục vụ tính năng Kéo thả (Drag & Drop) không?  
