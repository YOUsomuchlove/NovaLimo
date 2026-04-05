'use client';

import { Card, Typography } from 'antd';
import Link from 'next/link';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../components/AdminPenMeta';

/** Tránh conflict với `vehicles/[vehicleId]` — route tĩnh ưu tiên. */
export default function DriversListPage() {
  return (
    <AdminShell title="Tài xế">
      <AdminPenMeta id="Xox9m" name="panelDrivers — danh sách tài xế (cùng nhóm nvFleet)" />
      <Card className="border-slate-200">
        <Typography.Paragraph>
          <Link href="/vehicles/drivers/new">Tạo tài xế mới</Link>
        </Typography.Paragraph>
        <Typography.Text type="secondary">Bảng tài xế — bám panel Xox9m.</Typography.Text>
      </Card>
    </AdminShell>
  );
}
