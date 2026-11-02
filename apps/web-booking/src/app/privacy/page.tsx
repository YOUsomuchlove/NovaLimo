'use client';

import React from 'react';
import { LegalContent } from '../../components/legal/LegalContent';
import { LegalPageShell } from '../../components/legal/LegalPageShell';
import { PEN_BG, PEN_OVERLAY } from '../../lib/booking-pen-assets';

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Chính sách bảo mật"
      bgSrc={PEN_BG.legalPrivacy}
      overlayClassName={PEN_OVERLAY.legal}
    >
      <LegalContent>
        <p>
          <strong>1. Thu thập dữ liệu:</strong> Họ tên, số điện thoại, email
          (nếu có), thông tin chuyến đi và thanh toán phục vụ đặt vé, hỗ trợ và
          tuân thủ pháp luật.
        </p>
        <p>
          <strong>2. Mục đích sử dụng:</strong> Xác nhận đặt vé, gửi thông báo
          chuyến, tra cứu vé, chăm sóc khách hàng, cải thiện dịch vụ, và chống
          gian lận.
        </p>
        <p>
          <strong>3. Lưu trữ &amp; bảo mật:</strong> Dữ liệu được lưu trên hệ
          thống có kiểm soát truy cập, mã hóa kết nối theo tiêu chuẩn ngành.
        </p>
        <p>
          <strong>4. Chia sẻ:</strong> Chỉ chia sẻ cho đối tác vận hành tối
          thiểu cần thiết (ví dụ cổng thanh toán) theo hợp đồng bảo mật.
        </p>
        <p>
          <strong>5. Quyền của bạn:</strong> Yêu cầu truy cập, chỉnh sửa, xóa
          dữ liệu cá nhân theo quy định — liên hệ support@novalimo.vn.
        </p>
        <p>
          <strong>6. Cookie &amp; analytics:</strong> Website có thể dùng
          cookie để ghi nhớ phiên và thống kê ẩn danh; bạn có thể điều chỉnh
          trình duyệt.
        </p>
      </LegalContent>
    </LegalPageShell>
  );
}
