'use client';

import React from 'react';

export type LegalFaqItem = { question: string; answer: string };

export type LegalFaqStackProps = {
  items: LegalFaqItem[];
};

/** Câu hỏi dạng thẻ glass — câu vàng, đáp xám nhạt (mock FAQ). */
export function LegalFaqStack({ items }: LegalFaqStackProps) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {items.map((item, i) => (
        <article
          key={i}
          className="rounded-[14px] border border-white/[0.14] bg-[rgba(8,12,24,0.45)] px-5 py-5 shadow-[0_8px_36px_rgba(0,0,0,0.35)] backdrop-blur-[14px] sm:rounded-2xl sm:px-6 sm:py-6"
        >
          <h2 className="mb-2 text-base font-black leading-snug text-nova-gold sm:text-lg">
            {item.question}
          </h2>
          <p className="mb-0 text-sm font-medium leading-relaxed text-[#d8dce8] sm:text-[15px]">
            {item.answer}
          </p>
        </article>
      ))}
    </div>
  );
}
