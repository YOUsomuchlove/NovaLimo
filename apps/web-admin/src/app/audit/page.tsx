'use client';

import { Card, Typography } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui/legacy';
import { AdminPenMeta } from '../../components/AdminPenMeta';

export default function AuditPage() {
  return (
    <AdminShell title="Audit Log">
      <AdminPenMeta id="nvAuditLog" name="NovaLimo Admin · Audit Log" />
      <Card className="border-slate-200">
        <Typography.Text type="secondary">
          Bảng nhật ký thao tác — bám pen.
        </Typography.Text>
      </Card>
    </AdminShell>
  );
}
