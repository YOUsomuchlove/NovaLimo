'use client';

import React from 'react';
import {
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_HOTLINE_DISPLAY,
  SITE_HOTLINE_TEL,
  SITE_PICKUP_POINTS,
} from '../../lib/site-contact';
import { ContactAsideImage } from './ContactAsideImage';

function mapsHref(): string {
  const q = encodeURIComponent(
    '123 Nguyễn Trãi Thanh Xuân Hà Nội',
  );
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** Cột trái — thông tin liên hệ (mockup). */
export function ContactInfoAside() {
  return (
    <div className="text-white">
      <h2 className="text-lg font-black text-white sm:text-xl">
        Thông tin liên hệ
      </h2>

      <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-[#a0a0a0]">
        Hotline đặt vé
      </p>
      <p className="mt-1 text-4xl font-black leading-none tracking-tight text-[#f1c40f] sm:text-5xl md:text-6xl">
        <a href={`tel:${SITE_HOTLINE_TEL}`} className="text-inherit no-underline">
          {SITE_HOTLINE_DISPLAY}
        </a>
      </p>
      <p className="mt-2 text-xs font-medium text-[#a0a0a0] sm:text-sm">
        Miễn phí cuộc gọi · 7:00 – 22:00 hằng ngày
      </p>

      <div className="mt-10 space-y-8">
        <div>
          <p className="text-sm font-semibold text-[#a0a0a0]">Email</p>
          <p className="mt-1 text-base text-white sm:text-lg">
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="font-bold text-white no-underline hover:text-[#f1c40f]"
            >
              {SITE_EMAIL}
            </a>
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold leading-relaxed text-white">
            {SITE_ADDRESS}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium leading-relaxed text-white/95">
            {SITE_PICKUP_POINTS}
          </p>
        </div>

        <div>
          <a
            href={mapsHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 transition-colors hover:text-[#f1c40f] hover:decoration-[#f1c40f]/50"
          >
            Chỉ đường tới trụ sở
          </a>
        </div>
      </div>

      <ContactAsideImage />
    </div>
  );
}
