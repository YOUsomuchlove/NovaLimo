### TÀI LIỆU ĐẶC TẢ PHÂN HỆ: MOBILE APP (DÀNH CHO TÀI XẾ)

#### 1. Tổng quan & Mục đích

- **Mục tiêu:** Ứng dụng di động được thiết kế tinh gọn dành riêng cho tài xế xe Limousine. Đối với mô hình xe khách chất lượng cao, tài xế thường phải kiêm luôn công việc của phụ xe, do đó ứng dụng giúp họ không bị phân tâm bởi việc tìm đường hay gọi điện thoại liên tục cho khách, từ đó nâng cao tính an toàn khi lái xe.
- **Nền tảng:** Hoạt động mượt mà trên cả hai hệ điều hành iOS và Android.
- **Điểm nổi bật:** Cung cấp "Phơi lệnh điện tử" tự động, dẫn đường tối ưu và giúp tài xế cùng hành khách "nhìn thấy nhau" trên bản đồ, loại bỏ sự lúng túng khi tìm điểm đón.

#### 2. Kiến trúc & Công nghệ nền tảng

- **Công nghệ lõi:** Sử dụng **React Native (hoặc Expo)**. Việc này cho phép dùng chung ngôn ngữ và tư duy với các phân hệ Web, tối ưu chi phí phát triển vì chỉ cần viết code một lần là có thể xuất ra app cho cả iOS và Android.
- **Tích hợp Bản đồ số:** Ứng dụng sử dụng **Google Maps API** trực tiếp trên thiết bị di động để vẽ bản đồ trực quan và dẫn đường chi tiết từ điểm A đến điểm B.
- **Giao tiếp Real-time:** Sử dụng **Socket.io** để kết nối trực tiếp với Backend, hỗ trợ tính năng nhắn tin thời gian thực với bộ phận điều hành.
- **Kiến trúc Monorepo (Nx):** Mã nguồn nằm tại thư mục `apps/app-driver` và kế thừa các cấu trúc dữ liệu chuẩn hóa từ thư viện `libs/shared-types` (như định nghĩa `TripRun`, `Booking`).

#### 3. Các tính năng cốt lõi (Core Features)

**A. Nhận lệnh & Phơi lệnh điện tử**

- Thay vì dùng phơi giấy dễ sai sót, tài xế mở App để nhận danh sách chuyến đi (Trip Runs) đã được chốt và tự động sắp xếp bởi hệ thống cốt lõi.
- Phơi lệnh điện tử này giúp đảm bảo tuyệt đối không có sự gian lận trong quá trình đón trả khách và kiểm soát doanh thu.
- Tài xế có thể xem trước toàn bộ danh sách khách hàng, bao gồm: tên khách, điểm lên xe, điểm xuống xe theo thứ tự tối ưu nhất.

**B. Điều hướng thông minh & Tối ưu lộ trình (Smart Navigation)**

- Dựa trên danh sách đã được sắp xếp từ thuật toán, App kết hợp với Google Maps để vẽ cung đường di chuyển khép kín tối ưu nhất, giúp giảm chi phí tiền xăng cho nhà xe.
- Tài xế có thể nhìn thấy vị trí chính xác của hành khách trên bản đồ để đón kịp thời, đúng giờ mà không cần gọi điện thoại hỏi đường.

**C. Cập nhật trạng thái hành trình (Check-in / Check-out)**

- Khi xe đến điểm đón, tài xế thao tác "Check-in" xác nhận khách đã lên xe (trạng thái vé chuyển sang `PICKED_UP`).
- Khi đến điểm trả, tài xế thao tác trả khách (trạng thái vé chuyển sang `DROPPED_OFF`). Điều này giúp người quản lý ở văn phòng nắm bắt tức thì tình trạng số ghế trống và doanh thu ngay khi xe đang chạy.
- Tương tự với Hàng hóa ký gửi, tài xế cập nhật trạng thái "Đã nhận" hoặc "Đã giao" hàng hóa và quản lý số tiền thu hộ (COD) thông qua mã vận đơn hoặc quét QR code.

