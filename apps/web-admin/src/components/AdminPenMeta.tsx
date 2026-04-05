'use client';

import { Typography } from 'antd';

/** Ghi nhận Frame ID từ web-admin.pen cho QA pixel. */
export function AdminPenMeta({ id, name }: { id: string; name: string }) {
  return (
    <Typography.Paragraph type="secondary" className="!mb-4 !text-xs">
      <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[11px]">{id}</code>
      <span className="text-slate-500"> — {name}</span>
    </Typography.Paragraph>
  );
}
