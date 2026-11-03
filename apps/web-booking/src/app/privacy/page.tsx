import type { Metadata } from 'next';
import { LegalPage } from '../../components/content/LegalPage';
import { DEFAULT_SETTINGS, publicApi, safe } from '../../lib/api';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật',
  description:
    'NovaLimo thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn như thế nào.',
  alternates: { canonical: '/privacy' },
};
export const revalidate = 300;

export default async function PrivacyPage() {
  const { company } = await safe(publicApi.settings(), DEFAULT_SETTINGS);
  return (
    <LegalPage
      eyebrow="Pháp lý"
      title="Chính sách bảo mật"
      updated="03/11/2026"
      sections={[
        {
          id: 'thu-thap',
          title: 'Thông tin chúng tôi thu thập',
          body: (
            <ul>
              <li>
                Họ tên, số điện thoại và email (nếu có) của người đặt và hành
                khách.
              </li>
              <li>Địa chỉ đón/trả và tọa độ bản đồ bạn chọn.</li>
              <li>
                Thông tin giao dịch: mã vé, số tiền, phương thức thanh toán.
                Chúng tôi không lưu số thẻ hay thông tin đăng nhập ngân hàng.
              </li>
            </ul>
          ),
        },
        {
          id: 'su-dung',
          title: 'Mục đích sử dụng',
          body: (
            <ul>
              <li>
                Xếp chuyến, sắp xếp lộ trình đón và để tài xế liên hệ với bạn.
              </li>
              <li>
                Xác nhận thanh toán, gửi mã vé và thông báo thay đổi lịch trình.
              </li>
              <li>Hỗ trợ khách hàng và giải quyết khiếu nại.</li>
            </ul>
          ),
        },
        {
          id: 'chia-se',
          title: 'Chia sẻ thông tin',
          body: (
            <p>
              Chúng tôi chỉ chia sẻ tên, số điện thoại và điểm đón với tài xế
              được phân công cho chuyến của bạn. {company.name} không bán hay
              cho thuê dữ liệu cá nhân cho bên thứ ba. Thông tin chỉ được cung
              cấp cho cơ quan nhà nước khi có yêu cầu hợp pháp.
            </p>
          ),
        },
        {
          id: 'bao-ve',
          title: 'Bảo vệ dữ liệu',
          body: (
            <ul>
              <li>Dữ liệu được truyền qua kết nối mã hóa (HTTPS).</li>
              <li>
                Tra cứu vé theo số điện thoại yêu cầu mã xác thực OTP gửi tới
                chính số đó.
              </li>
              <li>
                Số điện thoại và thông tin cá nhân không bao giờ xuất hiện trong
                đường dẫn (URL).
              </li>
            </ul>
          ),
        },
        {
          id: 'luu-tru',
          title: 'Thời gian lưu trữ',
          body: (
            <p>
              Thông tin đặt vé được lưu trong thời gian cần thiết cho việc vận
              hành, đối soát và nghĩa vụ kế toán theo quy định pháp luật.
            </p>
          ),
        },
        {
          id: 'quyen',
          title: 'Quyền của bạn',
          body: (
            <p>
              Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân của
              mình. Gửi yêu cầu tới{' '}
              <a href={`mailto:${company.email}`}>{company.email}</a> hoặc gọi{' '}
              <a href={`tel:${company.hotline.replace(/\s/g, '')}`}>
                {company.hotline}
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
