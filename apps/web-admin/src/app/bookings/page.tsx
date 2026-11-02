'use client';

import { Card, Table, Typography } from 'antd';
import {
  AdminDarkPanel,
  AdminShell,
} from '@limousine-workspace/shared-ui/legacy';
import { AdminPenMeta } from '../../components/AdminPenMeta';

const cols = [
  { title: 'Mã đơn', dataIndex: 'code', key: 'code' },
  { title: 'Loại', dataIndex: 'type', key: 'type' },
];

export default function BookingsPage() {
  return (
    <AdminShell title="Đơn hàng">
      <AdminPenMeta
        id="nvOrdPage"
        name="NovaLimo Admin · Quản lý Đơn hàng & Ký gửi Hàng hóa"
      />
      <Card className="mb-4 border-slate-200" title="Đơn vé & ký gửi (tổng)">
        <Typography.Text type="secondary">
          Bảng chính — bám layout Main trong pen.
        </Typography.Text>
      </Card>
      <Typography.Paragraph className="!text-xs text-slate-500">
        Panel phase 2 (ký gửi) — <code className="font-mono">nvOrdPanel2</code>
      </Typography.Paragraph>
      <AdminDarkPanel>
        <Table
          size="small"
          columns={cols}
          dataSource={[]}
          locale={{ emptyText: 'Chưa có dữ liệu (demo bảng tối)' }}
          pagination={false}
        />
      </AdminDarkPanel>
    </AdminShell>
  );
}
