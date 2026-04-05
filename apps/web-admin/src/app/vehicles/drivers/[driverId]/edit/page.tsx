'use client';

import { Card } from 'antd';
import { useParams } from 'next/navigation';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../../../components/AdminPenMeta';

export default function DriverEditPage() {
  const { driverId } = useParams<{ driverId: string }>();
  return (
    <AdminShell title={`Sửa tài xế · ${driverId}`}>
      <AdminPenMeta id="kvt1Y" name="NovaLimo Admin · Sửa tài xế" />
      <Card className="border-slate-200">Form sửa tài xế.</Card>
    </AdminShell>
  );
}
