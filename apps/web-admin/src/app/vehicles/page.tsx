import type { Metadata } from 'next';
import { AdminShell } from '../../components/shell/AdminShell';
import { FleetManagementView } from '../../components/vehicles/FleetManagementView';

export const metadata: Metadata = {
  title: 'Quản lý Đội xe & Tài xế',
};

export default function VehiclesPage() {
  return (
    <AdminShell
      title="Quản lý Đội xe & Tài xế"
      subtitle="Theo dõi phương tiện, tài xế và quyền truy cập ứng dụng"
    >
      <FleetManagementView initialTab="vehicles" />
    </AdminShell>
  );
}
