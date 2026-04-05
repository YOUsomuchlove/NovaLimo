'use client';

import { Card } from 'antd';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../../components/AdminPenMeta';

export default function BookingEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminShell title={`Sửa đơn vé · ${id}`}>
      <AdminPenMeta id="nvOrdP1Ed" name="NovaLimo Admin · Sửa đơn vé hành khách" />
      <Card className="border-slate-200">Form sửa vé HK.</Card>
    </AdminShell>
  );
}
