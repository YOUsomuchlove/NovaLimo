'use client';

import React from 'react';
import { PageSection } from '../blocks/PageSection';

function IconShield({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M24 4L8 10v14c0 11.1 7.2 21.5 16 20 8.8 1.5 16-8.9 16-20V10L24 4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M24 14v11l7 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHeart({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M24 40s-14-9.2-14-18c0-5 4-9 9-9 3.5 0 6.5 2 8 4.5C28.5 15 31.5 13 35 13c5 0 9 4 9 9 0 8.8-14 18-14 18z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const VALUES = [
  {
    Icon: IconShield,
    title: 'An toàn',
    desc: 'Kiểm định định kỳ, tài xế được đào tạo bài bản và tuân thủ quy trình vận hành chặt chẽ.',
  },
  {
    Icon: IconClock,
    title: 'Đúng giờ',
    desc: 'Điều phối thông minh, giám sát hành trình thời gian thực để hành khách yên tâm lên xe.',
  },
  {
    Icon: IconHeart,
    title: 'Tận tâm',
    desc: 'Phục vụ chu đáo, hỗ trợ hành khách trước và trong chuyến đi với tinh thần trách nhiệm.',
  },
] as const;

export function AboutValuesSection() {
  return (
    <PageSection className="bg-[#070b14] pb-16 pt-4 md:pb-20 md:pt-6">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
          Giá trị cốt lõi
        </h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-white/65 sm:text-base">
          Ba cam kết mà đội xe NovaLimo luôn đặt lên hàng đầu.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
          {VALUES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center rounded-2xl border border-white/[0.1] bg-[#11141f] px-6 py-10 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)] md:px-8 md:py-12"
            >
              <div className="flex h-16 w-16 items-center justify-center text-nova-gold md:h-[72px] md:w-[72px]">
                <Icon className="h-12 w-12 md:h-14 md:w-14" />
              </div>
              <h3 className="mt-6 text-lg font-black text-white md:text-xl">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-[15px]">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageSection>
  );
}
