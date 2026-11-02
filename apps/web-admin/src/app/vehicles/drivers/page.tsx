'use client';

import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../../components/AdminPenMeta';
import { AdminConsoleHeaderExtras } from '../../../components/AdminConsoleHeaderExtras';
import { FleetManagementView } from '../../../components/vehicles/FleetManagementView';

/** Tránh conflict với `vehicles/[vehicleId]` — route tĩnh ưu tiên. */
export default function DriversListPage() {
  return (
    <AdminShell
      title="Quản lý Đội xe & Tài xế"
      subtitle="Theo dõi phương tiện, tài xế và trạng thái app cung ứng"
      consoleChrome
      headerExtra={<AdminConsoleHeaderExtras />}
    >
      <AdminPenMeta id="Xox9m" name="panelDrivers — danh sách tài xế (cùng nhóm nvFleet)" />
      <FleetManagementView initialTab="drivers" />
    </AdminShell>
  );
}
