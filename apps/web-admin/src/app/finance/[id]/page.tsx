'use client';

import { Card } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../components/AdminPenMeta';

export default function FinanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminShell title={`Chi tiết tài chính · ${id}`}>
      <AdminPenMeta id="nvFnDet" name="NovaLimo Admin · Chi tiết tài chính" />
      <Card className="border-slate-200">
        <Link href={`/finance/${id}/edit`}>Sửa</Link>
      </Card>
    </AdminShell>
  );
}
