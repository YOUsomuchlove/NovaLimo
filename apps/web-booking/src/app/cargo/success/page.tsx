'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Typography } from 'antd';
import { PageSection } from '../../../components/blocks/PageSection';
import { BookingPageScaffold } from '../../../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../../../lib/booking-pen-assets';

export default function CargoSuccessPage() {
  return (
    <div className="bg-[#0B1020]">
      <BookingPageScaffold
        bgSrc={PEN_BG.cargoSuccess}
        overlayClassName={PEN_OVERLAY.cargoSuccess}
        minHeight="min-h-[360px]"
      >
        <PageSection className="!py-10 sm:!py-14">
          <Typography.Title
            level={2}
            className="!mb-2 !text-2xl !font-black !text-white sm:!text-3xl md:!text-4xl"
          >
            Tạo vận đơn thành công
          </Typography.Title>
          <Typography.Text className="text-lg font-black text-[#D4AF37]">
            Mã vận đơn: CG-20260403-91BD
          </Typography.Text>
          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start">
            <div
              className="flex h-[200px] w-[200px] shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-center text-xs text-[#94a3b8]"
              role="img"
              aria-label="QR vận đơn demo"
            >
              QR vận đơn
              <br />
              (demo)
            </div>
            <Typography.Paragraph className="!max-w-xl !text-sm !font-semibold !leading-relaxed !text-[#E8EAEF] sm:!text-base">
              Mang hàng &amp; mã vận đơn đến quầy ký gửi tại bến trước giờ xe chạy ít
              nhất 30 phút. Nhân viên sẽ đối chiếu khối lượng/kích thước thực tế.
            </Typography.Paragraph>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/cargo">
              <Button size="large">Về trang ký gửi</Button>
            </Link>
            <Link href="/">
              <Button
                type="primary"
                size="large"
                className="!font-black !text-[#0B1020]"
              >
                Về trang chủ
              </Button>
            </Link>
          </div>
        </PageSection>
      </BookingPageScaffold>
    </div>
  );
}
