# Web Booking — tham chiếu Pencil (`web-bôking.pen`)

Mỗi route chính gắn frame ID để QA pixel (`get_screenshot` / so sánh PR).

| Route | Frame ID | Tên frame |
|-------|----------|-----------|
| `/` | `sMJzD` | Trang Chủ (Home Page) |
| `/search` | `Kl9cQ` | Trang Kết quả tìm kiếm chuyến xe |
| `/booking/[tripBatchId]` bước ghế | `eWbxX` | Sơ đồ ghế (Seat Map) |
| `/booking/...` bước info | `dQZgk` | Trang Thông tin (Booking) |
| `/booking/...` bước TT | `cFLNQ` | Trang Thanh toán (Checkout) + modal QR |
| `/booking/...` xong | `wbBkSuccess` | Đặt vé thành công |
| `/my-tickets` | `43Hd5` / `43TrKq2` | Tra cứu vé (trống / có kết quả) |
| `/cargo` | `wbCargoLanding` | Ký gửi hàng (Landing) |
| `/cargo/book` | `wbCargoBook` | Đặt gửi hàng |
| `/cargo/results` | `wbCargoResults` | Báo giá ký gửi |
| `/cargo/success` | `wbCargoSuccess` | Gửi hàng thành công |
| `/about` | `lPQio` | Trang Giới thiệu |
| `/pricing` | `SPHoT` | Trang Bảng giá |
| `/contact` | `A1Ssg` | Liên hệ & Hỗ trợ |
| `/terms` | `wbLegalTerms` | Điều khoản |
| `/privacy` | `wbLegalPrivacy` | Bảo mật |
| `/faq` | `wbFaq` | FAQ |
| `not-found` | `wbPg404` | 404 |

Ảnh nền & overlay: [`booking-pen-assets.ts`](../lib/booking-pen-assets.ts).
