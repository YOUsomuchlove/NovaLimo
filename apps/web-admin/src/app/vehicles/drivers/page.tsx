import type { Metadata } from 'next';
import { AdminShell } from '../../../components/shell/AdminShell';
import { FleetManagementView } from '../../../components/vehicles/FleetManagementView';

export const metadata: Metadata = {
  title: 'Danh sách Tài xế',
};

export default function DriversPage() {
  return (
    <AdminShell
      title="Quản lý Đội xe & Tài xế"
      subtitle="Hồ sơ tài xế, ca làm việc và trạng thái tài khoản ứng dụng Mobile"
    >
      <FleetManagementView initialTab="drivers" />
    </AdminShell>
  );
}
