'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Space, Typography } from 'antd';
import { PageSection } from '../../../components/blocks/PageSection';
import { BookingPageScaffold } from '../../../components/layout/BookingPageScaffold';
import { cargoDemoWaybillCode } from '../../../components/booking-wizard/booking-display-code';
import { PEN_BG, PEN_OVERLAY } from '../../../lib/booking-pen-assets';

export default function CargoSuccessPage() {
  const waybill = cargoDemoWaybillCode();

  return (
    <div className="bg-[#0a0e18]">
      <BookingPageScaffold
        bgSrc={PEN_BG.cargoSuccess}
        overlayClassName={PEN_OVERLAY.cargoSuccess}
        minHeight="min-h-[360px] md:min-h-[400px]"
        priority
        imageClassName="scale-105 blur-[3px]"
      >
        <PageSection className="!pb-6 !pt-10 sm:!pt-14">
          <Typography.Title
            level={2}
            className="!mb-3 !text-3xl !font-black !tracking-tight !text-white sm:!text-4xl md:!text-[40px]"
          >
            Gửi hàng thành công
          </Typography.Title>
          <Typography.Text className="text-lg font-black text-[#d4af37] sm:text-xl">
            Mã vận đơn: {waybill}
          </Typography.Text>
        </PageSection>
      </BookingPageScaffold>

      <PageSection className="!pb-20 !pt-4">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
          <div
            className="flex h-[200px] w-[200px] shrink-0 items-center justify-center rounded-[12px] bg-white text-center text-[13px] font-semibold leading-snug text-[#64748b] sm:h-[220px] sm:w-[220px]"
            role="img"
            aria-label={`QR vận đơn ${waybill}`}
          >
            QR vận đơn
            <br />
            (demo)
          </div>
          <div className="min-w-0 flex-1 pt-0 md:pt-1">
            <Typography.Paragraph className="!mb-0 !text-[15px] !font-semibold !leading-relaxed !text-white sm:!text-base">
              Bước tiếp theo: hoàn tất thanh toán (nếu còn) → nhận biên nhận qua
              SMS/email → mang hàng &amp; mã vận đơn đến quầy ký gửi trước giờ xe
              chạy ít nhất 30 phút.
            </Typography.Paragraph>
            <Space className="mt-8" wrap size="middle">
              <Link href="/cargo">
                <Button
                  size="large"
                  className="!h-11 !rounded-[10px] !border !border-white/25 !bg-transparent !font-bold !text-white hover:!border-white/50 hover:!text-white"
                >
                  Về trang ký gửi
                </Button>
              </Link>
              <Link href="/">
                <Button
                  type="primary"
                  size="large"
                  className="!h-11 !rounded-[10px] !border-0 !bg-[#d4af37] !px-6 !font-black !text-[#0a0e18] hover:!bg-[#c9a85c]"
                >
                  Về trang chủ
                </Button>
              </Link>
            </Space>
          </div>
        </div>
        <div className="mt-12 h-px w-full bg-[#d4af37]/75" aria-hidden />
      </PageSection>
    </div>
  );
}
