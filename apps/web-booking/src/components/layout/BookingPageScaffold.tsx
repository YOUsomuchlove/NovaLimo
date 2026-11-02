'use client';

import Image from 'next/image';
import React from 'react';

function cn(...parts: (string | undefined | false)[]) {
  return parts.filter(Boolean).join(' ');
}

export type BookingPageScaffoldProps = {
  /** URL ảnh nền (Unsplash / local) — khớp web-bôking.pen */
  bgSrc: string;
  /** Lớp phủ: ví dụ bg-[#0B1020]/80 — dùng PEN_OVERLAY */
  overlayClassName: string;
  children: React.ReactNode;
  /** Chiều cao tối thiểu vùng nội dung (full-bleed dưới header) */
  minHeight?: string;
  className?: string;
  contentClassName?: string;
  /** Ưu tiên LCP cho trang đích */
  priority?: boolean;
  /** Thêm vào next/image (vd. blur nền hero thành công) */
  imageClassName?: string;
};

/**
 * Layout “sandwich” pen: ảnh full-width + overlay + nội dung phía trên.
 * Frame tham chiếu: Kl9cQ, eWbxX, dQZgk, cFLNQ, wbCargo*, v.v.
 */
export function BookingPageScaffold({
  bgSrc,
  overlayClassName,
  children,
  minHeight = 'min-h-[480px]',
  className,
  contentClassName,
  priority = false,
  imageClassName,
}: BookingPageScaffoldProps) {
  return (
    <div
      className={cn('relative w-full overflow-hidden', minHeight, className)}
    >
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={bgSrc}
          alt=""
          fill
          priority={priority}
          className={cn('object-cover object-center', imageClassName)}
          sizes="100vw"
        />
        <div className={cn('absolute inset-0', overlayClassName)} aria-hidden />
      </div>
      <div className={cn('relative z-10', contentClassName)}>{children}</div>
    </div>
  );
}
