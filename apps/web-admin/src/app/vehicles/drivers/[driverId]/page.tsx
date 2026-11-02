'use client';

import { Card } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui/legacy';
import { AdminPenMeta } from '../../../../components/AdminPenMeta';

export default function DriverDetailPage() {
  const { driverId } = useParams<{ driverId: string }>();
  return (
    <AdminShell title={`Chi tiết tài xế · ${driverId}`}>
      <AdminPenMeta id="GU9mg" name="NovaLimo Admin · Chi tiết tài xế" />
      <Card className="border-slate-200">
        <Link href={`/vehicles/drivers/${driverId}/edit`}>Sửa tài xế</Link>
      </Card>
    </AdminShell>
  );
}
