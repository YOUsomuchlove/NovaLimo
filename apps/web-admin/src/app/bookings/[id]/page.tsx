'use client';

import { Card } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../components/AdminPenMeta';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminShell title={`Chi tiết đơn vé · ${id}`}>
      <AdminPenMeta id="nvOrdP1Det" name="NovaLimo Admin · Chi tiết đơn vé hành khách" />
      <Card className="border-slate-200">
        <Link href={`/bookings/${id}/edit`}>Sửa đơn</Link>
      </Card>
    </AdminShell>
  );
}
