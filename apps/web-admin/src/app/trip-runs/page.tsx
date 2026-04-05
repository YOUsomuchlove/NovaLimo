'use client';

import { Card, Typography } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../components/AdminPenMeta';

export default function TripRunsPage() {
  return (
    <AdminShell title="Chuyến">
      <AdminPenMeta id="nvTripRunsList" name="NovaLimo Admin · Quản lý Chuyến (Trip Runs)" />
      <Card className="border-slate-200" title="Danh sách trip runs">
        <Typography.Text type="secondary">Bảng chuyến — khớp header/list trong pen.</Typography.Text>
      </Card>
    </AdminShell>
  );
}
