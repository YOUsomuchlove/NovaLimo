# NovaLimo — Kế hoạch xây dựng lại (Rebuild Plan)

> Lập ngày 02/11/2026, sau khi rà soát toàn bộ repo: `apps/api-server`, `apps/web-admin`, `apps/web-booking`, `apps/app-driver`, `libs/*` và bộ đặc tả trong `hệ thống quản lý xe limosin/New/`.
> **Tiến độ:** GĐ 0 ✅ (trừ 0.2: xuất ảnh Pencil) · GĐ 1 ✅ design system · GĐ 2 🟡 code API v2 xong (31 bảng, 11 module, unit test qua), **còn chờ Docker để sinh migration đầu tiên + chạy e2e**. Nhánh `rebuild`; snapshot code cũ: tag `legacy-v0`.
>
> Mục tiêu: **đúng thiết kế Pencil** (`web-admin.pen`, `web-bôking.pen`, `app-mobile.pen`, `app-mobile-chat-shift.pen`), **đẹp và chuyên nghiệp hơn bản vẽ**, và **chạy thật end-to-end**, không còn mock.

---

## 0. Hiện trạng — tóm tắt rà soát

| Phân hệ                              | Đã chạy thật                                                                                                                                                 | Mock / placeholder                                                                                                                           | Đánh giá                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **api-server** (NestJS, ~3.500 dòng) | Đăng nhập admin/driver (JWT), CRUD cơ bản (trip-batch, booking, trip-run, vehicle, customer, finance, cargo), ca làm + GPS của tài xế, socket phát broadcast | **Chưa có thuật toán điều phối** (không có PostGIS, OSRM, OR-Tools); RBAC chỉ có bảng, không được kiểm tra; không có migration               | Khung xương dùng được, nhưng **nhiều lỗ hổng bảo mật** và thiếu toàn bộ nghiệp vụ lõi      |
| **web-booking** (Next 16)            | Tìm chuyến → chọn ghế → đặt vé → tra cứu vé                                                                                                                  | Giá, sức chứa và số ghế còn trống bị “bịa” khi API không trả về; QR, mã đơn và marker bản đồ là giả; luồng cargo và form liên hệ là UI suông | Luồng chính chạy được, **nền móng yếu**: toàn `'use client'`, không có SEO, giá lấy từ URL |
| **web-admin** (Next 16 + antd 6)     | Chỉ có trang login, upload avatar và log socket                                                                                                              | **~90% route là placeholder**; dashboard và fleet dùng số liệu cứng                                                                          | **Viết lại gần như toàn bộ**; chỉ giữ cây route và bảng mapping frame                      |
| **app-driver** (Expo 54)             | Login, danh sách chuyến, bật/tắt ca, gửi GPS, danh sách cargo                                                                                                | ~12/17 màn là mock; không có bản đồ, socket, camera, push; token không lưu khi khởi động lại app                                             | Phần lớn phải làm mới                                                                      |
| **libs**                             | `shared-types`, `utils-core` (api-url, realtime-events, design tokens)                                                                                       | `utils-map` rỗng; `shared-ui` thiếu component dùng chung                                                                                     | Token khai báo ở **4 nơi**, có ~30 mã hex rời rạc                                          |

### Lỗi nghiêm trọng phải sửa đầu tiên (blocker)

1. `GET /trip-runs` trả về `driver.password_hash`.
2. `POST /bookings` tin giá client gửi lên (`unit_price`, `total_amount`). Sửa `?price=` trên URL là đổi được giá vé.
3. `GET /bookings?passenger_phone=` là API public: ai biết SĐT đều xem được vé và thông tin cá nhân.
4. Đặt ghế bị race condition (kiểm tra rồi mới insert, không có transaction hay unique constraint); không chặn vượt sức chứa.
5. Socket `/realtime` không xác thực, `cors:'*'`, broadcast PII hành khách và GPS tài xế cho mọi client.
6. `synchronize=true` cả ở production; seed tài khoản `0000000000/demo` chạy mỗi lần boot, kể cả production; JWT secret có giá trị fallback cứng.
7. Bảng tài xế (mock) trên admin có **cột mật khẩu dạng plaintext**.
8. Tiền lưu kiểu `double`; không có `created_at`/`updated_at`, nên mọi phép sắp xếp `id DESC` đang sắp theo UUID ngẫu nhiên.

---

## 1. Nguyên tắc xây dựng lại

1. **Rebuild trong chính monorepo Nx hiện tại.** Giữ cấu trúc `apps/` + `libs/` và stack (NestJS, Next 16, Expo 54, PostgreSQL + PostGIS). Không đổi framework, chỉ thay phần ruột.
2. **API + DB là một nguồn sự thật.** Mọi giá, sức chứa, trạng thái và mã đơn đều do server tính. Client chỉ hiển thị.
3. **Một hệ token thiết kế duy nhất.** Từ đó sinh ra Tailwind `@theme`, antd `ConfigProvider` và RN theme. Cấm hex rời trong code (có lint rule).
4. **Thiết kế trước, code sau.** Mỗi màn trong code ứng với đúng một frame Pencil. Mỗi PR kèm ảnh so sánh pen ↔ code.
5. **Không merge mock.** Màn nào chưa có API thì dùng trạng thái _empty/coming soon_ rõ ràng, không dùng số liệu giả trông như thật.
6. **Định nghĩa “xong” (DoD) cho mỗi màn:**
   - đúng layout pen;
   - có đủ 4 trạng thái loading (skeleton) / empty / error / success;
   - responsive ở 390, 768, 1280 và 1440;
   - đạt WCAG AA về tương phản, focus và bàn phím;
   - có ít nhất 1 test (unit hoặc e2e).

