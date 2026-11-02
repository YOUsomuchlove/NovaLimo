'use client';

import { Card } from 'antd';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui/legacy';
import { AdminPenMeta } from '../../../../components/AdminPenMeta';

export default function TripRunEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminShell title={`Sửa chuyến · ${id}`}>
      <AdminPenMeta
        id="nvTripRunEdit"
        name="NovaLimo Admin · Chỉnh sửa Chuyến"
      />
      <Card className="border-slate-200">Form chỉnh sửa chuyến — bám pen.</Card>
    </AdminShell>
  );
}
