import type { Metadata } from 'next';
import { SmartDispatchBoard } from '../../components/dispatch/SmartDispatchBoard';
import { AdminShell } from '../../components/shell/AdminShell';

export const metadata: Metadata = {
  title: 'Điều phối Thông minh (Smart Dispatching)',
};

export default function DispatchPage() {
  return (
    <AdminShell
      title="Smart Dispatching"
      subtitle="Trip_Batches · Drag & Drop Trip_Runs · Xuất lệnh đến Mobile App"
      breadcrumbs={[{ label: 'Điều phối' }, { label: 'Smart Dispatching' }]}
    >
      <SmartDispatchBoard />
    </AdminShell>
  );
}
