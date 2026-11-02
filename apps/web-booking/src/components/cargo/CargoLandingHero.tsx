'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Typography } from 'antd';
import { PageSection } from '../blocks/PageSection';
import { BookingPageScaffold } from '../layout/BookingPageScaffold';

export type CargoLandingHeroProps = {
  bgSrc: string;
  overlayClassName: string;
};

export function CargoLandingHero({
  bgSrc,
  overlayClassName,
}: CargoLandingHeroProps) {
  return (
    <BookingPageScaffold
      bgSrc={bgSrc}
      overlayClassName={overlayClassName}
      minHeight="min-h-[460px] md:min-h-[520px]"
      priority
    >
      <PageSection className="flex flex-col !py-14 text-left text-white md:!py-20">
        <Typography.Title
          level={1}
          className="!mb-4 !max-w-3xl !text-3xl !font-black !leading-tight !tracking-tight !text-white sm:!text-4xl md:!text-[44px]"
        >
          Ký gửi hàng cùng chuyến
        </Typography.Title>
        <Typography.Paragraph className="!mb-0 !max-w-2xl !text-[15px] !font-semibold !leading-relaxed !text-white/95 sm:!text-base">
          Gửi kiện theo tuyến xe limousine — minh bạch phí, hỗ trợ COD,
          nhận/giao tại bến.
        </Typography.Paragraph>
        <Link href="/cargo/book" className="mt-8 inline-flex w-fit">
          <Button
            type="primary"
            size="large"
            className="!h-[52px] !rounded-[12px] !border-0 !bg-[#d4af37] !px-10 !text-[15px] !font-black !text-[#0a0e18] !shadow-[0_10px_28px_rgba(0,0,0,0.35)] hover:!bg-[#c9a85c]"
          >
            Ước tính / Đặt gửi hàng
          </Button>
        </Link>
      </PageSection>
    </BookingPageScaffold>
  );
}
