# NovaLimo API v2 — bề mặt REST

Base URL: `http(s)://<host>/api`. Tài liệu tương tác (Swagger, môi trường không phải production): **`/api/docs`**.
Kiểu dữ liệu request/response: `libs/shared-types/src/lib/api.ts`; enum và bảng chuyển trạng thái: `libs/shared-types/src/lib/enums.ts`.

**Quy ước chung**

- Lỗi luôn có dạng `{ statusCode, code, message, details? }`. Ví dụ `code`: `SEAT_TAKEN`, `INVALID_TRANSITION`, `MISSING_PERMISSION`.
- Danh sách: `?page=1&limit=20&q=&sort=-created_at` → `{ items, total, page, limit }`.
- Tiền là số nguyên VND. Tọa độ là `{ lat, lng }`. Thời gian dùng ISO-8601; ngày lọc tính theo giờ Việt Nam.
- Xác thực: `Authorization: Bearer <access_token>` (hạn 15 phút) và `POST /auth/refresh` (refresh token xoay vòng).
- Realtime: Socket.io namespace `/realtime` (không nằm dưới `/api`). Hợp đồng sự kiện ở `libs/utils-core/src/lib/realtime-events.ts`.

## Auth

| Method | Path                                      | Ai gọi                                        |
| ------ | ----------------------------------------- | --------------------------------------------- |
| POST   | `/auth/staff/login`, `/auth/driver/login` | public (giới hạn 10/phút, khóa sau 5 lần sai) |
| POST   | `/auth/refresh`, `/auth/logout`           | public (refresh token)                        |
| GET    | `/auth/me`                                | đã đăng nhập                                  |
| POST   | `/auth/change-password`                   | đã đăng nhập                                  |

## Public (web đặt vé)

| Method      | Path                                                                            | Ghi chú                                                              |
| ----------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| GET         | `/public/routes`, `/public/routes/:id`                                          | Tuyến kèm điểm dừng và giá "từ"                                      |
| GET         | `/public/trips?route_id&date&seats`                                             | Chuyến trong ngày (giờ VN), giá và ghế trống tính ở server           |
| GET         | `/public/trips/:id`, `/public/trips/:id/seats`                                  | Sơ đồ ghế; cập nhật realtime qua `seats_changed` (room `batch:{id}`) |
| POST/DELETE | `/public/seat-holds`, `/public/seat-holds/:token`                               | Giữ ghế N phút (khóa advisory theo lô chuyến)                        |
| POST        | `/public/bookings`                                                              | Tạo vé từ giữ chỗ; **giá do server tính**; trả về hướng dẫn VietQR   |
| GET         | `/public/bookings/lookup?code&phone`                                            | Tra cứu bằng mã vé + SĐT (người đặt hoặc hành khách)                 |
| POST        | `/public/bookings/:code/cancel`                                                 | Hủy theo chính sách; vé đã thanh toán → tạo yêu cầu hoàn tiền        |
| POST        | `/public/otp/request`, `/public/otp/verify`                                     | OTP SMS → `lookup_token` (30 phút)                                   |
| GET         | `/public/my-bookings`                                                           | Header `x-lookup-token`                                              |
| POST/GET    | `/public/cargo/quote`, `/public/cargo/orders`, `/public/cargo/track?code&phone` | Ký gửi hàng                                                          |
| POST        | `/public/contact`                                                               | Form liên hệ → hộp thư hỗ trợ                                        |
| GET         | `/public/geocode?q`, `/public/geocode/reverse?lat&lng`                          | Proxy Nominatim (VN, có cache)                                       |
| GET         | `/public/settings`                                                              | Hotline, chính sách đặt vé                                           |
| POST        | `/payments/webhooks/bank`                                                       | Webhook chuyển khoản (`Authorization: Apikey …`), idempotent         |

## Admin (`/admin/*`, nhân viên; quyền ghi trong ngoặc)

| Nhóm                | Endpoint                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard / báo cáo | `GET /dashboard` (dashboard.view) · `GET /reports/{revenue,trips,cargo,drivers}?from&to` (report.view)                                                                                            |
| Lô chuyến           | `GET/POST/PATCH /trip-batches`, `GET /trip-batches/:id/seats`, `POST /trip-batches/generate` (trip.\*, settings.manage)                                                                           |
| Vé                  | `GET/POST/PATCH /bookings`, `POST /bookings/:id/status`, `POST /bookings/:id/payments` (booking.\*)                                                                                               |
| Điều phối           | `GET /dispatch/batches/:id` (bảng điều phối), `POST /dispatch/assign`, `GET/POST/PATCH/DELETE /trip-runs`, `POST /trip-runs/:id/status` (xuất lệnh), `PUT /trip-runs/:id/order` (dispatch.manage) |
| Hàng hóa / COD      | `GET/POST/PATCH /cargos` (cargo.\*) · `GET /cod/outstanding`, `GET/POST /cod/settlements` (cod.reconcile)                                                                                         |
| Đội xe              | `GET/POST/PATCH /vehicle-types`, `GET/POST/PATCH/DELETE /vehicles` (fleet.\*)                                                                                                                     |
| Tuyến / giờ / giá   | `GET/POST/PATCH/DELETE /routes`, `POST /routes/:id/stops`, `PATCH/DELETE /stops/:id`, `/time-slots`, `/price-rules` (settings.manage)                                                             |
| Cấu hình            | `GET /settings`, `PUT /settings/:key` (settings.manage)                                                                                                                                           |
| Tài xế              | `GET/POST/PATCH/DELETE /drivers`, `PUT /drivers/:id/password` (driver.\*)                                                                                                                         |
| Nhân viên / RBAC    | `GET/POST/PATCH/DELETE /staff`, `PUT /staff/:id/password`, `GET/POST/PATCH/DELETE /roles` (rbac.manage) · `GET /audit-logs` (audit.read)                                                          |
| Khách hàng          | `GET/POST/PATCH/DELETE /customers` (customer.\*)                                                                                                                                                  |
| Tài chính           | `GET/POST/PATCH /finance/transactions` (finance.\*)                                                                                                                                               |
| Vận hành            | `GET /chat`, `GET/POST /chat/:driverId`, `GET/PATCH /incidents` (dispatch.manage) · `GET/PATCH /support/tickets` (support.manage)                                                                 |

Mọi thao tác ghi của nhân viên được **tự động** ghi vào `audit_logs`.

## Driver app (`/driver/*`)

`GET /me` · `GET /runs?scope=upcoming|active|done` · `GET /runs/:id` (điểm đón/trả đã sắp xếp) · `POST /runs/:id/start|finish` ·
`POST /bookings/:id/pickup|dropoff|no-show` · `GET /cargos`, `GET /cargos/scan/:code`, `POST /cargos/:id/pickup|deliver|return` ·
`GET /shifts/current`, `POST /shifts/start|end`, `GET /shifts/summary` · `POST /locations` (lô điểm GPS, hàng đợi offline) ·
`GET/POST /chat` · `GET /notifications`, `POST /notifications/read` · `POST /incidents` (SOS) · `POST /push-token` · `GET /income?month`

## Khác

`GET /health` (kiểm tra DB) · `POST /uploads/:kind` (avatars, vehicles, proofs, incidents, routes; ảnh ≤ 5MB, kiểm tra magic bytes) · tệp tĩnh `/api/uploads/*`.
