'use client';

import Image from 'next/image';
import React from 'react';
import { PageSection } from '../blocks/PageSection';

const FLEET = [
  {
    title: 'Limousine 9 chỗ',
    desc: 'Ghế massage đa hướng, không gian riêng tư. WiFi 5G miễn phí và cổng sạc USB trên từng ghế cho hành trình thoải mái.',
    src: 'https://images.unsplash.com/photo-1768767132391-13032fe86715?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Limousine 12 chỗ',
    desc: 'Khoang rộng rãi, phù hợp nhóm gia đình và doanh nghiệp. Hệ thống giải trí, điều hòa nhiều vùng và nội thất da cao cấp.',
    src: 'https://images.unsplash.com/photo-1767023025057-9f4033342df2?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Limousine 19 chỗ',
    desc: 'Dòng xe đa năng cho đoàn lớn, vẫn đảm bảo tiêu chuẩn limousine. Lối đi giữa thông thoáng, hành lý được bố trí hợp lý.',
    src: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  },
] as const;

export function AboutFleetSection() {
  return (
    <PageSection className="bg-[#070b14] py-10 md:py-14">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
          Đội xe NovaLimo
        </h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-white/65 sm:text-base">
          Đa dạng dung tích — ghế massage, WiFi 5G, cổng sạc USB trên mọi hành
          trình.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
          {FLEET.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11141f] shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
            >
              <div className="relative aspect-[16/10] w-full bg-[#1a1f2e]">
                <Image
                  src={item.src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 md:p-7">
                <h3 className="text-lg font-black text-white md:text-xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {item.desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageSection>
  );
}
