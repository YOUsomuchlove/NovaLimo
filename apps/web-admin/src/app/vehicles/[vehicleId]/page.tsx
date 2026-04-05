'use client';

import { Card } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../components/AdminPenMeta';

export default function VehicleDetailPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  return (
    <AdminShell title={`Chi tiết xe · ${vehicleId}`}>
      <AdminPenMeta id="BYSRc" name="NovaLimo Admin · Chi tiết xe" />
      <Card className="border-slate-200">
        <Link href={`/vehicles/${vehicleId}/edit`}>Sửa xe</Link>
      </Card>
    </AdminShell>
  );
}
