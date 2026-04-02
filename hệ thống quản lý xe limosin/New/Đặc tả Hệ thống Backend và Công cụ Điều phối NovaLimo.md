Dưới đây là tài liệu đặc tả kỹ thuật và nghiệp vụ chi tiết dành riêng cho phân hệ **Backend Server & Core Engine (apps/api-server)**. Đây là "bộ não" quyền lực nhất của toàn bộ hệ thống NovaLimo, chịu trách nhiệm lưu trữ dữ liệu, xử lý logic thời gian thực và vận hành các thuật toán lõi phức tạp nhất.

### TÀI LIỆU ĐẶC TẢ PHÂN HỆ: BACKEND SERVER & CORE ENGINE

#### 1\. Tổng quan & Vai trò

* **Mục tiêu:** Đóng vai trò là máy chủ trung tâm xử lý mọi yêu cầu (API requests) từ Web Đặt vé, Web Admin và App Tài xế. Đặc biệt, Backend đảm nhận trọng trách chạy thuật toán điều phối thông minh (Smart Dispatching) để giải quyết bài toán định tuyến xe (Vehicle Routing Problem \- VRP) 1, 2\.  
* **Vị trí trong Monorepo:** Nằm tại thư mục apps/api-server, tuân thủ luồng phụ thuộc một chiều, chỉ import các định nghĩa kiểu dữ liệu từ libs/shared-types để đảm bảo đồng bộ chặt chẽ với Frontend 3, 4\.

#### 2\. Kiến trúc Công nghệ Lõi (Tech Stack)

Hệ thống được thiết kế để chịu tải cao và xử lý các bài toán không gian địa lý với tốc độ mili-giây:

* **Framework:** **Node.js (NestJS hoặc Express)**. NestJS được ưu tiên để xây dựng cấu trúc code theo hướng module, chịu tải tốt và dễ bảo trì 2\.  
* **Database:** **PostgreSQL kết hợp extension PostGIS**. PostGIS là công cụ bắt buộc để xử lý, lưu trữ tọa độ không gian (Geometry Point) và truy vấn bán kính khoảng cách cực nhanh 2, 5\.  
* **Engine Thuật toán (Bộ não điều phối):**  
* **Google OR-Tools:** Công cụ mã nguồn mở được tích hợp trực tiếp trên server để giải quyết bài toán nhét hành khách vào các xe (Ví dụ: 30 khách vào 3 xe) 2, 6\.  
* **OSRM (Open Source Routing Machine):** Dùng để tính toán khoảng cách thực tế trên đường bộ trên server một cách miễn phí, thay vì gọi Google Maps API liên tục gây tốn kém 2\.  
* **Giao tiếp Thời gian thực (Real-time):** Tích hợp **Socket.io** để xử lý tính năng chat trực tiếp, cập nhật vị trí xe (GPS tracking) và đồng bộ trạng thái ghế ngồi tức thì 2, 7\.

#### 3\. Thiết kế Cơ sở Dữ liệu (Database Architecture \- ERD)

Cơ sở dữ liệu được thiết kế tối ưu, chia bài toán phân xe thành 2 cấp độ: **Khung giờ (Trip\_Batches)** chứa tổng khách, và **Chuyến xe thực tế (Trip\_Runs)** chứa khách đã phân bổ 8\.

