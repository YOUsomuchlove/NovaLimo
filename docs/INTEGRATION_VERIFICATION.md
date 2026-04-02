# Kiểm tra tích hợp monorepo

Tài liệu thực thi kế hoạch smoke để tránh lệch cấu hình giữa `api-server`, `web-admin`, `web-booking`, `app-driver`.

## Nguyên tắc

- **Một base URL cho REST:** `NEXT_PUBLIC_API_URL` / `EXPO_PUBLIC_API_URL` (mặc định `http://localhost:3000/api`). Nest dùng global prefix `api` — xem `apps/api-server/src/main.ts`.
- **Socket.io:** namespace `/realtime` trên **origin HTTP**, không phải `.../api/realtime`. Hàm gốc được test trong `libs/utils-core` (`getSocketOriginFromApiBaseUrl`). Các app Next/Expo dùng cùng regex qua `getSocketBaseUrl()` trong `lib/api.ts` / `client.ts` (tránh import `utils-core` từ client Next vì Turbopack).
- **Port:** `PORT` (api-server) khớp với URL trong `.env` của client.

## Bảng biến môi trường

| Mục | Ai dùng | Ghi chú |
|-----|---------|---------|
| `DATABASE_URL` | api-server | PostGIS cho geom bookings / dispatch `postgres` |
| `OSRM_BASE_URL` | api-server | Trống → fallback Haversine |
| `DISPATCH_CLUSTER_MODE` / `DISPATCH_CLUSTER_EPS_M` | api-server | `postgres` cần PostGIS + geom |
| `JWT_SECRET` | api-server | Token driver/admin |
| `NEXT_PUBLIC_API_URL` | web-admin, web-booking | Build-time Next — đổi cần restart dev / rebuild |
| `EXPO_PUBLIC_API_URL` | app-driver | Build-time Expo — **Android emulator:** `http://10.0.2.2:3000/api` |

Checklist đầy đủ: `.env.example`.

## Script tự động (API đang chạy)

Sau khi DB + `nx serve api-server` (hoặc tương đương):

```bash
node tools/verify-integration.mjs
```

Biến tùy chọn: `API_BASE_URL` (mặc định `http://localhost:3000/api`).

## Thứ tự smoke thủ công

1. **DB:** Postgres + `CREATE EXTENSION postgis` (log `database-init.service.ts` nếu có).
2. **API:** `GET /api` → `{ message: 'NovaLimo API' }`; `GET /api/trip-batches`; `POST /api/auth/login/driver` (user seed); dispatch/cluster theo `DISPATCH_CLUSTER_MODE` đang bật.
3. **Web:** Mở web-admin / web-booking — DevTools Network trỏ đúng `NEXT_PUBLIC_API_URL`.
4. **Socket:** Trang tracking admin — kết nối `wss`/`ws` tới `${socketOrigin}/realtime`.
5. **Driver:** Đăng nhập, `GET /api/trips/my-runs`; ca/GPS nếu cần — cùng base URL.

## Lệnh dev gợi ý

- `npm run dev:all` — api + web-admin + web-booking (xem `package.json`).
- Windows/Nx cache lạ: thử `set NX_DAEMON=false` rồi chạy lại.

## Definition of done (phiên tích hợp)

- Một bộ giá trị env nhất quán (không một app `http://localhost:3000` và app khác `.../api` trừ khi cố ý tách môi trường).
- Đặt vé (booking) → thấy booking trong admin → cluster không lỗi PostGIS/OSRM theo cấu hình hiện tại.
- Tài xế: thấy chuyến; nếu bật tracking, có event socket.
