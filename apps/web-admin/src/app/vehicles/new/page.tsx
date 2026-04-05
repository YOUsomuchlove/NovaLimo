'use client';

import { Card } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../components/AdminPenMeta';

export default function VehicleCreatePage() {
  return (
    <AdminShell title="Tạo xe mới">
      <AdminPenMeta id="vnCreVeh" name="NovaLimo Admin · Tạo xe mới" />
      <Card className="border-slate-200">Form tạo xe.</Card>
    </AdminShell>
  );
}