**D. Chấm công & Giám sát GPS**

- App yêu cầu quyền truy cập GPS để tự động ghi nhận giờ bắt đầu và kết thúc ca làm việc của tài xế dựa trên vị trí địa lý.
- Dữ liệu định vị sẽ được gửi về máy chủ liên tục để Web Admin vẽ vị trí xe thời gian thực trên bản đồ, tăng cường an ninh, an toàn và giám sát xe có chạy sai tuyến hay không.

**E. Giao tiếp nội bộ (Real-time Communication)**

- Hệ thống cung cấp tính năng chat trực tiếp giữa tài xế và bộ phận điều hành giúp xử lý nhanh các tình huống khẩn cấp, tắc đường hoặc xe gặp sự cố.

#### 4. Luồng xử lý Dữ liệu trên App (Data Flow)

Luồng dữ liệu khi tài xế sử dụng App diễn ra theo trình tự cực kỳ chặt chẽ:

1. **Lấy danh sách chuyến:** App Tài xế gọi API `GET /trips/my-runs?status=PENDING` gửi lên Backend.
2. **Hiển thị dữ liệu sắp xếp sẵn:** Backend trả về danh sách khách hàng (đã được thuật toán POSTGIS và OR-Tools phân bổ). Danh sách này được trả về kèm theo tham số `pickup_order` (Thứ tự đón) và `dropoff_order` (Thứ tự trả) được sắp xếp sẵn từ nhỏ đến lớn (ASC).
3. **Thực thi:** Tài xế không cần suy nghĩ đường đi, chỉ việc nhìn danh sách hiển thị từ trên xuống dưới và bấm nút "Dẫn đường" cho khách hàng đầu tiên.
4. **Đồng bộ State:** Mỗi khi tài xế bấm Check-in, App gọi API cập nhật trạng thái `status` của bản ghi trong bảng `Bookings` ở Database, đồng thời bắn sự kiện qua Socket.io để Web Admin tự động cập nhật màu sắc ghế trên giao diện quản lý.

#### 5. Quy tắc Code đặc thù tại `apps/app-driver`

Khi lập trình viên thao tác trên mã nguồn của App Tài xế, cần tuân thủ nghiêm ngặt quy tắc kiến trúc Monorepo Nx:

- **Chia sẻ Type (Type Safety):** Toàn bộ kiểu dữ liệu (như `TripRun`, `Booking`) bắt buộc phải import từ `@limo/shared-types`. Nhờ đó, nếu Backend thay đổi cấu trúc dữ liệu trả về, App Tài xế sẽ báo lỗi biên dịch (compile error) ngay lập tức.
- **Tuyệt đối KHÔNG dùng chung UI Web:** Khác với Web Admin và Web Booking dùng chung `libs/shared-ui`, **App Tài xế không được phép import thư viện này**. Nguyên nhân là do React Native sử dụng các thẻ UI riêng biệt (như `<View>`, `<Text>`) khác hoàn toàn với DOM của Web (như `<div>`, `<span>`). Các UI Component của App Tài xế phải được viết riêng hoặc tạo một thư viện UI thuần React Native mới nếu cần.

Bộ tài liệu này định nghĩa rõ ràng vai trò của ứng dụng dành cho tài xế, vừa đóng vai trò như thiết bị điều hướng (Navigation), vừa là thiết bị báo cáo thời gian thực, là mảnh ghép cuối cùng để toàn bộ hệ thống điều phối thông minh NovaLimo vận hành trơn tru.

---

### MÔ TẢ CHI TIẾT CÁC TRANG VÀ THAO TÁC SỬ DỤNG TRONG APP TÀI XẾ

#### 1. Trang Đăng nhập & Bắt đầu ca làm việc (Login & Check-in Shift)

