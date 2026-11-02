'use client';

import { Card } from 'antd';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui/legacy';
import { AdminPenMeta } from '../../../../components/AdminPenMeta';

export default function CargoEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminShell title={`Sửa vận đơn · ${id}`}>
      <AdminPenMeta id="nvOrdP2Ed" name="NovaLimo Admin · Sửa vận đơn ký gửi" />
      <Card className="border-slate-200">Form sửa ký gửi.</Card>
    </AdminShell>
  );
}
