'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Typography } from 'antd';
import { PageSection } from '../components/blocks/PageSection';
import { BookingPageScaffold } from '../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../lib/booking-pen-assets';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-nova-bg">
      <BookingPageScaffold
        bgSrc={PEN_BG.notFound}
        overlayClassName={PEN_OVERLAY.notFound}
        minHeight="min-h-[calc(100vh-200px)]"
      >
        <PageSection className="flex flex-col justify-center py-16 md:py-24">
          <Typography.Title
            level={1}
            className="!mb-4 !text-6xl !font-black !text-white sm:!text-7xl md:!text-8xl"
          >
            404
          </Typography.Title>
          <Typography.Paragraph className="!mb-8 max-w-xl text-base font-semibold text-nova-muted sm:text-lg">
            Trang bạn tìm không tồn tại hoặc đã được di chuyển.
          </Typography.Paragraph>
          <Link href="/">
            <Button
              type="primary"
              size="large"
              className="!h-[52px] !min-w-[200px] !rounded-[var(--radius-nova-md)] !font-black !text-nova-bg !bg-nova-gold hover:!bg-nova-gold-hover"
            >
              Về trang chủ
            </Button>
          </Link>
        </PageSection>
      </BookingPageScaffold>
    </div>
  );
}