---

## 2. Định hướng thiết kế: “đẹp hơn pen” nhưng vẫn đúng pen

Giữ nguyên ngôn ngữ thiết kế trong pen: **navy/đen sang trọng + vàng gold cho CTA, bo góc mềm, font Inter**. Nâng chất lượng ở những điểm sau:

| Hạng mục              | Hiện tại                                                            | Chuẩn mới                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Màu nền (surface)** | 4–5 mã navy khác nhau (`#0a0e18`, `#070b14`, `#05080d`, `#121620`…) | Thang 5 bậc cố định:<br>• `bg` `#05070F`<br>• `surface-1` `#0B1020`<br>• `surface-2` `#111827`<br>• `surface-3` `#1A2236`<br>• `overlay` `rgba(2,6,23,.72)` |
| **Gold**              | `#D4AF37`, `#d4ac0d`, `#e5c158`, `#c9a85c`, `#c9a227`               | Thang gold-50 → gold-900, lấy gold-500 `#D4AF37` làm gốc; hover = gold-600, chữ trên gold = navy                                                            |
| **Text**              | Các mã xám rời rạc                                                  | Bốn bậc: `text-primary` `#F8FAFC` / `secondary` `#CBD5E1` / `muted` `#94A3B8` / `disabled` `#64748B`                                                        |
| **Border**            | Không thống nhất                                                    | `border-subtle` `rgba(148,163,184,.12)`, `border-strong` `rgba(148,163,184,.24)`                                                                            |
| **Trạng thái**        | Lặp ở nhiều nơi                                                     | success / warning / danger / info, mỗi loại có bộ ba bg / fg / border (dùng cho Tag và Alert)                                                               |
| **Typography**        | `text-[11px]`, `[13px]`, `[22px]`… tùy tiện                         | Thang chữ: 12 / 13 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48; line-height chuẩn; `font-feature-settings: "tnum"` cho cột số (tiền, giờ)                       |
| **Spacing**           | Không có                                                            | Lưới 4px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64                                                                                                              |
| **Radius**            | 14 / 15 / 18 / 24 / 28 lẫn lộn                                      | `sm` 6 · `md` 10 · `lg` 14 · `xl` 20 · `2xl` 28 · `pill`                                                                                                    |
| **Shadow / độ nổi**   | Không có                                                            | 3 bậc shadow cho nền tối, có viền sáng 1px phía trên (inner highlight) để tạo cảm giác “kính” cao cấp                                                       |
| **Chuyển động**       | Không có                                                            | 150 / 200 / 300ms, easing `cubic-bezier(.2,.8,.2,1)`; tôn trọng `prefers-reduced-motion`                                                                    |
| **Icon**              | Trộn lucide, antd icons và emoji                                    | **Chỉ dùng lucide** (web và RN qua `lucide-react-native`), stroke 1.75                                                                                      |
| **Ảnh**               | Hotlink Unsplash                                                    | Ảnh xe/tuyến tự host, tối ưu bằng `next/image` (AVIF/WebP), có blur placeholder                                                                             |

**Điểm nhấn chuyên nghiệp:**

- skeleton thay cho spinner;
- toast thống nhất;
- trang empty có minh họa;
- số tiền và giờ dùng font tabular;
- bảng admin có sticky header và chọn cột;
- dark mode là mặc định cho admin và driver;
- booking dùng hero tối + nội dung sáng/kính theo pen.

---

## 3. Kiến trúc kỹ thuật mục tiêu

```
libs/
  design-tokens/      # MỚI – nguồn token duy nhất (TS) → sinh CSS vars, Tailwind @theme, antd theme, RN theme
  shared-types/       # giữ – enum/DTO dùng chung; enum chỉ khai báo 1 lần, backend import lại
  api-client/         # MỚI – client REST có kiểu (fetch wrapper + TanStack Query hooks) cho cả web và RN
  utils-core/         # giữ – api-url, realtime-events, format tiền/giờ VN, phone
  utils-map/          # làm thật – haversine, polyline encode/decode, bbox, deeplink Google Maps
  shared-ui/          # tái cấu trúc – component web dùng chung (admin + booking)
  shared-mobile-ui/   # MỚI – component RN cho app-driver (theo đặc tả, không dùng shared-ui cho RN)
```

