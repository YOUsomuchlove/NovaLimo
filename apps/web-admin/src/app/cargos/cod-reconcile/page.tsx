'use client';

import { Card } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../components/AdminPenMeta';

export default function CargoCodReconcilePage() {
  return (
    <AdminShell title="Đối soát COD">
      <AdminPenMeta id="nvCargoCodReconcile" name="NovaLimo Admin · Đối soát COD" />
      <Card className="border-slate-200">Bảng đối soát COD — bám pen.</Card>
    </AdminShell>
  );
}
