'use client';

import { Card, Tabs, Typography } from 'antd';
import Link from 'next/link';
import { AdminShell, AdminDarkPanel } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../components/AdminPenMeta';

export default function VehiclesPage() {
  return (
    <AdminShell title="Đội xe & Tài xế">
      <AdminPenMeta id="nvFleet" name="NovaLimo Admin · Quản lý Đội xe & Tài xế" />
      <Typography.Paragraph type="secondary" className="!mb-4 !text-xs">
        Panel tài xế (toolbar + bảng + phân trang) — frame <code className="font-mono">Xox9m</code>{' '}
        panelDrivers, nhúng trong tab Tài xế.
      </Typography.Paragraph>
      <Tabs
        items={[
          {
            key: 'vehicles',
            label: 'Xe',
            children: (
              <Card className="border-slate-200">
                <Link href="/vehicles/new">Tạo xe mới</Link>
              </Card>
            ),
          },
          {
            key: 'drivers',
            label: 'Tài xế',
            children: (
              <AdminDarkPanel>
                <Typography.Text className="text-slate-300">
                  Bảng tài xế — đối chiếu Xox9m (Search drivers, Table drivers, Pagination).
                </Typography.Text>
              </AdminDarkPanel>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}