| Lớp                      | Lựa chọn                                                                                                                              | Lý do                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Data fetching (web + RN) | **TanStack Query v5** + `libs/api-client`                                                                                             | Cache, retry, phân trang và invalidate theo socket                |
| Validate form            | **react-hook-form + zod** (schema dùng chung với API qua `shared-types`)                                                              | Một bộ luật validate cho cả client và server                      |
| Admin UI                 | **antd 6 với `darkAlgorithm` + component tokens** lấy từ design-tokens; Tailwind chỉ dùng cho layout                                  | Bỏ hàng trăm class `!important` đang dùng để chống lại theme sáng |
| Booking UI               | Tailwind + component tự xây trong `shared-ui`; antd chỉ dùng cho DatePicker/Select (đã theme)                                         | Nhẹ hơn, tối ưu SEO, tự do tạo cảm giác cao cấp                   |
| Bản đồ web               | **MapLibre GL** (tile OSM/MapTiler)                                                                                                   | Miễn phí, mượt, vẽ được marker thật và polyline                   |
| Bản đồ driver            | `react-native-maps` (Google provider) + deep link Google Maps                                                                         | Đúng đặc tả                                                       |
| Auth web admin           | JWT access 15 phút + refresh token trong **cookie httpOnly**; Next `middleware.ts` chặn route                                         | Bỏ localStorage, có guard thật                                    |
| Auth driver              | Access + refresh token lưu trong **expo-secure-store**                                                                                | Đăng nhập một lần, không mất phiên khi tắt app                    |
| Realtime                 | Socket.io có **JWT handshake + rooms** (`admin`, `driver:{id}`, `run:{id}`, `batch:{id}`)                                             | Không lộ dữ liệu ra ngoài                                         |
| DB                       | **TypeORM migrations**; PostGIS `geography(Point,4326)` + GIST index; tiền lưu `bigint` (VND); `created_at`/`updated_at`/`deleted_at` | Production an toàn                                                |
| Điều phối                | PostGIS `ST_ClusterDBSCAN` → OSRM `/table` → bộ giải VRP (xem Giai đoạn 6)                                                            | Đúng đặc tả USP                                                   |
| Thanh toán               | **VietQR động** + webhook đối soát ngân hàng (SePay/Casso); VNPay sandbox là tùy chọn                                                 | Thực tế và rẻ cho thị trường Việt Nam                             |
| Thông báo                | Expo Push (driver); SMS/Zalo ZNS qua adapter (khách)                                                                                  | Theo §7.4 của đặc tả booking                                      |
| Chất lượng               | ESLint (cấm hex, cấm import sâu), Prettier, Jest, Playwright, Swagger, `@nestjs/throttler`, helmet, pino logger                       |                                                                   |

---

## 4. Lộ trình theo giai đoạn

Ước lượng cho **1 dev full-time**; có 2 dev thì Giai đoạn 3, 4 và 5 chạy song song được.

### Giai đoạn 0 — Chuẩn bị & dọn nền (3–4 ngày)

| #   | Việc                                                                                                                                                                                | Kết quả                                                                             |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 0.1 | Commit hoặc stash thay đổi đang dang dở; tạo tag `legacy-v0`; tạo nhánh `rebuild`                                                                                                   | Có điểm quay lại an toàn                                                            |
| 0.2 | **Mở 4 file `.pen` trong Pencil** và xuất PNG của từng frame theo bảng mapping vào `docs/design-ref/<app>/<frameId>.png`                                                            | Bộ ảnh chuẩn để so pixel. Lúc rà soát, app Pencil chưa chạy nên chưa trích được ảnh |
| 0.3 | Dùng Pencil `get_variables` để trích biến màu, radius và font từ pen                                                                                                                | Đầu vào cho `libs/design-tokens`                                                    |
| 0.4 | Dọn repo: xóa `term-tmp/`, `tmp/`, `test-results/`, `dist/` khỏi git; thêm `.gitattributes` (`eol=lf`) để hết diff CRLF giả; viết `project.json` thật cho từng app; thêm alias `@/` | Repo sạch                                                                           |
| 0.5 | Đồng bộ phiên bản: `npx expo install expo-camera expo-location expo-notifications` (hiện đang dùng bản ^55 trên SDK 54); khai báo `@expo/vector-icons`                              | Hết xung đột phiên bản                                                              |
| 0.6 | Thiết lập ESLint/Prettier, husky + lint-staged, CI GitHub Actions (lint, typecheck, test, build)                                                                                    | Cổng chất lượng cho mọi PR                                                          |
| 0.7 | Cập nhật `Bảng Mapping Route ↔ Màn Thiết Kế.md`: cột trạng thái phản ánh đúng thực tế (Done / Partial / Placeholder)                                                               | Tài liệu trung thực                                                                 |

### Giai đoạn 1 — Design system (6–8 ngày)