* **Vehicles (Quản lý Xe):** Lưu trữ biển số xe (VD: 29B-12345), sức chứa (VD: 10 chỗ), và trạng thái (Sẵn sàng, Đang chạy, Bảo dưỡng) 8\.  
* **Users (Nhân sự):** Quản lý tài khoản, mật khẩu, phân quyền (ADMIN, DRIVER) cho điều hành viên và tài xế 8\.  
* **Trip\_Batches (Khung giờ khởi hành):** Đóng vai trò là "cái rổ" tổng chứa toàn bộ hành khách (ví dụ 30 khách) đặt vé trong cùng một khung giờ (VD: chuyến 14:00) với các trạng thái: Đang nhận khách (OPEN), Đã chia xe (CLUSTERED) 9\.  
* **Trip\_Runs (Chuyến xe thực tế):** Sinh ra sau khi thuật toán chạy. Ví dụ 1 Trip\_Batch sinh ra 3 Trip\_Runs. Chứa thông tin xe nào, tài xế nào phụ trách, trạng thái chuyến (PENDING, IN\_PROGRESS, FINISHED) 9\.  
* **Bookings (Vé / Hành khách \- Bảng quan trọng nhất):** Lưu thông tin khách hàng, người đặt hộ 5\. Đặc biệt, lưu tọa độ đón/trả dưới dạng Geometry Point chuẩn PostGIS (pickup\_location, dropoff\_location) 5\. Các trường trip\_run\_id, pickup\_order (Thứ tự đón), và dropoff\_order (Thứ tự trả) sẽ được cập nhật *sau khi* thuật toán chạy 5\.  
* **Cargos (Hàng hóa ký gửi):** Được xử lý như một "hành khách ảo" chiếm diện tích nhưng không cần ghế, có tọa độ giao nhận và mã vận đơn 10, 11\.

#### 4\. Luồng xử lý Thuật toán Điều phối (Algorithm Workflow)

Khi Điều hành viên bấm nút "Xếp xe" trên Web Admin (trước giờ chạy khoảng 1 tiếng), Backend sẽ kích hoạt luồng xử lý sau 12:

1. **Gom cụm điểm đón/trả (K-Means Clustering):** Backend dùng câu lệnh PostGIS (như SELECT \* FROM Bookings WHERE ST\_DWithin(pickup\_location, ...)) để gom các khách hàng có vị trí đón gần nhau (ví dụ bán kính 0.5km) vào chung một cụm 6, 12\. Việc này cũng đối chiếu với điểm trả để tránh xe chạy phân tán khi xuống cao tốc 6\.  
2. **Khởi tạo xe:** Backend tạo ra các bản ghi mới trong bảng Trip\_Runs tương ứng với số xe cần thiết (VD: tạo 3 xe) 12\.  
3. **Vẽ lộ trình tối ưu (Routing & TSP):** Hệ thống dùng **Google OR-Tools** và **OSRM** để tính toán đường đi ngắn nhất, sắp xếp thứ tự đón khép kín (không chạy lòng vòng) 2, 6\.  
4. **Cập nhật Database:** Backend tự động update bảng Bookings, gắn nhóm khách vào trip\_run\_id tương ứng và điền số pickup\_order (từ 1 đến 10\) cùng dropoff\_order 12\.  
5. **Xử lý ngoại lệ:** Nếu số lượng khách vượt quá sức chứa (VD: khách thứ 31, 32), hệ thống ném ra cảnh báo (Exception) đẩy lên Web Admin để con người can thiệp (kéo thả đổi xe) 6\.

#### 5\. API Response & Phục vụ Frontend

Nhờ thiết kế DB chuẩn mực, khi App Tài xế gọi API lấy danh sách chuyến (VD: GET /trips/my-runs?status=PENDING), Backend chỉ việc query JOIN bảng Trip\_Runs với Bookings và ORDER BY pickup\_order ASC 12\. Dữ liệu JSON trả về cho App và Web đã được "dọn cỗ" sẵn, giúp Frontend render cực kỳ mượt mà mà không phải xử lý logic phức tạp 12, 13\.  
Quy tắc bất di bất dịch trong quá trình code tại thư mục này là luôn phải import các Interface (như Booking, TripRun) từ thư viện @limo/shared-types để nếu Backend đổi cấu trúc JSON trả về, toàn bộ Frontend sẽ báo lỗi ngay lập tức 4, 14\.  
Hệ thống API Server này được thiết kế để loại bỏ hoàn toàn sự dư thừa dữ liệu, tận dụng tối đa sức mạnh của hệ quản trị cơ sở dữ liệu không gian và biến một bài toán logistics phức tạp thành các thao tác trơn tru cho nhà xe 13, 15\.  
