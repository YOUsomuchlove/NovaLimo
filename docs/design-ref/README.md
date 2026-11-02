# Ảnh tham chiếu thiết kế (Pencil → PNG)

Ảnh chuẩn để so pixel khi rebuild (xem `docs/REBUILD-PLAN.md` §0.2 và §7).

| Thư mục        | Nguồn                                            |
| -------------- | ------------------------------------------------ |
| `web-admin/`   | `hệ thống quản lý xe limosin/New/web-admin.pen`  |
| `web-booking/` | `hệ thống quản lý xe limosin/New/web-bôking.pen` |
| `app-driver/`  | `app-mobile.pen`, `app-mobile-chat-shift.pen`    |

Quy ước tên file: `<frameId>.png`, đúng frame ID trong `Bảng Mapping Route Code ↔ Màn Thiết Kế.md` và các file `PENCIL-FRAMES.md`.

**Cách xuất:** mở file `.pen` trong ứng dụng Pencil, rồi nhờ Claude xuất bằng Pencil MCP (cần app Pencil đang chạy).

**Trạng thái:** chưa xuất. Lúc chạy GĐ 0, app Pencil chưa mở nên MCP không kết nối được.
