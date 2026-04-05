'use client';

import React from 'react';
import { Typography } from 'antd';
import { PageSection } from '../../components/blocks/PageSection';
import { BookingPageScaffold } from '../../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../../lib/booking-pen-assets';

export default function PrivacyPage() {
  return (
    <div className="bg-[#0B1020]">
      <BookingPageScaffold
        bgSrc={PEN_BG.legalPrivacy}
        overlayClassName={PEN_OVERLAY.legal}
        minHeight="min-h-[200px]"
      >
        <PageSection className="!py-8 sm:!py-10">
          <Typography.Title
            level={2}
            className="!mb-0 !text-2xl !font-black !text-white sm:!text-3xl"
          >
            Chính sách bảo mật
          </Typography.Title>
        </PageSection>
      </BookingPageScaffold>

      <PageSection className="bg-[#0B1020] pb-16 pt-4">
        <div className="max-w-3xl space-y-5 text-sm leading-relaxed text-[#C9CDD8] sm:text-base">
          <p>
            <strong>1. Thu thập dữ liệu:</strong> Họ tên, số điện thoại, email (nếu có),
            thông tin chuyến đi và thanh toán phục vụ đặt vé, hỗ trợ và tuân thủ pháp
            luật.
          </p>
          <p>
            <strong>2. Mục đích sử dụng:</strong> Xác nhận đặt vé, gửi thông báo chuyến,
            tra cứu vé, chăm sóc khách hàng, cải thiện dịch vụ, và chống gian lận.
          </p>
          <p>
            <strong>3. Lưu trữ &amp; bảo mật:</strong> Dữ liệu được lưu trên hệ thống có
            kiểm soát truy cập, mã hóa kết nối theo tiêu chuẩn ngành.
          </p>
          <p>
            <strong>4. Chia sẻ:</strong> Chỉ chia sẻ cho đối tác vận hành tối thiểu cần
            thiết (ví dụ cổng thanh toán) theo hợp đồng bảo mật.
          </p>
          <p>
            <strong>5. Quyền của bạn:</strong> Yêu cầu truy cập, chỉnh sửa, xóa dữ liệu
            cá nhân theo quy định — liên hệ support@novalimo.vn.
          </p>
          <p>
            <strong>6. Cookie &amp; analytics:</strong> Website có thể dùng cookie để ghi
            nhớ phiên và thống kê ẩn danh; bạn có thể điều chỉnh trình duyệt.
          </p>
        </div>
      </PageSection>
    </div>
  );
}
