'use client';

import React from 'react';
import { LegalContent } from '../../components/legal/LegalContent';
import { LegalPageShell } from '../../components/legal/LegalPageShell';
import { PEN_BG, PEN_OVERLAY } from '../../lib/booking-pen-assets';

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Điều khoản sử dụng"
      bgSrc={PEN_BG.legalTerms}
      overlayClassName={PEN_OVERLAY.legal}
    >
      <LegalContent>
        <p>
          <strong>1. Phạm vi dịch vụ:</strong> NovaLimo cung cấp dịch vụ vận
          chuyển hành khách và ký gửi hàng hóa theo tuyến đã công bố. Điều
          khoản này điều chỉnh việc đặt chỗ, thanh toán, và sử dụng dịch vụ qua
          website/ứng dụng.
        </p>
        <p>
          <strong>2. Đặt vé &amp; xác nhận:</strong> Thông tin đặt vé phải
          chính xác. Sau khi xác nhận, mã đơn/QR được dùng để lên xe và tra
          cứu. Thay đổi/hủy theo chính sách phí đã thông báo tại thời điểm đặt.
        </p>
        <p>
          <strong>3. Ký gửi hàng:</strong> Người gửi khai báo trung thực về
          loại hàng, khối lượng, giá trị. Hàng cấm, hàng nguy hiểm, hàng không
          đúng mô tả có thể bị từ chối. Phụ phí phát sinh khi kiểm tra thực tế
          khác khai báo.
        </p>
        <p>
          <strong>4. Thanh toán &amp; COD:</strong> Thanh toán điện tử theo
          hướng dẫn trên vé. Dịch vụ thu hộ COD (nếu có) thực hiện theo biên nhận
          và đối soát với người nhận.
        </p>
        <p>
          <strong>5. Giới hạn trách nhiệm:</strong> NovaLimo áp dụng nỗ lực
          hợp lý để bảo quản hàng hóa. Trách nhiệm tối đa theo gói bảo hiểm/khai
          báo giá trị và quy định pháp luật hiện hành.
        </p>
        <p>
          <strong>6. Khiếu nại &amp; hỗ trợ:</strong> Mọi khiếu nại gửi qua
          hotline/email trong 07 ngày kể từ ngày sử dụng dịch vụ, kèm mã đơn/mã
          vận đơn.
        </p>
      </LegalContent>
    </LegalPageShell>
  );
}
