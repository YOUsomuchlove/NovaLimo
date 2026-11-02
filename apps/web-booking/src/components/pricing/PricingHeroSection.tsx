'use client';

import React from 'react';
import { PageSection } from '../blocks/PageSection';

/** Tiêu đề trang bảng giá (nền mờ do lớp fixed ở `pricing/page`). */
export function PricingHeroSection() {
  return (
    <PageSection className="relative z-10 !py-8 sm:!py-10 md:!py-12">
      <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-[2.5rem]">
        Bảng giá tuyến đường
      </h1>
      <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-white/85 sm:text-base">
        Niêm yết theo tuyến - Giá một chiều - Chọn tab để xem từng tuyến.
      </p>
    </PageSection>
  );
}