| #   | Việc                                                                                                                                                                                                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | Tạo `libs/design-tokens`: color, typography, spacing, radius, shadow, motion, z-index, breakpoint. Script sinh ra `tokens.css` (CSS vars), `tailwind-theme.css` (`@theme`), `antd-theme.ts` (dark + light) và `rn-theme.ts`. **Xóa** 3 bản token cũ (`nova-limo-design-tokens.ts`, `nova-limo-css-variables.css`, hằng số trong `admin-shell`)                             |
| 1.2 | `shared-ui` (web), lớp primitive: Button (primary gold / secondary / ghost / danger; size sm/md/lg; loading), Input, Select, DatePicker (theme sẵn), Textarea, Checkbox/Radio/Switch, Badge/StatusTag, Card, Tabs, Modal, Drawer, Toast, Tooltip, Skeleton, Avatar, EmptyState, ErrorState                                                                                 |
| 1.3 | `shared-ui`, lớp pattern: PageHeader (breadcrumb + actions), DataTable (phân trang server, sort, chọn cột, sticky, bulk action), FilterBar, KpiCard (kèm sparkline), FormSection, DetailLayout (2 cột + timeline), ConfirmDialog, MapView (MapLibre), AddressAutocomplete (sửa lỗi tọa độ cũ còn sót), SeatMap 9/12 chỗ (lấy layout từ API), Stepper, MoneyText, PhoneText |
| 1.4 | `shared-mobile-ui`: Screen, Header, Button, Input, Card, ListItem, Badge, BottomSheet, SwipeToConfirm, EmptyState, Skeleton, Toast                                                                                                                                                                                                                                         |
| 1.5 | Trang `/dev/design-system` trong admin (thay `/dev/ui-messages`) hiển thị toàn bộ component; đối chiếu với frame **“halo: design system components”** và **Message & Popup Library** trong pen                                                                                                                                                                             |

### Giai đoạn 2 — Backend core: sửa nền và bổ sung nghiệp vụ (12–15 ngày)

**2A. Nền móng**

- [ ] TypeORM `data-source.ts` + migration khởi tạo; `synchronize=false` ở mọi môi trường trừ test.
- [ ] Bật extension PostGIS; các cột `pickup_geog`/`dropoff_geog` kiểu `geography(Point,4326)` + GIST index.
- [ ] Thêm `created_at`, `updated_at`, `deleted_at` (soft delete) cho mọi bảng; tiền chuyển sang `bigint`.
- [ ] Validate config bằng Joi/zod khi boot. Bắt buộc có `JWT_SECRET`; bỏ fallback.
- [ ] Seed tách thành lệnh `nx run api-server:seed`, **không chạy tự động ở production**.
- [ ] helmet, CORS whitelist theo env, throttler (đăng nhập, geocode, đặt vé), pino logger kèm request-id, `/health` có kiểm tra DB và OSRM.
- [ ] Exception filter trả mã lỗi chuẩn `{code, message}`, không lộ lỗi DB ra ngoài.
- [ ] Swagger tại `/api/docs`; chuẩn hóa list endpoint: `GET /resource?page&limit&sort&q` → `{items,total}`.
- [ ] Response DTO cho mọi entity (không trả entity thô). **Sửa ngay lỗi lộ `password_hash`.**

**2B. Mô hình dữ liệu bổ sung (theo các màn “Cấu hình” trong pen)**

| Bảng mới                                                                                               | Dùng cho                                                              |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `routes`, `stops` (điểm đón/trả chuẩn, có geog)                                                        | Thay cách parse chuỗi `route_name` bằng regex; màn `nvCfgRoutesStops` |
| `time_slots` (khung giờ lặp lại) + job tự sinh `trip_batches`                                          | `nvCfgTimeSlots`                                                      |
| `vehicle_types` (9 hoặc 12 chỗ, `seat_layout` JSON)                                                    | SeatMap lấy từ server; bỏ việc khách tự chọn 9/12 chỗ                 |
| `price_rules` (theo tuyến, loại xe, hạng ghế VIP, ngày lễ)                                             | `nvCfgPricing`; giá tính **phía server**                              |
| `booking_seats` (booking_id, batch_id, seat_label) + **UNIQUE(batch_id, seat_label) WHERE active**     | Chặn trùng ghế ở tầng DB                                              |
| `seat_holds` (giữ ghế 10 phút)                                                                         | Tránh tranh ghế lúc thanh toán                                        |
| `payments` (provider, amount, ref, status, raw_webhook)                                                | VietQR + webhook                                                      |
| `cargo` mở rộng: địa chỉ, cân nặng, kích thước, dễ vỡ, giá, COD, `cod_collected`, `handoff_*`          | Luồng cargo public + COD                                              |
| `cod_settlements`                                                                                      | `nvCargoCodReconcile`                                                 |
| `chat_messages`, `notifications`, `incidents` (SOS), `driver_profiles` (bằng lái, avatar, xe mặc định) | App tài xế                                                            |
| `otp_codes`                                                                                            | Tra cứu vé bằng OTP                                                   |
| `settings` (key/value: COD policy, mẫu thông báo)                                                      | `nvCfgCodPolicy`, `nvCfgNotifications`                                |

**2C. Bảo mật và phân quyền**

- [ ] Guard `@Permissions('booking.write')` + `PermissionsGuard` đọc từ `user_roles`/`role_permissions`; trả 403 đúng chuẩn; API `GET /auth/me` trả về quyền để FE lọc menu.
- [ ] Refresh token có xoay vòng (rotation) và cho phép thu hồi; đổi mật khẩu; logout.
- [ ] Ghi audit log **tự động** qua interceptor cho mọi mutation của admin (không để client tự gửi lên).
- [ ] Socket: xác thực JWT ở handshake, rooms, payload chuẩn hóa.

