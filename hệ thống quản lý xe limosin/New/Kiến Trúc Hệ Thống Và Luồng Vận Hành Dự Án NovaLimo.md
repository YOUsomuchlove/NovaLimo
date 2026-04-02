### TÀI LIỆU KIẾN TRÚC HỆ THỐNG, CÔNG NGHỆ VÀ LUỒNG LIÊN KẾT DỰ ÁN NOVALIMO

Hệ thống NovaLimo được thiết kế dựa trên kiến trúc **Integrated Monorepo quản lý bởi Nx**, nghĩa là thay vì tách rời thành các kho chứa mã nguồn khác nhau, toàn bộ hệ thống (từ Frontend đến Backend) được đặt trong một thư mục gốc duy nhất 1\. Kiến trúc này giúp đảm bảo **Single Source of Truth (Một nguồn sự thật duy nhất)**, chia sẻ mã nguồn tối đa và phát hiện lỗi ngay lúc biên dịch (End-to-End Type Safety) 1\.  
Dưới đây là chi tiết về cấu trúc, mục đích, công nghệ và cách liên kết của từng ứng dụng trong hệ thống:

#### 1\. Cấu trúc, Mục đích và Công nghệ của từng App

Hệ thống được chia thành 2 phân vùng logic chính: **Apps** (Các ứng dụng chạy độc lập) và **Libs** (Các thư viện dùng chung) 2\.  
**A. Web Đặt vé (Dành cho Khách hàng \- apps/web-booking)**

* **Mục đích:** Cung cấp giao diện web thân thiện trên cả PC và Mobile, cho phép khách hàng tự thao tác đặt chỗ một cách tiện lợi 3\.  
* **Công nghệ sử dụng:** **Next.js & React** 4\.  
* **Vai trò công nghệ:** Hệ sinh thái React giúp xây dựng giao diện người dùng, trong khi Next.js đóng vai trò then chốt trong việc **tối ưu SEO cực mạnh**, giúp khách hàng dễ dàng tìm thấy nhà xe của bạn trên các công cụ tìm kiếm như Google 4\.

**B. Web Admin (Dành cho Điều hành/Quản lý \- apps/web-admin)**

* **Mục đích:** Là trang quản trị trung tâm được thiết kế Responsive, giúp bộ phận điều hành thao tác trực tiếp trên điện thoại, máy tính bảng hoặc PC 3\. Đây là nơi kích hoạt các thuật toán chia xe và quản lý toàn bộ luồng vận hành 5\.  
* **Công nghệ sử dụng:** **Next.js & React** 4\.  
* **Vai trò công nghệ:** React giúp xử lý mượt mà các Dashboard quản trị phức tạp và hỗ trợ các **thao tác kéo thả linh hoạt (Drag & Drop)** khi điều hành viên cần điều chỉnh, đổi khách giữa các xe 4\.

**C. Mobile App (Dành cho Tài xế \- apps/app-driver)**

* **Mục đích:** Ứng dụng di động gọn nhẹ giúp tài xế nhận lệnh chuyến đi, điều hướng lộ trình (đã được sắp xếp thứ tự đón/trả) và báo cáo trạng thái check-in khách hàng 3, 6\.  
* **Công nghệ sử dụng:** **React Native (hoặc Expo)** kết hợp **Google Maps API** 4\.  
* **Vai trò công nghệ:** React Native cho phép sử dụng chung ngôn ngữ lập trình với phần Web, **chỉ cần viết code một lần là xuất ra được cả app cho iOS và Android**, giúp tối ưu chi phí phát triển 4\. Google Maps API được gọi trên app để vẽ bản đồ trực quan và dẫn đường thực tế cho tài xế 4\.

**D. Backend Server & Core Engine (apps/api-server)**

* **Mục đích:** Là "bộ não" của toàn bộ hệ thống, chịu trách nhiệm lưu trữ dữ liệu, xử lý các nghiệp vụ logic và đặc biệt là chạy **thuật toán điều phối thông minh (Smart Dispatching)** để gom nhóm hành khách và vẽ lộ trình tối ưu 4, 7\.  
* **Công nghệ sử dụng:** **Node.js (NestJS/Express)**, **PostgreSQL \+ PostGIS**, **Google OR-Tools** và **OSRM** 4\.  
* **Vai trò công nghệ:**  
* **Node.js:** Chịu tải tốt, tích hợp Socket.io để xử lý tính năng chat real-time và cập nhật vị trí xe theo thời gian thực 4\.  
* **PostgreSQL \+ PostGIS:** Lưu trữ dữ liệu chuẩn xác. Extension **PostGIS là công cụ bắt buộc** để truy vấn các bài toán không gian (như tìm kiếm các khách hàng cách nhau 0.5km chỉ trong vài mili-giây) 4, 8\.  
* **Google OR-Tools & OSRM:** Engine mã nguồn mở chạy trực tiếp trên server để giải quyết bài toán Vehicle Routing Problem (nhét nhiều khách vào nhiều xe) và tính toán khoảng cách đường bộ 4\.

#### 2\. Mối liên kết và Luồng giao tiếp giữa các App

**A. Liên kết ở tầng Mã nguồn (Dependency Flow):**Để tránh xung đột (circular dependencies), các App không bao giờ được import code trực tiếp của nhau 9\. Thay vào đó, chúng giao tiếp qua các **Libs (Thư viện dùng chung)**:

* **libs/shared-types:** Nằm ở tầng thấp nhất, chứa định nghĩa cấu trúc dữ liệu. Cả Backend (api-server), Web (Admin, Booking) và App Tài xế đều gọi chung thư viện này. Nếu Backend đổi cấu trúc API, toàn bộ các App khác sẽ báo lỗi ngay lập tức 9, 10\.  
* **libs/shared-ui:** Chứa các Component giao diện (như nút bấm, bản đồ hiển thị) dùng chung cho Web Admin và Web Booking 9, 11\.

**B. Liên kết ở tầng Nghiệp vụ (Luồng Dữ liệu thực tế):**Toàn bộ các App liên kết khép kín thông qua một vòng đời chuyến đi như sau:

1. **Ghi nhận dữ liệu (Web Booking \-\> API Server):** Khách hàng đặt vé trên Web Booking. Thông tin tạo thành một bản ghi trong Database thông qua API Server (được gắn vào một "Khung giờ \- Trip\_Batch" nhưng chưa được phân vào xe cụ thể) 5\.  
2. **Kích hoạt điều phối (Web Admin \-\> API Server):** Trước giờ chạy, Điều hành viên bấm nút "Xếp xe" trên Web Admin 5\.  
3. **Bộ não xử lý (API Server):** Backend dùng **PostGIS** để gom các khách hàng gần nhau (gom cụm). Sau đó, dùng **OR-Tools** phân bổ 30 khách vào 3 xe (Trip\_Runs) và cập nhật thứ tự đón trả (pickup\_order) theo đường đi ngắn nhất 5\.  
4. **Thực thi lệnh (API Server \-\> App Tài xế):** App Tài xế gọi API lấy danh sách chuyến đi (GET /trips/my-runs). Dữ liệu đổ về App Tài xế đã được sắp xếp sẵn thứ tự đón khách một cách tối ưu nhất. Tài xế chỉ việc mở App, nhìn danh sách từ trên xuống dưới và sử dụng Google Maps tích hợp để lái xe đi đón 5\.

