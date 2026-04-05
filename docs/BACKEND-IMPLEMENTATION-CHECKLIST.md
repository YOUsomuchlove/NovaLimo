# Backend & database — checklist (NovaLimo)

Tham chiếu: [Đặc tả Backend](../hệ%20thống%20quản%20lý%20xe%20limosin/New/Đặc%20tả%20Hệ%20thống%20Backend%20và%20Công%20cụ%20Điều%20phối%20NovaLimo.md), `libs/utils-core` `RealtimeEvents`, `libs/shared-types`.

## Đã có trong repo (kiểm tra khi mở `apps/api-server`)

- [ ] Entity: Vehicle, User, TripBatch, TripRun, Booking (PostGIS), Cargo — TypeORM migration
- [ ] `POST` đặt vé → `trip_batch_id`, `trip_run_id` null đến khi dispatch
- [ ] `POST /dispatch/run` (tên thực tế theo module): cluster → OR-Tools → OSRM matrix → update bookings
- [ ] `POST` chốt lệnh sau chỉnh tay (drag-drop payload)
- [ ] `GET` driver `my-runs` + manifest `ORDER BY pickup_order`
- [ ] Socket.io: mount `/realtime`; dùng `RealtimeEvents` từ `@limousine-workspace/utils-core`
- [ ] JWT: admin vs driver vs public booking
- [ ] Shift: `POST /driver/shifts/start`, `POST /driver/shifts/end` — types `DriverShift` trong shared-types

## Kiểm thử

- `API_BASE_URL=http://localhost:3000/api node tools/verify-integration.mjs`
