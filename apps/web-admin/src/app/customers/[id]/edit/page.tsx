'use client';

import { Card } from 'antd';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui/legacy';
import { AdminPenMeta } from '../../../../components/AdminPenMeta';

export default function CustomerEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminShell title={`Sửa khách hàng · ${id}`}>
      <AdminPenMeta id="nvCustEd" name="NovaLimo Admin · Sửa Khách hàng" />
      <Card className="border-slate-200">Form sửa KH.</Card>
    </AdminShell>
  );
}
