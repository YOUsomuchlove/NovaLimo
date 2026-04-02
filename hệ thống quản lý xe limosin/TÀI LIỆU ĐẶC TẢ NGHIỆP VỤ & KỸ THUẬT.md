# TÀI LIỆU ĐẶC TẢ NGHIỆP VỤ & KỸ THUẬT: HỆ THỐNG ĐIỀU PHỐI LIMOUSINE THÔNG MINH

## 1. Tổng quan dự án (Project Overview)

Hệ thống quản lý và điều phối vận tải chuyên biệt dành cho các doanh nghiệp xe Limousine quy mô tầm trung. Điểm bán hàng độc nhất (USP) của hệ thống là khả năng **tự động phân bổ hành khách** vào các xe dựa trên thuật toán tối ưu lộ trình (Vehicle Routing Problem) và gom nhóm không gian (Spatial Clustering), đảm bảo nguyên tắc **đón trả tận nơi, không sang chuyển xe**, giúp nhà xe tiết kiệm chi phí nhiên liệu và nâng cao trải nghiệm khách hàng VIP.

![software system architecture diagram, do AI tạo](https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcSliZuKQT8yLGtWFfTUmyjAB2Spl99YN7oeuxnOn-0Nb4yDmMQ5yIQRd2-cyrJLHPbyOMYjAz0Ej8I7E6YRAm74qwtHF3Ke5rQ2F3uQmW0kAGYI9lo)

Shutterstock

## 2. Cấu trúc Nền tảng (System Components)

Hệ thống được thiết kế tinh gọn để giảm thiểu chi phí triển khai ban đầu cho doanh nghiệp, bao gồm 3 phân hệ chính:

- **Website Đặt vé (Dành cho Khách hàng):** Giao diện web thân thiện trên cả PC và Mobile, cho phép khách hàng tự thao tác đặt chỗ.

- **Web Admin (Dành cho Điều hành/Quản lý):** Trang quản trị trung tâm, thiết kế Responsive để quản lý có thể thao tác ngay trên điện thoại hoặc máy tính bảng mà không cần tải App riêng.

- **Mobile App (Dành cho Tài xế):** Ứng dụng di động gọn nhẹ giúp tài xế nhận lệnh, điều hướng và báo cáo trạng thái.

## 3. Chi tiết Yêu cầu Nghiệp vụ (Business Requirements)

### 3.1. Phân hệ Quản lý cốt lõi (Core Management)

- **Quản lý Khách hàng:** Lưu trữ thông tin chi tiết (Họ tên, SĐT hành khách, SĐT/Tên người đặt hộ, Địa chỉ đón, Địa chỉ trả, Ghi chú đặc biệt).

- **Quản lý Đội xe & Năng lực:** Khai báo danh sách xe, biển số, loại xe (ví dụ: Limousine 9 chỗ, 11 chỗ).

- **Quản lý Chuyến & Tuyến:** Thiết lập các tuyến cố định (VD: Hà Nội - Quảng Ninh) và khung giờ khởi hành.

- **Quản lý Hàng hóa (Ký gửi):** Xử lý hàng hóa như một "hành khách ảo" có điểm nhận, điểm giao và mã vận đơn.

- **Quản trị Doanh thu:** Báo cáo tổng thể tiền vé, chi phí phát sinh và lương tài xế.

### 3.2. Nghiệp vụ Điều phối Thông minh (Smart Dispatching) - USP của hệ thống

Hệ thống phải tự động giải quyết bài toán ví dụ: Có 30 khách đặt vé trong cùng một khung giờ, cần phân bổ vào 3 xe (10 chỗ/xe) sao cho lộ trình tối ưu nhất.

- **Bước 1: Gom cụm điểm đón/trả (K-Means Clustering):** * Nhóm các khách hàng có vị trí đón gần nhau (bán kính ~0.5km) hoặc chung khu vực địa lý vào cùng một xe (VD: Xe 1 phụ trách nhóm Cầu Giấy, Xe 2 phụ trách nhóm Hoàn Kiếm).
  
  - Đồng thời phân tích đối chiếu với điểm trả để tránh tình trạng xe đi gom khách một nhóm nhưng lại phải chạy phân tán lúc trả.

- **Bước 2: Vẽ lộ trình tối ưu (Routing & TSP):**
  
  - Sắp xếp thứ tự đón khép kín không chạy lòng vòng (Bãi đỗ -> Khách 1 -> Khách 2 -> ... -> Cao tốc).
  
  - Sắp xếp thứ tự trả khép kín (Xuống cao tốc -> Trả 1 -> Trả 2 -> ...).

- **Bước 3: Xử lý ngoại lệ:** Nếu có khách số 31, 32 (vượt sức chứa), hệ thống cảnh báo lên Web Admin để điều hành viên ra quyết định (điều thêm xe nhỏ, chuyển giờ hoặc ghép tuyến).

### 3.3. Nghiệp vụ App Tài xế

- **Chấm công & Trạng thái:** Ghi nhận giờ bắt đầu/kết thúc ca làm qua GPS.

- **Nhận chuyến:** Nhận thông tin chuyến đi đã được hệ thống chốt thứ tự đón/trả.

- **Điều hướng:** Tích hợp gọi Google Maps API để dẫn đường chi tiết từ điểm A đến điểm B dựa trên lộ trình đã được sắp xếp.

- **Cập nhật hành trình:** Check-in khách lên xe, xác nhận đã trả khách/hàng hóa.

- **Giao tiếp:** Chat trực tiếp với bộ phận điều hành (Real-time).

---

## 4. Kiến trúc Kỹ thuật (Tech Stack Recommendations)

Để đảm bảo hệ thống vừa thông minh, tốc độ cao, lại vừa dễ dàng bảo trì và mở rộng, Stack công nghệ dưới đây là lựa chọn tối ưu nhất:

- **Frontend (Web Đặt vé & Web Admin): Next.js & React**
  
  - Sử dụng hệ sinh thái React làm cốt lõi. Next.js sẽ giúp trang Web Đặt vé tối ưu SEO cực mạnh (khách dễ tìm thấy nhà xe trên Google).
  
  - Web Admin dùng React để xử lý mượt mà các Dashboard phức tạp, thao tác kéo thả (Drag & Drop) khi điều hành viên muốn đổi khách giữa các xe.

- **Mobile App (Tài xế): React Native (hoặc Expo)**
  
  - Cho phép dùng chung ngôn ngữ và tư duy với phần Web. Chỉ cần viết code một lần là xuất ra được cả app iOS và Android, tối ưu chi phí phát triển.

- **Backend: Node.js (NestJS/Express)**
  
  - Chịu tải tốt, dễ dàng tích hợp **Socket.io** để xử lý tính năng Chat real-time và cập nhật vị trí xe theo thời gian thực trên bản đồ của Admin.

- **Cơ sở dữ liệu: PostgreSQL + PostGIS**
  
  - PostgreSQL cho dữ liệu cấu trúc chuẩn xác. Extension **PostGIS** là bắt buộc để truy vấn các bài toán không gian (tìm khách hàng cách nhau 0.5km trong vài mili-giây).

- **Engine Thuật toán (Bộ não điều phối):**
  
  - Sử dụng **Google OR-Tools** (Mã nguồn mở, miễn phí) tích hợp trên Backend để giải quyết bài toán nhét 30 khách vào 3 xe (VRP).
  
  - Sử dụng **OSRM** để tính toán khoảng cách thực tế trên đường bộ trên server (miễn phí), và chỉ dùng **Google Maps API** trên App Tài xế để vẽ bản đồ trực quan (tiết kiệm chi phí API).


