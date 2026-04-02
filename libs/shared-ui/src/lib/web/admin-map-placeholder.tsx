'use client';

import React from 'react';

/** Placeholder bản đồ — thay bằng Leaflet/Google khi có luồng GPS */
export function AdminMapPlaceholder({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-64 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-100 text-slate-500 ${className}`}
    >
      Nền bản đồ — kết nối GPS từ driver
    </div>
  );
}
