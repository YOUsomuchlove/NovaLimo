'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Space, Typography } from 'antd';
import { bookingDisplayCode } from './booking-display-code';

export type BookingSuccessPanelProps = {
  doneId: string;
};

export function BookingSuccessPanel({ doneId }: BookingSuccessPanelProps) {
  const display = bookingDisplayCode(doneId);
  return (
    <div>
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
        <div
          className="flex h-[200px] w-[200px] shrink-0 items-center justify-center rounded-[12px] bg-white text-center text-[13px] font-semibold leading-snug text-[#64748b] sm:h-[220px] sm:w-[220px]"
          role="img"
          aria-label={`QR thanh toán cho đơn ${display}`}
        >
          QR thanh toán / check-in
          <br />
          (demo)
        </div>
        <div className="min-w-0 flex-1 pt-0 md:pt-1">
          <Typography.Paragraph className="!mb-0 !text-[15px] !font-semibold !leading-relaxed !text-white sm:!text-base">
            Bước tiếp theo: hoàn tất thanh toán (nếu còn) → nhận vé điện tử qua
            SMS/email → có mặt trước giờ khởi hành 15 phút.
          </Typography.Paragraph>
          <Space className="mt-8" wrap size="middle">
            <Link href="/my-tickets">
              <Button
                type="primary"
                size="large"
                className="!h-11 !rounded-[10px] !border-0 !bg-[#d4af37] !px-6 !font-black !text-[#0a0e18] hover:!bg-[#c9a85c]"
              >
                Xem vé của tôi
              </Button>
            </Link>
            <Link href="/">
              <Button
                size="large"
                className="!h-11 !rounded-[10px] !border !border-white/25 !bg-transparent !font-bold !text-white hover:!border-white/50 hover:!text-white"
              >
                Về trang chủ
              </Button>
            </Link>
          </Space>
        </div>
      </div>
      <div
        className="mt-12 h-px w-full bg-[#d4af37]/75"
        aria-hidden
      />
    </div>
  );
}
