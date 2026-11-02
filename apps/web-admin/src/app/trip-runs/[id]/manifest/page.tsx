'use client';

import { Card } from 'antd';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui/legacy';
import { AdminPenMeta } from '../../../../components/AdminPenMeta';

export default function TripRunManifestPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminShell title={`Phơi lệnh · ${id}`}>
      <AdminPenMeta
        id="nvTripRunManifest"
        name="NovaLimo Admin · Phơi lệnh (Manifest)"
      />
      <Card className="border-slate-200">
        Manifest đón/trả — ORDER BY pickup_order.
      </Card>
    </AdminShell>
  );
}
