'use client';

import { Card } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui/legacy';
import { AdminPenMeta } from '../../../components/AdminPenMeta';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminShell title={`Khách hàng · ${id}`}>
      <AdminPenMeta
        id="nvCustDet"
        name="NovaLimo Admin · Chi tiết Khách hàng"
      />
      <Card className="border-slate-200">
        <Link href={`/customers/${id}/edit`}>Sửa</Link>
      </Card>
    </AdminShell>
  );
}
