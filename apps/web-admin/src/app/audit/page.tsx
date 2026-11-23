import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminShell } from '../../components/shell/AdminShell';
import { RbacConsoleView } from '../rbac/page';

export const metadata: Metadata = {
  title: 'Audit Log',
};

export default function AuditPage() {
  return (
    <AdminShell
      title="Audit Log"
      subtitle="Nhật ký hoạt động quản trị · Lọc theo tài nguyên · Xuất báo cáo kiểm toán"
    >
      <Suspense fallback={null}>
        <RbacConsoleView defaultTab="audit" />
      </Suspense>
    </AdminShell>
  );
}
