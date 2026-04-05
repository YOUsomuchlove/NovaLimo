'use client';

import Link from 'next/link';
import { CarOutlined } from '@ant-design/icons';

const navClass =
  'text-[#E8EAEF] no-underline transition-colors hover:text-[#D4AF37]';

/** 72px + gold line — khớp pattern Header trong web-bôking.pen */
export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 flex h-[72px] items-center justify-between border-b border-[#D4AF37] bg-[#0B1020]/90 px-4 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-md md:px-8"
      role="banner"
    >
      <Link href="/" className="flex items-center gap-2 text-white no-underline">
        <CarOutlined className="text-xl text-[#D4AF37]" aria-hidden />
        <span className="text-lg font-semibold tracking-wide">NovaLimo</span>
      </Link>
      <nav
        className="flex max-w-[70vw] flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs sm:text-sm md:gap-6"
        aria-label="Điều hướng chính"
      >
        <Link href="/search" className={navClass}>
          Tìm chuyến
        </Link>
        <Link href="/cargo" className={navClass}>
          Ký gửi
        </Link>
        <Link href="/my-tickets" className={navClass}>
          Vé của tôi
        </Link>
        <Link href="/about" className={`${navClass} hidden sm:inline`}>
          Giới thiệu
        </Link>
      </nav>
    </header>
  );
}
