'use client';

import { Card } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../../components/AdminPenMeta';

export default function DriverCreatePage() {
  return (
    <AdminShell title="Tạo tài xế">
      <AdminPenMeta id="vnCreDrv" name="NovaLimo Admin · Tạo tài xế mới" />
      <Card className="border-slate-200">Form tạo tài xế.</Card>
    </AdminShell>
  );
}
