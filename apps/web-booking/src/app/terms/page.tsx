import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '../../components/content/LegalPage';
import { DEFAULT_SETTINGS, publicApi, safe } from '../../lib/api';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng',
  description:
    'Điều khoản đặt vé, thanh toán, hủy vé và ký gửi hàng hóa khi sử dụng dịch vụ NovaLimo.',
  alternates: { canonical: '/terms' },
};
export const revalidate = 300;

export default async function TermsPage() {
  const { company, booking } = await safe(
    publicApi.settings(),
    DEFAULT_SETTINGS,
  );
  return (
    <LegalPage
      eyebrow="Pháp lý"
      title="Điều khoản sử dụng"
      updated="03/11/2026"
      sections={[
        {
          id: 'pham-vi',
          title: 'Phạm vi áp dụng',
          body: (
            <p>
              Điều khoản này áp dụng cho mọi giao dịch đặt vé xe limousine và ký
              gửi hàng hóa thực hiện qua website, ứng dụng hoặc tổng đài của{' '}
              {company.name}. Khi hoàn tất đặt chỗ, bạn xác nhận đã đọc và đồng
              ý với các điều khoản dưới đây.
            </p>
          ),
        },
        {
          id: 'dat-ve',
          title: 'Đặt vé và giữ chỗ',
          body: (
            <ul>
              <li>Mỗi lượt đặt tối đa {booking.max_seats_per_booking} ghế.</li>
              <li>
                Ghế bạn chọn được giữ trong {booking.seat_hold_minutes} phút để
                bạn điền thông tin; hết thời gian, ghế được trả lại cho khách
                khác.
              </li>
              <li>
                Giá vé được hệ thống tính tại thời điểm đặt và hiển thị rõ trước
                khi bạn xác nhận.
              </li>
              <li>
                Bạn chịu trách nhiệm về tính chính xác của số điện thoại, tên
                hành khách và địa chỉ đón/trả.
              </li>
            </ul>
          ),
        },
        {
          id: 'thanh-toan',
          title: 'Thanh toán',
          body: (
            <ul>
              <li>
                Với chuyển khoản, vé cần được thanh toán trong{' '}
                {booking.payment_due_minutes} phút kể từ khi tạo; quá hạn, vé có
                thể bị hủy tự động.
              </li>
              <li>
                Vui lòng chuyển đúng số tiền và nội dung chuyển khoản để hệ
                thống xác nhận tự động.
              </li>
              <li>
                Với thanh toán tiền mặt, bạn thanh toán trực tiếp cho tài xế khi
                lên xe.
              </li>
            </ul>
          ),
        },
        {
          id: 'huy-ve',
          title: 'Hủy vé và hoàn tiền',
          body: (
            <ul>
              <li>
                Hủy trước giờ khởi hành từ {booking.free_cancel_hours} giờ trở
                lên: hoàn 100% giá vé.
              </li>
              <li>
                Hủy trong vòng {booking.free_cancel_hours} giờ trước khởi hành:
                hoàn {booking.late_cancel_refund_pct}% giá vé.
              </li>
              <li>
                Không có mặt tại điểm đón khi xe tới được xem như sử dụng dịch
                vụ và không được hoàn tiền.
              </li>
              <li>
                Tiền hoàn được chuyển về tài khoản thanh toán ban đầu trong 3–7
                ngày làm việc.
              </li>
            </ul>
          ),
        },
        {
          id: 'don-tra',
          title: 'Đón trả khách',
          body: (
            <p>
              Giờ đón dự kiến có thể sớm hoặc muộn hơn vài phút tùy điều kiện
              giao thông. Tài xế sẽ liên hệ trước khi tới; vui lòng có mặt tại
              điểm đón đúng hẹn. Mỗi hành khách được mang một vali và một túi
              xách tay.
            </p>
          ),
        },
        {
          id: 'hang-hoa',
          title: 'Ký gửi hàng hóa',
          body: (
            <ul>
              <li>
                Không nhận hàng cấm, hàng dễ cháy nổ, động vật sống, tiền mặt và
                giấy tờ có giá.
              </li>
              <li>
                Người gửi kê khai đúng nội dung và giá trị hàng; cước phí được
                tính theo trọng lượng và kích thước thực tế.
              </li>
              <li>
                Với đơn thu hộ (COD), tiền thu hộ được đối soát và chuyển cho
                người gửi theo chu kỳ thanh toán.
              </li>
            </ul>
          ),
        },
        {
          id: 'lien-he',
          title: 'Liên hệ',
          body: (
            <p>
              Mọi thắc mắc vui lòng gọi hotline{' '}
              <a href={`tel:${company.hotline.replace(/\s/g, '')}`}>
                {company.hotline}
              </a>
              , email <a href={`mailto:${company.email}`}>{company.email}</a>{' '}
              hoặc gửi yêu cầu qua <Link href="/contact">trang liên hệ</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
