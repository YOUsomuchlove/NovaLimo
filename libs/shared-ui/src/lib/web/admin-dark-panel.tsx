'use client';

import type { ReactNode } from 'react';

/** Khối nền tối như nvOrdPanel2 / bảng trong web-admin.pen (#020617, viền #1F2937). */
export function AdminDarkPanel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl text-slate-100 ${className ?? ''}`}
    >
      {children}
    </div>
  );
}