**2D. API theo phân hệ**

| Nhóm           | Endpoint chính                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public booking | `GET /public/routes`, `GET /public/trips?from&to&date` (lọc phía server, có giá, ghế trống, giờ đến ước tính), `GET /public/trips/:id` (kèm seat layout và ghế đã bán), `POST /public/seat-holds`, `POST /public/bookings` (server tính giá, chạy trong transaction), `GET /public/bookings/:code`, `POST /public/otp` + `GET /public/my-bookings` (sau khi xác thực OTP), `POST /public/bookings/:code/cancel` |
| Public cargo   | `POST /public/cargo/quote`, `POST /public/cargo/orders`, `GET /public/cargo/:waybill`                                                                                                                                                                                                                                                                                                                           |
| Thanh toán     | `POST /payments/vietqr/:bookingCode`, `POST /payments/webhook/sepay` (có ký xác thực), socket `payment_confirmed`                                                                                                                                                                                                                                                                                               |
| Admin          | CRUD đầy đủ + phân trang cho: users/drivers (tạo/sửa/khóa, avatar), vehicles, vehicle-types, routes/stops, time-slots, price-rules, trip-batches, bookings, trip-runs, cargos, customers (liên kết bookings theo SĐT), finance (thu/chi, báo cáo), settings, roles/permissions, audit-logs (GET). Báo cáo: `/admin/reports/{trips,revenue,cargo-cod,drivers}?from&to`                                           |
| Driver         | `POST /driver/runs/:id/start` · `finish`, `PATCH /driver/bookings/:id/status` (PICKED_UP/DROPPED_OFF/NO_SHOW), `GET/PATCH /driver/cargos/:id` (scan, pickup, deliver, COD), `POST /driver/cargos/:id/transfer`, `GET /driver/shifts/summary`, `GET/POST /driver/chat`, `GET /driver/notifications`, `GET /driver/income?month`, `POST /driver/incidents`, `POST /driver/push-token`, `GET /driver/me`           |
| Trạng thái     | State machine cho booking, run và cargo (từ chối chuyển trạng thái sai)                                                                                                                                                                                                                                                                                                                                         |

**2E. Test:** unit cho pricing, seat, state machine; e2e (Supertest + Testcontainers Postgres/PostGIS) cho luồng đặt vé → điều phối → tài xế chạy chuyến.

### Giai đoạn 3 — Web Booking (10–12 ngày)

**Nền**

- Chuyển trang tĩnh và trang danh sách sang **Server Components**.
- `generateMetadata` cho từng trang; `sitemap.ts`, `robots.ts`; JSON-LD (Organization, BusRoute/Trip).
- Ảnh tự host; `next/font` (Inter, subset `vietnamese`).
- Header 72px đúng pen, footer chuẩn, menu mobile dạng sheet.

| Route                                                               | Frame pen                     | Việc chính                                                                                                                                                          |
| ------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                                 | A1 Trang Chủ                  | Hero + thanh tìm chuyến (điểm đi/đến từ `routes`, DatePicker); khối “Hành trình được yêu thích” lấy dữ liệu thật; Featured; số liệu tin cậy                         |
| `/search`                                                           | A2 + **A3 Drawer (Mở hé)**    | Lọc phía server, query lưu trên URL; card chuyến có giờ đi/đến, giá thật, ghế trống, loại xe; **drawer xem trước sơ đồ ghế**; skeleton; empty state gợi ý ngày khác |
| `/booking/[tripId]/seats`                                           | A4 Seat Map (+ A5 cho 12 chỗ) | Layout ghế lấy từ `vehicle_type`; legend; thanh hành động sticky; **giữ ghế 10 phút** có đồng hồ đếm ngược; ghế cập nhật realtime qua socket                        |
| `/booking/[tripId]/info`                                            | A6 Thông tin                  | Thông tin **từng hành khách theo ghế**, người đặt hộ, điểm đón/trả: chọn từ `stops` hoặc nhập địa chỉ tự do + **bản đồ MapLibre có marker thật**; validate zod      |
| `/booking/[tripId]/checkout`                                        | A7 Thanh toán                 | Tóm tắt đơn với giá do server tính, mã khuyến mãi (tùy chọn), chọn phương thức                                                                                      |
| (modal)                                                             | A8 Popup QR                   | **VietQR động** (đúng số tiền + nội dung CK); tự chuyển trạng thái khi webhook xác nhận                                                                             |
| `/booking/success/[code]`                                           | A9 Thành công                 | Mã đơn `NL-xxxxxx` lưu trong DB, QR check-in, nút thêm vào lịch, hướng dẫn                                                                                          |
| `/my-tickets`                                                       | A10 / A11                     | Nhập SĐT → **OTP** → danh sách vé, chi tiết vé, hủy vé theo chính sách, trạng thái thanh toán                                                                       |
| `/cargo`, `/cargo/book`, `/cargo/quote`, `/cargo/success/[waybill]` | Khu B (B1–B4)                 | Form người gửi/nhận/địa chỉ/kích thước/dễ vỡ/COD → báo giá thật → tạo đơn → mã vận đơn thật + trang tra cứu                                                         |
| `/about`, `/pricing`, `/contact`                                    | A12 / A13 / A14               | Bảng giá lấy từ `price_rules` (sửa mâu thuẫn ghế VIP); form liên hệ gửi API (tạo ticket cho `nvCcSupportInbox`)                                                     |
| `/terms`, `/privacy`, `/faq`, 404                                   | Khu B pháp lý                 | FAQ dạng **Accordion** đúng đặc tả; nội dung render tĩnh (SSG)                                                                                                      |

