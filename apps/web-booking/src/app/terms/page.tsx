'use client';

import React from 'react';
import { Typography } from 'antd';
import { PageSection } from '../../components/blocks/PageSection';
import { BookingPageScaffold } from '../../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../../lib/booking-pen-assets';

export default function TermsPage() {
  return (
    <div className="bg-[#0B1020]">
      <BookingPageScaffold
        bgSrc={PEN_BG.legalTerms}
        overlayClassName={PEN_OVERLAY.legal}
        minHeight="min-h-[200px]"
      >
        <PageSection className="!py-8 sm:!py-10">
          <Typography.Title
            level={2}
            className="!mb-0 !text-2xl !font-black !text-white sm:!text-3xl"
          >
            Điều khoản sử dụng
          </Typography.Title>
        </PageSection>
      </BookingPageScaffold>

      <PageSection className="bg-[#0B1020] pb-16 pt-4">
        <div className="max-w-3xl space-y-5 text-sm leading-relaxed text-[#C9CDD8] sm:text-base">
          <p>
            <strong>1. Phạm vi dịch vụ:</strong> NovaLimo cung cấp dịch vụ vận chuyển
            hành khách và ký gửi hàng hóa theo tuyến đã công bố. Điều khoản này điều
            chỉnh việc đặt chỗ, thanh toán, và sử dụng dịch vụ qua website/ứng dụng.
          </p>
          <p>
            <strong>2. Đặt vé &amp; xác nhận:</strong> Thông tin đặt vé phải chính xác.
            Sau khi xác nhận, mã đơn/QR được dùng để lên xe và tra cứu. Thay đổi/hủy
            theo chính sách phí đã thông báo tại thời điểm đặt.
          </p>
          <p>
            <strong>3. Ký gửi hàng:</strong> Người gửi khai báo trung thực về loại hàng,
            khối lượng, giá trị. Hàng cấm, hàng nguy hiểm, hàng không đúng mô tả có thể
            bị từ chối. Phụ phí phát sinh khi kiểm tra thực tế khác khai báo.
          </p>
          <p>
            <strong>4. Thanh toán &amp; COD:</strong> Thanh toán điện tử theo hướng dẫn
            trên vé. Dịch vụ thu hộ COD (nếu có) thực hiện theo biên nhận và đối soát
            với người nhận.
          </p>
          <p>
            <strong>5. Giới hạn trách nhiệm:</strong> NovaLimo áp dụng nỗ lực hợp lý để
            bảo quản hàng hóa. Trách nhiệm tối đa theo gói bảo hiểm/khai báo giá trị và
            quy định pháp luật hiện hành.
          </p>
          <p>
            <strong>6. Khiếu nại &amp; hỗ trợ:</strong> Mọi khiếu nại gửi qua hotline/email
            trong 07 ngày kể từ ngày sử dụng dịch vụ, kèm mã đơn/mã vận đơn.
          </p>
        </div>
      </PageSection>
    </div>
  );
}
