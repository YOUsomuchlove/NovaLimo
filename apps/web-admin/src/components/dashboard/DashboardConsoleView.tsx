'use client';

import React from 'react';

/** Thẻ KPI / chart — #121620, viền nhẹ, bo ~12px (pen). */
const cardShell =
  'rounded-xl border border-white/[0.06] bg-[#121620] p-5 sm:p-6';

function StatCard({
  title,
  value,
  sub,
  subTone,
}: {
  title: string;
  value: string;
  sub: string;
  subTone: 'success' | 'warning' | 'muted';
}) {
  const subCls =
    subTone === 'success'
      ? 'text-[#4ade80]'
      : subTone === 'warning'
        ? 'text-[#fbbf24]'
        : 'text-[#9ca3af]';
  return (
    <div className={cardShell}>
      <p className="text-[13px] font-semibold leading-snug text-[#9ca3af]">{title}</p>
      <p className="mt-2.5 text-[24px] font-black leading-tight tracking-tight text-white sm:text-[26px]">
        {value}
      </p>
      <p className={`mt-2 text-[13px] font-semibold ${subCls}`}>{sub}</p>
    </div>
  );
}

function ChartPlaceholder({
  title,
  subtitle,
  legend,
}: {
  title: string;
  subtitle?: string;
  legend?: React.ReactNode;
}) {
  return (
    <div className={`flex min-h-[300px] flex-col sm:min-h-[320px] ${cardShell}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-white sm:text-lg">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-[13px] font-medium text-[#9ca3af]">{subtitle}</p>
          ) : null}
        </div>
        {legend}
      </div>
      <div className="mt-5 flex flex-1 items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-[#0b0e14] px-4 py-12">
        <p className="text-center text-[13px] font-medium text-[#6b7280]">
          Biểu đồ (placeholder)
        </p>
      </div>
    </div>
  );
}

export function DashboardConsoleView() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng doanh thu hôm nay"
          value="50.000.000 đ"
          sub="+12% so với hôm qua"
          subTone="success"
        />
        <StatCard
          title="Vé đã bán"
          value="320 vé"
          sub="+8% so với trung bình tuần"
          subTone="success"
        />
        <StatCard
          title="Tỷ lệ lấp đầy ghế"
          value="85%"
          sub="Mục tiêu: 90% / ngày lễ"
          subTone="warning"
        />
        <StatCard
          title="Xe đang chạy"
          value="24 / 30 xe"
          sub="3 xe bảo trì · 3 xe trống"
          subTone="muted"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartPlaceholder
          title="Doanh thu theo ngày"
          subtitle="Tuần này · ~320.000.000 đ"
        />
        <ChartPlaceholder
          title="Chi phí phát sinh & lương tài xế"
          legend={
            <div className="flex flex-wrap items-center gap-4 text-[12px] font-semibold text-[#9ca3af]">
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#fb923c]" aria-hidden />
                Chi phí
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#4ade80]" aria-hidden />
                Lương tài xế
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
}
