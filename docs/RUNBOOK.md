# NovaLimo — Sổ tay Vận hành & Triển khai (Production Runbook)

Tài liệu hướng dẫn triển khai, cấu hình biến môi trường, sao lưu dữ liệu, xoay vòng khóa bảo mật và phát hành ứng dụng di động cho hệ thống **NovaLimo v2**.

---

## 1. Kiến trúc Dịch vụ

| Dịch vụ                              | Cổng mặc định | Mô tả                                                                                               |
| :----------------------------------- | :------------ | :-------------------------------------------------------------------------------------------------- |
| **PostgreSQL 16 + PostGIS 3.4**      | `5432`        | Cơ sở dữ liệu chính (31 bảng, chỉ mục không gian GIST)                                              |
| **OSRM Routing Engine** _(tùy chọn)_ | `5000`        | Tính ma trận khoảng cách đường bộ; tự động fallback sang Haversine × 1.3 nếu tắt                    |
| **`apps/api-server`**                | `3000`        | NestJS 11 REST API (`/api`), Swagger (`/api/docs`), Health (`/api/health`), Socket.io (`/realtime`) |
| **`apps/web-booking`**               | `3001`        | Cổng đặt vé & ký gửi hàng hóa cho hành khách (Next.js 16 SSR/SSG)                                   |
| **`apps/web-admin`**                 | `3002`        | Trung tâm điều hành, điều phối thông minh, kế toán & RBAC (Next.js 16 Dark Console)                 |
| **`apps/app-driver`**                | Expo / EAS    | Ứng dụng di động iOS & Android cho tài xế chạy ca                                                   |

---

## 2. Cấu hình Biến Môi trường (`.env`)

Sao chép `.env.example` thành `.env` tại thư mục gốc và cấu hình các biến quan trọng sau trước khi chạy production:

```ini
NODE_ENV=production
PORT=3000

# Kết nối PostgreSQL (yêu cầu extension postgis & pgcrypto)
DATABASE_URL=postgresql://novalimo:<STRONG_DB_PASSWORD>@postgres:5432/novalimo
TYPEORM_SYNCHRONIZE=false
TYPEORM_LOGGING=false

# Bảo mật JWT (tối thiểu 32 ký tự ngẫu nhiên)
JWT_SECRET=<GENERATE_WITH_OPENSSL_RAND_HEX_32>
JWT_ACCESS_TTL_SEC=900
JWT_REFRESH_TTL_DAYS=30

# VietQR & Webhook đối soát ngân hàng tự động (SePay / Casso)
VIETQR_BANK_BIN=970422
VIETQR_ACCOUNT_NO=0123456789
VIETQR_ACCOUNT_NAME=CONG TY TNHH VAN TAI NOVALIMO
BANK_WEBHOOK_SECRET=<GENERATE_WEBHOOK_SECRET>

# Thư mục lưu trữ ảnh upload (avatar, ảnh biên nhận POD)
UPLOAD_DIR=/app/uploads

# URL công khai của API cho các ứng dụng Next.js & Expo
NEXT_PUBLIC_API_URL=https://api.novalimo.vn/api
EXPO_PUBLIC_API_URL=https://api.novalimo.vn/api
CORS_ORIGINS=https://novalimo.vn,https://admin.novalimo.vn
```

---

## 3. Khởi chạy Stack bằng Docker Compose

### 3.1. Khởi chạy toàn bộ hệ thống (DB + API + Web Booking + Web Admin)

```bash
docker compose -f docker-compose.yml -f docker-compose.stack.yml up -d --build
```

- Kiểm tra trạng thái sức khỏe của API & DB:
  ```bash
  curl -fsSL http://localhost:3000/api/health
  ```
- Khởi tạo dữ liệu danh mục chuẩn & tài khoản quản trị lần đầu (chỉ chạy 1 lần khi DB trống):
  ```bash
  npx nx run api-server:seed
  ```

### 3.2. Bật thêm OSRM Routing Engine (tùy chọn)

1. Đặt dữ liệu bản đồ Việt Nam đã trích xuất (`vietnam-latest.osrm*`) vào `./tools/osrm-data/map.osrm`.
2. Khởi chạy kèm profile `osrm`:
   ```bash
   OSRM_BASE_URL=http://osrm:5000 docker compose -f docker-compose.yml -f docker-compose.stack.yml --profile osrm up -d
   ```

---

## 4. Sao lưu & Khôi phục Cơ sở dữ liệu (Backup & Restore)

### 4.1. Sao lưu định kỳ (Cron hằng ngày lúc 02:00 sáng)

```bash
docker exec novalimo-postgres pg_dump -U novalimo -Fc novalimo > /backups/novalimo_$(date +%F_%H%M).dump
```

### 4.2. Khôi phục từ bản sao lưu

```bash
docker exec -i novalimo-postgres pg_restore -U novalimo -d novalimo --clean --if-exists < /backups/novalimo_YYYY-MM-DD_HHMM.dump
```

---

## 5. Xoay vòng Khóa Bảo mật (Secret Rotation)

1. **Xoay vòng `JWT_SECRET`**:
   - Tạo chuỗi khóa mới: `openssl rand -hex 32`.
   - Cập nhật `JWT_SECRET` trong `.env` và khởi động lại container `novalimo-api`.
   - Lưu ý: Các phiên đăng nhập hiện tại sẽ tự động dùng `refresh_token` để cấp lại `access_token` mới.
2. **Xoay vòng `BANK_WEBHOOK_SECRET`**:
   - Cập nhật đồng thời trên trang quản trị SePay/Casso và biến `BANK_WEBHOOK_SECRET` của `novalimo-api`.

---

## 6. Phát hành Ứng dụng Tài xế (`apps/app-driver`) với EAS

Cấu hình EAS đã được định nghĩa sẵn tại `apps/app-driver/eas.json`:

1. **Build bản nội bộ (APK cho Android / Ad-hoc cho iOS)**:
   ```bash
   cd apps/app-driver
   npx eas-cli build --profile preview --platform all
   ```
2. **Build bản Production lên App Store / Google Play**:
   ```bash
   cd apps/app-driver
   npx eas-cli build --profile production --platform all
   ```

---

## 7. Kiểm thử Chất lượng trước khi Phát hành (Pre-Release Checklist)

```bash
# 1. Kiểm tra kiểu tĩnh TypeScript trên toàn bộ 4 apps & 5 libs
npm run typecheck:all

# 2. Kiểm tra ESLint (bao gồm luật cấm mã màu #hex rời)
npm run lint:all

# 3. Chạy Unit Tests (design-tokens, utils-map CVRP/TSP, api-server)
npm run test:all

# 4. Chạy Playwright E2E (khi stack đang chạy ở cổng 3000/3001/3002)
npm run test:e2e
```
