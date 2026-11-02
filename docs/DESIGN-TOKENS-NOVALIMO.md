# NovaLimo — Design system (GĐ 1)

Nguồn sự thật duy nhất cho màu, chữ, khoảng cách, bo góc, bóng và chuyển động: **`libs/design-tokens`**.
Xem trực quan tại **`/dev/design-system`** trong web-admin (`npx next dev apps/web-admin --port 3002`).

## Kiến trúc

```
libs/design-tokens        palette.ts (hex — nơi DUY NHẤT có mã màu) → semantic.ts (theme dark/light)
                          scales.ts (type, spacing, radius, motion, z-index, breakpoints, layout)
                          css.ts → src/generated/tokens.css   (nx run design-tokens:generate)
                          rn.ts  → rnTheme cho app tài xế
libs/shared-ui            Design system web (Admin + Booking): primitives, patterns, antd theme
libs/shared-ui/legacy     Component cũ — chỉ dùng cho màn chưa rebuild, sẽ xóa sau GĐ 5
libs/shared-mobile-ui     Kit React Native cho app-driver
```

## Dùng trong code

| Nơi                | Cách dùng                                                                                                                                                                                                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tailwind (web)     | `bg-canvas`, `bg-surface-1/2/3`, `text-fg`, `text-fg-muted`, `border-border-subtle`, `bg-brand`, `text-on-brand`, `text-brand-fg`, `bg-success-bg text-success-fg`, `rounded-control/card/panel/sheet`, `shadow-e1/e2/e3/brand`, `text-ui` (13px), `text-display`, `ease-nova`, palette `navy-*` `gold-*` |
| antd               | `NovaThemeProvider mode="dark" \| "light"` (theme sinh từ token, locale vi_VN)                                                                                                                                                                                                                            |
| Theme theo vùng    | Đặt `data-theme="light"` hoặc `"dark"` trên bất kỳ phần tử nào; biến `--nl-*` đổi theo                                                                                                                                                                                                                    |
| React Native       | `import { c, sp, r, type } from '@limousine-workspace/shared-mobile-ui'`                                                                                                                                                                                                                                  |
| Giá trị thô (hiếm) | `import { palette, darkTheme } from '@limousine-workspace/design-tokens'`                                                                                                                                                                                                                                 |

**Cấm** viết mã hex trong `apps/**` và `shared-ui`: ESLint `designTokenGuard` đang cảnh báo, sẽ chuyển thành lỗi sau GĐ 4.

## Màu chính

| Token         | Dark                  | Light           | Ghi chú                            |
| ------------- | --------------------- | --------------- | ---------------------------------- |
| canvas        | navy-900 `#05070F`    | slate-50        | nền trang                          |
| surface-1     | navy-800 `#0B1020`    | white           | card, header (neo theo pen)        |
| surface-2 / 3 | `#111827` / `#1A2236` | slate-100 / 200 | input, hover, bảng                 |
| brand         | gold-500 `#D4AF37`    | gold-500        | CTA chính (neo theo pen)           |
| brand-fg      | gold-400              | gold-800        | chữ / link vàng, đạt tương phản AA |
| on-brand      | navy-800              | navy-800        | chữ trên nút vàng                  |

Tương phản WCAG AA được kiểm tra tự động trong `libs/design-tokens/src/lib/tokens.spec.ts`.

## Ghi chú kỹ thuật

- **Cascade layers:** `global.css` của mỗi app khai báo `@layer theme, base, antd, components, utilities;` và bọc `<AntdRegistry layer>`. Nhờ đó class Tailwind thắng style antd mà không cần `!important` (đây là gốc rễ của các override `!` trong code cũ).
- **Bản đồ:** MapLibre + OpenFreeMap (`fiord` cho dark, `positron` cho light), không cần API key. Có thể đổi qua prop `styleUrl`.
- **Font:** Inter qua `next/font` (biến `--font-inter`) cho web; `@expo-google-fonts/inter` cho mobile.
- **Màu categorical** (`categorical` trong design-tokens): dùng cho biểu đồ và màu riêng từng xe trên bản đồ điều phối/giám sát.

## Đối chiếu Pencil

Màu neo (`#0B1020`, `#D4AF37`, Inter) lấy từ `web-admin.pen`, `web-bôking.pen`, `app-mobile.pen`. Khi mở được Pencil, chạy `get_variables` để so lại thang màu, rồi cập nhật `palette.ts` và chạy `nx run design-tokens:generate`.
