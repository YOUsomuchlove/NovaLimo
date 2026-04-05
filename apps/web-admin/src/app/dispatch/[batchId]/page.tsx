'use client';

import { Card, Typography } from 'antd';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { useParams } from 'next/navigation';
import { AdminPenMeta } from '../../../components/AdminPenMeta';

export default function DispatchBatchPage() {
  const { batchId } = useParams<{ batchId: string }>();
  return (
    <AdminShell title={`Điều phối · ${batchId}`}>
      <AdminPenMeta id="nvSmartDispPage" name="Chi tiết batch / điều phối (cùng nhóm frame)" />
      <Card className="border-slate-200">
        <Typography.Text>Batch ID: {batchId}</Typography.Text>
      </Card>
    </AdminShell>
  );
}
