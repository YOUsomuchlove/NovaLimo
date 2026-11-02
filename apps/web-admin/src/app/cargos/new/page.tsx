'use client';

import { Card } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui/legacy';
import { AdminPenMeta } from '../../../components/AdminPenMeta';

export default function CargoCreatePage() {
  return (
    <AdminShell title="Tạo đơn ký gửi">
      <AdminPenMeta
        id="nvOrdP2Cre"
        name="NovaLimo Admin · Tạo đơn ký gửi hàng hóa"
      />
      <Card className="border-slate-200">Form tạo ký gửi.</Card>
    </AdminShell>
  );
}
