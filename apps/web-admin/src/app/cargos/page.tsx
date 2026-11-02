'use client';

import { Card, Typography } from 'antd';
import Link from 'next/link';
import { AdminShell } from '@limousine-workspace/shared-ui/legacy';
import { AdminPenMeta } from '../../components/AdminPenMeta';

export default function CargosPage() {
  return (
    <AdminShell title="Hàng hóa">
      <AdminPenMeta
        id="nvCargoOpsList"
        name="NovaLimo Admin · Vận hành Hàng hóa"
      />
      <Card className="border-slate-200">
        <Typography.Paragraph>
          <Link href="/cargos/handoff">Bàn giao trung chuyển</Link>
          {' · '}
          <Link href="/cargos/cod-reconcile">Đối soát COD</Link>
          {' · '}
          <Link href="/cargos/new">Tạo đơn ký gửi</Link>
        </Typography.Paragraph>
      </Card>
    </AdminShell>
  );
}
