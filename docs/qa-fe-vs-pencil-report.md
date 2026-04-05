# Báo cáo QA: màn hình code vs Pencil vs API

**Ngày:** 2026-04-04  
**Phạm vi:** [apps/web-booking](file:///g:/NovaLimo/apps/web-booking), [apps/web-admin](file:///g:/NovaLimo/apps/web-admin), [apps/app-driver](file:///g:/NovaLimo/apps/app-driver), [apps/api-server](file:///g:/NovaLimo/apps/api-server).

## 1. Phương pháp

| Trục | Cách kiểm tra |
|------|----------------|
| Phủ route / màn | Đối chiếu route thực tế (filesystem + navigator) với [PENCIL-FRAMES.md](file:///g:/NovaLimo/apps/web-booking/src/app/PENCIL-FRAMES.md) (booking), [web-admin PENCIL-FRAMES](file:///g:/NovaLimo/apps/web-admin/src/app/PENCIL-FRAMES.md), [app-driver PENCIL-FRAMES](file:///g:/NovaLimo/apps/app-driver/PENCIL-FRAMES.md) và [Bảng Mapping](file:///g:/NovaLimo/hệ%20thống%20quản%20lý%20xe%20limosin/New/Bảng%20Mapping%20Route%20Code%20↔%20Màn%20Thiết%20Kế.md). |
| API | So khớp lời gọi HTTP trong code với [docs/api-surface.md](file:///g:/NovaLimo/docs/api-surface.md); chạy `node tools/verify-integration.mjs` khi api-server đang chạy. |
| Pixel / layout | Export `get_screenshot` / `export_nodes` từ **Pencil MCP** trên đúng node id; chụp app cùng viewport (web 1280–1440; mobile 390). **Lưu ý:** MCP `open_document` có thể timeout nếu file `.pen` chưa mở trong Pencil — cần mở thủ công rồi chụp lại. |
| Nội dung & field | So sánh copy, form field, empty state với ảnh pen (thủ công hoặc checklist PR). |

## 2. Pencil MCP — inventory

- **Kết quả tự động:** `batch_get` / `open_document` với đường dẫn `app-mobile.pen` trả **timeout** trong môi trường CI agent (editor không gắn file).
- **Việc cần làm thủ công:** Mở từng file trong Pencil: `web-bôking.pen`, `web-admin.pen`, `app-mobile.pen`, `app-mobile-chat-shift.pen` — dùng `batch_get` pattern theo tên frame hoặc node id trong các file `PENCIL-FRAMES.md` để xuất PNG tham chiếu.

## 3. API smoke (`tools/verify-integration.mjs`)

- **Trạng thái:** `ECONNREFUSED` — không có process lắng nghe `localhost:3000` tại thời điểm chạy.
- **Khi kiểm tra lại:** `nx serve api-server` + PostgreSQL + `TYPEORM_SYNCHRONIZE=true` (hoặc stack Docker), rồi:

```bash
API_BASE_URL=http://localhost:3000/api node tools/verify-integration.mjs
```

## 4. Endpoint FE thực tế vs `docs/api-surface.md`

### 4.1 Web Booking

| File | Endpoint sử dụng | Khớp api-surface |
|------|------------------|------------------|
| `page.tsx`, `search/page.tsx` | `GET .../trip-batches` | Có |
| `booking/[tripBatchId]/page.tsx` | `GET .../bookings/taken-seats`, `POST .../bookings` | Có |
| `my-tickets/page.tsx` | `GET .../bookings?passenger_phone=` | Có |
| `libs/shared-ui` AddressSearch | `GET .../geocode?q=` (qua web-booking base URL) | Có |
| Các route `/cargo/*`, marketing | **Không gọi API** trong repo hiện tại | N/A — UI tĩnh / mock |

### 4.2 Web Admin

| Ghi chú |
|---------|
| `authFetch` và `loginAdmin` định nghĩa trong [api.ts](file:///g:/NovaLimo/apps/web-admin/src/lib/api.ts); **không có** `authFetch(` từ page nào khác trong `src/` (chỉ định nghĩa). |
| Các trang admin chủ yếu **placeholder** (Card “bám pen”) — chưa nối REST đầy đủ; cần map dần tới các route trong [api-surface.md](file:///g:/NovaLimo/docs/api-surface.md) khi triển khai CRUD. |

### 4.3 App Driver

| Hàm (client.ts) | Endpoint | Khớp api-surface |
|-------------------|----------|-------------------|
| `loginDriver` | `POST /auth/login/driver` | Có |
| `fetchMyRuns` | `GET /trips/my-runs?status=` | Có |
| `fetchRunDetail` | `GET /trips/my-runs/:id` | Có |
| `fetchCurrentShift` | `GET /driver/shifts/current` | Có |
| `startShift` / `endShift` | `POST /driver/shifts/start` \| `end` | Có |
| `postDriverLocation` | `POST /driver/location` | Có |
| `fetchMyCargos` | `GET /cargos/my-tasks` | Có |

## 5. Web Booking — route vs pen (`web-bôking.pen`)

| Route | Frame ID (PENCIL-FRAMES) | Ghi chú QA |
|-------|-------------------------|------------|
| `/` | `sMJzD` | Ảnh nền: [booking-pen-assets.ts](file:///g:/NovaLimo/apps/web-booking/src/lib/booking-pen-assets.ts) |
| `/search` | `Kl9cQ` | Drawer “mở hé” — kiểm tra tương tác |
| `/booking/[tripBatchId]` | `eWbxX` → `dQZgk` → `cFLNQ` → `wbBkSuccess` | 4 bước nội bộ cùng URL |
| `/my-tickets` | `43Hd5` / `43TrKq2` | |
| `/cargo`, `/cargo/book`, `/cargo/results`, `/cargo/success` | `wbCargo*` | Chưa gọi BE — chỉ đối chiếu UI |
| `/about`, `/pricing`, `/contact`, `/terms`, `/privacy`, `/faq` | theo PENCIL-FRAMES | Marketing |
| `not-found` | `wbPg404` | |

**Checklist visual (thủ công):** với mỗi route, so layout header 72px + footer + overlay token `NOVA_BRAND` / `booking-pen-assets`.

## 6. Web Admin — route vs pen (`web-admin.pen`)

- **42** file `page.tsx` dưới `src/app` — bao phủ dashboard, dispatch, trip-runs, bookings, cargos, customers, vehicles, finance, monitor, tracking, call-center, reports, settings, rbac, users, audit, login, dev.
- **Gap thường gặp:** nhiều màn con (handoff, cod-reconcile, new/edit) dùng Card placeholder — trục “đủ thông tin như pen” = **chưa đạt** cho đến khi layout + field khớp frame id trong [PENCIL-FRAMES](file:///g:/NovaLimo/apps/web-admin/src/app/PENCIL-FRAMES.md).
- **Nhóm tab** (`/reports`, `/settings`, `/rbac`, `/call-center`): bảng mapping ghi **Một phần** — cần đếm tab/con màn so với pen khi QA pixel.

## 7. App Driver — navigator vs pen (`app-mobile.pen`)

Đã có file mapping chi tiết: [apps/app-driver/PENCIL-FRAMES.md](file:///g:/NovaLimo/apps/app-driver/PENCIL-FRAMES.md).

**Khác biệt so với bản mapping cũ:** SOS, QR, COD, bàn giao, thông báo, thu nhập, hồ sơ, khách — **đã có** screen riêng trong `MainNavigator` / stack; xem bảng đã cập nhật trong repo.

## 8. `app-mobile-chat-shift.pen`

- Component đối chiếu: [MiniChatShiftPreview.tsx](file:///g:/NovaLimo/apps/app-driver/src/components/MiniChatShiftPreview.tsx).
- Node `mbMiniCanvas` có thể đổi tên — tìm trong Pencil bằng pattern `Mini` / `Canvas` sau khi mở file.

## 9. Bảng tổng hợp nhanh (Pass / Cần làm)

| Khu vực | Trục 1 (phủ màn) | Trục 2 (nội dung) | Trục 3 (CSS vs pen) | API |
|---------|------------------|-------------------|---------------------|-----|
| web-booking | Pass (route đủ) | Một phần (cargo chưa BE) | Cần screenshot so pen | Pass cho booking flow |
| web-admin | Pass (route đủ) | Nhiều placeholder | Cần screenshot so pen | Chưa tích hợp hàng loạt |
| app-driver | Pass (screen đủ theo pen chính) | Cần review copy/field | Cần screenshot so pen | Pass theo client.ts |
| api-server | N/A | N/A | N/A | Cần chạy smoke khi server up |

## 10. Ưu tiên sửa sau QA

1. **A** — Bật api-server + chạy lại `verify-integration.mjs`.  
2. **B** — Nối web-admin `authFetch` tới resource REST đã có trong api-server.  
3. **C** — Thay placeholder admin bằng layout khớp frame id.  
4. **D** — Pixel diff từng màn (booking + driver + admin) với ảnh Pencil.
