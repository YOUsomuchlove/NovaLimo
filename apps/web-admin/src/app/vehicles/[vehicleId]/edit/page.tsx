'use client';

import { Card } from 'antd';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../../components/AdminPenMeta';

export default function VehicleEditPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  return (
    <AdminShell title={`Sửa xe · ${vehicleId}`}>
      <AdminPenMeta id="smD7h" name="NovaLimo Admin · Sửa xe" />
      <Card className="border-slate-200">Form sửa xe.</Card>
    </AdminShell>
  );
}
