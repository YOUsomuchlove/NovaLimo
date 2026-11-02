'use client';

import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminConsoleHeaderExtras } from '../../components/AdminConsoleHeaderExtras';
import { DashboardConsoleView } from '../../components/dashboard/DashboardConsoleView';

export default function DashboardPage() {
  return (
    <AdminShell
      title="Bảng điều khiển"
      subtitle="Tổng quan doanh thu & vận hành trong ngày"
      consoleChrome
      headerExtra={<AdminConsoleHeaderExtras />}
    >
      <DashboardConsoleView />
    </AdminShell>
  );
}
