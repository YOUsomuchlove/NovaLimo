'use client';

import { Card, Typography } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../components/AdminPenMeta';
import { DispatchDndDemo } from '../../components/DispatchDndDemo';

export default function DispatchPage() {
  return (
    <AdminShell title="Điều phối">
      <AdminPenMeta id="nvSmartDispPage" name="NovaLimo Admin · Điều phối Thông minh (Smart Dispatching)" />
      <Card className="border-slate-200" title="Điều phối · rổ chờ → xe (dnd-kit)">
        <Typography.Paragraph type="secondary" className="!mb-4">
          Kéo thả ghế/booking vào xe — <Typography.Text code>@dnd-kit/core</Typography.Text>; bám vùng Main column trong
          pen khi có frame chi tiết.
        </Typography.Paragraph>
        <DispatchDndDemo />
      </Card>
    </AdminShell>
  );
}
