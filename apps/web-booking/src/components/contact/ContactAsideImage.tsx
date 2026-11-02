'use client';

import Image from 'next/image';
import React from 'react';

const IMG =
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=max&w=960&q=80';

/** Ảnh minh họa cột trái — bo góc theo mockup. */
export function ContactAsideImage() {
  return (
    <div className="relative mt-10 aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 shadow-[0_8px_28px_rgba(0,0,0,0.35)] sm:mt-12 sm:rounded-[12px]">
      <Image
        src={IMG}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 45vw"
      />
    </div>
  );
}
