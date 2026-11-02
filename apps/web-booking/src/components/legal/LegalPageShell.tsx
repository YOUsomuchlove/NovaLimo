'use client';

import React from 'react';
import { BookingPageScaffold } from '../layout/BookingPageScaffold';

export type LegalPageShellProps = {
  title: string;
  subtitle?: string;
  bgSrc: string;
  overlayClassName: string;
  children: React.ReactNode;
};

/**
 * Khung trang pháp lý / FAQ: ảnh nền full + overlay, tiêu đề trắng, nội dung cùng lớp nền (mock pen).
 */
export function LegalPageShell({
  title,
  subtitle,
  bgSrc,
  overlayClassName,
  children,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-nova-bg">
      <BookingPageScaffold
        bgSrc={bgSrc}
        overlayClassName={overlayClassName}
        minHeight="min-h-screen"
        className="pb-12 sm:pb-16"
      >
        <div className="mx-auto w-full max-w-[920px] px-4 pt-9 sm:px-6 sm:pt-11 md:pt-12">
          <h1 className="text-[1.65rem] font-black leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-[#C8D4F0] sm:text-base">
              {subtitle}
            </p>
          ) : null}
          <div className={subtitle ? 'mt-8 sm:mt-10' : 'mt-8 sm:mt-10'}>
            {children}
          </div>
        </div>
      </BookingPageScaffold>
    </div>
  );
}
