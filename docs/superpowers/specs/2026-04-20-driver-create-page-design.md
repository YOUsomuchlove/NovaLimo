# NovaLimo Admin — Trang “Tạo tài xế mới” (UI-only)

## Mục tiêu

- Dựng lại trang `apps/web-admin/src/app/vehicles/drivers/new/page.tsx` để **giống 1:1 theo ảnh mock** (bố cục, typography, spacing, màu sắc, bo góc).
- **Chỉ làm UI** (không cần gọi API/submit thật). Nút “Tạo tài xế” có thể là `type="button"` và tạm thời không làm side-effect.
- Trường **Mật khẩu** hiển thị dạng **password** (ẩn ký tự).

## In-scope

- Layout header + action buttons (Hủy / Tạo tài xế)
- Bố cục 2 cột: khối ảnh đại diện (trái) + form card (phải)
- Style dark đồng bộ với các view admin hiện có (ví dụ `FleetManagementView`)
- Nhóm trường form và nhãn tiếng Việt đúng như mock
- Footer nhỏ (copyright + hotline) giống mock

## Out-of-scope (giai đoạn này)

- Validation/business rules đầy đủ
- Submit/POST API, loading/error state thực
- Upload ảnh đại diện thật, crop, lưu file
- Routing/confirm dialog khi bấm “Hủy”

## Thông tin tham chiếu

- Mock ảnh do user cung cấp (chat).
- Nền/brand token: `nova-navy` / `nova-gold` đã có trong `apps/web-admin/src/app/global.css`.

## Cấu trúc trang (IA)

### 1) AdminShell

- Dùng `AdminShell` để giữ sidebar + topbar giống toàn hệ admin.
- Title: **Tạo tài xế mới**
- Subtitle: **Tạo hồ sơ và tài khoản đăng nhập ứng dụng cho tài xế**
- Header actions (góc phải, cùng hàng title):
  - **Hủy**: button ghost/dark, bo tròn, border mờ
  - **Tạo tài xế**: button primary nền `nova-gold`, chữ đen, font đậm, bo tròn

### 2) Nội dung chính (2 cột)

- Container: canh giữa, max-width lớn (đủ rộng như mock), padding-top vừa phải.
- Grid:
  - Cột trái: ~280–320px
  - Cột phải: còn lại

#### Cột trái: “Ảnh đại diện”

- Label nhỏ: **Ảnh đại diện**
- Avatar tròn lớn (placeholder):
  - nền dark + ring `white/10`
  - icon user ở giữa
- Text mô tả nhỏ dưới avatar (theo mock, nếu có).

#### Cột phải: section title + form card

- Section title: **Hồ sơ & tài khoản tài xế**
- Subtext nhỏ: “Mật khẩu hiển thị đầy đủ cho admin khi tạo/cấp lại” (theo mock; nhưng input vẫn là password).
- Card dark:
  - nền rất đậm (tông navy)
  - border `white/10`, radius ~12–16
  - shadow nhẹ

## Form fields & nhóm

### Nhóm “Thông tin liên hệ”

- Họ và tên (Input)
- Số điện thoại (Input)
- Email (Input)

### Nhóm “Tài khoản ứng dụng”

- Tên đăng nhập (Input)
- Mật khẩu hiển thị đầy đủ (InputPassword) — **kiểu password**

### Các trường chọn trạng thái

- Trạng thái tài khoản (Select) — ví dụ: Hoạt động / Đã khóa
- App Mobile (Select) — ví dụ: Chưa cấp / Đã cấp

### Nhóm “Ghi chú”

- Ghi chú (Textarea)

## Hệ style (CSS/Tailwind/AntD skin)

### Nguyên tắc

- Ưu tiên “skin” AntD bằng Tailwind utility (giống `FleetManagementView.tsx`) để:
  - không ảnh hưởng các trang khác
  - dễ kiểm soát 1:1 với mock

### Tokens / màu

- Background: `bg-nova-navy` (đã set body)
- Surface card: navy đậm hơn + `bg-white/5` cho input
- Border: `border-white/10` (hover `border-white/20`)
- Primary: `bg-nova-gold` + text đen
- Text:
  - Title: trắng
  - Subtitle/label: trắng mờ (`white/40`–`white/60`)

### Input/Select/Button sizing

- Chiều cao input/select: ~40px
- Radius input/select/button: ~10–12px
- Focus ring: viền sáng hơn + không glow xanh mặc định

## Thành phần/Files dự kiến chỉnh

- `apps/web-admin/src/app/vehicles/drivers/new/page.tsx`
  - thay placeholder bằng layout hoàn chỉnh theo spec
  - thêm headerExtra/action buttons
- (Có thể) `apps/web-admin/src/app/global.css`
  - chỉ bổ sung nhỏ nếu cần đồng bộ popup dropdown/select (tránh nền trắng), **ưu tiên scope theo class** để không ảnh hưởng toàn app

## Tiêu chí nghiệm thu (Definition of Done)

- Trang “Tạo tài xế mới” nhìn **khớp ảnh mock** về:
  - bố cục 2 cột
  - card dark + spacing
  - style input/select/button
  - header actions (Hủy / Tạo tài xế)
- Không phát sinh lỗi lint/typescript trong các file đã sửa.

