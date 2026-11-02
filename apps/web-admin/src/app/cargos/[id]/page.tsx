'use client';

import { Card } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui/legacy';
import { AdminPenMeta } from '../../../components/AdminPenMeta';

export default function CargoDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminShell title={`Chi tiết vận đơn · ${id}`}>
      <AdminPenMeta
        id="nvOrdP2Det"
        name="NovaLimo Admin · Chi tiết vận đơn ký gửi"
      />
      <Card className="border-slate-200">
        <Link href={`/cargos/${id}/edit`}>Sửa vận đơn</Link>
      </Card>
    </AdminShell>
  );
}
