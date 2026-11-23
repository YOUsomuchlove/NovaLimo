import type { Metadata } from 'next';
import { DashboardConsoleView } from '../../components/dashboard/DashboardConsoleView';
import { AdminShell } from '../../components/shell/AdminShell';

export const metadata: Metadata = {
  title: 'Bảng điều khiển',
};

export default function DashboardPage() {
  return (
    <AdminShell
      title="Bảng điều khiển"
      subtitle="Tổng quan doanh thu & vận hành trong ngày"
    >
      <DashboardConsoleView />
    </AdminShell>
  );
}