- **Giao diện hiển thị:**
  - Màn hình đăng nhập bằng Số điện thoại và Mật khẩu (đã được cấp trên Web Admin).
  - Nút bấm lớn: **"Bắt đầu ca làm việc"**.
- **Thao tác sử dụng:**
  1. Tài xế mở app, tiến hành đăng nhập.
  2. App sẽ yêu cầu cấp quyền **Truy cập Vị trí (Location)** và **Thông báo (Notification)**. Đây là điều kiện bắt buộc để hệ thống giám sát GPS.
  3. Tài xế bấm nút "Bắt đầu ca làm việc". Lúc này, GPS bắt đầu ghi nhận và gửi tín hiệu định vị liên tục về trung tâm điều hành, đồng thời ghi nhận giờ chấm công của tài xế.

#### 2. Trang chủ: Danh sách Chuyến đi (My Trips)

- **Giao diện hiển thị:**
  - Sử dụng dạng Tab phân loại: **Chờ xuất bến (Pending)**, **Đang chạy (In Progress)**, và **Lịch sử (Finished)**.
  - Mỗi chuyến đi hiển thị dạng Thẻ (Card) bao gồm: Tuyến đường (VD: Hà Nội - Quảng Ninh), Biển số xe sẽ lái, Giờ xuất bến dự kiến, và Tổng số khách/hàng hóa.
- **Thao tác sử dụng:**
  1. Tài xế chọn tab "Chờ xuất bến" để xem lệnh điều động của ngày hôm nay. (App tự động gọi API `GET /trips/my-runs?status=PENDING` để lấy dữ liệu).
  2. Tài xế bấm chọn vào Thẻ của chuyến đi sắp tới để vào xem chi tiết Phơi lệnh điện tử.

#### 3. Trang Chi tiết Chuyến đi & Phơi lệnh điện tử (Electronic Manifest)

- **Giao diện hiển thị:**
  - Đây là "bản đồ kho báu" của tài xế, thay thế hoàn toàn giấy tờ truyền thống giúp chống gian lận.
  - Hiển thị danh sách khách hàng và hàng hóa ký gửi. **Điểm đặc biệt:** Danh sách này không lộn xộn mà đã được sắp xếp chính xác từ trên xuống dưới theo thứ tự `pickup_order` (thứ tự đón) và `dropoff_order` (thứ tự trả) do thuật toán điều phối quyết định.
  - Hiển thị rõ các ghi chú của khách hàng (ví dụ: "Nhà hẻm sâu, xe đỗ ngoài đầu ngõ").
- **Thao tác sử dụng:**
  1. Tài xế vuốt để kiểm tra tổng quan danh sách khách sẽ đi chuyến này.
  2. Khi xe bắt đầu nổ máy rời bến, tài xế bấm nút **"Bắt đầu hành trình"**. Trạng thái chuyến đi chuyển sang `IN_PROGRESS` (Đang chạy).

#### 4. Trang Điều hướng & Đón/Trả khách trực tiếp (Navigation & Check-in) - TÍNH NĂNG CỐT LÕI

- **Giao diện hiển thị:**
  - **Nửa trên màn hình:** Là bản đồ trực quan tích hợp Google Maps API.
  - **Nửa dưới màn hình:** Là thẻ thông tin (Swipeable Card) của **khách hàng tiếp theo cần đón/trả**. Chỉ hiện 1 khách tại 1 thời điểm để tài xế không bị rối.
  - **Các nút thao tác nhanh:** "Chỉ đường", "Đã lên xe" (Check-in), "Không liên lạc được", "Đã trả khách" (Check-out).
