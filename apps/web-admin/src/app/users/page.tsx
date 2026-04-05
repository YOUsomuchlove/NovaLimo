'use client';

import { Card, Typography } from 'antd';
import Link from 'next/link';
import { AdminShell } from '@limousine-workspace/shared-ui';
import { AdminPenMeta } from '../../components/AdminPenMeta';

export default function UsersPage() {
  return (
    <AdminShell title="Người dùng nội bộ">
      <AdminPenMeta id="nvRbacUsers" name="Gần RBAC Users — chi tiết trong /rbac" />
      <Card className="border-slate-200">
        <Typography.Paragraph>
          Quản lý user nội bộ —{' '}
          <Link href="/rbac">Phân quyền (RBAC)</Link>.
        </Typography.Paragraph>
      </Card>
    </AdminShell>
  );
}
