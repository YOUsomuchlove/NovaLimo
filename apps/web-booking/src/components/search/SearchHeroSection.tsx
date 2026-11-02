'use client';

import React from 'react';

export type SearchHeroSectionProps = {
  tripCount: number;
  routeTitle: string;
};

/** Tiêu đề khu vực kết quả — khớp mockup (số chuyến + tuyến). */
export function SearchHeroSection({
  tripCount,
  routeTitle,
}: SearchHeroSectionProps) {
  return (
    <header className="pb-2 pt-2 md:pb-4 md:pt-4">
      <p className="mb-1 text-3xl font-black tracking-tight text-white md:text-4xl">
        {tripCount} chuyến
      </p>
      <p className="text-base font-semibold text-white/90 md:text-lg">
        Kết quả cho tuyến {routeTitle}
      </p>
    </header>
  );
}
