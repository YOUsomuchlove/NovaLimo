# NovaLimo — Design tokens (Pencil → code)

Single source of truth for colors/radius/font: **`@limousine-workspace/utils-core`** → `nova-limo-design-tokens.ts`.

## Brand (marketing / Admin / Booking / Driver)

| Token | Hex | Nguồn thiết kế |
|-------|-----|----------------|
| Navy | `#0B1020` | web-admin.pen sidebar, web-bôking.pen header |
| Navy deep | `#020617` | app-mobile.pen full-screen bg |
| Gold (primary CTA) | `#D4AF37` | CTA, tab active, Ant Design `colorPrimary` |
| Gold hover | `#c9a227` | Link hover (booking shell) |
| Layout bg (web) | `#f1f5f9` | Admin/Booking content area |

## Pencil variables (`web-bôking.pen`)

File Pencil định nghĩa thêm theme Light/Dark với biến shadcn-like (`--primary`, `--card`, `--radius-m`, …). Khi build UI **Ant Design**, ưu tiên map **Nova brand** (gold/navy) qua `ConfigProvider`; các biến Pencil dùng cho component tailwind-shadcn nếu có.

Trích từ Pencil (Dark ví dụ): `--background` `#131124`, `--card` `#1A182E`, `--foreground` `#E8E8EA`, `--radius-m` `24`.

## CSS `:root` (Next.js)

Import optional:

```css
/* libs/shared-ui/src/lib/tokens/nova-limo-css-variables.css */
```

Hoặc gọi `novaLimoCssVariablesBlock()` từ utils-core trong `global.css`.

## Pixel verification

1. Pencil MCP: `get_variables`, `get_screenshot` trên frame cần kiểm tra.
2. So khớp font **Inter** (web + Expo `Inter_*`).

## Liên kết

- [Bảng Mapping Route ↔ Màn thiết kế](../hệ%20thống%20quản%20lý%20xe%20limosin/New/Bảng%20Mapping%20Route%20Code%20↔%20Màn%20Thiết%20Kế.md) (đường dẫn tương đối từ repo nếu có thư mục `New/`)
