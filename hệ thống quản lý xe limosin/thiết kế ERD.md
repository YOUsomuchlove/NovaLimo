Để hệ thống có thể chạy được thuật toán gom nhóm (Clustering) và tối ưu lộ trình (Routing) mượt mà, cấu trúc cơ sở dữ liệu (Database) cần được thiết kế thật tối ưu. Vì bạn sẽ xây dựng các giao diện quản lý bằng Next.js/React, tôi thiết kế cấu trúc này theo hướng chuẩn RESTful/GraphQL, giúp việc map dữ liệu trả về (JSON) lên các component ở Frontend trở nên cực kỳ gọn gàng.

Dưới đây là thiết kế ERD (Entity Relationship Diagram) chi tiết, tập trung vào giải quyết bài toán cốt lõi của bạn.

### 1. Sơ đồ các Bảng Cốt lõi (Core Tables)

Chúng ta sẽ chia bài toán "30 khách - 3 xe" thành 2 cấp độ: **Khung giờ (Trip_Batches)** chứa toàn bộ 30 khách, và **Chuyến xe thực tế (Trip_Runs)** chứa 10 khách/xe sau khi thuật toán đã phân bổ.

#### Bảng 1: `Vehicles` (Quản lý Xe)

Lưu trữ thông tin vật lý của xe.

- **id** (UUID, Primary Key)

- **license_plate** (String): Biển số xe (VD: 29B-12345)

- **capacity** (Int): Sức chứa (Mặc định: 10)

- **status** (Enum): `AVAILABLE`, `MAINTENANCE`, `IN_USE`

#### Bảng 2: `Users` (Nhân sự: Tài xế & Điều hành)

- **id** (UUID, Primary Key)

- **full_name** (String)

- **phone** (String, Unique)

- **password_hash** (String)

- **role** (Enum): `ADMIN`, `DRIVER`

- **status** (Enum): `ACTIVE`, `INACTIVE`

#### Bảng 3: `Trip_Batches` (Khung giờ khởi hành - Rổ chứa khách)

Đây là "cái rổ" tổng chứa 30 khách hàng đặt vé trong cùng một khung giờ.

- **id** (UUID, Primary Key)

- **route_name** (String): VD: Hà Nội - Quảng Ninh

- **departure_time** (DateTime): Thời gian xuất phát dự kiến (VD: 14:00 25/10/2026)

- **status** (Enum): `OPEN` (Đang nhận khách), `CLUSTERED` (Đã chạy thuật toán chia xe), `COMPLETED`

#### Bảng 4: `Trip_Runs` (Chuyến xe thực tế)

Sau khi thuật toán chạy, 1 `Trip_Batch` (30 khách) sẽ sinh ra 3 `Trip_Runs` (3 xe chạy thực tế).

- **id** (UUID, Primary Key)

- **trip_batch_id** (UUID, Foreign Key -> Trip_Batches)

- **vehicle_id** (UUID, Foreign Key -> Vehicles)

- **driver_id** (UUID, Foreign Key -> Users)

- **status** (Enum): `PENDING` (Chờ chạy), `IN_PROGRESS` (Đang chạy), `FINISHED`

#### Bảng 5: `Bookings` (Vé / Hành khách - Quan trọng nhất)

Bảng này chứa tọa độ PostGIS để phục vụ việc gom khách 0.5km.

- **id** (UUID, Primary Key)

- **trip_batch_id** (UUID, Foreign Key): Vé này thuộc khung giờ nào (nhận ngay khi khách đặt).

- **trip_run_id** (UUID, Foreign Key, Nullable): Vé này bị đẩy lên xe nào (Chỉ có data SAU KHI thuật toán chạy).

- **passenger_name** (String)

- **passenger_phone** (String)

- **booker_name** (String, Nullable): Người đặt hộ

- **booker_phone** (String, Nullable)

- **pickup_address** (String): Địa chỉ đón text

- **pickup_location** (Geometry Point): Tọa độ Lat/Lng lưu theo chuẩn PostGIS.

- **dropoff_address** (String): Địa chỉ trả text

- **dropoff_location** (Geometry Point): Tọa độ Lat/Lng trả khách.

- **pickup_order** (Int, Nullable): Số thứ tự đón (1, 2, 3... do thuật toán TSP tính toán).

- **dropoff_order** (Int, Nullable): Số thứ tự trả (1, 2, 3...).

- **status** (Enum): `WAITING`, `PICKED_UP` (Đã lên xe), `DROPPED_OFF` (Đã trả), `CANCELLED`

- **note** (String): Ghi chú của khách.

#### Bảng 6: `Cargos` (Hàng hóa ký gửi)

Được đối xử như một hành khách chiếm diện tích nhưng không cần ghế ngồi.

- **id** (UUID, Primary Key)

- **trip_run_id** (UUID, Foreign Key)

- **sender_info** (JSON): Tên, SĐT người gửi

- **receiver_info** (JSON): Tên, SĐT người nhận

- **pickup_location** / **dropoff_location** (Geometry Point)

- **status** (Enum): `PENDING`, `PICKED_UP`, `DELIVERED`

---

### 2. Luồng dữ liệu chạy qua Cấu trúc này như thế nào?

Để bạn hình dung rõ cách Backend thao tác với Database này, đây là vòng đời của một chuyến đi:

1. **Khách đặt vé:** Khách hàng lên web, điền form. Một record mới được tạo trong bảng `Bookings`, gắn vào `trip_batch_id` của khung 14:00. Lúc này, `trip_run_id`, `pickup_order`, và `dropoff_order` đều là `NULL`.

2. **Đóng sổ & Chạy thuật toán:** Đến 13:00 (trước 1 tiếng), Admin bấm nút "Xếp xe" trên Web Admin.
   
   - Backend gọi truy vấn PostGIS: `SELECT * FROM Bookings WHERE ST_DWithin(pickup_location, ...)` để gom cụm.
   
   - Backend tạo ra 3 records mới trong bảng `Trip_Runs` (Xe 1, Xe 2, Xe 3).

3. **Cập nhật Database:** Backend update lại bảng `Bookings`:
   
   - Gắn 10 khách cụm Cầu Giấy -> `trip_run_id` của Xe 1.
   
   - Cập nhật `pickup_order` từ 1 đến 10 cho từng khách dựa theo đường đi ngắn nhất.

4. **Hiển thị lên App/Web:** * App của Tài xế chỉ cần gọi API: `GET /trips/my-runs?status=PENDING`. Data trả về sẽ `JOIN` sẵn với bảng `Bookings` và `ORDER BY pickup_order ASC`. Tài xế cứ thế nhìn danh sách từ trên xuống dưới mà đi đón.

Cấu trúc này loại bỏ hoàn toàn việc dư thừa dữ liệu và tận dụng được sức mạnh của PostGIS cho các truy vấn bản đồ.

Để giao diện hiển thị mượt mà trên Next.js và React Native, bạn có muốn tôi phác thảo thử một mẫu JSON Payload (cấu trúc API trả về) từ Backend cho tính năng "Xem chi tiết chuyến xe" để bạn dễ dàng mường tượng cách quản lý state trên Frontend không?
