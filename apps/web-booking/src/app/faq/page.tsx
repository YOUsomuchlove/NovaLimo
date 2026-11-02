'use client';

import React from 'react';
import { LegalFaqStack } from '../../components/legal/LegalFaqStack';
import { LegalPageShell } from '../../components/legal/LegalPageShell';
import { PEN_BG, PEN_OVERLAY } from '../../lib/booking-pen-assets';

const FAQ_ITEMS = [
  {
    question: 'Làm sao để tra cứu vé?',
    answer:
      'Dùng đúng SĐT đã đặt vé tại mục Tra cứu vé. Hệ thống hiển thị trạng thái và thông tin đặt chỗ.',
  },
  {
    question: 'Ký gửi hàng có tính COD không?',
    answer:
      'Có — khai báo số tiền thu hộ khi đặt gửi. Phí dịch vụ và điều kiện đối soát hiển thị trước khi bạn xác nhận.',
  },
  {
    question: 'Hàng nào bị từ chối?',
    answer:
      'Chất dễ cháy/nổ, hàng cấm theo luật, hàng không khớp mô tả sau kiểm tra.',
  },
  {
    question: 'Đổi hoặc hủy vé?',
    answer:
      'Theo gói vé và thời điểm yêu cầu — phí đổi/hủy (nếu có) hiển thị trước khi xác nhận thao tác.',
  },
];

export default function FaqPage() {
  return (
    <LegalPageShell
      title="Câu hỏi thường gặp"
      bgSrc={PEN_BG.faq}
      overlayClassName={PEN_OVERLAY.faq}
    >
      <LegalFaqStack items={FAQ_ITEMS} />
    </LegalPageShell>
  );
}
