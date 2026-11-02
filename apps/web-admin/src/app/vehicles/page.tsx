'use client';

import { AdminShell } from '@limousine-workspace/shared-ui/legacy';
import { AdminPenMeta } from '../../components/AdminPenMeta';
import { AdminConsoleHeaderExtras } from '../../components/AdminConsoleHeaderExtras';
import { FleetManagementView } from '../../components/vehicles/FleetManagementView';

export default function VehiclesPage() {
  return (
    <AdminShell
      title="Quản lý Đội xe & Tài xế"
      subtitle="Theo dõi phương tiện, tài xế và trạng thái app cung ứng"
      consoleChrome
      headerExtra={<AdminConsoleHeaderExtras />}
    >
      <AdminPenMeta
        id="nvFleet"
        name="NovaLimo Admin · Quản lý Đội xe & Tài xế"
      />
      <FleetManagementView initialTab="vehicles" />
    </AdminShell>
  );
}
