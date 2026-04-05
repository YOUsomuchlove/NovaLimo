'use client';

import { Card } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../components/AdminPenMeta';

export default function BookingCreatePage() {
  return (
    <AdminShell title="Tạo đơn vé">
      <AdminPenMeta id="nvOrdP1Cre" name="NovaLimo Admin · Tạo đơn vé hành khách" />
      <Card className="border-slate-200">Form tạo vé — bám pen.</Card>
    </AdminShell>
  );
}
