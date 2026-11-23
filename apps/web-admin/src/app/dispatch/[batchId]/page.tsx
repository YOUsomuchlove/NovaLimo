'use client';

import { useParams } from 'next/navigation';
import { SmartDispatchBoard } from '../../../components/dispatch/SmartDispatchBoard';
import { AdminShell } from '../../../components/shell/AdminShell';

export default function DispatchBatchPage() {
  const { batchId } = useParams<{ batchId: string }>();

  return (
    <AdminShell
      title="Smart Dispatching"
      subtitle="Trip_Batches · Drag & Drop Trip_Runs · Xuất lệnh đến Mobile App"
      breadcrumbs={[
        { label: 'Điều phối', href: '/dispatch' },
        { label: 'Chi tiết lô chuyến' },
      ]}
    >
      <SmartDispatchBoard initialBatchId={batchId} />
    </AdminShell>
  );
}