**DoD:** Lighthouse ≥ 90 (Performance/SEO/A11y) trên mobile; Playwright test đi hết luồng đặt vé và thanh toán (webhook giả lập).

### Giai đoạn 4 — Web Admin (18–22 ngày)

**Nền**

- Route group `(auth)/login` và `(console)/layout.tsx` chứa AdminShell. Bỏ việc mỗi trang tự import shell; bỏ `AdminPenMeta`.
- Sidebar **nhóm menu** (Vận hành / Đơn hàng / Đội xe / Tài chính / Báo cáo / Hệ thống), lọc theo quyền; thu gọn bằng CSS (không dùng `matchMedia`, nên không bị nháy layout khi SSR).
- Header có breadcrumb, tìm kiếm nhanh (⌘K), chuông thông báo realtime, menu người dùng (hồ sơ, đổi mật khẩu, đăng xuất).
- Một theme tối duy nhất cho toàn console; không còn trang sáng/tối xen kẽ.

| Thứ tự | Route                                                     | Frame                                                                                        | Nội dung                                                                                                                                                                                     |
| ------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | `/login`                                                  | — (thiết kế mới theo brand)                                                                  | Split layout: ảnh xe + form; xử lý lỗi, khóa tạm khi nhập sai nhiều lần; bỏ gợi ý tài khoản demo                                                                                             |
| 2      | `/dashboard`                                              | `nvDash`                                                                                     | KPI thật (doanh thu, vé, chuyến, xe đang chạy) kèm so sánh kỳ trước; biểu đồ doanh thu 7/30 ngày và tỉ lệ lấp ghế (recharts, theme token); danh sách chuyến sắp chạy; cảnh báo vượt sức chứa |
| 3      | `/vehicles` (+ new / [id] / edit)                         | `nvFleet`, `vnCreVeh`, `BYSRc`, `smD7h`                                                      | DataTable thật, lọc trạng thái, loại xe, lịch bảo dưỡng                                                                                                                                      |
| 4      | `/vehicles/drivers` (+ new / [id] / edit)                 | `Xox9m`, `vnCreDrv`, `GU9mg`, `kvt1Y`                                                        | Hoàn thiện form tạo tài xế (submit thật, avatar lưu vào hồ sơ); **bỏ cột mật khẩu**; đặt lại mật khẩu qua hành động riêng                                                                    |
| 5      | `/settings/*` (tách 5 sub-route)                          | `nvCfgRoutesStops`, `nvCfgTimeSlots`, `nvCfgPricing`, `nvCfgCodPolicy`, `nvCfgNotifications` | Tuyến/điểm dừng trên bản đồ, khung giờ lặp, bảng giá, chính sách COD, mẫu thông báo                                                                                                          |
| 6      | `/bookings` (+ new / [id] / edit)                         | `nvOrdPage`, `nvOrdP1*`                                                                      | Bảng có lọc theo chuyến/ngày/trạng thái/thanh toán; chi tiết có timeline trạng thái; tạo vé hộ khách (dùng lại SeatMap)                                                                      |
| 7      | **`/dispatch`, `/dispatch/[batchId]`**                    | `nvSmartDispPage`                                                                            | **Màn quan trọng nhất** (chi tiết bên dưới)                                                                                                                                                  |
| 8      | `/trip-runs` (+ [id] / edit / manifest)                   | `nvTripRun*`                                                                                 | Danh sách chuyến chạy; manifest in được (CSS print) xếp theo `pickup_order`; nút xuất lệnh                                                                                                   |
| 9      | `/monitor`                                                | `nvGsMap`                                                                                    | Bản đồ MapLibre: xe di chuyển realtime, click vào xe xem tài xế, tốc độ, tiến độ đón; danh sách bên cạnh; cảnh báo SOS nổi bật                                                               |
| 10     | `/cargos` (+ new / [id] / edit / handoff / cod-reconcile) | `nvCargoOpsList`, `nvOrdP2*`, `nvCargoHandoff`, `nvCargoCodReconcile`                        | Vận đơn, bàn giao, đối soát COD theo tài xế/ngày                                                                                                                                             |
| 11     | `/customers` (+ [id] / edit)                              | `nvCust*`                                                                                    | Hồ sơ khách + lịch sử vé, LTV                                                                                                                                                                |
| 12     | `/finance` (+ [id] / edit)                                | `nvFinance`, `nvFn*`                                                                         | Sổ thu/chi liên kết payment; lọc, xuất CSV                                                                                                                                                   |
| 13     | `/call-center/*` (3 sub-route)                            | `nvCcCreateBooking`, `nvCcRequests`, `nvCcSupportInbox`                                      | Đặt vé nhanh qua điện thoại, yêu cầu đổi/hủy, hộp thư hỗ trợ                                                                                                                                 |
| 14     | `/reports/*` (4 sub-route)                                | `nvRptTrips`, `nvRptRevenue`, `nvRptCargo`, `nvRptDrivers`                                   | Biểu đồ + bảng, chọn khoảng ngày, xuất Excel                                                                                                                                                 |
| 15     | `/rbac/*` + `/audit`                                      | `nvRbacUsers` / `Roles` / `Permissions`, `nvAuditLog`                                        | Quản lý người dùng, vai trò, ma trận quyền; nhật ký có diff. Gộp `/users` vào `/rbac/users`                                                                                                  |

