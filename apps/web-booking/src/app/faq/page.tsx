'use client';

import React from 'react';
import { Collapse, Typography } from 'antd';
import { PageSection } from '../../components/blocks/PageSection';
import { BookingPageScaffold } from '../../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../../lib/booking-pen-assets';

const items = [
  {
    key: '1',
    label: 'Làm sao để tra cứu vé?',
    children: (
      <p className="text-[#E8EAEF]">
        Dùng đúng SĐT đã đặt vé tại mục Vé của tôi. Hệ thống hiển thị trạng thái và
        thông tin đặt chỗ.
      </p>
    ),
  },
  {
    key: '2',
    label: 'Ký gửi hàng có tính COD không?',
    children: (
      <p className="text-[#E8EAEF]">
        Có — khai báo số tiền thu hộ khi đặt gửi. Phí dịch vụ và điều kiện đối soát
        hiển thị trước khi bạn xác nhận.
      </p>
    ),
  },
  {
    key: '3',
    label: 'Hàng nào bị từ chối?',
    children: (
      <p className="text-[#E8EAEF]">
        Chất dễ cháy/nổ, hàng cấm theo luật, hàng không khớp mô tả sau kiểm tra.
      </p>
    ),
  },
  {
    key: '4',
    label: 'Đổi hoặc hủy vé?',
    children: (
      <p className="text-[#E8EAEF]">
        Theo gói vé và thời điểm yêu cầu — phí đổi/hủy (nếu có) hiển thị trước khi xác
        nhận thao tác.
      </p>
    ),
  },
];

export default function FaqPage() {
  return (
    <div className="bg-[#0B1020]">
      <BookingPageScaffold
        bgSrc={PEN_BG.faq}
        overlayClassName={PEN_OVERLAY.faq}
        minHeight="min-h-[220px]"
      >
        <PageSection className="!py-8 sm:!py-10">
          <Typography.Title
            level={2}
            className="!mb-2 !text-2xl !font-black !text-white sm:!text-3xl md:!text-4xl"
          >
            Câu hỏi thường gặp
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 text-sm font-semibold text-[#B2CCFF] sm:text-base">
            Thông tin tham khảo — chi tiết theo chính sách tại thời điểm đặt vé.
          </Typography.Paragraph>
        </PageSection>
      </BookingPageScaffold>

      <PageSection className="bg-[#0B1020] pb-16 pt-2">
        <div className="w-full max-w-3xl min-w-0">
          <Collapse
            items={items}
            defaultActiveKey={['1']}
            className="[&_.ant-collapse-header]:!items-start [&_.ant-collapse-header]:!py-3 [&_.ant-collapse-item]:!rounded-[14px] [&_.ant-collapse-item]:!border [&_.ant-collapse-item]:!border-[#FFFFFF22] [&_.ant-collapse-item]:!bg-[#FFFFFF10]"
          />
        </div>
      </PageSection>
    </div>
  );
}