- **Thao tác sử dụng (Quy trình khép kín):**
  1. **Dẫn đường:** App hiển thị khách hàng đầu tiên. Tài xế bấm nút **"Chỉ đường"**. App lập tức vẽ cung đường ngắn nhất từ vị trí hiện tại đến tọa độ chuẩn PostGIS (`pickup_location`) của khách hàng đó để tiết kiệm xăng.
  2. **Đón khách:** Khi đến gần điểm đón, tài xế có thể nhìn thấy vị trí của hành khách đang đứng trên bản đồ để đón kịp thời, loại bỏ việc phải gọi điện thoại hỏi đường liên tục.
  3. **Check-in:** Khách bước lên xe, tài xế bấm/vuốt nút **"Đã lên xe"**. Lập tức trạng thái vé cập nhật thành `PICKED_UP`, dữ liệu được đồng bộ Real-time qua Socket.io về Web Admin để văn phòng biết ghế đó đã có người ngồi.
  4. **Chuyển tiếp tự động:** Ngay sau khi bấm Check-in khách số 1, thẻ thông tin tự động trượt sang khách số 2. Tài xế tiếp tục lặp lại quy trình.
  5. **Trả khách:** Khi đến điểm trả, tài xế thao tác **"Đã trả khách"**, hệ thống cập nhật trạng thái `DROPPED_OFF`. Tài xế không cần bận tâm hỏi "Khách xuống đâu?" gây mất tập trung khi lái xe.

#### 5. Trang Quản lý Hàng hóa Ký gửi (Cargo Management)

- **Giao diện hiển thị:**
  - Tách biệt với danh sách hành khách, hiển thị danh sách các kiện hàng cần giao nhận trên cùng chuyến xe.
  - Tích hợp tính năng Camera để quét mã vạch/Mã QR Code.
- **Thao tác sử dụng:**
  1. Tài xế nhận hàng: Mở trang Hàng hóa, dùng App quét mã QR trên biên nhận hoặc chọn kiện hàng, bấm "Đã nhận lên xe" (Trạng thái `PICKED_UP`).
  2. Tài xế giao hàng: Đến điểm trả, kiểm tra đúng người nhận, thu hộ tiền COD (nếu có), bấm "Đã giao hàng" (`DELIVERED`). Hệ thống sẽ tự động đối soát tiền cước và tiền thu hộ vào báo cáo doanh thu cuối ngày.

#### 6. Trang Liên lạc nội bộ (Chat & Support)

- **Giao diện hiển thị:**
  - Khung chat trực tiếp kết nối với bộ phận Điều hành (Web Admin).
- **Thao tác sử dụng:**
  1. Trong trường hợp kẹt xe, sự cố thủng lốp, hoặc khách hàng số 3 gọi điện không nghe máy, tài xế mở mục Chat.
  2. Nhắn tin hoặc gửi tin nhắn thoại (Voice note) cho điều hành viên (thông qua công nghệ Socket.io báo cáo thời gian thực).
  3. Điều hành viên nhận tin trên Web Admin, gọi điện xử lý với khách và có thể hủy vé của khách đó ngay trên Admin. App Tài xế sẽ tự động gạch bỏ khách đó khỏi danh sách để tài xế bỏ qua điểm đón đó.

#### 7. Trang Kết thúc ca & Báo cáo (End Shift & Report)

- **Giao diện hiển thị:**
  - Tổng hợp nhanh số lượng khách đã chở, số hàng đã giao và tổng tiền mặt (tiền vé khách trả trên xe + tiền thu hộ COD) tài xế đang giữ.
- **Thao tác sử dụng:**
  1. Sau khi trả vị khách cuối cùng, tài xế bấm nút **"Hoàn thành chuyến đi"**.
  2. Khi hết ngày làm việc, tài xế bấm **"Kết thúc ca"**, tắt hệ thống định vị và bàn giao tiền cho kế toán dựa trên các con số hệ thống đã tự động tính toán.

Với thiết kế thao tác một chạm (One-touch) và trượt (Swipe) này, App Tài xế đóng vai trò như một trợ lý ảo, dẫn dắt tài xế đi đúng lộ trình ngắn nhất, đảm bảo tính an toàn giao thông và nâng cao sự chuyên nghiệp của dịch vụ xe Limousine.