**Màn Điều phối (`/dispatch/[batchId]`)**

- Tab chọn lô chuyến.
- Cột trái: pool booking chưa xếp (lọc, tìm).
- Giữa: các cột xe (sức chứa X/Y, thanh lấp đầy), kéo thả bằng dnd-kit, **cảnh báo khi vượt sức chứa**.
- Phải: bản đồ với cụm và lộ trình từng xe (màu theo xe).
- Nút **“Chạy thuật toán”** gọi `POST /dispatch/batches/:id/plan` và hiển thị bản nháp có thể sửa tay.
- Nút **“Chốt & xuất lệnh”** commit kế hoạch, đẩy socket sang app tài xế.
- Hoàn tác/làm lại cho thao tác kéo thả.

### Giai đoạn 5 — App Tài xế (12–15 ngày)

**Nền**

- Auth gate: token trong SecureStore, có refresh, tự đăng xuất khi nhận 401.
- `api-client` + TanStack Query; socket có kèm token.
- **Xin quyền thật** (location foreground + background, notifications, camera).
- GPS chạy nền bằng `expo-task-manager` (gửi mỗi 10–15 giây khi đang trong ca; hàng đợi offline).
- Đăng ký push token.
- `app.json`: bundle id, icon, splash.
- Error boundary; banner báo mất mạng.

| Màn                                           | Frame (`app-mobile.pen`)    | Việc chính                                                                                                                                                                                                         |
| --------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Login                                         | Login                       | Ghi nhớ đăng nhập, ẩn/hiện mật khẩu, tránh bàn phím che form, thông báo lỗi thân thiện                                                                                                                             |
| Permissions                                   | Permissions                 | Gọi API xin quyền thật; giải thích lý do; chỉ cho đi tiếp khi đã cấp đủ quyền bắt buộc                                                                                                                             |
| Home (Chuyến)                                 | Home                        | Tab Chờ chạy / Đang chạy / Hoàn thành; card chuyến; trạng thái ca rõ ràng; cập nhật realtime khi admin xuất lệnh                                                                                                   |
| Trip Detail (Phơi lệnh)                       | TripDetail                  | Danh sách đón/trả theo `pickup_order`/`dropoff_order`, ghi chú, cargo; nút **Bắt đầu hành trình**                                                                                                                  |
| Active Navigation                             | ActiveNav                   | Bản đồ thật + polyline; khách kế tiếp lấy từ dữ liệu; nút gọi khách; **SwipeToConfirm** đã đón/đã trả; luồng “không liên lạc được” (NO_SHOW); tự chuyển sang điểm kế; deep link Google Maps; nút SOS luôn hiển thị |
| Passengers                                    | Passengers                  | Check-in bằng QR (expo-camera) hoặc thủ công; trạng thái từng khách                                                                                                                                                |
| Cargo (Pick / Detail / Scan / COD / Transfer) | Cargo\*                     | Quét mã vận đơn thật, có đèn flash; nhận hàng/giao hàng có ảnh xác nhận; thu COD; chuyển hàng sang chuyến khác                                                                                                     |
| Chat                                          | `app-mobile-chat-shift.pen` | Chat realtime với điều hành, lịch sử, badge chưa đọc                                                                                                                                                               |
| End Shift (Ca)                                | Shift                       | Tổng kết ca lấy từ API; checklist **bắt buộc** trước khi kết ca; đối soát COD                                                                                                                                      |
| Notifications / Income / Profile / SOS        | tương ứng                   | Dữ liệu thật; Profile có xe, bằng lái, đổi mật khẩu, đăng xuất; SOS gửi kèm vị trí và ảnh, admin nhận cảnh báo                                                                                                     |

**Tổ chức lại IA:** 4 tab Chuyến / Hàng / Chat / Tôi. Thông báo, Thu nhập, Hồ sơ và Ca chuyển vào tab “Tôi”. Navigation truyền `id` thay vì cả object.

### Giai đoạn 6 — Engine điều phối thông minh (8–10 ngày)

