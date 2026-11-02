'use client';

import React from 'react';

export type LegalContentProps = {
  children: React.ReactNode;
};

/**
 * Văn bản điều khoản / chính sách — danh sách đánh số, chữ trắng trên nền tối (mock Terms & Privacy).
 */
export function LegalContent({ children }: LegalContentProps) {
  return (
    <div className="max-w-none space-y-7 text-[15px] font-normal leading-[1.8] tracking-wide text-white/92 sm:text-base [&_p]:mb-0 [&_strong]:font-black [&_strong]:text-white">
      {children}
    </div>
  );
}
