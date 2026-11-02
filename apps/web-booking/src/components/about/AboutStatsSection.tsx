'use client';

import React from 'react';
import { PageSection } from '../blocks/PageSection';

const STATS = [
  { value: '10+', label: 'Năm kinh nghiệm' },
  { value: '50+', label: 'Đầu xe limousine' },
  { value: '1 Triệu+', label: 'Khách hàng' },
  { value: '15', label: 'Tỉnh thành phủ sóng' },
] as const;

export function AboutStatsSection() {
  return (
    <PageSection className="bg-[#070b14] py-10 md:py-14">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/[0.08] bg-[#11141f] px-4 py-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.25)] sm:rounded-2xl sm:px-6 sm:py-10"
            >
              <p className="text-2xl font-black tracking-tight text-nova-gold sm:text-3xl md:text-[2rem]">
                {s.value}
              </p>
              <p className="mt-2 text-xs font-semibold leading-snug text-white/90 sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageSection>
  );
}
