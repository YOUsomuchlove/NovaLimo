'use client';

import React from 'react';

/** Tiêu đề trang Liên hệ — mockup (nền tối, chữ trắng / xám). */
export function ContactHeroSection() {
  return (
    <header className="border-b border-white/[0.06] bg-[#0a0e1a]">
      <div className="mx-auto max-w-[1200px] px-4 py-9 sm:px-6 md:py-11 lg:px-0">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-[2.5rem]">
          Liên hệ &amp; Hỗ trợ
        </h1>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-[#a0a0a0] sm:text-base">
          Hỗ trợ đặt vé, tư vấn tuyến, phản hồi — cùng hotline/email như khi xác
          nhận đặt vé.
        </p>
      </div>
    </header>
  );
}