1. **Gom cụm:** `ST_ClusterDBSCAN(pickup_geog, eps := DISPATCH_CLUSTER_EPS_M, minpoints := 1)`, có xét thêm cụm điểm trả để không tách nhóm phân tán.
2. **Ma trận khoảng cách:** gọi OSRM `/table` (cache theo cặp tọa độ); fallback sang Haversine × hệ số đường bộ nếu OSRM không chạy.
3. **Gán xe (CVRP)**, chia hai bước:
   - **Bước 1 (Node, làm ngay):** heuristic Clarke–Wright savings có ràng buộc sức chứa, sau đó tối ưu 2-opt / or-opt. Đủ tốt cho dưới 50 khách mỗi lô.
   - **Bước 2 (tùy chọn):** microservice Python dùng **Google OR-Tools** (FastAPI, chạy trong Docker); API gọi qua HTTP, lấy heuristic làm fallback.
4. **Thứ tự đón/trả:** TSP mở: bãi xe → các điểm đón → lối lên cao tốc; xuống cao tốc → các điểm trả.
5. **Ngoại lệ:** khách vượt sức chứa được đưa vào danh sách `unassigned` kèm lý do; admin xử lý bằng kéo thả.
6. **Lưu kết quả:** bảng `dispatch_plans` (bản nháp, có version) → commit thì ghi `trip_runs` + `bookings.trip_run_id/pickup_order/dropoff_order` trong **một transaction**; đổi trạng thái lô sang `CLUSTERED`.
7. **Test:** bộ dữ liệu mẫu 30 khách / 3 xe ở Hà Nội; kiểm tra không có xe nào vượt sức chứa và tổng quãng đường không tệ hơn mức chuẩn.

### Giai đoạn 7 — QA, hiệu năng & triển khai (5–7 ngày)

- [ ] So pixel từng màn với PNG pen (Playwright screenshot ở 1440 và 390; ngưỡng sai lệch).
- [ ] E2E xuyên hệ thống: khách đặt vé → thanh toán → admin chạy điều phối → tài xế nhận chuyến → đón/trả → báo cáo cập nhật.
- [ ] Audit accessibility (axe), Lighthouse, test tải API (k6) cho tìm chuyến và đặt vé.
- [ ] Docker: `npm ci`, multi-stage, có volume cho uploads (hoặc S3/R2), pin phiên bản OSRM, migration tự chạy trước khi start.
- [ ] Runbook: backup DB, xoay vòng secret, giám sát (Sentry FE/BE/RN, uptime).
- [ ] EAS build cho app tài xế (internal distribution).

---

## 5. Tổng thời gian & thứ tự ưu tiên

| Giai đoạn           | Thời lượng (1 dev)                                | Phụ thuộc                      |
| ------------------- | ------------------------------------------------- | ------------------------------ |
| 0. Chuẩn bị         | 0,5–1 tuần                                        | —                              |
| 1. Design system    | 1,5 tuần                                          | 0                              |
| 2. Backend core     | 2,5–3 tuần                                        | 0                              |
| 3. Web Booking      | 2–2,5 tuần                                        | 1, 2                           |
| 4. Web Admin        | 4 tuần                                            | 1, 2                           |
| 5. App Tài xế       | 2,5–3 tuần                                        | 1, 2                           |
| 6. Engine điều phối | 2 tuần                                            | 2 (có thể làm song song với 4) |
| 7. QA & Deploy      | 1–1,5 tuần                                        | tất cả                         |
| **Tổng**            | **~16–18 tuần (1 dev)**, **~9–10 tuần (2–3 dev)** |                                |

**Mốc demo đề xuất:**

- **M1 (cuối GĐ 2):** API an toàn + Swagger + design system xem được.
- **M2:** Khách đặt vé và thanh toán thật trên web-booking.
- **M3:** Admin quản lý đội xe, cấu hình, booking + điều phối kéo thả.
- **M4:** Tài xế chạy chuyến end-to-end + monitor realtime.
- **M5:** Thuật toán tự động + báo cáo → go-live.

---

## 6. Quyết định cần chủ dự án chốt

1. **Cổng thanh toán:** VietQR + webhook (SePay/Casso), hay VNPay/MoMo chính thức (cần hợp đồng merchant)?
2. **OR-Tools:** chấp nhận microservice Python, hay giữ heuristic thuần Node?
3. **Bản đồ:** MapLibre + tile miễn phí (OSM/MapTiler free tier), hay Google Maps trên cả web (tốn phí)?
4. **SMS/Zalo ZNS:** nhà cung cấp nào (eSMS, SpeedSMS, Zalo OA)?
5. **Tra cứu vé:** bắt buộc OTP, hay chấp nhận “mã đơn + SĐT”?
6. **Đa ngôn ngữ (vi/en)** cho web-booking ngay từ đầu?

---

## 7. Cách làm việc mỗi màn (checklist PR)

- [ ] Có ảnh frame pen (`docs/design-ref/...`) và ảnh code ở cùng viewport.
- [ ] Chỉ dùng token và component từ `design-tokens` / `shared-ui` / `shared-mobile-ui`; không có hex rời.
- [ ] Có đủ các trạng thái loading / empty / error.
- [ ] Gọi API qua `api-client`, kiểu lấy từ `shared-types`.
- [ ] Có test (unit / e2e).
- [ ] Cập nhật trạng thái trong bảng mapping route ↔ frame.
