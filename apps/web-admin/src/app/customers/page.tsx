'use client';

import { Card, Typography } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../components/AdminPenMeta';

export default function CustomersPage() {
  return (
    <AdminShell title="Khách hàng">
      <AdminPenMeta id="nvCustList" name="NovaLimo Admin · Khách hàng" />
      <Card className="border-slate-200" title="Danh sách">
        <Typography.Text type="secondary">Bảng KH — bám pen.</Typography.Text>
      </Card>
    </AdminShell>
  );
}
