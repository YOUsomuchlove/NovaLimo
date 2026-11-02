'use client';

import React from 'react';
import { BookingPageScaffold } from '../layout/BookingPageScaffold';

export type AboutHeroBannerProps = {
  bgSrc: string;
  overlayClassName: string;
};

/** Hero Giới thiệu — limousine đêm, chữ trái, tiêu đề + vàng phụ đề (mockup). */
export function AboutHeroBanner({
  bgSrc,
  overlayClassName,
}: AboutHeroBannerProps) {
  return (
    <BookingPageScaffold
      bgSrc={bgSrc}
      overlayClassName={overlayClassName}
      minHeight="min-h-[420px] sm:min-h-[480px] md:min-h-[560px] lg:min-h-[600px]"
      priority
    >
      <div className="relative mx-auto flex max-w-[1200px] flex-col justify-end px-4 pb-14 pt-24 sm:px-6 sm:pb-16 sm:pt-28 md:px-8 md:pb-20 md:pt-32 lg:px-0">
        <div className="max-w-2xl text-left">
          <h1 className="text-[2rem] font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            Hành trình Đẳng cấp
          </h1>
          <p className="mt-2 text-[1.65rem] font-black leading-tight text-nova-gold sm:text-3xl md:text-4xl lg:text-[2.75rem]">
            Trải nghiệm Tiên phong
          </p>
          <p className="mt-5 text-base font-semibold leading-relaxed text-white/90 sm:text-lg">
            NovaLimo — limousine nội địa, tiêu chuẩn quốc tế
          </p>
        </div>
      </div>
    </BookingPageScaffold>
  );
}
