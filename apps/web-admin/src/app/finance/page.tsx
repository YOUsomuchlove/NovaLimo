'use client';

import { Card, Typography } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../components/AdminPenMeta';

export default function FinancePage() {
  return (
    <AdminShell title="Tài chính">
      <AdminPenMeta id="nvFinance" name="NovaLimo Admin · Quản lý Tài chính" />
      <Card className="border-slate-200">
        <Typography.Text type="secondary">Bảng tài chính — bám pen.</Typography.Text>
      </Card>
    </AdminShell>
  );
}
