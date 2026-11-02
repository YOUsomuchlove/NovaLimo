'use client';

import React from 'react';

/** Hộp chính sách giá — nền trắng, tiêu đề vàng (mockup). */
export function PricePolicyNote() {
  return (
    <div className="mt-8 rounded-xl border border-[#e8e8e8] bg-white p-6 shadow-[0_8px_28px_rgba(0,0,0,0.1)] sm:rounded-2xl sm:p-8">
      <div className="flex gap-3 sm:gap-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-nova-gold/15 text-lg text-nova-gold"
          aria-hidden
        >
          ℹ️
        </span>
        <div>
          <h3 className="text-lg font-black text-nova-gold sm:text-xl">
            Chính sách giá &amp; phụ thu
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[#1a1d26] sm:text-[15px]">
            Giá có thể điều chỉnh vào ngày lễ, Tết và cao điểm cuối tuần (phụ thu
            thường từ <strong>+15%</strong> đến <strong>+30%</strong> so với bảng
            niêm yết, tùy tuyến và thời điểm).
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#1a1d26] sm:text-[15px]">
            Trẻ em dưới 6 tuổi (không chiếm ghế riêng) theo chính sách từng chuyến;
            ghế riêng áp dụng mức giá như người lớn. Giá cuối cùng hiển thị khi chọn
            chuyến và ghế trên hệ thống đặt vé là tham chiếu chính xác nhất.
          </p>
        </div>
      </div>
    </div>
  );
}
