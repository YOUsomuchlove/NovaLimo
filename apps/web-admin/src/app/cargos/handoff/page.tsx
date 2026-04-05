'use client';

import { Card } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../components/AdminPenMeta';

export default function CargoHandoffPage() {
  return (
    <AdminShell title="Bàn giao trung chuyển">
      <AdminPenMeta id="nvCargoHandoff" name="NovaLimo Admin · Bàn giao Trung chuyển" />
      <Card className="border-slate-200">Luồng bàn giao — bám pen.</Card>
    </AdminShell>
  );
}
