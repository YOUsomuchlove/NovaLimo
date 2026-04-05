'use client';

import { Card } from 'antd';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../../components/AdminPenMeta';

export default function FinanceEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminShell title={`Sửa tài chính · ${id}`}>
      <AdminPenMeta id="nvFnEd" name="NovaLimo Admin · Sửa tài chính" />
      <Card className="border-slate-200">Form sửa giao dịch / đối soát.</Card>
    </AdminShell>
  );
}
